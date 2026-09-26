-- SwasthyaSetu MS-5: Deterministic Safety Engine PostgreSQL Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS safety_rule_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_tag VARCHAR(100) UNIQUE NOT NULL,
    clinical_lead_approval VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    rules_count INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS safety_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id VARCHAR(100) NOT NULL,
    rule_set_version VARCHAR(100) NOT NULL,
    triaged_pathway VARCHAR(50) NOT NULL,
    triggered_rule_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    clinical_rationale TEXT NOT NULL,
    recommended_capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_emergency_bypass BOOLEAN NOT NULL DEFAULT FALSE,
    input_facts_snapshot JSONB NOT NULL,
    evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safety_case ON safety_assessments(case_id);
CREATE INDEX IF NOT EXISTS idx_safety_pathway ON safety_assessments(triaged_pathway);
CREATE INDEX IF NOT EXISTS idx_safety_evaluated ON safety_assessments(evaluated_at DESC);
