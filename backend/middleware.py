from fastapi import Request, HTTPException, status, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Tenant
from auth.utils import get_tenant_from_token

async def tenant_middleware(request: Request, db: Session = Depends(get_db)):
    """Middleware to ensure tenant isolation by validating tenant_id from JWT token"""
    # Extract tenant_id from JWT token
    tenant_id = get_tenant_from_token()
    
    # Verify tenant exists and is active
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id, Tenant.status == "active").first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant not found or inactive"
        )
    
    # Add tenant_id to request state for use in route handlers
    request.state.tenant_id = tenant_id
    return tenant_id