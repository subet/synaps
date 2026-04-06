import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { borderRadius, colors, spacing, typography } from '../../src/constants';
import { useAuthStore } from '../../src/stores/useAuthStore';

export default function EditProfileScreen() {
  const { user, profile, updateProfile } = useAuthStore();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const initials = (profile?.display_name?.[0] ?? user?.email?.[0] ?? 'U').toUpperCase();

  const handleSave = async () => {
    const trimmed = displayName.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Please enter a display name.');
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({ display_name: trimmed });
      router.back();
    } catch {
      Alert.alert('Error', 'Could not update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>

          {/* Fields */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DISPLAY NAME</Text>
            <View style={styles.card}>
              <Input
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your name"
                autoCorrect={false}
                containerStyle={styles.inputContainer}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>EMAIL</Text>
            <View style={styles.card}>
              <View style={styles.readonlyRow}>
                <Text style={styles.readonlyValue}>{user?.email}</Text>
              </View>
            </View>
            <Text style={styles.hint}>Email cannot be changed here.</Text>
          </View>

          <Button
            label={isSaving ? 'Saving…' : 'Save Changes'}
            onPress={handleSave}
            disabled={isSaving}
            style={styles.saveBtn}
          />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.sm },
  title: { ...typography.h3, color: colors.textPrimary, flex: 1, textAlign: 'center' },
  headerRight: { width: 38 },
  content: { padding: spacing.md, paddingBottom: 48 },
  avatarContainer: { alignItems: 'center', marginVertical: spacing.lg },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: colors.primary },
  section: { marginBottom: spacing.md },
  sectionLabel: {
    ...typography.small,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  inputContainer: {
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  readonlyRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  readonlyValue: { ...typography.body, color: colors.textSecondary },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
    paddingHorizontal: 4,
  },
  saveBtn: { marginTop: spacing.md },
});
