"""
OSINT Alert Tasks

Crisis detection and alerting system for the OSINT layer.
Monitors for sentiment crashes, volume spikes, security incidents, etc.
"""

import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional

from celery_app import celery_app

try:
    from database import AsyncSessionLocal
    from models_osint import OSINTMention, OSINTAlert, OSINTMetrics
    from services.kimi_client import KimiClient
except ImportError:
    AsyncSessionLocal = None
    KimiClient = None


@celery_app.task(bind=True, max_retries=3)
def check_all_alert_conditions(self, tenant_id: Optional[str] = None):
    """
    Check all alert conditions for a tenant or all tenants.

    Args:
        tenant_id: Specific tenant to check, or None for all
    """
    import asyncio

    async def _check():
        if not AsyncSessionLocal:
            return {"status": "error", "message": "Database not configured"}

        async with AsyncSessionLocal() as session:
            from sqlalchemy import select

            if tenant_id:
                tenant_ids = [tenant_id]
            else:
                # Get all active tenants with OSINT enabled
                from models import Tenant
                result = await session.execute(
                    select(Tenant.id).where(Tenant.status == "active")
                )
                tenant_ids = [r[0] for r in result.all()]

            triggered_alerts = []

            for tid in tenant_ids:
                # Check each alert type
                checks = [
                    check_sentiment_crash.delay(tid),
                    check_volume_spike.delay(tid),
                    check_crisis_detection.delay(tid),
                    check_narrative_shift.delay(tid),
                ]

                triggered_alerts.extend([c.id for c in checks])

            return {
                "status": "success",
                "tenants_checked": len(tenant_ids),
                "checks_triggered": len(triggered_alerts)
            }

    return asyncio.run(_check())


@celery_app.task(bind=True, max_retries=3)
def check_sentiment_crash(self, tenant_id: str, window_hours: int = 1):
    """
    Check for sudden sentiment drops (crashes).

    Triggers when average sentiment drops below -0.5 in a short window.

    Args:
        tenant_id: Tenant to check
        window_hours: Time window to analyze
    """
    import asyncio

    async def _check():
        if not AsyncSessionLocal:
            return {"status": "error", "message": "Database not configured"}

        async with AsyncSessionLocal() as session:
            from sqlalchemy import select, func, and_

            cutoff = datetime.utcnow() - timedelta(hours=window_hours)

            # Calculate current window sentiment
            result = await session.execute(
                select(
                    func.avg(OSINTMention.sentiment_score).label("avg_sentiment"),
                    func.count().label("count")
                )
                .where(and_(
                    OSINTMention.tenant_id == tenant_id,
                    OSINTMention.published_at >= cutoff,
                    OSINTMention.ai_processed == True
                ))
            )
            row = result.one()

            if row.count < 10:  # Need minimum sample size
                return {"status": "skipped", "message": "Insufficient data", "count": row.count}

            avg_sentiment = row.avg_sentiment or 0

            # Check if sentiment crashed (below -0.5)
            if avg_sentiment < -0.5:
                # Get triggering mentions
                result = await session.execute(
                    select(OSINTMention)
                    .where(and_(
                        OSINTMention.tenant_id == tenant_id,
                        OSINTMention.published_at >= cutoff,
                        OSINTMention.sentiment_score < -0.5
                    ))
                    .order_by(OSINTMention.sentiment_score)
                    .limit(10)
                )
                triggering = result.scalars().all()

                # Create alert
                alert = OSINTAlert(
                    tenant_id=tenant_id,
                    alert_type="sentiment_crash",
                    severity="high" if avg_sentiment < -0.7 else "medium",
                    title=f"Sentiment Crash Detected: {avg_sentiment:.2f}",
                    description=f"Average sentiment dropped to {avg_sentiment:.2f} in the last {window_hours} hour(s). "
                               f"This indicates significant negative sentiment surge.",
                    triggered_by_mention_ids=[str(m.id) for m in triggering],
                    affected_lgas=list(set(lga for m in triggering for lga in (m.lga_mentioned or []))),
                    metrics_snapshot={
                        "avg_sentiment": avg_sentiment,
                        "mention_count": row.count,
                        "window_hours": window_hours
                    },
                    recommended_actions=[
                        "Review triggering mentions for crisis indicators",
                        "Prepare rapid response messaging",
                        "Alert campaign leadership",
                        "Monitor for escalation"
                    ]
                )
                session.add(alert)
                await session.commit()

                # Send notification
                send_alert_notification.delay(str(alert.id))

                return {
                    "status": "alert_triggered",
                    "alert_id": str(alert.id),
                    "alert_type": "sentiment_crash",
                    "severity": alert.severity,
                    "avg_sentiment": avg_sentiment
                }

            return {
                "status": "ok",
                "avg_sentiment": avg_sentiment,
                "message": "No sentiment crash detected"
            }

    return asyncio.run(_check())


