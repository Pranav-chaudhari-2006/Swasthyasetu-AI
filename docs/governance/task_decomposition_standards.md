# Task Decomposition & Lifecycle Standards

This document establishes the uniform task ID numbering system, decomposition methodology, and lifecycle rules across the SIH implementation.

---

## 1. Task ID Hierarchy

Every implementation unit uses an immutable identifier:
- Major Feature/Module: `U001`, `U002`, `U003`, etc.
- Functional Component / Subtask: `U001.1`, `U001.2`, `U001.3`, etc.
- Micro-level Implementation Unit: `U001.1.1`, `U001.1.2`, etc.

### Rules for Task IDs
- Task IDs are **permanent**. Never rename or reuse an existing task ID for a different purpose.
- If a task is cancelled, mark its status `CANCELLED` and retain the record.

---

## 2. Mandatory Task Breakdown Fields

Every task defined in `TASKS/TASK-UXXX.md` must include:
1. **Task ID & Name**
2. **Status**: `PLANNED` | `READY` | `IN_PROGRESS` | `NEARLY_COMPLETED` | `COMPLETED` | `BLOCKED` | `DEFERRED` | `CANCELLED`
3. **Module**: Parent module identifier (`MODULE-01`, etc.)
4. **Service**: Target backend service, frontend component, or library
5. **Dependencies**: Prerequisite task IDs that must be completed or mocked before start
6. **Objective**: Crisp statement of what this unit delivers
7. **Implementation Location**: Concrete file paths to be created or modified
8. **Acceptance Criteria**: Checkbox checklist covering functional requirements, edge cases, contracts, and tests
9. **Validation Plan**: Exact commands or checks used to confirm completion

---

## 3. Task State Transition Rules

```text
       ┌───────────┐
       │  PLANNED  │
       └─────┬─────┘
             │ Dependencies Met
             ▼
       ┌───────────┐
       │   READY   │
       └─────┬─────┘
             │ Work Begins
             ▼
       ┌───────────┐        Blocker Occurs       ┌───────────┐
       │IN_PROGRESS│ ──────────────────────────► │  BLOCKED  │
       └─────┬─────┘ ◄────────────────────────── └───────────┘
             │ Core Functionality Done          Blocker Resolved
             ▼
    ┌─────────────────┐
    │NEARLY_COMPLETED │ (Protected: Stop & Ask before redesign)
    └────────┬────────┘
             │ All Acceptance Criteria & Tests Verified
             ▼
       ┌───────────┐
       │ COMPLETED │ (Fully Protected: Locked against silent modification)
       └───────────┘
```
