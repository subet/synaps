import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { tap } from '../../utils/haptics';
import { useTranslation } from '../../i18n';
import { Deck, DeckStats } from '../../types';
import { useResolvedDeckDescription, useResolvedDeckName } from '../../utils/translations';
import { LanguageBadge } from '../ui/LanguageBadge';

/**
 * Opaque version of `hex` at `alpha` over `base`. The due pill casts a shadow,
 * and Android draws elevation through a translucent background (grey fill,
 * thick edge), so the tint must be solid there. Non-hex colors fall back to
 * the translucent tint.
 */
function solidTint(hex: string, alpha: number, base: string = colors.surface): string {
  const parse = (c: string) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(c);
    return m ? [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)) : null;
  };
  const fg = parse(hex);
  const bg = parse(base);
  if (!fg || !bg) return `${hex}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
  const mix = fg.map((v, i) => Math.round(v * alpha + bg[i] * (1 - alpha)));
  return `#${mix.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

interface DeckListItemProps {
  deck: Deck;
  stats?: DeckStats;
  onPress: () => void;
}

export function DeckListItem({ deck, stats, onPress }: DeckListItemProps) {
  const { t } = useTranslation();
  const resolvedName = useResolvedDeckName(deck);
  const resolvedDescription = useResolvedDeckDescription(deck);
  const dueCount = stats?.dueToday ?? 0;
  const accentColor = deck.color ?? colors.primary;

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => { tap(); onPress(); }}
      accessibilityLabel={`${resolvedName}, ${dueCount} cards due today`}
    >
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: `${accentColor}20` }]}>
        {deck.icon && /^[a-z]/.test(deck.icon) ? (
          <Ionicons name={deck.icon as any} size={22} color={accentColor} />
        ) : (
          <Text style={styles.icon}>{deck.icon ?? '📚'}</Text>
        )}
      </View>

      {/* Name + description */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{resolvedName}</Text>
        {resolvedDescription ? (
          <View style={styles.descRow}>
            <Text style={styles.description} numberOfLines={1}>{resolvedDescription}</Text>
            {deck.is_public_download && <LanguageBadge supported_languages={deck.supported_languages} />}
          </View>
        ) : deck.is_public_download ? (
          <LanguageBadge supported_languages={deck.supported_languages} />
        ) : null}
      </View>

      {/* Due pill */}
      <View style={[styles.duePill, { backgroundColor: solidTint(accentColor, 0x12 / 255) }]}>
        <Text style={[styles.dueCount, { color: accentColor }]}>{dueCount}</Text>
        <Text style={[styles.dueLabel, { color: accentColor }]}>{t('due')}</Text>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  icon: { fontSize: 22 },
  info: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  descRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  // Compact pill badge for due count
  duePill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 48,
    flexShrink: 0,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  dueCount: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 20,
  },
  dueLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    opacity: 0.8,
  },
});
