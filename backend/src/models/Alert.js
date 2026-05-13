/**
 * Alert Model
 * Stores security alerts shown in the dashboard
 */

const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: [
      'NEW_LOGIN',
      'SUSPICIOUS_IP',
      'SUSPICIOUS_DEVICE',
      'FAILED_ATTEMPTS',
      'PASSWORD_CHANGE',
      'NEW_DEVICE',
      'CONCURRENT_SESSION',
      'BRUTE_FORCE',
      'BRUTE_FORCE_DETECTED',
      'ACCOUNT_LOCKED',
      '2FA_DISABLED',
      'UNUSUAL_TIME',
    ],
    required: true,
  },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  metadata: { type: mongoose.Schema.Types.Mixed },
  read:     { type: Boolean, default: false },
  readAt:   { type: Date },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Alert', alertSchema);
