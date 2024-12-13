export type VideoFlashcard = {
    type: 'video';
    front: {
        videoUrl: string;
        caption?: string;
    };
    back: {
        explanation: string;
        additionalNotes?: string;
    };
    duration?: number; // in seconds, to match TikTok-style short format
};

// Update the Flashcard type union
export type Flashcard = BasicFlashcard | ImageFlashcard | VideoFlashcard; 