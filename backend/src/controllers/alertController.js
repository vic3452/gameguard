/**
 * Alerts Controller
 */

const Alert = require('../models/Alert');

exports.getAlerts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unread } = req.query;
    const filter = { userId: req.user._id };
    if (unread === 'true') filter.read = false;

    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Alert.countDocuments(filter);

    res.json({ alerts, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.markRead = async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true, readAt: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ error: 'Alert not found.' });
    res.json({ alert });
  } catch (err) { next(err); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Alert.updateMany(
      { userId: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );
    res.json({ message: 'All alerts marked as read.' });
  } catch (err) { next(err); }
};

exports.deleteAlert = async (req, res, next) => {
  try {
    await Alert.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Alert deleted.' });
  } catch (err) { next(err); }
};
