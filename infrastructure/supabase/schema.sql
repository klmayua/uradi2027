-- =============================================================================
-- URADI-360 Database Schema
-- Production-Ready with RLS Policies
-- Generated: 2026-03-21
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =============================================================================
-- TENANTS (Campaigns/Organizations)
-- =============================================================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#1E3A5F',
    secondary_color VARCHAR(7) DEFAULT '#D4AF37',
    website VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    subscription_tier VARCHAR(20) DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'professional', 'enterprise')),
    subscription_status VARCHAR(20) DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'suspended', 'cancelled')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    max_users INTEGER DEFAULT 50,
    max_voters INTEGER DEFAULT 500000,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE tenants IS 'Multi-tenant campaigns/organizations';

-- =============================================================================
-- USERS & AUTHENTICATION
-- =============================================================================

-- Extended user profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(30) DEFAULT 'field_agent' CHECK (role IN ('superadmin', 'admin', 'strategist', 'coordinator', 'analyst', 'field_agent', 'monitor', 'content_manager', 'finance_manager')),
    department VARCHAR(50),
    lga_of_origin VARCHAR(50),
    ward_of_origin VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Extended user profiles with role-based access';

-- User preferences/settings
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}'::jsonb,
    dashboard_layout JSONB DEFAULT '{}',
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Africa/Lagos',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Audit log for user actions
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    tenant_id UUID REFERENCES tenants(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for audit logs
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =============================================================================
-- VOTER DATA
-- =============================================================================

CREATE TABLE voters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    voter_id VARCHAR(50),  -- PVC number
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other', 'unknown')),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    lga VARCHAR(50) NOT NULL,
    ward VARCHAR(50) NOT NULL,
    polling_unit VARCHAR(100),
    occupation VARCHAR(100),
    education_level VARCHAR(50),
    party_affiliation VARCHAR(50),
    voting_history JSONB DEFAULT '{}',
    sentiment_score DECIMAL(3,2),  -- -1.0 to 1.0
    priority_score INTEGER DEFAULT 50,  -- 0-100
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_contact_at TIMESTAMP WITH TIME ZONE,
    last_contact_by UUID REFERENCES auth.users(id),
    UNIQUE(tenant_id, voter_id)
);

-- Create indexes for voters
CREATE INDEX idx_voters_tenant ON voters(tenant_id);
CREATE INDEX idx_voters_lga ON voters(lga);
CREATE INDEX idx_voters_ward ON voters(ward);
CREATE INDEX idx_voters_sentiment ON voters(sentiment_score);
CREATE INDEX idx_voters_priority ON voters(priority_score DESC);
CREATE INDEX idx_voters_party ON voters(party_affiliation);

-- Full-text search for voters
ALTER TABLE voters ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', COALESCE(first_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(last_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(phone, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(address, '')), 'C')
    ) STORED;

CREATE INDEX idx_voters_search ON voters USING gin(search_vector);

-- =============================================================================
-- VOTER INTERACTIONS
-- =============================================================================

CREATE TABLE voter_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES voters(id) ON DELETE CASCADE,
    contacted_by UUID REFERENCES auth.users(id),
    contact_type VARCHAR(30) CHECK (contact_type IN ('phone', 'sms', 'whatsapp', 'email', 'in_person', 'door_knock', 'rally', 'meeting')),
    contact_outcome VARCHAR(30) CHECK (contact_outcome IN ('connected', 'no_answer', 'busy', 'wrong_number', 'not_interested', 'refused', 'callback_requested', 'pledged_support', 'converted', 'other')),
    notes TEXT,
    sentiment VARCHAR(20) CHECK (sentiment IN ('very_positive', 'positive', 'neutral', 'negative', 'very_negative')),
    gps_location POINT,
    photo_url TEXT,
    duration_seconds INTEGER,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_voter_contacts_tenant ON voter_contacts(tenant_id);
