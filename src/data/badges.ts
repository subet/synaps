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
  name: string;
  description: string;
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
    name: 'First Flame',
    description: 'Study for 1 day in a row',
    icon: '🔥',
    category: 'streak',
    color: BADGE_CATEGORY_COLORS.streak,
    criteria: 'streak_days',
    threshold: 1,
  },
  {
    id: 'badge-streak-7',
    name: 'Week Warrior',
    description: 'Study for 7 days in a row',
    icon: '⚡',
    category: 'streak',
    color: BADGE_CATEGORY_COLORS.streak,
    criteria: 'streak_days',
    threshold: 7,
  },
  {
    id: 'badge-streak-30',
    name: 'Monthly Master',
    description: 'Study for 30 days in a row',
    icon: '🌙',
    category: 'streak',
    color: BADGE_CATEGORY_COLORS.streak,
    criteria: 'streak_days',
    threshold: 30,
  },
  {
    id: 'badge-streak-100',
    name: 'Century Streak',
    description: 'Study for 100 days in a row',
    icon: '💎',
    category: 'streak',
    color: BADGE_CATEGORY_COLORS.streak,
    criteria: 'streak_days',
    threshold: 100,
  },

  // ── Learning (cards reviewed) ────────────────────────────────────────────────
  {
    id: 'badge-cards-1',
    name: 'First Step',
    description: 'Review your first card',
    icon: '👣',
    category: 'learning',
    color: BADGE_CATEGORY_COLORS.learning,
    criteria: 'total_cards_reviewed',
    threshold: 1,
  },
  {
    id: 'badge-cards-50',
    name: 'Getting Started',
    description: 'Review 50 cards total',
    icon: '📖',
    category: 'learning',
    color: BADGE_CATEGORY_COLORS.learning,
    criteria: 'total_cards_reviewed',
    threshold: 50,
  },
  {
    id: 'badge-cards-500',
    name: 'Dedicated Learner',
    description: 'Review 500 cards total',
    icon: '🧠',
    category: 'learning',
    color: BADGE_CATEGORY_COLORS.learning,
    criteria: 'total_cards_reviewed',
    threshold: 500,
  },
  {
    id: 'badge-cards-2000',
    name: 'Scholar',
    description: 'Review 2,000 cards total',
    icon: '🎓',
    category: 'learning',
    color: BADGE_CATEGORY_COLORS.learning,
    criteria: 'total_cards_reviewed',
    threshold: 2000,
  },
  {
    id: 'badge-cards-10000',
    name: 'Legendary',
    description: 'Review 10,000 cards total',
    icon: '⭐',
    category: 'learning',
    color: BADGE_CATEGORY_COLORS.learning,
    criteria: 'total_cards_reviewed',
    threshold: 10000,
  },

  // ── Mastery ──────────────────────────────────────────────────────────────────
  {
    id: 'badge-mastered-1',
    name: 'First Mastery',
    description: 'Master your first card',
    icon: '🏅',
    category: 'mastery',
    color: BADGE_CATEGORY_COLORS.mastery,
    criteria: 'cards_mastered',
    threshold: 1,
  },
  {
    id: 'badge-mastered-50',
    name: 'Rising Expert',
    description: 'Master 50 cards',
    icon: '🥈',
    category: 'mastery',
    color: BADGE_CATEGORY_COLORS.mastery,
    criteria: 'cards_mastered',
    threshold: 50,
  },
  {
    id: 'badge-mastered-200',
    name: 'Expert',
    description: 'Master 200 cards',
    icon: '🥇',
    category: 'mastery',
    color: BADGE_CATEGORY_COLORS.mastery,
    criteria: 'cards_mastered',
    threshold: 200,
  },
  {
    id: 'badge-mastered-1000',
    name: 'Grand Master',
    description: 'Master 1,000 cards',
    icon: '👑',
    category: 'mastery',
    color: BADGE_CATEGORY_COLORS.mastery,
    criteria: 'cards_mastered',
    threshold: 1000,
  },

  // ── Explorer ─────────────────────────────────────────────────────────────────
  {
    id: 'badge-decks-1',
    name: 'Deck Builder',
    description: 'Create your first deck',
    icon: '🗂️',
    category: 'explorer',
    color: BADGE_CATEGORY_COLORS.explorer,
    criteria: 'decks_created',
    threshold: 1,
  },
  {
    id: 'badge-decks-5',
    name: 'Collector',
    description: 'Create or download 5 decks',
    icon: '📚',
    category: 'explorer',
    color: BADGE_CATEGORY_COLORS.explorer,
    criteria: 'decks_created',
    threshold: 5,
  },
  {
    id: 'badge-decks-10',
    name: 'Librarian',
    description: 'Create or download 10 decks',
    icon: '🏛️',
    category: 'explorer',
    color: BADGE_CATEGORY_COLORS.explorer,
    criteria: 'decks_created',
    threshold: 10,
  },

  // ── Dedication (sessions) ────────────────────────────────────────────────────
  {
    id: 'badge-sessions-1',
    name: 'First Session',
    description: 'Complete your first study session',
    icon: '🎯',
    category: 'dedication',
    color: BADGE_CATEGORY_COLORS.dedication,
    criteria: 'sessions_completed',
    threshold: 1,
  },
  {
    id: 'badge-sessions-10',
    name: 'Consistent',
    description: 'Complete 10 study sessions',
    icon: '💪',
    category: 'dedication',
    color: BADGE_CATEGORY_COLORS.dedication,
    criteria: 'sessions_completed',
    threshold: 10,
  },
  {
    id: 'badge-sessions-50',
    name: 'Veteran',
    description: 'Complete 50 study sessions',
    icon: '🏆',
    category: 'dedication',
    color: BADGE_CATEGORY_COLORS.dedication,
    criteria: 'sessions_completed',
    threshold: 50,
  },
  {
    id: 'badge-sessions-100',
    name: 'Elite',
    description: 'Complete 100 study sessions',
    icon: '🌟',
    category: 'dedication',
    color: BADGE_CATEGORY_COLORS.dedication,
    criteria: 'sessions_completed',
    threshold: 100,
  },
];
