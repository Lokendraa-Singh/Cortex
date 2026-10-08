/**
 * STREAK LOGIC
 * ------------
 * Call this whenever a user marks ANY problem as revised on a given day.
 * It figures out whether their daily streak continues, resets, or stays
 * the same (if they already logged activity today).
 *
 * @param {Date|null} lastActiveDate - user.lastActiveDate from DB
 * @param {number} currentStreak
 * @param {number} longestStreak
 * @returns {{ currentStreak: number, longestStreak: number, lastActiveDate: Date }}
 */
function updateStreak(lastActiveDate, currentStreak, longestStreak) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!lastActiveDate) {
    // First ever activity
    const newStreak = 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, longestStreak),
      lastActiveDate: today,
    };
  }

  const last = new Date(lastActiveDate);
  last.setHours(0, 0, 0, 0);

  const diffInDays = Math.round((today - last) / (1000 * 60 * 60 * 24));

  let newStreak;
  if (diffInDays === 0) {
    // Already active today, streak doesn't change
    newStreak = currentStreak;
  } else if (diffInDays === 1) {
    // Active yesterday, active today -> streak continues
    newStreak = currentStreak + 1;
  } else {
    // Missed a day (or more) -> streak resets
    newStreak = 1;
  }

  return {
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, longestStreak),
    lastActiveDate: today,
  };
}

module.exports = { updateStreak };
