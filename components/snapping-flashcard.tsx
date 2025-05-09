"use client";

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Flashcard as FlashcardType } from '@/lib/types';
import { BackgroundVideo } from './background-video';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useVideos } from '@/lib/video-context';

interface SnappingFlashcardProps {
  flashcard: FlashcardType;
  index: number;
  videoPath?: string;
}

const isSpeechSupported = () => {
  return typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window;
};

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
  const isMuted = useAppStore((state) => state.isMuted);
  const isPaused = useAppStore((state) => state.isPaused);
  const togglePause = useAppStore((state) => state.togglePause);
  const [isSpeechAvailable, setIsSpeechAvailable] = useState(false);
  const { isLoading: isVideosLoading, preloadVideo } = useVideos();

  // Preload the next video when this card is mounted
  useEffect(() => {
    if (videoPath) {
      preloadVideo(videoPath);
    }
  }, [videoPath, preloadVideo]);

  useEffect(() => {
    setMounted(true);

    // Check speech synthesis support
    const speechSupported = isSpeechSupported();
    setIsSpeechAvailable(speechSupported);

    // Only setup speech synthesis if it's supported
    if (speechSupported) {
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
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Setup intersection observer for auto-play
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isPaused && !isMuted && isSpeechAvailable) {
            speak(flashcard.front, 'front');
          }
        });
      },
      {
        threshold: 0.7,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
      if (isSpeechAvailable) {
        window.speechSynthesis.cancel();
      }
    };
  }, [flashcard, isPaused, isMuted]);

  useEffect(() => {
    if (isMuted) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpokenText("");
      setCurrentSide(null);
    }
  }, [isMuted]);

  const handleCardTap = () => {
    togglePause();
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
    if (!isSpeechAvailable || isPaused || isMuted) return;

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
      if (side === 'front' && !isPaused) {
        setTimeout(() => speak(flashcard.back, 'back'), 500);
      }
    };

    // Track spoken words
    utterance.onboundary = (event) => {
      const textUpToIndex = text.substring(0, event.charIndex + event.charLength);
      setSpokenText(textUpToIndex);
    };

    window.speechSynthesis.speak(utterance);
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
      {mounted && !isVideosLoading && <BackgroundVideo isVisible={true} videoPath={videoPath} />}
      <div
        className={cn(
          "absolute inset-0 backdrop-blur-[2px] transition-all duration-300",
          isPaused ? "bg-black" : "bg-black/50"
        )}
      />
      {isSpeechAvailable && (
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
          <Eye className="h-5 w-5" />
        </Button>
      )}
      <div className="relative w-full h-full p-6 flex flex-col">
        <div className="flex flex-col gap-6 h-full text-white">
          <div className="text-lg font-medium border-b border-white/20 pb-4 flex-1 overflow-auto">
            <div className="flex justify-between items-center h-full">
              <div ref={frontTextRef} className="items-center justify-center text-center">
                {getHighlightedText(flashcard.front, currentSide === 'front')}
              </div>
            </div>
          </div>
          <div className="text-lg flex-1 overflow-auto">
            <div className="flex justify-between items-center h-full">
              <div ref={backTextRef} className="items-center justify-center text-center">
                {getHighlightedText(flashcard.back, currentSide === 'back')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 