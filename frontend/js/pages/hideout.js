/* ============================================================
   TradeIQ — hideout.js
   The game home: your avatar, gear, inventory, look editor and
   the item shop. Learning unlocks worlds; worlds unlock gear.
   ============================================================ */

const Hideout = (() => {
  const SLOT_LABEL = { helmet: 'Helmet', chest: 'Chest', legs: 'Legs', boots: 'Boots', weapon: 'Weapon', offhand: 'Offhand', trinket: 'Trinket' };
  const STAT_META = {
    power: { label: 'Power', icon: 'bolt', color: 'var(--tomato)' },
    defense: { label: 'Defense', icon: 'shield', color: 'var(--sky)' },
    focus: { label: 'Focus', icon: 'clock', color: 'var(--grape)' },
    luck: { label: 'Luck', icon: 'star', color: 'var(--sun)' },
  };
  const WORLD_NAMES = { 1: 'Coin Cove', 2: 'Candle City', 3: 'Volatility Volcano', 4: 'Orbit Exchange' };
  const LOOK_FIELDS = [
    ['skin', 'Skin'], ['hairStyle', 'Hair style'], ['hairColor', 'Hair color'], ['eyeColor', 'Eyes'],
    ['shirt', 'Shirt'], ['pants', 'Pants'], ['shoes', 'Shoes'],
  ];

  let cat = null;
  let st = null;
  let tab = 'gear';
  let slotFilter = 'all';
  let selected = null;

  const item = (id) => cat.items.find((i) => i.id === id);
  const owns = (id) => st.inventory.some((i) => i.id === id);
  const equippedItems = () => Object.values(st.equipment).map(item).filter(Boolean);

  async function render() {
    const view = document.getElementById('view');
    view.innerHTML = '<div class="page wrap"><div class="empty-state"><span class="spinner"></span> Opening the hideout...</div></div>';
    [cat, st] = await Promise.all([cat ? Promise.resolve(cat) : api.get('/game/catalog'), api.get('/game/state')]);
    draw();
  }

  function apply(next) {
    st = next;
    Session.setUser({ ...Session.user, coins: st.coins });
    draw();
  }

  // ---------- layout ----------
  function draw() {
    const view = document.getElementById('view');
    const u = Session.user;
    const maxStat = Math.max(10, ...Object.values(st.stats));
    view.innerHTML = `<div class="page wrap hideout">
      <div class="page-head"><div><span class="eyebrow">Your hideout</span><h1>Gear up, ${escapeHtml(u.username)}</h1>
        <p>Every item stands for a real money skill. Learn to unlock new worlds, then spend coins on gear.</p></div>
        <div class="spacer"></div><span class="hud-pill big-coins">${Sprites.icon('coin', 22)}<span>${st.coins}</span></span></div>
      <div class="hideout-grid">
        <section class="card stage">
          <div class="stage-floor">${Avatar.render(st.appearance, equippedItems(), { size: 260, title: `${u.username}'s avatar` })}</div>
          <div class="stat-bars">${Object.entries(STAT_META).map(([k, m]) => `
            <div class="stat-bar"><span class="sb-label">${Sprites.icon(m.icon, 18)}${m.label}</span>
              <span class="sb-track"><span style="width:${Math.max(0, st.stats[k] / maxStat) * 100}%;background:${m.color}"></span></span><b class="mono">${st.stats[k]}</b></div>`).join('')}</div>
          ${st.sets.length ? `<div class="set-list">${st.sets.map((s) => `<div class="set-row"><b>${escapeHtml(s.name)}</b> <span class="muted mono">${s.count}/4</span>
            ${s.bonuses.map((b) => `<span class="chip-tag ${b.active ? 'on' : ''}">${b.pieces}pc: ${escapeHtml(b.text)}</span>`).join('')}</div>`).join('')}</div>` : '<p class="muted" style="font-size:14px">Wear 2 or 4 pieces of the same set for bonus stats. Mixing sets is allowed.</p>'}
          ${st.effects && st.effects.length ? `<div class="buff-list"><span class="px-label">Active buffs</span>${st.effects.map((e) => `<div class="buff">${Sprites.icon('star', 14)}<span><b>${escapeHtml(e.text)}</b> <small class="muted">from ${escapeHtml(e.from)}</small></span></div>`).join('')}</div>` : ''}
          <div class="slot-row">${Object.keys(SLOT_LABEL).map((slot) => {
            const it = item(st.equipment[slot]);
            return `<button class="slot-tile ${it ? `r-${it.rarity}` : 'empty'}" data-slot-tile="${slot}" title="${SLOT_LABEL[slot]}${it ? `: ${escapeHtml(it.name)}` : ''}">
              ${it ? Avatar.itemIcon(it, 40) : `<span class="px-label">${SLOT_LABEL[slot]}</span>`}</button>`;
          }).join('')}</div>
        </section>
        <section class="card panel">
          <div class="tabs">${[['gear', 'Inventory'], ['look', 'Look'], ['shop', 'Shop']].map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${l}</button>`).join('')}</div>
          <div id="hp-body"></div>
        </section>
      </div>
    </div>`;
    view.querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => { tab = b.dataset.tab; selected = null; draw(); });
    view.querySelectorAll('[data-slot-tile]').forEach((b) => b.onclick = () => { tab = 'gear'; slotFilter = b.dataset.slotTile; selected = st.equipment[b.dataset.slotTile] || null; draw(); });
    ({ gear: drawGear, look: drawLook, shop: drawShop })[tab](document.getElementById('hp-body'));
  }

  // ---------- inventory ----------
  function filters() {
    return `<div class="slot-filters">${['all', ...Object.keys(SLOT_LABEL)].map((s) => `<button data-filter="${s}" class="${slotFilter === s ? 'on' : ''}">${s === 'all' ? 'All' : SLOT_LABEL[s]}</button>`).join('')}</div>`;
  }
  function wireFilters(el) {
    el.querySelectorAll('[data-filter]').forEach((b) => b.onclick = () => { slotFilter = b.dataset.filter; selected = null; draw(); });
  }
  function tile(it, extra = '') {
    const eq = st.equipment[it.slot] === it.id;
    return `<button class="item-tile r-${it.rarity} ${selected === it.id ? 'sel' : ''}" data-item="${it.id}">
      ${Avatar.itemIcon(it, 52)}${eq ? '<span class="eq-badge">E</span>' : ''}${extra}<span class="it-name">${escapeHtml(it.name)}</span></button>`;
  }

  function drawGear(el) {
    const mine = st.inventory.map((i) => item(i.id)).filter(Boolean).filter((i) => slotFilter === 'all' || i.slot === slotFilter);
    el.innerHTML = `${filters()}<div class="item-grid">${mine.map((i) => tile(i)).join('') || `<div class="empty-state">${Sprites.character('penny', 64)}Nothing for this slot yet. Check the shop!</div>`}</div><div id="item-detail"></div>`;
    wireFilters(el);
    el.querySelectorAll('[data-item]').forEach((b) => b.onclick = () => { selected = b.dataset.item; draw(); });
    if (selected && owns(selected)) detail(el.querySelector('#item-detail'), item(selected), 'owned');
  }

  // ---------- shop ----------
  function drawShop(el) {
    const forSale = cat.items.filter((i) => i.unlockKind === 'shop' && (slotFilter === 'all' || i.slot === slotFilter));
    const worlds = [...new Set(forSale.map((i) => i.world))].sort();
    el.innerHTML = `${filters()}${worlds.map((w) => {
      const open = st.unlockedWorlds.includes(w);
      return `<div class="shop-world"><h4>${open ? '' : Sprites.icon('lock', 16)} World ${w}: ${WORLD_NAMES[w]} ${open ? '' : `<span class="muted" style="font-weight:500;font-size:13px">Pass the World ${w - 1} exam to unlock</span>`}</h4>
        <div class="item-grid ${open ? '' : 'locked'}">${forSale.filter((i) => i.world === w).map((i) => tile(i, owns(i.id) ? '<span class="owned-badge">Owned</span>' : `<span class="price-badge">${Sprites.icon('coin', 12)}${i.price}</span>`)).join('')}</div></div>`;
    }).join('') || '<div class="empty-state">Nothing for sale in this slot yet.</div>'}<div id="item-detail"></div>`;
    wireFilters(el);
    el.querySelectorAll('[data-item]').forEach((b) => b.onclick = () => { selected = b.dataset.item; draw(); });
    if (selected) detail(el.querySelector('#item-detail'), item(selected), owns(selected) ? 'owned' : 'shop');
  }

  // ---------- item detail ----------
  function detail(el, it, mode) {
    if (!it) return;
    const set = it.set ? cat.sets.find((s) => s.id === it.set) : null;
    const eq = st.equipment[it.slot] === it.id;
    const open = st.unlockedWorlds.includes(it.world);
    const statLine = Object.entries(it.stats || {}).filter(([, v]) => v).map(([k, v]) => `<span class="chip-tag ${v < 0 ? 'neg' : ''}">${Sprites.icon(STAT_META[k].icon, 12)}${v > 0 ? '+' : ''}${v} ${STAT_META[k].label}</span>`).join('');
    const effectLine = (it.effects || []).map((e) => `<div class="buff">${Sprites.icon('star', 14)}<b>${escapeHtml(e.text)}</b></div>`).join('');
    el.innerHTML = `<div class="item-detail r-${it.rarity}">
      <div class="id-icon">${Avatar.itemIcon(it, 96)}</div>
      <div class="id-body"><span class="px-label rarity">${it.rarity} ${SLOT_LABEL[it.slot]}</span><h3>${escapeHtml(it.name)}</h3>
        <div class="row-wrap" style="margin:6px 0 10px">${statLine || '<span class="muted">Cosmetic</span>'}</div>
        ${effectLine ? `<div class="buff-list">${effectLine}</div>` : ''}
        ${set ? `<p class="set-note"><b>${escapeHtml(set.name)} set:</b> ${set.bonuses.map((b) => `${b.pieces} pieces: ${escapeHtml(b.text)}`).join(' · ')}</p>` : ''}
        <p class="lesson">${Sprites.icon('lightbulb', 16)} ${escapeHtml(it.lesson)}</p>
        <p class="muted flavor">"${escapeHtml(it.flavor)}"</p>
        <div class="row-wrap">${mode === 'owned'
    ? (eq ? `<button class="btn btn-sm" data-unequip>Take off</button>` : `<button class="btn btn-sm btn-primary" data-equip>Equip</button>`)
    : (open ? `<button class="btn btn-sm btn-sun" data-buy ${st.coins < it.price ? 'disabled' : ''}>${Sprites.icon('coin', 14)} Buy for ${it.price}</button>${st.coins < it.price ? `<span class="muted" style="font-size:13px">Need ${it.price - st.coins} more coins</span>` : ''}`
      : `<span class="muted">Pass the World ${it.world - 1} exam to unlock</span>`)}
          ${mode === 'shop' ? '<button class="btn btn-sm btn-ghost" data-preview>Preview on me</button>' : ''}</div>
      </div></div>`;
    const go = (fn) => async (e) => { UI.setBusy(e.currentTarget, true); try { await fn(); } catch (err) { UI.toast(err.message, 'error'); UI.setBusy(e.currentTarget, false); } };
    el.querySelector('[data-equip]')?.addEventListener('click', go(async () => apply(await api.put('/game/equip', { slot: it.slot, itemId: it.id }))));
    el.querySelector('[data-unequip]')?.addEventListener('click', go(async () => apply(await api.put('/game/equip', { slot: it.slot, itemId: null }))));
    el.querySelector('[data-buy]')?.addEventListener('click', go(async () => {
      apply(await api.post('/game/buy', { itemId: it.id }));
      UI.toast(`${it.name} added to your inventory`, 'reward', { icon: 'gem' });
      UI.cameo('penny', it.price >= 100 ? 'Big purchase! Hope it was in the budget.' : 'Nice pick. Equip it from your inventory.', 'happy', 2600);
    }));
    el.querySelector('[data-preview]')?.addEventListener('click', () => {
      const gear = equippedItems().filter((g) => g.slot !== it.slot).concat(it);
      document.querySelector('.stage-floor').innerHTML = Avatar.render(st.appearance, gear, { size: 260, title: 'Preview' });
      document.querySelector('.stage-floor').classList.add('previewing');
    });
  }

  // ---------- look editor ----------
  function drawLook(el) {
    el.innerHTML = `<div class="look-editor">${LOOK_FIELDS.map(([key, label]) => `
      <div class="look-row"><span class="px-label">${label}</span><div class="swatches">
        ${cat.appearance[key].map((v) => key === 'hairStyle'
    ? `<button class="style-btn ${st.appearance[key] === v ? 'on' : ''}" data-look="${key}" data-v="${v}">${v}</button>`
    : `<button class="swatch ${st.appearance[key] === v ? 'on' : ''}" style="background:${v}" data-look="${key}" data-v="${v}" aria-label="${label} ${v}"></button>`).join('')}
      </div></div>`).join('')}
      <button class="btn btn-sm" data-random>Randomize</button></div>`;
    const save = async (patch) => {
      st.appearance = { ...st.appearance, ...patch };
      document.querySelector('.stage-floor').innerHTML = Avatar.render(st.appearance, equippedItems(), { size: 260 });
      try { apply(await api.put('/game/appearance', patch)); } catch (err) { UI.toast(err.message, 'error'); }
    };
    el.querySelectorAll('[data-look]').forEach((b) => b.onclick = () => save({ [b.dataset.look]: b.dataset.v }));
    el.querySelector('[data-random]').onclick = () => {
      const pick = (a) => a[Math.floor(Math.random() * a.length)];
      save(Object.fromEntries(LOOK_FIELDS.map(([k]) => [k, pick(cat.appearance[k])])));
    };
  }

  return { render };
})();

window.Hideout = Hideout;
