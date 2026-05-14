/**
 * Auth Controller
 * register, login, verify-2FA, logout, me
 */

const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Alert = require('../models/Alert');
const { send2FAEmail, sendAlertEmail } = require('../services/emailService');
const { analyzeLogin, processThreatFlags, logLoginSuccess, logLoginFailed } = require('../services/securityService');
const { generateToken, parseDevice, getClientIP, generateOTP, verifyOTP, uuidv4 } = require('../utils/helpers');
const { authenticator } = require('otplib');

// ── Register ──────────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ error: 'Username or email already in use.' });
    }

    const user = await User.create({ username, email, password });

    await ActivityLog.create({ userId: user._id, event: 'REGISTER', severity: 'info' });

    const token = generateToken(user._id);
    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) { next(err); }
};

// ── Login ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ip     = getClientIP(req);
    const parsed = parseDevice(req.headers['user-agent']);
    const deviceKey = `${parsed.browser}/${parsed.os}`;

    const user = await User.findOne({ email }).select('+password +twoFactorSecret');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Account lockout check
    if (user.isLocked()) {
      return res.status(423).json({
        error: `Account locked until ${user.lockedUntil.toISOString()}. Too many failed attempts.`,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment failed count
      user.failedLoginCount = (user.failedLoginCount || 0) + 1;
      if (user.failedLoginCount >= 5) {
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min
        await Alert.create({
          userId:   user._id,
          type:     'ACCOUNT_LOCKED',
          title:    '🔒 Account Locked',
          message:  `Your account was locked for 30 minutes after ${user.failedLoginCount} failed login attempts.`,
          severity: 'critical',
          metadata: { ip },
        });
      }
      await user.save({ validateBeforeSave: false });
      await logLoginFailed(user._id, { ip, ...parsed });
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Reset failed count on success
    user.failedLoginCount = 0;
    user.lockedUntil = undefined;

    // 2FA required?
    if (user.twoFactorEnabled) {
      // Generate OTP and send via email
      const secret = user.twoFactorSecret || (process.env.OTP_SECRET_KEY || 'gameguard_2fa_default_key') + user._id;
      const otp = generateOTP(secret);
      await send2FAEmail(user.email, otp).catch(e => console.error('[2FA Email]', e.message));
      await user.save({ validateBeforeSave: false });
      return res.status(200).json({ requiresTwoFactor: true, userId: user._id });
    }

    // Analyze for threats
    const flags = await analyzeLogin(user, { ip, device: deviceKey, browser: parsed.browser, os: parsed.os, success: true });
    await processThreatFlags(user, flags, { ip, device: deviceKey, browser: parsed.browser, os: parsed.os });

    // Update known IPs / devices
    if (!user.knownIPs.includes(ip)) user.knownIPs.push(ip);
    if (!user.knownDevices.includes(deviceKey)) user.knownDevices.push(deviceKey);

    // Create session
    const sessionId = uuidv4();
    user.sessions.push({ sessionId, ip, device: deviceKey, browser: parsed.browser, os: parsed.os });
    user.lastLoginAt = new Date();
    user.lastLoginIP = ip;
    user.lastLoginDevice = deviceKey;

    await user.save({ validateBeforeSave: false });
    await logLoginSuccess(user._id, { ip, ...parsed });

    // New login alert
    if (user.notifications?.newLogin) {
      await Alert.create({
        userId:   user._id,
        type:     'NEW_LOGIN',
        title:    '✅ New Login Detected',
        message:  `Successful login from ${ip} using ${deviceKey}.`,
        severity: 'low',
        metadata: { ip, device: deviceKey },
      });
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id:       user._id,
        username: user.username,
        email:    user.email,
        twoFactorEnabled: user.twoFactorEnabled,
        notifications:    user.notifications,
      },
    });
  } catch (err) { next(err); }
};

