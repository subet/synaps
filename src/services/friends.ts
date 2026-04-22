import { supabase } from './supabase';
import type {
  FriendRequest,
  FriendPrivacy,
  InviteCodeLookupResult,
} from '../types';

// ─── Invite & lookup ──────────────────────────────────────────────────────────

/** Returns the current user's 8-char invite code from their profile. */
export async function getMyInviteCode(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('profiles')
    .select('invite_code')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data.invite_code as string;
}

/**
 * Looks up who owns a given invite code.
 * Calls the SECURITY DEFINER RPC so the caller doesn't need direct
 * access to profiles.invite_code.
 */
export async function lookupInviteCode(
  code: string
): Promise<InviteCodeLookupResult | null> {
  const { data, error } = await supabase.rpc('lookup_invite_code', {
    p_code: code.toUpperCase().trim(),
  });

  if (error) throw error;
  if (!data || data.length === 0) return null;

  const row = data[0];
  return {
    userId: row.user_id,
    displayName: row.display_name ?? '—',
    avatarUrl: row.avatar_url ?? null,
  };
}

// ─── Friend requests ──────────────────────────────────────────────────────────

/**
 * Send a friend request from `fromUserId` to `toUserId`.
 * Respects the recipient's `friend_privacy` setting:
 *  - 'nobody'      → throws "not_accepting"
 *  - 'invite_only' → requires `viaCode` to be set
 *  - 'everyone'    → allowed without code
 *
 * Also blocks re-sending to someone you already have a pending request to.
 */
export async function sendFriendRequest(
  fromUserId: string,
  toUserId: string,
  viaCode?: string
): Promise<void> {
  if (fromUserId === toUserId) throw new Error('cannot_self');

  // Check recipient's privacy setting
  const { data: recipient, error: privErr } = await supabase
    .from('profiles')
    .select('friend_privacy')
    .eq('id', toUserId)
    .single();

  if (privErr) throw privErr;

  const privacy = (recipient?.friend_privacy ?? 'invite_only') as FriendPrivacy;
  if (privacy === 'nobody') throw new Error('not_accepting');
  if (privacy === 'invite_only' && !viaCode) throw new Error('invite_only');

  // Check for existing block (either direction)
  const { count: blockCount } = await supabase
    .from('blocks')
    .select('*', { count: 'exact', head: true })
    .or(
      `and(blocker_id.eq.${fromUserId},blocked_id.eq.${toUserId}),and(blocker_id.eq.${toUserId},blocked_id.eq.${fromUserId})`
    );

  if ((blockCount ?? 0) > 0) throw new Error('blocked');

  // Check existing friendship
  const [a, b] = [fromUserId, toUserId].sort();
  const { count: friendCount } = await supabase
    .from('friendships')
    .select('*', { count: 'exact', head: true })
    .eq('user_a', a)
    .eq('user_b', b);

  if ((friendCount ?? 0) > 0) throw new Error('already_friends');

  // Insert or re-activate request
  const { error } = await supabase.from('friend_requests').upsert(
    {
      from_user_id: fromUserId,
      to_user_id: toUserId,
      status: 'pending',
      via_code: viaCode ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'from_user_id,to_user_id' }
  );

  if (error) throw error;
}

