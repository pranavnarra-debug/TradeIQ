/* ============================================================
   TradeIQ — lessons.js
   Step-based interactive lesson player.
   Each lesson is a sequence of small steps (intro, concept, check,
   keyConcept, quiz, complete) rendered one at a time, like a guided
   walkthrough rather than a single long scroll.
   ============================================================ */

/**
 * Builds an inline animated SVG showing an EMA-9/EMA-21 bullish crossover.
 * Used as the signature visual for Lesson 4's concept steps.
 */
function buildEmaCrossoverSvg() {
  return `
    <svg viewBox="0 0 560 200" style="width:100%;max-width:520px;height:auto;" role="img" aria-label="Animated chart showing the 9-day EMA crossing above the 21-day EMA">
      <line x1="20" y1="170" x2="540" y2="170" stroke="var(--border)" stroke-width="1"/>
      <path d="M20,140 C100,150 160,160 220,150 C280,140 340,110 400,90 C460,70 500,55 540,40"
            fill="none" stroke="#bc8cff" stroke-width="2" opacity="0.8">
        <animate attributeName="stroke-dasharray" from="0,600" to="600,0" dur="1.6s" fill="freeze"/>
      </path>
      <path d="M20,150 C100,155 160,158 220,145 C280,125 340,95 400,70 C460,50 500,42 540,30"
            fill="none" stroke="#58a6ff" stroke-width="2.5">
        <animate attributeName="stroke-dasharray" from="0,600" to="600,0" dur="1.6s" begin="0.15s" fill="freeze"/>
      </path>
      <circle cx="295" cy="118" r="0" fill="#3fb950">
        <animate attributeName="r" from="0" to="6" dur="0.3s" begin="1.5s" fill="freeze"/>
      </circle>
      <text x="295" y="100" text-anchor="middle" font-size="11" fill="#3fb950" opacity="0" font-weight="600">
        <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="1.6s" fill="freeze"/>
        Bullish cross
      </text>
      <text x="545" y="32" font-size="11" fill="#58a6ff" text-anchor="start">EMA-9</text>
      <text x="545" y="42" font-size="11" fill="#bc8cff" text-anchor="start">EMA-21</text>
    </svg>
  `;
}

/**
 * Builds an inline static SVG showing the four-EMA "stack" (9 > 21 > 50 > 200).
 */
function buildEmaStackSvg() {
  return `
    <svg viewBox="0 0 520 160" style="width:100%;max-width:460px;height:auto;" role="img" aria-label="Diagram showing EMA-9 above EMA-21 above EMA-50 above EMA-200, a bullish stack">
      <rect x="20" y="20" width="480" height="26" rx="6" fill="rgba(88,166,255,0.15)"/>
      <text x="34" y="38" font-size="12.5" fill="#58a6ff" font-weight="600">EMA-9 (fastest)</text>
      <rect x="20" y="56" width="480" height="26" rx="6" fill="rgba(188,140,255,0.15)"/>
      <text x="34" y="74" font-size="12.5" fill="#bc8cff" font-weight="600">EMA-21</text>
      <rect x="20" y="92" width="480" height="26" rx="6" fill="rgba(210,153,34,0.15)"/>
      <text x="34" y="110" font-size="12.5" fill="#d29922" font-weight="600">EMA-50</text>
      <rect x="20" y="128" width="480" height="26" rx="6" fill="rgba(139,148,158,0.15)"/>
      <text x="34" y="146" font-size="12.5" fill="#8b949e" font-weight="600">EMA-200 (slowest)</text>
    </svg>
  `;
}

/**
 * Builds an inline SVG showing an RSI oscillator with overbought/oversold zones.
 * Used in Lesson 5.
 */
function buildRsiZonesSvg() {
  return `
    <svg viewBox="0 0 560 180" style="width:100%;max-width:520px;height:auto;" role="img" aria-label="RSI oscillator diagram showing overbought zone above 70, oversold zone below 30, and neutral zone between">
      <rect x="20" y="16" width="520" height="36" fill="rgba(248,81,73,0.1)"/>
      <text x="30" y="38" font-size="12" fill="#f85149" font-weight="600">Overbought (RSI &gt; 70)</text>
      <rect x="20" y="52" width="520" height="76" fill="rgba(139,148,158,0.06)"/>
      <text x="30" y="94" font-size="12" fill="#8b949e" font-weight="600">Neutral zone</text>
      <rect x="20" y="128" width="520" height="36" fill="rgba(63,185,80,0.1)"/>
      <text x="30" y="150" font-size="12" fill="#3fb950" font-weight="600">Oversold (RSI &lt; 30)</text>
      <path d="M20,100 C80,60 120,40 160,45 C210,52 240,110 280,120 C320,130 360,70 400,50 C440,35 480,90 520,100"
            fill="none" stroke="#58a6ff" stroke-width="2.5">
        <animate attributeName="stroke-dasharray" from="0,700" to="700,0" dur="1.6s" fill="freeze"/>
      </path>
      <line x1="20" y1="52" x2="540" y2="52" stroke="#f85149" stroke-width="1" stroke-dasharray="4,4" opacity="0.5"/>
      <line x1="20" y1="128" x2="540" y2="128" stroke="#3fb950" stroke-width="1" stroke-dasharray="4,4" opacity="0.5"/>
    </svg>
  `;
}

/**
 * Builds an inline SVG showing MACD line, signal line, and histogram bars.
 * Used in Lesson 5 (taught conceptually — not currently computed by the backend).
 */
function buildMacdSvg() {
  return `
    <svg viewBox="0 0 560 190" style="width:100%;max-width:520px;height:auto;" role="img" aria-label="MACD diagram showing the MACD line crossing above the signal line with histogram bars below">
      <line x1="20" y1="90" x2="540" y2="90" stroke="var(--border)" stroke-width="1"/>
      <path d="M20,110 C100,115 160,118 220,105 C280,90 340,65 400,55 C460,48 500,44 540,40"
            fill="none" stroke="#8b949e" stroke-width="2" opacity="0.85">
        <animate attributeName="stroke-dasharray" from="0,600" to="600,0" dur="1.5s" fill="freeze"/>
      </path>
      <path d="M20,105 C100,108 160,112 220,112 C280,108 340,95 400,80 C460,68 500,60 540,52"
            fill="none" stroke="#58a6ff" stroke-width="2.5">
        <animate attributeName="stroke-dasharray" from="0,600" to="600,0" dur="1.5s" begin="0.15s" fill="freeze"/>
      </path>
      <circle cx="270" cy="100" r="0" fill="#3fb950">
        <animate attributeName="r" from="0" to="6" dur="0.3s" begin="1.4s" fill="freeze"/>
      </circle>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
        const x = 60 + i * 42;
        const h = [4, 6, 8, 5, 3, 6, 10, 14, 18, 22, 26, 30][i];
        const color = i < 5 ? '#f85149' : '#3fb950';
        return `<rect x="${x}" y="${150 - h}" width="14" height="${h}" fill="${color}" opacity="0.7"/>`;
      }).join('')}
      <text x="545" y="42" font-size="11" fill="#58a6ff" text-anchor="start">MACD</text>
      <text x="545" y="52" font-size="11" fill="#8b949e" text-anchor="start">Signal</text>
      <text x="22" y="172" font-size="10.5" fill="#6e7681">Histogram (MACD &minus; Signal)</text>
    </svg>
  `;
}

/**
 * Builds an inline SVG illustrating VWAP as a volume-weighted line vs. a simple average.
 * Used in Lesson 6.
 */
function buildVwapSvg() {
  return `
    <svg viewBox="0 0 560 180" style="width:100%;max-width:520px;height:auto;" role="img" aria-label="Diagram showing intraday price candles with the VWAP line running through them, pulled toward high-volume price levels">
      <line x1="20" y1="150" x2="540" y2="150" stroke="var(--border)" stroke-width="1"/>
      ${[
        [40, 60, 40, 18], [80, 50, 70, 26], [120, 45, 55, 14], [160, 70, 40, 10],
        [200, 40, 90, 34], [240, 35, 75, 30], [280, 55, 50, 16], [320, 30, 95, 38],
        [360, 60, 35, 12], [400, 50, 60, 22], [440, 40, 80, 28], [480, 65, 45, 16],
      ].map(([x, top, h, vol]) => `
        <rect x="${x}" y="${top}" width="16" height="${h}" rx="2" fill="#30363d"/>
        <rect x="${x}" y="${150 - vol}" width="16" height="${vol}" fill="rgba(88,166,255,0.18)"/>
      `).join('')}
      <path d="M20,95 C100,92 160,80 220,68 C280,58 340,62 400,58 C460,55 500,52 540,50"
            fill="none" stroke="#d29922" stroke-width="2.5">
        <animate attributeName="stroke-dasharray" from="0,600" to="600,0" dur="1.4s" fill="freeze"/>
      </path>
      <text x="545" y="52" font-size="11" fill="#d29922" text-anchor="start">VWAP</text>
      <text x="22" y="168" font-size="10.5" fill="#6e7681">Taller blue = heavier volume at that price &mdash; VWAP bends toward it</text>
    </svg>
  `;
}

