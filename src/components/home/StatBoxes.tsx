import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { useTranslation } from '../../i18n';

interface StatBoxesProps {
  cardsMastered: number;
  avgDailyFocusMinutes: number;
}

export function StatBoxes({ cardsMastered, avgDailyFocusMinutes }: StatBoxesProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      <View style={[styles.box, styles.boxLeft]}>
        <Text style={styles.value}>{cardsMastered}</Text>
        <Text style={styles.label}>{t('cards_mastered_label')}</Text>
      </View>
      <View style={[styles.box, styles.boxRight]}>
        <Text style={styles.value}>{avgDailyFocusMinutes}<Text style={styles.unit}> min</Text></Text>
        <Text style={styles.label}>{t('avg_daily_focus')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  box: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  boxLeft: {},
  boxRight: {},
  value: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 40,
    marginBottom: 4,
  },
  unit: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
