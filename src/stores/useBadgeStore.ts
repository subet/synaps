import { create } from 'zustand';
import { BadgeWithStatus, checkAndAwardBadges, getAllBadgesWithStatus, syncBadgesToRemote } from '../services/badgeService';
import { useAuthStore } from './useAuthStore';

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
      // Sync badges to Supabase so other users can see them
      const userId = useAuthStore.getState().user?.id;
      if (userId) syncBadgesToRemote(userId).catch(() => {});
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
      // Sync all awarded badges to Supabase so other users can see them
      const userId = useAuthStore.getState().user?.id;
      if (userId) syncBadgesToRemote(userId).catch(() => {});
      return newIds;
    } catch {
      return [];
    }
  },

  clearNewlyAwarded: () => set({ newlyAwardedIds: [] }),
}));
