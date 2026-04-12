import { supabase } from './supabase';

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
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
 * Fetches the existing row first so we can add to it (Supabase upsert replaces, not increments).
 */
export async function upsertWeeklyStats(userId: string, delta: number): Promise<void> {
  const weekStart = getWeekStart();

  // Fetch existing count for this week
  const { data: existing, error: fetchError } = await supabase
    .from('weekly_stats')
    .select('cards_studied')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle();

  if (fetchError) {
    if (__DEV__) console.warn('[leaderboard] fetch error:', fetchError.message);
    throw fetchError;
  }

  const newCount = (existing?.cards_studied ?? 0) + delta;

  const { error } = await supabase.from('weekly_stats').upsert(
    { user_id: userId, week_start: weekStart, cards_studied: newCount, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,week_start' }
  );

  if (error) {
    if (__DEV__) console.warn('[leaderboard] upsert error:', error.message);
    throw error;
  }
}

/** Fetch top 25 entries worldwide for the current week (extra 5 so we can find user rank). */
export async function getWorldLeaderboard(): Promise<LeaderboardEntry[]> {
  const weekStart = getWeekStart();

  const { data, error } = await supabase
    .from('weekly_stats')
    .select('user_id, cards_studied, profiles!weekly_stats_user_id_fkey(display_name, country)')
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
    .select('user_id, cards_studied, profiles!weekly_stats_user_id_fkey!inner(display_name, country)')
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

// ─── Internal helpers ──────────────────────────────────────────────────────────

function firstWord(name?: string | null): string {
  if (!name) return '—';
  return name.trim().split(/\s+/)[0];
}

function mapEntries(rows: any[]): LeaderboardEntry[] {
  return rows.map((row, index) => ({
    userId: row.user_id,
    displayName: firstWord(row.profiles?.display_name),
    country: row.profiles?.country ?? null,
    cardsStudied: row.cards_studied,
    rank: index + 1,
  }));
}
