import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../../src/constants';
import { useTranslation } from '../../src/i18n';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useFriendsStore } from '../../src/stores/useFriendsStore';
import { tap } from '../../src/utils/haptics';
import {
  countryToFlag,
  getCountryLeaderboard,
  getWorldLeaderboard,
  LeaderboardEntry,
} from '../../src/services/leaderboard';
import { FriendsTab } from '../../src/components/leaderboard/FriendsTab';
import { Button } from '../../src/components/ui/Button';

type Tab = 'country' | 'world' | 'friends';

const MEDAL_COLORS = ['#F59E0B', '#9CA3AF', '#CD7F32'] as const;

export default function LeaderboardScreen() {
  const { t } = useTranslation();
  const { user, profile } = useAuthStore();
  const { pendingRequestCount } = useFriendsStore();
  const hasCountry = !!profile?.country;

  const [activeTab, setActiveTab] = useState<Tab>(hasCountry ? 'country' : 'world');
  const [worldEntries, setWorldEntries] = useState<LeaderboardEntry[]>([]);
  const [countryEntries, setCountryEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [world, country] = await Promise.all([
        getWorldLeaderboard(),
        hasCountry ? getCountryLeaderboard(profile!.country!) : Promise.resolve([]),
      ]);
      setWorldEntries(world);
      setCountryEntries(country);
    } catch {
      // silently fail — stale data is fine
    }
  }, [hasCountry, profile?.country]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const entries = activeTab === 'world' ? worldEntries : countryEntries;
  const showFlag = activeTab === 'world';

  // Find current user in list
  const userEntry = entries.find((e) => e.userId === user?.id);
  const userInTop20 = userEntry ? userEntry.rank <= 20 : false;
  const top20 = entries.slice(0, 20);

  // Tabs to render: always show World + Friends; Country only if user has set a country
  const tabs: Tab[] = hasCountry ? ['country', 'world', 'friends'] : ['world', 'friends'];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} onPressIn={tap}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{t('leaderboard')}</Text>
          <Text style={styles.subtitle}>{t('leaderboard_week_resets')}</Text>
        </View>
        {/* Always render same-size right slot to prevent layout shift between tabs */}
        <Pressable
          style={styles.headerRight}
          onPress={() => { tap(); router.push('/friends'); }}
          disabled={activeTab !== 'friends'}
        >
          <Ionicons
            name="people-outline"
            size={20}
            color={activeTab === 'friends' ? colors.primary : colors.transparent}
          />
          {activeTab === 'friends' && pendingRequestCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {pendingRequestCount > 9 ? '9+' : pendingRequestCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              onPress={() => { tap(); setActiveTab(tab); }}
            >
              <View style={styles.tabBtnInner}>
                {tab === 'country' ? (
                  <Text style={styles.tabFlag}>{countryToFlag(profile!.country!)}</Text>
                ) : tab === 'world' ? (
                  <Ionicons name="globe-outline" size={16} color={isActive ? colors.primary : colors.textMuted} />
                ) : (
                  <View style={styles.friendsTabIconWrap}>
                    <Ionicons name="people-outline" size={16} color={isActive ? colors.primary : colors.textMuted} />
                    {pendingRequestCount > 0 && <View style={styles.tabBadgeDot} />}
                  </View>
                )}
                <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
                  {tab === 'country'
                    ? t('leaderboard_tab_country')
                    : tab === 'world'
                    ? t('leaderboard_world')
                    : t('leaderboard_tab_friends')}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      {activeTab === 'friends' ? (
        <FriendsTab />
      ) : loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={top20}
          keyExtractor={(item) => item.userId}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="trophy-outline" size={40} color={colors.primary} />
              </View>
              <Text style={styles.emptyText}>{t('leaderboard_empty')}</Text>
            </View>
          }
          ListFooterComponent={
            !userInTop20 && userEntry ? (
              <View>
                <View style={styles.footerDivider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerLabel}>• • •</Text>
                  <View style={styles.dividerLine} />
                </View>
                <EntryRow
                  entry={userEntry}
                  isMe
                  showFlag={showFlag}
                />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <EntryRow
              entry={item}
              isMe={item.userId === user?.id}
              showFlag={showFlag}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function EntryRow({
  entry,
  isMe,
  showFlag,
}: {
  entry: LeaderboardEntry;
  isMe: boolean;
  showFlag: boolean;
}) {
  const { t } = useTranslation();
  const medalColor = entry.rank <= 3 ? MEDAL_COLORS[entry.rank - 1] : null;

  return (
    <View style={[styles.row, isMe && styles.rowMe]}>
      {/* Rank */}
      <View style={[styles.rankBox, medalColor ? { backgroundColor: medalColor + '22' } : null]}>
        <Text style={[styles.rankText, medalColor ? { color: medalColor } : null]}>
          #{entry.rank}
        </Text>
      </View>

      {/* Name + flag */}
      <View style={styles.nameBox}>
        <Text style={[styles.nameText, isMe && styles.nameTextMe]} numberOfLines={1}>
          {entry.displayName}
          {isMe ? `  ${t('leaderboard_you')}` : ''}
        </Text>
        {showFlag && entry.country ? (
          <Text style={styles.flagText}>{countryToFlag(entry.country)}</Text>
        ) : null}
      </View>

      {/* Cards count */}
      <Text style={styles.countText}>{entry.cardsStudied}</Text>
      <Ionicons name="layers-outline" size={14} color={colors.textMuted} style={styles.cardIcon} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  backBtn: { padding: spacing.sm, width: 44, alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerRight: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 4,
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { ...typography.small, color: colors.white, fontSize: 10, fontWeight: '700' },
  title: { ...typography.h3, color: colors.textPrimary },
  subtitle: { ...typography.small, color: colors.textMuted, marginTop: 2 },

  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.lg,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  tabBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabFlag: { fontSize: 15, lineHeight: 20 },
  tabBtnActive: {
    backgroundColor: colors.surface,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    ...typography.body,
    color: colors.textMuted,
    fontWeight: '500',
  },
  tabBtnTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  friendsTabIconWrap: {
    position: 'relative',
  },
  tabBadgeDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1,
    borderColor: colors.surface,
  },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },

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
    width: 44,
    height: 36,
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

  nameBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginRight: spacing.sm,
  },
  nameText: { ...typography.bodyBold, color: colors.textPrimary, flexShrink: 1 },
  nameTextMe: { color: colors.primary },
  flagText: { fontSize: 18, lineHeight: 22 },

  countText: { ...typography.bodyBold, color: colors.textSecondary },
  cardIcon: { marginLeft: 4 },

  footerDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerLabel: { ...typography.small, color: colors.textMuted },

  emptyBox: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});
