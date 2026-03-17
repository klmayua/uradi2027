from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from models import Tenant
from auth.utils import get_current_user
from middleware import tenant_middleware

router = APIRouter(prefix="/tenants", tags=["Tenants"])

class TenantCreate(BaseModel):
    id: str
    display_name: str
    state: str
    tier: str
    candidate_name: Optional[str] = None
    candidate_party: Optional[str] = None
    lga_count: Optional[int] = None
    config: Optional[dict] = {}

class TenantUpdate(BaseModel):
    display_name: Optional[str] = None
    candidate_name: Optional[str] = None
    candidate_party: Optional[str] = None
    config: Optional[dict] = None
    status: Optional[str] = None

class TenantResponse(BaseModel):
    id: str
    display_name: str
    state: str
    tier: str
    candidate_name: Optional[str]
    candidate_party: Optional[str]
    lga_count: Optional[int]
    config: dict
    status: str

def convert_tenant_to_response(tenant: Tenant) -> TenantResponse:
    return TenantResponse(
        id=tenant.id,
        display_name=tenant.display_name,
        state=tenant.state,
        tier=tenant.tier,
        candidate_name=tenant.candidate_name,
        candidate_party=tenant.candidate_party,
        lga_count=tenant.lga_count,
        config=tenant.config if tenant.config else {},
        status=tenant.status
    )

@router.get("/", response_model=List[TenantResponse])
def list_tenants(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """List all tenants - superadmin only"""
    # In a real implementation, we would check if the user is a superadmin
    # For now, we'll return all tenants
    tenants = db.query(Tenant).all()
    return [convert_tenant_to_response(tenant) for tenant in tenants]

@router.get("/{tenant_id}", response_model=TenantResponse)
def get_tenant(tenant_id: str, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get tenant details"""
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return convert_tenant_to_response(tenant)

@router.patch("/{tenant_id}", response_model=TenantResponse)
def update_tenant(tenant_id: str, tenant_update: TenantUpdate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update tenant configuration"""
    # In a real implementation, we would check if the user has permission to update this tenant
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Update fields if provided
    if tenant_update.display_name is not None:
        tenant.display_name = tenant_update.display_name
    if tenant_update.candidate_name is not None:
        tenant.candidate_name = tenant_update.candidate_name
    if tenant_update.candidate_party is not None:
        tenant.candidate_party = tenant_update.candidate_party
    if tenant_update.config is not None:
        tenant.config = tenant_update.config
    if tenant_update.status is not None:
        tenant.status = tenant_update.status
    
    db.commit()
    db.refresh(tenant)
    return convert_tenant_to_response(tenant)

@router.post("/", response_model=TenantResponse)
def create_tenant(tenant: TenantCreate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create new tenant - superadmin only"""
    # In a real implementation, we would check if the user is a superadmin
    # Check if tenant already exists
    existing_tenant = db.query(Tenant).filter(Tenant.id == tenant.id).first()
    if existing_tenant:
        raise HTTPException(status_code=400, detail="Tenant already exists")
    
    # Create new tenant
    db_tenant = Tenant(
        id=tenant.id,
        display_name=tenant.display_name,
        state=tenant.state,
        tier=tenant.tier,
        candidate_name=tenant.candidate_name,
        candidate_party=tenant.candidate_party,
        lga_count=tenant.lga_count,
        config=tenant.config
    )
    
    db.add(db_tenant)
    db.commit()
    db.refresh(db_tenant)
    return convert_tenant_to_response(db_tenant)