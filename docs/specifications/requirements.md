# Product Requirements
## SwasthyaSetu AI

## 1. Purpose

This document is the delivery-oriented product requirement set. It is intentionally shorter than the SRS and is designed for product, engineering, design, QA, and project tracking.

Priority labels:

- **P0**: required for a credible MVP continuity demo
- **P1**: required for a strong pilot-ready MVP
- **P2**: later enhancement or production expansion

## 2. Product Guardrails

These are non-negotiable:

1. AI does not diagnose or prescribe.
2. The deterministic Safety Engine, not the LLM, selects routine/same-day/emergency workflow.
3. Clinical decisions remain with authorized clinicians.
4. Emergency cases do not wait for routine referral acceptance.
5. Facility routing is based on verified capability, not tier alone.
6. Patient owns the case even in assisted mode.
7. ABHA is optional.
8. 108/MEMS retains dispatch authority.
9. Availability data shows freshness/last verification.
10. MVP does not claim production government integrations that do not exist.

## 3. Epic A: Identity, Authentication, and Access

### REQ-A01 - Patient OTP login [P0]

**Requirement:** Patient can register/sign in using mobile + OTP.

**Acceptance criteria:**

- OTP challenge and verification flow exists.
- A durable Patient ID is created independent of phone number.
- Invalid/expired OTP is rejected.
- Session can be revoked/logged out.

### REQ-A02 - Staff/facility login [P0]

**Requirement:** Staff users authenticate with role and facility/jurisdiction scope.

**Acceptance criteria:**

- User has explicit role.
- User has explicit scope.
- Server enforces scope on protected requests.

### REQ-A03 - RBAC matrix [P0]

**Requirement:** Minimum-necessary access is enforced for all defined roles.

**Acceptance criteria:**

- Patient cannot access another patient's case.
- ASHA cannot create a diagnosis/prescription.
- Receiving staff can update referral operations but not clinical diagnosis.
- Facility Admin cannot read unnecessary clinical notes.
- District Admin receives aggregate/limited views.

### REQ-A04 - Optional ABHA link [P1]

**Requirement:** Patient may attach/remove an optional ABHA linkage record in sandbox/stub form.

**Acceptance criteria:**

- Core workflow works with no ABHA.
- UI labels sandbox/stub status accurately.

## 4. Epic B: Patient and Case Foundation

### REQ-B01 - Patient profile [P0]

Store Patient ID, name, DOB/age, sex, mobile, address/village, language, emergency contact, caregiver references, and optional ABHA link.

### REQ-B02 - Case creation [P0]

A patient can open a new PatientCase. One patient may have multiple cases.

### REQ-B03 - Assisted operator attribution [P0]

Every assisted action records both `patient_id` and `operated_by`.

### REQ-B04 - Longitudinal case timeline [P0]

The case timeline aggregates linked events from intake through outcome.

## 5. Epic C: Multilingual Intake and AI Structuring

### REQ-C01 - Text intake [P0]

Patient/worker can enter symptoms in text.

### REQ-C02 - Voice intake [P1]

Voice can be transcribed using Bhashini where configured.

### REQ-C03 - Preserve original input [P0]

Original text/transcript is retained alongside normalized/structured data.

### REQ-C04 - Structured extraction [P0]

AI converts free-form input into structured symptom/observation fields.

### REQ-C05 - Clarification loop [P0]

AI can ask follow-up questions for missing structured fields.

### REQ-C06 - AI safety guardrails [P0]

AI response schema cannot directly create diagnosis, prescription, admission, or emergency-pathway authority.

## 6. Epic D: Deterministic Safety Engine

### REQ-D01 - Separate safety component [P0]

Safety logic is isolated from AI/LLM code.

### REQ-D02 - Three workflow pathways [P0]

Support ROUTINE, SAME_DAY, EMERGENCY.

### REQ-D03 - Explainability [P0]

Store rule-set version and triggered rule IDs/reasons.

### REQ-D04 - Clinical governance gate [P1]

Production activation requires an approved rule-set release process.

**Important:** the source project definition does not supply a full clinical rule catalog. Engineering must not invent one and call it production safe.

## 7. Epic E: Facility Capability Registry

### REQ-E01 - Facility master [P0]

Maintain facility identity, type, location, hours, and public identifier.

### REQ-E02 - Capability model [P0]

Maintain services, diagnostics, emergency, specialist, inpatient, OT, ICU, blood bank, and other configured capabilities.