@celery_app.task(bind=True, max_retries=3)
def check_volume_spike(self, tenant_id: str, window_hours: int = 1):
    """
    Check for sudden spikes in mention volume.

    Triggers when volume exceeds 3x the baseline average.

    Args:
        tenant_id: Tenant to check
        window_hours: Time window to analyze
    """
    import asyncio

    async def _check():
        if not AsyncSessionLocal:
            return {"status": "error", "message": "Database not configured"}

        async with AsyncSessionLocal() as session:
            from sqlalchemy import select, func, and_

            now = datetime.utcnow()
            current_window_start = now - timedelta(hours=window_hours)
            baseline_window_start = now - timedelta(hours=window_hours * 4)

            # Get current volume
            result = await session.execute(
                select(func.count().label("count"))
                .where(and_(
                    OSINTMention.tenant_id == tenant_id,
                    OSINTMention.published_at >= current_window_start
                ))
            )
            current_volume = result.scalar() or 0

            # Get baseline volume (previous 3x window)
            result = await session.execute(
                select(func.count().label("count"))
                .where(and_(
                    OSINTMention.tenant_id == tenant_id,
                    OSINTMention.published_at >= baseline_window_start,
                    OSINTMention.published_at < current_window_start
                ))
            )
            baseline_volume = result.scalar() or 1  # Avoid division by zero

            # Calculate baseline rate per hour
            baseline_rate = baseline_volume / (window_hours * 3)
            current_rate = current_volume / window_hours

            # Check for spike (3x baseline)
            if current_rate > baseline_rate * 3 and current_volume >= 20:
                # Get triggering mentions
                result = await session.execute(
                    select(OSINTMention)
                    .where(and_(
                        OSINTMention.tenant_id == tenant_id,
                        OSINTMention.published_at >= current_window_start
                    ))
                    .order_by(OSINTMention.published_at.desc())
                    .limit(10)
                )
                triggering = result.scalars().all()

                # Determine severity
                spike_ratio = current_rate / baseline_rate if baseline_rate > 0 else 0
                severity = "critical" if spike_ratio > 10 else "high" if spike_ratio > 5 else "medium"

                alert = OSINTAlert(
                    tenant_id=tenant_id,
                    alert_type="volume_spike",
                    severity=severity,
                    title=f"Volume Spike: {current_volume} mentions in {window_hours}h",
                    description=f"Mention volume spiked to {current_volume} in the last {window_hours} hour(s), "
                               f"{spike_ratio:.1f}x above baseline. Possible viral content or breaking news.",
                    triggered_by_mention_ids=[str(m.id) for m in triggering],
                    affected_lgas=list(set(lga for m in triggering for lga in (m.lga_mentioned or []))),
                    metrics_snapshot={
                        "current_volume": current_volume,
                        "baseline_rate": baseline_rate,
                        "spike_ratio": spike_ratio,
                        "window_hours": window_hours
                    },
                    recommended_actions=[
                        "Identify trending topics causing spike",
                        "Assess sentiment of spike content",
                        "Prepare response if negative",
                        "Monitor for sustained elevation"
                    ]
                )
                session.add(alert)
                await session.commit()

                send_alert_notification.delay(str(alert.id))

                return {
                    "status": "alert_triggered",
                    "alert_id": str(alert.id),
                    "alert_type": "volume_spike",
                    "severity": severity,
                    "spike_ratio": spike_ratio
                }

            return {
                "status": "ok",
                "current_volume": current_volume,
                "baseline_rate": baseline_rate,
                "message": "No volume spike detected"
            }

    return asyncio.run(_check())


