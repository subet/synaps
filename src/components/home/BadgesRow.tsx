import React, { useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { useTranslation } from '../../i18n';
import { useBadgeStore } from '../../stores/useBadgeStore';
import { BadgeWithStatus } from '../../services/badgeService';

function SmallBadgeCircle({ badge }: { badge: BadgeWithStatus }) {
  const { achieved, color } = badge;
  const bgColor = achieved ? `${color}22` : '#F0F2FF';

  return (
    <View style={styles.badgeWrap}>
      <View style={[styles.circle, { backgroundColor: bgColor }]}>
        <Text style={{ fontSize: 22, opacity: achieved ? 1 : 0.25 }}>{badge.icon}</Text>
      </View>
    </View>
  );
}

export function BadgesRow() {
  const { t } = useTranslation();
  const { badges, loadBadges } = useBadgeStore();

  useEffect(() => {
    loadBadges();
  }, []);

  const achieved = badges.filter((b) => b.achieved);
  const inProgress = badges.filter((b) => !b.achieved && b.progress > 0);
  const locked = badges.filter((b) => !b.achieved && b.progress === 0).slice(0, 3);
  const displayed = [...achieved, ...inProgress, ...locked].slice(0, 10);

  if (badges.length === 0) return null;

  const unlockedCount = achieved.length;

  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.header}>
        <Text style={styles.sectionLabel}>{t('achievements')}</Text>
        <Pressable style={styles.seeAll} onPress={() => router.push('/badges')}>
          <Text style={styles.unlockedCount}>
            {t('unlocked_count', { count: unlockedCount })}
          </Text>
          <Ionicons name="chevron-forward" size={13} color={colors.primary} />
        </Pressable>
      </View>

      {/* Badge circles */}
      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <SmallBadgeCircle badge={item} />}
      />
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
  unlockedCount: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  list: {
    gap: spacing.sm,
  },
  badgeWrap: {
    alignItems: 'center',
  },
  circle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
