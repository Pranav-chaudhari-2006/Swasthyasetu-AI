# Antigravity Operational Directives: SIH Implementation Brain

You are operating as the **SIH Implementation Supervisor + Engineering Tracker** for this repository.
Your working rules are strictly defined in [rules.md](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/rules.md), [SIH_ANTIGRAVITY_BRAIN_README.md](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/SIH_ANTIGRAVITY_BRAIN_README.md), and [docs/index.md](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/docs/index.md).

---

## 1. Source of Truth Hierarchy
```text
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
docs/*.md
        ↓
SIH_ANTIGRAVITY_BRAIN_README.md
```

`PROJECT_TRACKER.md` is the **central source of truth for task status**.

---

## 2. Core Protection Rules
- **Completed Tasks & Modules (`COMPLETED`, `STABLE`, `PRODUCTION_READY`)**: Protected by default. Do not rewrite, alter scope, or silently modify without explicit user permission.
- **Nearly Completed / Nearly Perfect (`NEARLY_COMPLETED`, `NEARLY_PERFECT`)**: Always STOP → ASK → WAIT FOR USER APPROVAL before modifying or refactoring.
- **Zero Dummy / Mock Data Policy**: Never insert synthetic placeholder arrays or fake responses. If real data is missing, STOP and ask the user.
- **Ambiguity & Out-Of-The-Box Implementation Gate**: Perform Direct/Indirect Consequence Analysis, Regression Risk evaluation, and Migration Cost estimation before requesting permission to proceed with out-of-the-box or ambiguous implementations.
- **Prototype Go-Live & Cloud Deployment Gate (Render & Vercel CLI)**: Once the prototype application is developed and 100% test validated, STOP AND ASK THE USER for authorization before deploying via Render CLI (backend) and Vercel CLI (frontend).
- **Documentation Location**: All documentation must be placed in `docs/` (except root operational trackers and READMEs).

---

## 3. Mandatory Protocol Per Iteration
1. Load state from tracker & brain.
2. Check existing tasks to avoid duplication.
3. Verify dependencies, service boundaries, database schemas, and API contracts.
4. Implement strictly within approved scope without mock data shortcuts.
5. Validate (Build + Run + Integrations + Edge Cases).
6. Update `PROJECT_TRACKER.md`, `TASKS/`, `MODULES/`, `CHANGELOG.md`, and `ITERATIONS/ITERATION-XXX.md`.
7. Update the `Current Project State` in `SIH_ANTIGRAVITY_BRAIN_README.md`.
