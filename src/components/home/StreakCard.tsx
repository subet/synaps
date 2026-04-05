import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { useTranslation } from '../../i18n';
import { useAppStore } from '../../stores/useAppStore';
import { StreakDay } from '../../types';
import { StreakFire } from './StreakFire';

interface StreakCardProps {
  currentStreak: number;
  weekDays: StreakDay[];
}

const BAR_MAX_HEIGHT = 80;
const BAR_MIN_HEIGHT = 14;
const BAR_WIDTH = 32;

const LANG_LOCALE: Record<string, string> = {
  en: 'en-US', tr: 'tr-TR', de: 'de-DE', fr: 'fr-FR',
  nl: 'nl-NL', ru: 'ru-RU', zh: 'zh-CN', pt_BR: 'pt-BR', pt_PT: 'pt-PT',
};

export function StreakCard({ currentStreak, weekDays }: StreakCardProps) {
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);
  const locale = LANG_LOCALE[language] ?? 'en-US';
  const today = new Date().toISOString().split('T')[0];

  const maxCards = Math.max(...weekDays.map((d) => d.cards_studied), 1);

  return (
    <View style={styles.card}>
      {/* Section label */}
      <Text style={styles.sectionLabel}>{t('daily_momentum')}</Text>

      {/* Streak number + fire */}
      <View style={styles.streakRowOuter}>
        <View style={styles.streakRowLeft}>
          <View style={styles.streakRow}>
            <Text style={styles.streakNumber}>{currentStreak}</Text>
            <Text style={styles.streakSuffix}>
              {' '}{currentStreak === 1 ? t('day_streak') : t('days_streak')}
            </Text>
          </View>
          <Text style={styles.motivation}>{t('streak_motivation')}</Text>
        </View>
        <View style={{ marginTop: -12 }}>
          <StreakFire streak={currentStreak} />
        </View>
      </View>

      {/* Bar chart */}
      <View style={styles.chartArea}>
        {weekDays.map((dayData, idx) => {
          const isToday = dayData.date === today;
          const hasStudied = dayData.cards_studied > 0;
          const barHeight = hasStudied
            ? Math.max(BAR_MIN_HEIGHT + 12, (dayData.cards_studied / maxCards) * BAR_MAX_HEIGHT)
            : BAR_MIN_HEIGHT;

          const barColor = isToday && hasStudied
            ? colors.primary
            : hasStudied
              ? '#7B8EEF'
              : '#DDE2F9';

          // Get locale-aware 3-letter day abbreviation
          const dateObj = new Date(dayData.date + 'T12:00:00Z');
          const dayLabel = new Intl.DateTimeFormat(locale, { weekday: 'short' })
            .format(dateObj)
            .toUpperCase()
            .slice(0, 3);

          return (
            <View key={idx} style={styles.barColumn}>
              <Text style={[styles.barCount, isToday && styles.barCountToday, !hasStudied && styles.barCountHidden]}>
                {hasStudied ? dayData.cards_studied : ' '}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    { height: barHeight, backgroundColor: barColor },
                  ]}
                />
              </View>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                {dayLabel}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  streakRowOuter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  streakRowLeft: {
    flex: 1,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.xs,
  },
  streakNumber: {
    fontSize: 52,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 56,
  },
  streakSuffix: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 6,
    marginLeft: 4,
  },
  motivation: {
    ...typography.body,
    color: colors.textSecondary,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barColumn: {
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  barTrack: {
    height: BAR_MAX_HEIGHT,
    justifyContent: 'flex-end',
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: BAR_WIDTH / 2,
  },
  barCount: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7B8EEF',
    marginBottom: 2,
  },
  barCountToday: {
    color: colors.primary,
  },
  barCountHidden: {
    opacity: 0,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  dayLabelToday: {
    color: colors.primary,
    fontWeight: '700',
  },
});
