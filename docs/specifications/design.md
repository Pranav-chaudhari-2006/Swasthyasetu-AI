# System Design Document
## SwasthyaSetu AI

## 1. Design Objective

Design a safe, auditable, offline-capable healthcare continuity platform that can connect a patient's journey across frontline workers and public facilities without replacing clinical authority or pretending unsupported external integrations are already live.

The design prioritizes:

1. patient continuity
2. clinical safety boundaries
3. referral-state integrity
4. verified-capability routing
5. offline resilience
6. role-scoped privacy
7. explicit external-system boundaries
8. public credibility and traceability

## 2. Design Principles

### DP-01 Patient is the subject of care

`patient_id != operated_by`

A worker may operate the interface, but the patient owns the case.

### DP-02 AI is not the safety authority

The AI layer structures conversation. The deterministic Safety Engine selects a workflow pathway.

### DP-03 Clinical authority stays human

Diagnosis, prescription, treatment, admission, discharge, and clinical referral decisions are restricted to authorized clinical roles.

### DP-04 Facility capability beats hierarchy

Routing uses verified facility capability. Tier is contextual metadata, not a guarantee.

### DP-05 Referral is a state machine

A referral is a durable workflow entity with explicit state, owner, timestamp, reason, and next action.

### DP-06 Emergency has its own branch

Emergency cases bypass routine referral-response waiting and move to 108/MEMS coordination.

### DP-07 Offline is first-class

Patient and frontline apps can capture defined core work offline and reconcile later.

### DP-08 External integrations are adapters

ABDM/ABHA, eSanjeevani, Bhashini, and 108/MEMS must not leak provider-specific behavior into the core domain.

## 3. System Context

```text
+--------------------+        +-------------------------+
| Patient PWA        |        | Frontline Worker PWA    |
+---------+----------+        +------------+------------+
          |                                |
          +---------------+----------------+
                          |
                    HTTPS / Sync API
                          |
                +---------v----------+
                | API Gateway / BFF  |
                +---------+----------+
                          |
       +------------------+-------------------+
       |                  |                   |
+------v------+    +------v------+    +-------v-------+
| Core Domain |    | Decision /  |    | Integration / |
| Services    |    | Orchestration|   | Async Workers |
+------+------+    +------+------+    +-------+-------+
       |                  |                   |
       +------------------+-------------------+
                          |
                    +-----v------+
                    | PostgreSQL |
                    +------------+

Facility Web App and District Dashboard use the same authenticated backend with different RBAC scopes.
```

## 4. Client Design

### 4.1 Patient PWA

Primary surfaces:

- authentication
- active case
- symptom intake
- referral status
- emergency status
- appointments where supported
- medicines
- diagnostics
- follow-ups
- caregiver management
- optional ABHA link

Design rule: active/emergency care must be more prominent than historical features.

### 4.2 Frontline Worker PWA

Primary surfaces:

- assigned/community patient search
- assisted patient registration
- patient verification
- offline intake
- vitals/measurements within role scope
- referral support
- follow-up task list
- sync status

Every action records both patient and operator.

### 4.3 Facility Web App

Primary surfaces:

- incoming referrals
- response queue
- patient arrival/token scan
- reassessment handoff
- clinical workflow
- diagnostics
- medicines
- admission/discharge
- onward referral
- facility capability admin for authorized users

### 4.4 District Dashboard

Primary surfaces:

- referral funnel
- unacknowledged referrals
- declined/rejected referrals and reasons
- non-arrivals
- missed follow-ups
- stale facility/medicine/diagnostic information
- capability gaps

Patient-level clinical detail is minimized.

## 5. Core Backend Domains

```text
Identity/Auth
  -> Patient
  -> Case
  -> Intake/AI
  -> Safety
  -> Facility Registry
  -> Routing
  -> Referral
  -> Clinical Workflow
  -> Medicine / Diagnostics
  -> Follow-Up
  -> Outcome
```

Cross-cutting domains:

- RBAC
- Offline Sync
- Notification
- Audit
- Reporting
- External Adapters

## 6. Identity Design

Use separate identifiers:

```text
UserId
PatientId
CaseId
ReferralId
FacilityId
RoleId
ScopeId
ABHALinkId [optional]
OperatedByUserId [optional]
```

Do not use mobile number as the durable patient key.

### 6.1 Patient authentication

MVP:

`mobile -> OTP challenge -> OTP verification -> session -> patient account`

### 6.2 Staff authentication

Use role + facility/jurisdiction scope. OAuth/OIDC-style integration is appropriate, but the exact identity provider is deployment-specific.

## 7. Authorization Design

Authorization decision:

```text
allow = policy(
  actor.role,
  actor.facility_or_jurisdiction_scope,
  action,
  resource.type,
  resource.scope,
  resource.patient_or_assignment_relation
)
```

Examples:

- Patient may view own referral.
- ASHA may update an assigned follow-up.
- Receiving staff may transition an incoming referral operationally.
- Doctor may record diagnosis/treatment for in-scope clinical case.
- Facility Admin may edit capability metadata but not clinical notes.
- District Admin sees aggregate operational information.

