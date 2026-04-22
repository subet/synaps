import { ALL_BADGES, BadgeCriteria, BadgeDefinition } from '../data/badges';
import { awardBadge, BadgeStats, getAwardedBadgeIds, getBadgeStats } from './database';
import { supabase } from './supabase';

export interface BadgeWithStatus extends BadgeDefinition {
  achieved: boolean;
  achievedAt?: string;
  progress: number; // 0–1
  currentValue: number;
}

function getValueForCriteria(criteria: BadgeCriteria, stats: BadgeStats): number {
  switch (criteria) {
    case 'total_cards_reviewed': return stats.totalCardsReviewed;
    case 'streak_days':          return stats.currentStreak;
    case 'longest_streak':       return stats.longestStreak;
    case 'decks_created':        return stats.decksCreated;
    case 'cards_mastered':       return stats.cardsMastered;
    case 'sessions_completed':   return stats.sessionsCompleted;
  }
}

/** Check all badges against current stats and award any newly earned ones.
 *  Returns the IDs of badges that were newly awarded this call. */
export async function checkAndAwardBadges(): Promise<string[]> {
  const [stats, awardedIds] = await Promise.all([getBadgeStats(), getAwardedBadgeIds()]);
  const awardedSet = new Set(awardedIds);
  const newlyAwarded: string[] = [];

  for (const badge of ALL_BADGES) {
    if (awardedSet.has(badge.id)) continue;
    const value = getValueForCriteria(badge.criteria, stats);
    if (value >= badge.threshold) {
      await awardBadge(badge.id);
      newlyAwarded.push(badge.id);
    }
  }

  return newlyAwarded;
}

/** Returns all badges with their current status and progress. */
export async function getAllBadgesWithStatus(): Promise<BadgeWithStatus[]> {
  const [stats, awardedIds] = await Promise.all([getBadgeStats(), getAwardedBadgeIds()]);
  const awardedSet = new Set(awardedIds);

  return ALL_BADGES.map((badge) => {
    const achieved = awardedSet.has(badge.id);
    const currentValue = getValueForCriteria(badge.criteria, stats);
    const progress = Math.min(currentValue / badge.threshold, 1);
    return { ...badge, achieved, progress, currentValue };
  });
}

/**
 * Sync locally-awarded badge IDs to the Supabase profiles table
 * so other users can see them on the leaderboard profile sheet.
 */
export async function syncBadgesToRemote(userId: string): Promise<void> {
  const awardedIds = await getAwardedBadgeIds();
  const { error } = await supabase
    .from('profiles')
    .update({ achieved_badges: awardedIds })
    .eq('id', userId);

  if (error && __DEV__) console.warn('[badges] sync error:', error.message);
}
