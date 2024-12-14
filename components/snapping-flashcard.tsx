"use client";

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Flashcard as FlashcardType } from '@/lib/types';
import { BackgroundVideo } from './background-video';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

interface SnappingFlashcardProps {
  flashcard: FlashcardType;
  index: number;
  videoPath?: string;
}

export function SnappingFlashcard({ flashcard, index, videoPath }: SnappingFlashcardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const frontTextRef = useRef<HTMLDivElement>(null);
  const backTextRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [spokenText, setSpokenText] = useState("");
  const [currentSide, setCurrentSide] = useState<'front' | 'back' | null>(null);
  const preferredVoices = useRef<SpeechSynthesisVoice[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const isMuted = useAppStore((state) => state.isMuted);

  useEffect(() => {
    setMounted(true);

    // Get initial list of voices and select preferred ones
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Filter for English voices first
      const englishVoices = availableVoices.filter(
        voice => voice.lang.startsWith('en-')
      );

      // Try to get common system voices (Microsoft David, Samantha, Google US)
      const commonVoices = englishVoices.filter(voice =>
        voice.name.includes('David') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Google') ||
        voice.name.includes('Daniel') ||
        voice.name.includes('Karen')
      );

      // If we have common voices, use them, otherwise use first 3 English voices
      preferredVoices.current = commonVoices.length >= 3
        ? commonVoices.slice(0, 3)
        : englishVoices.slice(0, 3);

      // If no English voices, fall back to first 3 available voices
      if (preferredVoices.current.length === 0) {
        preferredVoices.current = availableVoices.slice(0, 3);
      }
    };

    loadVoices();
    // Chrome loads voices asynchronously
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Setup intersection observer for auto-play
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isPaused) {
            speak(flashcard.front, 'front');
          }
        });
      },
      {
        threshold: 0.7, // Card needs to be 70% visible
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
      window.speechSynthesis.cancel();
    };
  }, [flashcard, isPaused]);

  const handleCardTap = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      // Pause the audio
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpokenText("");
      setCurrentSide(null);
    } else {
      // Resume from the current side or start from front
      if (currentSide) {
        speak(currentSide === 'front' ? flashcard.front : flashcard.back, currentSide);
      } else {
        speak(flashcard.front, 'front');
      }
    }
  };

  const speak = (text: string, side: 'front' | 'back') => {
    if ('speechSynthesis' in window && !isPaused && !isMuted) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      setSpokenText("");
      setCurrentSide(side);

      const utterance = new SpeechSynthesisUtterance(text);

      // Get random voice from preferred voices
      if (preferredVoices.current.length > 0) {
        const randomVoice = preferredVoices.current[
          Math.floor(Math.random() * preferredVoices.current.length)
        ];
        utterance.voice = randomVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        setSpokenText("");
        setCurrentSide(null);
        // Auto-play back side after front is done
        if (side === 'front' && !isPaused && !isMuted) {
          setTimeout(() => speak(flashcard.back, 'back'), 500);
        }
      };

      // Track spoken words
      utterance.onboundary = (event) => {
        const textUpToIndex = text.substring(0, event.charIndex + event.charLength);
        setSpokenText(textUpToIndex);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const getHighlightedText = (text: string, isCurrentSide: boolean) => {
    if (!isCurrentSide || !spokenText) {
      return <span className="text-white/70">{text}</span>;
    }

    return (
      <>
        <span className="text-white">{spokenText}</span>
        <span className="text-white/70">{text.slice(spokenText.length)}</span>
      </>
    );
  };

  return (
    <motion.div
      ref={cardRef}
      className="w-full h-[80vh] shrink-0 snap-center snap-always relative rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      onClick={handleCardTap}
    >
      {mounted && <BackgroundVideo isVisible={true} videoPath={videoPath} />}
      <div
        className={cn(
          "absolute inset-0 backdrop-blur-[2px] transition-all duration-300",
          isPaused ? "bg-black" : "bg-black/50"
        )}
      />
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:text-white/80 ml-4 absolute top-5 right-5"
        onClick={(e) => {
          e.stopPropagation();
          speak(flashcard.front, 'front');
        }}
        disabled={isSpeaking}
      >
        <Volume2 className="h-5 w-5" />
      </Button>
      <div className="relative w-full h-full p-6 flex flex-col">
        <div className="flex flex-col gap-6 h-full text-white">
          <div className="text-lg font-medium border-b border-white/20 pb-4 flex-1 overflow-auto">
            <div className="flex justify-between items-center h-full">
              <div ref={frontTextRef} className="flex-1 flex items-center justify-center text-center">
                {getHighlightedText(flashcard.front, currentSide === 'front')}
              </div>

            </div>
          </div>
          <div className="text-lg flex-1 overflow-auto">
            <div className="flex justify-between items-center h-full">
              <div ref={backTextRef} className="flex-1 flex items-center justify-center text-center">
                {getHighlightedText(flashcard.back, currentSide === 'back')}
              </div>
              {/* <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:text-white/80 ml-4"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(flashcard.back, 'back');
                }}
                disabled={isSpeaking}
              >
                <Volume2 className="h-5 w-5" />
              </Button> */}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 