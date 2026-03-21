from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey, func, Float, event, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

# Import Base from database module
try:
    from database import Base
except ImportError:
    # Fallback if database module is not available
    from sqlalchemy.ext.declarative import declarative_base
    Base = declarative_base()

# Import sanitization utilities
try:
    from utils.sanitization import (
        sanitize_sentiment_text,
        sanitize_content_body,
        sanitize_report_body,
        sanitize_incident_description,
        sanitize_notes,
        sanitize_phone_number,
        sanitize_email,
        sanitize_vin
    )
except ImportError:
    # Fallback if utils not available
    def sanitize_sentiment_text(text): return text
    def sanitize_content_body(text): return text
    def sanitize_report_body(text): return text
    def sanitize_incident_description(text): return text
    def sanitize_notes(text): return text
    def sanitize_phone_number(phone): return phone
    def sanitize_email(email): return email
    def sanitize_vin(vin): return vin

class Tenant(Base):
    __tablename__ = "tenants"
    
    id = Column(String, primary_key=True)
    display_name = Column(String, nullable=False)
    state = Column(String, nullable=False)
    tier = Column(String, nullable=False)
    candidate_name = Column(String)
    candidate_party = Column(String)
    lga_count = Column(Integer)
    config = Column(JSONB, default={})
    status = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), default=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"))
    email = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String)
    role = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    assigned_lga = Column(String)
    active = Column(Boolean, default=True)
    last_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=func.now())

    # OAuth fields
    oauth_provider = Column(String, nullable=True)  # 'google', 'facebook', etc.
    oauth_id = Column(String, nullable=True)  # Provider's user ID
    profile_picture = Column(String, nullable=True)  # URL to profile image

    tenant = relationship("Tenant")

class LGA(Base):
    __tablename__ = "lgas"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"))
    name = Column(String, nullable=False)
    code = Column(String)
    population = Column(Integer)
    geo_json = Column(JSONB)
    created_at = Column(DateTime(timezone=True), default=func.now())
    
    tenant = relationship("Tenant")

class Ward(Base):
    __tablename__ = "wards"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"))
    lga_id = Column(UUID(as_uuid=True), ForeignKey("lgas.id"))
    name = Column(String, nullable=False)
    polling_units = Column(Integer)
    registered_voters = Column(Integer)
    created_at = Column(DateTime(timezone=True), default=func.now())
    
    tenant = relationship("Tenant")
    lga = relationship("LGA")

class Voter(Base):
    __tablename__ = "voters"

    # Indexes for performance
    __table_args__ = (
        Index('idx_voter_tenant_lga', 'tenant_id', 'lga_id'),
        Index('idx_voter_tenant_ward', 'tenant_id', 'ward_id'),
        Index('idx_voter_sentiment', 'sentiment_score'),
        Index('idx_voter_phone', 'phone'),
        Index('idx_voter_party', 'party_leaning'),
        Index('idx_voter_created', 'created_at'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String)
    lga_id = Column(UUID(as_uuid=True), ForeignKey("lgas.id"))
    ward_id = Column(UUID(as_uuid=True), ForeignKey("wards.id"))
    gender = Column(String)
    age_range = Column(String)
    occupation = Column(String)
    language_pref = Column(String, default="ha")
    party_leaning = Column(String)
    sentiment_score = Column(Integer, default=0)
    persuadability = Column(Integer, default=50)
    contact_count = Column(Integer, default=0)
    last_contacted = Column(DateTime(timezone=True))
    source = Column(String)
    tags = Column(JSONB, default=[])
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    tenant = relationship("Tenant")
    lga = relationship("LGA")
    ward = relationship("Ward")

# Event listener to sanitize voter data before insert/update
@event.listens_for(Voter, 'before_insert')
@event.listens_for(Voter, 'before_update')
def sanitize_voter_data(mapper, connection, target):
    """Sanitize voter data before saving to database"""
    if target.phone:
        target.phone = sanitize_phone_number(target.phone)
    if target.notes:
        target.notes = sanitize_notes(target.notes)

class AnchorCitizen(Base):
    __tablename__ = "anchor_citizens"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"))
    voter_id = Column(UUID(as_uuid=True), ForeignKey("voters.id"))
    lga_id = Column(UUID(as_uuid=True), ForeignKey("lgas.id"))
    ward_id = Column(UUID(as_uuid=True), ForeignKey("wards.id"))
    influence_level = Column(Integer)
    community_role = Column(String)
    reports_submitted = Column(Integer, default=0)
    stipend_status = Column(String, default="pending")
    active = Column(Boolean, default=True)
    recruited_at = Column(DateTime(timezone=True), default=func.now())
    
    tenant = relationship("Tenant")
    voter = relationship("Voter")
    lga = relationship("LGA")
    ward = relationship("Ward")

class PoliticalActor(Base):
    __tablename__ = "political_actors"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"))
    full_name = Column(String, nullable=False)
    title = Column(String)
    party = Column(String)
    lga_id = Column(UUID(as_uuid=True), ForeignKey("lgas.id"))
    influence_type = Column(String)
    influence_level = Column(Integer)
    loyalty = Column(String)
    faction = Column(String)
    vulnerability_notes = Column(Text)
    contact_info = Column(JSONB, default={})
    last_assessed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now())
    
    tenant = relationship("Tenant")
    lga = relationship("LGA")

