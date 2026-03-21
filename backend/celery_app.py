"""
Celery Configuration for URADI-360 OSINT Layer

This module configures Celery for distributed task processing of OSINT data.
"""

import os
from celery import Celery
from celery.signals import task_failure, task_success
from datetime import timedelta

# Configure Celery app
celery_app = Celery(
    'uradi360',
    broker=os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
    backend=os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0'),
    include=[
        'tasks.osint_tasks',
        'tasks.ingestion_tasks',
        'tasks.classification_tasks',
        'tasks.embedding_tasks',
        'tasks.alert_tasks',
        'tasks.brief_tasks',
    ]
)

# Celery configuration
celery_app.conf.update(
    # Task settings
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Africa/Lagos',
    enable_utc=True,

    # Task execution
    task_always_eager=False,  # Set to True for testing
    task_store_eager_result=False,
    task_ignore_result=False,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour max per task
    task_soft_time_limit=3000,  # Soft limit 50 minutes

    # Worker settings
    worker_prefetch_multiplier=1,  # One task at a time per worker
    worker_max_tasks_per_child=1000,  # Restart worker after 1000 tasks

    # Result backend
    result_expires=timedelta(days=7),
    result_extended=True,

    # Retry settings
    task_default_retry_delay=60,  # 1 minute
    task_max_retries=3,

    # Queue configuration
    task_routes={
        'tasks.ingestion_tasks.*': {'queue': 'ingestion'},
        'tasks.classification_tasks.*': {'queue': 'classification'},
        'tasks.embedding_tasks.*': {'queue': 'embedding'},
        'tasks.alert_tasks.*': {'queue': 'alerts'},
        'tasks.brief_tasks.*': {'queue': 'briefs'},
        'tasks.osint_tasks.*': {'queue': 'default'},
    },

    # Beat schedule (periodic tasks)
    beat_schedule={
        'fetch-news-every-15-minutes': {
            'task': 'tasks.ingestion_tasks.fetch_all_news_sources',
            'schedule': timedelta(minutes=15),
            'options': {'queue': 'ingestion'},
        },
        'fetch-social-every-5-minutes': {
            'task': 'tasks.ingestion_tasks.fetch_all_social_sources',
            'schedule': timedelta(minutes=5),
            'options': {'queue': 'ingestion'},
        },
        'process-pending-mentions': {
            'task': 'tasks.osint_tasks.process_pending_mentions',
            'schedule': timedelta(minutes=2),
            'options': {'queue': 'default'},
        },
        'generate-embeddings': {
            'task': 'tasks.embedding_tasks.generate_pending_embeddings',
            'schedule': timedelta(minutes=10),
            'options': {'queue': 'embedding'},
        },
        'check-alerts': {
            'task': 'tasks.alert_tasks.check_all_alert_conditions',
            'schedule': timedelta(minutes=3),
            'options': {'queue': 'alerts'},
        },
        'generate-daily-brief': {
            'task': 'tasks.brief_tasks.generate_daily_brief',
            'schedule': timedelta(hours=6),  # Every 6 hours, actual logic checks if needed
            'options': {'queue': 'briefs'},
        },
        'cleanup-old-data': {
            'task': 'tasks.osint_tasks.cleanup_old_osint_data',
            'schedule': timedelta(days=1),  # Daily at midnight
            'options': {'queue': 'default'},
        },
    },
)


@task_failure.connect
def handle_task_failure(sender=None, task_id=None, exception=None, args=None, kwargs=None, traceback=None, einfo=None, **kw):
    """Handle task failures - log to monitoring, alert if critical."""
    from celery.utils.log import get_task_logger
    logger = get_task_logger(__name__)

    logger.error(f"Task {sender.name} ({task_id}) failed: {exception}")

    # TODO: Send to error tracking service (Sentry, etc.)
    # TODO: Alert on-call if critical task


@task_success.connect
def handle_task_success(sender=None, result=None, **kwargs):
    """Handle task success - update metrics."""
    from celery.utils.log import get_task_logger
    logger = get_task_logger(__name__)

    logger.info(f"Task {sender.name} completed successfully")


if __name__ == '__main__':
    celery_app.start()
