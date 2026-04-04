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
  getHiddenVocabDeckId,
  searchStaticDecks,
} from '../../src/data/publicDecks';
import { bulkInsertCards, createDeck } from '../../src/services/database';
import { useTranslation } from '../../src/i18n';
import { TabHeader } from '../../src/components/ui/TabHeader';
import { useDeckStore } from '../../src/stores/useDeckStore';
import { useAppStore } from '../../src/stores/useAppStore';
import { useSubscriptionStore } from '../../src/stores/useSubscriptionStore';
import { PublicDeck } from '../../src/types';
import { resolveTranslation, useResolvedDeckName } from '../../src/utils/translations';
import { LanguageBadge } from '../../src/components/ui/LanguageBadge';
import { isMultilingual, LANGUAGE_FLAGS } from '../../src/utils/languages';
import { Language } from '../../src/types';

type Tab = 'discover' | 'browse';

const CATEGORY_KEYS = [
  { key: 'all', labelKey: 'all', icon: '🌐' },
  { key: 'languages', labelKey: 'categories.languages', icon: '🗣️' },
  { key: 'anatomy', labelKey: 'categories.anatomy', icon: '🫀' },
  { key: 'mcat', labelKey: 'categories.mcat', icon: '🩺' },
  { key: 'science', labelKey: 'categories.science', icon: '🔬' },
  { key: 'history', labelKey: 'categories.history', icon: '📜' },
  { key: 'business', labelKey: 'categories.business', icon: '💼' },
  { key: 'math', labelKey: 'categories.math', icon: '📐' },
  { key: 'medical', labelKey: 'categories.medical', icon: '💊' },
  { key: 'technology', labelKey: 'categories.technology', icon: '💻' },
  { key: 'psychology', labelKey: 'categories.psychology', icon: '🧠' },
  { key: 'exams', labelKey: 'categories.exams', icon: '🎓' },
  { key: 'make_money', labelKey: 'categories.make_money', icon: '💰' },
];

