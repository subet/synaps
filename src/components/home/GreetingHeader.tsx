import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../constants';
import { useTranslation } from '../../i18n';
import { useAuthStore } from '../../stores/useAuthStore';
import { StreakDay } from '../../types';

interface Props {
  weekDays: StreakDay[];
}

export function GreetingHeader({ weekDays }: Props) {
  const { t } = useTranslation();
  const profile = useAuthStore((s) => s.profile);

  const hour = new Date().getHours();
  const salutation =
    hour < 12 ? t('good_morning') :
    hour < 17 ? t('good_afternoon') :
    hour < 21 ? t('good_evening') :
    t('good_night');

  const firstName = profile?.display_name?.split(' ')[0] ?? null;
  const title = firstName ? `${salutation}, ${firstName}.` : `${salutation}.`;

  const today = weekDays[weekDays.length - 1]?.cards_studied ?? 0;
  const yesterday = weekDays[weekDays.length - 2]?.cards_studied ?? 0;

  const description =
    today === 0
      ? t('greeting_not_studied')
      : today > yesterday && yesterday > 0
      ? t('greeting_great_day')
      : t('greeting_studied');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: colors.textSecondary,
  },
});
