"""
OSINT Orchestration Tasks

Core task orchestration for the OSINT pipeline.
"""

import asyncio
from datetime import datetime, timedelta
from typing import List, Optional
from celery import chain, group, chord
from celery.exceptions import MaxRetriesExceededError

from celery_app import celery_app

# Database imports (using async SQLAlchemy)
try:
    from database import AsyncSessionLocal
    from models_osint import OSINTMention, OSINTProcessingQueue, OSINTMetrics
except ImportError:
    # Fallback for development
    AsyncSessionLocal = None


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def process_pending_mentions(self, batch_size: int = 100):
    """
    Process pending mentions through the full pipeline.

    This task:
    1. Fetches unprocessed mentions from queue
    2. Runs classification (sentiment, entities, topics)
    3. Generates embeddings
    4. Checks for alerts
    5. Updates metrics

    Args:
        batch_size: Number of mentions to process per run
    """
    import asyncio

    async def _process():
        if not AsyncSessionLocal:
            return {"status": "error", "message": "Database not configured"}

        async with AsyncSessionLocal() as session:
            # Fetch pending queue items
            from sqlalchemy import select, and_
            from models_osint import OSINTProcessingQueue

            result = await session.execute(
                select(OSINTProcessingQueue)
                .where(and_(
                    OSINTProcessingQueue.status == "pending",
                    OSINTProcessingQueue.retry_count < 3
                ))
                .order_by(OSINTProcessingQueue.priority.desc(),
                         OSINTProcessingQueue.created_at)
                .limit(batch_size)
            )
            queue_items = result.scalars().all()

            if not queue_items:
                return {"status": "success", "processed": 0, "message": "No pending items"}

            processed_count = 0
            failed_count = 0

            for item in queue_items:
                try:
                    # Update status to processing
                    item.status = "processing"
                    item.started_at = datetime.utcnow()
                    item.worker_id = self.request.id
                    await session.commit()

                    # Route to appropriate task based on job_type
                    if item.job_type == "classify":
                        await _process_classification(item, session)
                    elif item.job_type == "embed":
                        await _process_embedding(item, session)
                    elif item.job_type == "enrich":
                        await _process_enrichment(item, session)
                    elif item.job_type == "alert_check":
                        await _process_alert_check(item, session)

                    # Mark as completed
                    item.status = "completed"
                    item.completed_at = datetime.utcnow()
                    processed_count += 1

                except Exception as e:
                    item.status = "failed"
                    item.error_message = str(e)
                    item.retry_count += 1
                    failed_count += 1

                await session.commit()

            return {
                "status": "success",
                "processed": processed_count,
                "failed": failed_count,
                "total": len(queue_items)
            }

    return asyncio.run(_process())


async def _process_classification(item, session):
    """Process classification job."""
    from .classification_tasks import classify_mention
    classify_mention.delay(str(item.mention_id))


async def _process_embedding(item, session):
    """Process embedding generation job."""
    from .embedding_tasks import generate_embedding
    generate_embedding.delay(str(item.mention_id))


async def _process_enrichment(item, session):
    """Process entity enrichment job."""
    from .classification_tasks import extract_entities
    extract_entities.delay(str(item.mention_id))


async def _process_alert_check(item, session):
    """Process alert check job."""
    from .alert_tasks import check_mention_for_alerts
    check_mention_for_alerts.delay(str(item.mention_id))


@celery_app.task(bind=True, max_retries=3, default_retry_delay=300)
def full_mention_pipeline(self, mention_id: str):
    """
    Run a mention through the complete processing pipeline.

    This chains all processing steps:
    classify → embed → enrich → alert_check

    Args:
        mention_id: UUID of the mention to process
    """
    from .classification_tasks import classify_mention, extract_entities
    from .embedding_tasks import generate_embedding
    from .alert_tasks import check_mention_for_alerts

    # Create processing chain
    pipeline = chain(
        classify_mention.s(mention_id),
        extract_entities.s(),
        generate_embedding.s(),
        check_mention_for_alerts.s()
    )

    # Execute pipeline
    result = pipeline.apply_async()

    return {
        "status": "pipeline_started",
        "mention_id": mention_id,
        "task_id": result.id
    }


