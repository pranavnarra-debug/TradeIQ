/* ============================================================
   TradeIQ — lessons.js
   20-lesson curriculum + lesson UI (sidebar nav, content, quiz)
   ============================================================ */

const LESSONS = [
  {
    id: 1,
    title: 'How Stock Markets Work',
    week: 1,
    day: 1,
    readTime: '6 min read',
    objectives: [
      'Understand what a stock represents as an ownership stake',
      'Learn how stock exchanges (NYSE, NASDAQ) match buyers and sellers',
      'Know what market hours are and how pre/post-market differs',
    ],
    content: `
      <h3>What Is a Stock?</h3>
      <p>A share of stock is a fractional ownership claim on a company. When you buy one share of a company, you own a tiny slice of its assets, its earnings, and its future. That ownership can pay off in two ways: <strong>dividends</strong> (a direct cash payment some companies make to shareholders out of profits) and <strong>appreciation</strong> (the share price rising as the market decides the company is worth more). Most growth-focused companies reinvest profits into the business instead of paying dividends, so appreciation is the primary way younger or fast-growing companies reward shareholders.</p>
      <p>Because a stock is a claim on a real business, its price is ultimately tied to that business's performance — but in the short term, price is also driven by sentiment, speculation, and supply and demand. Separating "what a company is worth" from "what the stock is doing today" is one of the first mental shifts every new trader has to make.</p>

      <h3>How Exchanges Work</h3>
      <p>Stock exchanges like the NYSE and NASDAQ are marketplaces where buyers and sellers are matched electronically. Every stock has a <strong>bid</strong> (the highest price a buyer is currently willing to pay) and an <strong>ask</strong> (the lowest price a seller is currently willing to accept). The gap between them is the <strong>bid/ask spread</strong> — tighter spreads mean a more liquid, easily tradable stock.</p>
      <p><strong>Market makers</strong> are firms that commit to constantly quoting both a bid and an ask, providing liquidity so that buyers and sellers don't have to wait around for a perfect match. In modern markets, most of this matching happens through automated systems operating in microseconds, but the underlying concept — buyers and sellers agreeing on a price — hasn't changed since trading began on physical floors.</p>

      <h3>Market Hours</h3>
      <p>U.S. stock markets run on a predictable daily schedule, all times Eastern:</p>
      <ul>
        <li><strong>Pre-market:</strong> as early as 4:00 AM, thin volume, wide spreads</li>
        <li><strong>Regular session:</strong> 9:30 AM – 4:00 PM, where the vast majority of volume and the tightest spreads occur</li>
        <li><strong>After-hours:</strong> 4:00 PM – 8:00 PM, often active right after earnings announcements</li>
      </ul>
      <p>Pre-market and after-hours trading can move sharply on news, but with far fewer participants, prices can be more erratic and less reliable as a true read on sentiment until the regular session opens.</p>

      <h3>Order Types Overview</h3>
      <p>You'll dig deeper into order types in My Trading Desk, but the three basics are:</p>
      <ul>
        <li><strong>Market order:</strong> execute immediately at the best available price</li>
        <li><strong>Limit order:</strong> execute only at your specified price or better</li>
        <li><strong>Stop order:</strong> becomes a market order once a trigger price is hit, often used to limit losses</li>
      </ul>

      <h3>Why Stock Prices Move</h3>
      <p>At the most basic level, prices move because of supply and demand — more buyers than sellers at a given moment pushes price up, and vice versa. What changes that balance? Earnings reports, economic data, company news, analyst opinions, broader market sentiment, and sometimes simple momentum as traders react to each other's reactions. Learning to separate the signal (durable, fundamental shifts) from the noise (short-term emotional swings) is a skill you'll build throughout this curriculum.</p>
    `,
    keyConcept: {
      title: 'Key Concept',
      text: "A stock is a fractional ownership claim on a company's assets and earnings — its price reflects what buyers and sellers collectively agree it's worth at any given moment.",
    },
    quiz: [
      {
        question: 'What does owning a stock mean?',
        options: ['You lent money to a company', 'You own a small piece of the company', 'You have a contract for future delivery of goods', 'You are guaranteed a fixed return'],
        correct: 1,
        explanation: 'Stocks represent equity ownership, not debt.',
      },
      {
        question: 'Which exchange is known for listing most major technology companies?',
        options: ['NYSE', 'NASDAQ', 'London Stock Exchange', 'Tokyo Stock Exchange'],
        correct: 1,
        explanation: 'NASDAQ is home to Apple, Google, Meta, and most major tech firms.',
      },
      {
        question: "When does the US stock market's regular trading session end?",
        options: ['3:00 PM ET', '5:00 PM ET', '4:00 PM ET', '6:30 PM ET'],
        correct: 2,
        explanation: 'Regular hours are 9:30AM to 4:00PM Eastern Time.',
      },
    ],
    simSection: 'research',
    simStrategy: null,
  },
  {
    id: 2,
    title: 'Reading a Stock Chart',
    week: 1,
    day: 2,
    readTime: '6 min read',
    objectives: [
      'Interpret OHLCV (Open, High, Low, Close, Volume) data',
      'Choose the right chart timeframe for your trading style',
      'Understand the anatomy of a candlestick',
    ],
    content: `
      <h3>OHLCV Explained</h3>
      <p>Every candle on a chart packs five numbers into one shape: <strong>Open</strong> (the first traded price in the period), <strong>High</strong> (the highest price reached), <strong>Low</strong> (the lowest price reached), <strong>Close</strong> (the final traded price), and <strong>Volume</strong> (the number of shares traded). All five matter — price alone tells you where the stock ended up, but volume tells you how much conviction was behind the move, and the high/low range tells you how much the price fought to get there.</p>

      <h3>Timeframes</h3>
      <p>The chart timeframe you choose should match your trading style:</p>
      <ul>
        <li><strong>1-minute charts:</strong> scalping and very short-term day trading</li>
        <li><strong>Daily charts:</strong> the standard for swing trading — enough detail to plan entries without the noise of intraday fluctuations</li>
        <li><strong>Weekly charts:</strong> position trading and long-term trend context</li>
      </ul>
      <p>A common mistake for beginners is zooming into very short timeframes looking for "the perfect entry," when the bigger trend (visible only on daily or weekly charts) is what actually determines whether a trade has the wind at its back.</p>

      <h3>Candlestick Anatomy</h3>
      <p>A candlestick has a <strong>body</strong> (the rectangle between open and close) and <strong>wicks</strong> or shadows (the thin lines extending to the high and low). A green/white body means the close was higher than the open (buyers won that period); a red/black body means the close was lower than the open (sellers won). Long wicks show how far price was pushed before being rejected back — they're often more informative than the body itself.</p>

      <h3>Line vs. Candlestick vs. Bar Charts</h3>
      <p>A <strong>line chart</strong> connects only the closing prices — clean, but it hides intraperiod volatility. A <strong>bar chart (OHLC)</strong> shows all four prices as tick marks on a vertical line. A <strong>candlestick chart</strong> shows the same OHLC data but with the body shaded by direction, making it far easier to read at a glance — which is why it's the standard for most traders.</p>

      <h3>How to Read a Chart At a Glance</h3>
      <p>Before diving into indicators, train your eye to answer three questions quickly: What's the overall trend (up, down, sideways)? Where are the key support and resistance levels (price zones where the stock has reversed before)? And what does the volume pattern look like (is participation increasing or fading)? These three observations form the foundation that every indicator in this course will build on.</p>
    `,
    keyConcept: {
      title: 'Key Concept',
      text: 'Candlesticks compress four prices into one visual shape — the body shows the battle result between buyers and sellers, while the wicks show how far each side pushed before being rejected.',
    },
    quiz: [
      {
        question: "What does the 'H' in OHLCV stand for?",
        options: ['Holdings', 'High', 'Hour', 'Histogram'],
        correct: 1,
        explanation: 'OHLCV = Open, High, Low, Close, Volume.',
      },
      {
        question: 'A candlestick with a long lower wick and small body near the top indicates:',
        options: ['Strong selling pressure', 'Buyers defended a low price and pushed it back up', "The stock didn't move much", 'A gap in price'],
        correct: 1,
        explanation: 'A long lower wick means sellers pushed price down but buyers rejected that level and drove price back up.',
      },
      {
        question: 'Which timeframe is most appropriate for a swing trader holding for 3-5 days?',
        options: ['1-minute chart', 'Daily chart', 'Monthly chart', 'Tick chart'],
        correct: 1,
        explanation: 'Swing traders typically use daily charts for planning and 4-hour charts for entry timing.',
      },
    ],
    simSection: 'research',
    simStrategy: null,
  },
  {
    id: 3,
    title: 'Candlestick Patterns',
    week: 1,
    day: 3,
    readTime: '7 min read',
    objectives: [
      'Identify 6 key candlestick patterns',
      'Understand the psychological story behind each pattern',
      'Know which patterns signal reversals vs. continuation',
    ],
    content: `
      <h3>Doji</h3>
      <p>A Doji forms when the open and close are nearly equal, leaving little or no body — just wicks on either side. It represents pure indecision: buyers pushed price up, sellers pushed it back down (or vice versa), and neither side won. A Doji after a strong trend can be an early warning that momentum is stalling.</p>

      <h3>Hammer</h3>
      <p>A Hammer has a small body near the top of its range with a long lower wick — at least twice the size of the body. It forms after a decline and shows that sellers pushed price sharply lower during the session, but buyers stepped in and drove it back up by the close. Found at the bottom of a downtrend, it's a classic bullish reversal signal.</p>

      <h3>Shooting Star</h3>
      <p>The mirror image of a Hammer: a small body near the bottom of its range with a long upper wick, forming after an advance. It shows buyers pushed price higher intraday, but sellers overwhelmed them by the close. Found at the top of an uptrend, it's a bearish reversal warning.</p>

      <h3>Bullish Engulfing</h3>
      <p>A two-candle pattern: a smaller red (down) candle followed by a larger green (up) candle whose body completely engulfs the prior candle's body. It signals that buyers have decisively taken control after a period of selling.</p>

      <h3>Bearish Engulfing</h3>
      <p>The inverse: a smaller green candle followed by a larger red candle that completely engulfs it. This shows sellers have overwhelmed the prior buying and taken control of the price action.</p>

      <h3>Inside Bar</h3>
      <p>An Inside Bar is a candle whose entire range (high to low) sits within the previous candle's range. It signals consolidation — the market is "compressing" — and often precedes a breakout in either direction once the inside bar's range is broken.</p>

      <h3>How to Use Patterns</h3>
      <p>No candlestick pattern should be traded in isolation. Always wait for confirmation from the next candle — for example, after a Hammer, look for the following candle to close higher before acting. Confirmation filters out a large share of false signals.</p>

      <h3>Common Mistake: Trading Patterns Without Context</h3>
      <p>The single biggest mistake new traders make with candlestick patterns is trading them without considering where they appear. A Hammer in the middle of a sideways range means far less than a Hammer at a well-defined support level after a multi-week downtrend. Context — the prevailing trend, nearby support/resistance, and volume — is what gives a pattern its meaning.</p>
    `,
    keyConcept: {
      title: 'Key Concept',
      text: 'Candlestick patterns are compressed market psychology — every pattern tells a story about the emotional battle between bulls and bears. Context (where it forms) is more important than the pattern itself.',
    },
    quiz: [
      {
        question: 'A Hammer candlestick is most meaningful when it appears:',
        options: ['In the middle of an uptrend', 'At the bottom of a downtrend', 'On high volume during sideways movement', 'After a gap up'],
        correct: 1,
        explanation: 'A Hammer signals potential reversal from a downtrend — it loses meaning in other contexts.',
      },
      {
        question: 'What does a Doji candlestick signal?',
        options: ['Strong bullish momentum', 'A guaranteed reversal', 'Market indecision — neither buyers nor sellers in control', 'Extremely high volume'],
        correct: 2,
        explanation: "The Doji's equal open and close shows the market is undecided.",
      },
      {
        question: 'A Bullish Engulfing pattern requires:',
        options: ['The second candle to be red', "The second candle's body to fully engulf the first candle's body", 'Both candles to be the same size', 'A gap between the two candles'],
        correct: 1,
        explanation: "The larger green candle must completely surround the prior red candle's body to confirm buyer dominance.",
      },
    ],
    simSection: 'research',
    simStrategy: null,
  },
  {
    id: 4,
    title: 'Moving Averages (SMA & EMA)',
    week: 1,
    day: 4,
    readTime: '6 min read',
    objectives: [
      'Explain the difference between SMA and EMA',
      'Identify the most important periods (9, 20, 50, 200)',
      'Recognize a Golden Cross and Death Cross',
    ],
    content: `
      <h3>What Is a Moving Average?</h3>
      <p>A moving average smooths out day-to-day price noise into a single line that shows the underlying trend direction. Rather than reacting to every wiggle, it gives you a cleaner read on whether a stock is generally rising, falling, or moving sideways.</p>

      <h3>SMA vs EMA</h3>
      <p>The <strong>Simple Moving Average (SMA)</strong> gives every period in its lookback window equal weight. The <strong>Exponential Moving Average (EMA)</strong> gives more weight to recent prices, making it react faster to new information. Neither is "better" in all situations — SMA is steadier and less prone to whipsaws, while EMA is more responsive for traders who want earlier signals.</p>

      <h3>Key Periods and Their Uses</h3>
      <ul>
        <li><strong>9/10 EMA:</strong> short-term momentum, favored by day traders</li>
        <li><strong>20 SMA:</strong> a common swing trading baseline</li>
        <li><strong>50 SMA:</strong> medium-term trend, widely watched by institutions</li>
        <li><strong>200 SMA:</strong> long-term trend — the line many consider the dividing point between a bull and bear market for a stock</li>
      </ul>

      <h3>Golden Cross and Death Cross</h3>
      <p>A <strong>Golden Cross</strong> occurs when the 50-day SMA crosses above the 200-day SMA — a bullish long-term signal. A <strong>Death Cross</strong> is the opposite: the 50-day SMA crossing below the 200-day SMA, a bearish long-term signal. Both are lagging indicators (they confirm a trend that's already underway), but they remain widely watched because so many other market participants react to them.</p>

      <h3>Using MAs as Dynamic Support/Resistance</h3>
      <p>Moving averages aren't just trend lines — price often "bounces" off them as if they were support or resistance levels, because so many traders use the same averages to make decisions. A stock pulling back to touch its rising 50-day SMA, then bouncing, is a textbook trend-following entry.</p>

      <h3>The EMA Stack</h3>
      <p>When EMA-9 sits above EMA-21, which sits above EMA-50, which sits above EMA-200 — each shorter timeframe confirming the next longer one — the trend is considered strongly bullish across multiple time horizons simultaneously. This "stacked" alignment is one of the cleanest visual confirmations of trend strength.</p>
    `,
    keyConcept: {
      title: 'Key Concept',
      text: "The 200-day moving average is the line between a bull market and a bear market for a stock — fund managers and institutions use it to decide whether to own a stock or not. Respect it.",
    },
    quiz: [
      {
        question: "Which moving average reacts faster to recent price changes?",
        options: ['SMA', 'EMA', 'Both react equally fast', 'Neither — they are static'],
        correct: 1,
        explanation: 'EMA gives more weight to recent data, making it more responsive than the SMA.',
      },
      {
        question: "A stock's 50-day SMA crossing above its 200-day SMA is called:",
        options: ['Death Cross', 'EMA Crossover', 'Golden Cross', 'Trend Reversal'],
        correct: 2,
        explanation: 'The Golden Cross is a classic long-term bullish signal watched by institutional investors.',
      },
      {
        question: "When price is above the 200-day SMA, what does this generally indicate?",
        options: ['The stock is in a long-term downtrend', 'The stock is in a long-term uptrend', 'The stock is overvalued', 'Volatility is high'],
        correct: 1,
        explanation: 'Price above the 200-day SMA is widely accepted as the definition of a long-term uptrend.',
      },
    ],
    simSection: 'ai-trader',
    simStrategy: 'ema_crossover',
  },
  {
    id: 5,
    title: 'RSI, MACD & Bollinger Bands',
    week: 1,
    day: 5,
    readTime: '7 min read',
    objectives: [
      'Interpret RSI overbought/oversold readings',
      'Read a MACD histogram for momentum direction',
      'Understand Bollinger Band squeezes as volatility signals',
    ],
    content: `
      <h3>RSI (Relative Strength Index)</h3>
      <p>RSI measures the ratio of average gains to average losses over a lookback period (typically 14 candles), expressed on a 0-100 scale. Readings below 30 are traditionally considered <strong>oversold</strong> (the stock may be due for a bounce), readings above 70 are considered <strong>overbought</strong> (the stock may be due for a pullback), and 50 represents a neutral midpoint.</p>
      <p>One of RSI's most powerful uses is spotting <strong>divergence</strong>: when price makes a new high but RSI fails to make a correspondingly higher high, it can reveal hidden weakness beneath an apparently strong move — momentum is fading even though price hasn't turned yet.</p>

      <h3>MACD (Moving Average Convergence Divergence)</h3>
      <p>MACD is built from three pieces: the <strong>MACD line</strong> (EMA-12 minus EMA-26), the <strong>signal line</strong> (a 9-period EMA of the MACD line), and the <strong>histogram</strong> (the difference between the MACD line and the signal line). When histogram bars are growing, momentum is strengthening in that direction; when they're shrinking toward zero, momentum is fading. A bullish signal occurs when the MACD line crosses above the signal line.</p>

      <h3>Bollinger Bands</h3>
      <p>Bollinger Bands consist of a middle band (the 20-day SMA) and upper/lower bands set two standard deviations away from it. Wide bands reflect high volatility; narrow bands reflect low volatility — a "squeeze." A squeeze doesn't tell you which direction price will go, only that compressed volatility is building toward an eventual breakout.</p>

      <h3>Using Indicators Together</h3>
      <p>No single indicator should be used in isolation. A particularly powerful combination is watching for an RSI divergence forming inside a Bollinger Band squeeze — together they suggest both that momentum is shifting and that volatility is about to expand, often producing a higher-conviction signal than either indicator alone.</p>
    `,
    keyConcept: {
      title: 'Key Concept',
      text: 'RSI tells you WHEN a move might be exhausted; Bollinger Bands tell you IF conditions are ripe for a big move. Use them together — an RSI divergence inside a BB squeeze is a powerful combined signal.',
    },
    quiz: [
      {
        question: 'An RSI reading of 28 suggests:',
        options: ['The stock is overbought and likely to fall', 'The stock is oversold and may bounce', 'The stock has no momentum', 'Volume is below average'],
        correct: 1,
        explanation: 'RSI below 30 is traditionally considered oversold.',
      },
      {
        question: 'When the MACD histogram bars are shrinking toward zero, this indicates:',
        options: ['Momentum is increasing', 'Momentum is weakening or reversing', 'The stock is about to gap up', 'Volume is surging'],
        correct: 1,
        explanation: 'Shrinking histogram bars mean the gap between MACD and its signal line is closing — momentum is fading.',
      },
      {
        question: 'A Bollinger Band squeeze (very narrow bands) signals:',
        options: ['Low volatility that will likely persist', 'The stock is about to crash', 'Low volatility building toward a breakout', 'The stock is at fair value'],
        correct: 2,
        explanation: 'Narrow bands = compressed energy. The squeeze typically resolves in a sharp directional move.',
      },
    ],
    simSection: 'ai-trader',
    simStrategy: 'bollinger_squeeze',
  },
  {
    id: 6,
    title: 'Volume & VWAP',
    week: 1,
    day: 6,
    readTime: '6 min read',
    objectives: [
      'Explain why volume confirms or invalidates price moves',
      'Define VWAP and explain why institutions use it',
      'Identify abnormal (climactic) volume',
    ],
    content: `
      <h3>Why Volume Matters</h3>
      <p>Volume is the fuel behind every price move. A price change on heavy volume reflects broad participation and conviction; the same price change on thin volume may simply be a handful of traders moving the stock with no real institutional interest behind it. Volume is what separates a real move from noise.</p>

      <h3>Relative Volume (RVol)</h3>
      <p>Relative Volume compares current volume to a recent average (commonly the 20-day average). A reading of 1.0 means normal activity, 2.0 means twice the usual volume, and 0.5 means only half the usual interest. RVol is one of the fastest ways to gauge whether "today is a normal day" or "something unusual is happening."</p>

      <h3>Volume + Price Combinations</h3>
      <ul>
        <li><strong>Price up + High volume:</strong> a strong, conviction-backed bullish signal</li>
        <li><strong>Price up + Low volume:</strong> a weak, suspicious move that may not hold</li>
        <li><strong>Price down + High volume:</strong> strong distribution — real selling pressure</li>
        <li><strong>Price down + Low volume:</strong> usually just a minor, unremarkable pullback</li>
      </ul>

      <h3>VWAP (Volume Weighted Average Price)</h3>
      <p>VWAP is calculated as the sum of (price × volume) divided by the sum of volume, and it resets fresh at the start of each trading day. Institutions use it as an execution benchmark — a large fund buying shares throughout the day wants to know if it's getting a price better or worse than VWAP. For traders, price trading above VWAP is generally read as a bullish intraday bias, while price below VWAP suggests a bearish bias.</p>

      <h3>Climactic Volume</h3>
      <p>A massive, sudden volume spike at the end of an extended trend often signals exhaustion rather than continuation. This "climactic" volume can mark the point where the last buyers in an uptrend (or last sellers in a downtrend) are finally capitulating — frequently right before a reversal.</p>
    `,
    keyConcept: {
      title: 'Key Concept',
      text: "Volume is the fuel behind price moves — a breakout on 2x+ average volume is a conviction move. The same breakout on half-average volume is a warning sign that institutions aren't participating.",
    },
    quiz: [
      {
        question: 'A stock breaks above resistance with relative volume of 0.4. This suggests:',
        options: ['A strong breakout with high conviction', 'A weak breakout with low institutional participation', 'A short squeeze', 'Accumulation phase'],
        correct: 1,
        explanation: 'Relative volume of 0.4 means only 40% of normal volume — breakouts need volume confirmation.',
      },
      {
        question: 'VWAP resets:',
        options: ['Every week', 'At the start of each trading day', 'Every month', "Only when there's a gap"],
        correct: 1,
        explanation: 'VWAP is an intraday indicator that starts fresh at 9:30AM ET each trading day.',
      },
      {
        question: 'A climactic volume spike at the top of a long uptrend most likely signals:',
        options: ['The uptrend will accelerate', 'A normal continuation', 'Potential exhaustion and reversal', 'Institutional accumulation'],
        correct: 2,
        explanation: 'Climactic volume at extremes often marks the end of a trend as the last buyers pile in and sellers take profits.',
      },
    ],
    simSection: 'ai-trader',
    simStrategy: 'vwap_reversion',
  },
  {
    id: 7,
    title: 'Risk Management',
    week: 1,
    day: 7,
    readTime: '7 min read',
    objectives: [
      'Apply the 1% and 2% risk rules to size positions correctly',
      'Calculate position size using entry and stop-loss prices',
      'Understand R-multiples as a way to measure trade quality',
    ],
    content: `
      <h3>The Most Important Trading Rule</h3>
      <p>Define your risk before you enter a trade — not after. The single biggest difference between traders who survive long enough to get good and traders who blow up their accounts is whether they decided, in advance, exactly how much they were willing to lose on any one trade.</p>

      <h3>The 1% / 2% Rule</h3>
      <p>Never risk more than 1-2% of your total account on any single trade. This isn't about being timid — it's about surviving the inevitable losing streaks that happen to every trader, including the best ones, so that one bad trade (or five in a row) can't take you out of the game.</p>

      <h3>Position Sizing Formula</h3>
      <p>Shares = (Account Value × Risk %) / (Entry Price − Stop Price)</p>
      <p><strong>Example:</strong> a $50,000 account, risking 2%, entering at $50 with a stop at $47:</p>
      <p>($50,000 × 0.02) / ($50 − $47) = $1,000 / $3 = <strong>333 shares</strong></p>

      <h3>Stop-Loss Placement</h3>
      <p>Favor <strong>technical stops</strong> — placed below a support level, a moving average, or another logical price where your trade thesis would be proven wrong — over arbitrary percentage stops that ignore the actual chart structure. A technical stop tells you something real; an arbitrary one is just a guess.</p>

      <h3>R-Multiples</h3>
      <p>An "R" is your initial risk on a trade. If you risk $300 to enter a position, that's 1R. A trade that gains $900 is a +3R win; a trade that loses the full $300 is a −1R loss. Professional traders typically aim for an average winning trade of 2R-3R against an average losing trade of −1R, which lets them be profitable even with a win rate below 50%.</p>

      <h3>Max Daily Loss Limit</h3>
      <p>Set a hard stop for the day — commonly 3R or roughly 4% of account value — at which point you close your platform and walk away. This single rule prevents a bad day from becoming a catastrophic one.</p>

      <h3>Risk of Ruin</h3>
      <p>Even with a 50% win rate, it's statistically possible to lose 10 trades in a row. But with strict 2% risk per trade, 10 consecutive maximum losses only produces about an 18% drawdown — painful, but recoverable. This is the mathematical proof behind why position sizing is, in many ways, your real trading edge.</p>
    `,
    keyConcept: {
      title: 'Key Concept',
      text: "Professionals don't predict the market — they control their losses. With a 2% stop rule, you could theoretically lose 35 trades in a row and still have more than 50% of your capital. Position sizing IS your edge.",
    },
    quiz: [
      {
        question: 'You have a $40,000 account and want to risk 2% per trade. Your entry is $80 and your stop is $75. How many shares should you buy?',
        options: ['100 shares', '160 shares', '200 shares', '50 shares'],
        correct: 1,
        explanation: '($40,000 × 0.02) / ($80 − $75) = $800 / $5 = 160 shares.',
      },
      {
        question: 'If your initial risk on a trade is $200 and you make a gain of $600, your R-multiple is:',
        options: ['1R', '2R', '3R', '0.5R'],
        correct: 2,
        explanation: '$600 gain / $200 initial risk = 3R.',
      },
      {
        question: 'Which stop-loss approach is generally superior?',
        options: ['Always use a 10% stop from entry', 'Place stops at a technical level like below a support or EMA', 'Never use stops — let trades recover', 'Use a 50% stop to give trades room'],
        correct: 1,
        explanation: 'Technical stops are placed at logical price levels where your trade thesis is invalidated, not at arbitrary percentages.',
      },
    ],
    simSection: 'my-desk',
    simStrategy: null,
  },
  {
    id: 8,
    title: 'CANSLIM — Part 1 (C, A, N)',
    week: 2,
    day: 8,
    readTime: '6 min read',
    objectives: [
      "Explain William O'Neil's CANSLIM growth-stock system",
      'Assess the C, A, and N criteria for any stock',
      'Understand why CANSLIM focuses on leaders, not cheap stocks',
    ],
    content: `
      <h3>Who Is William O'Neil?</h3>
      <p>William O'Neil founded Investor's Business Daily and wrote <em>How to Make Money in Stocks</em>, distilling decades of research into the biggest historical winning stocks down to seven repeatable traits — CANSLIM. It blends fundamental strength (is this a genuinely great business?) with technical timing (is the chart confirming that strength right now?).</p>

      <h3>Why CANSLIM Works</h3>
      <p>Most investing systems pick either fundamentals or technicals — CANSLIM insists on both. A company can have great earnings but a chart still under accumulation by sellers; a chart can look technically perfect but be built on a business with no real growth. CANSLIM requires both pillars to align before considering a buy.</p>

      <h3>C — Current Quarterly Earnings</h3>
      <p>Look for 25%+ EPS growth in the most recent quarter versus the same quarter a year prior. Accelerating growth — each quarter faster than the last — is an even stronger signal. Be cautious of one-time items (asset sales, tax credits) that can artificially inflate a single quarter's EPS.</p>

      <h3>A — Annual Earnings Growth</h3>
      <p>O'Neil's research favored companies with five consecutive years of profit growth and an annual EPS growth rate of 25%+. A Return on Equity (ROE) above 17% is considered a bonus signal of efficient capital use.</p>

      <h3>N — New (Product, Management, or High)</h3>
      <p>The "N" can be satisfied three ways: a new product or service driving growth, new management with a credible track record, or — most commonly screened for — the stock making a new 52-week high. Most traders instinctively fear buying at new highs, but CANSLIM embraces them as a sign of strong institutional demand rather than a sign the move is "too late."</p>
    `,
    keyConcept: {
      title: 'Key Concept',
      text: "CANSLIM doesn't look for cheap stocks — it looks for the best stocks. A stock at a 52-week high with accelerating earnings is often still the beginning of a major move, not the end.",
    },
    quiz: [
      {
        question: "The 'C' in CANSLIM stands for:",
        options: ['Chart Pattern', 'Current Quarterly Earnings', 'Consolidated Trend', 'Capital Allocation'],
        correct: 1,
        explanation: 'C focuses on the most recent quarterly EPS growth.',
      },
      {
        question: "William O'Neil recommends looking for annual EPS growth of at least:",
        options: ['5%', '10%', '25%', '50%'],
        correct: 2,
        explanation: '25%+ annual earnings growth is a key CANSLIM threshold.',
      },
      {
        question: "The 'N' criterion is satisfied by:",
        options: ['A new 52-week low', 'Negative analyst ratings', 'A new product, new management, or new 52-week high', "A stock that hasn't moved in months"],
        correct: 2,
        explanation: "'N' represents a new catalyst or new price high indicating strong institutional demand.",
      },
    ],
    simSection: 'research',
    simStrategy: 'canslim',
  },
  {
    id: 9,
    title: 'CANSLIM — Part 2 (S, L, I, M)',
    week: 2,
    day: 9,
    readTime: '7 min read',
    objectives: [
      'Apply the S, L, I, and M criteria to evaluate stocks',
      'Understand why market direction (M) is the most critical filter',
      'Combine all 7 criteria into a complete CANSLIM score',
    ],
    content: `
      <h3>S — Supply and Demand</h3>
      <p>Stocks with a smaller float (fewer shares outstanding) tend to move faster, since the same dollar amount of buying has a bigger price impact. Look to buy when volume surges meaningfully above the 50-day average — a sign that demand is outpacing supply. Healthy <strong>accumulation</strong> shows up as heavy volume on up days paired with comparatively light volume on down days.</p>

      <h3>L — Leader Not Laggard</h3>
      <p>Buy the #1 stock in the #1 industry group, not the "cheaper" #2 or #3 name in the same space. The IBD Relative Strength Rating (a percentile ranking of a stock's price performance versus all others) of 80+ — meaning it's outperforming 80% of the market — is the kind of leadership CANSLIM looks for.</p>

      <h3>I — Institutional Sponsorship</h3>
      <p>You want at least a handful of quality funds owning the stock, since institutional buying provides both validation and price support. The ideal pattern is <strong>increasing</strong> institutional ownership quarter over quarter. Too little sponsorship means no real demand floor; too much can mean the easy buying is already over.</p>

      <h3>M — Market Direction</h3>
      <p>Roughly 75% of stocks move in the same direction as the overall market. CANSLIM stocks should only be bought during a confirmed market uptrend — during corrections, the discipline is to raise cash and wait for a <strong>follow-through day</strong> (a strong, high-volume up day in a major index, signaling a new rally) before committing capital again. SPY and QQQ serve as the standard market proxies.</p>

      <h3>Putting It All Together</h3>
      <p>Score each criterion as a pass or fail; a stock scoring 5 or more out of 7 is considered a strong CANSLIM candidate worth deeper research.</p>
    `,
    keyConcept: {
      title: 'Key Concept',
      text: "If the market (M) is in a correction, even a perfect 6/7 CANSLIM stock will likely fail. Always check M first — it's the one criterion that can override all others.",
    },
    quiz: [
      {
        question: "The 'L' in CANSLIM means you should:",
        options: ['Buy the lowest-priced stock in a sector', 'Buy the leader — the strongest stock in the strongest industry', 'Look for stocks with low volume', 'Buy stocks with long histories'],
        correct: 1,
        explanation: "O'Neil's research showed buying the top performer in a sector outperforms buying cheaper alternatives.",
      },
      {
        question: 'Regarding institutional sponsorship (I), which is ideal?',
        options: ['Zero institutions owning the stock (undiscovered)', 'All major funds already heavily invested', 'A few quality institutions with increasing ownership', 'Only retail investors owning the stock'],
        correct: 2,
        explanation: 'Some institutional support is needed for price stability, but increasing ownership shows momentum.',
      },
      {
        question: "What does a 'Follow-Through Day' signal in CANSLIM?",
        options: ['The market correction is getting worse', 'A potential new market uptrend is being confirmed', 'Time to sell everything', 'A stock is ready to break out'],
        correct: 1,
        explanation: 'A Follow-Through Day (big market index up 1.7%+ on higher volume) signals a potential rally is underway.',
      },
    ],
    simSection: 'research',
    simStrategy: 'canslim',
  },
  {
    id: 10,
    title: 'Momentum & Breakout Trading',
    week: 2,
    day: 10,
    readTime: '6 min read',
    objectives: [
      'Define price momentum and why it tends to persist',
      'Identify the conditions for a valid breakout',
      'Avoid the most common breakout trap: the fakeout',
    ],
    content: `
      <h3>What Is Momentum?</h3>
      <p>Stocks that are moving tend to keep moving — a loose application of Newton's first law to markets. Once a stock attracts enough attention and buying interest, that interest tends to feed on itself for a while, at least until the news or sentiment driving it fades.</p>

      <h3>The Breakout Setup</h3>
      <ol>
        <li>The stock consolidates, forming a "base," for three or more weeks</li>
        <li>Price tests a resistance level multiple times without breaking through</li>
        <li>Volume builds as price approaches resistance — quiet accumulation</li>
        <li>Price finally breaks above resistance on high volume (2x+ the average)</li>
      </ol>

      <h3>Anatomy of a Valid Breakout</h3>
      <ul>
        <li>A clean base — ideally less than a 15% trading range, not wildly volatile</li>
        <li>A volume surge on the breakout day itself, confirming real participation</li>
        <li>No major overhead supply (prior resistance levels) immediately above</li>
        <li>A broad market that's also in an uptrend, supporting the move</li>
      </ul>

      <h3>The Fakeout</h3>
      <p>A fakeout happens when price briefly breaks resistance, then quickly reverses back below it — usually within 1-3 days. Warning signs include below-average volume on the breakout day, a wide-ranging candle that immediately stalls, or a market that's working against the move. Volume confirmation is your best defense against getting caught in a fakeout.</p>

      <h3>Entry and Exit</h3>
      <p>Buy as close to the actual breakout point as practical — chasing a stock that's already run 5-10% past the breakout sharply worsens your risk/reward. Place your stop below the base (CANSLIM traditionally uses an 8% rule), and target the "measured move" — the depth of the base, projected upward from the breakout point.</p>
    `,
    keyConcept: {
      title: 'Key Concept',
      text: "You don't catch breakouts — you confirm them. A breakout with 2x+ average volume is far more likely to follow through than one on thin volume. Patience at the entry point separates profitable from unprofitable breakout traders.",
    },
    quiz: [
      {
        question: 'A valid breakout requires:',
        options: ['Low volume to avoid attracting attention', 'Volume 2x or more above the 20-day average', 'The stock to be at an all-time low', 'Negative analyst ratings'],
        correct: 1,
        explanation: 'Volume confirmation is the single most important breakout validation factor.',
      },
      {
        question: 'A "fakeout" in breakout trading refers to:',
        options: ['A fake company filing', 'A breakout that reverses back below the breakout level', 'A stock that gaps up and never comes back', 'When the market is closed'],
        correct: 1,
        explanation: 'Fakeouts occur when price briefly breaks a level then reverses — typically on low volume.',
      },
      {
        question: 'Where should a stop-loss be placed for a breakout trade?',
        options: ['50% below entry', "At yesterday's close", 'Below the consolidation base that preceded the breakout', 'At the breakout point itself'],
        correct: 2,
        explanation: 'The base represents the support structure — if price returns there, the breakout thesis is invalidated.',
      },
    ],
    simSection: 'ai-trader',
    simStrategy: 'momentum_breakout',
  },
  {
    id: 11,
    title: 'VWAP Mean Reversion',
    week: 2,
    day: 11,
    readTime: '6 min read',
    objectives: [
      'Explain mean reversion theory in stock price behavior',
      'Execute a VWAP pullback trade with RSI confirmation',
      'Identify when mean reversion is likely vs. unlikely',
    ],
    content: `
      <h3>What Is Mean Reversion?</h3>
      <p>Mean reversion is the idea that prices tend to snap back toward their average after stretching too far in one direction — like a rubber band. It doesn't deny trends exist; it simply says that short-term overextensions, even within a trend, tend to correct before the bigger move resumes.</p>

      <h3>Why VWAP Is the Right Mean for Intraday Trading</h3>
      <p>VWAP works well as a mean-reversion anchor because it's the institutional benchmark for fair value during the day. Market makers and algorithms reference VWAP constantly, so when price deviates sharply from it, there's a real, structural reason — not just a statistical coincidence — to expect a snap-back.</p>

      <h3>The VWAP Reversion Setup</h3>
      <ul>
        <li>Price drops 1.5-2% below VWAP — a meaningful extension</li>
        <li>RSI drops below 40, confirming an oversold short-term condition</li>
        <li>The broader trend is still upward (price holding above the 50-day SMA)</li>
        <li>No major bearish news catalyst is driving the move</li>
      </ul>

      <h3>Entry, Exit, and Stop</h3>
      <p>Enter near the VWAP support area once the setup confirms. Exit either when price recovers back to VWAP or when RSI rises back above 55. Place your stop below the day's low — if price makes a fresh low, the reversion thesis has failed.</p>

      <h3>When NOT to Use This Strategy</h3>
      <ul>
        <li>A strong downtrend day where price stays below VWAP the entire session</li>
        <li>High-volatility, high-VIX market conditions where deviations can keep extending</li>
        <li>A stock with genuine negative fundamental news driving the move</li>
      </ul>
    `,
    keyConcept: {
      title: 'Key Concept',
      text: "VWAP mean reversion is a professional's fade strategy — you're betting on institutional price defense. It works best in calm markets on trend days where price briefly overshoots.",
    },
    quiz: [
      {
        question: 'VWAP mean reversion is most effective when:',
        options: ['The stock is in a clear downtrend all day', 'The market is highly volatile (VIX > 30)', 'Price briefly dips below VWAP in an otherwise uptrending day', 'Volume is extremely low'],
        correct: 2,
        explanation: "You need overall bullish conditions — you're trading a brief deviation, not a trend change.",
      },
      {
        question: 'A good RSI level to look for when entering a VWAP reversion trade is:',
        options: ['RSI above 70', 'RSI between 50-60', 'RSI below 40', 'RSI exactly at 50'],
        correct: 2,
        explanation: 'RSI below 40 confirms the oversold condition that makes a reversion to VWAP more likely.',
      },
      {
        question: 'The primary exit target for a VWAP mean reversion trade is:',
        options: ['10% above entry', 'The VWAP level', "The day's high", "The prior day's close"],
        correct: 1,
        explanation: 'VWAP is the target because that\'s the "mean" you expect price to revert to.',
      },
    ],
    simSection: 'ai-trader',
    simStrategy: 'vwap_reversion',
  },
  {
    id: 12,
    title: 'Gap & Go Strategy',
    week: 2,
    day: 12,
    readTime: '7 min read',
    objectives: [
      'Identify the three types of gaps and their implications',
      'Execute a Gap & Go trade with a trailing stop',
      'Know when to avoid gap trades (when NOT to trade)',
    ],
    content: `
      <h3>Types of Gaps</h3>
      <ul>
        <li><strong>Breakaway Gap:</strong> a gap out of a consolidation base — typically continues, and the most valuable type to trade</li>
        <li><strong>Runaway/Continuation Gap:</strong> a gap that occurs in the middle of an established trend, signaling acceleration</li>
        <li><strong>Exhaustion Gap:</strong> a gap at the end of an extended trend, often reversing shortly after — dangerous to trade in the direction of the gap</li>
        <li><strong>Common Gap:</strong> a small, low-significance gap that tends to fill quickly</li>
      </ul>

      <h3>The Gap & Go Setup</h3>
      <ul>
        <li>The stock gaps up 1.5%+ pre-market on real news or a catalyst</li>
        <li>Pre-market volume confirms genuine interest — 500k+ shares traded pre-open</li>
        <li>The first candle of the regular session holds above the gap open (no fill-back)</li>
        <li>Overall market conditions are supportive (broad indices not gapping down)</li>
      </ul>

      <h3>Entry, Trailing Stop, and Target</h3>
      <p>Enter on the first 1-minute candle's close above the gap high. Use a <strong>trailing stop</strong> — moving your stop up every 30 minutes to just below the previous 30-minute low — to lock in gains as the move extends. A reasonable target is 3% above the gap open, or the next meaningful resistance level.</p>

      <h3>When NOT to Trade Gaps</h3>
      <ul>
        <li>The gap is moving directly into major overhead resistance</li>
        <li>Pre-market volume is thin, suggesting little real conviction</li>
        <li>The gap is driven by an earnings report (volatility can be too unpredictable)</li>
        <li>The overall market is gapping down, working against your trade</li>
      </ul>
    `,
    keyConcept: {
      title: 'Key Concept',
      text: 'Not all gaps go — the key filter is pre-market volume. A gap on 500k+ pre-market shares with a positive catalyst and no overhead resistance is a high-probability continuation trade.',
    },
    quiz: [
      {
        question: 'Which type of gap typically signals the continuation of an existing trend and is the most reliable for the Gap & Go strategy?',
        options: ['Exhaustion Gap', 'Common Gap', 'Breakaway or Runaway/Continuation Gap', 'Reversal Gap'],
        correct: 2,
        explanation: 'Breakaway and continuation gaps signal strong directional momentum.',
      },
      {
        question: 'A trailing stop in a Gap & Go trade serves to:',
        options: ['Guarantee a specific profit', 'Lock in gains as the price moves higher', 'Increase position size automatically', 'Prevent entry'],
        correct: 1,
        explanation: 'A trailing stop moves up with price, ensuring you keep accumulated profits if the trade reverses.',
      },
      {
        question: 'Which scenario should make you AVOID a Gap & Go trade?',
        options: ['High pre-market volume with positive news', 'A gap into clear overhead resistance on the chart', 'The gap is above the 200-day SMA', 'RSI is at 55'],
        correct: 1,
        explanation: 'Overhead resistance (previous highs where sellers are waiting) can stop a gap trade dead in its tracks.',
      },
    ],
    simSection: 'ai-trader',
    simStrategy: 'gap_and_go',
  },
  {
    id: 13,
    title: 'Opening Range Breakout (ORB)',
    week: 2,
    day: 13,
    readTime: '6 min read',
    objectives: [
      'Define the opening range and why the first 15-30 minutes matter',
      'Trade ORB breakouts with volume confirmation',
      'Calculate the price target from the opening range',
    ],
    content: `
      <h3>What Is the Opening Range?</h3>
      <p>The opening range is the high and low of the first 15 or 30 minutes of the trading session. This window captures the most volatility of the day, as overnight positioning, pre-market sentiment, and the first wave of institutional orders all resolve at once.</p>

      <h3>Why It Works</h3>
      <p>The range established in those opening minutes often defines the tone for the rest of the day: a clean breakout above the opening range high tends to foreshadow a bullish session, while a breakdown below the opening range low tends to foreshadow a bearish one. Institutional algorithms frequently set their intended daily range during this same window.</p>

      <h3>15-Minute ORB vs 30-Minute ORB</h3>
      <p>A 15-minute opening range produces more trade setups but with lower reliability, since less information has been priced in. A 30-minute opening range produces fewer setups but with meaningfully higher reliability — generally the better starting point for beginners.</p>

      <h3>The Breakout Setup</h3>
      <ul>
        <li>Price breaks cleanly above the opening range high, with a small buffer (+0.3%)</li>
        <li>Volume accelerates noticeably versus the opening range candle itself</li>
        <li>The broader market is also trending upward</li>
        <li>RSI is not already overbought (below 75)</li>
      </ul>

      <h3>Target Calculation</h3>
      <p>Target = opening range low + (opening range size × 2).</p>
      <p><strong>Example:</strong> opening range low = $100, opening range high = $102, so the range size is $2. Target = $100 + ($2 × 2) = <strong>$104</strong>.</p>

      <h3>Stop Placement</h3>
      <p>Any close back inside the opening range invalidates the breakout thesis and should trigger an exit — the move has failed to hold.</p>
    `,
    keyConcept: {
      title: 'Key Concept',
      text: 'The opening range is where institutions and retail investors fight for control of the day. The direction of the breakout typically reveals who won that battle — and the rest of the day often follows.',
    },
    quiz: [
      {
        question: 'The Opening Range in ORB trading is defined as:',
        options: [
          "The entire previous day's price range",
          'The high and low formed in the first 15 or 30 minutes of trading',
          "The gap between yesterday's close and today's open",
          'The pre-market range only',
        ],
        correct: 1,
        explanation: 'ORB uses the first trading session period (15 or 30 min) to establish the range.',
      },
      {
        question: 'If the opening range low is $50 and the opening range high is $53, what is the ORB target for a long breakout trade?',
        options: ['$53.50', '$55', '$56', '$59'],
        correct: 2,
        explanation: 'Range = $3. Target = OR low + (range × 2) = $50 + $6 = $56.',
      },
      {
        question: "Your ORB long trade's stop should be placed:",
        options: ['10% below entry', 'At the opening range high', 'Any close back inside the opening range invalidates the trade', "At yesterday's close"],
        correct: 2,
        explanation: 'Returning inside the opening range means the breakout failed and your thesis is wrong.',
      },
    ],
    simSection: 'ai-trader',
    simStrategy: 'opening_range_breakout',
  },
  {
    id: 14,
    title: 'EMA Trend Trading (9/21 Crossover)',
    week: 2,
    day: 14,
    readTime: '6 min read',
    objectives: [
      'Trade EMA-9/EMA-21 crossovers for trend entries',
      'Use pullbacks to EMA-9 as lower-risk entries',
      'Filter with the EMA-50 and EMA-200 for trend alignment',
    ],
    content: `
      <h3>The 9/21 EMA System</h3>
      <p>EMA-9 tracks short-term momentum, reacting within days. EMA-21 tracks the medium-term trend, reacting over weeks. A <strong>bullish cross</strong> — EMA-9 rising above EMA-21 — is the buy signal; a <strong>bearish cross</strong> — EMA-9 falling below EMA-21 — is the sell signal.</p>

      <h3>The EMA Stack</h3>
      <p>Bullish alignment looks like EMA-9 > EMA-21 > EMA-50 > EMA-200, with each layer confirming that a different time horizon is trending bullishly. When all four EMAs stack in that order, it represents one of the strongest possible trend environments — every timeframe agrees.</p>

      <h3>Pullback Entry (Lower Risk)</h3>
      <p>Rather than buying the crossover itself — which often happens after price has already moved meaningfully — wait for price to pull back and touch the EMA-9 after the crossover has occurred. Enter on that touch with your stop placed below EMA-21. This gives a materially better risk/reward than chasing the initial cross, since your stop is much closer to your entry.</p>

      <h3>When to Avoid EMA Crossovers</h3>
      <p>Choppy, sideways markets generate frequent false crossovers (whipsaws) as the EMAs cross back and forth without a real trend developing. Always confirm price is above both EMA-50 and EMA-200 before trusting a 9/21 cross.</p>

      <h3>Stop Placement and Exit</h3>
      <p>Place your stop below EMA-21 — a close beneath it suggests the trend is weakening. Exit the position when EMA-9 crosses back below EMA-21, signaling the short-term momentum has reversed.</p>
    `,
    keyConcept: {
      title: 'Key Concept',
      text: 'The cleanest EMA crossover signals happen when all four EMAs are stacked in perfect order (9 > 21 > 50 > 200). That alignment is rare, but when it appears, it signals one of the strongest and most persistent uptrends in the market.',
    },
    quiz: [
      {
        question: 'A bullish EMA crossover occurs when:',
        options: ['EMA-21 crosses above EMA-9', 'EMA-9 crosses above EMA-21', 'Both EMAs cross the 200-day SMA', 'Price gaps above EMA-50'],
        correct: 1,
        explanation: 'The faster EMA-9 rising above the slower EMA-21 signals short-term strength overtaking medium-term trend.',
      },
      {
        question: 'Why is a pullback entry to EMA-9 better than buying the crossover directly?',
        options: ["It's riskier but more exciting", 'It provides better risk/reward since stop is closer to entry', 'It gives more time to confirm the trade', 'Pullback entries always win'],
        correct: 1,
        explanation: 'Waiting for price to return to EMA-9 means your stop (below EMA-21) is closer, so you risk less while targeting the same profit.',
      },
      {
        question: 'EMA crossover signals should be AVOIDED in which market condition?',
        options: ['Strong uptrend with all EMAs stacked', 'Price above all four EMAs', 'Choppy, sideways-trending market', 'After a pullback in an uptrend'],
        correct: 2,
        explanation: 'Sideways markets create whipsaws — the EMAs cross frequently but in opposite directions, generating many false signals.',
      },
    ],
    simSection: 'ai-trader',
    simStrategy: 'ema_crossover',
  },
  {
    id: 15,
    title: 'Swing Trading vs. Day Trading',
    week: 3,
    day: 15,
    readTime: '7 min read',
    objectives: [
      'Distinguish swing trading from day trading in timeframe and risk',
      'Understand the PDT rule and its capital requirements',
      'Choose the right style based on your personality and schedule',
    ],
    content: `
      <h3>Day Trading</h3>
      <p>Day trading means closing all positions before the market closes — no overnight holds. Day traders often make anywhere from 5 to 30+ trades per day on 1-5 minute charts, requiring active monitoring throughout market hours. Typical targets are $0.20-$1.00+ per share. The <strong>Pattern Day Trader (PDT) Rule</strong> applies if you make four or more day trades within five business days in a margin account — once triggered, you must maintain a $25,000 minimum account balance.</p>

      <h3>Swing Trading</h3>
      <p>Swing trading means holding positions for roughly 2-10 days (occasionally longer), trading 2-5 setups per week off daily or 4-hour charts. It's compatible with a day job, since you can review charts in the morning and evening rather than constantly. Typical targets are 5-20% per trade, and the PDT rule doesn't apply since these aren't same-day round trips. The tradeoff: overnight gaps can work for or against an open swing position.</p>

      <h3>Tax Implications</h3>
      <p>Day trades are taxed as short-term capital gains (effectively ordinary income rates). Positions held over one year qualify for more favorable long-term capital gains rates — a consideration worth factoring into your overall strategy, though it should never override sound trade management.</p>

      <h3>Personality Match</h3>
      <p>Day trading tends to suit high-energy, fast decision-makers who can commit full-time attention during market hours. Swing trading tends to suit more analytical thinkers who prefer fewer, higher-quality setups and the time to think through a thesis before acting.</p>

      <h3>Starting Recommendation</h3>
      <p>Most beginners have meaningfully better success starting with swing trading. It removes the split-second pressure of day trading while still letting you build real pattern recognition and discipline.</p>
    `,
    keyConcept: {
      title: 'Key Concept',
      text: 'Most successful retail traders start with swing trading — it gives you time to research setups, think through your thesis, and avoid the emotional pressure of watching every tick. Master swing first, then consider day trading.',
    },
    quiz: [
      {
        question: 'The Pattern Day Trader (PDT) rule applies when:',
        options: ['You make more than 10 trades per year', 'You make 4+ day trades within 5 business days in a margin account', 'Your account exceeds $100,000', 'You trade options'],
        correct: 1,
        explanation: 'PDT is triggered by 4+ round-trip day trades in 5 business days in a US margin account.',
      },
      {
        question: 'What is the minimum account balance required to be classified as a Pattern Day Trader without restrictions?',
        options: ['$5,000', '$10,000', '$25,000', '$100,000'],
        correct: 2,
        explanation: 'The SEC/FINRA PDT rule requires $25,000 minimum equity in a margin account.',
      },
      {
        question: 'Which trading style is generally more suitable for someone with a full-time job?',
        options: ['Day trading (1-minute charts)', 'Swing trading (daily charts)', 'Scalping', 'High-frequency trading'],
        correct: 1,
        explanation: 'Swing trading positions can be analyzed in the morning and evening, making it compatible with other commitments.',
      },
    ],
    simSection: 'my-desk',
    simStrategy: null,
  },
  {
    id: 16,
    title: 'Scalping Fundamentals',
    week: 3,
    day: 16,
    readTime: '6 min read',
    objectives: [
      'Understand how scalping works mechanically',
      'Identify ideal conditions for scalping',
      'Recognize why most retail traders should not scalp',
    ],
    content: `
      <h3>What Is Scalping?</h3>
      <p>Scalping means making 10 to 100+ small-profit trades per day, targeting roughly $0.05-$0.30 per share, with holding times ranging from seconds to a few minutes on 1-minute charts. It's the fastest, most mechanically demanding style covered in this curriculum.</p>

      <h3>What Scalping Requires</h3>
      <ul>
        <li>A direct-access broker, not a commission-free retail app reliant on payment-for-order-flow routing</li>
        <li>Tight bid/ask spreads — only the most liquid names like AAPL, SPY, or QQQ qualify</li>
        <li>The ability to read a Level 2 order book to anticipate very short-term moves</li>
        <li>Fast, reliable execution infrastructure</li>
        <li>Extreme discipline — taking a $0.05 loss immediately rather than hoping for a recovery</li>
      </ul>

      <h3>Ideal Scalping Conditions</h3>
      <ul>
        <li>High relative volume (2x+ normal)</li>
        <li>A clear trend or defined range visible on the 1-minute chart</li>
        <li>A liquid ticker with tight $0.01-$0.02 spreads</li>
        <li>Active market hours — typically 9:30-11:00 AM and 3:00-4:00 PM ET</li>
      </ul>

      <h3>Why Most Retail Traders Fail at Scalping</h3>
      <p>Commission and spread costs eat into tiny per-trade profits far more than they do on swing trades. The pace of constant rapid decisions produces real emotional fatigue. Retail order routing is also simply slower than professional high-frequency systems, and the PDT rule restricts accounts under $25,000 from the trade frequency scalping requires.</p>

      <h3>Who Scalping Is Right For</h3>
      <p>Scalping is best suited to experienced traders with professional-grade infrastructure, capital well above the PDT threshold, and a proven track record built first in slower styles like swing or day trading.</p>
    `,
    keyConcept: {
      title: 'Key Concept',
      text: "Scalping rewards speed and discipline above prediction. It's less about reading charts and more about reacting to order flow before others do. Master swing trading and then day trading before ever attempting scalping.",
    },
    quiz: [
      {
        question: 'The typical profit target per share for a scalp trade is:',
        options: ['$5-$10', '$1-$2', '$0.05-$0.30', '$50+'],
        correct: 2,
        explanation: 'Scalpers target tiny per-share gains but trade large quantities.',
      },
      {
        question: "Which tool is essential for scalping that typical retail platforms don't emphasize?",
        options: ['Bollinger Bands', 'Level 2 order book', 'Weekly moving averages', 'P/E ratio'],
        correct: 1,
        explanation: 'Level 2 shows the depth of buy and sell orders, allowing scalpers to see where price will encounter resistance or support.',
      },
      {
        question: 'Why do retail traders struggle to profit from scalping compared to professional traders?',
        options: [
          'Retail traders are less intelligent',
          'Professional traders have faster execution, better order routing, and lower transaction costs',
          'Scalping only works on certain exchanges',
          'Retail traders can only trade once per day',
        ],
        correct: 1,
        explanation: 'HFT firms and professional desks have infrastructure advantages — sub-millisecond execution and near-zero costs — that make competing very difficult for retail participants.',
      },
    ],
    simSection: 'my-desk',
    simStrategy: null,
  },
  {
    id: 17,
    title: 'Reading Market Direction',
    week: 3,
    day: 17,
    readTime: '7 min read',
    objectives: [
      'Assess whether the market is in bull, bear, or choppy conditions',
      'Use SPY and QQQ as market health proxies',
      'Understand sector rotation and what it signals',
    ],
    content: `
      <h3>Why Market Direction Matters</h3>
      <p>Roughly 75% of individual stocks follow the direction of the broader market — meaning even a textbook-perfect setup can fail simply because it was fighting a bear market. Checking market direction first is one of the highest-leverage habits a trader can build.</p>

      <h3>Bull Market Signals</h3>
      <ul>
        <li>SPY and QQQ trading above their 200-day SMAs</li>
        <li>New 52-week highs expanding faster than new 52-week lows</li>
        <li>VIX (the market's fear gauge) below 20</li>
        <li>Most sectors participating in the uptrend</li>
      </ul>

      <h3>Bear Market Signals</h3>
      <ul>
        <li>SPY trading below its 200-day SMA</li>
        <li>VIX above 30, reflecting elevated fear</li>
        <li>New 52-week lows expanding</li>
        <li>Most chart setups breaking down rather than following through</li>
      </ul>

      <h3>Choppy Market</h3>
      <p>A choppy market shows price oscillating around the 200-day SMA, crossing back and forth without committing to a direction. Signals conflict and false breakouts are common. The best response in this environment is to reduce position size and hold more cash rather than force trades.</p>

      <h3>Sector Rotation</h3>
      <p>In risk-on environments, technology (XLK), consumer discretionary (XLY), and other growth sectors tend to lead. In risk-off environments, defensive sectors like utilities (XLU), healthcare (XLV), and consumer staples (XLP) tend to outperform. Following sector rotation helps you focus your search on where the strongest stocks are likely to be found.</p>

      <h3>The CANSLIM 'M' Check</h3>
      <p>Before any new long trade, a quick check of whether SPY is above its 50-day SMA serves as a fast, practical version of the CANSLIM "M" criterion covered in Lesson 9.</p>
    `,
    keyConcept: {
      title: 'Key Concept',
      text: 'Even the best-looking stock setup will fail if the overall market is in a downtrend. Always check SPY direction before entering any long position. This single filter eliminates a huge percentage of losing trades.',
    },
    quiz: [
      {
        question: 'The VIX index measures:',
        options: ['The average stock price in the S&P 500', 'Implied volatility and market fear', 'The number of new 52-week highs', 'Trading volume on the NYSE'],
        correct: 1,
        explanation: 'VIX (CBOE Volatility Index) measures expected volatility — high VIX = high fear, low VIX = complacency.',
      },
      {
        question: 'Which sector tends to OUTPERFORM during risk-off, bearish market conditions?',
        options: ['Technology (XLK)', 'Consumer Discretionary (XLY)', 'Utilities (XLU)', 'Semiconductors'],
        correct: 2,
        explanation: 'Utilities are defensive — people pay electric bills regardless of the economy, making them safe havens in downturns.',
      },
      {
        question: 'When SPY is below its 200-day SMA, the recommended trading approach is:',
        options: ['Aggressively buy growth stocks', 'Increase leverage', 'Reduce position sizes and increase cash allocation', 'Switch exclusively to shorting'],
        correct: 2,
        explanation: 'When the broad market is below its 200 SMA, win rates for long trades drop significantly — preservation of capital takes priority.',
      },
    ],
    simSection: 'research',
    simStrategy: null,
  },
  {
    id: 18,
    title: 'Trading Psychology',
    week: 3,
    day: 18,
    readTime: '7 min read',
    objectives: [
      'Identify the 5 most common emotional trading mistakes',
      'Understand how cognitive biases affect trading decisions',
      'Build habits that counteract psychological biases',
    ],
    content: `
      <h3>Why Psychology Is the Hardest Part</h3>
      <p>Market mechanics — chart reading, indicators, strategy rules — can be learned in a matter of weeks. Controlling the emotions that come with real (or even paper) money on the line takes years of deliberate practice. Most trading failures trace back to psychology, not lack of technical knowledge.</p>

      <h3>The 5 Most Costly Trading Biases</h3>
      <ol>
        <li><strong>FOMO (Fear of Missing Out):</strong> chasing a stock after it's already moved 20%, which tends to mean buying near a short-term top</li>
        <li><strong>Revenge Trading:</strong> taking bigger, riskier trades immediately after a loss to "make it back" — this routinely turns one small loss into an account-threatening one</li>
        <li><strong>Overconfidence Bias:</strong> mistaking a winning streak for skill rather than partly luck, leading to oversized positions and abandoned rules</li>
        <li><strong>Loss Aversion:</strong> holding losing trades too long hoping they'll "come back," while cutting winning trades short out of fear of giving back gains</li>
        <li><strong>Anchoring:</strong> fixating on a prior price ("I'll sell when it gets back to $X") instead of reacting to current conditions</li>
      </ol>

      <h3>The Trading Journal</h3>
      <p>A detailed trading journal is the single most effective antidote to all five biases above. For every trade, record the ticker, date, entry/exit, strategy used, your reasoning, your emotional state before the trade, your emotional state after, and what you'd do differently. Review the journal weekly, specifically looking for patterns that separate your winners from your losers.</p>

      <h3>Rules for Emotional Discipline</h3>
      <ul>
        <li>Pre-set all stops before entering a trade — never decide your exit in the heat of the moment</li>
        <li>Use position sizing deliberately so that any single loss feels emotionally tolerable</li>
        <li>Take a mandatory break after three consecutive losses</li>
        <li>Never trade when angry, exhausted, or distracted</li>
      </ul>
    `,
    keyConcept: {
      title: 'Key Concept',
      text: 'Professional traders lose on 40-50% of their trades — their edge is not accuracy, it\'s asymmetry: small, disciplined losses and large, patient wins. Every bias above destroys that asymmetry by making losses large and wins small.',
    },
    quiz: [
      {
        question: '"Revenge trading" refers to:',
        options: [
          'Reporting a broker for unfair execution',
          'Taking larger, riskier trades after a loss to quickly recover',
          'Trading the same stock that caused a previous loss',
          'Using high leverage on every trade',
        ],
        correct: 1,
        explanation: 'Revenge trading is emotionally driven position-taking after a loss — it typically compounds losses.',
      },
      {
        question: 'Loss aversion in trading typically leads to:',
        options: [
          'Cutting losses quickly and letting winners run',
          'Holding losing positions too long while selling winning positions too early',
          'Never entering a trade',
          'Using stops consistently',
        ],
        correct: 1,
        explanation: 'Behavioral economics shows people feel losses ~2x as strongly as equivalent gains — this makes traders hold losers (hoping for recovery) while selling winners (locking in the "good feeling").',
      },
      {
        question: 'What is the most recommended practice to identify and overcome your own trading biases?',
        options: ['Watch more financial news', 'Use more technical indicators', 'Keep a detailed trading journal and review it weekly', 'Trade with larger position sizes'],
        correct: 2,
        explanation: 'A journal externalizes your decisions, allowing you to see patterns in your behavior that are invisible in the moment.',
      },
    ],
    simSection: 'my-desk',
    simStrategy: null,
  },
  {
    id: 19,
    title: 'Building Your Trading Plan',
    week: 3,
    day: 19,
    readTime: '7 min read',
    objectives: [
      'Understand why a written trading plan is non-negotiable',
      'Define all components of a complete trading plan',
      'Set realistic performance expectations',
    ],
    content: `
      <h3>What Is a Trading Plan?</h3>
      <p>A trading plan is a written document that defines every decision you will make in the market — before the market opens, while you're calm and objective. Without one, you're making consequential decisions reactively, under time pressure, often at the worst possible moments emotionally.</p>

      <h3>The 8 Required Components</h3>
      <ol>
        <li><strong>Strategies:</strong> which one or two strategies you trade, and why they fit you</li>
        <li><strong>Instruments:</strong> which stocks or ETFs you focus on, and the criteria for adding something to your watchlist</li>
        <li><strong>Entry Rules:</strong> the exact, objective conditions that must be true before you enter</li>
        <li><strong>Exit Rules:</strong> both your profit target conditions and your stop-loss conditions</li>
        <li><strong>Position Sizing:</strong> the maximum percentage of your account you'll commit to any one trade (commonly 5-10%)</li>
        <li><strong>Max Daily Loss:</strong> the dollar or percentage amount (commonly −2% to −3% of account) at which you stop trading for the day, no exceptions</li>
        <li><strong>Review Schedule:</strong> a weekly journal review and a monthly performance review, both calendared in advance</li>
        <li><strong>What You Will NOT Do:</strong> an explicit list of your known weaknesses — no chasing, no revenge trading, no trading the first five minutes of the session, etc.</li>
      </ol>

      <h3>Realistic Expectations</h3>
      <p>In your first year, simply not losing money is a meaningful win — capital preservation while you build skill counts as success. Genuinely good traders tend to compound 15-30% annually, consistently, over time. Anyone advertising 200%+ monthly returns is either extraordinarily lucky in the short term or not being honest.</p>

      <h3>The Plan Is Not Enough</h3>
      <p>Writing the plan is the easy part. The real work is honoring it — especially in the exact moments when following it feels hardest, like staying out of a trade that "looks too good to pass up" or taking a stop you don't want to take. The discipline to execute the plan you wrote when calm, while under pressure, is what actually separates consistently profitable traders from everyone else.</p>
    `,
    keyConcept: {
      title: 'Key Concept',
      text: "A trading plan doesn't guarantee profits — it guarantees you won't make impulsive decisions that blow up your account. The discipline to follow a plan in real-time, under pressure, is what separates consistently profitable traders from everyone else.",
    },
    quiz: [
      {
        question: 'What is the primary purpose of a maximum daily loss limit in a trading plan?',
        options: [
          'To ensure you never lose money',
          'To prevent emotional revenge trading from turning a bad day into a catastrophic one',
          'To comply with SEC regulations',
          'To maximize the number of trades per day',
        ],
        correct: 1,
        explanation: 'A daily loss limit forces you to stop before emotional trading compounds your losses.',
      },
      {
        question: 'A realistic annual return target for a skilled retail trader is:',
        options: ['5x the account (500%)', '100% monthly', '15-30% per year', "0% (it's impossible to beat the market)"],
        correct: 2,
        explanation: 'Consistent 15-30% annual returns are exceptional by professional standards — claims of far higher returns are usually survivorship bias or fraud.',
      },
      {
        question: 'Which of these belongs in a trading plan\'s "What I Will NOT Do" section?',
        options: [
          'Entry criteria for CANSLIM',
          'Maximum position size per trade',
          '"I will not chase stocks that have already moved more than 5% from the ideal buy point"',
          'Which brokerage to use',
        ],
        correct: 2,
        explanation: 'Documenting known weaknesses and explicitly forbidding them in writing is a powerful behavioral commitment device.',
      },
    ],
    simSection: 'my-desk',
    simStrategy: null,
  },
  {
    id: 20,
    title: 'Paper Trading Challenge (Capstone)',
    week: 3,
    day: 20,
    readTime: '8 min read',
    objectives: [
      'Apply all learned strategies in a structured 5-day paper trading challenge',
      'Evaluate performance using a professional rubric',
      'Identify patterns in your trading and areas for improvement',
    ],
    content: `
      <h3>The Purpose of Paper Trading</h3>
      <p>Paper trading proves a strategy works with your specific execution before any real capital is at risk. It also reveals real emotional reactions — surprisingly, many traders still feel anxiety, FOMO, or hesitation even when no real money is on the line, which shows just how much of trading is habit and process rather than pure analysis.</p>

      <h3>The 5-Day Challenge Structure</h3>
      <ul>
        <li><strong>Day 1 (Setup):</strong> choose two strategies from the app, write down your exact entry/exit rules, select three watchlist stocks, and set a maximum daily loss of 2%</li>
        <li><strong>Day 2 (Active Trading):</strong> execute trades using only your pre-defined rules, logging every trade with reasoning and the emotion you felt while taking it</li>
        <li><strong>Day 3 (Active Trading):</strong> continue trading, and compare your own signals against the AI Trader's signals on the same tickers — are you spotting the same setups, or diverging?</li>
        <li><strong>Day 4 (Active Trading):</strong> shift focus to execution quality — are you entering at the prices your plan calls for? Are you actually honoring your stops?</li>
        <li><strong>Day 5 (Review & Analysis):</strong> close all open positions and complete your full review</li>
      </ul>

      <h3>The Evaluation Rubric (score yourself 1-5 on each)</h3>
      <ol>
        <li><strong>Rule Adherence:</strong> did you follow your entry/exit rules every single time?</li>
        <li><strong>Risk Management:</strong> did you keep every loss under 2% of your portfolio?</li>
        <li><strong>R-Multiple Average:</strong> were your winning trades meaningfully larger than your losing trades?</li>
        <li><strong>Emotional Control:</strong> did you avoid revenge trading or chasing after missing a setup?</li>
        <li><strong>Improvement Identification:</strong> can you name three specific things to improve next time?</li>
      </ol>

      <h3>What Great Traders Do After Every Week</h3>
      <p>Calculate your win rate, your average R-multiple, and your overall expectancy:</p>
      <p><strong>Expectancy = (Win% × Avg Win R) − (Loss% × Avg Loss R)</strong></p>
      <p>A positive expectancy means your process is mathematically sustainable over a large enough sample of trades.</p>

      <h3>Next Steps After Completing TradeIQ</h3>
      <p>Continue paper trading for another 30-60 days before considering real money. If and when you do go live, start with minimal capital — its purpose at that stage is to test your psychology under genuinely real conditions, not to make meaningful returns yet. And keep your trading journal forever; it remains the single highest-leverage habit in this entire curriculum.</p>
    `,
    keyConcept: {
      title: 'Key Concept',
      text: 'Paper trading is not just practice — it is how you prove a strategy works before risking real capital. A positive-expectancy paper trading record over 60+ trades is the only rational justification for deploying real money into a strategy.',
    },
    quiz: [
      {
        question: "What is the purpose of comparing your paper trades to the AI Trader's signals during the challenge?",
        options: ['To copy the AI exactly', "To see if you're identifying the same setups and where your analysis differs", "To beat the AI's performance", 'To report bugs in the AI'],
        correct: 1,
        explanation: 'The comparison reveals whether you\'re correctly applying strategy rules and where your interpretation diverges from objective signals.',
      },
      {
        question: 'The trading expectancy formula is:',
        options: ['Total wins / Total trades', '(Win% × Avg Win R) − (Loss% × Avg Loss R)', 'Total profit / Total risk', 'Win rate + Average R-multiple'],
        correct: 1,
        explanation: 'Expectancy tells you the average R-multiple per trade you can expect over many trades — positive expectancy = long-term profitability.',
      },
      {
        question: 'After finishing the 5-day paper trading challenge, the recommended next step is:',
        options: [
          'Immediately invest all your savings in real trades',
          'Continue paper trading for 30-60 more days and maintain a journal before risking any real capital',
          'Stop trading entirely',
          'Switch to a completely different strategy',
        ],
        correct: 1,
        explanation: '5 days is not enough data to validate a strategy — 60+ trades gives you statistical confidence in your execution and expectancy.',
      },
    ],
    simSection: 'ai-trader',
    simStrategy: null,
  },
];

