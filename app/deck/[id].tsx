import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import { Ionicons } from '@expo/vector-icons';
import { CardListItem } from '../../src/components/deck/CardListItem';
import { DonutChart } from '../../src/components/deck/DonutChart';
import { Button } from '../../src/components/ui/Button';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { SearchBar } from '../../src/components/ui/SearchBar';
import { borderRadius, colors, spacing, typography } from '../../src/constants';
import { useTranslation } from '../../src/i18n';
import { useDeckStore } from '../../src/stores/useDeckStore';
import { useStudyStore } from '../../src/stores/useStudyStore';
import { useSubscriptionStore } from '../../src/stores/useSubscriptionStore';
import { Card } from '../../src/types';

export default function DeckDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getDeckById, deckStats, loadDeckStats } = useDeckStore();
  const { loadDeckCards, deckCards, isLoadingCards } = useStudyStore();
  const { isPro } = useSubscriptionStore();
  const { isOffline } = useNetworkStatus();
  const isLocked = isOffline && !isPro;
  const [searchQuery, setSearchQuery] = useState('');

  const deck = getDeckById(id);
  const stats = deckStats[id];

  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadDeckCards(id);
        loadDeckStats(id);
      }
    }, [id])
  );

  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return deckCards;
    const q = searchQuery.toLowerCase();
    return deckCards.filter(
      (c) => c.front.toLowerCase().includes(q) || c.back.toLowerCase().includes(q)
    );
  }, [deckCards, searchQuery]);

  const renderCard = useCallback(
    ({ item }: { item: Card }) => (
      <CardListItem card={item} onPress={() => router.push(`/card/edit/${item.id}`)} />
    ),
    []
  );

  if (!deck) {
    return (
      <SafeAreaView style={styles.safe}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
        <EmptyState title={t('deck_not_found')} subtitle={t('deck_deleted')} />
      </SafeAreaView>
    );
  }

  const ListHeader = (
    <View>
      {/* Header row */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
        <Text style={styles.deckName} numberOfLines={1}>{deck.name}</Text>
        <View style={styles.headerActions}>
          <Pressable onPress={() => router.push(`/card/create/${id}`)} style={styles.headerBtn}>
            <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
          </Pressable>
          <Pressable onPress={() => router.push(`/deck/edit/${id}`)} style={styles.headerBtn}>
            <Ionicons name="settings-outline" size={22} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {/* Donut / due today */}
        <View style={[styles.statCard, styles.statCardDue]}>
          <Text style={styles.statCardTitle}>{t('cards_due_today')}</Text>
          <DonutChart
            total={stats?.dueToday ?? 0}
            reviewed={stats?.dueToday ?? 0}
            size={96}
          />
        </View>

        {/* Progress bar */}
        <View style={[styles.statCard, styles.statCardGrow, styles.statCardProgress]}>
          <Text style={styles.statCardTitle}>{t('cards_in_deck', { count: stats?.total ?? 0 })}</Text>
          <ProgressBar stats={stats} />
          <View style={styles.legend}>
            <LegendItem color={colors.notStudied} label={`${stats?.notStudied ?? 0} ${t('not_studied')}`} />
            <LegendItem color={colors.learning} label={`${stats?.learning ?? 0} ${t('learning')}`} />
            <LegendItem color={colors.mastered} label={`${stats?.mastered ?? 0} ${t('mastered')}`} />
          </View>
        </View>
      </View>

      {/* Search + add card row */}
      <View style={styles.searchRow}>
        <SearchBar
          placeholder={t('search_cards')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchInput}
        />
        <Pressable
          style={styles.addCardBtn}
          onPress={() => router.push(`/card/create/${id}`)}
        >
          <Ionicons name="add" size={24} color={colors.white} />
        </Pressable>
      </View>

      <Text style={styles.cardsCount}>{t('cards_count', { count: filteredCards.length })}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={filteredCards}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          !isLoadingCards ? (
            <EmptyState
              title={t('no_cards_yet')}
              subtitle={t('add_first_card')}
              ctaLabel={t('add_card')}
              onCtaPress={() => router.push(`/card/create/${id}`)}
            />
          ) : null
        }
        contentContainerStyle={[
          { paddingBottom: 120 },
          filteredCards.length === 0 && { flex: 1 },
        ]}
        getItemLayout={(_, index) => ({ length: 58, offset: 58 * index, index })}
      />

      {(isLocked || (stats?.dueToday ?? 0) > 0) && (
        <View style={styles.studyBtnContainer}>
          {isLocked ? (
            <Pressable
              style={({ pressed }) => [styles.offlineBtn, pressed && styles.offlineBtnPressed]}
              onPress={() => router.push('/paywall')}
            >
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
              <Text style={styles.offlineBtnLabel}>{t('offline_study')}</Text>
            </Pressable>
          ) : (
            <Button
              label={t('study_button', { count: stats?.dueToday ?? 0 })}
              onPress={() => router.push(`/study/${id}`)}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

function ProgressBar({ stats }: { stats?: { total: number; notStudied: number; learning: number; mastered: number } }) {
  const total = stats?.total ?? 0;
  if (total === 0) return <View style={styles.progressBarEmpty} />;

  const notStudiedPct = (stats?.notStudied ?? 0) / total;
  const learningPct = (stats?.learning ?? 0) / total;
  const masteredPct = (stats?.mastered ?? 0) / total;

  return (
    <View style={styles.progressBar}>
      <View style={[styles.progressSegment, { flex: masteredPct, backgroundColor: colors.mastered }]} />
      <View style={[styles.progressSegment, { flex: learningPct, backgroundColor: colors.learning }]} />
      <View style={[styles.progressSegment, { flex: notStudiedPct, backgroundColor: colors.notStudied }]} />
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
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
  backBtn: { padding: spacing.sm },
  backText: { ...typography.h3, color: colors.primary },
  deckName: { ...typography.h3, color: colors.textPrimary, flex: 1, textAlign: 'center' },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  headerBtn: { padding: spacing.sm },
  headerBtnText: { fontSize: 20, color: colors.primary },
  statsRow: { flexDirection: 'row', paddingHorizontal: spacing.md, gap: spacing.sm, marginBottom: spacing.md },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statCardDue: {
    backgroundColor: colors.surface,
  },
  statCardProgress: {
    backgroundColor: colors.surface,
  },
  statCardGrow: { flex: 1 },
  statCardTitle: { ...typography.captionBold, color: colors.textSecondary, marginBottom: spacing.sm },
  progressBar: { width: '100%', height: 10, borderRadius: 5, flexDirection: 'row', overflow: 'hidden', backgroundColor: colors.borderLight, marginBottom: spacing.sm },
  progressBarEmpty: { width: '100%', height: 10, borderRadius: 5, backgroundColor: colors.borderLight, marginBottom: spacing.sm },
  progressSegment: {},
  legend: { width: '100%', gap: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { ...typography.small, color: colors.textSecondary },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, marginBottom: spacing.sm, gap: spacing.sm },
  searchInput: { flex: 1 },
  addCardBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCardBtnText: { color: colors.white, fontSize: 24, lineHeight: 28 },
  cardsCount: { ...typography.caption, color: colors.textMuted, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  studyBtnContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingBottom: 32,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  offlineBtn: {
    height: 52,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  offlineBtnPressed: { opacity: 0.85 },
  offlineBtnLabel: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  proBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  proBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
