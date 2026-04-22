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
const NUM_RAYS = 12;

// Light ray config — evenly spaced around the circle
const RAYS = Array.from({ length: NUM_RAYS }, (_, i) => ({
  angle: (360 / NUM_RAYS) * i,
  length: i % 2 === 0 ? 28 : 18, // alternate long/short
  width: i % 2 === 0 ? 3 : 2,
}));

interface Props {
  active?: boolean;
}

export function SrsHero({ active = false }: Props) {
  // Icon entrance
  const iconScale = useSharedValue(0.3);
  const iconOpacity = useSharedValue(0.2);

  // Glow burst
  const burstScale = useSharedValue(0.5);
  const burstOpacity = useSharedValue(0);

  // Rays
  const raysProgress = useSharedValue(0);

  // Breathing glow (continuous)
  const breathe = useSharedValue(0);

  useEffect(() => {
    if (!active) return;

    // Reset to initial state so animation replays each time
    iconScale.value = 0.3;
    iconOpacity.value = 0.2;
    burstScale.value = 0.5;
    burstOpacity.value = 0;
    raysProgress.value = 0;
    breathe.value = 0;

    // 1. Icon scales in (starts dim & small)
    iconScale.value = withDelay(200, withSpring(1, { damping: 10, stiffness: 100 }));
    iconOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));

    // 2. Glow burst expands and fades
    burstScale.value = withDelay(500, withTiming(1.8, { duration: 600, easing: Easing.out(Easing.cubic) }));
    burstOpacity.value = withDelay(500,
      withSequence(
        withTiming(0.6, { duration: 200 }),
        withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
      )
    );

    // 3. Rays shoot out then settle
    raysProgress.value = withDelay(550,
      withSequence(
        withSpring(1, { damping: 8, stiffness: 120 }),
        withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.cubic) })
      )
    );

    // 4. Continuous breathing pulse
    breathe.value = withDelay(1400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );
  }, [active]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
    opacity: iconOpacity.value,
  }));

  const burstStyle = useAnimatedStyle(() => ({
    transform: [{ scale: burstScale.value }],
    opacity: burstOpacity.value,
  }));

  const breatheGlowStyle = useAnimatedStyle(() => {
    const scale = interpolate(breathe.value, [0, 1], [1, 1.12]);
    const opacity = interpolate(breathe.value, [0, 1], [0.08, 0.2]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      {/* Breathing glow behind everything */}
      <Animated.View style={[styles.breatheGlow, breatheGlowStyle]} />

      {/* Glow burst (one-time) */}
      <Animated.View style={[styles.burst, burstStyle]} />

      {/* Light rays */}
      {RAYS.map((ray, i) => (
        <Ray key={i} angle={ray.angle} length={ray.length} width={ray.width} progress={raysProgress} breathe={breathe} />
      ))}

      {/* Icon */}
      <Animated.View style={[styles.iconWrap, iconStyle]}>
        <LinearGradient
          colors={['#7C3AED', '#9333EA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconCircle}
        >
          <Ionicons name="bulb-outline" size={80} color="#FFFFFF" />
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

function Ray({
  angle,
  length,
  width,
  progress,
  breathe,
}: {
  angle: number;
  length: number;
  width: number;
  progress: SharedValue<number>;
  breathe: SharedValue<number>;
}) {
  const rad = (angle * Math.PI) / 180;
  const startRadius = ICON_SIZE / 2 + 8;

  const style = useAnimatedStyle(() => {
    const breatheExtra = interpolate(breathe.value, [0, 1], [0, 6]);
    const rayLength = (length + breatheExtra) * progress.value;
    const rayOpacity = interpolate(progress.value, [0, 0.3, 0.7, 1], [0, 0.9, 0.7, 0.5]);
    const breatheOpacity = interpolate(breathe.value, [0, 1], [0.4, 0.8]);
    const finalOpacity = rayOpacity > 0 ? rayOpacity * breatheOpacity + 0.2 : 0;

    const cx = Math.cos(rad) * (startRadius + rayLength / 2);
    const cy = Math.sin(rad) * (startRadius + rayLength / 2);

    return {
      width: Math.max(rayLength, 0),
      height: width,
      borderRadius: width / 2,
      opacity: finalOpacity,
      transform: [
        { translateX: cx },
        { translateY: cy },
        { rotate: `${angle}deg` },
      ],
    };
  });

  return <Animated.View style={[styles.ray, style]} />;
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  breatheGlow: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  burst: {
    position: 'absolute',
    width: SIZE * 0.7,
    height: SIZE * 0.7,
    borderRadius: (SIZE * 0.7) / 2,
    backgroundColor: 'rgba(147, 51, 234, 0.3)',
  },
  iconWrap: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
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
  ray: {
    position: 'absolute',
    backgroundColor: '#A855F7',
  },
});
