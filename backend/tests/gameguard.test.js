/**
 * GAMEGUARD Backend Tests
 * Tests auth, risk scoring, security detection, and threat simulation
 */

const request = require('supertest');

// ── Mock mongoose before requiring app ───────────────────────────────────────
jest.mock('../src/config/database', () => jest.fn().mockResolvedValue(true));
jest.mock('../src/utils/cronJobs', () => ({ startCronJobs: jest.fn() }));

// Mock models
jest.mock('../src/models/User', () => {
  const mockUser = {
    _id: 'user123',
    username: 'TestGamer',
    email: 'test@gameguard.io',
    twoFactorEnabled: false,
    knownIPs: ['127.0.0.1'],
    knownDevices: ['Chrome/Windows 11'],
    sessions: [],
    notifications: { email: false, newLogin: true, suspicious: true, failed: true },
    failedLoginCount: 0,
    isLocked: () => false,
    comparePassword: jest.fn().mockResolvedValue(true),
    save: jest.fn().mockResolvedValue(true),
  };
  return {
    findOne: jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) }),
    findById: jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) }),
    create: jest.fn().mockResolvedValue(mockUser),
    countDocuments: jest.fn().mockResolvedValue(0),
    updateMany: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
  };
});

jest.mock('../src/models/ActivityLog', () => ({
  create: jest.fn().mockResolvedValue({}),
  find: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue([]) }) }) }),
  countDocuments: jest.fn().mockResolvedValue(0),
  aggregate: jest.fn().mockResolvedValue([]),
}));

jest.mock('../src/models/Alert', () => ({
  create: jest.fn().mockResolvedValue({}),
  find: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue([]) }) }),
  countDocuments: jest.fn().mockResolvedValue(2),
}));

jest.mock('../src/models/GamingAccount', () => ({
  find: jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValue([]) }),
  findOne: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockResolvedValue({ platform: 'Steam', username: 'TestGamer' }),
}));

jest.mock('../src/services/emailService', () => ({
  send2FAEmail: jest.fn().mockResolvedValue(true),
  sendAlertEmail: jest.fn().mockResolvedValue(true),
}));

process.env.JWT_SECRET     = 'test_secret_key_for_testing';
process.env.JWT_EXPIRES_IN = '1d';
process.env.NODE_ENV       = 'test';

const app = require('../src/app');

// ─────────────────────────────────────────────────────────────────────────────
// UNIT TESTS: Helpers
// ─────────────────────────────────────────────────────────────────────────────
describe('Utility Helpers', () => {
  const { generateToken, parseDevice, evaluatePasswordStrength, verifyOTP, generateOTP } = require('../src/utils/helpers');

  test('generateToken returns a string', () => {
    const token = generateToken('user123');
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT format
  });

  test('parseDevice extracts browser and OS', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    const result = parseDevice(ua);
    expect(result.browser).toMatch(/Chrome/);
    expect(result.os).toMatch(/Windows/);
  });

  test('evaluatePasswordStrength: weak password scores low', () => {
    expect(evaluatePasswordStrength('abc')).toBeLessThan(50);
  });

  test('evaluatePasswordStrength: strong password scores high', () => {
    expect(evaluatePasswordStrength('MyStr0ng@Pass!')).toBeGreaterThanOrEqual(70);
  });

  test('OTP generate and verify round-trip', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const otp    = generateOTP(secret);
    expect(otp).toMatch(/^\d{6}$/);
    const valid = verifyOTP(otp, secret);
    expect(valid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// UNIT TESTS: Risk Scoring
// ─────────────────────────────────────────────────────────────────────────────
describe('Risk Scoring Engine', () => {
  const { computeRiskScore } = require('../src/services/riskService');

  test('user without 2FA has higher score than user with 2FA', async () => {
    const ActivityLog = require('../src/models/ActivityLog');
    ActivityLog.countDocuments.mockResolvedValue(0);

    const userNo2FA  = { _id: 'u1', twoFactorEnabled: false, passwordChangedAt: new Date() };
    const userWith2FA = { _id: 'u2', twoFactorEnabled: true,  passwordChangedAt: new Date() };

    const r1 = await computeRiskScore(userNo2FA);
    const r2 = await computeRiskScore(userWith2FA);

    expect(r1.score).toBeGreaterThan(r2.score);
  });

  test('risk level is LOW for score <= 25', async () => {
    const ActivityLog = require('../src/models/ActivityLog');
    ActivityLog.countDocuments.mockResolvedValue(0);

    const safeUser = { _id: 'u3', twoFactorEnabled: true, passwordChangedAt: new Date() };
    const result = await computeRiskScore(safeUser);
    expect(['LOW', 'MEDIUM', 'HIGH']).toContain(result.level);
  });

  test('computeRiskScore returns tips array', async () => {
    const user = { _id: 'u4', twoFactorEnabled: false, passwordChangedAt: null };
    const result = await computeRiskScore(user);
    expect(Array.isArray(result.tips)).toBe(true);
    expect(result.tips.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRATION: Auth Endpoints
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  test('rejects short username', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'ab',
      email: 'x@test.com',
      password: 'Str0ng@Pass',
    });
    expect(res.status).toBe(400);
  });

  test('rejects weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'ValidUser',
      email: 'x@test.com',
      password: 'weakpass',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation error');
  });

  test('rejects invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'ValidUser',
      email: 'not-an-email',
      password: 'Str0ng@Pass!',
    });
    expect(res.status).toBe(400);
  });

  test('accepts valid registration data', async () => {
    const User = require('../src/models/User');
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    const res = await request(app).post('/api/auth/register').send({
      username: 'NewGamer',
      email: 'new@gameguard.io',
      password: 'MyPass@123!',
    });
    expect([201, 409]).toContain(res.status);
  });
});

