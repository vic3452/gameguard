const asyncHandler = require('../utils/asyncHandler');
const Alert        = require('../models/Alert');

exports.getAlerts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unread } = req.query;
  const filter = { userId: req.user._id };
  if (unread === 'true') filter.read = false;

  const [alerts, total] = await Promise.all([
    Alert.find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit)),
    Alert.countDocuments(filter),
  ]);

  res.json({ alerts, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

exports.markRead = asyncHandler(async (req, res) => {
  const alert = await Alert.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { read: true, readAt: new Date() },
    { new: true }
  );
  if (!alert) return res.status(404).json({ error: 'Alert not found.' });
  res.json({ alert });
});

exports.markAllRead = asyncHandler(async (req, res) => {
  await Alert.updateMany(
    { userId: req.user._id, read: false },
    { read: true, readAt: new Date() }
  );
  res.json({ message: 'All alerts marked as read.' });
});

exports.deleteAlert = asyncHandler(async (req, res) => {
  await Alert.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  res.json({ message: 'Alert deleted.' });
});