class SentimentEntry(Base):
    __tablename__ = "sentiment_entries"

    # Indexes for performance
    __table_args__ = (
        Index('idx_sentiment_tenant_created', 'tenant_id', 'created_at'),
        Index('idx_sentiment_source', 'source'),
        Index('idx_sentiment_score', 'score'),
        Index('idx_sentiment_processed', 'processed'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    source = Column(String, nullable=False)
    lga_id = Column(UUID(as_uuid=True), ForeignKey("lgas.id"))
    ward_id = Column(UUID(as_uuid=True), ForeignKey("wards.id"))
    raw_text = Column(Text)
    sentiment = Column(String)
    score = Column(Float)
    topics = Column(JSONB, default=[])
    language = Column(String)
    respondent_phone = Column(String)
    processed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=func.now())

    tenant = relationship("Tenant")
    lga = relationship("LGA")
    ward = relationship("Ward")

# Event listener to sanitize sentiment data
@event.listens_for(SentimentEntry, 'before_insert')
@event.listens_for(SentimentEntry, 'before_update')
def sanitize_sentiment_data(mapper, connection, target):
    """Sanitize sentiment entry data before saving"""
    if target.raw_text:
        target.raw_text = sanitize_sentiment_text(target.raw_text)
    if target.respondent_phone:
        target.respondent_phone = sanitize_phone_number(target.respondent_phone)

class ContentItem(Base):
    __tablename__ = "content_items"

    # Indexes for performance
    __table_args__ = (
        Index('idx_content_tenant_status', 'tenant_id', 'status'),
        Index('idx_content_created', 'created_at'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    title = Column(String, nullable=False)
    body = Column(Text)
    content_type = Column(String)
    language = Column(String, default="ha")
    platform = Column(String)
    status = Column(String, default="draft")
    scheduled_at = Column(DateTime(timezone=True))
    published_at = Column(DateTime(timezone=True))
    engagement = Column(JSONB, default={})
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), default=func.now())

    tenant = relationship("Tenant")
    creator = relationship("User")

# Event listener to sanitize content data
@event.listens_for(ContentItem, 'before_insert')
@event.listens_for(ContentItem, 'before_update')
def sanitize_content_data(mapper, connection, target):
    """Sanitize content item data before saving"""
    if target.body:
        target.body = sanitize_content_body(target.body)

class ScorecardEntry(Base):
    __tablename__ = "scorecard_entries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"))
    period = Column(String, nullable=False)
    sector = Column(String, nullable=False)
    metric_name = Column(String, nullable=False)
    incumbent_value = Column(Float)
    benchmark_value = Column(Float)
    grade = Column(String)
    narrative = Column(Text)
    data_source = Column(String)
    published = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=func.now())
    
    tenant = relationship("Tenant")

