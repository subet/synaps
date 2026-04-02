import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../../src/components/ui/Button';
import { CountryPicker } from '../../src/components/ui/CountryPicker';
import { Input } from '../../src/components/ui/Input';
import { borderRadius, colors, spacing, typography } from '../../src/constants';
import { useTranslation } from '../../src/i18n';
import { useAuthStore } from '../../src/stores/useAuthStore';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, profile, updateProfile, uploadProfileAvatar, updateEmail, updatePassword } = useAuthStore();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [country, setCountry] = useState(profile?.country ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const isSocialLogin = user?.app_metadata?.provider === 'apple' || user?.app_metadata?.provider === 'google';

  const initial = (
    profile?.display_name?.[0] ??
    user?.email?.[0] ??
    '?'
  ).toUpperCase();

  const avatarUri = profile?.avatar_url ?? null;

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('permission_required'), t('photo_permission'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setUploadingPhoto(true);
      try {
        await uploadProfileAvatar(result.assets[0].uri);
      } catch {
        Alert.alert(t('error'), t('profile_avatar_error'));
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateProfile({ display_name: displayName.trim(), country: country.trim() });
      Alert.alert(t('success'), t('profile_saved'));
    } catch (e: any) {
      console.error('[updateProfile error]', e);
      Alert.alert(t('error'), e.message ?? t('profile_save_error'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdateEmail = async () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    setSavingEmail(true);
    try {
      await updateEmail(trimmed);
      Alert.alert(t('success'), t('profile_email_confirmation'));
    } catch (e: any) {
      Alert.alert(t('error'), e.message ?? t('profile_email_error'));
    } finally {
      setSavingEmail(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) return;
    if (newPassword !== confirmPassword) {
      Alert.alert(t('error'), t('profile_password_mismatch'));
      return;
    }
    setSavingPassword(true);
    try {
      await updatePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert(t('success'), t('profile_password_updated'));
    } catch (e: any) {
      Alert.alert(t('error'), e.message ?? t('profile_password_error'));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Back button */}
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
          </Pressable>

          <Text style={styles.screenTitle}>{t('profile_edit_title')}</Text>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <Pressable style={styles.avatarCircle} onPress={handlePickAvatar} disabled={uploadingPhoto}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarInitial}>{initial}</Text>
              )}
              <View style={styles.avatarOverlay}>
                <Ionicons name="camera" size={18} color={colors.white} />
              </View>
            </Pressable>
            <Pressable onPress={handlePickAvatar} disabled={uploadingPhoto}>
              <Text style={styles.changePhotoText}>
                {uploadingPhoto ? t('loading') : t('change_photo')}
              </Text>
            </Pressable>
          </View>

          {/* Profile section */}
          <View style={styles.section}>
            <Input
              label={t('display_name')}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={t('your_name')}
              autoCapitalize="words"
            />
            <CountryPicker
              label={t('country')}
              value={country}
              onChange={setCountry}
            />
            <Button
              label={t('save')}
              onPress={handleSaveProfile}
              loading={savingProfile}
              style={styles.sectionBtn}
            />
          </View>

          {!isSocialLogin && (
            <>
              {/* Email section */}
              <View style={styles.sectionDivider}>
                <Text style={styles.sectionLabel}>{t('email')}</Text>
              </View>
              <View style={styles.section}>
                <Input
                  label={t('email')}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('email_placeholder')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
                <Button
                  label={t('update_email')}
                  onPress={handleUpdateEmail}
                  loading={savingEmail}
                  style={styles.sectionBtn}
                />
              </View>

              {/* Password section */}
              <View style={styles.sectionDivider}>
                <Text style={styles.sectionLabel}>{t('password')}</Text>
              </View>
              <View style={styles.section}>
                <Input
                  label={t('new_password')}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="••••••••"
                  secureTextEntry
                />
                <Input
                  label={t('confirm_password')}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  secureTextEntry
                />
                <Button
                  label={t('update_password')}
                  onPress={handleUpdatePassword}
                  loading={savingPassword}
                  style={styles.sectionBtn}
                />
              </View>
            </>
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
  backBtn: { paddingVertical: spacing.sm, marginBottom: spacing.sm },
  screenTitle: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.xl },
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  avatarInitial: { ...typography.h1, color: colors.primary },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: { ...typography.bodyBold, color: colors.primary },
  section: { marginBottom: spacing.md },
  sectionBtn: { marginTop: spacing.sm },
  sectionDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
});
