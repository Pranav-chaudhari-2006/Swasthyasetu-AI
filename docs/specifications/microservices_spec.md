# Microservice Architecture Plan
## SwasthyaSetu AI

> Filename kept as `mivcroservice.md` to match the requested project-document set.

## 1. Architecture Goal

The backend is organized around domain boundaries so that patient identity, case continuity, safety, routing, referral state, clinical workflow, follow-up, offline synchronization, and external integrations remain independently understandable and testable.

For MVP, these are **logical services**. They may be deployed as fewer physical processes to reduce operational complexity, provided the boundaries and contracts remain clear. Avoid premature service fragmentation in the MVP; preserve clear domain boundaries first, then extract services when scaling, ownership, or security needs justify it.

## 2. Service Map

| Service | Primary responsibility | Owns clinical decisions? |
|---|---|---|
| API Gateway / BFF | Entry point, request routing, coarse rate limits | No |
| Auth Service | Login, OTP, sessions, tokens | No |
| Access Control Service | RBAC and facility/jurisdiction scope | No |
| Patient Service | Patient profile, caregiver links, durable Patient ID | No |
| Case Service | PatientCase lifecycle and master timeline | No |
| Intake Service | Conversation/session capture and structured intake | No |
| AI Interaction Service | LLM/NLP structuring, clarification, summaries | No |
| Safety Service | Deterministic safety-pathway rules | No diagnosis; workflow classification only |
| Facility Registry Service | Facility and capability master data | No |
| Routing Service | Capability-based facility matching | No |
| Referral Service | Referral state machine and handoff | No |
| Emergency Coordination Service | Emergency event and 108/MEMS continuity status | No dispatch control |
| Clinical Workflow Service | Clinician-authored assessment/treatment/admission/discharge records | Records authorized clinical actions |
| Medicine Service | Stock freshness and dispensing events | No prescribing |
| Diagnostic Service | Orders, status, results, review state | No interpretation by non-clinical roles |
| Appointment Service | Appointment/queue workflow where real data exists | No |
| Follow-Up Service | Follow-up tasks, reminders, missed escalation | No |
| Notification Service | Delivery orchestration for in-app/SMS/push/voice | No |
| Sync Service | Offline operation ingestion and reconciliation | No |
| Audit Service | Security and domain audit trail | No |
| Reporting Service | District aggregate metrics and operational alerts | No |
| Bhashini Adapter | Language-service integration | No |
| ABDM Adapter | Optional/future ABHA/HIP/HIU integration | No |
| eSanjeevani Adapter | Optional/future official integration | No |

## 3. Recommended MVP Deployment Shape

To avoid premature infrastructure overhead, use a small number of deployable units while preserving module boundaries:

### Deployment A: Core API

Contains:

- Auth
- Access Control
- Patient
- Case
- Facility Registry
- Referral
- Clinical Workflow
- Medicine
- Diagnostics
- Follow-Up

### Deployment B: Decision and Orchestration

Contains:

- Intake
- AI Interaction
- Safety
- Routing
- Emergency Coordination
- Appointment

### Deployment C: Async / Integration Workers

Contains:

- Notification
- Sync reconciliation workers
- Audit export/processing
- Reporting jobs
- Bhashini adapter worker
- disabled/sandbox ABDM and eSanjeevani adapters

As load, team size, or operational ownership grows, these modules can be separated into independent services.

## 4. Service Responsibilities

### 4.1 Auth Service

Owns:

- patient OTP challenge and verification
- staff authentication integration
- token/session issuance
- logout/revocation
- session metadata

Does not own:

- Patient entity
- role permissions
- ABHA identity

Key APIs:

- `POST /auth/send-otp`
- `POST /auth/verify-otp`
- `POST /auth/logout`
- `POST /auth/refresh`

### 4.2 Access Control Service

Owns:

- role definitions
- permission policy
- facility/jurisdiction scope evaluation
- authorization decisions

Policy inputs:

- user ID
- role
- facility/scope
- resource owner/scope
- requested action

### 4.3 Patient Service

Owns:

