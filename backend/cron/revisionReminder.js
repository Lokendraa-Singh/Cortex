const cron = require("node-cron");
const User = require("../models/User");
const Problem = require("../models/Problem");
const sendEmail = require("../utils/sendEmail");

// Runs every day at 8:00 AM server time
// For quick testing, temporarily use "*/1 * * * *" (every minute)
const startRevisionReminderCron = () => {
  cron.schedule("0 8 * * *", async () => {
    console.log("Running daily revision reminder check:", new Date().toLocaleString());

    try {
      const users = await User.find();
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

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
  });

  console.log("Revision reminder cron job scheduled (daily at 8:00 AM)");
};

module.exports = startRevisionReminderCron;
