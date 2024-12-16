import { create } from 'zustand';
import { CardType } from './types';

interface AppState {
    cardType: CardType;
    setCardType: (cardType: CardType) => void;
    isMuted: boolean;
    toggleMute: () => void;
    isPaused: boolean;
    togglePause: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    cardType: 'default',
    setCardType: (cardType) => set({ cardType }),
    isMuted: false,
    toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
    isPaused: false,
    togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
})); 