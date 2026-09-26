-- SwasthyaSetu MS-7: Emergency Coordination & 108 Handoff Service Schema
-- Compliant with PostgreSQL 15+ & strict zero-dummy data policy

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS emergency_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    triggered_by_actor_id UUID NOT NULL,
    triggered_by_actor_role VARCHAR(50) NOT NULL,
    emergency_classification VARCHAR(100) NOT NULL,
    emergency_reason TEXT NOT NULL,
    patient_location_lat DECIMAL(10, 8) NOT NULL,
    patient_location_lng DECIMAL(11, 8) NOT NULL,
    allocated_facility_id UUID NOT NULL,
    transport_mode VARCHAR(50) NOT NULL DEFAULT 'AMBULANCE_108',
    mems_108_reference VARCHAR(50) NOT NULL,
    driver_name VARCHAR(100),
    driver_contact VARCHAR(20),
    vehicle_number VARCHAR(30),
    status VARCHAR(30) NOT NULL DEFAULT 'DISPATCHED' CHECK (status IN (
        'DISPATCHED', 'EN_ROUTE_SCENE', 'PATIENT_ONBOARD', 'EN_ROUTE_ER', 'ARRIVED_ER', 'HANDOFF_COMPLETED', 'CANCELLED'
    )),
    estimated_arrival_minutes INT,
    live_location JSONB,
    redirect_history JSONB DEFAULT '[]'::jsonb,
    handoff_notes TEXT,
    receiving_physician_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    arrived_at TIMESTAMPTZ,
    handoff_completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS emergency_telemetry_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emergency_event_id UUID NOT NULL REFERENCES emergency_events(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed_kmh DECIMAL(5, 2),
    heading_deg DECIMAL(5, 2),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for real-time response
CREATE INDEX IF NOT EXISTS idx_emergency_events_case ON emergency_events(case_id);
CREATE INDEX IF NOT EXISTS idx_emergency_events_patient ON emergency_events(patient_id);
CREATE INDEX IF NOT EXISTS idx_emergency_events_facility_status ON emergency_events(allocated_facility_id, status);
CREATE INDEX IF NOT EXISTS idx_emergency_events_mems ON emergency_events(mems_108_reference);
CREATE INDEX IF NOT EXISTS idx_emergency_telemetry_event ON emergency_telemetry_logs(emergency_event_id, recorded_at DESC);
