import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { Card } from '../../types';
import { useResolvedBack, useResolvedFront } from '../../utils/translations';

interface CardListItemProps {
  card: Card;
  onPress: () => void;
}

const STATUS_COLOR: Record<string, string> = {
  new: colors.notStudied,
  learning: colors.learning,
  review: colors.primary,
  mastered: colors.mastered,
};

export function CardListItem({ card, onPress }: CardListItemProps) {
  const resolvedFront = useResolvedFront(card);
  const resolvedBack = useResolvedBack(card);
  const accentColor = STATUS_COLOR[card.status] ?? colors.notStudied;

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityLabel={`Card: ${card.front}`}
    >
      {/* Status accent stripe */}
      <View style={[styles.stripe, { backgroundColor: accentColor }]} />

      {/* Front */}
      <Text style={styles.front} numberOfLines={1}>{resolvedFront}</Text>

      {/* Divider arrow */}
      <Ionicons name="arrow-forward" size={13} color={colors.textMuted} style={styles.arrow} />

      {/* Back */}
      <Text style={styles.back} numberOfLines={1}>{resolvedBack}</Text>

      {/* Edit chevron */}
      <Ionicons name="chevron-forward" size={16} color={colors.borderLight} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginBottom: 6,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
  },
  stripe: {
    width: 4,
    alignSelf: 'stretch',
    marginRight: spacing.sm,
  },
  front: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    flex: 1,
    fontSize: 14,
  },
  arrow: {
    marginHorizontal: spacing.xs,
  },
  back: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    marginRight: spacing.sm,
  },
});
