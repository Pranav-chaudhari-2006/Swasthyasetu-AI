# SwasthyaSetu AI — Master Microservice & Phase Checklist

> **Brutal Honesty Verification Standard**:
> - An item is ticked (`[x]`) **ONLY** when:
>   1. Real application code is written (strict **ZERO dummy/mock data** policy).
>   2. Real database models, migrations, and typed schemas are verified.
>   3. Business logic, API endpoints, and controllers are operational.
>   4. Automated unit/integration tests are written and pass with a 100% pass rate.
>   5. Error cases, security scopes (RBAC), and audit logs are verified.
> - An item remains unticked (`[ ]`) if any part is incomplete, untested, or relies on assumptions.
> - This checklist is updated immediately after each microservice milestone is verified.

---

## Overall Implementation Progress

```text
[█████████████████████████░░░░░] 12 / 14 Phases Completed (85.7%)
```

---

## Phase 0: System Governance, Operational Brain & Architecture
- [x] **0.1 Brain Configuration**: Ingest `SIH_ANTIGRAVITY_BRAIN_README.md` and embed live `Current Project State`.
- [x] **0.2 Strict Operational Directives**: Create `rules.md` (Zero Hallucination, Prior Work Protection, Zero Mock Policy).
- [x] **0.3 Central Documentation Hub**: Structure all documentation in `docs/` with unified `docs/index.md`.
- [x] **0.4 Central Task Tracker & Audit Trail**: Initialize `PROJECT_TRACKER.md` and `CHANGELOG.md`.
- [x] **0.5 Repository Layout Optimization**: Move historical logs to `docs/temp/` and retain clean source layout.
- [x] **0.6 Master Implementation Plan**: Build sequential service-by-service execution plan in `docs/implementation_plan.md`.

---

## Phase 1 / Microservice 1: Auth, RBAC & Audit Service
- [x] **1.1 Identity Schema**: Define real database entities (`User`, `Role`, `Scope`, `Session`, `CaregiverLink`).
- [x] **1.2 Patient OTP Engine**: Implement real OTP generation, challenge dispatch, verification, and session token issuance.
- [x] **1.3 Staff Authentication**: Implement credential verification with role + facility/jurisdiction scoping.
- [x] **1.4 Policy & RBAC Middleware**: Implement access control policy covering all 10 roles (Patient, ASHA, ANM, MO, Specialist, Nurse, Pharmacist, Lab Tech, Facility Admin, District Officer).
- [x] **1.5 Security & Audit Interceptor**: Implement immutable audit logging capturing actor, role, scope, action, entity, timestamp, correlation ID.
- [x] **1.6 Token Lifecycle & Revocation**: Implement session renewal, logout, and token revocation.
- [x] **1.7 Phase 1 Verification Suite**: Write and execute 100% passing unit & integration tests for Auth, RBAC, and Audit.

---

## Phase 2 / Microservice 2: Facility Registry & Capability Service
- [x] **2.1 Facility Master Models**: Define schema for `Facility` (type, GPS location, public identifier, hours, active status).
- [x] **2.2 Capability Engine**: Define `FacilityCapability` (code, verification status, verifier metadata, timestamp).
- [x] **2.3 Facility CRUD & Admin APIs**: Implement facility registration, update, and capability verification endpoints.
- [x] **2.4 Non-Hierarchical Capability Routing**: Implement candidate facility matching based on required capabilities (not arbitrary tier ladders).
- [x] **2.5 Proximity & Freshness Ranking**: Implement ranking algorithms incorporating distance, hours, and capability freshness.
- [x] **2.6 Phase 2 Verification Suite**: Write and execute 100% passing tests for capability filtering and ranking queries.

---

## Phase 3 / Microservice 3: Patient & Case Continuity Service
- [x] **3.1 Patient Profile Model**: Real schema for demographics, contact details, ABHA metadata, emergency contacts.
- [x] **3.2 Caregiver Relationships**: Real schema and logic for linking caregivers and authorized family members.
- [x] **3.3 Operator Attribution**: Strictly separate `patient_id` (subject of care) from `operated_by` (ASHA/frontline worker).
- [x] **3.4 PatientCase State Machine**: Real schema and lifecycle transitions (`CREATED`, `INTAKE_IN_PROGRESS`, `TRIAGED`, `ROUTED`, `ARRIVED`, `UNDER_CARE`, `CLOSED`).
- [x] **3.5 Master Timeline Projection**: Domain event aggregation producing a unified chronological case timeline.
- [x] **3.6 Phase 3 Verification Suite**: Write and execute 100% passing tests for case lifecycle, timeline ordering, and attribution.

