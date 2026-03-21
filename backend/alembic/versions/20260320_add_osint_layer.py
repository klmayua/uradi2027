"""
Add OSINT Layer Tables

Revision ID: 20260320_add_osint_layer
Revises: 20260316_create_mvp_tables
Create Date: 2026-03-20 08:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20260320_add_osint_layer'
down_revision = '20260316_create_mvp_tables'
branch_labels = None
depends_on = None


def upgrade():
    # Create osint_sources table
    op.create_table(
        'osint_sources',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('tenant_id', sa.String(), sa.ForeignKey('tenants.id'), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('source_type', sa.String(), nullable=False),  # news, social, government, traditional, custom
        sa.Column('source_url', sa.String()),
        sa.Column('api_endpoint', sa.String()),
        sa.Column('api_key_encrypted', sa.String()),  # Encrypted API key
        sa.Column('config', postgresql.JSONB(), default={}),
        sa.Column('fetch_interval_minutes', sa.Integer(), default=15),
        sa.Column('last_fetch_at', sa.DateTime(timezone=True)),
        sa.Column('last_fetch_status', sa.String(), default='pending'),  # pending, success, failed
        sa.Column('last_error', sa.Text()),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('priority', sa.Integer(), default=5),  # 1-10, higher = more important
        sa.Column('language_filter', postgresql.JSONB(), default=['en', 'ha', 'yo', 'ig']),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # Create indexes for osint_sources
    op.create_index('idx_osint_source_tenant', 'osint_sources', ['tenant_id'])
    op.create_index('idx_osint_source_type', 'osint_sources', ['source_type'])
    op.create_index('idx_osint_source_active', 'osint_sources', ['is_active', 'last_fetch_at'])

    # Create osint_mentions table (partitioned by month for performance)
    op.create_table(
        'osint_mentions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('tenant_id', sa.String(), sa.ForeignKey('tenants.id'), nullable=False),
        sa.Column('source_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('osint_sources.id'), nullable=False),
        sa.Column('external_id', sa.String()),  # ID from source (tweet ID, article ID, etc.)
        sa.Column('content_hash', sa.String(64), nullable=False),  # SimHash for deduplication
        sa.Column('title', sa.String(500)),
        sa.Column('content', sa.Text()),
        sa.Column('content_summary', sa.String(1000)),  # AI-generated summary
        sa.Column('url', sa.String(1000)),
        sa.Column('author', sa.String(255)),
        sa.Column('author_handle', sa.String(255)),  # @username for social
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('collected_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('language', sa.String(10), default='en'),

        # Classification fields
        sa.Column('sentiment_score', sa.Float()),  # -1.0 to +1.0
        sa.Column('sentiment_label', sa.String(20)),  # very_negative, negative, neutral, positive, very_positive
        sa.Column('urgency_score', sa.Integer()),  # 0-100
        sa.Column('urgency_label', sa.String(20)),  # low, medium, high, critical
        sa.Column('stance_towards_candidate', sa.String(20)),  # opposing, neutral, supporting, mixed
        sa.Column('topics', postgresql.JSONB(), default=[]),
        sa.Column('entities_mentioned', postgresql.JSONB(), default=[]),  # Extracted entities
        sa.Column('lga_mentioned', postgresql.JSONB(), default=[]),  # LGAs referenced in content

        # AI processing status
        sa.Column('ai_processed', sa.Boolean(), default=False),
        sa.Column('ai_processed_at', sa.DateTime(timezone=True)),
        sa.Column('ai_model_version', sa.String(50)),

        # Embedding status
        sa.Column('embedding_generated', sa.Boolean(), default=False),
        sa.Column('embedding_model', sa.String(50)),
        sa.Column('embedding_vector_id', sa.String(100)),  # Reference to Qdrant

        # Engagement metrics (for social sources)
        sa.Column('engagement_metrics', postgresql.JSONB(), default={}),  # likes, shares, comments, reach

        # Deduplication
        sa.Column('is_duplicate', sa.Boolean(), default=False),
        sa.Column('duplicate_of_id', postgresql.UUID(as_uuid=True)),
        sa.Column('similarity_score', sa.Float()),  # Similarity to duplicate

        # Status
        sa.Column('status', sa.String(20), default='pending'),  # pending, processed, archived, flagged
        sa.Column('flag_reason', sa.String(100)),  # spam, misinformation, duplicate, etc.

        # Partition key
        sa.Column('partition_key', sa.String(7), nullable=False),  # YYYY-MM format
    )

    # Create indexes for osint_mentions
    op.create_index('idx_mention_tenant_published', 'osint_mentions', ['tenant_id', 'published_at'])
    op.create_index('idx_mention_source', 'osint_mentions', ['source_id'])
    op.create_index('idx_mention_content_hash', 'osint_mentions', ['content_hash'])
    op.create_index('idx_mention_external', 'osint_mentions', ['source_id', 'external_id'])
    op.create_index('idx_mention_sentiment', 'osint_mentions', ['sentiment_score'])
    op.create_index('idx_mention_urgency', 'osint_mentions', ['urgency_score'])
    op.create_index('idx_mention_status', 'osint_mentions', ['status', 'ai_processed'])
    op.create_index('idx_mention_partition', 'osint_mentions', ['partition_key'])
    op.create_index('idx_mention_entities', 'osint_mentions', ['entities_mentioned'], postgresql_using='gin')
    op.create_index('idx_mention_topics', 'osint_mentions', ['topics'], postgresql_using='gin')

    # Create osint_alerts table
    op.create_table(
        'osint_alerts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('tenant_id', sa.String(), sa.ForeignKey('tenants.id'), nullable=False),
        sa.Column('alert_type', sa.String(50), nullable=False),  # sentiment_crash, volume_spike, crisis_detected, narrative_shift, security_incident
        sa.Column('severity', sa.String(20), default='medium'),  # low, medium, high, critical
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('triggered_by_mention_ids', postgresql.JSONB(), default=[]),
        sa.Column('affected_lgas', postgresql.JSONB(), default=[]),
        sa.Column('metrics_snapshot', postgresql.JSONB(), default={}),  # Store relevant metrics at time of alert
        sa.Column('recommended_actions', postgresql.JSONB(), default=[]),

        # Alert status
        sa.Column('status', sa.String(20), default='open'),  # open, acknowledged, resolved, dismissed
        sa.Column('acknowledged_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id')),
        sa.Column('acknowledged_at', sa.DateTime(timezone=True)),
        sa.Column('resolved_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id')),
        sa.Column('resolved_at', sa.DateTime(timezone=True)),
        sa.Column('resolution_notes', sa.Text()),

        # Notification tracking
        sa.Column('notifications_sent', postgresql.JSONB(), default=[]),  # Track which channels notified
        sa.Column('notification_sent_at', sa.DateTime(timezone=True)),

        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # Create indexes for osint_alerts
    op.create_index('idx_alert_tenant_created', 'osint_alerts', ['tenant_id', 'created_at'])
    op.create_index('idx_alert_type', 'osint_alerts', ['alert_type'])
    op.create_index('idx_alert_severity', 'osint_alerts', ['severity'])
    op.create_index('idx_alert_status', 'osint_alerts', ['status'])

    # Create narrative_clusters table
    op.create_table(
        'narrative_clusters',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('tenant_id', sa.String(), sa.ForeignKey('tenants.id'), nullable=False),
        sa.Column('cluster_label', sa.String(100)),  # HDBSCAN cluster label
        sa.Column('narrative_title', sa.String(500)),  # AI-generated title
        sa.Column('narrative_summary', sa.Text()),  # AI-generated summary
        sa.Column('key_themes', postgresql.JSONB(), default=[]),
        sa.Column('sentiment_trend', sa.String(20)),  # improving, stable, declining
        sa.Column('mention_count', sa.Integer(), default=0),
        sa.Column('first_mention_at', sa.DateTime(timezone=True)),
        sa.Column('last_mention_at', sa.DateTime(timezone=True)),
        sa.Column('affected_lgas', postgresql.JSONB(), default=[]),
        sa.Column('representative_mention_ids', postgresql.JSONB(), default=[]),  # Sample mentions
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # Create indexes for narrative_clusters
    op.create_index('idx_cluster_tenant', 'narrative_clusters', ['tenant_id'])
    op.create_index('idx_cluster_active', 'narrative_clusters', ['is_active', 'last_mention_at'])

    # Create daily_briefs table
    op.create_table(
        'daily_briefs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('tenant_id', sa.String(), sa.ForeignKey('tenants.id'), nullable=False),
        sa.Column('brief_date', sa.Date(), nullable=False),
        sa.Column('period_start', sa.DateTime(timezone=True), nullable=False),
        sa.Column('period_end', sa.DateTime(timezone=True), nullable=False),

        # Summary statistics
        sa.Column('total_mentions', sa.Integer(), default=0),
        sa.Column('unique_sources', sa.Integer(), default=0),
        sa.Column('avg_sentiment', sa.Float()),
        sa.Column('sentiment_change', sa.Float()),  # Change from previous period

        # Content
        sa.Column('headline_summary', sa.Text()),  # AI-generated headline summary
        sa.Column('key_developments', postgresql.JSONB(), default=[]),
        sa.Column('top_narratives', postgresql.JSONB(), default=[]),
        sa.Column('emerging_threats', postgresql.JSONB(), default=[]),
        sa.Column('opposition_activity', postgresql.JSONB(), default={}),
        sa.Column('media_coverage_analysis', postgresql.JSONB(), default={}),

        # Engagement
        sa.Column('top_performing_content', postgresql.JSONB(), default=[]),
        sa.Column('influencer_mentions', postgresql.JSONB(), default=[]),

        # Recommendations
        sa.Column('strategic_recommendations', postgresql.JSONB(), default=[]),
        sa.Column('recommended_actions', postgresql.JSONB(), default=[]),

        # Status
        sa.Column('status', sa.String(20), default='draft'),  # draft, generating, ready, sent
        sa.Column('generated_by', sa.String(50), default='ai'),  # ai, manual, hybrid
        sa.Column('sent_at', sa.DateTime(timezone=True)),
        sa.Column('sent_to', postgresql.JSONB(), default=[]),

        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # Create indexes for daily_briefs
    op.create_index('idx_brief_tenant_date', 'daily_briefs', ['tenant_id', 'brief_date'], unique=True)
    op.create_index('idx_brief_status', 'daily_briefs', ['status'])

    # Create osint_processing_queue table (for Celery job tracking)
    op.create_table(
        'osint_processing_queue',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('tenant_id', sa.String(), sa.ForeignKey('tenants.id'), nullable=False),
        sa.Column('mention_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('osint_mentions.id')),
        sa.Column('job_type', sa.String(50), nullable=False),  # classify, embed, enrich, alert_check
        sa.Column('priority', sa.Integer(), default=5),
        sa.Column('status', sa.String(20), default='pending'),  # pending, processing, completed, failed
        sa.Column('worker_id', sa.String(100)),  # Celery worker ID
        sa.Column('started_at', sa.DateTime(timezone=True)),
        sa.Column('completed_at', sa.DateTime(timezone=True)),
        sa.Column('error_message', sa.Text()),
        sa.Column('retry_count', sa.Integer(), default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # Create indexes for processing queue
    op.create_index('idx_queue_status_priority', 'osint_processing_queue', ['status', 'priority', 'created_at'])
    op.create_index('idx_queue_mention', 'osint_processing_queue', ['mention_id'])

    # Create osint_metrics table (time-series aggregation)
    op.create_table(
        'osint_metrics',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('tenant_id', sa.String(), sa.ForeignKey('tenants.id'), nullable=False),
        sa.Column('metric_type', sa.String(50), nullable=False),  # sentiment, volume, engagement, reach
        sa.Column('metric_name', sa.String(100), nullable=False),  # avg_sentiment, mention_count, etc.
        sa.Column('metric_value', sa.Float(), nullable=False),
        sa.Column('dimensions', postgresql.JSONB(), default={}),  # {source_type: 'news', lga: 'Kano Municipal'}
        sa.Column('bucket_size', sa.String(20), nullable=False),  # hour, day, week
        sa.Column('period_start', sa.DateTime(timezone=True), nullable=False),
        sa.Column('period_end', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )

    # Create indexes for metrics
    op.create_index('idx_metrics_tenant_type', 'osint_metrics', ['tenant_id', 'metric_type', 'period_start'])
    op.create_index('idx_metrics_dimensions', 'osint_metrics', ['dimensions'], postgresql_using='gin')


def downgrade():
    # Drop tables in reverse order
    op.drop_table('osint_metrics')
    op.drop_table('osint_processing_queue')
    op.drop_table('daily_briefs')
    op.drop_table('narrative_clusters')
    op.drop_table('osint_alerts')
    op.drop_table('osint_mentions')
    op.drop_table('osint_sources')
