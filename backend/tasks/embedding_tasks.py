"""
OSINT Embedding Tasks

Tasks for generating vector embeddings and performing semantic analysis
using Qdrant vector database.
"""

import asyncio
from datetime import datetime
from typing import Dict, List, Optional

from celery_app import celery_app

try:
    from database import AsyncSessionLocal
    from models_osint import OSINTMention, NarrativeCluster
    from services.kimi_client import KimiClient
except ImportError:
    AsyncSessionLocal = None
    KimiClient = None


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def generate_embedding(self, mention_id: str):
    """
    Generate vector embedding for a mention and store in Qdrant.

    Args:
        mention_id: UUID of the mention to embed
    """
    import asyncio

    async def _embed():
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

            if mention.embedding_generated:
                return {"status": "skipped", "message": "Already has embedding"}

            try:
                # Prepare text for embedding
                text = mention.content or mention.title or ""
                if not text:
                    return {"status": "error", "message": "Empty content"}

                # Generate embedding using Kimi
                client = KimiClient()
                embedding = await client.generate_embedding(text)

                if not embedding:
                    return {"status": "error", "message": "Failed to generate embedding"}

                # Store in Qdrant
                from services.qdrant_client import QdrantClient
                qdrant = QdrantClient()

                vector_id = await qdrant.store_embedding(
                    collection_name=f"tenant_{mention.tenant_id}",
                    vector=embedding,
                    payload={
                        "mention_id": str(mention.id),
                        "tenant_id": mention.tenant_id,
                        "source_id": str(mention.source_id),
                        "sentiment_score": mention.sentiment_score,
                        "topics": mention.topics,
                        "published_at": mention.published_at.isoformat() if mention.published_at else None,
                    }
                )

                # Update mention
                mention.embedding_generated = True
                mention.embedding_model = "kimi-embedding-v1"
                mention.embedding_vector_id = vector_id

                await session.commit()

                return {
                    "status": "success",
                    "mention_id": mention_id,
                    "vector_id": vector_id,
                    "embedding_size": len(embedding)
                }

            except Exception as e:
                await session.rollback()
                raise self.retry(exc=e)

    return asyncio.run(_embed())


@celery_app.task(bind=True, max_retries=3)
def generate_pending_embeddings(self, batch_size: int = 50):
    """
    Generate embeddings for all pending mentions.

    Args:
        batch_size: Number of mentions to process per run
    """
    import asyncio

    async def _generate():
        if not AsyncSessionLocal:
            return {"status": "error", "message": "Database not configured"}

        async with AsyncSessionLocal() as session:
            from sqlalchemy import select, and_

            # Fetch mentions needing embeddings
            result = await session.execute(
                select(OSINTMention)
                .where(and_(
                    OSINTMention.embedding_generated == False,
                    OSINTMention.ai_processed == True,  # Only embed classified mentions
                    OSINTMention.status == "processed"
                ))
                .limit(batch_size)
            )
            mentions = result.scalars().all()

            if not mentions:
                return {"status": "success", "message": "No pending embeddings", "processed": 0}

            # Queue embedding tasks
            task_ids = []
            for mention in mentions:
                task = generate_embedding.delay(str(mention.id))
                task_ids.append(task.id)

            return {
                "status": "success",
                "queued": len(task_ids),
                "task_ids": task_ids
            }

    return asyncio.run(_generate())


@celery_app.task(bind=True, max_retries=3, default_retry_delay=300)
def cluster_narratives(self, tenant_id: str, hours_back: int = 24):
    """
    Cluster mentions into narratives using HDBSCAN.

    Args:
        tenant_id: Tenant to cluster for
        hours_back: How far back to look for mentions
    """
    import asyncio

    async def _cluster():
        if not AsyncSessionLocal:
            return {"status": "error", "message": "Database not configured"}

        async with AsyncSessionLocal() as session:
            from sqlalchemy import select, and_
            from datetime import timedelta

            cutoff = datetime.utcnow() - timedelta(hours=hours_back)

            # Fetch mentions with embeddings
            result = await session.execute(
                select(OSINTMention)
                .where(and_(
                    OSINTMention.tenant_id == tenant_id,
                    OSINTMention.embedding_generated == True,
                    OSINTMention.published_at >= cutoff
                ))
            )
            mentions = result.scalars().all()

            if len(mentions) < 10:
                return {"status": "skipped", "message": "Not enough mentions for clustering", "count": len(mentions)}

            try:
                # Fetch embeddings from Qdrant
                from services.qdrant_client import QdrantClient
                qdrant = QdrantClient()

                vectors = []
                mention_ids = []

                for mention in mentions:
                    if mention.embedding_vector_id:
                        vector = await qdrant.get_embedding(
                            collection_name=f"tenant_{tenant_id}",
                            vector_id=mention.embedding_vector_id
                        )
                        if vector:
                            vectors.append(vector)
                            mention_ids.append(str(mention.id))

                if len(vectors) < 10:
                    return {"status": "skipped", "message": "Not enough vectors fetched", "count": len(vectors)}

                # Perform clustering with HDBSCAN
                import numpy as np
                from sklearn.cluster import HDBSCAN

                X = np.array(vectors)
                clusterer = HDBSCAN(
                    min_cluster_size=5,
                    min_samples=2,
                    metric='cosine'
                )
                labels = clusterer.fit_predict(X)

                # Create/update narrative clusters
                clusters_created = 0
                unique_labels = set(labels) - {-1}  # -1 is noise

                for label in unique_labels:
                    # Get mentions in this cluster
                    cluster_mention_ids = [mention_ids[i] for i, l in enumerate(labels) if l == label]
                    cluster_mentions = [m for m in mentions if str(m.id) in cluster_mention_ids]

                    if not cluster_mentions:
                        continue

                    # Generate cluster summary using Kimi
                    client = KimiClient()
                    cluster_texts = [m.content or m.title or "" for m in cluster_mentions[:10]]
                    summary = await client.summarize_narrative(cluster_texts)

                    # Create cluster record
                    cluster = NarrativeCluster(
                        tenant_id=tenant_id,
                        cluster_label=str(label),
                        narrative_title=summary.get("title", f"Narrative {label}"),
                        narrative_summary=summary.get("summary", ""),
                        key_themes=summary.get("themes", []),
                        sentiment_trend=_calculate_sentiment_trend(cluster_mentions),
                        mention_count=len(cluster_mentions),
                        first_mention_at=min(m.published_at for m in cluster_mentions if m.published_at),
                        last_mention_at=max(m.published_at for m in cluster_mentions if m.published_at),
                        affected_lgas=list(set(
                            lga for m in cluster_mentions for lga in (m.lga_mentioned or [])
                        )),
                        representative_mention_ids=cluster_mention_ids[:5]
                    )
                    session.add(cluster)
                    clusters_created += 1

                await session.commit()

                return {
                    "status": "success",
                    "tenant_id": tenant_id,
                    "mentions_processed": len(mentions),
                    "clusters_created": clusters_created,
                    "noise_points": list(labels).count(-1)
                }

            except Exception as e:
                await session.rollback()
                raise self.retry(exc=e)

    return asyncio.run(_cluster())


