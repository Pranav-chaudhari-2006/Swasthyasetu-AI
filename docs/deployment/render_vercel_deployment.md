# SwasthyaSetu AI Cloud Deployment & Live Operations Runbook

> **Governing Directive**: [rules.md](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/rules.md) (Rule 2.6: Prototype Go-Live Gate)  
> **Master Tracking**: [PROJECT_TRACKER.md](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/PROJECT_TRACKER.md) (`U016`)

---

## 1. Cloud Architecture Overview

SwasthyaSetu AI is architected for zero-downtime scalability and high clinical availability across multi-cloud edge infrastructure:
- **Frontend Applications & Unified Stakeholder Portals**: Deployed globally on **Vercel** edge network.
- **Backend API Gateway, BFF Orchestrator & Domain Microservices**: Managed on **Render** via Infrastructure-as-Code Blueprint (`render.yaml`).
- **Data Persistence**: Production PostgreSQL with schema migrations managed via [schema.sql](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/backend/microservices/auth-service/src/schema.sql) and transactional isolation.

```text
[ Patient / ASHA / Doctor / DHO Portals ]
               │  (Vercel Edge Global CDN: https://frontend-nu-six-f3yyi717g5.vercel.app)
               ▼
   [ Render API Gateway & BFF (Port 4000) ]
               │
    ┌──────────┼──────────┬──────────┬──────────┐
    ▼          ▼          ▼          ▼          ▼
[MS-1 Auth] [MS-2 Fac] [MS-4 Int] [MS-5 Safe] [MS-6 Ref] ...
    │          │          │          │          │
    └──────────┴──────────┴──────────┴──────────┘
                          │
              [ Managed Render PostgreSQL ]
```

---

## 2. Frontend Live Deployment (Vercel CLI)

### 2.1 Deployment Metadata
- **Tool**: Vercel CLI `60.1.3`
- **Account / Scope**: `pranavchaudhari2006-9163`
- **Project**: `frontend`
- **Framework**: Vite + React 19 + TypeScript + Vanilla CSS
- **Live Production URL**: [https://frontend-nu-six-f3yyi717g5.vercel.app](https://frontend-nu-six-f3yyi717g5.vercel.app)
- **Direct Deployment URL**: [https://frontend-ou02eb2pf-pranavchaudhari2006-9163s-projects.vercel.app](https://frontend-ou02eb2pf-pranavchaudhari2006-9163s-projects.vercel.app)
- **Deployment ID**: `dpl_HPBCF8PiruxifE2wxwPgQjXvuKzw`
- **Status**: `READY` (HTTP 200 OK verified)

### 2.2 Vercel Configuration ([frontend/vercel.json](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/frontend/vercel.json))
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2.3 Redeployment Command
```bash
cd frontend
vercel build --prod --yes
vercel deploy --prebuilt --prod --yes
```

---

## 3. Backend Infrastructure Blueprint (Render CLI)

### 3.1 Blueprint Declaration ([render.yaml](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/render.yaml))
Render Blueprint declares the API Gateway and PostgreSQL database instances:
```yaml
services:
  - type: web
    name: swasthyasetu-api-gateway
    env: node
    plan: free
    region: oregon
    rootDir: backend/gateway
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: JWT_SECRET
        generateValue: true
      - key: QR_HMAC_SECRET
        generateValue: true

databases:
  - name: swasthyasetu-postgres
    plan: free
    region: oregon
    databaseName: swasthyasetu_db
    user: swasthyasetu_admin
```

### 3.2 Blueprint Verification
Validated via Render CLI:
```bash
render blueprints validate ./render.yaml
```
Output:
```json
{
  "plan": {
    "databases": [
      "swasthyasetu-postgres"
    ],
    "services": [
      "swasthyasetu-api-gateway"
    ],
    "totalActions": 2
  },
  "valid": true
}
```

### 3.3 Active Render Workspace
- **Workspace ID**: `tea-d7cdcadckfvc73c9uitg`
- **Owner**: Pranav Chaudhari (`pranavchaudhari2006@gmail.com`)
- **Project**: `My project` (`prj-d7cdjuvavr4c73ecl7o0`)

---

## 4. GitHub Repository & Automated Git Deployment

### 4.1 Repository Details
- **GitHub Repository**: [https://github.com/Pranav-chaudhari-2006/Swasthyasetu-AI](https://github.com/Pranav-chaudhari-2006/Swasthyasetu-AI)
- **Primary Branch**: `main`
- **CI/CD Workflow**: [.github/workflows/ci-cd.yml](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/.github/workflows/ci-cd.yml)

### 4.2 Redeploy Backend on Render via GitHub
1. In the [Render Dashboard](https://dashboard.render.com):
   - Click **New +** $\to$ **Blueprint**.
   - Select your GitHub repository: `Pranav-chaudhari-2006/Swasthyasetu-AI`.
   - Render automatically reads [render.yaml](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/render.yaml) from root.
   - It will automatically provision the managed PostgreSQL database `swasthyasetu-postgres` and launch the web service `swasthyasetu-api-gateway`.
2. **Auto-Deploy on Push**: Every subsequent `git push origin main` triggers Render to automatically build and redeploy the gateway and services.

### 4.3 Redeploy Frontend on Vercel via GitHub
1. In the [Vercel Dashboard](https://vercel.com):
   - Click **Add New...** $\to$ **Project**.
   - Select `Pranav-chaudhari-2006/Swasthyasetu-AI`.
   - Set **Root Directory** to `frontend`.
   - Framework preset will automatically detect `Vite` (with build command `npm run build` and output `dist`).
   - Click **Deploy**.
2. **Auto-Deploy on Push**: Every subsequent `git push origin main` triggers Vercel to automatically rebuild and deploy to global edge CDN.

---

## 5. Verification & Health Check Checklist

- [x] All 11 Backend microservices tested with zero mock fallback failures.
- [x] Full-journey E2E integration test suite executed with 100% pass rate (28 / 28 gateway tests including KeepAlive).
- [x] Frontend test suite executed with 100% pass rate (6 / 6 Vitest tests).
- [x] Codebase initialized in Git, committed, and pushed to `https://github.com/Pranav-chaudhari-2006/Swasthyasetu-AI.git` on `main`.
- [x] Vercel CLI deployed live and production alias active: `https://frontend-nu-six-f3yyi717g5.vercel.app`.
- [x] Render Blueprint validated with 0 syntax or schema violations (`render.yaml`).
- [x] GitHub Actions CI/CD pipeline configured in `.github/workflows/ci-cd.yml`.
- [x] Render Free-Tier Keep-Alive pinger active with random 40-45s jitter intervals.
