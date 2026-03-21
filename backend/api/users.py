"""
User Management API
Comprehensive user management with role-based permissions
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
import secrets
import string

from database import get_db
from models import User, Tenant, AuditLog
from auth.utils import get_current_user, get_password_hash, verify_password
from email_service import send_email

router = APIRouter(prefix="/users", tags=["Users"])


# ============== Pydantic Schemas ==============

class UserRole(str, Enum):
    SUPERADMIN = "superadmin"
    ADMIN = "admin"
    STRATEGIST = "strategist"
    COORDINATOR = "coordinator"
    ANALYST = "analyst"
    FIELD_AGENT = "field_agent"
    MONITOR = "monitor"
    CONTENT_MANAGER = "content_manager"
    FINANCE_MANAGER = "finance_manager"


class UserStatus(str, Enum):
    ACTIVE = "active"
    PENDING = "pending"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    role: UserRole
    assigned_lga: Optional[str] = None
    assigned_ward: Optional[str] = None
    send_invite: bool = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    role: Optional[UserRole] = None
    assigned_lga: Optional[str] = None
    assigned_ward: Optional[str] = None
    status: Optional[UserStatus] = None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str]
    role: str
    assigned_lga: Optional[str]
    assigned_ward: Optional[str]
    status: str
    last_login: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    created_by: Optional[str]
    avatar_url: Optional[str]


class UserListResponse(BaseModel):
    items: List[UserResponse]
    total: int
    page: int
    limit: int
    pages: int


class UserInviteRequest(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole
    assigned_lga: Optional[str] = None
    message: Optional[str] = None


class UserInviteResponse(BaseModel):
    id: str
    email: str
    status: str
    invite_token: str
    expires_at: datetime


class PermissionCheckRequest(BaseModel):
    resource: str
    action: str


class PermissionCheckResponse(BaseModel):
    allowed: bool
    reason: Optional[str] = None


class RolePermissions(BaseModel):
    role: str
    permissions: Dict[str, List[str]]


class BulkUserAction(BaseModel):
    user_ids: List[str]
    action: str  # activate, deactivate, delete, change_role
    value: Optional[str] = None  # for change_role


class UserActivity(BaseModel):
    id: str
    action: str
    resource: str
    details: Optional[Dict]
    ip_address: Optional[str]
    created_at: datetime


class UserStats(BaseModel):
    total_users: int
    by_role: Dict[str, int]
    by_status: Dict[str, int]
    active_today: int
    active_this_week: int
    pending_invites: int


# ============== Permission Matrix ==============

ROLE_PERMISSIONS = {
    UserRole.SUPERADMIN: {
        "*": ["create", "read", "update", "delete", "manage"],
    },
    UserRole.ADMIN: {
        "users": ["create", "read", "update", "delete"],
        "voters": ["create", "read", "update", "delete", "import", "export"],
        "canvassing": ["create", "read", "update", "delete", "assign"],
        "field_ops": ["create", "read", "update", "verify"],
        "osint": ["create", "read", "update", "delete", "manage"],
        "sentiment": ["read", "configure", "export"],
        "election_day": ["create", "read", "update", "verify"],
        "governance": ["read", "update"],
        "content": ["create", "read", "update", "delete", "publish"],
        "messaging": ["create", "read", "send", "manage"],
        "reports": ["create", "read", "export"],
        "settings": ["read", "update"],
        "audit_logs": ["read"],
        "data_export": ["create", "read"],
    },
    UserRole.STRATEGIST: {
        "voters": ["read", "export"],
        "osint": ["read", "create_alerts"],
        "sentiment": ["read", "configure"],
        "reports": ["create", "read", "export"],
        "governance": ["read"],
        "settings": ["read"],
    },
    UserRole.COORDINATOR: {
        "users": ["read", "create_field_agents"],
        "voters": ["create", "read", "update"],
        "canvassing": ["create", "read", "update", "assign"],
        "field_ops": ["create", "read", "update", "verify", "track"],
        "election_day": ["create", "read", "update"],
        "reports": ["read"],
    },
    UserRole.ANALYST: {
        "voters": ["read", "export"],
        "osint": ["read"],
        "sentiment": ["read"],
        "reports": ["create", "read", "export"],
        "election_day": ["read"],
    },
    UserRole.FIELD_AGENT: {
        "voters": ["create", "read_own", "update_own"],
        "canvassing": ["create", "read_own", "update_own"],
        "field_ops": ["create", "read_own"],
    },
    UserRole.MONITOR: {
        "election_day": ["create", "read"],
        "field_ops": ["read"],
    },
    UserRole.CONTENT_MANAGER: {
        "content": ["create", "read", "update", "delete", "publish"],
        "osint": ["read", "create_alerts"],
        "messaging": ["create", "read", "send"],
    },
    UserRole.FINANCE_MANAGER: {
        "governance": ["read", "update_budget"],
        "reports": ["read", "export"],
        "audit_logs": ["read"],
    },
}


# ============== Helper Functions ==============

def check_permission(user: User, resource: str, action: str) -> bool:
    """Check if user has permission for a resource/action"""
    if user.role == UserRole.SUPERADMIN:
        return True

    role_perms = ROLE_PERMISSIONS.get(user.role, {})
    resource_perms = role_perms.get(resource, [])

    return action in resource_perms or "*" in resource_perms


def generate_invite_token() -> str:
    """Generate secure invite token"""
    return secrets.token_urlsafe(32)


def generate_temp_password(length: int = 12) -> str:
    """Generate secure temporary password"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    while True:
        password = ''.join(secrets.choice(alphabet) for _ in range(length))
        if (any(c.islower() for c in password)
            and any(c.isupper() for c in password)
            and any(c.isdigit() for c in password)
            and any(c in "!@#$%^&*" for c in password)):
            return password


