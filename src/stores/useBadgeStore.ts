import { create } from 'zustand';
import { BadgeWithStatus, checkAndAwardBadges, getAllBadgesWithStatus } from '../services/badgeService';

interface BadgeState {
  badges: BadgeWithStatus[];
  newlyAwardedIds: string[];
  isLoading: boolean;
  loadBadges: () => Promise<void>;
  checkBadges: () => Promise<string[]>;
  clearNewlyAwarded: () => void;
}

export const useBadgeStore = create<BadgeState>((set) => ({
  badges: [],
  newlyAwardedIds: [],
  isLoading: false,

  loadBadges: async () => {
    set({ isLoading: true });
    try {
      const badges = await getAllBadgesWithStatus();
      set({ badges, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  checkBadges: async () => {
    try {
      const newIds = await checkAndAwardBadges();
      if (newIds.length > 0) {
        const badges = await getAllBadgesWithStatus();
        set({ badges, newlyAwardedIds: newIds });
      }
      return newIds;
    } catch {
      return [];
    }
  },

  clearNewlyAwarded: () => set({ newlyAwardedIds: [] }),
}));
