import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SearchBar } from '../../src/components/ui/SearchBar';
import { borderRadius, colors, FREE_DOWNLOAD_LIMIT, spacing, typography } from '../../src/constants';
import {
  ALL_DECKS,
  getStaticDeckCards,
  getStaticEditorsChoiceDecks,
  getStaticFeaturedDecks,
  searchStaticDecks,
} from '../../src/data/publicDecks';
import { bulkInsertCards, createDeck } from '../../src/services/database';
import { useDeckStore } from '../../src/stores/useDeckStore';
import { useAppStore } from '../../src/stores/useAppStore';
import { useSubscriptionStore } from '../../src/stores/useSubscriptionStore';
import { PublicDeck } from '../../src/types';

type Tab = 'discover' | 'browse';

const CATEGORIES = [
  { key: 'all', label: 'All', icon: '🌐' },
  { key: 'languages', label: 'Languages', icon: '🗣️' },
  { key: 'anatomy', label: 'Anatomy', icon: '🫀' },
  { key: 'mcat', label: 'MCAT', icon: '🩺' },
  { key: 'science', label: 'Science', icon: '🔬' },
  { key: 'history', label: 'History', icon: '📜' },
  { key: 'business', label: 'Business', icon: '💼' },
  { key: 'math', label: 'Math', icon: '📐' },
  { key: 'medical', label: 'Medical', icon: '💊' },
  { key: 'technology', label: 'Technology', icon: '💻' },
  { key: 'psychology', label: 'Psychology', icon: '🧠' },
];

