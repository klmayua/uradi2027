"""
OSINT Tasks Package

This package contains Celery tasks for the OSINT layer:
- ingestion_tasks: Data collection from sources
- classification_tasks: AI-powered content classification
- embedding_tasks: Vector embedding generation
- alert_tasks: Crisis detection and alerting
- brief_tasks: Daily intelligence brief generation
- osint_tasks: General OSINT orchestration
"""

from .ingestion_tasks import (
    fetch_all_news_sources,
    fetch_all_social_sources,
    fetch_source,
)

from .classification_tasks import (
    classify_mention,
    classify_batch,
    extract_entities,
    analyze_sentiment,
)

from .embedding_tasks import (
    generate_embedding,
    generate_pending_embeddings,
    cluster_narratives,
)

from .alert_tasks import (
    check_all_alert_conditions,
    check_sentiment_crash,
    check_volume_spike,
    check_crisis_detection,
    send_alert_notification,
)

from .brief_tasks import (
    generate_daily_brief,
    send_brief_to_subscribers,
)

from .osint_tasks import (
    process_pending_mentions,
    cleanup_old_osint_data,
    full_mention_pipeline,
)

__all__ = [
    # Ingestion
    'fetch_all_news_sources',
    'fetch_all_social_sources',
    'fetch_source',
    # Classification
    'classify_mention',
    'classify_batch',
    'extract_entities',
    'analyze_sentiment',
    # Embedding
    'generate_embedding',
    'generate_pending_embeddings',
    'cluster_narratives',
    # Alerts
    'check_all_alert_conditions',
    'check_sentiment_crash',
    'check_volume_spike',
    'check_crisis_detection',
    'send_alert_notification',
    # Briefs
    'generate_daily_brief',
    'send_brief_to_subscribers',
    # General
    'process_pending_mentions',
    'cleanup_old_osint_data',
    'full_mention_pipeline',
]
