# SwasthyaSetu AI

> Right Patient. Right Facility. Right Time. No Patient Lost After Referral.

## 1. Project Overview

SwasthyaSetu AI is an offline-first, multilingual healthcare orchestration and continuity platform for rural and underserved India.

It is designed to connect the patient journey across existing public-health actors and systems rather than replace them. Patients may enter directly through a patient application/PWA or through an assisted workflow operated by ASHA, ANM, MPW, or CHO staff. The platform structures symptom information, runs deterministic safety rules, identifies the care capability required, supports routing to a verified public facility, tracks referrals end-to-end, and continues the case through diagnostics, medicines, admission/discharge, follow-up, and outcome closure.

SwasthyaSetu does not diagnose, prescribe, dispatch ambulances, replace clinicians, replace eSanjeevani, or treat ABHA/ABDM as its own patient database.

## 2. Problem

The core problem is not the absence of public-health infrastructure. It is fragmentation across the patient's care journey.

Common failure points include:

- Patients do not know which facility can actually provide the capability they need.
- Paper referrals do not provide closed-loop digital tracking.
- Receiving facilities often have limited context before a referred patient arrives.
- Medicine and diagnostic availability can be stale or invisible.
- Follow-up depends heavily on manual registers and local coordination.
- Language, literacy, device access, and connectivity can block digital access.
- Frontline workers repeat data entry across registers and disconnected systems.
- Emergency cases must not be delayed by routine referral-acceptance workflows.

## 3. Product Promise

SwasthyaSetu focuses on continuity:

1. Capture the patient's concern in voice or text.
2. Convert the conversation into structured case information.
3. Run a deterministic safety pathway: routine, same-day, or emergency.
4. Identify the capability required for the next care step.
5. Match the case to a verified public facility capable of providing that care.
6. Track each referral state until arrival, reassessment, treatment, and completion.
7. Continue the same case through diagnostics, medicines, admission/discharge, and follow-up.

The platform's central operating principle is:

**Patient owns the case; the operator only assists the patient.**

`patient_id != operated_by`

## 4. Core Design Principles

- Clinical decisions remain with qualified healthcare professionals.
- AI structures language and information; it does not diagnose or prescribe.
- Safety classification is deterministic and explainable.
- Facility routing is capability-based, not a mandatory tier-by-tier ladder.
- Referral acceptance means a facility can receive/reassess the patient; it is not clinical acceptance of a prior diagnosis.
- Emergency transport remains owned by 108/MEMS.
- ABHA is optional and never gates care.
- Access follows role, facility/jurisdiction, and minimum-necessary data principles.
- Patients and frontline workers receive offline-capable core workflows.
- Availability information must show when it was last verified and must never be presented as guaranteed unless the source is truly live.

## 5. Users and Stakeholders

### Patient-side

- Patient
- Caregiver / family member

### Community frontline

- ASHA
- ANM
- MPW
- CHO

### Clinical and facility-side

- Medical Officer / Doctor
- Specialist
- Clinical Team
- Receiving Facility Staff
- Pharmacy / Store
- Facility Admin

### Oversight

- District Admin / DHO / Supervisor

### External systems

- 108 / MEMS
- eSanjeevani
- ABDM / ABHA ecosystem
- Bhashini language services

## 6. Primary User Journeys

### 6.1 Direct patient journey

Patient -> authentication -> profile -> voice/text intake -> AI structuring -> deterministic safety engine -> capability routing -> facility interaction -> treatment/referral -> medicines/diagnostics -> follow-up -> outcome.

### 6.2 Assisted journey

Patient -> ASHA/ANM/MPW/CHO device -> patient's own SwasthyaSetu record -> same intake, safety, routing, referral, and follow-up workflow.

The worker is recorded as the operator. The patient remains the subject and owner of the case.

### 6.3 Emergency journey

Patient/frontline worker -> red flag detected by deterministic rules -> emergency pathway -> 108/MEMS -> emergency-capable public facility -> arrival recorded -> clinician reassessment -> treatment/admission/referral -> follow-up.

Emergency cases do not wait for routine referral acceptance.

