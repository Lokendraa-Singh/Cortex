const cron = require("node-cron");
const User = require("../models/User");
const Problem = require("../models/Problem");
const sendEmail = require("../utils/sendEmail");

// Render/GitHub UTC pe chalte hain, isliye "aaj ka end" IST ke hisaab se nikalte hain
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

// DB ka error upar throw hota hai (caller handle karega), email ka error user-wise count hota hai
const sendRevisionReminders = async () => {
  console.log("Running daily revision reminder check:", new Date().toISOString());

  const users = await User.find();
  const endOfToday = getEndOfTodayIST();
  const summary = { attempted: 0, sent: 0, failed: 0 };

  for (const user of users) {
    const dueProblems = await Problem.find({
      user: user._id,
      nextRevisionDate: { $lte: endOfToday },
    });

    if (dueProblems.length === 0) continue;

    const problemList = dueProblems.map((p) => `- ${p.title} (${p.topic})`).join("\n");
    const message = `Hi ${user.name}, you have ${dueProblems.length} problem(s) to revise today:\n\n${problemList}\n\nKeep your streak alive! Current streak: ${user.currentStreak} day(s).`;

    summary.attempted++;
    try {
      const ok = await sendEmail(user.email, "Cortex: Your Revisions For Today", message);
      if (ok === false) summary.failed++;
      else summary.sent++;
    } catch (err) {
      console.error(`Failed to send reminder to ${user.email}:`, err.message);
      summary.failed++;
    }
  }

  console.log("Reminder summary:", summary);
  return summary;
};

// Internal cron sirf local ke liye. Render pe ye band rehta hai, warna
// external trigger ke saath double email chala jayega.
const startRevisionReminderCron = () => {
  if (process.env.USE_INTERNAL_CRON !== "true") {
    console.log("Internal cron off. Reminders run via GitHub Actions / /api/cron/send-reminders");
    return;
  }

  cron.schedule(
    "0 8 * * *",
    () => sendRevisionReminders().catch((err) => console.error("Reminder job failed:", err.message)),
    { timezone: "Asia/Kolkata" }
  );
  console.log("Revision reminder cron job scheduled (daily at 8:00 AM IST)");
};

module.exports = startRevisionReminderCron;
module.exports.sendRevisionReminders = sendRevisionReminders;