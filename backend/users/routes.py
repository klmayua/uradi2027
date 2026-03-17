from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from models import User
from auth.utils import get_current_user, hash_password
from middleware import tenant_middleware
import uuid

router = APIRouter(prefix="/admin/users", tags=["Users"])

class UserCreate(BaseModel):
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    assigned_lga: Optional[str] = None
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    assigned_lga: Optional[str] = None
    active: Optional[bool] = None

class UserResponse(BaseModel):
    id: str
    tenant_id: str
    email: str
    full_name: str
    phone: Optional[str]
    role: str
    assigned_lga: Optional[str]
    active: bool
    last_login: Optional[str]
    created_at: str

def convert_user_to_response(user: User) -> UserResponse:
    return UserResponse(
        id=str(user.id),
        tenant_id=user.tenant_id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,
        assigned_lga=user.assigned_lga,
        active=user.active,
        last_login=user.last_login.isoformat() if user.last_login else None,
        created_at=user.created_at.isoformat() if user.created_at else None
    )

@router.get("/", response_model=List[UserResponse])
def list_users(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """List platform users"""
    # Filter by tenant_id to ensure isolation
    users = db.query(User).filter(User.tenant_id == current_user.tenant_id).all()
    return [convert_user_to_response(user) for user in users]

@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Invite user - admin only"""
    # In a real implementation, we would check if the user is an admin
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create new user
    db_user = User(
        id=uuid.uuid4(),
        tenant_id=current_user.tenant_id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,
        assigned_lga=user.assigned_lga,
        password_hash=hash_password(user.password),
        active=True
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return convert_user_to_response(db_user)

@router.patch("/{user_id}", response_model=UserResponse)
def update_user(user_id: str, user_update: UserUpdate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update user - admin only"""
    # In a real implementation, we would check if the user is an admin
    
    # Find user and ensure they belong to the same tenant
    user = db.query(User).filter(User.id == user_id, User.tenant_id == current_user.tenant_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields if provided
    if user_update.full_name is not None:
        user.full_name = user_update.full_name
    if user_update.phone is not None:
        user.phone = user_update.phone
    if user_update.role is not None:
        user.role = user_update.role
    if user_update.assigned_lga is not None:
        user.assigned_lga = user_update.assigned_lga
    if user_update.active is not None:
        user.active = user_update.active
    
    db.commit()
    db.refresh(user)
    return convert_user_to_response(user)