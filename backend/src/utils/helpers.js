/**
 * Utility Functions
 * JWT generation, device parsing, OTP
 */

const jwt = require('jsonwebtoken');
const { UAParser } = require('ua-parser-js');
const { authenticator } = require('otplib');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'gameguard_default_secret_32_chars_long_!#@';

/**
 * Generate a signed JWT
 */
const generateToken = (userId, expiresIn = process.env.JWT_EXPIRES_IN || '7d') => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn });
};

/**
 * Parse device info from User-Agent header
 */
const parseDevice = (userAgentString = '') => {
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();
  return {
    browser:   `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
    os:        `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
    device:    result.device.type || 'desktop',
    userAgent: userAgentString,
  };
};

/**
 * Get client IP from request (handles proxies)
 */
const getClientIP = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    '0.0.0.0'
  );
};

/**
 * Generate a 6-digit TOTP code using otplib
 */
const generateOTP = (secret) => {
  authenticator.options = { step: 600 }; // 10-min window
  return authenticator.generate(secret);
};

/**
 * Verify OTP code
 */
const verifyOTP = (token, secret) => {
  try {
    authenticator.options = { step: 600, window: 1 };
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
};

/**
 * Evaluate password strength score (0–100)
 */
const evaluatePasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8)  score += 20;
  if (password.length >= 12) score += 10;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 20;
  if (/[@$!%*?&^#]/.test(password)) score += 30;
  return score;
};

module.exports = { generateToken, parseDevice, getClientIP, generateOTP, verifyOTP, evaluatePasswordStrength, uuidv4 };
