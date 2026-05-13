/**
 * GamingAccount Model
 * Simulated linked gaming platform accounts
 */

const mongoose = require('mongoose');

const gamingAccountSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  platform: {
    type: String,
    enum: ['Steam', 'Epic Games', 'PlayStation', 'Xbox', 'Nintendo', 'Riot Games', 'Battle.net', 'Origin', 'Ubisoft Connect', 'GOG'],
    required: true,
  },
  username:      { type: String, required: true, trim: true },
  lastLoginAt:   { type: Date, default: Date.now },
  accountStatus: {
    type: String,
    enum: ['secure', 'warning', 'compromised', 'unknown'],
    default: 'secure',
  },
  riskScore:     { type: Number, default: 0, min: 0, max: 100 },
  notes:         { type: String, maxlength: 500 },
  addedAt:       { type: Date, default: Date.now },
}, {
  timestamps: true,
});

module.exports = mongoose.model('GamingAccount', gamingAccountSchema);
