import { I18n } from 'i18n-js';
import { en } from './en';
import { tr } from './tr';
import { useAppStore } from '../stores/useAppStore';

export const i18n = new I18n({ en, tr });

i18n.defaultLocale = 'en';
i18n.locale = 'en';
i18n.enableFallback = true;

export function setLocale(locale: string): void {
  i18n.locale = locale;
}

export function t(key: string, options?: Record<string, string | number>): string {
  return i18n.t(key, options);
}

/** Hook that subscribes to language changes — components using this will
 *  automatically re-render when the user switches locale. */
export function useTranslation() {
  useAppStore((s) => s.language); // reactive: triggers re-render on locale change
  return { t };
}
