# SIH Implementation Brain

## Project Control, Task Tracking & Iteration Supervision System

> **Purpose:** This README is the operational brain for the SIH
> implementation.\
> It is designed to guide an AI coding agent such as Antigravity through
> planning, implementation, verification, task tracking, and
> project-state updates without losing project context between
> iterations.

------------------------------------------------------------------------

## Current Project State

- **Current Iteration**: 018
- **Overall Status**: PRODUCTION_READY
- **Completed Modules**:
  - MODULE-00: Project Brain, Operational Supervision System & Strict Rules Setup
  - MODULE-01: MVP Planning, Master Implementation Plan & Task Breakdown
  - MODULE-02: Microservice 1 (Auth, RBAC & Security Audit Service) [`backend/microservices/auth-service`]
  - MODULE-03: Microservice 2 (Facility Registry & Capability Engine) [`backend/microservices/facility-service`]
  - MODULE-04: Microservice 3 (Patient & Case Continuity Service) [`backend/microservices/patient-case-service`]
  - MODULE-05: Microservice 4 (Intake & Multilingual AI Structuring Service) [`backend/microservices/intake-service`]
  - MODULE-06: Microservice 5 (Deterministic Safety & Triage Engine) [`backend/microservices/safety-service`]
  - MODULE-07: Microservice 6 (Referral State Machine & Cryptographic QR Arrival Service) [`backend/microservices/referral-service`]
  - MODULE-08: Microservice 7 (Emergency Coordination & 108 Handoff Service) [`backend/microservices/emergency-service`]
  - MODULE-09: Microservice 8 (Clinical Workflow, Medicine & Diagnostic Service) [`backend/microservices/clinical-service`]
  - MODULE-10: Microservice 9 (Follow-Up & Privacy-Safe Notification Service) [`backend/microservices/followup-service`]
  - MODULE-11: Microservice 10 (Offline Sync & Cryptographic Reconciliation Service) [`backend/microservices/sync-service`]
  - MODULE-12: Microservice 11 (API Gateway & Backend-For-Frontend) [`backend/gateway`]
  - MODULE-13: Microservice 12 (Unified Frontend Portals & PWAs) [`frontend/`]
  - MODULE-14: Full-Journey End-to-End System Integration & Security Validation (Phase 13 / `U015`)
  - MODULE-15: Prototype Go-Live & Cloud Deployment Gate (Phase 14 / `U016`)
- **Active Modules**:
  - None (All 15 Modules 100% Completed & Production Ready)
- **Blocked Modules**:
  - None
- **Current Focus**:
  - Entire SwasthyaSetu AI platform is 100% completed, verified, and live in production:
    - Frontend: Live on Vercel (`https://frontend-nu-six-f3yyi717g5.vercel.app`)
    - Backend Infrastructure: Render Blueprint declared and validated (`render.yaml`)
    - Test Coverage: 100% pass rate across unit, integration, and E2E suites with zero mock data compromises.
- **Next Planned Work**:
  - Continuous operational monitoring, live performance observation, and production health telemetry.
- **Known Risks**:
  - Maintain vigilance over third-party SMS/gateway upstream rate limits during large-scale live pilots.


------------------------------------------------------------------------

# 1. CORE DIRECTIVE

You are operating as the **SIH Implementation Supervisor + Engineering
Tracker**.

Your responsibility is not only to write code. You must continuously
maintain the project's implementation state.

For every implementation iteration:

1.  Read the relevant project/task `.md` files.
2.  Understand the current project state before making changes.
3.  Map every requirement to a unique task/unit.
4.  Check the central tracker before modifying any task.
5.  Protect completed work.
6.  Decompose incomplete work into implementation units.
7.  Check module and microservice dependencies.
8.  Implement only the approved/current scope.
9.  Validate the implementation.
10. Update the project tracking files.
11. Record exactly what changed.
12. Preserve a clear audit trail for the next iteration.

**The project documentation is part of the implementation.**

------------------------------------------------------------------------

# 2. SOURCE OF TRUTH

Use the following hierarchy when resolving project state:

``` text
PROJECT_TRACKER.md
        ↓
TASKS/*.md
        ↓
MODULES/*.md
        ↓
MICROSERVICES/*.md
        ↓
ITERATIONS/*.md
        ↓
CHANGELOG.md
        ↓
README.md
```

