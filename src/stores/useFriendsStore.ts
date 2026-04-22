import { create } from 'zustand';
import {
  acceptFriendRequest,
  blockUser,
  cancelSentRequest,
  declineFriendRequest,
  getFriendIds,
  getFriendProfiles,
  getMyInviteCode,
  getPendingRequests,
  getSentRequests,
  lookupInviteCode,
  removeFriend,
  sendFriendRequest,
  FriendProfile,
} from '../services/friends';
import { getFriendsLeaderboard } from '../services/leaderboard';
import type { FriendRequest, FriendsLeaderboardEntry, InviteCodeLookupResult } from '../types';

interface FriendsState {
  // ── Data ──────────────────────────────────────────────────────────────────
  friendIds: string[];
  friendProfiles: FriendProfile[];
  pendingReceived: FriendRequest[];
  pendingSent: FriendRequest[];
  leaderboard: FriendsLeaderboardEntry[];
  myInviteCode: string | null;

  // ── Loading flags ─────────────────────────────────────────────────────────
  isLoadingLeaderboard: boolean;
  isLoadingRequests: boolean;

  // ── Computed ──────────────────────────────────────────────────────────────
  /** Badge count for the Friends tab header button. */
  pendingRequestCount: number;

  // ── Actions ───────────────────────────────────────────────────────────────
  loadFriends: (userId: string) => Promise<void>;
  loadLeaderboard: (userId: string) => Promise<void>;
  loadRequests: (userId: string) => Promise<void>;
  loadInviteCode: (userId: string) => Promise<string>;

  sendRequest: (fromUserId: string, toUserId: string, viaCode?: string) => Promise<void>;
  acceptRequest: (requestId: string, fromUserId: string, toUserId: string) => Promise<void>;
  declineRequest: (requestId: string) => Promise<void>;
  cancelRequest: (requestId: string) => Promise<void>;

  removeFriend: (userId: string, friendId: string) => Promise<void>;
  blockUser: (userId: string, targetId: string) => Promise<void>;

  lookupCode: (code: string) => Promise<InviteCodeLookupResult | null>;

  /** Full refresh: friends list + leaderboard + requests. */
  refresh: (userId: string) => Promise<void>;
}

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friendIds: [],
  friendProfiles: [],
  pendingReceived: [],
  pendingSent: [],
  leaderboard: [],
  myInviteCode: null,
  isLoadingLeaderboard: false,
  isLoadingRequests: false,
  pendingRequestCount: 0,

  loadFriends: async (userId) => {
    const ids = await getFriendIds(userId);
    const profiles = await getFriendProfiles(ids);
    set({ friendIds: ids, friendProfiles: profiles });
    return ids as any;
  },

  loadLeaderboard: async (userId) => {
    set({ isLoadingLeaderboard: true });
    try {
      const ids = get().friendIds;
      const entries = await getFriendsLeaderboard(userId, ids);
      set({ leaderboard: entries });
    } finally {
      set({ isLoadingLeaderboard: false });
    }
  },

  loadRequests: async (userId) => {
    set({ isLoadingRequests: true });
    try {
      const [received, sent] = await Promise.all([
        getPendingRequests(userId),
        getSentRequests(userId),
      ]);
      set({
        pendingReceived: received,
        pendingSent: sent,
        pendingRequestCount: received.length,
      });
    } finally {
      set({ isLoadingRequests: false });
    }
  },

  loadInviteCode: async (userId) => {
    const existing = get().myInviteCode;
    if (existing) return existing;
    const code = await getMyInviteCode(userId);
    set({ myInviteCode: code });
    return code;
  },

  sendRequest: async (fromUserId, toUserId, viaCode) => {
    await sendFriendRequest(fromUserId, toUserId, viaCode);
    // Refresh sent list
    await get().loadRequests(fromUserId);
  },

  acceptRequest: async (requestId, fromUserId, toUserId) => {
    await acceptFriendRequest(requestId, fromUserId, toUserId);
    // Optimistically update local state, using request data for the profile
    set((state) => {
      const req = state.pendingReceived.find((r) => r.id === requestId);
      const newProfile: FriendProfile = {
        userId: fromUserId,
        displayName: req?.fromDisplayName ?? '—',
        avatarUrl: req?.fromAvatarUrl ?? null,
        country: req?.fromCountry ?? null,
      };
      return {
        friendIds: [...state.friendIds, fromUserId],
        friendProfiles: [...state.friendProfiles, newProfile],
        pendingReceived: state.pendingReceived.filter((r) => r.id !== requestId),
        pendingRequestCount: Math.max(0, state.pendingRequestCount - 1),
      };
    });
  },

  declineRequest: async (requestId) => {
    await declineFriendRequest(requestId);
    set((state) => ({
      pendingReceived: state.pendingReceived.filter((r) => r.id !== requestId),
      pendingRequestCount: Math.max(0, state.pendingRequestCount - 1),
    }));
  },

  cancelRequest: async (requestId) => {
    await cancelSentRequest(requestId);
    set((state) => ({
      pendingSent: state.pendingSent.filter((r) => r.id !== requestId),
    }));
  },

  removeFriend: async (userId, friendId) => {
    await removeFriend(userId, friendId);
    set((state) => ({
      friendIds: state.friendIds.filter((id) => id !== friendId),
      friendProfiles: state.friendProfiles.filter((p) => p.userId !== friendId),
      leaderboard: state.leaderboard.filter((e) => e.userId !== friendId),
    }));
  },

  blockUser: async (userId, targetId) => {
    await blockUser(userId, targetId);
    set((state) => ({
      friendIds: state.friendIds.filter((id) => id !== targetId),
      friendProfiles: state.friendProfiles.filter((p) => p.userId !== targetId),
      leaderboard: state.leaderboard.filter((e) => e.userId !== targetId),
      pendingReceived: state.pendingReceived.filter(
        (r) => r.fromUserId !== targetId
      ),
      pendingSent: state.pendingSent.filter((r) => r.toUserId !== targetId),
    }));
  },

  lookupCode: async (code) => {
    return lookupInviteCode(code);
  },

  refresh: async (userId) => {
    await get().loadFriends(userId);
    await Promise.all([
      get().loadLeaderboard(userId),
      get().loadRequests(userId),
    ]);
  },
}));
