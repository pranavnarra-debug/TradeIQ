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
];

const VISUALS = {
  emaCrossover: buildEmaCrossoverSvg,
  emaStack: buildEmaStackSvg,
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
      renderCompleteStep(lesson);
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

  function renderCompleteStep(lesson) {
    const body = document.getElementById('step-body');
    const completedCount = state.progress.filter((p) => p.completed).length;
    const newCount = isCompleted(lesson.id) ? completedCount : completedCount + 1;
    const pct = Math.round((newCount / 20) * 100);

    body.innerHTML = `
      <div class="step-complete">
        <div class="complete-badge"><i class="fa-solid fa-check"></i></div>
        <h2>Lesson complete</h2>
        <div class="complete-sub">Nice work — that's one more strategy you actually understand now.</div>
        <div class="complete-stats-row">
          <div class="complete-stat"><div class="num">${newCount}/20</div><div class="label">Lessons done</div></div>
          <div class="complete-stat"><div class="num">${pct}%</div><div class="label">Curriculum</div></div>
        </div>
        ${lesson.simSection ? `<button class="btn btn-primary" id="try-sim-btn"><i class="fa-solid fa-flask"></i> Try it in the sim</button>` : ''}
      </div>
    `;

    if (lesson.simSection) {
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
