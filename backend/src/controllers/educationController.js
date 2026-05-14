const EDUCATION_DATA = {
  threats: [
    {
      id: 'phishing', title: 'Phishing', icon: '🎣', level: 'beginner', severity: 'high',
      summary: 'Fake websites or emails designed to steal your login credentials.',
      details: 'Attackers create convincing copies of Steam, Epic, or other gaming platforms. They send emails claiming your account is at risk, then direct you to their fake page. Once you enter your credentials, they own your account.',
      realExample: 'You receive an email: "Your Steam account has been flagged. Verify now →" — the link goes to st3am.com (not steam.com).',
      prevention: [
        'Always check the URL — look for subtle misspellings',
        'Navigate to gaming sites directly, never from email links',
        'Enable 2FA so stolen passwords alone are useless',
        'Use a password manager — it auto-fills only on real domains',
      ],
    },
    {
      id: 'credential-stuffing', title: 'Credential Stuffing', icon: '🗂️', level: 'beginner', severity: 'high',
      summary: 'Attackers use username/password pairs leaked from other sites to access your gaming accounts.',
      details: 'Billions of credentials are available on the dark web from past data breaches. Attackers automate login attempts across gaming platforms using these leaked pairs, hoping you reused a password.',
      realExample: 'Your email and password leaked from a 2021 forum breach. An attacker tries the same combo on Steam — and it works because you reused the password.',
      prevention: [
        'Use a unique password for every gaming platform',
        'Use a password manager like Bitwarden or 1Password',
        'Check haveibeenpwned.com to see if your email was breached',
        'Change passwords immediately after any breach notification',
      ],
    },
    {
      id: 'keylogging', title: 'Keylogging', icon: '⌨️', level: 'intermediate', severity: 'critical',
      summary: 'Malware that records every keystroke — capturing passwords as you type them.',
      details: 'Keyloggers are installed through malicious downloads (fake game mods, cheats, cracks). They silently record everything you type and send it to attackers.',
      realExample: 'You download a "free" game cheat from a suspicious Discord server. Unknown to you, it installed a keylogger. Your Steam password is captured the next time you log in.',
      prevention: [
        'Never download game cheats or mods from unofficial sources',
        'Keep antivirus software up to date',
        'Use a hardware security key for authentication',
        'Regularly scan your system with Malwarebytes',
      ],
    },
    {
      id: 'brute-force', title: 'Brute-Force Attack', icon: '🔨', level: 'beginner', severity: 'medium',
      summary: 'Automated tools try millions of password combinations until one works.',
      details: 'Attackers use scripts to try every possible password combination. Short, simple passwords can be cracked in seconds. Most platforms add rate limiting and lockouts to stop this.',
      realExample: 'Your Roblox account uses the password "gamer123" — a brute-force tool cracks it in under 2 seconds using a common password dictionary.',
      prevention: [
        'Use passwords of 12+ characters with symbols and numbers',
        'Enable account lockout after failed attempts',
        'Use 2FA — even if the password is guessed, they need your phone',
        'Never use dictionary words or personal info in passwords',
      ],
    },
    {
      id: 'session-hijacking', title: 'Session Hijacking', icon: '🍪', level: 'intermediate', severity: 'high',
      summary: 'Theft of your active login session token to impersonate you.',
      details: 'When you log in, websites give you a session cookie. If attackers can steal this cookie (via network interception or XSS), they can access your account without needing your password.',
      realExample: 'You log into your gaming account on a coffee shop\'s WiFi. An attacker on the same network captures your session cookie and uses it to access your account from home.',
      prevention: [
        'Only use HTTPS gaming sites (look for the padlock icon)',
        'Use a VPN on public WiFi',
        'Log out of gaming accounts when you\'re done',
        'GAMEGUARD detects concurrent sessions from different locations',
      ],
    },
    {
      id: 'social-engineering', title: 'Social Engineering', icon: '🎭', level: 'beginner', severity: 'medium',
      summary: 'Attackers manipulate you psychologically into handing over account access.',
      details: 'Attackers pretend to be friends, support staff, or trade partners to trick you into sharing your account details, items, or clicking malicious links.',
      realExample: '"Hey, I\'m from Steam Support. Your account was hacked. Give me your password and I\'ll secure it." — Legitimate support will NEVER ask for your password.',
      prevention: [
        'No legitimate platform will ever ask for your password',
        'Be suspicious of "too good to be true" trade offers',
        'Verify the identity of anyone asking for account info',
        'Trust your instincts — if something feels off, it probably is',
      ],
    },
  ],

  tips: [
    { category: 'Passwords',        tip: 'Use a passphrase: 4 random words are stronger than "P@ssw0rd"', icon: '🔑' },
    { category: 'Passwords',        tip: 'Never reuse passwords across gaming platforms', icon: '🔑' },
    { category: '2FA',              tip: 'Enable 2FA on every platform that supports it', icon: '📱' },
    { category: '2FA',              tip: 'Use an authenticator app over SMS when possible', icon: '📱' },
    { category: 'Account Security', tip: 'Review active sessions regularly and revoke unknown ones', icon: '🖥️' },
    { category: 'Account Security', tip: 'Add a recovery email and phone number to all gaming accounts', icon: '🖥️' },
    { category: 'Network',          tip: 'Use a VPN when gaming on public WiFi', icon: '🌐' },
    { category: 'Network',          tip: 'Ensure your home router firmware is up to date', icon: '🌐' },
    { category: 'Downloads',        tip: 'Only download mods and cheats from official, verified sources', icon: '⬇️' },
    { category: 'Downloads',        tip: 'Scan all downloaded files with antivirus before running', icon: '⬇️' },
    { category: 'Monitoring',       tip: 'Set up login notification emails on all gaming platforms', icon: '🔔' },
    { category: 'Monitoring',       tip: 'Check haveibeenpwned.com monthly for breach alerts', icon: '🔔' },
  ],

  glossary: [
    { term: '2FA',                definition: 'Two-Factor Authentication — a second verification step beyond your password.' },
    { term: 'Phishing',           definition: 'Deceptive emails or sites designed to steal your credentials.' },
    { term: 'Session Token',      definition: 'A temporary key that keeps you logged in — if stolen, can be misused.' },
    { term: 'Password Manager',   definition: 'Software that generates and stores unique passwords for every site.' },
    { term: 'Brute Force',        definition: 'Automated trial of all possible passwords until one works.' },
    { term: 'VPN',                definition: 'Virtual Private Network — encrypts your internet traffic.' },
    { term: 'Malware',            definition: 'Malicious software installed secretly to damage or spy on your system.' },
    { term: 'Social Engineering', definition: 'Psychological manipulation to trick users into revealing information.' },
  ],
};

exports.getThreats  = (req, res) => res.json({ threats:  EDUCATION_DATA.threats });
exports.getThreat   = (req, res) => {
  const threat = EDUCATION_DATA.threats.find(t => t.id === req.params.id);
  if (!threat) return res.status(404).json({ error: 'Threat not found.' });
  res.json({ threat });
};
exports.getTips     = (req, res) => res.json({ tips:     EDUCATION_DATA.tips });
exports.getGlossary = (req, res) => res.json({ glossary: EDUCATION_DATA.glossary });
