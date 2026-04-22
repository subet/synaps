import { supabase } from './supabase';
import type { FriendPrivacy, FriendScoreDelta, FriendsLeaderboardEntry } from '../types';

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  country: string | null;
  cardsStudied: number;
  rank: number;
}

/** Returns the ISO date string (YYYY-MM-DD) for the Monday of the current week. */
export function getWeekStart(): string {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday, 1 = Monday, ...
  const diff = (day + 6) % 7;  // days since last Monday
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - diff);
  return monday.toISOString().split('T')[0];
}

/** Converts an ISO 3166-1 alpha-2 country code to its flag emoji. */
export function countryToFlag(iso2: string): string {
  return iso2
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join('');
}

/**
 * Increment the current user's weekly card count in Supabase.
 * Also updates friend_score, cards_correct, and study_days when scoreDelta is provided.
 * Fetches the existing row first so we can add to it (Supabase upsert replaces, not increments).
 */
export async function upsertWeeklyStats(
  userId: string,
  delta: number,
  scoreDelta?: FriendScoreDelta
): Promise<void> {
  const weekStart = getWeekStart();

  // Fetch existing row for this week
  const { data: existing, error: fetchError } = await supabase
    .from('weekly_stats')
    .select('cards_studied, friend_score, cards_correct, study_days')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle();

  if (fetchError) {
    if (__DEV__) console.warn('[leaderboard] fetch error:', fetchError.message);
    throw fetchError;
  }

  const newCardsStudied = (existing?.cards_studied ?? 0) + delta;

  let newFriendScore = existing?.friend_score ?? 0;
  let newCardsCorrect = existing?.cards_correct ?? 0;
  let newStudyDays = existing?.study_days ?? 0;

  if (scoreDelta) {
    const pointsDelta = computeFriendScoreDelta(scoreDelta);
    newFriendScore += pointsDelta;
    if (scoreDelta.wasCorrect) newCardsCorrect += 1;
    if (scoreDelta.isFirstStudyToday) newStudyDays = Math.min(newStudyDays + 1, 7);
  }

  const { error } = await supabase.from('weekly_stats').upsert(
    {
      user_id: userId,
      week_start: weekStart,
      cards_studied: newCardsStudied,
      friend_score: newFriendScore,
      cards_correct: newCardsCorrect,
      study_days: newStudyDays,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,week_start' }
  );

  if (error) {
    if (__DEV__) console.warn('[leaderboard] upsert error:', error.message);
    throw error;
  }
}

/** Compute the friend score delta for a single card review event. */
export function computeFriendScoreDelta(delta: FriendScoreDelta): number {
  // Daily cap multiplier
  const r = delta.reviewsToday;
  const capMultiplier = r < 100 ? 1.0 : r < 200 ? 0.5 : 0.25;

  const basePoints = 1;
  const correctBonus = delta.wasCorrect ? 2 : 0;
  const cappedPoints = Math.round((basePoints + correctBonus) * capMultiplier);

  // Flat bonuses (not capped)
  const dailyGoalBonus = delta.dailyGoalCompleted ? 10 : 0;
  const streakBonus = delta.streakBonusEarned ? 5 : 0;
  const milestoneBonus = delta.deckMilestone ? 20 : 0;

  return cappedPoints + dailyGoalBonus + streakBonus + milestoneBonus;
}

/** Fetch the Friends leaderboard for a user: their friends + themselves, this week. */
export async function getFriendsLeaderboard(
  userId: string,
  friendIds: string[]
): Promise<FriendsLeaderboardEntry[]> {
  const weekStart = getWeekStart();
  const participantIds = [...friendIds, userId];

  const { data, error } = await supabase
    .from('weekly_stats')
    .select(
      'user_id, cards_studied, friend_score, cards_correct, study_days, updated_at, profiles!weekly_stats_user_id_fkey(display_name, avatar_url, country)'
    )
    .eq('week_start', weekStart)
    .in('user_id', participantIds)
    .order('friend_score', { ascending: false })
    .order('study_days', { ascending: false })
    .order('updated_at', { ascending: true });

  if (error) throw error;

  const rows = data ?? [];

  // Also include the user themselves even if they have no weekly_stats row yet
  // (so they always appear in their own Friends leaderboard at rank last)
  const seen = new Set(rows.map((r: any) => r.user_id));
  const missing = participantIds.filter((id) => !seen.has(id));

  // Sort by friend_score, apply tie-breakers, assign ranks
  return mapFriendsEntries(rows, userId, missing);
}

// ─── Internal helpers ──────────────────────────────────────────────────────────

function firstWord(name?: string | null): string {
  if (!name) return '—';
  return name.trim().split(/\s+/)[0];
}

function mapFriendsEntries(
  rows: any[],
  userId: string,
  missingIds: string[]
): FriendsLeaderboardEntry[] {
  const sorted = rows.map((row, index) => {
    const cardsStudied = row.cards_studied ?? 0;
    const cardsCorrect = row.cards_correct ?? 0;
    const accuracy = cardsStudied > 0 ? cardsCorrect / cardsStudied : 0;
    return {
      userId: row.user_id,
      displayName: firstWord(row.profiles?.display_name),
      avatarUrl: row.profiles?.avatar_url ?? null,
      country: row.profiles?.country ?? null,
      friendScore: row.friend_score ?? 0,
      cardsStudied,
      studyDays: row.study_days ?? 0,
      accuracy,
      rank: index + 1,
      isMe: row.user_id === userId,
    };
  });

  // Append zero-score entries for users with no row this week
  const lastRank = sorted.length;
  const zeros: FriendsLeaderboardEntry[] = missingIds.map((id, i) => ({
    userId: id,
    displayName: '—',
    avatarUrl: null,
    country: null,
    friendScore: 0,
    cardsStudied: 0,
    studyDays: 0,
    accuracy: 0,
    rank: lastRank + 1 + i,
    isMe: id === userId,
  }));

  return [...sorted, ...zeros];
}

/** Fetch top 25 entries worldwide for the current week (extra 5 so we can find user rank). */
export async function getWorldLeaderboard(): Promise<LeaderboardEntry[]> {
  const weekStart = getWeekStart();

  const { data, error } = await supabase
    .from('weekly_stats')
    .select('user_id, cards_studied, profiles!weekly_stats_user_id_fkey(display_name, avatar_url, country)')
    .eq('week_start', weekStart)
    .order('cards_studied', { ascending: false })
    .limit(25);

  if (error) throw error;
  return mapEntries(data ?? []);
}

/** Fetch top 25 entries for a specific country for the current week. */
export async function getCountryLeaderboard(countryCode: string): Promise<LeaderboardEntry[]> {
  const weekStart = getWeekStart();

  const { data, error } = await supabase
    .from('weekly_stats')
    .select('user_id, cards_studied, profiles!weekly_stats_user_id_fkey!inner(display_name, avatar_url, country)')
    .eq('week_start', weekStart)
    .eq('profiles.country', countryCode)
    .order('cards_studied', { ascending: false })
    .limit(25);

  if (error) throw error;
  return mapEntries(data ?? []);
}

/**
 * Returns the 1-based world rank and optional country rank for a given user.
 * Counts how many users have MORE cards studied this week.
 */
export async function getMyRank(
  userId: string,
  countryCode?: string
): Promise<{ worldRank: number; countryRank: number | null; cardsStudied: number }> {
  const weekStart = getWeekStart();

  // Get my own count
  const { data: mine } = await supabase
    .from('weekly_stats')
    .select('cards_studied')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle();

  const myCards = mine?.cards_studied ?? 0;

  if (myCards === 0) {
    return { worldRank: 0, countryRank: null, cardsStudied: 0 };
  }

  // World rank: count users with strictly more cards
  const { count: worldAbove } = await supabase
    .from('weekly_stats')
    .select('*', { count: 'exact', head: true })
    .eq('week_start', weekStart)
    .gt('cards_studied', myCards);

  const worldRank = (worldAbove ?? 0) + 1;

  // Country rank
  let countryRank: number | null = null;
  if (countryCode) {
    const { count: countryAbove } = await supabase
      .from('weekly_stats')
      .select('user_id, profiles!inner(country)', { count: 'exact', head: true })
      .eq('week_start', weekStart)
      .eq('profiles.country', countryCode)
      .gt('cards_studied', myCards);

    countryRank = (countryAbove ?? 0) + 1;
  }

  return { worldRank, countryRank, cardsStudied: myCards };
}

function mapEntries(rows: any[]): LeaderboardEntry[] {
  return rows.map((row, index) => ({
    userId: row.user_id,
    displayName: firstWord(row.profiles?.display_name),
    avatarUrl: row.profiles?.avatar_url ?? null,
    country: row.profiles?.country ?? null,
    cardsStudied: row.cards_studied,
    rank: index + 1,
  }));
}

// ─── Public user profile ────────────────────────────────────────────────────

export interface PublicUserProfile {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  country: string | null;
  friendPrivacy: FriendPrivacy;
  achievedBadgeIds: string[];
  worldRank: number;
  countryRank: number | null;
}

/**
 * Fetch public profile data for a leaderboard user.
 * Includes their profile info, achieved badges, and world/country rank.
 */
export async function getPublicUserProfile(targetUserId: string): Promise<PublicUserProfile | null> {
  const profileRes = await supabase
    .from('profiles')
    .select('display_name, avatar_url, country, friend_privacy, achieved_badges')
    .eq('id', targetUserId)
    .single();

  if (profileRes.error) return null;

  const p = profileRes.data;
  const country = p.country ?? null;

  // Fetch rank (with country if available)
  const rankData = await getMyRank(targetUserId, country ?? undefined);

  // achieved_badges is a jsonb array synced from the local device
  const achievedBadgeIds: string[] = Array.isArray(p.achieved_badges)
    ? p.achieved_badges
    : [];

  return {
    userId: targetUserId,
    displayName: firstWord(p.display_name),
    avatarUrl: p.avatar_url ?? null,
    country,
    friendPrivacy: (p.friend_privacy ?? 'invite_only') as FriendPrivacy,
    achievedBadgeIds,
    worldRank: rankData.worldRank,
    countryRank: rankData.countryRank,
  };
}