class MessageLog(Base):
    __tablename__ = "messages_log"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"))
    channel = Column(String, nullable=False)
    template_name = Column(String)
    recipients_count = Column(Integer)
    delivered = Column(Integer, default=0)
    read_count = Column(Integer, default=0)
    reply_count = Column(Integer, default=0)
    lga_filter = Column(String)
    segment_filter = Column(JSONB)
    sent_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    sent_at = Column(DateTime(timezone=True), default=func.now())
    
    tenant = relationship("Tenant")
    sender = relationship("User")

class IntelligenceReport(Base):
    __tablename__ = "intelligence_reports"

    # Indexes for performance
    __table_args__ = (
        Index('idx_report_tenant_created', 'tenant_id', 'created_at'),
        Index('idx_report_priority', 'priority'),
        Index('idx_report_type', 'report_type'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    title = Column(String, nullable=False)
    report_type = Column(String)
    body = Column(Text, nullable=False)
    priority = Column(String, default="normal")
    attachments = Column(JSONB, default=[])
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), default=func.now())

    tenant = relationship("Tenant")
    creator = relationship("User")

# Event listener to sanitize intelligence report data
@event.listens_for(IntelligenceReport, 'before_insert')
@event.listens_for(IntelligenceReport, 'before_update')
def sanitize_intelligence_report_data(mapper, connection, target):
    """Sanitize intelligence report data before saving"""
    if target.body:
        target.body = sanitize_report_body(target.body)
    if target.title:
        target.title = sanitize_notes(target.title)[:200]  # Limit title length


class Scenario(Base):
    __tablename__ = "scenarios"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"))
    title = Column(String, nullable=False)
    description = Column(Text)
    probability = Column(Float)  # 0.00 to 1.00
    impact = Column(String)  # positive, negative, neutral
    variables = Column(JSONB, default={})  # key factors driving scenario
    our_response = Column(Text)  # strategic response plan
    vote_projection = Column(JSONB, default={})  # {candidate: votes} estimates
    status = Column(String, default="active")  # active, resolved, superseded
    last_assessed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=func.now())
    
    tenant = relationship("Tenant")


class CoalitionPartner(Base):
    __tablename__ = "coalition_partners"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"))
    party = Column(String, nullable=False)
    leader_name = Column(String, nullable=False)
    commitment_level = Column(Integer)  # 1-10
    lgas_responsible = Column(JSONB, default=[])  # List of LGA IDs
    resources_pledged = Column(JSONB, default={})  # {resource_type: amount}
    resources_delivered = Column(JSONB, default={})  # {resource_type: amount}
    health_status = Column(String, default="stable")  # strong, stable, fragile, at_risk
    last_contact_at = Column(DateTime(timezone=True))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now())
    
    tenant = relationship("Tenant")


class PollingUnit(Base):
    __tablename__ = "polling_units"

    # Indexes for performance
    __table_args__ = (
        Index('idx_pu_tenant_lga', 'tenant_id', 'lga_id'),
        Index('idx_pu_tenant_ward', 'tenant_id', 'ward_id'),
        Index('idx_pu_code', 'pu_code'),
        Index('idx_pu_status', 'status'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    lga_id = Column(UUID(as_uuid=True), ForeignKey("lgas.id"))
    ward_id = Column(UUID(as_uuid=True), ForeignKey("wards.id"))
    pu_code = Column(String, nullable=False)  # e.g., "001", "002"
    pu_name = Column(String)  # e.g., "Primary School"
    registered_voters = Column(Integer, default=0)
    accredited_voters = Column(Integer, default=0)
    votes_cast = Column(Integer, default=0)
    latitude = Column(Float)
    longitude = Column(Float)
    status = Column(String, default="active")  # active, closed, suspended
    created_at = Column(DateTime(timezone=True), default=func.now())

    tenant = relationship("Tenant")
    lga = relationship("LGA")
    ward = relationship("Ward")


class MonitorAssignment(Base):
    __tablename__ = "monitor_assignments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    polling_unit_id = Column(UUID(as_uuid=True), ForeignKey("polling_units.id"))
    assignment_date = Column(DateTime(timezone=True), default=func.now())
    check_in_at = Column(DateTime(timezone=True))
    check_in_lat = Column(Float)
    check_in_lng = Column(Float)
    check_in_verified = Column(Boolean, default=False)
    check_out_at = Column(DateTime(timezone=True))
    status = Column(String, default="assigned")  # assigned, checked_in, checked_out, completed
    notes = Column(Text)
    
    tenant = relationship("Tenant")
    user = relationship("User")
    polling_unit = relationship("PollingUnit")


class AccreditationRecord(Base):
    __tablename__ = "accreditation_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"))
    polling_unit_id = Column(UUID(as_uuid=True), ForeignKey("polling_units.id"))
    monitor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    time_slot = Column(String)  # 08:00, 10:00, 12:00, 14:00, 16:00
    accredited_count = Column(Integer, default=0)
    bvas_functional = Column(Boolean, default=True)
    queue_length = Column(String)  # short, medium, long
    issues_reported = Column(JSONB, default=[])
    photo_url = Column(String)
    recorded_at = Column(DateTime(timezone=True), default=func.now())
    
    tenant = relationship("Tenant")
    polling_unit = relationship("PollingUnit")
    monitor = relationship("User")


