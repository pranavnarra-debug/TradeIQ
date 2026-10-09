import dotenv from 'dotenv';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

function required(name, { minLength = 1 } = {}) {
  const v = process.env[name];
  if (!v || v.length < minLength) {
    const msg = `Missing or too-short env var ${name}${minLength > 1 ? ` (need ${minLength}+ chars)` : ''}`;
    if (isProd) throw new Error(msg);
    console.warn(`[config] ${msg} — using an insecure dev default. Never do this in production.`);
    return null;
  }
  return v;
}

const accessSecret = required('JWT_ACCESS_SECRET', { minLength: 32 }) || 'dev-only-access-secret-change-me-0000000000';
const examSecret = process.env.JWT_EXAM_SECRET || `${accessSecret}:exam`;

if (!process.env.DATABASE_URL && isProd) throw new Error('DATABASE_URL is required');

const appUrl = (process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3001').replace(/\/$/, '');

export const config = {
  isProd,
  port: Number(process.env.PORT) || 3001,
  appUrl,
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    accessSecret,
    examSecret,
    accessTtl: '15m',
    issuer: 'tradeiq',
  },
  refreshTtlDays: 30,
  cookieSecure: isProd || appUrl.startsWith('https://'),
  email: {
    resendApiKey: process.env.RESEND_API_KEY || null,
    from: process.env.EMAIL_FROM || 'TradeIQ <onboarding@resend.dev>',
    replyTo: process.env.EMAIL_REPLY_TO || null,
  },
  // Shown in the footer of legal pages and every email. CAN-SPAM requires a
  // valid physical postal address in commercial email.
  site: {
    name: process.env.SITE_NAME || 'TradeIQ',
    legalEntity: process.env.LEGAL_ENTITY || 'TradeIQ',
    contactEmail: process.env.CONTACT_EMAIL || '',
    postalAddress: process.env.POSTAL_ADDRESS || '',
    governingState: process.env.GOVERNING_STATE || '',
  },
  termsVersion: '2026-10',
};

export default config;
