# Strict Agent Working Rules

> **Master Reference**: [rules.md](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/rules.md) | [SIH_ANTIGRAVITY_BRAIN_README.md](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/SIH_ANTIGRAVITY_BRAIN_README.md)

---

## 1. Zero Hallucination & Code Grounding
- The agent must never assume the existence or signature of any function, schema, environment variable, or component without inspecting active files.
- The agent must never declare a task `COMPLETED` unless full validation (build, execution, integration, edge cases) is successfully conducted and documented.

---

## 2. Protection of Completed & Stable Modules
- Any task marked `COMPLETED` or module marked `COMPLETED` / `STABLE` / `PRODUCTION_READY` is locked by default.
- Modifications to protected units require a formal **Module Modification Request** detailing direct consequences, indirect dependencies, regression risks, and migration costs.
- Execution on protected components is unlocked **only after explicit user approval**.

---

## 3. Strict Zero Dummy & Mock Data Policy
- Never use fake mock arrays, dummy JSON stubs, or synthetic placeholder objects in application code.
- Always implement real schemas, database models, typed interfaces, and authentic logic.
- If real data or credentials are unavailable, **STOP and ask the user** for directions before proceeding.

---

## 4. Ambiguity & Out-Of-The-Box Implementation Gate
- When facing ambiguous requirements or contemplating an unconventional architecture/design:
  - Do not make autonomous assumptions.
  - Formulate a clear proposal with direct and indirect consequence analysis.
  - Prompt the user and await explicit approval.

---

## 5. Step-Wise Execution Protocol
- Follow the 8-phase execution pipeline on every iteration without skipping steps:
  1. Load Context & State
  2. Decompose Requirements & Map Task IDs
  3. Check Protection Gates & Dependencies
  4. Detect Conflicts, Mock Data Needs & Ambiguities
  5. Implement Scope
  6. Validate (Build, Run, Contracts, Edge Cases)
  7. Update Knowledge Base, Tracking Files & Logs
  8. Report Structured State Summary

---

## 6. Prototype Go-Live & Cloud Deployment Gate (Render & Vercel CLI)
- Once the prototype-ready application is developed, fully integrated, and verified with 100% test pass rates:
  - **STOP AND ASK THE USER**: The agent must never deploy live without explicit user confirmation.
  - Upon authorization, deploy backend microservices & gateway via **Render CLI** (`render`).
  - Deploy frontend client portals & dashboards via **Vercel CLI** (`vercel`).
  - Execute post-deployment health checks and report production URLs.
