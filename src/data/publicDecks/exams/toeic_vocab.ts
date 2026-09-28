import type { PublicCard } from '../../../types';
import { toeicVocabCardsPart1 } from './toeic_vocab_part1';
import { toeicVocabCardsPart2 } from './toeic_vocab_part2';

export const toeicVocabCards: PublicCard[] = [
  ...toeicVocabCardsPart1,
  ...toeicVocabCardsPart2,
];
