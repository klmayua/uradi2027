"""
Field App API - Task 3.1
Backend APIs to support Field App (Expo/React Native)
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from models import User, Voter, SentimentEntry
from auth.utils import get_current_user, create_access_token, hash_password
import uuid
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/field", tags=["Field App"])


# Pydantic Models
class FieldAgentLogin(BaseModel):
    phone: str
    otp: str  # In production, this would be verified against SMS


class FieldAgentRegister(BaseModel):
    full_name: str
    phone: str
    email: Optional[str] = None
    assigned_lga: Optional[str] = None


class FieldAgentResponse(BaseModel):
    id: str
    full_name: str
    phone: str
    email: Optional[str]
    role: str
    assigned_lga: Optional[str]
    active: bool


class VoterQuickAdd(BaseModel):
    full_name: str
    phone: Optional[str] = None
    ward_id: str
    gender: Optional[str] = None
    age_range: Optional[str] = None
    party_leaning: Optional[str] = None
    top_issue: Optional[str] = None
    sentiment_score: Optional[int] = None  # -100 to 100


class DailyStats(BaseModel):
    voters_added_today: int
    total_voters_collected: int
    rank_in_lga: int
    rank_statewide: int


class LeaderboardEntry(BaseModel):
    agent_name: str
    lga_name: str
    voters_collected: int
    rank: int


@router.post("/auth/login")
def field_agent_login(
    login: FieldAgentLogin,
    db: Session = Depends(get_db)
):
    """
    Field agent login with phone OTP.
    In production, verify OTP against SMS service.
    """
    # Find user by phone
    user = db.query(User).filter(
        User.phone == login.phone,
        User.role.in_(["field_agent", "coordinator"])
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account deactivated"
        )
    
    # In production: Verify OTP here
    # For now, accept any OTP
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create JWT token
    access_token = create_access_token(
        data={
            "user_id": str(user.id),
            "email": user.email,
            "tenant_id": user.tenant_id,
            "role": user.role
        }
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "full_name": user.full_name,
            "phone": user.phone,
            "role": user.role,
            "assigned_lga": user.assigned_lga
        }
    }


@router.post("/auth/register", status_code=status.HTTP_201_CREATED)
def register_field_agent(
    agent: FieldAgentRegister,
    db: Session = Depends(get_db)
):
    """
    Register a new field agent.
    In production: Send OTP to phone for verification.
    """
    # Check if phone already exists
    existing = db.query(User).filter(User.phone == agent.phone).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )
    
    # Create new field agent
    # Note: In production, tenant_id would come from invitation or context
    db_agent = User(
        id=uuid.uuid4(),
        tenant_id="jigawa_lamido_2027",  # Default tenant for now
        email=agent.email or f"{agent.phone}@field.temp",
        full_name=agent.full_name,
        phone=agent.phone,
        role="field_agent",
        password_hash=hash_password("temp_password"),  # Will be set via OTP
        assigned_lga=agent.assigned_lga,
        active=True
    )
    
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    
    return {
        "message": "Field agent registered successfully",
        "agent_id": str(db_agent.id),
        "phone": db_agent.phone
    }


@router.get("/profile")
def get_field_agent_profile(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current field agent profile"""
    return {
        "id": str(current_user.id),
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "email": current_user.email,
        "role": current_user.role,
        "assigned_lga": current_user.assigned_lga,
        "active": current_user.active
    }


