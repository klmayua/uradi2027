"""
OSINT Daily Brief Tasks

AI-powered generation of daily intelligence briefs.
"""

import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional

from celery_app import celery_app

try:
    from database import AsyncSessionLocal
    from models_osint import OSINTMention, DailyBrief, NarrativeCluster, OSINTMetrics
    from services.kimi_client import KimiClient
except ImportError:
    AsyncSessionLocal = None
    KimiClient = None


@celery_app.task(bind=True, max_retries=3, default_retry_delay=300)
def generate_daily_brief(self, tenant_id: Optional[str] = None, date: Optional[str] = None):
    """
    Generate daily intelligence brief for a tenant.

    Args:
        tenant_id: Specific tenant, or None for all tenants
        date: Date to generate brief for (YYYY-MM-DD), or None for yesterday
    """
    import asyncio

    async def _generate():
        if not AsyncSessionLocal or not KimiClient:
            return {"status": "error", "message": "Dependencies not configured"}

        # Determine date range
        if date:
            from datetime import date as dt_date
            brief_date = dt_date.fromisoformat(date)
        else:
            brief_date = (datetime.utcnow() - timedelta(days=1)).date()

        period_start = datetime.combine(brief_date, datetime.min.time())
        period_end = period_start + timedelta(days=1)

        async with AsyncSessionLocal() as session:
            from sqlalchemy import select, and_, func

            # Get tenant(s) to generate for
            if tenant_id:
                tenant_ids = [tenant_id]
            else:
                from models import Tenant
                result = await session.execute(
                    select(Tenant.id).where(Tenant.status == "active")
                )
                tenant_ids = [r[0] for r in result.all()]

            generated_briefs = []

            for tid in tenant_ids:
                # Check if brief already exists
                result = await session.execute(
                    select(DailyBrief)
                    .where(and_(
                        DailyBrief.tenant_id == tid,
                        DailyBrief.brief_date == brief_date
                    ))
                )
                existing = result.scalar_one_or_none()

                if existing and existing.status == "ready":
                    continue  # Skip if already generated

                # Gather data for brief
                brief_data = await _gather_brief_data(session, tid, period_start, period_end)

                if brief_data["total_mentions"] == 0:
                    continue  # Skip if no data

                # Generate AI summary
                client = KimiClient()
                ai_summary = await client.generate_brief_summary(brief_data)

                # Create or update brief
                if existing:
                    brief = existing
                    brief.status = "generating"
                else:
                    brief = DailyBrief(
                        tenant_id=tid,
                        brief_date=brief_date,
                        period_start=period_start,
                        period_end=period_end,
                        status="generating"
                    )
                    session.add(brief)

                # Populate brief
                brief.total_mentions = brief_data["total_mentions"]
                brief.unique_sources = brief_data["unique_sources"]
                brief.avg_sentiment = brief_data["avg_sentiment"]
                brief.sentiment_change = brief_data["sentiment_change"]
                brief.headline_summary = ai_summary.get("headline", "")
                brief.key_developments = ai_summary.get("key_developments", [])
                brief.top_narratives = brief_data["top_narratives"]
                brief.emerging_threats = ai_summary.get("emerging_threats", [])
                brief.opposition_activity = brief_data["opposition_activity"]
                brief.media_coverage_analysis = brief_data["media_coverage"]
                brief.top_performing_content = brief_data["top_content"]
                brief.influencer_mentions = brief_data["influencers"]
                brief.strategic_recommendations = ai_summary.get("recommendations", [])
                brief.recommended_actions = ai_summary.get("actions", [])
                brief.status = "ready"
                brief.generated_by = "ai"

                await session.commit()
                generated_briefs.append(str(brief.id))

            return {
                "status": "success",
                "brief_date": brief_date.isoformat(),
                "briefs_generated": len(generated_briefs),
                "brief_ids": generated_briefs
            }

    return asyncio.run(_generate())


