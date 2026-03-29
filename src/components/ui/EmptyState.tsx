import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../../constants';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  style?: ViewStyle;
}

export function EmptyState({ title, subtitle, ctaLabel, onCtaPress, style }: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.emoji}>📚</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {ctaLabel && onCtaPress && (
        <Button
          label={ctaLabel}
          onPress={onCtaPress}
          style={styles.cta}
          fullWidth={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emoji: {
    fontSize: 56,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  cta: {
    paddingHorizontal: spacing.xl,
  },
});
