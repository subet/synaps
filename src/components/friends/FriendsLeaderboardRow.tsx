import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { useTranslation } from '../../i18n';
import { countryToFlag } from '../../services/leaderboard';
import type { FriendsLeaderboardEntry } from '../../types';

const MEDAL_COLORS = ['#F59E0B', '#9CA3AF', '#CD7F32'] as const;

interface Props {
  entry: FriendsLeaderboardEntry;
}

export function FriendsLeaderboardRow({ entry }: Props) {
  const { t } = useTranslation();
  const medalColor = entry.rank <= 3 ? MEDAL_COLORS[entry.rank - 1] : null;

  return (
    <View style={[styles.row, entry.isMe && styles.rowMe]}>
      {/* Rank */}
      <View style={[styles.rankBox, medalColor ? { backgroundColor: medalColor + '22' } : null]}>
        <Text style={[styles.rankText, medalColor ? { color: medalColor } : null]}>
          #{entry.rank}
        </Text>
      </View>

      {/* Avatar */}
      <View style={[styles.avatar, entry.isMe && styles.avatarMe]}>
        <Text style={styles.avatarInitial}>
          {(entry.displayName?.[0] ?? '?').toUpperCase()}
        </Text>
      </View>

      {/* Name + meta */}
      <View style={styles.nameBox}>
        <View style={styles.nameRow}>
          <Text
            style={[styles.nameText, entry.isMe && styles.nameTextMe]}
            numberOfLines={1}
          >
            {entry.displayName}
            {entry.isMe ? `  ${t('leaderboard_you')}` : ''}
          </Text>
          {entry.country ? (
            <Text style={styles.flag}>{countryToFlag(entry.country)}</Text>
          ) : null}
        </View>
        <StudyDaysIndicator days={entry.studyDays} />
      </View>

      {/* Score */}
      <View style={styles.scoreBox}>
        <Text style={[styles.scoreText, entry.isMe && styles.scoreTextMe]}>
          {entry.friendScore}
        </Text>
        <Text style={styles.scorePts}>{t('friends_pts')}</Text>
      </View>
    </View>
  );
}

function StudyDaysIndicator({ days }: { days: number }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: 7 }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i < days && styles.dotActive]}
        />
      ))}
    </View>
  );
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
  rowMe: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },

  rankBox: {
    width: 40,
    height: 34,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    marginRight: spacing.sm,
  },
  rankText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  avatarMe: {
    backgroundColor: colors.primary,
  },
  avatarInitial: {
    ...typography.captionBold,
    color: colors.primary,
    fontWeight: '700',
  },

  nameBox: {
    flex: 1,
    marginRight: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  nameText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  nameTextMe: {
    color: colors.primary,
  },
  flag: {
    fontSize: 14,
    lineHeight: 18,
  },

  dotsRow: {
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },

  scoreBox: {
    alignItems: 'flex-end',
  },
  scoreText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 18,
    lineHeight: 22,
  },
  scoreTextMe: {
    color: colors.primary,
  },
  scorePts: {
    ...typography.small,
    color: colors.textMuted,
  },
});
