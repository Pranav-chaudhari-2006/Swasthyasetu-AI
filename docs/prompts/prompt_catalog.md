# System Prompts Catalog & Engineering Directives Guide
## SwasthyaSetu AI

> **Purpose**: This document curates, refines, and categorizes all user prompts executed in this session. Each prompt is documented with its operational context, refined reusable template, target deliverables, and engineering governance impact.

---

## Prompt Index

| # | Prompt Title | Category | Target Work Area | Primary Deliverables |
|---|---|---|---|---|
| **P-01** | [Operational Brain & Knowledge Base Ingestion](#p-01-operational-brain--knowledge-base-ingestion) | Governance & Setup | AI Agent Brain Configuration | Brain State, Rules, Tracker Hierarchy |
| **P-02** | [Strict Anti-Hallucination & Protection Directives](#p-02-strict-anti-hallucination--protection-directives) | Quality & Security Gates | Guardrails & Data Policy | `rules.md`, Zero Dummy Policy, Consequence Gate |
| **P-03** | [Folder Optimization & Microservice Roadmap](#p-03-folder-optimization--microservice-roadmap) | Architecture & Planning | Repository Structure & Execution Plan | Clean Root, `docs/temp/`, Master Microservice Plan |
| **P-04** | [Session Prompt Catalog & Directive Documentation](#p-04-session-prompt-catalog--directive-documentation) | Documentation & Auditing | Engineering Knowledge Management | `docs/prompt_catalog.md`, Central Index |

---

## Detailed Prompt Breakdown

### P-01: Operational Brain & Knowledge Base Ingestion

- **Work Category**: AI Agent Governance & Brain Setup
- **Original User Input**:
  > *"Update the attached document as your brain@[c:\Users\prana\Desktop\SIH Final MVP\SIH_ANTIGRAVITY_BRAIN_README.md] Update the knowledge base properly according to the attached file"*
- **Refined Reusable Prompt Template**:
  ```text
  ACT AS: SIH Implementation Supervisor & Engineering Tracker
  DIRECTIVE:
  1. Ingest and adopt `SIH_ANTIGRAVITY_BRAIN_README.md` as the primary operational brain.
  2. Embed active `Current Project State` metadata in the brain document.
  3. Initialize the central source of truth hierarchy (PROJECT_TRACKER.md, CHANGELOG.md).
  4. Configure workspace agent rules (AGENTS.md, GEMINI.md) and skills to enforce state preservation on every turn.
  ```
- **Used For**:
  - Establishing baseline agent memory across sessions.
  - Setting up the Source of Truth hierarchy.
  - Creating tracking infrastructure (`PROJECT_TRACKER.md`, `CHANGELOG.md`).
- **Artifacts Created / Modified**:
  - `SIH_ANTIGRAVITY_BRAIN_README.md` (Updated with live `Current Project State`)
  - `AGENTS.md`, `GEMINI.md`
  - `.agents/skills/sih-implementation-brain/SKILL.md`
  - `PROJECT_TRACKER.md`, `CHANGELOG.md`

---

### P-02: Strict Anti-Hallucination & Protection Directives

- **Work Category**: Code Quality, Safety Guardrails & Protection Policies
- **Original User Input**:
  > *"Genrate a strict agent working rules.md which agent will refer for its working. Give every documentation except readme.md in docs. /goal The main aim is to get agent working properly, not hallucinating or messing with the prior completed work. Step wise flow, Don't use any dummy or mock data, if anytime such thing happens ask the user, if there is something what you want to do out of box, which has a ambiguity in implementation, describe the consequences and ask the permission from the user. Generate rule.md"*
- **Refined Reusable Prompt Template**:
  ```text
  ACT AS: Strict Engineering Compliance Supervisor
  OBJECTIVE: Enforce unbreakable development guardrails and organize all non-README documentation inside docs/.
  MANDATORY RULES:
  1. ZERO HALLUCINATION: Inspect actual filesystem code before declaring state or modifying files.
  2. PRIOR WORK PROTECTION: Any COMPLETED or NEARLY_COMPLETED task/module is locked against silent modification or scope reduction.
  3. ZERO DUMMY/MOCK DATA: Never introduce fake arrays or mock responses in code. If real data is missing, STOP and ask the user.
  4. AMBIGUITY & OUT-OF-THE-BOX GATE: If requirements are ambiguous or unconventional architectures are proposed, provide Consequence Analysis (Direct, Indirect, Regression Risk, Migration Cost) and obtain explicit user sign-off.
  5. STEP-WISE 8-PHASE WORKFLOW: Execute strictly in sequential phases without skipping validation.
  6. DOCUMENTATION RESIDENCY: Place all modular guides and standards strictly inside docs/.
  ```
- **Used For**:
  - Preventing agent hallucinations and unintentional regressions.
  - Enforcing real schema/data modeling.
  - Establishing a structured user-approval gate for design decisions.
- **Artifacts Created / Modified**:
  - `rules.md` (Project root rule definition)
  - `docs/rules.md` (Central documentation copy)
  - `docs/agent_workflow.md` (8-phase step-wise flow)
  - `docs/data_policy.md` (Zero dummy data policy & protocol)
  - `docs/consequence_protocol.md` (Ambiguity & out-of-the-box change analysis)
  - `docs/task_decomposition_standards.md` (Task ID and state rules)
  - `docs/architecture_standards.md` (Microservice & contract standards)
  - `.agents/rules/strict-rules.md`

---

### P-03: Folder Optimization & Microservice Roadmap

- **Work Category**: Repository Structure Optimization & Phased Implementation Planning
- **Original User Input**:
  > *"Move the extra folders like iteration, microservices inside docs /temp folder, only the codebase and important files should be there in root folder, rest everything should be under a specific folder. Improve the folder structure. Create a implementation plan as per mentioned in the document @[c:\Users\prana\Desktop\SIH Final MVP\docs], After successful implemenation of any micromodule and testing update task.md properly with a structured points. Go microservice by microservice, don't jump to a different part of project until one is completed, validated and approved"*
- **Refined Reusable Prompt Template**:
  ```text
  ACT AS: Principal Systems Architect & Engineering Lead
  DIRECTIVES:
  1. REPOSITORY TIDYING: Move operational tracking folders (ITERATIONS, MICROSERVICES, MODULES, TASKS) into `docs/temp/`. Ensure root contains only source code folders (backend, frontend), documentation (docs), and root control markdown files.
  2. MASTER IMPLEMENTATION PLAN: Formulate an exhaustive, sequential microservice implementation roadmap based on docs/ specifications.
  3. SEQUENTIAL SERVICE ISOLATION: Execute microservice by microservice. No cross-jumping. Each microservice must be fully built, unit tested, contract verified, and audited before advancing.
  4. LIVE TRACKER SYNC: After completing and validating any micromodule, update docs/task.md and PROJECT_TRACKER.md with structured verification points.
  ```
- **Used For**:
  - Cleaning up repository clutter for a clean production structure.
  - Sequencing all 10 SwasthyaSetu AI microservices, Gateway BFF, and Portals.
  - Enforcing strict sequential development discipline.
- **Artifacts Created / Modified**:
  - `docs/temp/` (Holding archived tracking directories: `ITERATIONS/`, `MICROSERVICES/`, `MODULES/`, `TASKS/`)
  - `docs/implementation_plan.md` (Master microservices execution plan)
  - `docs/index.md` (Updated documentation index)
  - `PROJECT_TRACKER.md`, `CHANGELOG.md`

---

### P-04: Session Prompt Catalog & Directive Documentation

- **Work Category**: Knowledge Management & Audit Documentation
- **Original User Input**:
  > *"Create the docs of all the prompts in this chat with refined way, title them properly for which work they are used"*
- **Refined Reusable Prompt Template**:
  ```text
  ACT AS: Technical Documentation & Knowledge Lead
  OBJECTIVE: Document all session user prompts in a refined, structured markdown catalog inside docs/.
  SPECIFICATIONS:
  1. Capture raw user prompts alongside refined production-grade prompt templates.
  2. Categorize by operational work area.
  3. Outline intended deliverables, artifacts created, and governance impacts.
  4. Link the new document in the central docs/index.md.
  ```
- **Used For**:
  - Maintaining complete transparency and prompt engineering auditability.
  - Providing reusable prompt templates for future team members and AI pair programmers.
- **Artifacts Created / Modified**:
  - `docs/prompt_catalog.md`
  - `docs/index.md`

---

## 3. Engineering Best Practices for Prompt Invocation

1. **Include Context Links**: Always prefix operational prompts with links to [rules.md](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/rules.md) and [PROJECT_TRACKER.md](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/PROJECT_TRACKER.md).
2. **Explicit Verification Mandate**: Require the agent to run automated test commands before requesting task closure.
3. **Audit Trail Requirement**: Conclude prompts with instructions to update [docs/task.md](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/docs/task.md) and [CHANGELOG.md](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/CHANGELOG.md).
