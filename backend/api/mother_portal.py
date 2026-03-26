"""Mother Portal Router - Stub Implementation"""
from fastapi import APIRouter

router = APIRouter(prefix="/mother-portal", tags=["Mother Portal"])

@router.get("/data")
async def get_mother_portal_data():
    """Get mother portal data - stub"""
    return {"status": "success", "data": {}}
