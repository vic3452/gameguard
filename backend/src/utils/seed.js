/**
 * Seed Script
 * Creates sample users, gaming accounts, alerts, and activity logs
 * Run: node src/utils/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User          = require('../models/User');
const ActivityLog   = require('../models/ActivityLog');
const Alert         = require('../models/Alert');
const GamingAccount = require('../models/GamingAccount');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gameguard';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    ActivityLog.deleteMany({}),
    Alert.deleteMany({}),
    GamingAccount.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // ── Create Users ──────────────────────────────────────────────────────────────
  const users = await User.create([
    {
      username:    'ProGamer99',
      email:       'demo@gameguard.io',
      password:    'Demo@1234!',
      twoFactorEnabled: false,
      knownIPs:    ['192.168.1.10', '10.0.0.5'],
      knownDevices:['Chrome/Windows 11', 'Firefox/Ubuntu 22'],
      lastLoginAt: new Date(),
      lastLoginIP: '192.168.1.10',
      notifications: { email: true, newLogin: true, suspicious: true, failed: true },
      isVerified:  true,
    },
    {
      username:    'ShadowRogue',
      email:       'shadow@gameguard.io',
      password:    'Shadow@5678!',
      twoFactorEnabled: true,
      knownIPs:    ['172.16.0.1'],
      knownDevices:['Chrome/Windows 10'],
      lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      lastLoginIP: '172.16.0.1',
      isVerified:  true,
    },
  ]);
  console.log(`👤 Created ${users.length} users`);

  const mainUser = users[0];

  // ── Gaming Accounts ────────────────────────────────────────────────────────
  await GamingAccount.create([
    { userId: mainUser._id, platform: 'Steam',      username: 'ProGamer99_Steam',  accountStatus: 'secure',    riskScore: 15 },
    { userId: mainUser._id, platform: 'Epic Games', username: 'ProGamer_Epic',      accountStatus: 'warning',   riskScore: 55 },
    { userId: mainUser._id, platform: 'Riot Games', username: 'Shadow_ProGamer',   accountStatus: 'secure',    riskScore: 10 },
    { userId: mainUser._id, platform: 'PlayStation', username: 'ProGamer99_PSN',   accountStatus: 'secure',    riskScore: 5  },
  ]);
  console.log('🎮 Created gaming accounts');

  // ── Activity Logs ──────────────────────────────────────────────────────────
  const logEvents = [];
  const now = Date.now();
  for (let i = 0; i < 20; i++) {
    logEvents.push({
      userId:   mainUser._id,
      event:    i % 5 === 0 ? 'LOGIN_FAILED' : 'LOGIN_SUCCESS',
      severity: i % 5 === 0 ? 'warning' : 'info',
      ip:       i % 3 === 0 ? '203.0.113.99' : '192.168.1.10',
      device:   'desktop',
      browser:  'Chrome 120',
      os:       'Windows 11',
      createdAt: new Date(now - i * 3 * 60 * 60 * 1000),
    });
  }
  // Add some suspicious events
  logEvents.push(
    { userId: mainUser._id, event: 'SUSPICIOUS_IP',     severity: 'warning',  ip: '185.220.101.5',  device: 'desktop', browser: 'Unknown', os: 'Linux', createdAt: new Date(now - 5 * 60 * 60 * 1000) },
    { userId: mainUser._id, event: 'BRUTE_FORCE_DETECTED', severity: 'critical', ip: '45.33.32.156', device: 'bot', browser: 'bot', os: 'Unknown', createdAt: new Date(now - 12 * 60 * 60 * 1000) },
    { userId: mainUser._id, event: '2FA_ENABLED',        severity: 'info',    createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000) }
  );
  await ActivityLog.insertMany(logEvents);
  console.log(`📋 Created ${logEvents.length} activity log entries`);

  // ── Alerts ─────────────────────────────────────────────────────────────────
  await Alert.create([
    {
      userId: mainUser._id, type: 'SUSPICIOUS_IP', read: false,
      title: '🌐 New IP Address Detected', severity: 'medium',
      message: 'Login detected from unrecognized IP: 185.220.101.5 (Tor exit node)',
      metadata: { ip: '185.220.101.5' },
    },
    {
      userId: mainUser._id, type: 'FAILED_ATTEMPTS', read: false,
      title: '⚠️ Multiple Failed Login Attempts', severity: 'high',
      message: '5 failed login attempts detected within 10 minutes from 45.33.32.156.',
      metadata: { ip: '45.33.32.156', attempts: 5 },
    },
    {
      userId: mainUser._id, type: 'NEW_LOGIN', read: true,
      title: '✅ New Login Detected', severity: 'low',
      message: 'Successful login from 192.168.1.10 using Chrome/Windows 11.',
      metadata: { ip: '192.168.1.10' },
    },
    {
      userId: mainUser._id, type: 'NEW_DEVICE', read: false,
      title: '💻 New Device Login', severity: 'medium',
      message: 'Login from a new device: Firefox/Ubuntu 22. If this wasn\'t you, change your password.',
      metadata: { device: 'Firefox/Ubuntu 22' },
    },
  ]);
  console.log('🔔 Created alerts');

  console.log('\n✅ Seed complete!');
  console.log('─────────────────────────────────────────');
  console.log('Demo credentials:');
  console.log('  Email:    demo@gameguard.io');
  console.log('  Password: Demo@1234!');
  console.log('─────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
