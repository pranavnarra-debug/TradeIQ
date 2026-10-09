/* ============================================================
   TradeIQ — sprites.js
   Hand-drawn pixel art, rendered as crisp SVG. Each sprite is a grid
   of palette characters; '.' is transparent. Horizontal runs of the
   same color are merged into one <rect> to keep the markup small.
   ============================================================ */

const Sprites = (() => {
  const PAL = {
    k: '#17140f', // ink
    w: '#fffaf0', // paper white
    W: '#e8dcc4', // bone shadow
    g: '#1fbf75', // mint
    G: '#12985a', // mint dark
    p: '#ffb3a7', // snout pink
    P: '#ef8f80', // pink dark
    q: '#ff9fb2', // piggy pink
    Q: '#e46f8c', // piggy dark
    b: '#9a6440', // bear brown
    B: '#6e4329', // bear dark
    l: '#e2b48a', // bear light
    u: '#4f7cff', // owl blue
    U: '#3355c8', // owl dark
    y: '#ffd23f', // sun yellow
    Y: '#e0a800', // yellow dark
    o: '#ff7a45', // orange
    O: '#d4521f', // orange dark
    r: '#ff5a4e', // red
    R: '#c7362c', // red dark
    s: '#c9d2dc', // steel
    S: '#8a96a3', // steel dark
    c: '#6fe3ff', // cyan screen
    v: '#8b5cf6', // violet
    V: '#6a3fd1', // violet dark
    n: '#7a705f', // muted brown-grey
    t: '#3e9e5a', // leaf
    h: '#c98a3a', // wheat / gold dark
  };

  // ---------- Characters (16x16) ----------
  const CHARS = {
    chip: [ // the bull
      '................',
      '.kk..........kk.',
      'kWwk........kwWk',
      'kWwwk......kwwWk',
      '.kWwwkkkkkkwwWk.',
      '..kkggggggggkk..',
      '.kggggggggggggk.',
      'kgggkkggggkkgggk',
      'kgggwkggggwkgggk',
      'kGggggggggggggGk',
      '.kGgppppppppgGk.',
      '.kgpkppppppkpgk.',
      '..kppppPPppppk..',
      '...kpppppppppk..',
      '....kkkkkkkkk...',
      '................',
    ],
    grizz: [ // the bear
      '................',
      '.kkk........kkk.',
      'kbBbk......kbBbk',
      'kbBbkkkkkkkkbBbk',
      '.kbbbbbbbbbbbbk.',
      '.kbbbbbbbbbbbbk.',
      'kbbbkkbbbbkkbbbk',
      'kbbbwkbbbbwkbbbk',
      'kbbbbbbbbbbbbbbk',
      'kbbbbllllllbbbbk',
      '.kbbllkkkkllbbk.',
      '.kbbllkkkkllbbk.',
      '..kbllllllllbk..',
      '...kBblkkllbBk..',
      '....kkkkkkkkk...',
      '................',
    ],
    hoot: [ // the owl
      '................',
      '..kk........kk..',
      '..kuk......kuk..',
      '..kuukkkkkkuuk..',
      '.kuuuuuuuuuuuuk.',
      'kuukkkkuukkkkuuk',
      'kukwwwwkkwwwwkuk',
      'kukwkkwkkwkkwkuk',
      'kukwkkwkkwkkwkuk',
      'kuukwwkyykwwkuuk',
      '.kuukkkyykkkuuk.',
      '.kUuuuukkuuuuUk.',
      '.kUuwuwuwuwuuUk.',
      '..kUuuuuuuuuUk..',
      '...kkykkkkykk...',
      '................',
    ],
    penny: [ // the piggy bank
      '................',
      '......kkkk......',
      '..kk..kQQk..kk..',
      '.kqqk.kkkk.kqqk.',
      '.kqqqkkkkkkqqqk.',
      '..kqqqqqqqqqqk..',
      '.kqqqkqqqqkqqqk.',
      'kqqqqkqqqqkqqqqk',
      'kqqqqqqqqqqqqqqk',
      'kqqqqkkkkkkqqqqk',
      'kqqqkQQQQQQkqqqk',
      'kqqqkQkQQkQkqqqk',
      '.kqqqkkkkkkqqqk.',
      '..kQqqqqqqqqqQk.',
      '..kkk.kkkk.kkk..',
      '................',
    ],
    bolt: [ // the robot
      '.......kk.......',
      '.......ky.......',
      '.......kk.......',
      '...kkkkkkkkkk...',
      '..ksssssssssssk.',
      '.kssSSSSSSSSSssk',
      '.ksSkkkkkkkkkSsk',
      '.ksSkccckkccckSk',
      '.ksSkcwckkcwckSk',
      '.ksSkkkkkkkkkSsk',
      '.kssSSSSSSSSSssk',
      'kkssskggggksssk.',
      'kSsssskkkksssskk',
      '.kSsssssssssSk..',
      '..kkkkkkkkkkkk..',
      '................',
    ],
  };

  // ---------- Icons (12x12) ----------
  const ICONS = {
    coin: [
      '....kkkk....', '..kkyyyykk..', '.kyyYYYYyyk.', '.kyYyyyyYyk.', 'kyyYykkyYyyk', 'kyyYkyyyYyyk',
      'kyyYykkyYyyk', 'kyyYyyykYyyk', '.kyYkkkyYyk.', '.kyyYYYYyyk.', '..kkyyyykk..', '....kkkk....',
    ],
    bank: [
      '.....kk.....', '...kkyykk...', '.kkyyyyyykk.', 'kkkkkkkkkkkk', '.kwk.kwk.kwk', '.kwk.kwk.kwk',
      '.kwk.kwk.kwk', '.kwk.kwk.kwk', '.kwk.kwk.kwk', 'kkkkkkkkkkkk', 'kWWWWWWWWWWk', 'kkkkkkkkkkkk',
    ],
    piggy: [
      '............', '...kk..kkk..', '..kqqkkkQk..', '.kqqqqqqqqk.', 'kqqkqqqqqqqk', 'kqqqqqqqqqqk',
      'kQQqqqqqqqqk', 'kQkqqqqqqqk.', '.kqqqqqqqqk.', '..kqkkkkqk..', '..kk....kk..', '............',
    ],
    chart: [
      'k...........', 'k.........gg', 'k........gk.', 'k.......gk..', 'k...g..gk...', 'k..gkg.gk...',
      'k.gk.kgk....', 'kgk...k.....', 'kk..........', 'k...........', 'kkkkkkkkkkkk', '............',
    ],
    candle: [
      '..k.....k...', '..k.....k...', '.kgk...krk..', '.kgk...krk..', '.kgk...krk..', '.kgk...krk..',
      '.kgk....k...', '.kgk....k...', '..k.....k...', '..k.........', '..k.........', '............',
    ],
    bull: [
      'kk........kk', 'kWk......kWk', '.kWkkkkkkWk.', '..kggggggk..', '.kgkggggkgk.', '.kggggggggk.',
      '..kgppppgk..', '..kpkppkpk..', '..kppppppk..', '...kkkkkk...', '............', '............',
    ],
    bear: [
      '.kk......kk.', 'kbBk....kBbk', 'kbbkkkkkkbbk', '.kbbbbbbbbk.', 'kbkkbbbbkkbk', 'kbbbbbbbbbbk',
      'kbbbllllbbbk', '.kbllkkllbk.', '.kbllllllbk.', '..kkkkkkkk..', '............', '............',
    ],
    shield: [
      'kkkkkkkkkkkk', 'kuuuuuuuuuuk', 'kuuuuuuuuuuk', 'kuuuuwwuuuuk', 'kuuuwwwwuuuk', 'kuuuuwwuuuuk',
      '.kuuuwwuuuk.', '.kuuuuuuuuk.', '..kuuuuuuk..', '...kuuuuk...', '....kuuk....', '.....kk.....',
    ],
    clock: [
      '...kkkkkk...', '..kwwwwwwk..', '.kwwwkwwwwk.', 'kwwwwkwwwwwk', 'kwwwwkwwwwwk', 'kwwwwkkkkwwk',
      'kwwwwwwwwwwk', 'kwwwwwwwwwwk', '.kwwwwwwwwk.', '..kwwwwwwk..', '...kkkkkk...', '............',
    ],
    rocket: [
      '.......kkk..', '......kwwwk.', '.....kwwcwk.', '....kwwcwk..', '...kwwwwk...', '.kkkwwwk....',
      'krrkwwk.....', '.kkwwkrk....', '.kokkkrk....', 'koyok.k.....', '.kok........', '..k.........',
    ],
    scale: [
      '.....kk.....', 'kkkkkkkkkkkk', '.k...kk...k.', 'k.k..kk..k.k', 'k.k..kk..k.k', 'kkkk.kk.kkkk',
      'yyyy.kk.yyyy', '.....kk.....', '.....kk.....', '...kkkkkk...', '..kkkkkkkk..', '............',
    ],
    globe: [
      '...kkkkkk...', '..kuuggguk..', '.kugggguuuk.', 'kuuggguuuuuk', 'kuuuguuuggk.', 'kuuuuuuggggk',
      'kuguuuuugguk', 'kugguuuuuuuk', '.kgguuuuguk.', '..kuuuuguk..', '...kkkkkk...', '............',
    ],
    card: [
      '............', 'kkkkkkkkkkkk', 'kvvvvvvvvvvk', 'kkkkkkkkkkkk', 'kvvvvvvvvvvk', 'kvyyvvvvvvvk',
      'kvyyvvvvvvvk', 'kvvvvvvwwwvk', 'kvvvvvvvvvvk', 'kkkkkkkkkkkk', '............', '............',
    ],
    house: [
      '.....kk.....', '....krrk....', '...krrrrk.kk', '..krrrrrrkkk', '.krrrrrrrrk.', 'kkkkkkkkkkkk',
      '.kwwwwwwwwk.', '.kwkkwwkkwk.', '.kwkkwwkkwk.', '.kwwwwkkwwk.', '.kwwwwkkwwk.', '.kkkkkkkkkk.',
    ],
    briefcase: [
      '............', '....kkkk....', '...k....k...', 'kkkkkkkkkkkk', 'kbbbbbbbbbbk', 'kbbbbbbbbbbk',
      'kkkkkyykkkkk', 'kbbbbyybbbbk', 'kbbbbbbbbbbk', 'kbbbbbbbbbbk', 'kkkkkkkkkkkk', '............',
    ],
    lightbulb: [
      '...kkkkkk...', '..kyyyyyyk..', '.kyyywyyyyk.', '.kyywyyyyyk.', '.kyyyyyyyyk.', '.kyyyyyyyyk.',
      '..kyyyyyyk..', '...kyyyyk...', '...kkkkkk...', '...kssssk...', '...kkkkkk...', '....kSSk....',
    ],
    target: [
      '...kkkkkk...', '..krrrrrrk..', '.krrwwwwrrk.', 'krrwwwwwwrrk', 'krwwrrrrwwrk', 'krwwrkkrwwrk',
      'krwwrkkrwwrk', 'krwwrrrrwwrk', 'krrwwwwwwrrk', '.krrwwwwrrk.', '..krrrrrrk..', '...kkkkkk...',
    ],
    trophy: [
      'kkkkkkkkkkkk', 'kykyyyyyykyk', 'kykyyyyyykyk', '.kkyyyyyykk.', '..kyyyyyyk..', '...kyyyyk...', '....kyyk....', '.....kk.....', '....kyyk....', '...kkkkkk...', '..kYYYYYYk..', '..kkkkkkkk..'
    ],
    fire: [
      '.....k......', '....kok.....', '....kook....', '...koook.k..', '..koooookok.', '..kooyooook.',
      '.kooyyyoook.', '.kooyyyyook.', '.kooyyyyook.', '..kooyyook..', '...koooook..', '....kkkkk...',
    ],
    gem: [
      '..kkkkkkkk..', '.kccwcccwck.', 'kcwccwcccwck', 'kkkkkkkkkkkk', '.kcccccccck.', '..kcccccck..', '...kcccck...', '....kcck....', '.....kk.....', '............', '............', '............'
    ],
    calculator: [
      'kkkkkkkkkkkk', 'kssssssssssk', 'kskkkkkkkksk', 'kskccccccksk', 'kskkkkkkkksk', 'kssssssssssk', 'kskksksksksk', 'kssssssssssk', 'kskksksksksk', 'kssssssssssk', 'kskkskskkook', 'kkkkkkkkkkkk'
    ],
    book: [
      'kkkkkkkkkkk.', 'kuuuuuuuuuk.', 'kuwwwwwwwuk.', 'kuuuuuuuuuk.', 'kuwwwwwuuuk.', 'kuuuuuuuuuk.',
      'kuuuuuuuuuk.', 'kuuuuuuuuuk.', 'kuuuuuuuuuk.', 'kkkkkkkkkkkk', 'kwwwwwwwwwwk', 'kkkkkkkkkkkk',
    ],
    lock: [
      '...kkkkkk...', '..kk....kk..', '..k......k..', '..k......k..', 'kkkkkkkkkkkk', 'kyyyyyyyyyyk',
      'kyyyykkyyyyk', 'kyyyykkyyyyk', 'kyyyyykyyyyk', 'kyyyyyyyyyyk', 'kYYYYYYYYYYk', 'kkkkkkkkkkkk',
    ],
    leaf: [
      '.......kkkkk', '.....kkggggk', '....kgggggGk', '...kggggggk.', '..kgggGggGk.', '..kggGggggk.',
      '.kggGggggk..', '.kgGgggkk...', '.kGkkkk.....', 'kk..........', 'k...........', '............',
    ],
    oil: [
      '....kkkk....', '...knnnnk...', '..knnnnnnk..', '..knnnnnnk..', '.knnnnnnnnk.', '.knnwwnnnnk.', 'knnnwnnnnnnk', 'knnnnnnnnnnk', 'knnnnnnnnnnk', '.knnnnnnnnk.', '..kkkkkkkk..', '............'
    ],
    wheat: [
      '.....kk.....', '....khhk....', '...kkyyk.kk.', '..khhkkkkyyk', '..kyykyykhhk', '...kkkhhkkk.',
      '..khhkyyk...', '..kyyykkk...', '...kkkk.....', '.....kk.....', '.....kk.....', '.....kk.....',
    ],
    gold: [
      '............', '............', '...kkkkkk...', '..kyywyyyk..', '.kyyyyyyyyk.', 'kkkkkkkkkkkk',
      'kyywyykyyyyk', 'kyyyyykyyyyk', 'kYYYYYkYYYYk', 'kkkkkkkkkkkk', '............', '............',
    ],
    bolt: [
      '......kkkk..', '.....kyyk...', '....kyyk....', '...kyyk.....', '..kyyyykkk..', '.kkkkyyyyk..',
      '.....kyyk...', '....kyyk....', '...kyyk.....', '..kyk.......', '..kk........', '............',
    ],
    warning: [
      '.....kk.....', '....kyyk....', '....kyyk....', '...kyyyyk...', '...kykkyk...', '..kyykkyyk..',
      '..kyykkyyk..', '.kyyykkyyyk.', '.kyyyyyyyyk.', 'kyyyykkyyyyk', 'kyyyyyyyyyyk', 'kkkkkkkkkkkk',
    ],
    receipt: [
      'kkkkkkkkkk..', 'kwwwwwwwwk..', 'kwkkkkkkwk..', 'kwwwwwwwwk..', 'kwkkkwkkwk..', 'kwwwwwwwwk..',
      'kwkkkkwkwk..', 'kwwwwwwwwk..', 'kwkkkkkkwk..', 'kwwwwwwwwk..', 'kwkwkwkwkk..', 'kk.k.k.k....',
    ],
    // UI icons
    star: [
      '.....kk.....', '....kyyk....', '....kyyk....', 'kkkkkyykkkkk', 'kyyyyyyyyyyk', '.kyyyyyyyyk.',
      '..kyyyyyyk..', '..kyyyyyyk..', '.kyyykkyyyk.', '.kyykk.kyyk.', 'kyykk...kkyk', 'kkk......kkk',
    ],
    heart: [
      '............', '.kkk...kkk..', 'krrrk.krrrk.', 'krwrrkrrrrrk', 'krrrrrrrrrrk', 'krrrrrrrrrrk',
      '.krrrrrrrrk.', '..krrrrrrk..', '...krrrrk...', '....krrk....', '.....kk.....', '............',
    ],
    map: [
      'kkkk.kkkk...', 'kgggkkyyykkk', 'kggkgkyykggk', 'kgkggkykgggk', 'kggggkyykggk', 'kgrgkyyykggk',
      'kggkgkyykgrk', 'kgkggkykgggk', 'kggggkyykggk', 'kkkkkkkkkkkk', '............', '............',
    ],
    person: [
      '....kkkk....', '...kllllk...', '...kllllk...', '...kllllk...', '....kkkk....', '..kkggggkk..',
      '.kggggggggk.', '.kggggggggk.', '.kggggggggk.', '.kkkkkkkkkk.', '............', '............',
    ],
    gear: [
      '.....kk.....', '..k.kssk.k..', '.kskssssksk.', '..kssssssk..', '.kssskksssk.', 'kssskwwkssk.',
      'kssskwwksssk', '.kssskksssk.', '..kssssssk..', '.kskssssksk.', '..k.kssk.k..', '.....kk.....',
    ],
    door: [
      'kkkkkkkk....', 'kbbbbbbk....', 'kbbbbbbk..k.', 'kbbbbbbk..kk', 'kbbbbybkkkkk', 'kbbbbbbk..kk',
      'kbbbbbbk..k.', 'kbbbbbbk....', 'kbbbbbbk....', 'kkkkkkkk....', '............', '............',
    ],
    magnifier: [
      '..kkkk......', '.kccccwk....', 'kccccccwk...', 'kccccccck...', 'kccccccck...', '.kcccccck...',
      '..kkkkkkk...', '.......kSk..', '........kSk.', '.........kSk', '..........kk', '............',
    ],
    snowflake: [
      '.....kk.....', '..k..kk..k..', '...kkcckk...', '...kcwwck...', 'kkkcwwwwckkk', 'kkkcwwwwckkk',
      '...kcwwck...', '...kkcckk...', '..k..kk..k..', '.....kk.....', '............', '............',
    ],
    check: [
      '............', '..........kk', '.........kgk', '........kgk.', 'kk.....kgk..', 'kgk...kgk...',
      '.kgk.kgk....', '..kgkgk.....', '...kgk......', '....k.......', '............', '............',
    ],
    cross: [
      'kk........kk', 'krk......krk', '.krk....krk.', '..krk..krk..', '...krkkrk...', '....krrk....',
      '....krrk....', '...krkkrk...', '..krk..krk..', '.krk....krk.', 'krk......krk', 'kk........kk',
    ],
  };

  function renderGrid(grid, { size = 64, title = '', className = '' } = {}) {
    const h = grid.length;
    const w = Math.max(...grid.map((r) => r.length));
    let rects = '';
    for (let y = 0; y < h; y++) {
      const row = grid[y];
      let x = 0;
      while (x < row.length) {
        const ch = row[x];
        if (ch === '.' || ch === ' ' || !PAL[ch]) { x++; continue; }
        let run = 1;
        while (row[x + run] === ch) run++;
        rects += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${PAL[ch]}"/>`;
        x += run;
      }
    }
    const label = title ? `role="img" aria-label="${title}"` : 'aria-hidden="true"';
    return `<svg class="px ${className}" viewBox="0 0 ${w} ${h}" width="${size}" height="${size}" shape-rendering="crispEdges" ${label}>${rects}</svg>`;
  }

  const NAMES = { chip: 'Chip the bull', grizz: 'Grizz the bear', hoot: 'Hoot the owl', penny: 'Penny the piggy bank', bolt: 'Bolt the robot' };
  const ROLES = {
    chip: 'Your hype-bull. Loves a good streak.',
    grizz: 'Risk checker. Has seen some things.',
    hoot: 'Fact nerd. Will cite sources.',
    penny: 'Saving and banking expert.',
    bolt: 'Rules, systems, automation.',
  };

  function character(name, size = 64, className = '') {
    return renderGrid(CHARS[name] || CHARS.chip, { size, title: NAMES[name] || name, className: `sprite sprite-${name} ${className}` });
  }

  function icon(name, size = 24, className = '') {
    return renderGrid(ICONS[name] || ICONS.coin, { size, className: `icon icon-${name} ${className}` });
  }

  return { character, icon, NAMES, ROLES, CHARS, ICONS, list: Object.keys(CHARS) };
})();

window.Sprites = Sprites;
