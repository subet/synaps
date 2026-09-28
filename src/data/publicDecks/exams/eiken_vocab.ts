import type { PublicCard } from '../../../types';
import { eikenVocabCardsPart1 } from './eiken_vocab_part1';
import { eikenVocabCardsPart2 } from './eiken_vocab_part2';

export const eikenVocabCards: PublicCard[] = [
  ...eikenVocabCardsPart1,
  ...eikenVocabCardsPart2,
];
