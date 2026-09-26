# Project Task Plan
## SwasthyaSetu AI

## 1. Planning Approach

This plan sequences the MVP around the patient-continuity backbone. It does not assign calendar dates because the source definition does not provide team size, availability, or delivery deadline. Instead, tasks are dependency-ordered so the team can map them into sprints without pretending estimates are facts.

Priority:

- P0: blocks the end-to-end MVP
- P1: strengthens pilot readiness
- P2: future/production integration

Status values suggested for a tracker:

`BACKLOG | READY | IN_PROGRESS | BLOCKED | REVIEW | DONE`

## 2. Milestone 0 - Governance and Project Setup

### T-0001 [P0] Establish repository structure

**Output:** frontend, backend, shared contracts, infra, docs directories.

**Done when:** local dev setup is documented and reproducible.

### T-0002 [P0] Define environment strategy

**Output:** local, test, staging/demo, production configuration model.

**Done when:** secrets and environment variables are separated from source.

### T-0003 [P0] Create architecture decision log

Record decisions for PostgreSQL, deterministic safety, adapter boundaries, offline sync, and logical-service deployment.

### T-0004 [P0] Establish clinical-governance dependency

**Output:** named process for approving Safety Engine rule sets.

**Important:** engineering may build the rule framework with test/demo rules, but must not invent production clinical rules.

### T-0005 [P0] Define public-claim checklist

Create release checklist preventing claims of AI diagnosis, live 108 control, mandatory ABHA, guaranteed stock, or unapproved government integration.

## 3. Milestone 1 - Identity, RBAC, and Facility Foundation

### T-0101 [P0] Design identity schema

Entities: User, Role, Scope, Facility, Patient, CaregiverRelationship, Session.

Depends on: T-0001.

### T-0102 [P0] Implement patient OTP flow

- send OTP
- verify OTP
- create/find Patient ID
- session issuance
- logout/revocation

### T-0103 [P0] Implement staff authentication

Support role + facility/jurisdiction scope.

### T-0104 [P0] Implement authorization middleware/policy engine

Test every role against allowed/denied operations.

### T-0105 [P0] Build Facility master model

Include type, location, public identifier, hours, active status.

### T-0106 [P0] Build FacilityCapability model

Include capability code/type, status, source, verifier, last-verified timestamp.

### T-0107 [P1] Build Facility Admin capability editor

Prevent access to unrelated clinical data.

### T-0108 [P0] Add audit foundation

Capture actor, role, scope, action, entity, timestamp, correlation ID.

**Milestone exit:** users authenticate; role/scope checks work; facilities/capabilities can be seeded; audit trail exists.

## 4. Milestone 2 - Patient and Case Continuity Core

### T-0201 [P0] Implement Patient profile APIs

### T-0202 [P0] Implement caregiver relationship model

### T-0203 [P0] Implement PatientCase entity

Fields include case ID, patient ID, opened/closed timestamps, current status, outcome reference.

### T-0204 [P0] Implement assisted operator attribution

Every assisted mutation stores `operated_by` separately.

### T-0205 [P0] Implement case timeline projection

Aggregate domain events into a chronological case view.

### T-0206 [P0] Build patient dashboard skeleton

Active case first; modules may initially be placeholders.

### T-0207 [P0] Build frontline patient-selection/assisted-mode skeleton

**Milestone exit:** direct and assisted users can create/view a case with correct ownership.

## 5. Milestone 3 - Intake, Language, and AI Structuring

### T-0301 [P0] Define structured intake schema

Do not include authoritative diagnosis/prescription fields.

### T-0302 [P0] Implement text conversation capture

Store original messages and language metadata.

### T-0303 [P0] Implement AI structuring contract

Use schema-constrained responses and record model/prompt version.

### T-0304 [P0] Implement clarification-question loop

### T-0305 [P1] Implement Bhashini configuration adapter

Keep model/config discovery separate from compute endpoint handling.

### T-0306 [P1] Implement Bhashini ASR integration

### T-0307 [P1] Implement translation/TTS flows where valid

### T-0308 [P0] Add AI safety tests

Tests must prove AI output cannot directly write diagnosis, prescription, admission, or Safety Engine result.

**Milestone exit:** case can move from free-form text, and voice where configured, to structured facts plus clarification.

## 6. Milestone 4 - Deterministic Safety Engine

### T-0401 [P0] Define Safety Engine interface

Input: structured facts. Output: pathway + rule IDs + version + explanation.

### T-0402 [P0] Implement rules framework

Support versioned rule packages and deterministic evaluation.

### T-0403 [P0] Implement ROUTINE/SAME_DAY/EMERGENCY outputs

### T-0404 [P0] Add SafetyAssessment persistence

### T-0405 [P0] Add emergency-branch contract

EMERGENCY must bypass normal referral-response waiting.

### T-0406 [P0] Build comprehensive rules-engine test harness

Use test fixtures; keep production clinical approval separate.

### T-0407 [P1] Add signed/integrity-checked offline rule package format

