import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../../src/constants';
import { useTranslation } from '../../src/i18n';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useFriendsStore } from '../../src/stores/useFriendsStore';
import { tap } from '../../src/utils/haptics';
import type { InviteCodeLookupResult } from '../../src/types';

export default function InviteCodeScreen() {
  const { t } = useTranslation();
  const { code } = useLocalSearchParams<{ code: string }>();
  const { user } = useAuthStore();
  const { lookupCode, sendRequest, loadInviteCode, myInviteCode } = useFriendsStore();

  const [state, setState] = useState<'loading' | 'found' | 'not_found' | 'error' | 'sent' | 'self'>('loading');
  const [target, setTarget] = useState<InviteCodeLookupResult | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!code) {
      setState('not_found');
      return;
    }
    lookupCode(code)
      .then((result) => {
        if (!result) {
          setState('not_found');
        } else if (result.userId === user?.id) {
          setState('self');
        } else {
          setTarget(result);
          setState('found');
        }
      })
      .catch(() => setState('error'));
  }, [code, user?.id]);

  const handleSendRequest = async () => {
    if (!target || !user?.id) return;
    setIsSending(true);
    try {
      if (!myInviteCode) await loadInviteCode(user.id);
      await sendRequest(user.id, target.userId, code);
      setState('sent');
    } catch (e: any) {
      const msg =
        e?.message === 'already_friends' ? t('invite_code_already_friends') :
        e?.message === 'not_accepting' ? t('invite_code_not_accepting') :
        e?.message === 'blocked' ? t('friend_blocked_msg') :
        t('invite_code_error_body');
      Alert.alert(t('friend_send_error_title'), msg);
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Close button */}
        <Pressable style={styles.closeBtn} onPress={handleClose} onPressIn={tap}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>

        {state === 'loading' && (
          <View style={styles.centerBox}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loadingText}>{t('invite_code_loading')}</Text>
          </View>
        )}

        {state === 'found' && target && (
          <View style={styles.centerBox}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>
                {(target.displayName?.[0] ?? '?').toUpperCase()}
              </Text>
            </View>
            <Text style={styles.heading}>{t('invite_code_heading')}</Text>
            <Text style={styles.nameText}>{target.displayName}</Text>
            <Text style={styles.body}>{t('invite_code_body')}</Text>

            <View style={styles.pills}>
              <InfoPill icon="lock-closed-outline" label={t('friends_pill_private')} />
              <InfoPill icon="calendar-outline" label={t('friends_pill_weekly')} />
              <InfoPill icon="trophy-outline" label={t('friends_pill_score_based')} />
            </View>

            <Pressable
              style={[styles.acceptBtn, isSending && styles.acceptBtnLoading]}
              onPress={handleSendRequest}
              onPressIn={tap}
              disabled={isSending}
            >
              {isSending ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.acceptBtnText}>{t('invite_code_send_request')}</Text>
              )}
            </Pressable>

            <Pressable style={styles.declineBtn} onPress={handleClose}>
              <Text style={styles.declineBtnText}>{t('invite_code_maybe_later')}</Text>
            </Pressable>
          </View>
        )}

        {state === 'sent' && (
          <View style={styles.centerBox}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={56} color={colors.goodText} />
            </View>
            <Text style={styles.heading}>{t('invite_code_sent_heading')}</Text>
            <Text style={styles.body}>
              {t('invite_code_sent_body', { name: target?.displayName ?? '…' })}
            </Text>
            <Pressable style={styles.acceptBtn} onPress={handleClose} onPressIn={tap}>
              <Text style={styles.acceptBtnText}>{t('done')}</Text>
            </Pressable>
          </View>
        )}

        {state === 'self' && (
          <View style={styles.centerBox}>
            <Ionicons name="person-circle-outline" size={56} color={colors.textMuted} />
            <Text style={styles.heading}>{t('invite_code_self_heading')}</Text>
            <Text style={styles.body}>{t('invite_code_self_body')}</Text>
            <Pressable style={styles.acceptBtn} onPress={handleClose} onPressIn={tap}>
              <Text style={styles.acceptBtnText}>{t('invite_code_self_confirm')}</Text>
            </Pressable>
          </View>
        )}

        {(state === 'not_found' || state === 'error') && (
          <View style={styles.centerBox}>
            <Ionicons name="alert-circle-outline" size={56} color={colors.danger} />
            <Text style={styles.heading}>
              {state === 'not_found' ? t('invite_code_not_found_heading') : t('invite_code_error_heading')}
            </Text>
            <Text style={styles.body}>
              {state === 'not_found' ? t('invite_code_not_found_body') : t('invite_code_error_body')}
            </Text>
            <Pressable style={styles.acceptBtn} onPress={handleClose} onPressIn={tap}>
              <Text style={styles.acceptBtnText}>{t('invite_code_go_back')}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function InfoPill({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
}) {
  return (
    <View style={styles.pill}>
      <Ionicons name={icon} size={13} color={colors.primary} />
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.lg },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  successIcon: {
    marginBottom: spacing.lg,
  },
  heading: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  nameText: {
    ...typography.h3,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  pills: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
  },
  pillText: { ...typography.small, color: colors.primary, fontWeight: '600' },
  acceptBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.sm,
    minWidth: 220,
  },
  acceptBtnLoading: { opacity: 0.7 },
  acceptBtnText: { ...typography.bodyBold, color: colors.white },
  declineBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  declineBtnText: { ...typography.body, color: colors.textMuted },
});
