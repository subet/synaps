import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { borderRadius, colors, spacing, typography } from '../../constants';
import { useTranslation } from '../../i18n';
import { useAuthStore } from '../../stores/useAuthStore';
import { useFriendsStore } from '../../stores/useFriendsStore';
import { FriendsEmptyState } from '../friends/FriendsEmptyState';
import { FriendsLeaderboardRow } from '../friends/FriendsLeaderboardRow';
import { InviteSheet } from '../friends/InviteSheet';
import { ScoreRulesModal } from '../friends/ScoreRulesModal';
import type { FriendsLeaderboardEntry, InviteCodeLookupResult } from '../../types';

export function FriendsTab() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const {
    leaderboard,
    friendIds,
    myInviteCode,
    isLoadingLeaderboard,
    refresh,
    loadInviteCode,
    lookupCode,
    sendRequest,
  } = useFriendsStore();

  const [refreshing, setRefreshing] = useState(false);
  const [inviteVisible, setInviteVisible] = useState(false);
  const [rulesVisible, setRulesVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      refresh(user.id);
      loadInviteCode(user.id);
    }, [user?.id])
  );

  const onRefresh = async () => {
    if (!user?.id) return;
    setRefreshing(true);
    await refresh(user.id);
    setRefreshing(false);
  };

  const handleOpenInvite = async () => {
    if (user?.id && !myInviteCode) await loadInviteCode(user.id);
    setInviteVisible(true);
  };

  const handleSendRequest = async (target: InviteCodeLookupResult) => {
    if (!user?.id) return;
    try {
      await sendRequest(user.id, target.userId, myInviteCode ?? undefined);
      Alert.alert(t('friend_request_sent_title'), t('friend_request_sent_msg', { name: target.displayName }));
    } catch (e: any) {
      const msg =
        e?.message === 'already_friends' ? t('friend_already_friends') :
        e?.message === 'not_accepting' ? t('friend_not_accepting') :
        e?.message === 'blocked' ? t('friend_blocked_msg') :
        t('invite_code_error_body');
      Alert.alert(t('friend_send_error_title'), msg);
    }
  };

  const hasFriends = friendIds.length > 0;

  // Find and separate the current user entry for pinning
  const userEntry = leaderboard.find((e) => e.isMe);
  const userInTop = userEntry ? userEntry.rank <= leaderboard.length && leaderboard.indexOf(userEntry) < 20 : false;
  const top20 = leaderboard.slice(0, 20);

  if (isLoadingLeaderboard && leaderboard.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={hasFriends ? top20 : []}
        keyExtractor={(item) => item.userId}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <ListHeader onInvite={handleOpenInvite} onRules={() => setRulesVisible(true)} />
        }
        ListEmptyComponent={
          hasFriends ? null : (
            <FriendsEmptyState onInvite={handleOpenInvite} />
          )
        }
        ListFooterComponent={
          hasFriends && !userInTop && userEntry ? (
            <PinnedUserRow entry={userEntry} />
          ) : null
        }
        renderItem={({ item }) => <FriendsLeaderboardRow entry={item} />}
      />

      <InviteSheet
        visible={inviteVisible}
        inviteCode={myInviteCode}
        onClose={() => setInviteVisible(false)}
        onLookupCode={lookupCode}
        onSendRequest={handleSendRequest}
      />

      <ScoreRulesModal
        visible={rulesVisible}
        onClose={() => setRulesVisible(false)}
      />
    </>
  );
}

function ListHeader({
  onInvite,
  onRules,
}: {
  onInvite: () => void;
  onRules: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.headerRow}>
      <Pressable style={styles.headerBtn} onPress={onInvite}>
        <Ionicons name="person-add-outline" size={16} color={colors.primary} />
        <Text style={styles.headerBtnText}>{t('friends_invite_btn')}</Text>
      </Pressable>
      <Pressable style={styles.headerBtnGhost} onPress={onRules} hitSlop={8}>
        <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
        <Text style={styles.headerBtnGhostText}>{t('friends_how_scoring')}</Text>
      </Pressable>
    </View>
  );
}

function PinnedUserRow({ entry }: { entry: FriendsLeaderboardEntry }) {
  return (
    <View>
      <View style={styles.footerDivider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerLabel}>• • •</Text>
        <View style={styles.dividerLine} />
      </View>
      <FriendsLeaderboardRow entry={entry} />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerBtnText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  headerBtnGhost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerBtnGhostText: {
    ...typography.small,
    color: colors.textMuted,
  },
  footerDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
    gap: spacing.sm,
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
});
