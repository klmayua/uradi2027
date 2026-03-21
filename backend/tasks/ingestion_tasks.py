"""
OSINT Ingestion Tasks

Tasks for collecting data from external sources (news, social media, government feeds).
"""

import asyncio
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from urllib.parse import urlparse

from celery_app import celery_app

try:
    from database import AsyncSessionLocal
    from models_osint import OSINTSource, OSINTMention
except ImportError:
    AsyncSessionLocal = None


@celery_app.task(bind=True, max_retries=3, default_retry_delay=300)
def fetch_all_news_sources(self):
    """Fetch from all active news sources."""
    import asyncio

    async def _fetch():
        if not AsyncSessionLocal:
            return {"status": "error", "message": "Database not configured"}

        async with AsyncSessionLocal() as session:
            from sqlalchemy import select, and_

            # Get all active news sources
            result = await session.execute(
                select(OSINTSource)
                .where(and_(
                    OSINTSource.source_type == "news",
                    OSINTSource.is_active == True
                ))
            )
            sources = result.scalars().all()

            if not sources:
                return {"status": "success", "message": "No active news sources", "fetched": 0}

            # Trigger fetch for each source
            task_ids = []
            for source in sources:
                # Check if it's time to fetch
                if source.last_fetch_at:
                    next_fetch = source.last_fetch_at + timedelta(minutes=source.fetch_interval_minutes)
                    if datetime.utcnow() < next_fetch:
                        continue

                task = fetch_source.delay(str(source.id))
                task_ids.append(task.id)

            return {
                "status": "success",
                "sources_triggered": len(task_ids),
                "task_ids": task_ids
            }

    return asyncio.run(_fetch())


@celery_app.task(bind=True, max_retries=3, default_retry_delay=300)
def fetch_all_social_sources(self):
    """Fetch from all active social media sources."""
    import asyncio

    async def _fetch():
        if not AsyncSessionLocal:
            return {"status": "error", "message": "Database not configured"}

        async with AsyncSessionLocal() as session:
            from sqlalchemy import select, and_

            result = await session.execute(
                select(OSINTSource)
                .where(and_(
                    OSINTSource.source_type == "social",
                    OSINTSource.is_active == True
                ))
            )
            sources = result.scalars().all()

            if not sources:
                return {"status": "success", "message": "No active social sources", "fetched": 0}

            task_ids = []
            for source in sources:
                if source.last_fetch_at:
                    next_fetch = source.last_fetch_at + timedelta(minutes=source.fetch_interval_minutes)
                    if datetime.utcnow() < next_fetch:
                        continue

                task = fetch_source.delay(str(source.id))
                task_ids.append(task.id)

            return {
                "status": "success",
                "sources_triggered": len(task_ids),
                "task_ids": task_ids
            }

    return asyncio.run(_fetch())


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def fetch_source(self, source_id: str):
    """
    Fetch data from a specific source.

    Args:
        source_id: UUID of the source to fetch from
    """
    import asyncio

    async def _fetch():
        if not AsyncSessionLocal:
            return {"status": "error", "message": "Database not configured"}

        async with AsyncSessionLocal() as session:
            from sqlalchemy import select

            # Get source configuration
            result = await session.execute(
                select(OSINTSource).where(OSINTSource.id == source_id)
            )
            source = result.scalar_one_or_none()

            if not source:
                return {"status": "error", "message": f"Source {source_id} not found"}

            # Update fetch status
            source.last_fetch_at = datetime.utcnow()
            source.last_fetch_status = "processing"
            await session.commit()

            try:
                # Route to appropriate fetcher based on source type
                if source.source_type == "news":
                    mentions = await _fetch_news_source(source, session)
                elif source.source_type == "social":
                    mentions = await _fetch_social_source(source, session)
                elif source.source_type == "government":
                    mentions = await _fetch_government_source(source, session)
                else:
                    mentions = await _fetch_custom_source(source, session)

                # Update source status
                source.last_fetch_status = "success"
                await session.commit()

                # Queue mentions for processing
                from .osint_tasks import full_mention_pipeline
                for mention in mentions:
                    full_mention_pipeline.delay(str(mention.id))

                return {
                    "status": "success",
                    "source_id": source_id,
                    "mentions_collected": len(mentions)
                }

            except Exception as e:
                source.last_fetch_status = "failed"
                source.last_error = str(e)
                await session.commit()
                raise self.retry(exc=e)

    return asyncio.run(_fetch())


