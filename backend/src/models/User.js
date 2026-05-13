/**
 * User Model
 * Stores user account, security settings, and session info
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const sessionSchema = new mongoose.Schema({
  sessionId:   { type: String, required: true },
  ip:          { type: String },
  device:      { type: String },
  browser:     { type: String },
  os:          { type: String },
  location:    { type: String, default: 'Unknown' },
  createdAt:   { type: Date, default: Date.now },
  lastActive:  { type: Date, default: Date.now },
  isActive:    { type: Boolean, default: true },
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false,
  },
  avatar: {
    type: String,
    default: '',
  },

  // ── 2FA ─────────────────────────────────────────────────────────────────────
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret:  { type: String, select: false },
  twoFactorMethod:  { type: String, enum: ['email', 'authenticator'], default: 'email' },

  // ── Security Metadata ────────────────────────────────────────────────────────
  lastLoginAt:       { type: Date },
  lastLoginIP:       { type: String },
  lastLoginDevice:   { type: String },
  failedLoginCount:  { type: Number, default: 0 },
  lockedUntil:       { type: Date },
  passwordChangedAt: { type: Date },
  knownIPs:          [{ type: String }],
  knownDevices:      [{ type: String }],

  // ── Active Sessions ──────────────────────────────────────────────────────────
  sessions: [sessionSchema],

  // ── Notification Preferences ─────────────────────────────────────────────────
  notifications: {
    email:      { type: Boolean, default: true },
    newLogin:   { type: Boolean, default: true },
    suspicious: { type: Boolean, default: true },
    failed:     { type: Boolean, default: true },
  },

  isVerified: { type: Boolean, default: false },
  role:       { type: String, enum: ['user', 'admin'], default: 'user' },
}, {
  timestamps: true,
});

// ── Hash password before save ─────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare password ────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ── Instance method: is account locked ───────────────────────────────────────
userSchema.methods.isLocked = function () {
  return this.lockedUntil && this.lockedUntil > Date.now();
};

module.exports = mongoose.model('User', userSchema);
