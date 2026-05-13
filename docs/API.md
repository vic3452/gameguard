# GAMEGUARD API Documentation

**Base URL:** `http://localhost:5000/api`  
**Auth:** Bearer token in `Authorization` header  
**Content-Type:** `application/json`

---

## Authentication

### POST /auth/register
Register a new user.

**Body:**
```json
{
  "username": "ProGamer99",
  "email": "user@example.com",
  "password": "MyPass@123!"
}
```

**Response 201:**
```json
{
  "message": "Account created successfully.",
  "token": "<jwt>",
  "user": { "id": "...", "username": "ProGamer99", "email": "user@example.com" }
}
```

---

### POST /auth/login
Authenticate and receive a JWT. If 2FA is enabled, returns `requiresTwoFactor: true`.

**Body:**
```json
{ "email": "user@example.com", "password": "MyPass@123!" }
```

**Response 200 (no 2FA):**
```json
{ "token": "<jwt>", "user": { "id": "...", "username": "...", "email": "...", "twoFactorEnabled": false } }
```

**Response 200 (2FA required):**
```json
{ "requiresTwoFactor": true, "userId": "<id>" }
```

---

### POST /auth/verify-2fa
Verify a 2FA OTP code.

**Body:**
```json
{ "token": "123456", "userId": "<id>" }
```

**Response 200:**
```json
{ "token": "<jwt>", "user": { "id": "...", "username": "...", "email": "..." } }
```

---

### POST /auth/enable-2fa *(Auth required)*
Enable two-factor authentication.

**Response 200:**
```json
{ "message": "2FA enabled successfully.", "method": "email" }
```

---

### POST /auth/disable-2fa *(Auth required)*
Disable two-factor authentication. Creates a security alert.

---

### GET /auth/me *(Auth required)*
Get current authenticated user info.

---

### POST /auth/logout *(Auth required)*
Invalidate all active sessions.

---

## Dashboard

### GET /dashboard *(Auth required)*
Returns full security overview for the dashboard.

**Response 200:**
```json
{
  "risk": {
    "score": 35,
    "level": "MEDIUM",
    "breakdown": { "password": 10, "twoFA": 25, "recentEvents": 0, "loginHealth": 0 },
    "tips": ["Enable Two-Factor Authentication..."]
  },
  "recentLogins": [ { "event": "LOGIN_SUCCESS", "ip": "...", "device": "...", "createdAt": "..." } ],
  "unreadAlerts": 2,
  "alerts": [ { "_id": "...", "type": "SUSPICIOUS_IP", "title": "...", "severity": "medium" } ],
  "accounts": [ { "platform": "Steam", "username": "...", "accountStatus": "secure" } ],
  "activeSessions": [],
  "activityByDay": [],
  "user": { "username": "...", "twoFactorEnabled": false, "lastLoginAt": "...", "lastLoginIP": "..." }
}
```

---

## Alerts

### GET /alerts *(Auth required)*
Get paginated alerts.

**Query params:** `page`, `limit`, `unread=true`

**Response 200:**
```json
{ "alerts": [...], "total": 10, "page": 1, "pages": 1 }
```

---

### PATCH /alerts/:id/read *(Auth required)*
Mark a specific alert as read.

---

### PATCH /alerts/read-all *(Auth required)*
Mark all alerts as read.

---

### DELETE /alerts/:id *(Auth required)*
Delete an alert.

---

## Activity Logs

### GET /logs *(Auth required)*
Get paginated activity logs.

**Query params:** `page`, `limit`, `event`, `severity`

**Response 200:**
```json
{
  "logs": [
    {
      "_id": "...",
      "event": "LOGIN_SUCCESS",
      "severity": "info",
      "ip": "192.168.1.1",
      "device": "desktop",
      "browser": "Chrome 120",
      "os": "Windows 11",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "pages": 2
}
```

---

### GET /logs/stats *(Auth required)*
Get event counts for last 30 days.

```json
{ "stats": [{ "_id": "LOGIN_SUCCESS", "count": 15 }, ...] }
```

---

## Risk Score

### GET /risk-score *(Auth required)*
Get computed risk score.

**Response 200:**
```json
{
  "score": 35,
  "level": "MEDIUM",
  "breakdown": {
    "password": 10,
    "twoFA": 25,
    "recentEvents": 0,
    "loginHealth": 0
  },
  "tips": ["Enable Two-Factor Authentication to significantly reduce your risk."]
}
```

---

## Gaming Accounts

### GET /accounts *(Auth required)*
List all linked gaming accounts.

---

### POST /accounts *(Auth required)*
Link a new gaming platform account.

**Body:**
```json
{
  "platform": "Steam",
  "username": "ProGamer99_Steam",
  "notes": "Main Steam account"
}
```

**Platforms:** `Steam`, `Epic Games`, `PlayStation`, `Xbox`, `Nintendo`, `Riot Games`, `Battle.net`, `Origin`, `Ubisoft Connect`, `GOG`

---

### PUT /accounts/:id *(Auth required)*
Update an account.

**Body:** `{ "username", "notes", "accountStatus" }`

---

### DELETE /accounts/:id *(Auth required)*
Remove a linked account.

---

## Threat Simulator

### GET /threats *(Auth required)*
List available simulations.

**Response:**
```json
{
  "simulations": [
    { "id": "brute-force", "name": "Brute-Force Attack", "description": "...", "riskLevel": "HIGH" },
    { "id": "phishing", "name": "Phishing Attack", "description": "...", "riskLevel": "CRITICAL" },
    { "id": "credential-stuffing", "name": "Credential Stuffing", "description": "...", "riskLevel": "CRITICAL" },
    { "id": "session-hijacking", "name": "Session Hijacking", "description": "...", "riskLevel": "HIGH" }
  ]
}
```

---

### POST /threats/:type/run *(Auth required)*
Run a named simulation. Creates an activity log and alert.

**Types:** `brute-force`, `phishing`, `credential-stuffing`, `session-hijacking`

**Response 200:**
```json
{
  "simulation": "Brute-Force Attack",
  "description": "...",
  "steps": [
    { "time": 0, "message": "Bot initiated...", "type": "info" },
    { "time": 800, "message": "50 attempts/sec...", "type": "warning" }
  ],
  "outcome": "BLOCKED",
  "riskLevel": "HIGH",
  "recommendations": ["Enable account lockout after 5 failed attempts", ...]
}
```

---

## Security Education

### GET /education/threats *(Auth required)*
List all documented threats.

### GET /education/threats/:id *(Auth required)*
Get detailed threat info. IDs: `phishing`, `credential-stuffing`, `keylogging`, `brute-force`, `session-hijacking`, `social-engineering`

### GET /education/tips *(Auth required)*
Get all security tips grouped by category.

### GET /education/glossary *(Auth required)*
Get cybersecurity glossary.

---

## Health Check

### GET /health
```json
{ "status": "ok", "service": "GAMEGUARD API", "timestamp": "..." }
```

---

## Error Responses

All errors follow this format:
```json
{ "error": "Human-readable error message" }
```

| Code | Meaning |
|------|---------|
| 400  | Validation error / bad request |
| 401  | Unauthenticated |
| 403  | Forbidden (wrong role) |
| 404  | Not found |
| 409  | Conflict (duplicate) |
| 423  | Account locked |
| 429  | Rate limited |
| 500  | Internal server error |