export default function LibraryScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [featuredDecks, setFeaturedDecks] = useState<PublicDeck[]>([]);
  const [editorsChoiceDecks, setEditorsChoiceDecks] = useState<PublicDeck[]>([]);
  const [searchResults, setSearchResults] = useState<PublicDeck[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);
  const { loadDecks, decks } = useDeckStore();
  const { freeDownloadsUsed, incrementFreeDownloads, language } = useAppStore();
  const { isPro } = useSubscriptionStore();

  const downloadedIds = useMemo<Set<string>>(
    () => new Set(decks.filter((d) => d.source_id).map((d) => d.source_id as string)),
    [decks]
  );

  const hiddenDeckId = getHiddenVocabDeckId(language);

  useEffect(() => {
    const filterHidden = (decks: PublicDeck[]) =>
      hiddenDeckId ? decks.filter((d) => d.id !== hiddenDeckId) : decks;
    setFeaturedDecks(filterHidden(getStaticFeaturedDecks()));
    setEditorsChoiceDecks(filterHidden(getStaticEditorsChoiceDecks()));
  }, [hiddenDeckId]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      const results = searchStaticDecks(searchQuery, language);
      setSearchResults(hiddenDeckId ? results.filter((d) => d.id !== hiddenDeckId) : results);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, hiddenDeckId]);

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
        name_translations: deck.name_translations,
        description_translations: deck.description_translations,
        supported_languages: deck.supported_languages,
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
          front_translations: c.front_translations,
          back_translations: c.back_translations,
          audio_url: c.audio_url,
          status: 'new' as const,
          ease_factor: 2.5,
          interval: 0,
          repetitions: 0,
        }))
      );
      if (!isPro) await incrementFreeDownloads();
      await loadDecks();
      Alert.alert(t('download_success_title'), t('download_success_message', { name: resolveTranslation(deck.name_translations, deck.name, language) }));
    } catch {
      Alert.alert(t('error'), t('download_failed'));
    } finally {
      setDownloading(null);
    }
  };

  // Compute language filter options from deck data
  const languageFilters = useMemo(() => {
    const langs = new Set<string>();
    for (const d of ALL_DECKS) {
      if (d.supported_languages && !isMultilingual(d.supported_languages)) {
        d.supported_languages.forEach((l) => langs.add(l));
      }
    }
    return Array.from(langs) as Language[];
  }, []);

  const browseDecks = useMemo(() => {
    let base = hiddenDeckId ? ALL_DECKS.filter((d) => d.id !== hiddenDeckId) : [...ALL_DECKS];
    if (selectedLanguage !== 'all') {
      base = base.filter((d) =>
        d.supported_languages &&
        !isMultilingual(d.supported_languages) &&
        d.supported_languages.includes(selectedLanguage as Language)
      );
    }
    if (selectedCategory === 'all') return base;
    return base.filter((d) => d.category === selectedCategory);
  }, [selectedCategory, selectedLanguage, hiddenDeckId]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Fixed header: logo + search + tabs */}
      <View style={styles.header}>
        <TabHeader />
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder={t('search_library')}
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
                {t('discover')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tabBtn, activeTab === 'browse' && styles.tabBtnActive]}
              onPress={() => setActiveTab('browse')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'browse' && styles.tabBtnTextActive]}>
                {t('browse')}
              </Text>
            </Pressable>
          </View>
        )}

        {!isPro && (
          <View style={styles.downloadBanner}>
            <Text style={styles.downloadBannerText}>
              {t('downloads_remaining', { count: FREE_DOWNLOAD_LIMIT - freeDownloadsUsed })}
            </Text>
            <Pressable onPress={() => router.push('/paywall')}>
              <Text style={styles.upgradeLink}>{t('upgrade_pro')}</Text>
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
          selectedLanguage={selectedLanguage}
          onSelectLanguage={setSelectedLanguage}
          languageFilters={languageFilters}
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
  const { t } = useTranslation();
  return (
    <ScrollView contentContainerStyle={styles.tabContent}>
      {results.length === 0 ? (
        <Text style={styles.emptyText}>{t('no_decks_found')}</Text>
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
  const { t } = useTranslation();
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.tabContent}>
      {/* Featured */}
      {featuredDecks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('featured_decks')}</Text>
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
          <Text style={styles.sectionTitle}>{t('editors_choice')}</Text>
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
  selectedLanguage,
  onSelectLanguage,
  languageFilters,
  downloading,
  downloadedIds,
  onDownload,
}: {
  decks: PublicDeck[];
  selectedCategory: string;
  onSelectCategory: (key: string) => void;
  selectedLanguage: string;
  onSelectLanguage: (key: string) => void;
  languageFilters: Language[];
  downloading: string | null;
  downloadedIds: Set<string>;
  onDownload: (d: PublicDeck) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.flex}>
      {/* Language filter + Category chips */}
      <View style={styles.filterRows}>
        {/* Language filter — only show when there are language-specific decks */}
        {languageFilters.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.langRow}
          >
            <Pressable
              style={[styles.langChip, selectedLanguage === 'all' && styles.langChipActive]}
              onPress={() => onSelectLanguage('all')}
            >
              <Ionicons name="globe-outline" size={16} color={selectedLanguage === 'all' ? colors.white : colors.textSecondary} />
            </Pressable>
            {languageFilters.map((lang) => (
              <Pressable
                key={lang}
                style={[styles.langChip, selectedLanguage === lang && styles.langChipActive]}
                onPress={() => onSelectLanguage(lang)}
              >
                <Text style={styles.langFlag}>{LANGUAGE_FLAGS[lang]}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          style={styles.chipsScroll}
        >
          {CATEGORY_KEYS.map((cat) => (
            <Pressable
              key={cat.key}
              style={[styles.chip, selectedCategory === cat.key && styles.chipActive]}
              onPress={() => onSelectCategory(cat.key)}
            >
              <Text style={styles.chipIcon}>{cat.icon}</Text>
              <Text style={[styles.chipLabel, selectedCategory === cat.key && styles.chipLabelActive]}>
                {t(cat.labelKey)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

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
  const { t } = useTranslation();
  const name = useResolvedDeckName(deck);
  return (
    <View style={styles.featuredCard}>
      <View style={styles.featuredIcon}>
        <Text style={styles.featuredIconText}>{deck.icon_url ?? getCategoryEmoji(deck.category)}</Text>
      </View>
      <Text style={styles.featuredName} numberOfLines={2}>{name}</Text>
      <View style={styles.featuredMeta}>
        <Text style={styles.featuredCount}>{t('cards_count', { count: deck.card_count })}</Text>
        <LanguageBadge supported_languages={deck.supported_languages} />
      </View>
      {isDownloaded ? (
        <View style={styles.downloadedBadge}>
          <Ionicons name="checkmark" size={14} color={colors.white} />
          <Text style={styles.downloadedBadgeText}> {t('downloaded')}</Text>
        </View>
      ) : (
        <Pressable
          style={[styles.downloadBtn, isDownloading && styles.downloadBtnDisabled]}
          onPress={() => onDownload(deck)}
          disabled={isDownloading}
        >
          {isDownloading
            ? <ActivityIndicator size="small" color={colors.white} />
            : <Text style={styles.downloadBtnText}>↓ {t('download')}</Text>}
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
  const { t } = useTranslation();
  const name = useResolvedDeckName(deck);
  return (
    <View style={[styles.editorsCard, { backgroundColor: getCategoryBg(deck.category) }]}>
      <View style={styles.editorsCardLeft}>
        <View style={styles.editorsBadge}>
          <Text style={styles.editorsBadgeText}>{t('editors_choice_badge')}</Text>
        </View>
        <Text style={styles.editorsName}>{name}</Text>
        <View style={styles.editorsMetaRow}>
          <Text style={styles.editorsCount}>{deck.card_count} cards</Text>
          <LanguageBadge supported_languages={deck.supported_languages} />
        </View>
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
  const { t } = useTranslation();
  const name = useResolvedDeckName(deck);
  return (
    <View style={styles.browseCard}>
      <View style={[styles.browseIcon, { backgroundColor: getCategoryBg(deck.category) }]}>
        <Text style={styles.browseIconText}>{deck.icon_url ?? getCategoryEmoji(deck.category)}</Text>
      </View>
      <View style={styles.browseInfo}>
        <Text style={styles.browseName} numberOfLines={1}>{name}</Text>
        <View style={styles.browseMetaRow}>
          <Text style={styles.browseCount}>{t('cards_count', { count: deck.card_count })}</Text>
          <LanguageBadge supported_languages={deck.supported_languages} />
        </View>
      </View>
      {isDownloaded ? (
        <View style={styles.downloadedBadge}>
          <Ionicons name="checkmark" size={14} color={colors.white} />
          <Text style={styles.downloadedBadgeText}> {t('downloaded')}</Text>
        </View>
      ) : (
        <Pressable
          style={[styles.downloadBtn, isDownloading && styles.downloadBtnDisabled]}
          onPress={() => onDownload(deck)}
          disabled={isDownloading}
        >
          {isDownloading
            ? <ActivityIndicator size="small" color={colors.white} />
            : <Text style={styles.downloadBtnText}>↓ {t('download')}</Text>}
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
    technology: '💻', psychology: '🧠', exams: '🎓', default: '📚',
  };
  return map[category.toLowerCase()] ?? map.default;
}

function getCategoryBg(category: string): string {
  const map: Record<string, string> = {
    languages: colors.languageBg, medical: colors.medicalBg, mcat: colors.medicalBg,
    anatomy: colors.medicalBg, science: colors.scienceBg, history: colors.historyBg,
    math: colors.mathBg, technology: colors.techBg, exams: colors.mathBg,
    default: colors.primaryLight,
  };
  return map[category.toLowerCase()] ?? map.default;
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    backgroundColor: colors.background,
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
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  downloadBannerText: { ...typography.caption, color: colors.primary, flex: 1, flexWrap: 'wrap' },
  upgradeLink: { ...typography.captionBold, color: colors.primary, flexShrink: 0 },
  filterRows: { flexGrow: 0, flexShrink: 0 },
  langRow: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.sm,
  },
  langChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  langChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  langFlag: { fontSize: 18 },
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
  featuredMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  featuredCount: { ...typography.small, color: colors.textMuted },

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
  editorsMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
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
  browseMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 2 },
  browseCount: { ...typography.small, color: colors.textMuted },

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
