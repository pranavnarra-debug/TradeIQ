/* ============================================================
   TradeIQ — ui.js
   Shared UI: toasts, modals, sprite speech bubbles and cameos,
   glossary tooltips, confetti, number count-ups.
   ============================================================ */

const UI = (() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------- Toasts ----------
  function toast(message, type = 'info', { icon, ms = 3800 } = {}) {
    let stack = $('.toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      stack.setAttribute('role', 'status');
      stack.setAttribute('aria-live', 'polite');
      document.body.appendChild(stack);
    }
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    const ic = icon || (type === 'success' ? 'check' : type === 'error' ? 'cross' : type === 'reward' ? 'star' : 'lightbulb');
    el.innerHTML = `${Sprites.icon(ic, 22)}<span></span>`;
    el.querySelector('span').textContent = message;
    stack.appendChild(el);
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 260);
    }, ms);
  }

  // ---------- Modal ----------
  function modal(html, { wide = false, onClose, dismissable = true } = {}) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `<div class="modal-box ${wide ? 'wide' : ''}" role="dialog" aria-modal="true">
      ${dismissable ? '<button class="modal-close" aria-label="Close">&times;</button>' : ''}
      <div class="modal-content">${html}</div></div>`;
    const prevFocus = document.activeElement;
    function close() {
      overlay.remove();
      document.removeEventListener('keydown', onKey);
      if (prevFocus && prevFocus.focus) prevFocus.focus();
      if (onClose) onClose();
    }
    function onKey(e) { if (e.key === 'Escape' && dismissable) close(); }
    if (dismissable) {
      overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) close(); });
      overlay.querySelector('.modal-close').addEventListener('click', close);
    }
    document.addEventListener('keydown', onKey);
    document.body.appendChild(overlay);
    const focusable = overlay.querySelector('input, button:not(.modal-close), a[href]');
    if (focusable) setTimeout(() => focusable.focus(), 30);
    return { el: overlay.querySelector('.modal-content'), close };
  }

  function confirm({ title, message, confirmText = 'Confirm', danger = false }) {
    return new Promise((resolve) => {
      let answered = false;
      const m = modal(`<h3>${title}</h3><p class="muted">${message}</p>
        <div class="modal-actions"><button class="btn" data-no>Cancel</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-yes>${confirmText}</button></div>`,
      { onClose: () => { if (!answered) resolve(false); } });
      m.el.querySelector('[data-no]').onclick = () => { answered = true; m.close(); resolve(false); };
      m.el.querySelector('[data-yes]').onclick = () => { answered = true; m.close(); resolve(true); };
    });
  }

  // ---------- Sprites talking ----------
  function speech({ who = 'chip', mood = 'happy', say = '' }, size = 72) {
    return `<div class="speech mood-${mood}">${Sprites.character(who, size)}
      <div class="bubble"><span class="who">${escapeHtml(Sprites.NAMES[who] || who)}</span>${escapeHtml(say)}</div></div>`;
  }

  let cameoTimer = null;
  /** A sprite pops up in the corner for a moment with a one-liner. */
  function cameo(who, say, mood = 'happy', ms = 3200) {
    $$('.cameo').forEach((c) => c.remove());
    clearTimeout(cameoTimer);
    const el = document.createElement('div');
    el.className = `cameo speech mood-${mood}`;
    el.setAttribute('aria-live', 'polite');
    el.innerHTML = `${Sprites.character(who, 88)}<div class="bubble"><span class="who">${escapeHtml(Sprites.NAMES[who])}</span>${escapeHtml(say)}</div>`;
    document.body.appendChild(el);
    cameoTimer = setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 320);
    }, ms);
  }

  // ---------- Glossary tooltips (.term[data-def]) ----------
  let pop = null;
  function hideTerm() { if (pop) { pop.remove(); pop = null; } }
  function showTerm(el) {
    hideTerm();
    pop = document.createElement('div');
    pop.className = 'term-pop';
    pop.textContent = el.dataset.def;
    document.body.appendChild(pop);
    const r = el.getBoundingClientRect();
    const w = pop.offsetWidth;
    pop.style.left = `${Math.max(8, Math.min(window.innerWidth - w - 8, r.left + window.scrollX + r.width / 2 - w / 2))}px`;
    pop.style.top = `${r.bottom + window.scrollY + 8}px`;
  }
  document.addEventListener('mouseover', (e) => { const t = e.target.closest('.term[data-def]'); if (t) showTerm(t); });
  document.addEventListener('mouseout', (e) => { if (e.target.closest('.term[data-def]')) hideTerm(); });
  document.addEventListener('click', (e) => {
    const t = e.target.closest('.term[data-def]');
    if (t) { e.preventDefault(); showTerm(t); } else hideTerm();
  });
  document.addEventListener('scroll', hideTerm, { passive: true });

  // ---------- Confetti (pixel squares) ----------
  function confetti(n = 90) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = document.createElement('canvas');
    c.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:300';
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    const colors = ['#1fbf75', '#ffd23f', '#ff5a4e', '#3d8bfd', '#8b5cf6', '#ff7a45'];
    const parts = Array.from({ length: n }, () => ({
      x: c.width / 2 + (Math.random() - 0.5) * 200,
      y: c.height * 0.45,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 16 - 6,
      s: 6 + Math.floor(Math.random() * 3) * 3,
      col: colors[Math.floor(Math.random() * colors.length)],
    }));
    let frame = 0;
    setTimeout(() => c.remove(), 4000); // in case rAF is throttled in a background tab
    (function tick() {
      ctx.clearRect(0, 0, c.width, c.height);
      parts.forEach((p) => {
        p.vy += 0.45;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        ctx.fillStyle = '#17140f';
        ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, p.s + 2, p.s + 2);
        ctx.fillStyle = p.col;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
      });
      if (++frame < 150) requestAnimationFrame(tick);
      else c.remove();
    })();
  }

  function countUp(el, to, ms = 900, prefix = '+') {
    const start = performance.now();
    (function step(t) {
      const k = Math.min(1, (t - start) / ms);
      el.textContent = `${prefix}${Math.round(to * (1 - Math.pow(1 - k, 3)))}`;
      if (k < 1) requestAnimationFrame(step);
    })(start);
  }

  function setBusy(btn, busy) {
    if (!btn) return;
    btn.classList.toggle('is-loading', busy);
    btn.disabled = busy;
  }

  function fmtMoney(n, d = 2) {
    if (n == null || Number.isNaN(Number(n))) return '—';
    const v = Number(n);
    return `${v < 0 ? '-' : ''}$${Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d })}`;
  }

  /** Celebrate a server reward payload {xpGained, coinsGained, newAchievements, leveledUp, level, streak}. */
  function celebrate(r) {
    if (!r) return;
    (r.newAchievements || []).forEach((a, i) => setTimeout(() => {
      toast(`Achievement unlocked: ${a.name}`, 'reward', { icon: 'trophy', ms: 4500 });
    }, 400 + i * 700));
    if (r.leveledUp) setTimeout(() => cameo('chip', `LEVEL UP! You're now level ${r.level.level}: ${r.level.title}.`, 'wow', 4200), 300);
    if (window.App) window.App.refreshHud();
  }

  return { $, $$, toast, modal, confirm, speech, cameo, confetti, countUp, setBusy, fmtMoney, celebrate };
})();

window.UI = UI;
