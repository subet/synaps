import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { checkProStatus, getOfferings, initializeRevenueCat, purchasePackage, restorePurchases } from '../services/revenueCat';
import { getUserProfile } from '../services/supabase';

const PRO_CACHE_KEY = '@synaps_is_pro';
const WAS_PRO_KEY = '@synaps_was_pro';
const PRO_EXPIRED_AT_KEY = '@synaps_pro_expired_at';

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

async function getWasPro(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(WAS_PRO_KEY)) === 'true';
  } catch {
    return false;
  }
}

async function setWasPro(): Promise<void> {
  try {
    await AsyncStorage.setItem(WAS_PRO_KEY, 'true');
  } catch {}
}

async function getProExpiredAt(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PRO_EXPIRED_AT_KEY);
  } catch {
    return null;
  }
}

async function setProExpiredAt(date: string): Promise<void> {
  try {
    await AsyncStorage.setItem(PRO_EXPIRED_AT_KEY, date);
  } catch {}
}

interface SubscriptionState {
  isPro: boolean;
  wasPro: boolean;
  proExpiredAt: string | null;
  isLoading: boolean;
  offerings: any | null;

  initialize: (userId?: string) => Promise<void>;
  refreshStatus: (userId?: string) => Promise<void>;
  loadOfferings: () => Promise<void>;
  purchase: (pkg: any) => Promise<boolean>;
  restore: () => Promise<boolean>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  isPro: false,
  wasPro: false,
  proExpiredAt: null,
  isLoading: false,
  offerings: null,

  initialize: async (userId) => {
    // 1. Load cached status immediately (offline-safe)
    const cached = await getCachedPro();
    if (cached) set({ isPro: true });

    const wasPro = await getWasPro();
    const proExpiredAt = await getProExpiredAt();
    set({ wasPro, proExpiredAt });

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

    // Track PRO history for win-back
    if (isPro) {
      await setWasPro();
      set({ isPro, wasPro: true });
    } else if (wasPro && !proExpiredAt) {
      // PRO just expired — record the date
      const now = new Date().toISOString();
      await setProExpiredAt(now);
      set({ isPro, proExpiredAt: now });
    } else {
      set({ isPro });
    }

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
    const { wasPro: prevWasPro, proExpiredAt } = get();

    if (isPro) {
      await setWasPro();
      set({ isPro, wasPro: true, proExpiredAt: null });
      // Clear expired date if resubscribed
      try { await AsyncStorage.removeItem(PRO_EXPIRED_AT_KEY); } catch {}
    } else if (prevWasPro && !proExpiredAt) {
      const now = new Date().toISOString();
      await setProExpiredAt(now);
      set({ isPro, proExpiredAt: now });
    } else {
      set({ isPro });
    }

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
      if (isPro) {
        await setWasPro();
        try { await AsyncStorage.removeItem(PRO_EXPIRED_AT_KEY); } catch {}
        set({ isPro, wasPro: true, proExpiredAt: null, isLoading: false });
      } else {
        set({ isPro, isLoading: false });
      }
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
      if (isPro) {
        await setWasPro();
        try { await AsyncStorage.removeItem(PRO_EXPIRED_AT_KEY); } catch {}
        set({ isPro, wasPro: true, proExpiredAt: null, isLoading: false });
      } else {
        set({ isPro, isLoading: false });
      }
      await setCachedPro(isPro);
      return isPro;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },
}));
