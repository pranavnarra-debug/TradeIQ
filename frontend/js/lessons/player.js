/* ============================================================
   TradeIQ — player.js
   One-screen-at-a-time lesson player. The final quiz is graded
   on the server; everything before it is practice.
   ============================================================ */

const Player = (() => {
  let L = null;          // lesson
  let s = null;          // state
  let keyHandler = null;

  const PRAISE = [
    ['chip', 'Nailed it!'], ['chip', 'Yes! That is the one.'], ['hoot', 'Correct. Hoot approves.'],
    ['penny', 'Cha-ching! Right answer.'], ['bolt', 'Correct. Logic circuits pleased.'],
  ];
  const COMFORT = [
    ['hoot', "Not quite, but now you'll never forget it."], ['grizz', 'Wrong, but cheap to learn here. Markets charge more.'],
    ['penny', 'Close! Read the explanation, it clicks.'],
  ];

  function shuffle(n) {
    const a = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const storeKey = () => `tiq_lesson_${L.id}`;
  function saveSpot() { try { localStorage.setItem(storeKey(), JSON.stringify({ i: s.i, t: Date.now() })); } catch { /* ignore */ } }
  function loadSpot() {
    try {
      const v = JSON.parse(localStorage.getItem(storeKey()) || 'null');
      return v && Date.now() - v.t < 3 * 864e5 ? v.i : 0;
    } catch { return 0; }
  }
  function clearSpot() { try { localStorage.removeItem(storeKey()); } catch { /* ignore */ } }

  async function render(id) {
    const view = document.getElementById('view');
    view.innerHTML = '<div class="player"><div class="empty-state" style="padding-top:20vh"><span class="spinner"></span> Loading lesson...</div></div>';
    try {
      L = await api.get(`/lessons/lesson/${id}`);
    } catch (err) {
      view.innerHTML = `<div class="player"><div class="empty-state" style="padding-top:16vh">${Sprites.character('hoot', 96)}<h3>${escapeHtml(err.message)}</h3><a class="btn" href="/learn">Back to the map</a></div></div>`;
      return undefined;
    }
    const quiz = L.steps[L.steps.length - 1];
    s = {
      i: Math.min(loadSpot(), L.steps.length - 1),
      answered: {},          // stepIndex -> true when checked
      quizQ: 0,
      quizAnswers: new Array(quiz.questions.length).fill(null),
      quizOrders: quiz.questions.map((q) => shuffle(q.options.length)),
      practiceRight: 0,
      practiceTotal: 0,
      pending: null,         // function to run on "Check"
    };
    document.title = `${L.title} · TradeIQ`;
    view.innerHTML = `<div class="player" style="--c:${L.unitColor}">
      <div class="player-top">
        <button class="player-x" id="p-exit" aria-label="Exit lesson">&times;</button>
        <div class="seg-bar" id="p-bar">${L.steps.map(() => '<span></span>').join('')}</div>
        <span class="px-label player-count" id="p-count"></span>
      </div>
      <div class="player-stage"><div class="step-card" id="p-card"></div></div>
      <div class="player-foot" id="p-foot">
        <div class="foot-inner">
          <div class="foot-msg" id="p-msg" aria-live="polite"></div>
          <button class="btn btn-ghost" id="p-back">Back</button>
          <button class="btn btn-primary btn-lg" id="p-next">Continue</button>
        </div>
      </div>
    </div>`;
    document.getElementById('p-exit').onclick = exit;
    document.getElementById('p-next').onclick = primary;
    document.getElementById('p-back').onclick = () => { if (s.i > 0) go(s.i - 1); };
    keyHandler = (e) => {
      if (e.target.matches('input, textarea, select') && e.key !== 'Enter') return;
      if (e.key === 'Enter' && !document.querySelector('.modal-overlay')) {
        e.preventDefault();
        const b = document.getElementById('p-next');
        if (b && !b.disabled) b.click();
      } else if (/^[1-4]$/.test(e.key)) {
        document.querySelectorAll('.opt-btn:not(:disabled)')[Number(e.key) - 1]?.click();
      }
    };
    document.addEventListener('keydown', keyHandler);
    go(s.i);
    return () => {
      document.removeEventListener('keydown', keyHandler);
      document.title = 'TradeIQ — Learn money and markets like a game';
    };
  }

  async function exit() {
    const quizStarted = s.quizAnswers.some((a) => a !== null);
    if (s.i > 0 && !s.done) {
      const ok = await UI.confirm({
        title: 'Leave this lesson?',
        message: quizStarted ? "Your quiz answers won't be saved. You'll restart the quiz next time." : "We'll remember which screen you were on.",
        confirmText: 'Leave',
      });
      if (!ok) return;
    }
    App.go('/learn');
  }

  // ---------- footer state ----------
  function foot({ label = 'Continue', disabled = false, state = '', msg = '', back = true } = {}) {
    const f = document.getElementById('p-foot');
    f.className = `player-foot ${state}`;
    document.getElementById('p-msg').innerHTML = msg;
    const b = document.getElementById('p-next');
    b.textContent = label;
    b.disabled = disabled;
    b.className = `btn btn-lg ${state === 'bad' ? 'btn-danger' : state === 'ok' ? 'btn-primary' : label === 'Check' ? 'btn-sun' : 'btn-primary'}`;
    document.getElementById('p-back').style.visibility = back && s.i > 0 && !s.done ? 'visible' : 'hidden';
  }

  function feedback(right, explain) {
    s.practiceTotal++;
    if (right) s.practiceRight++;
    const msg = `<b>${right ? 'Correct!' : 'Not quite.'}</b> ${escapeHtml(explain || '')}`;
    foot({ label: 'Continue', state: right ? 'ok' : 'bad', msg });
    if (Math.random() < (right ? 0.22 : 0.35)) {
      const [who, say] = (right ? PRAISE : COMFORT)[Math.floor(Math.random() * (right ? PRAISE.length : COMFORT.length))];
      UI.cameo(who, say, right ? 'wow' : 'think', 2200);
    }
  }

  function primary() {
    if (s.pending) {
      const fn = s.pending;
      s.pending = null;
      fn();
      return;
    }
    const step = L.steps[s.i];
    if (step.type === 'quiz') return nextQuizQuestion();
    if (s.i < L.steps.length - 1) go(s.i + 1);
  }

  function go(i) {
    s.i = i;
    s.pending = null;
    resetNextHandler();
    saveSpot();
    const bar = document.getElementById('p-bar').children;
    Array.from(bar).forEach((el, k) => { el.className = k < i ? 'done' : k === i ? 'now' : ''; });
    document.getElementById('p-count').textContent = `${i + 1}/${L.steps.length}`;
    const card = document.getElementById('p-card');
    card.className = `step-card step-${L.steps[i].type}`;
    card.style.animation = 'none';
    void card.offsetWidth;
    card.style.animation = '';
    renderStep(L.steps[i], card);
    document.querySelector('.player-stage').scrollTop = 0;
    window.scrollTo(0, 0);
  }

  // ---------- step renderers ----------
  function renderStep(step, card) {
    const already = s.answered[s.i];
    switch (step.type) {
      case 'read':
        card.innerHTML = `${step.title ? `<h2>${escapeHtml(step.title)}</h2>` : ''}<div class="lesson-html">${step.html}</div>
          ${step.sprite ? UI.speech(step.sprite, 76) : ''}`;
        return foot();
      case 'callout': {
        const meta = { tip: ['lightbulb', 'Tip'], warn: ['warning', 'Watch out'], fact: ['book', 'Fact'], example: ['target', 'Example'], myth: ['cross', 'Myth busted'] }[step.variant] || ['lightbulb', 'Note'];
        card.innerHTML = `<div class="callout callout-${step.variant}"><div class="callout-head">${Sprites.icon(meta[0], 30)}<span class="px-label">${meta[1]}</span></div>
          <h2>${escapeHtml(step.title)}</h2><div class="lesson-html">${step.html}</div></div>`;
        return foot();
      }
      case 'cards':
        card.innerHTML = `<h2>${escapeHtml(step.title)}</h2><p class="muted">Tap each card to flip it.</p>
          <div class="flip-grid">${step.cards.map((c, k) => `<button class="flip" data-k="${k}"><span class="flip-in">
            <span class="flip-front">${escapeHtml(c.front)}</span><span class="flip-back">${escapeHtml(c.back)}</span></span></button>`).join('')}</div>`;
        card.querySelectorAll('.flip').forEach((b) => b.addEventListener('click', () => b.classList.toggle('on')));
        return foot();
      case 'diagram':
        card.innerHTML = `<div class="figure">${Diagrams.render(step.name)}</div><p class="caption">${escapeHtml(step.caption)}</p>`;
        return foot();
      case 'widget':
        card.innerHTML = `<div class="widget-box" id="w-box"></div><p class="caption">${escapeHtml(step.caption)}</p>`;
        Widgets.mount(card.querySelector('#w-box'), step.name, step.props || {});
        return foot();
      case 'check':
        return renderChoice(card, {
          prompt: step.question, options: step.options, answer: step.answer, explain: step.explain, already,
          orderKey: `c${s.i}`,
        });
      case 'truefalse':
        card.innerHTML = `<span class="px-label muted">True or false?</span><h2>${escapeHtml(step.statement)}</h2>
          <div class="tf-row"><button class="opt-btn tf" data-v="true">True</button><button class="opt-btn tf" data-v="false">False</button></div>`;
        return wireSingle(card, (v) => v === String(step.answer), step.explain, already, String(step.answer));
      case 'numeric':
        card.innerHTML = `<span class="px-label muted">Do the math</span><h2>${escapeHtml(step.question)}</h2>
          <div class="num-row">${step.unit === '$' ? '<span class="num-unit">$</span>' : ''}<input class="input num-in" inputmode="decimal" id="num-in" placeholder="Your answer" autocomplete="off" />
          ${step.unit === '%' ? '<span class="num-unit">%</span>' : ''}</div>`;
        {
          const inp = card.querySelector('#num-in');
          const check = () => {
            const v = parseFloat(inp.value.replace(/[$,%\s]/g, ''));
            const right = Number.isFinite(v) && Math.abs(v - step.answer) <= step.tolerance + 1e-9;
            inp.disabled = true;
            inp.classList.add(right ? 'is-right' : 'is-wrong');
            s.answered[s.i] = true;
            const ans = `${step.unit === '$' ? '$' : ''}${step.answer.toLocaleString()}${step.unit === '%' ? '%' : ''}`;
            feedback(right, `${right ? '' : `Answer: ${ans}. `}${step.explain}`);
          };
          if (already) { inp.disabled = true; inp.value = step.answer; return foot(); }
          inp.addEventListener('input', () => foot({ label: 'Check', disabled: !inp.value.trim() }));
          s.pending = null;
          foot({ label: 'Check', disabled: true });
          document.getElementById('p-next').onclick = () => {
            if (!s.answered[s.i] && inp.value.trim()) check(); else primary();
          };
          setTimeout(() => inp.focus(), 50);
        }
        return undefined;
      case 'match':
        return renderMatch(card, step, already);
      case 'order':
        return renderOrder(card, step, already);
      case 'quiz':
        return renderQuizQuestion(card);
      default:
        card.innerHTML = '<p>Unknown step.</p>';
        return foot();
    }
  }

  // Restore the default "Continue" click handler after steps that override it.
  function resetNextHandler() { document.getElementById('p-next').onclick = primary; }

  function renderChoice(card, { prompt, options, answer, explain, already, orderKey, label = 'Quick check' }) {
    resetNextHandler();
    s.orders = s.orders || {};
    const order = s.orders[orderKey] || (s.orders[orderKey] = shuffle(options.length));
    card.innerHTML = `<span class="px-label muted">${label}</span><h2>${escapeHtml(prompt)}</h2>
      <div class="opt-list">${order.map((oi, k) => `<button class="opt-btn" data-oi="${oi}"><span class="opt-key">${k + 1}</span>${escapeHtml(options[oi])}</button>`).join('')}</div>`;
    wireSingle(card, (v) => Number(v) === answer, explain, already, String(answer), 'oi');
  }

  function wireSingle(card, isRight, explain, already, correctVal, attr = 'v') {
    resetNextHandler();
    const btns = card.querySelectorAll('.opt-btn');
    let picked = null;
    const reveal = (choice) => {
      btns.forEach((b) => {
        b.disabled = true;
        if (b.dataset[attr] === correctVal) b.classList.add('is-right');
        else if (b.dataset[attr] === choice) b.classList.add('is-wrong');
      });
    };
    if (already) { reveal(null); return foot(); }
    btns.forEach((b) => b.addEventListener('click', () => {
      btns.forEach((x) => x.classList.remove('picked'));
      b.classList.add('picked');
      picked = b.dataset[attr];
      foot({ label: 'Check' });
      s.pending = () => {
        reveal(picked);
        s.answered[s.i] = true;
        feedback(isRight(picked), explain);
      };
    }));
    foot({ label: 'Check', disabled: true });
    return undefined;
  }

  function renderMatch(card, step, already) {
    resetNextHandler();
    const rights = shuffle(step.pairs.length);
    card.innerHTML = `<span class="px-label muted">Match them up</span><h2>${escapeHtml(step.prompt)}</h2>
      <div class="match-grid"><div class="match-col">${step.pairs.map((p, k) => `<button class="match-btn" data-side="l" data-k="${k}">${escapeHtml(p.left)}</button>`).join('')}</div>
      <div class="match-col">${rights.map((k) => `<button class="match-btn" data-side="r" data-k="${k}">${escapeHtml(step.pairs[k].right)}</button>`).join('')}</div></div>`;
    const btns = card.querySelectorAll('.match-btn');
    if (already) { btns.forEach((b) => { b.disabled = true; b.classList.add('is-right'); }); return foot(); }
    let sel = null;
    let matched = 0;
    let misses = 0;
    btns.forEach((b) => b.addEventListener('click', () => {
      if (!sel || sel.dataset.side === b.dataset.side) {
        if (sel) sel.classList.remove('picked');
        sel = b;
        b.classList.add('picked');
        return;
      }
      if (sel.dataset.k === b.dataset.k) {
        [sel, b].forEach((x) => { x.classList.remove('picked'); x.classList.add('is-right'); x.disabled = true; });
        matched++;
        if (matched === step.pairs.length) {
          s.answered[s.i] = true;
          feedback(misses === 0, misses === 0 ? 'Perfect match, no mistakes.' : `All matched, with ${misses} wrong guess${misses === 1 ? '' : 'es'} along the way.`);
        }
      } else {
        misses++;
        const a = sel;
        [a, b].forEach((x) => x.classList.add('shake-wrong'));
        setTimeout(() => [a, b].forEach((x) => x.classList.remove('shake-wrong', 'picked')), 450);
      }
      sel = null;
    }));
    foot({ label: 'Continue', disabled: true, msg: '<span class="muted">Tap a term, then its partner.</span>' });
    return undefined;
  }

  function renderOrder(card, step, already) {
    resetNextHandler();
    let order = already ? step.items.map((_, k) => k) : shuffle(step.items.length);
    if (!already && order.every((v, k) => v === k)) order = order.reverse();
    const draw = (locked, result) => {
      card.innerHTML = `<span class="px-label muted">Put them in order</span><h2>${escapeHtml(step.prompt)}</h2>
        <ol class="order-list">${order.map((k, pos) => `<li class="${result ? (result[pos] ? 'is-right' : 'is-wrong') : ''}">
          <span class="order-num">${pos + 1}</span><span class="order-txt">${escapeHtml(step.items[k])}</span>
          ${locked ? '' : `<span class="order-btns"><button class="btn btn-sm" data-up="${pos}" ${pos === 0 ? 'disabled' : ''} aria-label="Move up">&uarr;</button>
          <button class="btn btn-sm" data-down="${pos}" ${pos === order.length - 1 ? 'disabled' : ''} aria-label="Move down">&darr;</button></span>`}
        </li>`).join('')}</ol>`;
      card.querySelectorAll('[data-up]').forEach((b) => b.onclick = () => { const p = +b.dataset.up; [order[p - 1], order[p]] = [order[p], order[p - 1]]; draw(false); });
      card.querySelectorAll('[data-down]').forEach((b) => b.onclick = () => { const p = +b.dataset.down; [order[p + 1], order[p]] = [order[p], order[p + 1]]; draw(false); });
    };
    if (already) { draw(true, order.map(() => true)); return foot(); }
    draw(false);
    foot({ label: 'Check' });
    s.pending = () => {
      const result = order.map((k, pos) => k === pos);
      const right = result.every(Boolean);
      draw(true, result);
      if (!right) {
        card.insertAdjacentHTML('beforeend', `<p class="muted" style="margin-top:12px"><b>Correct order:</b> ${step.items.map((t, k) => `${k + 1}. ${escapeHtml(t)}`).join(' &nbsp; ')}</p>`);
      }
      s.answered[s.i] = true;
      feedback(right, step.explain);
    };
    return undefined;
  }

  // ---------- final quiz ----------
  function renderQuizQuestion(card) {
    resetNextHandler();
    const quiz = L.steps[L.steps.length - 1];
    const qi = s.quizQ;
    const q = quiz.questions[qi];
    const order = s.quizOrders[qi];
    const chosen = s.quizAnswers[qi];
    card.innerHTML = `<div class="quiz-head"><span class="chip-tag" style="background:var(--sun)">${Sprites.icon('trophy', 14)} Final quiz</span>
      <span class="quiz-dots">${quiz.questions.map((_, k) => `<span class="${k < qi ? 'done' : k === qi ? 'now' : ''}"></span>`).join('')}</span></div>
      <h2>${escapeHtml(q.q)}</h2>
      <div class="opt-list">${order.map((oi, k) => `<button class="opt-btn" data-oi="${oi}"><span class="opt-key">${k + 1}</span>${escapeHtml(q.options[oi])}</button>`).join('')}</div>`;
    document.getElementById('p-count').textContent = `Quiz ${qi + 1}/${quiz.questions.length}`;
    const btns = card.querySelectorAll('.opt-btn');
    const reveal = (pick) => btns.forEach((b) => {
      b.disabled = true;
      if (Number(b.dataset.oi) === q.answer) b.classList.add('is-right');
      else if (Number(b.dataset.oi) === pick) b.classList.add('is-wrong');
    });
    if (chosen !== null) { reveal(chosen); foot({ label: qi === quiz.questions.length - 1 ? 'See results' : 'Next question' }); return; }
    let picked = null;
    btns.forEach((b) => b.addEventListener('click', () => {
      btns.forEach((x) => x.classList.remove('picked'));
      b.classList.add('picked');
      picked = Number(b.dataset.oi);
      foot({ label: 'Check', back: false });
      s.pending = () => {
        s.quizAnswers[qi] = picked;
        reveal(picked);
        const right = picked === q.answer;
        feedback(right, q.explain);
        document.getElementById('p-next').textContent = qi === quiz.questions.length - 1 ? 'See results' : 'Next question';
      };
    }));
    foot({ label: 'Check', disabled: true, back: qi === 0 });
  }

  function nextQuizQuestion() {
    const quiz = L.steps[L.steps.length - 1];
    if (s.quizAnswers[s.quizQ] === null) return;
    if (s.quizQ < quiz.questions.length - 1) {
      s.quizQ++;
      renderQuizQuestion(document.getElementById('p-card'));
    } else {
      submit();
    }
  }

  async function submit() {
    const card = document.getElementById('p-card');
    foot({ label: 'Saving...', disabled: true, back: false });
    let r;
    try {
      r = await api.post(`/lessons/lesson/${L.id}/complete`, { answers: s.quizAnswers });
    } catch (err) {
      UI.toast(err.message, 'error');
      foot({ label: 'Try again', back: false });
      s.pending = submit;
      return;
    }
    s.done = true;
    clearSpot();
    Array.from(document.getElementById('p-bar').children).forEach((el) => { el.className = 'done'; });
    document.getElementById('p-count').textContent = '';
    card.className = 'step-card step-result';
    const quiz = L.steps[L.steps.length - 1];

    if (!r.passed) {
      card.innerHTML = `<div class="result">${Sprites.character('grizz', 120)}
        <h1>So close.</h1><p class="lead">You got <b>${r.score}%</b>. You need ${r.passMark}% to clear this one. Bears don't give up and neither do you.</p>
        ${reviewHtml(quiz, r.correct)}
      </div>`;
      document.getElementById('p-next').onclick = () => {
        s.done = false;
        s.quizQ = 0;
        s.quizAnswers = s.quizAnswers.map(() => null);
        s.quizOrders = quiz.questions.map((q) => shuffle(q.options.length));
        resetNextHandler();
        go(L.steps.length - 1);
      };
      foot({ label: 'Retry the quiz', back: false });
      return;
    }

    const streakLine = r.streak?.extended
      ? `${r.streak.streak}-day streak${r.streak.usedFreeze ? ' (a Streak Freeze saved it!)' : '!'}`
      : r.streak ? `${r.streak.streak}-day streak` : '';
    const who = r.score === 100 ? 'chip' : 'penny';
    card.innerHTML = `<div class="result">
      ${Sprites.character(who, 128)}
      <h1>${r.score === 100 ? 'Perfect score!' : 'Lesson complete!'}</h1>
      <p class="lead">${escapeHtml(L.title)}</p>
      <div class="reward-row">
        <div class="reward"><span class="r-num" id="r-xp">+0</span><span class="px-label">XP</span></div>
        <div class="reward"><span class="r-num">${r.score}%</span><span class="px-label">Quiz</span></div>
        <div class="reward"><span class="r-num">+${r.coinsGained}</span><span class="px-label">Coins</span></div>
        ${r.streak ? `<div class="reward fire"><span class="r-num">${Sprites.icon('fire', 30)}${r.streak.streak}</span><span class="px-label">Streak</span></div>` : ''}
      </div>
      ${streakLine ? `<p class="streak-line">${escapeHtml(streakLine)}</p>` : ''}
      ${!r.firstTime && r.xpGained === 0 ? '<p class="muted">Replays only earn XP when you beat your best score.</p>' : ''}
      ${s.practiceTotal ? `<p class="muted">Answered right this lesson: ${s.practiceRight}/${s.practiceTotal}</p>` : ''}
      ${r.newAchievements.length ? `<div class="ach-unlocks">${r.newAchievements.map((a) => `<div class="ach">${Sprites.character(a.sprite, 48)}<b>${escapeHtml(a.name)}</b><small>${escapeHtml(a.desc)}</small></div>`).join('')}</div>` : ''}
      ${reviewHtml(quiz, r.correct)}
    </div>`;
    UI.countUp(document.getElementById('r-xp'), r.xpGained);
    if (r.firstTime || r.score === 100) UI.confetti();
    UI.celebrate(r);
    const nextId = r.nextLessonId;
    document.getElementById('p-back').style.visibility = 'visible';
    document.getElementById('p-back').textContent = 'Back to map';
    document.getElementById('p-back').onclick = () => App.go('/learn');
    document.getElementById('p-next').onclick = () => App.go(nextId ? `/lesson/${nextId}` : '/learn');
    const f = document.getElementById('p-foot');
    f.className = 'player-foot ok';
    document.getElementById('p-msg').innerHTML = nextId ? '<b>Keep the momentum?</b>' : '';
    const nb = document.getElementById('p-next');
    nb.disabled = false;
    nb.textContent = nextId ? 'Next lesson' : 'Back to map';
    nb.className = 'btn btn-primary btn-lg';
  }

  function reviewHtml(quiz, correct) {
    return `<details class="review"><summary>Review your answers (${correct.filter(Boolean).length}/${correct.length})</summary>
      <ol>${quiz.questions.map((q, k) => `<li class="${correct[k] ? 'up' : 'down'}"><b>${escapeHtml(q.q)}</b><br>
        <span>${correct[k] ? 'Right' : 'Wrong'}. Answer: ${escapeHtml(q.options[q.answer])}.</span><br><small class="muted">${escapeHtml(q.explain)}</small></li>`).join('')}</ol></details>`;
  }

  return { render };
})();

window.Player = Player;
