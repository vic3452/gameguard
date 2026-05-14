const asyncHandler = require('../utils/asyncHandler');
const ActivityLog  = require('../models/ActivityLog');
const Alert        = require('../models/Alert');

const SIMULATIONS = {
  'brute-force': {
    name:        'Brute-Force Attack',
    description: 'An attacker systematically tries thousands of password combinations.',
    steps: [
      { time: 0,    message: '🤖 Bot initiated — scanning for login endpoint...', type: 'info' },
      { time: 800,  message: '⚡ 50 attempts/sec using common password dictionary...', type: 'warning' },
      { time: 1600, message: '❌ Attempt 1–4: Wrong password — no lockout yet...', type: 'warning' },
      { time: 2400, message: '🔒 Attempt 5: Account lockout triggered!', type: 'critical' },
      { time: 3200, message: '🛡️ Rate limiting blocked further attempts from this IP.', type: 'success' },
    ],
    outcome:    'BLOCKED',
    riskLevel:  'HIGH',
    recommendations: [
      'Enable account lockout after 5 failed attempts',
      'Use Two-Factor Authentication',
      'Monitor for repeated failed login IPs',
      'Set up alerts for brute-force patterns',
    ],
  },
  'phishing': {
    name:        'Phishing Attack',
    description: 'An attacker sends a fake email mimicking your gaming platform to steal credentials.',
    steps: [
      { time: 0,    message: '📧 Fake "Steam Security Alert" email sent to your inbox...', type: 'warning' },
      { time: 800,  message: '🔗 User clicks link → redirected to fake login page...', type: 'warning' },
      { time: 1600, message: '⌨️  Credentials entered on spoofed site...', type: 'critical' },
      { time: 2400, message: '📤 Credentials sent to attacker\'s server!', type: 'critical' },
      { time: 3200, message: '🛡️ GAMEGUARD detected login from new unknown IP immediately after.', type: 'success' },
    ],
    outcome:    'DETECTED',
    riskLevel:  'CRITICAL',
    recommendations: [
      'Never click login links in emails — navigate directly',
      'Check the URL bar before entering credentials',
      'Enable 2FA so stolen passwords alone aren\'t enough',
      'Use a password manager to auto-fill only on real sites',
    ],
  },
  'credential-stuffing': {
    name:        'Credential Stuffing',
    description: 'Attacker uses leaked username/password pairs from other breaches to access your account.',
    steps: [
      { time: 0,    message: '🗃️ Attacker loads 100,000 breached credential pairs...', type: 'info' },
      { time: 800,  message: '🤖 Automated tool tries each pair across gaming platforms...', type: 'warning' },
      { time: 1600, message: '✅ Match found! Your recycled password worked on Steam...', type: 'critical' },
      { time: 2400, message: '📦 Attacker accesses inventory — items at risk!', type: 'critical' },
      { time: 3200, message: '🛡️ GAMEGUARD flagged new IP login and sent alert.', type: 'success' },
    ],
    outcome:    'PARTIAL — Account accessed but alert sent',
    riskLevel:  'CRITICAL',
    recommendations: [
      'Use unique passwords for every gaming platform',
      'Use a password manager',
      'Check haveibeenpwned.com for your email in breaches',
      'Enable login notifications for every platform',
    ],
  },
  'session-hijacking': {
    name:        'Session Hijacking',
    description: 'Attacker steals your active session token to impersonate you without a password.',
    steps: [
      { time: 0,    message: '📡 Attacker intercepts network traffic on public WiFi...', type: 'warning' },
      { time: 800,  message: '🍪 Session cookie extracted from unencrypted HTTP request...', type: 'critical' },
      { time: 1600, message: '👤 Attacker injects cookie into their browser...', type: 'critical' },
      { time: 2400, message: '🎮 Full account access without password!', type: 'critical' },
      { time: 3200, message: '🛡️ Concurrent session detected from different location — alert triggered.', type: 'success' },
    ],
    outcome:    'DETECTED — Concurrent session alert fired',
    riskLevel:  'HIGH',
    recommendations: [
      'Only use gaming platforms over HTTPS',
      'Avoid public WiFi without a VPN',
      'Log out of accounts when done',
      'Enable concurrent session alerts in GAMEGUARD',
    ],
  },
  'firefox-hijacking': {
    name:        'Firefox Browser Hijacking',
    description: 'A malicious extension or malware modifies your Firefox security settings or steals stored passwords.',
    steps: [
      { time: 0,    message: '🦊 Malicious Firefox extension installed via "fake update" prompt...', type: 'warning' },
      { time: 800,  message: '🔓 Extension requests "access to all website data" — user grants it...', type: 'warning' },
      { time: 1600, message: '📂 Malware accesses Firefox profile folder (logins.json)...', type: 'critical' },
      { time: 2400, message: '📤 Encrypted credentials exfiltrated to attacker command server!', type: 'critical' },
      { time: 3200, message: '🛡️ GAMEGUARD detected unusual automated login attempt — credentials flagged.', type: 'success' },
    ],
    outcome:    'BLOCKED — Suspected credential leak detected',
    riskLevel:  'CRITICAL',
    recommendations: [
      'Only install Firefox Add-ons from the official Mozilla repository',
      'Regularly review your installed extensions (about:addons)',
      'Use a Primary Password in Firefox to encrypt your saved logins',
      'Enable "HTTPS-Only Mode" in Firefox privacy settings',
    ],
  },
};

const SIM_EVENT_MAP = {
  'brute-force':         'BRUTE_FORCE_DETECTED',
  'phishing':            'SUSPICIOUS_IP',
  'credential-stuffing': 'SUSPICIOUS_DEVICE',
  'session-hijacking':   'CONCURRENT_SESSION',
  'firefox-hijacking':   'SUSPICIOUS_DEVICE',
};

const SIM_ALERT_TYPE_MAP = {
  'brute-force':         'BRUTE_FORCE_DETECTED',
  'phishing':            'SUSPICIOUS_IP',
  'credential-stuffing': 'SUSPICIOUS_DEVICE',
  'session-hijacking':   'CONCURRENT_SESSION',
  'firefox-hijacking':   'SUSPICIOUS_DEVICE',
};

exports.getSimulations = (req, res) => {
  const list = Object.entries(SIMULATIONS).map(([id, sim]) => ({
    id,
    name:        sim.name,
    description: sim.description,
    riskLevel:   sim.riskLevel,
  }));
  res.json({ simulations: list });
};

exports.runSimulation = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const sim = SIMULATIONS[type];
  if (!sim) return res.status(404).json({ error: 'Unknown simulation type.' });

  const logEvent  = SIM_EVENT_MAP[type]      || 'BRUTE_FORCE_DETECTED';
  const alertType = SIM_ALERT_TYPE_MAP[type] || 'BRUTE_FORCE_DETECTED';

  await Promise.all([
    ActivityLog.create({
      userId:   req.user._id,
      event:    logEvent,
      severity: 'warning',
      details:  `[SIMULATION] ${sim.name} run by user`,
    }),
    Alert.create({
      userId:   req.user._id,
      type:     alertType,
      title:    `🧪 Simulation: ${sim.name}`,
      message:  `You ran a "${sim.name}" simulation. Outcome: ${sim.outcome}.`,
      severity: sim.riskLevel === 'CRITICAL' ? 'critical' : 'high',
      metadata: { simulation: true, type },
    }),
  ]);

  res.json({
    simulation:      sim.name,
    description:     sim.description,
    steps:           sim.steps,
    outcome:         sim.outcome,
    riskLevel:       sim.riskLevel,
    recommendations: sim.recommendations,
  });
});
