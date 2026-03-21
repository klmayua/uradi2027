"""
OSINT Classification Tasks

AI-powered classification of OSINT mentions including sentiment analysis,
entity extraction, topic classification, and urgency assessment.
"""

import asyncio
import json
from datetime import datetime
from typing import Dict, List, Optional

from celery_app import celery_app

try:
    from database import AsyncSessionLocal
    from models_osint import OSINTMention, OSINTProcessingQueue
    from services.kimi_client import KimiClient
except ImportError:
    AsyncSessionLocal = None
    KimiClient = None


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def classify_mention(self, mention_id: str):
    """
    Classify a mention using Kimi AI.

    Performs:
    - Sentiment analysis (-1 to +1)
    - Topic extraction
    - Urgency assessment (0-100)
    - Stance detection (opposing/neutral/supporting)

    Args:
        mention_id: UUID of the mention to classify
    """
    import asyncio

    async def _classify():
        if not AsyncSessionLocal or not KimiClient:
            return {"status": "error", "message": "Dependencies not configured"}

        async with AsyncSessionLocal() as session:
            from sqlalchemy import select

            # Fetch mention
            result = await session.execute(
                select(OSINTMention).where(OSINTMention.id == mention_id)
            )
            mention = result.scalar_one_or_none()

            if not mention:
                return {"status": "error", "message": f"Mention {mention_id} not found"}

            if mention.ai_processed:
                return {"status": "skipped", "message": "Already processed"}

            try:
                # Prepare content for analysis
                content = mention.content or mention.title or ""
                if not content:
                    return {"status": "error", "message": "Empty content"}

                # Call Kimi for classification
                client = KimiClient()
                classification = await client.classify_osint_content(
                    content=content,
                    language=mention.language
                )

                # Update mention with classification results
                mention.sentiment_score = classification.get("sentiment_score", 0)
                mention.sentiment_label = _score_to_label(mention.sentiment_score)
                mention.urgency_score = classification.get("urgency_score", 0)
                mention.urgency_label = _urgency_to_label(mention.urgency_score)
                mention.stance_towards_candidate = classification.get("stance", "neutral")
                mention.topics = classification.get("topics", [])
                mention.lga_mentioned = classification.get("lgas_mentioned", [])
                mention.ai_processed = True
                mention.ai_processed_at = datetime.utcnow()
                mention.ai_model_version = "kimi-k2-2025"

                await session.commit()

                return {
                    "status": "success",
                    "mention_id": mention_id,
                    "sentiment": mention.sentiment_label,
                    "urgency": mention.urgency_label,
                    "stance": mention.stance_towards_candidate,
                    "topics": mention.topics
                }

            except Exception as e:
                await session.rollback()
                raise self.retry(exc=e)

    return asyncio.run(_classify())


@celery_app.task(bind=True, max_retries=3)
def classify_batch(self, mention_ids: List[str]):
    """
    Classify multiple mentions in batch.

    Args:
        mention_ids: List of mention UUIDs to classify
    """
    import asyncio

    async def _classify_batch():
        results = []
        for mention_id in mention_ids:
            result = classify_mention.delay(mention_id)
            results.append(result.id)

        return {
            "status": "success",
            "queued": len(results),
            "task_ids": results
        }

    return asyncio.run(_classify_batch())


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def extract_entities(self, mention_id: str):
    """
    Extract named entities from a mention.

    Identifies:
    - People (politicians, influencers)
    - Organizations (parties, groups)
    - Locations (LGAs, wards, polling units)
    - Events (rallies, incidents)

    Args:
        mention_id: UUID of the mention to process
    """
    import asyncio

    async def _extract():
        if not AsyncSessionLocal or not KimiClient:
            return {"status": "error", "message": "Dependencies not configured"}

        async with AsyncSessionLocal() as session:
            from sqlalchemy import select

            result = await session.execute(
                select(OSINTMention).where(OSINTMention.id == mention_id)
            )
            mention = result.scalar_one_or_none()

            if not mention:
                return {"status": "error", "message": "Mention not found"}

            try:
                content = mention.content or mention.title or ""
                if not content:
                    return {"status": "error", "message": "Empty content"}

                client = KimiClient()
                entities = await client.extract_entities(
                    content=content,
                    language=mention.language
                )

                mention.entities_mentioned = entities
                await session.commit()

                return {
                    "status": "success",
                    "mention_id": mention_id,
                    "entities": entities
                }

            except Exception as e:
                await session.rollback()
                raise self.retry(exc=e)

    return asyncio.run(_extract())


@celery_app.task(bind=True, max_retries=3)
def analyze_sentiment(self, mention_id: str):
    """
    Perform detailed sentiment analysis on a mention.

    Returns detailed sentiment breakdown including:
    - Overall sentiment score
    - Sentiment by topic
    - Emotional tone analysis
    - Comparative sentiment (vs previous period)

    Args:
        mention_id: UUID of the mention to analyze
    """
    import asyncio

    async def _analyze():
        if not AsyncSessionLocal or not KimiClient:
            return {"status": "error", "message": "Dependencies not configured"}

        async with AsyncSessionLocal() as session:
            from sqlalchemy import select

            result = await session.execute(
                select(OSINTMention).where(OSINTMention.id == mention_id)
            )
            mention = result.scalar_one_or_none()

            if not mention:
                return {"status": "error", "message": "Mention not found"}

            try:
                content = mention.content or ""
                client = KimiClient()

                sentiment_analysis = await client.analyze_sentiment_detailed(
                    text=content,
                    language=mention.language
                )

                # Update mention with detailed sentiment
                mention.sentiment_score = sentiment_analysis.get("overall_score", 0)
                mention.sentiment_label = _score_to_label(mention.sentiment_score)

                await session.commit()

                return {
                    "status": "success",
                    "mention_id": mention_id,
                    "sentiment": sentiment_analysis
                }

            except Exception as e:
                await session.rollback()
                raise self.retry(exc=e)

    return asyncio.run(_analyze())


@celery_app.task(bind=True, max_retries=3)
def detect_language(self, mention_id: str):
    """
    Detect the language of a mention.

    Supports: English, Hausa, Yoruba, Igbo, Pidgin

    Args:
        mention_id: UUID of the mention to process
    """
    import asyncio

    async def _detect():
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

            try:
                content = mention.content or ""

                # Simple language detection (in production, use langdetect or similar)
                lang_map = {
                    'ha': ['da', 'na', 'a', 'mai'],
                    'yo': ['ni', 'ti', 'si', 'at'],
                    'ig': ['na', 'ka', 'nke', 'm'],
                }

                detected = 'en'
                content_lower = content.lower()

                for lang, markers in lang_map.items():
                    if any(marker in content_lower for marker in markers):
                        detected = lang
                        break

                mention.language = detected
                await session.commit()

                return {
                    "status": "success",
                    "mention_id": mention_id,
                    "language": detected
                }

            except Exception as e:
                await session.rollback()
                raise self.retry(exc=e)

    return asyncio.run(_detect())


def _score_to_label(score: float) -> str:
    """Convert sentiment score to label."""
    if score is None:
        return "neutral"
    if score <= -0.6:
        return "very_negative"
    elif score <= -0.2:
        return "negative"
    elif score < 0.2:
        return "neutral"
    elif score < 0.6:
        return "positive"
    else:
        return "very_positive"


def _urgency_to_label(score: int) -> str:
    """Convert urgency score to label."""
    if score is None:
        return "low"
    if score >= 80:
        return "critical"
    elif score >= 60:
        return "high"
    elif score >= 40:
        return "medium"
    else:
        return "low"
