import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { useTranslation } from '../../i18n';
import { useAuthStore } from '../../stores/useAuthStore';
import { countryToFlag, getMyRank } from '../../services/leaderboard';

export function LeaderboardRow() {
  const { t } = useTranslation();
  const { user, profile } = useAuthStore();

  const [worldRank, setWorldRank] = useState<number>(0);
  const [countryRank, setCountryRank] = useState<number | null>(null);
  const [cardsStudied, setCardsStudied] = useState<number>(0);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      getMyRank(user.id, profile?.country ?? undefined)
        .then(({ worldRank: wr, countryRank: cr, cardsStudied: cs }) => {
          setWorldRank(wr);
          setCountryRank(cr);
          setCardsStudied(cs);
        })
        .catch(() => {})
        .finally(() => setLoaded(true));
    }, [user?.id, profile?.country])
  );

  if (!user) return null;

  return (
    <Pressable style={styles.card} onPress={() => router.push('/(tabs)/leaderboard')}>
      {/* Header row */}
      <View style={styles.header}>
        <Text style={styles.sectionLabel}>{t('leaderboard')}</Text>
        <View style={styles.seeAll}>
          <Text style={styles.seeAllText}>{t('see_all')}</Text>
          <Ionicons name="chevron-forward" size={13} color={colors.primary} />
        </View>
      </View>

      {/* Rank content */}
      {!loaded ? (
        <View style={styles.skeleton} />
      ) : cardsStudied === 0 ? (
        <Text style={styles.noRankText}>{t('leaderboard_no_rank')}</Text>
      ) : (
        <View style={styles.rankRow}>
          <WorldChip label={t('leaderboard_world')} rank={worldRank} />
          {countryRank !== null && profile?.country ? (
            <RankChip
              icon={countryToFlag(profile.country)}
              label={t('leaderboard_country')}
              rank={countryRank}
            />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

function WorldChip({ label, rank }: { label: string; rank: number }) {
  return (
    <View style={styles.chip}>
      <Ionicons name="globe-outline" size={22} color={colors.primary} />
      <View>
        <Text style={styles.chipLabel}>{label}</Text>
        <Text style={styles.chipRank}>#{rank}</Text>
      </View>
    </View>
  );
}

function RankChip({ icon, label, rank }: { icon: string; label: string; rank: number }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipIcon}>{icon}</Text>
      <View>
        <Text style={styles.chipLabel}>{label}</Text>
        <Text style={styles.chipRank}>#{rank}</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.primary,
    flex: 1,
    textTransform: 'uppercase',
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  skeleton: {
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.borderLight,
  },
  noRankText: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  rankRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flex: 1,
  },
  chipIcon: { fontSize: 22, lineHeight: 28 },
  chipLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },
  chipRank: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});
