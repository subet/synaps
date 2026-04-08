import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
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
import { incrementDownloadCount, fetchDownloadCounts } from '../../src/services/supabase';
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

type Tab = 'discover' | 'browse' | 'search';

const CATEGORY_KEYS = [
  { key: 'all', labelKey: 'all_categories', icon: 'grid-outline' as const },
  { key: 'languages', labelKey: 'categories.languages', icon: 'chatbubbles-outline' as const },
  { key: 'anatomy', labelKey: 'categories.anatomy', icon: 'body-outline' as const },
  { key: 'mcat', labelKey: 'categories.mcat', icon: 'fitness-outline' as const },
  { key: 'science', labelKey: 'categories.science', icon: 'flask-outline' as const },
  { key: 'history', labelKey: 'categories.history', icon: 'time-outline' as const },
  { key: 'business', labelKey: 'categories.business', icon: 'briefcase-outline' as const },
  { key: 'math', labelKey: 'categories.math', icon: 'calculator-outline' as const },
  { key: 'medical', labelKey: 'categories.medical', icon: 'medkit-outline' as const },
  { key: 'technology', labelKey: 'categories.technology', icon: 'hardware-chip-outline' as const },
  { key: 'psychology', labelKey: 'categories.psychology', icon: 'bulb-outline' as const },
  { key: 'exams', labelKey: 'categories.exams', icon: 'school-outline' as const },
  { key: 'make_money', labelKey: 'categories.make_money', icon: 'cash-outline' as const },
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
  const [selectedDeck, setSelectedDeck] = useState<PublicDeck | null>(null);
  const [downloadCounts, setDownloadCounts] = useState<Record<string, number>>({});
  const { loadDecks, decks } = useDeckStore();
  const { freeDownloadsUsed, incrementFreeDownloads, language } = useAppStore();
  const { isPro, wasPro } = useSubscriptionStore();

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

  // Fetch download counts from Supabase
  useEffect(() => {
    fetchDownloadCounts()
      .then(setDownloadCounts)
      .catch(() => {});
  }, []);

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
      setSelectedDeck(null);
      Alert.alert(
        t('limit_downloads_title'),
        t('limit_downloads_message', { limit: FREE_DOWNLOAD_LIMIT }),
        [
          { text: t('cancel'), style: 'cancel' },
          { text: wasPro ? t('resubscribe') : t('upgrade'), onPress: () => router.push('/paywall') },
        ]
      );
      return;
    }
    if (downloadedIds.has(deck.id)) return;
    setSelectedDeck(null);

    setDownloading(deck.id);
    try {
      const cards = getStaticDeckCards(deck.id);
      const newDeck = await createDeck({
        name: deck.name,
        description: deck.description,
        name_translations: deck.name_translations,
        description_translations: deck.description_translations,
        supported_languages: deck.supported_languages,
        icon: deck.icon_url ?? 'book-outline',
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
      // Track download count in Supabase (fire-and-forget)
      incrementDownloadCount(deck.id).catch(() => {});
      setDownloadCounts((prev) => ({ ...prev, [deck.id]: (prev[deck.id] ?? 0) + 1 }));
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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Fixed header: logo + tabs */}
      <View style={styles.header}>
        <TabHeader />

        <View style={styles.tabBar}>
          {(['discover', 'browse', 'search'] as Tab[]).map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
                {t(tab)}
              </Text>
            </Pressable>
          ))}
        </View>

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
      {activeTab === 'search' ? (
        <SearchTab
          searchQuery={searchQuery}
          onChangeQuery={setSearchQuery}
          results={searchResults}
          downloading={downloading}
          downloadedIds={downloadedIds}
          downloadCounts={downloadCounts}
          onDownload={handleDownload}
          onSelect={setSelectedDeck}
        />
      ) : activeTab === 'discover' ? (
        <DiscoverTab
          featuredDecks={featuredDecks}
          editorsChoiceDecks={editorsChoiceDecks}
          downloading={downloading}
          downloadedIds={downloadedIds}
          downloadCounts={downloadCounts}
          onDownload={handleDownload}
          onSelect={setSelectedDeck}
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
          downloadCounts={downloadCounts}
          onDownload={handleDownload}
          onSelect={setSelectedDeck}
        />
      )}

      {/* Deck detail popup */}
      {selectedDeck && (
        <DeckDetailModal
          deck={selectedDeck}
          isDownloading={downloading === selectedDeck.id}
          isDownloaded={downloadedIds.has(selectedDeck.id)}
          downloadCount={downloadCounts[selectedDeck.id] ?? 0}
          onDownload={handleDownload}
          onDismiss={() => setSelectedDeck(null)}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Search Tab ───────────────────────────────────────────────────────────────

function SearchTab({
  searchQuery,
  onChangeQuery,
  results,
  downloading,
  downloadedIds,
  downloadCounts,
  onDownload,
  onSelect,
}: {
  searchQuery: string;
  onChangeQuery: (q: string) => void;
  results: PublicDeck[];
  downloading: string | null;
  downloadedIds: Set<string>;
  downloadCounts: Record<string, number>;
  onDownload: (d: PublicDeck) => void;
  onSelect: (d: PublicDeck) => void;
}) {
  const { t } = useTranslation();
  const hasQuery = searchQuery.trim().length > 0;
  return (
    <View style={styles.flex}>
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder={t('search_library')}
          value={searchQuery}
          onChangeText={onChangeQuery}
        />
      </View>
      <ScrollView contentContainerStyle={styles.tabContent}>
        {!hasQuery ? (
          <Text style={styles.emptyText}>{t('search_hint')}</Text>
        ) : results.length === 0 ? (
          <Text style={styles.emptyText}>{t('no_decks_found')}</Text>
        ) : (
          results.map((deck) => (
            <BrowseDeckCard
              key={deck.id}
              deck={deck}
              isDownloading={downloading === deck.id}
              isDownloaded={downloadedIds.has(deck.id)}
              downloadCount={downloadCounts[deck.id] ?? 0}
              onDownload={onDownload}
              onSelect={onSelect}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ─── Discover Tab ──────────────────────────────────────────────────────────────

function DiscoverTab({
  featuredDecks,
  editorsChoiceDecks,
  downloading,
  downloadedIds,
  downloadCounts,
  onDownload,
  onSelect,
}: {
  featuredDecks: PublicDeck[];
  editorsChoiceDecks: PublicDeck[];
  downloading: string | null;
  downloadedIds: Set<string>;
  downloadCounts: Record<string, number>;
  onDownload: (d: PublicDeck) => void;
  onSelect: (d: PublicDeck) => void;
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
                downloadCount={downloadCounts[deck.id] ?? 0}
                onDownload={onDownload}
                onSelect={onSelect}
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
              downloadCount={downloadCounts[deck.id] ?? 0}
              onDownload={onDownload}
              onSelect={onSelect}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// ─── Browse Tab ────────────────────────────────────────────────────────────────

function FilterPickerModal<T extends string>({
  visible,
  onClose,
  title,
  options,
  selected,
  onSelect,
  iconType = 'emoji',
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: { key: T; label: string; icon?: string }[];
  selected: T;
  onSelect: (key: T) => void;
  iconType?: 'emoji' | 'ionicon';
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.popupBackdrop} onPress={onClose}>
        <Pressable style={styles.popupContainer} onPress={() => {}}>
          <Text style={styles.popupTitle}>{title}</Text>
          <ScrollView style={styles.popupList} bounces={false}>
            {options.map(({ key, label, icon }) => {
              const isSelected = key === selected;
              return (
                <Pressable
                  key={key}
                  style={({ pressed }) => [
                    styles.popupItem,
                    isSelected && styles.popupItemSelected,
                    pressed && styles.popupItemPressed,
                  ]}
                  onPress={() => { onSelect(key); onClose(); }}
                >
                  {icon ? (
                    iconType === 'ionicon' ? (
                      <View style={styles.popupItemIconWrap}>
                        <Ionicons name={icon as any} size={22} color={isSelected ? colors.primary : colors.textSecondary} />
                      </View>
                    ) : (
                      <Text style={styles.popupItemIcon}>{icon}</Text>
                    )
                  ) : null}
                  <Text style={[styles.popupItemLabel, isSelected && styles.popupItemLabelSelected]}>
                    {label}
                  </Text>
                  {isSelected && <Text style={styles.popupCheck}>✓</Text>}
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', de: 'Deutsch', es: 'Español', fr: 'Français',
  it: 'Italiano', nl: 'Nederlands', pt_BR: 'Português (BR)',
  pt_PT: 'Português (PT)', ru: 'Русский', tr: 'Türkçe', zh: '中文',
};

function BrowseTab({
  decks,
  selectedCategory,
  onSelectCategory,
  selectedLanguage,
  onSelectLanguage,
  languageFilters,
  downloading,
  downloadedIds,
  downloadCounts,
  onDownload,
  onSelect,
}: {
  decks: PublicDeck[];
  selectedCategory: string;
  onSelectCategory: (key: string) => void;
  selectedLanguage: string;
  onSelectLanguage: (key: string) => void;
  languageFilters: Language[];
  downloading: string | null;
  downloadedIds: Set<string>;
  downloadCounts: Record<string, number>;
  onDownload: (d: PublicDeck) => void;
  onSelect: (d: PublicDeck) => void;
}) {
  const { t } = useTranslation();
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showCatPicker, setShowCatPicker] = useState(false);

  const langOptions = useMemo(() => [
    { key: 'all' as string, label: t('all_languages'), icon: '🌐' },
    ...languageFilters.map((lang) => ({
      key: lang as string,
      label: LANGUAGE_NAMES[lang] ?? lang,
      icon: LANGUAGE_FLAGS[lang],
    })),
  ], [languageFilters, t]);

  const catOptions = useMemo(() =>
    CATEGORY_KEYS.map((cat) => ({
      key: cat.key,
      label: t(cat.labelKey),
      icon: cat.icon,
    })),
  [t]);

  const selectedLangLabel = selectedLanguage === 'all'
    ? t('language')
    : (LANGUAGE_NAMES[selectedLanguage] ?? selectedLanguage);
  const selectedLangIcon = selectedLanguage === 'all' ? '🌐' : (LANGUAGE_FLAGS[selectedLanguage as Language] ?? '🌐');

  const selectedCat = CATEGORY_KEYS.find((c) => c.key === selectedCategory) ?? CATEGORY_KEYS[0];
  const selectedCatLabel = selectedCategory === 'all' ? t('category') : t(selectedCat.labelKey);
  const selectedCatIcon = selectedCat.icon;

  return (
    <View style={styles.flex}>
      {/* Compact filter row */}
      <View style={styles.filterRow}>
        {languageFilters.length > 0 && (
          <Pressable
            style={({ pressed }) => [styles.filterBtn, pressed && styles.filterBtnPressed]}
            onPress={() => setShowLangPicker(true)}
          >
            <Text style={styles.filterBtnIcon}>{selectedLangIcon}</Text>
            <Text style={styles.filterBtnLabel} numberOfLines={1}>{selectedLangLabel}</Text>
            <Text style={styles.filterChevron}>›</Text>
          </Pressable>
        )}
        <Pressable
          style={({ pressed }) => [styles.filterBtn, pressed && styles.filterBtnPressed]}
          onPress={() => setShowCatPicker(true)}
        >
          <Ionicons name={selectedCatIcon as any} size={18} color={colors.textSecondary} />
          <Text style={styles.filterBtnLabel} numberOfLines={1}>{selectedCatLabel}</Text>
          <Text style={styles.filterChevron}>›</Text>
        </Pressable>
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
            downloadCount={downloadCounts[deck.id] ?? 0}
            onDownload={onDownload}
            onSelect={onSelect}
          />
        ))}
      </ScrollView>

      <FilterPickerModal
        visible={showLangPicker}
        onClose={() => setShowLangPicker(false)}
        title={t('select_language')}
        options={langOptions}
        selected={selectedLanguage}
        onSelect={onSelectLanguage}
      />
      <FilterPickerModal
        visible={showCatPicker}
        onClose={() => setShowCatPicker(false)}
        title={t('select_category')}
        options={catOptions}
        iconType="ionicon"
        selected={selectedCategory}
        onSelect={onSelectCategory}
      />
    </View>
  );
}

// ─── Card Components ───────────────────────────────────────────────────────────

function FeaturedDeckCard({
  deck,
  onDownload,
  isDownloading,
  isDownloaded,
  downloadCount,
  onSelect,
}: {
  deck: PublicDeck;
  onDownload: (d: PublicDeck) => void;
  isDownloading: boolean;
  isDownloaded: boolean;
  downloadCount: number;
  onSelect: (d: PublicDeck) => void;
}) {
  const { t } = useTranslation();
  const name = useResolvedDeckName(deck);
  return (
    <Pressable style={styles.featuredCard} onPress={() => onSelect(deck)}>
      <View style={styles.featuredIcon}>
        {renderIcon(deck.icon_url, deck.category, 28, colors.primary)}
      </View>
      <Text style={styles.featuredName} numberOfLines={2}>{name}</Text>
      <View style={styles.featuredMeta}>
        <Text style={styles.featuredCount}>{t('cards_count', { count: deck.card_count })}</Text>
        <LanguageBadge supported_languages={deck.supported_languages} />
      </View>
      {downloadCount > 0 && (
        <Text style={styles.downloadCountText}>{formatCount(downloadCount)} {t('download').toLowerCase()}s</Text>
      )}
      {isDownloaded && (
        <View style={styles.downloadedBadge}>
          <Ionicons name="checkmark" size={14} color={colors.white} />
          <Text style={styles.downloadedBadgeText}> {t('downloaded')}</Text>
        </View>
      )}
    </Pressable>
  );
}

function EditorsChoiceDeckCard({
  deck,
  onDownload,
  isDownloading,
  isDownloaded,
  downloadCount,
  onSelect,
}: {
  deck: PublicDeck;
  onDownload: (d: PublicDeck) => void;
  isDownloading: boolean;
  isDownloaded: boolean;
  downloadCount: number;
  onSelect: (d: PublicDeck) => void;
}) {
  const { t } = useTranslation();
  const name = useResolvedDeckName(deck);
  return (
    <Pressable style={[styles.editorsCard, { backgroundColor: getCategoryBg(deck.category) }]} onPress={() => onSelect(deck)}>
      <View style={styles.editorsCardLeft}>
        <View style={styles.editorsBadge}>
          <Text style={styles.editorsBadgeText}>{t('editors_choice_badge')}</Text>
        </View>
        <Text style={styles.editorsName}>{name}</Text>
        <View style={styles.editorsMetaRow}>
          <Text style={styles.editorsCount}>{deck.card_count} cards</Text>
          <LanguageBadge supported_languages={deck.supported_languages} />
        </View>
        {downloadCount > 0 && (
          <Text style={styles.downloadCountText}>{formatCount(downloadCount)} {t('download').toLowerCase()}s</Text>
        )}
      </View>
      <View style={styles.editorsCardRight}>
        {renderIcon(deck.icon_url, deck.category, 36, colors.primary)}
        {isDownloaded && (
          <View style={styles.downloadedBadgeSmall}>
            <Ionicons name="checkmark" size={18} color={colors.white} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

function BrowseDeckCard({
  deck,
  onDownload,
  isDownloading,
  isDownloaded,
  downloadCount,
  onSelect,
}: {
  deck: PublicDeck;
  onDownload: (d: PublicDeck) => void;
  isDownloading: boolean;
  isDownloaded: boolean;
  downloadCount: number;
  onSelect: (d: PublicDeck) => void;
}) {
  const { t } = useTranslation();
  const name = useResolvedDeckName(deck);
  return (
    <Pressable style={styles.browseCard} onPress={() => onSelect(deck)}>
      <View style={[styles.browseIcon, { backgroundColor: getCategoryBg(deck.category) }]}>
        {renderIcon(deck.icon_url, deck.category, 24, colors.primary)}
      </View>
      <View style={styles.browseInfo}>
        <Text style={styles.browseName} numberOfLines={1}>{name}</Text>
        <View style={styles.browseMetaRow}>
          <Text style={styles.browseCount}>{t('cards_count', { count: deck.card_count })}</Text>
          {downloadCount > 0 && (
            <>
              <Text style={styles.browseCount}>·</Text>
              <Text style={styles.browseCount}>{formatCount(downloadCount)}↓</Text>
            </>
          )}
          <LanguageBadge supported_languages={deck.supported_languages} />
        </View>
      </View>
      {isDownloaded && (
        <View style={styles.downloadedBadge}>
          <Ionicons name="checkmark" size={14} color={colors.white} />
          <Text style={styles.downloadedBadgeText}> {t('downloaded')}</Text>
        </View>
      )}
    </Pressable>
  );
}

// ─── Deck Detail Modal ────────────────────────────────────────────────────────

function DeckDetailModal({
  deck,
  isDownloading,
  isDownloaded,
  downloadCount,
  onDownload,
  onDismiss,
}: {
  deck: PublicDeck;
  isDownloading: boolean;
  isDownloaded: boolean;
  downloadCount: number;
  onDownload: (d: PublicDeck) => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  const { language } = useAppStore();
  const name = resolveTranslation(deck.name_translations, deck.name, language);
  const description = resolveTranslation(deck.description_translations, deck.description ?? '', language);
  const categoryLabel = getCategoryLabel(deck.category);

  return (
    <Modal transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.modalOverlay} onPress={onDismiss}>
        <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
          {/* Icon */}
          <View style={[styles.modalIconCircle, { backgroundColor: getCategoryBg(deck.category) }]}>
            {renderIcon(deck.icon_url, deck.category, 36, colors.primary)}
          </View>

          {/* Name */}
          <Text style={styles.modalName}>{name}</Text>

          {/* Meta row */}
          <View style={styles.modalMetaRow}>
            <View style={styles.modalMetaChip}>
              <Text style={styles.modalMetaText}>{t('cards_count', { count: deck.card_count })}</Text>
            </View>
            <View style={styles.modalMetaChip}>
              <Text style={styles.modalMetaText}>{categoryLabel}</Text>
            </View>
            <LanguageBadge supported_languages={deck.supported_languages} />
          </View>

          {/* Download count */}
          {downloadCount > 0 && (
            <View style={styles.modalDownloadCountRow}>
              <Ionicons name="arrow-down-circle-outline" size={16} color={colors.textMuted} />
              <Text style={styles.modalDownloadCountText}>{t('times_downloaded', { count: formatCount(downloadCount) })}</Text>
            </View>
          )}

          {/* Description */}
          {description ? (
            <Text style={styles.modalDescription}>{description}</Text>
          ) : null}

          {/* Editor's choice badge */}
          {deck.is_editors_choice && (
            <View style={styles.modalEditorsBadge}>
              <Ionicons name="star" size={14} color={colors.primary} />
              <Text style={styles.modalEditorsBadgeText}>{t('editors_choice_badge')}</Text>
            </View>
          )}

          {/* Action button */}
          {isDownloaded ? (
            <View style={styles.modalDownloadedBtn}>
              <Ionicons name="checkmark-circle" size={20} color={colors.white} />
              <Text style={styles.modalDownloadedText}>{t('downloaded')}</Text>
            </View>
          ) : (
            <Pressable
              style={[styles.modalDownloadBtn, isDownloading && styles.downloadBtnDisabled]}
              onPress={() => onDownload(deck)}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Ionicons name="download-outline" size={20} color={colors.white} />
                  <Text style={styles.modalDownloadText}>{t('download')}</Text>
                </>
              )}
            </Pressable>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function isIonicon(icon: string): boolean {
  return /^[a-z]/.test(icon);
}

function renderIcon(icon: string | undefined | null, category: string, size: number, color: string) {
  if (icon && !isIonicon(icon)) {
    // It's an emoji (e.g. flag)
    return <Text style={{ fontSize: size - 4 }}>{icon}</Text>;
  }
  const ionName = icon && isIonicon(icon) ? icon : getCategoryIcon(category);
  return <Ionicons name={ionName as any} size={size} color={color} />;
}

function getCategoryIcon(category: string): string {
  const map: Record<string, string> = {
    languages: 'chatbubbles-outline', anatomy: 'body-outline', mcat: 'fitness-outline',
    science: 'flask-outline', history: 'time-outline', business: 'briefcase-outline',
    math: 'calculator-outline', medical: 'medkit-outline', technology: 'hardware-chip-outline',
    psychology: 'bulb-outline', exams: 'school-outline', make_money: 'cash-outline',
    default: 'book-outline',
  };
  return map[category.toLowerCase()] ?? map.default;
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return String(count);
}

function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    languages: 'Languages', anatomy: 'Anatomy', mcat: 'MCAT', science: 'Science',
    history: 'History', business: 'Business', math: 'Mathematics', medical: 'Medical',
    technology: 'Technology', psychology: 'Psychology', exams: 'Exams', make_money: 'Make Money',
  };
  return map[category.toLowerCase()] ?? category;
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnPressed: { opacity: 0.7 },
  filterBtnIcon: { fontSize: 18 },
  filterBtnLabel: { ...typography.small, color: colors.textPrimary, fontWeight: '500', flex: 1 },
  filterChevron: { fontSize: 18, color: colors.textMuted },
  popupBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  popupContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    width: '100%',
    maxHeight: '70%',
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  popupTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  popupList: { paddingHorizontal: spacing.sm },
  popupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
    marginVertical: 2,
  },
  popupItemSelected: { backgroundColor: colors.primaryLight },
  popupItemPressed: { opacity: 0.7 },
  popupItemIcon: { fontSize: 24, marginRight: spacing.md },
  popupItemIconWrap: { width: 28, alignItems: 'center' as const, marginRight: spacing.md },
  popupItemLabel: { ...typography.body, color: colors.textPrimary, flex: 1 },
  popupItemLabelSelected: { ...typography.bodyBold, color: colors.primary },
  popupCheck: { ...typography.bodyBold, color: colors.primary, fontSize: 18 },
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

  // Deck detail modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  modalIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalIconText: { fontSize: 36 },
  modalName: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  modalMetaChip: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  modalMetaText: { ...typography.small, color: colors.textSecondary },
  modalDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  modalEditorsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  modalEditorsBadgeText: { ...typography.captionBold, color: colors.primary },
  modalDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: 14,
    width: '100%',
  },
  modalDownloadText: { ...typography.button, color: colors.white, fontSize: 16 },
  modalDownloadedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.learning,
    borderRadius: borderRadius.lg,
    paddingVertical: 14,
    width: '100%',
  },
  modalDownloadedText: { ...typography.button, color: colors.white, fontSize: 16 },
  modalDownloadCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  modalDownloadCountText: { ...typography.caption, color: colors.textMuted },
  downloadCountText: { ...typography.small, color: colors.textMuted, marginTop: 2 },
});
