import { useLocales } from 'expo-localization';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { scheduleDailyReminder, scheduleInactivityNudge, scheduleProExpiredWinBack, cancelWinBackNotifications, cancelAllNotifications } from '../src/services/notifications';
import { repairPublicDeckTranslations } from '../src/services/database';
import { ErrorBoundary } from '../src/components/ui/ErrorBoundary';
import { setLocale } from '../src/i18n';
import { useAppStore } from '../src/stores/useAppStore';
import { Language } from '../src/types';
import { useAuthStore } from '../src/stores/useAuthStore';
import { useSubscriptionStore } from '../src/stores/useSubscriptionStore';
import AnimatedSplash from '../src/components/AnimatedSplash';
SplashScreen.preventAutoHideAsync();

const SUPPORTED: Language[] = ['en', 'es', 'it', 'tr', 'de', 'fr', 'nl', 'ru', 'zh', 'pt_BR', 'pt_PT'];

function detectLocale(languageTag: string, languageCode: string): Language {
  // Portuguese needs region to distinguish pt-BR from pt-PT
  if (languageCode === 'pt') {
    return languageTag.startsWith('pt-BR') ? 'pt_BR' : 'pt_PT';
  }
  const match = SUPPORTED.find((l) => l === languageCode);
  return match ?? 'en';
}

export default function RootLayout() {
  const { loadSettings, hasSeenOnboarding, language, isLoading } = useAppStore();
  const { initialize: initAuth, isInitialized } = useAuthStore();
  const { initialize: initSubscription } = useSubscriptionStore();
  const locales = useLocales();
  const [animationDone, setAnimationDone] = useState(false);
  const appReady = !isLoading && isInitialized;

  useEffect(() => {
    async function bootstrap() {
      await loadSettings();

      const { language, setLanguage } = useAppStore.getState();
      if (language) {
        // Returning user — apply stored locale
        setLocale(language);
      } else {
        // First launch — detect from device locale and persist
        const tag = locales[0]?.languageTag ?? '';
        const code = locales[0]?.languageCode ?? '';
        const detected = detectLocale(tag, code);
        await setLanguage(detected);
      }

      await initAuth();
      const { user } = useAuthStore.getState();
      await initSubscription(user?.id);

      // Backfill translation columns for previously-downloaded public decks
      repairPublicDeckTranslations().catch(() => {});

      // Cancel ALL scheduled notifications on every cold start, then reschedule
      // only what's needed. This prevents duplicates from reinstalls or updates.
      await cancelAllNotifications();

      const { notifications } = useAppStore.getState();
      if (notifications.enabled) {
        const [h, m] = notifications.time.split(':').map(Number);
        scheduleDailyReminder(h, m).catch(() => {});
        scheduleInactivityNudge().catch(() => {});
      }

      // Re-schedule win-back after the cancelAll above
      const { isPro: isProNow, wasPro: wasProNow } = useSubscriptionStore.getState();
      if (!isProNow && wasProNow) {
        scheduleProExpiredWinBack().catch(() => {});
      }
    }
    bootstrap();
  }, []);

  // Hide native splash immediately — our animated splash takes over
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  if (!appReady || !animationDone) {
    return <AnimatedSplash onAnimationComplete={() => setAnimationDone(true)} />;
  }

  return (
    <ErrorBoundary>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding/index" />
          <Stack.Screen name="onboarding/att" />
          <Stack.Screen name="onboarding/notifications" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="deck/create" />
          <Stack.Screen name="deck/[id]" />
          <Stack.Screen name="deck/edit/[id]" />
          <Stack.Screen name="card/create/[deckId]" />
          <Stack.Screen name="card/edit/[id]" />
          <Stack.Screen name="study/[deckId]" />
          <Stack.Screen
            name="paywall/index"
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="legal/terms"
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="legal/privacy"
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="legal/support"
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="profile/index" />
          <Stack.Screen name="leaderboard/index" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