const LessonsSection = (() => {
  let state = {
    activeLessonId: 1,
    progress: [], // [{lessonNumber, completed, completedAt, quizScore}]
    quizAnswers: {}, // lessonId -> { qIndex: selectedOption }
  };

  function getLessonById(id) {
    return LESSONS.find((l) => l.id === id);
  }

  function isCompleted(lessonId) {
    const p = state.progress.find((p) => p.lessonNumber === lessonId);
    return p ? p.completed : false;
  }

  async function render(params) {
    const content = document.getElementById('content-area');
    content.innerHTML = `<div class="empty-state"><span class="spinner"></span> Loading lessons...</div>`;

    try {
      state.progress = await api.get('/lessons/progress');
    } catch (err) {
      console.error('Failed to load lesson progress:', err);
      state.progress = [];
    }

    if (params && params.lessonId) {
      state.activeLessonId = params.lessonId;
    }

    renderLayout();
  }

  function renderLayout() {
    const content = document.getElementById('content-area');
    const completedCount = state.progress.filter((p) => p.completed).length;
    const pct = Math.round((completedCount / 20) * 100);

    content.innerHTML = `
      <div class="lessons-layout">
        <div class="card">
          <div class="lessons-progress-header">
            <div class="lessons-progress-label"><span>${completedCount} / 20 Complete</span><span>${pct}%</span></div>
            <div class="lessons-progress-track"><div class="lessons-progress-fill" style="width:${pct}%;"></div></div>
          </div>
          <nav id="lessons-nav"></nav>
        </div>
        <div class="card lesson-content-card" id="lesson-content-card"></div>
      </div>
    `;

    renderNav();
    renderLessonContent(state.activeLessonId);
  }

  function renderNav() {
    const nav = document.getElementById('lessons-nav');
    const weeks = [
      { week: 1, label: 'Week 1 · Market Foundations', lessons: LESSONS.filter((l) => l.week === 1) },
      { week: 2, label: 'Week 2 · Trading Strategies', lessons: LESSONS.filter((l) => l.week === 2) },
      { week: 3, label: 'Week 3 · Advanced & Psychology', lessons: LESSONS.filter((l) => l.week === 3) },
    ];

    nav.innerHTML = weeks.map((w) => `
      <div class="week-group-header">${w.label}</div>
      ${w.lessons.map((l) => `
        <button class="lesson-nav-item ${l.id === state.activeLessonId ? 'active' : ''} ${isCompleted(l.id) ? 'completed' : ''}" data-lesson-id="${l.id}">
          <span class="lesson-num">${l.id}</span>
          <span class="lesson-title-text">${l.title}</span>
          ${isCompleted(l.id) ? '<i class="fa-solid fa-check check-icon"></i>' : ''}
        </button>
      `).join('')}
    `).join('');

    nav.querySelectorAll('.lesson-nav-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activeLessonId = Number(btn.dataset.lessonId);
        renderLayout();
      });
    });
  }

  function renderLessonContent(lessonId) {
    const lesson = getLessonById(lessonId);
    if (!lesson) return;

    const card = document.getElementById('lesson-content-card');
    const completed = isCompleted(lesson.id);

    card.innerHTML = `
      <div class="lesson-meta-badges">
        <span class="lesson-meta-badge">Week ${lesson.week} · Day ${lesson.day}</span>
        <span class="lesson-meta-badge"><i class="fa-regular fa-clock"></i> ${lesson.readTime}</span>
      </div>
      <h1>${lesson.title}</h1>

      <div class="lesson-objectives-card">
        <div class="obj-title">Learning Objectives</div>
        <ul>${lesson.objectives.map((o) => `<li>${o}</li>`).join('')}</ul>
      </div>

      <div class="lesson-body">${lesson.content}</div>

      <div class="key-concept-box">
        <div class="kc-title">${lesson.keyConcept.title}</div>
        <p class="kc-text">${lesson.keyConcept.text}</p>
      </div>

      <div class="quiz-section">
        <div class="quiz-section-title">📝 Quick Quiz</div>
        <div id="quiz-container"></div>
        <div id="quiz-score-banner"></div>
      </div>

      <div class="lesson-actions-row">
        ${lesson.simSection ? `<button class="btn btn-primary" id="try-in-sim-btn"><i class="fa-solid fa-flask"></i> Try It in the Sim</button>` : ''}
        <button class="btn ${completed ? 'btn-green' : 'btn-primary'}" id="mark-complete-btn" ${completed ? 'disabled' : ''}>
          ${completed ? '<i class="fa-solid fa-check"></i> Completed' : 'Mark Complete'}
        </button>
      </div>

      <div class="lesson-nav-buttons">
        <button class="btn" id="prev-lesson-btn" ${lesson.id <= 1 ? 'disabled' : ''}><i class="fa-solid fa-arrow-left"></i> Previous</button>
        <button class="btn" id="next-lesson-btn" ${lesson.id >= 20 ? 'disabled' : ''}>Next <i class="fa-solid fa-arrow-right"></i></button>
      </div>
    `;

    renderQuiz(lesson);

    if (lesson.simSection) {
      document.getElementById('try-in-sim-btn').addEventListener('click', () => {
        window.TradeIQApp.goToSection(lesson.simSection, lesson.simStrategy ? { strategy: lesson.simStrategy } : undefined);
      });
    }

    document.getElementById('mark-complete-btn').addEventListener('click', () => handleMarkComplete(lesson.id));
    document.getElementById('prev-lesson-btn')?.addEventListener('click', () => {
      state.activeLessonId = lesson.id - 1;
      renderLayout();
      scrollToTop();
    });
    document.getElementById('next-lesson-btn')?.addEventListener('click', () => {
      state.activeLessonId = lesson.id + 1;
      renderLayout();
      scrollToTop();
    });

    scrollToTop();
  }

  function scrollToTop() {
    const card = document.getElementById('lesson-content-card');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderQuiz(lesson) {
    const container = document.getElementById('quiz-container');
    if (!container) return;
    state.quizAnswers[lesson.id] = state.quizAnswers[lesson.id] || {};

    container.innerHTML = lesson.quiz.map((q, qIndex) => `
      <div class="quiz-question" data-q-index="${qIndex}">
        <div class="quiz-question-text">Q${qIndex + 1}: ${q.question}</div>
        <div class="quiz-options">
          ${q.options.map((opt, oIndex) => `
            <button class="quiz-option-btn" data-q-index="${qIndex}" data-o-index="${oIndex}">${opt}</button>
          `).join('')}
        </div>
        <div class="quiz-explanation-slot"></div>
      </div>
    `).join('');

    container.querySelectorAll('.quiz-option-btn').forEach((btn) => {
      btn.addEventListener('click', () => handleQuizAnswer(lesson, Number(btn.dataset.qIndex), Number(btn.dataset.oIndex)));
    });

    updateQuizScoreBanner(lesson);
  }

  function handleQuizAnswer(lesson, qIndex, oIndex) {
    if (state.quizAnswers[lesson.id][qIndex] !== undefined) return; // already answered
    state.quizAnswers[lesson.id][qIndex] = oIndex;

    const question = lesson.quiz[qIndex];
    const questionEl = document.querySelector(`.quiz-question[data-q-index="${qIndex}"]`);
    const optionBtns = questionEl.querySelectorAll('.quiz-option-btn');

    optionBtns.forEach((btn) => {
      const btnOIndex = Number(btn.dataset.oIndex);
      btn.disabled = true;
      if (btnOIndex === question.correct) btn.classList.add('correct');
      if (btnOIndex === oIndex && oIndex !== question.correct) btn.classList.add('incorrect');
    });

    const slot = questionEl.querySelector('.quiz-explanation-slot');
    const isCorrect = oIndex === question.correct;
    slot.innerHTML = `<div class="quiz-explanation ${isCorrect ? 'right' : 'wrong'}">${isCorrect ? '✅ Correct! ' : '❌ Not quite. '}${question.explanation}</div>`;

    updateQuizScoreBanner(lesson);
  }

  function updateQuizScoreBanner(lesson) {
    const answers = state.quizAnswers[lesson.id] || {};
    const answeredCount = Object.keys(answers).length;
    const banner = document.getElementById('quiz-score-banner');
    if (!banner) return;

    if (answeredCount < lesson.quiz.length) {
      banner.innerHTML = '';
      return;
    }

    const correctCount = lesson.quiz.filter((q, i) => answers[i] === q.correct).length;
    banner.innerHTML = `<div class="quiz-score-banner">${correctCount}/${lesson.quiz.length} correct</div>`;
  }

  async function handleMarkComplete(lessonId) {
    const answers = state.quizAnswers[lessonId] || {};
    const lesson = getLessonById(lessonId);
    const answeredCount = Object.keys(answers).length;
    let quizScore = null;
    if (answeredCount === lesson.quiz.length) {
      const correctCount = lesson.quiz.filter((q, i) => answers[i] === q.correct).length;
      quizScore = Math.round((correctCount / lesson.quiz.length) * 100);
    }

    try {
      await api.post(`/lessons/${lessonId}/complete`, { quizScore });
      state.progress = await api.get('/lessons/progress');
      renderLayout();
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
      alert(err.message || 'Failed to save progress');
    }
  }

  return { render, LESSONS };
})();

window.LessonsSection = LessonsSection;
window.LESSONS = LESSONS;
