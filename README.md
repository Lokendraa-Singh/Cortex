# Cortex 🧠

### DSA Revision Tracker using Spaced Repetition

Cortex is a DSA revision tracker that helps you remember coding problems using **spaced repetition**.

Instead of solving a problem once and forgetting it a week later, Cortex automatically schedules it for revision at increasing intervals:

**1 → 3 → 7 → 15 → 30 days**

I built Cortex because I kept solving LeetCode problems and forgetting them later. The goal is simple — **solve less randomly, revise smarter, and remember longer.**

---

## ✨ Features

- 🔐 **User Authentication** — Register and login using JWT & bcrypt
- 📝 **Problem Tracking** — Add and manage solved DSA problems
- 📅 **Today's Revisions** — See exactly which problems are due today
- 🧠 **Spaced Repetition** — Automatic revision scheduling
- ✅ **Remembered / Forgot** — Adjust the next revision based on your recall
- 🔥 **Daily Streak** — Track your consistency
- 📊 **Topic Breakdown** — Track problems by topics like Arrays, DP, Graphs, etc.
- 🔎 **Search & Pagination** — Easily find your problems
- 📧 **Email Reminders** — Get notified when problems are due for revision

---

## 🛠️ Tech Stack

**Frontend**
- HTML
- CSS
- JavaScript

**Backend**
- Node.js
- Express.js
- REST APIs

**Database**
- MongoDB
- Mongoose

**Authentication**
- JWT
- bcrypt

**Other**
- Resend API
- node-cron
- Git & GitHub

---

## 🔄 How Spaced Repetition Works

Cortex follows a simple revision schedule:

```text
Day 0
  ↓
1 Day
  ↓
3 Days
  ↓
7 Days
  ↓
15 Days
  ↓
30 Days
