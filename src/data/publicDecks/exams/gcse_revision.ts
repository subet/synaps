import type { PublicCard } from '../../../types';
import { gcseRevisionCardsPart1 } from './gcse_revision_part1';
import { gcseRevisionCardsPart2 } from './gcse_revision_part2';

export const gcseRevisionCards: PublicCard[] = [
  ...gcseRevisionCardsPart1,
  ...gcseRevisionCardsPart2,
];
