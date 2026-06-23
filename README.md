# TradeIQ — Stock Trading Education Platform

TradeIQ is an educational paper-trading platform for learning stock trading strategies, technical analysis, and risk management. All trading is simulated — no real money or brokerage accounts are involved.

⚠️ **TradeIQ is for educational purposes only. All trading is paper trading only. Market data is provided via Yahoo Finance for educational purposes. Nothing in this app constitutes financial advice.**

## Features

- **AI Trader** — watch 8 rule-based strategies (CANSLIM, Momentum Breakout, VWAP Mean Reversion, EMA Crossover, Opening Range Breakout, Gap and Go, RSI Swing, Bollinger Squeeze) evaluate live market data and execute simulated trades automatically
- **My Trading Desk** — place your own simulated trades with live strategy signal indicators
- **Stock Research** — full technical + CANSLIM analysis on any ticker, with a side-by-side comparison against your own analysis
- **20-Lesson Curriculum** — a 3-week, self-paced course covering market foundations, trading strategies, and trading psychology, each with a 3-question quiz
- **Admin Dashboard** — live user activity, registration trends, lesson completion, and strategy usage analytics (admin accounts only)

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup

1. Clone the repo and install dependencies:
   ```
   cd backend
   npm install
   ```

2. Copy the environment template and fill in your values:
   ```
   cp .env.example .env
   ```
   At minimum you'll need a `DATABASE_URL`, two JWT secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — use long random strings), SMTP credentials for `nodemailer` (e.g. a Gmail account with an App Password, or SendGrid), and an `ADMIN_EMAIL`.

3. Create the database:
   ```
   createdb tradeiq
   ```

4. Run the schema:
   ```
   psql tradeiq < db/schema.sql
   ```

5. Start the server:
   ```
   npm run dev     # nodemon, hot reload
   ```
   or
   ```
   npm start       # production mode
   ```

6. Open your browser to:
   ```
   http://localhost:3001
   ```

7. Create your admin account:
   Register at `/register` using the email address set in `ADMIN_EMAIL` in your `.env` file. That account automatically receives the `admin` role and can access the Admin Dashboard.

## Market Data

TradeIQ uses the [`yahoo-finance2`](https://www.npmjs.com/package/yahoo-finance2) npm package for all stock data — quotes, historical candles, company profiles, and news. No API key is required; this is free, unofficial access to Yahoo Finance data, fetched entirely server-side. Users of the app never see, configure, or have access to any API keys — all market data flows through TradeIQ's own `/api/market/*` endpoints.

Because this is an unofficial API, Yahoo may occasionally change response formats. The backend wraps every external call in retry logic (3 attempts with exponential backoff) and falls back to the last cached value if all retries fail, so brief upstream hiccups don't break the user experience.

## Deployment (Railway)

1. Push this repository to GitHub
2. Create a new project in Railway and connect the repo
3. Set the root directory to `backend/`
4. Add all variables from `.env.example` in the Railway dashboard (with real values)
5. Add Railway's PostgreSQL plugin — `DATABASE_URL` will be set automatically
6. Deploy

The Express server serves the `frontend/` directory as static files, so a single Railway service handles both the API and the UI.

## Architecture

- **Backend:** Node.js + Express on port 3001 (configurable via `PORT`)
- **Frontend:** vanilla HTML/CSS/JS, served as static files from `/frontend`, with client-side routing — no build step required
- **Database:** PostgreSQL, accessed directly via the `pg` package (no ORM)
- **Real-time:** Socket.io, authenticated via JWT on the handshake — powers live online-user tracking for the Admin Dashboard
- **Market data:** `yahoo-finance2`, server-side only, with in-memory TTL caching
- **Auth:** JWT access tokens (15 min) + rotating refresh tokens (7 days), bcrypt password hashing (12 rounds)
- **Scheduled jobs:** `node-cron` pre-warms the market data cache for the 10 default tickers during market hours and snapshots admin metrics hourly

## Project Structure

```
tradeiq/
├── backend/
│   ├── server.js              Express + Socket.io entry point
│   ├── db/                    Postgres pool + schema
│   ├── middleware/             JWT auth + admin-only guards
│   ├── routes/                 auth, market, portfolio, lessons, admin
│   ├── services/               market data, indicators, strategy engine, email
│   └── jobs/                   node-cron scheduled jobs
└── frontend/
    ├── index.html
    ├── css/                     main, auth, dashboard, lessons
    └── js/                      api, app, auth, aiTrader, myDesk, research, lessons, admin, charts
```
