import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { useTranslation } from '../../i18n';
import { BadgeWithStatus } from '../../services/badgeService';

interface BadgeItemProps {
  badge: BadgeWithStatus;
  size?: 'sm' | 'lg';
}

export function BadgeItem({ badge, size = 'lg' }: BadgeItemProps) {
  const { t } = useTranslation();
  const isSmall = size === 'sm';
  const circleSize = isSmall ? 52 : 72;
  const iconSize = isSmall ? 22 : 30;
  const { achieved, progress, color } = badge;

  const bgColor = achieved
    ? `${color}22`
    : progress > 0
    ? '#F3F4F680'
    : '#F3F4F6';

  const borderColor = achieved ? color : colors.border;

  return (
    <View style={[styles.container, isSmall && styles.containerSm]}>
      <View
        style={[
          styles.circle,
          { width: circleSize, height: circleSize, borderRadius: circleSize / 2, backgroundColor: bgColor, borderColor },
        ]}
      >
        <Text style={{ fontSize: iconSize, opacity: achieved ? 1 : 0.35 }}>
          {badge.icon}
        </Text>
        {!achieved && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={12} color={colors.textMuted} />
          </View>
        )}
      </View>

      {/* Progress ring for in-progress badges */}
      {!achieved && progress > 0 && (
        <View style={[styles.progressRing, { width: circleSize + 6, height: circleSize + 6, borderRadius: (circleSize + 6) / 2 }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: circleSize + 6,
                height: circleSize + 6,
                borderRadius: (circleSize + 6) / 2,
                borderColor: color,
                borderWidth: 3,
                opacity: 0.6,
              },
            ]}
          />
        </View>
      )}

      <Text
        style={[styles.name, isSmall && styles.nameSm, { color: achieved ? colors.textPrimary : colors.textMuted }]}
        numberOfLines={2}
      >
        {t(badge.nameKey)}
      </Text>

      {!achieved && progress > 0 && (
        <Text style={styles.progressText}>
          {badge.currentValue}/{badge.threshold}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 88,
    gap: spacing.xs,
  },
  containerSm: {
    width: 68,
  },
  circle: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  progressRing: {
    position: 'absolute',
    top: -3,
    left: '50%',
    marginLeft: -((52 + 6) / 2),
  },
  progressFill: {
    borderStyle: 'solid',
  },
  name: {
    ...typography.small,
    textAlign: 'center',
    fontWeight: '600',
  },
  nameSm: {
    fontSize: 10,
  },
  progressText: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '500',
  },
});
