import { Language, TranslationMap } from '../types';
import { useAppStore } from '../stores/useAppStore';

export function resolveTranslation(
  map: TranslationMap | null | undefined,
  fallback: string,
  locale: Language
): string {
  if (!map) return fallback;
  return map[locale] ?? fallback;
}

export function useResolvedFront(card: { front: string; front_translations?: TranslationMap | null }) {
  const locale = useAppStore((s) => s.language);
  return resolveTranslation(card.front_translations, card.front, locale);
}

export function useResolvedBack(card: { back: string; back_translations?: TranslationMap | null }) {
  const locale = useAppStore((s) => s.language);
  return resolveTranslation(card.back_translations, card.back, locale);
}

export function useResolvedDeckName(deck: { name: string; name_translations?: TranslationMap | null }) {
  const locale = useAppStore((s) => s.language);
  return resolveTranslation(deck.name_translations, deck.name, locale);
}

export function useResolvedDeckDescription(deck: { description?: string; description_translations?: TranslationMap | null }) {
  const locale = useAppStore((s) => s.language);
  if (!deck.description) return undefined;
  return resolveTranslation(deck.description_translations, deck.description, locale);
}
