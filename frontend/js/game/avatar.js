/* ============================================================
   TradeIQ — avatar.js
   Layered pixel-art character. Body, hair and every gear slot are
   drawn as shapes on a 24x32 grid, recolored with the item's palette
   (A = main, B = trim, C = accent), so any chestplate works with any
   set's boots. The ink outline and side shading are added
   automatically at the end, keeping every combination consistent.
   ============================================================ */

const Avatar = (() => {
  const W = 24;
  const H = 32;
  const INK = '#17140f';

  const grid = () => Array.from({ length: H }, () => Array(W).fill(null));
  const put = (g, x, y, c) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = c; };
  const rect = (g, x, y, w, h, c) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) put(g, i, j, c); };
  const clear = (g, x, y) => { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = null; };

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, Math.round(v * (1 + amt))));
    return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, '0')).join('')}`;
  }
  function hash(s) { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; }

  // ---------- body ----------
  function drawBackHair(g, a) {
    if (a.hairStyle === 'long') rect(g, 6, 5, 12, 11, a.hairColor);
  }
  function drawBody(g, a) {
    const skin = a.skin;
    // legs + shoes
    rect(g, 8, 22, 3, 6, a.pants);
    rect(g, 13, 22, 3, 6, a.pants);
    rect(g, 11, 22, 2, 2, a.pants);
    rect(g, 7, 28, 4, 2, a.shoes);
    rect(g, 13, 28, 4, 2, a.shoes);
    // torso + arms + hands
    rect(g, 7, 14, 10, 8, a.shirt);
    rect(g, 5, 14, 2, 6, a.shirt);
    rect(g, 17, 14, 2, 6, a.shirt);
    rect(g, 5, 20, 2, 2, skin);
    rect(g, 17, 20, 2, 2, skin);
    rect(g, 11, 13, 2, 1, skin);
    // head
    rect(g, 7, 3, 10, 10, skin);
    [[7, 3], [16, 3], [7, 12], [16, 12]].forEach(([x, y]) => clear(g, x, y));
    // face
    rect(g, 9, 8, 1, 2, a.eyeColor);
    rect(g, 14, 8, 1, 2, a.eyeColor);
    put(g, 8, 10, '#f3a3a0');
    put(g, 15, 10, '#f3a3a0');
    put(g, 11, 11, shade(skin, -0.35));
    put(g, 12, 11, shade(skin, -0.35));
  }
  function drawHair(g, a) {
    const c = a.hairColor;
    const top = () => { rect(g, 7, 2, 10, 4, c); clear(g, 7, 2); clear(g, 16, 2); rect(g, 7, 6, 1, 2, c); rect(g, 16, 6, 1, 1, c); put(g, 9, 6, c); put(g, 10, 6, c); };
    switch (a.hairStyle) {
      case 'none': return;
      case 'buzz': rect(g, 7, 3, 10, 2, c); clear(g, 7, 3); clear(g, 16, 3); return;
      case 'spiky': top(); [[8, 1], [10, 0], [10, 1], [12, 1], [13, 0], [13, 1], [15, 1]].forEach(([x, y]) => put(g, x, y, c)); return;
      case 'bun': top(); rect(g, 10, 0, 4, 2, c); return;
      case 'mohawk': rect(g, 11, 0, 2, 6, c); return;
      case 'curly':
        rect(g, 6, 2, 12, 4, c); rect(g, 6, 6, 2, 4, c); rect(g, 16, 6, 2, 4, c);
        for (let x = 6; x < 18; x += 2) put(g, x, 1, c);
        for (let y = 2; y < 10; y += 2) { put(g, 6, y, shade(c, -0.25)); put(g, 17, y + 1, shade(c, -0.25)); }
        return;
      case 'long': top(); rect(g, 6, 5, 2, 9, c); rect(g, 16, 5, 2, 9, c); return;
      default: top();
    }
  }

  // ---------- gear ----------
  const HELMETS = ['helm', 'cap', 'hood', 'crown'];
  const WEAPONS = ['sword', 'hammer', 'axe', 'staff', 'wand'];

  const GEAR = {
    helmet(g, p, shape) {
      if (shape === 'cap') { rect(g, 7, 2, 10, 4, p.A); rect(g, 4, 5, 9, 1, p.B); put(g, 11, 1, p.C); put(g, 12, 1, p.C); return; }
      if (shape === 'hood') { rect(g, 6, 1, 12, 5, p.A); clear(g, 6, 1); clear(g, 17, 1); rect(g, 6, 6, 2, 8, p.A); rect(g, 16, 6, 2, 8, p.A); rect(g, 8, 5, 8, 1, p.B); put(g, 11, 0, p.C); put(g, 12, 0, p.C); return; }
      if (shape === 'crown') { rect(g, 7, 2, 10, 2, p.A); [7, 10, 13, 16].forEach((x) => { put(g, x, 0, p.A); put(g, x, 1, p.A); }); put(g, 9, 2, p.C); put(g, 14, 2, p.C); rect(g, 7, 4, 10, 1, p.B); return; }
      rect(g, 6, 1, 12, 6, p.A); clear(g, 6, 1); clear(g, 17, 1);
      rect(g, 6, 6, 12, 1, p.B);
      rect(g, 6, 7, 1, 3, p.A); rect(g, 17, 7, 1, 3, p.A);
      rect(g, 11, 0, 2, 2, p.C);
    },
    chest(g, p) {
      rect(g, 7, 14, 10, 8, p.A);
      rect(g, 5, 16, 2, 4, p.A); rect(g, 17, 16, 2, 4, p.A);
      rect(g, 4, 14, 4, 2, p.B); rect(g, 16, 14, 4, 2, p.B);
      rect(g, 7, 21, 10, 1, p.B);
      put(g, 11, 21, p.C); put(g, 12, 21, p.C);
      rect(g, 11, 16, 2, 2, p.C);
    },
    legs(g, p) {
      rect(g, 8, 22, 3, 6, p.A); rect(g, 13, 22, 3, 6, p.A); rect(g, 11, 22, 2, 2, p.A);
      rect(g, 8, 25, 3, 1, p.B); rect(g, 13, 25, 3, 1, p.B);
    },
    boots(g, p) {
      rect(g, 7, 26, 4, 4, p.A); rect(g, 13, 26, 4, 4, p.A);
      rect(g, 7, 29, 4, 1, p.B); rect(g, 13, 29, 4, 1, p.B);
      put(g, 9, 27, p.C); put(g, 14, 27, p.C);
    },
    weapon(g, p, shape) {
      if (shape === 'staff') { rect(g, 19, 6, 2, 18, p.B); rect(g, 18, 2, 4, 4, p.A); put(g, 19, 3, p.C); put(g, 20, 4, p.C); return; }
      if (shape === 'hammer') { rect(g, 19, 10, 2, 14, p.B); rect(g, 17, 5, 6, 5, p.A); rect(g, 17, 7, 6, 1, p.C); return; }
      if (shape === 'axe') { rect(g, 19, 7, 2, 16, p.B); rect(g, 21, 7, 2, 6, p.A); put(g, 22, 6, p.A); put(g, 22, 13, p.A); put(g, 21, 9, p.C); return; }
      if (shape === 'wand') { rect(g, 19, 13, 1, 9, p.B); rect(g, 18, 11, 3, 2, p.A); put(g, 19, 10, p.C); return; }
      if (shape === 'bow') { for (let y = 6; y <= 20; y++) { const dx = Math.round(2.5 * Math.sin(((y - 6) / 14) * Math.PI)); put(g, 19 + dx, y, p.A); put(g, 20 + dx, y, p.A); } rect(g, 19, 6, 1, 15, p.C); put(g, 21, 13, p.B); return; }
      if (shape === 'crossbow') { rect(g, 19, 9, 2, 13, p.B); rect(g, 16, 10, 8, 2, p.A); put(g, 16, 12, p.A); put(g, 23, 12, p.A); rect(g, 19, 7, 2, 2, p.C); return; }
      if (shape === 'spear') { rect(g, 19, 6, 2, 18, p.B); rect(g, 19, 2, 2, 4, p.A); put(g, 19, 1, p.A); put(g, 18, 5, p.A); put(g, 21, 5, p.A); put(g, 19, 6, p.C); put(g, 20, 6, p.C); return; }
      if (shape === 'trident') { rect(g, 19, 7, 2, 17, p.B); rect(g, 17, 6, 6, 1, p.A); [17, 19, 20, 22].forEach((x) => rect(g, x, 2, 1, 4, p.A)); put(g, 19, 7, p.C); return; }
      if (shape === 'scythe') { rect(g, 19, 4, 2, 20, p.B); rect(g, 14, 3, 7, 2, p.A); put(g, 14, 5, p.A); put(g, 13, 5, p.A); put(g, 20, 5, p.C); return; }
      if (shape === 'dagger') { rect(g, 19, 13, 2, 6, p.A); put(g, 19, 12, p.A); rect(g, 18, 19, 4, 1, p.B); rect(g, 19, 20, 2, 2, p.B); put(g, 19, 22, p.C); rect(g, 2, 20, 1, 4, p.A); put(g, 2, 19, p.A); rect(g, 1, 24, 3, 1, p.B); return; }
      if (shape === 'calculator') { rect(g, 18, 12, 5, 8, p.A); rect(g, 19, 13, 3, 2, p.C); [[19, 16], [21, 16], [19, 18], [21, 18]].forEach(([x, y]) => put(g, x, y, p.B)); return; }
      rect(g, 19, 6, 2, 13, p.A); put(g, 19, 5, p.A); put(g, 20, 5, shade(p.A, 0.2)); rect(g, 19, 6, 1, 12, shade(p.A, 0.25));
      rect(g, 17, 18, 6, 1, p.B);
      rect(g, 19, 19, 2, 3, p.B);
      rect(g, 19, 22, 2, 1, p.C);
    },
    offhand(g, p, shape) {
      if (shape === 'lantern') { rect(g, 1, 15, 5, 1, p.B); rect(g, 1, 16, 5, 6, p.A); rect(g, 2, 17, 3, 4, p.C); rect(g, 1, 22, 5, 1, p.B); put(g, 3, 14, p.B); return; }
      if (shape === 'book') { rect(g, 1, 16, 5, 6, p.A); rect(g, 1, 16, 1, 6, p.B); rect(g, 3, 18, 2, 2, p.C); return; }
      rect(g, 0, 14, 6, 8, p.A); clear(g, 0, 21); clear(g, 5, 21);
      rect(g, 0, 14, 6, 1, p.B); rect(g, 1, 22, 4, 1, p.A);
      rect(g, 2, 16, 2, 4, p.C); rect(g, 1, 17, 4, 2, p.C);
    },
    trinket(g, p) {
      rect(g, 20, 1, 3, 3, p.A); put(g, 21, 2, p.C); put(g, 20, 1, p.B); put(g, 22, 3, p.B);
    },
  };

  // Pick a drawing from the item's name when the catalog doesn't say.
  const NAME_SHAPES = [
    [/crossbow/i, 'crossbow'], [/\bbow\b/i, 'bow'], [/dagger/i, 'dagger'], [/scythe/i, 'scythe'], [/trident/i, 'trident'],
    [/lance|spear|pike/i, 'spear'], [/maul|mallet|hammer/i, 'hammer'], [/\baxe\b/i, 'axe'], [/calculator/i, 'calculator'],
    [/staff|pencil|rod/i, 'staff'], [/wand/i, 'wand'], [/blade|sword|saber/i, 'sword'],
    [/tome|journal|book|ledger(?! lantern)/i, 'book'], [/lantern/i, 'lantern'],
  ];
  function gearShape(item) {
    if (item.shape) return item.shape;
    if (item.slot === 'weapon' || item.slot === 'offhand') {
      const hit = NAME_SHAPES.find(([re]) => re.test(item.name || ''));
      if (hit && (item.slot === 'weapon' ? !['book', 'lantern'].includes(hit[1]) : ['book', 'lantern'].includes(hit[1]))) return hit[1];
      if (item.slot === 'offhand') return 'shield';
    }
    if (item.slot === 'helmet') return HELMETS[hash(item.set || item.id) % HELMETS.length];
    if (item.slot === 'weapon') return WEAPONS[hash(item.id) % 4];
    return null;
  }
  const SLOT_FN = { helmet: 'helmet', chest: 'chest', legs: 'legs', boots: 'boots', weapon: 'weapon', offhand: 'offhand', trinket: 'trinket' };
  const DRAW_ORDER = ['boots', 'legs', 'chest', 'helmet', 'offhand', 'weapon', 'trinket'];

  // ---------- finishing: auto shading + outline ----------
  function finish(g) {
    const shaded = g.map((row) => row.slice());
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const c = g[y][x];
        if (!c) continue;
        const right = g[y][x + 1];
        const below = g[y + 1]?.[x];
        if (right !== c && g[y][x - 1] === c) shaded[y][x] = shade(c, -0.18);
        else if (below !== c && g[y - 1]?.[x] === c && y > 12) shaded[y][x] = shade(c, -0.1);
      }
    }
    const out = shaded.map((row) => row.slice());
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (g[y][x]) continue;
        if (g[y - 1]?.[x] || g[y + 1]?.[x] || g[y][x - 1] || g[y][x + 1]) out[y][x] = INK;
      }
    }
    return out;
  }

  function toSvg(g, { size = 160, title = 'Your avatar', viewBox } = {}) {
    let rects = '';
    for (let y = 0; y < H; y++) {
      let x = 0;
      while (x < W) {
        const c = g[y][x];
        if (!c) { x++; continue; }
        let run = 1;
        while (g[y][x + run] === c) run++;
        rects += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${c}"/>`;
        x += run;
      }
    }
    const vb = viewBox || `0 0 ${W} ${H}`;
    const [, , vw, vh] = vb.split(' ').map(Number);
    return `<svg class="px avatar-svg" viewBox="${vb}" width="${Math.round(size * (vw / vh))}" height="${size}" shape-rendering="crispEdges" role="img" aria-label="${title}">${rects}</svg>`;
  }

  /**
   * appearance: { skin, hairStyle, hairColor, eyeColor, shirt, pants, shoes }
   * gear: array of item objects { slot, palette:{A,B,C}, shape?, set?, id }
   */
  function render(appearance, gear = [], opts = {}) {
    const g = grid();
    const bySlot = Object.fromEntries(gear.filter(Boolean).map((i) => [i.slot, i]));
    const hood = bySlot.helmet && gearShape(bySlot.helmet) === 'hood';
    if (!bySlot.helmet || !hood) drawBackHair(g, appearance);
    drawBody(g, appearance);
    if (!bySlot.helmet || gearShape(bySlot.helmet) === 'crown' || gearShape(bySlot.helmet) === 'cap') drawHair(g, appearance);
    for (const slot of DRAW_ORDER) {
      const item = bySlot[slot];
      if (item) GEAR[SLOT_FN[slot]](g, item.palette, gearShape(item));
    }
    return toSvg(finish(g), opts);
  }

  /** A single item drawn on its own, cropped to its bounds, for inventory tiles. */
  function itemIcon(item, size = 48) {
    const g = grid();
    GEAR[SLOT_FN[item.slot]](g, item.palette, gearShape(item));
    let minX = W; let minY = H; let maxX = 0; let maxY = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (g[y][x]) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
    const pad = 1;
    const w = maxX - minX + 1 + pad * 2;
    const h = maxY - minY + 1 + pad * 2;
    const side = Math.max(w, h);
    const vx = minX - pad - (side - w) / 2;
    const vy = minY - pad - (side - h) / 2;
    return toSvg(finish(g), { size, title: item.name, viewBox: `${vx} ${vy} ${side} ${side}` });
  }

  return { render, itemIcon };
})();

window.Avatar = Avatar;
