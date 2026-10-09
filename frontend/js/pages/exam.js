/* ============================================================
   TradeIQ — exam.js   Unit "final boss" exams. Questions arrive
   without answers; the server grades the whole thing at the end.
   ============================================================ */

const Exam = (() => {
  async function render(unitId) {
    const view = document.getElementById('view');
    view.innerHTML = '<div class="player"><div class="empty-state" style="padding-top:20vh"><span class="spinner"></span> Summoning the boss...</div></div>';
    let exam;
    try {
      exam = await api.get(`/lessons/exam/${unitId}`);
    } catch (err) {
      view.innerHTML = `<div class="player"><div class="empty-state" style="padding-top:14vh">${Sprites.character('grizz', 110)}
        <h2>Not yet.</h2><p>${escapeHtml(err.message)}</p><a class="btn btn-primary" href="/learn">Back to the map</a></div></div>`;
      return undefined;
    }
    const answers = new Array(exam.questions.length).fill(null);
    let i = 0;

    view.innerHTML = `<div class="player" style="--c:var(--grape)">
      <div class="player-top"><button class="player-x" id="x-exit" aria-label="Exit exam">&times;</button>
        <div class="seg-bar" id="x-bar">${exam.questions.map(() => '<span></span>').join('')}</div><span class="px-label player-count" id="x-count"></span></div>
      <div class="player-stage"><div class="step-card" id="x-card"></div></div>
      <div class="player-foot"><div class="foot-inner"><div class="foot-msg" id="x-msg"></div>
        <button class="btn btn-ghost" id="x-back">Back</button><button class="btn btn-primary btn-lg" id="x-next" disabled>Next</button></div></div>
    </div>`;

    document.getElementById('x-exit').onclick = async () => {
      if (await UI.confirm({ title: 'Leave the exam?', message: 'Your answers will be lost. You can retake it anytime.', confirmText: 'Leave' })) App.go('/learn');
    };
    document.getElementById('x-back').onclick = () => { if (i > 0) { i--; draw(); } };
    document.getElementById('x-next').onclick = () => {
      if (i < exam.questions.length - 1) { i++; draw(); } else submit();
    };

    function intro() {
      const card = document.getElementById('x-card');
      card.innerHTML = `<div class="result"><h1>${escapeHtml(exam.title)}</h1>
        <p class="lead">${exam.questions.length} questions pulled from every chapter. No hints, no feedback until the end. Score ${exam.passMark}% to win.</p>
        ${UI.speech({ who: 'grizz', mood: 'warn', say: "I'm the boss of this world. Prove you actually learned it." }, 110)}</div>`;
      const b = document.getElementById('x-next');
      b.disabled = false;
      b.textContent = 'Fight!';
      b.onclick = () => { b.onclick = () => { if (i < exam.questions.length - 1) { i++; draw(); } else submit(); }; draw(); };
      document.getElementById('x-back').style.visibility = 'hidden';
    }

    function draw() {
      const q = exam.questions[i];
      Array.from(document.getElementById('x-bar').children).forEach((el, k) => { el.className = answers[k] !== null ? 'done' : k === i ? 'now' : ''; });
      document.getElementById('x-count').textContent = `${i + 1}/${exam.questions.length}`;
      const card = document.getElementById('x-card');
      card.innerHTML = `<span class="chip-tag" style="background:var(--grape-l)">Boss question ${i + 1}</span><h2 style="margin-top:12px">${escapeHtml(q.q)}</h2>
        <div class="opt-list">${q.options.map((o, k) => `<button class="opt-btn ${answers[i] === k ? 'picked' : ''}" data-k="${k}"><span class="opt-key">${k + 1}</span>${escapeHtml(o)}</button>`).join('')}</div>`;
      card.querySelectorAll('.opt-btn').forEach((b) => b.onclick = () => {
        answers[i] = Number(b.dataset.k);
        card.querySelectorAll('.opt-btn').forEach((x) => x.classList.toggle('picked', x === b));
        document.getElementById('x-next').disabled = false;
        document.getElementById('x-msg').textContent = `${answers.filter((a) => a !== null).length} of ${answers.length} answered`;
      });
      const nb = document.getElementById('x-next');
      nb.disabled = answers[i] === null;
      nb.textContent = i === exam.questions.length - 1 ? 'Submit exam' : 'Next';
      document.getElementById('x-back').style.visibility = i > 0 ? 'visible' : 'hidden';
      document.getElementById('x-msg').textContent = `${answers.filter((a) => a !== null).length} of ${answers.length} answered`;
    }

    async function submit() {
      if (answers.some((a) => a === null)) return UI.toast('Answer every question first', 'error');
      const nb = document.getElementById('x-next');
      UI.setBusy(nb, true);
      let r;
      try {
        r = await api.post(`/lessons/exam/${unitId}`, { token: exam.token, answers });
      } catch (err) {
        UI.setBusy(nb, false);
        return UI.toast(err.message, 'error');
      }
      UI.setBusy(nb, false);
      const card = document.getElementById('x-card');
      card.innerHTML = `<div class="result">${Sprites.character(r.passed ? 'chip' : 'grizz', 130)}
        <h1>${r.passed ? 'Boss defeated!' : 'The boss wins this round.'}</h1>
        <p class="lead">You scored <b>${r.score}%</b> (need ${r.passMark}%).</p>
        ${r.passed ? `<div class="reward-row"><div class="reward"><span class="r-num" id="xr-xp">+0</span><span class="px-label">XP</span></div>
          <div class="reward"><span class="r-num">+${r.coinsGained}</span><span class="px-label">Coins</span></div></div>` : '<p>Review the chapters you missed, then come back swinging.</p>'}
        <details class="review" open><summary>Review (${r.results.filter((x) => x.correct).length}/${r.results.length})</summary><ol>
          ${exam.questions.map((q, k) => `<li class="${r.results[k].correct ? 'up' : 'down'}"><b>${escapeHtml(q.q)}</b><br>
            <span>${r.results[k].correct ? 'Right' : `Wrong. Answer: ${escapeHtml(q.options[r.results[k].correctIndex])}`}</span><br><small class="muted">${escapeHtml(r.results[k].explain)}</small></li>`).join('')}
        </ol></details></div>`;
      if (r.passed) { UI.countUp(document.getElementById('xr-xp'), r.xpGained); UI.confetti(140); }
      UI.celebrate(r);
      document.getElementById('x-msg').textContent = '';
      document.getElementById('x-back').style.visibility = 'hidden';
      nb.textContent = r.passed ? 'Back to the map' : 'Try again';
      nb.onclick = () => (r.passed ? App.go('/learn') : App.route());
    }

    intro();
    return undefined;
  }
  return { render };
})();

window.Exam = Exam;
