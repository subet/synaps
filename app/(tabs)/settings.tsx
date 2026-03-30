import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,

  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Toggle } from '../../src/components/ui/Toggle';
import { borderRadius, colors, spacing, typography } from '../../src/constants';
import {
  cancelDailyReminder,
  requestNotificationPermissions,
  scheduleDailyReminder,
} from '../../src/services/notifications';
import { useAppStore } from '../../src/stores/useAppStore';
import { tap } from '../../src/utils/haptics';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useSubscriptionStore } from '../../src/stores/useSubscriptionStore';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

function SettingsRow({
  label,
  value,
  onPress,
  right,
  danger,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && onPress && styles.rowPressed]}
      onPress={() => { tap(); onPress?.(); }}
      disabled={!onPress && !right}
    >
      <Text style={[styles.rowLabel, danger && styles.dangerText]}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {right}
        {onPress && !right && <Text style={styles.chevron}>›</Text>}
      </View>
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const { notifications, language, hapticsEnabled, setNotificationsEnabled, setNotificationTime, setLanguage, setHapticsEnabled } = useAppStore();
  const { user, logout } = useAuthStore();
  const { isPro } = useSubscriptionStore();
  const [showTimePicker, setShowTimePicker] = useState(false);

  const timeDate = (() => {
    const [h, m] = notifications.time.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  })();

  const handleReminderToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert('Permission Required', 'Please enable notifications in your device settings.');
        return;
      }
      const [h, m] = notifications.time.split(':').map(Number);
      await scheduleDailyReminder(h, m);
    } else {
      await cancelDailyReminder();
    }
    setNotificationsEnabled(enabled);
  };

  const handleTimeChange = async (_: any, date?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (date) {
      const h = date.getHours().toString().padStart(2, '0');
      const m = date.getMinutes().toString().padStart(2, '0');
      const timeStr = `${h}:${m}`;
      await setNotificationTime(timeStr);
      if (notifications.enabled) {
        await scheduleDailyReminder(date.getHours(), date.getMinutes());
      }
    }
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your local data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('Done', 'All local data has been deleted. Please restart the app.');
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {/* Account */}
        {user ? (
          <Section title="Account">
            <View style={[styles.row, styles.profileRow]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(user.email ?? 'U')[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user.email}</Text>
                {isPro && <View style={styles.proBadge}><Text style={styles.proBadgeText}>PRO</Text></View>}
              </View>
            </View>
            <SettingsRow label="Manage Subscription" onPress={() => router.push('/paywall')} />
            <SettingsRow label="Sync Data" onPress={() => Alert.alert('Sync', 'Cloud sync requires PRO subscription.')} />
            <SettingsRow label="Sign Out" onPress={handleSignOut} danger />
          </Section>
        ) : (
          <Section title="Account">
            <SettingsRow label="Sign In" onPress={() => router.push('/auth/login')} />
            <SettingsRow label="Create Account" onPress={() => router.push('/auth/register')} />
          </Section>
        )}

        {/* App Settings */}
        <Section title="App Settings">
          <SettingsRow
            label="Reminders"
            right={
              <Toggle
                value={notifications.enabled}
                onValueChange={handleReminderToggle}
              />
            }
          />
          {notifications.enabled && (
            <SettingsRow
              label="Reminder time"
              value={notifications.time}
              onPress={() => setShowTimePicker(true)}
            />
          )}
          <SettingsRow
            label="Haptics"
            right={
              <Toggle
                value={hapticsEnabled}
                onValueChange={(v) => { tap(); setHapticsEnabled(v); }}
              />
            }
          />
          <SettingsRow
            label="Language"
            value={language === 'tr' ? 'Türkçe' : 'English'}
            onPress={() => {
              Alert.alert('Language', 'Select language', [
                { text: 'English', onPress: () => setLanguage('en') },
                { text: 'Türkçe', onPress: () => setLanguage('tr') },
                { text: 'Cancel', style: 'cancel' },
              ]);
            }}
          />
          <SettingsRow
            label="Rate us"
            onPress={() => {
              const appStoreId = process.env.EXPO_PUBLIC_APP_STORE_ID;
              const androidPackage = process.env.EXPO_PUBLIC_ANDROID_PACKAGE;
              const url = Platform.select({
                ios: appStoreId && appStoreId !== 'PENDING'
                  ? `itms-apps://itunes.apple.com/app/id${appStoreId}?action=write-review`
                  : null,
                android: `market://details?id=${androidPackage}`,
              });
              if (url) {
                Linking.openURL(url).catch(() => {
                  // market:// may fail on emulators — fall back to browser
                  const webUrl = Platform.select({
                    android: `https://play.google.com/store/apps/details?id=${androidPackage}`,
                  });
                  if (webUrl) Linking.openURL(webUrl).catch(() => {});
                });
              } else {
                Alert.alert('Coming Soon', 'The App Store listing is not available yet.');
              }
            }}
          />
          <SettingsRow label="Delete all data" onPress={handleDeleteData} danger />
        </Section>

        {/* Legal */}
        <Section title="Legal & Support">
          <SettingsRow label="Terms & Conditions" onPress={() => router.push('/legal/terms')} />
          <SettingsRow label="Privacy Policy" onPress={() => router.push('/legal/privacy')} />
          <SettingsRow label="Contact Support" onPress={() => router.push('/legal/support')} />
        </Section>

        <Text style={styles.version}>App Version {version}</Text>

        {showTimePicker && (
          <DateTimePicker
            value={timeDate}
            mode="time"
            is24Hour
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  title: { ...typography.h1, color: colors.textPrimary, padding: spacing.md },
  section: { marginBottom: spacing.lg, paddingHorizontal: spacing.md },
  sectionTitle: { ...typography.captionBold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  sectionCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowPressed: { opacity: 0.7 },
  rowLabel: { ...typography.body, color: colors.textPrimary, flex: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowValue: { ...typography.body, color: colors.textSecondary },
  chevron: { fontSize: 20, color: colors.textMuted },
  dangerText: { color: colors.danger },
  profileRow: { paddingVertical: spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: { ...typography.h3, color: colors.primary },
  profileInfo: { flex: 1 },
  profileName: { ...typography.bodyBold, color: colors.textPrimary },
  proBadge: { backgroundColor: colors.primary, borderRadius: borderRadius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 4 },
  proBadgeText: { ...typography.smallBold, color: colors.white },
  version: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
});
