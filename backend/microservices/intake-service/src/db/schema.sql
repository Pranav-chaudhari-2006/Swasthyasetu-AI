-- SwasthyaSetu MS-4: Intake & AI Structuring PostgreSQL Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS intake_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id VARCHAR(100) NOT NULL,
    patient_id VARCHAR(100) NOT NULL,
    operated_by VARCHAR(100),
    language_code VARCHAR(20) DEFAULT 'hi',
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS intake_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES intake_sessions(id) ON DELETE CASCADE,
    sender_type VARCHAR(50) NOT NULL,
    raw_content TEXT NOT NULL,
    translated_content TEXT,
    audio_url VARCHAR(255),
    language_code VARCHAR(20) DEFAULT 'hi',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS structured_intake_facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES intake_sessions(id) ON DELETE CASCADE,
    case_id VARCHAR(100) NOT NULL,
    patient_id VARCHAR(100) NOT NULL,
    chief_symptoms JSONB NOT NULL DEFAULT '[]'::jsonb,
    reported_red_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
    existing_medical_conditions JSONB DEFAULT '[]'::jsonb,
    current_medications JSONB DEFAULT '[]'::jsonb,
    extracted_vital_signs JSONB DEFAULT '{}'::jsonb,
    clarification_status VARCHAR(50) DEFAULT 'COMPLETE',
    model_version VARCHAR(100) NOT NULL,
    confidence_score DECIMAL(4, 3) NOT NULL DEFAULT 0.950,
    is_ai_generated BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_intake_facts_session UNIQUE (session_id)
);

CREATE INDEX IF NOT EXISTS idx_intake_case ON intake_sessions(case_id);
CREATE INDEX IF NOT EXISTS idx_intake_patient ON intake_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_messages_session ON intake_messages(session_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_facts_case ON structured_intake_facts(case_id);
