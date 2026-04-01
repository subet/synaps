import React, { useEffect, useRef } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { speak as speechSpeak } from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { Card } from '../../types';
import { useResolvedBack, useResolvedFront } from '../../utils/translations';

// Per-language card colors & flags
const LANGUAGE_META: Record<string, { color: string; flag: string }> = {
  de: { color: '#667eea', flag: '🇩🇪' },
  es: { color: '#f5576c', flag: '🇪🇸' },
  fr: { color: '#4facfe', flag: '🇫🇷' },
  tr: { color: '#fda085', flag: '🇹🇷' },
  nl: { color: '#fa709a', flag: '🇳🇱' },
  ru: { color: '#a18cd1', flag: '🇷🇺' },
  ar: { color: '#43e97b', flag: '🇸🇦' },
  zh: { color: '#ff0844', flag: '🇨🇳' },
};

const DEFAULT_COLOR = '#4361EE';

function dynamicFontSize(text: string, max: number, min: number): number {
  const len = text.length;
  if (len <= 30) return max;
  if (len >= 200) return min;
  // Linear interpolation between max and min
  return Math.round(max - ((max - min) * (len - 30)) / 170);
}

interface FlashCardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
  reversed?: boolean;
  speakLanguage?: string;
  deckIcon?: string;
}

export function FlashCard({
  card,
  isFlipped,
  onFlip,
  reversed = false,
  speakLanguage,
  deckIcon,
}: FlashCardProps) {
  const rotation = useSharedValue(0);
  const prevCardId = useRef(card.id);

  useEffect(() => {
    const cardChanged = prevCardId.current !== card.id;
    prevCardId.current = card.id;

    if (cardChanged) {
      // New card: cancel any animation and snap to front instantly
      cancelAnimation(rotation);
      rotation.value = 0;
    } else {
      // Same card: user tapped — animate flip in either direction
      rotation.value = withTiming(isFlipped ? 1 : 0, { duration: 380 });
    }
  }, [card.id, isFlipped]);

  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 0.5, 1], [0, 90, 180]);
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
      opacity: rotation.value < 0.5 ? 1 : 0,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 0.5, 1], [180, 270, 360]);
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
      opacity: rotation.value >= 0.5 ? 1 : 0,
    };
  });

  const resolvedFront = useResolvedFront(card);
  const resolvedBack = useResolvedBack(card);
  const frontText = reversed ? resolvedBack : resolvedFront;
  const backText = reversed ? resolvedFront : resolvedBack;
  const frontImage = reversed ? card.back_image : card.front_image;
  const backImage = reversed ? card.front_image : card.back_image;

  const langMeta = speakLanguage ? LANGUAGE_META[speakLanguage] : undefined;
  const cardColor = langMeta?.color ?? DEFAULT_COLOR;
  // Language decks show flag; all other decks show the deck icon
  const cornerIcon = langMeta?.flag ?? deckIcon;

  const handleSpeak = () => {
    if (!speakLanguage) return;
    const text = reversed ? card.front : card.back;
    try {
      speechSpeak(text, { language: speakLanguage });
    } catch {
      // TTS unavailable (e.g. iOS Simulator — works on real device)
    }
  };

  return (
    <Pressable onPress={onFlip} style={styles.wrapper} accessibilityRole="button">
      {/* ── Front ── */}
      <Animated.View style={[styles.card, { backgroundColor: cardColor }, frontStyle]}>
        {/* Shine overlay */}
        <View style={styles.shineOverlay} pointerEvents="none" />

        {cornerIcon ? (
          <View style={styles.flagBadge}>
            {/^[a-z]/.test(cornerIcon) ? (
              <Ionicons name={cornerIcon as any} size={22} color="#fff" />
            ) : (
              <Text style={styles.flagText}>{cornerIcon}</Text>
            )}
          </View>
        ) : null}

        {frontImage ? (
          <Image source={{ uri: frontImage }} style={styles.image} resizeMode="contain" />
        ) : null}

        <Text style={[styles.frontText, { fontSize: dynamicFontSize(frontText, 32, 26) }]}>{frontText}</Text>

        <View style={styles.tapHint}>
          <Text style={styles.tapHintText}>Tap to reveal</Text>
        </View>
      </Animated.View>

      {/* ── Back ── */}
      <Animated.View style={[styles.card, styles.cardBack, backStyle]}>
        {/* Flag + speak — top-right, absolute */}
        <View style={styles.topRight}>
          {cornerIcon ? (
            /^[a-z]/.test(cornerIcon) ? (
              <Ionicons name={cornerIcon as any} size={22} color={colors.text} />
            ) : (
              <Text style={styles.flagText}>{cornerIcon}</Text>
            )
          ) : null}
          {speakLanguage ? (
            <Pressable
              onPress={handleSpeak}
              style={styles.speakBtn}
              hitSlop={10}
              accessibilityLabel="Listen to pronunciation"
            >
              <Ionicons name="volume-high-outline" size={18} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>

        {frontImage ? (
          <Image source={{ uri: frontImage }} style={styles.imageSmall} resizeMode="contain" />
        ) : null}

        <Text style={styles.frontRef} numberOfLines={2}>{frontText}</Text>
        <View style={styles.divider} />

        {backImage ? (
          <Image source={{ uri: backImage }} style={styles.image} resizeMode="contain" />
        ) : null}

        <Text style={[styles.backText, { fontSize: dynamicFontSize(backText, 34, 26) }]}>{backText}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },

  // ── Shared card shell ──
  card: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 28,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },

  // Front uses gradient (no background — LinearGradient fills it)
  // Back is white
  cardBack: {
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },

  // Shine: semi-transparent white ellipse at top-left
  shineOverlay: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 220,
    height: 180,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  // Flag badge — absolute top-right
  flagBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagText: {
    fontSize: 22,
    lineHeight: 28,
  },

  // Front text
  frontText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  tapHint: {
    position: 'absolute',
    bottom: spacing.md,
    alignSelf: 'center',
  },
  tapHintText: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.3,
  },

  // Back: top-right cluster (flag + speak)
  topRight: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  speakBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Back content
  frontRef: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    width: '70%',
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  backText: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  image: {
    width: '100%',
    height: 120,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  imageSmall: {
    width: '100%',
    height: 60,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    opacity: 0.6,
  },
});
