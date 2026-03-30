import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BadgeItem } from '../src/components/badges/BadgeItem';
import { borderRadius, colors, spacing, typography } from '../src/constants';
import { useTranslation } from '../src/i18n';
import { useBadgeStore } from '../src/stores/useBadgeStore';
import { BadgeWithStatus } from '../src/services/badgeService';

export default function BadgesScreen() {
  const { t } = useTranslation();
  const { badges, loadBadges } = useBadgeStore();

  useEffect(() => {
    loadBadges();
  }, []);

  const achieved = badges.filter((b) => b.achieved);
  const inProgress = badges.filter((b) => !b.achieved && b.progress > 0);
  const locked = badges.filter((b) => !b.achieved && b.progress === 0);

  const sections = [
    ...(achieved.length > 0 ? [{ title: `${t('achieved')} · ${achieved.length}`, data: achieved }] : []),
    ...(inProgress.length > 0 ? [{ title: t('in_progress'), data: inProgress }] : []),
    ...(locked.length > 0 ? [{ title: t('locked'), data: locked }] : []),
  ];

  const renderItem = ({ item }: { item: BadgeWithStatus }) => (
    <BadgeRow badge={item} />
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
        <Text style={styles.title}>{t('achievements')}</Text>
        <View style={styles.backBtn} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}

function BadgeRow({ badge }: { badge: BadgeWithStatus }) {
  const { t } = useTranslation();
  const { achieved, progress, color, currentValue, threshold } = badge;

  return (
    <View style={[styles.row, achieved && styles.rowAchieved]}>
      <View style={[styles.iconCircle, { backgroundColor: `${color}${achieved ? '22' : '10'}`, borderColor: achieved ? color : colors.border }]}>
        <Text style={{ fontSize: 26, opacity: achieved ? 1 : 0.4 }}>{badge.icon}</Text>
      </View>

      <View style={styles.rowInfo}>
        <Text style={[styles.badgeName, { color: achieved ? colors.textPrimary : colors.textMuted }]}>
          {t(badge.nameKey)}
        </Text>
        <Text style={styles.badgeDesc}>{t(badge.descriptionKey)}</Text>

        {!achieved && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { flex: progress, backgroundColor: color }]} />
            <View style={[styles.progressEmpty, { flex: 1 - progress }]} />
          </View>
        )}
      </View>

      <View style={styles.rowRight}>
        {achieved ? (
          <View style={[styles.achievedBadge, { backgroundColor: `${color}22` }]}>
            <Ionicons name="checkmark" size={16} color={color} />
          </View>
        ) : (
          <Text style={styles.progressLabel}>
            {currentValue}/{threshold}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: { width: 38, padding: spacing.sm },
  title: { ...typography.h2, color: colors.textPrimary, flex: 1, textAlign: 'center' },
  list: { paddingHorizontal: spacing.md, paddingBottom: 40 },
  sectionHeader: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  rowAchieved: {
    borderColor: colors.border,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  rowInfo: { flex: 1, gap: 2 },
  badgeName: { ...typography.bodyBold },
  badgeDesc: { ...typography.caption, color: colors.textSecondary },
  progressBar: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 6,
    backgroundColor: colors.borderLight,
  },
  progressFill: { borderRadius: 2 },
  progressEmpty: {},
  rowRight: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  achievedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressLabel: {
    ...typography.small,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