## 7. Closed-Loop Referral Model

Primary referral lifecycle:

`ISSUED -> ACCEPTED -> EN_ROUTE -> ARRIVED -> REASSESSED -> TREATED -> ADMITTED/DISCHARGED -> FOLLOW_UP -> COMPLETED`

Additional states include:

- REJECTED
- DECLINED
- MISSED
- CANCELLED
- ONWARD_REFERRAL

Every transition must capture:

- case ID
- referral ID
- actor
- role
- owning facility or scope
- previous state
- new state
- timestamp
- reason where applicable
- destination
- next action

A rejected or declined referral must trigger an alternate-capability search rather than terminate the patient journey.

## 8. Capability-Based Routing

SwasthyaSetu asks:

**What does this patient need, and which verified public facility can provide it?**

Routing may consider:

- safety pathway
- required clinical capability
- required diagnostic capability
- required service
- facility type
- distance
- verified facility capability
- operating hours
- referral relationships
- appointment/service information
- medicine/diagnostic status where available

Tier alone is never treated as proof that a specific facility currently has a capability.

## 9. AI and Safety Boundary

### AI may

- perform speech-to-text and text-to-speech support
- translate or normalize language
- structure symptoms and observations
- extract entities
- ask clarification questions
- prepare clinician-ready summaries
- provide navigation and plain-language explanations

### AI must not

- diagnose
- prescribe
- determine treatment
- independently trigger clinical escalation
- accept/reject referrals
- decide admission
- replace clinicians, 108, or eSanjeevani

### Safety Engine

The Safety Engine is a separate deterministic component. It consumes structured clinical variables and selects a workflow pathway. The actual rule catalog must be clinically authored, versioned, tested, and formally approved before production use.

## 10. MVP Scope

The MVP demonstrates the complete continuity loop without pretending unsupported government integrations are already live.

### Included

- mobile + OTP patient authentication
- staff/facility authentication and RBAC
- direct and assisted patient workflows
- multilingual voice/text intake through Bhashini where available
- AI-based information structuring and clarification
- deterministic routine/same-day/emergency pathway selection
- seeded facility capability registry
- capability-based routing
- referral creation with QR/token
- receiving-facility accept/decline/arrival workflow
- mandatory reassessment step at receiving facility
- medicine tracking with last-verified timestamp
- diagnostic tracking
- simulated 108 handoff plus case-continuity tracking
- follow-up reminders and missed-follow-up escalation
- offline-first patient/frontline data capture and sync
- district operational dashboard
- optional/sandbox ABHA link stub that does not gate care
- audit logging

### Explicitly not claimed in MVP

- production ABDM HIP/HIU exchange
- production eSanjeevani API integration
- control of 108/MEMS dispatch
- guaranteed live bed, medicine, diagnostic, ambulance, or appointment availability
- AI diagnosis or treatment recommendation
- production-grade statewide rollout

## 11. Future / Official Integration Scope

Future production expansion may include, subject to approval and confirmed interfaces:

- ABDM HIP/HIU FHIR R4 exchange
- Fidelius/X25519-encrypted ABDM data flows
- official eSanjeevani integration
- verified state-specific 108/MEMS integration
- live e-Aushadhi, LIS/RIS, or facility capability feeds
- broader district/state deployment
- reconciliation mechanisms for external subscription/webhook flows

Each external integration remains disabled or simulated until a real authorized integration contract exists.

## 12. High-Level Architecture

1. Client layer: Patient PWA, Frontline PWA, Facility Web App, District Dashboard
2. Accessibility layer: voice, text, translation, local language
3. AI layer: structuring, clarification, summarization
4. Safety layer: deterministic rule engine
5. Orchestration layer: routing, referral, appointment, emergency coordination, follow-up
6. Clinical workflow layer: assessment, diagnostics, treatment, prescription, admission/discharge
7. Continuity layer: case timeline, referral states, medicine, diagnostics, follow-up
8. Identity/security layer: authentication, RBAC, scope, consent, audit
9. Interoperability layer: Bhashini plus authorized ABDM/eSanjeevani/108 adapters
10. Data layer: PostgreSQL, secure file/object storage, encrypted local storage, sync queues

