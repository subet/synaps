export type BadgeCriteria =
  | 'total_cards_reviewed'
  | 'streak_days'
  | 'longest_streak'
  | 'decks_created'
  | 'cards_mastered'
  | 'sessions_completed';

export type BadgeCategory = 'streak' | 'learning' | 'mastery' | 'explorer' | 'dedication';

export interface BadgeDefinition {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: string;
  category: BadgeCategory;
  color: string;
  criteria: BadgeCriteria;
  threshold: number;
}

export const BADGE_CATEGORY_COLORS: Record<BadgeCategory, string> = {
  streak: '#F6AD55',
  learning: '#4361EE',
  mastery: '#7C3AED',
  explorer: '#48BB78',
  dedication: '#EC4899',
};

export const ALL_BADGES: BadgeDefinition[] = [
  // ── Streak ──────────────────────────────────────────────────────────────────
  {
    id: 'badge-streak-1',
    nameKey: 'badge_streak_1_name',
    descriptionKey: 'badge_streak_1_desc',
    icon: '🔥',
    category: 'streak',
    color: BADGE_CATEGORY_COLORS.streak,
    criteria: 'streak_days',
    threshold: 1,
  },
  {
    id: 'badge-streak-7',
    nameKey: 'badge_streak_7_name',
    descriptionKey: 'badge_streak_7_desc',
    icon: '⚡',
    category: 'streak',
    color: BADGE_CATEGORY_COLORS.streak,
    criteria: 'streak_days',
    threshold: 7,
  },
  {
    id: 'badge-streak-30',
    nameKey: 'badge_streak_30_name',
    descriptionKey: 'badge_streak_30_desc',
    icon: '🌙',
    category: 'streak',
    color: BADGE_CATEGORY_COLORS.streak,
    criteria: 'streak_days',
    threshold: 30,
  },
  {
    id: 'badge-streak-100',
    nameKey: 'badge_streak_100_name',
    descriptionKey: 'badge_streak_100_desc',
    icon: '💎',
    category: 'streak',
    color: BADGE_CATEGORY_COLORS.streak,
    criteria: 'streak_days',
    threshold: 100,
  },

  // ── Learning (cards reviewed) ────────────────────────────────────────────────
  {
    id: 'badge-cards-1',
    nameKey: 'badge_cards_1_name',
    descriptionKey: 'badge_cards_1_desc',
    icon: '👣',
    category: 'learning',
    color: BADGE_CATEGORY_COLORS.learning,
    criteria: 'total_cards_reviewed',
    threshold: 1,
  },
  {
    id: 'badge-cards-50',
    nameKey: 'badge_cards_50_name',
    descriptionKey: 'badge_cards_50_desc',
    icon: '📖',
    category: 'learning',
    color: BADGE_CATEGORY_COLORS.learning,
    criteria: 'total_cards_reviewed',
    threshold: 50,
  },
  {
    id: 'badge-cards-500',
    nameKey: 'badge_cards_500_name',
    descriptionKey: 'badge_cards_500_desc',
    icon: '🧠',
    category: 'learning',
    color: BADGE_CATEGORY_COLORS.learning,
    criteria: 'total_cards_reviewed',
    threshold: 500,
  },
  {
    id: 'badge-cards-2000',
    nameKey: 'badge_cards_2000_name',
    descriptionKey: 'badge_cards_2000_desc',
    icon: '🎓',
    category: 'learning',
    color: BADGE_CATEGORY_COLORS.learning,
    criteria: 'total_cards_reviewed',
    threshold: 2000,
  },
  {
    id: 'badge-cards-10000',
    nameKey: 'badge_cards_10000_name',
    descriptionKey: 'badge_cards_10000_desc',
    icon: '⭐',
    category: 'learning',
    color: BADGE_CATEGORY_COLORS.learning,
    criteria: 'total_cards_reviewed',
    threshold: 10000,
  },

  // ── Mastery ──────────────────────────────────────────────────────────────────
  {
    id: 'badge-mastered-1',
    nameKey: 'badge_mastered_1_name',
    descriptionKey: 'badge_mastered_1_desc',
    icon: '🏅',
    category: 'mastery',
    color: BADGE_CATEGORY_COLORS.mastery,
    criteria: 'cards_mastered',
    threshold: 1,
  },
  {
    id: 'badge-mastered-50',
    nameKey: 'badge_mastered_50_name',
    descriptionKey: 'badge_mastered_50_desc',
    icon: '🥈',
    category: 'mastery',
    color: BADGE_CATEGORY_COLORS.mastery,
    criteria: 'cards_mastered',
    threshold: 50,
  },
  {
    id: 'badge-mastered-200',
    nameKey: 'badge_mastered_200_name',
    descriptionKey: 'badge_mastered_200_desc',
    icon: '🥇',
    category: 'mastery',
    color: BADGE_CATEGORY_COLORS.mastery,
    criteria: 'cards_mastered',
    threshold: 200,
  },
  {
    id: 'badge-mastered-1000',
    nameKey: 'badge_mastered_1000_name',
    descriptionKey: 'badge_mastered_1000_desc',
    icon: '👑',
    category: 'mastery',
    color: BADGE_CATEGORY_COLORS.mastery,
    criteria: 'cards_mastered',
    threshold: 1000,
  },

  // ── Explorer ─────────────────────────────────────────────────────────────────
  {
    id: 'badge-decks-1',
    nameKey: 'badge_decks_1_name',
    descriptionKey: 'badge_decks_1_desc',
    icon: '🗂️',
    category: 'explorer',
    color: BADGE_CATEGORY_COLORS.explorer,
    criteria: 'decks_created',
    threshold: 1,
  },
  {
    id: 'badge-decks-5',
    nameKey: 'badge_decks_5_name',
    descriptionKey: 'badge_decks_5_desc',
    icon: '📚',
    category: 'explorer',
    color: BADGE_CATEGORY_COLORS.explorer,
    criteria: 'decks_created',
    threshold: 5,
  },
  {
    id: 'badge-decks-10',
    nameKey: 'badge_decks_10_name',
    descriptionKey: 'badge_decks_10_desc',
    icon: '🏛️',
    category: 'explorer',
    color: BADGE_CATEGORY_COLORS.explorer,
    criteria: 'decks_created',
    threshold: 10,
  },

  // ── Dedication (sessions) ────────────────────────────────────────────────────
  {
    id: 'badge-sessions-1',
    nameKey: 'badge_sessions_1_name',
    descriptionKey: 'badge_sessions_1_desc',
    icon: '🎯',
    category: 'dedication',
    color: BADGE_CATEGORY_COLORS.dedication,
    criteria: 'sessions_completed',
    threshold: 1,
  },
  {
    id: 'badge-sessions-10',
    nameKey: 'badge_sessions_10_name',
    descriptionKey: 'badge_sessions_10_desc',
    icon: '💪',
    category: 'dedication',
    color: BADGE_CATEGORY_COLORS.dedication,
    criteria: 'sessions_completed',
    threshold: 10,
  },
  {
    id: 'badge-sessions-50',
    nameKey: 'badge_sessions_50_name',
    descriptionKey: 'badge_sessions_50_desc',
    icon: '🏆',
    category: 'dedication',
    color: BADGE_CATEGORY_COLORS.dedication,
    criteria: 'sessions_completed',
    threshold: 50,
  },
  {
    id: 'badge-sessions-100',
    nameKey: 'badge_sessions_100_name',
    descriptionKey: 'badge_sessions_100_desc',
    icon: '🌟',
    category: 'dedication',
    color: BADGE_CATEGORY_COLORS.dedication,
    criteria: 'sessions_completed',
    threshold: 100,
  },
];
