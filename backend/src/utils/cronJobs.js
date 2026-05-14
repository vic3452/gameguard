const cron = require('node-cron');
const User = require('../models/User');

const startCronJobs = () => {
  // Every hour: unlock accounts whose lockout period has expired
  cron.schedule('0 * * * *', async () => {
    try {
      const result = await User.updateMany(
        { lockedUntil: { $lt: new Date() } },
        { $unset: { lockedUntil: '' }, $set: { failedLoginCount: 0 } }
      );
      if (result.modifiedCount > 0) {
        console.log(`[CRON] Unlocked ${result.modifiedCount} account(s)`);
      }
    } catch (err) {
      console.error('[CRON] Unlock accounts failed:', err.message);
    }
  });

  // Every 6 hours: mark stale sessions as inactive using MongoDB arrayFilters
  // Avoids loading all users into memory
  cron.schedule('0 */6 * * *', async () => {
    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const result = await User.updateMany(
        { 'sessions.isActive': true, 'sessions.lastActive': { $lt: cutoff } },
        { $set: { 'sessions.$[elem].isActive': false } },
        { arrayFilters: [{ 'elem.isActive': true, 'elem.lastActive': { $lt: cutoff } }] }
      );
      if (result.modifiedCount > 0) {
        console.log(`[CRON] Deactivated stale sessions on ${result.modifiedCount} account(s)`);
      }
    } catch (err) {
      console.error('[CRON] Session cleanup failed:', err.message);
    }
  });

  console.log('⏱️  Cron jobs started');
};

module.exports = { startCronJobs };
