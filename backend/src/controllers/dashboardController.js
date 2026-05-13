/**
 * Dashboard Controller
 * Returns aggregated security overview for the user
 */

const ActivityLog = require('../models/ActivityLog');
const Alert = require('../models/Alert');
const GamingAccount = require('../models/GamingAccount');
const { computeRiskScore } = require('../services/riskService');

exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Risk score
    const risk = await computeRiskScore(req.user);

    // Recent logins (last 10)
    const recentLogins = await ActivityLog.find({ userId, event: { $in: ['LOGIN_SUCCESS', 'LOGIN_FAILED'] } })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('event ip device browser os createdAt severity');

    // Unread alert count
    const unreadAlerts = await Alert.countDocuments({ userId, read: false });

    // All unread alerts (max 5 for dashboard preview)
    const alerts = await Alert.find({ userId, read: false })
      .sort({ createdAt: -1 })
      .limit(5);

    // Connected gaming accounts
    const accounts = await GamingAccount.find({ userId }).select('platform username accountStatus riskScore lastLoginAt');

    // Activity summary for chart (last 7 days)
    const since7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activityByDay = await ActivityLog.aggregate([
      { $match: { userId, createdAt: { $gte: since7Days } } },
      {
        $group: {
          _id: {
            day:   { $dayOfMonth: '$createdAt' },
            month: { $month: '$createdAt' },
            event: '$event',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1, '_id.day': 1 } },
    ]);

    // Sessions
    const activeSessions = req.user.sessions?.filter(s => s.isActive) || [];

    res.json({
      risk,
      recentLogins,
      unreadAlerts,
      alerts,
      accounts,
      activeSessions,
      activityByDay,
      user: {
        username:         req.user.username,
        twoFactorEnabled: req.user.twoFactorEnabled,
        lastLoginAt:      req.user.lastLoginAt,
        lastLoginIP:      req.user.lastLoginIP,
      },
    });
  } catch (err) { next(err); }
};
