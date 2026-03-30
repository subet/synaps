import React, { useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { useBadgeStore } from '../../stores/useBadgeStore';
import { BadgeWithStatus } from '../../services/badgeService';

function SmallBadgeCircle({ badge }: { badge: BadgeWithStatus }) {
  const { achieved, progress, color } = badge;
  const bgColor = achieved ? `${color}22` : '#F3F4F6';
  const borderColor = achieved ? color : colors.border;

  return (
    <View style={styles.badgeWrap}>
      <View style={[styles.circle, { backgroundColor: bgColor, borderColor }]}>
        <Text style={{ fontSize: 20, opacity: achieved ? 1 : 0.3 }}>{badge.icon}</Text>
        {!achieved && progress > 0 && (
          <View style={[styles.progressArc, { borderColor: color }]} />
        )}
        {!achieved && progress === 0 && (
          <View style={styles.lockDot}>
            <Ionicons name="lock-closed" size={8} color={colors.textMuted} />
          </View>
        )}
      </View>
      <Text style={[styles.badgeName, { color: achieved ? colors.textPrimary : colors.textMuted }]} numberOfLines={1}>
        {badge.name}
      </Text>
    </View>
  );
}

export function BadgesRow() {
  const { badges, loadBadges } = useBadgeStore();

  useEffect(() => {
    loadBadges();
  }, []);

  // Show: all achieved + next in-progress badge per criteria group + up to 10 total
  const achieved = badges.filter((b) => b.achieved);
  const inProgress = badges.filter((b) => !b.achieved && b.progress > 0);
  const locked = badges.filter((b) => !b.achieved && b.progress === 0).slice(0, 3);
  const displayed = [...achieved, ...inProgress, ...locked].slice(0, 10);

  if (badges.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
        <Pressable style={styles.seeAll} onPress={() => router.push('/badges')}>
          <Text style={styles.seeAllText}>See all</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </Pressable>
      </View>

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
  wrapper: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
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
  list: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  badgeWrap: {
    alignItems: 'center',
    width: 60,
    gap: 4,
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  progressArc: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 27,
    borderWidth: 2,
    borderStyle: 'dashed',
    opacity: 0.6,
  },
  lockDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  badgeName: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
});
