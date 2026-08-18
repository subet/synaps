/**
 * Minimal analytics facade.
 *
 * NOTE: the project currently has NO analytics backend — @sentry/react-native is
 * listed in package.json but never initialized, and expo-insights has no custom
 * event API. All product events funnel through this single function so a real
 * backend (Firebase, PostHog, Amplitude, …) can be wired in one place later.
 * Until then, events are logged to the console in development builds only.
 */

export type AnalyticsValue = string | number | boolean | null;
export type AnalyticsProps = Record<string, AnalyticsValue>;

export function logEvent(name: string, props: AnalyticsProps = {}): void {
  if (__DEV__) {
    console.log(`[analytics] ${name}`, props);
  }
  // TODO: forward to a real analytics backend once one is integrated.
}

/** Truncates long strings (e.g. error messages) to keep event payloads small. */
export function truncate(value: string | undefined | null, max = 200): string {
  if (!value) return '';
  return value.length > max ? `${value.slice(0, max)}…` : value;
}
