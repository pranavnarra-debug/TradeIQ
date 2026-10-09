# TradeIQ Game Design v1

_Owner: game design. Status: first pass, October 2026. Builds on what ships today (XP, 15 levels, streaks, coins, 20 badges, coin shop, unit exams, paper desk, Bolt). Engineers implement; this doc doesn't change app code._

| File | What it is |
|---|---|
| `docs/game/GAME_DESIGN.md` | This doc |
| `docs/game/items-v1.json` | The item catalogue the avatar and inventory screen loads: 12 sets, 74 items, effect types |
| `docs/game/sims/validate_items.mjs` | `node docs/game/sims/validate_items.mjs` checks the catalogue against the rules in section 2 |
| `docs/game/sims/economy_sim.mjs` | `node docs/game/sims/economy_sim.mjs [--days 90]` is the coin and net-worth simulation behind section 3. It reads prices from `items-v1.json` |

## 0. Decisions at a glance

| Topic | Recommendation |
|---|---|
| Currencies | **Two, with no exchange between them.** **Coins** come from learning and quests and buy gear and cosmetics. **Cash** is in-game net worth from income methods; it's a score you grow, and it never buys gear. The only link: net-worth milestones pay a capped, one-time amount of coins. |
| Items | 7 slots, 4 stats, armor in sets of 4 with 2-piece (stats) and 4-piece (signature effect) bonuses. Mixing pieces from different sets is a real build path (the Correlation Charm rewards it). Every item maps to a money concept. |
| Coin payouts | **Raise them.** At today's rates a regular player can't afford the World 1 kit until day 34. Recommended: lesson 5 → 10 coins, exam 50 → 150, add daily, weekly and story quests, and 100 coins for a first boss win. Result: the regular player gets the kit on day 6. |
| Worlds | Each world unlocks new income methods, a shop tier, armor sets and a boss. Older methods keep paying, but their share shrinks because newer methods have bigger contracts and the career ladder climbs. |
| Bosses | A real-time arena fight (move, dash, block, aim) where **correct answers charge your weapon** and **skill decides whether hits land and attacks miss you**. Concept only in v1. The unit exam stays the gate for progress, so learning is never blocked by reflexes. |
| Futures | Synthetic ES/MES from SPY, NQ/MNQ from QQQ, YM/MYM from DIA, priced by cost of carry and clearly labeled "TradeIQ synthetic". Nothing else for now. |
| Data | The core game runs on the Life Clock, historical replays and simulation. Live prices stay in the existing Practice Desk, so the game doesn't wait on Alpaca's consent. |

---

## 1. Core loop and session loop

**Core loop (days to weeks):** learn (lessons) → earn (coins from lessons and quests, cash from income methods) → equip (buy and wear gear) → fight (bosses) → unlock (next world: new income methods, shop tier, sets) → learn.

**Session loop (5-15 minutes):**

| Minute | What happens | Why it's there |
|---|---|---|
| 0-1 | Open the **Net Worth hub**. Payday lands: the Life Clock advances one game month, your paycheck arrives, and the Budget Board asks you to split it (needs / wants / savings). | A daily reason to return that teaches budgeting and pays out without punishing absence |
| 1-9 | One lesson (8-15 minutes on its own; shorter sessions do quests only) | The key that unlocks everything |
| 9-12 | 1-3 daily quests (1-3 minutes each): a scam-spotting round, a review run, a desk contract | Retrieval practice, the main coin faucet |
| 12-15 | Shop / loadout, or a boss attempt if one is open | Spend, try a build |

**Rules that keep it healthy**
- The Life Clock only moves on days you visit. Missing days costs nothing and doesn't pile up. No FOMO timers.
- Daily quests are capped at 3 per day and weekly quests at 3 per week, so grinding has a ceiling.
- Streaks keep their existing rules and Streak Freezes (the current 50-coin shop item).

---

## 2. Items and armor (top priority)

The catalogue lives in [`items-v1.json`](items-v1.json). This section is the design reasoning, the formulas the battle engine should use, and the rules the catalogue obeys.

### 2.1 Slots and stats

| Slot | Role | Notes |
|---|---|---|
| helmet, chest, legs, boots | Armor, always part of a set | Recolored from shared pixel templates with the set palette (A primary, B secondary, C accent) |
| weapon | What your charged answers fire | Own palette |
| offhand | Shield, lantern or tome | Own palette |
| trinket | One charm, ring or amulet | Own palette |

| Stat | Meaning (from the JSON) | Formula (concept; tune in playtests) |
|---|---|---|
| power | How hard charged attacks hit | Damage per charge pip = 30 + 3 x power |
| defense | Cuts damage taken | Damage taken x (1 - min(0.60, 0.03 x defense)) |
| focus | Charge per correct answer, dash recovery | Every 4 focus = +1 bonus pip on every 4th correct answer; dash cooldown -2% per point |
| luck | Crit chance | 1% per point, capped at 15%. Crits deal 1.5x (plus crit_damage). **Never** touches coins, drops or prices |

Stats can be negative on tradeoff items (minimum -3). Negative stats teach that every advantage costs something: the Emergency Fund Chestplate has -1 power because cash parked for safety earns less, and the Day Trader pieces have negative defense.

### 2.2 Rarity and stat budgets

Net stat points (positives minus negatives) follow a budget per world, so a higher world means stronger items. Effects carry the identity.

| Rarity | World 1 | World 2 | World 3 | World 4 | How you get it |
|---|---|---|---|---|---|
| common | 2 | 4 | 6 | 8 | Shop |
| uncommon | 3 | 5 | 7 | 9 | Shop |
| rare | 4 | 6 | 8 | 10 | Story quest reward, or a higher-priced shop item |
| epic | 5 | 7 | 9 | 11 | First boss win, guaranteed (no random drops) |
| legendary | | | | 12 | Grand Champion achievement only |

