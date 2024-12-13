"use client";

import { useEffect, useRef, useState } from 'react';

// Add array of video paths
const VIDEO_PATHS = [
  '/background.mp4',
  '/background2.mp4',
  '/background3.mp4',
];

interface BackgroundVideoProps {
  isVisible: boolean;
  videoPath?: string; // Make videoPath optional
}

export function BackgroundVideo({ isVisible, videoPath }: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Select random video path if none provided
  const selectedVideoPath = videoPath || VIDEO_PATHS[Math.floor(Math.random() * VIDEO_PATHS.length)];

  useEffect(() => {
    if (!videoRef.current || !isLoaded || hasError) return;

    const video = videoRef.current;
    
    // Set random start time and play immediately
    try {
      const duration = video.duration || 0;
      if (duration > 0) {
        const randomStartTime = Math.random() * duration;
        video.currentTime = randomStartTime;
      }

      const attemptPlay = async () => {
        try {
          await video.play();
        console.log('Video play');

        } catch (err) {
          if (err instanceof Error && err.name !== 'AbortError') {
            console.error('Video play failed:', err);
            setHasError(true);
          }
        console.log('Video paused');

        }
      };

      attemptPlay();
    } catch (err) {
        console.log('Video paused');
      console.error('Video control error:', err);
      setHasError(true);
    }

    // Cleanup function
    return () => {
      try {
        video.pause();
        console.log('Video paused');
        
      } catch (err) {
        // Ignore cleanup errors
      }
    };
  }, [isLoaded, hasError]);

  const handleLoadedMetadata = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    console.error('Video loading error');
  };

  if (hasError) {
    return null; // Don't render anything if there's an error
  }

  return (
    <video
      ref={videoRef}
      className={`absolute inset-0 w-full h-full object-cover`}
      loop
      muted
      playsInline
      preload="auto"
      onLoadedMetadata={handleLoadedMetadata}
      onError={handleError}
    >
      <source src={selectedVideoPath} type="video/mp4" />
    </video>
  );
} 