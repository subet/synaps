export const colors = {
  // Primary
  primary: '#4361EE',
  primaryLight: '#E8EDFF',
  primaryDark: '#3451DE',

  // Backgrounds
  background: '#F0F4F8',
  surface: '#FFFFFF',
  surfaceAlt: '#F8F9FC',

  // Text
  textPrimary: '#1A1D2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  // SRS Rating Colors
  again: '#FFE0E0',
  againText: '#E53E3E',
  hard: '#FFF3CD',
  hardText: '#D69E2E',
  good: '#E8F5E9',
  goodText: '#38A169',
  easy: '#E0F2FE',
  easyText: '#3182CE',

  // Card Status
  notStudied: '#D1D5DB',
  learning: '#48BB78',
  mastered: '#4361EE',

  // Category Backgrounds
  languageBg: '#E8EDFF',
  medicalBg: '#FFE8EC',
  scienceBg: '#E8FFE8',
  historyBg: '#FFF8E8',
  mathBg: '#F3E8FF',
  techBg: '#E8F4FF',

  // Streak
  streakGold: '#F6AD55',
  streakText: '#ED8936',

  // Misc
  danger: '#E53E3E',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Shadows
  shadowColor: '#000000',
} as const;

export type ColorKey = keyof typeof colors;
