import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DeckListItem } from '../../src/components/home/DeckListItem';
import { Logo } from '../../src/components/ui/Logo';
import { StreakCard } from '../../src/components/home/StreakCard';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { FAB } from '../../src/components/ui/FAB';
import { borderRadius, colors, spacing, typography } from '../../src/constants';
import { useDeckStore } from '../../src/stores/useDeckStore';
import { useStreakStore } from '../../src/stores/useStreakStore';
import { useSubscriptionStore } from '../../src/stores/useSubscriptionStore';
import { Deck } from '../../src/types';

export default function HomeScreen() {
  const { decks, deckStats, loadDecks, loadDeckStats } = useDeckStore();
  const { currentStreak, weekDays, loadStreak } = useStreakStore();
  const { isPro } = useSubscriptionStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDecks();
    loadStreak();
  }, []);

  useEffect(() => {
    decks.forEach((deck) => {
      loadDeckStats(deck.id);
    });
  }, [decks]);


  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadDecks(), loadStreak()]);
    setRefreshing(false);
  }, []);

  const renderDeck = useCallback(
    ({ item }: { item: Deck }) => (
      <DeckListItem
        deck={item}
        stats={deckStats[item.id]}
        onPress={() => router.push(`/deck/${item.id}`)}
      />
    ),
    [deckStats]
  );

  const ListHeader = useMemo(
    () => (
      <View>
        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <Logo height={38} />
          </View>
          {!isPro && (
            <Pressable style={styles.proButton} onPress={() => router.push('/paywall')}>
              <Ionicons name="diamond-outline" size={14} color={colors.white} />
              <Text style={styles.proButtonText}>PRO</Text>
            </Pressable>
          )}
        </View>
        <StreakCard currentStreak={currentStreak} weekDays={weekDays} />
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Decks</Text>
          <Text style={styles.deckCount}>{decks.length}</Text>
        </View>
      </View>
    ),
    [currentStreak, weekDays, decks.length]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        renderItem={renderDeck}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <EmptyState
            title="No decks yet"
            subtitle="Create your first deck to start learning"
            ctaLabel="Create your first deck"
            onCtaPress={() => router.push('/deck/create')}
          />
        }
        contentContainerStyle={decks.length === 0 ? { flex: 1 } : { paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        getItemLayout={(_, index) => ({ length: 76, offset: 76 * index, index })}
      />
      <FAB
        onPress={() => router.push('/deck/create')}
        style={styles.fab}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  logoWrapper: {
    flex: 1,
  },
  proButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  proButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
  },
  deckCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
  fab: {
    position: 'absolute',
    bottom: 76,
    alignSelf: 'center',
  },
});
