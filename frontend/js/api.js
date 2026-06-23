/* ============================================================
   TradeIQ — api.js
   Fetch wrapper with automatic JWT refresh.
   Access token lives in memory only; refresh token in localStorage.
   ============================================================ */

const API_BASE = '/api';
const REFRESH_TOKEN_KEY = 'tradeiq_refresh_token';
const USER_KEY = 'tradeiq_user';

let _accessToken = null;
let _refreshInFlight = null;

function _getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function _setRefreshToken(token) {
  if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
  else localStorage.removeItem(REFRESH_TOKEN_KEY);
}

const auth = {
  setTokens(accessToken, refreshToken) {
    _accessToken = accessToken;
    _setRefreshToken(refreshToken);
  },
  setUser(user) {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  },
  getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  getAccessToken() {
    return _accessToken;
  },
  clearTokens() {
    _accessToken = null;
    _setRefreshToken(null);
    localStorage.removeItem(USER_KEY);
  },
  isAuthenticated() {
    return Boolean(_getRefreshToken());
  },
};

async function _refreshAccessToken() {
  // De-dupe concurrent refresh attempts
  if (_refreshInFlight) return _refreshInFlight;

  _refreshInFlight = (async () => {
    const refreshToken = _getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');

    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      throw new Error('Refresh failed');
    }

    const data = await res.json();
    _accessToken = data.accessToken;
    _setRefreshToken(data.refreshToken);
    return data.accessToken;
  })();

  try {
    return await _refreshInFlight;
  } finally {
    _refreshInFlight = null;
  }
}

function _handleLogoutRedirect() {
  auth.clearTokens();
  window.dispatchEvent(new CustomEvent('logout'));
}

async function _request(method, path, body, _isRetry = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (_accessToken) headers.Authorization = `Bearer ${_accessToken}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error('Network error — please check your connection');
  }

  if (res.status === 401 && !_isRetry) {
    try {
      await _refreshAccessToken();
      return _request(method, path, body, true);
    } catch {
      _handleLogoutRedirect();
      throw new Error('Session expired, please log in again');
    }
  }

  let data = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => null);
  }

  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

const api = {
  get(path) {
    return _request('GET', path);
  },
  post(path, body) {
    return _request('POST', path, body ?? {});
  },
  patch(path, body) {
    return _request('PATCH', path, body ?? {});
  },
  delete(path) {
    return _request('DELETE', path);
  },
};

window.api = api;
window.auth = auth;
