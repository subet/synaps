import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/ui/Button';
import { borderRadius, colors, spacing, typography } from '../../src/constants';
import { useTranslation } from '../../src/i18n';

async function requestATT() {
  if (Platform.OS === 'ios') {
    await requestTrackingPermissionsAsync();
  }
}

export default function ATTScreen() {
  const { t } = useTranslation();

  const handleAllow = async () => {
    await requestATT();
    router.replace('/paywall');
  };

  const handleSkip = () => {
    router.replace('/paywall');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🎯</Text>
        </View>
        <Text style={styles.title}>{t('att_title')}</Text>
        <Text style={styles.subtitle}>{t('att_subtitle')}</Text>
        <View style={styles.buttons}>
          <Button label={t('att_allow')} onPress={handleAllow} />
          <Button
            label={t('skip')}
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
