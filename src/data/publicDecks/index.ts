import { PublicCard, PublicDeck } from '../../types';
import { ALL_DECKS } from './decks';

// Languages
import { germanVocabCards } from './languages/german';
import { spanishVocabCards } from './languages/spanish';
import { frenchCards } from './languages/french';
import { turkishCards } from './languages/turkish';
import { dutchCards } from './languages/dutch';
import { russianCards } from './languages/russian';
import { arabicCards } from './languages/arabic';
import { chineseCards } from './languages/chinese';

// Subjects
import { anatomyCards } from './subjects/anatomy';
import { physicsCards } from './subjects/physics';
import { chemistryCards } from './subjects/chemistry';
import { biologyCards } from './subjects/biology';
import { historyCards } from './subjects/history';
import { businessCards } from './subjects/business';
import { mathCards } from './subjects/math';
import { medicalCards } from './subjects/medical';
import { technologyCards } from './subjects/technology';
import { psychologyCards } from './subjects/psychology';
import { mcatCards } from './subjects/mcat';

export { ALL_DECKS };

const CARDS_MAP: Record<string, PublicCard[]> = {
  'deck-german-vocab': germanVocabCards,
  'deck-spanish-vocab': spanishVocabCards,
  'deck-french-vocab': frenchCards,
  'deck-turkish-vocab': turkishCards,
  'deck-dutch-vocab': dutchCards,
  'deck-russian-vocab': russianCards,
  'deck-arabic-vocab': arabicCards,
  'deck-chinese-vocab': chineseCards,
  'deck-anatomy': anatomyCards,
  'deck-physics': physicsCards,
  'deck-chemistry': chemistryCards,
  'deck-biology': biologyCards,
  'deck-history': historyCards,
  'deck-business': businessCards,
  'deck-math': mathCards,
  'deck-medical': medicalCards,
  'deck-technology': technologyCards,
  'deck-psychology': psychologyCards,
  'deck-mcat': mcatCards,
};

export function getStaticFeaturedDecks(): PublicDeck[] {
  return ALL_DECKS.filter((d) => d.is_featured);
}

export function getStaticEditorsChoiceDecks(): PublicDeck[] {
  return ALL_DECKS.filter((d) => d.is_editors_choice);
}

export function getStaticDeckCards(deckId: string): PublicCard[] {
  return CARDS_MAP[deckId] ?? [];
}

export function searchStaticDecks(query: string): PublicDeck[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return ALL_DECKS.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.subcategory?.toLowerCase().includes(q)
  );
}