def send_invite_email(email: str, full_name: str, invite_token: str, tenant_name: str, inviter_name: str):
    """Send invitation email to new user"""
    invite_url = f"https://app.uradi360.com/accept-invite?token={invite_token}"

    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #C8A94E;">You're Invited to Join {tenant_name}</h2>

            <p>Dear {full_name},</p>

            <p>{inviter_name} has invited you to join the campaign team on URADI-360.</p>

            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Campaign:</strong> {tenant_name}</p>
                <p><strong>Invited by:</strong> {inviter_name}</p>
            </div>

            <p><a href="{invite_url}" style="background: #C8A94E; color: #0A1628; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Accept Invitation</a></p>

            <p style="color: #666; font-size: 14px;">This link expires in 7 days. If you didn't expect this invitation, please ignore this email.</p>

            <p>Best regards,<br>The URADI-360 Team</p>
        </div>
    </body>
    </html>
    """

    send_email(
        to_email=email,
        subject=f"Invitation to join {tenant_name} on URADI-360",
        html_content=html_content
    )


def log_user_action(db: Session, user_id: str, action: str, resource: str, details: Dict = None, ip_address: str = None):
    """Log user action to audit log"""
    audit = AuditLog(
        id=uuid.uuid4(),
        user_id=user_id,
        action=action,
        entity_type="user",
        entity_id=resource,
        description=f"{action} on {resource}",
        ip_address=ip_address,
        created_at=datetime.utcnow()
    )
    db.add(audit)
    db.commit()


# ============== API Endpoints ==============

@router.post("", response_model=UserResponse)
def create_user(
    request: UserCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new user.
    Requires 'users:create' permission.
    """
    # Check permission
    if not check_permission(current_user, "users", "create"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to create users"
        )

    # Check if email exists
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )

    # Generate invite token and temp password
    invite_token = generate_invite_token()
    temp_password = generate_temp_password()

    # Create user
    user = User(
        id=uuid.uuid4(),
        tenant_id=current_user.tenant_id,
        email=request.email,
        full_name=request.full_name,
        phone=request.phone,
        role=request.role,
        assigned_lga=request.assigned_lga,
        assigned_ward=request.assigned_ward,
        password_hash=get_password_hash(temp_password),
        status=UserStatus.PENDING if request.send_invite else UserStatus.ACTIVE,
        invite_token=invite_token if request.send_invite else None,
        invite_expires_at=datetime.utcnow() + timedelta(days=7) if request.send_invite else None,
        created_by=str(current_user.id),
        created_at=datetime.utcnow(),
        active=True
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # Send invite email
    if request.send_invite:
        tenant = db.query(Tenant).filter(Tenant.id == current_user.tenant_id).first()
        background_tasks.add_task(
            send_invite_email,
            email=request.email,
            full_name=request.full_name,
            invite_token=invite_token,
            tenant_name=tenant.display_name if tenant else "Campaign",
            inviter_name=current_user.full_name
        )

    # Log action
    log_user_action(db, str(current_user.id), "USER_CREATE", str(user.id), {"role": request.role})

    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,
        assigned_lga=user.assigned_lga,
        assigned_ward=user.assigned_ward,
        status=user.status,
        last_login=user.last_login,
        created_at=user.created_at,
        updated_at=user.updated_at,
        created_by=user.created_by,
        avatar_url=user.avatar_url
    )


