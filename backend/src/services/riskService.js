/**
 * Risk Scoring Engine
 * Computes a dynamic 0–100 risk score per user
 * Higher = more risky
 */

const ActivityLog = require('../models/ActivityLog');
const Alert = require('../models/Alert');

/**
 * Evaluate password strength (0–25 pts safe, 25 = weakest)
 */
const scorePassword = (user) => {
  // We can't re-read the plain password, so we use proxy signals:
  // passwordChangedAt recency and whether it was ever changed
  let score = 10; // default penalty if no change event found
  if (user.passwordChangedAt) {
    const daysSinceChange = (Date.now() - new Date(user.passwordChangedAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceChange < 30)  score = 0;
    else if (daysSinceChange < 90)  score = 5;
    else if (daysSinceChange < 180) score = 12;
    else score = 20;
  }
  return score; // 0 = low risk, 20 = high risk
};

/**
 * 2FA penalty: 0 if enabled, 25 if disabled
 */
const score2FA = (user) => (user.twoFactorEnabled ? 0 : 25);

/**
 * Recent suspicious events (last 7 days)
 */
const scoreActivity = async (userId) => {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const criticalCount = await ActivityLog.countDocuments({
    userId, severity: 'critical', createdAt: { $gte: since },
  });
  const warningCount = await ActivityLog.countDocuments({
    userId, severity: 'warning', createdAt: { $gte: since },
  });
  return Math.min(40, criticalCount * 15 + warningCount * 5);
};

/**
 * Login consistency: penalize if many failed logins recently
 */
const scoreLoginConsistency = async (userId) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const failed = await ActivityLog.countDocuments({
    userId, event: 'LOGIN_FAILED', createdAt: { $gte: since },
  });
  return Math.min(15, failed * 3);
};

/**
 * Main scoring function
 * Returns { score, level, breakdown }
 */
const computeRiskScore = async (user) => {
  const passwordScore  = scorePassword(user);
  const twoFAScore     = score2FA(user);
  const activityScore  = await scoreActivity(user._id);
  const consistScore   = await scoreLoginConsistency(user._id);

  const total = Math.min(100, passwordScore + twoFAScore + activityScore + consistScore);

  const level = total <= 25 ? 'LOW' : total <= 60 ? 'MEDIUM' : 'HIGH';

  return {
    score: total,
    level,
    breakdown: {
      password:     passwordScore,
      twoFA:        twoFAScore,
      recentEvents: activityScore,
      loginHealth:  consistScore,
    },
    tips: generateTips({ passwordScore, twoFAScore, activityScore }),
  };
};

const generateTips = ({ passwordScore, twoFAScore, activityScore }) => {
  const tips = [];
  if (twoFAScore > 0)     tips.push('Enable Two-Factor Authentication to significantly reduce your risk.');
  if (passwordScore > 10) tips.push('Consider updating your password — it may be outdated.');
  if (activityScore > 15) tips.push('Several suspicious events were detected recently. Review your activity logs.');
  if (tips.length === 0)  tips.push('Your account security looks great! Keep it up.');
  return tips;
};

module.exports = { computeRiskScore };
