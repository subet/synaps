import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { Card } from '../../types';
import { StatusBadge } from '../ui/Badge';

interface CardListItemProps {
  card: Card;
  onPress: () => void;
}

export function CardListItem({ card, onPress }: CardListItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityLabel={`Card: ${card.front}`}
    >
      <View style={styles.topRow}>
        <StatusBadge status={card.status} />
      </View>
      <Text style={styles.front} numberOfLines={2}>{card.front}</Text>
      <Text style={styles.back} numberOfLines={2}>{card.back}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  pressed: {
    opacity: 0.75,
  },
  topRow: {
    marginBottom: spacing.sm,
  },
  front: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  back: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
