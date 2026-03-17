"""
Canvassing API - Task 3.3
CRM-guided door-to-door canvassing endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from models import Voter, Ward, LGA
from auth.utils import get_current_user
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/field/canvass", tags=["Canvassing"])


# Pydantic Models
class CanvassSessionStart(BaseModel):
    ward_id: str
    agent_location_lat: Optional[float] = None
    agent_location_lng: Optional[float] = None


class CanvassContactRequest(BaseModel):
    voter_id: str
    contacted: bool
    sentiment: Optional[str] = None  # positive, neutral, negative
    status: Optional[str] = None  # contacted, not_home, refused, moved
    notes: Optional[str] = None
    talking_points_used: Optional[List[str]] = None


class CanvassSessionEnd(BaseModel):
    session_id: str
    total_contacted: int
    summary: Optional[str] = None


class VoterCanvassCard(BaseModel):
    id: str
    full_name: str
    phone: Optional[str]
    address: Optional[str]
    last_sentiment: Optional[int]
    party_leaning: Optional[str]
    persuadability: Optional[int]
    top_issues: List[str]
    talking_points: List[str]
    distance_meters: Optional[float]


class CanvassSessionResponse(BaseModel):
    session_id: str
    ward_id: str
    ward_name: str
    started_at: str
    status: str  # active, completed


# In-memory storage for canvass sessions
sessions_db = {}


@router.post("/session/start", response_model=CanvassSessionResponse)
def start_canvass_session(
    session: CanvassSessionStart,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Start a new canvassing session in a ward.
    """
    # Get ward details
    ward = db.query(Ward).filter(
        Ward.id == session.ward_id,
        Ward.tenant_id == current_user.tenant_id
    ).first()
    
    if not ward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ward not found"
        )
    
    # Create session
    session_id = str(uuid.uuid4())
    session_data = {
        "id": session_id,
        "agent_id": str(current_user.id),
        "tenant_id": current_user.tenant_id,
        "ward_id": session.ward_id,
        "ward_name": ward.name,
        "started_at": datetime.utcnow().isoformat(),
        "status": "active",
        "voters_contacted": [],
        "agent_location": {
            "lat": session.agent_location_lat,
            "lng": session.agent_location_lng
        }
    }
    
    sessions_db[session_id] = session_data
    
    return CanvassSessionResponse(
        session_id=session_id,
        ward_id=session.ward_id,
        ward_name=ward.name,
        started_at=session_data["started_at"],
        status="active"
    )


@router.get("/voters/{ward_id}")
def get_canvass_voter_list(
    ward_id: str,
    sort_by: str = Query("persuadability", description="Sort by: persuadability, distance, last_contact"),
    limit: int = Query(50, ge=1, le=100),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of voters in ward for canvassing.
    Sorted by persuadability (most persuadable first) by default.
    """
    query = db.query(Voter).filter(
        Voter.tenant_id == current_user.tenant_id,
        Voter.ward_id == ward_id
    )
    
    # Sort by persuadability (highest first)
    if sort_by == "persuadability":
        query = query.order_by(Voter.persuadability.desc())
    elif sort_by == "distance":
        # In production: Calculate actual distance from agent location
        query = query.order_by(Voter.created_at.desc())
    elif sort_by == "last_contact":
        query = query.order_by(Voter.last_contacted.asc())
    
    voters = query.limit(limit).all()
    
    voter_cards = []
    for voter in voters:
        # Generate talking points based on voter's top issues
        talking_points = generate_talking_points(voter)
        
        voter_cards.append({
            "id": str(voter.id),
            "full_name": voter.full_name,
            "phone": voter.phone,
            "address": None,  # Would come from voter record
            "last_sentiment": voter.sentiment_score,
            "party_leaning": voter.party_leaning,
            "persuadability": voter.persuadability,
            "top_issues": voter.tags if voter.tags else [],
            "talking_points": talking_points,
            "distance_meters": 0  # Placeholder
        })
    
    return {
        "ward_id": ward_id,
        "total_voters": len(voter_cards),
        "voters": voter_cards
    }


@router.post("/contact")
def record_canvass_contact(
    contact: CanvassContactRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Record contact with a voter during canvassing.
    """
    voter = db.query(Voter).filter(
        Voter.id == contact.voter_id,
        Voter.tenant_id == current_user.tenant_id
    ).first()
    
    if not voter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voter not found"
        )
    
    # Update voter record
    voter.contact_count = (voter.contact_count or 0) + 1
    voter.last_contacted = datetime.utcnow()
    
    if contact.notes:
        if voter.notes:
            voter.notes += f"\n[{datetime.utcnow().strftime('%Y-%m-%d')}] {contact.notes}"
        else:
            voter.notes = f"[{datetime.utcnow().strftime('%Y-%m-%d')}] {contact.notes}"
    
    # Update sentiment if provided
    if contact.sentiment == "positive":
        voter.sentiment_score = min((voter.sentiment_score or 0) + 10, 100)
    elif contact.sentiment == "negative":
        voter.sentiment_score = max((voter.sentiment_score or 0) - 10, -100)
    
    db.commit()
    
    return {
        "status": "success",
        "voter_id": contact.voter_id,
        "contact_recorded": True,
        "new_contact_count": voter.contact_count,
        "message": f"Contact recorded: {contact.status}"
    }


