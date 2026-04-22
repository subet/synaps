import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../src/constants';
import { useTranslation } from '../../src/i18n';

async function requestATT() {
  if (Platform.OS === 'ios') {
    await requestTrackingPermissionsAsync();
  }
}

export default function ATTScreen() {
  const { t } = useTranslation();

  const handleContinue = () => {
    // Navigate first, then request ATT in the background
    router.replace('/paywall?onboarding=1');
    requestATT().catch(() => {});
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#FFFFFF', '#D4D8F6']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.bgCircle} pointerEvents="none" />
      <SafeAreaView style={styles.safe}>
        {/* Content */}
        <View style={styles.content}>
          <View style={styles.glowWrapper}>
            <LinearGradient
              colors={['#4361EE', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconCircle}
            >
              <Ionicons name="analytics-outline" size={72} color="#FFFFFF" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>{t('att_title')}</Text>
          <Text style={styles.subtitle}>{t('att_subtitle')}</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <Pressable onPress={handleContinue} style={styles.primaryBtnWrapper}>
            <LinearGradient
              colors={['#4361EE', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>{t('continue')}</Text>
            </LinearGradient>
          </Pressable>

          <Text style={styles.footer}>
            Read our{' '}
            <Text style={styles.footerLink} onPress={() => router.push('/legal/privacy')}>Privacy Policy</Text>
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
