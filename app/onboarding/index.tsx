import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  SharedValue,
} from 'react-native-reanimated';
import { SynapsLogo } from '../../src/components/ui/SynapsLogo';
import { WelcomeHero } from '../../src/components/onboarding/WelcomeHero';
import { SrsHero } from '../../src/components/onboarding/SrsHero';
import { LibraryHero } from '../../src/components/onboarding/LibraryHero';
import { AchievementsHero } from '../../src/components/onboarding/AchievementsHero';
import { LeaderboardHero } from '../../src/components/onboarding/LeaderboardHero';
import { colors, spacing, typography } from '../../src/constants';
import { useTranslation } from '../../src/i18n';

const { width } = Dimensions.get('window');

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

// Each slide uses tones derived from the logo gradient: blue → purple → pink → purple-pink
const SLIDES = [
  {
    key: 'welcome',
    icon: null as IoniconName | null,
    useAppIcon: true,
    titleKey: 'onboarding_welcome_title',
    subtitleKey: 'onboarding_welcome_subtitle' as string | null,
    bgColor: '#D4D8F6',
    glowColor: 'rgba(67, 97, 238, 0.13)',
    iconColors: ['#4361EE', '#7C3AED'] as [string, string],
  },
  {
    key: 'srs',
    icon: 'bulb-outline' as IoniconName,
    useAppIcon: false,
    titleKey: 'onboarding_srs_title',
    subtitleKey: 'onboarding_srs_subtitle' as string | null,
    bgColor: '#E2D8FA',
    glowColor: 'rgba(124, 58, 237, 0.13)',
    iconColors: ['#7C3AED', '#9333EA'] as [string, string],
  },
  {
    key: 'library',
    icon: 'library-outline' as IoniconName,
    useAppIcon: false,
    titleKey: 'onboarding_library_title',
    subtitleKey: 'onboarding_library_subtitle' as string | null,
    bgColor: '#F8D8EE',
    glowColor: 'rgba(236, 72, 153, 0.13)',
    iconColors: ['#EC4899', '#DB2777'] as [string, string],
  },
  {
    key: 'achievements',
    icon: 'trophy-outline' as IoniconName,
    useAppIcon: false,
    titleKey: 'onboarding_start_title',
    subtitleKey: 'onboarding_start_subtitle' as string | null,
    bgColor: '#EDD8F8',
    glowColor: 'rgba(155, 60, 220, 0.13)',
    iconColors: ['#8B5CF6', '#EC4899'] as [string, string],
  },
  {
    key: 'leaderboard',
    icon: 'podium-outline' as IoniconName,
    useAppIcon: false,
    titleKey: 'onboarding_leaderboard_title',
    subtitleKey: 'onboarding_leaderboard_subtitle' as string | null,
    bgColor: '#D4F0E8',
    glowColor: 'rgba(16, 185, 129, 0.13)',
    iconColors: ['#10B981', '#0EA5E9'] as [string, string],
  },
];

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<(typeof SLIDES)[0]>);

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  // Full-screen background crossfades between each slide's color as you swipe
  const animatedBg = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      scrollX.value,
      SLIDES.map((_, i) => i * width),
      SLIDES.map((s) => s.bgColor)
    ),
  }));

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const handleSkip = () => {
    router.replace('/onboarding/att');
  };

  const handleGetStarted = () => {
    router.replace('/onboarding/att');
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.root}>
      {/* Animated background — changes color per slide */}
      <Animated.View style={[StyleSheet.absoluteFill, animatedBg]} />

      {/* White-to-transparent overlay so the top area stays light */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0)']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Decorative arc */}
      <View style={styles.bgCircle} pointerEvents="none" />

      <SafeAreaView style={styles.safe}>
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
          renderItem={({ item, index }) => (
            <View style={[styles.slide, { width }]}>
              {item.key === 'welcome' ? (
                <WelcomeHero />
              ) : item.key === 'srs' ? (
                <SrsHero active={currentIndex === index} />
              ) : item.key === 'library' ? (
                <LibraryHero active={currentIndex === index} />
              ) : item.key === 'achievements' ? (
                <AchievementsHero active={currentIndex === index} />
              ) : item.key === 'leaderboard' ? (
                <LeaderboardHero active={currentIndex === index} />
              ) : (
                <View style={[styles.glowWrapper, { backgroundColor: item.glowColor }]}>
                  <LinearGradient
                    colors={item.iconColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconCircle}
                  >
                    <Ionicons name={item.icon!} size={80} color="#FFFFFF" />
                  </LinearGradient>
                </View>
              )}
              <Animated.Text
                entering={FadeInDown.delay(item.useAppIcon ? 400 : 0).duration(500).springify()}
                style={styles.slideTitle}
              >
                {t(item.titleKey)}
              </Animated.Text>
              {item.subtitleKey && (
                <Animated.Text
                  entering={FadeInDown.delay(item.useAppIcon ? 600 : 150).duration(500).springify()}
                  style={styles.slideSubtitle}
                >
                  {t(item.subtitleKey)}
                </Animated.Text>
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

        {/* Bottom button */}
        <View style={styles.bottomArea}>
          <Pressable
            onPress={isLastSlide ? handleGetStarted : handleNext}
            style={styles.primaryBtnWrapper}
          >
            <LinearGradient
              colors={['#4361EE', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>
                {isLastSlide ? t('get_started') : t('next')}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function DotIndicator({ index, scrollX }: { index: number; scrollX: SharedValue<number> }) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const dotWidth = interpolate(scrollX.value, inputRange, [8, 24, 8], 'clamp');
    const opacity = interpolate(scrollX.value, inputRange, [0.35, 1, 0.35], 'clamp');
    return { width: dotWidth, opacity };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  skipBtn: { padding: spacing.sm },
  skipText: { ...typography.body, color: colors.textSecondary },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  glowWrapper: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  appIcon: {
    width: 176,
    height: 176,
    borderRadius: 88,
  },
  iconCircle: {
    width: 176,
    height: 176,
    borderRadius: 88,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    ...typography.body,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 26,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  bottomArea: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  primaryBtnWrapper: { width: '100%' },
  primaryBtn: {
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  bgCircle: {
    position: 'absolute',
    width: 800,
    height: 800,
    borderRadius: 400,
    borderWidth: 1.5,
    borderColor: 'rgba(100, 80, 200, 0.12)',
    right: -420,
    bottom: -180,
  },
});
