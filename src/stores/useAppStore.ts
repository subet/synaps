import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { AppSettings, Language } from '../types';

interface AppState extends AppSettings {
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  setLanguage: (lang: Language) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setNotificationTime: (time: string) => Promise<void>;
  markOnboardingComplete: () => Promise<void>;
  incrementFreeDownloads: () => Promise<void>;
  resetFreeDownloads: () => Promise<void>;
}

const SETTINGS_KEY = '@synaps/settings';

const defaultSettings: AppSettings = {
  language: 'en',
  notifications: { enabled: false, time: '09:00' },
  hasSeenOnboarding: false,
  freeDownloadsUsed: 0,
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

  setLanguage: async (language) => {
    set({ language });
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

  markOnboardingComplete: async () => {
    set({ hasSeenOnboarding: true });
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
    const { hasSeenOnboarding, language, notifications, freeDownloadsUsed } = settings;
    await AsyncStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ hasSeenOnboarding, language, notifications, freeDownloadsUsed })
    );
  } catch {
    // Silently fail — preferences are not critical
  }
}
