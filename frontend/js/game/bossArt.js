/* ============================================================
   TradeIQ — bossArt.js
   Boss sprites. Six 20x20 body templates (authored as left halves
   and mirrored for symmetry), recolored per boss from bosses.json
   (look.body / look.accent / look.eye), with the same auto outline
   and shading as the player avatar.
     b body   a accent   e eye   w white   h dark   f face   k ink
   ============================================================ */

const BossArt = (() => {
  const T = {
    blob: [
      '..........', '.......aaa', '........aa', '......bbbb', '....bbbbbb', '...bbbbbbb', '..bbbbwwbb', '..bbbbweeb',
      '.bbbbbweeb', '.bbbbbbbbb', '.bbbbbbbkk', '.bbbbbbkaa', '.bbbbbbbkk', '..bbbbbbbb', '..bbbbbbbb', '...bbbbbbb',
      '....bbbbbb', '.....bb.bb', '.....b...b', '..........',
    ],
    suit: [
      '.......hhh', '.......hhh', '.......hhh', '......aaaa', '.....hhhhh', '.......fff', '......fwef', '......ffff',
      '.......fkk', '.......fff', '....bbbwaw', '...bbbbwaw', '..bbbbbwaw', '..bbbbbbww', '..fbbbbbbb', '..fbbbbbbb',
      '...bbbbbbb', '....hhh.hh', '....hhh.hh', '...hhhh.hh',
    ],
    specter: [
      '.......bbb', '......bbbb', '.....bbbbb', '....bbbhhh', '....bbhhhh', '...bbhheeh', '...bbhhhhh', '...bbhhhhh',
      '..bbbbhhhh', '..bbbbbbbb', '.abbbbbbbb', 'a.bbbbbbbb', 'a.bbbbbbbb', '..bbbbbbbb', '..bbbbbbbb', '..bbbbbbbb',
      '.bbbbbbbbb', '.bb.bb.bbb', '.b...b..bb', '..........',
    ],
    beast: [
      '.a........', 'aa........', 'aa...bbbbb', '.aabbbbbbb', '..bbbbbbbb', '..bbbweebb', '..bbbweebb', '..bbbbbbbb',
      '..bbbbffff', '...bbfkffk', '...bbffaff', '....bbffff', '...bbbbbbb', '..bbbbbbbb', '.bbbbbbbbb', '.bbbbbbbbb',
      '.bbbbbbbbb', '..bbbb..bb', '..hhhh..hh', '..........',
    ],
    bot: [
      '.........a', '.........h', '.....hhhhh', '....hbbbbb', '....hbhhhh', '....hbheee', '....hbhhhh', '....hbbbbb',
      '.....hhhhh', '......hhhh', '..hhbbbbbb', '.hbbbbaaab', '.hbhbbaaab', '.hbhbbbbbb', '.hh.bbbbbb', '....bbhhbb',
      '....bbh..b', '....bbh..b', '...hhhh..h', '..........',
    ],
    bird: [
      '..........', '.......bbb', '......bbbb', '......bweb', '......bbbb', '......bbaa', '.......bbb', '.......bbb',
      '...bbbbbbb', '.bbbbbbbbb', 'bbbbbbbbbb', 'bbhbbbbbbb', 'bhhbbbbbbb', 'hh.bbbbbbb', 'h...bbbbbb', '.....bbbbb',
      '......bbbb', '.....aa.aa', '....aa..aa', '..........',
    ],
    brute: [
      '..........', '......bbbb', '.....bbbbb', '.....bbwee', '.....bbbbb', '.....bbkkk', '..bbbbbbbb', '.bbbbbbbbb',
      'bbbbaabbbb', 'bbbbaabbbb', 'bb.bbbbbbb', 'bb.bbbbbbb', 'ff.bbbbbbb', 'ff.bbbbbbb', '...bbbbbbb', '...bbb..bb',
      '...bbb..bb', '...bbb..bb', '..hhhh.hhh', '..........',
    ],
  };

  // Keyword -> template, so new bosses get a sensible body automatically.
  const RULES = [
    [/reaper|ghost|specter|wraith|phantom|shade|theta|decay/i, 'specter'],
    [/market|banker|caller|broker|tycoon|mister|mr\.|suit|baron|promoter|guru/i, 'suit'],
    [/bot|machine|algo|robot|engine|drone|circuit/i, 'bot'],
    [/bull|bear|wolf|beast|hound|dragon|horn/i, 'beast'],
    [/bird|vulture|swan|raven|crow|hawk|eagle/i, 'bird'],
    [/golem|giant|titan|wall|colossus|brute|ogre|whale/i, 'brute'],
  ];
  // Hand-picked bodies for the launch roster.
  const BY_ID = {
    'boss-w1-inflato': 'blob', 'boss-w1-vex-vulture': 'bird', 'boss-w1-count-ponzi': 'suit',
    'boss-w2-fudge-bookcooker': 'suit', 'boss-w2-mr-market': 'suit', 'boss-w2-tilt-titan': 'brute',
    'boss-w3-theta-reaper': 'specter', 'boss-w3-magmus-vega': 'brute',
    'boss-w4-margin-caller': 'bot', 'boss-w4-black-swan': 'bird',
  };
  function templateFor(boss) {
    if (BY_ID[boss.id]) return BY_ID[boss.id];
    if (boss.look?.template && T[boss.look.template]) return boss.look.template;
    const text = `${boss.name} ${boss.title || ''} ${boss.look?.description || ''}`;
    for (const [re, t] of RULES) if (re.test(text)) return t;
    return 'blob';
  }

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, Math.round(v * (1 + amt))));
    return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, '0')).join('')}`;
  }

  function grid(boss) {
    const look = boss.look || {};
    const pal = {
      b: look.body || '#8b5cf6', a: look.accent || '#ffd23f', e: look.eye || '#ff5a4e',
      w: '#fffaf0', h: shade(look.body || '#8b5cf6', -0.55), f: shade(look.accent || '#ffd23f', 0.35), k: '#17140f',
    };
    const rows = T[templateFor(boss)];
    return rows.map((half) => {
      const full = half + half.split('').reverse().join('');
      return full.split('').map((ch) => (ch === '.' ? null : pal[ch] || null));
    });
  }

  function finish(g) {
    const H = g.length;
    const W = g[0].length;
    const out = g.map((r) => r.slice());
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const c = g[y][x];
      if (c && c !== '#17140f' && g[y][x + 1] !== c && g[y][x - 1] === c) out[y][x] = shade(c, -0.2);
    }
    const pad = out.map((r) => [null, ...r, null]);
    pad.unshift(Array(W + 2).fill(null));
    pad.push(Array(W + 2).fill(null));
    const res = pad.map((r) => r.slice());
    for (let y = 0; y < pad.length; y++) for (let x = 0; x < pad[0].length; x++) {
      if (pad[y][x]) continue;
      if (pad[y - 1]?.[x] || pad[y + 1]?.[x] || pad[y][x - 1] || pad[y][x + 1]) res[y][x] = '#17140f';
    }
    return res;
  }

  function svg(boss, size = 96) {
    const g = finish(grid(boss));
    let rects = '';
    g.forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        const c = row[x];
        if (!c) { x++; continue; }
        let run = 1;
        while (row[x + run] === c) run++;
        rects += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${c}"/>`;
        x += run;
      }
    });
    return `<svg class="px boss-svg" viewBox="0 0 ${g[0].length} ${g.length}" width="${size}" height="${size}" shape-rendering="crispEdges" role="img" aria-label="${boss.name}">${rects}</svg>`;
  }

  return { svg, templateFor, TEMPLATES: Object.keys(T) };
})();

window.BossArt = BossArt;
