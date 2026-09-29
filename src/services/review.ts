import * as StoreReview from 'expo-store-review';
import { useAppStore } from '../stores/useAppStore';
import { logEvent } from './analytics';

/** Ask for a store rating once, after this many finished study sessions. */
export const REVIEW_AFTER_SESSIONS = 3;

/**
 * Shows the native App Store / Google Play rating dialog once the learner has
 * finished REVIEW_AFTER_SESSIONS sessions — a moment of success, never mid-study.
 * Asked at most once from here (the stores also rate-limit the dialog, so it may
 * silently not appear); the Settings "Rate us" button stays available.
 */
export async function maybeRequestReview(): Promise<void> {
  const { completedSessions = 0, reviewRequested, markReviewRequested } = useAppStore.getState();
  if (reviewRequested || completedSessions < REVIEW_AFTER_SESSIONS) return;
  try {
    if (!(await StoreReview.hasAction())) return;
    await markReviewRequested();
    logEvent('review_prompt_requested', { sessions: completedSessions });
    await StoreReview.requestReview();
  } catch {}
}
