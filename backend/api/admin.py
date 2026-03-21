"""
Admin API for Tenant Provisioning and Management
Critical for multi-customer onboarding
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict
from datetime import datetime
import uuid
import secrets
import string

from database import get_db
from models import Tenant, User, LGA, Ward
from models_osint import OSINTSource
from auth.utils import get_current_user, get_password_hash
from email_service import send_email

router = APIRouter(prefix="/admin", tags=["Admin"])


# ============== Pydantic Schemas ==============

class AdminUserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: Optional[str] = None  # Auto-generated if not provided
    phone: Optional[str] = None


class TenantProvisioningRequest(BaseModel):
    tenant_id: str
    display_name: str
    state: str
    candidate_name: str
    candidate_party: str
    lga_count: int
    tier: str = "standard"
    admin_user: AdminUserCreate
    config: Optional[Dict] = {}


class TenantProvisioningResponse(BaseModel):
    tenant_id: str
    status: str
    message: str
    admin_email: str
    admin_password_temporary: Optional[str] = None
    seeded_lgas: int
    seeded_sources: int


class TenantListResponse(BaseModel):
    id: str
    display_name: str
    state: str
    candidate_name: Optional[str]
    candidate_party: Optional[str]
    status: str
    tier: str
    created_at: datetime
    user_count: int


class AuditLogEntry(BaseModel):
    id: str
    user_id: str
    user_name: str
    action: str
    entity_type: str
    entity_id: str
    description: str
    ip_address: str
    created_at: datetime
    severity: str


# ============== Helper Functions ==============

def generate_secure_password(length: int = 12) -> str:
    """Generate a secure random password"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    while True:
        password = ''.join(secrets.choice(alphabet) for _ in range(length))
        if (any(c.islower() for c in password)
            and any(c.isupper() for c in password)
            and any(c.isdigit() for c in password)
            and any(c in "!@#$%^&*" for c in password)):
            return password


def seed_lga_data(db: Session, tenant_id: str, state: str) -> int:
    """
    Seed LGA data for a state.
    In production, this would come from INEC API or database.
    """
    # Nigerian state LGA data (simplified - full data would be loaded from external source)
    lga_data = {
        "Jigawa": [
            "Auyo", "Babura", "Birnin Kudu", "Birniwa", "Buji",
            "Dutse", "Gagarawa", "Garki", "Gumel", "Guri",
            "Gwaram", "Gwiwa", "Hadejia", "Jahun", "Kafin Hausa",
            "Kaugama", "Kazaure", "Kiri Kasama", "Kiyawa", "Maigatari",
            "Malam Madori", "Miga", "Ringim", "Roni", "Sule Tankarkar",
            "Taura", "Yankwashi"
        ],
        "Kano": [
            "Ajingi", "Albasu", "Bagwai", "Bebeji", "Bichi",
            "Bunkure", "Dala", "Dambatta", "Dawakin Kudu", "Dawakin Tofa",
            "Doguwa", "Fagge", "Gabasawa", "Garko", "Garun Mallam",
            "Gaya", "Gezawa", "Gwale", "Gwarzo", "Kabo",
            "Kano Municipal", "Karaye", "Kibiya", "Kiru", "Kumbotso",
            "Kunchi", "Kura", "Madobi", "Makoda", "Minjibir",
            "Nasarawa", "Rano", "Rimin Gado", "Rogo", "Shanono",
            "Sumaila", "Takai", "Tarauni", "Tofa", "Tsanyawa",
            "Tudun Wada", "Ungogo", "Warawa", "Wudil"
        ]
    }

    lgas = lga_data.get(state, [])
    count = 0

    for lga_name in lgas:
        lga = LGA(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            name=lga_name,
            code=lga_name.lower().replace(" ", "_"),
            population=None  # Would be populated from census data
        )
        db.add(lga)
        count += 1

    db.commit()
    return count


def seed_default_osint_sources(db: Session, tenant_id: str, state: str) -> int:
    """Seed default OSINT sources for a state"""

    default_sources = [
        # News sources
        {
            "name": f"{state} State Government",
            "source_type": "government",
            "source_url": f"https://{state.lower()}.state.gov.ng",
            "fetch_interval_minutes": 60,
            "priority": 1,
            "is_active": True,
        },
        {
            "name": "Daily Trust",
            "source_type": "news",
            "source_url": "https://dailytrust.com",
            "fetch_interval_minutes": 30,
            "priority": 2,
            "is_active": True,
        },
        {
            "name": "Premium Times",
            "source_type": "news",
            "source_url": "https://premiumtimesng.com",
            "fetch_interval_minutes": 30,
            "priority": 2,
            "is_active": True,
        },
        {
            "name": "Vanguard",
            "source_type": "news",
            "source_url": "https://vanguardngr.com",
            "fetch_interval_minutes": 30,
            "priority": 3,
            "is_active": True,
        },
        {
            "name": "Sahara Reporters",
            "source_type": "news",
            "source_url": "https://saharareporters.com",
            "fetch_interval_minutes": 60,
            "priority": 3,
            "is_active": True,
        },
    ]

    count = 0
    for source_data in default_sources:
        source = OSINTSource(
            id=uuid.uuid4(),
            tenant_id=tenant_id,
            **source_data,
            config={},
            language_filter=["en", "ha"],
            last_fetch_status="pending"
        )
        db.add(source)
        count += 1

    db.commit()
    return count


