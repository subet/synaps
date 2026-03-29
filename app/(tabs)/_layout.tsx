import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../src/constants';

type TabConfig = {
  name: string;
  label: string;
  iconFocused: keyof typeof Ionicons.glyphMap;
  iconUnfocused: keyof typeof Ionicons.glyphMap;
};

const TABS: TabConfig[] = [
  { name: 'index', label: 'Home', iconFocused: 'home', iconUnfocused: 'home-outline' },
  { name: 'library', label: 'Library', iconFocused: 'library', iconUnfocused: 'library-outline' },
  { name: 'settings', label: 'Settings', iconFocused: 'settings', iconUnfocused: 'settings-outline' },
];

function TabItem({
  label,
  iconFocused,
  iconUnfocused,
  focused,
  onPress,
  onLongPress,
}: {
  label: string;
  iconFocused: keyof typeof Ionicons.glyphMap;
  iconUnfocused: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0.92)).current;
  const opacityAnim = useRef(new Animated.Value(focused ? 1 : 0.55)).current;
  const dotOpacity = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const dotScale = useRef(new Animated.Value(focused ? 1 : 0.4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1 : 0.92,
        useNativeDriver: true,
        damping: 15,
        stiffness: 200,
      }),
      Animated.spring(opacityAnim, {
        toValue: focused ? 1 : 0.55,
        useNativeDriver: true,
        damping: 15,
        stiffness: 200,
      }),
      Animated.spring(dotOpacity, {
        toValue: focused ? 1 : 0,
        useNativeDriver: true,
        damping: 15,
        stiffness: 200,
      }),
      Animated.spring(dotScale, {
        toValue: focused ? 1 : 0.4,
        useNativeDriver: true,
        damping: 15,
        stiffness: 200,
      }),
    ]).start();
  }, [focused]);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      android_ripple={{ color: colors.primaryLight, radius: 32, borderless: true }}
    >
      <Animated.View
        style={[
          styles.iconWrapper,
          focused && styles.iconWrapperActive,
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        ]}
      >
        <Ionicons
          name={focused ? iconFocused : iconUnfocused}
          size={22}
          color={focused ? colors.primary : colors.textMuted}
        />
      </Animated.View>
      <Text
        numberOfLines={1}
        style={[styles.tabLabel, focused ? styles.tabLabelActive : styles.tabLabelInactive]}
      >
        {label}
      </Text>
      <Animated.View
        style={[
          styles.activeDot,
          { opacity: dotOpacity, transform: [{ scale: dotScale }] },
        ]}
      />
    </Pressable>
  );
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const tab = TABS[index];
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          if (!tab) return null;

          return (
            <TabItem
              key={route.key}
              label={tab.label}
              iconFocused={tab.iconFocused}
              iconUnfocused={tab.iconUnfocused}
              focused={focused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="library" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 3,
  },
  iconWrapper: {
    width: 40,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: colors.primaryLight,
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: colors.textMuted,
    fontWeight: '500',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 1,
  },
});