// ── Verify 2FA ────────────────────────────────────────────────────────────────
exports.verify2FA = async (req, res, next) => {
  try {
    const { token, userId } = req.body;
    const user = await User.findById(userId).select('+twoFactorSecret');

    if (!user) return res.status(404).json({ error: 'User not found.' });

    const secret = user.twoFactorSecret || (process.env.OTP_SECRET_KEY || 'gameguard_2fa_default_key') + user._id;
    const valid  = verifyOTP(token, secret);

    if (!valid) {
      return res.status(400).json({ error: 'Invalid or expired verification code.' });
    }

    const ip      = getClientIP(req);
    const parsed  = parseDevice(req.headers['user-agent']);
    const deviceKey = `${parsed.browser}/${parsed.os}`;

    // Reset failed count and lockout on successful 2FA
    user.failedLoginCount = 0;
    user.lockedUntil = undefined;

    const flags = await analyzeLogin(user, { ip, device: deviceKey, browser: parsed.browser, os: parsed.os, success: true });
    await processThreatFlags(user, flags, { ip, device: deviceKey, browser: parsed.browser, os: parsed.os });

    if (!user.knownIPs.includes(ip)) user.knownIPs.push(ip);
    if (!user.knownDevices.includes(deviceKey)) user.knownDevices.push(deviceKey);

    const sessionId = uuidv4();
    user.sessions.push({ sessionId, ip, device: deviceKey, browser: parsed.browser, os: parsed.os });
    user.lastLoginAt = new Date();
    user.lastLoginIP = ip;
    user.lastLoginDevice = deviceKey;

    await user.save({ validateBeforeSave: false });
    await ActivityLog.create({ userId, event: '2FA_VERIFIED', severity: 'info', ip, ...parsed });

    const jwtToken = generateToken(user._id);
    res.json({
      token: jwtToken,
      user:  { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) { next(err); }
};

// ── Enable 2FA ────────────────────────────────────────────────────────────────
exports.enable2FA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+twoFactorSecret');
    if (!user.twoFactorSecret) {
      user.twoFactorSecret = authenticator.generateSecret();
    }
    user.twoFactorEnabled = true;
    user.twoFactorMethod  = 'email';
    await user.save({ validateBeforeSave: false });
    await ActivityLog.create({ userId: user._id, event: '2FA_ENABLED', severity: 'info' });
    res.json({ message: '2FA enabled successfully.', method: 'email' });
  } catch (err) { next(err); }
};

// ── Disable 2FA ───────────────────────────────────────────────────────────────
exports.disable2FA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.twoFactorEnabled = false;
    await user.save({ validateBeforeSave: false });

    await Alert.create({
      userId:   user._id,
      type:     '2FA_DISABLED',
      title:    '⚠️ Two-Factor Authentication Disabled',
      message:  'Your account is now less secure. Consider re-enabling 2FA.',
      severity: 'high',
    });
    await ActivityLog.create({ userId: user._id, event: '2FA_DISABLED', severity: 'warning' });

    res.json({ message: '2FA disabled.' });
  } catch (err) { next(err); }
};

// ── Get current user ──────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  const user = req.user;
  res.json({
    id:               user._id,
    username:         user.username,
    email:            user.email,
    twoFactorEnabled: user.twoFactorEnabled,
    twoFactorMethod:  user.twoFactorMethod,
    lastLoginAt:      user.lastLoginAt,
    lastLoginIP:      user.lastLoginIP,
    notifications:    user.notifications,
    createdAt:        user.createdAt,
  });
};

// ── Logout ────────────────────────────────────────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    // Mark all sessions inactive (simple approach; enhance with sessionId if needed)
    await User.findByIdAndUpdate(req.user._id, {
      $set: { 'sessions.$[].isActive': false },
    });
    await ActivityLog.create({ userId: req.user._id, event: 'LOGOUT', severity: 'info' });
    res.json({ message: 'Logged out successfully.' });
  } catch (err) { next(err); }
};
