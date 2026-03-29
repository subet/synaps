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

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ displayName: '', email: '', password: '' });

  const { register, isLoading, error, clearError } = useAuthStore();

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
      router.replace('/(tabs)');
    } catch {
      // Error set in store
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.emoji}>✨</Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Synaps to sync your progress across devices</Text>
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Input
            label="Display Name"
            value={displayName}
            onChangeText={setDisplayName}
            error={errors.displayName}
            placeholder="Your name"
            autoCapitalize="words"
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            placeholder="At least 6 characters"
            secureTextEntry
          />

          <Button label="Create Account" onPress={handleRegister} loading={isLoading} style={styles.registerBtn} />

          <Pressable onPress={() => router.push('/auth/login')} style={styles.switchLink}>
            <Text style={styles.switchText}>
              Already have an account? <Text style={styles.switchAction}>Log in</Text>
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
  errorBanner: { backgroundColor: '#FFE0E0', borderRadius: 8, padding: spacing.md, marginBottom: spacing.md },
  errorText: { ...typography.caption, color: colors.danger },
  registerBtn: { marginTop: spacing.sm },
  switchLink: { alignItems: 'center', marginTop: spacing.lg },
  switchText: { ...typography.body, color: colors.textSecondary },
  switchAction: { color: colors.primary, fontWeight: '600' },
});