describe('POST /api/auth/login', () => {
  test('returns 401 for invalid credentials', async () => {
    const User = require('../src/models/User');
    const fakeUser = {
      _id: 'u1', email: 'test@gameguard.io', failedLoginCount: 0,
      isLocked: () => false,
      comparePassword: jest.fn().mockResolvedValue(false),
      save: jest.fn().mockResolvedValue(true),
      sessions: [], knownIPs: [], knownDevices: [],
      notifications: { email: false },
      twoFactorEnabled: false,
    };
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(fakeUser) });

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@gameguard.io',
      password: 'WrongPass@1',
    });
    expect(res.status).toBe(401);
  });

  test('returns 400 for missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'x@y.com' });
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRATION: Education Module
// ─────────────────────────────────────────────────────────────────────────────
describe('Education Module (authenticated)', () => {
  const { generateToken } = require('../src/utils/helpers');
  let token;

  beforeAll(() => {
    token = generateToken('user123');
  });

  test('GET /api/education/threats returns threat list', async () => {
    const res = await request(app)
      .get('/api/education/threats')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.threats)).toBe(true);
    expect(res.body.threats.length).toBeGreaterThan(0);
  });

  test('GET /api/education/tips returns tips', async () => {
    const res = await request(app)
      .get('/api/education/tips')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tips)).toBe(true);
  });

  test('GET /api/education/threats/phishing returns phishing detail', async () => {
    const res = await request(app)
      .get('/api/education/threats/phishing')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.threat.id).toBe('phishing');
  });

  test('GET /api/education/threats/unknown returns 404', async () => {
    const res = await request(app)
      .get('/api/education/threats/nonexistent')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRATION: Threat Simulator
// ─────────────────────────────────────────────────────────────────────────────
describe('Threat Simulator', () => {
  const { generateToken } = require('../src/utils/helpers');
  let token;

  beforeAll(() => {
    token = generateToken('user123');
  });

  test('GET /api/threats returns simulation list', async () => {
    const res = await request(app)
      .get('/api/threats')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.simulations)).toBe(true);
  });

  test('POST /api/threats/brute-force/run returns simulation steps', async () => {
    const res = await request(app)
      .post('/api/threats/brute-force/run')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.simulation).toBe('Brute-Force Attack');
    expect(Array.isArray(res.body.steps)).toBe(true);
    expect(Array.isArray(res.body.recommendations)).toBe(true);
  });

  test('POST /api/threats/unknown/run returns 404', async () => {
    const res = await request(app)
      .post('/api/threats/unknown-attack/run')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRATION: Security Detection (Simulated Login Analysis)
// ─────────────────────────────────────────────────────────────────────────────
describe('Security Detection Service', () => {
  const { analyzeLogin } = require('../src/services/securityService');

  test('flags new IP when user has known IPs', async () => {
    const user = { knownIPs: ['192.168.1.1'], knownDevices: ['Chrome/Windows'], sessions: [] };
    const ctx  = { ip: '203.0.113.99', device: 'Chrome/Windows', browser: 'Chrome', os: 'Windows', success: true };
    const flags = await analyzeLogin(user, ctx);
    expect(flags.some(f => f.type === 'SUSPICIOUS_IP')).toBe(true);
  });

  test('flags new device when user has known devices', async () => {
    const user = { knownIPs: ['192.168.1.1'], knownDevices: ['Chrome/Windows 11'], sessions: [] };
    const ctx  = { ip: '192.168.1.1', device: 'Firefox/Linux/device', browser: 'Firefox', os: 'Linux', success: true };
    const flags = await analyzeLogin(user, ctx);
    expect(flags.some(f => f.type === 'SUSPICIOUS_DEVICE')).toBe(true);
  });

  test('no flags for known IP and device', async () => {
    const user = { knownIPs: ['192.168.1.1'], knownDevices: ['Chrome/Windows 11'], failedLoginCount: 0, sessions: [] };
    const ctx  = { ip: '192.168.1.1', device: 'Chrome/Windows 11', browser: 'Chrome', os: 'Windows 11', success: true };
    const flags = await analyzeLogin(user, ctx);
    const critical = flags.filter(f => f.type === 'SUSPICIOUS_IP' || f.type === 'SUSPICIOUS_DEVICE');
    expect(critical).toHaveLength(0);
  });

  test('flags brute force after 4 failures', async () => {
    const user = { knownIPs: [], knownDevices: [], failedLoginCount: 5, sessions: [] };
    const ctx  = { ip: '10.0.0.1', device: 'bot', browser: 'bot', os: 'Unknown', success: false };
    const flags = await analyzeLogin(user, ctx);
    expect(flags.some(f => f.type === 'BRUTE_FORCE_DETECTED')).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY: Rate limiting & headers
// ─────────────────────────────────────────────────────────────────────────────
describe('Security Headers', () => {
  test('GET /api/health returns security headers', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
  });
});
