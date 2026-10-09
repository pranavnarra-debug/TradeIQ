/* ============================================================
   TradeIQ — legal.js   Terms, Privacy, Disclaimer + utility pages
   (password reset, unsubscribe). Company details come from
   /api/site (env vars), so nothing is hard-coded here.

   NOTE TO OPERATOR: these are solid starting templates written for
   a free, US-based education site. Have a lawyer review them before
   you monetize, collect payments, or target users outside the US.
   ============================================================ */

const Legal = (() => {
  const UPDATED = 'October 8, 2026';

  function s() {
    const site = App.site || {};
    return {
      name: escapeHtml(site.name || 'TradeIQ'),
      entity: escapeHtml(site.legalEntity || site.name || 'TradeIQ'),
      email: escapeHtml(site.contactEmail || ''),
      state: escapeHtml(site.governingState || ''),
      addr: escapeHtml(site.postalAddress || ''),
    };
  }
  const contact = (x) => (x.email ? `<a href="mailto:${x.email}" data-external>${x.email}</a>` : 'the site operator');

  const PAGES = {
    terms: (x) => `
      <h1>Terms of Service</h1><p class="muted">Last updated ${UPDATED}</p>
      <p class="note"><b>Plain-English summary:</b> ${x.name} teaches personal finance and trading with lessons and a <b>simulated</b> trading game. Nothing here is financial advice, no real money is ever traded, and you use it at your own risk. Be at least 13, be decent, and don't try to break things.</p>
      <h2>1. Who we are</h2><p>${x.name} is operated by ${x.entity} ("we", "us"). By creating an account or using the site you agree to these Terms and our <a href="/privacy">Privacy Policy</a>.</p>
      <h2>2. Eligibility</h2><p>You must be at least 13 years old. If you are under 18 (or the age of majority where you live), you may only use ${x.name} with the permission of a parent or legal guardian, who agrees to these Terms on your behalf. We do not knowingly collect information from children under 13; if we learn that we have, we delete the account.</p>
      <h2>3. Education only, not financial advice</h2>
      <p>All content (lessons, quizzes, diagrams, calculators, the trading simulator, strategy "signals", the rule-based bot, research pages and anything our mascots say) is for <b>general educational purposes only</b>. It is not investment, legal, tax or accounting advice, and it is not a recommendation to buy, sell or hold any security, option, futures contract or other asset. We are not a broker-dealer, investment adviser, commodity trading advisor or financial planner. Consider talking to a licensed professional before making real financial decisions.</p>
      <h2>4. Simulated trading</h2><p>Trading on ${x.name} uses fake money. No orders are sent to any market. Simulated results do not reflect real trading costs, slippage, liquidity, taxes or emotions, and <b>past or simulated performance does not predict future results</b>. Real trading, especially with options, futures, margin or leverage, can lose more than you invest.</p>
      <h2>5. Market data</h2><p>Prices and company data come from third-party sources, may be delayed, incomplete or wrong, and are provided "as is" for learning only. Don't rely on them for real trades.</p>
      <h2>6. Your account</h2><ul><li>Keep your password and recovery code private. You're responsible for activity on your account.</li>
        <li>Pick a username that isn't offensive, impersonating someone, or misleading. We may change or remove usernames that break these rules.</li>
        <li>You can delete your account at any time in Settings.</li></ul>
      <h2>7. Acceptable use</h2><p>Don't: attempt to access other people's accounts or data; probe, scan or attack the service; scrape or bulk-download content; use bots to farm XP or manipulate leaderboards; upload malicious code; or use ${x.name} for anything illegal. Found a security issue? Please report it to ${contact(x)} instead of exploiting it.</p>
      <h2>8. Points, coins and badges</h2><p>XP, coins, streaks, badges and leaderboard ranks are game features with no cash value. They can't be sold, transferred or redeemed, and we may adjust or reset them (for example, to fix bugs or cheating).</p>
      <h2>9. Our content</h2><p>The lessons, artwork, characters, code and design are owned by ${x.entity} and protected by copyright. You may use them for your personal learning. Don't copy, republish or sell them without written permission.</p>
      <h2>10. Changes and termination</h2><p>We may update the service or these Terms. If a change is significant we'll post a notice on the site. We may suspend or close accounts that violate these Terms.</p>
      <h2>11. Disclaimers</h2><p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING ACCURACY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. We work hard to keep lessons accurate, but rules, limits and numbers change, and we can make mistakes.</p>
      <h2>12. Limitation of liability</h2><p>TO THE MAXIMUM EXTENT ALLOWED BY LAW, ${x.entity.toUpperCase()} WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, OR FOR ANY FINANCIAL LOSSES YOU INCUR FROM DECISIONS YOU MAKE, WHETHER OR NOT BASED ON CONTENT FROM THIS SITE. OUR TOTAL LIABILITY FOR ANY CLAIM IS LIMITED TO $50. Some jurisdictions don't allow these limits, so they may not apply to you.</p>
      <h2>13. Governing law</h2><p>These Terms are governed by the laws of ${x.state ? `the State of ${x.state}` : 'the state in which the operator is based'}, USA, without regard to conflict-of-law rules.</p>
      <h2>14. Contact</h2><p>Questions? Email ${contact(x)}.${x.addr ? ` Mail: ${x.entity}, ${x.addr}.` : ''}</p>`,

    privacy: (x) => `
      <h1>Privacy Policy</h1><p class="muted">Last updated ${UPDATED}</p>
      <p class="note"><b>Short version:</b> we collect as little as possible. A username and password is enough. We don't sell or share your data, don't run ads, and don't use tracking cookies. You can download or delete your data anytime in Settings.</p>
      <h2>What we collect</h2>
      <table class="lesson-html"><thead><tr><th>Data</th><th>Why</th><th>How long</th></tr></thead><tbody>
        <tr><td>Username and password (stored only as a one-way hash)</td><td>Your account</td><td>Until you delete your account</td></tr>
        <tr><td>Recovery code (hashed)</td><td>Account recovery without email</td><td>Until replaced or account deleted</td></tr>
        <tr><td>Email address (optional)</td><td>Password resets, security notices, and reminders if you opt in</td><td>Until you remove it or delete your account</td></tr>
        <tr><td>Learning progress, XP, streaks, badges, simulated trades and notes</td><td>Running the service and showing your progress</td><td>Until you delete your account</td></tr>
        <tr><td>IP address, browser type, session times</td><td>Security, abuse prevention and rate limiting</td><td>Connection logs: 30 days</td></tr>
        <tr><td>Email delivery log (type of email and whether it sent, not the contents)</td><td>Making sure emails work</td><td>180 days</td></tr>
      </tbody></table>
      <p>We don't collect your real name, birthday, phone number, location, contacts, or payment information. We confirm you're 13+ with a checkbox and don't store your age.</p>
      <h2>Cookies and local storage</h2><p>We use <b>one essential cookie</b> to keep you logged in (a secure, httpOnly session cookie). We also save small conveniences in your browser, like which lesson screen you were on. No advertising, analytics or cross-site tracking cookies.</p>
      <h2>Who we share data with</h2><p>We <b>do not sell or share</b> your personal information, including for targeted advertising. We use a small number of service providers who process data only on our instructions:</p>
      <ul><li><b>Hosting and database</b> (our cloud host) to run the app.</li><li><b>Email delivery</b> (Resend) to send emails you've asked for, if you add an email.</li>
        <li><b>Market data</b> is fetched by our server; your personal information is not sent to data providers.</li></ul>
      <p>We may disclose information if required by law or to protect the safety of users or the service.</p>
      <h2>Leaderboards</h2><p>If you appear on the leaderboard, other users can see your username, avatar and XP. You can hide yourself in Settings.</p>
      <h2>Children</h2><p>${x.name} is not for children under 13. If you believe a child under 13 created an account, contact us and we'll delete it. Users aged 13-17 should have a parent or guardian's permission.</p>
      <h2>Your rights</h2><p>Everyone can, at any time:</p><ul><li><b>Access / export</b> their data (Settings, "Download my data").</li><li><b>Delete</b> their account and data (Settings, "Delete account").</li>
        <li><b>Correct</b> their email or preferences (Settings).</li><li><b>Opt out</b> of reminder emails (Settings, or the link in any reminder).</li></ul>
      <p>Depending on where you live (for example California, other US states, the EU/UK), you may have additional rights. Contact us at ${contact(x)} and we'll respond within 30 days. We won't treat you differently for exercising your rights.</p>
      <h2>Security</h2><p>Passwords are hashed with bcrypt, one-time links and recovery codes are hashed, sessions use secure httpOnly cookies, connections are encrypted with HTTPS, and admin access is logged. No system is perfectly secure; if we ever learn of a breach affecting your data, we'll notify you as required by law.</p>
      <h2>Changes</h2><p>We'll post updates here and change the date above. Significant changes will be announced on the site.</p>
      <h2>Contact</h2><p>${contact(x)}${x.addr ? ` · ${x.entity}, ${x.addr}` : ''}</p>`,

    disclaimer: (x) => `
      <h1>Disclaimer</h1><p class="muted">Last updated ${UPDATED}</p>
      <div class="note">${UI.speech({ who: 'grizz', mood: 'warn', say: "Read this one. I mean it." }, 56)}</div>
      <h2>Not financial advice</h2><p>${x.name} is an educational game. Nothing on this site is a recommendation or solicitation to buy or sell any security, derivative, cryptocurrency or other financial product, and nothing is personalized to your situation. We are not registered as an investment adviser, broker-dealer or commodity trading advisor.</p>
      <h2>Simulated results</h2><p>All portfolios, trades, bot results and leaderboard numbers use fake money. Simulated trading has built-in limits: no real fills, no real slippage, no real fear. Results do not predict real-world performance.</p>
      <h2>The bot and strategy signals</h2><p>"Bolt the Bot" and the strategy signals follow fixed, published rules applied to market data. They are not artificial intelligence, they don't know the future, and they are teaching tools, not trading recommendations.</p>
      <h2>Risk</h2><p>Investing involves risk, including loss of principal. Options, futures, margin and leveraged products carry a high level of risk and can result in losses greater than your initial investment. Many people who actively day-trade lose money.</p>
      <h2>Accuracy</h2><p>We try hard to keep lessons accurate and current, but laws, tax rules, contribution limits, trading hours and market rules change. Always confirm current details with official sources (IRS, SEC, FINRA, CFTC, your broker) or a licensed professional. Market data may be delayed or inaccurate.</p>
      <h2>Questions</h2><p>${contact(x)}</p>`,
  };

  function render(kind) {
    const view = document.getElementById('view');
    view.innerHTML = `<div class="page wrap"><article class="prose card">${PAGES[kind](s())}</article></div>`;
    document.title = `${kind[0].toUpperCase()}${kind.slice(1)} · TradeIQ`;
  }
  return { render };
})();