@celery_app.task(bind=True, max_retries=3)
def check_crisis_detection(self, tenant_id: str, window_hours: int = 1):
    """
    Detect potential crisis situations from mention patterns.

    Looks for:
    - Security-related keywords
    - Violence/incident reports
    - High urgency scores
    - Rapid negative sentiment shifts

    Args:
        tenant_id: Tenant to check
        window_hours: Time window to analyze
    """
    import asyncio

    async def _check():
        if not AsyncSessionLocal:
            return {"status": "error", "message": "Database not configured"}

        async with AsyncSessionLocal() as session:
            from sqlalchemy import select, and_

            cutoff = datetime.utcnow() - timedelta(hours=window_hours)

            # Crisis keywords (in English, Hausa, Yoruba, Igbo)
            crisis_keywords = [
                # English
                'violence', 'attack', 'killed', 'injured', 'crisis', 'conflict',
                'protest', 'riot', 'clash', 'shooting', 'bomb', 'threat',
                # Hausa
                'yaki', 'kisa', 'bari', 'tsaro', 'hatsari',
                # Yoruba
                'ijamba', 'ogun', 'ipaniyan', 'wahala',
                # Igbo
                'agwa', 'ogwu', 'nwuru', 'ihe ize ndu'
            ]

            # Find crisis-related mentions
            result = await session.execute(
                select(OSINTMention)
                .where(and_(
                    OSINTMention.tenant_id == tenant_id,
                    OSINTMention.published_at >= cutoff,
                    OSINTMention.ai_processed == True,
                    OSINTMention.urgency_score >= 70  # High urgency
                ))
            )
            high_urgency = result.scalars().all()

            # Filter by crisis keywords
            crisis_mentions = []
            for mention in high_urgency:
                content = (mention.content or "").lower()
                if any(kw in content for kw in crisis_keywords):
                    crisis_mentions.append(mention)

            if len(crisis_mentions) >= 3:  # Threshold for crisis alert
                severity = "critical" if len(crisis_mentions) >= 10 else "high"

                alert = OSINTAlert(
                    tenant_id=tenant_id,
                    alert_type="crisis_detected",
                    severity=severity,
                    title=f"Potential Crisis Detected: {len(crisis_mentions)} urgent mentions",
                    description=f"Detected {len(crisis_mentions)} high-urgency mentions with crisis indicators "
                               f"in the last {window_hours} hour(s). Immediate attention required.",
                    triggered_by_mention_ids=[str(m.id) for m in crisis_mentions[:20]],
                    affected_lgas=list(set(lga for m in crisis_mentions for lga in (m.lga_mentioned or []))),
                    metrics_snapshot={
                        "crisis_mention_count": len(crisis_mentions),
                        "window_hours": window_hours,
                        "avg_urgency": sum(m.urgency_score or 0 for m in crisis_mentions) / len(crisis_mentions) if crisis_mentions else 0
                    },
                    recommended_actions=[
                        "IMMEDIATE: Verify reports through ground teams",
                        "Alert security team and campaign leadership",
                        "Prepare holding statement if needed",
                        "Monitor for escalation or resolution",
                        "Document timeline of events"
                    ]
                )
                session.add(alert)
                await session.commit()

                # Send immediate notification for crisis
                send_alert_notification.delay(str(alert.id), priority="urgent")

                return {
                    "status": "alert_triggered",
                    "alert_id": str(alert.id),
                    "alert_type": "crisis_detected",
                    "severity": severity,
                    "crisis_count": len(crisis_mentions)
                }

            return {
                "status": "ok",
                "crisis_mentions": len(crisis_mentions),
                "message": "No crisis detected"
            }

    return asyncio.run(_check())


@celery_app.task(bind=True, max_retries=3)
def check_narrative_shift(self, tenant_id: str, window_hours: int = 6):
    """
    Detect significant shifts in narrative themes.

    Args:
        tenant_id: Tenant to check
        window_hours: Time window to analyze
    """
    import asyncio

    async def _check():
        # Implementation for narrative shift detection
        # This would compare topic distributions over time
        return {"status": "ok", "message": "Narrative shift check not yet implemented"}

    return asyncio.run(_check())


