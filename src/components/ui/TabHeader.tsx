import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from './Logo';
import { borderRadius, colors, spacing } from '../../constants';
import { useSubscriptionStore } from '../../stores/useSubscriptionStore';
import { useAuthStore } from '../../stores/useAuthStore';

export function TabHeader() {
  const { isPro } = useSubscriptionStore();
  const { user, profile } = useAuthStore();

  const initial = (
    profile?.display_name?.[0] ??
    user?.email?.[0] ??
    '?'
  ).toUpperCase();

  const avatarUri = profile?.avatar_url ?? null;

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
      {user && (
        <Pressable style={styles.avatarButton} onPress={() => router.push('/profile')}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarInitial}>{initial}</Text>
          )}
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
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
});
