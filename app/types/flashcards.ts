export type BasicFlashcard = {
    type: 'basic';
    front: string;
    back: string;
};

export type ImageFlashcard = {
    type: 'image';
    front: string;
    imageUrl: string;
    back: string;
};

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
    duration?: number;
};

export type Flashcard = BasicFlashcard | ImageFlashcard | VideoFlashcard; 