# Data Integrity & Zero Dummy Data Policy

> **Core Principle**: Real schemas, real validation, real integrations. No dummy or mock shortcuts.

---

## 1. Zero Dummy & Mock Data Mandate

1. **Forbidden Practices**:
   - Hardcoding fake sample arrays (e.g., `const users = [{id: 1, name: 'John Doe'}]`) in production code.
   - Returning synthetic static JSON from API routes in place of real database queries.
   - Creating temporary bypasses that skip real data validation or relational consistency.
   - Using placeholder UI fixtures without backing database models and controllers.

2. **Required Standard**:
   - Define concrete database entities (e.g., Prisma, TypeORM, SQLAlchemy, PostgreSQL DDL).
   - Write real controller handlers executing genuine database queries.
   - Enforce authentic schema validation (e.g., Zod, Joi, Pydantic).

---

## 2. Procedure When Real Data Is Unavailable

If during development, a task cannot be fully implemented or tested because:
- Live external API keys or credentials are missing
- Seed datasets or college/institutional datasets have not been supplied
- Integration endpoints from third-party systems are offline

**The agent MUST NOT**:
- Fabricate synthetic mock fallbacks silently into application code.
- Mark the task `COMPLETED` based on fake data.

**The agent MUST**:
1. Mark the task status as `BLOCKED` or `IN_PROGRESS` (with blockers documented).
2. Stop and notify the user with the following template:

```text
===========================================================
DATA / INTEGRATION REQUIREMENT NOTICE
===========================================================
Task ID: [e.g., U010.2]
Feature / Component: [e.g., Timetable Faculty Ingestion]
Missing Real Data / Asset: [e.g., Faculty CSV schema / Database connection]

Impact:
- Cannot perform authentic validation without the actual schema or data source.

Options for User:
1. Provide the actual dataset / credentials / schema.
2. Explicitly approve using a temporary testing seed or fixture file strictly isolated in tests/.
3. Defer this unit until real data is available.

How would you like to proceed?
===========================================================
```
