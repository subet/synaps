import { create } from 'zustand';
import {
  acceptFriendRequest,
  blockUser,
  cancelSentRequest,
  declineFriendRequest,
  getFriendIds,
  getMyInviteCode,
  getPendingRequests,
  getSentRequests,
  lookupInviteCode,
  removeFriend,
  sendFriendRequest,
} from '../services/friends';
import { getFriendsLeaderboard } from '../services/leaderboard';
import type { FriendRequest, FriendsLeaderboardEntry, InviteCodeLookupResult } from '../types';

interface FriendsState {
  // ── Data ──────────────────────────────────────────────────────────────────
  friendIds: string[];
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
  pendingReceived: [],
  pendingSent: [],
  leaderboard: [],
  myInviteCode: null,
  isLoadingLeaderboard: false,
  isLoadingRequests: false,
  pendingRequestCount: 0,

  loadFriends: async (userId) => {
    const ids = await getFriendIds(userId);
    set({ friendIds: ids });
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
    // Optimistically update local state
    set((state) => ({
      friendIds: [...state.friendIds, fromUserId],
      pendingReceived: state.pendingReceived.filter((r) => r.id !== requestId),
      pendingRequestCount: Math.max(0, state.pendingRequestCount - 1),
    }));
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
      leaderboard: state.leaderboard.filter((e) => e.userId !== friendId),
    }));
  },

  blockUser: async (userId, targetId) => {
    await blockUser(userId, targetId);
    set((state) => ({
      friendIds: state.friendIds.filter((id) => id !== targetId),
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
