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
    preloadVideo: (path: string) => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

// Provider component
export function VideoProvider({ children }: { children: React.ReactNode }) {
    const [videos, setVideos] = useState<VideoInstance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadedVideos, setLoadedVideos] = useState<Set<string>>(new Set());

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
                    video.preload = 'metadata'; // Only load metadata initially

                    return { path, element: video };
                });

                // Wait for metadata to load for all videos
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

                // Start preloading the first video
                if (videoElements.length > 0) {
                    const firstVideo = videoElements[0];
                    firstVideo.element.preload = 'auto';
                    firstVideo.element.load();
                    setLoadedVideos(prev => new Set([...Array.from(prev), firstVideo.path]));
                }
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

    // Function to preload a specific video
    const preloadVideo = (path: string) => {
        if (loadedVideos.has(path)) return;

        const video = videos.find(v => v.path === path);
        if (video) {
            video.element.preload = 'auto';
            video.element.load();
            setLoadedVideos(prev => new Set([...Array.from(prev), path]));
        }
    };

    return (
        <VideoContext.Provider value={{ videos, isLoading, error, preloadVideo }}>
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