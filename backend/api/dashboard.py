"""Dashboard Router - Stub Implementation"""
from fastapi import APIRouter

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/metrics")
async def get_dashboard_metrics():
    """Get dashboard metrics - stub"""
    return {"status": "success", "data": {}}