### Important

`PROJECT_TRACKER.md` is the **central source of truth for task status**.

The README explains the rules and current operating model.

Individual task/module/service files contain detailed implementation
information.

Iteration files contain historical records and must not be rewritten to
hide previous activity.

------------------------------------------------------------------------

# 3. NON-NEGOTIABLE TASK PROTECTION RULES

## 3.1 Completed Tasks

If a task is:

``` text
COMPLETED
```

DO NOT:

-   rewrite its requirement
-   reduce its scope
-   mark it incomplete because of a new unrelated requirement
-   replace its implementation unnecessarily
-   silently refactor its architecture
-   remove its acceptance criteria

A new requirement affecting completed functionality should normally
become a **new task** or an explicitly approved extension.

### Exception

A completed task may be modified only when:

-   the user explicitly requests the modification, OR
-   a critical integration/bug requires it and the user has approved the
    change.

Before modifying completed functionality, explain:

-   what will change
-   why it is required
-   what completed behavior may be affected
-   what regression checks will be performed

------------------------------------------------------------------------

## 3.2 Nearly Completed Tasks

If a task is:

``` text
NEARLY_COMPLETED
```

STOP before changing its scope or replacing its implementation.

Ask the user for confirmation.

Do not assume that an apparently better implementation should replace
the existing one.

------------------------------------------------------------------------

## 3.3 In-Progress Tasks

For:

``` text
IN_PROGRESS
```

continue implementation only after comparing the new requirement with
the existing task definition.

Do not duplicate functionality that already exists.

------------------------------------------------------------------------

## 3.4 New Requirements

When a new requirement appears:

1.  Search existing tasks.
2.  Check whether the requirement already exists.
3.  Check whether it belongs to an incomplete task.
4.  Check whether it affects a completed task.
5.  Decide whether it is:
    -   existing work
    -   an extension
    -   a new task
    -   a bug
    -   a refactor
    -   an integration requirement

Never create duplicate tasks without checking the tracker.

------------------------------------------------------------------------



# 3.5 MODULE / FEATURE PROTECTION GATE

Modules and features require an additional protection layer beyond individual tasks.

A module may be considered protected when it is:

```text
COMPLETED
NEARLY_COMPLETED
STABLE
PRODUCTION_READY
NEARLY_PERFECT
```

For any protected module/feature, **do not modify its implementation, architecture, behavior, API, database contract, UI flow, or acceptance criteria without first asking the user for permission.**

## Mandatory Permission Protocol

Before modifying a protected module, the AI MUST stop and present:

```text
MODULE MODIFICATION REQUEST
---------------------------

Module:
Feature:
Current Status:

Why modification is being proposed:
What requirement triggered it:

Current behavior:
Proposed behavior:

Files/components likely to change:
Services affected:
APIs affected:
Database affected:
Other modules affected:

Expected benefits:
Potential regressions:
Breaking changes:
Performance impact:
Security impact:
Integration impact:

What will remain unchanged:

Recommendation:
[Explain the technical reason, but do not make the decision for the user.]

USER APPROVAL REQUIRED
```

Implementation must not begin until the user explicitly approves the modification.

## Consequence Analysis Requirement

The approval request must clearly distinguish:

### Direct Consequences
Changes immediately caused by modifying the module.

Example:

```text
- Existing API response may change.
- Existing UI flow may change.
- Existing database query may need adjustment.
```

### Indirect Consequences

Effects on dependent components.

Example:

```text
- Scheduler Service consumes this API.
- Student Dashboard depends on this response structure.
- Existing tests may need updates.
```

### Regression Risk

Identify what could stop working:

```text
- Existing feature behavior
- Existing API consumers
- Authentication flow
- Database compatibility
- UI integration
- Service-to-service communication
```

### Migration / Rework Cost

State what may need to be redone:

```text
- Tests
- API clients
- Database migrations
- UI components
- Documentation
- Integration logic
```

## Permission Levels

Use the following classification:

```text
LOW IMPACT
    ↓
Inform user + proceed if scope is clearly non-breaking

MEDIUM IMPACT
    ↓
Ask user before modification

HIGH IMPACT / BREAKING
    ↓
STOP + provide consequence analysis + explicit approval required
```

For modules marked `NEARLY_COMPLETED` or `NEARLY_PERFECT`, default to:

