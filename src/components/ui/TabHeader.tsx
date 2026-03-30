import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from './Logo';
import { borderRadius, colors, spacing } from '../../constants';
import { useSubscriptionStore } from '../../stores/useSubscriptionStore';

export function TabHeader() {
  const { isPro } = useSubscriptionStore();

  return (
    <View style={styles.header}>
      <View style={styles.logoWrapper}>
        <Logo height={38} />
      </View>
      {!isPro && (
        <Pressable style={styles.proButton} onPress={() => router.push('/paywall')}>
          <Ionicons name="diamond-outline" size={14} color={colors.white} />
          <Text style={styles.proButtonText}>PRO</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  logoWrapper: {
    flex: 1,
  },
  proButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  proButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