**Milestone exit:** structured case data produces an explainable deterministic workflow pathway.

## 7. Milestone 5 - Capability Routing

### T-0501 [P0] Seed pilot facility data

Use explicitly test/demo data until field verification exists.

### T-0502 [P0] Implement required-capability representation

### T-0503 [P0] Implement facility candidate query

Filter on verified capability.

### T-0504 [P0] Implement routing ranking factors

Capability match first; distance/hours/freshness as configured.

### T-0505 [P1] Implement human-readable match explanation

### T-0506 [P0] Add tests proving no mandatory tier ladder

### T-0507 [P1] Add stale-capability warnings

**Milestone exit:** non-emergency case can be matched to a verified capable facility with explanation.

## 8. Milestone 6 - Referral State Machine and Receiving Facility

### T-0601 [P0] Design Referral and ReferralStateTransition schema

### T-0602 [P0] Implement transition validator

### T-0603 [P0] Implement referral creation API

Create Referral ID and QR/token.

### T-0604 [P0] Implement receiving-facility inbox

### T-0605 [P0] Implement ACCEPTED/DECLINED/REJECTED actions

Require reason for decline/reject where configured.

### T-0606 [P0] Implement EN_ROUTE action

Mark provenance as patient/operator self-report.

### T-0607 [P0] Implement QR/token arrival flow

### T-0608 [P0] Add explicit reassessment handoff state/action

### T-0609 [P0] Implement TREATED/ADMITTED/DISCHARGED transitions

Enforce clinical authorization where appropriate.

### T-0610 [P0] Implement alternate routing after decline/reject

### T-0611 [P1] Implement ONWARD_REFERRAL

### T-0612 [P1] Implement MISSED/CANCELLED policies

### T-0613 [P0] Add idempotency and concurrency tests

### T-0614 [P0] Add full transition audit tests

**Milestone exit:** complete referral loop can be demonstrated from issuance to arrival/treatment/closure, including rejection recovery.

## 9. Milestone 7 - Emergency Continuity

### T-0701 [P0] Create EmergencyEvent model

### T-0702 [P0] Implement emergency UI branch

Do not show routine acceptance waiting.

### T-0703 [P0] Implement manual/simulated 108 handoff record

Label simulation/manual mode.

### T-0704 [P0] Implement emergency-facility arrival continuation

### T-0705 [P0] Test that emergency route bypasses normal referral acceptance

### T-0706 [P2] Define authorized 108 adapter interface for future state integration

**Milestone exit:** emergency case remains continuous without claiming ambulance dispatch control.

## 10. Milestone 8 - Clinical, Medicine, and Diagnostic Modules

### T-0801 [P0] Implement clinician reassessment record

### T-0802 [P0] Implement clinical assessment permissions

### T-0803 [P0] Implement diagnosis/treatment record authorization

### T-0804 [P1] Implement admission and discharge records

### T-0805 [P1] Implement medicine catalog/availability model

### T-0806 [P1] Implement last-verified medicine status

### T-0807 [P1] Implement dispensing event

### T-0808 [P1] Implement DiagnosticOrder lifecycle

### T-0809 [P1] Implement DiagnosticResult metadata/file handling

### T-0810 [P0] Ensure AI summary is clearly non-authoritative until clinician action

**Milestone exit:** facility can continue the same case through reassessment, treatment records, medicines, diagnostics, and discharge.

## 11. Milestone 9 - Follow-Up and Notifications

### T-0901 [P0] Implement FollowUpTask model

### T-0902 [P0] Implement patient follow-up view

### T-0903 [P0] Implement frontline assigned follow-up list

### T-0904 [P0] Implement completion by patient/authorized worker

### T-0905 [P0] Implement overdue/missed policy

### T-0906 [P0] Implement missed-follow-up escalation

### T-0907 [P1] Implement notification service

### T-0908 [P1] Add privacy-safe notification templates

**Milestone exit:** discharge/treatment can create follow-up, completion is tracked, and missed tasks escalate.

## 12. Milestone 10 - Offline-First Client and Sync

### T-1001 [P0] Select encrypted local storage approach for PWA/device targets

### T-1002 [P0] Define offline data boundary

Document exactly which data can be cached.

### T-1003 [P0] Implement local operation queue

### T-1004 [P0] Implement stable operation IDs/idempotency keys

### T-1005 [P0] Implement sync API

### T-1006 [P0] Implement server-side validation/reconciliation

### T-1007 [P1] Implement conflict UI/workflow

### T-1008 [P0] Cache approved Safety Engine rule package

### T-1009 [P0] Test reconnect/replay after long offline session

### T-1010 [P0] Test duplicate/reordered operations

### T-1011 [P0] Test lost-device/local-cache security assumptions

**Milestone exit:** supported patient/frontline flows survive network loss and reconcile safely.

## 13. Milestone 11 - District Dashboard and Operational Monitoring

### T-1101 [P1] Build referral funnel aggregates

### T-1102 [P1] Build unresolved referral alerts

### T-1103 [P1] Build rejection/decline reason view

