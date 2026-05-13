/**
 * ActivityLog Model
 * Records all login attempts, security events, and suspicious activity
 */

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  event:     {
    type: String,
    enum: [
      'LOGIN_SUCCESS',
      'LOGIN_FAILED',
      'LOGOUT',
      'REGISTER',
      'PASSWORD_CHANGE',
      'PASSWORD_RESET',
      '2FA_ENABLED',
      '2FA_DISABLED',
      '2FA_VERIFIED',
      'ACCOUNT_LOCKED',
      'ACCOUNT_UNLOCKED',
      'SUSPICIOUS_IP',
      'SUSPICIOUS_DEVICE',
      'CONCURRENT_SESSION',
      'UNUSUAL_TIME',
      'BRUTE_FORCE_DETECTED',
      'ACCOUNT_ADDED',
      'ACCOUNT_REMOVED',
    ],
    required: true,
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info',
  },
  ip:      { type: String },
  device:  { type: String },
  browser: { type: String },
  os:      { type: String },
  location:{ type: String, default: 'Unknown' },
  details: { type: mongoose.Schema.Types.Mixed }, // Extra context
  resolved:{ type: Boolean, default: false },
}, {
  timestamps: true,
});

// TTL index: auto-delete logs older than 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