- Patient ID
- demographics
- contact information
- language preference
- caregiver relationships
- optional ABHA-link reference metadata

Does not own clinical case history.

### 4.4 Case Service

Owns:

- PatientCase ID
- case status
- event/timeline index
- references to linked domain records
- outcome/closure status

The Case Service is the continuity backbone. It should not duplicate full copies of every domain payload.

### 4.5 Intake Service

Owns:

- intake session
- original messages/transcripts
- structured symptom observations
- clarification-question workflow
- completion state

Calls:

- Bhashini Adapter
- AI Interaction Service
- Safety Service after required structured fields are available

### 4.6 AI Interaction Service

Owns no clinical truth.

Responsibilities:

- extraction
- structuring
- translation/normalization assistance
- clarification generation
- summarization

Guardrails:

- schema-constrained output
- no diagnosis field
- no prescription field
- no emergency/escalation authority
- prompt/model version recorded
- confidence/uncertainty retained where applicable

### 4.7 Safety Service

Responsibilities:

- deterministic rule evaluation
- pathway classification
- rule explanation
- rule-set versioning

Input:

- structured case facts
- selected demographic/context variables needed by approved rules

Output:

- ROUTINE / SAME_DAY / EMERGENCY
- triggered rules
- rule-set version
- timestamp

Production rules require clinical governance outside normal application release approval.

### 4.8 Facility Registry Service

Owns:

- facility identity
- facility type
- location
- operating hours
- capability records
- service/diagnostic/specialist flags
- verification metadata
- capability freshness

It must never treat tier defaults as proof of actual facility availability.

### 4.9 Routing Service

Responsibilities:

- convert case need into required capability criteria
- search verified facility capabilities
- rank/filter candidate facilities using configured factors
- explain match reasons
- reroute after rejection/decline

Routing is advisory/orchestration logic. It does not make clinical diagnosis or admission decisions.

### 4.10 Referral Service

Owns:

- Referral ID
- source/destination
- QR/token
- referral state
- transition history
- rejection/decline reasons
- arrival confirmation
- onward-referral links

Critical property:

State changes must be transactional and idempotent.

### 4.11 Emergency Coordination Service

Owns:

- EmergencyEvent
- case linkage
- emergency pathway status
- manual/simulated/external handoff references
- facility-arrival status

Does not dispatch ambulances.

### 4.12 Clinical Workflow Service

Owns clinician-authored:

- assessment
- diagnosis
- treatment plan
- prescription reference
- admission
- discharge
- clinical referral decision

Authorization is strict. AI-generated summaries may be displayed as supporting context, never silently converted into clinician-authored facts.

### 4.13 Medicine Service

Owns:

- medicine catalog references
- facility stock status
- last-verified metadata
- dispensing events
- prescription linkage

It does not generate prescriptions.

### 4.14 Diagnostic Service

Owns:

- diagnostic order
- scheduling/status
- result metadata/file reference
- clinician review status

Result interpretation remains with clinical roles.

### 4.15 Follow-Up Service

Owns:

- follow-up plan/task
- due date
- assigned actor
- reminder status
- patient confirmation
- worker confirmation
- missed status
- escalation

### 4.16 Sync Service

Owns:

- offline operation ingestion
- idempotency keys
- sync cursor/checkpoint
- validation failures
- conflict metadata
- reconciliation status

Recommended operation envelope:

```json
{
  "operationId": "uuid",
  "deviceId": "device-ref",
  "actorId": "user-ref",
  "entityType": "Referral",
  "entityId": "REF-...",
  "action": "MARK_EN_ROUTE",
  "clientTimestamp": "ISO-8601",
  "baseVersion": 4,
  "payload": {},
  "signatureOrIntegrityMetadata": {}
}
```

## 5. Data Ownership Strategy

Use PostgreSQL as the primary transactional store.

For MVP, a shared physical database with schema/module ownership is acceptable if:

- each logical service owns its tables
- cross-module writes happen through service/domain methods, not arbitrary SQL
- foreign-key relationships are documented
- event/audit history is preserved

As services are extracted, use service-owned databases only where the operational benefit justifies distributed consistency complexity.

