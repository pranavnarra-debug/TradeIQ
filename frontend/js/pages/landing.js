/* ============================================================
   TradeIQ — landing.js   Public home page.
   ============================================================ */

const Catalog = (() => {
  let cache = null;
  async function get() {
    if (!cache) cache = api.get('/lessons/catalog').catch((e) => { cache = null; throw e; });
    return cache;
  }
  function findLesson(cat, id) {
    for (const u of cat.units) for (const c of u.chapters) for (const l of c.lessons) if (l.id === id) return { unit: u, chapter: c, lesson: l };
    return null;
  }
  return { get, findLesson };
})();
window.Catalog = Catalog;

const Landing = (() => {
  const QUOTES = {
    chip: 'Five minutes a day. That is the whole trick.',
    grizz: 'If it sounds too good to be true, I already hate it.',
    hoot: 'Fun fact: the NYSE started under a buttonwood tree in 1792.',
    penny: 'An emergency fund is boring until the day it is beautiful.',
    bolt: 'Rules beat moods. Every time.',
  };
  const TAPE = [
    ['Compound interest', 1], ['Bid / ask spread', 1], ['Theta decay', 0], ['Index funds', 1], ['Contango', 0],
    ['Emergency fund', 1], ['Margin call', 0], ['Dividends', 1], ['FOMO', 0], ['Position sizing', 1],
    ['IV crush', 0], ['Dollar-cost averaging', 1], ['Pump and dump', 0], ['Market hours', 1],
  ];

  function tapeHtml() {
    const items = TAPE.map(([t, up]) => `<span class="tape-item">${up ? '<span class="tri-up">&#9650;</span>' : '<span class="tri-down">&#9660;</span>'}${t}</span>`).join('');
    return `<div class="tape" aria-hidden="true"><div class="tape-track">${items}${items}</div></div>`;
  }

  function worldCard(u, i) {
    const chapters = u.chapters.map((c, ci) => `<li><span class="n">CH${ci + 1}</span>${escapeHtml(c.title)}<span class="cnt">${c.lessons.length} lessons</span></li>`).join('');
    const hours = Math.round(u.minutes / 60);
    return `<article class="card world ${i === 0 ? 'big' : ''}" style="--c:${u.color}">
      ${i === 0 ? '<span class="world-badge">Start here</span>' : ''}
      <div class="world-head">${Sprites.character(u.sprite, 64)}
        <div><span class="px-label">World ${u.number} · ${escapeHtml(u.world)}</span><h3>${escapeHtml(u.title)}</h3></div></div>
      <div class="world-body">
        <p>${escapeHtml(u.subtitle)}</p>
        <div class="world-stats"><span class="chip-tag">${u.lessonCount} lessons</span><span class="chip-tag">~${hours} hrs</span><span class="chip-tag">Final boss exam</span></div>
        <ul class="world-chapters">${chapters}</ul>
        <button class="btn btn-sm" data-peek="${u.id}">Peek at the lessons ${Sprites.icon('magnifier', 16)}</button>
      </div>
    </article>`;
  }

  function peek(cat, unitId) {
    const u = cat.units.find((x) => x.id === unitId);
    const m = UI.modal(`<span class="eyebrow">World ${u.number} · ${escapeHtml(u.world)}</span><h2>${escapeHtml(u.title)}</h2>
      ${u.chapters.map((c) => `<h4 style="margin-top:18px">${escapeHtml(c.title)}</h4>
        <div class="peek-list">${c.lessons.map((l) => `
          <button class="peek-row" data-lesson="${l.id}">${Sprites.icon(l.icon, 26)}
            <span><b>${escapeHtml(l.title)}</b><small>${escapeHtml(l.summary)}</small></span>
            <span class="px-label muted">${l.minutes} min</span></button>`).join('')}</div>`).join('')}`, { wide: true });
    m.el.querySelectorAll('[data-lesson]').forEach((b) => b.addEventListener('click', () => {
      m.close();
      openLesson(b.dataset.lesson);
    }));
  }

  function openLesson(id) {
    if (Session.isLoggedIn()) App.go(`/lesson/${id}`);
    else AuthModal.open('signup', { next: `/lesson/${id}`, reason: 'lesson' });
  }

  async function render() {
    const view = document.getElementById('view');
    view.innerHTML = `
      <section class="hero"><div class="wrap hero-grid">
        <div>
          <span class="chip-tag" style="margin-bottom:18px">${Sprites.icon('fire', 14)} Free · No real money · 13+</span>
          <h1>Learn money like it's a <span class="stamp">game.</span><br><span class="scribble">Then go play.</span></h1>
          <p class="lede">Bite-sized lessons on banking, investing, stocks, options and futures, taught by a crew of pixel critters.
            Earn XP, keep your streak, then practice on a <b>$50,000 simulated trading desk</b>.</p>
          <div class="hero-ctas">
            <button class="btn btn-primary btn-lg" data-auth="signup">Start learning free</button>
            <a class="btn btn-lg" href="/#worlds">See the lessons</a>
          </div>
          <div class="hero-proof" id="hero-proof"></div>
        </div>
        <div style="position:relative">
          <div class="floaty f1">${Sprites.icon('coin', 52)}</div>
          <div class="floaty f2">${Sprites.icon('star', 44)}</div>
          <div class="floaty f3">${Sprites.icon('gem', 40)}</div>
          <div class="arcade">
            <div class="arcade-top"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="px-label">Practice mode</span></div>
            <div class="arcade-screen">
              <canvas id="arcade-canvas" aria-label="Animated demo chart" role="img"></canvas>
              <div class="arcade-hud"><span>XP <span class="g" id="arc-xp">0</span></span><span>Streak <span class="g" id="arc-streak">7</span></span><span>LVL <span class="g" id="arc-lvl">3</span></span></div>
              <div class="arcade-rider" id="arc-rider">${Sprites.character('chip', 46)}</div>
            </div>
            <div class="arcade-bottom">
              <button class="btn btn-primary" id="arc-buy">Buy (fake $)</button>
              <button class="btn btn-danger" id="arc-sell">Sell (fake $)</button>
            </div>
          </div>
        </div>
      </div></section>

      ${tapeHtml()}

      <section class="section" id="crew"><div class="wrap">
        <div class="section-head"><span class="eyebrow">Your teachers</span><h2>Meet the crew</h2>
          <p>Every lesson is narrated by five characters who show up with tips, warnings and the occasional bad joke.</p></div>
        <div class="crew">${Sprites.list.map((n) => `<div class="card crew-card">${Sprites.character(n, 96)}
          <b>${Sprites.NAMES[n].split(' ')[0]}</b><small>${Sprites.ROLES[n]}</small><div class="quote">"${QUOTES[n]}"</div></div>`).join('')}</div>
      </div></section>

      <section class="section" id="worlds"><div class="wrap">
        <div class="section-head"><span class="eyebrow">The course map</span><h2>Four worlds. One boss at the end of each.</h2>
          <p id="worlds-sub">Start with how money actually moves, finish knowing how futures traders hedge. Lessons take 10 to 15 minutes.</p></div>
        <div class="worlds" id="worlds-grid"><div class="empty-state"><span class="spinner"></span></div></div>
      </div></section>

      <section class="section" id="how"><div class="wrap">
        <div class="section-head"><span class="eyebrow">How it works</span><h2>Learn it, try it, level up.</h2></div>
        <div class="steps3">
          <div class="card step3"><div class="illus"><div class="mini-lesson">
              <div class="opt">Cash in a drawer</div><div class="opt right">Index fund ${Sprites.icon('check', 12)}</div><div class="opt">Lottery tickets</div></div></div>
            <h3>Learn in small bites</h3><p>Short screens, quick questions, calculators you can poke at, and a quiz at the end. No 40-minute videos.</p></div>
          <div class="card step3"><div class="illus">${Sprites.icon('candle', 48)}${Sprites.icon('chart', 48)}${Sprites.character('bolt', 52)}</div>
            <h3>Practice with fake money</h3><p>Place simulated trades on real market data, or watch Bolt the bot run a strategy by its rules. Mistakes cost $0.</p></div>
          <div class="card step3"><div class="illus"><div class="mini-xp">${Sprites.icon('star', 34)}+50 XP</div>${Sprites.icon('fire', 36)}</div>
            <h3>Level up</h3><p>XP, daily streaks, coins, badges, a weekly leaderboard and a final boss exam for every world.</p></div>
        </div>
      </div></section>

      <section class="section"><div class="wrap split">
        <div class="card desk-mock">
          <div class="row"><span class="px-label">Simulated portfolio</span><span class="chip-tag">${Sprites.icon('lock', 12)} Fake money</span></div>
          <div class="big">$50,000.00</div>
          <div class="bar-row">${[38, 52, 44, 61, 57, 70, 66, 82, 74, 90].map((h, i) => `<span style="height:${h}%;background:${i % 3 === 2 ? 'var(--tomato)' : 'var(--mint)'}"></span>`).join('')}</div>
          <div class="row"><button class="btn btn-sm btn-primary" tabindex="-1">Buy</button><button class="btn btn-sm btn-danger" tabindex="-1">Sell</button><span class="spacer"></span><span class="mono muted">9 strategies</span></div>
        </div>
        <div>
          <span class="eyebrow">The trading sim</span>
          <h2>Make your mistakes where they're free.</h2>
          <ul class="checklist">
            <li>${Sprites.icon('check', 20)} A $50k paper trading desk with live strategy signals</li>
            <li>${Sprites.icon('check', 20)} Bolt the bot: watch 9 rule-based strategies trade on their own</li>
            <li>${Sprites.icon('check', 20)} Stock research with technicals and a CANSLIM checklist</li>
            <li>${Sprites.icon('check', 20)} Badges for good habits, like cutting a loss early</li>
          </ul>
          <button class="btn btn-sun" data-auth="signup">Open my practice desk</button>
        </div>
      </div></section>

      <section class="section" id="faq"><div class="wrap">
        <div class="section-head"><span class="eyebrow">Questions</span><h2>FAQ</h2></div>
        <div class="faq">
          <details><summary>Is it actually free?</summary><div>Yes. Lessons, the trading sim and the bot are free to use.</div></details>
          <details><summary>Do I need an email to sign up?</summary><div>No. A username and password is enough. You'll get a one-time recovery code instead. Adding an email is optional and only lets you reset your password and get streak reminders if you want them.</div></details>
          <details><summary>Is any real money involved?</summary><div>Never. Every trade on TradeIQ is simulated. We don't connect to brokerages, bank accounts or crypto wallets.</div></details>
          <details><summary>How old do I need to be?</summary><div>13 or older. If you're under 18, get a parent or guardian's OK first.</div></details>
          <details><summary>Is this financial advice?</summary><div>No. TradeIQ teaches how things work. It doesn't tell you what to buy. For real decisions about your money, talk to a licensed professional.</div></details>
          <details><summary>How long does the whole course take?</summary><div id="faq-length">At two lessons a day, a couple of months. Go faster or slower, it's your call.</div></details>
        </div>
      </div></section>

      <section class="wrap"><div class="cta-band">
        <div class="sprites-row">${['chip', 'penny', 'hoot'].map((n) => Sprites.character(n, 64)).join('')}</div>
        <div><h2>Your first lesson takes 10 minutes.</h2><p>Make an account with just a username. Chip is waiting.</p></div>
        <button class="btn btn-sun btn-lg" data-auth="signup">Let's go</button>
      </div></section>`;

    view.querySelectorAll('[data-auth]').forEach((b) => b.addEventListener('click', () => AuthModal.open(b.dataset.auth)));
    const stopArcade = Arcade.start();

    try {
      const cat = await Catalog.get();
      const grid = document.getElementById('worlds-grid');
      if (!grid) return stopArcade;
      grid.innerHTML = cat.units.filter((u) => u.lessonCount).map(worldCard).join('');
      grid.querySelectorAll('[data-peek]').forEach((b) => b.addEventListener('click', () => peek(cat, b.dataset.peek)));
      const hours = Math.round(cat.units.reduce((n, u) => n + u.minutes, 0) / 60);
      document.getElementById('hero-proof').innerHTML = `
        <span class="chip-tag">${Sprites.icon('book', 14)} ${cat.totalLessons} lessons</span>
        <span class="chip-tag">${Sprites.icon('clock', 14)} ${hours}+ hours</span>
        <span class="chip-tag">${Sprites.icon('trophy', 14)} ${cat.units.length} boss exams</span>`;
      document.getElementById('faq-length').textContent = `There are ${cat.totalLessons} lessons (about ${hours} hours of material). The suggested schedule is ${cat.totalDays} days at around two lessons a day. Go faster or slower, it's your call.`;
    } catch {
      document.getElementById('worlds-grid').innerHTML = '<div class="empty-state">Couldn\'t load the course map. Refresh to try again.</div>';
    }
    return stopArcade;
  }

  return { render, openLesson };
})();

