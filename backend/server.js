require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const startRevisionReminderCron = require("./cron/revisionReminder");

const authRoutes = require("./routes/authRoutes");
const problemRoutes = require("./routes/problemRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("Cortex API is running");
});

startRevisionReminderCron();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
