import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc, increment } from 'firebase/firestore';
import PDFParser from 'pdf2json';
import { writeFile } from 'fs/promises';
import path from 'path';
import os from 'os';

const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function processPdfFile(file: File): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // Create a temporary file path
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `temp-${Date.now()}.pdf`);

      // Convert File to Buffer and save to temp file
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await writeFile(tempFilePath, buffer);

      // Initialize PDF parser
      const pdfParser = new PDFParser();

      // Handle successful parsing
      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        try {
          // Clean up temp file
          writeFile(tempFilePath, '').catch(console.error);

          // Extract and decode text from all pages
          const text = pdfData.Pages
            .map(page =>
              page.Texts
                .map(text => decodeURIComponent(text.R[0].T))
                .join(' ')
            )
            .join('\n\n');

          resolve(text);
        } catch (error) {
          reject(error);
        }
      });

      // Handle parsing errors
      pdfParser.on('pdfParser_dataError', (error) => {
        reject(error);
      });

      // Start parsing
      pdfParser.loadPDF(tempFilePath);

    } catch (error) {
      console.error('PDF processing error:', error);
      reject(new Error('Failed to process PDF file'));
    }
  });
}

async function checkUserUsage(userId: string): Promise<{ canUse: boolean, reason?: string }> {
  try {
    // Get user document
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    // Check if user has an active subscription
    if (userData?.subscriptionStatus === 'active') {
      return { canUse: true };
    }

    // Check daily usage
    const today = new Date().toISOString().split('T')[0];
    const usageRef = doc(db, 'usage', `${userId}_${today}`);
    const usageDoc = await getDoc(usageRef);

    if (!usageDoc.exists()) {
      // First use of the day
      await setDoc(usageRef, {
        count: 1,
        userId,
        date: today,
      });
      return { canUse: true };
    }

    const usageData = usageDoc.data();
    if (usageData.count >= 5) {
      return {
        canUse: false,
        reason: 'Daily free limit reached. Please upgrade to continue using the service.'
      };
    }

    // Increment usage count
    await setDoc(usageRef, {
      count: increment(1),
    }, { merge: true });

    return { canUse: true };
  } catch (error) {
    console.error('Error checking user usage:', error);
    return { canUse: false, reason: 'Error checking usage limits' };
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const prompt = formData.get('prompt') as string;
    const files = formData.getAll('files') as File[];
    const subject_id = formData.get('subject_id') as string;
    const user_id = formData.get('user_id') as string;

    // Check usage limits


    // const usageCheck = await checkUserUsage(user_id);
    // if (!usageCheck.canUse) {
    //   return NextResponse.json(
    //     { error: usageCheck.reason },
    //     { status: 402 } // 402 Payment Required
    //   );
    // }



    const messages: any[] = [
      {
        role: "system",
        content: "You are a helpful assistant that creates flashcards. Analyze all provided content and return a JSON array of flashcard objects with 'front' and 'back' properties. Make sure you generate atleast 20 flashcards. These should be short and easy to understand. Make sure to include all the important information. If there is not enough content, generate as many as possible based on the topic. Use analogies and examples to make the flashcards more engaging and easier to understand."
      }
    ];

    if (prompt) {
      messages.push({
        role: "user",
        content: `Create flashcards from this text: ${prompt}`
      });
    }

    if (files.length > 0) {
      for (const file of files) {
        if (file.type.includes('image')) {
          messages.push({
            role: "user",
            content: [
              {
                type: "text",
                text: "Create flashcards from the content shown in this image:"
              },
              {
                type: "image_url",
                image_url: {
                  url: await fileToBase64(file),
                }
              }
            ]
          });
        } else if (file.type === 'application/pdf') {
          try {
            const pdfText = await processPdfFile(file);
            // Split text into chunks if it's too long
            const maxChunkSize = 4000; // Adjust based on your needs
            const textChunks = splitTextIntoChunks(pdfText, maxChunkSize);

            for (const chunk of textChunks) {
              messages.push({
                role: "user",
                content: `Create flashcards from this section of the PDF content: ${chunk}`
              });
            }
          } catch (error) {
            console.error('Error processing PDF:', error);
            throw new Error('Failed to process PDF file');
          }
        }
      }
    }

    messages.push({
      role: "user",
      content: "Based on all the content above, generate a comprehensive set of flashcards. If there is not enough content, generate as many as possible based on the topic. Return them in JSON format."
    });

    const completion: OpenAI.Chat.ChatCompletionCreateParams = {
      model: "gpt-4o",
      messages: messages,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    };

    console.log("Sending request to OpenAI");

    const response = await ai.chat.completions.create(completion);
    const result = response.choices[0].message.content;

    console.log("Received response from OpenAI:", result);

    if (!result) {
      return NextResponse.json(
        { error: 'No content received from OpenAI' },
        { status: 500 }
      );
    }

    const parsedResult = JSON.parse(result);

    console.log("Parsed result:", parsedResult);

    // Store flashcards in Firebase
    const docRef = await addDoc(collection(db, 'flashcard_sets'), {
      title: prompt || 'Untitled Set',
      description: 'Generated from prompt and/or files',
      flashcards: parsedResult.flashcards,
      user_id: user_id,
      subject_id: subject_id || null,
      created_at: serverTimestamp(),
    });

    console.log("Flashcard set stored in Firebase with ID:", docRef.id);

    const responseData = {
      id: docRef.id,
      title: prompt || 'Untitled Set',
      description: 'Generated from prompt and/or files',
      flashcards: parsedResult.flashcards,
      user_id: user_id,
      subject_id: subject_id || null,
      created_at: new Date().toISOString(),
    };

    console.log("Response data:", responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate flashcards' },
      { status: 500 }
    );
  }
}

function splitTextIntoChunks(text: string, maxChunkSize: number): string[] {
  const chunks: string[] = [];
  let currentChunk = '';

  const sentences = text.split(/[.!?]+\s/);

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}