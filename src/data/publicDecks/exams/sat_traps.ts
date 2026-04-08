import type { PublicCard } from '../../../types';
import { satTrapsCardsPart1 } from './sat_traps_part1';
import { satTrapsCardsPart2 } from './sat_traps_part2';

export const satTrapsCards: PublicCard[] = [
  ...satTrapsCardsPart1,
  ...satTrapsCardsPart2,
];
