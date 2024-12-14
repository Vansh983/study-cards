import { create } from 'zustand';
import { CardType } from './types';

interface AppState {
    cardType: CardType;
    setCardType: (cardType: CardType) => void;
    isMuted: boolean;
    toggleMute: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    cardType: 'default',
    setCardType: (cardType) => set({ cardType }),
    isMuted: false,
    toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
})); 