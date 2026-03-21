"""
OSINT Layer Models for URADI-360

These models extend the core models.py with Open Source Intelligence capabilities.
Import these alongside the main models.
"""

from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey, Float, Index, Date, event
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

# Import Base from database module
try:
    from database import Base
except ImportError:
    from sqlalchemy.ext.declarative import declarative_base
    Base = declarative_base()

# Import sanitization utilities
try:
    from utils.sanitization import sanitize_text, sanitize_url, sanitize_json
except ImportError:
    def sanitize_text(text): return text
    def sanitize_url(url): return url
    def sanitize_json(data): return data


class OSINTSource(Base):
    """Configuration for OSINT data sources (news sites, social media, government feeds)."""
    __tablename__ = "osint_sources"

    __table_args__ = (
        Index('idx_osint_source_tenant', 'tenant_id'),
        Index('idx_osint_source_type', 'source_type'),
        Index('idx_osint_source_active', 'is_active', 'last_fetch_at'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    name = Column(String, nullable=False)
    source_type = Column(String, nullable=False)  # news, social, government, traditional, custom
    source_url = Column(String)
    api_endpoint = Column(String)
    api_key_encrypted = Column(String)  # Encrypted API key
    config = Column(JSONB, default={})
    fetch_interval_minutes = Column(Integer, default=15)
    last_fetch_at = Column(DateTime(timezone=True))
    last_fetch_status = Column(String, default="pending")
    last_error = Column(Text)
    is_active = Column(Boolean, default=True)
    priority = Column(Integer, default=5)
    language_filter = Column(JSONB, default=["en", "ha", "yo", "ig"])
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    tenant = relationship("Tenant")
    mentions = relationship("OSINTMention", back_populates="source", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<OSINTSource {self.name} ({self.source_type})>"


class OSINTMention(Base):
    """Individual mentions collected from OSINT sources (articles, posts, etc.)."""
    __tablename__ = "osint_mentions"

    __table_args__ = (
        Index('idx_mention_tenant_published', 'tenant_id', 'published_at'),
        Index('idx_mention_source', 'source_id'),
        Index('idx_mention_content_hash', 'content_hash'),
        Index('idx_mention_external', 'source_id', 'external_id'),
        Index('idx_mention_sentiment', 'sentiment_score'),
        Index('idx_mention_urgency', 'urgency_score'),
        Index('idx_mention_status', 'status', 'ai_processed'),
        Index('idx_mention_partition', 'partition_key'),
        Index('idx_mention_entities', 'entities_mentioned', postgresql_using='gin'),
        Index('idx_mention_topics', 'topics', postgresql_using='gin'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    source_id = Column(UUID(as_uuid=True), ForeignKey("osint_sources.id"), nullable=False)

    # Source identification
    external_id = Column(String)  # ID from source (tweet ID, article ID, etc.)
    content_hash = Column(String(64), nullable=False)  # SimHash for deduplication

    # Content
    title = Column(String(500))
    content = Column(Text)
    content_summary = Column(String(1000))  # AI-generated summary
    url = Column(String(1000))
    author = Column(String(255))
    author_handle = Column(String(255))  # @username for social
    published_at = Column(DateTime(timezone=True), nullable=False)
    collected_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    language = Column(String(10), default="en")

    # AI Classification
    sentiment_score = Column(Float)  # -1.0 to +1.0
    sentiment_label = Column(String(20))  # very_negative, negative, neutral, positive, very_positive
    urgency_score = Column(Integer)  # 0-100
    urgency_label = Column(String(20))  # low, medium, high, critical
    stance_towards_candidate = Column(String(20))  # opposing, neutral, supporting, mixed
    topics = Column(JSONB, default=[])
    entities_mentioned = Column(JSONB, default=[])  # Extracted entities
    lga_mentioned = Column(JSONB, default=[])  # LGAs referenced

    # AI processing metadata
    ai_processed = Column(Boolean, default=False)
    ai_processed_at = Column(DateTime(timezone=True))
    ai_model_version = Column(String(50))

    # Embedding status
    embedding_generated = Column(Boolean, default=False)
    embedding_model = Column(String(50))
    embedding_vector_id = Column(String(100))  # Reference to Qdrant

    # Engagement metrics (for social sources)
    engagement_metrics = Column(JSONB, default={})  # likes, shares, comments, reach

    # Deduplication
    is_duplicate = Column(Boolean, default=False)
    duplicate_of_id = Column(UUID(as_uuid=True), ForeignKey("osint_mentions.id"))
    similarity_score = Column(Float)

    # Status
    status = Column(String(20), default="pending")  # pending, processed, archived, flagged
    flag_reason = Column(String(100))

    # Partition key for time-based partitioning
    partition_key = Column(String(7), nullable=False)  # YYYY-MM format

    # Relationships
    tenant = relationship("Tenant")
    source = relationship("OSINTSource", back_populates="mentions")
    duplicate_of = relationship("OSINTMention", remote_side=[id])

    def __repr__(self):
        return f"<OSINTMention {self.title[:50] if self.title else 'No title'}...>"


class OSINTAlert(Base):
    """Automated alerts for significant OSINT events (crisis detection, sentiment shifts)."""
    __tablename__ = "osint_alerts"

    __table_args__ = (
        Index('idx_alert_tenant_created', 'tenant_id', 'created_at'),
        Index('idx_alert_type', 'alert_type'),
        Index('idx_alert_severity', 'severity'),
        Index('idx_alert_status', 'status'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)

    # Alert classification
    alert_type = Column(String(50), nullable=False)  # sentiment_crash, volume_spike, crisis_detected, narrative_shift, security_incident
    severity = Column(String(20), default="medium")  # low, medium, high, critical
    title = Column(String(500), nullable=False)
    description = Column(Text)

    # Context
    triggered_by_mention_ids = Column(JSONB, default=[])
    affected_lgas = Column(JSONB, default=[])
    metrics_snapshot = Column(JSONB, default={})
    recommended_actions = Column(JSONB, default=[])

    # Status tracking
    status = Column(String(20), default="open")  # open, acknowledged, resolved, dismissed
    acknowledged_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    acknowledged_at = Column(DateTime(timezone=True))
    resolved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    resolved_at = Column(DateTime(timezone=True))
    resolution_notes = Column(Text)

    # Notification tracking
    notifications_sent = Column(JSONB, default=[])
    notification_sent_at = Column(DateTime(timezone=True))

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    tenant = relationship("Tenant")
    acknowledger = relationship("User", foreign_keys=[acknowledged_by])
    resolver = relationship("User", foreign_keys=[resolved_by])

    def __repr__(self):
        return f"<OSINTAlert {self.alert_type}: {self.title[:50]}...>"


class NarrativeCluster(Base):
    """AI-detected narrative clusters from mention embeddings."""
    __tablename__ = "narrative_clusters"

    __table_args__ = (
        Index('idx_cluster_tenant', 'tenant_id'),
        Index('idx_cluster_active', 'is_active', 'last_mention_at'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)

    # Cluster metadata
    cluster_label = Column(String(100))  # HDBSCAN cluster label
    narrative_title = Column(String(500))  # AI-generated title
    narrative_summary = Column(Text)  # AI-generated summary
    key_themes = Column(JSONB, default=[])

    # Analysis
    sentiment_trend = Column(String(20))  # improving, stable, declining
    mention_count = Column(Integer, default=0)
    first_mention_at = Column(DateTime(timezone=True))
    last_mention_at = Column(DateTime(timezone=True))
    affected_lgas = Column(JSONB, default=[])
    representative_mention_ids = Column(JSONB, default=[])

    # Status
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    tenant = relationship("Tenant")

    def __repr__(self):
        return f"<NarrativeCluster {self.narrative_title[:50] if self.narrative_title else 'Unnamed'}...>"


class DailyBrief(Base):
    """AI-generated daily intelligence briefs."""
    __tablename__ = "daily_briefs"

    __table_args__ = (
        Index('idx_brief_tenant_date', 'tenant_id', 'brief_date', unique=True),
        Index('idx_brief_status', 'status'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)

    # Period
    brief_date = Column(Date, nullable=False)
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)

    # Statistics
    total_mentions = Column(Integer, default=0)
    unique_sources = Column(Integer, default=0)
    avg_sentiment = Column(Float)
    sentiment_change = Column(Float)

    # AI-generated content
    headline_summary = Column(Text)
    key_developments = Column(JSONB, default=[])
    top_narratives = Column(JSONB, default=[])
    emerging_threats = Column(JSONB, default=[])
    opposition_activity = Column(JSONB, default={})
    media_coverage_analysis = Column(JSONB, default={})

    # Engagement highlights
    top_performing_content = Column(JSONB, default=[])
    influencer_mentions = Column(JSONB, default=[])

    # Recommendations
    strategic_recommendations = Column(JSONB, default=[])
    recommended_actions = Column(JSONB, default=[])

    # Status
    status = Column(String(20), default="draft")  # draft, generating, ready, sent
    generated_by = Column(String(50), default="ai")  # ai, manual, hybrid
    sent_at = Column(DateTime(timezone=True))
    sent_to = Column(JSONB, default=[])

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    tenant = relationship("Tenant")

    def __repr__(self):
        return f"<DailyBrief {self.brief_date}: {self.headline_summary[:50] if self.headline_summary else 'No summary'}...>"


class OSINTProcessingQueue(Base):
    """Queue for Celery background processing jobs."""
    __tablename__ = "osint_processing_queue"

    __table_args__ = (
        Index('idx_queue_status_priority', 'status', 'priority', 'created_at'),
        Index('idx_queue_mention', 'mention_id'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    mention_id = Column(UUID(as_uuid=True), ForeignKey("osint_mentions.id"))
    job_type = Column(String(50), nullable=False)  # classify, embed, enrich, alert_check
    priority = Column(Integer, default=5)
    status = Column(String(20), default="pending")  # pending, processing, completed, failed
    worker_id = Column(String(100))
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    error_message = Column(Text)
    retry_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    tenant = relationship("Tenant")
    mention = relationship("OSINTMention")

    def __repr__(self):
        return f"<OSINTProcessingQueue {self.job_type}: {self.status}>"


class OSINTMetrics(Base):
    """Time-series metrics for OSINT analytics."""
    __tablename__ = "osint_metrics"

    __table_args__ = (
        Index('idx_metrics_tenant_type', 'tenant_id', 'metric_type', 'period_start'),
        Index('idx_metrics_dimensions', 'dimensions', postgresql_using='gin'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    metric_type = Column(String(50), nullable=False)  # sentiment, volume, engagement, reach
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Float, nullable=False)
    dimensions = Column(JSONB, default={})  # {source_type: 'news', lga: 'Kano Municipal'}
    bucket_size = Column(String(20), nullable=False)  # hour, day, week
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    tenant = relationship("Tenant")

    def __repr__(self):
        return f"<OSINTMetrics {self.metric_name}: {self.metric_value}>"


# Event listeners for data sanitization
@event.listens_for(OSINTMention, 'before_insert')
@event.listens_for(OSINTMention, 'before_update')
def sanitize_mention_data(mapper, connection, target):
    """Sanitize mention data before saving."""
    if target.title:
        target.title = sanitize_text(target.title)[:500]
    if target.content:
        target.content = sanitize_text(target.content)
    if target.content_summary:
        target.content_summary = sanitize_text(target.content_summary)[:1000]
    if target.url:
        target.url = sanitize_url(target.url)[:1000]
    if target.author:
        target.author = sanitize_text(target.author)[:255]
    if target.author_handle:
        target.author_handle = sanitize_text(target.author_handle)[:255]


@event.listens_for(OSINTAlert, 'before_insert')
@event.listens_for(OSINTAlert, 'before_update')
def sanitize_alert_data(mapper, connection, target):
    """Sanitize alert data before saving."""
    if target.title:
        target.title = sanitize_text(target.title)[:500]
    if target.description:
        target.description = sanitize_text(target.description)
    if target.resolution_notes:
        target.resolution_notes = sanitize_text(target.resolution_notes)


@event.listens_for(NarrativeCluster, 'before_insert')
@event.listens_for(NarrativeCluster, 'before_update')
def sanitize_cluster_data(mapper, connection, target):
    """Sanitize cluster data before saving."""
    if target.narrative_title:
        target.narrative_title = sanitize_text(target.narrative_title)[:500]
    if target.narrative_summary:
        target.narrative_summary = sanitize_text(target.narrative_summary)


@event.listens_for(DailyBrief, 'before_insert')
@event.listens_for(DailyBrief, 'before_update')
def sanitize_brief_data(mapper, connection, target):
    """Sanitize brief data before saving."""
    if target.headline_summary:
        target.headline_summary = sanitize_text(target.headline_summary)
