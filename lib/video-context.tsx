"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

// Video paths
const VIDEO_PATHS = [
    '/background.mp4',
    '/background2.mp4',
    '/background3.mp4',
];

// Create a type for our video instances
type VideoInstance = {
    path: string;
    element: HTMLVideoElement;
};

// Create the context
interface VideoContextType {
    videos: VideoInstance[];
    isLoading: boolean;
    error: string | null;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

// Provider component
export function VideoProvider({ children }: { children: React.ReactNode }) {
    const [videos, setVideos] = useState<VideoInstance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Function to preload videos
        const preloadVideos = async () => {
            try {
                setIsLoading(true);

                // Create video elements for each path
                const videoElements = VIDEO_PATHS.map(path => {
                    const video = document.createElement('video');
                    video.src = path;
                    video.muted = true;
                    video.loop = true;
                    video.playsInline = true;
                    video.preload = 'auto';

                    return { path, element: video };
                });

                // Wait for all videos to load
                await Promise.all(
                    videoElements.map(
                        ({ element }) =>
                            new Promise<void>((resolve, reject) => {
                                element.onloadedmetadata = () => resolve();
                                element.onerror = () => reject(new Error(`Failed to load video: ${element.src}`));
                            })
                    )
                );

                setVideos(videoElements);
                setIsLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load videos');
                setIsLoading(false);
            }
        };

        preloadVideos();

        // Cleanup function
        return () => {
            videos.forEach(({ element }) => {
                element.pause();
                element.src = '';
            });
        };
    }, []);

    return (
        <VideoContext.Provider value={{ videos, isLoading, error }}>
            {children}
        </VideoContext.Provider>
    );
}

// Custom hook to use the video context
export function useVideos() {
    const context = useContext(VideoContext);
    if (context === undefined) {
        throw new Error('useVideos must be used within a VideoProvider');
    }
    return context;
}

// Helper function to get a random video
export function getRandomVideo(videos: VideoInstance[]): VideoInstance | null {
    if (videos.length === 0) return null;
    return videos[Math.floor(Math.random() * videos.length)];
} 