# 🛡️ GAMEGUARD — Secure Gaming Account Protection System

A full-stack web application that monitors, detects, and alerts users about suspicious gaming account activity — while educating them on cybersecurity best practices.

---

## 🖥️ System Overview

GAMEGUARD is a production-ready (lightweight) security dashboard for gamers. It provides:

- 🔐 Secure authentication with JWT + 2FA
- 📊 Real-time risk scoring
- 🚨 Automatic suspicious activity detection & alerts
- 📋 Full activity logging
- 🎮 Simulated gaming account management
- 🧪 Threat simulation for education
- 📚 Security education module

---

## 🗂️ Project Structure

```
gameguard/
├── backend/
│   ├── src/
│   │   ├── app.js                  # Express app config
│   │   ├── server.js               # Entry point
│   │   ├── config/
│   │   │   └── database.js         # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── alertController.js
│   │   │   ├── logController.js
│   │   │   ├── riskController.js
│   │   │   ├── accountController.js
│   │   │   ├── threatController.js
│   │   │   └── educationController.js
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT middleware
│   │   │   ├── validate.js         # Joi validation
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── ActivityLog.js
│   │   │   ├── Alert.js
│   │   │   └── GamingAccount.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── dashboard.js
│   │   │   ├── alerts.js
│   │   │   ├── logs.js
│   │   │   ├── risk.js
│   │   │   ├── accounts.js
│   │   │   ├── threats.js
│   │   │   └── education.js
│   │   ├── services/
│   │   │   ├── securityService.js  # Threat detection engine
│   │   │   ├── riskService.js      # Risk scoring algorithm
│   │   │   └── emailService.js     # Nodemailer alerts
│   │   └── utils/
│   │       ├── helpers.js          # JWT, device parsing, OTP
│   │       ├── cronJobs.js         # Background tasks
│   │       └── seed.js             # Sample data seeder
│   ├── tests/
│   │   └── gameguard.test.js
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 # Router
│   │   ├── main.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.jsx         # Auth context
│   │   ├── lib/
│   │   │   └── api.js              # Axios client
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── TwoFAPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AlertsPage.jsx
│   │   │   ├── LogsPage.jsx
│   │   │   ├── AccountsPage.jsx
│   │   │   ├── RiskPage.jsx
│   │   │   ├── ThreatSimPage.jsx
│   │   │   └── EducationPage.jsx
│   │   ├── components/
│   │   │   └── Layout.jsx          # Sidebar + navigation
│   │   └── styles/
│   │       └── globals.css
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docs/
│   └── API.md
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js** >= 18
- **MongoDB** >= 6.0 (running locally or via Atlas)
- **npm** >= 9
- (Optional) Docker + Docker Compose

---

## 🚀 Quick Start (Local)

### 1. Clone and navigate

```bash
git clone <repo-url>
cd gameguard
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, email settings
npm install
npm run seed          # Seed sample data (requires MongoDB running)
npm run dev           # Starts on http://localhost:5000
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
npm run dev           # Starts on http://localhost:3000
```

### 4. Open browser

Navigate to: **http://localhost:3000**

**Demo credentials:**
```
Email:    demo@gameguard.io
Password: Demo@1234!
```

---

## 🐳 Docker Compose (Recommended)

```bash
# From project root
cp backend/.env.example backend/.env
# Edit backend/.env

docker-compose up --build -d
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

Tests cover:
- Utility helpers (JWT, password strength, OTP)
- Risk scoring engine logic
- Auth endpoint validation
- Security detection service
- Threat simulator
- Education module API

---

## 🔐 Security Features Implemented

| Feature | Implementation |
|---------|---------------|
| Password hashing | bcryptjs (12 rounds) |
| JWT auth | jsonwebtoken (7d expiry) |
| 2FA | otplib TOTP (10-min window) |
| Rate limiting | express-rate-limit (20 req/15min for auth) |
| HTTP headers | helmet.js |
| Input validation | Joi schemas |
| Account lockout | 5 failed attempts → 30 min lock |
| CORS | Configured for frontend origin only |
| Error handling | Centralized, no stack trace leaks |
| Log TTL | Activity logs auto-delete after 90 days |

---

## 📡 API Base URL

```
http://localhost:5000/api
```

See `/docs/API.md` for full documentation.

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS (dark gamer theme) |
| Charts | Recharts |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| 2FA | otplib (TOTP) |
| Email | Nodemailer |
| Cron | node-cron |
| Validation | Joi |
| Testing | Jest + Supertest |
| Container | Docker + nginx |

---

## 👤 Sample Test Users

| Username | Email | Password | 2FA |
|----------|-------|----------|-----|
| ProGamer99 | demo@gameguard.io | Demo@1234! | Off |
| ShadowRogue | shadow@gameguard.io | Shadow@5678! | On |

---

## 🔒 Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character (`@$!%*?&^#`)

---

## 📧 Email Configuration

For development, use [Mailtrap](https://mailtrap.io) (free):
1. Sign up at mailtrap.io
2. Get SMTP credentials from your inbox
3. Add to `backend/.env`

For production, use SendGrid, AWS SES, or Gmail (App Password).

---

## 🛡️ Suspicious Activity Detection

GAMEGUARD automatically flags:

1. **New IP Address** — Login from IP not in known IPs list
2. **New Device** — Login from unrecognized browser/OS combination
3. **Brute Force** — 4+ failed login attempts
4. **Unusual Time** — Login between 1am–5am UTC
5. **Concurrent Sessions** — 2+ active sessions simultaneously

Each detection creates an Alert in the DB and optionally sends an email.

---

## 📊 Risk Score Algorithm

| Factor | Max Penalty |
|--------|-------------|
| Password age/freshness | 20 pts |
| 2FA disabled | 25 pts |
| Suspicious events (7 days) | 40 pts |
| Failed login attempts (24h) | 15 pts |
| **Total** | **100 pts** |

- **0–25**: LOW (Green)
- **26–60**: MEDIUM (Yellow)
- **61–100**: HIGH (Red)

---

## 📄 License

MIT — For educational purposes.
