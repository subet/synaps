import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import {
  supabase,
  signIn,
  signOut,
  signUp,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  updateAuthEmail,
  updateAuthPassword,
} from '../services/supabase';
import { signInWithApple, signInWithGoogle } from '../services/socialAuth';
import { UserProfile } from '../types';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  loadProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: { display_name?: string; avatar_url?: string; country?: string }) => Promise<void>;
  uploadProfileAvatar: (localUri: string) => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ user: session?.user ?? null, isInitialized: true });

      if (session?.user) {
        try {
          const profile = await getUserProfile(session.user.id);
          set({ profile });
        } catch {}
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        set({ user: session?.user ?? null });
        if (session?.user) {
          try {
            const profile = await getUserProfile(session.user.id);
            set({ profile });
          } catch {}
        } else {
          set({ profile: null });
        }
      });
    } catch {
      set({ isInitialized: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await signIn(email, password);
      set({ user: data.user, isLoading: false });
    } catch (e: any) {
      set({ error: e.message ?? 'Login failed', isLoading: false });
      throw e;
    }
  },

  register: async (email, password, displayName) => {
    set({ isLoading: true, error: null });
    try {
      const data = await signUp(email, password, displayName);
      set({ user: data.user ?? null, isLoading: false });
    } catch (e: any) {
      const parts = [
        e.message,
        e.code ? `code: ${e.code}` : null,
        e.status ? `status: ${e.status}` : null,
        e.details ? `details: ${e.details}` : null,
        e.hint ? `hint: ${e.hint}` : null,
      ].filter(Boolean);
      console.error('[register error]', e);
      set({ error: parts.join(' · ') || 'Registration failed', isLoading: false });
      throw e;
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await signInWithGoogle();
      set({ user: data.user, isLoading: false });
    } catch (e: any) {
      // User cancelled = not an error
      if (e?.code === 'SIGN_IN_CANCELLED' || e?.message?.includes('cancel')) {
        set({ isLoading: false });
        return;
      }
      set({ error: e.message ?? 'Google sign-in failed', isLoading: false });
      throw e;
    }
  },

  loginWithApple: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await signInWithApple();
      set({ user: data.user, isLoading: false });
    } catch (e: any) {
      // ERR_CANCELED = user dismissed the Apple sheet
      if (e?.code === 'ERR_CANCELED') {
        set({ isLoading: false });
        return;
      }
      set({ error: e.message ?? 'Apple sign-in failed', isLoading: false });
      throw e;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await signOut();
      set({ user: null, profile: null, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  loadProfile: async (userId) => {
    const profile = await getUserProfile(userId);
    set({ profile });
  },

  updateProfile: async (updates) => {
    const { user, profile } = get();
    if (!user) throw new Error('Not authenticated');
    const updated = await updateUserProfile(user.id, updates);
    set({ profile: { ...profile!, ...updated } });
  },

  uploadProfileAvatar: async (localUri) => {
    const { user } = get();
    if (!user) throw new Error('Not authenticated');
    const avatarUrl = await uploadAvatar(user.id, localUri);
    await updateUserProfile(user.id, { avatar_url: avatarUrl });
    set((state) => ({
      profile: state.profile ? { ...state.profile, avatar_url: avatarUrl } : state.profile,
    }));
  },

  updateEmail: async (newEmail) => {
    await updateAuthEmail(newEmail);
  },

  updatePassword: async (newPassword) => {
    await updateAuthPassword(newPassword);
  },
}));
