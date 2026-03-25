"""
Auth Middleware
Re-exports from utils.py for backward compatibility
"""
from fastapi import HTTPException, status
from auth.utils import get_current_user

async def require_auth(request):
    """Dependency to require authentication"""
    # This is a simplified version - actual implementation would extract token from request
    raise HTTPException(status_code=401, detail="Authentication required")

def require_role(*roles):
    """Dependency to require specific roles"""
    async def checker(request):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return checker

__all__ = ['require_auth', 'require_role']