async def _gather_brief_data(session, tenant_id: str, period_start: datetime, period_end: datetime) -> Dict:
    """Gather all data needed for a daily brief."""
    from sqlalchemy import select, and_, func, desc

    data = {
        "total_mentions": 0,
        "unique_sources": 0,
        "avg_sentiment": 0,
        "sentiment_change": 0,
        "top_narratives": [],
        "emerging_threats": [],
        "opposition_activity": {},
        "media_coverage": {},
        "top_content": [],
        "influencers": [],
        "mentions_by_topic": {},
        "mentions_by_source": {},
        "mentions_by_lga": {}
    }

    # Get mentions in period
    result = await session.execute(
        select(OSINTMention)
        .where(and_(
            OSINTMention.tenant_id == tenant_id,
            OSINTMention.published_at >= period_start,
            OSINTMention.published_at < period_end,
            OSINTMention.ai_processed == True
        ))
    )
    mentions = result.scalars().all()

    data["total_mentions"] = len(mentions)

    if not mentions:
        return data

    # Calculate sentiment
    sentiment_scores = [m.sentiment_score for m in mentions if m.sentiment_score is not None]
    data["avg_sentiment"] = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0

    # Get previous period for comparison
    prev_start = period_start - timedelta(days=1)
    prev_end = period_start
    result = await session.execute(
        select(func.avg(OSINTMention.sentiment_score))
        .where(and_(
            OSINTMention.tenant_id == tenant_id,
            OSINTMention.published_at >= prev_start,
            OSINTMention.published_at < prev_end,
            OSINTMention.ai_processed == True
        ))
    )
    prev_sentiment = result.scalar() or 0
    data["sentiment_change"] = data["avg_sentiment"] - prev_sentiment

    # Count unique sources
    source_ids = set(m.source_id for m in mentions)
    data["unique_sources"] = len(source_ids)

    # Aggregate by topic
    topic_counts = {}
    for m in mentions:
        for topic in (m.topics or []):
            topic_counts[topic] = topic_counts.get(topic, 0) + 1
    data["mentions_by_topic"] = topic_counts

    # Get top narratives
    result = await session.execute(
        select(NarrativeCluster)
        .where(and_(
            NarrativeCluster.tenant_id == tenant_id,
            NarrativeCluster.last_mention_at >= period_start
        ))
        .order_by(desc(NarrativeCluster.mention_count))
        .limit(5)
    )
    clusters = result.scalars().all()
    data["top_narratives"] = [
        {
            "title": c.narrative_title,
            "summary": c.narrative_summary,
            "mention_count": c.mention_count,
            "sentiment_trend": c.sentiment_trend
        }
        for c in clusters
    ]

    # Get top performing content (by engagement)
    social_mentions = [m for m in mentions if m.engagement_metrics]
    social_mentions.sort(
        key=lambda m: m.engagement_metrics.get("total_engagement", 0),
        reverse=True
    )
    data["top_content"] = [
        {
            "title": m.title,
            "content_preview": (m.content or "")[:200] if m.content else None,
            "engagement": m.engagement_metrics,
            "sentiment": m.sentiment_label
        }
        for m in social_mentions[:5]
    ]

    # Get influencers (authors with multiple mentions)
    author_counts = {}
    for m in mentions:
        if m.author:
            author_counts[m.author] = author_counts.get(m.author, 0) + 1

    top_authors = sorted(author_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    data["influencers"] = [
        {"name": name, "mention_count": count}
        for name, count in top_authors
    ]

    # Opposition activity (mentions with opposing stance)
    opposition = [m for m in mentions if m.stance_towards_candidate == "opposing"]
    data["opposition_activity"] = {
        "mention_count": len(opposition),
        "avg_sentiment": sum(m.sentiment_score for m in opposition if m.sentiment_score) / len(opposition) if opposition else 0,
        "top_topics": _get_top_topics(opposition)
    }

    return data


def _get_top_topics(mentions: List) -> List[str]:
    """Extract top topics from mentions."""
    topic_counts = {}
    for m in mentions:
        for topic in (m.topics or []):
            topic_counts[topic] = topic_counts.get(topic, 0) + 1

    sorted_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)
    return [t[0] for t in sorted_topics[:5]]


@celery_app.task(bind=True, max_retries=3)
def send_brief_to_subscribers(self, brief_id: str):
    """
    Send daily brief to subscribed users.

    Args:
        brief_id: Brief to send
    """
    import asyncio

    async def _send():
        if not AsyncSessionLocal:
            return {"status": "error", "message": "Database not configured"}

        async with AsyncSessionLocal() as session:
            from sqlalchemy import select

            result = await session.execute(
                select(DailyBrief).where(DailyBrief.id == brief_id)
            )
            brief = result.scalar_one_or_none()

            if not brief:
                return {"status": "error", "message": "Brief not found"}

            if brief.status != "ready":
                return {"status": "error", "message": "Brief not ready"}

            # TODO: Get subscribers for tenant
            # TODO: Send via email
            # TODO: Send via WhatsApp/SMS for key stakeholders
            # TODO: Update brief status

            brief.status = "sent"
            brief.sent_at = datetime.utcnow()
            # brief.sent_to = [...]

            await session.commit()

            return {
                "status": "success",
                "brief_id": brief_id,
                "sent_at": brief.sent_at.isoformat()
            }

    return asyncio.run(_send())


@celery_app.task(bind=True, max_retries=3)
def generate_weekly_summary(self, tenant_id: str, week_start: Optional[str] = None):
    """
    Generate weekly summary report.

    Args:
        tenant_id: Tenant to generate for
        week_start: Start of week (YYYY-MM-DD), or None for last week
    """
    import asyncio

    async def _generate():
        if not AsyncSessionLocal:
            return {"status": "error", "message": "Database not configured"}

        # Determine week range
        if week_start:
            from datetime import date as dt_date
            start = datetime.fromisoformat(week_start)
        else:
            start = datetime.utcnow() - timedelta(days=7)
            start = start - timedelta(days=start.weekday())  # Start of week

        end = start + timedelta(days=7)

        async with AsyncSessionLocal() as session:
            # Aggregate daily briefs for the week
            from sqlalchemy import select, and_

            result = await session.execute(
                select(DailyBrief)
                .where(and_(
                    DailyBrief.tenant_id == tenant_id,
                    DailyBrief.brief_date >= start.date(),
                    DailyBrief.brief_date < end.date(),
                    DailyBrief.status == "sent"
                ))
            )
            daily_briefs = result.scalars().all()

            if not daily_briefs:
                return {"status": "skipped", "message": "No daily briefs found for week"}

            # Compile weekly summary
            total_mentions = sum(b.total_mentions for b in daily_briefs)
            avg_sentiment = sum(b.avg_sentiment for b in daily_briefs) / len(daily_briefs)

            # Generate AI summary
            client = KimiClient()
            weekly_summary = await client.generate_weekly_summary(
                daily_briefs=[{
                    "date": b.brief_date.isoformat(),
                    "headline": b.headline_summary,
                    "sentiment": b.avg_sentiment,
                    "key_developments": b.key_developments
                } for b in daily_briefs]
            )

            return {
                "status": "success",
                "tenant_id": tenant_id,
                "week_start": start.isoformat(),
                "week_end": end.isoformat(),
                "total_mentions": total_mentions,
                "avg_sentiment": avg_sentiment,
                "summary": weekly_summary
            }

    return asyncio.run(_generate())