export default function LibraryScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [featuredDecks, setFeaturedDecks] = useState<PublicDeck[]>([]);
  const [editorsChoiceDecks, setEditorsChoiceDecks] = useState<PublicDeck[]>([]);
  const [searchResults, setSearchResults] = useState<PublicDeck[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);
  const { loadDecks, decks } = useDeckStore();
  const { freeDownloadsUsed, incrementFreeDownloads } = useAppStore();
  const { isPro } = useSubscriptionStore();

  const downloadedIds = useMemo<Set<string>>(
    () => new Set(decks.filter((d) => d.source_id).map((d) => d.source_id as string)),
    [decks]
  );

  useEffect(() => {
    setFeaturedDecks(getStaticFeaturedDecks());
    setEditorsChoiceDecks(getStaticEditorsChoiceDecks());
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setSearchResults(searchStaticDecks(searchQuery));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDownload = async (deck: PublicDeck) => {
    if (!isPro && freeDownloadsUsed >= FREE_DOWNLOAD_LIMIT) {
      router.push('/paywall');
      return;
    }
    if (downloadedIds.has(deck.id)) return;

    setDownloading(deck.id);
    try {
      const cards = getStaticDeckCards(deck.id);
      const newDeck = await createDeck({
        name: deck.name,
        description: deck.description,
        icon: deck.icon_url ?? '📚',
        color: colors.primary,
        new_cards_per_day: 20,
        shuffle_cards: true,
        auto_play_audio: false,
        reverse_cards: false,
        is_public_download: true,
        source_id: deck.id,
      });
      await bulkInsertCards(
        cards.map((c) => ({
          deck_id: newDeck.id,
          front: c.front,
          back: c.back,
          audio_url: c.audio_url,
          status: 'new' as const,
          ease_factor: 2.5,
          interval: 0,
          repetitions: 0,
        }))
      );
      if (!isPro) await incrementFreeDownloads();
      await loadDecks();
      Alert.alert('Downloaded!', `"${deck.name}" has been added to your decks.`);
    } catch {
      Alert.alert('Error', 'Failed to download deck. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const browseDecks = useMemo(() => {
    if (selectedCategory === 'all') return ALL_DECKS;
    return ALL_DECKS.filter((d) => d.category === selectedCategory);
  }, [selectedCategory]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Fixed header: title + search + tabs */}
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder="Search all decks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {!isSearching && (
          <View style={styles.tabBar}>
            <Pressable
              style={[styles.tabBtn, activeTab === 'discover' && styles.tabBtnActive]}
              onPress={() => setActiveTab('discover')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'discover' && styles.tabBtnTextActive]}>
                Discover
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tabBtn, activeTab === 'browse' && styles.tabBtnActive]}
              onPress={() => setActiveTab('browse')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'browse' && styles.tabBtnTextActive]}>
                Browse
              </Text>
            </Pressable>
          </View>
        )}

        {!isPro && (
          <View style={styles.downloadBanner}>
            <Text style={styles.downloadBannerText}>
              {FREE_DOWNLOAD_LIMIT - freeDownloadsUsed} free download{FREE_DOWNLOAD_LIMIT - freeDownloadsUsed !== 1 ? 's' : ''} remaining
            </Text>
            <Pressable onPress={() => router.push('/paywall')}>
              <Text style={styles.upgradeLink}>Upgrade to PRO</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Scrollable body */}
      {isSearching ? (
        <SearchResults
          results={searchResults}
          downloading={downloading}
          downloadedIds={downloadedIds}
          onDownload={handleDownload}
        />
      ) : activeTab === 'discover' ? (
        <DiscoverTab
          featuredDecks={featuredDecks}
          editorsChoiceDecks={editorsChoiceDecks}
          downloading={downloading}
          downloadedIds={downloadedIds}
          onDownload={handleDownload}
        />
      ) : (
        <BrowseTab
          decks={browseDecks}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          downloading={downloading}
          downloadedIds={downloadedIds}
          onDownload={handleDownload}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Search Results ────────────────────────────────────────────────────────────

function SearchResults({
  results,
  downloading,
  downloadedIds,
  onDownload,
}: {
  results: PublicDeck[];
  downloading: string | null;
  downloadedIds: Set<string>;
  onDownload: (d: PublicDeck) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.tabContent}>
      {results.length === 0 ? (
        <Text style={styles.emptyText}>No decks found</Text>
      ) : (
        results.map((deck) => (
          <BrowseDeckCard
            key={deck.id}
            deck={deck}
            isDownloading={downloading === deck.id}
            isDownloaded={downloadedIds.has(deck.id)}
            onDownload={onDownload}
          />
        ))
      )}
    </ScrollView>
  );
}

// ─── Discover Tab ──────────────────────────────────────────────────────────────

function DiscoverTab({
  featuredDecks,
  editorsChoiceDecks,
  downloading,
  downloadedIds,
  onDownload,
}: {
  featuredDecks: PublicDeck[];
  editorsChoiceDecks: PublicDeck[];
  downloading: string | null;
  downloadedIds: Set<string>;
  onDownload: (d: PublicDeck) => void;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      {/* Featured */}
      {featuredDecks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Decks</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselRow}>
            {featuredDecks.map((deck) => (
              <FeaturedDeckCard
                key={deck.id}
                deck={deck}
                isDownloading={downloading === deck.id}
                isDownloaded={downloadedIds.has(deck.id)}
                onDownload={onDownload}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Editor's Choice */}
      {editorsChoiceDecks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Editor's Choice</Text>
          {editorsChoiceDecks.map((deck) => (
            <EditorsChoiceDeckCard
              key={deck.id}
              deck={deck}
              isDownloading={downloading === deck.id}
              isDownloaded={downloadedIds.has(deck.id)}
              onDownload={onDownload}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// ─── Browse Tab ────────────────────────────────────────────────────────────────

function BrowseTab({
  decks,
  selectedCategory,
  onSelectCategory,
  downloading,
  downloadedIds,
  onDownload,
}: {
  decks: PublicDeck[];
  selectedCategory: string;
  onSelectCategory: (key: string) => void;
  downloading: string | null;
  downloadedIds: Set<string>;
  onDownload: (d: PublicDeck) => void;
}) {
  return (
    <View style={styles.flex}>
      {/* Category chips — sticky above the deck list */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        style={styles.chipsScroll}
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.key}
            style={[styles.chip, selectedCategory === cat.key && styles.chipActive]}
            onPress={() => onSelectCategory(cat.key)}
          >
            <Text style={styles.chipIcon}>{cat.icon}</Text>
            <Text style={[styles.chipLabel, selectedCategory === cat.key && styles.chipLabelActive]}>
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Deck list */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
        <Text style={styles.deckCount}>{decks.length} deck{decks.length !== 1 ? 's' : ''}</Text>
        {decks.map((deck) => (
          <BrowseDeckCard
            key={deck.id}
            deck={deck}
            isDownloading={downloading === deck.id}
            isDownloaded={downloadedIds.has(deck.id)}
            onDownload={onDownload}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Card Components ───────────────────────────────────────────────────────────

function FeaturedDeckCard({
  deck,
  onDownload,
  isDownloading,
  isDownloaded,
}: {
  deck: PublicDeck;
  onDownload: (d: PublicDeck) => void;
  isDownloading: boolean;
  isDownloaded: boolean;
}) {
  return (
    <View style={styles.featuredCard}>
      <View style={styles.featuredIcon}>
        <Text style={styles.featuredIconText}>{deck.icon_url ?? getCategoryEmoji(deck.category)}</Text>
      </View>
      <Text style={styles.featuredName} numberOfLines={2}>{deck.name}</Text>
      <Text style={styles.featuredCount}>{deck.card_count} cards</Text>
      {isDownloaded ? (
        <View style={styles.downloadedBadge}>
          <Ionicons name="checkmark" size={14} color={colors.white} />
          <Text style={styles.downloadedBadgeText}> Downloaded</Text>
        </View>
      ) : (
        <Pressable
          style={[styles.downloadBtn, isDownloading && styles.downloadBtnDisabled]}
          onPress={() => onDownload(deck)}
          disabled={isDownloading}
        >
          {isDownloading
            ? <ActivityIndicator size="small" color={colors.white} />
            : <Text style={styles.downloadBtnText}>↓ Download</Text>}
        </Pressable>
      )}
    </View>
  );
}

function EditorsChoiceDeckCard({
  deck,
  onDownload,
  isDownloading,
  isDownloaded,
}: {
  deck: PublicDeck;
  onDownload: (d: PublicDeck) => void;
  isDownloading: boolean;
  isDownloaded: boolean;
}) {
  return (
    <View style={[styles.editorsCard, { backgroundColor: getCategoryBg(deck.category) }]}>
      <View style={styles.editorsCardLeft}>
        <View style={styles.editorsBadge}>
          <Text style={styles.editorsBadgeText}>Editor's choice</Text>
        </View>
        <Text style={styles.editorsName}>{deck.name}</Text>
        <Text style={styles.editorsCount}>{deck.card_count} cards</Text>
      </View>
      <View style={styles.editorsCardRight}>
        <Text style={styles.editorsEmoji}>{getCategoryEmoji(deck.category)}</Text>
        {isDownloaded ? (
          <View style={styles.downloadedBadgeSmall}>
            <Ionicons name="checkmark" size={18} color={colors.white} />
          </View>
        ) : (
          <Pressable
            style={[styles.downloadBtn, isDownloading && styles.downloadBtnDisabled]}
            onPress={() => onDownload(deck)}
            disabled={isDownloading}
          >
            {isDownloading
              ? <ActivityIndicator size="small" color={colors.white} />
              : <Text style={styles.downloadBtnText}>↓</Text>}
          </Pressable>
        )}
      </View>
    </View>
  );
}

function BrowseDeckCard({
  deck,
  onDownload,
  isDownloading,
  isDownloaded,
}: {
  deck: PublicDeck;
  onDownload: (d: PublicDeck) => void;
  isDownloading: boolean;
  isDownloaded: boolean;
}) {
  return (
    <View style={styles.browseCard}>
      <View style={[styles.browseIcon, { backgroundColor: getCategoryBg(deck.category) }]}>
        <Text style={styles.browseIconText}>{deck.icon_url ?? getCategoryEmoji(deck.category)}</Text>
      </View>
      <View style={styles.browseInfo}>
        <Text style={styles.browseName} numberOfLines={1}>{deck.name}</Text>
        <Text style={styles.browseCount}>{deck.card_count} cards</Text>
      </View>
      {isDownloaded ? (
        <View style={styles.downloadedBadge}>
          <Ionicons name="checkmark" size={14} color={colors.white} />
          <Text style={styles.downloadedBadgeText}> Done</Text>
        </View>
      ) : (
        <Pressable
          style={[styles.downloadBtn, isDownloading && styles.downloadBtnDisabled]}
          onPress={() => onDownload(deck)}
          disabled={isDownloading}
        >
          {isDownloading
            ? <ActivityIndicator size="small" color={colors.white} />
            : <Text style={styles.downloadBtnText}>↓ Get</Text>}
        </Pressable>
      )}
    </View>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    languages: '🗣️', anatomy: '🫀', mcat: '🩺', science: '🔬',
    history: '📜', business: '💼', math: '📐', medical: '💊',
    technology: '💻', psychology: '🧠', default: '📚',
  };
  return map[category.toLowerCase()] ?? map.default;
}

function getCategoryBg(category: string): string {
  const map: Record<string, string> = {
    languages: colors.languageBg, medical: colors.medicalBg, mcat: colors.medicalBg,
    anatomy: colors.medicalBg, science: colors.scienceBg, history: colors.historyBg,
    math: colors.mathBg, technology: colors.techBg, default: colors.primaryLight,
  };
  return map[category.toLowerCase()] ?? map.default;
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    backgroundColor: colors.background,
    paddingTop: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
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
  downloadBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  downloadBannerText: { ...typography.caption, color: colors.primary },
  upgradeLink: { ...typography.captionBold, color: colors.primary },
  chipsScroll: { flexGrow: 0, flexShrink: 0 },
  chipsRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  chipActive: { backgroundColor: colors.primary },
  chipIcon: { fontSize: 14 },
  chipLabel: { ...typography.small, color: colors.textSecondary, fontWeight: '500' },
  chipLabelActive: { color: colors.white, fontWeight: '600' },
  tabContent: { padding: spacing.md, paddingBottom: 40 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: 40 },
  deckCount: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.sm },
  section: { marginBottom: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  carouselRow: { gap: spacing.md, paddingRight: spacing.sm },

  // Featured card
  featuredCard: {
    width: 160,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  featuredIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featuredIconText: { fontSize: 28 },
  featuredName: { ...typography.captionBold, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.xs },
  featuredCount: { ...typography.small, color: colors.textMuted, marginBottom: spacing.sm },

  // Editors choice card
  editorsCard: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  editorsCardLeft: { flex: 1 },
  editorsBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  editorsBadgeText: { ...typography.smallBold, color: colors.white },
  editorsName: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: spacing.xs },
  editorsCount: { ...typography.caption, color: colors.textSecondary },
  editorsCardRight: { alignItems: 'center', gap: spacing.sm },
  editorsEmoji: { fontSize: 36 },

  // Browse card
  browseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  browseIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  browseIconText: { fontSize: 22 },
  browseInfo: { flex: 1 },
  browseName: { ...typography.bodyBold, color: colors.textPrimary },
  browseCount: { ...typography.small, color: colors.textMuted, marginTop: 2 },

  // Shared button styles
  downloadBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 64,
    alignItems: 'center',
    height: 30,
    justifyContent: 'center',
  },
  downloadBtnDisabled: { opacity: 0.6 },
  downloadBtnText: { ...typography.smallBold, color: colors.white },
  downloadedBadge: {
    backgroundColor: colors.learning,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
  },
  downloadedBadgeText: { ...typography.smallBold, color: colors.white },
  downloadedBadgeSmall: {
    backgroundColor: colors.learning,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadedBadgeSmallText: { ...typography.bodyBold, color: colors.white },
});
