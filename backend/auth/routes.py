from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta
from database import get_db
from models import User
from .utils import hash_password, verify_password, create_access_token, get_current_user
from utils.rate_limiting import auth_limit
from utils.logging_config import audit_logger, get_logger
import os

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    tenant_id: str

@router.post("/login", response_model=LoginResponse)
@auth_limit()
def login(request: Request, credentials: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token"""
    # Find user by email
    user = db.query(User).filter(User.email == credentials.email).first()

    # Verify user exists and password is correct
    if not user or not verify_password(credentials.password, user.password_hash):
        # Log failed login attempt
        audit_logger.log_auth_event(
            event_type="failed_login",
            user_id=credentials.email,  # Log attempted email
            success=False,
            ip_address=request.client.host if request.client else None,
            details={"reason": "invalid_credentials"}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(hours=int(os.getenv("JWT_EXPIRY_HOURS", 24)))
    access_token = create_access_token(
        data={
            "user_id": str(user.id),
            "email": user.email,
            "tenant_id": user.tenant_id
        },
        expires_delta=access_token_expires
    )

    # Update last login time
    user.last_login = datetime.utcnow()
    db.commit()

    # Log successful login
    audit_logger.log_auth_event(
        event_type="login",
        user_id=str(user.id),
        success=True,
        ip_address=request.client.host if request.client else None,
        details={"tenant_id": user.tenant_id, "role": user.role}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "tenant_id": user.tenant_id
        }
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "tenant_id": current_user.tenant_id
    }

class UserUpdate(BaseModel):
    full_name: str = None
    phone: str = None

@router.patch("/me", response_model=UserResponse)
def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    if user_update.full_name:
        current_user.full_name = user_update.full_name
    if user_update.phone:
        current_user.phone = user_update.phone
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "tenant_id": current_user.tenant_id
    }