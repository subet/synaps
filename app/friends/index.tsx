import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { borderRadius, colors, spacing, typography } from '../../src/constants';
import { useTranslation } from '../../src/i18n';
import { useAuthStore } from '../../src/stores/useAuthStore';
import { useFriendsStore } from '../../src/stores/useFriendsStore';
import { FriendRequestRow } from '../../src/components/friends/FriendRequestRow';
import { InviteSheet } from '../../src/components/friends/InviteSheet';
import { tap } from '../../src/utils/haptics';
import type { FriendRequest, InviteCodeLookupResult } from '../../src/types';

export default function FriendsScreen() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const {
    friendIds,
    pendingReceived,
    pendingSent,
    myInviteCode,
    isLoadingRequests,
    loadFriends,
    loadRequests,
    loadInviteCode,
    acceptRequest,
    declineRequest,
    cancelRequest,
    removeFriend,
    blockUser,
    lookupCode,
    sendRequest,
  } = useFriendsStore();

  const [inviteVisible, setInviteVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      setInitialLoading(true);
      Promise.all([
        loadRequests(user.id),
        loadFriends(user.id),
        loadInviteCode(user.id),
      ]).finally(() => setInitialLoading(false));
    }, [user?.id])
  );

  const onRefresh = async () => {
    if (!user?.id) return;
    setRefreshing(true);
    await Promise.all([loadRequests(user.id), loadFriends(user.id)]);
    setRefreshing(false);
  };

  const handleAccept = async (req: FriendRequest) => {
    setActionLoadingId(req.id);
    try {
      await acceptRequest(req.id, req.fromUserId, req.toUserId);
    } catch {
      Alert.alert(t('error'), t('friend_accept_error'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDecline = async (req: FriendRequest) => {
    setActionLoadingId(req.id);
    try {
      await declineRequest(req.id);
    } catch {
      Alert.alert(t('error'), t('friend_decline_error'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (req: FriendRequest) => {
    setActionLoadingId(req.id);
    try {
      await cancelRequest(req.id);
    } catch {
      Alert.alert(t('error'), t('friend_cancel_error'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveFriend = (friendId: string, name: string) => {
    Alert.alert(
      t('friend_remove_title'),
      t('friend_remove_msg', { name }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('friend_remove'),
          style: 'destructive',
          onPress: async () => {
            if (!user?.id) return;
            try {
              await removeFriend(user.id, friendId);
            } catch {
              Alert.alert(t('error'), t('friend_decline_error'));
            }
          },
        },
      ]
    );
  };

  const handleBlock = (targetId: string, name: string) => {
    Alert.alert(
      t('friend_block_title', { name }),
      t('friend_block_msg'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('friend_block'),
          style: 'destructive',
          onPress: async () => {
            if (!user?.id) return;
            try {
              await blockUser(user.id, targetId);
            } catch {
              Alert.alert(t('error'), t('friend_decline_error'));
            }
          },
        },
      ]
    );
  };

  const handleSendRequest = async (target: InviteCodeLookupResult) => {
    if (!user?.id) return;
    try {
      await sendRequest(user.id, target.userId, myInviteCode ?? undefined);
      Alert.alert(t('friend_request_sent_title'), t('friend_request_sent_msg_short', { name: target.displayName }));
    } catch (e: any) {
      const msg =
        e?.message === 'already_friends' ? t('friend_already_friends_short') :
        e?.message === 'not_accepting' ? t('friend_not_accepting_short') :
        e?.message === 'blocked' ? t('friend_blocked_msg_short') :
        t('invite_code_error_body');
      Alert.alert(t('friend_send_error_title'), msg);
    }
  };

  const totalCount = pendingReceived.length + pendingSent.length + friendIds.length;
  const isEmpty = totalCount === 0 && !isLoadingRequests;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} onPressIn={tap}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
        <Text style={styles.title}>{t('friends')}</Text>
        <Pressable
          style={styles.inviteBtn}
          onPress={() => setInviteVisible(true)}
          onPressIn={tap}
        >
          <Ionicons name="person-add-outline" size={18} color={colors.primary} />
        </Pressable>
      </View>

      {initialLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
      <FlatList
        data={[]}
        keyExtractor={() => ''}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={null}
        renderItem={null}
        ListHeaderComponent={
          <>
            {/* Pending received */}
            {pendingReceived.length > 0 && (
              <Section title={t('friends_requests_section', { count: pendingReceived.length })}>
                {pendingReceived.map((req) => (
                  <FriendRequestRow
                    key={req.id}
                    request={req}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    isLoading={actionLoadingId === req.id}
                  />
                ))}
              </Section>
            )}

            {/* Friends list */}
            {friendIds.length > 0 && (
              <Section title={t('friends_my_section', { count: friendIds.length })}>
                {/* Friend IDs are available; we pull names from leaderboard entries if loaded */}
                <FriendList
                  friendIds={friendIds}
                  onRemove={handleRemoveFriend}
                  onBlock={handleBlock}
                />
              </Section>
            )}

            {/* Sent requests */}
            {pendingSent.length > 0 && (
              <Section title={t('friends_pending_sent_section')}>
                {pendingSent.map((req) => (
                  <FriendRequestRow
                    key={req.id}
                    request={req}
                    onCancel={handleCancel}
                    isSent
                    isLoading={actionLoadingId === req.id}
                  />
                ))}
              </Section>
            )}

            {/* Empty state */}
            {isEmpty && (
              <View style={styles.emptyBox}>
                <Ionicons name="people-outline" size={40} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>{t('friends_no_friends_title')}</Text>
                <Text style={styles.emptyBody}>{t('friends_no_friends_body')}</Text>
                <Pressable
                  style={styles.inviteBigBtn}
                  onPress={() => setInviteVisible(true)}
                  onPressIn={tap}
                >
                  <Text style={styles.inviteBigBtnText}>{t('friends_invite_friends')}</Text>
                </Pressable>
              </View>
            )}
          </>
        }
        contentContainerStyle={styles.listContent}
      />
      )}

      <InviteSheet
        visible={inviteVisible}
        inviteCode={myInviteCode}
        onClose={() => setInviteVisible(false)}
        onLookupCode={lookupCode}
        onSendRequest={handleSendRequest}
      />
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function FriendList({
  friendIds,
  onRemove,
  onBlock,
}: {
  friendIds: string[];
  onRemove: (id: string, name: string) => void;
  onBlock: (id: string, name: string) => void;
}) {
  const { t } = useTranslation();
  const friendProfiles = useFriendsStore((s) => s.friendProfiles);

  return (
    <>
      {friendIds.map((id) => {
        const profile = friendProfiles.find((p) => p.userId === id);
        const name = profile?.displayName ?? '—';
        const avatarUrl = profile?.avatarUrl ?? null;
        return (
          <View key={id} style={styles.friendRow}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.friendAvatarImg} />
            ) : (
              <View style={styles.friendAvatar}>
                <Text style={styles.friendAvatarText}>
                  {(name[0] ?? '?').toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.friendName} numberOfLines={1}>{name}</Text>
            <Pressable
              style={styles.moreBtn}
              onPressIn={tap}
              onPress={() => {
                Alert.alert(name, undefined, [
                  {
                    text: t('friend_remove'),
                    style: 'destructive',
                    onPress: () => onRemove(id, name),
                  },
                  {
                    text: t('friend_block'),
                    style: 'destructive',
                    onPress: () => onBlock(id, name),
                  },
                  { text: t('cancel'), style: 'cancel' },
                ]);
              }}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  backBtn: { padding: spacing.sm, width: 44, alignItems: 'center' },
  title: { ...typography.h3, color: colors.textPrimary, flex: 1, textAlign: 'center' },
  inviteBtn: { width: 44, alignItems: 'center', padding: spacing.sm },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },

  section: { marginBottom: spacing.lg },
  sectionTitle: {
    ...typography.captionBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },

  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.sm,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  friendAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  friendAvatarImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: spacing.sm,
  },
  friendAvatarText: { ...typography.captionBold, color: colors.primary, fontWeight: '700' },
  friendName: { ...typography.bodyBold, color: colors.textPrimary, flex: 1 },
  moreBtn: { padding: spacing.sm },

  emptyBox: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.md, marginBottom: spacing.sm },
  emptyBody: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  inviteBigBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 4,
  },
  inviteBigBtnText: { ...typography.bodyBold, color: colors.white },
});
