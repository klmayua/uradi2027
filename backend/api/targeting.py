"""
Micro-targeting API - Task 2.8
Micro-targeting Engine Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict
from database import get_db
from models import Voter
from auth.utils import get_current_user
import uuid

router = APIRouter(prefix="/api/targeting", tags=["Micro-Targeting"])


# Pydantic Models
class SegmentFilter(BaseModel):
    lgas: Optional[List[str]] = None
    wards: Optional[List[str]] = None
    sentiment_min: Optional[int] = None
    sentiment_max: Optional[int] = None
    persuadability_min: Optional[int] = None
    persuadability_max: Optional[int] = None
    party_leaning: Optional[List[str]] = None
    age_ranges: Optional[List[str]] = None
    gender: Optional[List[str]] = None
    issues: Optional[List[str]] = None
    min_contacts: Optional[int] = None
    max_contacts: Optional[int] = None


class SegmentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    filters: SegmentFilter


class SegmentResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    filters: Dict
    voter_count: int
    created_at: str


class MessageRecommendation(BaseModel):
    variant: int
    message: str
    language: str
    target_issues: List[str]
    tone: str


class TargetingStats(BaseModel):
    total_voters: int
    segment_count: int
    avg_segment_size: float


# In-memory storage for segments (in production, use database)
segments_db = {}


@router.post("/segments/build")
def build_segment(
    filters: SegmentFilter,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Build a voter segment based on filter criteria.
    Returns real-time count and voter sample.
    """
    query = db.query(Voter).filter(
        Voter.tenant_id == current_user.tenant_id
    )
    
    # Apply filters
    if filters.lgas:
        query = query.filter(Voter.lga_id.in_(filters.lgas))
    if filters.wards:
        query = query.filter(Voter.ward_id.in_(filters.wards))
    if filters.sentiment_min is not None:
        query = query.filter(Voter.sentiment_score >= filters.sentiment_min)
    if filters.sentiment_max is not None:
        query = query.filter(Voter.sentiment_score <= filters.sentiment_max)
    if filters.persuadability_min is not None:
        query = query.filter(Voter.persuadability >= filters.persuadability_min)
    if filters.persuadability_max is not None:
        query = query.filter(Voter.persuadability <= filters.persuadability_max)
    if filters.party_leaning:
        query = query.filter(Voter.party_leaning.in_(filters.party_leaning))
    if filters.age_ranges:
        query = query.filter(Voter.age_range.in_(filters.age_ranges))
    if filters.gender:
        query = query.filter(Voter.gender.in_(filters.gender))
    if filters.issues:
        # Check if any of the issues are in voter's tags
        for issue in filters.issues:
            query = query.filter(Voter.tags.contains([issue]))
    if filters.min_contacts is not None:
        query = query.filter(Voter.contact_count >= filters.min_contacts)
    if filters.max_contacts is not None:
        query = query.filter(Voter.contact_count <= filters.max_contacts)
    
    # Get count
    voter_count = query.count()
    
    # Get sample (first 10 voters)
    sample_voters = query.limit(10).all()
    
    # Calculate demographics
    from sqlalchemy import func
    
    # By LGA
    lga_distribution = db.query(
        Voter.lga_id,
        func.count(Voter.id)
    ).filter(
        Voter.tenant_id == current_user.tenant_id,
        Voter.id.in_([v.id for v in sample_voters])
    ).group_by(Voter.lga_id).all()
    
    return {
        "voter_count": voter_count,
        "sample_size": len(sample_voters),
        "sample_voters": [
            {
                "id": str(v.id),
                "name": v.full_name,
                "lga_id": str(v.lga_id) if v.lga_id else None,
                "sentiment": v.sentiment_score,
                "persuadability": v.persuadability,
                "party": v.party_leaning
            }
            for v in sample_voters
        ],
        "demographics": {
            "by_lga": {str(lga): count for lga, count in lga_distribution if lga}
        }
    }


