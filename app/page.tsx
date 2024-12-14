"use client";

import { useState, useEffect } from 'react';
import { Loader2, BrainCircuit, Upload, ViewIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Flashcard } from '@/components/flashcard';
import { SnappingFlashcard } from '@/components/snapping-flashcard';
import { useToast } from '@/hooks/use-toast';
import type { Flashcard as FlashcardType, FlashcardsResponse } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { ChatMenu } from '@/components/chat-menu';
import { AuthButton } from '@/components/auth-button';
import type { Chat } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isSnappingView, setIsSnappingView] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setChats([]);
      return;
    }

    try {
      const q = query(
        collection(db, 'chats'),
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc')
      );

      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          const chatsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            created_at: doc.data().created_at?.toDate().toISOString() || new Date().toISOString(),
          })) as Chat[];
          setChats(chatsData);
        },
        (error) => {
          console.error("Firestore error:", error);
          toast({
            title: "Error",
            description: "Failed to fetch chats. Please try again.",
            variant: "destructive",
          });
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Firestore setup error:", error);
    }
  }, [user, authLoading, toast]);

  const handleNewChat = () => {
    setCurrentChat(null);
    setFlashcards([]);
    setPrompt('');
    setFiles([]);
  };

  const generateFlashcards = async () => {
    if (!prompt.trim() && files.length === 0) {
      toast({
        title: "Error",
        description: "Please enter a prompt or upload files",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to generate flashcards",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('user_id', user.uid);
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

      const chatRef = await addDoc(collection(db, 'chats'), {
        title: prompt || 'Untitled Chat',
        user_id: user.uid,
        created_at: serverTimestamp(),
        flashcards: data.flashcards,
        prompt: prompt,
        files: files.map(f => f.name),
      });

      const newChat: Chat = {
        id: chatRef.id,
        title: prompt || 'Untitled Chat',
        user_id: user.uid,
        created_at: new Date().toISOString(),
        flashcards: data.flashcards,
      };

      setCurrentChat(newChat);

      setPrompt('');
      setFiles([]);

      toast({
        title: "Success",
        description: "Flashcards generated and saved successfully!",
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
    e.preventDefault();
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    direction === 'left' ? setFlashcards(prev => prev.slice(0, -1)) : setFlashcards(prev => prev.slice(1))
  };

  const loadChat = (chat: Chat) => {
    setCurrentChat(chat);
    setFlashcards(chat.flashcards);
    setPrompt('');
    setFiles([]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-3xl relative">
        {authLoading ? (
          <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <ChatMenu
              chats={chats}
              onChatSelect={loadChat}
              currentUser={user?.uid}
              onChatsChange={setChats}
              onNewChat={handleNewChat}
            />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSnappingView(!isSnappingView)}
                className="relative"
              >
                <ViewIcon className="h-5 w-5" />
              </Button>
              <AuthButton />
            </div>


            {flashcards.length === 0 && (
              <>
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
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('file-upload')?.click();
                          }}
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
              </>
            )}

            {isSnappingView ? (
              <div className="relative w-full h-[80vh] overflow-y-auto snap-y snap-mandatory flex flex-col items-center mt-10">
                <div className="w-full flex flex-col items-center gap-0">
                  {flashcards.map((flashcard, index) => (
                    <SnappingFlashcard
                      key={index}
                      flashcard={flashcard}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="relative h-[500px] w-full mt-10">
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
            )}
          </>
        )}
      </div>
      <p className="text-center text-muted-foreground text-sm mt-4"><a href="https://www.linkedin.com/in/vanshsood" target="_blank" rel="noopener noreferrer">Made for fun by Vansh Sood</a></p>
    </main>
  );
}
