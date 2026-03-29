import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { Card } from '../../types';

interface FlashCardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
  reversed?: boolean;
  speakLanguage?: string;
}

export function FlashCard({ card, isFlipped, onFlip, reversed = false, speakLanguage }: FlashCardProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(isFlipped ? 1 : 0, { duration: 350 });
  }, [isFlipped]);

  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 0.5, 1], [0, 90, 180]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
      opacity: rotation.value < 0.5 ? 1 : 0,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 0.5, 1], [180, 270, 360]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: 'hidden',
      opacity: rotation.value >= 0.5 ? 1 : 0,
    };
  });

  const frontText = reversed ? card.back : card.front;
  const backText = reversed ? card.front : card.back;
  const frontImage = reversed ? card.back_image : card.front_image;
  const backImage = reversed ? card.front_image : card.back_image;

  return (
    <Pressable onPress={onFlip} style={styles.wrapper} accessibilityRole="button">
      {/* Front */}
      <Animated.View style={[styles.card, frontStyle]}>
        {frontImage ? (
          <Image source={{ uri: frontImage }} style={styles.image} resizeMode="contain" />
        ) : null}
        <Text style={typography.cardFront}>{frontText}</Text>
        <View style={styles.tapHint}>
          <Text style={styles.tapHintText}>👆 Tap to show answer</Text>
        </View>
      </Animated.View>

      {/* Back */}
      <Animated.View style={[styles.card, styles.cardBack, backStyle]}>
        {frontImage ? (
          <Image source={{ uri: frontImage }} style={styles.imageSmall} resizeMode="contain" />
        ) : null}
        <Text style={[typography.cardFront, styles.frontRef]} numberOfLines={2}>
          {frontText}
        </Text>
        <View style={styles.divider} />
        {backImage ? (
          <Image source={{ uri: backImage }} style={styles.image} resizeMode="contain" />
        ) : null}
        <Text style={typography.cardBack}>{backText}</Text>
        {speakLanguage ? (
          <Pressable
            style={styles.speakBtn}
            onPress={(e) => {
              e.stopPropagation();
              Speech.speak(backText, { language: speakLanguage });
            }}
            hitSlop={12}
            accessibilityLabel="Listen to pronunciation"
          >
            <Ionicons name="volume-high" size={22} color={colors.primary} />
          </Pressable>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    left: 0,
    right: 0,
    minHeight: 300,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  cardBack: {
    // Additional back styling applied dynamically
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
  frontRef: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    width: '80%',
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  tapHint: {
    position: 'absolute',
    bottom: spacing.md,
    alignSelf: 'center',
  },
  tapHintText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  speakBtn: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
