const cron = require("node-cron");
const User = require("../models/User");
const Problem = require("../models/Problem");
const sendEmail = require("../utils/sendEmail");

// Render UTC pe chalta hai, isliye "aaj ka end" IST ke hisaab se nikalte hain
const getEndOfTodayIST = () => {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(Date.now() + IST_OFFSET_MS);
  const endIST = Date.UTC(
    nowIST.getUTCFullYear(),
    nowIST.getUTCMonth(),
    nowIST.getUTCDate(),
    23, 59, 59, 999
  );
  return new Date(endIST - IST_OFFSET_MS);
};

const sendRevisionReminders = async () => {
  console.log("Running daily revision reminder check:", new Date().toISOString());

  try {
    const users = await User.find();
    const endOfToday = getEndOfTodayIST();

    for (const user of users) {
      const dueProblems = await Problem.find({
        user: user._id,
        nextRevisionDate: { $lte: endOfToday },
      });

      if (dueProblems.length === 0) continue;

      const problemList = dueProblems.map((p) => `- ${p.title} (${p.topic})`).join("\n");
      const message = `Hi ${user.name}, you have ${dueProblems.length} problem(s) to revise today:\n\n${problemList}\n\nKeep your streak alive! Current streak: ${user.currentStreak} day(s).`;

      await sendEmail(user.email, "Cortex: Your Revisions For Today", message);
    }
  } catch (err) {
    console.error("Error in revision reminder cron job:", err.message);
  }
};

// Internal cron sirf local ke liye. Render pe ye band rehta hai, warna
// external trigger ke saath double email chala jayega.
const startRevisionReminderCron = () => {
  if (process.env.USE_INTERNAL_CRON !== "true") {
    console.log("Internal cron off. Reminders run via /api/cron/send-reminders");
    return;
  }

  cron.schedule("0 8 * * *", sendRevisionReminders, { timezone: "Asia/Kolkata" });
  console.log("Revision reminder cron job scheduled (daily at 8:00 AM IST)");
};

module.exports = startRevisionReminderCron;
module.exports.sendRevisionReminders = sendRevisionReminders;