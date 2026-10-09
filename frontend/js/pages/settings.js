/* ============================================================
   TradeIQ — settings.js   Email, reminders, privacy, security,
   data export and account deletion.
   ============================================================ */

const Settings = (() => {
  function toggle(key, on) {
    return `<label class="toggle"><input type="checkbox" data-pref="${key}" ${on ? 'checked' : ''} /><span></span></label>`;
  }

  async function render() {
    const view = document.getElementById('view');
    const u = await api.get('/me');
    Session.setUser(u);
    const tzGuess = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let zones = [];
    try { zones = Intl.supportedValuesOf('timeZone'); } catch { zones = [u.timezone, tzGuess]; }

    view.innerHTML = `<div class="page wrap">
      <div class="page-head"><div><span class="eyebrow">Account</span><h1>Settings</h1></div></div>
      <div class="settings-grid">

        <section class="card"><div class="card-title">${Sprites.icon('card', 22)} Email <span class="chip-tag">optional</span></div>
          ${u.email ? `<div class="settings-row"><div class="txt"><b>${escapeHtml(u.email)}</b>
              <small>${u.emailVerified ? '<span class="up">Confirmed.</span> Used for password resets and (if on) reminders.' : '<span class="down">Not confirmed yet.</span> Check your inbox for the link.'}</small></div>
              <div class="row-wrap">${u.emailVerified ? '' : '<button class="btn btn-sm" data-resend>Resend link</button>'}<button class="btn btn-sm" data-remove-email>Remove</button></div></div>` : ''}
          <form class="settings-row" data-email-form style="align-items:flex-end">
            <label class="field" style="flex:1;margin:0;min-width:220px"><span>${u.email ? 'Change email' : 'Add an email'}</span><input type="email" name="email" placeholder="you@example.com" autocomplete="email" /></label>
            <button class="btn btn-primary" type="submit">${u.email ? 'Update' : 'Add email'}</button>
          </form>
          <p class="muted" style="font-size:13.5px;margin:10px 0 0">We only email you about your account and, if you opt in, your streak. No marketing lists, no selling addresses.</p>
        </section>

        <section class="card"><div class="card-title">${Sprites.icon('fire', 22)} Reminders & profile</div>
          <div class="settings-row"><div class="txt"><b>Streak reminders + weekly digest</b><small>${u.emailVerified ? 'Around 6pm your time if you haven\'t practiced, plus a Sunday summary.' : 'Needs a confirmed email.'}</small></div>
            ${toggle('emailOptIn', u.emailOptIn)}</div>
          <div class="settings-row"><div class="txt"><b>Show me on the leaderboard</b><small>Only your username, avatar and XP are shown.</small></div>${toggle('showOnLeaderboard', u.showOnLeaderboard)}</div>
          <div class="settings-row"><div class="txt"><b>Your timezone</b><small>Used for streak days and reminder timing.</small></div>
            <select class="input" data-tz style="max-width:260px">${zones.map((z) => `<option ${z === u.timezone ? 'selected' : ''}>${escapeHtml(z)}</option>`).join('')}</select></div>
          ${u.timezone !== tzGuess ? `<p class="muted" style="font-size:13.5px">Your device says <b>${escapeHtml(tzGuess)}</b>. <a href="#" data-use-tz>Use that</a></p>` : ''}
        </section>

        <section class="card"><div class="card-title">${Sprites.icon('lock', 22)} Security</div>
          <form data-pw-form>
            <label class="field"><span>Current password</span><input type="password" name="currentPassword" autocomplete="current-password" /></label>
            <label class="field"><span>New password</span><input type="password" name="newPassword" autocomplete="new-password" /></label>
            <button class="btn" type="submit">Change password</button>
          </form>
          <hr class="divider">
          <div class="settings-row"><div class="txt"><b>Recovery code</b><small>Lost the one from signup? Make a new one (the old one stops working).</small></div><button class="btn btn-sm" data-new-code>New code</button></div>
          <div class="settings-row"><div class="txt"><b>Log out everywhere</b><small>Signs out every device, including this one.</small></div><button class="btn btn-sm" data-logout-all>Log out all</button></div>
        </section>

        <section class="card"><div class="card-title">${Sprites.icon('receipt', 22)} Your data</div>
          <div class="settings-row"><div class="txt"><b>Download my data</b><small>Everything we store about you, as a JSON file.</small></div><button class="btn btn-sm" data-export>Download</button></div>
          <p class="muted" style="font-size:13.5px;margin:12px 0 0">Read the <a href="/privacy">Privacy Policy</a> for what we collect and why.</p>
        </section>

        <section class="card danger-zone"><div class="card-title" style="color:var(--tomato-d)">${Sprites.icon('warning', 22)} Delete account</div>
          <p>Permanently deletes your account, progress, trades and badges. This can't be undone.</p>
          <button class="btn btn-danger" data-delete>Delete my account</button>
        </section>
      </div></div>`;

    const $ = (s) => view.querySelector(s);
    const busy = async (btn, fn) => { UI.setBusy(btn, true); try { await fn(); } catch (err) { UI.toast(err.message, 'error'); } finally { UI.setBusy(btn, false); } };

    $('[data-email-form]').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      busy(f.querySelector('button'), async () => {
        const r = await api.put('/me/email', { email: f.email.value.trim() });
        UI.toast(r.message || 'Saved', 'success', { ms: 6000 });
        render();
      });
    });
    $('[data-resend]')?.addEventListener('click', (e) => busy(e.currentTarget, async () => UI.toast((await api.post('/me/email/resend')).message, 'success')));
    $('[data-remove-email]')?.addEventListener('click', async () => {
      if (!(await UI.confirm({ title: 'Remove your email?', message: "You'll only be able to recover your account with your recovery code.", confirmText: 'Remove', danger: true }))) return;
      Session.setUser(await api.delete('/me/email'));
      render();
    });
    view.querySelectorAll('[data-pref]').forEach((t) => t.addEventListener('change', async () => {
      try {
        Session.setUser(await api.patch('/me', { [t.dataset.pref]: t.checked }));
        UI.toast('Saved', 'success', { ms: 1500 });
      } catch (err) { t.checked = !t.checked; UI.toast(err.message, 'error'); }
    }));
    const saveTz = async (tz) => { Session.setUser(await api.patch('/me', { timezone: tz })); UI.toast('Timezone saved', 'success', { ms: 1500 }); };
    $('[data-tz]').addEventListener('change', (e) => saveTz(e.target.value).catch((err) => UI.toast(err.message, 'error')));
    $('[data-use-tz]')?.addEventListener('click', (e) => { e.preventDefault(); saveTz(tzGuess).then(render); });

    $('[data-pw-form]').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      busy(f.querySelector('button'), async () => {
        const r = await api.put('/me/password', { currentPassword: f.currentPassword.value, newPassword: f.newPassword.value });
        UI.toast(r.message, 'success');
        Session.clear();
        App.go('/login');
      });
    });
    $('[data-new-code]').addEventListener('click', () => {
      const m = UI.modal(`<h3>New recovery code</h3><p class="muted">Enter your password to confirm.</p>
        <form><label class="field"><span>Password</span><input type="password" name="password" autocomplete="current-password" /></label><button class="btn btn-primary btn-block">Generate</button></form><div data-out></div>`);
      m.el.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        busy(e.target.querySelector('button'), async () => {
          const r = await api.post('/me/recovery-code', { password: e.target.password.value });
          m.el.querySelector('form').remove();
          m.el.querySelector('[data-out]').innerHTML = `<div class="code-box">${escapeHtml(r.recoveryCode)}</div><p>Save this somewhere safe. The old code no longer works.</p>`;
        });
      });
    });
    $('[data-logout-all]').addEventListener('click', async () => {
      if (!(await UI.confirm({ title: 'Log out everywhere?', message: 'Every device, including this one, will need to log in again.', confirmText: 'Log out all' }))) return;
      await api.post('/me/logout-all');
      Session.clear();
      App.go('/');
    });
    $('[data-export]').addEventListener('click', (e) => busy(e.currentTarget, async () => {
      const data = await api.get('/me/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `tradeiq-export-${u.username}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    }));
    $('[data-delete]').addEventListener('click', () => {
      const m = UI.modal(`${UI.speech({ who: 'grizz', mood: 'warn', say: "This deletes everything. Even I think that's harsh." }, 56)}
        <h3>Delete account forever?</h3><form><label class="field"><span>Password</span><input type="password" name="password" autocomplete="current-password" /></label>
        <label class="field"><span>Type DELETE to confirm</span><input name="confirm" autocomplete="off" /></label><button class="btn btn-danger btn-block">Delete everything</button></form>`);
      m.el.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        busy(e.target.querySelector('button'), async () => {
          await api.delete('/me', { password: e.target.password.value, confirm: e.target.confirm.value });
          m.close();
          Session.clear();
          App.go('/');
          UI.toast('Your account was deleted.', 'info');
        });
      });
    });
  }

  return { render };
})();

window.Settings = Settings;
