// Input validation shared by routes. Each helper returns an error message
// string, or null when the value is fine.

export const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]{2,}$/;
const RESERVED = new Set([
  'admin', 'administrator', 'root', 'support', 'help', 'tradeiq', 'moderator', 'mod', 'system',
  'staff', 'official', 'security', 'null', 'undefined', 'chip', 'grizz', 'hoot', 'penny', 'bolt',
]);

// Short list of the most-guessed passwords. NIST 800-63B recommends blocking
// known-bad passwords instead of forcing "1 uppercase + 1 number" rules,
// which mostly produce "Password1".
const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password123', '12345678', '123456789', '1234567890', 'qwerty123',
  'qwertyuiop', 'iloveyou', 'sunshine1', 'football', 'baseball', 'welcome1', 'admin123',
  'letmein1', 'monkey123', 'dragon123', 'abc12345', '11111111', '00000000', 'passw0rd',
  'trustno1', 'princess1', 'starwars', 'whatever', 'computer', 'tradeiq1', 'tradeiq123',
  'stocks123', 'money123', 'bitcoin1', 'qwerty12', 'asdfghjk', 'zaq12wsx', 'superman',
]);

export function usernameProblem(username) {
  if (typeof username !== 'string' || !USERNAME_RE.test(username)) {
    return 'Usernames are 3-20 letters, numbers or underscores';
  }
  if (RESERVED.has(username.toLowerCase())) return 'That username is reserved';
  return null;
}

export function passwordProblem(password, username) {
  if (typeof password !== 'string' || !password) return 'Password is required';
  if (password.length < 8) return 'Use at least 8 characters';
  // bcrypt silently ignores everything past 72 bytes.
  if (Buffer.byteLength(password, 'utf8') > 72) return 'Password is too long (72 bytes max)';
  if (COMMON_PASSWORDS.has(password.toLowerCase())) return 'That password is on every hacker\'s list. Pick another';
  if (username && password.toLowerCase().includes(String(username).toLowerCase())) return "Password can't contain your username";
  if (/^(.)\1+$/.test(password)) return 'Password needs more variety';
  return null;
}

export function emailProblem(email) {
  if (typeof email !== 'string' || email.length > 254 || !EMAIL_RE.test(email)) return 'Enter a valid email address';
  return null;
}

export function normalizeEmail(email) {
  return String(email).trim();
}

const SYMBOL_RE = /^[A-Z0-9.^=-]{1,12}$/;
export function cleanSymbol(raw) {
  const s = String(raw || '').trim().toUpperCase();
  return SYMBOL_RE.test(s) ? s : null;
}

export function isValidTimezone(tz) {
  if (typeof tz !== 'string' || tz.length > 64) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function clampText(value, max) {
  if (value == null) return null;
  return String(value).slice(0, max);
}
