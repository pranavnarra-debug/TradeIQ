import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { isAdminRow } from './adminAccess.js';

// One-time secrets (refresh tokens, email links, recovery codes) are stored only
// as SHA-256 hashes. A database leak then doesn't hand out working sessions or
// password-reset links. SHA-256 (not bcrypt) is fine here because the inputs are
// long random values, not human passwords.
export function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

// Human-friendly recovery code: 4 groups of 4 from an alphabet without 0/O/1/I.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function recoveryCode() {
  const bytes = crypto.randomBytes(16);
  let out = '';
  for (let i = 0; i < 16; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
    if (i % 4 === 3 && i < 15) out += '-';
  }
  return out;
}
export function normalizeRecoveryCode(code) {
  return String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function signAccessToken(user) {
  return jwt.sign(
    { userId: user.id, username: user.username, role: isAdminRow(user) ? 'admin' : 'user' },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessTtl, issuer: config.jwt.issuer, algorithm: 'HS256' }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret, { algorithms: ['HS256'], issuer: config.jwt.issuer });
}

export function signExamToken(payload) {
  return jwt.sign(payload, config.jwt.examSecret, { expiresIn: '2h', issuer: config.jwt.issuer, algorithm: 'HS256' });
}

export function verifyExamToken(token) {
  return jwt.verify(token, config.jwt.examSecret, { algorithms: ['HS256'], issuer: config.jwt.issuer });
}

export function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}
