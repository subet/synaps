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
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { colors, spacing, typography } from '../../src/constants';
import { useAuthStore } from '../../src/stores/useAuthStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { login, isLoading, error, clearError } = useAuthStore();

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    }

    return valid;
  };

  const handleLogin = async () => {
    clearError();
    if (!validate()) return;

    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch {
      // Error is already set in store
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.emoji}>🧠</Text>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to sync your study progress</Text>
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={emailError}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            error={passwordError}
            placeholder="••••••••"
            secureTextEntry
            autoComplete="current-password"
          />

          <Button
            label="Log In"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginBtn}
          />

          <Pressable onPress={() => router.push('/auth/register')} style={styles.switchLink}>
            <Text style={styles.switchText}>
              Don't have an account? <Text style={styles.switchAction}>Sign up</Text>
            </Text>
          </Pressable>
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
  emoji: { fontSize: 56, marginBottom: spacing.md },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  errorBanner: {
    backgroundColor: '#FFE0E0',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: { ...typography.caption, color: colors.danger },
  loginBtn: { marginTop: spacing.sm },
  switchLink: { alignItems: 'center', marginTop: spacing.lg },
  switchText: { ...typography.body, color: colors.textSecondary },
  switchAction: { color: colors.primary, fontWeight: '600' },
});
