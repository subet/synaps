import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { borderRadius, colors, spacing, typography } from '../../constants';
import { useTranslation } from '../../i18n';
import type { InviteCodeLookupResult } from '../../types';

interface Props {
  visible: boolean;
  inviteCode: string | null;
  onClose: () => void;
  /** Called with the looked-up user when a code is submitted. Parent handles the request. */
  onSendRequest: (target: InviteCodeLookupResult) => Promise<void>;
  onLookupCode: (code: string) => Promise<InviteCodeLookupResult | null>;
}

export function InviteSheet({
  visible,
  inviteCode,
  onClose,
  onSendRequest,
  onLookupCode,
}: Props) {
  const { t } = useTranslation();
  const [codeInput, setCodeInput] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!inviteCode) return;
    await Share.share({ message: inviteCode });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!inviteCode) return;
    await Share.share({
      message: t('invite_sheet_share_message', { code: inviteCode }),
    });
  };

  const handleSubmitCode = async () => {
    const trimmed = codeInput.trim().toUpperCase();
    if (!trimmed) return;
    setLookupLoading(true);
    try {
      const result = await onLookupCode(trimmed);
      if (!result) {
        Alert.alert(t('invite_sheet_not_found_title'), t('invite_sheet_not_found_msg'));
        return;
      }
      // Confirm with user
      Alert.alert(
        t('invite_sheet_add_friend_title'),
        t('invite_sheet_add_friend_msg', { name: result.displayName }),
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('invite_sheet_send_request'),
            onPress: async () => {
              await onSendRequest(result);
              setCodeInput('');
              onClose();
            },
          },
        ]
      );
    } catch {
      Alert.alert(t('error'), t('invite_code_error_body'));
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.kavContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>{t('invite_sheet_title')}</Text>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* Invite code */}
          <Text style={styles.sectionLabel}>{t('invite_sheet_your_code')}</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText} selectable>
              {inviteCode ?? t('loading')}
            </Text>
            <Pressable style={styles.copyBtn} onPress={handleCopy}>
              <Ionicons
                name={copied ? 'checkmark' : 'copy-outline'}
                size={18}
                color={copied ? colors.goodText : colors.primary}
              />
            </Pressable>
          </View>

          <Pressable style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={18} color={colors.white} />
            <Text style={styles.shareBtnText}>{t('invite_sheet_share_btn')}</Text>
          </Pressable>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>{t('invite_sheet_or_code')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Manual code entry */}
          <Text style={styles.sectionLabel}>{t('invite_sheet_friends_code')}</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={codeInput}
              onChangeText={(v) => setCodeInput(v.toUpperCase())}
              placeholder={t('invite_sheet_code_placeholder')}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              maxLength={10}
              returnKeyType="done"
              onSubmitEditing={handleSubmitCode}
            />
            <Pressable
              style={[styles.submitBtn, !codeInput.trim() && styles.submitBtnDisabled]}
              onPress={handleSubmitCode}
              disabled={!codeInput.trim() || lookupLoading}
            >
              {lookupLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>{t('invite_sheet_add_btn')}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  kavContainer: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xxl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
  },
  closeBtn: { padding: 4 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionLabel: {
    ...typography.smallBold,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeText: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
    letterSpacing: 3,
    textAlign: 'center',
  },
  copyBtn: {
    padding: 4,
    marginLeft: spacing.sm,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 4,
    marginBottom: spacing.lg,
  },
  shareBtnText: {
    ...typography.bodyBold,
    color: colors.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerLabel: {
    ...typography.small,
    color: colors.textMuted,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    ...typography.body,
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    ...typography.bodyBold,
    color: colors.white,
  },
});
