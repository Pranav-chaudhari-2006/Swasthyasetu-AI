-- SwasthyaSetu MS-10: Offline Sync & Reconciliation Engine Schema
-- Compliant with PostgreSQL 15+ & strict zero-dummy data policy

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS sync_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation_id UUID UNIQUE NOT NULL,
    device_id VARCHAR(100) NOT NULL,
    sequence_number BIGINT NOT NULL,
    actor_id UUID NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(30) NOT NULL,
    client_timestamp TIMESTAMPTZ NOT NULL,
    server_received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(30) NOT NULL DEFAULT 'COMMITTED' CHECK (status IN (
        'COMMITTED', 'DUPLICATE_IGNORED', 'CONFLICT_RESOLVED', 'REJECTED'
    )),
    reconciliation_resolution VARCHAR(50),
    reconciliation_notes TEXT,
    payload JSONB NOT NULL,
    hmac_signature VARCHAR(128) NOT NULL
);

CREATE TABLE IF NOT EXISTS offline_rule_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_tag VARCHAR(50) NOT NULL,
    rules_definition JSONB NOT NULL,
    package_hash VARCHAR(128) NOT NULL,
    package_signature VARCHAR(128) NOT NULL,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Device sync progress tracker
CREATE TABLE IF NOT EXISTS device_sync_states (
    device_id VARCHAR(100) PRIMARY KEY,
    last_synced_sequence BIGINT NOT NULL DEFAULT 0,
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning-fast sync validation and audit
CREATE INDEX IF NOT EXISTS idx_sync_ops_device_seq ON sync_operations(device_id, sequence_number ASC);
CREATE INDEX IF NOT EXISTS idx_sync_ops_entity ON sync_operations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sync_ops_actor ON sync_operations(actor_id, server_received_at DESC);
CREATE INDEX IF NOT EXISTS idx_offline_rules_version ON offline_rule_packages(version_tag);
