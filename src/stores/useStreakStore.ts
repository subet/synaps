import { create } from 'zustand';
import { getStreakData } from '../services/database';
import { StreakDay } from '../types';

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  weekDays: StreakDay[];
  isLoading: boolean;

  loadStreak: () => Promise<void>;
}

export const useStreakStore = create<StreakState>((set) => ({
  currentStreak: 0,
  longestStreak: 0,
  weekDays: [],
  isLoading: false,

  loadStreak: async () => {
    set({ isLoading: true });
    try {
      const data = await getStreakData();
      set({ ...data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
