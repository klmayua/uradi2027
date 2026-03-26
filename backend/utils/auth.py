"""Authentication Utilities - Stub Implementation"""
from fastapi import Depends, HTTPException, status
from typing import Callable

async def get_current_user(token: str = ""):
    """Get current user from token - stub"""
    return {"id": "stub_user_id", "email": "stub@example.com"}

def require_permissions(*permissions):
    """Require specific permissions - stub dependency"""
    async def checker(current_user: dict = Depends(get_current_user)):
        return current_user
    return checker