class VoteTally(Base):
    __tablename__ = "vote_tallies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"))
    polling_unit_id = Column(UUID(as_uuid=True), ForeignKey("polling_units.id"))
    monitor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    candidate_name = Column(String, nullable=False)
    party = Column(String, nullable=False)
    votes_received = Column(Integer, default=0)
    is_incumbent = Column(Boolean, default=False)
    photo_url = Column(String)  # Photo of result sheet
    recorded_at = Column(DateTime(timezone=True), default=func.now())
    verified = Column(Boolean, default=False)
    
    tenant = relationship("Tenant")
    polling_unit = relationship("PollingUnit")
    monitor = relationship("User")


class ElectionDayIncident(Base):
    __tablename__ = "election_day_incidents"

    # Indexes for performance
    __table_args__ = (
        Index('idx_incident_tenant_reported', 'tenant_id', 'reported_at'),
        Index('idx_incident_severity', 'severity'),
        Index('idx_incident_status', 'status'),
        Index('idx_incident_polling_unit', 'polling_unit_id'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    polling_unit_id = Column(UUID(as_uuid=True), ForeignKey("polling_units.id"))
    monitor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    incident_type = Column(String, nullable=False)  # violence, ballot_snatching, bribery, accreditation_issue, materials_shortage, other
    severity = Column(String, default="medium")  # low, medium, high, critical
    description = Column(Text, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    photos = Column(JSONB, default=[])
    status = Column(String, default="reported")  # reported, acknowledged, resolved, escalated
    reported_at = Column(DateTime(timezone=True), default=func.now())
    resolved_at = Column(DateTime(timezone=True))
    resolution_notes = Column(Text)

    tenant = relationship("Tenant")
    polling_unit = relationship("PollingUnit")
    monitor = relationship("User")

# Event listener to sanitize incident data
@event.listens_for(ElectionDayIncident, 'before_insert')
@event.listens_for(ElectionDayIncident, 'before_update')
def sanitize_incident_data(mapper, connection, target):
    """Sanitize incident data before saving"""
    if target.description:
        target.description = sanitize_incident_description(target.description)
    if target.resolution_notes:
        target.resolution_notes = sanitize_notes(target.resolution_notes)


class BudgetItem(Base):
    __tablename__ = "budget_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"))
    fiscal_year = Column(String, nullable=False)
    sector = Column(String, nullable=False)  # education, health, infrastructure, security, agriculture, etc.
    category = Column(String, nullable=False)  # capital, recurrent
    description = Column(Text, nullable=False)
    budgeted_amount = Column(Float, nullable=False)
    released_amount = Column(Float, default=0)
    spent_amount = Column(Float, default=0)
    delivery_status = Column(String, default="not_started")  # not_started, in_progress, completed, abandoned
    lga_id = Column(String)  # Optional - for LGA-specific budgets
    source = Column(String)  # budget_document, foia, public_report
    source_url = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now())
    
    tenant = relationship("Tenant")