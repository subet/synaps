import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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

// Podium bars: 2nd, 1st, 3rd (visual order left to right)
const PODIUM = [
  { rank: 2, height: 64, color: '#9CA3AF', avatarBg: '#E5E7EB', label: '#2', delay: 400, x: -52 },
  { rank: 1, height: 90, color: '#F59E0B', avatarBg: '#FEF3C7', label: '#1', delay: 200, x: 0 },
  { rank: 3, height: 44, color: '#CD7F32', avatarBg: '#FDE8D0', label: '#3', delay: 600, x: 52 },
];

// Floating stars
const STARS = [
  { x: -80, y: -60, size: 12, delay: 800, duration: 3000 },
  { x: 75, y: -50, size: 10, delay: 1200, duration: 3500 },
  { x: -60, y: 30, size: 8, delay: 1600, duration: 2800 },
  { x: 85, y: 20, size: 9, delay: 1000, duration: 3200 },
  { x: -30, y: -80, size: 11, delay: 1400, duration: 3800 },
  { x: 40, y: -75, size: 7, delay: 2000, duration: 2600 },
];

interface Props {
  active?: boolean;
}

export function LeaderboardHero({ active = false }: Props) {
  return (
    <View style={styles.container}>
      {/* Glow */}
      <View style={styles.glow} />

      {/* Floating stars */}
      {STARS.map((star, i) => (
        <FloatingStar key={i} {...star} active={active} />
      ))}

      {/* Podium */}
      <View style={styles.podiumRow}>
        {PODIUM.map((bar) => (
          <PodiumBar key={bar.rank} {...bar} active={active} />
        ))}
      </View>
    </View>
  );
}

function PodiumBar({
  rank,
  height,
  color,
  avatarBg,
  label,
  delay,
  x,
  active,
}: {
  rank: number;
  height: number;
  color: string;
  avatarBg: string;
  label: string;
  delay: number;
  x: number;
  active: boolean;
}) {
  const rise = useSharedValue(0);
  const avatarScale = useSharedValue(0);
  const crownScale = useSharedValue(0);

  useEffect(() => {
    if (!active) return;

    rise.value = 0;
    avatarScale.value = 0;
    crownScale.value = 0;

    // Bar rises up
    rise.value = withDelay(delay, withSpring(1, { damping: 10, stiffness: 90, mass: 0.9 }));
    // Avatar pops in after bar
    avatarScale.value = withDelay(delay + 300, withSpring(1, { damping: 8, stiffness: 130 }));
    // Crown for 1st place
    if (rank === 1) {
      crownScale.value = withDelay(delay + 500, withSpring(1, { damping: 8, stiffness: 150 }));
    }
  }, [active]);

  const barStyle = useAnimatedStyle(() => {
    const h = interpolate(rise.value, [0, 1], [0, height]);
    const opacity = interpolate(rise.value, [0, 0.3, 1], [0, 1, 1]);
    return {
      height: h,
      opacity,
    };
  });

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  const crownStyle = useAnimatedStyle(() => ({
    transform: [{ scale: crownScale.value }],
    opacity: crownScale.value,
  }));

  const barWidth = 44;
  const avatarSize = rank === 1 ? 42 : 36;

  return (
    <View style={[styles.podiumCol, { marginHorizontal: 4 }]}>
      {/* Crown for 1st */}
      {rank === 1 && (
        <Animated.View style={[styles.crown, crownStyle]}>
          <Text style={styles.crownEmoji}>👑</Text>
        </Animated.View>
      )}

      {/* Avatar circle */}
      <Animated.View
        style={[
          styles.avatar,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
            backgroundColor: avatarBg,
            borderColor: color,
          },
          avatarStyle,
        ]}
      >
        <Text style={[styles.avatarLabel, { color }]}>{label}</Text>
      </Animated.View>

      {/* Bar */}
      <Animated.View
        style={[
          styles.bar,
          { width: barWidth, backgroundColor: color, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
          barStyle,
        ]}
      />
    </View>
  );
}

function FloatingStar({
  x,
  y,
  size,
  delay,
  duration,
  active,
}: {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  active: boolean;
}) {
  const opacity = useSharedValue(0);
  const floatY = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    if (!active) return;

    opacity.value = 0;
    floatY.value = 0;
    scale.value = 0.5;

    opacity.value = withDelay(delay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: duration * 0.3, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: duration * 0.7, easing: Easing.in(Easing.ease) })
        ),
        -1,
        false
      )
    );

    floatY.value = withDelay(delay,
      withRepeat(
        withTiming(-30, { duration, easing: Easing.out(Easing.ease) }),
        -1,
        false
      )
    );

    scale.value = withDelay(delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: duration * 0.3 }),
          withTiming(0.5, { duration: duration * 0.7 })
        ),
        -1,
        false
      )
    );
  }, [active]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: x },
      { translateY: y + floatY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.star, { width: size, height: size }, style]}>
      <Text style={{ fontSize: size }}>✦</Text>
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
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  podiumCol: {
    alignItems: 'center',
  },
  avatar: {
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  bar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  crown: {
    marginBottom: 2,
  },
  crownEmoji: {
    fontSize: 22,
  },
  star: {
    position: 'absolute',
  },
});
