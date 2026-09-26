# Architecture & Service Design Standards

---

## 1. Microservice vs. Modular Architecture Principle

1. **Avoid Unnecessary Microservices**:
   - Default to modular, cleanly-bounded components inside the backend core unless distinct operational, deployment, or high-throughput isolation requires a standalone microservice.
   - Do not create independent microservices that only act as thin proxies or trivial CRUD wrappers.

2. **When Is a Separate Microservice Justified?**
   - High compute intensity (e.g., genetic algorithm scheduler worker, ML optimization engine).
   - Independent failure domain requirement.
   - Distinct scaling characteristics or separate technology runtime.

---

## 2. Interface & Contract Integrity

1. **Explicit API Specs**:
   - All REST/GraphQL/gRPC endpoints must have strictly typed input validation and response schemas.
   - No implicit types or unstructured `any` objects in payloads.

2. **Database Change Control**:
   - Database schemas must be version-controlled via migrations (e.g., SQL scripts or ORM migrations).
   - Never perform destructive schema alterations (`DROP COLUMN`, `ALTER TYPE`) on tables used by active services without explicit consequence analysis and user confirmation.

3. **Service-to-Service Communication**:
   - Explicit failure handling, timeouts, and fallback logic must be built into every inter-service call.
