import { useLocales } from 'expo-localization';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { setLocale } from '../src/i18n';
import { scheduleDailyReminder } from '../src/services/notifications';
import { useAppStore } from '../src/stores/useAppStore';
import { useAuthStore } from '../src/stores/useAuthStore';
import { useSubscriptionStore } from '../src/stores/useSubscriptionStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { loadSettings, hasSeenOnboarding, language, isLoading } = useAppStore();
  const { initialize: initAuth, isInitialized } = useAuthStore();
  const { initialize: initSubscription } = useSubscriptionStore();
  const locales = useLocales();

  useEffect(() => {
    async function bootstrap() {
      await loadSettings();
      await initAuth();
      await initSubscription();

      // Re-schedule daily reminder on every cold start in case OS cleared it
      // (happens after app update, reinstall, or device restart on some OS versions)
      const { notifications } = useAppStore.getState();
      if (notifications.enabled) {
        const [h, m] = notifications.time.split(':').map(Number);
        scheduleDailyReminder(h, m).catch(() => {});
      }
    }
    bootstrap();
  }, []);

  useEffect(() => {
    if (!isLoading && isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, isInitialized]);

  useEffect(() => {
    if (language) {
      setLocale(language);
    } else if (locales[0]?.languageCode) {
      const code = locales[0].languageCode;
      setLocale(['tr'].includes(code) ? code : 'en');
    }
  }, [language]);

  if (isLoading || !isInitialized) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding/index" />
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
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
