import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../constants';

// Custom storage adapter for Supabase that uses SecureStore on native
// and falls back to localStorage on web
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      return Promise.resolve(localStorage.getItem(key));
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Public Deck Library ───────────────────────────────────────────────────────

export async function getPublicDecks(category?: string) {
  let query = supabase
    .from('public_decks')
    .select('*')
    .order('download_count', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getFeaturedDecks() {
  const { data, error } = await supabase
    .from('public_decks')
    .select('*')
    .eq('is_featured', true)
    .order('download_count', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getEditorsChoiceDecks() {
  const { data, error } = await supabase
    .from('public_decks')
    .select('*')
    .eq('is_editors_choice', true)
    .order('category', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getPublicDeckCards(deckId: string) {
  const { data, error } = await supabase
    .from('public_cards')
    .select('*')
    .eq('deck_id', deckId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function searchPublicDecks(query: string) {
  const { data, error } = await supabase
    .from('public_decks')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('download_count', { ascending: false })
    .limit(30);

  if (error) throw error;
  return data ?? [];
}

export async function incrementDownloadCount(deckId: string) {
  await supabase.rpc('increment_download_count', { deck_id: deckId });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserProfile(
  userId: string,
  updates: { display_name?: string; avatar_url?: string; country?: string }
) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates }, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadAvatar(userId: string, localUri: string): Promise<string> {
  const response = await fetch(localUri);
  const arrayBuffer = await response.arrayBuffer();
  const filePath = `${userId}.jpg`;
  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, arrayBuffer, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return `${data.publicUrl}?t=${Date.now()}`;
}

export async function updateAuthEmail(newEmail: string) {
  const { data, error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) throw error;
  return data;
}

export async function updateAuthPassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}
