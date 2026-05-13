/**
 * Gaming Accounts Controller
 * Simulated platform account management
 */

const GamingAccount = require('../models/GamingAccount');
const ActivityLog   = require('../models/ActivityLog');

exports.getAccounts = async (req, res, next) => {
  try {
    const accounts = await GamingAccount.find({ userId: req.user._id }).sort({ addedAt: -1 });
    res.json({ accounts });
  } catch (err) { next(err); }
};

exports.addAccount = async (req, res, next) => {
  try {
    const { platform, username, notes } = req.body;

    const exists = await GamingAccount.findOne({ userId: req.user._id, platform });
    if (exists) return res.status(409).json({ error: `${platform} account already linked.` });

    const account = await GamingAccount.create({
      userId: req.user._id,
      platform,
      username,
      notes,
    });

    await ActivityLog.create({
      userId:   req.user._id,
      event:    'ACCOUNT_ADDED',
      severity: 'info',
      details:  `Linked ${platform} account: ${username}`,
    });

    res.status(201).json({ account });
  } catch (err) { next(err); }
};

exports.updateAccount = async (req, res, next) => {
  try {
    const { username, notes, accountStatus } = req.body;
    const account = await GamingAccount.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { username, notes, accountStatus },
      { new: true }
    );
    if (!account) return res.status(404).json({ error: 'Account not found.' });
    res.json({ account });
  } catch (err) { next(err); }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const account = await GamingAccount.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!account) return res.status(404).json({ error: 'Account not found.' });

    await ActivityLog.create({
      userId:   req.user._id,
      event:    'ACCOUNT_REMOVED',
      severity: 'info',
      details:  `Removed ${account.platform} account`,
    });

    res.json({ message: 'Account removed.' });
  } catch (err) { next(err); }
};