Starter pieces (Rookie Threads, Trusty Calculator) carry 1 point each.

### 2.3 Sets and mix-and-match

Every armor set has exactly 4 pieces. Bonuses count the pieces of that set you're wearing.

| Bonus | What it gives | Design rule |
|---|---|---|
| 2-piece | Stats only (about +2 at World 1, +5 at World 4) | Two 2-piece bonuses from two different sets (a 2+2 build) give about **double** the raw stats of one 4-piece |
| 4-piece | Small stats plus the set's **signature effect** | The signature effect is the only thing a 2+2 build can't get |

That's the mix-and-match balance: **2+2 wins on stats, 4-piece wins on a unique mechanic.** A third path is "best piece in each slot" from 3-4 different sets plus the **Correlation Charm** (+2 to every stat if your armor comes from 3+ sets). It teaches that diversification works when holdings don't move together.

| Set | World | Lesson | 2-piece | 4-piece signature |
|---|---|---|---|---|
| Rookie Threads (free) | 1 | Showing up is step one | hint 1 (Hoot crosses out a wrong answer once per fight) | +1 focus |
| Penny's Rainy-Day Gear | 1 | Emergency fund | +2 defense | **second_chance**: one wrong answer per fight costs nothing |
| Snowball Knight | 1 | Compounding | +2 power | **streak_damage 8%** per correct answer in a row (5 stacks); a wrong answer melts it |
| Budget Ranger | 1 | 50/30/20, pay yourself first | +2 focus | **dodge 10% + dash 20% faster**: every dollar has a job, surprises find nothing to hit |
| Basket Weaver | 1 | Diversification | +1 defense, +1 luck | **damage_reduction 10%** from every source (each piece also has 2-3%) |
| Value Vanguard | 2 | Margin of safety, Mr. Market | +3 defense | **discount_window 30%**: 3 s of bonus damage after the boss's big attack (buy the panic) |
| Stop-Loss Sentinel | 2 | Stops, position sizing | +3 focus | **damage_cap 20%**: no single hit takes more than 20% of max HP (it caps each loss but doesn't prevent a losing streak) |
| Day Trader | 2 | Speed amplifies both ways; fees | +2 power, +1 luck, **-1 defense** | **crit_damage 40%, but hp_cost 5%** every fight. Every piece also has its own hp_cost (fees) |
| Covered Caller | 3 | Premium income, capped upside | +4 focus | **shield_on_correct 4 + steady**: reliable income, never a crit |
| Protective Put | 3 | Insurance, premiums, expiry | +4 defense | **hp_cost 5% + damage_cap 10% for 30 s**: pay the premium, get coverage, then it expires |
| Micro Manager | 4 | Micros, sizing, staying in the game | +5 focus | **last_stand**: once per fight a knockout leaves you at 1 HP |
| Hedger's Harness | 4 | Hedging cuts risk and reward | +5 defense | **damage_reduction 30% and damage_dealt_mod -15%** |

**Day Trader set and safety.** The set exists so players *feel* the tradeoff, not to glamorize day trading. Its expected value is roughly even with the safer sets: more crits, but it starts every fight about 13% down on HP if fully worn (4 pieces x 2% + 5%). The lesson text says plainly that most day traders lose money over time. It is never required, and no quest rewards wearing it.

### 2.4 Effect types

Items and set bonuses carry an `effects` array of `{ type, value, text }`, with an optional `duration` in seconds. The JSON's `effectTypes` object defines all 30 types: the 14 the owner listed plus 16 the lessons needed (`damage_reduction`, `damage_cap`, `buffer_hp`, `telegraph`, `start_charge`, `periodic_double`, `dash_cooldown`, `mix_bonus`, `charge_hold`, `hp_cost`, `damage_dealt_mod`, `discount_window`, `review_queue`, `damage_over_time`, `last_stand`, `buff_extend`).

Rules the validator enforces:
- Within the same world and slot, no two items share an effect type, and no two have identical stat spreads. That makes every pick a real choice.
- Every shop item has at least one effect. Only the free starter pieces have none (the starter set's 2-piece hint shows new players how effects work).
- `coin_bonus` across the whole catalogue totals 15% (tunic 5, feather 5, leggings 5), under the 25% cap.
- `xp_bonus` applies to battle XP only, never lesson XP.
- **`low_hp_power` is defined but deliberately unused.** "Hit harder when you're nearly wiped out" is the game version of revenge trading. If a future item needs it, it needs a safety review.

Stacking: same-type effects add up. Once-per-fight effects (`second_chance`, `hint`, `last_stand`, `buff_extend`) give one use per source.

### 2.5 Catalogue summary

Full data is in the JSON. Counts and price bands:

| World | Sets | Shop items | Shop total (coins) | Price bands (common / uncommon / rare) | Free items |
|---|---|---|---|---|---|
| 1 | Rookie (free), Rainy-Day, Snowball Knight, Budget Ranger, Basket Weaver | 22 | 2,050 | 60-70 / 90-150 / 180 | 4 starter pieces, starter weapon, 2 quest items, 1 boss drop, Lucky Penny (7-day streak) |
| 2 | Value Vanguard, Stop-Loss Sentinel, Day Trader | 15 | 2,980 | 150 / 200-240 / 300 | 1 quest item, 1 boss drop |
| 3 | Covered Caller, Protective Put | 10 | 3,280 | 250 / 330-340 / 420-450 | 1 quest item, 1 boss drop |
| 4 | Micro Manager, Hedger's Harness | 10 | 4,630 | 350 / 450-460 / 600-620 | 1 quest item, 1 boss drop, Grand Champion Crest |

Totals: 10 weapons, 6 offhands, 10 trinkets, 48 armor pieces (12 sets).

**Unlock sources.** Strings in the JSON `unlock` field:
- `shop (World N)`: buyable once World N is open (World 1 is open from signup). Some add `after finishing '<lesson>'`, so you can only buy a concept's item once you've learned it.
- `quest: <id>`: a fixed reward for a specific story quest (section 6).
- `boss drop: <id>`: guaranteed on the first win against that boss. No random loot.
- `achievement: <id>`: one of the existing 20 badges (streak_7, all_units).
- `starter`: granted at signup.

### 2.6 Example builds (World 1)

| Build | Pieces | Total stats | What it plays like |
|---|---|---|---|
| Rookie (day 1) | Rookie x4, Trusty Calculator | P2 D1 F3 L1, hint x1 | Fine for practice fights, struggles against Inflato's regen |
| Full Snowball | Snowball x4, Compound Crossbow, Patience Charm | P8 D4 F9 L1, streak 8% + 5% | Huge damage if you keep answering correctly; one miss resets it. Rewards knowing the material |
| Full Rainy-Day | Rainy-Day x4, Piggy-Bank Buckler, Fee-Free Feather | P-1 D13 F4 L2, second chance, 8 buffer, 25% hit cap | Hard to kill, slow to kill with. Forgiving for nervous players |
| 2+2 mix | Rainy-Day hood + chest, Snowball greaves + sabatons, Budget Blade, Correlation Charm (not active: only 2 sets) | P6 D9 F7 L2 (both 2-piece bonuses included) | Solid all-rounder |
| Diversified | One piece each from Rainy-Day, Snowball, Budget Ranger and Basket Weaver, plus Correlation Charm | Best single pieces + 2 to every stat | No set signature, strongest raw stats. The diversification lesson in gear form |

### 2.7 What items never do

- Never sold for real money, never in a randomized paid box.
- Never answer questions for you. `hint` removes at most one wrong option per source per fight. Nothing reveals the right answer.
- Never gate a real financial tool. Stop orders, limit orders and micros are always free on the desks. Items are game advantages that *teach* the tool.
- Never boost lesson XP or let you skip a lesson or exam.

### 2.8 Consumables and cosmetics (outside items-v1.json)

| Kind | Examples | Price | Note |
|---|---|---|---|
| Consumables | Streak Freeze (existing, 50), Hedge Potion (W3: one fight of damage_cap 15, 60 coins), Margin Top-Up (W4: +15 buffer HP for one fight, 80 coins) | 50-80 | The steady coin sink. Max 3 per fight |
| Cosmetics | Existing avatars (Hoot 100, Grizz 150, Bolt 250), dyes that swap a set's palette, desk and room decor, emotes, titles | 50-600, prestige 1,500-3,000 | No stats. The main sink for players who own every item |

---

## 3. Currencies and economy

### 3.1 Two currencies, one-way bridge

| | Coins | Cash (Net Worth) |
|---|---|---|
| Earned from | Lessons, quests, exams, boss wins, achievements, streaks, net-worth milestones | Paychecks, quest cash, desk contracts, interest, investment and desk returns |
| Spent on | Gear, consumables, cosmetics, Streak Freezes | Life costs (automatic), the "wants" budget, funding new desks. Never gear |
| Shown as | The coin counter (exists today) | The Net Worth hub, a new screen |
| Inflation control | Faucets capped by content and quest limits; consumables and cosmetics as sinks | It's a score, so inflation is harmless. Leaderboards use % growth or risk-adjusted rank, never raw dollars |

**Why not let cash buy gear?** A lucky futures run would let someone buy past World 1 without learning anything, and the game would reward gambling. One-way bridge: net-worth milestones pay a capped, one-time amount of coins ($1k: 20, $5k: 40, $10k: 60, $25k: 80, $50k: 100, $100k: 150, $250k: 200; 650 coins in total).

**Alternatives considered:** (a) one currency, so cash buys gear: simplest, but it fails the reckless-trading test. (b) Cash converts to coins at a rate: lets grinders spiral and adds a pseudo-exchange with no lesson in it. Recommendation: two currencies plus the milestone bridge.

### 3.2 Recommended coin payouts

| Source | Today | Recommended | Why |
|---|---|---|---|
| Lesson first pass | 5 (+5 for 100%) | **10** (+5 for 100%) | Learning should be the best-paying thing you can do |
| Lesson retake | +5 only if you newly hit 100% | unchanged | |
| Unit exam pass | 50 | **150** | It's the gate to a new world |
| First boss win | (none) | **100** + a guaranteed epic item | |
| Daily quests (3 per day) | (none) | W1 15/15/20 → W4 30/30/40 | Main recurring faucet, capped |
| Weekly quests (3 per week) | (none) | W1 60/80/100 → W4 120/160/200 | |
| Story quests | (none) | 400 / 500 / 450 / 450 per world, spread across that world's lessons | Tied to lesson progress |
| Achievements, streak bonuses | 10-200, xp/3 | unchanged | |
| Net-worth milestones | (none) | 650 total, one-time | The bridge |

### 3.3 Simulation results

Player types in `economy_sim.mjs`:

| Type | Plays | Lessons per play day | Quests | Perfect-score rate |
|---|---|---|---|---|
| Casual | 4 days a week | 1 | 1 daily, 1 weekly per week | 30% |
| Regular | 6 days a week | 1-2 (alternating) | 2 daily, 2 weekly per week | 50% |
| Grinder | 7 days a week | 5 | 3 daily, 3 weekly per week | 75% |

Key kit per world (sim shopping list): weapon + 3 armor pieces + trinket = W1 **470**, W2 **1,010**, W3 **1,580**, W4 **2,160** coins.

**Today's payouts (no quests), 60 days**

| Player | W1 kit affordable | Coins earned by day 7 | Coins earned by day 60 |
|---|---|---|---|
| Casual | never | 50 | 365 |
| Regular | day 34 | 110 | 1,083 |
| Grinder | day 9 | 498 | 1,956 |

Today's coins can't support any meaningful item game. That's why the payouts need raising.

**Recommended payouts, 90 days**

| Player | W2 opens | W3 opens | W4 opens | W1 kit | W2 kit | W3 kit | W4 kit | Earned by day 7 | Earned by day 90 | Shop items owned by day 90 |
|---|---|---|---|---|---|---|---|---|---|---|
| Casual | day 65 | - | - | day 15 | day 85 | - | - | 233 | 3,356 | 18% |
| Regular | day 30 | day 60 | day 76 | **day 6** | day 36 | day 72 | day 88 | 572 | 10,561 | 62% |
| Grinder | day 9 | day 18 | day 23 | day 2 | day 11 | day 23 | day 28 | 1,641 | 18,901 | 91% |

Coins per calendar day while in each world (recurring only):

| Player | World 1 | World 2 | World 3 | World 4 |
|---|---|---|---|---|
| Casual | 30 | 38 | 49 | 57 |
| Regular | 76 | 95 | 122 | 144 |
| Grinder | 207 | 252 | 323 | 378 |

**Reading the results**
- Target met: a regular player affords the W1 key kit on **day 6** and each later kit about 6-12 days after that world opens.
- Nobody buys past learning. Shop tiers open only when the exam is passed, and the grinder's speed comes from finishing lessons, not from coins.
- Casual players spend 2+ months in World 1 (37 lessons at about 4 a week). That's why World 1 needs many income methods and quests (sections 4 and 6).
- **Inflation flag:** grinders own about 91% of all shop items by day 90 and still earn about 380 coins a day. They need endless sinks: cosmetics, prestige titles, palette dyes and consumables. Recommendation: once the course is finished, daily quest coins drop 50% and a "Mastery" quest line pays cosmetics instead of coins.
- Coin balances stay low (under 2,100 at peak) because players spend as they go, so nobody is sitting on a hoard that devalues new items.

---

## 4. The Net Worth hub

One screen that shows your whole in-game financial life. Each income method is an **account card**.

| Area | Shows |
|---|---|
| Header | Net worth today, change this game month, a sparkline, and "Future You": a projection of today's habits over 30 years at the account's real rate (a teaching view, not a promise) |
| Payday banner | This month's paycheck: gross, withholding, net, and the 50/30/20 split you chose |
| Account cards | Balance, this month's change, rate or return, and one action button (deposit, rebalance, open desk) |
| Allocation donut | Share of net worth per account; a warning if any single desk is over 25% of net worth |
| Life events log | "Car repair: -$660, paid from Emergency Fund" or "...put on a card at 24% APR" |

**The Life Clock.** Each day you visit = one game month for life accounts (paycheck, savings interest, index fund, bonds). Rates are **real annual rates divided by 12**. The clock doesn't move without you, so absence never costs money.

**Desk sessions** (swing, options, futures) are 5-10 minute **historical replay** sessions: one session covers about a month of masked market history. That puts desks on the same clock as everything else. The existing $50k live Practice Desk and Bolt remain as an unranked sandbox outside net worth.

**Net worth by player type** (sim, median, 2,000 runs):

| Day | Casual | Regular | Grinder |
|---|---|---|---|
| 7 | $1,173 | $1,864 | $3,228 |
| 30 | $2,866 | $8,431 | $80,114 |
| 60 | $5,034 | $31,774 | $231,647 |
| 90 | $15,647 | $98,853 | $411,091 |

**Where a regular player's money comes from** (average per game month while in each world):

| Source | World 1 | World 2 | World 3 | World 4 |
|---|---|---|---|---|
| Paycheck (net) | $828 | $1,760 | $2,975 | $4,100 |
| Quest cash | $60 | $117 | $292 | $417 |
| Desk contracts | $0 | $300 | $850 | $2,000 |
| Interest (savings, T-bills) | $5 | $14 | $27 | $43 |
| Index fund | $9 | $50 | $111 | $239 |
| Swing desk P&L | - | $10 | $16 | $26 |
| Options desk P&L | - | - | $36 | $58 |
| Futures desk P&L | - | - | - | $30 |
| Life events | -$50 | -$106 | -$177 | -$241 |

**How older methods stay useful but get relatively smaller.** They are never nerfed. Swing contracts still pay $300 in World 4, while futures contracts pay $1,500, so the older method's share falls naturally. Savings and the index keep compounding on a bigger base every month. The honest lesson in the numbers: early on, **income dwarfs investment returns**. Your paycheck matters far more than your interest rate at the start, and returns only take over after years. "Future You" shows that crossover.

**Honesty note.** In the sim, trading desks earn about what the market does plus or minus skill. They do **not** out-earn the index on average. More money in later worlds comes from **career and contracts**: skills-for-hire you unlock by learning, and pay for following the process (a stop set, size under 2%, a journal entry), never for P&L.

---

## 5. World-by-world unlock map

| | World 1: Money Moves | World 2: Stock Smarts | World 3: Options Arena | World 4: Futures Frontier |
|---|---|---|---|---|
| Area | Penny's Town: bank, Gig Board, Hoot's Library, Grizz's Scam Alley | Chip's Exchange: trading floor, research tower, Mr. Market's casino-looking lobby (labeled a trap) | Hoot's Observatory: clocks and hourglasses everywhere | The Pits: muddy old Chicago trading floor, neon micro terminals |
| Career (paycheck) | Gig Board side hustle, $900/mo gross | Research Intern, $2,000 | Junior Analyst, $3,500 | Desk Associate, $5,000 |
| New income methods | Gig Board shifts; Budget Board; high-yield savings (4% APY); Index Autopilot (DCA); T-bill / CD ladder (after the passive-income chapter); quests | Value Picks portfolio (replayed fundamentals); Swing Desk (replay sessions + contracts, $300); Dividend Garden; Bolt Autopilot on your own capital | Covered Call / Wheel Desk (contracts $700); Protective Put insurance on your stock portfolio; Spreads desk | Micro Futures Desk: MES / MNQ / MYM, contracts $1,500; Hedge Contracts (hedge an NPC portfolio with ES or MES); Prop Evaluation Challenge (pass the rules to get a sim funded account) |
| Unlock grant | $500 starter cash | $2,500 desk seed | $5,000 desk seed | $8,000 risk capital ("only what you can afford to lose") |
| Shop | W1 sets, weapons, trinkets | W2 tier | W3 tier | W4 tier |
| Boss | **Inflato the Slow Leak** | **Mr. Market** | **The Theta Reaper** | **The Margin Caller** |
| Boss drop | Penny's Piggy Mallet | Margin-of-Safety Plate | Policyholder Plate | Hedger's Vest |

**World 1 money-makers in detail** (they need to carry casual players for about two months):

| Method | How it plays (1-3 minutes) | Pays | Lesson |
|---|---|---|---|
| Gig Board | Pick a gig (dog walking, tutoring, reselling). A small decision task: price the job after costs, read a tip, avoid a scammy client | Your paycheck, plus up to $100 in tips for good decisions | Earned income, costs, pricing |
| Budget Board | Split each paycheck into needs / wants / savings. Within 5% of 50/30/20 earns a daily quest | Coins; the "wants" money buys cash cosmetics (desk decor) | Budgeting with fun built in |
| High-yield savings | Holds your emergency fund. Fill it to 3 months of needs for the Emergency Fund Chestplate quest | 4% APY / 12 per game month | Emergency funds, APY |
| Index Autopilot | Set a fixed amount per payday. Pick a fund (fee 0.03% vs 0.50% vs "Wall St. Deluxe 1.2%") | Simulated market returns (fat-tailed, includes crashes) | DCA, fees, staying invested |
| T-bill / CD Ladder | Lock rungs for 3/6/12 game months at slightly higher rates | 4.3% APY / 12 | Laddering, liquidity vs yield |
| Life Happens | About 8% of months bring a surprise bill of 1.5x monthly needs. Paid from savings, otherwise put on a 24% APR card | Negative | Why emergency funds exist |

---

## 6. Quests

| Type | Count | Reset | Reward | Teaches by |
|---|---|---|---|---|
| Daily | 3 offered, from the current world's pool | Midnight in the user's timezone (same as streaks) | 15-40 coins, sometimes cash | Retrieval practice, applying one concept |
| Weekly | 3 | Monday | 60-200 coins | Habits over several days |
| Story | 8-12 per world, character-led, in order | One-time | Coins + cash; some give a fixed item | Lesson → do it in the game |
| World | Exploration and mastery goals | One-time | Coins, titles, cosmetics | Systems knowledge |

No quest rewards trade volume, speed, leverage or P&L. Desk quests reward process.

### World 1 quests (18)

| ID | Type | Name | Task | Reward |
|---|---|---|---|---|
| q-w1-coffee-math | Daily | Coffee Math | 3 quick inflation calculations with Hoot | 15 coins |
| q-w1-payday-split | Daily | Payday Split | Split this paycheck within 5% of 50/30/20 | 15 coins |
| q-w1-spot-the-scam | Daily | Spot the Scam | Grizz shows 3 offers; flag the scam and name its red flag | 15 coins |
| q-w1-rate-hunter | Daily | Rate Hunter | Pick the best account from 4 (APR vs APY trap) | 15 coins |
| q-w1-rule-of-72-sprint | Daily | Rule-of-72 Sprint | 5 doubling-time estimates in 60 seconds | 20 coins |
| q-w1-review-run | Daily | Review Run | 5 spaced-review questions from lessons 3+ days old | 20 coins |
| q-w1-gig-shift | Daily | Gig Shift | Finish today's Gig Board decision task | 15 coins + tips |
| q-w1-five-day-learner | Weekly | Five-Day Learner | Pass lessons on 5 different days this week | 100 coins |
| q-w1-fee-detective | Weekly | Fee Detective | Compare 3 funds; move Autopilot to one under 0.10% | 60 coins |
| q-w1-wants-with-a-plan | Weekly | Wants With a Plan | Buy one cosmetic using only your "wants" budget | 60 coins |
| q-w1-pennys-leak | Story | Penny's Leak | Finish the inflation lesson, then open your high-yield savings | 30 coins, $200 |
| q-w1-first-paycheck | Story | First Paycheck | Complete a gig and answer 3 pay-stub questions (gross, net, FICA) | 30 coins, $150 |
| q-w1-card-trap | Story | The Card Trap | Pay off a $1,000 card balance in the payoff sim; beat the minimum-payment plan | 40 coins |
| q-w1-three-months-strong | Story | Three Months Strong | Emergency fund reaches 3 months of needs | **Emergency Fund Chestplate** |
| q-w1-autopilot-engaged | Story | Autopilot Engaged | Set up Index Autopilot and keep it running through 6 paydays | **Head-Start Sabatons** |
| q-w1-ladder-up | Story | Ladder Up | Build a 3-rung T-bill ladder | 50 coins, $300 |
| q-w1-referees-whistle | Story | The Referee's Whistle | Spot 3 rule breaks (PDT, wash sale, insider tip) in a scene | 50 coins |
| q-w1-grizz-gauntlet | Story | Grizz's Gauntlet | Survive 5 scam pitches in a row; opens the boss gate | **Scam Radar Ring** |
| q-w1-crash-drill | World | Crash Drill | When your index fund drops 10%+ in a game month, either hold or rebalance (both count; selling everything doesn't) | 80 coins, title "Steady Hands" |
| q-w1-map-the-town | World | Map the Town | Visit the bank, Gig Board, library and Scam Alley | 20 coins |

### Later worlds (examples)

| ID | World | Name | Task | Reward |
|---|---|---|---|---|
| q-w2-moat-or-not | 2 | Moat or Not | Rate 3 companies' moats from their real SEC EDGAR numbers | 25 coins |
| q-w2-journal-ten | 2 | Ten Journaled Trades | Journal 10 swing-desk trades: entry reason, stop, size, outcome | **Trailing-Stop Treads** |
| q-w2-two-percent | 2 | The 2% Rule | Complete 5 desk contracts risking 2% or less each | 300 coins, $600 |
| q-w2-mr-market-mood | 2 | Ignore Mr. Market | Decline 3 euphoric "buy now" prices above your value estimate | 120 coins |
| q-w3-the-wheel | 3 | The Wheel | Complete one full cycle: cash-secured put, assignment, covered call, called away | **Wheel Boots** |
| q-w3-iv-crush | 3 | After the Earnings | Predict what happens to a call's price after earnings when IV collapses | 40 coins |
| q-w4-right-size | 4 | Right-Size It | Size 5 MES trades so each risks 1% or less of the desk | **Right-Size Boots** |
| q-w4-roll-day | 4 | Roll Day | Roll an MES position from the expiring quarter to the next before roll week ends | 160 coins |
| q-w4-farmer-jo | 4 | Hedge Farmer Jo's Portfolio | Hedge an NPC's $250k stock portfolio with the right number of MES / ES contracts | $1,500 contract |

**Desk contract rule (all worlds):** paid when you follow the stated process (stop set, size within limit, journal note). Profitable and losing trades are paid the same. Breaking the risk rule pays zero.

---

## 7. Boss battles (concept)

Per the owner: no market-scenario phase. Knowledge powers your attacks, skill decides whether they land, and items deal and block the damage.

### 7.1 The idea in one paragraph

A top-down pixel arena. You move, dash, block (with an offhand) and aim. Your weapon starts empty. A **question card** slides in; while it's open, time slows to 20% ("Focus Time") and you have about 12 seconds to answer (plus `time_bonus` on hard questions). A **correct answer adds charge pips** to your weapon. An empty weapon only does chip damage, so **you can't win on reflexes alone**. A **wrong answer** costs some charge and makes the boss's next attack stronger. Charged attacks still have to **land**: melee needs positioning, the crossbow and bow need aim, and the boss dodges and telegraphs. The boss's attacks have to be dodged, blocked or parried with timing. Questions come from the same unit question pool as the exam.

### 7.2 Three ways to mix questions with action

| Option | How questions appear | Pros | Cons |
|---|---|---|---|
| A. Focus Time (recommended) | A card overlay with slowed time, every 10-15 seconds or when you press "Charge" | Clean separation of thinking and action; works on mobile; easy to make accessible | The action pauses briefly |
| B. Answer orbs | 3-4 answer orbs drop into the arena; run into the right one while dodging | Very game-like, high skill | Rewards reflexes over reading; hard for screen readers and slow readers; motion-sickness risk |
| C. Turn-based stances | Alternate answer phase and action phase (Slay-the-Spire-like) | Simplest to build | Not the "Minecraft PvP" feel the owner wants |

**Recommendation:** A, with B as an optional "Arcade" challenge mode later. Accessibility: an **Assist mode** (slower boss, bigger telegraphs, no time pressure on questions) that still awards the exam pass but gives a separate trophy, so learning progress never depends on reflexes.

### 7.3 Formulas (starting values, tune in playtests)

| Quantity | Formula |
|---|---|
| Player HP | 100 + 10 per world cleared |
| Charge | Each correct answer = 1 pip (+1 bonus pip every 4th correct per 4 focus). Weapon holds 3 pips |
| Charged hit | pips x (30 + 3 x power) x effect multipliers (streak, first_strike, crit) |
| Chip hit (no charge) | 1 damage |
| Boss hit on you | base x (1 + 0.2 if you answered the last question wrong) x (1 - min(0.6, 0.03 x defense)) x (1 - damage_reduction), then damage_cap, buffer and shields |
| Wrong answer | -1 pip, boss's next attack +20% (`second_chance` cancels both once) |
| Missed charged attack | The pips are spent. Skill matters |

### 7.4 The four bosses

| Boss | HP | Gimmick that teaches | Signature attacks (dodge or block) |
|---|---|---|---|
| **Inflato the Slow Leak** (W1) | 450 | Regenerates 1 HP/s outside Focus Time. Chip damage can't outpace it: you can't out-swing inflation, you have to out-learn it | Price Surge (expanding ring, dash through it), Rate-Hike Hail (falling projectiles), Lifestyle Creep (a slow homing blob that grows if ignored), Shrinkflation (a grab that cuts your max HP by 5 unless parried) |
| **Mr. Market** (W2) | 700 | Mood swings: Euphoric (fast, reckless attacks, low defense) and Despair (slow, heavy attacks, then a long recovery: the Value Vanguard discount window) | Hype Rush, Panic Sell-off shockwave, FOMO Lure (a fake opening; the Scam Radar Ring flags it) |
| **The Theta Reaper** (W3) | 900 | A countdown hourglass: his damage speeds up as the clock runs down (time decay). Shields and buffs you bring melt faster | Decay Scythe, IV Crush (wipes your shields after his "earnings" phase), Pin Risk |
| **The Margin Caller** (W4) | 1,100 | Daily settlement: every 15 seconds he tallies damage you took and "calls" for more if your HP is under 25% (a margin call). Micro Manager and buffers counter him | Leverage Slam (10x hit, very telegraphed), Gap Open (teleport strike at the start of each "session"), Liquidation Lock |

### 7.5 Illustrative W1 fight (numbers to show the math, not final)

| | Starter player | Geared player (Snowball 4pc, Compound Crossbow, Patience Charm) |
|---|---|---|
| Power | 2 | 8 (5 from items + 3 from the set bonuses) |
| Damage per pip | 36 | 54, plus streak +8% per correct (crossbow adds +5%) |
| Correct answers needed vs 450 HP + about 90 HP of regen over 90 s | about 15 | about 7-8 if all hits land; 9-10 at a realistic 80% hit rate |
| Typical result | A slow grind. Needs high accuracy and good dodging | Wins in about 2 minutes if the player keeps the streak going |

Turn of play (about 15 seconds): question appears → answer correctly (+1 pip, streak 3) → Inflato winds up Price Surge (visible 0.2 s earlier with the Rainy-Day Hood) → dash through the ring → line up the crossbow, hold to aim, release → 3 pips x 54 x 1.39 (streak 3: set +24%, crossbow +15%) = 225 damage. If the bolt misses, the pips are gone and Inflato regenerates.

**Rewards:** first win: 100 coins, the guaranteed epic, a trophy, battle XP. Repeat wins: 20 coins (capped once a day), so farming bosses isn't a strategy. Losing costs nothing but time.

**Gate:** the existing unit exam (70% of 15) stays the official unlock. The boss fight can serve as the exam (accuracy is tracked as the exam score) or follow it. Either way, a lost fight with 70%+ accuracy still passes the exam and opens the next world.

---

## 8. Futures (and options) in the game

**Owner decision:** simulate from index ETFs. Offer only the three index families, standard and micro.

| Contract | Synthetic from | Index ≈ ETF x | Multiplier | Tick | Tick value |
|---|---|---|---|---|---|
| ES (E-mini S&P 500) | SPY | about 10 (calibrated) | $50 per point | 0.25 | $12.50 |
| MES (Micro E-mini S&P) | SPY | about 10 | $5 | 0.25 | $1.25 |
| NQ (E-mini Nasdaq-100) | QQQ | about 41 (calibrated) | $20 | 0.25 | $5.00 |
| MNQ (Micro Nasdaq-100) | QQQ | about 41 | $2 | 0.25 | $0.50 |
| YM (E-mini Dow) | DIA | about 100 | $5 | 1.00 | $5.00 |
| MYM (Micro Dow) | DIA | about 100 | $0.50 | 1.00 | $0.50 |

**Pricing:** synthetic index level S = ETF price x ratio. Fair value F = S x (1 + r - q)^t, where r = 3-month T-bill yield (US Treasury, public), q = the ETF's trailing dividend yield, and t = years to expiry. Quarterly expiries (H, M, U, Z, third Friday) with a roll week 8 days before. Margins are game constants roughly matching real exchange levels, shown with "TradeIQ sim margin".

**The ratio:** we don't use licensed index values. Store a fixed ratio per ETF and recalibrate it occasionally from the ETF's published NAV relationship. Always label the price **"TradeIQ synthetic MES, tracks SPY"**, never "ES price".

| Mode | Data | Why |
|---|---|---|
| Free-play futures desk (replay sessions) | Historical ETF daily or hourly bars → synthetic futures, dates masked | Same clock as the rest of the game; no live licence needed |
| Live Practice (optional, later) | Delayed ETF quotes from Alpaca (once consent arrives) → synthetic | Lets learners watch "now", unranked |
| Boss and Arena modes | No prices at all (combat) | |
| Leagues and PvP | Historical replay, same window and seed for everyone | Fair and unpredictable |

**Honest limits to show in the UI:**
- No overnight session. ETFs trade about 4am-8pm ET at most, so the 23-hour futures market can't be mirrored. Replays skip it, and live mode shows "synthetic market closed".
- Basis is modeled, not observed. Real futures drift from fair value; ours don't.
- Dividends and rates are approximations, so prices are close to real futures, not equal.
- No real order book or liquidity. Fills use the last price plus a fixed slippage of 1 tick.

**Options (World 3):** synthetic options on SPY / QQQ / DIA priced with Black-Scholes, using 30-day realized volatility plus an event bump before earnings-style "events" in replays (to teach IV crush). No volatility smile. The same labeling and limits apply.

---

## 9. Player-vs-player (later phase)

| Format | How it works | Fairness |
|---|---|---|
| Replay Duel | Two players trade the same masked historical window (e.g. 20 sessions of MES) with identical capital | Same data, unknown dates; ranked by risk-adjusted return (return / max drawdown) with a rule-break penalty |
| Weekly League | Groups of 20 players by level; everyone plays the same 5 replay windows | Seeds fixed per week; no carry-over of capital |
| Arena Duel | The boss combat engine, player vs player; both get the same questions at the same time | Gear normalized to world tier (stats scaled) so new players aren't crushed |

**Rules:** no wagering coins or items on any match (that's gambling). Rewards are cosmetics and titles. Leaderboards never show raw net worth, only % or risk-adjusted rank. Friends-only matches by default for under-18s.

---

## 10. Safety review

| System | Firm rule check | Specific safeguard |
|---|---|---|
| Coins and items | Earned only; no real-money purchase path exists | No payment integration, ever. Paid randomness: none. Boss drops are guaranteed, not random |
| Cash / net worth | Fully simulated | No exchange to coins except capped one-time milestones; leaderboards in % only |
| Desk contracts | Reward process, not P&L | Paid identically for winning and losing trades that follow the rules; zero pay for breaking the risk limit |
| Futures desk | Leverage exists, as in reality | No bonus for size or leverage; Micro Manager rewards sizing down; the allocation donut warns when one desk is over 25% |
| Day Trader set | Could glamorize day trading | Every piece costs HP (fees); its lesson says most day traders lose; never required |
| `low_hp_power` effect | Revenge-trading pattern | Defined but unused; needs review to ever use |
| Quests | No volume or FOMO | No "make N trades" quests; daily caps; missed dailies don't stack or punish |
| Life Clock | No punishing absence | Clock only moves when you play |
| Bosses | Skill shouldn't block learning | Exam accuracy is the gate; Assist mode exists |
| PvP | Not gambling | No wagers; friends-only default for minors |
| **Existing app** | Flag | The `trades_25` "Desk Jockey" badge rewards trade count. Suggest changing it to "Journal 25 simulated trades" |

---

## 11. Engineering breakdown

### New tables

| Table | Key columns | Notes |
|---|---|---|
| `coin_events` | user_id, source, ref, amount (+/-), created_at | Coin ledger, mirroring `xp_events`; `users.coins` stays the cached balance |
| `user_items` | user_id, item_id, acquired_at, source | Catalogue loaded from `items-v1.json` at boot (no DB table needed for the catalogue) |
| `user_loadout` | user_id, slot, item_id | One row per slot; validate slot match and ownership server-side |
| `user_consumables` | user_id, consumable_id, qty | Streak freezes stay on `users` for now |
| `quests_user` | user_id, quest_id, period_key, progress, completed_at, claimed_at | period_key = date for dailies, ISO week for weeklies, 'once' for story |
| `nw_accounts` | user_id, kind (hysa, index, ladder, swing, options, futures, debt), balance, params JSON | |
| `nw_events` | user_id, game_month, kind, account, amount, note | The hub's log, plus audit |
| `life_clock` | user_id, game_month, last_tick_day | One tick per visit-day (user timezone) |
| `boss_attempts` | user_id, boss_id, started_at, result, accuracy, damage_log JSON, assist | Server checks question answers; the client reports combat outcome (see risk below) |
| `replay_windows` | id, symbol, start_date, end_date, seed | Masked historical windows shared by desks and leagues |

### Endpoints (sketch)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/items/catalog` | Serves items-v1.json (cacheable) |
| GET / PUT | `/api/me/loadout` | Read / equip (server validates ownership, slot and world) |
| POST | `/api/shop/buy` `{ itemId }` | Row-locked coin spend, world and lesson gates, writes `coin_events` + `user_items` |
| GET | `/api/quests` / POST `/api/quests/:id/claim` | Board plus claim; server recomputes completion |
| GET | `/api/networth` / POST `/api/networth/payday` `{ split }` | Hub plus the daily tick |
| POST | `/api/networth/desk/:kind/session` | Start or finish a replay session |
| POST | `/api/boss/:id/start` / `/answer` / `/finish` | Signed question tokens like today's exam tokens |

**Combat anti-cheat:** real-time combat runs on the client, so the outcome is forgeable. Mitigation: the server owns questions, answers and accuracy (the exam gate). The client-reported fight result only affects boss trophies and loot, which are capped and low-value. Server sanity checks: minimum fight duration, damage consistent with the number of correct answers and the loadout.

### Screens

1. **Avatar and inventory** (being built now): paper-doll with 7 slots, set-bonus tracker (2/4 pips per set), stat panel with deltas when hovering an item, effect list.
2. **Shop**: tabs per world, locked items show "Finish lesson X" or "Beat World N".
3. **Quest board**: daily / weekly / story columns.
4. **Net Worth hub**: header, payday split, account cards, donut, log, Future You.
5. **Desk replay session**: chart, order ticket (market / limit / stop free for all), contract checklist.
6. **Boss arena**.

### Phased build plan

| Phase | Scope | Depends on |
|---|---|---|
| **1. MVP (2-3 weeks)** | Items catalogue + inventory + loadout + shop + `coin_events`; raise lesson and exam coins; daily and weekly quests (W1 pool); stats shown but used only as a "power score" | items-v1.json |
| 2 | Net Worth hub with Life Clock: paycheck, Budget Board, HYSA, Index Autopilot, ladder, life events, story quests for W1, milestone bridge | Phase 1 |
| 3 | Boss arena prototype (Inflato) with Focus Time, 5-6 effect types implemented first (streak_damage, second_chance, shield_on_correct, damage_reduction, dodge, hint), Assist mode | Phase 1 |
| 4 | W2 desks as replay sessions (needs licensed historical bars or simulated tickers), contracts, Mr. Market | Data decision |
| 5 | W3 synthetic options, W4 synthetic MES / MNQ / MYM, remaining bosses and effects | Phase 4 |
| 6 | Leagues and PvP | Phase 5 |

---

## 12. Open questions for the owner

1. **Coin payout raise:** OK to raise lesson coins 5 → 10 and exam coins 50 → 150, and add quests? Existing players keep their balances; should they get a one-time back-pay for lessons already done (about 5 coins per lesson)?
2. **Boss = exam?** Should the boss fight *be* the unit exam (accuracy tracked inside the fight), or should the exam stay a separate screen that unlocks the fight?
3. **Question input in combat:** happy with Focus Time (slowed time while answering) as the default, with answer orbs as a later Arcade mode?
4. **Historical price data for replays:** which licensed source for historical ETF and stock bars (Alpaca once consent arrives, Marketstack ~$10/mo, or fully simulated "fictional tickers" for the MVP)?
5. **Life Clock speed:** is 1 visit-day = 1 game month right? It makes savings interest feel tiny in World 1 (about $5 a month). That's honest, and "Future You" shows the long run, but it could feel slow.
6. **Day Trader set:** comfortable shipping it with its HP-cost drawbacks, or leave it out for the under-18 audience?
7. **Desk Jockey badge:** OK to change `trades_25` from "place 25 trades" to "journal 25 trades"?
8. **Cosmetics budget:** how many cosmetic items can art produce per world? The sim assumes about 1,200-2,500 coins' worth per world to absorb grinder coins.
9. **Post-course economy:** after all four worlds, halve daily quest coins and switch to a cosmetic Mastery track. Agree?
10. **PvP for minors:** friends-only by default for under-18s. Do we know users' ages (signup doesn't collect them today)?
