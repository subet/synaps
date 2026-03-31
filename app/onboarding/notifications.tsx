import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SynapsLogo } from '../../src/components/ui/SynapsLogo';
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
    <View style={styles.root}>
      <LinearGradient
        colors={['#FFFFFF', '#D4D8F6']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.bgCircle} pointerEvents="none" />
      <SafeAreaView style={styles.safe}>
        {/* Top logo */}
        <View style={styles.logoHeader}>
          <SynapsLogo width={150} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.glowWrapper}>
            <LinearGradient
              colors={['#4361EE', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconCircle}
            >
              <Ionicons name="notifications-outline" size={72} color="#FFFFFF" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>{t('notifications_onboarding_title')}</Text>
          <Text style={styles.subtitle}>{t('notifications_onboarding_subtitle')}</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <Pressable onPress={handleEnable} style={styles.primaryBtnWrapper}>
            <LinearGradient
              colors={['#4361EE', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>{t('notifications_enable')}</Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={handleSkip} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>{t('maybe_later')}</Text>
          </Pressable>

          <Text style={styles.footer}>
            Read our{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
            {' '}to learn more.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  logoHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  glowWrapper: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 176,
    height: 176,
    borderRadius: 88,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.body,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 26,
  },
  buttons: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
  primaryBtnWrapper: { width: '100%' },
  primaryBtn: {
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  footer: {
    ...typography.small,
    color: '#999999',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  bgCircle: {
    position: 'absolute',
    width: 800,
    height: 800,
    borderRadius: 400,
    borderWidth: 1.5,
    borderColor: 'rgba(100, 80, 200, 0.15)',
    right: -420,
    bottom: -180,
  },
});
