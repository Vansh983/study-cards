"use client";

import { useState } from 'react';
import { Loader2, BrainCircuit, Upload } from 'lucide-react';
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
  const [files, setFiles] = useState<File[]>([]);

  const generateFlashcards = async () => {
    if (!prompt.trim() && files.length === 0) {
      toast({
        title: "Error",
        description: "Please enter a prompt or upload files",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/flashcards', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to generate flashcards');
      }

      setFlashcards(data.flashcards);
      toast({
        title: "Success",
        description: "Flashcards generated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate flashcards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Enter a topic or concept..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="whitespace-nowrap"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleFileChange}
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
            </div>
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-secondary p-2 rounded-md"
                  >
                    <span className="text-sm">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-auto p-1"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <div className="relative h-[500px] w-full">
          {flashcards && flashcards.map((flashcard, index) => (
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