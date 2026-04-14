export type CardStatus = 'new' | 'learning' | 'review' | 'mastered';

export type Language = 'en' | 'es' | 'it' | 'tr' | 'de' | 'fr' | 'nl' | 'ru' | 'zh' | 'pt_BR' | 'pt_PT';

/** Sparse map of locale → translated string. English is stored as the canonical `front`/`back` fallback. */
export type TranslationMap = Partial<Record<Language, string>>;

export interface Deck {
  id: string;
  name: string;
  description?: string;
  parent_deck_id?: string;
  icon?: string;
  color?: string;
  new_cards_per_day: number;
  shuffle_cards: boolean;
  auto_play_audio: boolean;
  reverse_cards: boolean;
  is_public_download: boolean;
  source_id?: string;
  supported_languages?: Language[] | null;
  name_translations?: TranslationMap | null;
  description_translations?: TranslationMap | null;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  front_translations?: TranslationMap | null;
  back_translations?: TranslationMap | null;
  front_image?: string;
  back_image?: string;
  audio_url?: string;
  tags?: string;
  status: CardStatus;
  ease_factor: number;
  interval: number;
  repetitions: number;
  due_date?: string;
  last_reviewed?: string;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  deck_id: string;
  cards_studied: number;
  cards_correct: number;
  duration_seconds: number;
  started_at: string;
  completed_at?: string;
}

export interface StreakDay {
  id: string;
  date: string;
  cards_studied: number;
}

export interface PublicDeck {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  language?: string;
  icon_url?: string;
  card_count: number;
  download_count: number;
  is_editors_choice: boolean;
  is_featured: boolean;
  supported_languages?: Language[];
  name_translations?: TranslationMap;
  description_translations?: TranslationMap;
  created_at: string;
}

export interface PublicCard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  front_translations?: TranslationMap;
  back_translations?: TranslationMap;
  audio_url?: string;
  sort_order: number;
}

export interface UserProfile {
  id: string;
  display_name?: string;
  avatar_url?: string;
  is_pro: boolean;
  streak_count: number;
  longest_streak: number;
  total_cards_studied: number;
  country?: string;
  created_at: string;
}

export type SRSGrade = 0 | 1 | 2 | 3;

export interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  status: CardStatus;
  dueDate: Date;
}

export interface DeckStats {
  total: number;
  notStudied: number;
  learning: number;
  mastered: number;
  dueToday: number;
}

export interface StudySessionResult {
  cardsStudied: number;
  cardsCorrect: number;
  durationSeconds: number;
  gradeDistribution: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
}

export interface NotificationSettings {
  enabled: boolean;
  time: string; // HH:MM format
  weeklyRecap: boolean;
}

export interface AppSettings {
  language: Language;
  notifications: NotificationSettings;
  hasSeenOnboarding: boolean;
  freeDownloadsUsed: number;
  hapticsEnabled: boolean;
}

// ─── Friends system ───────────────────────────────────────────────────────────

export type FriendPrivacy = 'everyone' | 'invite_only' | 'nobody';
export type FriendRequestStatus = 'pending' | 'declined';
export type FriendshipRelation =
  | 'none'
  | 'pending_sent'
  | 'pending_received'
  | 'friends'
  | 'blocked';

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromDisplayName: string;
  fromAvatarUrl: string | null;
  fromCountry: string | null;
  status: FriendRequestStatus;
  createdAt: string;
}

export interface FriendsLeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  country: string | null;
  friendScore: number;
  cardsStudied: number;
  studyDays: number;
  accuracy: number; // 0–1
  rank: number;
  isMe: boolean;
}

/**
 * Payload passed from the study store to upsertWeeklyStats on every card grade.
 * Used to compute the friend leaderboard score delta.
 */
export interface FriendScoreDelta {
  wasCorrect: boolean;
  /** Number of cards reviewed today BEFORE this review (from local SQLite). */
  reviewsToday: number;
  /** True when this card review completes the user's daily goal. */
  dailyGoalCompleted: boolean;
  /** True on the first review of the day when the user has an active streak. */
  streakBonusEarned: boolean;
  /** True when a deck milestone (e.g. 100 % mastered) was just hit. */
  deckMilestone: boolean;
  /** True when this is the first card studied today (used to increment study_days). */
  isFirstStudyToday: boolean;
}

export interface InviteCodeLookupResult {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
}
