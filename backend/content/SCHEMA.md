# TradeIQ lesson content schema

All course content lives in `backend/content/<unit>/<chapter-file>.js`. Each chapter
file is an ES module that `export default`s ONE chapter object. The backend serves
lessons to signed-in users only; the public catalog exposes titles/summaries only.

Run the validator after every edit:

```
cd backend && node scripts/validate-content.js content/money/ch1-how-money-works.js
```

## Chapter object

```js
export default {
  id: 'money-ch1',                 // unique, kebab-case
  title: 'How Money Actually Works',
  blurb: 'One sentence teaser shown on the map.',
  lessons: [ /* 5-8 lesson objects */ ],
  bossQuestions: [ /* 5 quiz questions (same shape as quiz questions) for the unit final exam */ ],
};
```

## Lesson object

```js
{
  id: 'money-1-what-is-money',     // globally unique: <unit>-<chapterNumber>-<slug>
  title: 'What Even Is Money?',
  summary: 'One or two sentences. Shown on the lesson card before sign-up.',
  minutes: 12,                     // honest estimate of time to finish
  icon: 'coin',                    // one of the ICONS list below
  steps: [ /* 10-18 steps, see below. LAST step must be a quiz */ ],
}
```

## Step types

Every step is one "screen". Keep read steps to ~80-220 words so they fit on one screen.

| type | shape | notes |
|---|---|---|
| `read` | `{ type:'read', title, html, sprite? }` | Main teaching step. |
| `callout` | `{ type:'callout', variant, title, html }` | variant: `tip` `warn` `fact` `example` `myth` |
| `cards` | `{ type:'cards', title, cards:[{front, back}] }` | 3-6 flip cards. front = term, back = plain-English meaning. Plain text only. |
| `diagram` | `{ type:'diagram', name, caption }` | name must be in DIAGRAMS list. caption = 1-2 sentences explaining what to notice. |
| `widget` | `{ type:'widget', name, props, caption }` | interactive tool; name must be in WIDGETS list; props optional, see list. |
| `check` | `{ type:'check', question, options:[...], answer, explain }` | answer = 0-based index. 3-4 options. |
| `truefalse` | `{ type:'truefalse', statement, answer, explain }` | answer = true/false |
| `numeric` | `{ type:'numeric', question, answer, tolerance, unit, explain }` | unit: `'$'`, `'%'`, or `''`. tolerance is absolute (e.g. 0.5). |
| `match` | `{ type:'match', prompt, pairs:[{left, right}] }` | 3-5 pairs. Plain text. |
| `order` | `{ type:'order', prompt, items:[...], explain }` | items listed in the CORRECT order (UI shuffles). 3-6 items. |
| `quiz` | `{ type:'quiz', questions:[{ q, options, answer, explain }] }` | Final step of every lesson. 5 questions, 4 options each. |

`sprite` (optional on `read`): `{ who, mood, say }`
- who: `chip` (the bull, upbeat mascot), `grizz` (the bear, skeptical risk-checker),
  `hoot` (the owl, nerdy facts), `penny` (the piggy bank, saving & banking),
  `bolt` (the robot, rules & automation)
- mood: `happy`, `think`, `wow`, `warn`
- say: short line, max ~140 characters, in that character's voice. Plain text.

## Allowed HTML inside `html` fields

`<p> <strong> <em> <ul> <ol> <li> <h4> <br> <table> <thead> <tbody> <tr> <th> <td>`
plus these spans:
- `<span class="hl">highlighted phrase</span>`
- `<span class="up">+12%</span>` (green) / `<span class="down">-8%</span>` (red)
- `<span class="term" data-def="Short definition shown on hover/tap">Word</span>` (glossary tooltip)

No images, no links, no inline styles, no emoji. Questions/options/explains/cards are plain text.

## ICONS (lesson node icons)
coin, bank, piggy, chart, candle, bull, bear, shield, clock, rocket, scale, globe,
card, house, briefcase, lightbulb, target, trophy, fire, gem, calculator, book,
lock, leaf, oil, wheat, gold, bolt, warning, receipt

## DIAGRAMS (static illustrated figures)

