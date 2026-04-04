import { I18n } from 'i18n-js';
import { en } from './en';
import { es } from './es';
import { tr } from './tr';
import { de } from './de';
import { fr } from './fr';
import { nl } from './nl';
import { ru } from './ru';
import { zh } from './zh';
import { pt_BR } from './pt_BR';
import { pt_PT } from './pt_PT';

export const i18n = new I18n({ en, es, tr, de, fr, nl, ru, zh, pt_BR, pt_PT });

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
  // Lazy import to break require cycle (i18n -> useAppStore -> i18n)
  const { useAppStore } = require('../stores/useAppStore');
  useAppStore((s: any) => s.language); // reactive: triggers re-render on locale change
  return { t };
}