const LESSONS = [
  {
    id: 1,
    title: 'How Stock Markets Work',
    week: 1,
    day: 1,
    readTime: '4 min',
    steps: [
      {
        type: 'intro',
        objectives: [
          'Understand what a stock represents as an ownership stake',
          'Learn how stock exchanges match buyers and sellers',
          'Know how market hours affect trading',
        ],
      },
      {
        type: 'concept',
        eyebrow: 'The basics',
        heading: 'A stock is a tiny slice of a company',
        text: "When you own one share, you own a fraction of the company's assets and future earnings. That ownership pays off two ways: <strong>dividends</strong> (direct cash payouts) and <strong>appreciation</strong> (the price rising as the market re-values the company).",
      },
      {
        type: 'check',
        prompt: 'What does owning a single share of a company actually mean?',
        options: ['You lent the company money', 'You own a small piece of the company', 'You have a coupon for a discount', 'Nothing until you sell it'],
        correct: 1,
        explanation: 'Stock is equity ownership — not a loan, not a coupon. You own a real fraction of the business.',
      },
      {
        type: 'concept',
        eyebrow: 'How trades happen',
        heading: 'Every price has two sides',
        text: 'The <strong>bid</strong> is the highest price a buyer will pay right now. The <strong>ask</strong> is the lowest price a seller will accept. <strong>Market makers</strong> keep both sides quoted constantly so trades can happen instantly instead of waiting for a perfect match.',
      },
      {
        type: 'concept',
        eyebrow: 'Timing',
        heading: 'Markets run on a schedule',
        text: 'Regular trading runs 9:30am–4:00pm ET, where most volume happens and spreads are tightest. Pre-market and after-hours sessions exist too, but with far fewer participants — prices can swing harder on less real information.',
      },
      {
        type: 'keyConcept',
        text: "A stock is a fractional ownership claim on a company's assets and earnings — its price reflects what buyers and sellers collectively agree it's worth right now.",
      },
      {
        type: 'quiz',
        questions: [
          {
            question: 'Which exchange is known for listing most major technology companies?',
            options: ['NYSE', 'NASDAQ', 'London Stock Exchange', 'Tokyo Stock Exchange'],
            correct: 1,
            explanation: 'NASDAQ is home to Apple, Google, Meta, and most major tech firms.',
          },
          {
            question: "When does the regular trading session end?",
            options: ['3:00 PM ET', '5:00 PM ET', '4:00 PM ET', '6:30 PM ET'],
            correct: 2,
            explanation: 'Regular hours run 9:30AM to 4:00PM Eastern Time.',
          },
        ],
      },
      { type: 'complete' },
    ],
    simSection: 'research',
    simStrategy: null,
  },
  {
    id: 4,
    title: 'Moving Averages (SMA & EMA)',
    week: 1,
    day: 4,
    readTime: '5 min',
    steps: [
      {
        type: 'intro',
        objectives: [
          'Explain the difference between SMA and EMA',
          'Identify the most important periods (9, 20, 50, 200)',
          'Recognize a Golden Cross and a bullish EMA crossover',
        ],
      },
      {
        type: 'concept',
        eyebrow: 'Why smooth the price',
        heading: 'A moving average is the noise filter',
        text: 'Day-to-day price wiggles are mostly noise. A moving average blends recent prices into one line so you can see the actual trend — up, down, or sideways — without getting distracted by every small move.',
      },
      {
        type: 'concept',
        eyebrow: 'Two flavors',
        heading: 'SMA treats every day equally. EMA does not.',
        text: 'The <strong>Simple Moving Average</strong> weighs every day in its window the same. The <strong>Exponential Moving Average</strong> weighs recent days more heavily, so it reacts faster to new information. Neither is "better" — EMA for speed, SMA for steadiness.',
      },
      {
        type: 'check',
        prompt: 'Which moving average reacts faster to a sudden price move?',
        options: ['SMA', 'EMA', 'They react identically', 'Neither reacts to price'],
        correct: 1,
        explanation: 'EMA weighs recent prices more heavily, so new information shows up in the line faster than with SMA.',
      },
      {
        type: 'concept',
        eyebrow: 'Watch this happen',
        heading: 'The bullish crossover',
        text: 'When the faster EMA-9 line crosses above the slower EMA-21 line, short-term momentum has just overtaken the medium-term trend — a classic early buy signal.',
        visual: 'emaCrossover',
      },
      {
        type: 'concept',
        eyebrow: 'The full picture',
        heading: 'The EMA stack',
        text: 'When EMA-9 sits above EMA-21, above EMA-50, above EMA-200 — every timeframe agrees the trend is up. This stacked alignment is one of the cleanest signs of real trend strength.',
        visual: 'emaStack',
      },
      {
        type: 'check',
        prompt: "A stock's 50-day SMA crossing above its 200-day SMA is called:",
        options: ['Death Cross', 'EMA Crossover', 'Golden Cross', 'Trend Reversal'],
        correct: 2,
        explanation: 'The Golden Cross is a classic long-term bullish signal institutions watch closely.',
      },
      {
        type: 'keyConcept',
        text: 'The 200-day moving average is the line between a bull market and a bear market for a stock. Institutions use it to decide whether to own a stock at all — respect it.',
      },
      {
        type: 'quiz',
        questions: [
          {
            question: 'When price is above the 200-day SMA, what does this generally indicate?',
            options: ['The stock is in a long-term downtrend', 'The stock is in a long-term uptrend', 'The stock is overvalued', 'Volatility is high'],
            correct: 1,
            explanation: 'Price above the 200-day SMA is widely accepted as the definition of a long-term uptrend.',
          },
          {
            question: 'In a fully bullish EMA stack, which line sits on top?',
            options: ['EMA-200', 'EMA-50', 'EMA-9', 'They are all equal'],
            correct: 2,
            explanation: 'The fastest-reacting line (EMA-9) sits highest in a bullish stack, since it reflects the most recent price strength.',
          },
        ],
      },
      { type: 'complete' },
    ],
    simSection: 'ai-trader',
    simStrategy: 'ema_crossover',
  },
  {
    id: 2,
    title: 'Reading a Stock Chart',
    week: 1,
    day: 2,
    readTime: '5 min',
    steps: [
      {
        type: 'intro',
        objectives: [
          'Interpret OHLCV (Open, High, Low, Close, Volume) data',
          'Choose the right chart timeframe for your trading style',
          'Understand the anatomy of a candlestick',
        ],
      },
      {
        type: 'concept',
        eyebrow: 'Five numbers, one shape',
        heading: 'OHLCV packs a lot into one candle',
        text: '<strong>Open</strong>, <strong>High</strong>, <strong>Low</strong>, <strong>Close</strong>, and <strong>Volume</strong> — all five matter. Price tells you where the stock ended up; volume tells you how much conviction was behind the move.',
      },
      {
        type: 'concept',
        eyebrow: 'Pick the right zoom',
        heading: 'Timeframe should match your style',
        text: 'Daily charts are the standard for swing trading. Zooming into 1-minute charts looking for "the perfect entry" often means missing the bigger trend that daily or weekly charts would show clearly.',
      },
      {
        type: 'check',
        prompt: 'A swing trader holding for 3-5 days should mainly plan using:',
        options: ['1-minute charts', 'Daily charts', 'Monthly charts', 'Tick charts'],
        correct: 1,
        explanation: 'Swing traders typically plan on daily charts and fine-tune entries on shorter timeframes.',
      },
      {
        type: 'concept',
        eyebrow: 'Anatomy',
        heading: 'Body vs. wick',
        text: 'The <strong>body</strong> is the rectangle between open and close. The <strong>wicks</strong> show the high and low reached during the period. A long wick means price was pushed hard, then rejected — often more informative than the body itself.',
      },
      {
        type: 'keyConcept',
        text: 'Candlesticks compress four prices into one visual shape — the body shows who won the battle between buyers and sellers, the wicks show how far each side pushed before getting rejected.',
      },
      {
        type: 'quiz',
        questions: [
          {
            question: "What does the 'H' in OHLCV stand for?",
            options: ['Holdings', 'High', 'Hour', 'Histogram'],
            correct: 1,
            explanation: 'OHLCV = Open, High, Low, Close, Volume.',
          },
          {
            question: 'A candle with a long lower wick and a small body near the top means:',
            options: ['Strong selling pressure', 'Buyers defended a low price and pushed it back up', "The stock didn't move much", 'A gap in price'],
            correct: 1,
            explanation: 'A long lower wick means sellers pushed price down but buyers rejected that level and drove it back up.',
          },
        ],
      },
      { type: 'complete' },
    ],
    simSection: 'research',
    simStrategy: null,
  },
  {
    id: 3,
    title: 'Candlestick Patterns',
    week: 1,
    day: 3,
    readTime: '6 min',
    steps: [
      {
        type: 'intro',
        objectives: [
          'Identify 6 key candlestick patterns',
          'Understand the psychological story behind each pattern',
          'Know which patterns signal reversals vs. continuation',
        ],
      },
      {
        type: 'concept',
        eyebrow: 'Indecision',
        heading: 'The Doji',
        text: 'Open and close are nearly equal, leaving almost no body. Neither buyers nor sellers won. After a strong trend, a Doji can be an early sign momentum is stalling.',
      },
      {
        type: 'concept',
        eyebrow: 'Reversal up',
        heading: 'Hammer',
        text: 'A small body near the top with a long lower wick, after a decline. Sellers pushed hard, but buyers stepped in and drove price back up by the close — a classic bullish reversal at the bottom of a downtrend.',
      },
      {
        type: 'concept',
        eyebrow: 'Reversal down',
        heading: 'Shooting Star',
        text: "The mirror image of a Hammer, found at the top of an uptrend. Buyers pushed higher intraday, but sellers overwhelmed them by the close — a bearish warning.",
      },
      {
        type: 'check',
        prompt: 'A Hammer candlestick is most meaningful when it appears:',
        options: ['In the middle of an uptrend', 'At the bottom of a downtrend', 'On a random sideways day', 'After a gap up'],
        correct: 1,
        explanation: 'A Hammer signals potential reversal from a downtrend — it loses meaning outside that context.',
      },
      {
        type: 'concept',
        eyebrow: 'Two-candle patterns',
        heading: 'Engulfing patterns',
        text: 'A <strong>Bullish Engulfing</strong> pattern is a small red candle followed by a larger green candle that fully covers it — buyers taking decisive control. A <strong>Bearish Engulfing</strong> is the opposite.',
      },
      {
        type: 'keyConcept',
        text: 'Candlestick patterns are compressed market psychology. Context — the prevailing trend, nearby support/resistance, volume — matters more than the pattern shape itself.',
      },
      {
        type: 'quiz',
        questions: [
          {
            question: 'What does a Doji candlestick signal?',
            options: ['Strong bullish momentum', 'A guaranteed reversal', 'Market indecision', 'Extremely high volume'],
            correct: 2,
            explanation: "The Doji's equal open and close shows the market is undecided.",
          },
          {
            question: 'A Bullish Engulfing pattern requires:',
            options: ['The second candle to be red', "The second candle's body to fully cover the first", 'Both candles to be the same size', 'A gap between the two candles'],
            correct: 1,
            explanation: "The larger green candle must completely surround the prior red candle's body.",
          },
        ],
      },
      { type: 'complete' },
    ],
    simSection: 'research',
    simStrategy: null,
  },
  {
    id: 5,
    title: 'RSI, MACD & Bollinger Bands',
    week: 1,
    day: 5,
    readTime: '7 min',
    steps: [
      {
        type: 'intro',
        objectives: [
          'Read RSI to spot overbought and oversold conditions',
          'Understand what MACD measures and why traders watch its crossovers',
          'Use Bollinger Bands to judge whether volatility is expanding or contracting',
        ],
      },
      {
        type: 'concept',
        eyebrow: 'Momentum, not price',
        heading: 'RSI measures how hard buyers are pushing',
        text: 'The <strong>Relative Strength Index</strong> compares the size of recent up-moves to recent down-moves and compresses that into a single number from 0 to 100. It does not care what the price is, only how forcefully it has been moving in one direction.',
        visual: 'rsiZones',
      },
      {
        type: 'concept',
        eyebrow: 'The two danger zones',
        heading: 'Above 70 is hot, below 30 is cold',
        text: 'When RSI pushes <strong>above 70</strong>, buying has been aggressive enough that the move may be overextended. When it drops <strong>below 30</strong>, selling has been aggressive enough that a bounce becomes more likely. Neither is an automatic signal — they describe pressure, not certainty.',
      },
      {
        type: 'check',
        prompt: 'An RSI reading of 22 most likely suggests:',
        options: ['The stock is overbought', 'The stock is oversold', 'Volume is unusually low', 'The trend has reversed for certain'],
        correct: 1,
        explanation: 'RSI below 30 signals oversold conditions — heavy recent selling pressure, not a guaranteed reversal.',
      },
      {
        type: 'concept',
        eyebrow: 'Context matters',
        heading: "RSI can stay extreme longer than you'd expect",
        text: "In a powerful uptrend, RSI can sit above 70 for weeks while the stock keeps climbing — selling early because RSI looks \"overbought\" is one of the most common mistakes new traders make. RSI works best combined with trend context, not in isolation.",
      },
      {
        type: 'concept',
        eyebrow: 'A different lens',
        heading: 'MACD tracks the relationship between two EMAs',
        text: "<strong>MACD</strong> (Moving Average Convergence Divergence) subtracts a slower EMA from a faster one, then plots that difference as a line. A second, smoothed version of that line — the <strong>signal line</strong> — is plotted alongside it. The gap between them is drawn as a histogram below.",
        visual: 'macdDiagram',
      },
      {
        type: 'concept',
        eyebrow: 'Reading the cross',
        heading: 'When MACD crosses above its signal line',
        text: "That crossover is read as a momentum shift turning bullish — similar in spirit to the EMA crossover from the last lesson, but measuring the rate of change in momentum rather than price itself. A shrinking histogram often shows up before a crossover, since it reflects momentum already fading.",
      },
      {
        type: 'check',
        prompt: 'What does the MACD histogram actually represent?',
        options: ['Total trading volume', 'The gap between the MACD line and its signal line', 'The stock\u2019s 52-week range', 'The number of shares outstanding'],
        correct: 1,
        explanation: 'The histogram bars are simply MACD minus the signal line, visualized — a shrinking histogram means the two lines are converging.',
      },
      {
        type: 'concept',
        eyebrow: 'Volatility, not direction',
        heading: 'Bollinger Bands expand and contract with volatility',
        text: "Bollinger Bands wrap a moving average in two bands set a couple of standard deviations above and below it. When price has been calm, the bands squeeze tight. When price starts moving violently, the bands flare wide open. The bands react to <em>how much</em> price is moving, not which direction.",
      },
      {
        type: 'concept',
        eyebrow: 'The squeeze',
        heading: 'A tight squeeze often comes before a big move',
        text: "A long period of narrow bands (low volatility) frequently resolves into a sharp breakout in one direction — markets tend to alternate between quiet consolidation and energetic expansion. TradeIQ's Bollinger Squeeze strategy is built specifically to catch that transition.",
      },
      {
        type: 'keyConcept',
        text: 'RSI and MACD both measure momentum from different angles, while Bollinger Bands measure volatility, not direction. The strongest setups usually show more than one of these lining up at once.',
      },
      {
        type: 'quiz',
        questions: [
          {
            question: 'RSI is best described as a measure of:',
            options: ['Trading volume', 'Momentum and recent buying/selling pressure', 'Company valuation', 'Dividend yield'],
            correct: 1,
            explanation: 'RSI is purely a momentum oscillator built from the size of recent gains versus losses.',
          },
          {
            question: 'A long stretch of narrow Bollinger Bands typically signals:',
            options: ['The stock is about to be delisted', 'Low volatility that often precedes a breakout', 'Guaranteed upward movement', 'The company is reporting earnings'],
            correct: 1,
            explanation: 'Tight bands reflect a volatility squeeze — markets often expand sharply out of these quiet periods.',
          },
          {
            question: 'Which of these does MACD primarily track?',
            options: ['The relationship between a fast and slow EMA', 'Total shares traded', 'The bid-ask spread', 'Insider ownership percentage'],
            correct: 0,
            explanation: 'MACD is built directly from the difference between two EMAs of different speeds.',
          },
        ],
      },
      { type: 'complete' },
    ],
    simSection: 'my-desk',
    simStrategy: 'bollinger_squeeze',
  },
  {
    id: 6,
    title: 'Volume & VWAP',
    week: 1,
    day: 6,
    readTime: '6 min',
    steps: [
      {
        type: 'intro',
        objectives: [
          'Understand why volume confirms or undermines a price move',
          'Read VWAP as the "fair value" price for the trading day',
          'Recognize how institutional traders use VWAP differently than retail traders',
        ],
      },
      {
        type: 'concept',
        eyebrow: 'The second dimension',
        heading: 'Price tells you what happened. Volume tells you how much it mattered.',
        text: 'A 2% rally on triple the normal volume reflects real conviction — lots of participants agreeing at once. The same 2% rally on weak, below-average volume could just be a handful of trades drifting the price with nobody else paying attention.',
      },
      {
        type: 'check',
        prompt: 'A breakout above resistance on unusually low volume should be treated as:',
        options: ['A guaranteed strong signal', 'Less convincing than the same breakout on high volume', 'Irrelevant — volume never matters', 'A sign the company is being acquired'],
        correct: 1,
        explanation: 'Volume is the confirmation layer — the same price move means much less when few participants are behind it.',
      },
      {
        type: 'concept',
        eyebrow: 'A volume-weighted average',
        heading: "VWAP is the day's running fair-value price",
        text: "<strong>Volume-Weighted Average Price</strong> averages every trade of the day, but weights each price by how much volume traded there. A price level where a huge block traded pulls VWAP toward it much more than a level where only a few shares changed hands.",
        visual: 'vwapLine',
      },
      {
        type: 'concept',
        eyebrow: 'Why institutions care',
        heading: 'VWAP is a benchmark, not just an indicator',
        text: "Large institutional desks are often measured against VWAP: if a fund buys below VWAP on average, their execution looks skilled. This is why so much real volume clusters around VWAP during the day — institutions are actively trying to trade near it.",
      },
      {
        type: 'concept',
        eyebrow: 'How retail traders use it',
        heading: 'VWAP as a magnet and a mean-reversion line',
        text: "For shorter-term traders, VWAP acts like a gravitational center for the day's price. A stock that drifts meaningfully below VWAP, while still in an uptrend, is often viewed as a discounted entry — exactly the logic behind TradeIQ's VWAP Mean Reversion strategy.",
      },
      {
        type: 'check',
        prompt: 'VWAP differs from a simple moving average because it:',
        options: ['Only uses the closing price', 'Weights each price by the volume traded there', 'Ignores volume entirely', 'Resets every month'],
        correct: 1,
        explanation: 'The "volume-weighted" part is the whole point — heavily-traded price levels pull VWAP toward them.',
      },
      {
        type: 'keyConcept',
        text: 'Volume is the lie detector for price action — a move without volume behind it deserves far less confidence than the same move on heavy participation. VWAP turns that idea into a single tradeable line.',
      },
      {
        type: 'quiz',
        questions: [
          {
            question: 'Why do institutional trading desks pay close attention to VWAP?',
            options: ['It determines dividend payments', "It's often used as a benchmark for execution quality", 'It sets the next day\u2019s opening price', 'It predicts earnings results'],
            correct: 1,
            explanation: 'Trading at a better-than-VWAP price is frequently used to judge how well a large order was executed.',
          },
          {
            question: 'A price move on very low volume should generally be treated with:',
            options: ['Full confidence', 'More skepticism than the same move on high volume', 'The same confidence regardless of volume', 'Immediate panic'],
            correct: 1,
            explanation: 'Low volume means fewer participants are behind the move, so it carries less conviction.',
          },
        ],
      },
      { type: 'complete' },
    ],
    simSection: 'ai-trader',
    simStrategy: 'vwap_reversion',
  },
  {
    id: 7,
    title: 'Risk Management',
    week: 1,
    day: 7,
    readTime: '8 min',
    steps: [
      {
        type: 'intro',
        objectives: [
          'Understand why position sizing matters more than picking winners',
          'Calculate risk per trade as a percentage of total capital',
          'Use stop-losses and risk:reward ratios to structure a trade before entering it',
        ],
      },
      {
        type: 'concept',
        eyebrow: 'The uncomfortable truth',
        heading: 'You can be right less than half the time and still profit',
        text: "A trader who wins only 40% of trades can still come out ahead — if winners are sized to make roughly twice what losers cost. Risk management is what makes that math work; without it, even a high win rate can be wiped out by one oversized loss.",
      },
      {
        type: 'concept',
        eyebrow: 'Size before signal',
        heading: 'Position sizing comes before strategy',
        text: "Before asking \"should I buy this,\" the more important question is \"how much should I risk if I'm wrong.\" A common starting guideline is risking no more than 1-2% of total account capital on any single trade — so a string of losses shrinks the account gradually instead of catastrophically.",
      },
      {
        type: 'check',
        prompt: 'A trader risking 1% per trade on a $10,000 account is risking approximately:',
        options: ['$1,000 per trade', '$100 per trade', '$10 per trade', 'Their entire account'],
        correct: 1,
        explanation: '1% of $10,000 is $100 — the maximum acceptable loss on that single position, defined before entering.',
      },
      {
        type: 'concept',
        eyebrow: 'Define the exit before the entry',
        heading: 'A stop-loss is a pre-committed exit, not a guess',
        text: "A stop-loss is an exit price decided <em>before</em> a trade is placed, based on where the original idea would be proven wrong — not an arbitrary round number, and not something to move further away once the trade goes against you.",
      },
      {
        type: 'concept',
        eyebrow: 'Comparing the upside to the downside',
        heading: 'Risk:reward ratio',
        text: "If a stop-loss risks $2 per share and the price target is $6 away, that's a 1:3 risk:reward ratio — risking $1 to potentially make $3. Strategies with a worse ratio than roughly 1:1.5 need a meaningfully higher win rate just to break even over time.",
      },
      {
        type: 'check',
        prompt: 'A trade risking $4 per share with a $4 target has a risk:reward ratio of:',
        options: ['1:4', '1:1', '4:1', '1:8'],
        correct: 1,
        explanation: 'Equal risk and reward in dollar terms is a 1:1 ratio — a coin-flip trade that needs a win rate well above 50% to be worthwhile after costs.',
      },
      {
        type: 'concept',
        eyebrow: 'Diversification within a strategy',
        heading: "Don't let one position become the whole portfolio",
        text: "Even with a disciplined stop-loss on each trade, putting too much capital into one position at once means a single unexpected gap or news event can do outsized damage. Spreading risk across multiple uncorrelated positions is a second layer of protection beyond per-trade sizing.",
      },
      {
        type: 'keyConcept',
        text: 'Professional trading is mostly risk management wearing a strategy costume — deciding how much to risk and where to exit, before deciding what to buy, is what actually keeps a trader in the game long enough for good strategies to play out.',
      },
      {
        type: 'quiz',
        questions: [
          {
            question: 'Why can a trader with a 40% win rate still be profitable?',
            options: ['They never lose money', 'Their average winning trade is sized larger than their average loss', 'Win rate doesn\u2019t matter at all', 'They only trade once a year'],
            correct: 1,
            explanation: 'When average wins outweigh average losses by enough, a lower win rate can still produce a profitable system overall.',
          },
          {
            question: 'A stop-loss should ideally be set:',
            options: ['After the trade starts losing money', 'Before entering the trade, based on where the original idea is invalidated', 'As far away as possible to avoid being stopped out', 'Only on trades that are already profitable'],
            correct: 1,
            explanation: 'A stop-loss decided in advance, tied to the trade thesis, removes emotion from the exit decision.',
          },
          {
            question: 'Risking 1-2% of account capital per trade is a guideline meant to:',
            options: ['Guarantee profits', 'Limit the damage from any single losing trade', 'Maximize position size on every trade', 'Avoid paying taxes'],
            correct: 1,
            explanation: 'Capping risk per trade protects the account from any one trade causing outsized damage, regardless of how confident it felt going in.',
          },
        ],
      },
      { type: 'complete' },
    ],
    simSection: 'my-desk',
    simStrategy: null,
  },
  {
    id: 8,
    title: 'CANSLIM Part 1 (C, A, N)',
    week: 2,
    day: 1,
    readTime: '7 min',
    steps: [
      {
        type: 'intro',
        objectives: [
          'Learn what each of the first three CANSLIM letters stands for',
          'Understand why CANSLIM looks for accelerating growth, not just growth',
          'See how new highs, products, or leadership feed into the "N"',
        ],
      },
      {
        type: 'concept',
        eyebrow: 'Where this comes from',
        heading: "CANSLIM is William O'Neil's growth-stock checklist",
        text: "CANSLIM is a seven-letter framework for identifying growth stocks before their biggest moves, developed by investor and Investor's Business Daily founder William O'Neil. Each letter checks a different dimension of a potential winner. This lesson covers the first three: C, A, and N.",
      },
      {
        type: 'concept',
        eyebrow: 'C',
        heading: 'Current quarterly earnings growth',
        text: "The \"C\" looks for a company whose most recent quarterly earnings grew significantly versus the same quarter a year earlier — the idea being that strong, recent results are what actually move stock prices, not stale history.",
      },
      {
        type: 'check',
        prompt: 'The "C" in CANSLIM primarily refers to:',
        options: ['Cash on the balance sheet', 'Current quarterly earnings growth', 'Company size', 'Consumer sentiment'],
        correct: 1,
        explanation: '"C" stands for Current quarterly earnings — strong, recent growth versus the year-ago quarter.',
      },
      {
        type: 'concept',
        eyebrow: 'A',
        heading: 'Annual earnings growth',
        text: "The \"A\" zooms out from one quarter to multiple years, looking for consistent annual earnings growth — confirming that the strong recent quarter isn't a one-off fluke but part of a longer growth trend.",
      },
      {
        type: 'concept',
        eyebrow: 'N',
        heading: 'New — product, leadership, or price high',
        text: "The \"N\" looks for something genuinely new about the company: a new product, a new industry condition, new management, or — most directly tradeable — a new high in the stock's price. O'Neil's research found that stocks making new highs, counterintuitively, often kept going higher rather than reversing.",
      },
      {
        type: 'check',
        prompt: 'O\u2019Neil\u2019s research on the "N" found that stocks making new price highs:',
        options: ['Almost always reverse immediately', 'Often continued climbing rather than falling back', 'Are too risky to ever consider', 'Only apply to small-cap stocks'],
        correct: 1,
        explanation: 'This is the counterintuitive core of the "N" — fear of buying at highs causes many traders to miss continuing uptrends.',
      },
      {
        type: 'concept',
        eyebrow: 'How TradeIQ approximates this',
        heading: 'A technical proxy, not full fundamentals',
        text: "TradeIQ's automated CANSLIM strategy can't pull quarterly earnings reports in real time, so it approximates C/A/N using price and volume technicals instead — checking whether price sits above its 50-day and 200-day averages and whether the stock is near a 52-week high. It's a reasonable proxy for trend and \"newness,\" but it isn't reading actual earnings filings the way a real CANSLIM investor would.",
      },
      {
        type: 'keyConcept',
        text: 'C, A, and N are all forms of the same question asked at different time scales: is this company growing now, has it been growing, and is something genuinely new driving that growth forward.',
      },
      {
        type: 'quiz',
        questions: [
          {
            question: 'What does the "A" in CANSLIM check for?',
            options: ['Annual earnings growth over multiple years', 'Average daily volume', 'Analyst ratings', 'Asset turnover ratio'],
            correct: 0,
            explanation: '"A" confirms the recent quarterly growth fits into a longer multi-year growth pattern.',
          },
          {
            question: 'Which of these would count as an "N" catalyst for a stock?',
            options: ['The stock trading flat for a year', 'A brand-new product launch', 'A company moving its headquarters', 'A stock split with no other change'],
            correct: 1,
            explanation: 'A genuinely new product, service, or leadership change is exactly the kind of catalyst the "N" looks for.',
          },
        ],
      },
      { type: 'complete' },
    ],
    simSection: 'ai-trader',
    simStrategy: 'canslim',
  },
  {
    id: 9,
    title: 'CANSLIM Part 2 (S, L, I, M)',
    week: 2,
    day: 2,
    readTime: '7 min',
    steps: [
      {
        type: 'intro',
        objectives: [
          'Learn the remaining four CANSLIM letters: S, L, I, and M',
          'Understand why supply and demand matter as much as fundamentals',
          'See how overall market direction can override an individual stock setup',
        ],
      },
      {
        type: 'concept',
        eyebrow: 'Recap',
        heading: 'Finishing the checklist',
        text: "The first lesson covered C, A, and N — current earnings, annual growth, and something new. The remaining four letters shift from \"is this a good company\" to \"is this a good trade right now,\" factoring in supply, leadership, ownership, and the broader market.",
      },
      {
        type: 'concept',
        eyebrow: 'S',
        heading: 'Supply and demand',
        text: "The \"S\" considers a company's share count and recent volume behavior. Fewer shares outstanding means each dollar of buying demand has a bigger price impact — and a surge in volume on an up move suggests real demand is overwhelming available supply.",
      },
      {
        type: 'check',
        prompt: 'The "S" in CANSLIM is primarily concerned with:',
        options: ['Stock symbol length', 'Supply and demand dynamics around shares outstanding and volume', 'Sector classification', 'Short interest only'],
        correct: 1,
        explanation: '"S" is about supply (shares outstanding) and demand (volume) — fewer shares plus surging demand tends to move price further.',
      },
      {
        type: 'concept',
        eyebrow: 'L',
        heading: 'Leader or laggard',
        text: "The \"L\" asks whether a stock is a leader within its industry group, not just a decent performer in isolation. O'Neil's research emphasized buying the strongest stock in a strong group — relative strength versus peers, not just an absolute price chart.",
      },
      {
        type: 'concept',
        eyebrow: 'I',
        heading: 'Institutional sponsorship',
        text: "The \"I\" looks for growing ownership by institutions — mutual funds, pension funds, and other large investors. Their buying provides a steady source of demand, and rising institutional ownership over time is read as a vote of confidence from sophisticated money.",
      },
      {
        type: 'check',
        prompt: 'Why does CANSLIM care about institutional ownership ("I")?',
        options: ['Institutions are required to disclose losses publicly', 'Growing institutional ownership reflects sustained demand from sophisticated investors', 'It has no real effect on price', 'It only matters for bonds'],
        correct: 1,
        explanation: 'Institutional buying provides sustained demand and is treated as a signal that informed investors see value.',
      },
      {
        type: 'concept',
        eyebrow: 'M',
        heading: 'Market direction overrides everything else',
        text: "The \"M\" is arguably the most important letter: the overall direction of the broader market. O'Neil's research found that roughly 3 out of 4 stocks tend to move with the general market trend — meaning even a textbook-perfect individual setup can fail simply because it's fighting a market-wide downtrend.",
      },
      {
        type: 'keyConcept',
        text: "S, L, I, and M shift the focus from the company itself to the trade's surrounding conditions — share supply, relative strength, institutional demand, and the market's overall direction. A great company can still be a bad trade if the broader market is working against it.",
      },
      {
        type: 'quiz',
        questions: [
          {
            question: 'What does the "L" in CANSLIM evaluate?',
            options: ['Whether the stock is the leader in its industry group', 'The company\u2019s total liabilities', 'Listing exchange', 'Loan covenants'],
            correct: 0,
            explanation: '"L" is about relative leadership — the strongest stock in a strong group, not just decent performance on its own.',
          },
          {
            question: 'According to O\u2019Neil\u2019s research behind the "M" factor, roughly how much of a stock\u2019s movement tends to follow the overall market?',
            options: ['None of it', 'About 3 out of 4 stocks tend to move with the broader market', 'Exactly half, always', 'Only penny stocks are affected'],
            correct: 1,
            explanation: 'The "M" factor reflects the finding that most individual stocks are heavily influenced by the general market trend.',
          },
        ],
      },
      { type: 'complete' },
    ],
    simSection: 'ai-trader',
    simStrategy: 'canslim',
  },
  {
    id: 10,
    title: 'Momentum & Breakout Trading',
    week: 2,
    day: 3,
    readTime: '7 min',
    steps: [
      {
        type: 'intro',
        objectives: [
          'Understand the core idea behind momentum and breakout trading',
          'Recognize a valid breakout above resistance',
          'See why volume confirmation separates real breakouts from false ones',
        ],
      },
      {
        type: 'concept',
        eyebrow: 'The philosophy',
        heading: '"The trend is your friend" taken literally',
        text: "Momentum trading is built on a simple premise: a stock that has been moving strongly in one direction is statistically more likely to keep moving that way in the near term than to suddenly reverse. Rather than predicting reversals, momentum traders try to catch and ride moves that are already underway.",
      },
      {
        type: 'concept',
        eyebrow: 'Resistance',
        heading: 'A breakout is a price clearing a ceiling',
        text: "<strong>Resistance</strong> is a price level where selling has previously overwhelmed buying, capping the stock's advance. A <strong>breakout</strong> happens when price finally pushes through that ceiling — often the recent 20-day high, the level TradeIQ's Momentum Breakout strategy specifically watches.",
      },
      {
        type: 'check',
        prompt: 'A breakout is best defined as:',
        options: ['Any single day where the stock goes up', 'Price decisively clearing a previous resistance level', 'A drop below the 50-day SMA', 'A company announcing a stock split'],
        correct: 1,
        explanation: 'A breakout specifically means price has pushed through a level that previously capped it — not just any green day.',
      },
      {
        type: 'concept',
        eyebrow: 'The trap',
        heading: 'False breakouts are the biggest risk',
        text: 'Price can poke briefly above resistance, lure in buyers, then fall right back below it — a "false breakout" or "fakeout." This is exactly why volume confirmation matters: a breakout on weak volume is far more likely to fail than one backed by a genuine surge in participation.',
      },
      {
        type: 'concept',
        eyebrow: 'The confirmation layer',
        heading: 'Why 1.5x average volume matters',
        text: "TradeIQ's Momentum Breakout strategy requires volume to exceed 1.5 times the 20-day average before treating a breakout as valid. That threshold exists specifically to filter out the thin, low-conviction breakouts that tend to reverse and trap latecomers.",
      },
      {
        type: 'check',
        prompt: 'A breakout on unusually light trading volume is generally:',
        options: ['More trustworthy than one on heavy volume', 'More likely to be a false breakout that fails', 'Impossible to happen', 'Only relevant for options trading'],
        correct: 1,
        explanation: 'Low volume behind a breakout means weak conviction — exactly the setup that tends to reverse and trap buyers.',
      },
      {
        type: 'concept',
        eyebrow: 'Where to exit',
        heading: 'Momentum trades use trailing, not fixed, exits',
        text: "Because the whole premise is riding an ongoing move, many momentum traders use a trailing stop — like the recent 5-day low — rather than a single fixed target. That lets a strong trend keep running instead of capping gains arbitrarily early.",
      },
      {
        type: 'keyConcept',
        text: 'Momentum and breakout trading bets that a move already in progress, confirmed by genuine volume, is more likely to continue than reverse — and that volume confirmation is what separates a real breakout from a trap.',
      },
      {
        type: 'quiz',
        questions: [
          {
            question: 'What is a "false breakout"?',
            options: ['A breakout that happens overnight', 'Price briefly clearing resistance before falling back below it', 'A breakout confirmed by high volume', 'Any breakout on a Friday'],
            correct: 1,
            explanation: 'A false breakout lures in buyers above resistance, then fails and drops back below it.',
          },
          {
            question: 'Why do momentum strategies often require a volume threshold before confirming a breakout?',
            options: ['Volume has no real purpose', 'High volume confirms genuine participation behind the move, reducing the odds of a false breakout', 'Volume only matters for dividend stocks', 'It\u2019s a regulatory requirement'],
            correct: 1,
            explanation: 'Volume confirmation is the filter that separates conviction-backed breakouts from thin, likely-to-fail ones.',
          },
        ],
      },
      { type: 'complete' },
    ],
    simSection: 'ai-trader',
    simStrategy: 'momentum_breakout',
  },
  {
    id: 11,
    title: 'VWAP Mean Reversion',
    week: 2,
    day: 4,
    readTime: '6 min',
    steps: [
      {
        type: 'intro',
        objectives: [
          'Understand the mean-reversion idea behind this strategy',
          'See exactly how TradeIQ\u2019s VWAP Mean Reversion strategy defines an entry',
          'Recognize why an uptrend filter is layered on top of "buy the dip"',
        ],
      },
      {
        type: 'concept',
        eyebrow: 'A different philosophy than momentum',
        heading: 'Mean reversion bets on a snap-back, not continuation',
        text: "Where momentum trading rides a move that's already happening, mean reversion does the opposite: it looks for a price that has temporarily stretched too far from its \"fair value\" line and bets it snaps back. VWAP — the volume-weighted average from Lesson 6 — is the fair-value line this strategy reverts to.",
      },
      {
        type: 'concept',
        eyebrow: 'The setup',
        heading: 'Looking for an oversold dip below VWAP',
        text: "TradeIQ's VWAP Mean Reversion strategy specifically looks for price trading meaningfully below VWAP — roughly 1.5% or more — combined with RSI showing oversold conditions. The idea: short-term panic has pushed price below fair value, and a bounce back toward VWAP is the trade.",
        visual: 'vwapLine',
      },
      {
        type: 'check',
        prompt: 'Mean reversion strategies generally assume that an extended price move:',
        options: ['Will keep extending forever', 'Tends to snap back toward a "fair value" reference point', 'Has no relationship to future price', 'Only applies to bonds'],
        correct: 1,
        explanation: 'Mean reversion is built on the idea that overextended prices tend to pull back toward an average or fair-value line.',
      },
      {
        type: 'concept',
        eyebrow: 'The crucial filter',
        heading: 'Why this isn\u2019t just "buy anything that drops"',
        text: "Buying every dip is dangerous — some dips keep falling because the underlying trend has actually turned down. That's why this strategy adds an uptrend filter, requiring price to still be above its 50-day SMA: the dip needs to be a pullback <em>within</em> an uptrend, not the start of a real downtrend.",
      },
      {
        type: 'concept',
        eyebrow: 'The exit',
        heading: 'Selling at — not above — fair value',
        text: "Because the trade thesis is specifically \"price reverts to VWAP,\" the natural exit is simply price recovering back to VWAP, not a large target far beyond it. This tends to be a quicker, smaller-target trade than a momentum breakout.",
      },
      {
        type: 'check',
        prompt: 'Why does TradeIQ\u2019s VWAP Mean Reversion strategy require price to stay above the 50-day SMA before buying a dip?',
        options: ['It has no real purpose', 'To filter out dips that are actually the start of a deeper downtrend', 'To guarantee a profit', 'Because VWAP only works above the 50-day SMA mathematically'],
        correct: 1,
        explanation: 'The 50-day SMA filter helps separate a healthy pullback within an uptrend from a dip that\u2019s really a trend reversal.',
      },
      {
        type: 'keyConcept',
        text: 'VWAP Mean Reversion looks for short-term overreactions within a still-intact uptrend — buying a dip below fair value, then selling the snap-back to fair value, rather than trying to predict a sustained new trend.',
      },
      {
        type: 'quiz',
        questions: [
          {
            question: 'A mean-reversion trader buying a stock 1.5% below VWAP is betting that:',
            options: ['The stock will keep falling indefinitely', 'Price will revert back up toward the VWAP "fair value" line', 'VWAP is meaningless intraday', 'The company will issue new shares'],
            correct: 1,
            explanation: 'The whole premise is a snap-back toward the volume-weighted average price.',
          },
          {
            question: 'What role does the 50-day SMA filter play in this strategy?',
            options: ['It sets the exact entry price', 'It confirms the broader trend is still up before buying the dip', 'It calculates trading volume', 'It has no functional role'],
            correct: 1,
            explanation: 'It distinguishes a buyable pullback within an uptrend from a dip that\u2019s part of a real downtrend.',
          },
        ],
      },
      { type: 'complete' },
    ],
    simSection: 'ai-trader',
    simStrategy: 'vwap_reversion',
  },
  {
    id: 12,
    title: 'Gap & Go Strategy',
    week: 2,
    day: 5,
    readTime: '6 min',
    steps: [
      {
        type: 'intro',
        objectives: [
          'Understand why stocks gap between sessions',
          'Learn the entry conditions for a Gap and Go trade',
          'Recognize the difference between a gap that holds and one that fills',
        ],
      },
      {
        type: 'concept',
        eyebrow: 'Where gaps come from',
        heading: 'A gap is a jump with no trading in between',
        text: "Stocks trade roughly 16 hours a day off-exchange (pre-market, after-hours, and overnight) where major news — earnings, upgrades, FDA approvals — can move sentiment with no regular-session trading to smooth out the reaction. When the market reopens, price can be meaningfully higher or lower than the prior close, with a literal gap on the chart between the two.",
      },
      {
        type: 'concept',
        eyebrow: 'The setup',
        heading: 'Gap and Go trades the continuation, not the gap itself',
        text: "This strategy isn't about predicting the gap — it's about reacting to one that's already happened and judging whether it will continue. TradeIQ's version specifically looks for a gap up of more than 1.5% from the prior close, with price still holding near or above the opening price rather than immediately reversing.",
      },
      {
        type: 'check',
        prompt: 'A "gap" on a stock chart refers to:',
        options: ['A stock split', 'A jump in price between one session\u2019s close and the next session\u2019s open, with no trades in between', 'A dividend payment date', 'A change in the company\u2019s ticker symbol'],
        correct: 1,
        explanation: 'A gap is literally a price jump where no regular-session trading occurred to fill in the space.',
      },
      {
        type: 'concept',
        eyebrow: 'The danger',
        heading: '"Filling the gap" is the failure case',
        text: 'A gap "fills" when price drifts back down to close the empty space on the chart — often because the initial reaction was overdone or the news wasn\'t as strong as the first move implied. Gap and Go traders watch closely for whether the stock holds above the opening price; slipping back below it is treated as the trade failing.',
      },
      {
        type: 'concept',
        eyebrow: 'Confirmation',
        heading: 'Volume separates real gaps from noise',
        text: "TradeIQ's Gap and Go strategy requires volume to run at least double the 20-day average before treating the gap as tradeable. A gap on thin volume is a much weaker signal — it suggests the move is being driven by only a few participants rather than broad conviction.",
      },
      {
        type: 'check',
        prompt: 'A Gap and Go trader watching a stock that gapped up, then dropped back below its opening price, would treat this as:',
        options: ['A stronger buy signal', 'A sign the gap is failing to hold ("filling")', 'Completely irrelevant information', 'Proof the company is being delisted'],
        correct: 1,
        explanation: 'Slipping back below the opening price is the classic sign that the gap isn\u2019t holding and the trade thesis is breaking down.',
      },
      {
        type: 'concept',
        eyebrow: 'Why this is a day-trading strategy',
        heading: 'Built for speed, not patience',
        text: "Gap and Go is explicitly an intraday, day-trading strategy — the edge comes from reacting within the same session a gap occurs, not holding for days waiting to see how it plays out. This is why it's grouped with day trading strategies rather than swing or long-term approaches in TradeIQ.",
      },
      {
        type: 'keyConcept',
        text: 'Gap and Go trades the continuation of a strong overnight move, using volume to separate gaps with real conviction behind them from thin, low-participation jumps that are more likely to fill back in.',
      },
      {
        type: 'quiz',
        questions: [
          {
            question: 'Why do gaps tend to occur outside regular trading hours?',
            options: ['Markets are always closed', 'Major news can hit during pre-market, after-hours, or overnight with no regular-session trading to smooth the reaction', 'Gaps only happen on Mondays', 'Stock splits cause all gaps'],
            correct: 1,
            explanation: 'News hitting outside regular hours, with no trading happening to absorb it gradually, is the classic source of a gap.',
          },
          {
            question: 'What does it mean when a gap "fills"?',
            options: ['The company completes a buyback', 'Price drifts back down to close the empty space left by the gap', 'Trading volume reaches its daily average', 'The stock reaches a new 52-week high'],
            correct: 1,
            explanation: 'A filled gap means price has retraced back into the range it skipped over, often signaling the initial move is failing.',
          },
        ],
      },
      { type: 'complete' },
    ],
    simSection: 'ai-trader',
    simStrategy: 'gap_and_go',
  },
  {
    id: 13,
    title: 'Opening Range Breakout (ORB)',
    week: 2,
    day: 6,
    readTime: '6 min',
    steps: [
      {
        type: 'intro',
        objectives: [
          'Understand why the first candle of the trading day is treated specially',
          'Learn how an Opening Range Breakout entry and exit are defined',
          'See why this strategy uses the size of the opening range itself to set targets',
        ],
      },
      {
        type: 'concept',
        eyebrow: 'The first few minutes set the stage',
        heading: 'The opening range captures the market\u2019s first verdict',
        text: "The first trading period of the day — often the first 5, 15, or 30 minutes — tends to carry outsized information. Overnight orders, news reactions, and the most active traders all converge right at the open, so the high and low set in that window often act as a meaningful support/resistance zone for the rest of the day.",
      },
      {
        type: 'concept',
        eyebrow: 'The setup',
        heading: 'Trading the break of that early range',
        text: "Opening Range Breakout treats the high of that first candle as a line in the sand. TradeIQ's version looks for price breaking just above that opening high — by a small buffer of 0.3%, to avoid getting faked out by a single tick — combined with a volume surge versus the opening candle's own volume.",
      },
      {
        type: 'check',
        prompt: 'The "opening range" in ORB specifically refers to:',
        options: ['The entire day\u2019s high-to-low range', 'The high and low set during the first trading candle/period of the day', 'The 52-week high and low', 'The bid-ask spread'],
        correct: 1,
        explanation: 'ORB is built specifically around the high and low of the earliest candle(s) of the session, not the full day\u2019s range.',
      },
      {
        type: 'concept',
        eyebrow: 'Why volume confirms it here too',
        heading: 'A breakout above the open still needs real buying behind it',
        text: "Just like a momentum breakout, a break above the opening high on weak volume is much less reliable. TradeIQ's ORB strategy specifically compares the breakout candle's volume to the opening candle's own volume, requiring at least 1.2x — confirming fresh buying is actually showing up, not just price drifting on thin trading.",
      },
      {
        type: 'concept',
        eyebrow: 'Sizing the target',
        heading: 'The opening range sets its own target',
        text: "A distinctive feature of ORB: the target isn't an arbitrary percentage — it's measured as a multiple of the opening range's own size. A wider opening range (more volatility right at the open) projects a wider target; a tighter opening range projects a tighter one. The range effectively measures itself.",
      },
      {
        type: 'check',
        prompt: 'Why does ORB size its profit target using the opening range\u2019s own height, rather than a flat percentage?',
        options: ['It\u2019s simpler to code', 'A wider opening range reflects more volatility, which the strategy scales the target to match', 'It guarantees the trade will win', 'The opening range height has no effect on the target'],
        correct: 1,
        explanation: 'Scaling the target to the opening range\u2019s size lets the strategy adapt to how volatile that particular stock\u2019s open actually was.',
      },
      {
        type: 'concept',
        eyebrow: 'The exit if it fails',
        heading: 'A clean, built-in stop-loss',
        text: "If price falls back below the opening low, the entire premise — that the early range would act as support — has failed, making the opening low a natural, mechanical stop-loss level that doesn't require any extra calculation.",
      },
      {
        type: 'keyConcept',
        text: 'ORB treats the very first part of the trading session as a miniature support/resistance battle — breaking out of that early range, on real volume, is read as a signal for how the rest of the day is likely to unfold.',
      },
      {
        type: 'quiz',
        questions: [
          {
            question: 'What does TradeIQ\u2019s ORB strategy use as its stop-loss level?',
            options: ['The 200-day SMA', 'The low of the opening range', 'The previous day\u2019s closing price', 'A fixed $1 stop'],
            correct: 1,
            explanation: 'A drop back below the opening low invalidates the breakout thesis, making it the natural stop-loss.',
          },
          {
            question: 'Why might the first candle of the trading day carry extra significance?',
            options: ['It has no significance at all', 'Overnight orders and the most active traders converge right at the open', 'It always predicts the closing price exactly', 'Only options traders care about the open'],
            correct: 1,
            explanation: 'The open concentrates a burst of activity and information that often sets the tone for the session.',
          },
        ],
      },
      { type: 'complete' },
    ],
    simSection: 'ai-trader',
    simStrategy: 'opening_range_breakout',
  },
  {
    id: 14,
    title: 'EMA Trend Trading (9/21 Crossover)',
    week: 2,
    day: 7,
    readTime: '6 min',
    steps: [
      {
        type: 'intro',
        objectives: [
          'Go from understanding the EMA crossover concept to trading it as a system',
          'See the full entry, exit, and stop-loss rules behind TradeIQ\u2019s EMA Crossover strategy',
          'Understand why this strategy checks for a cross within the last few days, not just "right now"',
        ],
      },
      {
        type: 'concept',
        eyebrow: 'From concept to system',
        heading: "You already know what a bullish crossover is — here's how it becomes a tradeable strategy",
        text: "Lesson 4 covered the idea: EMA-9 crossing above EMA-21 signals short-term momentum overtaking the medium-term trend. TradeIQ's EMA Crossover strategy turns that single idea into a full system with five rules, an entry trigger, a stop-loss, and an exit condition.",
        visual: 'emaCrossover',
      },
      {
        type: 'concept',
        eyebrow: 'Catching a recent cross, not just the current state',
        heading: 'Looking back a few days, not only at today',
        text: "Rather than only checking whether EMA-9 sits above EMA-21 right now, this strategy actively scans the last few sessions for the moment the cross happened — catching the move shortly after it occurs rather than only when checked on the exact crossing day.",
      },
      {
        type: 'check',
        prompt: 'Why might a strategy check for a crossover that happened a few days ago, not just "is EMA9 above EMA21 today"?',
        options: ['It has no real benefit', 'It can catch a recent crossover even if it wasn\u2019t checked on the exact day it occurred', 'It only works on the 200-day EMA', 'It guarantees no false signals'],
        correct: 1,
        explanation: 'Scanning a short recent window means the strategy doesn\u2019t miss a crossover just because nobody was watching the exact day it happened.',
      },
      {
        type: 'concept',
        eyebrow: 'Confirming filters',
        heading: 'The cross alone isn\u2019t enough',
        text: "Beyond the crossover itself, the full rule set requires price above EMA-50, the EMAs stacked bullishly (EMA-21 above EMA-50), RSI in a healthy 45-75 range, and price above the previous close — five total checks working together rather than relying on the crossover in isolation.",
      },
      {
        type: 'concept',
        eyebrow: 'The exit',
        heading: 'The same signal that triggers entry, triggers exit',
        text: "This strategy exits cleanly and symmetrically: if EMA-9 crosses back below EMA-21, the original thesis has reversed, and the position is closed. The stop-loss defaults to the EMA-21 line itself — a trend-following stop that moves with the trend rather than sitting at a fixed price.",
      },
      {
        type: 'check',
        prompt: "TradeIQ's EMA Crossover strategy's stop-loss is generally set at:",
        options: ['A fixed 10% below entry', 'The EMA-21 line', 'The 52-week low', 'It has no stop-loss'],
        correct: 1,
        explanation: 'Using EMA-21 as the stop means the stop level itself moves with the trend, rather than staying fixed.',
      },
      {
        type: 'keyConcept',
        text: 'A single chart pattern like a crossover becomes a real trading system only once it has explicit entry confirmation, a defined stop, and a symmetric exit — the crossover idea from Lesson 4 is the spark, but the full rule set is what makes it tradeable.',
      },
      {
        type: 'quiz',
        questions: [
          {
            question: 'Besides the EMA9/EMA21 cross itself, which of these is also required by this strategy?',
            options: ['RSI between roughly 45 and 75', 'A 52-week high', 'A gap up of at least 1.5%', 'Quarterly earnings growth'],
            correct: 0,
            explanation: 'The RSI range filter helps confirm healthy bullish momentum without being already overextended.',
          },
          {
            question: 'What triggers an exit from this strategy?',
            options: ['The position automatically closes after 5 days', 'EMA-9 crossing back below EMA-21', 'RSI reaching exactly 50', 'Trading volume hitting zero'],
            correct: 1,
            explanation: 'The exit mirrors the entry — a reversal of the same crossover that triggered the trade in the first place.',
          },
        ],
      },
      { type: 'complete' },
    ],
    simSection: 'ai-trader',
    simStrategy: 'ema_crossover',
  },
  {
    id: 15,
    title: 'Choosing Your Trading Style',
    week: 3,
    day: 1,
    readTime: '9 min',
    steps: [
      {
        type: 'intro',
        objectives: [
          'Understand day trading, swing trading, and long-term investing as three distinct paths',
          'Compare time horizon, attention required, and temperament for each',
          'Choose a path to try first in the simulator \u2014 without losing access to the other two',
        ],
      },
      {
        type: 'concept',
        eyebrow: 'Same market, three different games',
        heading: 'These aren\u2019t just different speeds \u2014 they\u2019re different skill sets',
        text: "So far, every strategy lesson has lived inside one of three styles without always naming it directly. This lesson makes the split explicit: day trading, swing trading, and long-term investing aren't just \"fast, medium, and slow\" versions of the same thing. Each demands a different relationship with time, risk, and your own temperament.",
      },
      {
        type: 'concept',
        eyebrow: 'Path 1 of 3 \u2014 Day Trading',
        heading: 'In and out before the closing bell',
        text: "Day trading means every position opens and closes within the same session \u2014 no overnight risk, but constant attention during market hours. A day trader using Gap and Go or Opening Range Breakout might place several trades before lunch, each lasting minutes to a couple of hours, watching price and volume continuously rather than checking in occasionally.",
      },
      {
        type: 'concept',
        eyebrow: 'Day trading \u2014 temperament check',
        heading: 'Who tends to do well here',
        text: "Day trading rewards fast decision-making, comfort with frequent small losses, and the ability to sit at a screen during market hours without that becoming exhausting. It punishes hesitation and impatience in roughly equal measure \u2014 hesitating costs the entry, impatience cuts winners short.",
      },
      {
        type: 'concept',
        eyebrow: 'Path 2 of 3 \u2014 Swing Trading',
        heading: 'Holding through the noise, not the whole story',
        text: "Swing trading holds positions for days to a few weeks, riding a trend without needing to watch every tick. A swing trader using CANSLIM, Momentum Breakout, or EMA Crossover checks in once or twice a day rather than continuously \u2014 looking past the minute-to-minute wiggles most day traders react to.",
      },
      {
        type: 'concept',
        eyebrow: 'Swing trading \u2014 temperament check',
        heading: 'Who tends to do well here',
        text: "Swing trading suits people who want real involvement without needing to watch the market live all day \u2014 often a better fit alongside a full-time job. It rewards patience through overnight and weekend gaps, and punishes the urge to check prices every five minutes and exit at the first wobble.",
      },
      {
        type: 'concept',
        eyebrow: 'Path 3 of 3 \u2014 Long-Term Investing',
        heading: 'Buying a business, not a price chart',
        text: "Long-term investing \u2014 sometimes called value or \"Buffett style\" investing \u2014 holds positions for years, built on the idea that you're buying partial ownership of a real, ongoing business rather than betting on a short-term price move. TradeIQ's Quality Compounder strategy is built specifically for this path: it screens for strong return on equity, manageable debt, growing revenue and earnings, and a reasonable valuation \u2014 the fundamentals from Lesson 8 and 9\u2019s \"C\" and \"A,\" applied with a multi-year time horizon instead of a multi-week one.",
      },
      {
        type: 'concept',
        eyebrow: 'Long-term investing \u2014 temperament check',
        heading: 'Who tends to do well here',
        text: "This path rewards patience measured in years, comfort holding through real volatility without panic-selling on a bad quarter, and genuine interest in business fundamentals over chart patterns. It punishes the urge to check a position daily and react to short-term noise that, on a multi-year view, usually doesn\u2019t matter.",
      },
      {
        type: 'check',
        prompt: 'Which trading style is built around holding a position for years based on company fundamentals rather than chart patterns?',
        options: ['Day trading', 'Swing trading', 'Long-term investing', 'All three equally'],
        correct: 2,
        explanation: 'Long-term investing, exemplified by the Quality Compounder strategy, is fundamentals-driven and measured in years, not days or weeks.',
      },
      {
        type: 'concept',
        eyebrow: 'No wrong answer',
        heading: 'These paths aren\u2019t mutually exclusive',
        text: "Plenty of real traders use more than one style \u2014 a small, active day-trading account alongside a separate long-term holding. There's no rule requiring you to pick exactly one forever. What matters right now is starting somewhere that matches the time and attention you actually have to give it.",
      },
      {
        type: 'keyConcept',
        text: 'Day trading, swing trading, and long-term investing aren\u2019t different speeds of the same skill \u2014 they\u2019re different games with different time horizons, attention demands, and temperaments. The right starting point is whichever one matches how much time and attention you genuinely want to give the market, not whichever sounds most exciting.',
      },
      {
        type: 'quiz',
        questions: [
          {
            question: 'Which style typically requires continuous attention during market hours, with no overnight positions?',
            options: ['Day trading', 'Swing trading', 'Long-term investing', 'None of them'],
            correct: 0,
            explanation: 'Day trading closes every position within the same session, which is exactly why it demands real-time attention during market hours.',
          },
          {
            question: 'A trader who checks in once or twice a day and holds positions for days to a few weeks is practicing:',
            options: ['Day trading', 'Swing trading', 'Scalping', 'Long-term investing'],
            correct: 1,
            explanation: 'That cadence and holding period is the defining shape of swing trading.',
          },
          {
            question: 'Is it necessary to pick exactly one trading style forever?',
            options: ['Yes, switching styles is not allowed', 'No \u2014 many traders use more than one style for different parts of their capital', 'Yes, but only professionals can switch', 'Only long-term investing is a real strategy'],
            correct: 1,
            explanation: 'Many traders blend styles \u2014 the goal here is finding a starting point, not a permanent, exclusive commitment.',
          },
        ],
      },
      {
        type: 'complete',
        pathChoice: true,
        pathOptions: [
          { style: 'day', label: 'Try Day Trading', section: 'ai-trader', strategy: 'gap_and_go' },
          { style: 'swing', label: 'Try Swing Trading', section: 'ai-trader', strategy: 'momentum_breakout' },
          { style: 'long_term', label: 'Try Long-Term Investing', section: 'ai-trader', strategy: 'quality_compounder' },
        ],
      },
    ],
    simSection: null,
    simStrategy: null,
  },
  {
    id: 16,
    title: 'Scalping Fundamentals',
    week: 3,
    day: 2,
    readTime: '6 min',
    steps: [
      {
        type: 'intro',
        objectives: [
          'Understand scalping as the fastest, most extreme form of day trading',
          'See why scalping depends on costs and execution speed more than any other style',
          'Recognize why scalping is the most demanding style temperamentally',
        ],
      },
      {
        type: 'concept',
        eyebrow: 'Day trading, pushed to its limit',
        heading: 'Scalping compresses the whole trade into minutes — or seconds',
        text: "If day trading holds for minutes to hours, scalping holds for seconds to a few minutes, aiming to capture tiny, repeatable price movements many times over rather than one larger move. A scalper might place dozens of trades in a single session, each targeting a small fraction of a percent.",
      },
      {
        type: 'concept',
        eyebrow: 'Why size compensates for smaller moves',
        heading: 'Small edge per trade, repeated often',
        text: "Because each individual scalp targets such a small price move, scalpers typically trade larger position sizes to make the absolute dollar profit worthwhile — which also means a small adverse move creates outsized risk if size isn't tightly controlled.",
      },
      {
        type: 'check',
        prompt: 'Scalping is best described as:',
        options: ['Holding positions for multiple years', 'An extreme, very short-duration form of day trading targeting small, frequent price moves', 'A type of long-term value investing', 'A strategy that ignores price entirely'],
        correct: 1,
        explanation: 'Scalping is day trading taken to its fastest extreme — seconds to minutes, repeated many times per session.',
      },
      {
        type: 'concept',
        eyebrow: 'The hidden cost problem',
        heading: 'Costs matter more here than anywhere else',
        text: "Because the target move per trade is so small, transaction costs and the bid-ask spread eat up a much larger share of the potential profit than they would in a swing trade targeting a 10% move. Scalping that ignores this reality can look profitable on paper while actually losing money to costs in practice.",
      },
      {
        type: 'concept',
        eyebrow: 'Why this is the hardest style, temperamentally',
        heading: 'No time to think — only to react',
        text: "Scalping leaves essentially no time for deliberation; decisions happen almost reflexively. It demands sustained, intense focus for the entire session and is widely considered the most mentally taxing of the three broad styles introduced in Lesson 15 — well beyond standard day trading.",
      },
      {
        type: 'check',
        prompt: 'Why do transaction costs matter disproportionately more in scalping than in swing trading?',
        options: ['They don\u2019t \u2014 costs are identical for every strategy', 'The target profit per trade is so small that costs consume a larger share of it', 'Scalpers don\u2019t pay any trading costs', 'Costs only apply to long-term investors'],
        correct: 1,
        explanation: 'A strategy targeting a tiny per-trade move is far more sensitive to costs eating into that thin margin than one targeting a much larger move.',
      },
      {
        type: 'keyConcept',
        text: 'Scalping is day trading\u2019s most extreme form — tiny, frequent gains, larger size to compensate, and a cost structure and mental demand that make it the most punishing style to do well for an extended period.',
      },
      {
        type: 'quiz',
        questions: [
          {
            question: 'A scalper typically holds a position for:',
            options: ['Several years', 'Days to weeks', 'Seconds to a few minutes', 'Exactly one trading day'],
            correct: 2,
            explanation: 'Scalping is defined by extremely short holding periods, far shorter than standard day trading.',
          },
          {
            question: 'Why do scalpers often trade larger position sizes than other styles?',
            options: ['To compensate for the very small per-trade price target', 'Because regulations require it', 'Because larger size eliminates all risk', 'It has no relationship to position size'],
            correct: 0,
            explanation: 'A small target move per trade means a larger size is needed to make the resulting dollar profit meaningful.',
          },
        ],
      },
      { type: 'complete' },
    ],
    simSection: 'ai-trader',
    simStrategy: 'opening_range_breakout',
  },
  {
    id: 17,
    title: 'Reading Market Direction',
    week: 3,
    day: 3,
    readTime: '7 min',
    steps: [
      {
        type: 'intro',
        objectives: [
          'Revisit why overall market direction matters more than most individual setups',
          'Learn to use broad index ETFs as a quick market-health check',
          'Understand market breadth as a way to judge how broad a move really is',
        ],
      },
      {
        type: 'concept',
        eyebrow: 'Picking back up the "M"',
        heading: 'The market is the tide every stock floats on',
        text: "Lesson 9 introduced the \"M\" in CANSLIM — the finding that most individual stocks tend to move with the broader market. This lesson goes deeper: how do you actually judge market direction quickly, before evaluating any individual stock setup?",
      },
      {
        type: 'concept',
        eyebrow: 'A fast proxy',
        heading: 'Broad index ETFs as a market health check',
        text: "SPY (tracking the S&P 500) and QQQ (tracking the Nasdaq-100) — both available as tickers right inside TradeIQ — are quick proxies for overall market health. Checking whether SPY itself is above or below its own 50-day and 200-day SMA gives a fast read on whether the broader tide is currently helping or fighting individual long setups.",
      },
      {
        type: 'check',
        prompt: 'Why might a trader check SPY\u2019s trend before taking an individual stock trade?',
        options: ['SPY has no relationship to other stocks', 'Most stocks tend to move with the broader market, so a falling market raises the odds an individual long trade fights the tide', 'SPY only matters for bond traders', 'It guarantees the individual trade will work'],
        correct: 1,
        explanation: 'Since most stocks correlate with the broader market to some degree, the market\u2019s own trend is useful context before committing to an individual setup.',
      },
      {
        type: 'concept',
        eyebrow: 'Beyond a single index number',
        heading: 'Market breadth: how many stocks are actually participating',
        text: "An index can rise even while only a handful of giant companies do the heavy lifting — a narrow, less healthy kind of rally. <strong>Market breadth</strong> looks at how many individual stocks are participating in a move, not just the index level itself. A rally where most stocks are climbing together is generally considered healthier than one driven by a few mega-cap names alone.",
      },
      {
        type: 'concept',
        eyebrow: 'Three regimes',
        heading: 'Uptrend, downtrend, or chop',
        text: "Broadly, the market sits in one of three regimes: a clear uptrend (favoring long, momentum-style setups), a clear downtrend (favoring caution or short-side thinking), or a choppy, range-bound period with no clear direction (where breakout strategies tend to produce more false signals than usual).",
      },
      {
        type: 'check',
        prompt: 'A choppy, range-bound market regime tends to be especially difficult for which type of strategy?',
        options: ['Long-term value investing', 'Breakout strategies, since false breakouts become more common without a clear trend', 'It has no effect on any strategy', 'Only affects bond markets'],
        correct: 1,
        explanation: 'Without a clear prevailing trend, price tends to whipsault back and forth across resistance/support levels, increasing false breakout signals.',
      },
      {
        type: 'keyConcept',
        text: 'Reading the broader market first — using index ETFs and breadth as quick health checks — adds essential context to any individual stock setup. A great-looking chart in a strongly hostile market regime deserves more skepticism than the same chart in a confirmed uptrend.',
      },
      {
        type: 'quiz',
        questions: [
          {
            question: 'What does "market breadth" measure?',
            options: ['The total number of shares outstanding', 'How many individual stocks are participating in a market move, not just the index level', 'The bid-ask spread on an index ETF', 'How long the market has been open'],
            correct: 1,
            explanation: 'Breadth looks past the headline index number to whether the move is broad-based or concentrated in a few names.',
          },
          {
            question: 'Which two tickers does this lesson mention as quick proxies for overall market health?',
            options: ['AAPL and TSLA', 'SPY and QQQ', 'JPM and META', 'NVDA and AMZN'],
            correct: 1,
            explanation: 'SPY (S&P 500) and QQQ (Nasdaq-100) are broad index ETFs commonly used as quick market-health checks.',
          },
        ],
      },
      { type: 'complete' },
    ],
    simSection: 'research',
    simStrategy: null,
  },
  {
    id: 18,
    title: 'Trading Psychology',
    week: 3,
    day: 4,
    readTime: '8 min',
    steps: [
      {
        type: 'intro',
        objectives: [
          'Recognize the most common emotional traps in trading',
          'Understand loss aversion and why losses feel heavier than equivalent gains',
          'See why a written process matters more than willpower alone',
        ],
      },
      {
        type: 'concept',
        eyebrow: 'The part most lessons skip',
        heading: 'Strategy is the easy part — discipline is the hard part',
        text: "Every strategy in this curriculum has clear, mechanical rules. The hardest part of trading isn't learning those rules — it's actually following them in real time, with real money on the line, when emotion is pulling in a different direction than the plan.",
      },
      {
        type: 'concept',
        eyebrow: 'Why losses hurt more than wins feel good',
        heading: 'Loss aversion is wired in, not a personal flaw',
        text: "Behavioral research consistently finds that a loss of a given size feels considerably more painful than an equivalent gain feels good. This isn't a character weakness — it's a well-documented, near-universal bias. Knowing it exists is what allows a trader to recognize it influencing a decision in the moment.",
      },
      {
        type: 'check',
        prompt: 'Loss aversion describes the tendency for:',
        options: ['Losses and gains of the same size to feel emotionally equal', 'A loss to feel more painful than an equivalent-sized gain feels pleasurable', 'Traders to never feel any emotion about losses', 'Gains to always feel better than losses hurt'],
        correct: 1,
        explanation: 'Loss aversion is the well-documented asymmetry where losses are felt more intensely than same-sized gains.',
      },
      {
        type: 'concept',
        eyebrow: 'The classic trap',
        heading: 'Revenge trading',
        text: "After a loss, the urge to immediately \"win it back\" with a bigger, often hastily-planned trade is one of the most common and most damaging psychological traps. It typically abandons the very risk rules that would normally apply, turning one loss into a much larger one.",
      },
      {
        type: 'concept',
        eyebrow: 'The other classic trap',
        heading: 'FOMO — fear of missing out',
        text: "Watching a stock run without you, then jumping in late out of pure urgency rather than an actual signal, is the mirror image of revenge trading. Both are driven by emotion overriding a plan — one by pain, the other by the fear of missed opportunity.",
      },
      {
        type: 'check',
        prompt: 'Entering a trade quickly after a loss, specifically trying to "win back" the loss right away, is best described as:',
        options: ['Disciplined risk management', 'Revenge trading', 'Mean reversion', 'Diversification'],
        correct: 1,
        explanation: 'Revenge trading is acting on the emotional urge to immediately recover a loss, usually by abandoning normal risk discipline.',
      },
      {
        type: 'concept',
        eyebrow: 'The fix isn\u2019t willpower',
        heading: 'A written process beats trying harder in the moment',
        text: "Because these biases are largely automatic, trying to simply \"be more disciplined\" in the heat of the moment is a weak defense. A written trading plan — entry rules, position size, stop-loss, and target decided <em>before</em> emotion is involved — gives a calmer version of yourself a say in decisions the in-the-moment version is prone to getting wrong.",
      },
      {
        type: 'concept',
        eyebrow: 'A simple habit',
        heading: 'A trading journal turns feelings into data',
        text: "Logging not just what was traded but why, and how it felt at the time, makes patterns visible over weeks and months — like noticing every revenge trade happened within an hour of a loss. That kind of pattern is nearly invisible in the moment but obvious in hindsight, once it's written down.",
      },
      {
        type: 'keyConcept',
        text: "The strategies in this curriculum are mechanical and learnable in a few lessons each. The much harder, ongoing skill is noticing loss aversion, FOMO, and revenge trading pulling at a decision in real time — and trusting a plan written by a calmer version of yourself over whatever feels urgent right now.",
      },
      {
        type: 'quiz',
        questions: [
          {
            question: 'What does FOMO-driven trading typically look like?',
            options: ['Carefully waiting for a strategy\u2019s exact entry signal', 'Jumping into a trade late out of fear of missing a move, without an actual signal', 'Never entering any trade', 'Only trading long-term investments'],
            correct: 1,
            explanation: 'FOMO entries are driven by urgency and fear of missing out, not by an actual strategy signal being met.',
          },
          {
            question: 'Why is a written trading plan more reliable than relying on willpower in the moment?',
            options: ['Written plans have no real benefit', 'Decisions made calmly in advance aren\u2019t subject to the same emotional pressure as in-the-moment decisions', 'Willpower always wins regardless', 'Plans remove all risk from trading'],
            correct: 1,
            explanation: 'A plan decided in advance, away from the emotional pressure of an active trade, tends to hold up better than relying on discipline alone in the heat of the moment.',
          },
        ],
      },
      { type: 'complete' },
    ],
    simSection: 'my-desk',
    simStrategy: null,
  },
  {
    id: 19,
    title: 'Building Your Trading Plan',
    week: 3,
    day: 5,
    readTime: '8 min',
    steps: [
      {
        type: 'intro',
        objectives: [
          'Pull strategy, risk management, and psychology together into one written plan',
          'Know the specific components every trading plan should define in advance',
          'Prepare a personal plan to actually use heading into the capstone challenge',
        ],
      },
      {
        type: 'concept',
        eyebrow: 'Bringing it together',
        heading: 'Eighteen lessons, one document',
        text: "Every previous lesson contributed one piece: indicators to read the market, specific strategies to act on, risk rules to size and protect each trade, and psychology to understand what gets in the way. A trading plan is where all of that finally gets written down in one place, before it's needed.",
      },
      {
        type: 'concept',
        eyebrow: 'Component 1',
        heading: 'Which style and strategy — chosen, not improvised',
        text: "The plan starts by naming a specific path from Lesson 15 (day, swing, or long-term) and one or two specific strategies within it — not \"I\u2019ll trade whatever looks good,\" but a named, pre-committed approach like \"swing trading using Momentum Breakout and EMA Crossover.\"",
      },
      {
        type: 'concept',
        eyebrow: 'Component 2',
        heading: 'Entry, stop-loss, and target — defined before, not during',
        text: "For the chosen strategy, the plan writes down the exact entry conditions, where the stop-loss sits, and what the profit target looks like — all decided with a clear head, so the in-the-moment version of the trader is executing a decision, not making one from scratch under pressure.",
      },
      {
        type: 'check',
        prompt: 'A trading plan\u2019s entry, stop-loss, and target should ideally be decided:',
        options: ['After the trade is already losing money', 'Before the trade is placed, while thinking clearly', 'Only by a financial advisor', 'They don\u2019t need to be decided in advance'],
        correct: 1,
        explanation: 'Deciding these elements in advance, calmly, is exactly what keeps emotion from rewriting the plan mid-trade.',
      },
      {
        type: 'concept',
        eyebrow: 'Component 3',
        heading: 'Position sizing rules, written as a number',
        text: "Rather than a vague intention to \"be careful with size,\" the plan states a concrete rule from Lesson 7 — for example, risking no more than 1-2% of total capital per trade — so sizing is a calculation, not a feeling, every single time.",
      },
      {
        type: 'concept',
        eyebrow: 'Component 4',
        heading: 'Rules for the bad days',
        text: "A complete plan also defines what happens after a loss or a string of losses — for instance, a maximum number of trades or a maximum daily loss that, once hit, ends trading for the day. This is a direct, practical defense against the revenge-trading trap from Lesson 18.",
      },
      {
        type: 'check',
        prompt: 'A rule that says "stop trading for the day after two losing trades" is primarily a defense against:',
        options: ['Market holidays', 'Revenge trading', 'Stock splits', 'Dividend taxes'],
        correct: 1,
        explanation: 'A hard stopping rule, decided in advance, is a direct, mechanical guard against the urge to immediately chase back a loss.',
      },
      {
        type: 'concept',
        eyebrow: 'Component 5',
        heading: 'A review habit',
        text: "Finally, the plan should include a regular review cadence — weekly or monthly — using the trading journal from Lesson 18 to check whether the plan is actually being followed, and whether it's working. A plan that's never revisited tends to quietly stop being followed.",
      },
      {
        type: 'keyConcept',
        text: "A trading plan isn't a guarantee of profit — it's a pre-committed decision-making framework that keeps a clear-headed version of you in charge of entries, exits, sizing, and bad-day limits, instead of leaving those decisions to whoever you are in the heat of the moment.",
      },
      {
        type: 'quiz',
        questions: [
          {
            question: 'Which of these is NOT one of the core components a trading plan should define?',
            options: ['Entry and exit rules for a specific strategy', 'A maximum daily loss or trade-count limit', 'Position sizing as a concrete rule', 'The exact future price of the stock'],
            correct: 3,
            explanation: 'No plan can predict an exact future price — the plan defines a process and rules, not a price prediction.',
          },
          {
            question: 'Why does a trading plan typically include a regular review habit?',
            options: ['It has no real purpose', 'To check whether the plan is actually being followed and whether it\u2019s working', 'It\u2019s only required for tax purposes', 'To predict the next stock pick'],
            correct: 1,
            explanation: 'Regular review, using a trading journal, keeps the plan honest and catches drift before it becomes a habit.',
          },
        ],
      },
      { type: 'complete' },
    ],
    simSection: 'my-desk',
    simStrategy: null,
  },
  {
    id: 20,
    title: 'Paper Trading Challenge (Capstone)',
    week: 3,
    day: 6,
    readTime: '6 min',
    steps: [
      {
        type: 'intro',
        objectives: [
          'Review the full arc of the curriculum, from market basics to a written plan',
          'Set a concrete, time-boxed paper trading challenge for yourself',
          'Know exactly where to go next inside TradeIQ to start',
        ],
      },
      {
        type: 'concept',
        eyebrow: 'Look how far this has come',
        heading: 'From "what is a stock" to a written trading plan',
        text: "Nineteen lessons ago, this curriculum started with the basic mechanics of what a share of stock actually is. Since then: chart reading, candlestick psychology, momentum indicators, nine named strategies, risk management, all three trading styles, the psychology of discipline, and finally a complete written plan. This lesson is the bridge from knowing all of that to actually doing it.",
      },
      {
        type: 'concept',
        eyebrow: 'The challenge',
        heading: 'A real, time-boxed paper trading challenge',
        text: "Pick one strategy from your trading plan. Commit to a fixed window — two weeks is a reasonable starting point — where every trade in My Desk or AI Trader follows that strategy's rules exactly, with position sizing capped per Lesson 7's guidelines on every single trade, no exceptions.",
      },
      {
        type: 'concept',
        eyebrow: 'What success actually looks like',
        heading: 'Following the plan matters more than the P&L',
        text: "It's tempting to judge the challenge purely by whether the paper portfolio went up. The more useful measure: did every trade actually follow the written rules — the entry condition, the stop-loss, the position size? A losing trade that followed the plan exactly is a process success; a winning trade that broke the rules is a warning sign, not a victory.",
      },
      {
        type: 'check',
        prompt: 'During this paper trading challenge, which is the better measure of success?',
        options: ['Total dollar profit only, regardless of process', 'Whether every trade actually followed the written plan\u2019s rules', 'How many trades were placed', 'Whether the stock market went up that day'],
        correct: 1,
        explanation: 'Process adherence is the real skill being built — short-term P&L on any given two-week window is heavily influenced by luck either way.',
      },
      {
        type: 'concept',
        eyebrow: 'The journal habit, starting now',
        heading: 'Log every trade as it happens',
        text: "Starting this challenge is the right moment to begin the trading journal habit from Lesson 18 for real — what was traded, why, and how it felt — so there's an honest record to review against the plan once the two weeks are up.",
      },
      {
        type: 'concept',
        eyebrow: 'Where to go from here',
        heading: 'AI Trader, My Desk, and Research are all ready',
        text: "AI Trader will run your chosen strategy automatically and explain every decision it makes along the way. My Desk lets you place the same strategy's trades yourself, by hand, for direct practice with the discipline this challenge is really about. Research lets you dig into any ticker's fundamentals and technicals before committing to a trade in either one.",
      },
      {
        type: 'keyConcept',
        text: "This curriculum's real goal was never to memorize nine strategy names — it was to build the judgment to choose one deliberately, size it responsibly, and stick to the plan when emotion pulls the other way. The paper trading challenge is where that judgment actually gets tested, with zero real-money risk while it does.",
      },
      {
        type: 'quiz',
        questions: [
          {
            question: 'What is the recommended way to measure success during the paper trading challenge?',
            options: ['Total profit alone', 'Strict adherence to the written trading plan\u2019s rules on every trade', 'Number of trades placed per day', 'Whether the chosen stock pays a dividend'],
            correct: 1,
            explanation: 'Following the plan consistently is the actual skill being practiced — short-term results are noisy regardless of skill level.',
          },
          {
            question: 'According to this lesson, what should begin alongside the paper trading challenge?',
            options: ['Switching to real-money trading immediately', 'The trading journal habit from Lesson 18', 'Ignoring the written trading plan', 'Trading every available strategy at once'],
            correct: 1,
            explanation: 'A journal gives an honest record to review the challenge against once the time-boxed window ends.',
          },
        ],
      },
      { type: 'complete' },
    ],
    simSection: 'ai-trader',
    simStrategy: null,
  },
];

