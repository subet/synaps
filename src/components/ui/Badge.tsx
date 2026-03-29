import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { CardStatus } from '../../types';

interface BadgeProps {
  label: string;
  color?: string;
  bgColor?: string;
  style?: ViewStyle;
}

export function Badge({ label, color = colors.white, bgColor = colors.primary, style }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, style]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

interface StatusBadgeProps {
  status: CardStatus;
  style?: ViewStyle;
}

export function StatusBadge({ status, style }: StatusBadgeProps) {
  const config = {
    new: { label: 'not studied', bg: '#F3F4F6', color: colors.textSecondary },
    learning: { label: 'learning', bg: '#DCFCE7', color: colors.learning },
    review: { label: 'review', bg: '#E0F2FE', color: colors.primary },
    mastered: { label: 'mastered', bg: colors.primaryLight, color: colors.primary },
  }[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, style]}>
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.smallBold,
  },
});
