/* ============================================================
   TradeIQ — arena.js   Arena hub (bosses + quests), the pre-fight
   screen, and the fight route. The fight itself is game/battle.js.
   ============================================================ */

const Arena = (() => {
  const WORLD_NAMES = { 1: 'Coin Cove', 2: 'Candle City', 3: 'Volatility Volcano', 4: 'Orbit Exchange' };
  const PATTERN_ICON = { ring: 'target', volley: 'bolt', aimed: 'target', rain: 'warning', charge: 'rocket', homing: 'magnifier', wall: 'scale', slam: 'warning' };
  let tab = 'bosses';

  const fmtTime = (ms) => (ms == null ? '—' : `${Math.floor(ms / 60000)}:${String(Math.round((ms % 60000) / 1000)).padStart(2, '0')}`);

  async function render() {
    const view = document.getElementById('view');
    view.innerHTML = '<div class="page wrap"><div class="empty-state"><span class="spinner"></span> Entering the arena...</div></div>';
    const qs = new URLSearchParams(location.search);
    if (qs.get('tab') === 'quests') tab = 'quests';
    const [battles, quests] = await Promise.all([api.get('/battles'), api.get('/quests')]);
    const readyQuests = [...quests.daily, ...quests.weekly, ...quests.story].filter((q) => q.done && !q.claimed).length;
    view.innerHTML = `<div class="page wrap arena-page">
      <div class="page-head"><div><span class="eyebrow">Arena</span><h1>Fight bosses. Finish quests.</h1>
        <p>Answer questions to charge your weapon, then make the shot count. Your gear's stats and buffs all apply.</p></div>
        <div class="spacer"></div>
        <div class="tabs"><button data-tab="bosses" class="${tab === 'bosses' ? 'on' : ''}">Bosses</button>
          <button data-tab="quests" class="${tab === 'quests' ? 'on' : ''}">Quests${readyQuests ? ` <span class="badge-dot">${readyQuests}</span>` : ''}</button></div>
      </div>
      <div id="arena-body"></div></div>`;
    view.querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => { tab = b.dataset.tab; render(); });
    const body = document.getElementById('arena-body');
    if (tab === 'bosses') drawBosses(body, battles); else drawQuests(body, quests);
  }

  // ---------------- bosses
  function drawBosses(el, data) {
    if (!data.bosses.length) { el.innerHTML = '<div class="empty-state">Bosses are on their way.</div>'; return; }
    const worlds = [...new Set(data.bosses.map((b) => b.world))];
    const s = data.loadout.stats;
    el.innerHTML = `<div class="card loadout-strip">
        <span class="px-label">Your loadout</span>
        <span class="chip-tag">${Sprites.icon('heart', 14)} ${data.loadout.hp} HP</span>
        <span class="chip-tag">${Sprites.icon('bolt', 14)} Power ${s.power}</span><span class="chip-tag">${Sprites.icon('shield', 14)} Defense ${s.defense}</span>
        <span class="chip-tag">${Sprites.icon('clock', 14)} Focus ${s.focus}</span><span class="chip-tag">${Sprites.icon('star', 14)} Luck ${s.luck}</span>
        <span class="chip-tag">${data.loadout.effects.length} buffs</span>
        <a class="btn btn-sm" href="/hideout" style="margin-left:auto">Change gear</a></div>
      ${worlds.map((w) => `<section class="boss-world"><h2>World ${w}: ${WORLD_NAMES[w]}</h2><div class="boss-grid">
        ${data.bosses.filter((b) => b.world === w).map((b) => `
          <article class="card boss-card ${b.unlocked ? '' : 'locked'} ${b.wins ? 'beaten' : ''}" style="--bc:${b.look?.body || '#8b5cf6'}">
            <div class="boss-portrait">${BossArt.svg(b, 112)}${b.wins ? '<span class="beaten-tag">Defeated</span>' : ''}</div>
            <div class="boss-info"><span class="px-label">${escapeHtml(b.title || '')}</span><h3>${escapeHtml(b.name)}</h3>
              <div class="row-wrap" style="gap:6px;margin:6px 0"><span class="chip-tag">${b.hp} HP</span>${b.mechanic?.type !== 'none' ? `<span class="chip-tag">${escapeHtml(b.mechanic.type.replace('_', ' '))}</span>` : ''}
                ${b.wins ? `<span class="chip-tag">Best ${fmtTime(b.bestMs)}</span>` : ''}</div>
              <p class="muted lesson-line">${escapeHtml(b.lesson)}</p>
              ${b.unlocked
    ? `<a class="btn btn-primary btn-sm" href="/battle/${b.id}">${b.wins ? 'Rematch' : 'Fight'}</a>`
    : `<div class="lock-line">${Sprites.icon('lock', 16)} ${escapeHtml(b.unlockText)} <span class="mono">(${b.progress.done}/${b.progress.total})</span></div>`}
              ${!b.wins ? `<div class="reward-line">First win: ${Sprites.icon('coin', 14)} ${b.rewards.firstWinCoins}${b.rewardItem ? ` + <b>${escapeHtml(b.rewardItem.name)}</b>` : ''}</div>` : ''}
            </div></article>`).join('')}</div></section>`).join('')}`;
  }

  // ---------------- quests
  function questCard(q) {
    const pct = Math.round((q.progress / q.target) * 100);
    return `<div class="quest ${q.claimed ? 'claimed' : q.done ? 'ready' : ''}">
      <div class="q-main"><b>${escapeHtml(q.name)}</b><span>${escapeHtml(q.desc)}</span>
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
        <small class="mono">${q.progress}/${q.target}</small></div>
      <div class="q-side"><span class="q-reward">${q.reward.coins ? `${Sprites.icon('coin', 16)}${q.reward.coins}` : ''}${q.reward.item ? `<b>${escapeHtml(q.reward.item.name)}</b>` : ''}</span>
        ${q.claimed ? '<span class="chip-tag">Claimed</span>' : `<button class="btn btn-sm ${q.done ? 'btn-sun' : ''}" data-claim="${q.id}" ${q.done ? '' : 'disabled'}>Claim</button>`}</div></div>`;
  }

  function drawQuests(el, data) {
    const section = (title, list, note) => `<section class="card quest-sec"><div class="card-title">${title}<span class="muted" style="font-weight:500;font-size:14px;margin-left:auto">${note}</span></div>
      ${list.length ? list.map(questCard).join('') : '<p class="muted">Nothing here right now.</p>'}</section>`;
    el.innerHTML = `${data.coinBonus ? `<p class="chip-tag" style="margin-bottom:14px">${Sprites.icon('coin', 14)} Your gear adds +${data.coinBonus}% quest coins</p>` : ''}
      <div class="quest-cols">${section(`${Sprites.icon('fire', 20)} Daily`, data.daily, 'New quests at midnight')}
      ${section(`${Sprites.icon('clock', 20)} Weekly`, data.weekly, 'Resets Monday')}</div>
      ${section(`${Sprites.icon('book', 20)} Story`, data.story, `${data.storyDone} completed`)}`;
    el.querySelectorAll('[data-claim]').forEach((b) => b.onclick = async () => {
      UI.setBusy(b, true);
      try {
        const r = await api.post(`/quests/${b.dataset.claim}/claim`);
        Session.setUser({ ...Session.user, coins: r.coins });
        UI.toast(`Quest complete: +${r.claimed.coins} coins${r.claimed.item ? ` and ${r.claimed.item.name}` : ''}`, 'reward', { icon: 'coin' });
        if (r.claimed.item) UI.cameo('penny', `You earned ${r.claimed.item.name}! Go equip it in your Hideout.`, 'wow', 3500);
        drawQuests(el, r.board);
      } catch (err) { UI.toast(err.message, 'error'); UI.setBusy(b, false); }
    });
  }

  // ---------------- pre-fight + fight
  async function fight(bossId) {
    const view = document.getElementById('view');
    view.innerHTML = '<div class="player"><div class="empty-state" style="padding-top:20vh"><span class="spinner"></span> Loading the arena...</div></div>';
    const [list, state, cat] = await Promise.all([api.get('/battles'), api.get('/game/state'), api.get('/game/catalog')]);
    const boss = list.bosses.find((b) => b.id === bossId);
    if (!boss) { view.innerHTML = '<div class="page wrap"><div class="empty-state"><h2>No such boss</h2><a class="btn" href="/arena">Back to Arena</a></div></div>'; return undefined; }
    if (!boss.unlocked) {
      view.innerHTML = `<div class="page wrap"><div class="empty-state">${BossArt.svg(boss, 120)}<h2>${escapeHtml(boss.name)} is locked</h2><p>${escapeHtml(boss.unlockText)}.</p><a class="btn btn-primary" href="/learn">Go learn</a> <a class="btn" href="/arena">Back</a></div></div>`;
      return undefined;
    }
    const gear = Object.values(state.equipment).map((id) => cat.items.find((i) => i.id === id)).filter(Boolean);
    let assist = false;
    try { assist = localStorage.getItem('tiq_assist') === '1'; } catch { /* ignore */ }

    view.innerHTML = `<div class="page wrap prefight">
      <div class="prefight-grid">
        <div class="card vs-card" style="--bc:${boss.look?.body || '#8b5cf6'}">
          <div class="vs-row"><div class="vs-side">${Avatar.render(state.appearance, gear, { size: 150 })}<b>${escapeHtml(Session.user.username)}</b><span class="mono">${list.loadout.hp} HP</span></div>
            <span class="vs">VS</span>
            <div class="vs-side">${BossArt.svg(boss, 150)}<b>${escapeHtml(boss.name)}</b><span class="mono">${boss.hp} HP</span></div></div>
          <div class="speech mood-warn">${BossArt.svg(boss, 56)}<div class="bubble"><span class="who">${escapeHtml(boss.name)}</span>${escapeHtml(boss.intro || 'Ready?')}</div></div>
        </div>
        <div class="card">
          <div class="card-title">${Sprites.icon('lightbulb', 20)} How to win</div>
          <ol class="howto"><li>Press <span class="kbd">E</span> (or <b>Charge</b>) to open a question. Time slows down while you think.</li>
            <li>Each correct answer adds a charge pip (max 3). Wrong answers cost a pip and power the boss up.</li>
            <li>Aim and fire (<span class="kbd">Click</span> or <span class="kbd">J</span>). A charged shot hits hard, but if it misses the charge is gone.</li>
            <li>Dodge with <span class="kbd">Shift</span>. Red zones and lines show where attacks will land.</li></ol>
          ${boss.mechanic?.type !== 'none' ? `<p class="mechanic"><b>Gimmick:</b> ${escapeHtml(boss.mechanic.text)}</p>` : ''}
          <div class="attack-list">${boss.attacks.map((a) => `<div class="atk">${Sprites.icon(PATTERN_ICON[a.pattern] || 'warning', 18)}<span><b>${escapeHtml(a.name)}</b> ${escapeHtml(a.text || '')}</span></div>`).join('')}</div>
          <label class="check-line"><input type="checkbox" id="pf-assist" ${assist ? 'checked' : ''}/><span><b>Assist mode:</b> slower boss, bigger warnings, no question timer. Same rewards.</span></label>
          <div class="row-wrap" style="margin-top:14px"><button class="btn btn-primary btn-lg" id="pf-go">Fight!</button><a class="btn" href="/arena">Back</a></div>
        </div>
      </div></div>`;
    document.getElementById('pf-go').onclick = async (e) => {
      const assistOn = document.getElementById('pf-assist').checked;
      try { localStorage.setItem('tiq_assist', assistOn ? '1' : '0'); } catch { /* ignore */ }
      UI.setBusy(e.currentTarget, true);
      try {
        const battle = await api.post(`/battles/${boss.id}/start`);
        document.body.classList.add('focus-mode');
        App.hideChrome();
        await Battle.run({ boss: battle.boss, battle, appearance: state.appearance, gear, assist: assistOn });
      } catch (err) {
        UI.setBusy(e.currentTarget, false);
        UI.toast(err.message, 'error');
      }
    };
    return () => Battle.stop();
  }

  /** Small quest preview for the Learn page. */
  async function questTeaser(el) {
    try {
      const q = await api.get('/quests');
      const list = q.daily.slice(0, 3);
      if (!list.length) return;
      el.innerHTML = `<div class="card quest-teaser"><div class="card-title">${Sprites.icon('fire', 20)} Today's quests<a class="btn btn-sm" href="/arena?tab=quests" style="margin-left:auto">All quests</a></div>
        ${list.map((x) => `<div class="qt-row ${x.claimed ? 'claimed' : x.done ? 'ready' : ''}"><span>${escapeHtml(x.name)}<small>${escapeHtml(x.desc)}</small></span><span class="mono">${x.claimed ? 'Done' : `${x.progress}/${x.target}`}</span></div>`).join('')}</div>`;
    } catch { /* quests are optional on this page */ }
  }

  return { render, fight, questTeaser };
})();

window.Arena = Arena;
