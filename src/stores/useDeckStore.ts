import { create } from 'zustand';
import {
  createDeck,
  deleteDeck,
  getAllDecks,
  getDeckById,
  getDeckStats,
  resetDeckProgress,
  updateDeck,
} from '../services/database';
import { Deck, DeckStats } from '../types';

interface DeckState {
  decks: Deck[];
  deckStats: Record<string, DeckStats>;
  isLoading: boolean;
  error: string | null;

  loadDecks: () => Promise<void>;
  loadDeckStats: (deckId: string) => Promise<void>;
  createDeck: (data: Omit<Deck, 'id' | 'created_at' | 'updated_at'>) => Promise<Deck>;
  updateDeck: (id: string, data: Partial<Omit<Deck, 'id' | 'created_at'>>) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  resetDeckProgress: (deckId: string) => Promise<void>;
  getDeckById: (id: string) => Deck | undefined;
}

export const useDeckStore = create<DeckState>((set, get) => ({
  decks: [],
  deckStats: {},
  isLoading: false,
  error: null,

  loadDecks: async () => {
    set({ isLoading: true, error: null });
    try {
      const decks = await getAllDecks();
      set({ decks, isLoading: false });
    } catch (e) {
      set({ error: 'Failed to load decks', isLoading: false });
    }
  },

  loadDeckStats: async (deckId) => {
    try {
      const stats = await getDeckStats(deckId);
      set((state) => ({
        deckStats: { ...state.deckStats, [deckId]: stats },
      }));
    } catch {
      // Silently fail — stats are supplementary
    }
  },

  createDeck: async (data) => {
    const deck = await createDeck(data);
    set((state) => ({ decks: [deck, ...state.decks] }));
    return deck;
  },

  updateDeck: async (id, data) => {
    await updateDeck(id, data);
    const updated = await getDeckById(id);
    if (updated) {
      set((state) => ({
        decks: state.decks.map((d) => (d.id === id ? updated : d)),
      }));
    }
  },

  deleteDeck: async (id) => {
    await deleteDeck(id);
    set((state) => ({
      decks: state.decks.filter((d) => d.id !== id),
    }));
  },

  resetDeckProgress: async (deckId) => {
    await resetDeckProgress(deckId);
    await get().loadDeckStats(deckId);
  },

  getDeckById: (id) => get().decks.find((d) => d.id === id),
}));
