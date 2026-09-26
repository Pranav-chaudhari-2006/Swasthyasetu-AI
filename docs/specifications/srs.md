# Software Requirements Specification (SRS)
## SwasthyaSetu AI

## 1. Purpose

This SRS translates the SwasthyaSetu project definition into implementable software requirements for the MVP and its production-oriented architecture.

Normative terms:

- SHALL: mandatory for the stated scope
- SHOULD: strongly recommended unless a documented exception exists
- MAY: optional

## 2. System Context

SwasthyaSetu is a continuity and orchestration platform connecting:

- Patient PWA
- Frontline Worker PWA
- Facility Web Application
- District Dashboard
- SwasthyaSetu backend services
- PostgreSQL and secure object/file storage
- encrypted offline client storage
- Bhashini language services
- optional/future external adapters for ABDM/ABHA, eSanjeevani, and 108/MEMS

## 3. Actor Model

The system SHALL support the following actor categories:

- Patient
- Caregiver
- ASHA
- ANM
- MPW
- CHO
- Medical Officer / Doctor
- Specialist
- Clinical Team
- Receiving Facility Staff
- Pharmacy / Store
- Facility Admin
- District Admin / DHO / Supervisor

Role and data scope SHALL remain separate attributes.

## 4. Functional Requirements

### 4.1 Identity and Authentication

**FR-AUTH-001** The system SHALL allow patient registration/login using mobile number and SwasthyaSetu OTP for MVP.

**FR-AUTH-002** The system SHALL issue a durable SwasthyaSetu Patient ID independent of the phone number.

**FR-AUTH-003** The system SHALL support staff accounts with role and facility/jurisdiction scope.

**FR-AUTH-004** The system SHALL support secure login, logout, token/session expiry, and revocation.

**FR-AUTH-005** ABHA linkage SHALL be optional and SHALL NOT block any core care workflow.

**FR-AUTH-006** External-system client secrets SHALL be stored only in server-side secret management.

### 4.2 Authorization and RBAC

**FR-RBAC-001** Every protected operation SHALL enforce role and facility/jurisdiction scope.

**FR-RBAC-002** Patient users SHALL access only their own case data unless an explicit authorized relationship exists.

**FR-RBAC-003** Caregiver access SHALL be limited to authorized patient data and support functions.

**FR-RBAC-004** ASHA, ANM, MPW, and CHO SHALL be limited to their assigned or scoped workflows.

**FR-RBAC-005** Clinical diagnosis, prescription, admission, discharge, and treatment decisions SHALL be restricted to authorized clinical roles.

**FR-RBAC-006** District dashboards SHALL default to aggregate/minimum-necessary information.

### 4.3 Patient and Case Management

**FR-CASE-001** The system SHALL maintain separate identifiers for User, Patient, Case, Referral, Facility, and optional ABHA linkage.

**FR-CASE-002** A patient SHALL be able to have multiple cases.

**FR-CASE-003** A case SHALL maintain a chronological timeline of relevant events.

**FR-CASE-004** The system SHALL record `operated_by` separately from `patient_id` for assisted workflows.

**FR-CASE-005** Patient-editable demographics SHALL be separated from clinician-authored clinical information.

### 4.4 Direct and Assisted Intake

**FR-INTAKE-001** The system SHALL support direct patient intake.

**FR-INTAKE-002** The system SHALL support assisted intake by authorized ASHA/ANM/MPW/CHO users.

**FR-INTAKE-003** Intake SHALL support text entry.

**FR-INTAKE-004** Intake SHOULD support voice entry where Bhashini services are available.

**FR-INTAKE-005** The system SHALL retain the original-language input/transcript and structured/normalized output when available.

**FR-INTAKE-006** AI-generated outputs SHALL be limited to structuring, extraction, clarification, summarization, navigation, and plain-language assistance.

**FR-INTAKE-007** AI outputs SHALL NOT be stored or displayed as authoritative diagnosis, prescription, treatment decision, or clinical urgency decision.

