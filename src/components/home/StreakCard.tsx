import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { StreakDay } from '../../types';

interface StreakCardProps {
  currentStreak: number;
  weekDays: StreakDay[];
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function StreakCard({ currentStreak, weekDays }: StreakCardProps) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>
            {currentStreak === 1 ? 'day streak' : 'days streak'}
          </Text>
        </View>
        <Text style={styles.trophy}>🏆</Text>
      </View>

      <View style={styles.weekRow}>
        {DAY_LABELS.map((day, idx) => {
          const dayData = weekDays[idx];
          const isToday = dayData?.date === today;
          const hasStudied = dayData && dayData.cards_studied > 0;

          return (
            <View key={idx} style={styles.dayColumn}>
              <Text style={styles.dayLabel}>{day}</Text>
              <StreakCircle
                hasStudied={hasStudied}
                isToday={isToday}
                streakPosition={idx / Math.max(weekDays.length - 1, 1)}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

interface StreakCircleProps {
  hasStudied: boolean;
  isToday: boolean;
  streakPosition: number;
}

function StreakCircle({ hasStudied, isToday, streakPosition }: StreakCircleProps) {
  if (hasStudied) {
    const opacity = 0.5 + streakPosition * 0.5;
    return (
      <View
        style={[
          styles.circle,
          { backgroundColor: colors.streakGold, opacity },
        ]}
      />
    );
  }
  if (isToday) {
    return <View style={[styles.circle, styles.circleToday]} />;
  }
  return <View style={[styles.circle, styles.circleEmpty]} />;
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
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  streakNumber: {
    ...typography.streakNumber,
    color: colors.streakText,
  },
  streakLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  trophy: {
    fontSize: 32,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  dayLabel: {
    ...typography.small,
    color: colors.textMuted,
    fontWeight: '600',
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  circleToday: {
    backgroundColor: colors.transparent,
    borderWidth: 2,
    borderColor: colors.streakGold,
  },
  circleEmpty: {
    backgroundColor: colors.borderLight,
  },
});
