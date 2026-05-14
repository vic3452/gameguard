const asyncHandler   = require('../utils/asyncHandler');
const ActivityLog    = require('../models/ActivityLog');
const Alert          = require('../models/Alert');
const GamingAccount  = require('../models/GamingAccount');
const { computeRiskScore } = require('../services/riskService');

exports.getDashboard = asyncHandler(async (req, res) => {
  const userId    = req.user._id;
  const since7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [risk, recentLogins, unreadAlerts, alerts, accounts, activityByDay] = await Promise.all([
    computeRiskScore(req.user),

    ActivityLog.find({ userId, event: { $in: ['LOGIN_SUCCESS', 'LOGIN_FAILED'] } })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('event ip device browser os createdAt severity'),

    Alert.countDocuments({ userId, read: false }),

    Alert.find({ userId, read: false })
      .sort({ createdAt: -1 })
      .limit(5),

    GamingAccount.find({ userId })
      .select('platform username accountStatus riskScore lastLoginAt'),

    ActivityLog.aggregate([
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
    ]),
  ]);

  const activeSessions = req.user.sessions?.filter(s => s.isActive) || [];

  res.json({
    risk, recentLogins, unreadAlerts, alerts, accounts, activityByDay, activeSessions,
    user: {
      username:         req.user.username,
      twoFactorEnabled: req.user.twoFactorEnabled,
      lastLoginAt:      req.user.lastLoginAt,
      lastLoginIP:      req.user.lastLoginIP,
    },
  });
});
