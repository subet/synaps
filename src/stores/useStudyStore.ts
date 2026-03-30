import { create } from 'zustand';
import {
  bulkInsertCards,
  completeStudySession,
  createStudySession,
  createCard,
  deleteCard,
  getDeckById,
  getDueCards,
  getCardsByDeckId,
  recordStudyActivity,
  recordFocusSeconds,
  updateCard,
} from '../services/database';
import { calculateSM2 } from '../services/srs';
import { Card, SRSGrade, StudySessionResult } from '../types';

interface StudyState {
  // Current study session
  sessionId: string | null;
  queue: Card[];
  currentIndex: number;
  isFlipped: boolean;
  sessionStartTime: number | null;
  cardShownAt: number | null;
  accumulatedCardSeconds: number;
  gradeDistribution: { again: number; hard: number; good: number; easy: number };
  isSessionComplete: boolean;
  sessionResult: StudySessionResult | null;

  // Card list for deck view
  deckCards: Card[];
  isLoadingCards: boolean;

  startSession: (deckId: string) => Promise<void>;
  flipCard: () => void;
  gradeCard: (grade: SRSGrade) => Promise<void>;
  endSession: () => Promise<void>;
  resetSession: () => void;
  pauseCardTimer: () => void;
  resumeCardTimer: () => void;

  loadDeckCards: (deckId: string) => Promise<void>;
  createCard: (data: Omit<Card, 'id' | 'created_at' | 'updated_at'>) => Promise<Card>;
  updateCard: (id: string, data: Partial<Omit<Card, 'id' | 'created_at'>>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
}

export const useStudyStore = create<StudyState>((set, get) => ({
  sessionId: null,
  queue: [],
  currentIndex: 0,
  isFlipped: false,
  sessionStartTime: null,
  cardShownAt: null,
  accumulatedCardSeconds: 0,
  gradeDistribution: { again: 0, hard: 0, good: 0, easy: 0 },
  isSessionComplete: false,
  sessionResult: null,
  deckCards: [],
  isLoadingCards: false,

  startSession: async (deckId) => {
    const [session, dueCards, deck] = await Promise.all([
      createStudySession(deckId),
      getDueCards(deckId),
      getDeckById(deckId),
    ]);

    const queue = deck?.shuffle_cards
      ? [...dueCards].sort(() => Math.random() - 0.5)
      : dueCards;

    set({
      sessionId: session.id,
      queue,
      currentIndex: 0,
      isFlipped: false,
      sessionStartTime: Date.now(),
      cardShownAt: Date.now(),
      accumulatedCardSeconds: 0,
      gradeDistribution: { again: 0, hard: 0, good: 0, easy: 0 },
      isSessionComplete: dueCards.length === 0,
      sessionResult: null,
    });
  },

  flipCard: () => {
    set((state) => ({ isFlipped: !state.isFlipped }));
  },

  gradeCard: async (grade) => {
    const { queue, currentIndex, gradeDistribution, cardShownAt, accumulatedCardSeconds } = get();
    const card = queue[currentIndex];
    if (!card) return;

    // Calculate new SRS values
    const result = calculateSM2(
      grade,
      card.ease_factor,
      card.interval,
      card.repetitions,
      card.status
    );

    // Update card in database
    await updateCard(card.id, {
      ease_factor: result.easeFactor,
      interval: result.interval,
      repetitions: result.repetitions,
      status: result.status,
      due_date: result.dueDate.toISOString(),
      last_reviewed: new Date().toISOString(),
    });

    // Count every grade press and record time spent on this card (excluding background time)
    const activeSeconds = cardShownAt ? (Date.now() - cardShownAt) / 1000 : 0;
    const elapsedSeconds = Math.round(accumulatedCardSeconds + activeSeconds);
    await Promise.all([
      recordStudyActivity(1),
      recordFocusSeconds(elapsedSeconds),
    ]);

    // Track grade distribution
    const gradeKey = (['again', 'hard', 'good', 'easy'] as const)[grade];
    const newDist = { ...gradeDistribution, [gradeKey]: gradeDistribution[gradeKey] + 1 };

    const nextIndex = currentIndex + 1;
    const isLast = nextIndex >= queue.length;

    if (isLast) {
      await get().endSession();
      set({ gradeDistribution: newDist });
    } else {
      set({ currentIndex: nextIndex, isFlipped: false, gradeDistribution: newDist, cardShownAt: Date.now(), accumulatedCardSeconds: 0 });
    }
  },

  endSession: async () => {
    const { sessionId, queue, gradeDistribution, sessionStartTime } = get();
    if (!sessionId) return;

    const durationSeconds = sessionStartTime
      ? Math.round((Date.now() - sessionStartTime) / 1000)
      : 0;

    const cardsStudied = queue.length;
    const cardsCorrect = gradeDistribution.good + gradeDistribution.easy;

    await completeStudySession(sessionId, {
      cards_studied: cardsStudied,
      cards_correct: cardsCorrect,
      duration_seconds: durationSeconds,
    });

    set({
      isSessionComplete: true,
      sessionResult: {
        cardsStudied,
        cardsCorrect,
        durationSeconds,
        gradeDistribution,
      },
    });
  },

  pauseCardTimer: () => {
    const { cardShownAt, accumulatedCardSeconds } = get();
    if (!cardShownAt) return;
    const elapsed = (Date.now() - cardShownAt) / 1000;
    set({ accumulatedCardSeconds: accumulatedCardSeconds + elapsed, cardShownAt: null });
  },

  resumeCardTimer: () => {
    set({ cardShownAt: Date.now() });
  },

  resetSession: () => {
    set({
      sessionId: null,
      queue: [],
      currentIndex: 0,
      isFlipped: false,
      sessionStartTime: null,
      cardShownAt: null,
      accumulatedCardSeconds: 0,
      gradeDistribution: { again: 0, hard: 0, good: 0, easy: 0 },
      isSessionComplete: false,
      sessionResult: null,
    });
  },

  loadDeckCards: async (deckId) => {
    set({ isLoadingCards: true });
    try {
      const cards = await getCardsByDeckId(deckId);
      set({ deckCards: cards, isLoadingCards: false });
    } catch {
      set({ isLoadingCards: false });
    }
  },

  createCard: async (data) => {
    const card = await createCard(data);
    set((state) => ({ deckCards: [...state.deckCards, card] }));
    return card;
  },

  updateCard: async (id, data) => {
    await updateCard(id, data);
    set((state) => ({
      deckCards: state.deckCards.map((c) =>
        c.id === id ? { ...c, ...data } : c
      ),
    }));
  },

  deleteCard: async (id) => {
    await deleteCard(id);
    set((state) => ({
      deckCards: state.deckCards.filter((c) => c.id !== id),
    }));
  },
}));
