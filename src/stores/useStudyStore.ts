import { create } from 'zustand';
import {
  bulkInsertCards,
  completeStudySession,
  createStudySession,
  createCard,
  deleteCard,
  getAllCardsForExtraStudy,
  getDeckById,
  getDueCards,
  getCardsByDeckId,
  getTodayCardsStudied,
  recordStudyActivity,
  recordFocusSeconds,
  updateCard,
} from '../services/database';
import { calculateSM2 } from '../services/srs';
import { scheduleStreakAtRiskNotification, scheduleWeeklyProgress } from '../services/notifications';
import { getStreakData, getWeeklyStudyStats } from '../services/database';
import { useAppStore } from './useAppStore';
import { useAuthStore } from './useAuthStore';
import { upsertWeeklyStats } from '../services/leaderboard';
import { Card, FriendScoreDelta, SRSGrade, StudySessionResult } from '../types';

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

  startSession: (deckId: string, extra?: boolean) => Promise<void>;
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

  startSession: async (deckId, extra) => {
    const [session, dueCards, deck] = await Promise.all([
      createStudySession(deckId),
      extra ? getAllCardsForExtraStudy(deckId) : getDueCards(deckId),
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

    // Read today's count BEFORE incrementing (used for cap calculation)
    const reviewsToday = await getTodayCardsStudied();

    await Promise.all([
      recordStudyActivity(1),
      recordFocusSeconds(elapsedSeconds),
    ]);

    // Write to remote leaderboard immediately after each card — so partial sessions count too.
    try {
      const { user } = useAuthStore.getState();
      if (user?.id) {
        const isFirstStudyToday = reviewsToday === 0;
        const streakData = await getStreakData().catch(() => ({ currentStreak: 0, longestStreak: 0, weekDays: [] }));

        // Check daily goal: default 20 cards; completing when crossing the threshold
        const deck = queue[currentIndex] ? await getDeckById(queue[currentIndex].deck_id).catch(() => null) : null;
        const dailyGoalTarget = deck?.new_cards_per_day ?? 20;
        const dailyGoalCompleted = reviewsToday < dailyGoalTarget && reviewsToday + 1 >= dailyGoalTarget;

        const scoreDelta: FriendScoreDelta = {
          wasCorrect: grade >= 2,
          reviewsToday,
          dailyGoalCompleted,
          streakBonusEarned: isFirstStudyToday && streakData.currentStreak > 0,
          deckMilestone: false, // milestone fired separately from endSession
          isFirstStudyToday,
        };

        upsertWeeklyStats(user.id, 1, scoreDelta).catch((e) => {
          if (__DEV__) console.warn('[leaderboard] upsertWeeklyStats failed:', e?.message ?? e);
        });
      }
    } catch {}

    // Track grade distribution
    const gradeKey = (['again', 'hard', 'good', 'easy'] as const)[grade];
    const newDist = { ...gradeDistribution, [gradeKey]: gradeDistribution[gradeKey] + 1 };

    const nextIndex = currentIndex + 1;
    const isLast = nextIndex >= queue.length;

    if (isLast) {
      set({ gradeDistribution: newDist });
      await get().endSession();
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

    // Schedule streak-at-risk and weekly progress notifications
    try {
      const streakData = await getStreakData();
      if (streakData.currentStreak > 0) {
        scheduleStreakAtRiskNotification(streakData.currentStreak).catch(() => {});
      }
      const { notifications } = useAppStore.getState();
      if (notifications.weeklyRecap !== false) {
        const weeklyStats = await getWeeklyStudyStats();
        scheduleWeeklyProgress(weeklyStats.cards, weeklyStats.sessions).catch(() => {});
      }
    } catch { /* non-critical */ }
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
