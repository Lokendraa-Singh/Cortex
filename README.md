# 🧠 Cortex — DSA Spaced Repetition Tracker

A full-stack web app that tracks the DSA problems you've solved and automatically schedules revisions using a custom spaced-repetition algorithm (the same idea behind Anki) — plus daily streaks, topic-wise analytics, automated email reminders, and AI-powered code review.

This is a **complete, independently deployable project** — no sandbox dependencies, no mock services, no hardcoded secrets.

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript (Fetch API) |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| Scheduling | node-cron |
| Email | Nodemailer |
| AI | Anthropic Claude API (optional feature) |
| Deployment | Render (backend) + Vercel/Netlify (frontend) + MongoDB Atlas (DB) |

---

## 2. Project Architecture (for interview explanation)

Cortex follows a **decoupled client-server architecture** — the frontend and backend are completely independent and communicate only through a REST API over HTTP. This is deliberate: it means the same backend could later serve a mobile app or be swapped for a React frontend without any backend changes.

```
Browser (frontend/)  --fetch()-->  Express API (backend/)  -->  MongoDB Atlas
                      <--JSON------
```

**Request flow for a typical action (e.g. "mark a problem as revised"):**
1. User clicks "Remembered" on the dashboard → `dashboard.js` calls `apiRequest()`
2. `apiRequest()` attaches the JWT (from localStorage) as a `Bearer` token and sends a `PATCH` request
3. The request hits `server.js`, which routes `/api/problems/*` to `problemRoutes.js`
4. `middleware/auth.js` runs first — verifies the JWT, rejects the request if invalid/expired
5. The route handler calls `utils/spacedRepetition.js` to calculate the next revision date, updates the `Problem` document, and calls `utils/streakTracker.js` to update the user's streak
6. A JSON response goes back; the frontend re-renders the affected UI sections

**Why this design:**
- **Separation of concerns** — frontend never touches the database directly; all business logic (spaced repetition, streaks) lives in the backend where it's testable and secure
- **Stateless auth (JWT)** — the server doesn't store sessions; each request carries its own proof of identity, which scales horizontally
- **The AI review feature is backend-only on purpose** — an API key must never be used from browser-side JavaScript, since anyone could read it from dev tools. The backend acts as a secure proxy to the Claude API.

---

## 3. Complete Folder Structure

```
cortex/
├── .gitignore
├── README.md
│
├── backend/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js                  # entry point — wires everything together
│   │
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   │
│   ├── models/
│   │   ├── User.js                # user schema (auth + streak fields)
│   │   └── Problem.js             # problem schema (spaced repetition fields)
│   │
│   ├── middleware/
│   │   └── auth.js                # JWT verification middleware
│   │
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth/register, /api/auth/login
│   │   ├── problemRoutes.js       # /api/problems/* (CRUD, due-today, stats, revise)
│   │   └── aiRoutes.js            # /api/ai/review (Claude API proxy)
│   │
│   ├── utils/
│   │   ├── spacedRepetition.js    # core scheduling algorithm
│   │   ├── streakTracker.js       # daily streak logic
│   │   └── sendEmail.js           # Nodemailer wrapper
│   │
│   └── cron/
│       └── revisionReminder.js    # daily scheduled job (node-cron)
│
└── frontend/
    ├── index.html                 # login / register page
    ├── dashboard.html             # main app
    ├── css/
    │   └── style.css
    └── js/
        ├── api.js                 # fetch wrapper + token/session helpers
        ├── login.js                # login/register page logic
        └── dashboard.js             # dashboard page logic
```

---

## 4. External Dependencies You Need to Set Up

