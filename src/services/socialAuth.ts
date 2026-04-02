import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from './supabase';
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from '../constants';

// ─── Google ──────────────────────────────────────────────────────────────────

let googleConfigured = false;

function ensureGoogleConfigured() {
  if (googleConfigured) return;
  GoogleSignin.configure({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });
  googleConfigured = true;
}

export async function signInWithGoogle() {
  ensureGoogleConfigured();

  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();

  if (!response.data?.idToken) {
    throw new Error('Google sign-in failed: no ID token');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: response.data.idToken,
  });

  if (error) throw error;
  return data;
}

// ─── Apple ───────────────────────────────────────────────────────────────────

export function isAppleAuthAvailable(): boolean {
  return Platform.OS === 'ios';
}

export async function signInWithApple() {
  // Generate nonce for security
  const rawNonce = Crypto.getRandomBytes(16)
    .reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce,
  );

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });

  if (!credential.identityToken) {
    throw new Error('Apple sign-in failed: no identity token');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
    nonce: rawNonce,
  });

  if (error) throw error;

  // Apple only sends name on first sign-in — persist it (fire-and-forget)
  if (credential.fullName?.givenName && data.user) {
    const displayName = [credential.fullName.givenName, credential.fullName.familyName]
      .filter(Boolean)
      .join(' ');
    if (displayName) {
      supabase.auth.updateUser({
        data: { display_name: displayName },
      }).catch(() => {});
    }
  }

  return data;
}
