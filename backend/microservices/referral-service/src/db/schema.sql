-- SwasthyaSetu MS-6: Referral State Machine & QR Service Schema
-- Compliant with PostgreSQL 15+ & strict zero-dummy data policy

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Referrals Table
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referral_code VARCHAR(32) UNIQUE NOT NULL,
    case_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    source_facility_id UUID,
    originating_actor_id UUID NOT NULL,
    originating_actor_role VARCHAR(50) NOT NULL,
    destination_facility_id UUID NOT NULL,
    pathway VARCHAR(30) NOT NULL CHECK (pathway IN ('ROUTINE', 'SAME_DAY', 'EMERGENCY')),
    required_capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    clinical_summary TEXT NOT NULL,
    current_state VARCHAR(30) NOT NULL DEFAULT 'ISSUED' CHECK (current_state IN (
        'ISSUED', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'EN_ROUTE', 'ARRIVED', 'TREATED', 'ADMITTED', 'DISCHARGED', 'CLOSED'
    )),
    qr_token_hash VARCHAR(128) NOT NULL,
    transport_details JSONB DEFAULT NULL,
    decline_reason TEXT DEFAULT NULL,
    emergency_bypass BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Referral State Transitions Ledger (Immutable Audit)
CREATE TABLE IF NOT EXISTS referral_state_transitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
    from_state VARCHAR(30) NOT NULL,
    to_state VARCHAR(30) NOT NULL,
    actor_id UUID NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    facility_id UUID,
    reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    transitioned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_referrals_case_id ON referrals(case_id);
CREATE INDEX IF NOT EXISTS idx_referrals_patient_id ON referrals(patient_id);
CREATE INDEX IF NOT EXISTS idx_referrals_destination_state ON referrals(destination_facility_id, current_state);
CREATE INDEX IF NOT EXISTS idx_referrals_pathway ON referrals(pathway);
CREATE INDEX IF NOT EXISTS idx_referrals_qr_hash ON referrals(qr_token_hash);
CREATE INDEX IF NOT EXISTS idx_referral_transitions_ref_id ON referral_state_transitions(referral_id, transitioned_at ASC);