CREATE INDEX idx_voter_contacts_voter ON voter_contacts(voter_id);
CREATE INDEX idx_voter_contacts_date ON voter_contacts(created_at);

-- =============================================================================
-- FIELD OPERATIONS
-- =============================================================================

CREATE TABLE field_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    supervisor_id UUID REFERENCES auth.users(id),
    lga_assigned VARCHAR(50),
    ward_assigned VARCHAR(50),
    daily_target_contacts INTEGER DEFAULT 50,
    gps_tracking_enabled BOOLEAN DEFAULT true,
    last_location POINT,
    last_location_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    device_id VARCHAR(100),
    app_version VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE field_agent_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES field_agents(id) ON DELETE CASCADE,
    location POINT NOT NULL,
    accuracy_meters DECIMAL(8,2),
    battery_level INTEGER,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_field_agent_tracking_agent ON field_agent_tracking(agent_id);
CREATE INDEX idx_field_agent_tracking_time ON field_agent_tracking(recorded_at);

-- =============================================================================
-- ELECTION DATA
-- =============================================================================

CREATE TABLE elections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    election_type VARCHAR(30) CHECK (election_type IN ('presidential', 'gubernatorial', 'senatorial', 'house_of_reps', 'state_assembly', 'local_government', 'council_ward', 'chairmanship')),
    election_date DATE NOT NULL,
    state VARCHAR(50),
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'postponed')),
    total_registered_voters INTEGER,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE polling_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
    pu_code VARCHAR(50) UNIQUE NOT NULL,  -- INEC PU code
    name VARCHAR(200) NOT NULL,
    lga VARCHAR(50) NOT NULL,
    ward VARCHAR(50) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    registered_voters INTEGER DEFAULT 0,
    accredited_voters INTEGER,
    votes_cast INTEGER,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_polling_units_lga ON polling_units(lga);
CREATE INDEX idx_polling_units_ward ON polling_units(ward);

CREATE TABLE election_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
    polling_unit_id UUID REFERENCES polling_units(id),
    lga VARCHAR(50),
    ward VARCHAR(50),
    party VARCHAR(50) NOT NULL,
    votes INTEGER NOT NULL DEFAULT 0,
    is_official BOOLEAN DEFAULT false,
    reported_by UUID REFERENCES auth.users(id),
    verified_by UUID REFERENCES auth.users(id),
    evidence_photo_url TEXT,
    evidence_video_url TEXT,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'disputed', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_election_results_election ON election_results(election_id);
CREATE INDEX idx_election_results_pu ON election_results(polling_unit_id);

-- =============================================================================
-- OSINT (Open Source Intelligence)
-- =============================================================================

CREATE TABLE osint_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    source_type VARCHAR(50) CHECK (source_type IN ('news', 'social_media', 'government', 'blog', 'forum', 'custom')),
    platform VARCHAR(50) CHECK (platform IN ('twitter', 'facebook', 'instagram', 'reddit', 'rss', 'api', 'web_scrape')),
    url TEXT,
    api_key_encrypted TEXT,
    api_secret_encrypted TEXT,
    configuration JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_fetch_at TIMESTAMP WITH TIME ZONE,
    fetch_frequency_minutes INTEGER DEFAULT 60,
    reliability_score DECIMAL(3,2),  -- 0.0 to 1.0
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE osint_mentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    source_id UUID REFERENCES osint_sources(id),
    external_id VARCHAR(255),  -- ID from source platform
    content TEXT NOT NULL,
    content_hash VARCHAR(64) UNIQUE,  -- SHA-256 hash for deduplication
    author VARCHAR(200),
    author_id VARCHAR(100),
    platform VARCHAR(50),
    url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sentiment_score DECIMAL(3,2),  -- -1.0 to 1.0
    sentiment_label VARCHAR(20),  -- positive, negative, neutral, mixed
    engagement_metrics JSONB DEFAULT '{}',  -- likes, shares, comments, etc.
    language VARCHAR(10) DEFAULT 'en',
    tags TEXT[],
    entities JSONB DEFAULT '{}',  -- extracted entities (people, organizations, locations)
    is_processed BOOLEAN DEFAULT false,
    embedding vector(1536)  -- For semantic search
);

