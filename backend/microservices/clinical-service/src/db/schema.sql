-- SwasthyaSetu MS-8: Clinical Workflow, Medicine & Diagnostic Service Schema
-- Compliant with PostgreSQL 15+ & strict zero-dummy data policy

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clinical Assessments
CREATE TABLE IF NOT EXISTS clinical_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    clinician_id UUID NOT NULL,
    clinician_role VARCHAR(50) NOT NULL,
    facility_id UUID NOT NULL,
    chief_complaint TEXT NOT NULL,
    physical_findings JSONB NOT NULL DEFAULT '{}'::jsonb,
    differential_diagnosis TEXT[] NOT NULL DEFAULT '{}',
    final_diagnosis TEXT NOT NULL,
    clinical_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    assessment_id UUID REFERENCES clinical_assessments(id) ON DELETE SET NULL,
    clinician_id UUID NOT NULL,
    clinician_role VARCHAR(50) NOT NULL,
    facility_id UUID NOT NULL,
    instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prescription Items
CREATE TABLE IF NOT EXISTS prescription_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    duration_days INT NOT NULL,
    quantity INT NOT NULL,
    is_dispensed BOOLEAN NOT NULL DEFAULT FALSE,
    dispensed_at TIMESTAMPTZ,
    dispensed_by_id UUID
);

-- Real Medicine Stock Inventory
CREATE TABLE IF NOT EXISTS medicine_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL,
    medicine_name VARCHAR(100) NOT NULL,
    stock_count INT NOT NULL DEFAULT 0,
    stock_status VARCHAR(30) NOT NULL DEFAULT 'IN_STOCK' CHECK (stock_status IN ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK')),
    unit VARCHAR(20) NOT NULL DEFAULT 'tablets',
    last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(facility_id, medicine_name)
);

-- Diagnostic Orders
CREATE TABLE IF NOT EXISTS diagnostic_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    clinician_id UUID NOT NULL,
    facility_id UUID NOT NULL,
    test_name VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ORDERED' CHECK (status IN (
        'ORDERED', 'SAMPLE_COLLECTED', 'RESULT_ATTACHED', 'CLINICIAN_REVIEWED', 'CANCELLED'
    )),
    result_data JSONB,
    result_file_url VARCHAR(255),
    lab_tech_id UUID,
    reviewed_by_clinician_id UUID,
    ordered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sample_collected_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ
);

-- Inpatient Hospital Admissions
CREATE TABLE IF NOT EXISTS hospital_admissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    facility_id UUID NOT NULL,
    admitted_by UUID NOT NULL,
    ward_bed VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ADMITTED' CHECK (status IN ('ADMITTED', 'DISCHARGED', 'TRANSFERRED')),
    admitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    discharged_at TIMESTAMPTZ,
    discharge_summary TEXT,
    follow_up_instructions TEXT,
    discharged_by UUID
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clinical_assessments_case ON clinical_assessments(case_id);
CREATE INDEX IF NOT EXISTS idx_clinical_assessments_patient ON clinical_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_case ON prescriptions(case_id);
CREATE INDEX IF NOT EXISTS idx_medicine_inventory_facility ON medicine_inventory(facility_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_orders_case ON diagnostic_orders(case_id);
CREATE INDEX IF NOT EXISTS idx_hospital_admissions_case ON hospital_admissions(case_id);
