import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,

  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { colors, spacing, typography } from '../../src/constants';
import { useTranslation } from '../../src/i18n';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useAppStore } from '../../src/stores/useAppStore';
import { SocialAuthButtons } from '../../src/components/auth/SocialAuthButtons';

const LOGO_ICON_SVG = `<svg viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4361EE"/>
      <stop offset="50%" stop-color="#7C3AED"/>
      <stop offset="100%" stop-color="#EC4899"/>
    </linearGradient>
    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4361EE"/>
      <stop offset="50%" stop-color="#7C3AED"/>
      <stop offset="100%" stop-color="#EC4899"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="480" height="480" rx="110" fill="url(#bg)"/>
  <circle cx="240" cy="240" r="165" fill="#fff" opacity="0.04"/>
  <line x1="240" y1="240" x2="108" y2="108" stroke="#fff" stroke-width="19" stroke-linecap="round" opacity="0.45"/>
  <line x1="240" y1="240" x2="372" y2="93" stroke="#fff" stroke-width="16" stroke-linecap="round" opacity="0.4"/>
  <line x1="240" y1="240" x2="405" y2="262" stroke="#fff" stroke-width="13.5" stroke-linecap="round" opacity="0.3"/>
  <line x1="240" y1="240" x2="87" y2="312" stroke="#fff" stroke-width="13.5" stroke-linecap="round" opacity="0.3"/>
  <line x1="240" y1="240" x2="175" y2="394" stroke="#fff" stroke-width="16" stroke-linecap="round" opacity="0.4"/>
  <line x1="240" y1="240" x2="372" y2="377" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity="0.25"/>
  <circle cx="174" cy="174" r="15" fill="#fff" opacity="0.85"/>
  <circle cx="306" cy="166" r="12" fill="#fff" opacity="0.7"/>
  <circle cx="207" cy="317" r="12" fill="#fff" opacity="0.65"/>
  <circle cx="306" cy="308" r="10" fill="#fff" opacity="0.45"/>
  <circle cx="108" cy="108" r="25" fill="#fff" opacity="0.95"/>
  <circle cx="372" cy="93" r="21" fill="#fff" opacity="0.85"/>
  <circle cx="405" cy="262" r="19" fill="#fff" opacity="0.7"/>
  <circle cx="87" cy="312" r="19" fill="#fff" opacity="0.7"/>
  <circle cx="175" cy="394" r="22" fill="#fff" opacity="0.9"/>
  <circle cx="372" cy="377" r="17" fill="#fff" opacity="0.6"/>
  <circle cx="240" cy="240" r="55" fill="#fff"/>
  <circle cx="240" cy="240" r="34" fill="none" stroke="url(#cg)" stroke-width="10" opacity="0.5"/>
  <circle cx="240" cy="240" r="17" fill="url(#cg)" opacity="0.35"/>
</svg>`;

export default function RegisterScreen() {
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ displayName: '', email: '', password: '' });

  const { register, loginWithGoogle, loginWithApple, isLoading, error, clearError } = useAuthStore();
  const { hasSeenOnboarding } = useAppStore();
  const inOnboarding = !hasSeenOnboarding;

  const validate = () => {
    const newErrors = { displayName: '', email: '', password: '' };
    let valid = true;

    if (!displayName.trim()) { newErrors.displayName = 'Name is required'; valid = false; }
    if (!email.trim()) { newErrors.email = 'Email is required'; valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { newErrors.email = 'Please enter a valid email'; valid = false; }
    if (!password) { newErrors.password = 'Password is required'; valid = false; }
    else if (password.length < 6) { newErrors.password = 'Password must be at least 6 characters'; valid = false; }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async () => {
    clearError();
    if (!validate()) return;
    try {
      await register(email.trim(), password, displayName.trim());
      router.replace(inOnboarding ? '/onboarding/notifications' : '/(tabs)');
    } catch {
      // Error set in store
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable style={styles.backBtn} onPress={() => inOnboarding ? router.replace('/onboarding/notifications') : router.replace('/(tabs)')}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </Pressable>

          <View style={styles.header}>
            <SvgXml xml={LOGO_ICON_SVG} width={80} height={80} style={styles.logo} />
            <Text style={styles.title}>{t('register')}</Text>
            <Text style={styles.subtitle}>{t('register_subtitle')}</Text>
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Input
            label={t('display_name')}
            value={displayName}
            onChangeText={setDisplayName}
            error={errors.displayName}
            placeholder={t('your_name')}
            autoCapitalize="words"
          />
          <Input
            label={t('email')}
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            placeholder={t('email_placeholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Input
            label={t('password')}
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            placeholder={t('min_chars')}
            secureTextEntry
          />

          <Button label={t('register')} onPress={handleRegister} loading={isLoading} style={styles.registerBtn} />

          <SocialAuthButtons
            onApple={async () => {
              clearError();
              try {
                await loginWithApple();
                if (useAuthStore.getState().user) {
                  router.replace(inOnboarding ? '/onboarding/notifications' : '/(tabs)');
                }
              } catch {}
            }}
            onGoogle={async () => {
              clearError();
              try {
                await loginWithGoogle();
                if (useAuthStore.getState().user) {
                  router.replace(inOnboarding ? '/onboarding/notifications' : '/(tabs)');
                }
              } catch {}
            }}
            isLoading={isLoading}
          />

          <Pressable onPress={() => router.push('/auth/login')} style={styles.switchLink}>
            <Text style={styles.switchText}>{t('has_account')}</Text>
          </Pressable>

          {inOnboarding && (
            <Pressable onPress={() => router.replace('/onboarding/notifications')} style={styles.switchLink}>
              <Text style={[styles.switchText, { color: colors.textMuted }]}>{t('onboarding_continue_without')}</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 60 },
  backBtn: { paddingVertical: spacing.sm, marginBottom: spacing.md },
  backText: { ...typography.body, color: colors.primary },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { marginBottom: spacing.md, borderRadius: 18 },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  errorBanner: { backgroundColor: '#FFE0E0', borderRadius: 8, padding: spacing.md, marginBottom: spacing.md },
  errorText: { ...typography.caption, color: colors.danger },
  registerBtn: { marginTop: spacing.sm },
  switchLink: { alignItems: 'center', marginTop: spacing.lg },
  switchText: { ...typography.body, color: colors.textSecondary },
  switchAction: { color: colors.primary, fontWeight: '600' },
});