### T-1104 [P1] Build missed follow-up view

### T-1105 [P1] Build stale capability/medicine/diagnostic view

### T-1106 [P0] Verify minimum-necessary district data exposure

### T-1107 [P1] Add system health dashboard

Include sync errors, adapter errors, transition failures.

## 14. Milestone 12 - External Adapters

### T-1201 [P1] Harden Bhashini adapter

- config cache
- language-pair validation
- bounded retry
- timeout/fallback

### T-1202 [P1] Implement optional ABHA sandbox/stub link flow

Must not gate care.

### T-1203 [P2] Define ABDM HIP/HIU production adapter contracts

Do not enable until official roles/approval, FHIR, consent, encryption, webhook, and reconciliation are implemented.

### T-1204 [P2] Define eSanjeevani integration adapter

### T-1205 [P2] Define state-specific 108 integration adapter

### T-1206 [P0] Add integration-mode labels

Every external integration displays one of: LIVE, SANDBOX, SIMULATED, UNAVAILABLE.

## 15. Milestone 13 - Security, QA, and Release Hardening

### T-1301 [P0] Threat model

Cover identity, RBAC, offline device loss, referral tampering, identity linking, file access, and adapter secrets.

### T-1302 [P0] Object-level authorization test suite

### T-1303 [P0] Audit completeness review

### T-1304 [P0] Data minimization review

### T-1305 [P1] Performance/load test baseline

Set explicit targets during pilot planning.

### T-1306 [P1] Backup/restore test

### T-1307 [P1] Failure-injection tests

- DB retry-safe behavior
- Bhashini unavailable
- notification failure
- sync conflict
- facility decline
- stale capability

### T-1308 [P0] End-to-end journey tests

Run direct, assisted, emergency, rejection-reroute, and offline scenarios.

### T-1309 [P0] Public/demo claim audit

Verify UI, deck, README, screenshots, and scripts match actual capabilities.

## 16. Milestone 14 - Pilot Validation Preparation

### T-1401 [P1] Define facility capability verification SOP

### T-1402 [P1] Define referral operational ownership SOP

### T-1403 [P1] Define district alert response SOP

### T-1404 [P1] Prepare field-observation instruments

Measure:

- referral completion
- missed referral detection
- follow-up completion
- time to appropriate facility
- facility-hop reduction
- language usability
- frontline workflow burden

### T-1405 [P1] Define baseline vs post-pilot measurement plan

Do not publish impact percentages before data exists.

## 17. Critical Dependency Graph

```text
Identity/RBAC
   -> Patient/Case
      -> Intake/AI
         -> Safety Engine
            -> Capability Registry/Router
               -> Referral State Machine
                  -> Clinical/Medicine/Diagnostics
                     -> Follow-Up

Offline Sync depends on stable domain contracts across all above.
District Dashboard depends on reliable event/state data.
External integrations must not block the core chain.
```

## 18. Recommended Workstreams

If the team has enough people, parallelize by boundary:

### Workstream A - Core platform

Auth, RBAC, Patient, Case, Audit, database.

### Workstream B - Decision and navigation

Intake, AI structuring, Safety Engine framework, Facility Registry, Routing.

### Workstream C - Continuity workflows

Referral, receiving-facility, emergency, clinical, medicine, diagnostics, follow-up.

### Workstream D - Client/offline

Patient PWA, frontline PWA, local storage, sync.

### Workstream E - Integrations/operations

Bhashini, sandbox adapters, notifications, reporting, observability.

Workstreams should integrate continuously around the same end-to-end case fixtures rather than postponing integration until the final demonstration phase.

## 19. First End-to-End Vertical Slice

Build this before feature breadth:

1. patient OTP login
2. patient/case creation
3. text symptom intake
4. structured AI output
5. deterministic test Safety Engine
6. seeded facility capability lookup
7. referral creation
8. receiving facility acceptance
9. patient en route
10. facility arrival
11. clinician reassessment record
12. treatment complete
13. follow-up task
14. case complete
15. audit trail visible

Once this works, add voice, offline, medicine, diagnostics, dashboards, and external adapters without breaking the core continuity path.

## 20. Release Definition

### Demo Release

- uses test/synthetic patient data
- external government integrations clearly labelled sandbox/simulated/unavailable
- end-to-end case continuity works
- no unsafe AI claims

### Pilot Candidate

Adds:

- clinically approved safety rules
- verified facility data
- security hardening
- operational SOPs
- offline resilience
- measured observability
- privacy/compliance review

### Production Candidate

Adds:

- formal deployment governance
- disaster recovery
- performance SLOs
- approved data-retention policy
- authorized government integrations where applicable
- field-validated operating model

## 21. Definition of Done for the Whole MVP

The MVP is done only when the team can demonstrate the complete path from first patient contact to outcome closure with correct role permissions, referral-state integrity, emergency separation, facility-capability reasoning, follow-up continuity, auditability, and honest integration status.

A chatbot plus a map is not the project. The project is the continuity loop.
