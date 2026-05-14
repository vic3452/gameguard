const jwt           = require('jsonwebtoken');
const { UAParser }  = require('ua-parser-js');
const { authenticator } = require('otplib');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'gameguard_default_secret_32_chars_long_!#@';

// Set TOTP options once at module load — avoids per-call global mutation
authenticator.options = { step: 600, window: 1 };

const generateToken = (userId, expiresIn = process.env.JWT_EXPIRES_IN || '7d') =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn });

const parseDevice = (userAgentString = '') => {
  const result = new UAParser(userAgentString).getResult();
  return {
    browser:   `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
    os:        `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
    device:    result.device.type || 'desktop',
    userAgent: userAgentString,
  };
};

const getClientIP = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
  req.headers['x-real-ip'] ||
  req.connection?.remoteAddress ||
  req.socket?.remoteAddress ||
  '0.0.0.0';

const generateOTP = (secret) => authenticator.generate(secret);

const verifyOTP = (token, secret) => {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
};

const evaluatePasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8)           score += 20;
  if (password.length >= 12)          score += 10;
  if (/[A-Z]/.test(password))         score += 20;
  if (/[0-9]/.test(password))         score += 20;
  if (/[@$!%*?&^#]/.test(password))   score += 30;
  return score;
};

module.exports = { generateToken, parseDevice, getClientIP, generateOTP, verifyOTP, evaluatePasswordStrength, uuidv4 };
