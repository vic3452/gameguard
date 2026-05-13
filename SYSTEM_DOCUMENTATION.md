# SYSTEM DOCUMENTATION: GAMEGUARD

**PROJECT TOPIC:** 🛡️ GAMEGUARD — Secure Gaming Account Protection System  
**SUBMITTED BY:** [YOUR FULL OFFICIAL NAME]  
**ADM NO:** [YOUR ADM NO]  
**UNIVERSITY:** ZETECH UNIVERSITY  
**DATE:** APRIL, 2026

---

## DECLARATION
I declare that this system documentation is my original work and has not been submitted for any other award in any other university.

## DEDICATION
Dedicated to the gaming community and the pursuit of digital security education.

## ABSTRACT
GAMEGUARD is a full-stack security dashboard designed to protect gaming accounts from unauthorized access. The system integrates advanced authentication (JWT + 2FA), real-time risk scoring, and automated threat detection. Beyond technical protection, it features an interactive education module and threat simulator to teach users about cybersecurity best practices, effectively bridging the gap between passive security and active user awareness.

---

## CHAPTER ONE: PROJECT WORKPLAN

### 1.1 Statement of Problem
Gaming account theft has become a multi-billion dollar illicit industry. Most gamers rely on weak or reused passwords and frequently ignore Two-Factor Authentication (2FA) due to perceived friction. Furthermore, many users do not understand the mechanics of common attacks like phishing or brute-force, making them vulnerable to social engineering.

### 1.2 System Justification
There is a critical need for a tool that not only secures accounts but also educates users. GAMEGUARD justifies its existence by:
1. Providing a centralized view of security health across multiple platforms (Steam, Riot, Epic).
2. Quantifying security posture through a dynamic "Risk Score."
3. Reducing the "knowledge gap" through simulated attacks in a safe environment.

### 1.3 System Objectives

#### 1.3.1 General Objective
To develop a comprehensive security and education platform that empowers gamers to protect their digital identities through monitoring, detection, and interactive learning.

#### 1.3.2 Specific Objectives
1. Implement a secure multi-factor authentication system.
2. Develop a real-time risk scoring algorithm based on user behavior and settings.
3. Build an automated security detection engine for suspicious IPs and devices.
4. Create an interactive threat simulator for educational purposes.
5. Provide a responsive, high-performance dashboard using modern web technologies.

### 1.4 Functional Requirements

| User Role | Activities |
|-----------|------------|
| **Standard User** | Register, Login, Enable/Disable 2FA, View Risk Score, Manage Linked Accounts, View Activity Logs, Receive Security Alerts, Run Threat Simulations, Read Security Guides. |
| **System** | Monitor logins for suspicious activity, Calculate Risk Scores, Generate Alerts, Enforce Rate Limiting, Log all security-relevant events. |

### 1.5 Breakdown of Tools & Resources

| Tool | Purpose |
|------|---------|
| **React 18** | Frontend UI development with component-based architecture. |
| **Node.js & Express** | Backend API logic and server-side operations. |
| **MongoDB & Mongoose** | NoSQL database for flexible storage of logs, alerts, and user data. |
| **Tailwind CSS** | Rapid styling of the "Gamer-themed" UI. |
| **JSON Web Tokens (JWT)** | Secure, stateless session management. |
| **otplib (TOTP)** | 2FA implementation for time-based one-time passwords. |
| **Jest & Supertest** | Automated unit and integration testing. |

---

## CHAPTER TWO: DESIGN AND MODELING

### 2.1 Introduction
The system follows a modern MERN-like architecture (using React, Node, and MongoDB) with a focus on modularity and security.

### 2.2 Logic Models
1. **Authentication Flow:** User → Login → 2FA Challenge (if enabled) → JWT Generation → Secure Cookie storage.
2. **Risk Scoring Engine:** Analyzes password age (20pts), 2FA status (25pts), recent suspicious events (40pts), and failed attempts (15pts).
3. **Security Detection Engine:** Compares incoming request context (IP, UA string) against `knownIPs` and `knownDevices`.

### 2.3 User Interface Models
The UI is designed with a "Dark Gamer" aesthetic, utilizing:
- **Sidebar Navigation:** For quick access to Alerts, Logs, and Simulations.
- **Status Cards:** Glowing borders (Green/Yellow/Red) to indicate severity and health.
- **Glassmorphism:** Semi-transparent headers and panels for depth.

---

## CHAPTER THREE: SYSTEM IMPLEMENTATION

### 3.1 Introduction
Implementation focused on "Security by Design," ensuring all inputs are validated and all actions are logged.

### 3.2 User Interface Implementation
The frontend uses **Vite** for fast builds. It features custom-styled inputs (`input-gamer`), action buttons (`btn-primary`), and animated background elements (neon blobs) to maintain user engagement.

### 3.3 Database Implementation
Data is structured into four main collections:
- `Users`: Credentials, security settings, and known entities.
- `GamingAccounts`: Linked platforms and their individual risk levels.
- `Alerts`: Real-time notifications of security events.
- `ActivityLogs`: Audit trail of all login attempts and status changes.

### 3.4 Logic Implementation, Feature Tests and System Test
The backend implementation includes:
- **Middleware:** `auth` (JWT verification), `validate` (Joi schema checking), `errorHandler`.
- **Services:** `riskService` (scoring logic), `securityService` (detection), `emailService`.

**Testing Suite:**
- **Unit Tests:** Verify helper functions (JWT generation, OTP verification, UA parsing).
- **Integration Tests:** Cover Auth endpoints, Education API, and Threat Simulator routes.
- **Security Tests:** Verify rate limiting and security headers (Helmet.js).

### 3.5 Deployment
The system is containerized using **Docker** and **Docker Compose**, separating the MongoDB, Backend, and Frontend (Nginx) services for scalability and ease of setup.

---

## CHAPTER FOUR: CONCLUSION AND RECOMMENDATION

### 4.1 Conclusion
GAMEGUARD successfully demonstrates that security tools can be both effective and engaging. By combining robust technical controls with interactive education, the system provides a holistic approach to protecting gaming identities in an increasingly hostile digital landscape.

### 4.2 Recommendation
Future iterations should include:
1. Real-time integration with actual Gaming APIs (e.g., Steam Web API) for live status monitoring.
2. Machine learning-based anomaly detection for more nuanced threat identification.
3. Mobile application companion for push notifications and mobile-based 2FA.

---

## REFERENCES
1. OWASP Top 10 Security Risks (2021).
2. MongoDB Documentation for Mongoose Schema Design.
3. React Documentation for State Management and Hooks.
4. IETF RFC 6238: TOTP: Time-Based One-Time Password Algorithm.
