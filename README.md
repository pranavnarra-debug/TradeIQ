# TradeIQ

A gamified financial-education site. Visitors land on a public home page and can browse the whole course map. Opening a lesson asks them to make a free account (just a username and password). Then they learn through bite-sized lessons narrated by a crew of pixel-art characters, earn XP, coins and badges, keep a daily streak, beat a "final boss" exam per unit, and practice on a simulated $50,000 trading desk.

> TradeIQ is education only. All trading is simulated. Nothing on the site is financial advice.

## What's inside

| | |
|---|---|
| **Curriculum** | 4 units, 16 chapters, 106 lessons, ~100,000 words, ~25 hours, 59-day suggested schedule. Full plan: [docs/CURRICULUM.md](docs/CURRICULUM.md) |
| **Lessons** | One-screen steps: reading, flip cards, 53 illustrated diagrams, 20 interactive tools (compound interest, order book, option payoffs, DCF, futures leverage, margin-call sim, live market clock...), practice questions, and a 5-question quiz graded on the server |
| **Game layer** | XP, 15 levels, daily streaks (in each user's timezone) with Streak Freezes, coins, 20 badges, a coin shop (avatars, freezes), weekly + all-time leaderboard, one boss exam per unit |
| **Practice** | Trading Desk (manual paper trading), Bolt the Bot (9 rule-based strategies, clearly labeled as not AI), stock Research |
| **Accounts** | Username + password. Email optional (password resets, reminders). A one-time recovery code is shown at signup for people without email |
| **Email automation** | Email confirmation, welcome, password reset, security alerts, 6pm-local streak reminders, Sunday weekly digest, one-click unsubscribe, delivery log in the admin panel |
| **Admin** | Metrics, lesson funnel, user management (unlock, sign out everywhere, deactivate, delete), a read-only **Data Explorer** for every table with CSV export, email log, audit log |

### The units

1. **Money Moves** (37 lessons): what money is, inflation, how banks create money, the Fed, payment rails, credit, banking and FDIC, budgeting, credit scores, taxes, compounding, risk, funds and account types, market hours, order types, the life of a trade, indexes, regulators, passive income (interest, bonds, dividends, REITs, the 4% rule), investment taxes, scams.
2. **Stock Smarts** (34): what shares are, IPOs, market cap, sectors, splits and buybacks, the three financial statements, earnings season, valuation and quality ratios, value investing (margin of safety, moats, DCF), candlesticks, trends, support/resistance, volume, moving averages, RSI, MACD, Bollinger/VWAP, chart patterns, risk and position sizing, psychology, journaling, portfolios.
3. **Options Arena** (19): calls, puts, contract mechanics, moneyness, exercise and assignment, pricing, IV crush, the Greeks, covered calls, cash-secured puts and the wheel, protective puts, spreads, straddles, iron condors, and a frank "danger zone" lesson.
4. **Futures Frontier** (16): what futures are, hedgers vs speculators, contract specs and tick values, expiration and rollover, the 23-hour session, margin and mark-to-market, leverage math, margin calls, micros and sizing, basis and contango, hedging, spreads, prop-firm evaluations, regulation and 60/40 taxes.

## Run it locally

Needs Node 22+. No Postgres install required.

```bash
cd backend
npm install
cp .env.example .env          # the defaults work for local dev
npm run db:local              # terminal 1: starts a local Postgres, leave it running
```

```bash
cd backend
npm run migrate               # terminal 2: create the tables
npm run dev                   # http://localhost:3001
```

Without `RESEND_API_KEY`, emails are printed to the server console (with clickable links) instead of being sent.

**Make yourself admin:** sign up on the site, then:

```bash
cd backend && npm run make-admin -- yourusername
```

## Market data

Prices come from **Alpaca** (free IEX feed) when `ALPACA_KEY_ID` / `ALPACA_SECRET_KEY` are set. Company financials, profiles and recent filings come from **SEC EDGAR** (free public data) once `CONTACT_EMAIL` is set. Without either, the app falls back to Yahoo Finance, which is unlicensed and only meant for local development. Licensing details and the consent email for Alpaca: [docs/MARKET_DATA.md](docs/MARKET_DATA.md).

## Seeing your database

Pick whichever is easiest:

1. **Admin → Data Explorer** on the site: browse, search, sort and export every table. Read-only, secrets always redacted, exports audit-logged.
2. **Railway dashboard → Postgres service → Data tab**: built-in table viewer.
3. **A desktop app** (TablePlus, Postico, DBeaver) with the `DATABASE_PUBLIC_URL` from Railway. For everyday browsing, create the read-only role at the bottom of `backend/db/LeastPrivilegeSetup.sql` and connect as that, so you can't accidentally edit anything and never see password hashes.

## Deploy (Railway)

1. Connect the repo in Railway. The root `package.json` builds `backend/` and **runs migrations automatically on every start**.
2. Add the Postgres plugin (sets `DATABASE_URL`).
3. Set the variables from `backend/.env.example`. Required in production: `JWT_ACCESS_SECRET` (32+ random chars), `APP_URL`, `NODE_ENV=production`. For email: `RESEND_API_KEY`, `EMAIL_FROM` (on a domain you've verified in Resend), `CONTACT_EMAIL`, `POSTAL_ADDRESS`. For the legal pages: `LEGAL_ENTITY`, `GOVERNING_STATE`.
4. Deploy, sign up, run `npm run make-admin -- <you>` via `railway run`.

**Upgrading from v1:** the migration keeps every user, email, role, portfolio and trade. Everyone is logged out once (old plaintext session tokens are discarded) and logs back in with their **username** (or their already-verified email). The old 20-lesson progress table is kept but the new curriculum replaces those lessons.

Optional hardening: run `backend/db/LeastPrivilegeSetup.sql` so the app connects as a restricted role, and set `MIGRATION_DATABASE_URL` to the owner URL for migrations.

## Security summary

- Passwords: bcrypt (12 rounds), NIST-style rules (8+ chars, common-password blocklist), 72-byte cap.
- Sessions: 15-minute access token in memory + rotating refresh token in an **httpOnly, SameSite=Strict, Secure** cookie, stored hashed, with reuse detection and a same-origin check.
- Login: per-IP+username rate limits, account lockout, constant-time "user not found", honeypot on signup.
- Every one-time secret (refresh tokens, email links) is SHA-256 hashed; recovery codes are bcrypt-hashed.
- Strict Content-Security-Policy (scripts only from our own origin; Chart.js, fonts and Socket.io are self-hosted), HSTS, frame-ancestors none, no third-party trackers.
- All SQL is parameterized; the Data Explorer only uses whitelisted table names and introspected column names.
- Trades run in database transactions with row locks. Limit orders only fill when marketable (v1 let anyone "buy" at $0.01).
- Admin rights are re-checked against the database on every request; every admin action is audit-logged.
- Privacy: data export and self-serve account deletion, minimal data collection, 30-day connection-log retention, one essential cookie.
- See `Incident Response` for the breach runbook.

## Tests and tools

```bash
cd backend
npm test                  # end-to-end API tests (server + DB must be running)
npm run validate-content  # checks every lesson file against content/SCHEMA.md
npm run curriculum        # regenerates docs/CURRICULUM.md
npm run migrate -- status # list applied / pending migrations
```

## Writing more lessons

Lessons are plain JS data files in `backend/content/<unit>/chNN-*.js`. Read `backend/content/SCHEMA.md` (step types, characters, available diagrams and tools, voice rules) and `EXAMPLE.js.txt`, add a file, run `npm run validate-content`, restart. New chapter files are discovered automatically.

## Project structure

```
backend/
  server.js            Express + Socket.io, security headers, rate limits, static hosting
  config.js            env loading + validation
  content/             the curriculum (16 chapter files) + schema + loader
  db/migrations/       numbered SQL migrations (applied by scripts/migrate.js)
  routes/              auth, me, lessons, portfolio, market, admin, email
  services/            progress (XP/streaks/badges), email, tokens, validation, market data, strategies
  jobs/                cron: email reminders/digests, data retention, market cache
  scripts/             migrate, make-admin, db-local, validate-content, build-curriculum
  test/                API tests
frontend/
  index.html
  css/                 base (design tokens), app, landing, lesson, tools
  js/core/             api client + session, UI kit, pixel sprites
  js/lessons/          lesson player, diagrams, interactive widgets
  js/pages/            landing, auth, learn map, exam, profile + ranks, settings, legal
  js/*.js              trading desk, bot, research, admin
docs/CURRICULUM.md     generated lesson plan
```
