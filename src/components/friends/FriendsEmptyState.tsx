import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { useTranslation } from '../../i18n';
import { Button } from '../ui/Button';

interface Props {
  onInvite: () => void;
}

export function FriendsEmptyState({ onInvite }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="people-outline" size={44} color={colors.primary} />
      </View>
      <Text style={styles.title}>{t('friends_empty_title')}</Text>
      <Text style={styles.body}>{t('friends_empty_body')}</Text>
      <View style={styles.pillRow}>
        <Pill icon="lock-closed-outline" label={t('friends_pill_private')} />
        <Pill icon="calendar-outline" label={t('friends_pill_weekly')} />
        <Pill icon="trophy-outline" label={t('friends_pill_score_based')} />
      </View>
      <Button label={t('friends_invite_friends')} onPress={onInvite} style={styles.btn} />
    </View>
  );
}

function Pill({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }) {
  return (
    <View style={styles.pill}>
      <Ionicons name={icon} size={13} color={colors.primary} />
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.full ?? 100,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
  },
  pillText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  btn: { minWidth: 180 },
});
