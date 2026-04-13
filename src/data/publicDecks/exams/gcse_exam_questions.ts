import type { PublicCard } from '../../../types';
import { gcseExamQuestionsCardsPart1 } from './gcse_exam_questions_part1';
import { gcseExamQuestionsCardsPart2 } from './gcse_exam_questions_part2';

export const gcseExamQuestionsCards: PublicCard[] = [...gcseExamQuestionsCardsPart1, ...gcseExamQuestionsCardsPart2];
