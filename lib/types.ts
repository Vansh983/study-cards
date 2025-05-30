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

export type CardType = 'default' | 'video';

export interface AppState {
  isLoginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

