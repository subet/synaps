import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useMemo } from 'react';
import {
  AppState,
  AppStateStatus,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { RatingButtons } from '../../src/components/study/RatingButtons';
import { FlashCard } from '../../src/components/study/FlashCard';
import { Button } from '../../src/components/ui/Button';
import { colors, spacing, typography } from '../../src/constants';
import { useTranslation } from '../../src/i18n';
import { getPreviewIntervals } from '../../src/services/srs';
import { useBadgeStore } from '../../src/stores/useBadgeStore';
import { useDeckStore } from '../../src/stores/useDeckStore';
import { useStudyStore } from '../../src/stores/useStudyStore';
import { useStreakStore } from '../../src/stores/useStreakStore';
import { SRSGrade, StudySessionResult } from '../../src/types';

const LANGUAGE_CODES: Record<string, string> = {
  'deck-german-vocab': 'de',
  'deck-spanish-vocab': 'es',
  'deck-french-vocab': 'fr',
  'deck-turkish-vocab': 'tr',
  'deck-dutch-vocab': 'nl',
  'deck-russian-vocab': 'ru',
  'deck-arabic-vocab': 'ar',
  'deck-chinese-vocab': 'zh',
};

export default function StudyScreen() {
  const { t } = useTranslation();
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const { getDeckById, loadDeckStats, deckStats } = useDeckStore();
  const { loadStreak } = useStreakStore();
  const { checkBadges } = useBadgeStore();
  const {
    startSession,
    queue,
    currentIndex,
    isFlipped,
    flipCard,
    gradeCard,
    resetSession,
    pauseCardTimer,
    resumeCardTimer,
    isSessionComplete,
    sessionResult,
  } = useStudyStore();

  const deck = getDeckById(deckId);
  const speakLanguage = deck?.source_id ? LANGUAGE_CODES[deck.source_id] : undefined;
  const currentCard = queue[currentIndex];

  const progressWidth = useSharedValue(0);

  useEffect(() => {
    startSession(deckId);
    loadDeckStats(deckId);
    return () => { resetSession(); };
  }, [deckId]);

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        pauseCardTimer();
      } else if (nextState === 'active') {
        resumeCardTimer();
      }
    };
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, []);

  // Overall deck progress: studied (learning + mastered) / total
  useEffect(() => {
    const stats = deckStats[deckId];
    if (stats && stats.total > 0) {
      const pct = (stats.learning + stats.mastered) / stats.total;
      progressWidth.value = withTiming(pct, { duration: 300 });
    }
  }, [deckStats[deckId]]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  const intervals = useMemo(
    () => currentCard ? getPreviewIntervals(currentCard) : { again: '1 min', hard: '5 min', good: '10 min', easy: '13 days' },
    [currentCard]
  );

  const handleGrade = async (grade: SRSGrade) => {
    await gradeCard(grade);
    if (isSessionComplete) {
      loadDeckStats(deckId);
      loadStreak();
      checkBadges();
    }
  };

  if (isSessionComplete && sessionResult) {
    return <SessionComplete result={sessionResult} deckId={deckId} />;
  }

  if (!currentCard) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>✅</Text>
          <Text style={styles.emptyTitle}>{t('no_cards_due')}</Text>
          <Text style={styles.emptySubtitle}>{t('caught_up')}</Text>
          <Button label={t('back_to_deck')} onPress={() => router.back()} style={styles.backBtn} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.counter}>
          {currentIndex + 1} / {queue.length}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </View>

      {/* Card */}
      <View style={styles.cardArea}>
        <FlashCard
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={flipCard}
          reversed={deck?.reverse_cards}
          speakLanguage={speakLanguage}
          deckIcon={deck?.icon}
        />
      </View>

      {/* Rating buttons (shown after flip) */}
      {isFlipped ? (
        <RatingButtons onGrade={handleGrade} intervals={intervals} />
      ) : (
        <View style={styles.flipHint}>
          <Text style={styles.flipHintText}>{t('tap_to_reveal')}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

function SessionComplete({
  result,
  deckId,
}: {
  result: StudySessionResult;
  deckId: string;
}) {
  const { t } = useTranslation();
  const { loadStreak } = useStreakStore();
  const accuracy = result.cardsStudied > 0
    ? Math.round((result.cardsCorrect / result.cardsStudied) * 100)
    : 0;

  const minutes = Math.floor(result.durationSeconds / 60);
  const seconds = result.durationSeconds % 60;
  const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  const total = result.cardsStudied;

  useEffect(() => { loadStreak(); }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.completeContainer}>
        <Text style={styles.celebEmoji}>🎉</Text>
        <Text style={styles.completeTitle}>{t('session_complete_title')}</Text>

        <View style={styles.statsGrid}>
          <StatItem emoji="📚" label={t('cards_studied_label')} value={String(result.cardsStudied)} />
          <StatItem emoji="⏱️" label={t('time_spent_label')} value={timeStr} />
          <StatItem emoji="🎯" label={t('accuracy_label')} value={`${accuracy}%`} />
        </View>

        {/* Grade breakdown */}
        {total > 0 && (
          <View style={styles.gradeBreakdown}>
            <GradeBar
              label={t('again')}
              count={result.gradeDistribution.again}
              total={total}
              color={colors.againText}
              bg={colors.again}
            />
            <GradeBar
              label={t('hard')}
              count={result.gradeDistribution.hard}
              total={total}
              color={colors.hardText}
              bg={colors.hard}
            />
            <GradeBar
              label={t('good')}
              count={result.gradeDistribution.good}
              total={total}
              color={colors.goodText}
              bg={colors.good}
            />
            <GradeBar
              label={t('easy')}
              count={result.gradeDistribution.easy}
              total={total}
              color={colors.easyText}
              bg={colors.easy}
            />
          </View>
        )}

        <Button label={t('back_to_deck')} onPress={() => router.replace(`/deck/${deckId}`)} style={styles.backBtn} />
      </View>
    </SafeAreaView>
  );
}

function StatItem({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function GradeBar({ label, count, total, color, bg }: { label: string; count: number; total: number; color: string; bg: string }) {
  const pct = total > 0 ? count / total : 0;
  return (
    <View style={styles.gradeRow}>
      <Text style={[styles.gradeLabel, { color }]}>{label}</Text>
      <View style={styles.gradeBarTrack}>
        <View style={[styles.gradeBarFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.gradeCount, { color }]}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  closeBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  closeText: { fontSize: 18, color: colors.textSecondary },
  counter: { ...typography.bodyBold, color: colors.textPrimary },
  progressTrack: {
    height: 4,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.md,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressFill: { height: 4, backgroundColor: colors.primary, borderRadius: 2 },
  cardArea: { flex: 1, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  flipHint: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  flipHintText: { ...typography.caption, color: colors.textMuted },
  // Empty state
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 64, marginBottom: spacing.lg },
  emptyTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm, textAlign: 'center' },
  emptySubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  backBtn: { marginTop: spacing.sm },
  // Session complete
  completeContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  celebEmoji: { fontSize: 72, marginBottom: spacing.md },
  completeTitle: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.xl, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl, width: '100%', justifyContent: 'center' },
  statItem: { alignItems: 'center', flex: 1 },
  statEmoji: { fontSize: 28, marginBottom: spacing.xs },
  statValue: { ...typography.h2, color: colors.textPrimary, marginBottom: 2 },
  statLabel: { ...typography.small, color: colors.textSecondary, textAlign: 'center' },
  gradeBreakdown: { width: '100%', gap: spacing.sm, marginBottom: spacing.xl },
  gradeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  gradeLabel: { ...typography.captionBold, width: 40 },
  gradeBarTrack: { flex: 1, height: 8, backgroundColor: colors.borderLight, borderRadius: 4, overflow: 'hidden' },
  gradeBarFill: { height: 8, borderRadius: 4 },
  gradeCount: { ...typography.captionBold, width: 24, textAlign: 'right' },
});
