import { create } from 'zustand';
import { checkProStatus, getOfferings, initializeRevenueCat, purchasePackage, restorePurchases } from '../services/revenueCat';

interface SubscriptionState {
  isPro: boolean;
  isLoading: boolean;
  offerings: any | null;

  initialize: (userId?: string) => Promise<void>;
  refreshStatus: () => Promise<void>;
  loadOfferings: () => Promise<void>;
  purchase: (pkg: any) => Promise<boolean>;
  restore: () => Promise<boolean>;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  isPro: false,
  isLoading: false,
  offerings: null,

  initialize: async (userId) => {
    try {
      await initializeRevenueCat(userId);
      const isPro = await checkProStatus();
      set({ isPro });
    } catch {
      // RevenueCat failure should not block the app
    }
  },

  refreshStatus: async () => {
    try {
      const isPro = await checkProStatus();
      set({ isPro });
    } catch {
      // Silent fail
    }
  },

  loadOfferings: async () => {
    set({ isLoading: true });
    try {
      const offerings = await getOfferings();
      set({ offerings, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  purchase: async (pkg) => {
    set({ isLoading: true });
    try {
      const { isPro } = await purchasePackage(pkg);
      set({ isPro, isLoading: false });
      return isPro;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  restore: async () => {
    set({ isLoading: true });
    try {
      const isPro = await restorePurchases();
      set({ isPro, isLoading: false });
      return isPro;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },
}));
