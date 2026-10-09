/* ============================================================
   TradeIQ — auth.js   Sign up / log in / recovery modal.
   Username + password only; email is optional.
   ============================================================ */

const AuthModal = (() => {
  let ctx = { next: null, reason: null };
  let m = null;

  function field(name, label, type = 'text', extra = '') {
    return `<label class="field" data-field="${name}"><span>${label}</span><input name="${name}" type="${type}" ${extra} /><small class="field-error" hidden></small></label>`;
  }

  function showErrors(form, err) {
    form.querySelectorAll('.field').forEach((f) => { f.classList.remove('has-error'); f.querySelector('.field-error').hidden = true; });
    const box = form.querySelector('.form-error');
    box.hidden = true;
    const f = err.field && form.querySelector(`.field[data-field="${err.field}"]`);
    if (f) {
      f.classList.add('has-error');
      const e = f.querySelector('.field-error');
      e.textContent = err.message;
      e.hidden = false;
      f.querySelector('input')?.focus();
    } else {
      box.textContent = err.message;
      box.hidden = false;
    }
  }

  function header(mode) {
    const lines = {
      signup: ctx.reason === 'lesson'
        ? ['chip', 'happy', "This lesson's ready for you! Make a free account so I can track your XP and streak."]
        : ctx.reason === 'feature'
          ? ['bolt', 'think', 'That part needs an account. It takes 20 seconds and no email.']
          : ['chip', 'wow', "Welcome! Pick a username and you're in. No email needed."],
      login: ['penny', 'happy', 'Welcome back! Your streak missed you.'],
      forgot: ['hoot', 'think', "Forgot it? Happens to the best of us. Let's get you back in."],
    };
    const [who, mood, say] = lines[mode] || lines.signup;
    return UI.speech({ who, mood, say }, 64);
  }

  function open(mode = 'signup', opts = {}) {
    ctx = { next: opts.next || null, reason: opts.reason || null };
    if (m) m.close();
    m = UI.modal('<div id="auth-body"></div>', { onClose: () => { m = null; } });
    show(mode);
  }

  function show(mode) {
    const body = m.el.querySelector('#auth-body');
    if (mode === 'signup') renderSignup(body);
    else if (mode === 'login') renderLogin(body);
    else renderForgot(body);
  }

  // ---------- Sign up ----------
  function renderSignup(body) {
    body.innerHTML = `${header('signup')}
      <h2 style="margin-top:8px">Create your account</h2>
      <form novalidate>
        <div class="form-error" hidden></div>
        ${field('username', 'Username', 'text', 'autocomplete="username" maxlength="20" required autocapitalize="off" spellcheck="false"')}
        <small class="hint" id="name-hint" style="display:block;margin:-10px 0 14px;font-size:13px"></small>
        ${field('password', 'Password', 'password', 'autocomplete="new-password" minlength="8" required')}
        <div class="progress-track" style="height:8px;margin:-8px 0 4px"><div class="progress-fill" id="pw-meter" style="width:0"></div></div>
        <small class="hint muted" id="pw-hint" style="display:block;margin-bottom:14px;font-size:13px">8+ characters. A short phrase works great.</small>
        <details class="email-opt" style="margin-bottom:14px">
          <summary style="cursor:pointer;font-weight:700;font-size:14.5px">+ Add an email (optional)</summary>
          <div style="margin-top:10px">
            ${field('email', 'Email', 'email', 'autocomplete="email" maxlength="254"')}
            <small class="hint muted" style="display:block;margin:-8px 0 8px;font-size:13px">Only used for password resets and (if you want) reminders. Never sold, never shared.</small>
            <label class="check-line"><input type="checkbox" name="emailOptIn" /><span>Send me streak reminders and a weekly progress email</span></label>
          </div>
        </details>
        <label class="check-line" data-field="confirmAge"><input type="checkbox" name="confirmAge" /><span>I'm 13 or older (if under 18, I have a parent or guardian's OK)</span></label>
        <label class="check-line" data-field="acceptTerms"><input type="checkbox" name="acceptTerms" /><span>I agree to the <a href="/terms" target="_blank">Terms</a> and <a href="/privacy" target="_blank">Privacy Policy</a>, and understand this is education, not financial advice</span></label>
        <input type="text" name="website" tabindex="-1" autocomplete="off" class="sr-only" aria-hidden="true" />
        <button class="btn btn-primary btn-block btn-lg" type="submit" style="margin-top:12px">Create account</button>
      </form>
      <p style="text-align:center;margin:16px 0 0;font-size:15px">Already have one? <a href="#" data-to="login">Log in</a></p>`;

    const form = body.querySelector('form');
    body.querySelector('[data-to="login"]').onclick = (e) => { e.preventDefault(); show('login'); };

    let t = null;
    const hint = body.querySelector('#name-hint');
    form.username.addEventListener('input', () => {
      clearTimeout(t);
      const v = form.username.value.trim();
      hint.textContent = '';
      if (v.length < 3) return;
      t = setTimeout(async () => {
        try {
          const r = await api.get(`/auth/check-username?username=${encodeURIComponent(v)}`);
          hint.innerHTML = r.available ? `<span class="up">${escapeHtml(v)} is available</span>` : `<span class="down">${escapeHtml(r.reason || 'Taken')}</span>`;
        } catch { /* ignore */ }
      }, 350);
    });

    form.password.addEventListener('input', () => {
      const v = form.password.value;
      let s = Math.min(v.length, 16) / 16;
      if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s += 0.1;
      if (/\d/.test(v)) s += 0.1;
      if (/[^A-Za-z0-9]/.test(v) || / /.test(v)) s += 0.15;
      s = Math.min(1, s);
      const meter = body.querySelector('#pw-meter');
      meter.style.width = `${s * 100}%`;
      meter.style.background = s < 0.45 ? 'var(--tomato)' : s < 0.75 ? 'var(--sun)' : 'var(--mint)';
      body.querySelector('#pw-hint').textContent = v.length < 8 ? `${8 - v.length} more character${8 - v.length === 1 ? '' : 's'}` : s < 0.75 ? 'Okay. Longer is stronger.' : 'Strong password.';
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type=submit]');
      const payload = {
        username: form.username.value.trim(),
        password: form.password.value,
        email: form.email.value.trim() || undefined,
        emailOptIn: form.emailOptIn.checked,
        confirmAge: form.confirmAge.checked,
        acceptTerms: form.acceptTerms.checked,
        website: form.website.value,
        timezone: (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return undefined; } })(),
      };
      UI.setBusy(btn, true);
      try {
        const r = await api.post('/auth/register', payload);
        Session.set(r.accessToken, r.user);
        showRecoveryCode(body, r.recoveryCode, Boolean(payload.email));
      } catch (err) {
        if (err.field === 'email') form.querySelector('.email-opt').open = true;
        showErrors(form, err);
      } finally {
        UI.setBusy(btn, false);
      }
    });
    setTimeout(() => form.username.focus(), 40);
  }

  function showRecoveryCode(body, code, hasEmail) {
    body.innerHTML = `${UI.speech({ who: 'penny', mood: 'warn', say: 'Important! This code is your spare key. Save it somewhere safe.' }, 64)}
      <h2 style="margin-top:8px">Your recovery code</h2>
      <p>If you ever forget your password${hasEmail ? ' and lose access to your email' : ''}, this code is the only way back in. We can't show it again.</p>
      <div class="code-box" id="rc">${escapeHtml(code)}</div>
      <div class="row-wrap" style="margin-bottom:14px">
        <button class="btn btn-sm" id="rc-copy">${Sprites.icon('receipt', 16)} Copy</button>
        <button class="btn btn-sm" id="rc-dl">${Sprites.icon('book', 16)} Download .txt</button>
      </div>
      <label class="check-line"><input type="checkbox" id="rc-ok" /><span>I saved my recovery code</span></label>
      <button class="btn btn-primary btn-block btn-lg" id="rc-go" disabled style="margin-top:10px">Let's start!</button>
      ${hasEmail ? '<p class="muted" style="font-size:14px;margin-top:12px">We also sent a confirmation link to your email.</p>' : ''}`;
    body.querySelector('#rc-copy').onclick = async () => {
      try { await navigator.clipboard.writeText(code); UI.toast('Copied', 'success'); } catch { UI.toast('Select the code and copy it manually', 'error'); }
    };
    body.querySelector('#rc-dl').onclick = () => {
      const blob = new Blob([`TradeIQ recovery code for ${Session.user.username}\n\n${code}\n\nKeep this private. Use it at tradeiq "Forgot password" if you lose your password.\n`], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `tradeiq-recovery-${Session.user.username}.txt`;
      a.click();
      URL.revokeObjectURL(a.href);
    };
    const ok = body.querySelector('#rc-ok');
    const go = body.querySelector('#rc-go');
    ok.onchange = () => { go.disabled = !ok.checked; };
    go.onclick = () => {
      const next = ctx.next;
      m.close();
      UI.confetti();
      App.onLoggedIn(next);
      setTimeout(() => UI.cameo('chip', `Welcome, ${Session.user.username}! Let's get you your first 50 XP.`, 'wow', 4200), 500);
    };
  }

  // ---------- Log in ----------
  function renderLogin(body) {
    body.innerHTML = `${header('login')}
      <h2 style="margin-top:8px">Log in</h2>
      <form novalidate>
        <div class="form-error" hidden></div>
        ${field('username', 'Username', 'text', 'autocomplete="username" required autocapitalize="off" spellcheck="false"')}
        ${field('password', 'Password', 'password', 'autocomplete="current-password" required')}
        <button class="btn btn-primary btn-block btn-lg" type="submit">Log in</button>
      </form>
      <p style="text-align:center;margin:16px 0 0;font-size:15px"><a href="#" data-to="forgot">Forgot password?</a> · <a href="#" data-to="signup">Create an account</a></p>`;
    const form = body.querySelector('form');
    body.querySelector('[data-to="forgot"]').onclick = (e) => { e.preventDefault(); show('forgot'); };
    body.querySelector('[data-to="signup"]').onclick = (e) => { e.preventDefault(); show('signup'); };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type=submit]');
      UI.setBusy(btn, true);
      try {
        const r = await api.post('/auth/login', { username: form.username.value.trim(), password: form.password.value });
        Session.set(r.accessToken, r.user);
        const next = ctx.next;
        m.close();
        App.onLoggedIn(next);
        UI.toast(`Welcome back, ${r.user.username}!`, 'success');
      } catch (err) {
        showErrors(form, err);
      } finally {
        UI.setBusy(btn, false);
      }
    });
    setTimeout(() => form.username.focus(), 40);
  }

  // ---------- Forgot ----------
  function renderForgot(body) {
    body.innerHTML = `${header('forgot')}
      <h2 style="margin-top:8px">Get back in</h2>
      <div class="tabs" role="tablist"><button class="on" data-tab="code">I have my recovery code</button><button data-tab="email">Email me a link</button></div>
      <div id="forgot-pane"></div>
      <p style="text-align:center;margin:16px 0 0;font-size:15px"><a href="#" data-to="login">Back to log in</a></p>`;
    body.querySelector('[data-to="login"]').onclick = (e) => { e.preventDefault(); show('login'); };
    const tabs = body.querySelectorAll('[data-tab]');
    tabs.forEach((t) => t.addEventListener('click', () => {
      tabs.forEach((x) => x.classList.toggle('on', x === t));
      paneFor(body.querySelector('#forgot-pane'), t.dataset.tab);
    }));
    paneFor(body.querySelector('#forgot-pane'), 'code');
  }

  function paneFor(pane, kind) {
    if (kind === 'email') {
      pane.innerHTML = `<form novalidate><div class="form-error" hidden></div><div class="form-ok" hidden></div>
        <p class="muted" style="font-size:14.5px">Works only if you added and confirmed an email on your account.</p>
        ${field('username', 'Username or email', 'text', 'autocapitalize="off"')}
        <button class="btn btn-primary btn-block" type="submit">Send reset link</button></form>`;
      const form = pane.querySelector('form');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        UI.setBusy(btn, true);
        try {
          const r = await api.post('/auth/forgot-password', { username: form.username.value.trim() });
          const ok = form.querySelector('.form-ok');
          ok.textContent = r.message;
          ok.hidden = false;
        } catch (err) {
          showErrors(form, err);
        } finally {
          UI.setBusy(btn, false);
        }
      });
      return;
    }
    pane.innerHTML = `<form novalidate><div class="form-error" hidden></div>
      ${field('username', 'Username', 'text', 'autocapitalize="off"')}
      ${field('recoveryCode', 'Recovery code', 'text', 'placeholder="XXXX-XXXX-XXXX-XXXX" autocapitalize="characters" spellcheck="false"')}
      ${field('password', 'New password', 'password', 'autocomplete="new-password"')}
      <button class="btn btn-primary btn-block" type="submit">Reset password</button></form>`;
    const form = pane.querySelector('form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button');
      UI.setBusy(btn, true);
      try {
        const r = await api.post('/auth/recover', {
          username: form.username.value.trim(), recoveryCode: form.recoveryCode.value, password: form.password.value,
        });
        pane.innerHTML = `<div class="form-ok">${escapeHtml(r.message)}</div>
          <p>Your <b>new</b> recovery code:</p><div class="code-box">${escapeHtml(r.recoveryCode)}</div>
          <button class="btn btn-primary btn-block" id="to-login">Log in now</button>`;
        pane.querySelector('#to-login').onclick = () => show('login');
      } catch (err) {
        showErrors(form, err);
      } finally {
        UI.setBusy(btn, false);
      }
    });
  }

  return { open };
})();

window.AuthModal = AuthModal;
