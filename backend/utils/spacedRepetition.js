/**
 * SPACED REPETITION LOGIC
 * ------------------------
 * This is the core "brain" of Cortex. The idea (borrowed from apps like
 * Anki) is simple: the more times you successfully revise something,
 * the longer we wait before asking you to revise it again - because it's
 * moving into your long-term memory.
 *
 * REVISION_INTERVALS represents the gap (in days) before the next
 * reminder, based on how many times in a row you've revised successfully.
 *
 * index 0 -> next revision after 1 day  (just learned it)
 * index 1 -> next revision after 3 days
 * index 2 -> next revision after 7 days
 * index 3 -> next revision after 15 days
 * index 4 -> next revision after 30 days (well retained)
 */
const REVISION_INTERVALS = [1, 3, 7, 15, 30];

/**
 * Calculates the next revision date when a problem is first added.
 */
function getInitialRevisionDate() {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + REVISION_INTERVALS[0]);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

/**
 * Call this when the user marks a problem as "revised successfully".
 * Moves to the next (longer) interval.
 *
 * @param {number} currentIntervalIndex
 * @returns {{ nextIntervalIndex: number, nextRevisionDate: Date }}
 */
function calculateNextRevision(currentIntervalIndex) {
  const nextIntervalIndex = Math.min(currentIntervalIndex + 1, REVISION_INTERVALS.length - 1);
  const daysToAdd = REVISION_INTERVALS[nextIntervalIndex];

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  nextDate.setHours(0, 0, 0, 0);

  return { nextIntervalIndex, nextRevisionDate: nextDate };
}

/**
 * Call this when the user marks a problem as "forgot / struggled".
 * Resets back to the shortest interval so they see it again soon.
 */
function resetRevisionOnForget() {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + REVISION_INTERVALS[0]);
  nextDate.setHours(0, 0, 0, 0);

  return { nextIntervalIndex: 0, nextRevisionDate: nextDate };
}

module.exports = {
  REVISION_INTERVALS,
  getInitialRevisionDate,
  calculateNextRevision,
  resetRevisionOnForget,
};
