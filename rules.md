# Strict Agent Working Rules

> **Status**: ACTIVE & STRICTLY ENFORCED  
> **Target Audience**: Antigravity AI Agent & Engineering Supervisors  
> **Master Brain Reference**: [SIH_ANTIGRAVITY_BRAIN_README.md](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/SIH_ANTIGRAVITY_BRAIN_README.md)  
> **Documentation Hub**: [docs/index.md](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/docs/index.md)

---

## 1. Zero Hallucination & Code Truth Directive

1. **Verify Before Action**: Never make assumptions about files, APIs, database tables, or library versions. Always inspect the local filesystem and active files before planning or making changes.
2. **No Fictional Progress**: A task is never marked `COMPLETED` merely because code or a function skeleton was written. A task is completed only when it runs, meets acceptance criteria, handles edge cases, and passes validation.
3. **Audit Trail Requirement**: Every single change must be reflected in [PROJECT_TRACKER.md](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/PROJECT_TRACKER.md), [CHANGELOG.md](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/CHANGELOG.md), and the current iteration log.

---

## 2. Absolute Protection of Prior Work

1. **Completed Tasks & Modules (`COMPLETED`, `STABLE`, `PRODUCTION_READY`)**:
   - **DO NOT** rewrite requirements.
   - **DO NOT** reduce scope.
   - **DO NOT** silently refactor working architecture or interfaces.
   - **DO NOT** mark existing tasks incomplete due to new, unrelated requirements.
   - **LOCKED BY DEFAULT**: Modification is prohibited unless the user explicitly requests it or gives written approval to an official **Module Modification Request**.
2. **Nearly Completed Tasks (`NEARLY_COMPLETED`, `NEARLY_PERFECT`)**:
   - **STOP → ASK → WAIT FOR APPROVAL** before altering implementation or adding scope.
   - Do not replace working logic with an alternative simply because it seems "cleaner" or "newer".

---

## 3. Strict ZERO Dummy & Mock Data Policy

1. **No Hardcoded Dummy Data**: Never introduce synthetic dummy data arrays, placeholder string lists, hardcoded fake entities, or mock API responses in application code unless specifically requested by the user.
2. **Real Schemas & Models**: Always implement real, valid database models, strongly-typed schemas, and authentic validation logic.
3. **Mandatory User Prompt on Mock/Dummy Need**: If real data, external credentials, or third-party APIs are unavailable during testing or implementation:
   - **STOP IMMEDIATELY**.
   - Explain what real data or configuration is missing.
   - Ask the user how they wish to proceed (e.g., provide test fixtures, environment variables, or mock seeds).

---

## 4. Ambiguity & Out-Of-The-Box Implementation Protocol

If a task requirement is ambiguous, or if an out-of-the-box, non-standard, or architectural design change is proposed:

1. **DO NOT** make assumptions or silently implement a custom interpretation.
2. **STOP** and present a formal **Module Modification / Architecture Proposal**:

```text
===========================================================
PROPOSAL / AMBIGUITY RESOLUTION REQUEST
===========================================================
Feature / Component: [Name]
Identified Ambiguity / Out-of-the-Box Change: [Description]

Direct Consequences:
- [Immediate changes to files, schemas, APIs, or UI]

Indirect Consequences:
- [Impact on dependent modules, downstream services, or consumers]

Regression Risks:
- [Potential failure modes or existing features affected]

Rework / Migration Cost:
- [Required changes to tests, databases, or documentation]

Alternatives Considered:
- [Option A vs Option B]

Recommendation:
- [Agent's technical assessment with justification]

===========================================================
USER APPROVAL REQUIRED: Do you approve this approach?
===========================================================
```

3. Wait for the user's explicit approval before writing any code.

---

## 5. Step-Wise Execution Flow (8-Phase Standard)

Every action and implementation turn must proceed strictly in order:

```text
Phase 1: LOAD CONTEXT
├── Read PROJECT_TRACKER.md & SIH_ANTIGRAVITY_BRAIN_README.md
└── Inspect existing codebase files

Phase 2: TASK DECOMPOSITION & MAPPING
├── Match requirement to stable Task ID (e.g., U001, U001.1)
└── Check for existing duplicate tasks

Phase 3: PROTECTION & DEPENDENCY GATE
├── Verify status of affected components (Check COMPLETED / NEARLY_COMPLETED status)
└── Map API, Database, and Module dependencies

Phase 4: CONFLICT & AMBIGUITY CHECK
├── Detect out-of-box changes or missing data
└── If ambiguous or mock data required: STOP -> ASK USER

Phase 5: IMPLEMENTATION
├── Implement within approved scope only
└── Reuse existing components without duplicating services

Phase 6: RIGOROUS VALIDATION
├── Build verification (npm run build / compile check)
├── Execution & runtime checks
├── API contract & schema validation
└── Edge-case handling verification

Phase 7: KNOWLEDGE BASE & TRACKER PERSISTENCE
├── Update TASK files (TASKS/TASK-UXXX.md)
├── Update MODULE files (MODULES/MODULE-XX.md)
├── Update PROJECT_TRACKER.md
├── Record entry in CHANGELOG.md
├── Generate/Update ITERATIONS/ITERATION-XXX.md
└── Update Current Project State in SIH_ANTIGRAVITY_BRAIN_README.md

Phase 8: REPORT & CONFIRM
└── Provide structured state summary to user
```

---

## 6. Architecture & Microservice Restraint

1. **Avoid Microservice Sprawl**: Do not create independent microservices when a clean module within the primary backend achieves the goal.
2. **Single Responsibility & Clear Contracts**: Every service and module must have documented inputs, outputs, error states, and database models.
3. **No Breaking Contract Changes**: Never silently modify API payloads or database column types that active consumers rely upon.

---

## 7. Prototype Go-Live & Cloud Deployment Gate (Render & Vercel CLI)

1. **Mandatory User Authorization Gate**:
   - Once all microservices and frontend portals are built, integrated, and verified with 100% test pass rates:
   - **STOP AND ASK THE USER**: Do not autonomously deploy live. Present the completed prototype readiness report and ask for explicit permission to go live.
2. **Deployment Tooling**:
   - **Backend Microservices & Gateway**: Deploy via **Render CLI** (`render`).
   - **Frontend Web Applications & Dashboards**: Deploy via **Vercel CLI** (`vercel`).
3. **Post-Deployment Smoke Tests**: Verify live SSL endpoints, database migrations, and health check routes.

---

## 8. Documentation Hierarchy

All non-README project documentation must reside in `docs/`:

```text
docs/
├── index.md                        # Central documentation navigation hub
├── governance/                     # Operational rules, workflows, data policy, checklist
│   ├── rules.md
│   ├── checklist.md
│   ├── implementation_plan.md
│   ├── agent_workflow.md
│   ├── data_policy.md
│   ├── consequence_protocol.md
│   ├── task_decomposition_standards.md
│   └── architecture_standards.md
├── specifications/                 # System, product & architecture specifications
│   ├── requirements.md
│   ├── srs.md
│   ├── brd.md
│   ├── design.md
│   ├── microservices_spec.md
│   ├── project_scope.md
│   └── task_milestones.md
├── prompts/                        # System prompts & engineering directives
│   ├── MASTER_PROMPT.md
│   └── prompt_catalog.md
└── temp/                           # Historical iteration logs & tracking archives
```
