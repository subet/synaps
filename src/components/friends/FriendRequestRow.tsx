import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { useTranslation } from '../../i18n';
import { countryToFlag } from '../../services/leaderboard';
import type { FriendRequest } from '../../types';

interface Props {
  request: FriendRequest;
  onAccept?: (request: FriendRequest) => void;
  onDecline?: (request: FriendRequest) => void;
  onCancel?: (request: FriendRequest) => void;
  isSent?: boolean;
  isLoading?: boolean;
}

export function FriendRequestRow({
  request,
  onAccept,
  onDecline,
  onCancel,
  isSent = false,
  isLoading = false,
}: Props) {
  const { t } = useTranslation();
  const timeAgo = formatTimeAgo(request.createdAt, t);

  return (
    <View style={styles.row}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarInitial}>
          {(request.fromDisplayName?.[0] ?? '?').toUpperCase()}
        </Text>
      </View>

      {/* Name + meta */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {request.fromDisplayName}
          </Text>
          {request.fromCountry ? (
            <Text style={styles.flag}>{countryToFlag(request.fromCountry)}</Text>
          ) : null}
        </View>
        <Text style={styles.time}>{timeAgo}</Text>
      </View>

      {/* Actions */}
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : isSent ? (
        <Pressable style={styles.cancelBtn} onPress={() => onCancel?.(request)}>
          <Text style={styles.cancelText}>{t('cancel')}</Text>
        </Pressable>
      ) : (
        <View style={styles.actions}>
          <Pressable style={styles.declineBtn} onPress={() => onDecline?.(request)}>
            <Text style={styles.declineText}>{t('friend_decline')}</Text>
          </Pressable>
          <Pressable style={styles.acceptBtn} onPress={() => onAccept?.(request)}>
            <Text style={styles.acceptText}>{t('friend_accept')}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function formatTimeAgo(isoString: string, t: (key: string, options?: Record<string, string | number>) => string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return t('time_ago_minutes', { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('time_ago_hours', { n: hours });
  const days = Math.floor(hours / 24);
  return t('time_ago_days', { n: days });
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.sm,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  avatarInitial: {
    ...typography.bodyBold,
    color: colors.primary,
    fontWeight: '700',
  },

  info: {
    flex: 1,
    marginRight: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  flag: {
    fontSize: 14,
    lineHeight: 18,
  },
  time: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: 2,
  },

  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  acceptBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  acceptText: {
    ...typography.captionBold,
    color: colors.white,
  },
  declineBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  declineText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  cancelText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
});