---

## Phase 4 / Microservice 4: Intake & AI Structuring Service
- [x] **4.1 Conversation Session Store**: Real message history store with language metadata and provenance.
- [x] **4.2 Schema-Constrained Structuring**: Implement AI intake extractor enforcing typed schemas (chief complaints, duration, red flags).
- [x] **4.3 Non-Authoritative Guardrail**: Ensure AI output is strictly non-authoritative (zero direct diagnosis/prescription write access).
- [x] **4.4 Clarification Loop Engine**: Generate structured clarifying questions when required facts are missing.
- [x] **4.5 Phase 4 Verification Suite**: Write and execute 100% passing tests proving clinical safety isolation and schema validity.

---

## Phase 5 / Microservice 5: Deterministic Safety Engine
- [x] **5.1 Versioned Rule Evaluation**: Deterministic rules engine evaluating structured clinical facts without hallucination.
- [x] **5.2 Triage Pathways**: Deterministic pathway selection (`ROUTINE`, `SAME_DAY`, `EMERGENCY`).
- [x] **5.3 Red-Flag Detection**: Concrete rule triggers for critical symptoms with clear, explainable audit reasons.
- [x] **5.4 SafetyAssessment Persistence**: Immutable assessment record linked to the `PatientCase`.
- [x] **5.5 Emergency Bypass Trigger**: Instant flag triggering immediate emergency workflow.
- [x] **5.6 Phase 5 Verification Suite**: Write and execute 100% passing test harness covering all deterministic clinical rule test fixtures.

---

## Phase 6 / Microservice 6: Referral State Machine Service
- [x] **6.1 Referral & Transition Schema**: Real `Referral` model and immutable `ReferralStateTransition` ledger.
- [x] **6.2 State Transitions**: Implement `ISSUED` -> `ACCEPTED` / `DECLINED` / `REJECTED` -> `EN_ROUTE` -> `ARRIVED` -> `TREATED` / `ADMITTED` -> `DISCHARGED` / `CLOSED`.
- [x] **6.3 Arrival Token / QR Engine**: Cryptographically verifiable QR / token generation and arrival scanning endpoint.
- [x] **6.4 Receiving Facility Inbox**: Real facility triage inbox with accept/decline action handlers.
- [x] **6.5 Rejection & Alternate Routing**: Automatic rerouting logic when a facility declines or rejects a referral.
- [x] **6.6 Phase 6 Verification Suite**: Write and execute 100% passing tests for state transitions, idempotency, and concurrency.

---

## Phase 7 / Microservice 7: Emergency Coordination Service
- [x] **7.1 EmergencyEvent Model**: Real schema capturing emergency classification, location, and trigger details.
- [x] **7.2 Referral Bypass Flow**: Immediate emergency facility notification bypassing routine acceptance wait times.
- [x] **7.3 108 / MEMS Continuity Tracking**: Record manual/simulated ambulance dispatch status and handoff events.
- [x] **7.4 Emergency Facility Continuation**: Emergency arrival confirmation and instant clinician handoff.
- [x] **7.5 Phase 7 Verification Suite**: Write and execute 100% passing tests proving emergency route bypasses normal referral loops.

---

## Phase 8 / Microservice 8: Clinical Workflow, Medicine & Diagnostic Service
- [x] **8.1 Clinician Assessment Records**: Authorized clinician assessment, notes, and vital checks.
- [x] **8.2 Diagnosis & Treatment Authorization**: Authorized diagnosis and prescription write access strictly for clinical roles.
- [x] **8.3 Admission & Discharge Records**: Real admission tracking and structured discharge summary generation.
- [x] **8.4 Medicine Catalog & Stock Verification**: Real medicine inventory tracking and verified stock timestamps.
- [x] **8.5 Dispensing Event Engine**: Dispensing transaction logging against active prescriptions.
- [x] **8.6 Diagnostic Order & Result Engine**: Lab test order lifecycle, sample tracking, and result attachment.
- [x] **8.7 Phase 8 Verification Suite**: Write and execute 100% passing tests for clinical permissions, stock deduction, and lab workflows.

---