CREATE INDEX idx_osint_mentions_tenant ON osint_mentions(tenant_id);
CREATE INDEX idx_osint_mentions_source ON osint_mentions(source_id);
CREATE INDEX idx_osint_mentions_sentiment ON osint_mentions(sentiment_score);
CREATE INDEX idx_osint_mentions_published ON osint_mentions(published_at);
CREATE INDEX idx_osint_mentions_embedding ON osint_mentions USING ivfflat (embedding vector_cosine_ops);

-- OSINT Alerts
CREATE TABLE osint_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) CHECK (alert_type IN ('sentiment_spike', 'viral_content', 'negative_mention', 'competitor_mention', 'crisis_detected', 'trending_topic')),
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    mention_ids UUID[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_osint_alerts_tenant ON osint_alerts(tenant_id);
CREATE INDEX idx_osint_alerts_severity ON osint_alerts(severity);
CREATE INDEX idx_osint_alerts_status ON osint_alerts(status);

-- Daily Briefs
CREATE TABLE osint_daily_briefs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    brief_date DATE NOT NULL,
    summary TEXT NOT NULL,
    key_metrics JSONB DEFAULT '{}',
    top_mentions UUID[] DEFAULT '{}',
    sentiment_trend JSONB DEFAULT '{}',
    narrative_analysis TEXT,
    recommendations TEXT[],
    generated_by VARCHAR(50) DEFAULT 'ai',  -- ai, manual, hybrid
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, brief_date)
);

-- =============================================================================
-- POLLS & SURVEYS
-- =============================================================================

CREATE TABLE polls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    poll_type VARCHAR(30) CHECK (poll_type IN ('opinion', 'preference', 'approval', 'tracking', 'exit')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'closed')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    target_responses INTEGER,
    lga_scope TEXT[],  -- NULL = all LGAs
    ward_scope TEXT[],  -- NULL = all wards
    demographic_targets JSONB DEFAULT '{}',
    questions JSONB NOT NULL,  -- Array of questions with options
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE poll_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES voters(id),
    respondent_phone VARCHAR(20),
    answers JSONB NOT NULL,
    lga VARCHAR(50),
    ward VARCHAR(50),
    polling_unit VARCHAR(100),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_by UUID REFERENCES auth.users(id),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8)
);

CREATE INDEX idx_poll_responses_poll ON poll_responses(poll_id);

-- =============================================================================
-- CONTENT & MESSAGING
-- =============================================================================

CREATE TABLE content_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content_type VARCHAR(30) CHECK (content_type IN ('article', 'social_post', 'press_release', 'speech', 'video', 'image', 'infographic', 'document')),
    content TEXT,
    media_urls TEXT[],
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived')),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    target_audience JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE messaging_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    channel VARCHAR(20) CHECK (channel IN ('sms', 'whatsapp', 'email', 'social', 'ivr')),
    subject VARCHAR(500),
    body TEXT NOT NULL,
    variables JSONB DEFAULT '[]',  -- Template variables
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- COALITION & ALLIANCES
-- =============================================================================

CREATE TABLE coalition_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    organization_name VARCHAR(200) NOT NULL,
    organization_type VARCHAR(50) CHECK (organization_type IN ('political_party', 'civil_society', 'labor_union', 'religious_org', 'youth_org', 'women_org', 'professional_assoc', 'community_group', 'other')),
    contact_person VARCHAR(200),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    lga_scope TEXT[],
    ward_scope TEXT[],
    support_level VARCHAR(20) CHECK (support_level IN ('full', 'partial', 'negotiating', 'exploratory')),
    commitments TEXT[],
    deliverables JSONB DEFAULT '{}',
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'terminated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- FINANCE
-- =============================================================================

CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    donor_name VARCHAR(200),
    donor_email VARCHAR(255),
    donor_phone VARCHAR(20),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN',
    donation_type VARCHAR(30) CHECK (donation_type IN ('individual', 'corporate', 'organization', 'anonymous')),
    payment_method VARCHAR(30) CHECK (payment_method IN ('card', 'bank_transfer', 'cash', 'check', 'crypto', 'other')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_reference VARCHAR(100),
    lga VARCHAR(50),
    is_recurring BOOLEAN DEFAULT false,
    recurring_frequency VARCHAR(20),
    notes TEXT,
    thank_you_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE voter_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_agent_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE polling_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE osint_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE osint_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE osint_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE osint_daily_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaging_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE coalition_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see their own profile and profiles in their tenant
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (id = auth.uid() OR tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    ));

-- Voters: Tenant isolation
CREATE POLICY "Tenant isolation for voters" ON voters
    FOR ALL USING (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    ));

-- OSINT: Tenant isolation
CREATE POLICY "Tenant isolation for OSINT" ON osint_mentions
    FOR ALL USING (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    ));

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Update timestamps function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voters_updated_at BEFORE UPDATE ON voters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit logging function
CREATE OR REPLACE FUNCTION audit_log_insert()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, tenant_id, action, resource_type, resource_id, old_values)
        VALUES (auth.uid(), OLD.tenant_id, 'DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, tenant_id, action, resource_type, resource_id, old_values, new_values)
        VALUES (auth.uid(), NEW.tenant_id, 'UPDATE', TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, tenant_id, action, resource_type, resource_id, new_values)
        VALUES (auth.uid(), NEW.tenant_id, 'CREATE', TG_TABLE_NAME, NEW.id, row_to_json(NEW));
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- VIEWS
-- =============================================================================

-- Dashboard summary view
CREATE VIEW dashboard_summary AS
SELECT
    t.id AS tenant_id,
    COUNT(DISTINCT v.id) AS total_voters,
    COUNT(DISTINCT CASE WHEN v.last_contact_at > NOW() - INTERVAL '30 days' THEN v.id END) AS voters_contacted_30d,
    COUNT(DISTINCT fa.id) AS total_agents,
    COUNT(DISTINCT CASE WHEN fa.status = 'active' THEN fa.id END) AS active_agents,
    AVG(v.sentiment_score) AS avg_sentiment,
    COUNT(DISTINCT om.id) FILTER (WHERE om.created_at > NOW() - INTERVAL '24 hours') AS mentions_24h
FROM tenants t
LEFT JOIN voters v ON v.tenant_id = t.id
LEFT JOIN field_agents fa ON fa.tenant_id = t.id
LEFT JOIN osint_mentions om ON om.tenant_id = t.id
GROUP BY t.id;

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Insert default superadmin user (run after creating auth user)
-- INSERT INTO profiles (id, tenant_id, first_name, last_name, role)
-- VALUES ('auth-user-uuid', NULL, 'System', 'Admin', 'superadmin');

-- Insert default messaging templates
INSERT INTO messaging_templates (name, channel, subject, body, category, variables)
VALUES
('Welcome SMS', 'sms', NULL, 'Welcome to {campaign_name}! You are now registered as a supporter. Reply STOP to opt out.', 'onboarding', '["campaign_name"]'),
('Voter Reminder', 'sms', NULL, 'Election Day is {election_date}! Your polling unit is {pu_name}. Polls open 8:30 AM. Vote {candidate_name}!', 'election', '["election_date", "pu_name", "candidate_name"]'),
('Agent Daily Target', 'whatsapp', NULL, 'Good morning {agent_name}! Your target today: {target_contacts} voters. You''ve completed {completed} so far. Keep going! 💪', 'motivation', '["agent_name", "target_contacts", "completed"]');
