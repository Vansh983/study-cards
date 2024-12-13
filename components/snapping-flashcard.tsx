"use client";

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Flashcard as FlashcardType } from '@/lib/types';
import { BackgroundVideo } from './background-video';

interface SnappingFlashcardProps {
  flashcard: FlashcardType;
  index: number;
}

export function SnappingFlashcard({ flashcard, index }: SnappingFlashcardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div
      ref={cardRef}
      className="w-full h-[80vh] shrink-0 snap-center relative rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      {mounted && <BackgroundVideo isVisible={true} />}
      <div className={`absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 opacity-100`} />
      <div className="relative w-full h-full p-6 flex flex-col">
        <div className="flex flex-col gap-6 h-full text-white">
          <div className="text-lg font-medium border-b border-white/20 pb-4 flex-1 overflow-auto">
            {flashcard.front}
          </div>
          <div className="text-lg flex-1 overflow-auto">
            {flashcard.back}
          </div>
        </div>
      </div>
    </motion.div>
  );
} 