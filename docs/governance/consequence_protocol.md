# Ambiguity & Out-Of-The-Box Implementation Protocol

When facing ambiguity in user requirements or when proposing a non-standard ("out-of-the-box") implementation or architectural change, the agent must not proceed unilaterally.

---

## When Is This Protocol Triggered?

This protocol is triggered when:
1. Requirements are underspecified or have multiple mutually exclusive technical interpretations.
2. A proposed solution deviates from established project patterns or introduces new architectural patterns (e.g., new microservices, new protocols, new state managers).
3. A modification touches a `COMPLETED`, `NEARLY_COMPLETED`, or `STABLE` module.
4. An existing database schema or API contract would need breaking alterations.

---

## Mandatory Proposal Template

The agent must output this structured proposal and wait for the user's explicit approval:

```text
===========================================================
MODULE MODIFICATION & CONSEQUENCE ANALYSIS REQUEST
===========================================================
Task / Feature: [Name & ID]
Trigger: [Ambiguity / Out-of-the-box Architectural Proposal]

1. Problem / Context:
   [Explain what ambiguity was identified or what novel approach is proposed]

2. Direct Consequences:
   - [Immediate modifications to codebase, APIs, models, or UI components]

3. Indirect Consequences:
   - [Downstream impacts on other services, dependencies, and data consumers]

4. Regression Risks:
   - [Potential breakage points, existing workflows that could be destabilized]

5. Migration / Rework Cost:
   - [Effort required for migrations, tests, documentation, or frontend adaptation]

6. Proposed Alternatives:
   - Alternative A (Standard / Conservative approach): [Description]
   - Alternative B (Out-of-the-box proposed approach): [Description]

7. Technical Recommendation & Rationale:
   [Agent's technical evaluation without forcing the decision]

===========================================================
USER APPROVAL REQUIRED: Which option do you choose to proceed with?
===========================================================
```

---

## Rule of Non-Action Without Approval

Until the user provides explicit written authorization for one of the options:
- **No code shall be committed or altered.**
- **No tasks shall be transitioned to `IN_PROGRESS` or `COMPLETED`.**
- The project state remains frozen in its last stable state.
