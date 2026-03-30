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
import { BadgesRow } from '../../src/components/home/BadgesRow';
import { DeckListItem } from '../../src/components/home/DeckListItem';
import { StreakCard } from '../../src/components/home/StreakCard';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { FAB } from '../../src/components/ui/FAB';
import { colors, spacing, typography } from '../../src/constants';
import { useTranslation } from '../../src/i18n';
import { TabHeader } from '../../src/components/ui/TabHeader';
import { useDeckStore } from '../../src/stores/useDeckStore';
import { useStreakStore } from '../../src/stores/useStreakStore';
import { useBadgeStore } from '../../src/stores/useBadgeStore';
import { Deck } from '../../src/types';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { decks, deckStats, loadDecks, loadDeckStats } = useDeckStore();
  const { currentStreak, weekDays, loadStreak } = useStreakStore();
  const { checkBadges } = useBadgeStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDecks();
    loadStreak();
    checkBadges();
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
        <TabHeader />
        <StreakCard currentStreak={currentStreak} weekDays={weekDays} />
        <BadgesRow />
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('my_decks')}</Text>
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
            title={t('no_decks_title')}
            subtitle={t('no_decks_subtitle')}
            ctaLabel={t('create_first_deck')}
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