## 13. Core Data Model

The continuity chain is:

`Patient -> PatientCase -> FacilityVisit -> ClinicalAssessment -> Diagnostics -> Treatment -> Medicine -> Referral -> ReceivingFacilityVisit -> Admission -> Discharge -> FollowUp -> Outcome`

Core entities include:

- User
- Role
- Facility
- FacilityCapability
- Patient
- CaregiverRelationship
- ABHAIdentityLink
- Consent
- PatientCase
- SymptomObservation
- Vital
- SafetyAssessment
- Appointment
- Queue
- Referral
- ReferralState
- FacilityVisit
- ClinicalAssessment
- Diagnosis
- Prescription
- Medicine
- MedicineStock
- MedicineDispensing
- DiagnosticOrder
- DiagnosticResult
- Admission
- Discharge
- FollowUpTask
- Notification
- EmergencyEvent
- AuditLog
- OfflineSyncEvent

## 14. Technology Direction

- Frontend: React-based PWA clients
- Backend: Node/Express-style API platform with domain boundaries
- Primary data store: PostgreSQL
- Language layer: Bhashini ASR/NMT/TTS
- AI layer: constrained LLM/NLP component for structuring and summarization only
- Identity: OAuth/OIDC-style role and scope model; OTP for patient MVP
- Offline: encrypted local store, operation queue, synchronization, conflict handling
- Deployment: containerized services behind an API gateway over HTTPS

Logical services are defined independently even if the MVP initially deploys some of them together for operational simplicity.

## 15. Security and Privacy Baseline

- authentication for every actor
- RBAC based on role and facility/jurisdiction scope
- minimum-necessary access
- encryption in transit and at rest
- encrypted offline local cache
- server-side secret management for external integrations
- immutable/auditable transition history
- access logging
- token/session lifecycle management
- conservative identity linking
- no client-side storage of government integration secrets
- no exposure of unnecessary clinical details in district dashboards

## 16. Success Measures

The project should measure, rather than assume:

- referral conversion: issued -> accepted -> arrived -> treated -> completed
- percentage and detection time of missed/cancelled referrals
- follow-up completion rate
- intake-to-appropriate-facility arrival time
- cases resolved at the lowest verified capable tier
- referral rejection reasons and alternate-routing success
- stale capability/medicine/diagnostic information rate
- offline sync success and conflict rate
- language intake completion and Bhashini quality by supported language/dialect

Impact claims must remain directional until field validation produces measured evidence.

## 17. Public Communication Rules

When describing SwasthyaSetu publicly:

- say that it connects existing public-health journeys; do not claim it replaces them
- say that AI structures information; do not call it an AI doctor
- say that the Safety Engine selects a pathway; do not describe it as diagnosis
- say that routing uses verified capability; do not claim every facility of a tier has identical services
- say that 108/MEMS controls emergency transport
- say that ABHA is optional
- label non-live availability with a last-verified timestamp
- clearly separate MVP demonstrations from authorized production integrations
- present field-impact metrics as hypotheses until validated

## 18. Delivery Sequence

1. Identity, authorization, facility, and audit foundations
2. Patient, case, and continuity data model
3. Deterministic Safety Engine
4. AI intake and multilingual interaction
5. Facility Capability Registry and routing
6. Referral state machine and receiving-facility workflow
7. Medicine and diagnostic tracking
8. Follow-up engine
9. Offline synchronization
10. District dashboard and operational alerts
11. Sandbox/optional external adapters
12. Security, performance, field validation, and deployment hardening

## 19. Definition of MVP Complete

The MVP is complete when a test patient can start a case directly or through an assisted operator, complete multilingual intake, receive a deterministic pathway, be routed to a seeded capable facility, create and track a referral, be received and clinically reassessed at the destination, record diagnostics/medicines/treatment events, receive follow-up, and reach a closed outcome while RBAC, offline synchronization, and audit logs remain intact.

A demo is not considered complete if it only shows symptom chat or facility search without the referral-to-outcome continuity loop.
