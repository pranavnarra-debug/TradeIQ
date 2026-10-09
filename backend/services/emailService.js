import { config } from '../config.js';
import { query } from '../db/pool.js';

const RESEND_API_URL = 'https://api.resend.com/emails';

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Email clients ignore <style> blocks and web fonts, so everything is inline
// and the "brand" is carried by color, the chunky border and the button.
function layout({ preheader, heading, bodyHtml, button, footerNote, unsubscribeUrl }) {
  const s = config.site;
  return `<!doctype html><html><body style="margin:0;background:#f6efe1;">
  <span style="display:none;max-height:0;overflow:hidden;">${esc(preheader || '')}</span>
  <div style="padding:28px 12px;font-family:Arial,Helvetica,sans-serif;color:#17140f;">
    <div style="max-width:520px;margin:0 auto;background:#fffaf0;border:3px solid #17140f;border-radius:14px;box-shadow:6px 6px 0 #17140f;">
      <div style="padding:18px 24px;border-bottom:3px solid #17140f;background:#ffd23f;border-radius:11px 11px 0 0;">
        <span style="font-size:20px;font-weight:800;letter-spacing:-0.5px;">TradeIQ</span>
      </div>
      <div style="padding:26px 24px 8px;">
        <h1 style="margin:0 0 12px;font-size:24px;line-height:1.2;">${esc(heading)}</h1>
        <div style="font-size:16px;line-height:1.55;">${bodyHtml}</div>
        ${button ? `<div style="margin:26px 0 18px;"><a href="${esc(button.url)}" style="display:inline-block;background:#1fbf75;color:#17140f;border:3px solid #17140f;border-radius:10px;padding:12px 22px;font-weight:800;text-decoration:none;box-shadow:3px 3px 0 #17140f;">${esc(button.text)}</a></div>
        <p style="font-size:12px;color:#6b6252;word-break:break-all;">Button not working? Paste this into your browser:<br>${esc(button.url)}</p>` : ''}
      </div>
      <div style="padding:14px 24px 20px;border-top:2px dashed #d8ccb4;font-size:12px;color:#6b6252;line-height:1.5;">
        ${footerNote ? `<p style="margin:0 0 8px;">${footerNote}</p>` : ''}
        <p style="margin:0 0 6px;">${esc(s.name)} is an education site with simulated (paper) trading only. Nothing in this email is financial advice.</p>
        ${s.postalAddress ? `<p style="margin:0 0 6px;">${esc(s.legalEntity)} &middot; ${esc(s.postalAddress)}</p>` : ''}
        ${unsubscribeUrl ? `<p style="margin:0;"><a href="${esc(unsubscribeUrl)}" style="color:#6b6252;">Unsubscribe from reminders</a></p>` : ''}
      </div>
    </div>
  </div></body></html>`;
}

async function logEmail(userId, kind, status, providerId, error) {
  try {
    await query(
      'INSERT INTO email_log (user_id, kind, status, provider_id, error) VALUES ($1, $2, $3, $4, $5)',
      [userId ?? null, kind, status, providerId ?? null, error ? String(error).slice(0, 500) : null]
    );
  } catch (err) {
    console.error('[email] failed to write email_log:', err.message);
  }
}

/**
 * Sends through Resend's HTTPS API (avoids SMTP port blocks on hosts like
 * Railway). Without RESEND_API_KEY (local dev) the email is printed to the
 * console instead so links can still be clicked.
 */
