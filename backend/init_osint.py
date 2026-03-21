"""
OSINT Layer Initialization Script

This script initializes the OSINT layer for URADI-360:
1. Creates default OSINT sources
2. Sets up Qdrant collections
3. Creates initial metrics aggregation
4. Verifies Celery workers

Usage:
    py init_osint.py [--tenant-id TENANT_ID] [--setup-defaults]
"""

import asyncio
import argparse
import os
from datetime import datetime

# Add parent directory to path for imports
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


DEFAULT_SOURCES = [
    {
        "name": "Premium Times Nigeria",
        "source_type": "news",
        "source_url": "https://www.premiumtimesng.com/feed",
        "fetch_interval_minutes": 30,
        "priority": 9,
        "language_filter": ["en"],
    },
    {
        "name": "Vanguard Nigeria",
        "source_type": "news",
        "source_url": "https://www.vanguardngr.com/feed",
        "fetch_interval_minutes": 30,
        "priority": 9,
        "language_filter": ["en"],
    },
    {
        "name": "Daily Trust",
        "source_type": "news",
        "source_url": "https://dailytrust.com/feed",
        "fetch_interval_minutes": 30,
        "priority": 8,
        "language_filter": ["en"],
    },
    {
        "name": "The Guardian Nigeria",
        "source_type": "news",
        "source_url": "https://guardian.ng/feed",
        "fetch_interval_minutes": 30,
        "priority": 8,
        "language_filter": ["en"],
    },
    {
        "name": "Punch Nigeria",
        "source_type": "news",
        "source_url": "https://punchng.com/feed",
        "fetch_interval_minutes": 30,
        "priority": 8,
        "language_filter": ["en"],
    },
    {
        "name": "Sahara Reporters",
        "source_type": "news",
        "source_url": "https://saharareporters.com/rss.xml",
        "fetch_interval_minutes": 30,
        "priority": 7,
        "language_filter": ["en"],
    },
    {
        "name": "Channels TV",
        "source_type": "news",
        "source_url": "https://www.channelstv.com/feed",
        "fetch_interval_minutes": 30,
        "priority": 7,
        "language_filter": ["en"],
    },
    {
        "name": "INEC Nigeria",
        "source_type": "government",
        "source_url": "https://www.inecnigeria.org/feed",
        "fetch_interval_minutes": 60,
        "priority": 10,
        "language_filter": ["en"],
    },
]


async def create_default_sources(tenant_id: str = None):
    """Create default OSINT sources for a tenant."""
    try:
        from database import AsyncSessionLocal
        from models_osint import OSINTSource
    except ImportError as e:
        print(f"Error importing required modules: {e}")
        return False

    if not AsyncSessionLocal:
        print("Database not configured")
        return False

    async with AsyncSessionLocal() as session:
        from sqlalchemy import select

        created_count = 0
        skipped_count = 0

        for source_data in DEFAULT_SOURCES:
            # Check if source already exists
            result = await session.execute(
                select(OSINTSource).where(
                    OSINTSource.source_url == source_data["source_url"],
                    OSINTSource.tenant_id == tenant_id
                )
            )
            existing = result.scalar_one_or_none()

            if existing:
                skipped_count += 1
                continue

            # Create new source
            source = OSINTSource(
                tenant_id=tenant_id,
                **source_data,
                is_active=True,
                last_fetch_status="pending"
            )
            session.add(source)
            created_count += 1

        await session.commit()
        print(f"Created {created_count} sources, skipped {skipped_count} existing")
        return True


async def setup_qdrant_collections(tenant_id: str = None):
    """Set up Qdrant collections for tenants."""
    try:
        from services.qdrant_client import QdrantClient
    except ImportError as e:
        print(f"Error importing Qdrant client: {e}")
        return False

    client = QdrantClient()

    if tenant_id:
        # Setup for specific tenant
        collection_name = f"tenant_{tenant_id}"
        success = await client.ensure_collection(collection_name)
        if success:
            print(f"Created/verified Qdrant collection: {collection_name}")
        return success
    else:
        # Setup for all tenants
        try:
            from database import AsyncSessionLocal
            from models import Tenant
        except ImportError:
            print("Cannot import Tenant model")
            return False

        if not AsyncSessionLocal:
            print("Database not configured")
            return False

        async with AsyncSessionLocal() as session:
            from sqlalchemy import select

            result = await session.execute(select(Tenant.id))
            tenant_ids = [r[0] for r in result.all()]

            for tid in tenant_ids:
                collection_name = f"tenant_{tid}"
                await client.ensure_collection(collection_name)
                print(f"Created/verified Qdrant collection: {collection_name}")

        return True


