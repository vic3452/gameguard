/**
 * Email Service (Nodemailer)
 * Sends security alert emails and 2FA OTPs
 */

const nodemailer = require('nodemailer');

const createTransport = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT) || 2525,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const FROM = process.env.EMAIL_FROM || 'GAMEGUARD <noreply@gameguard.io>';

/**
 * Send a 2FA OTP email
 */
const send2FAEmail = async (email, otp) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[DEV] Email suppressed (no credentials). Code for ${email}: ${otp}`);
    return;
  }
  const transporter = createTransport();
  await transporter.sendMail({
    from:    FROM,
    to:      email,
    subject: '🛡️ GAMEGUARD — Your Login Verification Code',
    html: `
      <div style="background:#0d0d1a;color:#e0e0ff;font-family:monospace;padding:32px;border-radius:12px;max-width:480px">
        <h2 style="color:#7c3aed;margin-top:0">🛡️ GAMEGUARD</h2>
        <p>Your one-time verification code:</p>
        <div style="background:#1a1a2e;border:2px solid #7c3aed;border-radius:8px;padding:16px;text-align:center;font-size:36px;letter-spacing:12px;color:#a78bfa;margin:24px 0">
          ${otp}
        </div>
        <p style="color:#6b7280;font-size:14px">This code expires in 10 minutes. Never share it with anyone.</p>
        <p style="color:#6b7280;font-size:12px">If you did not request this, secure your account immediately.</p>
      </div>
    `,
  });
};

/**
 * Send a security alert email
 */
const sendAlertEmail = async (email, alert) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return;
  }
  const transporter = createTransport();
  const severityColor = { low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626' };
  const color = severityColor[alert.severity] || '#7c3aed';

  await transporter.sendMail({
    from:    FROM,
    to:      email,
    subject: `🚨 GAMEGUARD Alert: ${alert.title}`,
    html: `
      <div style="background:#0d0d1a;color:#e0e0ff;font-family:monospace;padding:32px;border-radius:12px;max-width:480px">
        <h2 style="color:#7c3aed;margin-top:0">🛡️ GAMEGUARD Security Alert</h2>
        <div style="border-left:4px solid ${color};padding-left:16px;margin:16px 0">
          <h3 style="color:${color};margin:0 0 8px">${alert.title}</h3>
          <p style="margin:0;color:#c4c4e0">${alert.message}</p>
        </div>
        <p style="color:#6b7280;font-size:13px">Time: ${new Date().toUTCString()}</p>
        <p style="color:#6b7280;font-size:12px">
          If this wasn't you, log into GAMEGUARD immediately and change your password.
        </p>
      </div>
    `,
  });
};

module.exports = { send2FAEmail, sendAlertEmail };
