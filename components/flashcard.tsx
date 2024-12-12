"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Flashcard as FlashcardType } from '@/lib/types';

interface FlashcardProps {
  flashcard: FlashcardType;
  onSwipe: (direction: 'left' | 'right') => void;
  index: number;
  isTop: boolean;
}

export function Flashcard({ flashcard, onSwipe, index, isTop }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  return (
    <motion.div
      className={`absolute w-full perspective-1000 h-[500px] cursor-pointer`}
      style={{
        zIndex: isTop ? 10 : 10 - index,
        top: !isTop ? `${index * 4}px` : 0,
        left: !isTop ? `${index * 2}px` : 0,
        filter: !isTop ? `brightness(${1 - index * 0.15})` : 'brightness(1)',
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={(e, info) => {
        setDragStart({ x: info.point.x, y: info.point.y });
      }}
      onDragEnd={(e, info) => {
        const deltaX = info.point.x - dragStart.x;
        if (Math.abs(deltaX) > 100) {
          onSwipe(deltaX > 0 ? 'right' : 'left');
        }
      }}
      animate={{
        scale: isTop ? 1 : 0.95 - index * 0.05,
      }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => isTop && setIsFlipped(!isFlipped)}
      >
        <Card className="absolute w-full h-full p-6 backface-hidden shadow-xl">
          <div className="flex items-center justify-center h-full text-lg font-medium">
            {flashcard.front}
          </div>
        </Card>
        <Card className="absolute w-full h-full p-6 backface-hidden rotate-y-180 shadow-xl">
          <div className="flex items-center justify-center h-full text-lg">
            {flashcard.back}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}