def send_welcome_email(email: str, full_name: str, tenant_name: str, temporary_password: str):
    """Send welcome email to new admin"""
    subject = f"Welcome to URADI-360 - {tenant_name} Campaign"

    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #C8A94E;">Welcome to URADI-360</h2>

            <p>Dear {full_name},</p>

            <p>Your campaign command center has been set up successfully for
            <strong>{tenant_name}</strong>.</p>

            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Your Login Credentials</h3>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Temporary Password:</strong> {temporary_password}</p>
            </div>

            <p><strong>Important:</strong> Please change your password after your first login.</p>

            <p>You can access the command center at:<br>
            <a href="https://app.uradi360.com" style="color: #C8A94E;">https://app.uradi360.com</a></p>

            <p>If you have any questions, contact our support team at
            <a href="mailto:support@uradi360.com">support@uradi360.com</a>.</p>

            <p>Best regards,<br>The URADI-360 Team</p>
        </div>
    </body>
    </html>
    """

    send_email(to_email=email, subject=subject, html_content=html_content)


# ============== API Endpoints ==============

@router.post("/tenants/provision", response_model=TenantProvisioningResponse)
def provision_tenant(
    request: TenantProvisioningRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Provision a new tenant with full setup including:
    - Tenant record creation
    - LGA data seeding
    - Default OSINT sources
    - Admin user creation
    - Welcome email
    """
    # TODO: Check if current_user is superadmin

    # Check if tenant already exists
    existing = db.query(Tenant).filter(Tenant.id == request.tenant_id).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Tenant '{request.tenant_id}' already exists"
        )

    # Check if admin email already exists
    existing_user = db.query(User).filter(User.email == request.admin_user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail=f"User with email '{request.admin_user.email}' already exists"
        )

    try:
        # 1. Create Tenant
        tenant = Tenant(
            id=request.tenant_id,
            display_name=request.display_name,
            state=request.state,
            tier=request.tier,
            candidate_name=request.candidate_name,
            candidate_party=request.candidate_party,
            lga_count=request.lga_count,
            config=request.config,
            status="active"
        )
        db.add(tenant)
        db.commit()

        # 2. Seed LGA data
        lgas_seeded = seed_lga_data(db, request.tenant_id, request.state)

        # 3. Seed OSINT sources
        sources_seeded = seed_default_osint_sources(db, request.tenant_id, request.state)

        # 4. Create admin user
        temp_password = request.admin_user.password or generate_secure_password()
        admin_user = User(
            id=uuid.uuid4(),
            tenant_id=request.tenant_id,
            email=request.admin_user.email,
            full_name=request.admin_user.full_name,
            phone=request.admin_user.phone,
            role="admin",
            password_hash=get_password_hash(temp_password),
            active=True
        )
        db.add(admin_user)
        db.commit()

        # 5. Send welcome email (async)
        background_tasks.add_task(
            send_welcome_email,
            email=request.admin_user.email,
            full_name=request.admin_user.full_name,
            tenant_name=request.display_name,
            temporary_password=temp_password
        )

        return TenantProvisioningResponse(
            tenant_id=request.tenant_id,
            status="success",
            message=f"Tenant '{request.display_name}' provisioned successfully",
            admin_email=request.admin_user.email,
            admin_password_temporary=temp_password if not request.admin_user.password else None,
            seeded_lgas=lgas_seeded,
            seeded_sources=sources_seeded
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to provision tenant: {str(e)}"
        )


@router.get("/tenants", response_model=List[TenantListResponse])
def list_all_tenants(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all tenants with user counts - superadmin only"""
    # TODO: Check superadmin permission

    tenants = db.query(Tenant).all()
    result = []

    for tenant in tenants:
        user_count = db.query(User).filter(User.tenant_id == tenant.id).count()
        result.append(TenantListResponse(
            id=tenant.id,
            display_name=tenant.display_name,
            state=tenant.state,
            candidate_name=tenant.candidate_name,
            candidate_party=tenant.candidate_party,
            status=tenant.status,
            tier=tenant.tier,
            created_at=tenant.created_at,
            user_count=user_count
        ))

    return result


@router.post("/tenants/{tenant_id}/seed")
def seed_tenant_data(
    tenant_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Re-seed default data for a tenant"""
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    lgas_seeded = seed_lga_data(db, tenant_id, tenant.state)
    sources_seeded = seed_default_osint_sources(db, tenant_id, tenant.state)

    return {
        "message": "Tenant data seeded successfully",
        "lgas": lgas_seeded,
        "osint_sources": sources_seeded
    }


@router.delete("/tenants/{tenant_id}")
def soft_delete_tenant(
    tenant_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Soft delete a tenant (disable rather than remove)"""
    # TODO: Check superadmin permission

    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    tenant.status = "disabled"
    db.commit()

    return {"message": f"Tenant '{tenant_id}' has been disabled"}


@router.get("/audit-logs", response_model=List[AuditLogEntry])
def get_audit_logs(
    limit: int = 100,
    offset: int = 0,
    tenant_id: Optional[str] = None,
    user_id: Optional[str] = None,
    action: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get audit logs with filtering"""
    # TODO: Implement actual audit log querying
    # This is a placeholder - real implementation would query audit log table

    return []