## Phase 9 / Microservice 9: Follow-Up & Notification Service
- [x] **9.1 FollowUpTask Generator**: Automatic follow-up task generation derived from discharge and treatment plans.
- [x] **9.2 Frontline Assignment & Patient Views**: Role-scoped views for assigned ASHA/ANM workers and patient self-view.
- [x] **9.3 Task Completion & Home Visit Logging**: Verification and completion logging with worker attribution.
- [x] **9.4 Overdue Escalation Engine**: Automated escalation rules for missed or overdue high-risk follow-ups.
- [x] **9.5 Notification Dispatcher**: In-app, SMS, and push notification delivery orchestration.
- [x] **9.6 Phase 9 Verification Suite**: Write and execute 100% passing tests for escalation cron triggers and task completion.

---

## Phase 10 / Microservice 10: Offline Sync & Conflict Reconciliation Service
- [x] **10.1 Offline Mutation Queue**: Schema for queuing offline operations with client timestamps and UUIDs.
- [x] **10.2 Sync Ingestion & Verification**: Cryptographic validation and ordering of synchronized mutations.
- [x] **10.3 Conflict Resolution Engine**: Deterministic conflict resolution rules (server authority vs last-valid operator update).
- [x] **10.4 Global Audit Export**: Auditable export format for state reconciliation.
- [x] **10.5 Phase 10 Verification Suite**: Write and execute 100% passing tests for offline batch replay and conflict handling.

---

## Phase 11 / Microservice 11: API Gateway & Backend-For-Frontend (BFF)
- [x] **11.1 Gateway Reverse Proxy**: Route requests to underlying domain microservices.
- [x] **11.2 Rate Limiting & Security Headers**: Coarse rate limiting, CORS configuration, and security middleware.
- [x] **11.3 Request Validation & Header Forwarding**: Token inspection, correlation ID injection, and payload validation.
- [x] **11.4 Phase 11 Verification Suite**: Write and execute 100% passing end-to-end routing and gateway tests.

---

## Phase 12 / Microservice 12: Unified Frontend Applications
- [x] **12.1 Patient PWA**: Intake chat, case timeline, referral QR code display, follow-up reminders.
- [x] **12.2 Frontline Worker Portal (ASHA/ANM)**: Assisted intake mode, village patient registry, assigned follow-up queue, offline sync indicator.
- [x] **12.3 Doctor & Facility Portal**: Facility inbox, referral acceptance, clinical notes, prescriptions, lab orders, discharge.
- [x] **12.4 District Health Officer Dashboard**: Aggregated district health metrics, facility capability map, escalation monitors.
- [x] **12.5 Phase 12 Verification Suite**: Build, lint, and browser end-to-end validation across all portals.

## Phase 13: Full-Journey System Integration & End-to-End Validation
- [x] **13.1 Direct Patient Routine Journey**: Patient OTP $\to$ Chat Intake $\to$ Safety Engine (`ROUTINE`) $\to$ PHC Capability Match $\to$ Referral Issued $\to$ QR Scanned $\to$ Doctor Assessment $\to$ Dispensed $\to$ Follow-Up Complete.
- [x] **13.2 Frontline Worker Assisted Emergency Journey**: ASHA assisted login $\to$ Emergency Intake $\to$ Safety Engine (`EMERGENCY`) $\to$ Zero-Click Bypass Trigger $\to$ 108 Handoff $\to$ Tertiary Hospital Arrival $\to$ Emergency Care.
- [x] **13.3 Rejection Recovery & Auto-Reroute Journey**: Referral declined at CHC $\to$ Auto-reroute to District Hospital $\to$ Acceptance $\to$ Arrival.
- [x] **13.4 Offline Resilience & Cryptographic Reconciliation Journey**: Frontline PWA takes intake offline $\to$ Evaluates cached rules $\to$ Reconnects $\to$ Batch sync reconciles without loss.
- [x] **13.5 Phase 13 Verification Suite**: Automated end-to-end integration test passing with 100% assertions verified.

---

## Phase 14: Prototype Go-Live & Cloud Deployment Gate (Render & Vercel CLI)
- [x] **14.1 Prototype Readiness Audit**: Complete end-to-end audit proving all microservices and frontends are operational with 100% tests passing.
- [x] **14.2 Mandatory User Go-Live Approval**: STOP and ask the user for explicit authorization before deploying live.
- [x] **14.3 Backend Deployment via Render CLI**: Execute Render CLI deployment for backend microservices and API gateway.
- [x] **14.4 Frontend Deployment via Vercel CLI**: Execute Vercel CLI deployment for client applications and dashboards.
- [x] **14.5 Live Health & SSL Verification**: Verify live URLs, database connectivity, and production smoke tests.