## 8. Intake and AI Design

### 8.1 Input pipeline

```text
Voice -> Bhashini ASR -> original transcript
                         |
Text --------------------+
                         v
             normalization / translation
                         v
               AI structuring layer
                         v
              structured case facts
                         v
            clarification-question loop
                         v
              deterministic Safety Engine
```

### 8.2 AI output schema

The AI service should emit structured fields such as:

```json
{
  "symptoms": [],
  "duration": null,
  "reportedSeverity": null,
  "observations": [],
  "missingFields": [],
  "clarificationQuestions": [],
  "sourceLanguage": "...",
  "normalizationNotes": []
}
```

Do not include authoritative `diagnosis`, `prescription`, or `emergencyDecision` fields.

### 8.3 Provenance

Store:

- original message/transcript
- normalized/translated text where used
- structured output
- AI model/prompt version
- timestamp
- operator/user ID

## 9. Safety Engine Design

The Safety Engine is deterministic.

### 9.1 Inputs

- structured symptom/observation facts
- age/sex/context variables only where required by approved rules
- explicit red-flag answers
- role-entered vitals where available

### 9.2 Outputs

```json
{
  "pathway": "ROUTINE | SAME_DAY | EMERGENCY",
  "ruleSetVersion": "...",
  "triggeredRuleIds": [],
  "explanation": [],
  "evaluatedAt": "..."
}
```

### 9.3 Governance

Production rule content is not defined by this design document. It must be authored/reviewed by qualified clinical governance, tested against approved scenarios, versioned, and auditable.

The application team must not invent clinical red-flag logic simply to make the demo appear complete. Demo/test rules must be clearly separated from clinically approved production rules.

## 10. Capability Registry Design

Core model:

```text
Facility
  - facility_id
  - name
  - type
  - geo/location
  - public_identifier
  - operating_hours
  - active_status

FacilityCapability
  - capability_id
  - facility_id
  - capability_type
  - capability_code
  - status
  - verification_source
  - verified_by
  - last_verified_at
  - valid_until [optional]
```

Capability categories may include:

- services
- diagnostics
- emergency
- specialists
- inpatient
- OT
- ICU
- blood bank
- medicine availability

## 11. Routing Design

### 11.1 Inputs

- safety pathway
- required capability set
- facility capability data
- location/distance
- operating hours
- referral relationships
- freshness of operational data

### 11.2 Output

Return a ranked candidate set with explanation:

```json
{
  "requiredCapabilities": ["..."],
  "candidates": [
    {
      "facilityId": "...",
      "matchedCapabilities": ["..."],
      "distance": null,
      "freshness": "...",
      "reason": "..."
    }
  ]
}
```

The route decision shown to users must not claim live availability unless the source is live.

## 12. Referral State Machine

### 12.1 States

```text
ISSUED
  |-- ACCEPTED -> EN_ROUTE -> ARRIVED -> REASSESSED -> TREATED
  |                                           |          |
  |                                           |          +-> ADMITTED -> DISCHARGED
  |                                           |
  |                                           +-> ONWARD_REFERRAL
  |
  |-- DECLINED/REJECTED -> ALTERNATE_ROUTING
  |
  +-- CANCELLED

Post-care:
DISCHARGED/TREATED -> FOLLOW_UP -> COMPLETED
                       |
                       +-> MISSED -> escalation
```

### 12.2 Transition record

```text
ReferralStateTransition
  - id
  - referral_id
  - from_state
  - to_state
  - actor_user_id
  - actor_role
  - actor_facility_or_scope
  - reason
  - timestamp
  - metadata
```

### 12.3 Concurrency

Use transaction + row version/locking. Transition requests require idempotency keys.

## 13. Emergency Design

Emergency workflow is separate:

```text
structured case facts
   -> deterministic EMERGENCY pathway
   -> show immediate emergency action
   -> create EmergencyEvent
   -> manual/simulated/authorized 108 handoff
   -> record transport status only if supported
   -> emergency facility arrival
   -> clinician reassessment
   -> normal case continuity resumes
```

There is no routine `wait for ACCEPTED` stage before emergency transport.

## 14. Clinical Workflow Design

After facility arrival:

```text
Arrival
 -> Reassessment
 -> OPD / IPD / Emergency disposition
 -> Clinical assessment
 -> Diagnostics and/or treatment
 -> Prescription/dispensing
 -> Admission if clinically decided
 -> Discharge or onward referral
 -> Follow-up plan
```

AI-generated summaries are displayed as source material. A clinician action is required to create authoritative clinical records.

## 15. Medicine Design

Medicine availability status:

- AVAILABLE
- LOW
- OUT
- NOT_VERIFIED

Always include:

- source
- last verified time
- verifier where applicable

Dispensing event links:

`Case -> Prescription -> Medicine -> Dispensing`

## 16. Diagnostic Design

Diagnostic lifecycle:

`ORDERED -> SCHEDULED -> PERFORMED -> RESULT_AVAILABLE -> REVIEWED`

Store result documents using secure object/file storage with database metadata and role-scoped access.

## 17. Follow-Up Design

