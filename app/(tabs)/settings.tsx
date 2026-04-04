import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
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
import { useTranslation } from '../../src/i18n';
import { TabHeader } from '../../src/components/ui/TabHeader';
import { useAppStore } from '../../src/stores/useAppStore';
import { tap } from '../../src/utils/haptics';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useSubscriptionStore } from '../../src/stores/useSubscriptionStore';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from '../../src/types';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en',    label: 'English' },
  { code: 'de',    label: 'Deutsch' },
  { code: 'es',    label: 'Español' },
  { code: 'fr',    label: 'Français' },
  { code: 'it',    label: 'Italiano' },
  { code: 'nl',    label: 'Nederlands' },
  { code: 'pt_BR', label: 'Português (Brasil)' },
  { code: 'pt_PT', label: 'Português (Portugal)' },
  { code: 'ru',    label: 'Русский' },
  { code: 'tr',    label: 'Türkçe' },
  { code: 'zh',    label: '中文' },
];

const LANGUAGE_NAMES: Record<Language, string> = Object.fromEntries(
  LANGUAGES.map(({ code, label }) => [code, label])
) as Record<Language, string>;

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
  const { t } = useTranslation();
  const { notifications, language, hapticsEnabled, setNotificationsEnabled, setNotificationTime, setLanguage, setHapticsEnabled } = useAppStore();
  const { user, profile, logout } = useAuthStore();
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
        Alert.alert(t('permission_required'), t('notifications_permission'));
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
    if (Platform.OS === 'android') setShowTimePicker(false);
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
      t('delete_data_title'),
      t('delete_data_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert(t('done'), t('data_deleted'));
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(t('sign_out_title'), t('sign_out_confirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('sign_out'), style: 'destructive', onPress: logout },
    ]);
  };

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TabHeader />
      <ScrollView contentContainerStyle={styles.content}>

        {/* Account */}
        {user ? (
          <Section title={t('account')}>
            <View style={[styles.row, styles.profileRow]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(profile?.display_name?.[0] ?? user.email?.[0] ?? 'U').toUpperCase()}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName} numberOfLines={1} ellipsizeMode="tail">
                  {profile?.display_name || user.email}
                </Text>
                {isPro && <View style={styles.proBadge}><Text style={styles.proBadgeText}>{t('pro_badge')}</Text></View>}
              </View>
            </View>
            <SettingsRow label={t('manage_subscription')} onPress={() => {
              if (isPro) {
                const url = Platform.OS === 'ios'
                  ? 'https://apps.apple.com/account/subscriptions'
                  : 'https://play.google.com/store/account/subscriptions';
                Linking.openURL(url);
              } else {
                router.push('/paywall');
              }
            }} />
            <SettingsRow label={t('sync_data')} onPress={() => {
              if (!isPro) {
                Alert.alert('Sync', t('sync_requires_pro'));
                return;
              }
              Alert.alert('Sync', t('sync_coming_soon'));
            }} />
            <SettingsRow label={t('sign_out')} onPress={handleSignOut} danger />
          </Section>
        ) : (
          <Section title={t('account')}>
            <SettingsRow label={t('sign_in')} onPress={() => router.push('/auth/login')} />
            <SettingsRow label={t('register')} onPress={() => router.push('/auth/register')} />
          </Section>
        )}

        {/* App Settings */}
        <Section title={t('section_app_settings')}>
          <SettingsRow
            label={t('reminders')}
            right={
              <Toggle
                value={notifications.enabled}
                onValueChange={handleReminderToggle}
              />
            }
          />
          {notifications.enabled && (
            <SettingsRow
              label={t('reminder_time')}
              value={notifications.time}
              onPress={() => setShowTimePicker(true)}
            />
          )}
          <SettingsRow
            label={t('haptics')}
            right={
              <Toggle
                value={hapticsEnabled}
                onValueChange={(v) => { tap(); setHapticsEnabled(v); }}
              />
            }
          />
          <SettingsRow
            label={t('ui_language')}
            value={LANGUAGE_NAMES[language] ?? 'English'}
            onPress={() => {
              Alert.alert(t('ui_language'), t('select_language'), [
                ...LANGUAGES.map(({ code, label }) => ({
                  text: label,
                  onPress: () => setLanguage(code),
                })),
                { text: t('cancel'), style: 'cancel' },
              ]);
            }}
          />
          <SettingsRow
            label={t('rate_us')}
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
                  const webUrl = Platform.select({
                    android: `https://play.google.com/store/apps/details?id=${androidPackage}`,
                  });
                  if (webUrl) Linking.openURL(webUrl).catch(() => {});
                });
              } else {
                Alert.alert(t('coming_soon'), t('app_store_pending'));
              }
            }}
          />
          <SettingsRow label={t('delete_data')} onPress={handleDeleteData} danger />
        </Section>

        {/* Legal */}
        <Section title={t('section_legal')}>
          <SettingsRow label={t('terms')} onPress={() => router.push('/legal/terms')} />
          <SettingsRow label={t('privacy')} onPress={() => router.push('/legal/privacy')} />
          <SettingsRow label={t('contact_support')} onPress={() => router.push('/legal/support')} />
        </Section>

        <Text style={styles.version}>{t('app_version')} {version}</Text>

        {/* Android: renders inline as a native dialog */}
        {showTimePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={timeDate}
            mode="time"
            is24Hour
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </ScrollView>

      {/* iOS: modal overlay with spinner + Done button */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showTimePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setShowTimePicker(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('reminder_modal_title')}</Text>
              <Pressable onPress={() => setShowTimePicker(false)} style={styles.modalDone}>
                <Text style={styles.modalDoneText}>{t('done')}</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={timeDate}
              mode="time"
              is24Hour={false}
              display="spinner"
              onChange={handleTimeChange}
              style={styles.picker}
            />
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    flex: 1,
  },
  modalDone: { padding: spacing.sm },
  modalDoneText: { ...typography.bodyBold, color: colors.primary },
  picker: { width: '100%' },
});
