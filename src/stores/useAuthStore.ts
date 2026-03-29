import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase, signIn, signOut, signUp } from '../services/supabase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ user: session?.user ?? null, isInitialized: true });

      // Listen for auth state changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ user: session?.user ?? null });
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
      set({ error: e.message ?? 'Registration failed', isLoading: false });
      throw e;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await signOut();
      set({ user: null, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