```text
Discharge/Treatment
   -> FollowUpTask created
   -> reminder(s)
   -> patient or authorized worker confirmation
   -> COMPLETED

If overdue:
   -> MISSED
   -> patient reminder
   -> assigned ASHA/ANM/CHO task
   -> escalation visibility
```

## 18. Offline Design

### 18.1 Local data

Offline clients may cache:

- session metadata
- patient profile subset
- current case
- draft intake
- cached safety rule package
- referral data
- follow-up tasks
- pending operations
- sync metadata

### 18.2 Sync queue

Every offline mutation becomes an operation with:

- operation ID
- device ID
- actor ID
- entity ID/type
- action
- client timestamp
- base version
- payload
- retry count
- status

### 18.3 Conflict policy

Use domain-specific conflict handling:

- additive observation: merge when safe
- same field changed concurrently: server policy + manual review when required
- referral state conflict: server validates legal transition; reject invalid stale transition
- duplicate operation: idempotent success

### 18.4 Rule package

Offline deterministic rule packages must include:

- version
- signature/integrity metadata
- activation date
- expiry/refresh policy

## 19. Database Design

Recommended database: PostgreSQL.

Critical tables/groups:

- identity and auth
- patients and caregivers
- facilities and capabilities
- cases and observations
- safety assessments
- referrals and transitions
- visits and clinical records
- medicines and dispensing
- diagnostics
- admissions/discharges
- follow-ups
- notifications
- offline sync
- audit log
- outbox events

Use relational constraints for referral/case integrity.

## 20. External Integration Design

### 20.1 Bhashini

Use a backend adapter. Keep configuration/model discovery separate from inference compute configuration. Cache runtime configuration where valid and treat supported language pairs as configurable.

### 20.2 ABDM/ABHA

MVP uses optional sandbox/stub linkage only.

Production HIP/HIU integration requires official permissions plus consent, FHIR R4 bundles, encryption, webhook handling, and reconciliation. None should be represented as production-live until implemented and approved.

### 20.3 eSanjeevani

Support handoff preparation and link-out/workflow support where permitted. Direct API integration remains future/official-integration scope.

### 20.4 108/MEMS

The platform records the emergency case and continuity around transport. Dispatch remains outside SwasthyaSetu unless an approved state integration exists.

## 21. Security Design

### 21.1 Controls

- TLS
- encryption at rest
- local-storage encryption
- secret management
- short-lived access tokens
- refresh/session revocation
- object-level authorization
- least-privilege database/service accounts
- audit logging
- rate limits
- safe file upload validation
- PII-aware logging

### 21.2 Sensitive actions requiring audit

- login/revocation events
- patient identity changes
- caregiver authorization changes
- referral state changes
- clinical record creation/update
- facility capability changes
- ABHA linkage actions
- data export/access
- admin role changes

## 22. Observability Design

Metrics:

- API latency/error rate
- safety evaluations by rule-set version
- referral state counts and transition failures
- rejected/declined referral reasons
- alternate-routing success/failure
- emergency events
- missed follow-ups
- offline queue depth/conflict rate
- capability data age
- medicine/diagnostic freshness
- external adapter latency/failures

Logs must use correlation IDs and avoid unnecessary sensitive content.

## 23. Failure Handling

### Facility does not respond

- mark/flag according to timeout policy
- raise operational alert
- allow alternate routing based on configured workflow

### Facility declines/rejects

- persist reason
- run alternate facility search
- preserve same case continuity

### Offline sync fails

- retain operation
- retry with bounded backoff
- expose sync status
- route unresolved conflicts to review

### Bhashini fails

- preserve text/manual entry path
- retry transient server errors
- do not block emergency actions solely on language-service availability

### External government adapter unavailable

- fail gracefully
- keep core SwasthyaSetu case functional
- display integration status accurately

## 24. Key Architecture Decisions

### ADR-001 PostgreSQL over document-first primary storage

Reason: strong relational integrity is valuable for patient/case/referral state relationships.

### ADR-002 Deterministic safety over LLM urgency judgment

Reason: safety pathway must be explainable, versioned, auditable, and independently testable.

### ADR-003 Capability routing over mandatory tier ladder

Reason: a patient should reach the facility that can actually provide the required capability.

### ADR-004 Optional ABHA

Reason: care must not depend on external digital identity linkage.

### ADR-005 Adapter isolation for government systems

Reason: availability, permissions, and versioning differ; core workflows must remain stable.

### ADR-006 Logical services before maximum microservice separation

Reason: preserve domain clarity without incurring avoidable distributed-system complexity during MVP.

## 25. Design Acceptance Checklist

The design is implemented correctly when:

- AI cannot directly set a clinical diagnosis/prescription/emergency decision
- safety rules are deterministic and versioned
- patient and operator identities remain separate
- referral transitions are validated and audited
- emergency bypasses routine referral acceptance
- facility matching relies on verified capabilities
- stale availability is visibly stale
- ABHA is optional
- district access is minimized
- offline operations are encrypted, idempotent, and reconcilable
- external integrations advertise actual mode: live/sandbox/simulated/unavailable
