const asyncHandler  = require('../utils/asyncHandler');
const GamingAccount = require('../models/GamingAccount');
const ActivityLog   = require('../models/ActivityLog');

exports.getAccounts = asyncHandler(async (req, res) => {
  const accounts = await GamingAccount.find({ userId: req.user._id }).sort({ addedAt: -1 });
  res.json({ accounts });
});

exports.addAccount = asyncHandler(async (req, res) => {
  const { platform, username, notes } = req.body;

  const exists = await GamingAccount.findOne({ userId: req.user._id, platform });
  if (exists) return res.status(409).json({ error: `${platform} account already linked.` });

  const account = await GamingAccount.create({ userId: req.user._id, platform, username, notes });
  await ActivityLog.create({
    userId:   req.user._id,
    event:    'ACCOUNT_ADDED',
    severity: 'info',
    details:  `Linked ${platform} account: ${username}`,
  });

  res.status(201).json({ account });
});

exports.updateAccount = asyncHandler(async (req, res) => {
  const { username, notes, accountStatus } = req.body;
  const account = await GamingAccount.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { username, notes, accountStatus },
    { new: true }
  );
  if (!account) return res.status(404).json({ error: 'Account not found.' });
  res.json({ account });
});

exports.deleteAccount = asyncHandler(async (req, res) => {
  const account = await GamingAccount.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!account) return res.status(404).json({ error: 'Account not found.' });

  await ActivityLog.create({
    userId:   req.user._id,
    event:    'ACCOUNT_REMOVED',
    severity: 'info',
    details:  `Removed ${account.platform} account`,
  });

  res.json({ message: 'Account removed.' });
});
