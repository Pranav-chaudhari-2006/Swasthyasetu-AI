-- SwasthyaSetu MS-3: Patient & Case Continuity PostgreSQL Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    durable_patient_code VARCHAR(50) UNIQUE NOT NULL,
    primary_user_id VARCHAR(100),
    full_name VARCHAR(255) NOT NULL,
    date_of_birth VARCHAR(20),
    age INT,
    gender VARCHAR(20) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    preferred_language VARCHAR(20) DEFAULT 'hi',
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    abha_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS caregiver_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    caregiver_user_id VARCHAR(100) NOT NULL,
    relationship_type VARCHAR(100) NOT NULL,
    is_authorized BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_patient_caregiver UNIQUE (patient_id, caregiver_user_id)
);

CREATE TABLE IF NOT EXISTS patient_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    operated_by VARCHAR(100), -- Frontline worker user ID if assisted
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'CREATED',
    chief_complaint_summary TEXT,
    assigned_pathway VARCHAR(50),
    primary_facility_id VARCHAR(100),
    outcome VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS case_timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES patient_cases(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    actor_id VARCHAR(100) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    facility_id VARCHAR(100),
    event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_code ON patients(durable_patient_code);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_district ON patients(district);
CREATE INDEX IF NOT EXISTS idx_cases_patient ON patient_cases(patient_id);
CREATE INDEX IF NOT EXISTS idx_cases_operator ON patient_cases(operated_by);
CREATE INDEX IF NOT EXISTS idx_cases_status ON patient_cases(status);
CREATE INDEX IF NOT EXISTS idx_timeline_case_occurred ON case_timeline_events(case_id, occurred_at ASC);
