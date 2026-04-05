import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../../src/constants';
import { tap } from '../../src/utils/haptics';

interface CreditItem {
  asset: string;
  author: string;
  source: string;
  url: string;
}

const CREDITS: CreditItem[] = [
  {
    asset: 'Fire animated icons',
    author: 'Freepik',
    source: 'Flaticon',
    url: 'https://www.flaticon.com/free-animated-icons/fire',
  },
];

export default function CreditsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Credits</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>ASSETS</Text>
        <View style={styles.card}>
          {CREDITS.map((credit, i) => (
            <Pressable
              key={i}
              style={({ pressed }) => [
                styles.creditRow,
                i < CREDITS.length - 1 && styles.creditBorder,
                pressed && styles.pressed,
              ]}
              onPress={() => { tap(); Linking.openURL(credit.url); }}
            >
              <View style={styles.creditInfo}>
                <Text style={styles.creditAsset}>{credit.asset}</Text>
                <Text style={styles.creditAuthor}>
                  Created by {credit.author} — {credit.source}
                </Text>
              </View>
              <Ionicons name="open-outline" size={16} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { ...typography.h2, color: colors.textPrimary, flex: 1 },
  closeBtn: { padding: spacing.sm },
  content: { padding: spacing.md, paddingBottom: 48 },
  sectionLabel: {
    ...typography.small,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  creditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  creditBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  pressed: { opacity: 0.7 },
  creditInfo: { flex: 1, gap: 2 },
  creditAsset: { ...typography.bodyBold, color: colors.textPrimary },
  creditAuthor: { ...typography.caption, color: colors.textSecondary },
});