/** Returns all pending requests received by `userId` (with sender profile data). */
export async function getPendingRequests(userId: string): Promise<FriendRequest[]> {
  const { data, error } = await supabase
    .from('friend_requests')
    .select(
      'id, from_user_id, to_user_id, status, created_at, profiles!friend_requests_from_profile_fkey(display_name, avatar_url, country)'
    )
    .eq('to_user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return mapRequests(data ?? [], userId);
}

/** Returns all pending requests sent by `userId`. */
export async function getSentRequests(userId: string): Promise<FriendRequest[]> {
  const { data, error } = await supabase
    .from('friend_requests')
    .select(
      'id, from_user_id, to_user_id, status, created_at, profiles!friend_requests_to_profile_fkey(display_name, avatar_url, country)'
    )
    .eq('from_user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return mapRequests(data ?? [], userId);
}

/**
 * Accept a pending friend request.
 * 1. Inserts a canonical friendship row (smaller UUID = user_a).
 * 2. Deletes the request row.
 */
export async function acceptFriendRequest(
  requestId: string,
  fromUserId: string,
  toUserId: string
): Promise<void> {
  const [userA, userB] = [fromUserId, toUserId].sort();

  const [{ error: insertError }, { error: deleteError }] = await Promise.all([
    supabase.from('friendships').insert({ user_a: userA, user_b: userB }),
    supabase.from('friend_requests').delete().eq('id', requestId),
  ]);

  if (insertError) throw insertError;
  if (deleteError) throw deleteError;
}

/** Decline (but do not delete) a pending request — sets status to 'declined'. */
export async function declineFriendRequest(requestId: string): Promise<void> {
  const { error } = await supabase
    .from('friend_requests')
    .update({ status: 'declined', updated_at: new Date().toISOString() })
    .eq('id', requestId);

  if (error) throw error;
}

/** Cancel an outgoing request (hard delete). */
export async function cancelSentRequest(requestId: string): Promise<void> {
  const { error } = await supabase
    .from('friend_requests')
    .delete()
    .eq('id', requestId);

  if (error) throw error;
}

// ─── Friendships ─────────────────────────────────────────────────────────────

/**
 * Returns all accepted friend UUIDs for a given user using the server-side RPC
 * (which queries both columns of the canonical friendship table).
 */
export async function getFriendIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_friend_ids', {
    p_user_id: userId,
  });

  if (error) throw error;
  return (data ?? []).map((row: { friend_id: string }) => row.friend_id);
}

export interface FriendProfile {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  country: string | null;
}

/** Fetch profile data (name, avatar, country) for a list of user IDs. */
export async function getFriendProfiles(friendIds: string[]): Promise<FriendProfile[]> {
  if (friendIds.length === 0) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, country')
    .in('id', friendIds);

  if (error) throw error;

  return (data ?? []).map((p: any) => ({
    userId: p.id,
    displayName: p.display_name ? p.display_name.trim().split(/\s+/)[0] : '—',
    avatarUrl: p.avatar_url ?? null,
    country: p.country ?? null,
  }));
}

/** Remove a mutual friendship. Deletes the canonical row. */
export async function removeFriend(userId: string, friendId: string): Promise<void> {
  const [userA, userB] = [userId, friendId].sort();

  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('user_a', userA)
    .eq('user_b', userB);

  if (error) throw error;
}

/**
 * Block a user.
 * - Removes any existing friendship.
 * - Removes any pending requests in either direction.
 * - Inserts a block row.
 */
export async function blockUser(userId: string, targetId: string): Promise<void> {
  const [userA, userB] = [userId, targetId].sort();

  await Promise.all([
    // Remove friendship if it exists
    supabase.from('friendships').delete().eq('user_a', userA).eq('user_b', userB),
    // Remove pending requests either way
    supabase
      .from('friend_requests')
      .delete()
      .or(
        `and(from_user_id.eq.${userId},to_user_id.eq.${targetId}),and(from_user_id.eq.${targetId},to_user_id.eq.${userId})`
      ),
  ]);

  const { error } = await supabase
    .from('blocks')
    .insert({ blocker_id: userId, blocked_id: targetId });

  if (error && error.code !== '23505') throw error; // ignore duplicate
}

// ─── Privacy ──────────────────────────────────────────────────────────────────

export async function updateFriendPrivacy(
  userId: string,
  privacy: FriendPrivacy
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ friend_privacy: privacy })
    .eq('id', userId);

  if (error) throw error;
}

export async function getFriendPrivacy(userId: string): Promise<FriendPrivacy> {
  const { data, error } = await supabase
    .from('profiles')
    .select('friend_privacy')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return (data?.friend_privacy ?? 'invite_only') as FriendPrivacy;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapRequests(rows: any[], currentUserId: string): FriendRequest[] {
  return rows.map((row) => {
    const isSent = row.from_user_id === currentUserId;
    const profile = row.profiles;
    return {
      id: row.id,
      fromUserId: row.from_user_id,
      toUserId: row.to_user_id,
      fromDisplayName: profile?.display_name ?? '—',
      fromAvatarUrl: profile?.avatar_url ?? null,
      fromCountry: profile?.country ?? null,
      status: row.status,
      createdAt: row.created_at,
      isSent,
    };
  });
}
