import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const SIZE = 220;
const ICON_SIZE = 160;

// Badge positions in an arc around the trophy
// angle in degrees from top center, radius from center
const BADGES = [
  { emoji: '🔥', angle: -120, radius: 100, size: 40, delay: 400 },
  { emoji: '⚡', angle: -60, radius: 105, size: 36, delay: 550 },
  { emoji: '🧠', angle: 0, radius: 108, size: 38, delay: 700 },
  { emoji: '🏆', angle: 60, radius: 105, size: 36, delay: 850 },
  { emoji: '🎯', angle: 120, radius: 100, size: 40, delay: 1000 },
];

interface Props {
  active?: boolean;
}

export function AchievementsHero({ active = false }: Props) {
  const trophyScale = useSharedValue(0);
  const trophyRotate = useSharedValue(15);

  useEffect(() => {
    if (!active) return;

    trophyScale.value = 0;
    trophyRotate.value = 15;

    trophyScale.value = withDelay(100, withSpring(1, { damping: 10, stiffness: 100 }));
    trophyRotate.value = withDelay(100, withSpring(0, { damping: 12, stiffness: 90 }));
  }, [active]);

  const trophyStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: trophyScale.value },
      { rotate: `${trophyRotate.value}deg` },
    ],
  }));

  return (
    <View style={styles.container}>
      {/* Glow */}
      <View style={styles.glow} />

      {/* Badges cascading into position */}
      {BADGES.map((badge, i) => (
        <BadgeCircle key={i} {...badge} active={active} />
      ))}

      {/* Trophy icon */}
      <Animated.View style={[styles.iconWrap, trophyStyle]}>
        <LinearGradient
          colors={['#8B5CF6', '#EC4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconCircle}
        >
          <Ionicons name="trophy-outline" size={76} color="#FFFFFF" />
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

function BadgeCircle({
  emoji,
  angle,
  radius,
  size,
  delay,
  active,
}: {
  emoji: string;
  angle: number;
  radius: number;
  size: number;
  delay: number;
  active: boolean;
}) {
  // Final position
  const rad = ((angle - 90) * Math.PI) / 180; // -90 so 0° = top
  const finalX = Math.cos(rad) * radius;
  const finalY = Math.sin(rad) * radius;

  const progress = useSharedValue(0);
  const floatPhase = useSharedValue(0);

  useEffect(() => {
    if (!active) return;

    progress.value = 0;
    floatPhase.value = 0;

    // Drop in from above with bounce
    progress.value = withDelay(delay, withSpring(1, { damping: 9, stiffness: 110, mass: 0.8 }));

    // Gentle float after landing
    floatPhase.value = withDelay(delay + 600,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2000 + delay * 0.5, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2000 + delay * 0.5, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );
  }, [active]);

  const style = useAnimatedStyle(() => {
    // Start above and to the side, land at final position
    const startX = finalX * 0.3;
    const startY = -160;
    const x = interpolate(progress.value, [0, 1], [startX, finalX]);
    const y = interpolate(progress.value, [0, 1], [startY, finalY]);
    const scale = interpolate(progress.value, [0, 0.5, 1], [0.3, 1.15, 1]);
    const opacity = interpolate(progress.value, [0, 0.3, 1], [0, 1, 1]);
    const rotation = interpolate(progress.value, [0, 1], [180, 0]);

    // Gentle floating after settling
    const floatY = interpolate(floatPhase.value, [0, 1], [0, -6]);

    return {
      opacity,
      transform: [
        { translateX: x },
        { translateY: y + floatY },
        { scale },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[styles.badge, { width: size + 12, height: size + 12, borderRadius: (size + 12) / 2 }, style]}>
      <Text style={{ fontSize: size * 0.55 }}>{emoji}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  glow: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  iconWrap: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  iconCircle: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
