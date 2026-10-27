/* ============================================================
   TradeIQ — mobs.js   Wave enemies for fights (game/battle.js).
   Each mob type has its own behavior, so a wave of mixed mobs
   plays very differently from a boss. Elites are mini-bosses:
   far tougher, gold-outlined, with a stronger version of their move.

   Mobs take 1 damage from chip shots. A charged shot bursts on
   the first mob it hits (4 damage per charge pip to every mob
   nearby), so clear a lane before you charge at the boss.
   ============================================================ */

const Mobs = (() => {
  const TYPES = {
    zombie: { name: 'Debt Zombie', hp: 3, r: 16, speed: 62, dmg: 8, template: 'brute', body: '#7a9a5a', accent: '#c7362c',
      tip: 'Shambles at you and hits on contact. Easy alone, nasty in a crowd.' },
    swarmer: { name: 'Swarmer', hp: 1, r: 10, speed: 150, dmg: 5, template: 'bird', body: '#ffb347', accent: '#17140f',
      tip: 'Fast and fragile. Bursts on contact.' },
    shooter: { name: 'Spam Caller', hp: 3, r: 15, speed: 70, dmg: 7, template: 'bot', body: '#3d8bfd', accent: '#ffd23f',
      tip: 'Keeps its distance and fires at you. Close in or out-dodge it.' },
    bomber: { name: 'Margin Bomb', hp: 2, r: 15, speed: 95, dmg: 18, template: 'blob', body: '#ff5a4e', accent: '#17140f',
      tip: 'Runs up and blows up after a warning. Kill it early or get clear.' },
    tank: { name: 'Brick Wall Bill', hp: 10, r: 22, speed: 38, dmg: 12, template: 'suit', body: '#6b7280', accent: '#ffd23f',
      tip: 'Blocks shots from the front. Flank it, or break it with a charge.' },
    splitter: { name: 'Splitting Fee', hp: 4, r: 17, speed: 70, dmg: 8, template: 'blob', body: '#8b5cf6', accent: '#ffd23f',
      tip: 'Splits into two Swarmers when it dies.' },
    healer: { name: 'Lobbyist', hp: 4, r: 15, speed: 80, dmg: 4, template: 'specter', body: '#1fbf75', accent: '#fffaf0',
      tip: 'Hides near the boss and heals it. Take it out first.' },
    turret: { name: 'Ticker Tower', hp: 6, r: 18, speed: 0, dmg: 6, template: 'bot', body: '#9a6440', accent: '#1fbf75',
      tip: 'Stands still and sprays spinning bullets.' },
  };
  const ELITE = { hp: 6, r: 1.5, dmg: 1.5 };

  const lookFor = (type, elite) => ({
    id: `mob-${type}${elite ? '-elite' : ''}`,
    look: { template: TYPES[type].template, body: TYPES[type].body, accent: elite ? '#ffd23f' : TYPES[type].accent, eye: '#17140f' },
  });

  function create(type, x, y, elite = false) {
    const t = TYPES[type];
    const hp = t.hp * (elite ? ELITE.hp : 1);
    return {
      type, elite, x, y, hp, maxHp: hp, r: t.r * (elite ? ELITE.r : 1), speed: t.speed * (elite ? 0.85 : 1), dmg: Math.round(t.dmg * (elite ? ELITE.dmg : 1)),
      t: 0, cd: 1 + Math.random() * 1.5, contactCd: 0, state: 'spawn', spawnT: 0.7, flash: 0, face: 0, ang: Math.random() * Math.PI * 2,
    };
  }

  /** E: { p, b, bossActive, W, H, hurtPlayer(dmg, src), floater, bullet(x, y, ang, v, r, dmg, extra), zone(z), healBoss(n), spawn(type, x, y, elite), dt } */
  function update(m, E) {
    const { p, dt } = E;
    m.t += dt; m.flash = Math.max(0, m.flash - dt); m.contactCd = Math.max(0, m.contactCd - dt);
    if (m.state === 'spawn') { m.spawnT -= dt; if (m.spawnT <= 0) m.state = 'go'; return; }
    const dx = p.x - m.x; const dy = p.y - m.y; const d = Math.hypot(dx, dy) || 1;
    const toP = Math.atan2(dy, dx);
    m.face = toP;
    const move = (ang, spd) => { m.x = Math.max(20, Math.min(E.W - 20, m.x + Math.cos(ang) * spd * dt)); m.y = Math.max(20, Math.min(E.H - 20, m.y + Math.sin(ang) * spd * dt)); };
    const touching = d < m.r + p.r;

    switch (m.type) {
      case 'zombie': {
        move(toP + Math.sin(m.t * 2 + m.x) * 0.35, m.speed);
        // elite: a lunge every few seconds
        if (m.elite) { m.cd -= dt; if (m.cd <= 0 && d < 260) { m.cd = 3.5; m.lunge = 0.35; } if (m.lunge > 0) { m.lunge -= dt; move(toP, 420); } }
        if (touching && m.contactCd <= 0) { E.hurtPlayer(m.dmg, { x: m.x, y: m.y, knock: true }); m.contactCd = 1; }
        break;
      }
      case 'swarmer': {
        move(toP + Math.sin(m.t * 6) * 0.5, m.speed);
        if (touching) { E.hurtPlayer(m.dmg, m); m.hp = 0; m.noDrop = true; }
        break;
      }
      case 'shooter': {
        const want = 230;
        move(d > want ? toP : toP + Math.PI, m.speed * Math.min(1, Math.abs(d - want) / 80));
        move(toP + Math.PI / 2, m.speed * 0.5 * Math.sin(m.t * 0.8));
        m.cd -= dt;
        if (m.cd <= 0.45 && !m.aim) m.aim = true; // telegraph line
        if (m.cd <= 0) {
          m.cd = 2.4; m.aim = false;
          const spread = m.elite ? [-0.22, 0, 0.22] : [0];
          for (const s of spread) E.bullet(m.x, m.y, toP + s, 300, 6, m.dmg);
        }
        break;
      }
      case 'bomber': {
        if (m.state === 'arming') {
          m.arm -= dt;
          if (m.arm <= 0) { E.zone({ x: m.x, y: m.y, r: m.elite ? 130 : 90, t: 0, dmg: m.dmg, fade: 0.05, knock: true }); m.hp = 0; m.noDrop = true; }
        } else {
          move(toP, m.speed);
          if (d < 80) { m.state = 'arming'; m.arm = 0.9; }
        }
        break;
      }
      case 'tank': {
        move(toP, m.speed);
        if (m.elite) { m.cd -= dt; if (m.cd <= 0) { m.cd = 3; for (let k = -2; k <= 2; k++) E.bullet(m.x, m.y, toP + k * 0.2, 220, 8, m.dmg); } }
        if (touching && m.contactCd <= 0) { E.hurtPlayer(m.dmg, { x: m.x, y: m.y, knock: true }); m.contactCd = 1.2; }
        break;
      }
      case 'splitter': {
        move(toP + Math.sin(m.t * 3) * 0.3, m.speed);
        if (touching && m.contactCd <= 0) { E.hurtPlayer(m.dmg, m); m.contactCd = 1; }
        break;
      }
      case 'healer': {
        if (E.bossActive) {
          // orbit behind the boss, away from the player
          const away = Math.atan2(E.b.y - p.y, E.b.x - p.x) + Math.sin(m.t) * 0.8;
          const tx = E.b.x + Math.cos(away) * 90; const ty = E.b.y + Math.sin(away) * 90;
          move(Math.atan2(ty - m.y, tx - m.x), Math.min(m.speed, Math.hypot(tx - m.x, ty - m.y) * 3));
          E.healBoss((m.elite ? 3 : 1.5) * dt);
          m.beam = true;
        } else {
          m.beam = false;
          if (d < 260) move(toP + Math.PI, m.speed); else move(toP + Math.PI / 2, m.speed * 0.4);
        }
        break;
      }
      case 'turret': {
        m.cd -= dt; m.ang += dt * 1.2;
        if (m.cd <= 0) {
          m.cd = 1.4;
          const n = m.elite ? 8 : 4;
          for (let k = 0; k < n; k++) E.bullet(m.x, m.y, m.ang + (k / n) * Math.PI * 2, 170, 6, m.dmg);
        }
        break;
      }
      default: move(toP, m.speed);
    }
  }

  /** A player's shot reached this mob. Returns true if the shot is used up. */
  function hit(m, shot, E) {
    if (m.state === 'spawn') return false;
    if (shot.charged) {
      // burst: every mob nearby takes 4 per pip
      const dmg = 4 * (shot.pips || 1);
      for (const o of E.mobs) if (o.hp > 0 && Math.hypot(o.x - shot.x, o.y - shot.y) < 80 + o.r) { o.hp -= dmg; o.flash = 0.15; }
      E.floater(shot.x, shot.y - 20, 'Burst!', '#ffd23f', 14);
      E.burst(shot.x, shot.y, 80);
      return true;
    }
    if (m.type === 'tank') {
      // the front 120 degrees blocks chip shots
      const shotFrom = Math.atan2(-shot.vy, -shot.vx);
      let diff = Math.abs(shotFrom - m.face) % (Math.PI * 2);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      if (diff < Math.PI / 3) { E.floater(m.x, m.y - m.r - 10, 'Blocked', '#8a96a3', 12); return true; }
    }
    m.hp -= 1; m.flash = 0.12;
    return true;
  }

  /** Called when a mob dies. */
  function onDeath(m, E) {
    if (m.type === 'splitter') for (let k = 0; k < (m.elite ? 4 : 2); k++) E.spawn('swarmer', m.x + (Math.random() - 0.5) * 30, m.y + (Math.random() - 0.5) * 30, false, true);
    if (!m.noDrop && Math.random() < (m.elite ? 1 : 0.12)) E.drop({ x: m.x, y: m.y, kind: 'heart', heal: m.elite ? 20 : 8, t: 8 });
  }

  function draw(ctx, m, img) {
    const size = m.r * 2.6;
    ctx.save();
    if (m.state === 'spawn') {
      // a portal ring while it spawns in
      ctx.strokeStyle = 'rgba(139,92,246,0.9)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r * (1.6 - m.spawnT), 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1 - m.spawnT / 0.7;
    }
    if (m.type === 'bomber' && m.state === 'arming') {
      ctx.fillStyle = `rgba(255,90,78,${0.2 + 0.4 * (1 - m.arm / 0.9)})`;
      ctx.beginPath(); ctx.arc(m.x, m.y, m.elite ? 130 : 90, 0, Math.PI * 2); ctx.fill();
    }
    if (m.type === 'shooter' && m.aim) {
      ctx.strokeStyle = 'rgba(255,90,78,0.6)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x + Math.cos(m.face) * 260, m.y + Math.sin(m.face) * 260); ctx.stroke(); ctx.setLineDash([]);
    }
    if (m.type === 'tank') {
      ctx.strokeStyle = 'rgba(201,210,220,0.9)'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r + 6, m.face - Math.PI / 3, m.face + Math.PI / 3); ctx.stroke();
    }
    if (m.elite) { ctx.fillStyle = 'rgba(255,210,63,0.35)'; ctx.beginPath(); ctx.ellipse(m.x, m.y + m.r, m.r * 1.1, m.r * 0.35, 0, 0, Math.PI * 2); ctx.fill(); }
    if (m.flash > 0) ctx.globalAlpha *= 0.55;
    if (img) ctx.drawImage(img, m.x - size / 2, m.y - size / 2, size, size);
    ctx.restore();
    if (m.elite || m.maxHp > 3) {
      const w = m.r * 2;
      ctx.fillStyle = '#17140f'; ctx.fillRect(m.x - w / 2 - 1, m.y - m.r - 14, w + 2, 6);
      ctx.fillStyle = m.elite ? '#ffd23f' : '#ff5a4e'; ctx.fillRect(m.x - w / 2, m.y - m.r - 13, w * Math.max(0, m.hp / m.maxHp), 4);
    }
  }

  return { TYPES, create, update, hit, onDeath, draw, lookFor };
})();

window.Mobs = Mobs;