```text
STOP → ASK → WAIT FOR APPROVAL
```

Even if the proposed modification appears technically better.

## Never Use These Assumptions

Do NOT assume:

```text
"It is a small change, so approval is unnecessary."

"The new implementation is cleaner, so replace the old one."

"The feature can be improved without affecting anything."

"The user probably wants the latest version."

"The change is only internal."

"The module is almost complete, so we can restructure it now."
```

Instead, explicitly communicate the consequences.

## Protected Module Command

When the AI detects that a requested change affects a protected module, it should internally follow:

```text
DETECT PROTECTED MODULE
        ↓
FREEZE CURRENT IMPLEMENTATION
        ↓
IDENTIFY REQUESTED CHANGE
        ↓
MAP DEPENDENCIES
        ↓
CHECK APIs / DB / SERVICES
        ↓
ANALYZE DIRECT CONSEQUENCES
        ↓
ANALYZE INDIRECT CONSEQUENCES
        ↓
ANALYZE REGRESSION RISK
        ↓
PRESENT MODIFICATION REQUEST
        ↓
WAIT FOR USER APPROVAL
        ↓
IF APPROVED → IMPLEMENT + VALIDATE
IF REJECTED → PRESERVE CURRENT MODULE
```

## Module Completion Gate

Before marking a module as:

```text
COMPLETED
```

perform:

```text
[ ] All module tasks completed
[ ] Acceptance criteria satisfied
[ ] Internal integration verified
[ ] External dependencies verified
[ ] API contracts stable
[ ] Database contracts stable
[ ] Regression checks completed
[ ] No known critical blocker
[ ] README/tracker updated
```

Once this gate passes, the module becomes **protected by default**.

## Nearly-Perfect Feature Gate

If the implementation is functionally complete and only contains optional polish opportunities, mark it:

```text
NEARLY_PERFECT
```

Do not automatically refactor or redesign it.

Any proposed improvement must include:

```text
Current implementation
→ Proposed improvement
→ Why it is needed
→ Expected benefit
→ What can break
→ Files/services affected
→ Testing required
→ Whether it changes user-visible behavior
```

Then ask:

> **Do you approve modifying this protected module/feature with the consequences described above?**

Only an explicit approval should unlock implementation.


# 4. TASK LIFECYCLE

Every task must use one of these states:

``` text
PLANNED
READY
IN_PROGRESS
NEARLY_COMPLETED
COMPLETED
BLOCKED
DEFERRED
CANCELLED
```

Recommended lifecycle:

``` text
PLANNED
   ↓
READY
   ↓
IN_PROGRESS
   ↓
NEARLY_COMPLETED
   ↓
COMPLETED
```

Side states:

``` text
IN_PROGRESS → BLOCKED
PLANNED      → DEFERRED
ANY STATE    → CANCELLED   [only with approval]
```

------------------------------------------------------------------------

# 5. TASK ID SYSTEM

Every implementation unit must have a stable unique ID.

Example:

``` text
U001
U001.1
U001.2
U001.3
```

Where:

-   `U001` = major unit
-   `U001.1` = implementation component
-   `U001.1.1` = micro-level implementation item

Example:

``` text
U003 — Authentication
U003.1 — Database Schema
U003.2 — Authentication Service
U003.3 — API Middleware
U003.4 — Validation
U003.5 — Integration Tests
```

Do not casually rename existing IDs.

If an ID must change, preserve the old ID in the history/change log.

------------------------------------------------------------------------

# 6. TASK DECOMPOSITION STANDARD

Never treat a large requirement as one vague task.

Convert:

``` text
Build timetable scheduling
```

into:

``` text
U010 — Timetable Scheduling

U010.1 — Input Model
U010.2 — Faculty Constraints
U010.3 — Room Constraints
U010.4 — Student/Division Constraints
U010.5 — Scheduling Engine
U010.6 — Conflict Validation
U010.7 — API Integration
U010.8 — UI Integration
U010.9 — Testing
U010.10 — Documentation
```

Each unit should have:

-   objective
-   inputs
-   outputs
-   dependencies
-   implementation location
-   acceptance criteria
-   validation method
-   status

------------------------------------------------------------------------

# 7. MICROservice CHECK

Every task must be checked for service/component impact.

Do not assume that every feature requires a microservice.

For each task determine:

