import { Language } from '../types';

export const LANGUAGE_FLAGS: Record<Language, string> = {
  en: '\u{1F1EC}\u{1F1E7}',     // 🇬🇧
  es: '\u{1F1EA}\u{1F1F8}',     // 🇪🇸
  it: '\u{1F1EE}\u{1F1F9}',     // 🇮🇹
  tr: '\u{1F1F9}\u{1F1F7}',     // 🇹🇷
  de: '\u{1F1E9}\u{1F1EA}',     // 🇩🇪
  fr: '\u{1F1EB}\u{1F1F7}',     // 🇫🇷
  nl: '\u{1F1F3}\u{1F1F1}',     // 🇳🇱
  ru: '\u{1F1F7}\u{1F1FA}',     // 🇷🇺
  zh: '\u{1F1E8}\u{1F1F3}',     // 🇨🇳
  pt_BR: '\u{1F1E7}\u{1F1F7}',  // 🇧🇷
  pt_PT: '\u{1F1F5}\u{1F1F9}',  // 🇵🇹
};

/** A deck is considered multilingual if it supports more than 3 languages. */
export function isMultilingual(languages?: Language[] | null): boolean {
  return !languages || languages.length > 3;
}
