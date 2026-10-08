# Cortex

A DSA revision tracker that uses spaced repetition (same idea as Anki) to remind you when to revise a problem again — 1 day, then 3, then 7, 15, 30. The longer you remember something, the longer the gap before it asks you again.

Built this because I kept solving LeetCode problems and forgetting them a week later.

Live: https://cortex-frontend-teal.vercel.app

## Features

- Login/Register (JWT + bcrypt)
- Add solved problems, see what's due today
- Mark a problem "Remembered" or "Forgot" — the next revision date adjusts automatically
- Daily streak tracking
- Topic-wise breakdown (Array, DP, Graph, etc.)
- Email reminder for due problems via Resend API

## Stack

Node.js, Express, MongoDB, JWT, Resend API on the backend. Plain HTML/CSS/JS on the frontend, no framework.

## Running it locally

```
cd backend
npm install
cp .env.example .env   # fill in your own values
npm run dev
```

Then just open `frontend/index.html` in a browser (or use Live Server). Backend runs on port 5000 by default.

## Environment variables

```
PORT=5000
MONGO_URI=your MongoDB connection string
JWT_SECRET=any random string
CRON_SECRET=secret key for the reminder endpoint
RESEND_API_KEY=your Resend API key
```

## Deploying

Backend on Render (root directory: `backend`, build: `npm install`, start: `npm start`), frontend on Vercel (root directory: `frontend`). Database on MongoDB Atlas. After the backend is live, update `API_BASE_URL` in `frontend/js/api.js` to point to it.

Render's free tier sleeps, so reminder emails are triggered by an external scheduler (cron-job.org) that calls `/api/cron/send-reminders?key=<CRON_SECRET>` every morning.

## How the scheduling logic works

`backend/utils/spacedRepetition.js` — each problem has an `intervalIndex` pointing into `[1, 3, 7, 15, 30]`. "Remembered" moves it forward, "Forgot" resets it to 0.
