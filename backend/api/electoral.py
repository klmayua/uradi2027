"""Electoral Router - Stub Implementation"""
from fastapi import APIRouter

router = APIRouter(prefix="/electoral", tags=["Electoral"])

@router.get("/constituencies")
async def get_constituencies():
    """Get constituencies - stub"""
    return {"status": "success", "data": []}
