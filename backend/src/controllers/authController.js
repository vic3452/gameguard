const asyncHandler  = require('../utils/asyncHandler');
const User          = require('../models/User');
const ActivityLog   = require('../models/ActivityLog');
const Alert         = require('../models/Alert');
const { send2FAEmail }      = require('../services/emailService');
const { analyzeLogin, processThreatFlags, logLoginSuccess, logLoginFailed } = require('../services/securityService');
const { generateToken, parseDevice, getClientIP, generateOTP, verifyOTP, uuidv4 } = require('../utils/helpers');
const { authenticator } = require('otplib');

const MAX_SESSIONS = 20;

const pushSession = (user, sessionData) => {
  user.sessions.push(sessionData);
  if (user.sessions.length > MAX_SESSIONS) user.sessions = user.sessions.slice(-MAX_SESSIONS);
};

exports.register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) return res.status(409).json({ error: 'Username or email already in use.' });

  const user = await User.create({ username, email, password });
  await ActivityLog.create({ userId: user._id, event: 'REGISTER', severity: 'info' });

  const token = generateToken(user._id);
  res.status(201).json({
    message: 'Account created successfully.',
    token,
    user: { id: user._id, username: user.username, email: user.email },
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const ip       = getClientIP(req);
  const parsed   = parseDevice(req.headers['user-agent']);
  const deviceKey = `${parsed.browser}/${parsed.os}`;

  const user = await User.findOne({ email }).select('+password +twoFactorSecret');
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

  if (user.isLocked()) {
    return res.status(423).json({
      error: `Account locked until ${user.lockedUntil.toISOString()}. Too many failed attempts.`,
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    user.failedLoginCount = (user.failedLoginCount || 0) + 1;
    if (user.failedLoginCount >= 5) {
      user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
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

  user.failedLoginCount = 0;
  user.lockedUntil = undefined;

  if (user.twoFactorEnabled) {
    const secret = user.twoFactorSecret || (process.env.OTP_SECRET_KEY || 'gameguard_2fa_default_key') + user._id;
    const otp = generateOTP(secret);
    await send2FAEmail(user.email, otp).catch(e => console.error('[2FA Email]', e.message));
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({ requiresTwoFactor: true, userId: user._id });
  }

  const flags = await analyzeLogin(user, { ip, device: deviceKey, browser: parsed.browser, os: parsed.os, success: true });
  await processThreatFlags(user, flags, { ip, device: deviceKey, browser: parsed.browser, os: parsed.os });

  if (!user.knownIPs.includes(ip))         user.knownIPs.push(ip);
  if (!user.knownDevices.includes(deviceKey)) user.knownDevices.push(deviceKey);

  pushSession(user, { sessionId: uuidv4(), ip, device: deviceKey, browser: parsed.browser, os: parsed.os });
  user.lastLoginAt     = new Date();
  user.lastLoginIP     = ip;
  user.lastLoginDevice = deviceKey;

  await user.save({ validateBeforeSave: false });
  await logLoginSuccess(user._id, { ip, ...parsed });

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
      id:               user._id,
      username:         user.username,
      email:            user.email,
      twoFactorEnabled: user.twoFactorEnabled,
      notifications:    user.notifications,
    },
  });
});

exports.verify2FA = asyncHandler(async (req, res) => {
  const { token, userId } = req.body;
  const user = await User.findById(userId).select('+twoFactorSecret');
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const secret = user.twoFactorSecret || (process.env.OTP_SECRET_KEY || 'gameguard_2fa_default_key') + user._id;
  if (!verifyOTP(token, secret)) {
    return res.status(400).json({ error: 'Invalid or expired verification code.' });
  }

  const ip       = getClientIP(req);
  const parsed   = parseDevice(req.headers['user-agent']);
  const deviceKey = `${parsed.browser}/${parsed.os}`;

  user.failedLoginCount = 0;
  user.lockedUntil = undefined;

  const flags = await analyzeLogin(user, { ip, device: deviceKey, browser: parsed.browser, os: parsed.os, success: true });
  await processThreatFlags(user, flags, { ip, device: deviceKey, browser: parsed.browser, os: parsed.os });

  if (!user.knownIPs.includes(ip))         user.knownIPs.push(ip);
  if (!user.knownDevices.includes(deviceKey)) user.knownDevices.push(deviceKey);

  pushSession(user, { sessionId: uuidv4(), ip, device: deviceKey, browser: parsed.browser, os: parsed.os });
  user.lastLoginAt     = new Date();
  user.lastLoginIP     = ip;
  user.lastLoginDevice = deviceKey;

  await user.save({ validateBeforeSave: false });
  await ActivityLog.create({ userId, event: '2FA_VERIFIED', severity: 'info', ip, ...parsed });

  const jwtToken = generateToken(user._id);
  res.json({ token: jwtToken, user: { id: user._id, username: user.username, email: user.email } });
});

exports.enable2FA = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+twoFactorSecret');
  if (!user.twoFactorSecret) user.twoFactorSecret = authenticator.generateSecret();
  user.twoFactorEnabled = true;
  user.twoFactorMethod  = 'email';
  await user.save({ validateBeforeSave: false });
  await ActivityLog.create({ userId: user._id, event: '2FA_ENABLED', severity: 'info' });
  res.json({ message: '2FA enabled successfully.', method: 'email' });
});

exports.disable2FA = asyncHandler(async (req, res) => {
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
});

exports.getMe = (req, res) => {
  const u = req.user;
  res.json({
    id: u._id, username: u.username, email: u.email,
    twoFactorEnabled: u.twoFactorEnabled, twoFactorMethod: u.twoFactorMethod,
    lastLoginAt: u.lastLoginAt, lastLoginIP: u.lastLoginIP,
    notifications: u.notifications, createdAt: u.createdAt,
  });
};

exports.logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { 'sessions.$[].isActive': false } });
  await ActivityLog.create({ userId: req.user._id, event: 'LOGOUT', severity: 'info' });
  res.json({ message: 'Logged out successfully.' });
});
