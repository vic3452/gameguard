/**
 * Activity Logs Controller
 */

const ActivityLog = require('../models/ActivityLog');

exports.getLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 25, event, severity } = req.query;
    const filter = { userId: req.user._id };
    if (event)    filter.event    = event;
    if (severity) filter.severity = severity;

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments(filter);

    res.json({ logs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.getLogStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const stats = await ActivityLog.aggregate([
      { $match: { userId, createdAt: { $gte: since } } },
      { $group: { _id: '$event', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({ stats });
  } catch (err) { next(err); }
};