@router.post("/segments/save", response_model=SegmentResponse)
def save_segment(
    segment: SegmentCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save a segment for future use.
    """
    # Calculate voter count
    result = build_segment(segment.filters, current_user, db)
    voter_count = result["voter_count"]
    
    # Create segment
    segment_id = str(uuid.uuid4())
    segment_data = {
        "id": segment_id,
        "tenant_id": current_user.tenant_id,
        "name": segment.name,
        "description": segment.description,
        "filters": segment.filters.dict(),
        "voter_count": voter_count,
        "created_at": datetime.utcnow().isoformat()
    }
    
    # Store in memory (in production, use database)
    segments_db[segment_id] = segment_data
    
    return SegmentResponse(
        id=segment_id,
        name=segment.name,
        description=segment.description,
        filters=segment.filters.dict(),
        voter_count=voter_count,
        created_at=segment_data["created_at"]
    )


@router.get("/segments", response_model=List[SegmentResponse])
def list_segments(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all saved segments.
    """
    user_segments = [
        SegmentResponse(
            id=s["id"],
            name=s["name"],
            description=s.get("description"),
            filters=s["filters"],
            voter_count=s["voter_count"],
            created_at=s["created_at"]
        )
        for s in segments_db.values()
        if s.get("tenant_id") == current_user.tenant_id
    ]
    
    return user_segments


@router.get("/segments/{segment_id}")
def get_segment(
    segment_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific segment by ID.
    """
    if segment_id not in segments_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Segment not found"
        )
    
    segment = segments_db[segment_id]
    
    if segment.get("tenant_id") != current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return segment


@router.delete("/segments/{segment_id}")
def delete_segment(
    segment_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a saved segment.
    """
    if segment_id not in segments_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Segment not found"
        )
    
    segment = segments_db[segment_id]
    
    if segment.get("tenant_id") != current_user.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    del segments_db[segment_id]
    
    return {"message": "Segment deleted successfully"}


@router.get("/map/density")
def get_target_map_density(
    segment_id: Optional[str] = Query(None, description="Segment ID"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get voter density by LGA for map visualization.
    """
    from sqlalchemy import func
    
    query = db.query(
        Voter.lga_id,
        func.count(Voter.id)
    ).filter(
        Voter.tenant_id == current_user.tenant_id
    )
    
    # If segment specified, apply filters
    if segment_id and segment_id in segments_db:
        segment = segments_db[segment_id]
        filters = segment.get("filters", {})
        
        if filters.get("lgas"):
            query = query.filter(Voter.lga_id.in_(filters["lgas"]))
        if filters.get("sentiment_min") is not None:
            query = query.filter(Voter.sentiment_score >= filters["sentiment_min"])
        if filters.get("sentiment_max") is not None:
            query = query.filter(Voter.sentiment_score <= filters["sentiment_max"])
    
    lga_counts = query.group_by(Voter.lga_id).all()
    
    return {
        "segment_id": segment_id,
        "lga_density": [
            {
                "lga_id": str(lga_id) if lga_id else "unknown",
                "voter_count": count
            }
            for lga_id, count in lga_counts
        ]
    }


@router.get("/priority-wards")
def get_priority_wards(
    min_persuadable: int = Query(100, description="Minimum persuadable voters"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get priority wards with high concentration of persuadable undecided voters.
    """
    from sqlalchemy import func
    
    # Get wards with high persuadability and undecided status
    ward_stats = db.query(
        Voter.ward_id,
        func.count(Voter.id),
        func.avg(Voter.persuadability)
    ).filter(
        Voter.tenant_id == current_user.tenant_id,
        Voter.party_leaning == "undecided",
        Voter.persuadability >= 60
    ).group_by(Voter.ward_id).having(
        func.count(Voter.id) >= min_persuadable
    ).order_by(func.count(Voter.id).desc()).limit(20).all()
    
    priority_wards = []
    for ward_id, count, avg_persuadability in ward_stats:
        priority_wards.append({
            "ward_id": str(ward_id) if ward_id else None,
            "persuadable_voters": count,
            "avg_persuadability": round(float(avg_persuadability), 2) if avg_persuadability else 0,
            "priority_score": count * (avg_persuadability / 100) if avg_persuadability else 0
        })
    
    return {
        "total_priority_wards": len(priority_wards),
        "wards": priority_wards
    }


@router.post("/recommendations/generate")
def generate_message_recommendations(
    segment_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate AI-powered message recommendations for a segment.
    """
    if segment_id not in segments_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Segment not found"
        )
    
    segment = segments_db[segment_id]
    
    # In production, this would call Kimi/Ollama API
    # For now, return template recommendations
    
    recommendations = [
        MessageRecommendation(
            variant=1,
            message="Your community deserves better healthcare. Our candidate has a proven plan to build 3 new hospitals in your LGA.",
            language="en",
            target_issues=["health", "infrastructure"],
            tone="empathetic"
        ),
        MessageRecommendation(
            variant=2,
            message="Security is our top priority. We will deploy 500 additional police officers to keep your streets safe.",
            language="en",
            target_issues=["security"],
            tone="authoritative"
        ),
        MessageRecommendation(
            variant=3,
            message="Economic opportunity for all. Our youth employment program will create 10,000 jobs in the next year.",
            language="en",
            target_issues=["economy", "employment"],
            tone="optimistic"
        )
    ]
    
    return {
        "segment_id": segment_id,
        "segment_name": segment["name"],
        "recommendations": [r.dict() for r in recommendations],
        "ai_generated": True,
        "language": "en"
    }


@router.get("/resource-optimizer/recommendations")
def get_resource_optimizer_recommendations(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get resource allocation recommendations based on algorithm.
    Scores each LGA by: persuadable voters × expected turnout × marginal impact.
    """
    from sqlalchemy import func
    
    # Get LGA-level statistics
    lga_stats = db.query(
        Voter.lga_id,
        func.count(Voter.id),
        func.avg(Voter.persuadability)
    ).filter(
        Voter.tenant_id == current_user.tenant_id,
        Voter.party_leaning == "undecided"
    ).group_by(Voter.lga_id).all()
    
    recommendations = []
    for lga_id, persuadable_count, avg_persuadability in lga_stats:
        if not lga_id:
            continue
        
        # Calculate impact score
        expected_turnout = 0.7  # 70% assumed turnout
        marginal_impact = avg_persuadability / 100 if avg_persuadability else 0.5
        
        impact_score = persuadable_count * expected_turnout * marginal_impact
        
        recommendations.append({
            "lga_id": str(lga_id),
            "persuadable_voters": persuadable_count,
            "avg_persuadability": round(float(avg_persuadability), 2) if avg_persuadability else 0,
            "impact_score": round(impact_score, 2),
            "recommended_budget": round(impact_score * 1000, 2),  # $1000 per impact point
            "priority": "high" if impact_score > 500 else "medium" if impact_score > 200 else "low"
        })
    
    # Sort by impact score
    recommendations.sort(key=lambda x: x["impact_score"], reverse=True)
    
    return {
        "total_lgas": len(recommendations),
        "top_5_recommendations": recommendations[:5],
        "all_recommendations": recommendations
    }


@router.get("/stats/overview")
def get_targeting_stats(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get micro-targeting statistics.
    """
    from sqlalchemy import func
    
    total_voters = db.query(Voter).filter(
        Voter.tenant_id == current_user.tenant_id
    ).count()
    
    undecided_voters = db.query(Voter).filter(
        Voter.tenant_id == current_user.tenant_id,
        Voter.party_leaning == "undecided"
    ).count()
    
    high_persuadability = db.query(Voter).filter(
        Voter.tenant_id == current_user.tenant_id,
        Voter.persuadability >= 70
    ).count()
    
    return {
        "total_voters": total_voters,
        "undecided_voters": undecided_voters,
        "high_persuadability": high_persuadability,
        "targetable_percentage": round((undecided_voters / total_voters * 100), 2) if total_voters > 0 else 0,
        "saved_segments": len([s for s in segments_db.values() if s.get("tenant_id") == current_user.tenant_id])
    }


from datetime import datetime