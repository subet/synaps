import { Card, CardStatus, SM2Result, SRSGrade } from '../types';

const MIN_EASE_FACTOR = 1.3;

// Intervals in minutes
const AGAIN_INTERVAL = 1;
const HARD_MIN_INTERVAL = 5;
const GOOD_MIN_INTERVAL = 10;
const EASY_MIN_INTERVAL = 4 * 24 * 60; // 4 days
const MASTERED_THRESHOLD_INTERVAL = 21 * 24 * 60; // 21 days
const MASTERED_THRESHOLD_REPS = 3;

export function calculateSM2(
  grade: SRSGrade,
  currentEaseFactor: number,
  currentInterval: number,
  currentRepetitions: number,
  currentStatus: CardStatus
): SM2Result {
  let newEaseFactor = currentEaseFactor;
  let newInterval: number;
  let newRepetitions: number;
  let newStatus: CardStatus;

  // Ease factor adjustment: EF' = EF + (0.1 - (3-q)*(0.08+(3-q)*0.02))
  const efDelta = 0.1 - (3 - grade) * (0.08 + (3 - grade) * 0.02);
  newEaseFactor = Math.max(MIN_EASE_FACTOR, currentEaseFactor + efDelta);

  switch (grade) {
    case 0: // Again — reset
      newInterval = AGAIN_INTERVAL;
      newRepetitions = 0;
      newStatus = 'learning';
      break;

    case 1: // Hard
      newInterval = Math.max(HARD_MIN_INTERVAL, Math.round(currentInterval * 1.2));
      newRepetitions = Math.max(0, currentRepetitions);
      newStatus = 'learning';
      break;

    case 2: // Good
      newInterval = Math.max(GOOD_MIN_INTERVAL, Math.round(currentInterval * newEaseFactor));
      newRepetitions = currentRepetitions + 1;
      if (currentStatus === 'new') {
        newStatus = 'learning';
      } else if (
        newRepetitions >= MASTERED_THRESHOLD_REPS &&
        newInterval >= MASTERED_THRESHOLD_INTERVAL
      ) {
        newStatus = 'mastered';
      } else {
        newStatus = 'review';
      }
      break;

    case 3: // Easy
      newInterval = Math.max(
        EASY_MIN_INTERVAL,
        Math.round(currentInterval * newEaseFactor * 1.3)
      );
      newRepetitions = currentRepetitions + 1;
      if (
        newRepetitions >= MASTERED_THRESHOLD_REPS &&
        newInterval >= MASTERED_THRESHOLD_INTERVAL
      ) {
        newStatus = 'mastered';
      } else {
        newStatus = 'review';
      }
      break;
  }

  const dueDate = new Date(Date.now() + newInterval * 60 * 1000);

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    status: newStatus,
    dueDate,
  };
}

export function getPreviewIntervals(
  card: Card
): { again: string; hard: string; good: string; easy: string } {
  const format = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    if (minutes < 24 * 60) return `${Math.round(minutes / 60)} hr`;
    return `${Math.round(minutes / (24 * 60))} days`;
  };

  const again = calculateSM2(0, card.ease_factor, card.interval, card.repetitions, card.status);
  const hard = calculateSM2(1, card.ease_factor, card.interval, card.repetitions, card.status);
  const good = calculateSM2(2, card.ease_factor, card.interval, card.repetitions, card.status);
  const easy = calculateSM2(3, card.ease_factor, card.interval, card.repetitions, card.status);

  return {
    again: format(again.interval),
    hard: format(hard.interval),
    good: format(good.interval),
    easy: format(easy.interval),
  };
}

export function isDueForReview(card: Card): boolean {
  if (!card.due_date) return card.status === 'new';
  return new Date(card.due_date) <= new Date();
}

export function getCardsDueToday(cards: Card[]): Card[] {
  return cards.filter(isDueForReview);
}