Money / banking / markets:
`money-flow` (household → bank → loans → businesses → wages, Fed at the top),
`bank-lending` (deposit gets partly lent out, loan becomes someone else's deposit),
`fed-rates` (Fed funds rate → bank rates → mortgages/cards/savings),
`payment-rails` (card swipe vs ACH vs wire vs instant P2P, speeds),
`inflation-basket` (same basket costing more over years),
`compound-curve` (simple vs compound growth curves),
`risk-ladder` (cash → bonds → index funds → single stocks → options/futures/crypto),
`diversification` (one stock vs a basket, volatility smoothing),
`asset-classes` (stocks, bonds, cash, real estate, commodities),
`account-types` (taxable brokerage, Roth IRA, Traditional IRA, 401(k), HSA),
`market-sessions` (pre-market 4:00-9:30, regular 9:30-16:00, after-hours 16:00-20:00 ET),
`trade-lifecycle` (you → broker → market maker/exchange → clearing → settlement T+1),
`order-book` (bids vs asks, spread),
`bull-bear` (bull vs bear market shapes),
`bond-seesaw` (rates up → bond prices down),
`dividend-flow` (company profit → dividend → you → reinvest),
`ponzi` (new money paying old investors, collapse)

Stocks:
`ipo-path`, `stock-split`, `income-statement`, `balance-sheet`, `cash-flow`, `moat`,
`margin-of-safety`, `candlestick-anatomy`, `trends`, `support-resistance`,
`moving-averages`, `rsi-zones`, `macd`, `bollinger`, `volume`, `chart-patterns`,
`position-sizing`

Options:
`call-payoff`, `put-payoff`, `moneyness`, `intrinsic-extrinsic`, `greeks`,
`time-decay`, `covered-call`, `protective-put`, `vertical-spread`, `straddle`,
`iron-condor`, `iv-crush`

Futures:
`futures-contract`, `hedger-speculator`, `mark-to-market`, `contango-backwardation`,
`basis-convergence`, `rollover`, `futures-sessions`

## WIDGETS (interactive tools; props are all optional)

| name | props |
|---|---|
| `compound-interest` | `{ principal, monthly, rate, years }` |
| `rule-of-72` | `{ rate }` |
| `inflation` | `{ amount, rate, years }` |
| `budget` | `{ income }` (50/30/20 split) |
| `emergency-fund` | `{ monthlyExpenses }` |
| `credit-card-payoff` | `{ balance, apr, payment }` |
| `market-clock` | `{}` live: which US session is open right now (ET) |
| `dca` | `{ monthly, months }` dollar-cost averaging vs lump sum on a bumpy price path |
| `dividend-income` | `{ portfolio, yield }` |
| `bid-ask` | `{}` mini order book; place market/limit orders, see where they fill |
| `pe-ratio` | `{ price, eps }` |
| `intrinsic-value` | `{ fcf, growth, discount, terminal, years }` (per-share DCF-lite) |
| `position-size` | `{ account, riskPct, entry, stop }` |
| `risk-reward` | `{ entry, stop, target }` |
| `candle-builder` | `{}` drag open/high/low/close, see the candle |
| `option-payoff` | `{ kind:'call'|'put', side:'long'|'short', strike, premium, spot }` |
| `option-chain` | `{ spot }` illustrative chain; tap strikes to see ITM/OTM, intrinsic/extrinsic |
| `theta-decay` | `{ premium, days }` |
| `futures-leverage` | `{ contract:'ES'|'MES'|'NQ'|'MNQ'|'CL'|'GC' }` |
| `margin-call` | `{}` day-by-day mark-to-market sim with margin call |

## Voice & quality rules

- Audience: smart beginners age 14-30. Fun, punchy, concrete. Like a great teacher who
  also happens to be funny, not a corporate explainer.
- Use real numbers and small stories. Recurring humans: **Maya** (17, saving from a
  café job), **Leo** (22, first salaried job), **Ms. Ortiz** (runs a bakery), **Dev**
  (day-trades too much). Characters can appear in examples and quiz questions.
- BANNED phrases (they make text sound machine-written): "dive in", "delve", "in today's
  fast-paced world", "unlock", "embark", "journey", "navigate the world of",
  "game-changer", "it's important to note", "in conclusion", "whether you're",
  "buckle up", "let's explore", "landscape", "realm", "harness". No emoji. Avoid
  stacking em-dashes; use commas/periods.
- Accuracy matters more than anything. Facts should be correct as of late 2026.
  When a rule is in flux (e.g. pattern-day-trader rule changes, extended/overnight
  trading hours, contribution limits that change yearly), say what the long-standing
  rule is, note that it has been changing, and tell the learner to check the current
  number. Never invent statistics. Round numbers are fine when labeled "about".
- This is education, not advice. Don't tell people what to buy. Risk warnings should be
  real and specific, delivered by Grizz, not boilerplate.
- Every lesson: 10-18 steps, roughly 900-1600 words of teaching text, at least 3
  interactive steps (check / truefalse / numeric / match / order / widget) before the
  final 5-question quiz, and 2-4 sprite popups spread across read steps.
- Wrong answer options must be plausible, not jokes. Explanations teach why.
- In JS template literals / strings: escape backticks, avoid `${` in text, use
  straight quotes inside single-quoted strings carefully (prefer double-quoted or
  template strings for prose with apostrophes).
