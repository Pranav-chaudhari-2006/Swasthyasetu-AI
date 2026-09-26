# SwasthyaSetu AI: Unified Frontend Portals

[![Vercel Deployment](https://img.shields.io/badge/Vercel_Edge-Live_Production-emerald?style=for-the-badge&logo=vercel)](https://frontend-nu-six-f3yyi717g5.vercel.app)
[![Vitest Passing](https://img.shields.io/badge/Vitest-6%2F6_Passing_(100%25)-brightgreen?style=for-the-badge&logo=vitest)](https://frontend-nu-six-f3yyi717g5.vercel.app)

> **Frontend Architecture**: React 19 + TypeScript + Vite + Vanilla CSS design system.  
> **Live Production**: [https://frontend-nu-six-f3yyi717g5.vercel.app](https://frontend-nu-six-f3yyi717g5.vercel.app)  
> **Design Specification**: [docs/specifications/frontend_design.md](../docs/specifications/frontend_design.md)

---

## 🌿 Official Theme: Option 1 - Ayurvedic Slate & Emerald

The user interface is powered by the **Ayurvedic Slate & Emerald** design theme, providing a decluttered, serene, and clinically authoritative aesthetic tailored for Indian healthcare:

```
Primary Emerald Accent:    #10b981 (Tailored Emerald Green)
Primary Emerald Dark:      #059669 (Deep Clinical Green)
Background (Obsidian):     #090d16 (Deep Night Slate)
Surface Card:              #111827 (Subtle Frosted Slate)
Surface Card Hover:        #1e293b (Interactive Glow Slate)
Surface Border:            rgba(255, 255, 255, 0.08) (Subtle Edge Highlight)
Text Primary:              #f8fafc (Pure Slate Ice)
Text Muted:                #94a3b8 (Soft Mist Grey)

Clinical Urgency Badges:
🚨 EMERGENCY (Red Alert):   #ef4444 (Crimson Coral) | rgba(239, 68, 68, 0.12)
⚠️ SAME_DAY (Urgent Amber): #f59e0b (Golden Honey)  | rgba(245, 158, 11, 0.12)
✅ ROUTINE (Verified Mint): #10b981 (Emerald Mint)  | rgba(16, 185, 129, 0.12)
```

### Typography System
- **Display & Headings**: `Plus Jakarta Sans` (600, 700) - modern geometric, open apertures, authoritative.
- **Body & Forms**: `Inter` (400, 500, 600) - tall x-height, anti-aliased on low-DPI Android devices.
- **Vitals & Codes**: `JetBrains Mono` (500, 700) - tabular numbers for SpO2, Pulse, BP, and QR HMAC hashes.

---

## 📱 4 Unified Stakeholder Portals

1. **Patient Mobile PWA (`src/views/PatientPortal.tsx`)**:
   - Conversational multilingual AI intake assistant with clear non-authoritative AI indicators.
   - Urgency triage alert banners (`ROUTINE`, `SAME_DAY`, `EMERGENCY`).
   - Cryptographic Arrival QR Code modal (`src/components/QRCodeModal.tsx`) with HMAC-SHA256 signature preview.
   - Interactive medication adherence schedule with morning/evening checkoffs.
   - Post-discharge home visit follow-up plan view.

2. **Frontline Health Worker Portal (`src/views/FrontlinePortal.tsx`)**:
   - ASHA/ANM assisted intake mode with point-of-care vital sign entry (BP, Pulse, SpO2, Temp).
   - Offline resilience indicator displaying cached offline rule package (`v1.2.0-deterministic-pilot`).
   - Pending offline mutation queue with 1-click batch sync reconciliation (`POST /api/v1/sync/batch`).
   - Assigned follow-up queue with interactive home visit logger capturing clinical notes and vitals.

3. **Doctor & Facility Command Portal (`src/views/DoctorPortal.tsx`)**:
   - Inbound referral triage inbox categorized by `EMERGENCY`, `SAME_DAY`, and `ROUTINE`.
   - Direct action controls: Accept Referral, Decline & Reroute, or Mark Arrived.
   - Arrival check-in QR scanner / token validator.
   - Clinical assessment editor with confirmed diagnosis and ICD-10 codification.
   - Multi-item e-prescription builder with live pharmacy stock verification.
   - Formal inpatient admission and discharge summary generator.

4. **District Health Officer Command Dashboard (`src/views/DhoDashboard.tsx`)**:
   - District health indicators (conversion rate, 108 avg ETA, bed occupancy, L3 escalations).
   - Live 108 emergency telemetry stream tracking ambulances in transit with patient vital telemetry.
   - Real-time facility capability matrix showing bed occupancy, ICU beds, oxygen, and blood units.

---

## 🛠️ Scripts & Build

```bash
# Install dependencies
npm install

# Start Vite local development server (Port 3000)
npm run dev

# Run Vitest component integration tests
npm test

# Compile production bundle
npm run build

# Preview production build locally
npm run preview
```
