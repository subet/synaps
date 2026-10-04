import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { setLocale } from '../i18n';
import { logEvent, setSuperProperties } from '../services/analytics';
import { AppSettings, Language } from '../types';

interface AppState extends AppSettings {
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  /** `auto` = set from the device locale, not by the user. */
  setLanguage: (lang: Language, opts?: { auto?: boolean }) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setNotificationTime: (time: string) => Promise<void>;
  setWeeklyRecapEnabled: (enabled: boolean) => Promise<void>;
  setHapticsEnabled: (enabled: boolean) => Promise<void>;
  markOnboardingComplete: () => Promise<void>;
  dismissReminderPrompt: () => Promise<void>;
  markTipSeen: (id: string) => Promise<void>;
  recordCompletedSession: () => Promise<number>;
  markReviewRequested: () => Promise<void>;
  markPostSessionPaywallSeen: () => Promise<void>;
  incrementFreeDownloads: () => Promise<void>;
  resetFreeDownloads: () => Promise<void>;
}

const SETTINGS_KEY = '@synaps/settings';

const defaultSettings: AppSettings = {
  language: 'en',
  notifications: { enabled: false, time: '09:00', weeklyRecap: true },
  hasSeenOnboarding: false,
  freeDownloadsUsed: 0,
  hapticsEnabled: true,
};

export const useAppStore = create<AppState>((set, get) => ({
  ...defaultSettings,
  isLoading: true,

  loadSettings: async () => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as Partial<AppSettings>;
        set({ ...defaultSettings, ...stored, isLoading: false });
      } else {
        set({ ...defaultSettings, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  setLanguage: async (language, opts) => {
    const previous = get().language;
    const auto = !!opts?.auto;
    setLocale(language); // sync — i18n.locale updated before Zustand subscribers re-render
    set(auto ? { language, localeDetected: true } : { language, languageExplicit: true });
    setSuperProperties({ app_language: language });
    if (previous !== language) logEvent('language_changed', { from: previous, to: language, auto });
    await saveSettings({ ...get(), language });
  },

  setNotificationsEnabled: async (enabled) => {
    const notifications = { ...get().notifications, enabled };
    set({ notifications });
    await saveSettings({ ...get(), notifications });
  },

  setNotificationTime: async (time) => {
    const notifications = { ...get().notifications, time };
    set({ notifications });
    await saveSettings({ ...get(), notifications });
  },

  setWeeklyRecapEnabled: async (weeklyRecap) => {
    const notifications = { ...get().notifications, weeklyRecap };
    set({ notifications });
    await saveSettings({ ...get(), notifications });
  },

  setHapticsEnabled: async (hapticsEnabled) => {
    set({ hapticsEnabled });
    await saveSettings({ ...get(), hapticsEnabled });
  },

  dismissReminderPrompt: async () => {
    set({ reminderPromptDismissed: true });
    await saveSettings({ ...get(), reminderPromptDismissed: true });
  },

  recordCompletedSession: async () => {
    const completedSessions = (get().completedSessions ?? 0) + 1;
    set({ completedSessions });
    await saveSettings({ ...get(), completedSessions });
    return completedSessions;
  },

  markReviewRequested: async () => {
    set({ reviewRequested: true });
    await saveSettings({ ...get(), reviewRequested: true });
  },

  markPostSessionPaywallSeen: async () => {
    set({ hasSeenPostSessionPaywall: true });
    await saveSettings({ ...get(), hasSeenPostSessionPaywall: true });
  },

  markTipSeen: async (id) => {
    const seenTips = [...new Set([...(get().seenTips ?? []), id])];
    set({ seenTips });
    await saveSettings({ ...get(), seenTips });
  },

  markOnboardingComplete: async () => {
    set({ hasSeenOnboarding: true });
    setSuperProperties({ onboarding_done: true });
    await saveSettings({ ...get(), hasSeenOnboarding: true });
  },

  incrementFreeDownloads: async () => {
    const freeDownloadsUsed = get().freeDownloadsUsed + 1;
    set({ freeDownloadsUsed });
    await saveSettings({ ...get(), freeDownloadsUsed });
  },

  resetFreeDownloads: async () => {
    set({ freeDownloadsUsed: 0 });
    await saveSettings({ ...get(), freeDownloadsUsed: 0 });
  },
}));

async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    const {
      hasSeenOnboarding, language, notifications, freeDownloadsUsed, hapticsEnabled,
      languageExplicit, localeDetected, reminderPromptDismissed, seenTips,
      completedSessions, reviewRequested, hasSeenPostSessionPaywall,
    } = settings;
    await AsyncStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        hasSeenOnboarding, language, notifications, freeDownloadsUsed, hapticsEnabled,
        languageExplicit, localeDetected, reminderPromptDismissed, seenTips,
        completedSessions, reviewRequested, hasSeenPostSessionPaywall,
      })
    );
  } catch {
    // Silently fail — preferences are not critical
  }
}
