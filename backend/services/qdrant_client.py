"""
Qdrant Vector Database Client

Service for storing and searching vector embeddings.
"""

import os
from typing import Dict, List, Optional, Any
from dataclasses import dataclass

try:
    from qdrant_client import QdrantClient as Qdrant
    from qdrant_client.models import Distance, VectorParams, PointStruct
    QDRANT_AVAILABLE = True
except ImportError:
    QDRANT_AVAILABLE = False
    Qdrant = None


@dataclass
class SearchResult:
    """Result from vector search."""
    id: str
    score: float
    payload: Dict[str, Any]


class QdrantClient:
    """Client for Qdrant vector database operations."""

    def __init__(self, url: str = None, api_key: str = None):
        """
        Initialize Qdrant client.

        Args:
            url: Qdrant server URL
            api_key: API key for authentication
        """
        self.url = url or os.getenv("QDRANT_URL", "http://localhost:6333")
        self.api_key = api_key or os.getenv("QDRANT_API_KEY")
        self.client = None

        if QDRANT_AVAILABLE:
            self._connect()

    def _connect(self):
        """Establish connection to Qdrant."""
        if not QDRANT_AVAILABLE:
            return

        try:
            self.client = Qdrant(
                url=self.url,
                api_key=self.api_key,
            )
        except Exception as e:
            print(f"Failed to connect to Qdrant: {e}")
            self.client = None

    async def ensure_collection(self, collection_name: str, vector_size: int = 1536):
        """
        Ensure collection exists, create if not.

        Args:
            collection_name: Name of the collection
            vector_size: Size of vectors (default 1536 for Kimi embeddings)
        """
        if not self.client:
            return False

        try:
            # Check if collection exists
            collections = self.client.get_collections()
            collection_names = [c.name for c in collections.collections]

            if collection_name not in collection_names:
                # Create collection
                self.client.create_collection(
                    collection_name=collection_name,
                    vectors_config=VectorParams(
                        size=vector_size,
                        distance=Distance.COSINE
                    )
                )
                print(f"Created Qdrant collection: {collection_name}")

            return True

        except Exception as e:
            print(f"Error ensuring collection {collection_name}: {e}")
            return False

    async def store_embedding(
        self,
        collection_name: str,
        vector: List[float],
        payload: Dict[str, Any],
        point_id: str = None
    ) -> Optional[str]:
        """
        Store a vector embedding.

        Args:
            collection_name: Collection to store in
            vector: The embedding vector
            payload: Metadata to store with vector
            point_id: Optional custom ID

        Returns:
            ID of stored point or None on failure
        """
        if not self.client:
            return None

        try:
            # Ensure collection exists
            await self.ensure_collection(collection_name, len(vector))

            # Generate ID if not provided
            if point_id is None:
                import uuid
                point_id = str(uuid.uuid4())

            # Store point
            self.client.upsert(
                collection_name=collection_name,
                points=[
                    PointStruct(
                        id=point_id,
                        vector=vector,
                        payload=payload
                    )
                ]
            )

            return point_id

        except Exception as e:
            print(f"Error storing embedding: {e}")
            return None

    async def get_embedding(self, collection_name: str, vector_id: str) -> Optional[List[float]]:
        """
        Retrieve a vector by ID.

        Args:
            collection_name: Collection name
            vector_id: ID of the vector

        Returns:
            Vector or None
        """
        if not self.client:
            return None

        try:
            result = self.client.retrieve(
                collection_name=collection_name,
                ids=[vector_id],
                with_vectors=True
            )

            if result:
                return result[0].vector
            return None

        except Exception as e:
            print(f"Error retrieving embedding: {e}")
            return None

    async def search_similar(
        self,
        collection_name: str,
        vector_id: str,
        limit: int = 10,
        score_threshold: float = 0.7
    ) -> List[SearchResult]:
        """
        Search for similar vectors to a given vector ID.

        Args:
            collection_name: Collection to search
            vector_id: ID of reference vector
            limit: Maximum results
            score_threshold: Minimum similarity score

        Returns:
            List of similar vectors
        """
        if not self.client:
            return []

        try:
            # First get the reference vector
            reference = await self.get_embedding(collection_name, vector_id)
            if not reference:
                return []

            # Search by vector
            return await self.search_by_vector(
                collection_name,
                reference,
                limit,
                score_threshold,
                exclude_ids=[vector_id]
            )

        except Exception as e:
            print(f"Error in similar search: {e}")
            return []

    async def search_by_vector(
        self,
        collection_name: str,
        vector: List[float],
        limit: int = 10,
        score_threshold: float = 0.7,
        exclude_ids: List[str] = None
    ) -> List[SearchResult]:
        """
        Search for similar vectors.

        Args:
            collection_name: Collection to search
            vector: Query vector
            limit: Maximum results
            score_threshold: Minimum similarity score
            exclude_ids: IDs to exclude from results

        Returns:
            List of similar vectors
        """
        if not self.client:
            return []

        try:
            results = self.client.search(
                collection_name=collection_name,
                query_vector=vector,
                limit=limit,
                score_threshold=score_threshold
            )

            # Filter excluded IDs
            exclude_set = set(exclude_ids or [])

            return [
                SearchResult(
                    id=str(r.id),
                    score=r.score,
                    payload=r.payload
                )
                for r in results
                if str(r.id) not in exclude_set
            ]

        except Exception as e:
            print(f"Error in vector search: {e}")
            return []

    async def delete_by_filter(self, collection_name: str, filter_dict: Dict):
        """
        Delete points matching filter.

        Args:
            collection_name: Collection name
            filter_dict: Filter criteria
        """
        if not self.client:
            return

        try:
            from qdrant_client.models import Filter, FieldCondition, MatchValue

            # Build filter
            conditions = []
            for key, value in filter_dict.items():
                conditions.append(
                    FieldCondition(
                        key=key,
                        match=MatchValue(value=value)
                    )
                )

            filter_obj = Filter(must=conditions)

            self.client.delete(
                collection_name=collection_name,
                points_filter=filter_obj
            )

        except Exception as e:
            print(f"Error deleting points: {e}")

    async def get_collection_stats(self, collection_name: str) -> Dict:
        """
        Get statistics for a collection.

        Args:
            collection_name: Collection name

        Returns:
            Dictionary with statistics
        """
        if not self.client:
            return {"error": "Qdrant not available"}

        try:
            info = self.client.get_collection(collection_name)
            return {
                "vectors_count": info.vectors_count,
                "indexed_vectors_count": info.indexed_vectors_count,
                "points_count": info.points_count,
                "segments_count": info.segments_count,
                "status": info.status
            }
        except Exception as e:
            return {"error": str(e)}

    async def health_check(self) -> bool:
        """Check if Qdrant is accessible."""
        if not self.client:
            return False

        try:
            self.client.get_collections()
            return True
        except:
            return False


# Singleton instance
_qdrant_client = None


def get_qdrant_client() -> QdrantClient:
    """Get or create Qdrant client singleton."""
    global _qdrant_client
    if _qdrant_client is None:
        _qdrant_client = QdrantClient()
    return _qdrant_client
