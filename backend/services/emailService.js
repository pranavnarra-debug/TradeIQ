import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
}

function wrapEmailHtml({ heading, bodyHtml, buttonText, buttonUrl, warningText }) {
  return `
  <div style="background:#0d1117;padding:32px;font-family:Inter,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#161b22;border:1px solid #30363d;border-radius:8px;overflow:hidden;">
      <div style="background:#0d1117;padding:24px;text-align:center;border-bottom:1px solid #30363d;">
        <span style="color:#58a6ff;font-size:22px;font-weight:700;">📈 TradeIQ</span>
      </div>
      <div style="padding:32px;color:#e6edf3;">
        <h2 style="color:#e6edf3;margin-top:0;">${heading}</h2>
        <div style="color:#c9d1d9;font-size:15px;line-height:1.6;">${bodyHtml}</div>
        ${
          buttonUrl
            ? `<div style="text-align:center;margin:28px 0;">
                <a href="${buttonUrl}" style="background:#58a6ff;color:#0d1117;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block;">${buttonText}</a>
              </div>`
            : ''
        }
        ${
          warningText
            ? `<p style="color:#f85149;font-size:13px;margin-top:24px;">⚠️ ${warningText}</p>`
            : ''
        }
        <p style="color:#8b949e;font-size:12px;margin-top:24px;border-top:1px solid #30363d;padding-top:16px;">
          If you didn't request this, you can safely ignore this email. TradeIQ is an educational paper-trading platform — no real money or brokerage accounts are involved.
        </p>
      </div>
    </div>
  </div>`;
}

export async function sendVerificationEmail(toEmail, token) {
  const verifyUrl = `${process.env.FRONTEND_URL}/api/auth/verify-email/${token}`;
  const html = wrapEmailHtml({
    heading: 'Verify your email',
    bodyHtml: `<p>Welcome to TradeIQ! Click the button below to verify your email address and activate your account.</p>`,
    buttonText: 'Verify Email',
    buttonUrl: verifyUrl,
    warningText: 'This link does not expire, but you should verify promptly to access your account.',
  });

  return getTransporter().sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: 'Verify your TradeIQ account',
    html,
  });
}

export async function sendPasswordResetEmail(toEmail, token) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const html = wrapEmailHtml({
    heading: 'Reset your password',
    bodyHtml: `<p>We received a request to reset your TradeIQ password. Click the button below to choose a new password.</p>`,
    buttonText: 'Reset Password',
    buttonUrl: resetUrl,
    warningText: 'This link expires in 1 hour. If you did not request a password reset, please secure your account.',
  });

  return getTransporter().sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: 'Reset your TradeIQ password',
    html,
  });
}

export default { sendVerificationEmail, sendPasswordResetEmail };
