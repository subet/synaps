import React, { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, borderRadius, spacing, typography } from '../../constants';
import { tap } from '../../utils/haptics';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export interface FABMenuItem {
  label: string;
  icon: IoniconName;
  onPress: () => void;
}

interface FABMenuProps {
  items: FABMenuItem[];
  style?: ViewStyle;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FABMenu({ items, style }: FABMenuProps) {
  const [open, setOpen] = useState(false);
  const rotation = useSharedValue(0);
  const progress = useSharedValue(0);
  const fabScale = useSharedValue(1);

  const toggle = () => {
    tap();
    const next = !open;
    setOpen(next);
    rotation.value = withTiming(next ? 1 : 0, { duration: 250, easing: Easing.out(Easing.cubic) });
    progress.value = withTiming(next ? 1 : 0, { duration: 300, easing: Easing.out(Easing.cubic) });
  };

  const close = () => {
    setOpen(false);
    rotation.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.cubic) });
    progress.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.cubic) });
  };

  const fabAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: fabScale.value },
      { rotate: `${interpolate(rotation.value, [0, 1], [0, 45])}deg` },
    ],
  }));

  return (
    <>
      {/* Full-screen overlay when open */}
      {open && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.overlay}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />

          {/* Menu items positioned from bottom-right */}
          <View style={styles.menuColumn}>
            {items.map((item, i) => (
              <MenuItem
                key={item.label}
                item={item}
                index={i}
                total={items.length}
                progress={progress}
                onPress={() => { close(); item.onPress(); }}
              />
            ))}
          </View>
        </Animated.View>
      )}

      {/* FAB button */}
      <AnimatedPressable
        style={[styles.fab, fabAnimStyle, style]}
        onPress={toggle}
        onPressIn={() => { fabScale.value = withTiming(0.9, { duration: 100 }); }}
        onPressOut={() => { fabScale.value = withTiming(1, { duration: 150 }); }}
        accessibilityLabel="Menu"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={28} color="white" />
      </AnimatedPressable>
    </>
  );
}

function MenuItem({
  item,
  index,
  total,
  progress,
  onPress,
}: {
  item: FABMenuItem;
  index: number;
  total: number;
  progress: SharedValue<number>;
  onPress: () => void;
}) {
  const reverseIndex = total - 1 - index;
  // Stagger: items closer to FAB appear first
  const staggerStart = reverseIndex * 0.12;

  const animStyle = useAnimatedStyle(() => {
    const itemProgress = Math.max(0, Math.min(1, (progress.value - staggerStart) / (1 - staggerStart)));
    const opacity = interpolate(itemProgress, [0, 0.4, 1], [0, 1, 1]);
    const translateY = interpolate(itemProgress, [0, 1], [40, 0]);
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <Animated.View style={animStyle}>
      <Pressable style={styles.menuItemInner} onPress={onPress} onPressIn={tap}>
        <View style={styles.menuIconWrap}>
          <Ionicons name={item.icon} size={20} color={colors.primary} />
        </View>
        <Text style={styles.menuLabel}>{item.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 100,
  },
  menuColumn: {
    position: 'absolute',
    bottom: 84,
    right: 16,
    alignItems: 'flex-end',
    gap: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 101,
  },
  menuItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
    paddingRight: spacing.md + 4,
    gap: spacing.sm,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
});
