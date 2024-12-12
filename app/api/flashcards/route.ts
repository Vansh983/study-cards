import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const prompt = formData.get('prompt') as string;
    const files = formData.getAll('files') as File[];
    const subject_id = formData.get('subject_id') as string;
    const user_id = formData.get('user_id') as string;

    console.log("Received request with:", { prompt, filesCount: files.length, user_id });


    const messages: any[] = [
      {
        role: "system",
        content: "You are a helpful assistant that creates flashcards. Analyze all provided content and return a JSON array of flashcard objects with 'front' and 'back' properties."
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
          messages.push({
            role: "user",
            content: "PDF content will be processed here"
          });
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
      max_tokens: 4096,
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

async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}