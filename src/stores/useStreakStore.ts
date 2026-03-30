import { create } from 'zustand';
import { getStreakData, getBadgeStats, getAverageDailyFocusMinutes } from '../services/database';
import { StreakDay } from '../types';

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  weekDays: StreakDay[];
  cardsMastered: number;
  avgDailyFocusMinutes: number;
  isLoading: boolean;

  loadStreak: () => Promise<void>;
}

export const useStreakStore = create<StreakState>((set) => ({
  currentStreak: 0,
  longestStreak: 0,
  weekDays: [],
  cardsMastered: 0,
  avgDailyFocusMinutes: 0,
  isLoading: false,

  loadStreak: async () => {
    set({ isLoading: true });
    try {
      const [streakData, badgeStats, avgFocus] = await Promise.all([
        getStreakData(),
        getBadgeStats(),
        getAverageDailyFocusMinutes(),
      ]);
      set({
        ...streakData,
        cardsMastered: badgeStats.cardsMastered,
        avgDailyFocusMinutes: avgFocus,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },
}));
