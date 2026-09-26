# Business Requirements Document (BRD)
## SwasthyaSetu AI

## 1. Purpose

This BRD defines the business problem, objectives, scope, stakeholders, operating rules, measurable outcomes, and acceptance conditions for SwasthyaSetu AI.

The project is a healthcare orchestration and continuity layer for rural and underserved public-health journeys in India. It is intentionally designed to work alongside public facilities, frontline workers, 108/MEMS, eSanjeevani, and ABDM rather than replace them.

## 2. Business Problem

Patients can move through multiple public-health touchpoints without a single continuous, digitally tracked journey. This creates avoidable failures such as:

- uncertainty about which facility has the required capability
- referral drop-off after a paper referral is issued
- receiving facilities starting with little advance context
- limited visibility into medicine and diagnostic availability
- missed follow-ups without systematic escalation
- exclusion caused by language, literacy, device, and connectivity barriers
- repeated data entry by frontline workers
- weak district-level visibility into referral outcomes

## 3. Business Vision

Create a patient-centred continuity layer that connects the care journey from first contact to outcome while preserving existing clinical and government-system authority.

The intended public value is:

**Right patient. Right facility. Right time. No patient lost after referral.**

## 4. Business Objectives

### BO-01: Improve referral continuity

Digitally track every referral from issuance through receiving-facility response, patient travel, arrival, reassessment, treatment, follow-up, and closure.

### BO-02: Reduce avoidable facility hopping

Route by verified capability rather than forcing a fixed Sub-Centre -> PHC -> RH/CHC -> SDH -> DH sequence.

### BO-03: Support safe first contact

Enable multilingual voice/text intake while keeping clinical decisions outside the AI layer.

### BO-04: Preserve emergency priority

Ensure emergency cases branch immediately to the 108/MEMS pathway and do not wait for routine referral acceptance.

### BO-05: Include digitally constrained users

Support direct and assisted workflows plus offline-capable core functionality.

### BO-06: Improve operational visibility

Give facilities and district administrators timely visibility into referral bottlenecks, follow-up gaps, capability gaps, and stale operational information.

### BO-07: Preserve public-system boundaries

Treat ABDM/ABHA, eSanjeevani, and 108/MEMS as external systems with explicit integration boundaries.

## 5. Stakeholders

| Stakeholder | Primary interest |
|---|---|
| Patient | Safe navigation, continuity, status visibility, follow-up |
| Caregiver | Authorized support for patient journey |
| ASHA | Assisted intake, outreach, referral support, follow-up |
| ANM | Maternal/child workflows, measurements, referral support, follow-up |
| MPW | Field surveillance and offline data capture |
| CHO | Local clinical review, referral initiation, eSanjeevani handoff where authorized |
| Doctor / Medical Officer | Clinical assessment, treatment, prescription, referral, admission/discharge |
| Specialist | Advanced clinical management and onward referral |
| Receiving Facility Staff | Referral response, arrival confirmation, operational handoff |
| Pharmacy / Store | Stock verification and dispensing events |
| Facility Admin | Facility capability and operational configuration |
| District Admin / DHO | Aggregate operational oversight |
| Health authority | Governance, integration approval, compliance, scale |

## 6. Business Scope

### 6.1 In scope for MVP

- patient and staff authentication
- role/facility/jurisdiction access control
- patient profile and durable patient ID
- case creation and longitudinal case timeline
- direct and assisted workflows
- multilingual voice/text intake
- AI structuring and clarification
- deterministic safety-pathway classification
- facility capability registry
- capability-based routing
- referral state machine with QR/token
- receiving-facility workflow
- emergency case-continuity workflow with simulated 108 handoff
- medicine availability/dispensing tracking
- diagnostic order/status/result tracking
- follow-up reminders and escalation
- offline local capture and synchronization
- district operational dashboard
- audit logs
- optional sandbox ABHA linkage

### 6.2 Out of scope for MVP

- autonomous diagnosis or prescribing
- automated clinical admission decisions
- control of ambulance dispatch
- guaranteed live bed/medicine/diagnostic/appointment availability
- mandatory ABHA login
- production ABDM HIP/HIU exchange
- production eSanjeevani integration
- blockchain referral ledger
- federated-learning triage model

## 7. Business Rules

### BR-001 Patient ownership

Every case belongs to the patient even when a frontline worker operates the device.

### BR-002 Clinical authority

Only authorized clinical roles may diagnose, prescribe, decide treatment, admission, discharge, or clinical referral.

### BR-003 AI boundary

AI may structure and summarize data but may not independently diagnose, prescribe, or determine clinical urgency.

### BR-004 Deterministic safety

Routine/same-day/emergency pathway selection must be performed by a deterministic, versioned rule engine.

### BR-005 Capability routing

Facility selection must be based on verified capability and context, not tier or distance alone.

### BR-006 Emergency priority

Emergency cases bypass normal referral-acceptance waiting and proceed through 108/MEMS coordination.

### BR-007 Referral continuity

Referral rejection/decline must record a reason and continue into alternate-routing logic where applicable.

