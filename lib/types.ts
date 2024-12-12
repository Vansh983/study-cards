export interface Flashcard {
  front: string;
  back: string;
}

export interface FlashcardsResponse {
  flashcards: Flashcard[];
}

export interface Chat {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  flashcards: Flashcard[];
  prompt?: string;
  files?: string[];
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
}