/* The arcade chart in the hero: endless pixel candles, Chip rides the last close. */
const Arcade = (() => {
  function start() {
    const canvas = document.getElementById('arcade-canvas');
    if (!canvas) return () => {};
    const ctx = canvas.getContext('2d');
    const rider = document.getElementById('arc-rider');
    const PX = 6;
    let W = 0;
    let H = 0;
    let candles = [];
    let price = 50;
    let xp = 0;
    let raf = 0;
    let last = 0;
    let running = true;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      const r = canvas.getBoundingClientRect();
      W = Math.floor(r.width / PX);
      H = Math.floor(r.height / PX);
      canvas.width = W * PX;
      canvas.height = H * PX;
    }
    function nextCandle(bias = 0) {
      const o = price;
      const move = (Math.random() - 0.47 + bias) * 4;
      const c = Math.max(12, Math.min(88, o + move));
      const hi = Math.max(o, c) + Math.random() * 2;
      const lo = Math.min(o, c) - Math.random() * 2;
      price = c;
      return { o, c, hi, lo };
    }
    function y(v) { return Math.round(H - 4 - ((v - 5) / 90) * (H - 10)); }
    function draw() {
      ctx.fillStyle = '#0f1a14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#1b2a21';
      for (let gy = 6; gy < H; gy += 8) ctx.fillRect(0, gy * PX, canvas.width, PX / 3);
      const n = candles.length;
      candles.forEach((cd, i) => {
        const x = W - (n - i) * 3;
        if (x < -2) return;
        const up = cd.c >= cd.o;
        ctx.fillStyle = up ? '#2ee88a' : '#ff5a4e';
        ctx.fillRect((x + 0.5) * PX - PX / 4, y(cd.hi) * PX, PX / 2, (y(cd.lo) - y(cd.hi) + 1) * PX);
        const top = y(Math.max(cd.o, cd.c));
        const h = Math.max(1, y(Math.min(cd.o, cd.c)) - top);
        ctx.fillRect(x * PX, top * PX, PX * 2 - 1, h * PX);
      });
      const lastC = candles[n - 1];
      if (lastC && rider) {
        rider.style.left = `${((W - 3) * PX / canvas.width) * 100 - 7}%`;
        rider.style.top = `${((y(lastC.c) - 9) * PX / canvas.height) * 100}%`;
      }
    }
    function tick(t) {
      if (!running) return;
      if (t - last > 420) {
        last = t;
        candles.push(nextCandle());
        if (candles.length > W / 3 + 2) candles.shift();
        draw();
      }
      raf = requestAnimationFrame(tick);
    }
    function bump(dir) {
      for (let i = 0; i < 3; i++) candles.push(nextCandle(dir * 0.35));
      while (candles.length > W / 3 + 2) candles.shift();
      draw();
      xp += 10;
      const el = document.getElementById('arc-xp');
      if (el) el.textContent = xp;
      const lines = dir > 0
        ? ['Bought with pretend money! Real lesson: never chase a green candle.', 'Fake buy filled. Next up: learn what a stop-loss is.']
        : ['Sold! Practice is where you learn to cut losses.', "Fake sell done. Grizz would like a word about risk."];
      UI.cameo(dir > 0 ? 'chip' : 'grizz', lines[Math.floor(Math.random() * lines.length)], dir > 0 ? 'wow' : 'warn', 2600);
    }

    resize();
    for (let i = 0; i < W / 3 + 2; i++) candles.push(nextCandle());
    draw();
    if (!reduce) raf = requestAnimationFrame(tick);
    window.addEventListener('resize', resize);
    document.getElementById('arc-buy')?.addEventListener('click', () => bump(1));
    document.getElementById('arc-sell')?.addEventListener('click', () => bump(-1));
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }
  return { start };
})();

window.Landing = Landing;
