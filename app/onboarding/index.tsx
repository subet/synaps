import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,

  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  SharedValue,
} from 'react-native-reanimated';
import { Button } from '../../src/components/ui/Button';
import { borderRadius, colors, spacing, typography } from '../../src/constants';
import { useTranslation } from '../../src/i18n';
import { requestNotificationPermissions } from '../../src/services/notifications';
import { useAppStore } from '../../src/stores/useAppStore';

const { width } = Dimensions.get('window');

const SLIDES = [
  { key: 'welcome', emoji: '🧠', titleKey: 'onboarding_welcome_title', subtitleKey: 'onboarding_welcome_subtitle', bg: '#E8EDFF' },
  { key: 'srs', emoji: '🔄', titleKey: 'onboarding_srs_title', subtitleKey: 'onboarding_srs_subtitle', bg: '#E8FFE8' },
  { key: 'library', emoji: '📚', titleKey: 'onboarding_library_title', subtitleKey: 'onboarding_library_subtitle', bg: '#FFF3CD' },
  { key: 'start', emoji: '🚀', titleKey: 'onboarding_start_title', subtitleKey: null, bg: '#FFE8EC' },
];

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<(typeof SLIDES)[0]>);

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { markOnboardingComplete } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const handleSkip = async () => {
    await markOnboardingComplete();
    router.replace('/(tabs)');
  };

  const handleGetStarted = async () => {
    await requestNotificationPermissions();
    await markOnboardingComplete();
    router.replace('/auth/register');
  };

  const handleContinueWithout = async () => {
    await requestNotificationPermissions();
    await markOnboardingComplete();
    router.replace('/(tabs)');
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Skip button */}
      {!isLastSlide && (
        <Pressable style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>{t('skip')}</Text>
        </Pressable>
      )}

      {/* Slides */}
      <AnimatedFlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.emojiContainer, { backgroundColor: item.bg }]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={styles.slideTitle}>{t(item.titleKey)}</Text>
            {item.subtitleKey && (
              <Text style={styles.slideSubtitle}>{t(item.subtitleKey)}</Text>
            )}
            {item.key === 'start' && (
              <View style={styles.startButtons}>
                <Button label={t('onboarding_create_account')} onPress={handleGetStarted} />
                <Button
                  label={t('onboarding_continue_without')}
                  onPress={handleContinueWithout}
                  variant="secondary"
                  style={{ marginTop: spacing.sm }}
                />
                <Text style={styles.lateNote}>{t('onboarding_later_note')}</Text>
              </View>
            )}
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, idx) => (
          <DotIndicator key={idx} index={idx} scrollX={scrollX} />
        ))}
      </View>

      {/* Next button (not shown on last slide) */}
      {!isLastSlide && (
        <View style={styles.nextContainer}>
          <Button label={t('next')} onPress={handleNext} />
        </View>
      )}
    </SafeAreaView>
  );
}

function DotIndicator({ index, scrollX }: { index: number; scrollX: SharedValue<number> }) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const width2 = interpolate(scrollX.value, inputRange, [8, 20, 8], 'clamp');
    const opacity = interpolate(scrollX.value, inputRange, [0.4, 1, 0.4], 'clamp');
    return { width: width2, opacity };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  skipBtn: { position: 'absolute', top: 56, right: spacing.md, zIndex: 10, padding: spacing.sm },
  skipText: { ...typography.body, color: colors.textSecondary },
  slide: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: 80,
  },
  emojiContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emoji: { fontSize: 80 },
  slideTitle: { ...typography.h1, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.md },
  slideSubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 26 },
  startButtons: { width: '100%', marginTop: spacing.xl },
  lateNote: { ...typography.small, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: spacing.lg },
  dot: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  nextContainer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
});