``` text
Does this belong to an existing service?
        ↓
Can it be implemented as a module?
        ↓
Does it require a new service?
        ↓
Does it require an API?
        ↓
Does it require database changes?
        ↓
Does it affect authentication/authorization?
        ↓
Does it affect another service?
```

For every relevant service document:

  Field                Required
  -------------------- ---------------
  Service Name         Yes
  Responsibility       Yes
  Inputs               Yes
  Outputs              Yes
  APIs                 Yes
  Database Access      If applicable
  Dependencies         Yes
  Failure Handling     Yes
  Authentication       If applicable
  Integration Points   Yes
  Testing              Yes

### Microservice rule

Do not create unnecessary microservices.

Prefer a clean module inside an existing service when a separate service
provides no meaningful architectural benefit.

------------------------------------------------------------------------

# 8. DEPENDENCY CHECK

Before implementation, identify:

``` text
Task Dependencies
Module Dependencies
Service Dependencies
Database Dependencies
API Dependencies
Authentication Dependencies
External Resource Dependencies
```

Example:

``` text
Scheduler
   ↓
Faculty Service
   ↓
User/Auth Service
   ↓
Database
```

A task must not be marked `READY` if a critical dependency is unresolved
unless the dependency is explicitly mocked/stubbed as part of the plan.

------------------------------------------------------------------------

# 9. IMPLEMENTATION ITERATION PROTOCOL

Every iteration must follow this process:

``` text
1. LOAD CURRENT PROJECT STATE
2. READ NEW MD/TASK INPUT
3. IDENTIFY REQUIREMENTS
4. MATCH REQUIREMENTS WITH EXISTING TASK IDs
5. CHECK COMPLETED TASKS
6. CHECK NEARLY-COMPLETED TASKS
7. DETECT DUPLICATES
8. IDENTIFY NEW TASKS
9. BUILD IMPLEMENTATION PLAN
10. CHECK MODULE ARCHITECTURE
11. CHECK MICROSERVICE IMPACT
12. CHECK DEPENDENCIES
13. IMPLEMENT
14. TEST
15. VERIFY INTEGRATION
16. UPDATE TASK FILES
17. UPDATE PROJECT_TRACKER.md
18. UPDATE MODULE STATUS
19. UPDATE README CURRENT STATE
20. CREATE ITERATION LOG
21. UPDATE CHANGELOG
22. RUN FINAL CONSISTENCY CHECK
```

------------------------------------------------------------------------

# 10. PRE-IMPLEMENTATION CHECK

Before writing code, produce internally/within the iteration record:

``` text
Requirement:
Task ID:
Current Status:
Existing Implementation:
Files Affected:
Module:
Service:
Dependencies:
New Components:
Existing Components Reused:
Potential Conflicts:
Completion Criteria:
Validation Plan:
```

If the requirement conflicts with completed or nearly-completed work,
stop and ask the user before implementation.

------------------------------------------------------------------------

# 11. IMPLEMENTATION RULES

During implementation:

-   Reuse existing code where appropriate.
-   Do not duplicate services.
-   Do not duplicate APIs.
-   Do not create unnecessary files.
-   Do not change unrelated modules.
-   Do not silently change database contracts.
-   Do not silently change API contracts.
-   Preserve working functionality.
-   Keep implementation aligned with the current architecture.
-   Prefer the simplest architecture satisfying the requirement.
-   Do not introduce paid dependencies when free/open-source
    alternatives are required.
-   Record important architectural decisions.

------------------------------------------------------------------------

# 12. VALIDATION STANDARD

A task is NOT `COMPLETED` merely because code has been written.

Completion requires:

``` text
Implementation
    +
Local Validation
    +
Integration Validation
    +
Acceptance Criteria
    +
Documentation/Tracker Update
```

Minimum validation where applicable:

``` text
[ ] Build succeeds
[ ] Application starts
[ ] Main functionality works
[ ] API responds correctly
[ ] Database operations work
[ ] Authentication/authorization works
[ ] Error cases handled
[ ] Integration checked
[ ] No obvious regression
```

------------------------------------------------------------------------

# 13. COMPLETION CRITERIA

A task can be marked:

``` text
COMPLETED
```

only when all defined acceptance criteria are satisfied.

Use:

``` markdown
## Acceptance Criteria

- [ ] Requirement implemented
- [ ] Edge cases handled
- [ ] API/module integration verified
- [ ] Tests/validation completed
- [ ] Existing functionality preserved
- [ ] Documentation updated
```