@router.get("", response_model=UserListResponse)
def list_users(
    role: Optional[str] = None,
    status: Optional[str] = None,
    lga: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List users with filtering and pagination.
    Requires 'users:read' permission.
    """
    if not check_permission(current_user, "users", "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view users"
        )

    query = db.query(User).filter(User.tenant_id == current_user.tenant_id)

    # Apply filters
    if role:
        query = query.filter(User.role == role)
    if status:
        query = query.filter(User.status == status)
    if lga:
        query = query.filter(User.assigned_lga == lga)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (User.full_name.ilike(search_filter)) |
            (User.email.ilike(search_filter))
        )

    # Get total count
    total = query.count()

    # Apply pagination
    users = query.offset((page - 1) * limit).limit(limit).all()

    return UserListResponse(
        items=[
            UserResponse(
                id=str(u.id),
                email=u.email,
                full_name=u.full_name,
                phone=u.phone,
                role=u.role,
                assigned_lga=u.assigned_lga,
                assigned_ward=u.assigned_ward,
                status=u.status,
                last_login=u.last_login,
                created_at=u.created_at,
                updated_at=u.updated_at,
                created_by=u.created_by,
                avatar_url=u.avatar_url
            )
            for u in users
        ],
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's information"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        role=current_user.role,
        assigned_lga=current_user.assigned_lga,
        assigned_ward=current_user.assigned_ward,
        status=current_user.status,
        last_login=current_user.last_login,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
        created_by=current_user.created_by,
        avatar_url=current_user.avatar_url
    )


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific user by ID"""
    if not check_permission(current_user, "users", "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view users"
        )

    user = db.query(User).filter(
        User.id == user_id,
        User.tenant_id == current_user.tenant_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,
        assigned_lga=user.assigned_lga,
        assigned_ward=user.assigned_ward,
        status=user.status,
        last_login=user.last_login,
        created_at=user.created_at,
        updated_at=user.updated_at,
        created_by=user.created_by,
        avatar_url=user.avatar_url
    )


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    request: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user information"""
    if not check_permission(current_user, "users", "update"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update users"
        )

    user = db.query(User).filter(
        User.id == user_id,
        User.tenant_id == current_user.tenant_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Update fields
    update_data = request.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)

    # Log action
    log_user_action(db, str(current_user.id), "USER_UPDATE", user_id, update_data)

    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,
        assigned_lga=user.assigned_lga,
        assigned_ward=user.assigned_ward,
        status=user.status,
        last_login=user.last_login,
        created_at=user.created_at,
        updated_at=user.updated_at,
        created_by=user.created_by,
        avatar_url=user.avatar_url
    )


@router.delete("/{user_id}")
def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete (soft delete) a user"""
    if not check_permission(current_user, "users", "delete"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete users"
        )

    user = db.query(User).filter(
        User.id == user_id,
        User.tenant_id == current_user.tenant_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Soft delete
    user.status = UserStatus.INACTIVE
    user.active = False
    user.updated_at = datetime.utcnow()
    db.commit()

    # Log action
    log_user_action(db, str(current_user.id), "USER_DELETE", user_id)

    return {"message": "User deleted successfully"}


@router.post("/{user_id}/resend-invite")
def resend_invite(
    user_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Resend invitation email to pending user"""
    if not check_permission(current_user, "users", "update"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to resend invites"
        )

    user = db.query(User).filter(
        User.id == user_id,
        User.tenant_id == current_user.tenant_id,
        User.status == UserStatus.PENDING
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pending user not found"
        )

    # Generate new token
    user.invite_token = generate_invite_token()
    user.invite_expires_at = datetime.utcnow() + timedelta(days=7)
    db.commit()

    # Send email
    tenant = db.query(Tenant).filter(Tenant.id == current_user.tenant_id).first()
    background_tasks.add_task(
        send_invite_email,
        email=user.email,
        full_name=user.full_name,
        invite_token=user.invite_token,
        tenant_name=tenant.display_name if tenant else "Campaign",
        inviter_name=current_user.full_name
    )

    return {"message": "Invitation resent successfully"}


@router.get("/stats/overview", response_model=UserStats)
def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user statistics for the tenant"""
    if not check_permission(current_user, "users", "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view stats"
        )

    # Get counts by role
    role_counts = db.query(
        User.role,
        func.count(User.id).label('count')
    ).filter(
        User.tenant_id == current_user.tenant_id
    ).group_by(User.role).all()

    # Get counts by status
    status_counts = db.query(
        User.status,
        func.count(User.id).label('count')
    ).filter(
        User.tenant_id == current_user.tenant_id
    ).group_by(User.status).all()

    # Get active today
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    active_today = db.query(User).filter(
        User.tenant_id == current_user.tenant_id,
        User.last_login >= today
    ).count()

    # Get active this week
    week_ago = datetime.utcnow() - timedelta(days=7)
    active_this_week = db.query(User).filter(
        User.tenant_id == current_user.tenant_id,
        User.last_login >= week_ago
    ).count()

    # Get pending invites
    pending_invites = db.query(User).filter(
        User.tenant_id == current_user.tenant_id,
        User.status == UserStatus.PENDING
    ).count()

    return UserStats(
        total_users=sum(r.count for r in role_counts),
        by_role={r.role: r.count for r in role_counts},
        by_status={s.status: s.count for s in status_counts},
        active_today=active_today,
        active_this_week=active_this_week,
        pending_invites=pending_invites
    )


@router.post("/check-permission", response_model=PermissionCheckResponse)
def check_user_permission(
    request: PermissionCheckRequest,
    current_user: User = Depends(get_current_user)
):
    """Check if current user has a specific permission"""
    allowed = check_permission(current_user, request.resource, request.action)

    return PermissionCheckResponse(
        allowed=allowed,
        reason=None if allowed else f"{current_user.role} does not have {request.action} permission on {request.resource}"
    )


@router.get("/roles/permissions")
def get_role_permissions(
    current_user: User = Depends(get_current_user)
):
    """Get all role permissions (for admin reference)"""
    if not check_permission(current_user, "users", "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view role permissions"
        )

    return {
        "roles": [
            {"role": role.value, "description": role.name}
            for role in UserRole
        ],
        "permissions": {
            role.value: perms
            for role, perms in ROLE_PERMISSIONS.items()
        }
    }


@router.post("/bulk-action")
def bulk_user_action(
    request: BulkUserAction,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Perform bulk actions on multiple users"""
    if not check_permission(current_user, "users", "update"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to perform bulk actions"
        )

    users = db.query(User).filter(
        User.id.in_(request.user_ids),
        User.tenant_id == current_user.tenant_id
    ).all()

    processed = 0
    for user in users:
        if request.action == "activate":
            user.status = UserStatus.ACTIVE
        elif request.action == "deactivate":
            user.status = UserStatus.INACTIVE
        elif request.action == "delete":
            user.status = UserStatus.INACTIVE
            user.active = False
        elif request.action == "change_role" and request.value:
            user.role = request.value

        user.updated_at = datetime.utcnow()
        processed += 1

    db.commit()

    # Log action
    log_user_action(
        db,
        str(current_user.id),
        "USER_BULK_ACTION",
        ",".join(request.user_ids),
        {"action": request.action, "count": processed}
    )

    return {
        "message": f"Bulk action '{request.action}' completed",
        "processed": processed,
        "total": len(request.user_ids)
    }

