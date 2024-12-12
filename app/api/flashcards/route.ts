import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const prompt = formData.get('prompt') as string;
    const files = formData.getAll('files') as File[];

    // Prepare messages array with the system message
    const messages: any[] = [
      {
        role: "system",
        content: "You are a helpful assistant that creates flashcards. Analyze all provided content and return a JSON array of flashcard objects with 'front' and 'back' properties."
      }
    ];

    // Add user's text prompt if provided
    if (prompt) {
      messages.push({
        role: "user",
        content: `Create flashcards from this text: ${prompt}`
      });
    }

    // Process and add files to messages
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
          // Add PDF handling here when needed
          messages.push({
            role: "user",
            content: "PDF content will be processed here"
          });
        }
      }
    }

    // Add final instruction to ensure proper JSON formatting
    messages.push({
      role: "user",
      content: "Based on all the content above, generate a comprehensive set of flashcards. Return them in JSON format."
    });

    const completion: OpenAI.Chat.ChatCompletionCreateParams = {
      model: "gpt-4o",
      messages: messages,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    };

    const response = await ai.chat.completions.create(completion);
    const result = response.choices[0].message.content;
    console.log(result);

    if (!result) {
      return NextResponse.json(
        { error: 'No content received from OpenAI' },
        { status: 500 }
      );
    }

    return NextResponse.json(JSON.parse(result));
  } catch (error) {
    console.error('OpenAI API error:', error);
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