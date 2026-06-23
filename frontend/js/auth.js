/* ============================================================
   TradeIQ — auth.js
   Login, register, email verification, forgot/reset password
   ============================================================ */

const AuthScreens = (() => {
  let usernameCheckTimer = null;

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function passwordStrength(password) {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 20, label: 'Weak', color: 'var(--red)' };
    if (score === 2) return { score: 45, label: 'Fair', color: '#d29922' };
    if (score <= 4) return { score: 75, label: 'Strong', color: 'var(--accent)' };
    return { score: 100, label: 'Very strong', color: 'var(--green)' };
  }

  function renderLogin() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="auth-screen">
        <div class="auth-card">
          <div class="auth-logo"><i class="fa-solid fa-chart-line logo-icon"></i> TradeIQ</div>
          <div class="auth-subtitle">Learn to trade with AI-powered insights</div>
          <h2>Welcome back</h2>
          <div id="auth-banner"></div>
          <form id="login-form">
            <div class="form-group">
              <label>Email</label>
              <input class="input" type="email" id="login-email" required autocomplete="email" />
            </div>
            <div class="form-group">
              <label>Password</label>
              <div class="password-field">
                <input class="input" type="password" id="login-password" required autocomplete="current-password" />
                <button type="button" class="password-toggle" id="login-pw-toggle"><i class="fa-solid fa-eye"></i></button>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-block auth-submit-btn" id="login-submit-btn">
              Login
            </button>
          </form>
          <div class="auth-links">
            <a href="#" id="go-forgot">Forgot Password?</a>
            <a href="#" id="go-register">Create account</a>
          </div>
        </div>
      </div>
    `;

    if (getQueryParam('verified') === 'true') {
      showBanner('success', 'Email verified! You can now log in.');
    } else if (getQueryParam('verified') === 'false') {
      showBanner('error', 'That verification link is invalid or has expired.');
    }

    document.getElementById('login-pw-toggle').addEventListener('click', () => {
      const input = document.getElementById('login-password');
      const icon = document.querySelector('#login-pw-toggle i');
      const isPw = input.type === 'password';
      input.type = isPw ? 'text' : 'password';
      icon.className = isPw ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });

    document.getElementById('go-forgot').addEventListener('click', (e) => { e.preventDefault(); renderForgotPassword(); });
    document.getElementById('go-register').addEventListener('click', (e) => { e.preventDefault(); renderRegister(); });

    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('login-submit-btn');
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Logging in...';

      try {
        const data = await api.post('/auth/login', { email, password });
        auth.setTokens(data.accessToken, data.refreshToken);
        auth.setUser(data.user);
        window.dispatchEvent(new CustomEvent('login-success', { detail: data.user }));
      } catch (err) {
        showBanner('error', err.message || 'Login failed');
        btn.disabled = false;
        btn.innerHTML = 'Login';
      }
    });
  }

  function renderRegister() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="auth-screen">
        <div class="auth-card">
          <div class="auth-logo"><i class="fa-solid fa-chart-line logo-icon"></i> TradeIQ</div>
          <div class="auth-subtitle">Create your free educational trading account</div>
          <h2>Sign up</h2>
          <div id="auth-banner"></div>
          <form id="register-form">
            <div class="form-group">
              <label>Username</label>
              <input class="input" type="text" id="reg-username" required minlength="3" maxlength="20" autocomplete="username" />
              <div class="username-check" id="username-check"></div>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input class="input" type="email" id="reg-email" required autocomplete="email" />
            </div>
            <div class="form-group">
              <label>Password</label>
              <div class="password-field">
                <input class="input" type="password" id="reg-password" required autocomplete="new-password" />
                <button type="button" class="password-toggle" id="reg-pw-toggle"><i class="fa-solid fa-eye"></i></button>
              </div>
              <div class="password-strength"><div class="password-strength-bar" id="strength-bar"></div></div>
              <div class="password-strength-label" id="strength-label"></div>
            </div>
            <div class="form-group">
              <label>Confirm Password</label>
              <input class="input" type="password" id="reg-confirm" required autocomplete="new-password" />
              <div class="match-indicator" id="match-indicator"></div>
            </div>
            <button type="submit" class="btn btn-primary btn-block auth-submit-btn" id="register-submit-btn">
              Create Account
            </button>
          </form>
          <div class="auth-links-centered">
            Already have an account? <a href="#" id="go-login">Log in</a>
          </div>
        </div>
      </div>
    `;

    document.getElementById('reg-pw-toggle').addEventListener('click', () => {
      const input = document.getElementById('reg-password');
      const icon = document.querySelector('#reg-pw-toggle i');
      const isPw = input.type === 'password';
      input.type = isPw ? 'text' : 'password';
      icon.className = isPw ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });

    document.getElementById('go-login').addEventListener('click', (e) => { e.preventDefault(); renderLogin(); });

    const usernameInput = document.getElementById('reg-username');
    usernameInput.addEventListener('input', () => {
      clearTimeout(usernameCheckTimer);
      const val = usernameInput.value.trim();
      const checkEl = document.getElementById('username-check');
      if (val.length < 3) {
        checkEl.textContent = '';
        return;
      }
      checkEl.innerHTML = '<span class="spinner"></span> checking...';
      usernameCheckTimer = setTimeout(async () => {
        try {
          const res = await api.get(`/auth/check-username?username=${encodeURIComponent(val)}`);
          checkEl.innerHTML = res.available
            ? '<span class="text-green"><i class="fa-solid fa-check"></i> Available</span>'
            : '<span class="text-red"><i class="fa-solid fa-xmark"></i> Already taken</span>';
        } catch {
          checkEl.textContent = '';
        }
      }, 450);
    });

    const pwInput = document.getElementById('reg-password');
    const confirmInput = document.getElementById('reg-confirm');

    function updateStrength() {
      const { score, label, color } = passwordStrength(pwInput.value);
      const bar = document.getElementById('strength-bar');
      bar.style.width = `${score}%`;
      bar.style.background = color;
      document.getElementById('strength-label').textContent = label;
    }
    function updateMatch() {
      const indicator = document.getElementById('match-indicator');
      if (!confirmInput.value) { indicator.textContent = ''; return; }
      if (pwInput.value === confirmInput.value) {
        indicator.innerHTML = '<span class="text-green"><i class="fa-solid fa-check"></i> Passwords match</span>';
      } else {
        indicator.innerHTML = '<span class="text-red"><i class="fa-solid fa-xmark"></i> Passwords do not match</span>';
      }
    }

    pwInput.addEventListener('input', () => { updateStrength(); updateMatch(); });
    confirmInput.addEventListener('input', updateMatch);

    document.getElementById('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('register-submit-btn');
      const username = usernameInput.value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = pwInput.value;
      const confirm = confirmInput.value;

      if (password !== confirm) {
        showBanner('error', 'Passwords do not match');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Creating account...';

      try {
        await api.post('/auth/register', { username, email, password });
        renderCheckEmailMessage(email);
      } catch (err) {
        showBanner('error', err.message || 'Registration failed');
        btn.disabled = false;
        btn.innerHTML = 'Create Account';
      }
    });
  }

  function renderCheckEmailMessage(email) {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="auth-screen">
        <div class="auth-card">
          <div class="auth-logo"><i class="fa-solid fa-chart-line logo-icon"></i> TradeIQ</div>
          <div class="auth-message-screen">
            <i class="fa-solid fa-envelope-circle-check"></i>
            <h2>Check your email</h2>
            <p>We sent a verification link to <strong>${escapeHtml(email)}</strong>. Click the link to activate your account, then come back here to log in.</p>
            <button class="btn btn-primary" id="back-to-login-btn" style="margin-top: 16px;">Back to Login</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('back-to-login-btn').addEventListener('click', renderLogin);
  }

  function renderForgotPassword() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="auth-screen">
        <div class="auth-card">
          <div class="auth-logo"><i class="fa-solid fa-chart-line logo-icon"></i> TradeIQ</div>
          <h2>Reset your password</h2>
          <div class="auth-subtitle">Enter your email and we'll send you a reset link.</div>
          <div id="auth-banner"></div>
          <form id="forgot-form">
            <div class="form-group">
              <label>Email</label>
              <input class="input" type="email" id="forgot-email" required autocomplete="email" />
            </div>
            <button type="submit" class="btn btn-primary btn-block" id="forgot-submit-btn">Send Reset Link</button>
          </form>
          <div class="auth-links-centered">
            <a href="#" id="back-login">Back to login</a>
          </div>
        </div>
      </div>
    `;

    document.getElementById('back-login').addEventListener('click', (e) => { e.preventDefault(); renderLogin(); });

    document.getElementById('forgot-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('forgot-submit-btn');
      const email = document.getElementById('forgot-email').value.trim();
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Sending...';
      try {
        await api.post('/auth/forgot-password', { email });
        showBanner('success', "If that email exists, a reset link was sent");
        btn.disabled = false;
        btn.innerHTML = 'Send Reset Link';
      } catch (err) {
        showBanner('error', err.message || 'Something went wrong');
        btn.disabled = false;
        btn.innerHTML = 'Send Reset Link';
      }
    });
  }

  function renderResetPassword(token) {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="auth-screen">
        <div class="auth-card">
          <div class="auth-logo"><i class="fa-solid fa-chart-line logo-icon"></i> TradeIQ</div>
          <h2>Choose a new password</h2>
          <div id="auth-banner"></div>
          <form id="reset-form">
            <div class="form-group">
              <label>New Password</label>
              <input class="input" type="password" id="reset-password" required />
            </div>
            <div class="form-group">
              <label>Confirm New Password</label>
              <input class="input" type="password" id="reset-confirm" required />
            </div>
            <button type="submit" class="btn btn-primary btn-block" id="reset-submit-btn">Reset Password</button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('reset-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('reset-submit-btn');
      const password = document.getElementById('reset-password').value;
      const confirm = document.getElementById('reset-confirm').value;

      if (password !== confirm) {
        showBanner('error', 'Passwords do not match');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Resetting...';
      try {
        await api.post('/auth/reset-password', { token, password });
        showBanner('success', 'Password reset! Redirecting to login...');
        setTimeout(renderLogin, 1500);
      } catch (err) {
        showBanner('error', err.message || 'Reset failed');
        btn.disabled = false;
        btn.innerHTML = 'Reset Password';
      }
    });
  }

  function showBanner(type, message) {
    const el = document.getElementById('auth-banner');
    if (!el) return;
    el.innerHTML = `<div class="auth-${type === 'success' ? 'success' : 'error'}-banner">${escapeHtml(message)}</div>`;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function init() {
    const resetToken = getQueryParam('token');
    if (window.location.pathname === '/reset-password' && resetToken) {
      renderResetPassword(resetToken);
    } else {
      renderLogin();
    }
  }

  return { init, renderLogin, renderRegister, renderForgotPassword, renderResetPassword };
})();

window.AuthScreens = AuthScreens;
