"use client";

import { useEffect, useRef, useState } from 'react';
import { useVideos, getRandomVideo } from '@/lib/video-context';

interface BackgroundVideoProps {
  isVisible: boolean;
  videoPath?: string; // Make videoPath optional
}

export function BackgroundVideo({ isVisible, videoPath }: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { videos, isLoading } = useVideos();
  const [selectedVideo, setSelectedVideo] = useState<HTMLVideoElement | null>(null);

  // Select a video when component mounts or videos change
  useEffect(() => {
    if (videos.length > 0) {
      // If a specific video path is provided, find that video
      if (videoPath) {
        const video = videos.find(v => v.path === videoPath);
        if (video) {
          setSelectedVideo(video.element);
        } else {
          // Fallback to random if path not found
          const randomVideo = getRandomVideo(videos);
          setSelectedVideo(randomVideo?.element || null);
        }
      } else {
        // Otherwise get a random video
        const randomVideo = getRandomVideo(videos);
        setSelectedVideo(randomVideo?.element || null);
      }
    }
  }, [videos, videoPath]);

  useEffect(() => {
    if (!videoRef.current || !selectedVideo || !isLoaded || hasError || isLoading) return;

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
  }, [isLoaded, hasError, selectedVideo, isLoading]);

  const handleLoadedMetadata = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    console.error('Video loading error');
  };

  if (hasError || isLoading || !selectedVideo) {
    return null; // Don't render anything if there's an error or still loading
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
      src={selectedVideo.src}
    />
  );
} 