@celery_app.task(bind=True, max_retries=3)
def check_mention_for_alerts(self, mention_id: str):
    """
    Check a single mention for alert conditions.

    Used in the processing pipeline for real-time alerting.

    Args:
        mention_id: Mention to check
    """
    import asyncio

    async def _check():
        if not AsyncSessionLocal:
            return {"status": "error", "message": "Database not configured"}

        async with AsyncSessionLocal() as session:
            from sqlalchemy import select

            result = await session.execute(
                select(OSINTMention).where(OSINTMention.id == mention_id)
            )
            mention = result.scalar_one_or_none()

            if not mention:
                return {"status": "error", "message": "Mention not found"}

            alerts_triggered = []

            # Check for high urgency (immediate alert)
            if mention.urgency_score and mention.urgency_score >= 90:
                alert = OSINTAlert(
                    tenant_id=mention.tenant_id,
                    alert_type="security_incident",
                    severity="critical",
                    title="Critical Urgency Mention Detected",
                    description=f"A mention with urgency score {mention.urgency_score} was detected. "
                               f"Content: {mention.content[:200] if mention.content else 'N/A'}...",
                    triggered_by_mention_ids=[str(mention.id)],
                    affected_lgas=mention.lga_mentioned or [],
                    recommended_actions=[
                        "Immediate review required",
                        "Assess for security implications",
                        "Notify relevant stakeholders"
                    ]
                )
                session.add(alert)
                await session.commit()
                alerts_triggered.append(str(alert.id))

                send_alert_notification.delay(str(alert.id), priority="urgent")

            return {
                "status": "success",
                "mention_id": mention_id,
                "alerts_triggered": len(alerts_triggered),
                "alert_ids": alerts_triggered
            }

    return asyncio.run(_check())


@celery_app.task(bind=True, max_retries=3)
def send_alert_notification(self, alert_id: str, priority: str = "normal"):
    """
    Send notification for an alert.

    Args:
        alert_id: Alert to notify about
        priority: Notification priority (normal, urgent, critical)
    """
    import asyncio

    async def _notify():
        if not AsyncSessionLocal:
            return {"status": "error", "message": "Database not configured"}

        async with AsyncSessionLocal() as session:
            from sqlalchemy import select

            result = await session.execute(
                select(OSINTAlert).where(OSINTAlert.id == alert_id)
            )
            alert = result.scalar_one_or_none()

            if not alert:
                return {"status": "error", "message": "Alert not found"}

            # Update alert notification status
            alert.notifications_sent = alert.notifications_sent or []
            alert.notifications_sent.append({
                "channel": "websocket",
                "priority": priority,
                "sent_at": datetime.utcnow().isoformat()
            })
            alert.notification_sent_at = datetime.utcnow()
            await session.commit()

            # TODO: Send via WebSocket to connected clients
            # TODO: Send via email for critical alerts
            # TODO: Send via SMS for crisis alerts

            return {
                "status": "success",
                "alert_id": alert_id,
                "priority": priority,
                "channels": ["websocket"]  # Add others as implemented
            }

    return asyncio.run(_notify())


@celery_app.task(bind=True, max_retries=3)
def resolve_alert(self, alert_id: str, resolution_notes: str, resolved_by: str):
    """
    Mark an alert as resolved.

    Args:
        alert_id: Alert to resolve
        resolution_notes: Notes on how it was resolved
        resolved_by: User ID who resolved it
    """
    import asyncio

    async def _resolve():
        if not AsyncSessionLocal:
            return {"status": "error", "message": "Database not configured"}

        async with AsyncSessionLocal() as session:
            from sqlalchemy import select

            result = await session.execute(
                select(OSINTAlert).where(OSINTAlert.id == alert_id)
            )
            alert = result.scalar_one_or_none()

            if not alert:
                return {"status": "error", "message": "Alert not found"}

            alert.status = "resolved"
            alert.resolved_by = resolved_by
            alert.resolved_at = datetime.utcnow()
            alert.resolution_notes = resolution_notes

            await session.commit()

            return {
                "status": "success",
                "alert_id": alert_id,
                "resolved_at": alert.resolved_at.isoformat()
            }

    return asyncio.run(_resolve())