@router.post("/session/{session_id}/end")
def end_canvass_session(
    session_id: str,
    summary: Optional[str] = None,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    End a canvassing session and get summary.
    """
    if session_id not in sessions_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    session = sessions_db[session_id]
    
    if session["agent_id"] != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Update session
    session["status"] = "completed"
    session["ended_at"] = datetime.utcnow().isoformat()
    session["summary"] = summary
    
    # Calculate stats
    total_contacted = len(session.get("voters_contacted", []))
    
    return {
        "session_id": session_id,
        "status": "completed",
        "started_at": session["started_at"],
        "ended_at": session["ended_at"],
        "total_contacted": total_contacted,
        "ward_name": session["ward_name"],
        "summary": summary
    }


@router.get("/session/{session_id}/summary")
def get_session_summary(
    session_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get real-time summary of current canvassing session.
    """
    if session_id not in sessions_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    session = sessions_db[session_id]
    
    # Mock contact results for summary
    # In production: Query actual contact records
    summary = {
        "positive": 15,
        "neutral": 5,
        "negative": 3,
        "not_home": 10,
        "refused": 2,
        "moved": 1
    }
    
    total = sum(summary.values())
    
    return {
        "session_id": session_id,
        "ward_name": session["ward_name"],
        "duration_minutes": 120,  # Placeholder
        "total_contacted": total,
        "breakdown": summary,
        "success_rate": f"{((summary['positive'] + summary['neutral']) / total * 100):.1f}%"
    }


@router.get("/map/{ward_id}")
def get_canvass_map_data(
    ward_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get map data for route optimization in a ward.
    Returns voter locations for mapping.
    """
    voters = db.query(Voter).filter(
        Voter.tenant_id == current_user.tenant_id,
        Voter.ward_id == ward_id
    ).all()
    
    # Mock location data
    # In production: Voters would have lat/lng coordinates
    map_points = []
    for i, voter in enumerate(voters[:20]):  # Limit to 20 for performance
        map_points.append({
            "voter_id": str(voter.id),
            "name": voter.full_name,
            "lat": 12.0 + (i * 0.001),  # Mock coordinates
            "lng": 9.0 + (i * 0.001),
            "persuadability": voter.persuadability,
            "last_sentiment": voter.sentiment_score,
            "contacted": voter.contact_count > 0 if voter.contact_count else False
        })
    
    return {
        "ward_id": ward_id,
        "total_voters": len(voters),
        "map_points": map_points,
        "suggested_route": map_points  # In production: optimize route
    }


def generate_talking_points(voter: Voter) -> List[str]:
    """
    Generate personalized talking points based on voter's profile.
    """
    points = []
    
    # Based on top issues
    if voter.tags:
        for issue in voter.tags[:2]:  # Top 2 issues
            if issue == "security":
                points.append("Our candidate has a comprehensive security plan to protect your community.")
            elif issue == "economy":
                points.append("We have a plan to create jobs and boost the local economy.")
            elif issue == "education":
                points.append("We will invest in schools and provide scholarships for your children.")
            elif issue == "healthcare":
                points.append("We will build new clinics and ensure affordable healthcare for all.")
            elif issue == "infrastructure":
                points.append("We will repair roads and improve electricity in your area.")
    
    # Based on party leaning
    if voter.party_leaning == "undecided":
        points.append("Your vote is crucial. Let me tell you why our candidate is the best choice.")
    elif voter.party_leaning == "unknown":
        points.append("I'd like to understand your concerns and share our vision for the community.")
    
    # Default points
    if not points:
        points = [
            "Our candidate has a proven track record of service.",
            "We are committed to bringing development to your ward."
        ]
    
    return points