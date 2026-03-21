"""
OSINT API Endpoints

REST API for the OSINT layer including:
- Source management
- Mention retrieval and search
- Alert management
- Daily briefs
- Real-time WebSocket updates
"""

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from uuid import UUID
import json

from auth.middleware import require_auth, require_role
from auth.models import User

try:
    from database import AsyncSessionLocal
    from models_osint import (
        OSINTSource, OSINTMention, OSINTAlert, DailyBrief,
        NarrativeCluster, OSINTMetrics
    )
except ImportError:
    AsyncSessionLocal = None

router = APIRouter(prefix="/osint", tags=["OSINT"])


# ==================== Source Management ====================

@router.get("/sources", response_model=List[Dict[str, Any]])
async def list_osint_sources(
    source_type: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(require_auth)
):
    """List configured OSINT sources."""
    if not AsyncSessionLocal:
        raise HTTPException(status_code=503, detail="OSINT not configured")

    async with AsyncSessionLocal() as session:
        from sqlalchemy import select, and_

        query = select(OSINTSource).where(OSINTSource.tenant_id == current_user.tenant_id)

        if source_type:
            query = query.where(OSINTSource.source_type == source_type)
        if is_active is not None:
            query = query.where(OSINTSource.is_active == is_active)

        result = await session.execute(query)
        sources = result.scalars().all()

        return [
            {
                "id": str(s.id),
                "name": s.name,
                "source_type": s.source_type,
                "source_url": s.source_url,
                "is_active": s.is_active,
                "last_fetch_at": s.last_fetch_at.isoformat() if s.last_fetch_at else None,
                "last_fetch_status": s.last_fetch_status,
                "fetch_interval_minutes": s.fetch_interval_minutes,
                "priority": s.priority,
            }
            for s in sources
        ]