async def _fetch_news_source(source: OSINTSource, session) -> List[OSINTMention]:
    """Fetch from a news source."""
    from scrapers.news_scraper import NewsScraper

    scraper = NewsScraper(source.config)
    articles = await scraper.fetch_articles(source.source_url)

    mentions = []
    for article in articles:
        mention = OSINTMention(
            tenant_id=source.tenant_id,
            source_id=source.id,
            external_id=article.get("id"),
            content_hash=_compute_content_hash(article.get("content", "")),
            title=article.get("title"),
            content=article.get("content"),
            url=article.get("url"),
            author=article.get("author"),
            published_at=article.get("published_at", datetime.utcnow()),
            language=article.get("language", "en"),
            partition_key=datetime.utcnow().strftime("%Y-%m")
        )
        session.add(mention)
        mentions.append(mention)

    await session.commit()
    return mentions


async def _fetch_social_source(source: OSINTSource, session) -> List[OSINTMention]:
    """Fetch from a social media source."""
    from scrapers.social_scraper import SocialScraper

    scraper = SocialScraper(source.config)
    posts = await scraper.fetch_posts(
        api_key=source.api_key_encrypted,
        search_terms=source.config.get("search_terms", [])
    )

    mentions = []
    for post in posts:
        mention = OSINTMention(
            tenant_id=source.tenant_id,
            source_id=source.id,
            external_id=post.get("id"),
            content_hash=_compute_content_hash(post.get("content", "")),
            content=post.get("content"),
            url=post.get("url"),
            author=post.get("author_name"),
            author_handle=post.get("author_handle"),
            published_at=post.get("published_at", datetime.utcnow()),
            language=post.get("language", "en"),
            engagement_metrics=post.get("engagement", {}),
            partition_key=datetime.utcnow().strftime("%Y-%m")
        )
        session.add(mention)
        mentions.append(mention)

    await session.commit()
    return mentions


async def _fetch_government_source(source: OSINTSource, session) -> List[OSINTMention]:
    """Fetch from a government source."""
    from scrapers.government_scraper import GovernmentScraper

    scraper = GovernmentScraper(source.config)
    documents = await scraper.fetch_documents(source.source_url)

    mentions = []
    for doc in documents:
        mention = OSINTMention(
            tenant_id=source.tenant_id,
            source_id=source.id,
            external_id=doc.get("id"),
            content_hash=_compute_content_hash(doc.get("content", "")),
            title=doc.get("title"),
            content=doc.get("content"),
            url=doc.get("url"),
            author=doc.get("author"),
            published_at=doc.get("published_at", datetime.utcnow()),
            language=doc.get("language", "en"),
            partition_key=datetime.utcnow().strftime("%Y-%m")
        )
        session.add(mention)
        mentions.append(mention)

    await session.commit()
    return mentions


async def _fetch_custom_source(source: OSINTSource, session) -> List[OSINTMention]:
    """Fetch from a custom source."""
    # Custom sources implement their own fetch logic
    from scrapers.custom_scraper import CustomScraper

    scraper = CustomScraper(source.config)
    items = await scraper.fetch(source.source_url)

    mentions = []
    for item in items:
        mention = OSINTMention(
            tenant_id=source.tenant_id,
            source_id=source.id,
            external_id=item.get("id"),
            content_hash=_compute_content_hash(item.get("content", "")),
            title=item.get("title"),
            content=item.get("content"),
            url=item.get("url"),
            author=item.get("author"),
            published_at=item.get("published_at", datetime.utcnow()),
            language=item.get("language", "en"),
            partition_key=datetime.utcnow().strftime("%Y-%m")
        )
        session.add(mention)
        mentions.append(mention)

    await session.commit()
    return mentions


def _compute_content_hash(content: str) -> str:
    """Compute SimHash or regular hash for content deduplication."""
    # For now, use SHA-256. In production, implement SimHash for fuzzy matching
    return hashlib.sha256(content.encode('utf-8')).hexdigest()


@celery_app.task(bind=True)
def test_source_connection(self, source_id: str):
    """Test connection to a source without fetching data."""
    import asyncio

    async def _test():
        if not AsyncSessionLocal:
            return {"status": "error", "message": "Database not configured"}

        async with AsyncSessionLocal() as session:
            from sqlalchemy import select

            result = await session.execute(
                select(OSINTSource).where(OSINTSource.id == source_id)
            )
            source = result.scalar_one_or_none()

            if not source:
                return {"status": "error", "message": "Source not found"}

            # Test connection based on source type
            try:
                if source.source_type == "news":
                    from scrapers.news_scraper import NewsScraper
                    scraper = NewsScraper(source.config)
                    healthy = await scraper.health_check(source.source_url)
                elif source.source_type == "social":
                    from scrapers.social_scraper import SocialScraper
                    scraper = SocialScraper(source.config)
                    healthy = await scraper.health_check(source.api_key_encrypted)
                else:
                    healthy = True  # Assume OK for other types

                return {
                    "status": "success",
                    "source_id": source_id,
                    "healthy": healthy,
                    "message": "Connection successful" if healthy else "Connection failed"
                }

            except Exception as e:
                return {
                    "status": "error",
                    "source_id": source_id,
                    "healthy": False,
                    "message": str(e)
                }

    return asyncio.run(_test())