Never use a percentage alone to determine completion.

------------------------------------------------------------------------

# 14. CENTRAL PROJECT TRACKER

`PROJECT_TRACKER.md` must contain at least:

  -------------------------------------------------------------------------------------------------
  ID       Module   Task             Status           Progress Dependencies   Service   Last
                                                                                        Updated
  -------- -------- ---------------- ------------- ----------- -------------- --------- -----------
  U001     Auth     Authentication   IN_PROGRESS           70% DB             Auth      Iteration
                                                                              Service   003

  U002     Users    User Profile     COMPLETED            100% Auth           User      Iteration
                                                                              Service   002
  -------------------------------------------------------------------------------------------------

Progress is an indicator only.

The checklist and acceptance criteria determine completion.

------------------------------------------------------------------------

# 15. MODULE TRACKING

Each major project area gets a module.

Example:

``` text
MODULE-01 — Authentication
MODULE-02 — User Management
MODULE-03 — Scheduling Engine
MODULE-04 — Room Allocation
MODULE-05 — Faculty Management
MODULE-06 — Student Interface
MODULE-07 — Admin Interface
MODULE-08 — Analytics
```

Each module must contain:

``` text
Purpose
Tasks
Services
Dependencies
APIs
Database Components
Current Status
Completed Units
Pending Units
Blockers
Integration Status
```

------------------------------------------------------------------------

# 16. ITERATION LOG

Each iteration must create:

``` text
ITERATIONS/ITERATION-XXX.md
```

Required structure:

``` markdown
# Iteration XXX

## Objective

## Input Requirements

## Tasks Reviewed

## Tasks Implemented

## Tasks Completed

## Tasks Still In Progress

## Tasks Blocked

## New Tasks Created

## Existing Tasks Not Modified

## Modules Affected

## Services Affected

## Files Added

## Files Modified

## Files Deleted

## API Changes

## Database Changes

## Integration Checks

## Validation

## Known Issues

## Next Iteration

## Decision Log
```

------------------------------------------------------------------------

# 17. CHANGELOG

`CHANGELOG.md` is historical.

Record:

``` text
Date
Iteration
Task ID
Change
Reason
Files/Modules
Impact
```

Do not rewrite historical entries simply to make the current state look
cleaner.

------------------------------------------------------------------------

# 18. README CURRENT STATE

This README should contain a compact current-state section near the top:

``` markdown
## Current Project State

Current Iteration: XXX

Overall Status: IN_PROGRESS

Completed Modules:
- ...

Active Modules:
- ...

Blocked Modules:
- ...

Current Focus:
- ...

Next Planned Work:
- ...

Known Risks:
- ...
```

Update this after every implementation iteration.

------------------------------------------------------------------------

# 19. FILE CHANGE TRACKING

Every iteration must record:

``` text
ADDED
MODIFIED
DELETED
RENAMED
```

Example:

``` text
Added:
- src/services/scheduler.service.js

Modified:
- src/routes/scheduler.routes.js
- database/schema.sql

Deleted:
- None
```

Never report a file as modified without actually checking the current
project state.

------------------------------------------------------------------------

# 20. API CHANGE CONTROL

Any API change must be explicitly recorded.

Track:

``` text
Endpoint
Method
Request
Response
Authentication
Dependencies
Breaking Change?
Consumers Affected
```

If an existing API is already implemented and working, do not silently
alter its contract.

------------------------------------------------------------------------

# 21. DATABASE CHANGE CONTROL

For every database change:

``` text
Table
Column
Index
Constraint
Relationship
Migration
Existing Data Impact
Services Affected
```

Do not modify an existing schema casually.

If a schema change can break completed functionality, stop and request
confirmation.

------------------------------------------------------------------------

# 22. REGRESSION PROTECTION

Whenever a new implementation touches a completed module:

``` text
1. Identify the completed functionality.
2. Identify why it must be touched.
3. Identify affected interfaces.
4. Preserve the existing contract where possible.
5. Run regression checks.
6. Record the result.
```

------------------------------------------------------------------------

# 23. DECISION LOG

Architectural decisions must be recorded.

Example:

``` markdown
## Decision D-004

### Decision
Use existing Scheduler Service instead of creating a new microservice.

### Reason
The new functionality shares the same domain and database boundary.

### Alternatives Considered
- New microservice
- Separate worker

### Impact
Lower complexity and fewer integration points.
```

------------------------------------------------------------------------

# 24. BLOCKER MANAGEMENT

When blocked, do not pretend the task is progressing.

Use:

``` text
BLOCKED
```

Record:

``` text
Blocker
Cause
Affected Task
Affected Module
Required Resolution
Owner
Next Action
```

Example:

``` text
Task: U014
Blocker: Required dataset unavailable
Impact: Scheduler validation
Resolution: Obtain approved dataset
```

------------------------------------------------------------------------

# 25. USER APPROVAL GATES

Ask the user before:

1.  Modifying a `COMPLETED` task.
2.  Modifying the scope of a `NEARLY_COMPLETED` task.
3.  Removing an existing feature.
4.  Replacing an existing architecture with a materially different one.
5.  Introducing a breaking API/database change.
6.  Changing an established requirement.
7.  Cancelling an existing task.
8.  Making a significant change that affects multiple completed modules.

Do not ask for approval for ordinary implementation details that are
already clearly covered by the task.

------------------------------------------------------------------------

# 26. ANTI-GOALS

The implementation supervisor must NOT:

-   blindly follow every new MD without checking existing state
-   overwrite completed tasks
-   silently modify nearly-completed tasks
-   duplicate existing functionality
-   create unnecessary microservices
-   mark unfinished work as completed
-   hide blockers
-   delete historical iteration information
-   rewrite history to make progress appear cleaner
-   change requirements merely to fit the implementation
-   introduce unnecessary technology
-   perform unrelated refactoring during feature implementation

------------------------------------------------------------------------

# 27. ANTIGRAVITY BRAIN UPDATE FORMAT

At the end of every meaningful implementation iteration, update the
project brain using this structure:

``` text
PROJECT STATE
-------------
Iteration:
Overall Status:

COMPLETED
---------
- Task ID:
- Module:
- Implementation:

IN PROGRESS
-----------
- Task ID:
- Remaining Work:

BLOCKED
-------
- Task ID:
- Blocker:

NEW TASKS
---------
- Task ID:
- Reason:

MODULE STATUS
-------------
- Module:
- Status:

SERVICE STATUS
--------------
- Service:
- Status:

ARCHITECTURE CHANGES
--------------------
- None / Details

DATABASE CHANGES
----------------
- None / Details

API CHANGES
-----------
- None / Details

FILES CHANGED
-------------
- Added:
- Modified:
- Deleted:

VALIDATION
----------
- Build:
- Unit Tests:
- Integration:
- Manual Verification:

RISKS
-----
- ...

NEXT ITERATION
--------------
- ...
```

This section is intended to preserve enough context for a future AI
iteration to understand the project without reconstructing the entire
history.

------------------------------------------------------------------------

# 28. PROJECT MEMORY RULE

The AI must assume that a future iteration may have no conversational
context.

Therefore:

**Important project knowledge must exist in the repository, not only in
chat.**

If a decision, requirement, dependency, completion status, or
architectural change matters to future implementation, record it in the
appropriate `.md` file.

------------------------------------------------------------------------

# 29. FINAL CONSISTENCY CHECK

Before ending every implementation iteration:

``` text
[ ] All relevant MD requirements reviewed
[ ] Existing task IDs checked
[ ] Completed tasks protected
[ ] Nearly-completed tasks checked
[ ] Duplicate tasks avoided
[ ] Dependencies checked
[ ] Module status updated
[ ] Microservice status checked
[ ] APIs checked
[ ] Database changes recorded
[ ] Files changed recorded
[ ] Validation completed
[ ] Tracker updated
[ ] Iteration log created
[ ] Changelog updated
[ ] README current state updated
[ ] Next iteration identified
```

------------------------------------------------------------------------

# 30. OPERATING PRINCIPLE

> **Understand → Track → Plan → Implement → Validate → Record →
> Preserve**

The goal is not merely to make the SIH project work.

The goal is to make the implementation:

-   traceable
-   incremental
-   testable
-   architecture-aware
-   dependency-aware
-   reversible
-   auditable
-   protected against accidental regression
-   understandable by the next implementation iteration

**Never lose project state. Never silently rewrite completed work. Never
hide unfinished work.**
