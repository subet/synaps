import { I18n } from 'i18n-js';
import { en } from './en';
import { tr } from './tr';

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