@celery_app.task(bind=True, max_retries=3)
def find_similar_mentions(self, mention_id: str, limit: int = 10):
    """
    Find semantically similar mentions using vector search.

    Args:
        mention_id: Reference mention ID
        limit: Maximum number of similar mentions to return
    """
    import asyncio

    async def _find():
        if not AsyncSessionLocal:
            return {"status": "error", "message": "Database not configured"}

        async with AsyncSessionLocal() as session:
            from sqlalchemy import select

            # Fetch reference mention
            result = await session.execute(
                select(OSINTMention).where(OSINTMention.id == mention_id)
            )
            mention = result.scalar_one_or_none()

            if not mention or not mention.embedding_vector_id:
                return {"status": "error", "message": "Mention not found or not embedded"}

            try:
                # Search Qdrant for similar vectors
                from services.qdrant_client import QdrantClient
                qdrant = QdrantClient()

                similar = await qdrant.search_similar(
                    collection_name=f"tenant_{mention.tenant_id}",
                    vector_id=mention.embedding_vector_id,
                    limit=limit + 1  # +1 to exclude self
                )

                # Filter out the reference mention
                similar = [s for s in similar if s.payload.get("mention_id") != mention_id][:limit]

                return {
                    "status": "success",
                    "mention_id": mention_id,
                    "similar_count": len(similar),
                    "similar_mentions": [
                        {
                            "mention_id": s.payload.get("mention_id"),
                            "score": s.score,
                            "sentiment": s.payload.get("sentiment_score"),
                            "topics": s.payload.get("topics", [])
                        }
                        for s in similar
                    ]
                }

            except Exception as e:
                raise self.retry(exc=e)

    return asyncio.run(_find())


@celery_app.task(bind=True, max_retries=3)
def semantic_search(self, tenant_id: str, query: str, limit: int = 20):
    """
    Perform semantic search across mentions.

    Args:
        tenant_id: Tenant to search within
        query: Search query text
        limit: Maximum results
    """
    import asyncio

    async def _search():
        if not KimiClient:
            return {"status": "error", "message": "Kimi client not configured"}

        try:
            # Generate query embedding
            client = KimiClient()
            query_embedding = await client.generate_embedding(query)

            if not query_embedding:
                return {"status": "error", "message": "Failed to generate query embedding"}

            # Search Qdrant
            from services.qdrant_client import QdrantClient
            qdrant = QdrantClient()

            results = await qdrant.search_by_vector(
                collection_name=f"tenant_{tenant_id}",
                vector=query_embedding,
                limit=limit
            )

            return {
                "status": "success",
                "tenant_id": tenant_id,
                "query": query,
                "results_count": len(results),
                "results": [
                    {
                        "mention_id": r.payload.get("mention_id"),
                        "score": r.score,
                        "sentiment": r.payload.get("sentiment_score"),
                        "published_at": r.payload.get("published_at")
                    }
                    for r in results
                ]
            }

        except Exception as e:
            raise self.retry(exc=e)

    return asyncio.run(_search())


def _calculate_sentiment_trend(mentions) -> str:
    """Calculate sentiment trend for a cluster of mentions."""
    if not mentions:
        return "stable"

    scores = [m.sentiment_score for m in mentions if m.sentiment_score is not None]
    if len(scores) < 2:
        return "stable"

    # Simple trend: compare first half to second half
    mid = len(scores) // 2
    first_half = sum(scores[:mid]) / mid if mid > 0 else 0
    second_half = sum(scores[mid:]) / (len(scores) - mid) if len(scores) > mid else 0

    diff = second_half - first_half
    if diff > 0.1:
        return "improving"
    elif diff < -0.1:
        return "declining"
    else:
        return "stable"
