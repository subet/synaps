import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { SRSGrade } from '../../types';

interface RatingButtonsProps {
  onGrade: (grade: SRSGrade) => void;
  intervals: { again: string; hard: string; good: string; easy: string };
}

const BUTTONS: Array<{
  grade: SRSGrade;
  label: string;
  bg: string;
  textColor: string;
  intervalKey: keyof RatingButtonsProps['intervals'];
}> = [
  { grade: 0, label: 'Again', bg: colors.again, textColor: colors.againText, intervalKey: 'again' },
  { grade: 1, label: 'Hard', bg: colors.hard, textColor: colors.hardText, intervalKey: 'hard' },
  { grade: 2, label: 'Good', bg: colors.good, textColor: colors.goodText, intervalKey: 'good' },
  { grade: 3, label: 'Easy', bg: colors.easy, textColor: colors.easyText, intervalKey: 'easy' },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function RatingButton({
  label,
  subtitle,
  bg,
  textColor,
  onPress,
}: {
  label: string;
  subtitle: string;
  bg: string;
  textColor: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      style={[styles.button, { backgroundColor: bg }, animatedStyle]}
      onPress={handlePress}
      onPressIn={() => { scale.value = withSpring(0.93, { damping: 12 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
      accessibilityLabel={`${label} - ${subtitle}`}
      accessibilityRole="button"
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      <Text style={[styles.subtitle, { color: textColor }]}>{subtitle}</Text>
    </AnimatedPressable>
  );
}

export function RatingButtons({ onGrade, intervals }: RatingButtonsProps) {
  return (
    <View style={styles.container}>
      {BUTTONS.map((btn) => (
        <RatingButton
          key={btn.grade}
          label={btn.label}
          subtitle={intervals[btn.intervalKey]}
          bg={btn.bg}
          textColor={btn.textColor}
          onPress={() => onGrade(btn.grade)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  button: {
    flex: 1,
    height: 64,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    ...typography.captionBold,
    fontSize: 13,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.small,
    opacity: 0.75,
    marginTop: 2,
  },
});