@router.post("/sources", response_model=Dict[str, Any])
async def create_osint_source(
    source_data: Dict[str, Any],
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    """Create a new OSINT source."""
    if not AsyncSessionLocal:
        raise HTTPException(status_code=503, detail="OSINT not configured")

    async with AsyncSessionLocal() as session:
        source = OSINTSource(
            tenant_id=current_user.tenant_id,
            name=source_data.get("name"),
            source_type=source_data.get("source_type"),
            source_url=source_data.get("source_url"),
            api_endpoint=source_data.get("api_endpoint"),
            config=source_data.get("config", {}),
            fetch_interval_minutes=source_data.get("fetch_interval_minutes", 15),
            priority=source_data.get("priority", 5),
            language_filter=source_data.get("language_filter", ["en", "ha", "yo", "ig"]),
        )
        session.add(source)
        await session.commit()

        return {"id": str(source.id), "status": "created"}


@router.post("/sources/{source_id}/test")
async def test_osint_source(
    source_id: str,
    current_user: User = Depends(require_auth)
):
    """Test connection to an OSINT source."""
    from tasks.ingestion_tasks import test_source_connection

    result = test_source_connection.delay(source_id)
    return {"task_id": result.id, "status": "testing"}


@router.post("/sources/{source_id}/fetch")
async def trigger_source_fetch(
    source_id: str,
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    """Manually trigger fetch from a source."""
    from tasks.ingestion_tasks import fetch_source

    result = fetch_source.delay(source_id)
    return {"task_id": result.id, "status": "fetching"}


# ==================== Mentions ====================

@router.get("/mentions", response_model=Dict[str, Any])
async def list_mentions(
    source_id: Optional[str] = None,
    sentiment: Optional[str] = None,
    urgency: Optional[str] = None,
    stance: Optional[str] = None,
    topic: Optional[str] = None,
    lga: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    is_duplicate: Optional[bool] = False,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(require_auth)
):
    """List OSINT mentions with filtering."""
    if not AsyncSessionLocal:
        raise HTTPException(status_code=503, detail="OSINT not configured")

    async with AsyncSessionLocal() as session:
        from sqlalchemy import select, and_, desc

        query = select(OSINTMention).where(
            and_(
                OSINTMention.tenant_id == current_user.tenant_id,
                OSINTMention.is_duplicate == is_duplicate
            )
        )

        if source_id:
            query = query.where(OSINTMention.source_id == source_id)
        if sentiment:
            query = query.where(OSINTMention.sentiment_label == sentiment)
        if urgency:
            query = query.where(OSINTMention.urgency_label == urgency)
        if stance:
            query = query.where(OSINTMention.stance_towards_candidate == stance)
        if topic:
            query = query.where(OSINTMention.topics.contains([topic]))
        if lga:
            query = query.where(OSINTMention.lga_mentioned.contains([lga]))
        if start_date:
            query = query.where(OSINTMention.published_at >= start_date)
        if end_date:
            query = query.where(OSINTMention.published_at <= end_date)

        query = query.order_by(desc(OSINTMention.published_at))

        # Get total count
        from sqlalchemy import func
        count_result = await session.execute(
            select(func.count()).select_from(query.subquery())
        )
        total = count_result.scalar()

        # Get paginated results
        query = query.offset(offset).limit(limit)
        result = await session.execute(query)
        mentions = result.scalars().all()

        return {
            "total": total,
            "offset": offset,
            "limit": limit,
            "mentions": [
                {
                    "id": str(m.id),
                    "title": m.title,
                    "content": m.content[:500] if m.content else None,
                    "content_summary": m.content_summary,
                    "url": m.url,
                    "author": m.author,
                    "published_at": m.published_at.isoformat() if m.published_at else None,
                    "sentiment_score": m.sentiment_score,
                    "sentiment_label": m.sentiment_label,
                    "urgency_score": m.urgency_score,
                    "urgency_label": m.urgency_label,
                    "stance": m.stance_towards_candidate,
                    "topics": m.topics,
                    "entities_mentioned": m.entities_mentioned,
                    "lga_mentioned": m.lga_mentioned,
                    "engagement_metrics": m.engagement_metrics,
                    "ai_processed": m.ai_processed,
                }
                for m in mentions
            ]
        }


@router.get("/mentions/{mention_id}", response_model=Dict[str, Any])
async def get_mention(
    mention_id: str,
    current_user: User = Depends(require_auth)
):
    """Get a single mention with full details."""
    if not AsyncSessionLocal:
        raise HTTPException(status_code=503, detail="OSINT not configured")

    async with AsyncSessionLocal() as session:
        from sqlalchemy import select

        result = await session.execute(
            select(OSINTMention).where(
                and_(
                    OSINTMention.id == mention_id,
                    OSINTMention.tenant_id == current_user.tenant_id
                )
            )
        )
        mention = result.scalar_one_or_none()

        if not mention:
            raise HTTPException(status_code=404, detail="Mention not found")

        return {
            "id": str(mention.id),
            "title": mention.title,
            "content": mention.content,
            "content_summary": mention.content_summary,
            "url": mention.url,
            "author": mention.author,
            "author_handle": mention.author_handle,
            "published_at": mention.published_at.isoformat() if mention.published_at else None,
            "collected_at": mention.collected_at.isoformat() if mention.collected_at else None,
            "language": mention.language,
            "sentiment_score": mention.sentiment_score,
            "sentiment_label": mention.sentiment_label,
            "urgency_score": mention.urgency_score,
            "urgency_label": mention.urgency_label,
            "stance": mention.stance_towards_candidate,
            "topics": mention.topics,
            "entities_mentioned": mention.entities_mentioned,
            "lga_mentioned": mention.lga_mentioned,
            "engagement_metrics": mention.engagement_metrics,
            "is_duplicate": mention.is_duplicate,
            "similarity_score": mention.similarity_score,
            "ai_processed": mention.ai_processed,
            "ai_processed_at": mention.ai_processed_at.isoformat() if mention.ai_processed_at else None,
            "embedding_generated": mention.embedding_generated,
        }


@router.post("/mentions/{mention_id}/reprocess")
async def reprocess_mention(
    mention_id: str,
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    """Reprocess a mention through the AI pipeline."""
    from tasks.osint_tasks import full_mention_pipeline

    result = full_mention_pipeline.delay(mention_id)
    return {"task_id": result.id, "status": "reprocessing"}


@router.get("/mentions/{mention_id}/similar")
async def get_similar_mentions(
    mention_id: str,
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(require_auth)
):
    """Find semantically similar mentions."""
    from tasks.embedding_tasks import find_similar_mentions

    result = find_similar_mentions.delay(mention_id, limit)
    # Note: In production, you'd wait for result or use a polling endpoint
    return {"task_id": result.id, "status": "searching"}


# ==================== Search ====================

@router.post("/search")
async def semantic_search(
    query: str,
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_auth)
):
    """Perform semantic search across mentions."""
    from tasks.embedding_tasks import semantic_search as semantic_search_task

    result = semantic_search_task.delay(
        current_user.tenant_id,
        query,
        limit
    )
    return {"task_id": result.id, "status": "searching"}


# ==================== Alerts ====================

@router.get("/alerts", response_model=Dict[str, Any])
async def list_alerts(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    alert_type: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(require_auth)
):
    """List OSINT alerts."""
    if not AsyncSessionLocal:
        raise HTTPException(status_code=503, detail="OSINT not configured")

    async with AsyncSessionLocal() as session:
        from sqlalchemy import select, and_, desc, func

        query = select(OSINTAlert).where(
            OSINTAlert.tenant_id == current_user.tenant_id
        )

        if status:
            query = query.where(OSINTAlert.status == status)
        if severity:
            query = query.where(OSINTAlert.severity == severity)
        if alert_type:
            query = query.where(OSINTAlert.alert_type == alert_type)

        query = query.order_by(desc(OSINTAlert.created_at))

        # Get total
        count_result = await session.execute(
            select(func.count()).select_from(query.subquery())
        )
        total = count_result.scalar()

        # Get results
        query = query.offset(offset).limit(limit)
        result = await session.execute(query)
        alerts = result.scalars().all()

        return {
            "total": total,
            "offset": offset,
            "limit": limit,
            "alerts": [
                {
                    "id": str(a.id),
                    "alert_type": a.alert_type,
                    "severity": a.severity,
                    "title": a.title,
                    "description": a.description,
                    "status": a.status,
                    "created_at": a.created_at.isoformat() if a.created_at else None,
                    "acknowledged_at": a.acknowledged_at.isoformat() if a.acknowledged_at else None,
                    "resolved_at": a.resolved_at.isoformat() if a.resolved_at else None,
                    "affected_lgas": a.affected_lgas,
                    "recommended_actions": a.recommended_actions,
                }
                for a in alerts
            ]
        }


@router.get("/alerts/{alert_id}", response_model=Dict[str, Any])
async def get_alert(
    alert_id: str,
    current_user: User = Depends(require_auth)
):
    """Get a single alert with full details."""
    if not AsyncSessionLocal:
        raise HTTPException(status_code=503, detail="OSINT not configured")

    async with AsyncSessionLocal() as session:
        from sqlalchemy import select, and_

        result = await session.execute(
            select(OSINTAlert).where(
                and_(
                    OSINTAlert.id == alert_id,
                    OSINTAlert.tenant_id == current_user.tenant_id
                )
            )
        )
        alert = result.scalar_one_or_none()

        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")

        return {
            "id": str(alert.id),
            "alert_type": alert.alert_type,
            "severity": alert.severity,
            "title": alert.title,
            "description": alert.description,
            "triggered_by_mention_ids": alert.triggered_by_mention_ids,
            "affected_lgas": alert.affected_lgas,
            "metrics_snapshot": alert.metrics_snapshot,
            "recommended_actions": alert.recommended_actions,
            "status": alert.status,
            "created_at": alert.created_at.isoformat() if alert.created_at else None,
            "acknowledged_by": str(alert.acknowledged_by) if alert.acknowledged_by else None,
            "acknowledged_at": alert.acknowledged_at.isoformat() if alert.acknowledged_at else None,
            "resolved_by": str(alert.resolved_by) if alert.resolved_by else None,
            "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None,
            "resolution_notes": alert.resolution_notes,
        }


@router.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: str,
    current_user: User = Depends(require_auth)
):
    """Acknowledge an alert."""
    if not AsyncSessionLocal:
        raise HTTPException(status_code=503, detail="OSINT not configured")

    async with AsyncSessionLocal() as session:
        from sqlalchemy import select, and_

        result = await session.execute(
            select(OSINTAlert).where(
                and_(
                    OSINTAlert.id == alert_id,
                    OSINTAlert.tenant_id == current_user.tenant_id
                )
            )
        )
        alert = result.scalar_one_or_none()

        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")

        alert.status = "acknowledged"
        alert.acknowledged_by = current_user.id
        alert.acknowledged_at = datetime.utcnow()

        await session.commit()

        return {"status": "acknowledged"}


@router.post("/alerts/{alert_id}/resolve")
async def resolve_alert(
    alert_id: str,
    resolution_data: Dict[str, str],
    current_user: User = Depends(require_auth)
):
    """Resolve an alert."""
    from tasks.alert_tasks import resolve_alert as resolve_alert_task

    result = resolve_alert_task.delay(
        alert_id,
        resolution_data.get("notes", ""),
        str(current_user.id)
    )
    return {"task_id": result.id, "status": "resolving"}


# ==================== Daily Briefs ====================

@router.get("/briefs", response_model=List[Dict[str, Any]])
async def list_briefs(
    status: Optional[str] = None,
    limit: int = Query(30, ge=1, le=100),
    current_user: User = Depends(require_auth)
):
    """List daily briefs."""
    if not AsyncSessionLocal:
        raise HTTPException(status_code=503, detail="OSINT not configured")

    async with AsyncSessionLocal() as session:
        from sqlalchemy import select, and_, desc

        query = select(DailyBrief).where(
            DailyBrief.tenant_id == current_user.tenant_id
        )

        if status:
            query = query.where(DailyBrief.status == status)

        query = query.order_by(desc(DailyBrief.brief_date))
        query = query.limit(limit)

        result = await session.execute(query)
        briefs = result.scalars().all()

        return [
            {
                "id": str(b.id),
                "brief_date": b.brief_date.isoformat() if b.brief_date else None,
                "headline_summary": b.headline_summary,
                "total_mentions": b.total_mentions,
                "avg_sentiment": b.avg_sentiment,
                "sentiment_change": b.sentiment_change,
                "status": b.status,
                "created_at": b.created_at.isoformat() if b.created_at else None,
            }
            for b in briefs
        ]


@router.get("/briefs/{brief_id}", response_model=Dict[str, Any])
async def get_brief(
    brief_id: str,
    current_user: User = Depends(require_auth)
):
    """Get a daily brief with full details."""
    if not AsyncSessionLocal:
        raise HTTPException(status_code=503, detail="OSINT not configured")

    async with AsyncSessionLocal() as session:
        from sqlalchemy import select, and_

        result = await session.execute(
            select(DailyBrief).where(
                and_(
                    DailyBrief.id == brief_id,
                    DailyBrief.tenant_id == current_user.tenant_id
                )
            )
        )
        brief = result.scalar_one_or_none()

        if not brief:
            raise HTTPException(status_code=404, detail="Brief not found")

        return {
            "id": str(brief.id),
            "brief_date": brief.brief_date.isoformat() if brief.brief_date else None,
            "period_start": brief.period_start.isoformat() if brief.period_start else None,
            "period_end": brief.period_end.isoformat() if brief.period_end else None,
            "headline_summary": brief.headline_summary,
            "total_mentions": brief.total_mentions,
            "unique_sources": brief.unique_sources,
            "avg_sentiment": brief.avg_sentiment,
            "sentiment_change": brief.sentiment_change,
            "key_developments": brief.key_developments,
            "top_narratives": brief.top_narratives,
            "emerging_threats": brief.emerging_threats,
            "opposition_activity": brief.opposition_activity,
            "media_coverage_analysis": brief.media_coverage_analysis,
            "top_performing_content": brief.top_performing_content,
            "influencer_mentions": brief.influencer_mentions,
            "strategic_recommendations": brief.strategic_recommendations,
            "recommended_actions": brief.recommended_actions,
            "status": brief.status,
            "generated_by": brief.generated_by,
        }


@router.post("/briefs/generate")
async def generate_brief(
    date: Optional[str] = None,
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    """Trigger generation of a daily brief."""
    from tasks.brief_tasks import generate_daily_brief

    result = generate_daily_brief.delay(
        current_user.tenant_id,
        date
    )
    return {"task_id": result.id, "status": "generating"}


# ==================== Narratives ====================

@router.get("/narratives", response_model=List[Dict[str, Any]])
async def list_narratives(
    is_active: Optional[bool] = True,
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(require_auth)
):
    """List narrative clusters."""
    if not AsyncSessionLocal:
        raise HTTPException(status_code=503, detail="OSINT not configured")

    async with AsyncSessionLocal() as session:
        from sqlalchemy import select, and_, desc

        query = select(NarrativeCluster).where(
            NarrativeCluster.tenant_id == current_user.tenant_id
        )

        if is_active is not None:
            query = query.where(NarrativeCluster.is_active == is_active)

        query = query.order_by(desc(NarrativeCluster.last_mention_at))
        query = query.limit(limit)

        result = await session.execute(query)
        clusters = result.scalars().all()

        return [
            {
                "id": str(c.id),
                "narrative_title": c.narrative_title,
                "narrative_summary": c.narrative_summary,
                "key_themes": c.key_themes,
                "sentiment_trend": c.sentiment_trend,
                "mention_count": c.mention_count,
                "first_mention_at": c.first_mention_at.isoformat() if c.first_mention_at else None,
                "last_mention_at": c.last_mention_at.isoformat() if c.last_mention_at else None,
                "affected_lgas": c.affected_lgas,
                "is_active": c.is_active,
            }
            for c in clusters
        ]


@router.post("/narratives/cluster")
async def trigger_narrative_clustering(
    hours_back: int = Query(24, ge=1, le=168),
    current_user: User = Depends(require_role(["admin", "manager"]))
):
    """Trigger narrative clustering."""
    from tasks.embedding_tasks import cluster_narratives

    result = cluster_narratives.delay(
        current_user.tenant_id,
        hours_back
    )
    return {"task_id": result.id, "status": "clustering"}


# ==================== Metrics ====================

@router.get("/metrics/dashboard")
async def get_dashboard_metrics(
    current_user: User = Depends(require_auth)
):
    """Get dashboard metrics for OSINT."""
    if not AsyncSessionLocal:
        raise HTTPException(status_code=503, detail="OSINT not configured")

    async with AsyncSessionLocal() as session:
        from sqlalchemy import select, and_, func, desc
        from datetime import timedelta

        now = datetime.utcnow()
        day_ago = now - timedelta(days=1)
        week_ago = now - timedelta(days=7)

        # Total mentions in last 24h
        result = await session.execute(
            select(func.count()).where(
                and_(
                    OSINTMention.tenant_id == current_user.tenant_id,
                    OSINTMention.published_at >= day_ago
                )
            )
        )
        mentions_24h = result.scalar()

        # Average sentiment
        result = await session.execute(
            select(func.avg(OSINTMention.sentiment_score)).where(
                and_(
                    OSINTMention.tenant_id == current_user.tenant_id,
                    OSINTMention.published_at >= day_ago,
                    OSINTMention.ai_processed == True
                )
            )
        )
        avg_sentiment = result.scalar() or 0

        # Active alerts
        result = await session.execute(
            select(func.count()).where(
                and_(
                    OSINTAlert.tenant_id == current_user.tenant_id,
                    OSINTAlert.status == "open"
                )
            )
        )
        active_alerts = result.scalar()

        # Active sources
        result = await session.execute(
            select(func.count()).where(
                and_(
                    OSINTSource.tenant_id == current_user.tenant_id,
                    OSINTSource.is_active == True
                )
            )
        )
        active_sources = result.scalar()

        return {
            "mentions_24h": mentions_24h,
            "avg_sentiment_24h": round(avg_sentiment, 2),
            "active_alerts": active_alerts,
            "active_sources": active_sources,
            "generated_at": now.isoformat()
        }


# ==================== WebSocket ====================

@router.websocket("/ws/alerts")
async def alerts_websocket(websocket: WebSocket):
    """WebSocket for real-time alert notifications."""
    await websocket.accept()

    try:
        while True:
            # Keep connection alive and listen for messages
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("action") == "subscribe":
                # Subscribe to alerts for a tenant
                tenant_id = message.get("tenant_id")
                # In production, validate token and tenant access
                await websocket.send_json({
                    "type": "subscription_confirmed",
                    "tenant_id": tenant_id
                })

            elif message.get("action") == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.close(code=1011, reason=str(e))
