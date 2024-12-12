"use client";

import { useState } from 'react';
import { Loader2, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Flashcard } from '@/components/flashcard';
import { useToast } from '@/hooks/use-toast';
import type { Flashcard as FlashcardType, FlashcardsResponse } from '@/lib/types';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateFlashcards = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Failed to generate flashcards');

      const data: FlashcardsResponse = await response.json();
      setFlashcards(data.flashcards);
      toast({
        title: "Success",
        description: "Flashcards generated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate flashcards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    setFlashcards(prev => prev.slice(1));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BrainCircuit className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">AI Flashcard Generator</h1>
          <p className="text-muted-foreground">
            Enter a topic or concept to generate interactive flashcards
          </p>
        </div>

        <Card className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Enter a topic or concept..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={generateFlashcards}
              disabled={loading}
              className="whitespace-nowrap"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Flashcards
            </Button>
          </div>
        </Card>

        <div className="relative h-[500px] w-full">
          {flashcards.map((flashcard, index) => (
            <Flashcard
              key={index}
              flashcard={flashcard}
              onSwipe={handleSwipe}
              index={index}
              isTop={index === 0}
            />
          ))}
          {flashcards.length === 0 && !loading && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              No flashcards yet. Generate some to get started!
            </div>
          )}
        </div>
      </div>
    </main>
  );
}