import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const SIZE = 220;
const ICON_SIZE = 176;

// Floating card configs — each drifts upward at its own pace
const FLOATING_CARDS = [
  { x: -70, startY: 60, drift: -90, width: 44, height: 58, radius: 8, color: '#4361EE', delay: 0, duration: 4500, rotation: -12 },
  { x: 65, startY: 40, drift: -80, width: 40, height: 54, radius: 8, color: '#48BB78', delay: 600, duration: 5000, rotation: 8 },
  { x: -50, startY: -50, drift: -70, width: 36, height: 48, radius: 6, color: '#EC4899', delay: 1200, duration: 4000, rotation: 15 },
  { x: 72, startY: -40, drift: -85, width: 42, height: 56, radius: 8, color: '#F59E0B', delay: 400, duration: 5500, rotation: -6 },
  { x: -20, startY: 70, drift: -95, width: 34, height: 46, radius: 6, color: '#8B5CF6', delay: 900, duration: 4800, rotation: 10 },
];

interface Props {
  active?: boolean;
}

export function LibraryHero({ active = false }: Props) {
  const iconScale = useSharedValue(0);
  const iconRotate = useSharedValue(-10);

  useEffect(() => {
    if (!active) return;

    iconScale.value = 0;
    iconRotate.value = -10;

    iconScale.value = withDelay(100, withSpring(1, { damping: 12, stiffness: 120 }));
    iconRotate.value = withDelay(100, withSpring(0, { damping: 14, stiffness: 100 }));
  }, [active]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotate.value}deg` },
    ],
  }));

  return (
    <View style={styles.container}>
      {/* Floating cards behind the icon */}
      {FLOATING_CARDS.map((card, i) => (
        <FloatingCard key={i} {...card} active={active} />
      ))}

      {/* Glow */}
      <View style={styles.glow} />

      {/* Main icon */}
      <Animated.View style={[styles.iconWrap, iconStyle]}>
        <LinearGradient
          colors={['#EC4899', '#DB2777']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconCircle}
        >
          <Ionicons name="library-outline" size={80} color="#FFFFFF" />
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

function FloatingCard({
  x,
  startY,
  drift,
  width,
  height,
  radius,
  color,
  delay,
  duration,
  rotation,
  active,
}: {
  x: number;
  startY: number;
  drift: number;
  width: number;
  height: number;
  radius: number;
  color: string;
  delay: number;
  duration: number;
  rotation: number;
  active: boolean;
}) {
  const progress = useSharedValue(0);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    if (!active) return;

    progress.value = 0;
    cardOpacity.value = 0;

    // Fade in then start floating loop
    cardOpacity.value = withDelay(delay + 300, withTiming(1, { duration: 500 }));
    progress.value = withDelay(delay + 300,
      withRepeat(
        withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, [active]);

  const style = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [startY, startY + drift]);
    const scale = interpolate(progress.value, [0, 0.5, 1], [0.85, 1, 0.85]);
    const opacity = interpolate(progress.value, [0, 0.15, 0.5, 0.85, 1], [0.3, 0.7, 0.9, 0.7, 0.3]);
    const rotate = interpolate(progress.value, [0, 1], [rotation, rotation * 0.5]);

    return {
      width,
      height,
      borderRadius: radius,
      backgroundColor: color,
      opacity: opacity * cardOpacity.value,
      transform: [
        { translateX: x },
        { translateY },
        { scale },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[styles.floatingCard, style]}>
      {/* Inner lines to look like a card */}
      <View style={[styles.cardLine, { width: width * 0.6, marginTop: height * 0.25 }]} />
      <View style={[styles.cardLine, { width: width * 0.4, marginTop: 4 }]} />
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
    backgroundColor: 'rgba(236, 72, 153, 0.08)',
  },
  iconWrap: {
    shadowColor: '#EC4899',
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
  floatingCard: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    paddingHorizontal: 6,
  },
  cardLine: {
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});
