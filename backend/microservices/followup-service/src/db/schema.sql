-- SwasthyaSetu MS-9: Follow-Up & Notification Service Schema
-- Compliant with PostgreSQL 15+ & strict zero-dummy data policy

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Follow-Up Tasks
CREATE TABLE IF NOT EXISTS followup_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    assigned_asha_id UUID,
    due_date DATE NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'ROUTINE' CHECK (priority IN ('ROUTINE', 'HIGH', 'CRITICAL')),
    instructions TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'ESCALATED_DHO', 'CANCELLED'
    )),
    escalation_level INT NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ,
    completed_by UUID,
    completion_notes TEXT,
    vitals_observed JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications Ledger (Privacy-Preserving Audit Trail)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_user_id UUID NOT NULL,
    channel VARCHAR(30) NOT NULL CHECK (channel IN ('IN_APP', 'SMS', 'WEBPUSH')),
    title VARCHAR(150) NOT NULL,
    message_safe_body TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DELIVERED' CHECK (status IN ('PENDING', 'DELIVERED', 'FAILED', 'READ')),
    metadata JSONB DEFAULT '{}'::jsonb,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_followup_tasks_case ON followup_tasks(case_id);
CREATE INDEX IF NOT EXISTS idx_followup_tasks_patient ON followup_tasks(patient_id);
CREATE INDEX IF NOT EXISTS idx_followup_tasks_worker ON followup_tasks(assigned_asha_id, status);
CREATE INDEX IF NOT EXISTS idx_followup_tasks_due_status ON followup_tasks(due_date, status);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_user_id, sent_at DESC);
