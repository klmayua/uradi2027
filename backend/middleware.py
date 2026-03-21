from fastapi import Request, HTTPException, status
from sqlalchemy.orm import Session
import jwt
import os
from database import SessionLocal
from models import Tenant

# Get JWT settings from environment
SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

async def tenant_middleware(request: Request, call_next):
    """Middleware to ensure tenant isolation by validating tenant_id from JWT token"""
    # Skip tenant check for public endpoints
    public_paths = ["/health", "/health/simple", "/auth/login", "/auth/register", "/docs", "/openapi.json"]
    if any(request.url.path.startswith(path) for path in public_paths):
        response = await call_next(request)
        return response

    # Extract token from Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        # Allow unauthenticated requests to pass through
        # Actual authentication is handled by get_current_user dependency
        response = await call_next(request)
        return response

    token = auth_header.split(" ")[1]

    try:
        # Decode token to get tenant_id
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        tenant_id = payload.get("tenant_id")

        if tenant_id:
            # Verify tenant exists and is active
            db = SessionLocal()
            try:
                tenant = db.query(Tenant).filter(Tenant.id == tenant_id, Tenant.status == "active").first()
                if tenant:
                    # Add tenant_id to request state for use in route handlers
                    request.state.tenant_id = tenant_id
                else:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Tenant not found or inactive"
                    )
            finally:
                db.close()

    except jwt.PyJWTError:
        # Invalid token - let authentication layer handle it
        pass

    response = await call_next(request)
    return response