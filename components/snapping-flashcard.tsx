"use client";

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Flashcard as FlashcardType } from '@/lib/types';
import { BackgroundVideo } from './background-video';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';

interface SnappingFlashcardProps {
  flashcard: FlashcardType;
  index: number;
  videoPath?: string;
}

export function SnappingFlashcard({ flashcard, index, videoPath }: SnappingFlashcardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className="w-full h-[80vh] shrink-0 snap-center snap-always relative rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      {mounted && <BackgroundVideo isVisible={true} videoPath={videoPath} />}
      <div className={`absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 opacity-100`} />
      <div className="relative w-full h-full p-6 flex flex-col">
        <div className="flex flex-col gap-6 h-full text-white">
          <div className="text-lg font-medium border-b border-white/20 pb-4 flex-1 overflow-auto">
            <div className="flex justify-between items-start">
              <div>{flashcard.front}</div>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:text-white/80"
                onClick={() => speak(flashcard.front)}
                disabled={isSpeaking}
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="text-lg flex-1 overflow-auto">
            <div className="flex justify-between items-start">
              <div>{flashcard.back}</div>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:text-white/80"
                onClick={() => speak(flashcard.back)}
                disabled={isSpeaking}
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 