const Utility = (() => {
  function resetPassword(q) {
    const token = q.get('token') || '';
    const view = document.getElementById('view');
    view.innerHTML = `<div class="page wrap" style="max-width:520px"><div class="card">
      ${UI.speech({ who: 'hoot', mood: 'think', say: 'Pick a new password. Make it long, a short phrase works great.' }, 60)}
      <h2>Choose a new password</h2>
      <form><div class="form-error" hidden></div>
        <label class="field"><span>New password</span><input type="password" name="password" autocomplete="new-password" /></label>
        <button class="btn btn-primary btn-block" type="submit">Save password</button></form></div></div>`;
    const form = view.querySelector('form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button');
      UI.setBusy(btn, true);
      try {
        const r = await api.post('/auth/reset-password', { token, password: form.password.value });
        UI.toast(r.message, 'success', { ms: 6000 });
        App.go('/login');
      } catch (err) {
        const box = form.querySelector('.form-error');
        box.textContent = err.message;
        box.hidden = false;
      } finally {
        UI.setBusy(btn, false);
      }
    });
  }

  function unsubscribe(q) {
    const token = q.get('token') || '';
    const view = document.getElementById('view');
    view.innerHTML = `<div class="page wrap" style="max-width:520px"><div class="card" style="text-align:center">
      ${Sprites.character('penny', 96)}<h2>Unsubscribe from reminders?</h2>
      <p class="muted">You'll stop getting streak reminders and weekly digests. Security emails, like password resets, still come through.</p>
      <button class="btn btn-primary" data-go>Unsubscribe</button><div data-out style="margin-top:14px"></div></div></div>`;
    view.querySelector('[data-go]').onclick = async (e) => {
      UI.setBusy(e.currentTarget, true);
      try {
        const r = await fetch(`/api/email/unsubscribe?token=${encodeURIComponent(token)}`, { method: 'POST' }).then((x) => x.json());
        view.querySelector('[data-out]').innerHTML = `<div class="${r.error ? 'form-error' : 'form-ok'}">${escapeHtml(r.error || r.message)}</div>`;
        e.currentTarget.remove();
      } catch {
        UI.setBusy(e.currentTarget, false);
      }
    };
  }

  return { resetPassword, unsubscribe };
})();

window.Legal = Legal;
window.Utility = Utility;