const VISUALS = {
  emaCrossover: buildEmaCrossoverSvg,
  emaStack: buildEmaStackSvg,
  rsiZones: buildRsiZonesSvg,
  macdDiagram: buildMacdSvg,
  vwapLine: buildVwapSvg,
};

const LessonsSection = (() => {
  let state = {
    activeLessonId: 1,
    progress: [],
    stepIndex: 0,
    checkAnswered: {},
    quizAnswers: {},
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
    state.stepIndex = 0;
    state.checkAnswered = {};
    state.quizAnswers = {};

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
            <div class="lessons-progress-label"><span>${completedCount} / 20 complete</span><span>${pct}%</span></div>
            <div class="lessons-progress-track"><div class="lessons-progress-fill" style="width:${pct}%;"></div></div>
          </div>
          <nav id="lessons-nav"></nav>
        </div>
        <div class="lesson-player" id="lesson-player"></div>
      </div>
    `;

    renderNav();
    renderPlayer();
  }

  function renderNav() {
    const nav = document.getElementById('lessons-nav');
    const weeks = [
      { label: 'Week 1 \u00b7 Foundations', lessons: LESSONS.filter((l) => l.week === 1) },
      { label: 'Week 2 \u00b7 Strategies', lessons: LESSONS.filter((l) => l.week === 2) },
      { label: 'Week 3 \u00b7 Advanced', lessons: LESSONS.filter((l) => l.week === 3) },
    ];

    nav.innerHTML = weeks.map((w) => {
      if (w.lessons.length === 0) return '';
      return `
        <div class="week-group-header">${w.label}</div>
        ${w.lessons.map((l) => `
          <button class="lesson-nav-item ${l.id === state.activeLessonId ? 'active' : ''} ${isCompleted(l.id) ? 'completed' : ''}" data-lesson-id="${l.id}">
            <span class="lesson-num">${l.id}</span>
            <span class="lesson-title-text">${l.title}</span>
            ${isCompleted(l.id) ? '<i class="fa-solid fa-check check-icon"></i>' : ''}
          </button>
        `).join('')}
      `;
    }).join('');

    nav.querySelectorAll('.lesson-nav-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activeLessonId = Number(btn.dataset.lessonId);
        state.stepIndex = 0;
        state.checkAnswered = {};
        state.quizAnswers = {};
        renderLayout();
      });
    });
  }

  function renderPlayer() {
    const lesson = getLessonById(state.activeLessonId);
    const player = document.getElementById('lesson-player');
    if (!lesson) {
      player.innerHTML = '<div class="empty-state">Lesson not found.</div>';
      return;
    }

    const steps = lesson.steps;
    const idx = Math.max(0, Math.min(state.stepIndex, steps.length - 1));
    const step = steps[idx];

    player.innerHTML = `
      <div class="lesson-player-header">
        <div class="lesson-eyebrow">
          <span>Week ${lesson.week} \u00b7 Day ${lesson.day}</span>
          <span class="dot">\u00b7</span>
          <span>${lesson.readTime}</span>
        </div>
        <div class="candle-strip" id="candle-strip"></div>
      </div>
      <div class="lesson-player-body" id="step-body"></div>
      <div class="lesson-player-footer">
        <button class="btn" id="step-back-btn" ${idx === 0 ? 'disabled' : ''}><i class="fa-solid fa-arrow-left"></i> Back</button>
        <button class="btn btn-primary" id="step-next-btn">Continue <i class="fa-solid fa-arrow-right"></i></button>
      </div>
    `;

    renderCandleStrip(steps, idx);
    renderStep(lesson, step, idx);

    document.getElementById('step-back-btn').addEventListener('click', () => {
      if (state.stepIndex > 0) {
        state.stepIndex -= 1;
        renderPlayer();
      }
    });
    document.getElementById('step-next-btn').addEventListener('click', () => handleNext(lesson, steps, idx));

    updateNextButtonState(lesson, step, idx);
  }

  function renderCandleStrip(steps, currentIdx) {
    const strip = document.getElementById('candle-strip');
    if (!strip) return;
    strip.innerHTML = steps.map((s, i) => {
      const cls = i < currentIdx ? 'done' : i === currentIdx ? 'current' : '';
      return `<div class="candle ${cls}"><div class="candle-body"></div></div>`;
    }).join('');
  }

  function renderStep(lesson, step, idx) {
    const body = document.getElementById('step-body');
    body.className = 'step-fade';

    if (step.type === 'intro') {
      body.innerHTML = `
        <div class="step-intro">
          <h1>${lesson.title}</h1>
          <ul class="objectives-list">
            ${step.objectives.map((o) => `<li><i class="fa-solid fa-circle-check"></i>${o}</li>`).join('')}
          </ul>
        </div>
      `;
    } else if (step.type === 'concept') {
      const visualHtml = step.visual && VISUALS[step.visual] ? `<div class="concept-visual">${VISUALS[step.visual]()}</div>` : '';
      body.innerHTML = `
        <div class="step-concept">
          <div class="concept-eyebrow">${step.eyebrow}</div>
          <h2>${step.heading}</h2>
          <p class="concept-text">${step.text}</p>
          ${visualHtml}
        </div>
      `;
    } else if (step.type === 'check') {
      renderCheckStep(step, idx);
    } else if (step.type === 'keyConcept') {
      body.innerHTML = `
        <div class="step-keyconcept">
          <div class="takeaway-card">
            <div class="takeaway-label"><i class="fa-solid fa-lightbulb"></i> Key takeaway</div>
            <p class="takeaway-text">${step.text}</p>
          </div>
        </div>
      `;
    } else if (step.type === 'quiz') {
      renderQuizStep(step, idx);
    } else if (step.type === 'complete') {
      renderCompleteStep(lesson, step);
    }
  }

  function renderCheckStep(step, idx) {
    const body = document.getElementById('step-body');
    const answered = state.checkAnswered[idx];
    body.innerHTML = `
      <div class="step-check">
        <div class="check-prompt">${step.prompt}</div>
        <div class="check-options">
          ${step.options.map((opt, i) => `<button class="check-option-btn" data-i="${i}">${opt}</button>`).join('')}
        </div>
        <div id="check-feedback-slot"></div>
      </div>
    `;

    if (answered !== undefined) {
      applyCheckAnswerUI(step, idx, answered, false);
    }

    body.querySelectorAll('.check-option-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (state.checkAnswered[idx] !== undefined) return;
        const choice = Number(btn.dataset.i);
        state.checkAnswered[idx] = choice;
        applyCheckAnswerUI(step, idx, choice, true);
        updateNextButtonState(getLessonById(state.activeLessonId), step, idx);
      });
    });
  }

  function applyCheckAnswerUI(step, idx, choice) {
    const body = document.getElementById('step-body');
    body.querySelectorAll('.check-option-btn').forEach((btn) => {
      const i = Number(btn.dataset.i);
      btn.disabled = true;
      if (i === step.correct) btn.classList.add('correct');
      if (i === choice && choice !== step.correct) btn.classList.add('incorrect');
    });
    const isRight = choice === step.correct;
    const slot = document.getElementById('check-feedback-slot');
    slot.innerHTML = `<div class="check-feedback ${isRight ? 'right' : 'wrong'}">${isRight ? 'Exactly right.' : 'Not quite.'} ${step.explanation}</div>`;
  }

  function renderQuizStep(step, idx) {
    const body = document.getElementById('step-body');
    state.quizAnswers[idx] = state.quizAnswers[idx] || {};
    const answers = state.quizAnswers[idx];

    body.innerHTML = `
      <div class="step-quiz">
        ${step.questions.map((q, qi) => `
          <div class="quiz-progress">Question ${qi + 1} of ${step.questions.length}</div>
          <div class="quiz-q-block" data-qi="${qi}" style="${qi === 0 ? '' : 'display:none;'}">
            <div class="quiz-q-text">${q.question}</div>
            <div class="check-options">
              ${q.options.map((opt, oi) => `<button class="check-option-btn quiz-opt-btn" data-qi="${qi}" data-oi="${oi}">${opt}</button>`).join('')}
            </div>
            <div class="quiz-feedback-slot" data-qi="${qi}"></div>
          </div>
        `).join('')}
      </div>
    `;

    // Restore already-answered state
    Object.keys(answers).forEach((qi) => applyQuizAnswerUI(step, idx, Number(qi), answers[qi]));

    body.querySelectorAll('.quiz-opt-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const qi = Number(btn.dataset.qi);
        if (answers[qi] !== undefined) return;
        const oi = Number(btn.dataset.oi);
        answers[qi] = oi;
        applyQuizAnswerUI(step, idx, qi, oi);

        // Auto-advance to next question block after a short pause
        if (qi < step.questions.length - 1) {
          setTimeout(() => {
            const blocks = body.querySelectorAll('.quiz-q-block');
            blocks.forEach((b) => { b.style.display = Number(b.dataset.qi) === qi + 1 ? '' : 'none'; });
          }, 900);
        }
        updateNextButtonState(getLessonById(state.activeLessonId), step, idx);
      });
    });
  }

  function applyQuizAnswerUI(step, idx, qi, choice) {
    const body = document.getElementById('step-body');
    const block = body.querySelector(`.quiz-q-block[data-qi="${qi}"]`);
    if (!block) return;
    const q = step.questions[qi];
    block.querySelectorAll('.quiz-opt-btn').forEach((btn) => {
      const oi = Number(btn.dataset.oi);
      btn.disabled = true;
      if (oi === q.correct) btn.classList.add('correct');
      if (oi === choice && choice !== q.correct) btn.classList.add('incorrect');
    });
    const isRight = choice === q.correct;
    const slot = block.querySelector('.quiz-feedback-slot');
    slot.innerHTML = `<div class="check-feedback ${isRight ? 'right' : 'wrong'}">${isRight ? 'Correct.' : 'Not quite.'} ${q.explanation}</div>`;
  }

  function renderCompleteStep(lesson, step) {
    const body = document.getElementById('step-body');
    const completedCount = state.progress.filter((p) => p.completed).length;
    const newCount = isCompleted(lesson.id) ? completedCount : completedCount + 1;
    const pct = Math.round((newCount / 20) * 100);

    const isPathChoice = step && step.pathChoice && Array.isArray(step.pathOptions) && step.pathOptions.length > 0;

    const pathButtonsHtml = isPathChoice
      ? `
        <div class="path-choice-row">
          ${step.pathOptions.map((opt, i) => `
            <button class="btn btn-primary path-choice-btn" data-path-i="${i}">
              <i class="fa-solid fa-flask"></i> ${opt.label}
            </button>
          `).join('')}
        </div>
        <div class="path-choice-note">Trying one now doesn't lock you in — all three paths and every lesson stay available whenever you want them.</div>
      `
      : (lesson.simSection ? `<button class="btn btn-primary" id="try-sim-btn"><i class="fa-solid fa-flask"></i> Try it in the sim</button>` : '');

    body.innerHTML = `
      <div class="step-complete">
        <div class="complete-badge"><i class="fa-solid fa-check"></i></div>
        <h2>Lesson complete</h2>
        <div class="complete-sub">Nice work — that's one more strategy you actually understand now.</div>
        <div class="complete-stats-row">
          <div class="complete-stat"><div class="num">${newCount}/20</div><div class="label">Lessons done</div></div>
          <div class="complete-stat"><div class="num">${pct}%</div><div class="label">Curriculum</div></div>
        </div>
        ${pathButtonsHtml}
      </div>
    `;

    if (isPathChoice) {
      body.querySelectorAll('.path-choice-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const opt = step.pathOptions[Number(btn.dataset.pathI)];
          if (!opt) return;
          window.TradeIQApp.goToSection(opt.section, opt.strategy ? { strategy: opt.strategy } : undefined);
        });
      });
    } else if (lesson.simSection) {
      document.getElementById('try-sim-btn').addEventListener('click', () => {
        window.TradeIQApp.goToSection(lesson.simSection, lesson.simStrategy ? { strategy: lesson.simStrategy } : undefined);
      });
    }
  }

  function allChecksAnsweredUpTo(steps, idx) {
    for (let i = 0; i <= idx; i++) {
      const s = steps[i];
      if (s.type === 'check' && state.checkAnswered[i] === undefined) return false;
      if (s.type === 'quiz') {
        const answers = state.quizAnswers[i] || {};
        if (Object.keys(answers).length < s.questions.length) return false;
      }
    }
    return true;
  }

  function updateNextButtonState(lesson, step, idx) {
    const btn = document.getElementById('step-next-btn');
    if (!btn) return;

    let locked = false;
    if (step.type === 'check') locked = state.checkAnswered[idx] === undefined;
    if (step.type === 'quiz') {
      const answers = state.quizAnswers[idx] || {};
      locked = Object.keys(answers).length < step.questions.length;
    }
    btn.disabled = locked;

    const steps = lesson.steps;
    if (idx === steps.length - 1) {
      btn.innerHTML = isCompleted(lesson.id) ? 'Done <i class="fa-solid fa-check"></i>' : 'Finish lesson <i class="fa-solid fa-check"></i>';
    } else {
      btn.innerHTML = 'Continue <i class="fa-solid fa-arrow-right"></i>';
    }
  }

  async function handleNext(lesson, steps, idx) {
    if (idx === steps.length - 1) {
      await finishLesson(lesson);
      return;
    }
    state.stepIndex = idx + 1;
    renderPlayer();
    document.getElementById('lesson-player').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function finishLesson(lesson) {
    if (isCompleted(lesson.id)) {
      // Already marked complete previously; just move to next lesson if one exists.
      goToNextLesson(lesson);
      return;
    }

    const quizStep = lesson.steps.find((s) => s.type === 'quiz');
    let quizScore = null;
    if (quizStep) {
      const idx = lesson.steps.indexOf(quizStep);
      const answers = state.quizAnswers[idx] || {};
      const correctCount = quizStep.questions.filter((q, i) => answers[i] === q.correct).length;
      quizScore = Math.round((correctCount / quizStep.questions.length) * 100);
    }

    try {
      await api.post(`/lessons/${lesson.id}/complete`, { quizScore });
      state.progress = await api.get('/lessons/progress');
      renderNav();
      renderPlayer();
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
    }
  }

  function goToNextLesson(lesson) {
    const next = LESSONS.find((l) => l.id === lesson.id + 1);
    if (next) {
      state.activeLessonId = next.id;
      state.stepIndex = 0;
      state.checkAnswered = {};
      state.quizAnswers = {};
      renderLayout();
    }
  }

  return { render };
})();

window.LessonsSection = LessonsSection;
window.LESSONS = LESSONS;
