import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { checkProStatus, getOfferings, initializeRevenueCat, purchasePackage, restorePurchases } from '../services/revenueCat';
import { getUserProfile } from '../services/supabase';

const PRO_CACHE_KEY = '@synaps_is_pro';

async function getCachedPro(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(PRO_CACHE_KEY)) === 'true';
  } catch {
    return false;
  }
}

async function setCachedPro(isPro: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(PRO_CACHE_KEY, isPro ? 'true' : 'false');
  } catch {}
}

interface SubscriptionState {
  isPro: boolean;
  isLoading: boolean;
  offerings: any | null;

  initialize: (userId?: string) => Promise<void>;
  refreshStatus: (userId?: string) => Promise<void>;
  loadOfferings: () => Promise<void>;
  purchase: (pkg: any) => Promise<boolean>;
  restore: () => Promise<boolean>;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  isPro: false,
  isLoading: false,
  offerings: null,

  initialize: async (userId) => {
    // 1. Load cached status immediately (offline-safe)
    const cached = await getCachedPro();
    if (cached) set({ isPro: true });

    // 2. Check RevenueCat (may fail on simulator / Expo Go)
    let rcPro = false;
    try {
      await initializeRevenueCat(userId);
      rcPro = await checkProStatus();
    } catch {}

    // 3. Check Supabase profile (for testing / server-granted PRO)
    let dbPro = false;
    if (userId) {
      try {
        const profile = await getUserProfile(userId);
        dbPro = profile?.is_pro === true;
      } catch {}
    }

    const isPro = rcPro || dbPro;
    set({ isPro });
    await setCachedPro(isPro);
  },

  refreshStatus: async (userId) => {
    let rcPro = false;
    try {
      rcPro = await checkProStatus();
    } catch {}

    let dbPro = false;
    if (userId) {
      try {
        const profile = await getUserProfile(userId);
        dbPro = profile?.is_pro === true;
      } catch {}
    }

    const isPro = rcPro || dbPro;
    set({ isPro });
    await setCachedPro(isPro);
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
      await setCachedPro(isPro);
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
      await setCachedPro(isPro);
      return isPro;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },
}));
