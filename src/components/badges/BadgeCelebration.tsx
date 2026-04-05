import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography } from '../../constants';
import { useTranslation } from '../../i18n';
import { BadgeWithStatus } from '../../services/badgeService';

interface Props {
  badge: BadgeWithStatus;
  onDismiss: () => void;
}

// Confetti particle
function Particle({ delay, x, color }: { delay: number; x: number; color: string }) {
  const translateY = useSharedValue(-20);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(delay, withTiming(400, { duration: 1200, easing: Easing.out(Easing.quad) }));
    opacity.value = withDelay(delay + 600, withTiming(0, { duration: 600 }));
    rotate.value = withDelay(delay, withRepeat(withTiming(360, { duration: 800 }), 2));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        { left: `${x}%`, backgroundColor: color },
        style,
      ]}
    />
  );
}

const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F472B6', '#34D399', '#FBBF24'];

export function BadgeCelebration({ badge, onDismiss }: Props) {
  const { t } = useTranslation();
  const scale = useSharedValue(0);
  const glow = useSharedValue(0.3);

  useEffect(() => {
    // Badge icon bounces in
    scale.value = withSequence(
      withTiming(1.2, { duration: 300, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 150 }),
    );
    // Pulsing glow — 2 pulses then stop
    glow.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 500 }),
        withTiming(0.3, { duration: 500 }),
      ),
      2,
      true,
    );
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 1.4 + glow.value * 0.3 }],
  }));

  // Generate confetti particles
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: Math.random() * 400,
    x: Math.random() * 90 + 5,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }));

  return (
    <Modal transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        {/* Confetti */}
        {particles.map((p) => (
          <Particle key={p.id} delay={p.delay} x={p.x} color={p.color} />
        ))}

        <Animated.View entering={SlideInDown.springify().damping(20).stiffness(200)} style={styles.card}>
          <LinearGradient
            colors={[badge.color + '20', badge.color + '08']}
            style={styles.gradient}
          />

          {/* Glow ring */}
          <Animated.View style={[styles.glowRing, { borderColor: badge.color }, glowStyle]} />

          {/* Badge icon */}
          <Animated.View style={[styles.iconCircle, { backgroundColor: badge.color + '22', borderColor: badge.color }, iconStyle]}>
            <Text style={styles.icon}>{badge.icon}</Text>
          </Animated.View>

          <Animated.Text entering={FadeIn.delay(200)} style={styles.congratsText}>
            {t('badge_unlocked')}
          </Animated.Text>

          <Animated.Text entering={FadeIn.delay(300)} style={styles.badgeName}>
            {t(badge.nameKey)}
          </Animated.Text>

          <Animated.Text entering={FadeIn.delay(400)} style={styles.badgeDesc}>
            {t(badge.descriptionKey)}
          </Animated.Text>

          <Animated.View entering={FadeIn.delay(500)}>
            <Pressable style={[styles.button, { backgroundColor: badge.color }]} onPress={onDismiss}>
              <Text style={styles.buttonText}>{t('awesome')}</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: spacing.xl,
    paddingTop: 48,
    paddingBottom: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
  },
  glowRing: {
    position: 'absolute',
    top: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 44,
  },
  congratsText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  badgeName: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  badgeDesc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  particle: {
    position: 'absolute',
    top: -10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