@celery_app.task(bind=True, max_retries=3, default_retry_delay=3600)
def cleanup_old_osint_data(self, retention_days: int = 90):
    """
    Clean up old OSINT data based on retention policy.

    Args:
        retention_days: Number of days to retain data (default 90)
    """
    import asyncio

    async def _cleanup():
        if not AsyncSessionLocal:
            return {"status": "error", "message": "Database not configured"}

        cutoff_date = datetime.utcnow() - timedelta(days=retention_days)

        async with AsyncSessionLocal() as session:
            from sqlalchemy import delete, and_
            from models_osint import OSINTMention, OSINTProcessingQueue, OSINTMetrics

            # Archive old mentions (set status to archived)
            from sqlalchemy import update
            result = await session.execute(
                update(OSINTMention)
                .where(and_(
                    OSINTMention.published_at < cutoff_date,
                    OSINTMention.status != "archived"
                ))
                .values(status="archived")
            )
            archived_count = result.rowcount

            # Delete old processing queue items
            result = await session.execute(
                delete(OSINTProcessingQueue)
                .where(OSINTProcessingQueue.created_at < cutoff_date)
            )
            queue_deleted = result.rowcount

            # Delete old metrics (keep aggregated data longer)
            metrics_cutoff = datetime.utcnow() - timedelta(days=retention_days * 2)
            result = await session.execute(
                delete(OSINTMetrics)
                .where(OSINTMetrics.period_start < metrics_cutoff)
            )
            metrics_deleted = result.rowcount

            await session.commit()

            return {
                "status": "success",
                "archived_mentions": archived_count,
                "deleted_queue_items": queue_deleted,
                "deleted_metrics": metrics_deleted,
                "cutoff_date": cutoff_date.isoformat()
            }

    return asyncio.run(_cleanup())


@celery_app.task(bind=True, max_retries=3)
def update_tenant_metrics(self, tenant_id: str, metric_type: str):
    """
    Update aggregated metrics for a tenant.

    Args:
        tenant_id: Tenant identifier
        metric_type: Type of metrics to update (sentiment, volume, engagement)
    """
    import asyncio

    async def _update():
        if not AsyncSessionLocal:
            return {"status": "error", "message": "Database not configured"}

        async with AsyncSessionLocal() as session:
            from sqlalchemy import select, func, and_
            from models_osint import OSINTMention, OSINTMetrics

            now = datetime.utcnow()
            hour_start = now.replace(minute=0, second=0, microsecond=0)
            hour_end = hour_start + timedelta(hours=1)

            if metric_type == "sentiment":
                # Calculate average sentiment for the hour
                result = await session.execute(
                    select(
                        func.avg(OSINTMention.sentiment_score).label("avg_sentiment"),
                        func.count().label("count")
                    )
                    .where(and_(
                        OSINTMention.tenant_id == tenant_id,
                        OSINTMention.published_at >= hour_start,
                        OSINTMention.published_at < hour_end,
                        OSINTMention.ai_processed == True
                    ))
                )
                row = result.one()

                if row.count > 0:
                    metric = OSINTMetrics(
                        tenant_id=tenant_id,
                        metric_type="sentiment",
                        metric_name="avg_sentiment",
                        metric_value=row.avg_sentiment or 0,
                        dimensions={"period": "hour"},
                        bucket_size="hour",
                        period_start=hour_start,
                        period_end=hour_end
                    )
                    session.add(metric)
                    await session.commit()

            elif metric_type == "volume":
                # Count mentions by source type
                result = await session.execute(
                    select(
                        OSINTSource.source_type,
                        func.count().label("count")
                    )
                    .join(OSINTMention.source)
                    .where(and_(
                        OSINTMention.tenant_id == tenant_id,
                        OSINTMention.published_at >= hour_start,
                        OSINTMention.published_at < hour_end
                    ))
                    .group_by(OSINTSource.source_type)
                )

                for row in result.all():
                    metric = OSINTMetrics(
                        tenant_id=tenant_id,
                        metric_type="volume",
                        metric_name="mention_count",
                        metric_value=row.count,
                        dimensions={"source_type": row.source_type, "period": "hour"},
                        bucket_size="hour",
                        period_start=hour_start,
                        period_end=hour_end
                    )
                    session.add(metric)

                await session.commit()

            return {
                "status": "success",
                "tenant_id": tenant_id,
                "metric_type": metric_type,
                "period": hour_start.isoformat()
            }

    return asyncio.run(_update())


@celery_app.task(bind=True)
def health_check(self):
    """Health check task for monitoring Celery workers."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "worker": self.request.hostname
    }
