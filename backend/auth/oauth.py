"""
Google OAuth Authentication
Supports OAuth 2.0 for web and mobile applications
"""

import os
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from datetime import datetime, timedelta

from database import get_db
from models import User
from auth.utils import create_access_token
from utils.logging_config import get_logger

router = APIRouter(prefix="/auth/oauth", tags=["OAuth"])
logger = get_logger("uradi360.oauth")

# OAuth Configuration
oauth = OAuth()

# Configure Google OAuth
google = oauth.register(
    name='google',
    client_id=os.getenv('GOOGLE_CLIENT_ID'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    access_token_url='https://accounts.google.com/o/oauth2/token',
    access_token_params=None,
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    authorize_params=None,
    api_base_url='https://www.googleapis.com/oauth2/v1/',
    userinfo_endpoint='https://openidconnect.googleapis.com/v1/userinfo',
    jwks_uri='https://www.googleapis.com/oauth2/v3/certs',
    client_kwargs={'scope': 'openid email profile'},
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration'
)


@router.get("/google")
async def google_login(request: Request):
    """Initiate Google OAuth login flow"""
    if not os.getenv('GOOGLE_CLIENT_ID'):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth not configured"
        )

    redirect_uri = os.getenv('GOOGLE_REDIRECT_URI', 'https://api.uradi360.com/auth/oauth/google/callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    """Handle Google OAuth callback"""
    try:
        # Get access token
        token = await oauth.google.authorize_access_token(request)

        # Get user info
        user_info = await oauth.google.parse_id_token(request, token)

        if not user_info:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to get user info from Google"
            )

        email = user_info.get('email')
        name = user_info.get('name', '')
        picture = user_info.get('picture', '')
        google_id = user_info.get('sub')

        # Check if user exists
        user = db.query(User).filter(User.email == email).first()

        if not user:
            # Create new user
            logger.info(f"Creating new user from Google OAuth: {email}")

            # For new OAuth users, we need to handle tenant assignment
            # Option 1: Auto-create in default tenant (for citizen portal)
            # Option 2: Require invite code for staff (admin, field agents)

            from models import Tenant

            # Find default tenant or create logic
            default_tenant = db.query(Tenant).filter(Tenant.status == "active").first()

            if not default_tenant:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No active tenant available for registration"
                )

            import uuid
            from auth.utils import hash_password
            import secrets

            user = User(
                id=uuid.uuid4(),
                tenant_id=default_tenant.id,
                email=email,
                full_name=name,
                phone="",  # Can be updated later
                role="field_agent",  # Default role for OAuth signups
                password_hash=hash_password(secrets.token_urlsafe(32)),  # Random password
                assigned_lga=None,
                active=True,
                oauth_provider="google",
                oauth_id=google_id,
                profile_picture=picture
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Update OAuth info if not set
            if not user.oauth_provider:
                user.oauth_provider = "google"
                user.oauth_id = google_id
                db.commit()

            # Check if user is active
            if not user.active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Account is deactivated"
                )

        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()

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

        # Redirect to frontend with token
        frontend_url = os.getenv('FRONTEND_URL', 'https://app.uradi360.com')
        redirect_url = f"{frontend_url}/auth/callback?token={access_token}&provider=google"

        return RedirectResponse(url=redirect_url)

    except Exception as e:
        logger.error(f"Google OAuth error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"OAuth authentication failed: {str(e)}"
        )


@router.post("/google/mobile")
async def google_mobile_auth(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Mobile Google OAuth - Receives ID token from mobile app
    Mobile apps get tokens directly from Google SDK
    """
    try:
        body = await request.json()
        id_token = body.get('id_token')

        if not id_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ID token required"
            )

        # Verify token with Google
        import requests

        google_token_info_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
        response = requests.get(google_token_info_url)

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google ID token"
            )

        token_info = response.json()

        # Verify audience
        if token_info.get('aud') != os.getenv('GOOGLE_CLIENT_ID'):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token audience"
            )

        email = token_info.get('email')
        name = token_info.get('name', '')
        picture = token_info.get('picture', '')
        google_id = token_info.get('sub')

        # Same user lookup/creation logic as web flow
        user = db.query(User).filter(User.email == email).first()

        if not user:
            # Create new user for mobile
            from models import Tenant
            import uuid
            from auth.utils import hash_password
            import secrets

            default_tenant = db.query(Tenant).filter(Tenant.status == "active").first()

            if not default_tenant:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No active tenant available"
                )

            user = User(
                id=uuid.uuid4(),
                tenant_id=default_tenant.id,
                email=email,
                full_name=name,
                phone="",
                role="field_agent",  # Default for mobile OAuth
                password_hash=hash_password(secrets.token_urlsafe(32)),
                assigned_lga=None,
                active=True,
                oauth_provider="google",
                oauth_id=google_id,
                profile_picture=picture
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            if not user.active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Account is deactivated"
                )

        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()

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

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "tenant_id": user.tenant_id,
                "profile_picture": user.profile_picture
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Mobile OAuth error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mobile OAuth authentication failed"
        )


@router.get("/config")
def get_oauth_config():
    """Get OAuth configuration for frontend"""
    return {
        "google_enabled": bool(os.getenv('GOOGLE_CLIENT_ID')),
        "google_client_id": os.getenv('GOOGLE_CLIENT_ID', ''),  # Public info, safe to expose
    }
