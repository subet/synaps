import { router } from 'expo-router';
import { Platform } from 'react-native';
import { logEvent } from '../services/analytics';
import { useAppStore } from '../stores/useAppStore';

/**
 * Onboarding is: intro slides → ATT (iOS only) → sign-up (skippable) → home.
 * Notification permission is no longer an onboarding step: it is asked on the
 * first session-complete screen, once the learner has seen the app work.
 */
export const AFTER_INTRO_ROUTE = Platform.OS === 'ios' ? '/onboarding/att' : '/auth/register';

export async function finishOnboarding(): Promise<void> {
  logEvent('onboarding_completed');
  await useAppStore.getState().markOnboardingComplete();
  router.replace('/(tabs)');
}