### 4.5 Safety Engine

**FR-SAFE-001** Safety-pathway selection SHALL be implemented in a deterministic rule engine separate from the LLM/AI component.

**FR-SAFE-002** The Safety Engine SHALL output one of at least: ROUTINE, SAME_DAY, EMERGENCY.

**FR-SAFE-003** Every safety result SHALL record rule-set version, triggering facts/rules, timestamp, and case ID.

**FR-SAFE-004** Safety rules SHALL be versioned and deployable independently of AI prompts/models.

**FR-SAFE-005** Production safety rules SHALL require clinical approval before activation.

**FR-SAFE-006** EMERGENCY SHALL branch away from routine facility-acceptance logic.

### 4.6 Facility Registry

**FR-FAC-001** The system SHALL maintain a structured Facility record.

**FR-FAC-002** Facility profiles SHALL support services, diagnostics, emergency capability, specialist services, inpatient capability, OT, ICU, blood bank, operating hours, medicine information, and last-updated metadata as applicable.

**FR-FAC-003** Capability SHALL be stored at specific-facility level, not inferred solely from facility tier.

**FR-FAC-004** Capability records SHALL include verification/freshness metadata.

**FR-FAC-005** Facility Admin users SHALL be able to maintain permitted facility configuration without clinical-record privileges.

### 4.7 Routing

**FR-ROUTE-001** The Routing Engine SHALL consume the safety pathway and required capability.

**FR-ROUTE-002** Routing SHALL consider verified facility capability and MAY consider distance, hours, referral relationships, appointment/service information, and last-verified medicine/diagnostic data.

**FR-ROUTE-003** Routing SHALL NOT enforce a mandatory tier-by-tier sequence.

**FR-ROUTE-004** The system SHALL surface why a facility was matched in human-readable terms.

**FR-ROUTE-005** The system SHALL not represent stale capability/availability data as guaranteed current information.

### 4.8 Referral Management

**FR-REF-001** The system SHALL support creation of a Referral linked to a PatientCase.

**FR-REF-002** Each referral SHALL have a unique referral ID and QR/token representation.

**FR-REF-003** The state model SHALL support at least: ISSUED, ACCEPTED, REJECTED, DECLINED, EN_ROUTE, ARRIVED, TREATED, ADMITTED, DISCHARGED, FOLLOW_UP, COMPLETED, MISSED, CANCELLED.

**FR-REF-004** Onward referral SHALL be representable without losing the originating case timeline.

**FR-REF-005** Every state transition SHALL record actor, role, facility/scope, timestamp, previous state, new state, and reason where relevant.

**FR-REF-006** Receiving Facility Staff SHALL be able to accept, reject, or decline a routine referral within their operational authority.

**FR-REF-007** Receiving-facility acceptance SHALL NOT automatically mark clinical acceptance or admission.

**FR-REF-008** Arrival SHALL be confirmable by the receiving facility through QR/token lookup or authorized search.

**FR-REF-009** Patient self-reported EN_ROUTE status SHALL be distinguishable from facility-confirmed ARRIVED status.

**FR-REF-010** Rejected/declined referrals SHOULD trigger alternate-capability routing logic.

### 4.9 Emergency Workflow

**FR-EMG-001** The system SHALL create/link an emergency event to the active PatientCase.

**FR-EMG-002** Emergency workflow SHALL not wait for routine referral acceptance.

**FR-EMG-003** MVP SHALL record a simulated/manual 108/MEMS handoff without claiming dispatch control.

**FR-EMG-004** The system SHALL allow emergency-capable facility staff to record arrival and continue the same case timeline.

**FR-EMG-005** No production claim of 108/MEMS integration SHALL be enabled unless an authorized integration is configured.

### 4.10 Clinical Workflow Recording

**FR-CLIN-001** Authorized clinical roles SHALL be able to record assessment events.

**FR-CLIN-002** Diagnosis records SHALL only be created/confirmed by permitted clinical roles.

