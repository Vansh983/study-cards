import { z } from 'zod';

export const flashcardSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('video'),
        front: z.object({
            videoUrl: z.string().url(),
            caption: z.string().optional(),
        }),
        back: z.object({
            explanation: z.string(),
            additionalNotes: z.string().optional(),
        }),
        duration: z.number().min(1).max(60).optional(), // TikTok-style videos typically 15-60 seconds
    }),
]); 