## 6. Events

Recommended internal domain events:

- `PatientRegistered`
- `CaseOpened`
- `IntakeCompleted`
- `SafetyPathwayAssigned`
- `EmergencyPathwayActivated`
- `FacilityMatched`
- `ReferralIssued`
- `ReferralAccepted`
- `ReferralDeclined`
- `ReferralRejected`
- `PatientMarkedEnRoute`
- `PatientArrived`
- `ClinicalReassessmentRecorded`
- `DiagnosticOrdered`
- `DiagnosticResultAvailable`
- `MedicineDispensed`
- `PatientAdmitted`
- `PatientDischarged`
- `FollowUpCreated`
- `FollowUpMissed`
- `FollowUpCompleted`
- `CaseClosed`
- `OfflineSyncConflictDetected`

Events should contain identifiers and minimum required metadata, not unnecessary clinical payloads.

## 7. Synchronous vs Asynchronous Work

### Synchronous

Use synchronous calls for actions where the user needs immediate confirmation:

- login
- RBAC check
- case creation
- safety evaluation
- facility lookup/routing result
- referral transition
- arrival confirmation
- clinical record commit

### Asynchronous

Use a queue/worker model for:

- notifications
- analytics aggregation
- non-critical external synchronization
- retryable integration calls
- stale-data checks
- report generation
- offline bulk reconciliation

## 8. Referral Consistency Model

Referral state is strongly consistent within SwasthyaSetu.

Requirements:

- optimistic version or row locking
- idempotency key on transition APIs
- transition validation
- actor authorization
- audit write in the same logical transaction or guaranteed outbox flow
- duplicate delivery safe consumers

Recommended outbox pattern:

1. commit domain state + outbox row in one transaction
2. worker publishes event
3. consumer processes idempotently
4. mark outbox delivered

## 9. API Gateway Responsibilities

The gateway/BFF should handle:

- TLS termination at edge/reverse proxy
- authentication token validation
- correlation ID
- coarse rate limiting
- request size limits
- routing
- response normalization where useful

It should not contain healthcare business logic.

## 10. External Adapter Pattern

Every external system is behind an adapter interface.

Example:

```text
LanguageProvider
  - transcribe()
  - translate()
  - synthesize()

EmergencyTransportAdapter
  - createHandoffReference()
  - getStatus() [only if supported]

HealthIdentityAdapter
  - linkIdentity()
  - unlinkIdentity()
  - exchangeRecords() [future, only when authorized]
```

Provide implementations such as:

- `BhashiniLanguageProvider`
- `MockLanguageProvider`
- `Manual108HandoffAdapter`
- `SandboxABHAAdapter`
- `DisabledESanjeevaniAdapter`

The UI should display integration mode when relevant: `LIVE`, `SANDBOX`, `SIMULATED`, or `UNAVAILABLE`.

## 11. Security Across Services

- service-to-service authentication for separated deployments
- least-privilege database credentials
- centralized secrets
- signed/validated tokens
- object-level authorization
- audit correlation IDs
- encrypted sensitive payloads
- no sensitive tokens in logs
- no direct browser/mobile access to government secrets

## 12. Observability

Every request should carry:

- correlation ID
- actor ID where authenticated
- case ID where applicable
- referral ID where applicable
- service name
- outcome/error class

Critical dashboards:

- auth error rate
- referral transition failure rate
- emergency-path activation volume
- alternate-routing failures
- offline sync conflict backlog
- stale facility capability count
- external adapter failure rate
- notification backlog

## 13. Extraction Triggers

A logical module should become an independently deployed microservice when one or more of these becomes true:

- materially different scaling profile
- separate operational ownership
- different security boundary
- independent release cadence is valuable
- external adapter instability should be isolated
- workload threatens core referral transaction latency

Likely early extraction candidates:

1. Bhashini/AI Interaction
2. Notification workers
3. Reporting/analytics
4. Sync/reconciliation
5. External government adapters

Core Patient/Case/Referral transactions should remain simple and strongly consistent until there is a demonstrated reason to distribute them.