**FR-CLIN-003** Prescription records SHALL only be created by permitted prescribing roles.

**FR-CLIN-004** Admission and discharge events SHALL require authorized clinical actors.

**FR-CLIN-005** Receiving-facility workflow SHALL contain an explicit reassessment step after arrival.

### 4.11 Medicine Tracking

**FR-MED-001** The system SHALL support medicine availability states: AVAILABLE, LOW, OUT, NOT_VERIFIED.

**FR-MED-002** Medicine availability SHALL carry `last_verified_at` and verifier/source metadata.

**FR-MED-003** Pharmacy/Store roles SHALL be able to record dispensing linked to a case/prescription with relevant quantity/batch/expiry data where available.

**FR-MED-004** Patient-facing views SHALL distinguish prescription instructions from stock/dispensing status.

### 4.12 Diagnostic Tracking

**FR-DIAG-001** The system SHALL support the lifecycle: ORDERED -> SCHEDULED -> PERFORMED -> RESULT_AVAILABLE -> REVIEWED, with optional skipped/not-applicable states.

**FR-DIAG-002** Diagnostic results SHALL be linked to the PatientCase.

**FR-DIAG-003** Clinical interpretation SHALL remain restricted to authorized clinical roles.

**FR-DIAG-004** Diagnostic service availability SHALL include freshness/verification metadata when not live.

### 4.13 Appointment and Queue

**FR-APT-001** The system MAY support appointment creation and status where the facility workflow provides real availability.

**FR-APT-002** The system SHALL NOT fabricate real-time slot or queue data.

**FR-APT-003** Missed/rescheduled appointment states SHOULD be supported where appointments are enabled.

### 4.14 Follow-Up

**FR-FU-001** Authorized clinical/frontline workflows SHALL be able to create follow-up tasks linked to a case.

**FR-FU-002** Follow-up SHALL support patient self-confirmation where appropriate.

**FR-FU-003** Follow-up SHALL support authorized ASHA/ANM/CHO completion where assigned.

**FR-FU-004** Overdue incomplete follow-up SHALL transition to MISSED or equivalent overdue state according to configured policy.

**FR-FU-005** Missed follow-up SHALL create an escalation/task for an authorized frontline role.

### 4.15 Notifications

**FR-NOTIF-001** The system SHALL support in-app notification records.

**FR-NOTIF-002** SMS/push/voice channels MAY be added where configured.

**FR-NOTIF-003** Notifications SHALL avoid disclosing unnecessary sensitive clinical data on lock screens or insecure channels.

### 4.16 Offline-First Operation

**FR-OFF-001** Patient and frontline clients SHALL support encrypted local data storage for defined offline-capable workflows.

**FR-OFF-002** Offline-capable workflows SHALL include draft intake, case creation, cached deterministic rules, referral data, follow-up tasks, and pending sync operations as defined for the client.

**FR-OFF-003** First login/OTP, account recovery, remote teleconsultation, external government API calls, and server reconciliation MAY require connectivity.

**FR-OFF-004** Sync operations SHALL be idempotent.

**FR-OFF-005** Each sync operation SHALL have a stable operation ID, local timestamp, server status, retry count, and conflict metadata.

**FR-OFF-006** The server SHALL perform validation and conflict resolution before committing synced events.

**FR-OFF-007** Local cache SHALL NOT be treated as an independent permanent system of record.

### 4.17 Bhashini Integration

**FR-LANG-001** The language adapter SHALL separate model/config discovery from inference/compute configuration.

**FR-LANG-002** Service IDs and inference configuration MAY be cached according to platform validity rules.

**FR-LANG-003** The system SHOULD support chained ASR/translation/TTS where valid for the configured language pair.

**FR-LANG-004** Supported language pairs SHALL be treated as runtime-configurable and revalidated rather than hard-coded as permanently available.

**FR-LANG-005** Transient 5xx failures SHOULD use bounded exponential backoff.

