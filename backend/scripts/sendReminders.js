// GitHub Actions (ya local) se chalane ke liye: Render ke server pe depend nahi karta
require("dotenv").config();
const mongoose = require("mongoose");
const { sendRevisionReminders } = require("../cron/revisionReminder");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const summary = await sendRevisionReminders();
    await mongoose.disconnect();

    // koi email gaya hi nahi to run ko fail dikhao, taaki GitHub alert bheje
    if (summary.attempted > 0 && summary.sent === 0) {
      console.error("Reminder run failed: no email could be sent");
      process.exit(1);
    }

    console.log("Reminder run finished");
    process.exit(0);
  } catch (err) {
    console.error("Reminder script failed:", err.message);
    process.exit(1);
  }
})();