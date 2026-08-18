import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import Purchases, { PurchasesError, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { logEvent, truncate } from '../services/analytics';
import { checkProStatus, getOfferings, initializeRevenueCat, purchasePackage, restorePurchases } from '../services/revenueCat';
import { getUserProfile } from '../services/supabase';

const PRO_CACHE_KEY = '@synaps_is_pro';

// PRO history (win-back) flags are keyed PER USER so one account's history can
// never leak into another account (or a fresh user) on the same device.
const LEGACY_WAS_PRO_KEY = '@synaps_was_pro';
const LEGACY_PRO_EXPIRED_AT_KEY = '@synaps_pro_expired_at';
const wasProKey = (identity: string) => `${LEGACY_WAS_PRO_KEY}:${identity}`;
const proExpiredAtKey = (identity: string) => `${LEGACY_PRO_EXPIRED_AT_KEY}:${identity}`;

/**
 * Identity used to key PRO history: the auth user id when signed in, otherwise
 * the RevenueCat appUserID (anonymous id). Null when neither is available —
 * in that case win-back history is neither read nor written.
 */
async function resolveIdentity(authUserId?: string): Promise<string | null> {
  if (authUserId) return authUserId;
  try {
    return await Purchases.getAppUserID();
  } catch {
    return null; // RC not configured (Expo Go / init failure)
  }
}

/** One-time migration: the old device-level flags predate per-user keying. */
async function removeLegacyDeviceFlags(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([LEGACY_WAS_PRO_KEY, LEGACY_PRO_EXPIRED_AT_KEY]);
  } catch {}
}

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

async function getWasPro(identity: string | null): Promise<boolean> {
  if (!identity) return false;
  try {
    return (await AsyncStorage.getItem(wasProKey(identity))) === 'true';
  } catch {
    return false;
  }
}

async function setWasPro(identity: string | null): Promise<void> {
  if (!identity) return;
  try {
    await AsyncStorage.setItem(wasProKey(identity), 'true');
  } catch {}
}

async function getProExpiredAt(identity: string | null): Promise<string | null> {
  if (!identity) return null;
  try {
    return await AsyncStorage.getItem(proExpiredAtKey(identity));
  } catch {
    return null;
  }
}

async function setProExpiredAt(identity: string | null, date: string): Promise<void> {
  if (!identity) return;
  try {
    await AsyncStorage.setItem(proExpiredAtKey(identity), date);
  } catch {}
}

async function clearProExpiredAt(identity: string | null): Promise<void> {
  if (!identity) return;
  try {
    await AsyncStorage.removeItem(proExpiredAtKey(identity));
  } catch {}
}

interface SubscriptionState {
  isPro: boolean;
  wasPro: boolean;
  proExpiredAt: string | null;
  isLoading: boolean;
  offerings: PurchasesOffering | null;
  /** Identity the current wasPro/proExpiredAt flags belong to. */
  identity: string | null;

  initialize: (userId?: string) => Promise<void>;
  refreshStatus: (userId?: string) => Promise<void>;
  loadOfferings: () => Promise<void>;
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  isPro: false,
  wasPro: false,
  proExpiredAt: null,
  isLoading: false,
  offerings: null,
  identity: null,

  initialize: async (userId) => {
    // 0. Migration: drop the old device-level flags (they could mark a fresh
    //    user as "was PRO" just because a previous account on this device was).
    await removeLegacyDeviceFlags();

    // 1. Load cached status immediately (offline-safe)
    const cached = await getCachedPro();
    if (cached) set({ isPro: true });

    // 2. Check RevenueCat (may fail on simulator / Expo Go)
    let rcPro = false;
    try {
      await initializeRevenueCat(userId);
      rcPro = await checkProStatus();
    } catch {}

    // 3. Per-user PRO history (needs RC to be initialized for the anonymous id)
    const identity = await resolveIdentity(userId);
    const wasPro = await getWasPro(identity);
    const proExpiredAt = await getProExpiredAt(identity);
    set({ wasPro, proExpiredAt, identity });

    // 4. Check Supabase profile (for testing / server-granted PRO).
    //    dbPro affects isPro (feature gating) but must NEVER persist wasPro —
    //    win-back history is driven by real RevenueCat entitlements only.
    let dbPro = false;
    if (userId) {
      try {
        const profile = await getUserProfile(userId);
        dbPro = profile?.is_pro === true;
      } catch {}
    }

    const isPro = rcPro || dbPro;

    // Track PRO history for win-back (RC entitlement only)
    if (rcPro) {
      await setWasPro(identity);
      set({ isPro, wasPro: true });
    } else if (wasPro && !proExpiredAt) {
      // PRO just expired — record the date
      const now = new Date().toISOString();
      await setProExpiredAt(identity, now);
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

    // Re-resolve identity: it changes on sign-out / account switch, and the
    // history flags must be re-read for the new identity.
    const identity = await resolveIdentity(userId);
    const wasPro = await getWasPro(identity);
    const proExpiredAt = await getProExpiredAt(identity);

    const isPro = rcPro || dbPro;

    if (rcPro) {
      await setWasPro(identity);
      await clearProExpiredAt(identity);
      set({ isPro, wasPro: true, proExpiredAt: null, identity });
    } else if (wasPro && !proExpiredAt) {
      const now = new Date().toISOString();
      await setProExpiredAt(identity, now);
      set({ isPro, wasPro, proExpiredAt: now, identity });
    } else {
      set({ isPro, wasPro, proExpiredAt, identity });
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
        // Real RC entitlement — safe to persist win-back history.
        const identity = get().identity ?? (await resolveIdentity());
        await setWasPro(identity);
        await clearProExpiredAt(identity);
        set({ isPro, wasPro: true, proExpiredAt: null, isLoading: false, identity });
      } else {
        set({ isPro, isLoading: false });
      }
      await setCachedPro(isPro);
      return isPro;
    } catch (e) {
      // Analytics only — purchase behavior is unchanged (still resolves to false).
      const err = e as Partial<PurchasesError>;
      logEvent('purchase_error', {
        package_id: pkg.identifier,
        error_code: err.code != null ? String(err.code) : 'unknown',
        error_message: truncate(err.message),
        user_cancelled: err.userCancelled === true,
      });
      set({ isLoading: false });
      return false;
    }
  },

  restore: async () => {
    set({ isLoading: true });
    try {
      const isPro = await restorePurchases();
      if (isPro) {
        // Real RC entitlement — safe to persist win-back history.
        const identity = get().identity ?? (await resolveIdentity());
        await setWasPro(identity);
        await clearProExpiredAt(identity);
        set({ isPro, wasPro: true, proExpiredAt: null, isLoading: false, identity });
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
