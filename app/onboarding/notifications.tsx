import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/ui/Button';
import { colors, spacing, typography } from '../../src/constants';
import { useTranslation } from '../../src/i18n';
import { requestNotificationPermissions } from '../../src/services/notifications';
import { useAppStore } from '../../src/stores/useAppStore';

export default function NotificationsOnboardingScreen() {
  const { t } = useTranslation();
  const { markOnboardingComplete } = useAppStore();

  const handleEnable = async () => {
    await requestNotificationPermissions();
    await markOnboardingComplete();
    router.replace('/(tabs)');
  };

  const handleSkip = async () => {
    await markOnboardingComplete();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔔</Text>
        </View>
        <Text style={styles.title}>{t('notifications_onboarding_title')}</Text>
        <Text style={styles.subtitle}>{t('notifications_onboarding_subtitle')}</Text>
        <View style={styles.buttons}>
          <Button label={t('notifications_enable')} onPress={handleEnable} />
          <Button
            label={t('maybe_later')}
            onPress={handleSkip}
            variant="secondary"
            style={styles.skipBtn}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8EDFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  icon: { fontSize: 56 },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: spacing.xl * 2,
  },
  buttons: { width: '100%' },
  skipBtn: { marginTop: spacing.sm },
});