| Dependency | What it's for | Where to get it |
|---|---|---|
| MongoDB Atlas | Database | [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) — free M0 tier |
| Gmail App Password | Sending reminder emails | Google Account → Security → 2-Step Verification → App Passwords |
| Anthropic API Key (optional) | AI code review feature | [console.anthropic.com](https://console.anthropic.com) |

None of these are included in the code — you configure them yourself via environment variables (see below). If `ANTHROPIC_API_KEY` is left empty, the AI review endpoint responds with a clear "not configured" message instead of crashing.

---

## 5. Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in your own values:

```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/cortex?retryWrites=true&w=majority
JWT_SECRET=a_long_random_string_you_make_up
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**Never commit `.env` to GitHub** — it's already listed in `.gitignore`.

---

## 6. Local Setup Commands

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Create your .env file
cp .env.example .env
# now open .env and fill in your real values

# 3. Run the backend (auto-restarts on file changes)
npm run dev

# 4. In a separate terminal/tab, open the frontend
# No build step needed — just open frontend/index.html in a browser,
# or use VS Code's "Live Server" extension for auto-reload
```

The backend runs on `http://localhost:5000`. Before testing, make sure `API_BASE_URL` in `frontend/js/api.js` points to `http://localhost:5000/api` (it does by default).

---

## 7. Production Build & Run

This is a Node.js backend with no separate build step (no TypeScript/bundling) — "production build" here means running it with the production start script instead of the dev/nodemon one:

```bash
cd backend
npm install --omit=dev    # skip devDependencies (nodemon) in production
npm start                 # runs `node server.js` directly
```

The frontend has no build step — it's deployed as static files as-is.

---

## 8. Push to GitHub

```bash
cd cortex
git init
git add .
git commit -m "Initial commit — Cortex DSA tracker"
git branch -M main
git remote add origin https://github.com/<your-username>/cortex.git
git push -u origin main
```

After pushing, open your repo on GitHub and confirm `.env` and `node_modules/` are **not** visible — `.gitignore` should have excluded them automatically.

---

## 9. Deployment Steps

### Database — MongoDB Atlas
1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Database Access → create a database user (username/password)
3. Network Access → allow access from anywhere (`0.0.0.0/0`) for simplicity
4. Get your connection string (Connect → Drivers → Node.js) and use it as `MONGO_URI`

### Backend — Render
1. [render.com](https://render.com) → New → Web Service → connect your GitHub repo
2. **Root Directory:** `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. Add all your `.env` values under Environment Variables
6. Deploy — you'll get a URL like `https://cortex-backend-xxxx.onrender.com`

*(Free tier note: the service sleeps after inactivity; the first request after sleeping takes ~30-40 seconds to wake up — this is a platform limitation, not a bug.)*

### Frontend — Vercel
1. Before deploying, update `frontend/js/api.js`:
   ```js
   const API_BASE_URL = "https://cortex-backend-xxxx.onrender.com/api";
   ```
   Commit and push this change.
2. [vercel.com](https://vercel.com) → Add New → Project → import your repo
3. **Root Directory:** `frontend`
4. Framework preset: "Other" (no build command needed)
5. Deploy — you'll get a permanent URL like `https://cortex-xxxx.vercel.app`

This Vercel URL is what you put on your resume/LinkedIn.

---

## 10. Post-Deployment Checklist

- [ ] Register a test account on the live URL and confirm login/logout works
- [ ] Add a problem and confirm it appears in "All Problems"
- [ ] Confirm MongoDB Atlas → Network Access allows Render's IPs (0.0.0.0/0 covers this)
- [ ] Confirm the Gmail App Password works by waiting for (or manually testing) a reminder email
- [ ] If using AI review, confirm `ANTHROPIC_API_KEY` is set in Render's environment variables

---

## 11. How the Spaced Repetition Algorithm Works

See `backend/utils/spacedRepetition.js` (fully commented). In short:
- `REVISION_INTERVALS = [1, 3, 7, 15, 30]` (days)
- Each problem stores an `intervalIndex` into this array
- Marking a problem "remembered" moves the index forward → longer gap before the next check
- Marking it "forgot" resets the index to 0 → you see it again tomorrow

Streak logic (`utils/streakTracker.js`) compares `lastActiveDate` to today to decide whether to increment, hold, or reset a user's daily streak.

---

## 12. Known Limitations (worth mentioning honestly in an interview)

- Render's free tier sleeps after inactivity — acceptable for a portfolio project, not for real production traffic
- No rate limiting on auth routes yet — a reasonable next step before handling real users at scale
- No automated tests yet — the logic in `spacedRepetition.js` is pure and deterministic, making it straightforward to unit test later
