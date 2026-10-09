/* ============================================================
   TradeIQ — profile.js   Profile, badges, shop + leaderboard.
   ============================================================ */

const Profile = (() => {
  const SHOP = [
    { item: 'streak_freeze', cost: 50, name: 'Streak Freeze', desc: 'Miss a day without losing your streak. Hold up to 2.', icon: 'snowflake' },
    { item: 'avatar:hoot', cost: 100, name: 'Hoot avatar', desc: 'Be the owl.', sprite: 'hoot' },
    { item: 'avatar:grizz', cost: 150, name: 'Grizz avatar', desc: 'Be the bear.', sprite: 'grizz' },
    { item: 'avatar:bolt', cost: 250, name: 'Bolt avatar', desc: 'Be the robot.', sprite: 'bolt' },
  ];

  async function render() {
    const view = document.getElementById('view');
    view.innerHTML = '<div class="page wrap"><div class="empty-state"><span class="spinner"></span></div></div>';
    const [me, prog, all] = await Promise.all([api.get('/me'), api.get('/lessons/progress'), api.get('/lessons/achievements')]);
    Session.setUser(me);
    const owned = new Set(prog.achievements.map((a) => a.id));
    const lvl = me.level;
    const pct = lvl.xpForNext ? Math.round((lvl.xpIntoLevel / lvl.xpForNext) * 100) : 100;

    view.innerHTML = `<div class="page wrap">
      <div class="profile-grid">
        <div class="card profile-card">
          ${Sprites.character(me.avatar, 120)}
          <h2>${escapeHtml(me.username)}</h2>
          <div class="muted" style="font-weight:600">Level ${lvl.level} · ${escapeHtml(lvl.title)}</div>
          <div class="progress-track" style="margin:14px 0 4px"><div class="progress-fill" style="width:${pct}%"></div></div>
          <small class="muted mono">${lvl.xpForNext ? `${lvl.xpIntoLevel}/${lvl.xpForNext} XP to ${escapeHtml(lvl.nextTitle)}` : 'Max level!'}</small>
          <div class="stat-card" style="margin-top:18px;text-align:left">
            <div class="stat-tile"><div class="num">${me.xp.toLocaleString()}</div><div class="lbl">Total XP</div></div>
            <div class="stat-tile"><div class="num">${me.coins}</div><div class="lbl">Coins</div></div>
            <div class="stat-tile"><div class="num">${me.streak}</div><div class="lbl">Streak (best ${me.streakBest})</div></div>
            <div class="stat-tile"><div class="num">${Object.keys(prog.completions).length}</div><div class="lbl">Lessons</div></div>
          </div>
          <div class="eyebrow" style="margin-top:20px">Pick your avatar</div>
          <div class="avatar-pick">${Sprites.list.map((n) => `<button data-avatar="${n}" class="${me.avatar === n ? 'on' : ''}" ${me.ownedAvatars.includes(n) ? '' : 'disabled'} title="${me.ownedAvatars.includes(n) ? Sprites.NAMES[n] : 'Unlock in the shop'}">${Sprites.character(n, 44)}</button>`).join('')}</div>
          <p class="muted" style="font-size:13px;margin-top:14px">Member since ${new Date(me.createdAt).toLocaleDateString()}</p>
        </div>
        <div class="stack">
          <div class="card"><div class="card-title">${Sprites.icon('trophy', 24)} Badges <span class="muted" style="font-weight:600;font-size:15px">${owned.size}/${all.length}</span></div>
            <div class="ach-grid">${all.map((a) => `<div class="ach ${owned.has(a.id) ? '' : 'locked'}" title="${escapeHtml(a.desc)}">${Sprites.character(a.sprite, 48)}<b>${escapeHtml(a.name)}</b><small>${escapeHtml(a.desc)}</small></div>`).join('')}</div>
          </div>
          <div class="card" id="shop"><div class="card-title">${Sprites.icon('coin', 24)} Coin shop <span class="chip-tag" style="margin-left:auto">${Sprites.icon('coin', 14)} ${me.coins}</span></div>
            <div class="shop-grid">${SHOP.map((s) => {
              const has = s.sprite ? me.ownedAvatars.includes(s.sprite) : me.streakFreezes >= 2;
              return `<div class="shop-item">${s.sprite ? Sprites.character(s.sprite, 56) : Sprites.icon(s.icon, 48)}<b>${s.name}</b><small class="muted">${s.desc}${s.item === 'streak_freeze' ? ` You have ${me.streakFreezes}.` : ''}</small>
                <button class="btn btn-sm ${me.coins >= s.cost && !has ? 'btn-sun' : ''}" data-buy="${s.item}" ${has ? 'disabled' : ''}>${has ? (s.sprite ? 'Owned' : 'Maxed') : `<span class="price">${Sprites.icon('coin', 16)} ${s.cost}</span>`}</button></div>`;
            }).join('')}</div>
            <p class="muted" style="font-size:13.5px;margin:12px 0 0">Earn coins by finishing lessons, perfect quizzes, streak milestones and badges. Coins have no cash value.</p>
          </div>
        </div>
      </div>
    </div>`;

    view.querySelectorAll('[data-avatar]').forEach((b) => b.addEventListener('click', async () => {
      try {
        Session.setUser(await api.patch('/me', { avatar: b.dataset.avatar }));
        render();
      } catch (err) { UI.toast(err.message, 'error'); }
    }));
    view.querySelectorAll('[data-buy]').forEach((b) => b.addEventListener('click', async () => {
      UI.setBusy(b, true);
      try {
        Session.setUser(await api.post('/me/shop', { item: b.dataset.buy }));
        UI.toast('Purchased!', 'reward', { icon: 'coin' });
        UI.cameo('penny', 'Smart spending. I approve.', 'happy');
        render();
      } catch (err) {
        UI.setBusy(b, false);
        UI.toast(err.message, 'error');
      }
    }));
    if (location.hash === '#shop') setTimeout(() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  return { render };
})();

const Ranks = (() => {
  async function render() {
    const view = document.getElementById('view');
    view.innerHTML = '<div class="page wrap"><div class="empty-state"><span class="spinner"></span></div></div>';
    const data = await api.get('/lessons/leaderboard');
    const me = Session.user;
    let tab = 'weekly';
    const list = (rows, key) => (rows.length ? `<ol class="rank-list">${rows.map((r, i) => `<li class="${r.username === me.username ? 'me' : ''}">
        <span class="pos p${i + 1}">${i + 1}</span>${Sprites.character(r.avatar || 'chip', 36)}<span class="who">${escapeHtml(r.username)}</span><span class="pts">${Number(r[key]).toLocaleString()} XP</span></li>`).join('')}</ol>`
      : `<div class="empty-state">${Sprites.character('hoot', 72)}No one has earned XP yet this week. Be first!</div>`);
    function draw() {
      view.innerHTML = `<div class="page wrap" style="max-width:760px">
        <div class="page-head"><div><span class="eyebrow">Leaderboard</span><h1>Ranks</h1><p>Weekly board resets every Monday (UTC).</p></div></div>
        <div class="card">
          <div class="tabs"><button data-t="weekly" class="${tab === 'weekly' ? 'on' : ''}">This week</button><button data-t="all" class="${tab === 'all' ? 'on' : ''}">All time</button></div>
          ${tab === 'weekly' ? list(data.weekly, 'xp') : list(data.allTime, 'xp')}
          <hr class="divider"><div class="row"><b>You</b><span class="spacer"></span><span class="mono">${data.me.week_xp} XP this week · all-time rank #${data.me.all_time_rank}</span></div>
          ${me.showOnLeaderboard ? '' : '<p class="muted" style="font-size:14px">You are hidden from the leaderboard. Change that in Settings.</p>'}
        </div></div>`;
      view.querySelectorAll('[data-t]').forEach((b) => b.onclick = () => { tab = b.dataset.t; draw(); });
    }
    draw();
  }
  return { render };
})();

window.Profile = Profile;
window.Ranks = Ranks;
