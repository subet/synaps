import type { PublicCard } from '../../../types';
import { yksBioCardsPart1 } from './yks_bio_part1';
import { yksBioCardsPart2 } from './yks_bio_part2';

export const yksBioCards: PublicCard[] = [
  ...yksBioCardsPart1,
  ...yksBioCardsPart2,
];
