import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
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

// Orbiting dots config
const ORBIT_DOTS = [
  { radius: 95, size: 10, delay: 0, duration: 6000, color: '#7C3AED' },
  { radius: 100, size: 7, delay: 800, duration: 7500, color: '#4361EE' },
  { radius: 105, size: 8, delay: 1600, duration: 8000, color: '#EC4899' },
  { radius: 90, size: 6, delay: 2400, duration: 5500, color: '#9333EA' },
  { radius: 98, size: 5, delay: 400, duration: 9000, color: '#6366F1' },
];

// Pulse rings config
const PULSE_RINGS = [
  { delay: 0, duration: 3000 },
  { delay: 1000, duration: 3000 },
  { delay: 2000, duration: 3000 },
];

export function WelcomeHero() {
  // Icon entrance animation
  const iconScale = useSharedValue(0);
  const iconRotate = useSharedValue(-15);

  useEffect(() => {
    iconScale.value = withSpring(1, { damping: 12, stiffness: 120, mass: 0.8 });
    iconRotate.value = withSpring(0, { damping: 14, stiffness: 100 });
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotate.value}deg` },
    ],
  }));

  return (
    <View style={styles.container}>
      {/* Pulse rings */}
      {PULSE_RINGS.map((ring, i) => (
        <PulseRing key={i} delay={ring.delay} duration={ring.duration} />
      ))}

      {/* Orbiting dots */}
      {ORBIT_DOTS.map((dot, i) => (
        <OrbitDot key={i} {...dot} />
      ))}

      {/* Glow background */}
      <View style={styles.glowOuter} />
      <View style={styles.glowInner} />

      {/* App icon */}
      <Animated.View style={[styles.iconWrap, iconStyle]}>
        <Image
          source={require('../../../assets/adaptive-icon.png')}
          style={styles.appIcon}
          resizeMode="cover"
        />
      </Animated.View>
    </View>
  );
}

function PulseRing({ delay, duration }: { delay: number; duration: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration, easing: Easing.out(Easing.cubic) }),
        -1,
        false
      )
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [0.7, 1.6]);
    const opacity = interpolate(progress.value, [0, 0.3, 1], [0, 0.35, 0]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return <Animated.View style={[styles.pulseRing, style]} />;
}

function OrbitDot({
  radius,
  size,
  delay,
  duration,
  color,
}: {
  radius: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}) {
  const angle = useSharedValue(0);
  const dotOpacity = useSharedValue(0);

  useEffect(() => {
    // Fade in
    dotOpacity.value = withDelay(delay + 300, withTiming(1, { duration: 600 }));
    // Continuous orbit
    angle.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, { duration, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const rad = (angle.value * Math.PI) / 180;
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;
    return {
      transform: [{ translateX: x }, { translateY: y }],
      opacity: dotOpacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.orbitDot,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        style,
      ]}
    />
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
  glowOuter: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: 'rgba(67, 97, 238, 0.08)',
  },
  glowInner: {
    position: 'absolute',
    width: SIZE * 0.82,
    height: SIZE * 0.82,
    borderRadius: (SIZE * 0.82) / 2,
    backgroundColor: 'rgba(124, 58, 237, 0.06)',
  },
  iconWrap: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    overflow: 'hidden',
    // Subtle shadow for depth
    shadowColor: '#4361EE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  appIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
  },
  pulseRing: {
    position: 'absolute',
    width: SIZE * 0.75,
    height: SIZE * 0.75,
    borderRadius: (SIZE * 0.75) / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  orbitDot: {
    position: 'absolute',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
});
