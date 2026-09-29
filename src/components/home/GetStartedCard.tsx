import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { Button } from '../ui/Button';

interface GetStartedCardProps {
  title: string;
  subtitle: string;
  ctaLabel: string;
  onCtaPress: () => void;
  secondaryLabel: string;
  onSecondaryPress: () => void;
}

/**
 * Home's "no decks yet" state. Rendered right under the greeting — as the old
 * list-empty component below the (all-zero) stats it sat below the fold, so the
 * library button was never seen on a phone.
 */
export function GetStartedCard({ title, subtitle, ctaLabel, onCtaPress, secondaryLabel, onSecondaryPress }: GetStartedCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="library-outline" size={28} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <Button label={ctaLabel} onPress={onCtaPress} style={styles.cta} />
      <Button label={secondaryLabel} onPress={onSecondaryPress} variant="ghost" style={styles.secondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { ...typography.h3, color: colors.textPrimary, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
  cta: { alignSelf: 'stretch', marginTop: spacing.lg },
  secondary: { alignSelf: 'stretch', marginTop: spacing.xs },
});
