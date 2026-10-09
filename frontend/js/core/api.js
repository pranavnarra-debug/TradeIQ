/* ============================================================
   TradeIQ — api.js
   Fetch wrapper + session. The access token lives in memory only;
   the refresh token is an httpOnly cookie JavaScript can't read,
   so an XSS bug can't steal a long-lived session.
   ============================================================ */

/** Escape untrusted text before putting it into innerHTML. */
function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
window.escapeHtml = escapeHtml;

const Session = (() => {
  let accessToken = null;
  let user = null;
  let refreshing = null;
  const listeners = new Set();

  function emit() { listeners.forEach((fn) => fn(user)); }

  function set(token, u) {
    accessToken = token;
    user = u;
    emit();
  }

  function setUser(u) {
    user = u;
    emit();
  }

  function clear() {
    accessToken = null;
    user = null;
    emit();
  }

  async function refresh() {
    if (refreshing) return refreshing;
    refreshing = (async () => {
      const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' } });
      if (!res.ok || res.status === 204) throw new Error('No session');
      const data = await res.json();
      set(data.accessToken, data.user);
      return data.accessToken;
    })();
    try {
      return await refreshing;
    } finally {
      refreshing = null;
    }
  }

  return {
    get token() { return accessToken; },
    get user() { return user; },
    isLoggedIn: () => Boolean(user),
    set, setUser, clear, refresh,
    onChange: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
  };
})();

async function _request(method, path, body, retried = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (Session.token) headers.Authorization = `Bearer ${Session.token}`;

  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers,
      credentials: 'same-origin',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Can't reach the server. Check your connection.");
  }

  if (res.status === 401 && !retried && !path.startsWith('/auth/')) {
    try {
      await Session.refresh();
      return _request(method, path, body, true);
    } catch {
      const wasIn = Session.isLoggedIn();
      Session.clear();
      if (wasIn) window.dispatchEvent(new CustomEvent('session-expired'));
      const err = new Error('Please log in to continue');
      err.status = 401;
      err.code = 'AUTH_REQUIRED';
      throw err;
    }
  }

  let data = null;
  if ((res.headers.get('content-type') || '').includes('application/json')) {
    data = await res.json().catch(() => null);
  }
  if (!res.ok) {
    const err = new Error((data && data.error) || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    err.field = data && data.field;
    err.code = data && data.code;
    throw err;
  }
  return data;
}

const api = {
  get: (p) => _request('GET', p),
  post: (p, b) => _request('POST', p, b ?? {}),
  put: (p, b) => _request('PUT', p, b ?? {}),
  patch: (p, b) => _request('PATCH', p, b ?? {}),
  delete: (p, b) => _request('DELETE', p, b),
};

// Back-compat shim for the older feature modules.
const auth = {
  getAccessToken: () => Session.token,
  getUser: () => Session.user,
  isAuthenticated: () => Session.isLoggedIn(),
};

window.api = api;
window.auth = auth;
window.Session = Session;