### 4.18 ABDM / ABHA Adapter

**FR-ABDM-001** MVP SHALL support only an optional sandbox/stub linkage flow unless approved credentials and roles exist.

**FR-ABDM-002** The adapter SHALL be server-side.

**FR-ABDM-003** ABDM-specific secrets, encryption, certificates, and role grants SHALL NOT be exposed to clients.

**FR-ABDM-004** Full HIP/HIU data exchange SHALL remain disabled until required approval, encryption, FHIR, consent, webhook, and reconciliation requirements are implemented.

### 4.19 eSanjeevani Adapter

**FR-ESANJ-001** SwasthyaSetu MAY prepare a clinician-ready summary for an authorized operator.

**FR-ESANJ-002** The product SHALL not claim a direct eSanjeevani API integration unless official access exists.

### 4.20 District Dashboard

**FR-DIST-001** The dashboard SHALL show aggregate referral funnel metrics.

**FR-DIST-002** The dashboard SHALL support operational alerts such as unacknowledged referral, rejection/decline, non-arrival, missed follow-up, stale medicine/diagnostic information, and facility capability gaps.

**FR-DIST-003** The dashboard SHALL minimize exposure of individual patient clinical data.

### 4.21 Audit

**FR-AUD-001** The system SHALL write audit events for authentication-sensitive actions, authorization failures, clinical/referral/emergency state changes, facility capability changes, and external-integration actions.

**FR-AUD-002** Audit records SHALL contain actor, role, scope/facility, timestamp, action, entity, entity ID, and relevant before/after state.

**FR-AUD-003** Application users SHALL NOT be able to silently rewrite audit history.

## 5. Non-Functional Requirements

### 5.1 Security

**NFR-SEC-001** All network traffic SHALL use TLS in production.

**NFR-SEC-002** Sensitive data SHALL be encrypted at rest.

**NFR-SEC-003** Sensitive offline data SHALL be encrypted locally.

**NFR-SEC-004** Secrets SHALL be stored in a dedicated secret-management mechanism, not source control or client bundles.

**NFR-SEC-005** Authorization SHALL be enforced server-side for every protected operation.

**NFR-SEC-006** The system SHOULD support rate limiting, abuse controls, and suspicious-login monitoring.

### 5.2 Privacy

**NFR-PRIV-001** Data collection SHALL follow minimization principles.

**NFR-PRIV-002** District views SHALL prefer aggregates.

**NFR-PRIV-003** Identity-linking operations SHALL be conservative when a match is uncertain.

**NFR-PRIV-004** Data retention and deletion rules SHALL be configurable to approved policy before production.

### 5.3 Reliability

**NFR-REL-001** Referral state transitions SHALL be transactional.

**NFR-REL-002** Duplicate sync/API requests SHALL not create duplicate state transitions when the same idempotency key is reused.

**NFR-REL-003** External adapter failures SHALL not corrupt the local case timeline.

**NFR-REL-004** The system SHALL support retry and dead-letter/error-review mechanisms for failed asynchronous work.

### 5.4 Performance

No production latency targets are defined in the source project definition. Before production, the team SHALL establish measurable targets for:

- API response latency by operation class
- referral dashboard refresh
- sync throughput
- concurrent facility users
- offline queue replay
- language-service timeout budget

### 5.5 Scalability

**NFR-SCALE-001** Backend services SHALL be stateless where practical and horizontally scalable.

**NFR-SCALE-002** Reporting workloads SHOULD be isolated from critical transactional referral/case writes.

### 5.6 Accessibility and Usability

**NFR-UX-001** Critical actions SHALL be understandable in low-literacy contexts through simple language, iconography, and voice support where feasible.

**NFR-UX-002** Emergency actions SHALL remain visually and behaviorally distinct from routine workflows.

**NFR-UX-003** Patient-facing clinical language SHALL avoid presenting AI-generated output as diagnosis.

### 5.7 Observability

