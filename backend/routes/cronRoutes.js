const express = require("express");
const router = express.Router();
const { sendRevisionReminders } = require("../cron/revisionReminder");

// secret key ke bina koi bhi is link se emails nahi bhej sakta
router.get("/send-reminders", (req, res) => {
  const secret = process.env.CRON_SECRET;

  if (!secret || req.query.key !== secret) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // turant jawab dete hain, emails peeche chalte rehte hain
  res.status(202).json({ message: "Reminder job started" });
  sendRevisionReminders().catch((err) => console.error("Reminder job failed:", err.message));
});

module.exports = router;