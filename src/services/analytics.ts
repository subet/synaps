import PostHog from 'posthog-react-native';

/**
 * Analytics facade backed by PostHog (EU region).
 *
 * - Production builds: events are captured to PostHog.
 * - Dev builds (__DEV__): console logging only — nothing is sent, so
 *   production data stays clean.
 * - Missing env key: silent no-op (never crashes the app).
 *
 * Privacy: never attach email, name, or deck content to any event.
 */

export type AnalyticsValue = string | number | boolean | null;
export type AnalyticsProps = Record<string, AnalyticsValue>;

let client: PostHog | null = null;
let clientFailed = false;

function getClient(): PostHog | null {
  if (__DEV__) return null; // dev: console only
  if (client || clientFailed) return client;

  const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
  const host = process.env.EXPO_PUBLIC_POSTHOG_HOST;
  if (!apiKey) {
    clientFailed = true;
    return null;
  }
  try {
    client = new PostHog(apiKey, { host: host || 'https://eu.i.posthog.com' });
  } catch {
    clientFailed = true;
  }
  return client;
}

export function logEvent(name: string, props: AnalyticsProps = {}): void {
  if (__DEV__) {
    console.log(`[analytics] ${name}`, props);
    return;
  }
  try {
    getClient()?.capture(name, props);
  } catch {}
}

/**
 * Ties events to a stable identity: the auth user id when signed in, or the
 * RevenueCat appUserID for anonymous users (aligns PostHog identity with
 * RevenueCat for cross-tool funnel analysis).
 */
export function identify(userId: string): void {
  if (__DEV__) {
    console.log(`[analytics] identify ${userId}`);
    return;
  }
  try {
    getClient()?.identify(userId);
  } catch {}
}

/** Clears the current identity — call on logout, after RevenueCat logOut. */
export function reset(): void {
  if (__DEV__) {
    console.log('[analytics] reset');
    return;
  }
  try {
    getClient()?.reset();
  } catch {}
}

/** Truncates long strings (e.g. error messages) to keep event payloads small. */
export function truncate(value: string | undefined | null, max = 200): string {
  if (!value) return '';
  return value.length > max ? `${value.slice(0, max)}…` : value;
}
