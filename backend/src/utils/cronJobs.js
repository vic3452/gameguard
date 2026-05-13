/**
 * Background Cron Jobs
 * - Clean up old sessions
 * - Unlock accounts
 * - Detect long-running suspicious patterns
 */

const cron = require('node-cron');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

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

  // Every 6 hours: mark stale sessions as inactive (>24h without activity)
  cron.schedule('0 */6 * * *', async () => {
    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const users  = await User.find({ 'sessions.isActive': true });
      for (const user of users) {
        let changed = false;
        user.sessions.forEach(s => {
          if (s.isActive && s.lastActive < cutoff) {
            s.isActive = false;
            changed = true;
          }
        });
        if (changed) await user.save({ validateBeforeSave: false });
      }
      console.log('[CRON] Stale session cleanup complete');
    } catch (err) {
      console.error('[CRON] Session cleanup failed:', err.message);
    }
  });

  console.log('⏱️  Cron jobs started');
};

module.exports = { startCronJobs };
