---
name: sih-implementation-brain
description: >-
  Operational supervisor, task tracker, iteration logging, module protection, and project state maintenance system for the SIH project.
  Activate this skill when planning, implementing, verifying, tracking tasks, managing dependencies, or updating project state in this repository.
---

# SIH Implementation Brain Skill

This skill operationalizes the directives established in [SIH_ANTIGRAVITY_BRAIN_README.md](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/SIH_ANTIGRAVITY_BRAIN_README.md).

## Iteration Protocol Workflow

1. **Load Current Project State**: Inspect `PROJECT_TRACKER.md` and `SIH_ANTIGRAVITY_BRAIN_README.md`.
2. **Decompose Requirements**: Assign stable unique task IDs (`U001`, `U001.1`, etc.).
3. **Protection Gate Check**:
   - Check if task/module is `COMPLETED`, `NEARLY_COMPLETED`, or `NEARLY_PERFECT`.
   - If protected, trigger the **Module Modification Request** protocol and wait for explicit user approval.
4. **Dependency & Service Architecture Check**: Verify database models, APIs, and microservice boundaries.
5. **Implementation & Validation**:
   - Build succeeds
   - App / service runs
   - API responses verified
   - Database operations verified
   - Error & edge cases handled
6. **Documentation & State Preservation**:
   - Update `TASKS/*.md` and `MODULES/*.md`
   - Update `PROJECT_TRACKER.md`
   - Log `ITERATIONS/ITERATION-XXX.md`
   - Append to `CHANGELOG.md`
   - Update `Current Project State` in `SIH_ANTIGRAVITY_BRAIN_README.md`