**NFR-OBS-001** Services SHALL emit structured logs, metrics, and trace/correlation identifiers.

**NFR-OBS-002** Operational monitoring SHALL distinguish application failures from external-adapter failures.

**NFR-OBS-003** Safety-rule version and referral transition failures SHALL be directly observable.

### 5.8 Maintainability

**NFR-MAINT-001** Domain boundaries SHALL be preserved even if multiple logical services share an MVP deployment unit.

**NFR-MAINT-002** Safety rules SHALL be testable without invoking the LLM.

**NFR-MAINT-003** External-system adapters SHALL be isolated behind interfaces so simulated/sandbox/production implementations can be switched without changing domain logic.

## 6. Data Requirements

### 6.1 Identity separation

The schema SHALL preserve:

`USER_ID != PATIENT_ID != CASE_ID != ABHA_ID != FACILITY_ID != ROLE != OPERATED_BY`

### 6.2 Core relationships

The system SHALL represent the chain:

`Patient -> PatientCase -> FacilityVisit -> ClinicalAssessment -> DiagnosticOrder/Result -> Treatment/Prescription/Medicine -> Referral -> ReceivingFacilityVisit -> Admission/Discharge -> FollowUp -> Outcome`

### 6.3 Freshness metadata

Capability, medicine, diagnostic, appointment, and other non-live operational availability records SHALL support last-updated/last-verified timestamps and source/verifier metadata.

## 7. Interface Requirements

Representative internal API groups:

- `/auth`
- `/patients`
- `/cases`
- `/intake`
- `/safety`
- `/facilities`
- `/routing`
- `/referrals`
- `/emergencies`
- `/clinical`
- `/medicines`
- `/diagnostics`
- `/follow-ups`
- `/notifications`
- `/sync`
- `/audit`
- `/integrations/bhashini`
- `/integrations/abdm`
- `/integrations/esanjeevani`

Exact endpoint naming may change without changing these domain requirements.

## 8. State-Machine Requirements

Referral state transitions SHALL be explicitly validated. Invalid jumps SHALL be rejected unless performed through an approved corrective/admin workflow with audit.

Example normal path:

`ISSUED -> ACCEPTED -> EN_ROUTE -> ARRIVED -> TREATED -> DISCHARGED -> FOLLOW_UP -> COMPLETED`

Example decline path:

`ISSUED -> DECLINED -> alternate route -> new/updated destination`

Example missed path:

`ISSUED/ACCEPTED -> timeout/non-arrival policy -> MISSED -> escalation`

Emergency cases use a separate workflow branch and do not depend on routine `ACCEPTED` before transport.

## 9. External Integration Constraints

- Government integration availability SHALL be treated as configuration, not assumption.
- Unsupported integration status SHALL be clearly visible to operators/testers.
- Simulated demo behavior SHALL be labelled as simulated.
- Client applications SHALL never directly call protected government APIs using server credentials.

## 10. Verification Requirements

The test strategy SHALL include:

- unit tests for state transitions and safety rules
- role/permission matrix tests
- contract tests for domain APIs
- integration tests for PostgreSQL transactions
- offline sync replay/idempotency tests
- adapter tests using mocks/sandbox environments
- security tests for authentication, authorization, object-level access, and token handling
- UI tests for direct and assisted patient journeys
- emergency-path tests proving routine acceptance is bypassed
- rejection/alternate-routing tests
- data freshness-label tests
- audit completeness tests
- accessibility/language usability tests

## 11. MVP Exit Criteria

MVP software exit requires:

- all mandatory functional requirements implemented for the selected demonstration scope
- zero known critical authorization bypasses
- deterministic safety path operational with a test rule set clearly marked as non-production unless clinically approved
- end-to-end referral continuity demo passing
- emergency bypass behavior passing
- offline queue replay passing for supported offline actions
- audit coverage for all state transitions
- external integrations clearly marked sandbox/simulated/disabled as applicable
- test evidence retained for release review
