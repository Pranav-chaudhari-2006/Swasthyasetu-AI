-- SwasthyaSetu MS-2: Facility Registry & Dynamic Capability PostgreSQL Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    facility_tier VARCHAR(50) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    operating_hours JSONB DEFAULT '{"status": "24X7"}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS facility_capabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    capability_code VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'UNVERIFIED',
    available_units INT,
    last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_by VARCHAR(100),
    verification_source VARCHAR(100) DEFAULT 'PORTAL_UPDATE',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_facility_capability UNIQUE (facility_id, capability_code)
);

CREATE INDEX IF NOT EXISTS idx_facilities_district ON facilities(district);
CREATE INDEX IF NOT EXISTS idx_facilities_tier ON facilities(facility_tier);
CREATE INDEX IF NOT EXISTS idx_facilities_geo ON facilities(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_capabilities_code_status ON facility_capabilities(capability_code, status);
CREATE INDEX IF NOT EXISTS idx_capabilities_facility ON facility_capabilities(facility_id);