### REQ-E03 - Verification metadata [P0]

Each capability can record source, verifier, last-verified time, and status.

### REQ-E04 - Facility admin workflow [P1]

Authorized Facility Admin can maintain operational/capability data without clinical permissions.

## 8. Epic F: Capability-Based Routing

### REQ-F01 - Required-capability input [P0]

Routing receives required capabilities and safety pathway.

### REQ-F02 - Candidate matching [P0]

Return facilities with verified matching capability.

### REQ-F03 - No forced tier ladder [P0]

System can route directly to PHC/RH/CHC/SDH/DH as capability requires.

### REQ-F04 - Explain route [P1]

Show match reason and data freshness.

### REQ-F05 - Alternate route after decline [P0]

Declined/rejected referrals can trigger alternate facility search.

## 9. Epic G: Referral State Machine

### REQ-G01 - Referral creation [P0]

Create referral with Referral ID, case link, source, destination, reason/capability, priority/pathway, QR/token.

### REQ-G02 - Referral response [P0]

Receiving facility can ACCEPT, DECLINE, or REJECT a routine referral as configured.

### REQ-G03 - Patient en-route status [P0]

Patient/operator can mark EN_ROUTE; this is visibly self/operator reported.

### REQ-G04 - Facility arrival [P0]

Receiving facility can scan QR/enter token and mark ARRIVED.

### REQ-G05 - Mandatory reassessment [P0]

ARRIVED transitions into an explicit receiving clinical reassessment workflow.

### REQ-G06 - Treatment/admission/discharge [P0]

Authorized facility/clinical users can update downstream care states.

### REQ-G07 - Full audit [P0]

Each transition stores actor, scope, timestamp, reason, previous state, and new state.

### REQ-G08 - Onward referral [P1]

A receiving facility can initiate a new/onward referral without breaking the original case.

### REQ-G09 - Missed/cancelled [P1]

System supports missed and cancelled terminal/exception states with reason.

## 10. Epic H: Emergency Continuity

### REQ-H01 - Immediate emergency branch [P0]

EMERGENCY pathway does not wait for routine referral acceptance.

### REQ-H02 - 108/MEMS handoff record [P0]

MVP records manual/simulated emergency transport handoff status.

### REQ-H03 - No dispatch claim [P0]

UI and API do not represent SwasthyaSetu as ambulance dispatcher.

### REQ-H04 - Emergency facility arrival [P0]

Arrival resumes the same PatientCase timeline.

## 11. Epic I: Clinical Records

### REQ-I01 - Clinical assessment [P0]

Authorized clinician can record assessment.

### REQ-I02 - Diagnosis and treatment authority [P0]

Only authorized clinical roles can create authoritative diagnosis/treatment records.

### REQ-I03 - Admission/discharge [P1]

Authorized clinical roles can record admission and discharge.

### REQ-I04 - AI summary provenance [P0]

Clinician can view AI-prepared summary with clear source/provenance; it is not silently treated as clinician-authored data.

## 12. Epic J: Medicine Tracking

### REQ-J01 - Availability state [P1]

Support AVAILABLE, LOW, OUT, NOT_VERIFIED.

### REQ-J02 - Last verified [P1]

Show last-verified timestamp and source/verifier.

### REQ-J03 - Dispensing event [P1]

Pharmacy/Store can record dispensing linked to case/prescription.

## 13. Epic K: Diagnostic Tracking

### REQ-K01 - Diagnostic lifecycle [P1]

Track ordered, scheduled, performed, result available, reviewed.

### REQ-K02 - Result linkage [P1]

Attach structured result metadata/file reference to case.

### REQ-K03 - Interpretation boundary [P0]

Only authorized clinicians provide clinical interpretation.

## 14. Epic L: Follow-Up

### REQ-L01 - Follow-up task [P0]

Create task with due date, reason/type, responsible role/user, and case link.

### REQ-L02 - Patient completion [P0]

Patient can confirm supported follow-up actions.

### REQ-L03 - Worker completion [P0]

Assigned ASHA/ANM/CHO can complete supported follow-up task.

### REQ-L04 - Missed escalation [P0]

Overdue incomplete follow-up generates a missed state and authorized escalation task.

## 15. Epic M: Offline-First Sync

### REQ-M01 - Encrypted local store [P0]

Patient/frontline apps encrypt cached sensitive data.

### REQ-M02 - Offline intake [P0]

