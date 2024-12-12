import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const completion: OpenAI.Chat.ChatCompletionCreateParams = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates flashcards. Return a JSON array of flashcard objects with 'front' and 'back' properties."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      response_format: { type: "json_object" },
    };
    const response = await ai.chat.completions.create(completion);

    const result = response.choices[0].message.content
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