/**
 * Security Detection Service
 * Analyzes login context and detects suspicious patterns
 */

const ActivityLog = require('../models/ActivityLog');
const Alert = require('../models/Alert');
const { sendAlertEmail } = require('./emailService');

/**
 * Analyze a login attempt for suspicious signals
 * Returns array of triggered threat flags
 */
const analyzeLogin = async (user, loginContext) => {
  const { ip, device, browser, os, success } = loginContext;
  const flags = [];

  // ── 1. New IP Detection ──────────────────────────────────────────────────────
  if (ip && user.knownIPs?.length > 0 && !user.knownIPs.includes(ip)) {
    flags.push({ type: 'SUSPICIOUS_IP', severity: 'warning', detail: `New IP address: ${ip}` });
  }

  // ── 2. New Device Detection ───────────────────────────────────────────────────
  const deviceKey = `${browser}/${os}`;
  if (user.knownDevices?.length > 0 && !user.knownDevices.includes(deviceKey)) {
    flags.push({ type: 'SUSPICIOUS_DEVICE', severity: 'warning', detail: `New device: ${deviceKey}` });
  }

  // ── 3. Multiple Failed Logins (brute force) ───────────────────────────────────
  if (!success && user.failedLoginCount >= 4) {
    flags.push({ type: 'BRUTE_FORCE_DETECTED', severity: 'critical', detail: `${user.failedLoginCount + 1} failed attempts` });
  }

  // ── 4. Unusual Login Time (between 1am–5am local-ish, by UTC hour) ────────────
  const hour = new Date().getUTCHours();
  if (hour >= 1 && hour <= 5) {
    flags.push({ type: 'UNUSUAL_TIME', severity: 'warning', detail: `Login at unusual hour: ${hour}:00 UTC` });
  }

  // ── 5. Concurrent Sessions ────────────────────────────────────────────────────
  const activeSessions = user.sessions?.filter(s => s.isActive) || [];
  if (activeSessions.length >= 2) {
    flags.push({ type: 'CONCURRENT_SESSION', severity: 'high', detail: `${activeSessions.length} active sessions` });
  }

  return flags;
};

/**
 * Create alerts and log events for detected threats
 */
const processThreatFlags = async (user, flags, loginContext) => {
  for (const flag of flags) {
    // Create alert in DB
    const alert = await Alert.create({
      userId:   user._id,
      type:     flag.type,
      title:    getAlertTitle(flag.type),
      message:  getAlertMessage(flag.type, loginContext, flag.detail),
      severity: mapSeverity(flag.severity),
      metadata: { ip: loginContext.ip, device: loginContext.device, detail: flag.detail },
    });

    // Log activity
    await ActivityLog.create({
      userId:   user._id,
      event:    flag.type,
      severity: flag.severity,
      ip:       loginContext.ip,
      device:   loginContext.device,
      browser:  loginContext.browser,
      os:       loginContext.os,
      details:  flag.detail,
    });

    // Send email alert if enabled
    if (user.notifications?.email && user.notifications?.suspicious) {
      await sendAlertEmail(user.email, alert).catch(err =>
        console.error('[EMAIL] Alert email failed:', err.message)
      );
    }
  }
};

/**
 * Log a standard successful login
 */
const logLoginSuccess = async (userId, context) => {
  return ActivityLog.create({
    userId,
    event:    'LOGIN_SUCCESS',
    severity: 'info',
    ip:       context.ip,
    device:   context.device,
    browser:  context.browser,
    os:       context.os,
    location: context.location || 'Unknown',
  });
};

/**
 * Log a failed login attempt
 */
const logLoginFailed = async (userId, context) => {
  return ActivityLog.create({
    userId,
    event:    'LOGIN_FAILED',
    severity: 'warning',
    ip:       context.ip,
    device:   context.device,
    browser:  context.browser,
    os:       context.os,
  });
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const getAlertTitle = (type) => ({
  SUSPICIOUS_IP:        '🌐 New IP Address Detected',
  SUSPICIOUS_DEVICE:    '💻 New Device Login',
  BRUTE_FORCE_DETECTED: '⚠️ Brute Force Attack Detected',
  UNUSUAL_TIME:         '🕐 Unusual Login Time',
  CONCURRENT_SESSION:   '🔄 Multiple Active Sessions',
}[type] || '🔔 Security Alert');

const getAlertMessage = (type, ctx, detail) => ({
  SUSPICIOUS_IP:        `A login was detected from an unrecognized IP address: ${ctx.ip}. ${detail}`,
  SUSPICIOUS_DEVICE:    `Login from a new device: ${ctx.device}. If this wasn't you, change your password immediately.`,
  BRUTE_FORCE_DETECTED: `Multiple failed login attempts detected. ${detail}. Your account may be under attack.`,
  UNUSUAL_TIME:         `Login detected at an unusual time. ${detail}. Verify this was you.`,
  CONCURRENT_SESSION:   `Multiple active sessions detected. ${detail}. Terminate any sessions you don't recognize.`,
}[type] || `Security event: ${detail}`);

const mapSeverity = (s) => ({ info: 'low', warning: 'medium', high: 'high', critical: 'critical' }[s] || 'medium');

module.exports = { analyzeLogin, processThreatFlags, logLoginSuccess, logLoginFailed };
