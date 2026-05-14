const asyncHandler = require('../utils/asyncHandler');
const ActivityLog  = require('../models/ActivityLog');

exports.getLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 25, event, severity } = req.query;
  const filter = { userId: req.user._id };
  if (event)    filter.event    = event;
  if (severity) filter.severity = severity;

  const pg  = parseInt(page);
  const lim = parseInt(limit);

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter).sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim),
    ActivityLog.countDocuments(filter),
  ]);

  res.json({ logs, total, page: pg, pages: Math.ceil(total / lim) });
});

exports.getLogStats = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const stats = await ActivityLog.aggregate([
    { $match: { userId: req.user._id, createdAt: { $gte: since } } },
    { $group: { _id: '$event', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  res.json({ stats });
});
