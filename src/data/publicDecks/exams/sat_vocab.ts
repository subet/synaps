import type { PublicCard } from '../../../types';
import { satVocabCardsPart1 } from './sat_vocab_part1';
import { satVocabCardsPart2 } from './sat_vocab_part2';
import { satVocabCardsPart3 } from './sat_vocab_part3';
import { satVocabCardsPart4 } from './sat_vocab_part4';
import { satVocabCardsPart5 } from './sat_vocab_part5';

export const satVocabCards: PublicCard[] = [
  ...satVocabCardsPart1,
  ...satVocabCardsPart2,
  ...satVocabCardsPart3,
  ...satVocabCardsPart4,
  ...satVocabCardsPart5,
];
