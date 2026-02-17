-- GameGuard Database Schema
DROP TABLE IF EXISTS trusted_entities CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS gaming_accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gaming_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) DEFAULT 'steam',
    platform_user_id VARCHAR(255),
    steam_id VARCHAR(255),
    display_name VARCHAR(255),
    avatar_url TEXT,
    access_token TEXT,
    linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_sync TIMESTAMP,
    UNIQUE(user_id, platform)
);

CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES gaming_accounts(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) DEFAULT 'login',
    ip_address VARCHAR(45),
    country VARCHAR(100),
    city VARCHAR(100),
    device_info TEXT,
    is_suspicious BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    account_id INTEGER REFERENCES gaming_accounts(id) ON DELETE CASCADE,
    alert_type VARCHAR(50),
    severity VARCHAR(20) DEFAULT 'low',
    status VARCHAR(20) DEFAULT 'pending',
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP
);

CREATE TABLE trusted_entities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50),
    entity_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, entity_type, entity_value)
);

CREATE INDEX idx_activities_account_id ON activities(account_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_gaming_accounts_user_id ON gaming_accounts(user_id);

SELECT 'Database schema created successfully!' as message;
