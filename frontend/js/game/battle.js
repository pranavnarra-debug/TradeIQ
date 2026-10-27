/* ============================================================
   TradeIQ — battle.js   Boss fight engine ("Focus Time").
   Top-down pixel arena on a canvas. Move (WASD / arrows / joystick),
   dash (Shift / Space / button), aim with the mouse, fire (click / J /
   button). Your weapon starts empty: press E (or Charge) to open a
   question card while time slows to 20%. Correct = +1 charge pip
   (max 3). A charged shot deals pips x (30 + 3 x power) x buffs, but
   it still has to hit. Answers are graded on the server.
   ============================================================ */

const Battle = (() => {
  const W = 960;
  const H = 600;
  const INK = '#17140f';
  let S = null; // current fight state

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const eff = (type) => (S.loadout.effects || []).filter((e) => e.type === type);
  const effSum = (type) => eff(type).reduce((n, e) => n + (Number(e.value) || 0), 0);
  const has = (type) => eff(type).length > 0;

  function svgImage(svg) {
    // As a standalone image (not inline HTML) an SVG must declare its namespace.
    const src = svg.includes('xmlns=') ? svg : svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Could not draw the fighters'));
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(src)}`;
    });
  }

  // ---------------------------------------------------------------- setup
  async function run({ boss, battle, appearance, gear, assist }) {
    const view = document.getElementById('view');
    view.innerHTML = `<div class="arena-wrap" style="--wc:${boss.look?.body || '#8b5cf6'}">
      <div class="arena-top">
        <button class="player-x" id="b-exit" aria-label="Leave fight">&times;</button>
        <div class="bars">
          <div class="bar-line"><span class="bar-name">${escapeHtml(boss.name)}</span><span class="bar boss"><span id="b-boss-hp"></span><span id="b-boss-shield" class="shield"></span></span><b class="mono" id="b-boss-num"></b></div>
          <div class="bar-line"><span class="bar-name">You</span><span class="bar you"><span id="b-you-hp"></span><span id="b-you-shield" class="shield"></span></span><b class="mono" id="b-you-num"></b></div>
        </div>
        <div class="charge-box" title="Charge pips"><span class="px-label">Charge</span><div class="pips" id="b-pips"><i></i><i></i><i></i></div><span class="px-label streak-lbl" id="b-streak"></span></div>
      </div>
      <div class="arena-stage" id="b-stage">
        <canvas id="b-canvas" width="${W}" height="${H}" aria-label="Boss arena"></canvas>
        <div class="boss-say" id="b-say" hidden></div>
        <div class="arena-hint" id="b-hint">Press <span class="kbd">E</span> to answer a question and charge your weapon</div>
        <div class="qcard" id="b-q" hidden></div>
        <div class="arena-pause" id="b-pause" hidden><div class="card"><h3>Paused</h3><div class="row-wrap" style="justify-content:center">
          <button class="btn btn-primary" id="b-resume">Resume</button><button class="btn" id="b-quit">Leave fight</button></div></div></div>
      </div>
      <div class="arena-help">
        <span><span class="kbd">WASD</span> move</span><span><span class="kbd">Shift</span> dash</span><span><span class="kbd">Mouse</span> aim</span>
        <span><span class="kbd">Click</span>/<span class="kbd">J</span> fire</span><span><span class="kbd">E</span> charge (question)</span><span><span class="kbd">Esc</span> pause</span>
      </div>
      <div class="touch-pad" id="b-touch">
        <div class="joy" id="b-joy"><span id="b-knob"></span></div>
        <div class="touch-btns">
          <button class="btn btn-sun" id="b-tcharge">Charge</button>
          <button class="btn" id="b-tdash">Dash</button>
          <button class="btn btn-danger" id="b-tfire">Fire</button>
        </div>
      </div>
    </div>`;

    const canvas = document.getElementById('b-canvas');
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const [playerImg, bossImg] = await Promise.all([
      svgImage(Avatar.render(appearance, gear, { size: 64 })),
      svgImage(BossArt.svg(boss, 88)),
    ]);

    const loadout = battle.loadout;
    const speedMul = (boss.speed || 1) * (assist ? 0.7 : 1);
    S = {
      boss, battleId: battle.battleId, loadout, assist, ctx, canvas, playerImg, bossImg,
      t: 0, last: performance.now(), raf: 0, over: false, paused: false, timeScale: 1,
      p: {
        x: 200, y: H / 2, r: 18, vx: 0, vy: 0, face: 0,
        hp: loadout.hp + effSumFrom(loadout, 'buffer_hp'), maxHp: loadout.hp + effSumFrom(loadout, 'buffer_hp'),
        shield: 0, pips: 0, streak: 0, iframes: 0, dashCd: 0, dashT: 0, fireCd: 0, flash: 0,
        damageTaken: 0, firstStrikeUsed: false, secondChanceUsed: false, hitCount: 0,
      },
      b: {
        x: W - 220, y: H / 2, r: 40, hp: boss.hp, maxHp: boss.hp, shield: 0, speed: 85 * speedMul,
        cds: boss.attacks.map((a, i) => 1.5 + i * 1.3), tele: null, flash: 0, buffNext: 1,
        mood: 'euphoric', moodT: 0, phaseT: 0, sayT: 4, dashT: 0, dodgeT: 0,
      },
      bullets: [], shots: [], zones: [], minions: [], floaters: [], decoys: [],
      keys: new Set(), mouse: { x: W / 2, y: H / 2 }, joy: { x: 0, y: 0, active: false },
      q: null, qCd: 0, sinceQ: 0, telegraphMul: assist ? 1.6 : 1, speedMul,
    };
    say(boss.intro, 3500);
    bindInput();
    updateHud();
    S.raf = requestAnimationFrame(frame);
  }
  function effSumFrom(loadout, type) {
    return (loadout.effects || []).filter((e) => e.type === type).reduce((n, e) => n + (Number(e.value) || 0), 0);
  }

  // ---------------------------------------------------------------- input
  function bindInput() {
    const toLogical = (e) => {
      const r = S.canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
    };
    S.onKey = (e) => {
      const k = e.key.toLowerCase();
      if (e.type === 'keydown') {
        if (S.q && /^[1-4]$/.test(k)) { answer(Number(k) - 1); e.preventDefault(); return; }
        if (k === 'escape') { togglePause(); return; }
        if (k === 'e') { openQuestion(); e.preventDefault(); return; }
        if (k === 'shift' || k === ' ') { dash(); e.preventDefault(); return; }
        if (k === 'j') fire();
        S.keys.add(k);
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
      } else S.keys.delete(k);
    };
    S.onMove = (e) => { S.mouse = toLogical(e); };
    S.onDown = (e) => { if (e.button === 0 && !S.q) { S.mouse = toLogical(e); fire(); } };
    S.onBlur = () => { if (!S.over && !S.paused) togglePause(); };
    document.addEventListener('keydown', S.onKey);
    document.addEventListener('keyup', S.onKey);
    S.canvas.addEventListener('mousemove', S.onMove);
    S.canvas.addEventListener('mousedown', S.onDown);
    window.addEventListener('blur', S.onBlur);

    // touch joystick
    const joy = document.getElementById('b-joy');
    const knob = document.getElementById('b-knob');
    const jmove = (e) => {
      const t = e.touches ? e.touches[0] : e;
      const r = joy.getBoundingClientRect();
      const dx = t.clientX - (r.left + r.width / 2);
      const dy = t.clientY - (r.top + r.height / 2);
      const m = Math.min(1, Math.hypot(dx, dy) / (r.width / 2));
      const a = Math.atan2(dy, dx);
      S.joy = { x: Math.cos(a) * m, y: Math.sin(a) * m, active: true };
      knob.style.transform = `translate(${Math.cos(a) * m * 34}px, ${Math.sin(a) * m * 34}px)`;
      e.preventDefault();
    };
    const jend = () => { S.joy = { x: 0, y: 0, active: false }; knob.style.transform = ''; };
    joy.addEventListener('touchstart', jmove, { passive: false });
    joy.addEventListener('touchmove', jmove, { passive: false });
    joy.addEventListener('touchend', jend);
    const tap = (id, fn) => document.getElementById(id).addEventListener('touchstart', (e) => { e.preventDefault(); fn(); }, { passive: false });
    tap('b-tfire', () => fire(true));
    tap('b-tdash', dash);
    tap('b-tcharge', openQuestion);
    document.getElementById('b-tfire').onclick = () => fire(true);
    document.getElementById('b-tdash').onclick = dash;
    document.getElementById('b-tcharge').onclick = openQuestion;
    document.getElementById('b-exit').onclick = () => togglePause(true);
    document.getElementById('b-resume').onclick = () => togglePause(false);
    document.getElementById('b-quit').onclick = quit;
  }

  function unbind() {
    if (!S) return;
    cancelAnimationFrame(S.raf);
    document.removeEventListener('keydown', S.onKey);
    document.removeEventListener('keyup', S.onKey);
    window.removeEventListener('blur', S.onBlur);
  }

  function togglePause(force) {
    if (S.over) return;
    S.paused = typeof force === 'boolean' ? force : !S.paused;
    document.getElementById('b-pause').hidden = !S.paused;
    if (!S.paused) S.last = performance.now();
  }

  async function quit() {
    S.over = true;
    unbind();
    try { await api.post(`/battles/${S.battleId}/finish`, { result: 'abandoned', damageTaken: S.p.damageTaken }); } catch { /* ignore */ }
    App.go('/arena');
  }

  // ---------------------------------------------------------------- player actions
  function dash() {
    const p = S.p;
    if (S.paused || S.over || p.dashCd > 0) return;
    let dx = 0; let dy = 0;
    if (S.joy.active) { dx = S.joy.x; dy = S.joy.y; } else {
      if (S.keys.has('a') || S.keys.has('arrowleft')) dx -= 1;
      if (S.keys.has('d') || S.keys.has('arrowright')) dx += 1;
      if (S.keys.has('w') || S.keys.has('arrowup')) dy -= 1;
      if (S.keys.has('s') || S.keys.has('arrowdown')) dy += 1;
    }
    if (!dx && !dy) { dx = Math.cos(p.face); dy = Math.sin(p.face); }
    const m = Math.hypot(dx, dy) || 1;
    p.vx = (dx / m) * 720; p.vy = (dy / m) * 720;
    p.dashT = 0.18; p.iframes = Math.max(p.iframes, 0.3);
    p.dashCd = Math.max(0.5, 1.2 - effSum('dash_cooldown') / 100);
  }

  function aimAngle(touch) {
    const p = S.p;
    if (touch || S.joy.active) {
      // Touch: shoot where you're steering, or at the boss when standing still.
      if (S.joy.active && Math.hypot(S.joy.x, S.joy.y) > 0.3) return Math.atan2(S.joy.y, S.joy.x);
      return Math.atan2(S.b.y - p.y, S.b.x - p.x);
    }
    return Math.atan2(S.mouse.y - p.y, S.mouse.x - p.x);
  }

  function fire(touch) {
    const p = S.p;
    if (S.paused || S.over || S.q || p.fireCd > 0) return;
    const a = aimAngle(touch);
    p.face = a;
    if (p.pips > 0) {
      const power = S.loadout.stats.power || 0;
      let mult = 1;
      mult *= 1 + Math.min(5, p.streak) * (effSum('streak_damage') / 100);
      if (!p.firstStrikeUsed && has('first_strike')) mult *= 1 + effSum('first_strike') / 100;
      if (has('damage_dealt_mod')) mult *= 1 + effSum('damage_dealt_mod') / 100;
      let crit = false;
      if (!has('steady')) {
        const chance = clamp((S.loadout.stats.luck || 0) * 2.5, 0, 40) / 100;
        if (Math.random() < chance) { crit = true; mult *= 2 + effSum('crit_damage') / 100; }
      }
      const dmg = Math.round(p.pips * (30 + 3 * power) * mult);
      S.shots.push({ x: p.x, y: p.y, vx: Math.cos(a) * 560, vy: Math.sin(a) * 560, r: 7 + p.pips * 2, dmg, crit, charged: true, life: 1.6 });
      p.pips = 0;
      p.firstStrikeUsed = true;
      p.fireCd = 0.35;
    } else {
      S.shots.push({ x: p.x, y: p.y, vx: Math.cos(a) * 480, vy: Math.sin(a) * 480, r: 3, dmg: 1, charged: false, life: 1.2 });
      p.fireCd = 0.22;
    }
    updateHud();
  }

  // ---------------------------------------------------------------- questions (Focus Time)
  async function openQuestion() {
    if (S.paused || S.over || S.q || S.qCd > 0) return;
    if (S.p.pips >= 3) { floater(S.p.x, S.p.y - 40, 'Fully charged! Fire!', '#ffd23f'); return; }
    S.q = { loading: true };
    S.timeScale = 0.2;
    const el = document.getElementById('b-q');
    el.hidden = false;
    el.innerHTML = '<div class="qc-inner"><span class="spinner"></span></div>';
    document.getElementById('b-hint').hidden = true;
    try {
      const q = await api.post(`/battles/${S.battleId}/next`);
      const focus = S.loadout.stats.focus || 0;
      const limit = S.assist ? Infinity : 12 + focus * 0.6 + effSum('time_bonus');
      S.q = { ...q, deadline: performance.now() + limit * 1000, limit, picked: null };
      const hints = eff('hint').length;
      el.innerHTML = `<div class="qc-inner">
        <div class="qc-head"><span class="px-label">Focus Time · from "${escapeHtml(q.from)}"</span><span class="qc-timer" id="b-qt"></span></div>
        <h3>${escapeHtml(q.q)}</h3>
        <div class="qc-opts">${q.options.map((o, i) => `<button class="opt-btn" data-i="${i}"><span class="opt-key">${i + 1}</span>${escapeHtml(o)}</button>`).join('')}</div>
        ${hints ? '<button class="btn btn-sm btn-ghost" id="b-qhint">Use hint (Hoot crosses out a wrong answer)</button>' : ''}
        <div class="qc-explain" id="b-qx"></div></div>`;
      el.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('click', () => answer(Number(b.dataset.i))));
      document.getElementById('b-qhint')?.addEventListener('click', useHint);
    } catch (err) {
      closeQuestion();
      UI.toast(err.message, 'error');
    }
  }

  async function useHint() {
    try {
      const r = await api.post(`/battles/${S.battleId}/hint`);
      r.remove.forEach((i) => { const b = document.querySelector(`#b-q [data-i="${i}"]`); if (b) { b.disabled = true; b.classList.add('struck'); } });
      document.getElementById('b-qhint')?.remove();
    } catch (err) { UI.toast(err.message, 'error'); }
  }

  async function answer(choice) {
    const q = S.q;
    if (!q || q.loading || q.picked != null) return;
    q.picked = choice;
    const buttons = document.querySelectorAll('#b-q [data-i]');
    buttons.forEach((b) => { b.disabled = true; });
    document.getElementById('b-qhint')?.remove();
    let r;
    try {
      r = await api.post(`/battles/${S.battleId}/answer`, { index: q.index, choice });
    } catch (err) {
      UI.toast(err.message, 'error');
      closeQuestion();
      return;
    }
    buttons.forEach((b) => {
      const i = Number(b.dataset.i);
      if (i === r.answer) b.classList.add('is-right');
      else if (i === choice) b.classList.add('is-wrong');
    });
    const p = S.p;
    if (r.correct) {
      p.pips = Math.min(3, p.pips + 1);
      p.streak++;
      if (has('shield_on_correct')) p.shield += effSum('shield_on_correct');
      if (has('heal_on_streak') && p.streak % 3 === 0) heal(effSum('heal_on_streak'));
      floater(p.x, p.y - 40, `+1 charge${p.streak > 1 ? ` · streak ${p.streak}` : ''}`, '#1fbf75');
    } else if (has('second_chance') && !p.secondChanceUsed) {
      p.secondChanceUsed = true;
      floater(p.x, p.y - 40, 'Saved by your emergency fund!', '#3d8bfd');
    } else {
      p.pips = Math.max(0, p.pips - 1);
      p.streak = 0;
      S.b.buffNext = 1.2;
      floater(p.x, p.y - 40, 'Wrong: boss powers up', '#ff5a4e');
    }
    if (S.settlementCall) {
      S.settlementCall = false;
      if (r.correct) heal(10); else { p.iframes = 0; hurtPlayer(10, null); }
    }
    document.getElementById('b-qx').innerHTML = `<b>${r.correct ? 'Correct!' : 'Not quite.'}</b> ${escapeHtml(r.explain || '')}`;
    updateHud();
    setTimeout(closeQuestion, r.correct ? 900 : 2200);
  }

  function closeQuestion() {
    S.q = null;
    S.timeScale = 1;
    S.qCd = 1.2;
    S.sinceQ = 0;
    S.last = performance.now();
    const el = document.getElementById('b-q');
    if (el) { el.hidden = true; el.innerHTML = ''; }
  }

  // ---------------------------------------------------------------- damage
  function heal(n) {
    S.p.hp = Math.min(S.p.maxHp, S.p.hp + n);
    floater(S.p.x, S.p.y - 30, `+${n} HP`, '#1fbf75');
  }

  function hurtPlayer(base, src) {
    const p = S.p;
    if (p.iframes > 0 || S.over) return;
    if (has('dodge') && Math.random() < clamp(effSum('dodge'), 0, 40) / 100) {
      floater(p.x, p.y - 30, 'Dodged!', '#3d8bfd');
      p.iframes = 0.4;
      return;
    }
    let dmg = base * S.b.buffNext * moodDamage() * countdownMul();
    S.b.buffNext = 1;
    dmg *= 1 - Math.min(0.6, 0.03 * (S.loadout.stats.defense || 0));
    dmg *= 1 - clamp(effSum('damage_reduction'), 0, 50) / 100;
    if (has('damage_cap')) dmg = Math.min(dmg, Math.max(...eff('damage_cap').map((e) => e.value)));
    dmg = Math.max(1, Math.round(dmg));
    if (p.shield > 0) { const absorbed = Math.min(p.shield, dmg); p.shield -= absorbed; dmg -= absorbed; }
    if (dmg > 0) {
      p.hp -= dmg;
      p.damageTaken += dmg;
      p.flash = 0.25;
      floater(p.x, p.y - 30, `-${dmg}`, '#ff5a4e');
      if (has('thorns')) hurtBoss(Math.round(dmg * effSum('thorns') / 100), false, true);
    }
    p.iframes = 0.7;
    if (src && src.knock) { const a = Math.atan2(p.y - src.y, p.x - src.x); p.vx += Math.cos(a) * 300; p.vy += Math.sin(a) * 300; }
    updateHud();
    if (p.hp <= 0) end('lost');
  }

  function hurtBoss(dmg, crit, quiet) {
    const b = S.b;
    if (S.boss.mechanic?.type === 'mood_swing' && b.mood === 'euphoric') dmg = Math.round(dmg * 1.2);
    if (b.shield > 0) {
      const absorbed = Math.min(b.shield, dmg);
      b.shield -= absorbed; dmg -= absorbed;
      if (!quiet) floater(b.x, b.y - 60, absorbed >= 1 ? 'Shielded' : '', '#8a96a3');
    }
    if (dmg <= 0) return;
    b.hp -= dmg;
    b.flash = 0.15;
    if (!quiet || dmg > 0) floater(b.x + (Math.random() - 0.5) * 30, b.y - 55, `${crit ? 'CRIT ' : ''}${dmg}`, crit ? '#ffd23f' : '#fffaf0', crit ? 22 : 16);
    updateHud();
    if (b.hp <= 0) { b.hp = 0; end('won'); }
  }

  // ---------------------------------------------------------------- boss mechanics
  function moodDamage() {
    if (S.boss.mechanic?.type !== 'mood_swing') return 1;
    return S.b.mood === 'euphoric' ? 1 : 1.2;
  }
  function countdownMul() {
    if (S.boss.mechanic?.type !== 'countdown') return 1;
    return Math.min(2, 1 + Math.floor(S.t / (S.boss.mechanic.value || 20)) * 0.1);
  }
  function enraged() {
    return S.boss.mechanic?.type === 'enrage_below' && S.b.hp / S.b.maxHp < (S.boss.mechanic.value || 30) / 100;
  }

  function mechanicsTick(dt) {
    const m = S.boss.mechanic || { type: 'none' };
    const b = S.b;
    b.phaseT += dt;
    if (m.type === 'regen' && !S.q) b.hp = Math.min(b.maxHp, b.hp + (m.value || 1) * dt);
    if (m.type === 'shield_phase' && b.phaseT > 20) { b.phaseT = 0; b.shield = m.value || 80; say('Shields up!', 1500); }
    if (m.type === 'mood_swing') {
      b.moodT += dt;
      if (b.moodT > 12) { b.moodT = 0; b.mood = b.mood === 'euphoric' ? 'despair' : 'euphoric'; say(b.mood === 'euphoric' ? 'Hot streak! (fast, but takes +20% damage)' : 'Cold spell... (slow, hits 20% harder)', 2000); }
    }
    if (m.type === 'settlement' && b.phaseT > (m.value || 15)) {
      b.phaseT = 0;
      floater(W / 2, 60, 'Daily settlement!', '#ffd23f', 20);
      if (S.p.hp / S.p.maxHp < 0.25 && !S.q) { S.settlementCall = true; S.qCd = 0; openQuestion(); }
    }
    if (m.type === 'summon') {
      if (b.phaseT > (m.value || 12) && S.minions.length < 3) { b.phaseT = 0; S.minions.push({ x: b.x, y: b.y, r: 12, hp: 3, speed: 110 * S.speedMul, life: 30 }); say('Bring me a new investor!', 1400); }
      if (!S.q) b.hp = Math.min(b.maxHp, b.hp + S.minions.length * dt);
    }
    if (m.type === 'mirror') {
      // Decoys: copies that soak up shots. The real boss has a gold shadow.
      if (b.phaseT > (m.value || 20)) { b.phaseT = 0; S.decoys = [0, 1].map((k) => ({ x: clamp(b.x + (k ? 160 : -160), 60, W - 60), y: clamp(b.y + (k ? -90 : 90), 60, H - 60), t: 7 })); say('Which one is the real me?', 1600); }
      for (const d of S.decoys || []) { d.t -= dt; d.x += Math.sin(S.t * 2 + d.y) * 40 * dt; }
      S.decoys = (S.decoys || []).filter((d) => d.t > 0);
    }
  }

  // ---------------------------------------------------------------- boss attacks
  function startAttack(i) {
    const a = S.boss.attacks[i];
    const tele = 0.7 * S.telegraphMul;
    const p = S.p;
    S.b.tele = { i, t: tele, total: tele, tx: p.x, ty: p.y, a };
    if (a.pattern === 'rain') {
      const n = a.count || 5;
      S.b.tele.spots = Array.from({ length: n }, (_, k) => ({ x: clamp(p.x + (Math.random() - 0.5) * 260 + (k === 0 ? 0 : 0), 40, W - 40), y: clamp(p.y + (Math.random() - 0.5) * 220, 40, H - 40) }));
    }
    if (Math.random() < 0.3 && S.boss.taunts?.length) say(S.boss.taunts[Math.floor(Math.random() * S.boss.taunts.length)], 1800);
  }

  function executeAttack(tele) {
    const { a, tx, ty } = tele;
    const b = S.b;
    const speed = (v) => v * S.speedMul * (enraged() ? 1.25 : 1) * (b.mood === 'euphoric' && S.boss.mechanic?.type === 'mood_swing' ? 1.25 : 1);
    const dmg = a.damage || 12;
    const bullet = (ang, v, r = 8, extra = {}) => S.bullets.push({ x: b.x, y: b.y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, r, dmg, life: 5, ...extra });
    const toP = Math.atan2(ty - b.y, tx - b.x);
    switch (a.pattern) {
      case 'ring': { const n = a.count || 12; const off = Math.random() * Math.PI; for (let k = 0; k < n; k++) bullet(off + (k / n) * Math.PI * 2, speed(170)); break; }
      case 'volley': { const n = a.count || 5; for (let k = 0; k < n; k++) bullet(toP + (k - (n - 1) / 2) * 0.18, speed(240)); break; }
      case 'aimed': { const n = a.count || 3; for (let k = 0; k < n; k++) setTimeout(() => { if (!S || S.over) return; bullet(Math.atan2(S.p.y - S.b.y, S.p.x - S.b.x), speed(360), 7); }, k * 160 / S.timeScale); break; }
      case 'rain': for (const s of tele.spots || []) S.zones.push({ x: s.x, y: s.y, r: 44, t: 0, dmg, fade: 0.25 }); break;
      case 'charge': { b.dashT = 0.55; b.dvx = Math.cos(toP) * speed(620); b.dvy = Math.sin(toP) * speed(620); b.dashDmg = dmg; break; }
      case 'homing': { const n = a.count || 2; for (let k = 0; k < n; k++) bullet(toP + (k - (n - 1) / 2) * 0.6, speed(130), 11, { homing: 3.5, life: 6 }); break; }
      case 'wall': {
        const vertical = Math.random() < 0.5;
        const gapAt = Math.random() * 0.6 + 0.2;
        const n = 16;
        for (let k = 0; k < n; k++) {
          const f = k / (n - 1);
          if (Math.abs(f - gapAt) < 0.11) continue;
          if (vertical) S.bullets.push({ x: tx < W / 2 ? W - 10 : 10, y: 20 + f * (H - 40), vx: (tx < W / 2 ? -1 : 1) * speed(200), vy: 0, r: 9, dmg, life: 6 });
          else S.bullets.push({ x: 20 + f * (W - 40), y: ty < H / 2 ? H - 10 : 10, vx: 0, vy: (ty < H / 2 ? -1 : 1) * speed(200), r: 9, dmg, life: 6 });
        }
        break;
      }
      case 'slam': S.zones.push({ x: b.x, y: b.y, r: 150, t: 0, dmg, fade: 0.3, knock: true }); break;
      default: bullet(toP, speed(240));
    }
  }

  // ---------------------------------------------------------------- loop
  function frame(now) {
    if (!S || S.over) return;
    const rawDt = Math.min(0.05, (now - S.last) / 1000);
    S.last = now;
    if (!S.paused) update(rawDt);
    draw();
    S.raf = requestAnimationFrame(frame);
  }

  function update(rawDt) {
    const dt = rawDt * S.timeScale;
    S.t += dt;
    const p = S.p;
    const b = S.b;

    // question timer (real time)
    if (S.q && !S.q.loading && S.q.picked == null) {
      const left = (S.q.deadline - performance.now()) / 1000;
      const el = document.getElementById('b-qt');
      if (el) el.textContent = Number.isFinite(left) ? `${Math.max(0, Math.ceil(left))}s` : 'no timer';
      if (left <= 0) answer(-1);
    }
    S.qCd = Math.max(0, S.qCd - rawDt);
    S.sinceQ += dt;
    document.getElementById('b-hint').hidden = !(S.sinceQ > 8 && p.pips === 0 && !S.q);

    // player movement
    let ix = 0; let iy = 0;
    if (S.joy.active) { ix = S.joy.x; iy = S.joy.y; } else {
      if (S.keys.has('a') || S.keys.has('arrowleft')) ix -= 1;
      if (S.keys.has('d') || S.keys.has('arrowright')) ix += 1;
      if (S.keys.has('w') || S.keys.has('arrowup')) iy -= 1;
      if (S.keys.has('s') || S.keys.has('arrowdown')) iy += 1;
      const m = Math.hypot(ix, iy); if (m > 1) { ix /= m; iy /= m; }
    }
    if (p.dashT > 0) p.dashT -= dt;
    else { p.vx = p.vx * 0.8 + ix * 230 * 0.2; p.vy = p.vy * 0.8 + iy * 230 * 0.2; }
    p.x = clamp(p.x + p.vx * dt, 24, W - 24);
    p.y = clamp(p.y + p.vy * dt, 30, H - 30);
    if (!S.joy.active) p.face = Math.atan2(S.mouse.y - p.y, S.mouse.x - p.x);
    p.iframes = Math.max(0, p.iframes - dt);
    p.dashCd = Math.max(0, p.dashCd - dt);
    p.fireCd = Math.max(0, p.fireCd - dt);
    p.flash = Math.max(0, p.flash - dt);

    // boss movement: keep a fighting distance, strafe, sidestep charged shots
    if (b.dashT > 0) {
      b.dashT -= dt;
      b.x = clamp(b.x + b.dvx * dt, 50, W - 50); b.y = clamp(b.y + b.dvy * dt, 50, H - 50);
      if (dist(b, p) < b.r + p.r) hurtPlayer(b.dashDmg || 15, { x: b.x, y: b.y, knock: true });
    } else {
      const want = 240;
      const d = dist(b, p) || 1;
      const ang = Math.atan2(p.y - b.y, p.x - b.x);
      const radial = (d - want) / want;
      const strafe = Math.sin(S.t * 0.7) * 0.8;
      let mx = Math.cos(ang) * radial + Math.cos(ang + Math.PI / 2) * strafe;
      let my = Math.sin(ang) * radial + Math.sin(ang + Math.PI / 2) * strafe;
      const incoming = S.shots.find((s) => s.charged && Math.hypot(s.x - b.x, s.y - b.y) < 160);
      b.dodgeT -= dt;
      if (incoming && b.dodgeT <= 0 && Math.random() < 0.22) { b.dodgeT = 2.5; mx += -incoming.vy / 200; my += incoming.vx / 200; }
      const mm = Math.hypot(mx, my) || 1;
      const spd = b.speed * (enraged() ? 1.3 : 1) * (S.boss.mechanic?.type === 'mood_swing' ? (b.mood === 'euphoric' ? 1.3 : 0.8) : 1);
      b.x = clamp(b.x + (mx / mm) * spd * dt, 60, W - 60);
      b.y = clamp(b.y + (my / mm) * spd * dt, 60, H - 60);
    }
    b.flash = Math.max(0, b.flash - dt);
    mechanicsTick(dt);

    // attacks
    if (b.tele) {
      b.tele.t -= dt;
      if (b.tele.t <= 0) { executeAttack(b.tele); b.cds[b.tele.i] = (b.tele.a.cooldown || 3) * (enraged() ? 0.8 : 1) / (S.assist ? 0.75 : 1); b.tele = null; }
    } else if (b.dashT <= 0) {
      for (let i = 0; i < b.cds.length; i++) b.cds[i] -= dt;
      const ready = b.cds.findIndex((c) => c <= 0);
      if (ready >= 0) startAttack(ready);
    }

    // boss bullets
    for (const s of S.bullets) {
      if (s.homing) {
        const want = Math.atan2(p.y - s.y, p.x - s.x);
        const cur = Math.atan2(s.vy, s.vx);
        let diff = want - cur; while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2;
        const na = cur + clamp(diff, -s.homing * dt, s.homing * dt);
        const v = Math.hypot(s.vx, s.vy);
        s.vx = Math.cos(na) * v; s.vy = Math.sin(na) * v;
      }
      s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
      if (Math.hypot(s.x - p.x, s.y - p.y) < s.r + p.r - 4) { hurtPlayer(s.dmg, s); s.life = 0; }
    }
    S.bullets = S.bullets.filter((s) => s.life > 0 && s.x > -30 && s.x < W + 30 && s.y > -30 && s.y < H + 30);

    // zones (rain/slam): telegraphed circles that hit once
    for (const z of S.zones) {
      z.t += dt;
      if (!z.hit && z.t >= z.fade) { z.hit = true; if (Math.hypot(z.x - p.x, z.y - p.y) < z.r + p.r * 0.5) hurtPlayer(z.dmg, z); }
    }
    S.zones = S.zones.filter((z) => z.t < z.fade + 0.35);

    // minions
    for (const m of S.minions) {
      const a = Math.atan2(p.y - m.y, p.x - m.x);
      m.x += Math.cos(a) * m.speed * dt; m.y += Math.sin(a) * m.speed * dt; m.life -= dt;
      if (Math.hypot(m.x - p.x, m.y - p.y) < m.r + p.r) { hurtPlayer(8, m); m.hp = 0; }
    }

    // player shots
    for (const s of S.shots) {
      s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
      const hitMinion = S.minions.find((m) => m.hp > 0 && Math.hypot(m.x - s.x, m.y - s.y) < m.r + s.r);
      if (hitMinion) { hitMinion.hp -= s.charged ? 999 : 1; s.life = 0; continue; }
      const decoy = (S.decoys || []).find((d) => Math.hypot(d.x - s.x, d.y - s.y) < b.r + s.r);
      if (decoy) { s.life = 0; floater(decoy.x, decoy.y - 50, 'Decoy!', '#8a96a3'); if (s.charged) floater(s.x, s.y, 'Charge wasted', '#8a96a3', 13); continue; }
      if (Math.hypot(s.x - b.x, s.y - b.y) < b.r + s.r) {
        s.life = 0;
        hurtBoss(s.dmg, s.crit);
        if (s.charged) p.hitCount++;
      } else if (s.charged && s.life <= 0) floater(s.x, s.y, 'Missed! Charge wasted', '#8a96a3', 13);
    }
    S.shots = S.shots.filter((s) => s.life > 0 && s.x > -20 && s.x < W + 20 && s.y > -20 && s.y < H + 20);
    S.minions = S.minions.filter((m) => m.hp > 0 && m.life > 0);

    for (const f of S.floaters) { f.y -= 34 * rawDt; f.t -= rawDt; }
    S.floaters = S.floaters.filter((f) => f.t > 0);

    b.sayT -= rawDt;
    if (b.sayT <= 0) document.getElementById('b-say').hidden = true;
  }

  function floater(x, y, text, color, size = 15) {
    if (!text) return;
    S.floaters.push({ x, y, text, color, size, t: 1.1 });
  }

  function say(text, ms = 2200) {
    const el = document.getElementById('b-say');
    if (!el || !text) return;
    el.textContent = text;
    el.hidden = false;
    S.b.sayT = ms / 1000;
  }

  // ---------------------------------------------------------------- render
  function draw() {
    const { ctx } = S;
    const p = S.p;
    const b = S.b;
    // floor
    ctx.fillStyle = '#1e2a23';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#243329';
    for (let y = 0; y < H; y += 40) for (let x = (y / 40) % 2 ? 0 : 40; x < W; x += 80) ctx.fillRect(x, y, 40, 40);
    ctx.strokeStyle = '#17140f'; ctx.lineWidth = 6; ctx.strokeRect(3, 3, W - 6, H - 6);

    // telegraphs
    if (b.tele) {
      const k = 1 - b.tele.t / b.tele.total;
      ctx.fillStyle = `rgba(255,90,78,${0.15 + 0.25 * k})`;
      ctx.strokeStyle = 'rgba(255,90,78,0.9)'; ctx.lineWidth = 3;
      const pat = b.tele.a.pattern;
      if (pat === 'slam') { circle(b.x, b.y, 150, true); }
      else if (pat === 'rain') { for (const s of b.tele.spots) circle(s.x, s.y, 44, true); }
      else if (pat === 'charge') { ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.tele.tx, b.tele.ty); ctx.stroke(); ctx.setLineDash([]); }
      else { circle(b.x, b.y, b.r + 10 + 12 * k, false); }
      label(b.x, b.y - b.r - 30, b.tele.a.name || pat, '#ffd23f', 14);
    }
    for (const z of S.zones) {
      const k = Math.min(1, z.t / z.fade);
      ctx.fillStyle = z.hit ? 'rgba(255,90,78,0.55)' : `rgba(255,90,78,${0.15 + 0.3 * k})`;
      ctx.strokeStyle = 'rgba(255,90,78,0.9)'; ctx.lineWidth = 3;
      circle(z.x, z.y, z.r, true);
    }

    // aim line (desktop)
    if (!S.joy.active && !S.q) {
      ctx.strokeStyle = p.pips ? 'rgba(255,210,63,0.75)' : 'rgba(255,250,240,0.25)';
      ctx.setLineDash([6, 8]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + Math.cos(p.face) * 120, p.y + Math.sin(p.face) * 120); ctx.stroke(); ctx.setLineDash([]);
    }

    // minions
    for (const m of S.minions) { ctx.fillStyle = INK; circle(m.x, m.y, m.r + 2, true, false); ctx.fillStyle = b.flash ? '#fff' : (S.boss.look?.accent || '#ffd23f'); circle(m.x, m.y, m.r, true, false); }

    // boss (+ mirror decoys)
    const bw = 104;
    for (const d of S.decoys || []) { ctx.globalAlpha = 0.85; ctx.drawImage(S.bossImg, d.x - bw / 2, d.y - bw / 2, bw, bw); ctx.globalAlpha = 1; }
    if ((S.decoys || []).length) { ctx.fillStyle = 'rgba(255,210,63,0.55)'; ellipse(b.x, b.y + bw / 2 - 6, 46, 12); }
    ctx.globalAlpha = b.flash > 0 ? 0.55 : 1;
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ellipse(b.x, b.y + bw / 2 - 6, 40, 10);
    ctx.drawImage(S.bossImg, b.x - bw / 2, b.y - bw / 2, bw, bw);
    ctx.globalAlpha = 1;
    if (b.shield > 0) { ctx.strokeStyle = 'rgba(111,227,255,0.9)'; ctx.lineWidth = 4; circle(b.x, b.y, b.r + 14, false); }
    if (enraged()) label(b.x, b.y + bw / 2 + 12, 'ENRAGED', '#ff5a4e', 12);

    // player
    const blink = p.iframes > 0 && Math.floor(p.iframes * 20) % 2 === 0;
    if (!blink) {
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ellipse(p.x, p.y + 30, 18, 6);
      const pw = 48; const ph = 64;
      ctx.save();
      if (Math.cos(p.face) < 0) { ctx.translate(p.x, 0); ctx.scale(-1, 1); ctx.translate(-p.x, 0); }
      ctx.globalAlpha = p.flash > 0 ? 0.6 : 1;
      ctx.drawImage(S.playerImg, p.x - pw / 2, p.y - ph / 2 - 6, pw, ph);
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    if (p.shield > 0) { ctx.strokeStyle = 'rgba(61,139,253,0.9)'; ctx.lineWidth = 3; circle(p.x, p.y, 30, false); }
    if (p.pips > 0) { ctx.fillStyle = '#ffd23f'; for (let i = 0; i < p.pips; i++) ctx.fillRect(p.x - 13 + i * 10, p.y - 48, 7, 7); }

    // projectiles
    for (const s of S.bullets) { ctx.fillStyle = INK; sq(s.x, s.y, s.r + 2); ctx.fillStyle = s.homing ? '#8b5cf6' : '#ff5a4e'; sq(s.x, s.y, s.r); }
    for (const s of S.shots) { ctx.fillStyle = INK; sq(s.x, s.y, s.r + 2); ctx.fillStyle = s.charged ? '#ffd23f' : '#fffaf0'; sq(s.x, s.y, s.r); }

    for (const f of S.floaters) { ctx.globalAlpha = Math.min(1, f.t * 2); label(f.x, f.y, f.text, f.color, f.size); ctx.globalAlpha = 1; }

    function circle(x, y, r, fill, stroke = true) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); if (fill) ctx.fill(); if (stroke && ctx.strokeStyle) ctx.stroke(); }
    function ellipse(x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }
    function sq(x, y, r) { ctx.fillRect(Math.round(x - r), Math.round(y - r), r * 2, r * 2); }
  }

  function label(x, y, text, color, size = 15) {
    const { ctx } = S;
    ctx.font = `${size}px Silkscreen, monospace`;
    ctx.textAlign = 'center';
    ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeText(text, x, y);
    ctx.fillStyle = color; ctx.fillText(text, x, y);
  }

  function updateHud() {
    if (!S) return;
    const { p, b } = S;
    const set = (id, w) => { const el = document.getElementById(id); if (el) el.style.width = `${clamp(w, 0, 1) * 100}%`; };
    set('b-boss-hp', b.hp / b.maxHp);
    set('b-boss-shield', b.shield / b.maxHp);
    set('b-you-hp', p.hp / p.maxHp);
    set('b-you-shield', p.shield / p.maxHp);
    const bn = document.getElementById('b-boss-num'); if (bn) bn.textContent = `${Math.ceil(Math.max(0, b.hp))}`;
    const yn = document.getElementById('b-you-num'); if (yn) yn.textContent = `${Math.ceil(Math.max(0, p.hp))}`;
    document.querySelectorAll('#b-pips i').forEach((el, i) => el.classList.toggle('on', i < p.pips));
    const st = document.getElementById('b-streak'); if (st) st.textContent = p.streak > 1 ? `Streak ${p.streak}` : '';
  }

  // ---------------------------------------------------------------- end
  async function end(result) {
    if (S.over) return;
    S.over = true;
    unbind();
    draw();
    const state = S;
    let r;
    try {
      r = await api.post(`/battles/${state.battleId}/finish`, { result, damageTaken: state.p.damageTaken });
    } catch (err) {
      r = { result, error: err.message };
    }
    showResult(state, r);
  }

  function showResult(state, r) {
    const won = r.result === 'won' && !r.error;
    const acc = r.correct + r.wrong ? Math.round((r.correct / (r.correct + r.wrong)) * 100) : 0;
    const stage = document.getElementById('b-stage');
    const el = document.createElement('div');
    el.className = 'arena-result';
    el.innerHTML = `<div class="card result">
      ${won ? Sprites.character('chip', 96) : Sprites.character('grizz', 96)}
      <h2>${won ? `${escapeHtml(state.boss.name)} defeated!` : r.error ? 'Something went wrong' : 'Knocked out.'}</h2>
      <p class="lead">${won ? escapeHtml(state.boss.defeat || '') : r.error ? escapeHtml(r.error) : 'No penalty. Study the questions you missed and try again.'}</p>
      ${!r.error ? `<div class="reward-row">
        ${won ? `<div class="reward"><span class="r-num">+${r.coins}</span><span class="px-label">Coins</span></div><div class="reward"><span class="r-num">+${r.xp}</span><span class="px-label">XP</span></div>` : ''}
        <div class="reward"><span class="r-num">${acc}%</span><span class="px-label">Accuracy</span></div>
        <div class="reward"><span class="r-num">${r.seconds}s</span><span class="px-label">Time</span></div>
        <div class="reward"><span class="r-num">${r.damageTaken}</span><span class="px-label">Dmg taken</span></div></div>` : ''}
      ${r.item ? `<p class="drop">${Sprites.icon('gem', 22)}<span>New item: <b>${escapeHtml(r.item.name)}</b> <span class="muted">(${r.item.rarity})</span>. Equip it in your Hideout.</span></p>` : ''}
      ${won && !r.firstWin ? `<p class="muted" style="font-size:14px">Repeat wins pay a small coin bonus once a day.</p>` : ''}
      <div class="row-wrap" style="justify-content:center;margin-top:12px">
        <button class="btn btn-primary" id="r-again">${won ? 'Fight again' : 'Try again'}</button>
        ${r.item ? '<a class="btn" href="/hideout">Open Hideout</a>' : ''}
        <a class="btn" href="/arena">Back to Arena</a></div></div>`;
    stage.appendChild(el);
    el.querySelector('#r-again').onclick = () => App.route();
    if (won) { UI.confetti(140); UI.celebrate(r); }
  }

  function stop() {
    if (S && !S.over) {
      S.over = true;
      unbind();
      api.post(`/battles/${S.battleId}/finish`, { result: 'abandoned', damageTaken: S.p.damageTaken }).catch(() => {});
    }
    S = null;
  }

  // Read-only snapshot for automated play-tests.
  function debug() {
    if (!S) return null;
    return { boss: { x: S.b.x, y: S.b.y, hp: Math.round(S.b.hp) }, player: { x: S.p.x, y: S.p.y, hp: Math.round(S.p.hp), pips: S.p.pips, streak: S.p.streak }, bullets: S.bullets.length, over: S.over, t: S.t, W, H };
  }

  return { run, stop, debug };
})();

window.Battle = Battle;