async function send({ userId, kind, to, subject, html, unsubscribeUrl }) {
  if (!to) return { skipped: true };
  if (!config.email.resendApiKey) {
    const link = /href="([^"]+)"/.exec(html)?.[1];
    console.log(`[email:dev] ${kind} -> ${to}: "${subject}"${link ? `\n           link: ${link.replace(/&amp;/g, '&')}` : ''}`);
    await logEmail(userId, kind, 'skipped', null, 'RESEND_API_KEY not set (dev mode)');
    return { skipped: true };
  }

  const headers = {};
  if (unsubscribeUrl) {
    // RFC 8058 one-click unsubscribe; Gmail and Yahoo require it for bulk senders.
    headers['List-Unsubscribe'] = `<${unsubscribeUrl}>`;
    headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.email.resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: config.email.from,
        to: [to],
        subject,
        html,
        reply_to: config.email.replyTo || undefined,
        headers: Object.keys(headers).length ? headers : undefined,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Resend ${res.status}: ${body.slice(0, 300)}`);
    }
    const data = await res.json().catch(() => ({}));
    await logEmail(userId, kind, 'sent', data.id);
    return data;
  } catch (err) {
    console.error(`[email] ${kind} failed:`, err.message);
    await logEmail(userId, kind, 'failed', null, err.message);
    return { error: err.message };
  }
}

const url = (p) => `${config.appUrl}${p}`;
export const unsubscribeUrl = (token) => url(`/api/email/unsubscribe?token=${encodeURIComponent(token)}`);

export function sendVerifyEmail(user, to, token) {
  return send({
    userId: user.id,
    kind: 'verify_email',
    to,
    subject: 'Confirm your email for TradeIQ',
    html: layout({
      preheader: 'One click and your account has a backup key.',
      heading: `Hey ${user.username}, confirm this is you`,
      bodyHtml: `<p>You added this email to your TradeIQ account. Confirming it lets you reset your password if you ever forget it.</p><p>This link works for 24 hours.</p>`,
      button: { text: 'Confirm my email', url: url(`/api/auth/verify-email?token=${token}`) },
      footerNote: "Didn't add this email? Ignore this message and nothing changes.",
    }),
  });
}

export function sendWelcomeEmail(user, to) {
  return send({
    userId: user.id,
    kind: 'welcome',
    to,
    subject: "You're in. Here's where to start.",
    html: layout({
      preheader: 'Your first lesson takes about 10 minutes.',
      heading: 'Email confirmed. Welcome aboard!',
      bodyHtml: `<p>Chip the bull has been pacing around waiting for you.</p>
        <p>Start with <strong>Unit 1: Money Moves</strong>. It covers how money actually flows, banking, investing basics, market hours and passive income, one bite-sized lesson at a time.</p>
        <p>Do one lesson a day and your streak starts climbing.</p>`,
      button: { text: 'Start my first lesson', url: url('/learn') },
    }),
  });
}

export function sendPasswordResetEmail(user, to, token) {
  return send({
    userId: user.id,
    kind: 'password_reset',
    to,
    subject: 'Reset your TradeIQ password',
    html: layout({
      preheader: 'This link expires in 1 hour.',
      heading: 'Password reset requested',
      bodyHtml: `<p>Someone (hopefully you) asked to reset the password for <strong>${esc(user.username)}</strong>.</p><p>The link expires in 1 hour and works once.</p>`,
      button: { text: 'Choose a new password', url: url(`/reset-password?token=${token}`) },
      footerNote: "If this wasn't you, you can ignore this. Your password stays the same.",
    }),
  });
}

export function sendSecurityNotice(user, to, what) {
  return send({
    userId: user.id,
    kind: 'security_notice',
    to,
    subject: `TradeIQ security notice: ${what}`,
    html: layout({
      preheader: what,
      heading: 'Account change',
      bodyHtml: `<p>This is a heads-up that the following just happened on <strong>${esc(user.username)}</strong>:</p><p style="font-weight:700;">${esc(what)}</p><p>If that was you, you're all set. If it wasn't, reset your password right away${config.site.contactEmail ? ` and contact ${esc(config.site.contactEmail)}` : ''}.</p>`,
    }),
  });
}

export function sendStreakReminder(user, to, unsubToken) {
  const unsub = unsubscribeUrl(unsubToken);
  return send({
    userId: user.id,
    kind: 'streak_reminder',
    to,
    subject: `Your ${user.streak_current}-day streak ends at midnight`,
    html: layout({
      preheader: 'One short lesson keeps it alive.',
      heading: `${user.streak_current} days and counting`,
      bodyHtml: `<p>You haven't done a lesson today, and Chip is getting nervous. One quick lesson keeps your streak alive.</p>`,
      button: { text: 'Keep my streak', url: url('/learn') },
      footerNote: "You're getting this because you turned on streak reminders.",
      unsubscribeUrl: unsub,
    }),
    unsubscribeUrl: unsub,
  });
}

export function sendWeeklyDigest(user, to, stats, unsubToken) {
  const unsub = unsubscribeUrl(unsubToken);
  return send({
    userId: user.id,
    kind: 'weekly_digest',
    to,
    subject: `Your week on TradeIQ: ${stats.weekXp} XP`,
    html: layout({
      preheader: `${stats.lessonsThisWeek} lessons, ${stats.weekXp} XP this week.`,
      heading: 'Your week in review',
      bodyHtml: `<table style="width:100%;border-collapse:collapse;font-size:15px;">
          <tr><td style="padding:6px 0;">XP earned</td><td style="text-align:right;font-weight:800;">${stats.weekXp}</td></tr>
          <tr><td style="padding:6px 0;">Lessons finished</td><td style="text-align:right;font-weight:800;">${stats.lessonsThisWeek}</td></tr>
          <tr><td style="padding:6px 0;">Current streak</td><td style="text-align:right;font-weight:800;">${stats.streak} days</td></tr>
          <tr><td style="padding:6px 0;">Total lessons</td><td style="text-align:right;font-weight:800;">${stats.totalLessons} / ${stats.lessonCount}</td></tr>
        </table>
        ${stats.nextLessonTitle ? `<p style="margin-top:18px;">Up next: <strong>${esc(stats.nextLessonTitle)}</strong></p>` : ''}`,
      button: { text: 'Keep going', url: url('/learn') },
      footerNote: "You're getting this because you turned on weekly progress emails.",
      unsubscribeUrl: unsub,
    }),
    unsubscribeUrl: unsub,
  });
}

export default {
  sendVerifyEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendSecurityNotice,
  sendStreakReminder,
  sendWeeklyDigest,
};
