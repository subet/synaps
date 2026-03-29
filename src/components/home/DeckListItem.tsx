import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { Deck, DeckStats } from '../../types';

interface DeckListItemProps {
  deck: Deck;
  stats?: DeckStats;
  onPress: () => void;
}

export function DeckListItem({ deck, stats, onPress }: DeckListItemProps) {
  const dueCount = stats?.dueToday ?? 0;
  const accentColor = deck.color ?? colors.primary;

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityLabel={`${deck.name}, ${dueCount} cards for today`}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${accentColor}22` }]}>
        <Text style={styles.icon}>{deck.icon ?? '🗂️'}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{deck.name}</Text>
        {deck.description ? (
          <Text style={styles.description} numberOfLines={1}>{deck.description}</Text>
        ) : null}
      </View>

      <View style={styles.dueContainer}>
        <Text style={[styles.dueCount, { color: accentColor }]}>↑ {dueCount}</Text>
        <Text style={styles.dueLabel}>today</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
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
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 22,
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dueContainer: {
    alignItems: 'flex-end',
  },
  dueCount: {
    ...typography.captionBold,
  },
  dueLabel: {
    ...typography.small,
    color: colors.textMuted,
  },
});