Supported client can capture draft intake/case information offline.

### REQ-M03 - Cached safety rules [P0]

Approved local deterministic rule package can be evaluated offline.

### REQ-M04 - Pending operation queue [P0]

Offline mutations are stored with stable operation IDs.

### REQ-M05 - Idempotent sync [P0]

Replay does not duplicate committed operations.

### REQ-M06 - Conflict handling [P1]

Server validates base version and returns explicit conflict status where automatic merge is unsafe.

### REQ-M07 - Sync visibility [P1]

User sees pending/failed/synced status without exposing technical jargon unnecessarily.

## 16. Epic N: Notifications

### REQ-N01 - In-app notifications [P1]

Notify users of referral updates, follow-ups, and assigned tasks.

### REQ-N02 - Privacy-safe payloads [P0]

External notification channels must not reveal unnecessary sensitive clinical details.

### REQ-N03 - Retry [P1]

Failed notification delivery is retryable and observable.

## 17. Epic O: District Operations

### REQ-O01 - Referral funnel [P1]

Show counts/aggregates for issued, accepted, rejected/declined, arrived, treated, admitted, completed, missed.

### REQ-O02 - Operational alerts [P1]

Show unacknowledged referral, patient non-arrival, missed follow-up, stale information, and capability-gap alerts.

### REQ-O03 - Minimum necessary [P0]

Avoid unnecessary patient-level clinical details.

## 18. Epic P: Audit, Security, and Observability

### REQ-P01 - Audit log [P0]

Audit security-sensitive and workflow-critical actions.

### REQ-P02 - Encryption [P0]

Use encryption in transit, at rest, and for offline sensitive cache.

### REQ-P03 - Secrets [P0]

No integration credentials in client code or source repository.

### REQ-P04 - Structured logs/metrics [P1]

Support correlation IDs and operational monitoring.

### REQ-P05 - State transition monitoring [P1]

Alert/observe failed referral transitions and sync conflicts.

## 19. Epic Q: External Integrations

### REQ-Q01 - Bhashini adapter [P1]

Implement config/model discovery and inference as separate concerns.

### REQ-Q02 - ABDM adapter [P2 / sandbox P1]

MVP may demonstrate optional sandbox/stub linkage. Production HIP/HIU is future and approval-dependent.

### REQ-Q03 - eSanjeevani adapter [P2]

Keep integration behind an interface; do not claim a live API before official access.

### REQ-Q04 - 108 integration adapter [P2]

Default implementation is manual/simulated handoff unless authorized state integration exists.

## 20. Cross-Epic Acceptance Scenarios

### Scenario 1: Direct routine case

Patient logs in -> creates case -> enters symptoms -> AI structures -> Safety Engine returns ROUTINE -> routing finds capable facility -> patient receives care instruction/referral -> case reaches follow-up/outcome.

### Scenario 2: Assisted same-day case

ASHA opens patient record -> intake recorded with `operated_by` -> SAME_DAY -> facility matched -> referral issued -> facility accepts -> patient en route -> facility confirms arrival -> clinician reassesses -> treatment recorded -> follow-up created.

### Scenario 3: Referral rejected

Referral issued -> destination rejects with reason -> reason stored -> alternate facility search -> new destination selected -> continuity preserved.

### Scenario 4: Emergency

Input -> deterministic EMERGENCY -> 108/MEMS handoff instruction/reference -> no routine acceptance wait -> emergency facility arrival -> clinician reassessment -> treatment/admission -> follow-up.

### Scenario 5: Offline frontline workflow

Worker has authenticated previously -> loses network -> opens cached patient/work item -> captures intake -> evaluates cached deterministic rule set -> creates pending referral operation where supported -> reconnects -> operations sync idempotently -> conflicts are handled without silent data loss.

## 21. Definition of Ready for Development

A requirement is ready when:

- user/actor is known
- permission scope is known
- source and destination data entities are known
- online/offline behavior is defined
- failure behavior is defined
- audit requirement is defined
- acceptance criteria are testable
- no missing clinical-policy decision is being disguised as an engineering decision

## 22. Definition of Done

A delivered requirement is done when:

- code is reviewed
- automated tests pass
- RBAC tests pass
- audit behavior is verified where relevant
- offline behavior is tested where relevant
- UI states include loading/empty/error/retry conditions
- external integration mode is labelled accurately
- documentation is updated
- no unsupported public claim is introduced
