import type { PublicCard } from '../../../types';
import { satGrammarCardsPart1 } from './sat_grammar_part1';
import { satGrammarCardsPart2 } from './sat_grammar_part2';

export const satGrammarCards: PublicCard[] = [
  ...satGrammarCardsPart1,
  ...satGrammarCardsPart2,
];