def check_celery_workers():
    """Check if Celery workers are running."""
    try:
        from celery_app import celery_app

        # Ping workers
        result = celery_app.control.ping(timeout=5)
        if result:
            print(f"Celery workers active: {len(result)}")
            for worker in result:
                for worker_name, response in worker.items():
                    print(f"  - {worker_name}: {response}")
            return True
        else:
            print("WARNING: No Celery workers detected")
            print("Start workers with: celery -A celery_app worker --loglevel=info")
            return False

    except Exception as e:
        print(f"Error checking Celery: {e}")
        return False


def check_qdrant_connection():
    """Check Qdrant connection."""
    try:
        from services.qdrant_client import QdrantClient

        client = QdrantClient()
        healthy = asyncio.run(client.health_check())

        if healthy:
            print("Qdrant connection: OK")
            return True
        else:
            print("WARNING: Cannot connect to Qdrant")
            return False

    except Exception as e:
        print(f"Qdrant check error: {e}")
        return False


def check_redis_connection():
    """Check Redis connection."""
    try:
        import redis

        r = redis.from_url(
            os.getenv("REDIS_URL", "redis://localhost:6379/0"),
            socket_connect_timeout=5
        )
        r.ping()
        print("Redis connection: OK")
        return True

    except Exception as e:
        print(f"WARNING: Cannot connect to Redis: {e}")
        return False


async def init_osint(tenant_id: str = None, setup_defaults: bool = False):
    """Initialize OSINT layer."""
    print("=" * 60)
    print("URADI-360 OSINT Layer Initialization")
    print("=" * 60)
    print()

    # Check dependencies
    print("Checking dependencies...")
    redis_ok = check_redis_connection()
    qdrant_ok = check_qdrant_connection()
    celery_ok = check_celery_workers()
    print()

    # Setup Qdrant collections
    if qdrant_ok:
        print("Setting up Qdrant collections...")
        await setup_qdrant_collections(tenant_id)
        print()

    # Create default sources
    if setup_defaults:
        print("Creating default OSINT sources...")
        await create_default_sources(tenant_id)
        print()

    # Summary
    print("=" * 60)
    print("Initialization Summary:")
    print(f"  Redis: {'OK' if redis_ok else 'FAILED'}")
    print(f"  Qdrant: {'OK' if qdrant_ok else 'FAILED'}")
    print(f"  Celery: {'OK' if celery_ok else 'FAILED'}")
    print("=" * 60)

    if all([redis_ok, qdrant_ok, celery_ok]):
        print()
        print("OSINT layer is ready!")
        print()
        print("Next steps:")
        print("  1. Start Celery workers:")
        print("     celery -A celery_app worker --loglevel=info -Q ingestion,classification,embedding,alerts,briefs,default")
        print()
        print("  2. Start Celery beat (scheduler):")
        print("     celery -A celery_app beat --loglevel=info")
        print()
        print("  3. Verify sources are active via API:")
        print("     GET /api/osint/sources")
        return True
    else:
        print()
        print("WARNING: Some dependencies are not available.")
        print("Please check the configuration and try again.")
        return False


def main():
    parser = argparse.ArgumentParser(description="Initialize URADI-360 OSINT layer")
    parser.add_argument(
        "--tenant-id",
        help="Initialize for specific tenant ID"
    )
    parser.add_argument(
        "--setup-defaults",
        action="store_true",
        help="Create default OSINT sources"
    )
    parser.add_argument(
        "--check-only",
        action="store_true",
        help="Only check dependencies, don't initialize"
    )

    args = parser.parse_args()

    if args.check_only:
        print("Checking OSINT dependencies...")
        check_redis_connection()
        check_qdrant_connection()
        check_celery_workers()
        return

    asyncio.run(init_osint(args.tenant_id, args.setup_defaults))


if __name__ == "__main__":
    main()
