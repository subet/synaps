import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { useTranslation } from '../../i18n';
import { useAuthStore } from '../../stores/useAuthStore';
import { useFriendsStore } from '../../stores/useFriendsStore';
import {
  countryToFlag,
  getPublicUserProfile,
  PublicUserProfile,
} from '../../services/leaderboard';
import { sendFriendRequest } from '../../services/friends';
import { ALL_BADGES } from '../../data/badges';
import { tap } from '../../utils/haptics';

interface Props {
  visible: boolean;
  userId: string | null;
  onClose: () => void;
}

type ActionState = 'idle' | 'loading' | 'done';

export function UserProfileSheet({ visible, userId, onClose }: Props) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { friendIds, pendingSent, pendingReceived, myInviteCode, loadInviteCode, refresh } = useFriendsStore();

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState<ActionState>('idle');

  const isMe = userId === user?.id;

  // Determine friendship relation from store data
  const isFriend = userId ? friendIds.includes(userId) : false;
  const hasSentRequest = userId ? pendingSent.some((r) => r.toUserId === userId) : false;
  const hasReceivedRequest = userId ? pendingReceived.some((r) => r.fromUserId === userId) : false;

  useEffect(() => {
    if (!visible || !userId) {
      setProfile(null);
      setLoading(true);
      setActionState('idle');
      return;
    }

    let cancelled = false;
    setLoading(true);

    getPublicUserProfile(userId).then((p) => {
      if (!cancelled) {
        setProfile(p);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [visible, userId]);

  // Resolve which badges the user has achieved
  const achievedBadges = profile
    ? ALL_BADGES.filter((b) => profile.achievedBadgeIds.includes(b.id))
    : [];

  const canAddFriend =
    !isMe &&
    !isFriend &&
    !hasSentRequest &&
    !hasReceivedRequest &&
    profile?.friendPrivacy !== 'nobody';

  const handleAddFriend = async () => {
    if (!user?.id || !userId || !profile) return;

    // If invite_only, we need the invite code
    if (profile.friendPrivacy === 'invite_only' && !myInviteCode) {
      await loadInviteCode(user.id);
    }

    setActionState('loading');
    try {
      const code = profile.friendPrivacy === 'invite_only'
        ? (useFriendsStore.getState().myInviteCode ?? undefined)
        : undefined;
      await sendFriendRequest(user.id, userId, code);
      setActionState('done');
      // Refresh friends store so pendingSent updates
      refresh(user.id);
    } catch (e: any) {
      setActionState('idle');
      const msg =
        e?.message === 'already_friends' ? t('friend_already_friends') :
        e?.message === 'not_accepting' ? t('friend_not_accepting') :
        e?.message === 'invite_only' ? t('friend_not_accepting') :
        e?.message === 'blocked' ? t('friend_blocked_msg') :
        t('invite_code_error_body');
      Alert.alert(t('friend_send_error_title'), msg);
    }
  };

  const handleAcceptRequest = async () => {
    if (!user?.id || !userId) return;
    const request = pendingReceived.find((r) => r.fromUserId === userId);
    if (!request) return;

    setActionState('loading');
    try {
      await useFriendsStore.getState().acceptRequest(request.id, userId, user.id);
      setActionState('done');
    } catch {
      setActionState('idle');
      Alert.alert(t('error'), t('invite_code_error_body'));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>{t('profile_sheet_title')}</Text>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : !profile ? (
          <View style={styles.loadingWrap}>
            <Text style={styles.errorText}>{t('profile_sheet_not_found')}</Text>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Avatar + Name */}
            <View style={styles.profileHeader}>
              {profile.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {(profile.displayName?.[0] ?? '?').toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>{profile.displayName}</Text>
                {profile.country ? (
                  <Text style={styles.flag}>{countryToFlag(profile.country)}</Text>
                ) : null}
              </View>
            </View>

            {/* Rankings */}
            <View style={styles.rankRow}>
              {profile.worldRank > 0 ? (
                <View style={styles.rankCard}>
                  <Ionicons name="globe-outline" size={18} color={colors.primary} />
                  <Text style={styles.rankValue}>#{profile.worldRank}</Text>
                  <Text style={styles.rankLabel}>{t('profile_sheet_world')}</Text>
                </View>
              ) : null}
              {profile.countryRank != null && profile.countryRank > 0 ? (
                <View style={styles.rankCard}>
                  <Text style={styles.rankFlag}>
                    {profile.country ? countryToFlag(profile.country) : ''}
                  </Text>
                  <Text style={styles.rankValue}>#{profile.countryRank}</Text>
                  <Text style={styles.rankLabel}>{t('profile_sheet_country')}</Text>
                </View>
              ) : null}
            </View>

            {/* Achievements */}
            {achievedBadges.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>{t('profile_sheet_achievements')}</Text>
                <View style={styles.badgesGrid}>
                  {achievedBadges.map((badge) => (
                    <View key={badge.id} style={styles.badgeChip}>
                      <Text style={styles.badgeIcon}>{badge.icon}</Text>
                      <Text style={styles.badgeName} numberOfLines={1}>
                        {t(badge.nameKey)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>{t('profile_sheet_achievements')}</Text>
                <Text style={styles.emptyAchievements}>{t('profile_sheet_no_achievements')}</Text>
              </View>
            )}

            {/* Action button */}
            {!isMe && (
              <View style={styles.actionSection}>
                {isFriend ? (
                  <View style={styles.friendBadge}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.goodText} />
                    <Text style={styles.friendBadgeText}>{t('profile_sheet_friends')}</Text>
                  </View>
                ) : hasSentRequest ? (
                  <View style={styles.friendBadge}>
                    <Ionicons name="time-outline" size={18} color={colors.textMuted} />
                    <Text style={styles.pendingText}>{t('profile_sheet_request_sent')}</Text>
                  </View>
                ) : hasReceivedRequest ? (
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => { tap(); handleAcceptRequest(); }}
                    disabled={actionState !== 'idle'}
                  >
                    {actionState === 'loading' ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : actionState === 'done' ? (
                      <>
                        <Ionicons name="checkmark" size={18} color={colors.white} />
                        <Text style={styles.actionBtnText}>{t('profile_sheet_accepted')}</Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="person-add-outline" size={18} color={colors.white} />
                        <Text style={styles.actionBtnText}>{t('profile_sheet_accept_request')}</Text>
                      </>
                    )}
                  </Pressable>
                ) : canAddFriend ? (
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => { tap(); handleAddFriend(); }}
                    disabled={actionState !== 'idle'}
                  >
                    {actionState === 'loading' ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : actionState === 'done' ? (
                      <>
                        <Ionicons name="checkmark" size={18} color={colors.white} />
                        <Text style={styles.actionBtnText}>{t('profile_sheet_request_sent')}</Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="person-add-outline" size={18} color={colors.white} />
                        <Text style={styles.actionBtnText}>{t('profile_sheet_add_friend')}</Text>
                      </>
                    )}
                  </Pressable>
                ) : null}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xxl,
    maxHeight: '70%',
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

  loadingWrap: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.textMuted,
  },

  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },

  // Profile header
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.md,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  profileName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  flag: {
    fontSize: 24,
    lineHeight: 28,
  },

  // Rankings
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  rankCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    minWidth: 100,
    gap: 2,
  },
  rankFlag: {
    fontSize: 18,
    lineHeight: 22,
  },
  rankValue: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  rankLabel: {
    ...typography.small,
    color: colors.textMuted,
    fontWeight: '500',
  },

  // Achievements section
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.smallBold,
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
  },
  badgeIcon: {
    fontSize: 14,
  },
  badgeName: {
    ...typography.small,
    color: colors.textPrimary,
    fontWeight: '600',
    maxWidth: 120,
  },
  emptyAchievements: {
    ...typography.body,
    color: colors.textMuted,
    fontStyle: 'italic',
  },

  // Action section
  actionSection: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.xl,
    width: '100%',
  },
  actionBtnText: {
    ...typography.bodyBold,
    color: colors.white,
  },
  friendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
  },
  friendBadgeText: {
    ...typography.bodyBold,
    color: colors.goodText,
  },
  pendingText: {
    ...typography.bodyBold,
    color: colors.textMuted,
  },
});