### BR-008 Reassessment

Receiving-facility acceptance is operational acknowledgement only. The receiving clinical team must reassess the patient.

### BR-009 Optional ABHA

ABHA must never be required to register, triage, refer, treat, or follow up a patient in the SwasthyaSetu workflow.

### BR-010 Last-verified information

Medicine, diagnostic, appointment, and facility availability must show a last-verified timestamp unless backed by a genuinely live source.

### BR-011 Minimum-necessary access

Users may access only the information required by their role and scope.

### BR-012 Offline safety

Offline clients must store sensitive data in encrypted local storage and synchronize through a controlled queue.

## 8. Business Process Requirements

### BPR-01 Intake to pathway

The system shall support voice/text intake, structured information extraction, clarification, and deterministic pathway assignment.

### BPR-02 Capability matching

The system shall identify facilities capable of meeting the required service/diagnostic/clinical need.

### BPR-03 Referral lifecycle

The system shall track referral states with actor, timestamp, reason, destination, and next action.

### BPR-04 Receiving handoff

The receiving facility shall be able to review referral context, respond, confirm arrival, and transition the case into local clinical workflow.

### BPR-05 Continuity

All case events shall be visible as one longitudinal patient-case timeline subject to role permissions.

### BPR-06 Follow-up

The system shall generate follow-up tasks and escalate missed follow-ups to authorized frontline roles.

### BPR-07 Oversight

District-level users shall receive aggregate operational visibility without unnecessary clinical detail.

## 9. Success Metrics

The business shall measure:

- referral issued-to-arrived conversion
- referral arrived-to-treated conversion
- completed referral percentage
- rejected/declined referral percentage and reasons
- alternate-routing success after rejection/decline
- missed-referral detection time
- follow-up completion rate
- time from intake to arrival at an appropriate facility
- cases resolved at the lowest verified capable tier
- stale capability and medicine/diagnostic information rate
- offline sync completion and conflict rate

No target percentage is asserted in the source definition; numeric success thresholds must be agreed during pilot planning and field validation.

## 10. Key Assumptions Requiring Validation

- seeded facility capability data can be maintained with sufficient accuracy for pilot routing
- frontline staff can fit assisted workflows into real field practice
- Bhashini performance is usable across the target languages and dialects
- referral-response ownership is operationally accepted by participating facilities
- patients and workers understand the distinction between last-verified and guaranteed availability
- district teams have an agreed operating process for alerts and unresolved referrals

## 11. Dependencies

- facility master data and capability verification
- clinically approved deterministic safety rule catalog
- Bhashini credentials/configuration
- OTP delivery provider
- participating facility workflows and staffing
- security and compliance review
- official approval for any real ABDM/eSanjeevani/108 integration

## 12. Business Risks

| Risk | Impact | Required response |
|---|---|---|
| Stale facility capability data | Patient routed to unavailable service | Verification workflow, freshness status, fallback routing |
| Incorrect identity linking | Patient-safety/privacy issue | Conservative matching, audit, human verification |
| AI overreach | Unsafe clinical interpretation | Hard architectural boundary and constrained outputs |
| Unapproved clinical safety rules | Unsafe pathway selection | Clinical governance before production |
| Poor offline conflict handling | Duplicate/inconsistent case state | Idempotency, versioning, reconciliation |
| Referral alerts without operational owner | Dashboard becomes passive | Named escalation ownership and SOPs |
| External integration assumptions | Misleading demo/production claims | Adapter flags, simulated status, explicit integration labels |

## 13. MVP Business Acceptance Criteria

The MVP is acceptable when all of the following can be demonstrated with test data:

1. A patient can start a case directly or via an authorized assisted operator.
2. The case remains owned by the patient, with operator attribution recorded separately.
3. Voice/text intake produces structured case information without presenting an AI diagnosis.
4. The deterministic Safety Engine selects routine, same-day, or emergency workflow.
5. Non-emergency cases are matched to a seeded facility with an explicit required capability.
6. A referral can be issued, accepted/declined, marked en route, arrived, reassessed, treated, and closed.
7. A rejected/declined referral can continue to alternate routing.
8. Emergency flow bypasses routine acceptance and records simulated 108/MEMS handoff.
9. Medicine and diagnostic status can be linked to the case with freshness information.
10. Follow-up can be scheduled, completed, missed, and escalated.
11. RBAC prevents unauthorized role access.
12. Core patient/frontline flows can be captured offline and synchronized later.
13. Audit records exist for security-sensitive and state-transition events.
14. ABHA remains optional.
15. Public/demo screens do not claim live government integration where none exists.

## 14. Production Readiness Gates

MVP completion does not imply production readiness. Production requires additional gates:

- approved clinical rule governance
- privacy/security threat assessment
- penetration testing
- disaster recovery and backup verification
- production observability and incident response
- formal facility-capability ownership process
- consent and data-retention policy approval
- accessibility and language field testing
- load/performance testing
- government integration approval and credentials where applicable
- field pilot and measured validation of claimed outcomes
