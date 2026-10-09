/* ============================================================
   TradeIQ — learn.js   The course map.
   Visible to everyone; progress + "continue" when signed in.
   ============================================================ */

const Learn = (() => {
  const DAILY_GOAL_XP = 50;

  function topSection(cat, prog) {
    const u = Session.user;
    const next = prog.nextLessonId ? Catalog.findLesson(cat, prog.nextLessonId) : null;
    const done = Object.keys(prog.completions).length;
    const lvl = prog.level;
    const pct = lvl.xpForNext ? Math.round((lvl.xpIntoLevel / lvl.xpForNext) * 100) : 100;
    const goalSegments = 5;
    const lit = Math.min(goalSegments, Math.floor((prog.xpToday / DAILY_GOAL_XP) * goalSegments));
    const greet = prog.xpToday >= DAILY_GOAL_XP
      ? "Daily goal crushed. Anything more is bonus XP."
      : prog.streak > 0 && prog.xpToday === 0 ? `Your ${prog.streak}-day streak needs one lesson today!` : 'One lesson today keeps the streak alive.';
    return `<div class="learn-top">
      ${next ? `<div class="card continue-card">
        ${Sprites.character(next.unit.sprite, 104)}
        <div><span class="px-label">${done ? 'Up next' : 'Start here'} · Day ${next.lesson.day}</span>
          <h2>${escapeHtml(next.lesson.title)}</h2>
          <div class="meta">${escapeHtml(next.unit.title)} · ${escapeHtml(next.chapter.title)} · ${next.lesson.minutes} min</div>
          <a class="btn btn-dark btn-lg" href="/lesson/${next.lesson.id}">${done ? 'Continue' : 'Start lesson 1'} &rarr;</a></div>
      </div>` : `<div class="card continue-card">${Sprites.character('chip', 104)}<div><span class="px-label">All lessons done</span>
          <h2>You finished every lesson!</h2><div class="meta">Beat the unit exams to collect every badge.</div></div></div>`}
      <div class="card">
        <div class="stat-card">
          <div class="stat-tile"><div class="num">${Sprites.icon('fire', 22)} ${prog.streak}</div><div class="lbl">Day streak${prog.streakFreezes ? ` · ${prog.streakFreezes} freeze` : ''}</div></div>
          <div class="stat-tile"><div class="num">${done}<span class="muted" style="font-size:16px">/${prog.totalLessons}</span></div><div class="lbl">Lessons done</div></div>
          <div class="level-line">
            <div class="row"><span>Level ${lvl.level} · ${escapeHtml(lvl.title)}</span><span class="mono">${lvl.xpForNext ? `${lvl.xpIntoLevel}/${lvl.xpForNext} XP` : 'MAX'}</span></div>
            <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
          </div>
          <div class="level-line">
            <div class="row"><span>Daily goal</span><span class="mono">${Math.min(prog.xpToday, DAILY_GOAL_XP)}/${DAILY_GOAL_XP} XP</span></div>
            <div class="daily-goal">${Array.from({ length: goalSegments }, (_, i) => `<span class="${i < lit ? 'on' : ''}"></span>`).join('')}</div>
            <small class="muted" style="display:block;margin-top:6px;font-weight:600">${greet}</small>
          </div>
        </div>
      </div>
    </div>
    ${u && !u.email && done >= 2 ? `<div class="card card-flat" style="margin:-14px 0 30px;display:flex;gap:14px;align-items:center;background:var(--sky-l)">
      ${Sprites.character('penny', 48)}<div style="flex:1"><b>Want a backup key?</b> Add an optional email so you can reset your password and get streak reminders.</div>
      <a class="btn btn-sm" href="/settings">Add email</a></div>` : ''}`;
  }

  function nodeHtml(lesson, unit, state) {
    const { done, current, score } = state;
    return `<button class="node ${done ? 'done' : ''} ${current ? 'current' : ''}" data-lesson="${lesson.id}" title="${escapeHtml(lesson.summary)}">
      ${current ? `<span class="node-here">${Sprites.character(unit.sprite, 40)}</span>` : ''}
      <span class="node-disc">${Sprites.icon(lesson.icon, 38)}
        ${done ? `<span class="node-badge">${score === 100 ? Sprites.icon('star', 18) : Sprites.icon('check', 16)}</span>` : ''}</span>
      <span class="node-title">${escapeHtml(lesson.title)}</span>
      <span class="node-meta">Day ${lesson.day} · ${lesson.minutes} min</span>
    </button>`;
  }

  function unitHtml(unit, prog) {
    const comp = prog ? prog.completions : {};
    const ids = unit.chapters.flatMap((c) => c.lessons.map((l) => l.id));
    const doneCount = ids.filter((id) => comp[id]).length;
    const exam = prog?.unitExams?.[unit.id];
    const examOpen = prog && doneCount === ids.length;
    return `<section class="unit" style="--c:${unit.color}" id="unit-${unit.id}">
      <div class="unit-banner">${Sprites.character(unit.sprite, 72)}
        <div><span class="px-label">World ${unit.number} · ${escapeHtml(unit.world)}</span><h2>${escapeHtml(unit.title)}</h2><p>${escapeHtml(unit.subtitle)}</p></div>
        <div class="unit-stats"><div class="mono">${prog ? `${doneCount}/${ids.length}` : ids.length}</div><div class="px-label">${prog ? 'done' : 'lessons'}</div></div>
      </div>
      ${unit.chapters.map((ch, ci) => `<div class="chapter">
        <div class="chapter-head"><span class="chip-tag">Chapter ${ci + 1}</span><h3>${escapeHtml(ch.title)}</h3><span class="muted">${escapeHtml(ch.blurb)}</span></div>
        <div class="path">${ch.lessons.map((l) => nodeHtml(l, unit, {
          done: Boolean(comp[l.id]), current: prog && prog.nextLessonId === l.id, score: comp[l.id]?.score,
        })).join('')}</div>
      </div>`).join('')}
      <div class="path"><button class="node exam ${exam?.passed ? 'done' : ''} ${examOpen ? '' : 'locked'}" data-exam="${unit.id}">
        <span class="node-disc">${Sprites.icon('trophy', 42)}</span>
        <span class="node-title">${escapeHtml(unit.title)} Final Boss</span>
        <span class="node-meta">${exam?.passed ? `Passed · ${exam.score}%` : examOpen ? 'Unlocked!' : `Day ${unit.examDay} · finish all lessons`}</span>
      </button></div>
    </section>`;
  }

  function peekLesson(cat, id, prog) {
    const f = Catalog.findLesson(cat, id);
    if (!f) return;
    const c = prog?.completions?.[id];
    const m = UI.modal(`<div class="lesson-peek">
      <span class="eyebrow">${escapeHtml(f.unit.title)} · ${escapeHtml(f.chapter.title)}</span>
      <div class="row">${Sprites.icon(f.lesson.icon, 44)}<h3 style="margin:0">${escapeHtml(f.lesson.title)}</h3></div>
      <p style="margin-top:12px">${escapeHtml(f.lesson.summary)}</p>
      <div class="row-wrap"><span class="chip-tag">${f.lesson.minutes} min</span><span class="chip-tag">${f.lesson.steps} screens</span>
        <span class="chip-tag">${f.lesson.questions}-question quiz</span><span class="chip-tag">Day ${f.lesson.day}</span>
        ${c ? `<span class="chip-tag" style="background:var(--mint-l)">Best: ${c.score}%</span>` : ''}</div>
      ${Session.isLoggedIn()
    ? `<a class="btn btn-primary btn-block btn-lg" href="/lesson/${id}">${c ? 'Replay lesson' : 'Start lesson'}</a>`
    : `<button class="btn btn-primary btn-block btn-lg" data-signup>Sign up free to start</button>
         <p class="muted" style="text-align:center;font-size:14px;margin:10px 0 0">Username + password. No email required.</p>`}
    </div>`);
    const s = m.el.querySelector('[data-signup]');
    if (s) s.onclick = () => { m.close(); AuthModal.open('signup', { next: `/lesson/${id}`, reason: 'lesson' }); };
    m.el.querySelector('a.btn')?.addEventListener('click', () => m.close());
  }

  async function render() {
    const view = document.getElementById('view');
    view.innerHTML = '<div class="page wrap"><div class="empty-state"><span class="spinner"></span> Loading the map...</div></div>';
    const [cat, prog] = await Promise.all([
      Catalog.get(),
      Session.isLoggedIn() ? api.get('/lessons/progress') : Promise.resolve(null),
    ]);

    view.innerHTML = `<div class="page wrap">
      <div class="page-head"><div><span class="eyebrow">Course map</span><h1>${prog ? `Hey ${escapeHtml(Session.user.username)}!` : 'The whole course'}</h1>
        <p>${cat.totalLessons} lessons across ${cat.units.length} worlds · about ${cat.totalDays} days at two lessons a day</p></div>
        <div class="spacer"></div>
        <div class="row-wrap">${cat.units.map((u) => `<a class="chip-tag" href="#unit-${u.id}" data-jump="${u.id}" style="background:${u.color}">${u.number}. ${escapeHtml(u.title)}</a>`).join('')}</div>
      </div>
      ${prog ? topSection(cat, prog) : `<div class="card" style="display:flex;gap:16px;align-items:center;margin-bottom:34px;background:var(--sun-l);flex-wrap:wrap">
        ${Sprites.character('chip', 64)}<div style="flex:1;min-width:220px"><b style="font-size:19px">Browse everything. Sign up to start.</b><br><span class="muted">Tap any lesson to see what's inside. Your XP, streak and badges save once you have an account.</span></div>
        <button class="btn btn-primary" data-signup>Start free</button></div>`}
      ${cat.units.filter((u) => u.lessonCount).map((u) => unitHtml(u, prog)).join('')}
    </div>`;

    view.querySelector('[data-signup]')?.addEventListener('click', () => AuthModal.open('signup'));
    view.querySelectorAll('[data-jump]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById(`unit-${a.dataset.jump}`)?.scrollIntoView({ behavior: 'smooth' });
    }));
    view.querySelectorAll('[data-lesson]').forEach((b) => b.addEventListener('click', () => {
      if (Session.isLoggedIn()) App.go(`/lesson/${b.dataset.lesson}`);
      else peekLesson(cat, b.dataset.lesson, prog);
    }));
    view.querySelectorAll('[data-exam]').forEach((b) => b.addEventListener('click', () => {
      if (!Session.isLoggedIn()) return AuthModal.open('signup', { reason: 'feature' });
      if (b.classList.contains('locked')) return UI.cameo('grizz', 'The boss only fights people who finished every lesson in this world. No shortcuts.', 'warn');
      App.go(`/exam/${b.dataset.exam}`);
    }));

    if (prog && prog.nextLessonId && !location.hash) {
      const cur = view.querySelector('.node.current');
      if (cur && Object.keys(prog.completions).length > 3) setTimeout(() => cur.scrollIntoView({ behavior: 'smooth', block: 'center' }), 250);
    }
  }

  return { render };
})();

window.Learn = Learn;
