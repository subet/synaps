import * as Haptics from 'expo-haptics';
import { useAppStore } from '../stores/useAppStore';

/** Light tap — use for every button/pressable press */
export function tap() {
  if (!useAppStore.getState().hapticsEnabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** Medium impact — use for important actions (grade card, create deck) */
export function impact() {
  if (!useAppStore.getState().hapticsEnabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

/** Success notification — use for achievements, session complete */
export function success() {
  if (!useAppStore.getState().hapticsEnabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
