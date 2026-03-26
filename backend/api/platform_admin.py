"""Platform Admin Router - Stub Implementation"""
from fastapi import APIRouter

router = APIRouter(prefix="/platform-admin", tags=["Platform Admin"])

@router.get("/stats")
async def get_platform_stats():
    """Get platform statistics - stub"""
    return {"status": "success", "data": {}}
