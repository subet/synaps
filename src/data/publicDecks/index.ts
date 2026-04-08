import { Language, PublicCard, PublicDeck } from '../../types';
import { resolveTranslation } from '../../utils/translations';
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

// Exams
import { yksMathCards } from './exams/yks_math';
import { yksBioCards } from './exams/yks_bio';
import { satVocabCards } from './exams/sat_vocab';
import { satGrammarCards } from './exams/sat_grammar';
import { satMathFormulasCards } from './exams/sat_math_formulas';
import { satMathPatternsCards } from './exams/sat_math_patterns';
import { satReadingCards } from './exams/sat_reading';
import { satTrapsCards } from './exams/sat_traps';
import { satStrategiesCards } from './exams/sat_strategies';

// Make Money
import { startupFundamentalsCards } from './make_money/startup_fundamentals';

export { ALL_DECKS };

/**
 * Maps a UI language code to the vocabulary deck that teaches that language.
 * When the user's UI is set to a given language, they already speak it —
 * showing the corresponding vocab deck is pointless.
 */
const LANG_TO_VOCAB_DECK: Partial<Record<Language, string>> = {
  de: 'deck-german-vocab',
  es: 'deck-spanish-vocab',
  fr: 'deck-french-vocab',
  tr: 'deck-turkish-vocab',
  nl: 'deck-dutch-vocab',
  ru: 'deck-russian-vocab',
  zh: 'deck-chinese-vocab',
};

/** Returns the vocab deck ID that should be hidden for the given UI language, or undefined. */
export function getHiddenVocabDeckId(lang: Language): string | undefined {
  return LANG_TO_VOCAB_DECK[lang];
}

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
  'deck-yks-math': yksMathCards,
  'deck-yks-bio': yksBioCards,
  'deck-sat-vocab': satVocabCards,
  'deck-sat-grammar': satGrammarCards,
  'deck-sat-math-formulas': satMathFormulasCards,
  'deck-sat-math-patterns': satMathPatternsCards,
  'deck-sat-reading': satReadingCards,
  'deck-sat-traps': satTrapsCards,
  'deck-sat-strategies': satStrategiesCards,
  'deck-startup-fundamentals': startupFundamentalsCards,
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

export function searchStaticDecks(query: string, locale: Language = 'en'): PublicDeck[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return ALL_DECKS.filter((d) => {
    const name = resolveTranslation(d.name_translations, d.name, locale).toLowerCase();
    const description = resolveTranslation(d.description_translations, d.description ?? '', locale).toLowerCase();
    return (
      name.includes(q) ||
      description.includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.subcategory?.toLowerCase().includes(q)
    );
  });
}
