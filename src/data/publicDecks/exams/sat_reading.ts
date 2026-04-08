import type { PublicCard } from '../../../types';
import { satReadingCardsPart1 } from './sat_reading_part1';
import { satReadingCardsPart2 } from './sat_reading_part2';

export const satReadingCards: PublicCard[] = [
  ...satReadingCardsPart1,
  ...satReadingCardsPart2,
];
