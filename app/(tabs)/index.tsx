import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { DeckListItem } from '../../src/components/home/DeckListItem';
import { GreetingHeader } from '../../src/components/home/GreetingHeader';
import { StatBoxes } from '../../src/components/home/StatBoxes';
import { StreakCard } from '../../src/components/home/StreakCard';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { FABMenu, FABMenuItem } from '../../src/components/ui/FABMenu';
import { colors, spacing, typography } from '../../src/constants';
import { getHiddenVocabDeckId } from '../../src/data/publicDecks';
import { useTranslation } from '../../src/i18n';
import { TabHeader } from '../../src/components/ui/TabHeader';
import { useDeckStore } from '../../src/stores/useDeckStore';
import { useStreakStore } from '../../src/stores/useStreakStore';
import { useBadgeStore } from '../../src/stores/useBadgeStore';
import { useAppStore } from '../../src/stores/useAppStore';
import { Deck } from '../../src/types';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { decks, deckStats, loadDecks, loadDeckStats } = useDeckStore();
  const { currentStreak, weekDays, cardsMastered, avgDailyFocusMinutes, loadStreak } = useStreakStore();
  const { checkBadges } = useBadgeStore();
  const language = useAppStore((s) => s.language);
  const hiddenDeckId = getHiddenVocabDeckId(language);
  const visibleDecks = useMemo(
    () => (hiddenDeckId ? decks.filter((d) => d.source_id !== hiddenDeckId) : decks),
    [decks, hiddenDeckId]
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDecks();
    checkBadges();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStreak();
    }, [])
  );


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

  const fabItems: FABMenuItem[] = useMemo(() => [
    { label: t('fab_new_deck'), icon: 'add-circle-outline', onPress: () => router.push('/deck/create') },
    { label: t('fab_achievements'), icon: 'trophy-outline', onPress: () => router.push('/badges') },
    { label: t('fab_friends'), icon: 'people-outline', onPress: () => router.push('/friends') },
  ], [language]);

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
        <GreetingHeader weekDays={weekDays} />
        <StreakCard currentStreak={currentStreak} weekDays={weekDays} />
        <StatBoxes cardsMastered={cardsMastered} avgDailyFocusMinutes={avgDailyFocusMinutes} />
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('my_decks')}</Text>
          <Text style={styles.deckCount}>{visibleDecks.length}</Text>
        </View>
      </View>
    ),
    [currentStreak, weekDays, cardsMastered, avgDailyFocusMinutes, visibleDecks.length, language]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TabHeader />
      <FlatList
        data={visibleDecks}
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
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      />
      <FABMenu items={fabItems} />
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
});
