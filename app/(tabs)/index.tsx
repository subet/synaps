import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,

  StyleSheet,
  Text,
  View,
} from 'react-native';
import { DeckListItem } from '../../src/components/home/DeckListItem';
import { StreakCard } from '../../src/components/home/StreakCard';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { FAB } from '../../src/components/ui/FAB';
import { SearchBar } from '../../src/components/ui/SearchBar';
import { colors, spacing, typography } from '../../src/constants';
import { useDeckStore } from '../../src/stores/useDeckStore';
import { useStreakStore } from '../../src/stores/useStreakStore';
import { Deck } from '../../src/types';

export default function HomeScreen() {
  const { decks, deckStats, loadDecks, loadDeckStats } = useDeckStore();
  const { currentStreak, weekDays, loadStreak } = useStreakStore();
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredDecks = useMemo(() => {
    if (!searchQuery.trim()) return decks;
    const q = searchQuery.toLowerCase();
    return decks.filter((d) => d.name.toLowerCase().includes(q));
  }, [decks, searchQuery]);

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
          <Text style={styles.appName}>Synaps</Text>
        </View>
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder="Search decks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <StreakCard currentStreak={currentStreak} weekDays={weekDays} />
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Decks</Text>
          <Text style={styles.deckCount}>{decks.length}</Text>
        </View>
      </View>
    ),
    [currentStreak, weekDays, searchQuery, decks.length]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={filteredDecks}
        keyExtractor={(item) => item.id}
        renderItem={renderDeck}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          searchQuery ? (
            <View style={styles.emptySearch}>
              <Text style={styles.emptyText}>No decks match "{searchQuery}"</Text>
            </View>
          ) : (
            <EmptyState
              title="No decks yet"
              subtitle="Create your first deck to start learning"
              ctaLabel="Create your first deck"
              onCtaPress={() => router.push('/deck/create')}
            />
          )
        }
        contentContainerStyle={filteredDecks.length === 0 ? { flex: 1 } : { paddingBottom: 100 }}
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  appName: {
    ...typography.h1,
    color: colors.primary,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
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
  emptySearch: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: 76,
    alignSelf: 'center',
  },
});