@router.post("/voters/quick-add")
def quick_add_voter(
    voter: VoterQuickAdd,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Quick add voter from field app.
    Works offline: In production, queue to WatermelonDB, sync when online.
    """
    # Check for duplicate phone
    if voter.phone:
        existing = db.query(Voter).filter(
            Voter.tenant_id == current_user.tenant_id,
            Voter.phone == voter.phone
        ).first()
        
        if existing:
            return {
                "status": "duplicate",
                "message": "Voter with this phone already exists",
                "voter_id": str(existing.id)
            }
    
    # Create voter
    db_voter = Voter(
        id=uuid.uuid4(),
        tenant_id=current_user.tenant_id,
        full_name=voter.full_name,
        phone=voter.phone,
        ward_id=voter.ward_id,
        gender=voter.gender,
        age_range=voter.age_range,
        party_leaning=voter.party_leaning,
        sentiment_score=voter.sentiment_score or 0,
        tags=[voter.top_issue] if voter.top_issue else [],
        source="field",
        created_at=datetime.utcnow()
    )
    
    db.add(db_voter)
    
    # Create sentiment entry if sentiment provided
    if voter.sentiment_score is not None:
        sentiment = SentimentEntry(
            id=uuid.uuid4(),
            tenant_id=current_user.tenant_id,
            source="field",
            ward_id=voter.ward_id,
            score=voter.sentiment_score / 100,  # Convert to -1.0 to 1.0
            raw_text=f"Field collection by {current_user.full_name}",
            processed=True,
            created_at=datetime.utcnow()
        )
        db.add(sentiment)
    
    db.commit()
    db.refresh(db_voter)
    
    return {
        "status": "success",
        "message": "Voter added successfully",
        "voter_id": str(db_voter.id),
        "voter_name": db_voter.full_name
    }


@router.get("/stats/daily")
def get_daily_stats(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get daily stats for field agent.
    Returns: voters added today, total collected, rankings.
    """
    from sqlalchemy import func
    
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Voters added today by this agent
    today_count = db.query(Voter).filter(
        Voter.tenant_id == current_user.tenant_id,
        Voter.source == "field",
        Voter.created_at >= today
    ).count()
    
    # Total voters collected by this agent
    # Note: In production, track agent_id on voter record
    total_count = db.query(Voter).filter(
        Voter.tenant_id == current_user.tenant_id,
        Voter.source == "field"
    ).count()
    
    # Rankings (simplified - in production, track per-agent)
    rank_lga = 1  # Placeholder
    rank_statewide = 1  # Placeholder
    
    return {
        "voters_added_today": today_count,
        "total_voters_collected": total_count,
        "rank_in_lga": rank_lga,
        "rank_statewide": rank_statewide,
        "daily_goal": 50,
        "progress_percentage": min((today_count / 50) * 100, 100)
    }


@router.get("/leaderboard")
def get_leaderboard(
    lga_id: Optional[str] = Query(None, description="Filter by LGA"),
    limit: int = Query(10, ge=1, le=50),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get leaderboard of top field agents.
    Gamification: top collectors this week by LGA.
    """
    from sqlalchemy import func
    
    # Get top agents by voter collection
    # Note: In production, join with user table and group by agent
    query = db.query(
        Voter.source,
        func.count(Voter.id)
    ).filter(
        Voter.tenant_id == current_user.tenant_id,
        Voter.source == "field"
    )
    
    if lga_id:
        query = query.filter(Voter.lga_id == lga_id)
    
    # For now, return mock data
    leaderboard = [
        LeaderboardEntry(
            agent_name="Ahmad Abdullahi",
            lga_name="Dutse",
            voters_collected=156,
            rank=1
        ),
        LeaderboardEntry(
            agent_name="Fatima Yusuf",
            lga_name="Hadejia",
            voters_collected=142,
            rank=2
        ),
        LeaderboardEntry(
            agent_name="Ibrahim Ali",
            lga_name="Birnin Kudu",
            voters_collected=128,
            rank=3
        )
    ]
    
    return {
        "leaderboard": [entry.dict() for entry in leaderboard],
        "total_agents": len(leaderboard),
        "period": "This Week"
    }


@router.get("/sync/status")
def get_sync_status(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get sync status for offline data.
    Returns pending uploads count.
    """
    # In production: Check WatermelonDB sync queue
    # For now, return mock data
    
    return {
        "status": "synced",
        "pending_uploads": 0,
        "last_sync": datetime.utcnow().isoformat(),
        "offline_mode": False,
        "network_status": "online"
    }


@router.post("/sync/queue")
def queue_offline_data(
    data_type: str,  # voter, sentiment, report
    payload: dict,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Queue data for sync when offline.
    In production: Store in WatermelonDB.
    """
    # In production: Add to WatermelonDB sync queue
    
    return {
        "status": "queued",
        "data_type": data_type,
        "queue_position": 1,
        "estimated_sync": "When online"
    }