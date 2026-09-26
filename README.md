# SwasthyaSetu AI (स्वास्थ्यसेतु)
### AI-Assisted Rural-to-Tertiary Healthcare Continuity & Referral Integrity Platform

[![Live Production](https://img.shields.io/badge/Live_Portal-Vercel-emerald?style=for-the-badge&logo=vercel)](https://frontend-nu-six-f3yyi717g5.vercel.app)
[![API Gateway](https://img.shields.io/badge/API_Gateway-Render-46E3B7?style=for-the-badge&logo=render)](https://swasthyasetu-api-gateway.onrender.com/health)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-Passing%20(100%25)-brightgreen?style=for-the-badge&logo=githubactions)](https://github.com/Pranav-chaudhari-2006/Swasthyasetu-AI/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

> **SwasthyaSetu AI** is an auditable, offline-resilient healthcare continuity platform engineered for the Indian public health ecosystem. It bridges the extreme operational divide between rustic rural primary care (ASHA workers and village patients) and high-density clinical command centers (Community Health Centres, District Hospitals, and Medical Colleges).

---

## 🎨 Official Design Theme: 🌿 Ayurvedic Slate & Emerald

SwasthyaSetu AI is standardized on the **Ayurvedic Slate & Emerald** visual design system. This theme is intentionally engineered for public health: it instills deep clinical trustworthiness, evokes natural healing and wellness, eliminates visual clutter, and delivers soothing contrast for patients, frontline ASHAs, and doctors during demanding clinical shifts.

### Visual Palette & Design Tokens
```
Primary Emerald Accent:    #10b981 (Tailored Emerald Green)
Primary Emerald Dark:      #059669 (Deep Clinical Green)
Background (Obsidian):     #090d16 (Deep Night Slate)
Surface Card:              #111827 (Subtle Frosted Slate)
Surface Card Hover:        #1e293b (Interactive Glow Slate)
Surface Border:            rgba(255, 255, 255, 0.08) (Subtle Edge Highlight)
Text Primary:              #f8fafc (Pure Slate Ice)
Text Muted:                #94a3b8 (Soft Mist Grey)
Text Subtle:               #64748b (Slate Muted)

Clinical Urgency Accents:
🚨 EMERGENCY (Red Alert):   #ef4444 (Crimson Coral) | rgba(239, 68, 68, 0.12)
⚠️ SAME_DAY (Urgent Amber): #f59e0b (Golden Honey)  | rgba(245, 158, 11, 0.12)
✅ ROUTINE (Verified Mint): #10b981 (Emerald Mint)  | rgba(16, 185, 129, 0.12)
```

### CSS Variables ([frontend/src/index.css](frontend/src/index.css))
```css
:root {
  /* 🌿 Option 1: Ayurvedic Slate & Emerald Theme Tokens */
  --color-bg: #090d16;
  --color-surface: #111827;
  --color-surface-hover: #1e293b;
  --color-border: rgba(255, 255, 255, 0.08);

  --color-primary: #10b981;
  --color-primary-hover: #059669;
  --color-primary-soft: rgba(16, 185, 129, 0.12);

  --color-text: #f8fafc;
  --color-text-muted: #94a3b8;
  --color-text-subtle: #64748b;

  --color-emergency: #ef4444;
  --color-emergency-soft: rgba(239, 68, 68, 0.12);
  --color-urgent: #f59e0b;
  --color-urgent-soft: rgba(245, 158, 11, 0.12);
  --color-routine: #10b981;
  --color-routine-soft: rgba(16, 185, 129, 0.12);

  /* Modern Less-Clustered Typography */
  --font-display: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### "The Stitch" Decluttering Principles
1. **Generous Whitespace**: Minimum 24px inner padding (`p-6`) and 16px-24px grid gaps. Elements are never cramped edge-to-edge.
2. **60-30-10 Color Balance**: 60% deep obsidian slate, 30% frosted card surface, 10% emerald accent.
3. **No Nested Box Fatigue**: Asynchronous visual layers separated by translucent glass borders (`backdrop-blur-md`, `border: 1px solid rgba(255,255,255,0.08)`).
4. **Mobile Thumb-Zone**: All primary actions (Intake, QR scan, Record Vitals) reside in the bottom 45% of the viewport with minimum 48px × 48px hit targets.
5. **Modern Typography**:
   - **Headings**: `Plus Jakarta Sans` (600, 700) - geometric, crisp, authoritative.
   - **Body**: `Inter` (400, 500, 600) - tall x-height, anti-aliased on low-DPI Android screens.
   - **Vitals & Codes**: `JetBrains Mono` (500, 700) - tabular numbers for SpO2, Pulse, BP, and QR HMAC hashes.

---

## 🚀 Live Cloud Deployments

| Component | Platform | Environment | Live URL |
| :--- | :--- | :--- | :--- |
| **Unified Frontend Portals** | **Vercel Edge** | Production | [https://frontend-nu-six-f3yyi717g5.vercel.app](https://frontend-nu-six-f3yyi717g5.vercel.app) |
| **API Gateway & BFF** | **Render** | Production | [https://swasthyasetu-api-gateway.onrender.com/health](https://swasthyasetu-api-gateway.onrender.com/health) |
| **Database** | **Render PostgreSQL** | Production | `swasthyasetu-postgres` (Managed DB) |

---

## 🏛️ Platform Architecture

SwasthyaSetu AI operates as a coordinated 11-microservice ecosystem governed by strict contracts, transactional isolation, and a zero-mock policy:

```text
                                  [ Users & Stakeholders ]
           (Patient Mobile PWA | Frontline ASHA | Doctor Portal | DHO Command)
                                             │
                                             ▼
                      [ Vercel Global Edge CDN (Frontend Portals) ]
                                             │
                                             ▼
                     [ API Gateway & BFF Orchestrator (Port 4000) ]
                                             │
      ┌──────────────┬──────────────┬────────┼──────────────┬──────────────┐
      ▼              ▼              ▼        ▼              ▼              ▼
  [MS-1 Auth]   [MS-2 Fac]     [MS-3 Pt]  [MS-4 Int]     [MS-5 Safe]    [MS-6 Ref]
   Port 4001     Port 4002      Port 4003  Port 4004      Port 4005      Port 4006
      │              │              │        │              │              │
      ├──────────────┴──────────────┴────────┴──────────────┴──────────────┤
      ▼              ▼              ▼        ▼                             │
  [MS-7 Emerg]  [MS-8 Clin]    [MS-9 Fol] [MS-10 Sync]                     │
   Port 4007     Port 4008      Port 4009  Port 4010                       │
      │              │              │        │                             │
      └──────────────┴──────────────┴────────┴─────────────────────────────┘
                                             │
                           [ Managed PostgreSQL Database ]
```

### Microservices Directory
- **MS-1 Auth, RBAC & Audit Service** (`Port 4001`): JWT session management, OTP simulation, role-based access control, cryptographic audit trail.
- **MS-2 Facility Registry & Capability Engine** (`Port 4002`): Real-time capability mapping (ICU beds, blood bank, oxygen, specialties), nearest facility search.
- **MS-3 Patient & Case Continuity Service** (`Port 4003`): Patient registry, longitudinal clinical timeline, active care episodes.
- **MS-4 Intake & Multilingual AI Structuring Service** (`Port 4004`): Multilingual conversation processing with explicit non-authoritative AI flags (`is_ai_generated: true`).
- **MS-5 Deterministic Safety & Triage Engine** (`Port 4005`): 100% deterministic safety rules classifying triage into `ROUTINE`, `SAME_DAY`, or `EMERGENCY`.
- **MS-6 Referral State Machine & QR Service** (`Port 4006`): Finite state machine with HMAC-SHA256 arrival QR tokens.
- **MS-7 Emergency Coordination & 108 Handoff Service** (`Port 4007`): Zero-click emergency dispatch, live ambulance telemetry stream, hospital ER clinical handoff.
- **MS-8 Clinical Workflow, Medicine & Diagnostic Service** (`Port 4008`): Authorized doctor clinical notes, ICD-10 diagnosis codification, multi-item e-prescriptions, pharmacy stock deductions.
- **MS-9 Follow-Up & Notification Service** (`Port 4009`): Automatic post-discharge follow-up task generation, overdue escalation engine.
- **MS-10 Offline Sync & Cryptographic Reconciliation** (`Port 4010`): Signed offline rule packages, offline mutation queue replay, deterministic conflict resolution.
- **MS-11 API Gateway & Backend-For-Frontend** (`Port 4000`): Reverse proxy, rate limiting, correlation tracking, unified BFF dashboards.

---

## 🛡️ Strict Operational Guarantees

1. **Zero Dummy / Mock Data Policy**: Every microservice possesses a real PostgreSQL DDL schema (`schema.sql`) and typed repository layer. No fake stubs or synthetic arrays in application pathways.
2. **AI is Strictly Non-Authoritative**: Clinical diagnosis and prescriptions are restricted to authenticated clinicians (`403 Forbidden` for non-clinical roles).
3. **100% Automated Test Verification**: All 28 Gateway/E2E tests and 6 Frontend Vitest tests pass with 100% assertion coverage.
4. **Render Free-Tier Keep-Alive Engine**: Automated background worker pings the backend service every **40 to 45 seconds** (random jitter) to prevent free-tier spin-down.

---

## ⚡ Render Free-Tier Keep-Alive Runner

To prevent Render's free tier from putting the backend to sleep after 15 minutes of inactivity, run the included keep-alive daemon:

```bash
# Run standalone keep-alive worker
node scripts/render_pinger.js

# Or specify a custom target service URL
RENDER_SERVICE_URL="https://your-service.onrender.com/health" node scripts/render_pinger.js
```

Or trigger/inspect via the Gateway API:
```bash
# Get live keep-alive status & next ping timer
curl http://localhost:4000/api/v1/keepalive/status

# Trigger an immediate on-demand ping
curl -X POST http://localhost:4000/api/v1/keepalive/ping
```

---

## 💻 Local Development Setup

### Prerequisites
- Node.js `20.x` or later
- npm `10.x` or later
- PostgreSQL `15+` (optional, in-memory repository fallback available for local development)

### 1. Clone & Setup
```bash
git clone https://github.com/Pranav-chaudhari-2006/Swasthyasetu-AI.git
cd Swasthyasetu-AI
```

### 2. Run API Gateway
```bash
cd backend/gateway
npm install
npm run build
npm test
npm start
# Gateway runs on http://localhost:4000
```

### 3. Run Frontend
```bash
cd frontend
npm install
npm test
npm run dev
# Frontend runs on http://localhost:3000
```

---

## 📜 Documentation Hub

For exhaustive specifications and architecture guides, inspect [docs/index.md](docs/index.md):
- [Frontend "Stitch" Design System Specification](docs/specifications/frontend_design.md)
- [Cloud Deployment & Operations Runbook](docs/deployment/render_vercel_deployment.md)
- [System Architecture & SRS](docs/specifications/srs.md)
- [Governance & Strict Operational Rules](rules.md)
- [Master Task Tracker (100% Complete)](PROJECT_TRACKER.md)
- [Project Changelog](CHANGELOG.md)

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
