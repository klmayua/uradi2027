"""Password Reset Router - Stub Implementation"""
from fastapi import APIRouter

router = APIRouter(prefix="/auth/password-reset", tags=["Password Reset"])

@router.post("/request")
async def request_password_reset(email: str):
    """Request password reset - stub implementation"""
    return {"status": "success", "message": "If the email exists, a reset link will be sent"}

@router.post("/reset")
async def reset_password(token: str, new_password: str):
    """Reset password with token - stub implementation"""
    return {"status": "success", "message": "Password reset successfully"}
