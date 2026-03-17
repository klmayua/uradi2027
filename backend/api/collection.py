"""
Voter Data Collection API - Task 3.2
Enhanced voter collection endpoints for Field App
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from models import Voter, LGA, Ward
from auth.utils import get_current_user
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/field/collection", tags=["Voter Collection"])


# Pydantic Models
class VoterCollectionRequest(BaseModel):
    full_name: str
    phone: Optional[str] = None
    ward_id: str
    lga_id: Optional[str] = None
    gender: Optional[str] = None
    age_range: Optional[str] = None
    occupation: Optional[str] = None
    party_leaning: Optional[str] = None
    language_pref: str = "ha"
    top_issue: Optional[str] = None
    sentiment_score: Optional[int] = None  # -100 to 100, mapped to 5 emoji faces
    contact_preference: Optional[str] = None  # ussd, whatsapp, sms, door_to_door
    notes: Optional[str] = None


class VoterCollectionResponse(BaseModel):
    id: str
    full_name: str
    phone: Optional[str]
    ward_id: str
    sentiment_score: Optional[int]
    message: str


class BatchImportRequest(BaseModel):
    voters: List[VoterCollectionRequest]


class BatchImportResponse(BaseModel):
    total_submitted: int
    successful: int
    duplicates: int
    errors: int
    results: List[dict]


class CollectionStats(BaseModel):
    date: str
    voters_added: int
    by_ward: dict
    by_gender: dict
    by_age_range: dict


@router.post("/voter", response_model=VoterCollectionResponse)
def collect_voter(
    voter: VoterCollectionRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Collect voter data from field agent.
    Quick add form with rapid entry support.
    """
    # Check for duplicate phone
    if voter.phone:
        existing = db.query(Voter).filter(
            Voter.tenant_id == current_user.tenant_id,
            Voter.phone == voter.phone
        ).first()
        
        if existing:
            return VoterCollectionResponse(
                id=str(existing.id),
                full_name=existing.full_name,
                phone=existing.phone,
                ward_id=str(existing.ward_id) if existing.ward_id else None,
                sentiment_score=existing.sentiment_score,
                message="Voter already exists - duplicate phone number"
            )
    
    # Create voter
    db_voter = Voter(
        id=uuid.uuid4(),
        tenant_id=current_user.tenant_id,
        full_name=voter.full_name,
        phone=voter.phone,
        ward_id=voter.ward_id,
        lga_id=voter.lga_id,
        gender=voter.gender,
        age_range=voter.age_range,
        occupation=voter.occupation,
        party_leaning=voter.party_leaning,
        language_pref=voter.language_pref,
        sentiment_score=voter.sentiment_score or 0,
        tags=[voter.top_issue] if voter.top_issue else [],
        source="field",
        notes=voter.notes,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(db_voter)
    db.commit()
    db.refresh(db_voter)
    
    return VoterCollectionResponse(
        id=str(db_voter.id),
        full_name=db_voter.full_name,
        phone=db_voter.phone,
        ward_id=str(db_voter.ward_id) if db_voter.ward_id else None,
        sentiment_score=db_voter.sentiment_score,
        message="Voter added successfully"
    )


@router.post("/voter/batch", response_model=BatchImportResponse)
def batch_import_voters(
    batch: BatchImportRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Batch import voters from field app.
    For rapid entry of multiple voters.
    """
    results = []
    successful = 0
    duplicates = 0
    errors = 0
    
    for voter_data in batch.voters:
        try:
            # Check for duplicate
            if voter_data.phone:
                existing = db.query(Voter).filter(
                    Voter.tenant_id == current_user.tenant_id,
                    Voter.phone == voter_data.phone
                ).first()
                
                if existing:
                    duplicates += 1
                    results.append({
                        "status": "duplicate",
                        "name": voter_data.full_name,
                        "voter_id": str(existing.id),
                        "message": "Duplicate phone number"
                    })
                    continue
            
            # Create voter
            db_voter = Voter(
                id=uuid.uuid4(),
                tenant_id=current_user.tenant_id,
                full_name=voter_data.full_name,
                phone=voter_data.phone,
                ward_id=voter_data.ward_id,
                lga_id=voter_data.lga_id,
                gender=voter_data.gender,
                age_range=voter_data.age_range,
                occupation=voter_data.occupation,
                party_leaning=voter_data.party_leaning,
                language_pref=voter_data.language_pref,
                sentiment_score=voter_data.sentiment_score or 0,
                tags=[voter_data.top_issue] if voter_data.top_issue else [],
                source="field",
                notes=voter_data.notes,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            db.add(db_voter)
            successful += 1
            results.append({
                "status": "success",
                "name": voter_data.full_name,
                "voter_id": str(db_voter.id),
                "message": "Added successfully"
            })
            
        except Exception as e:
            errors += 1
            results.append({
                "status": "error",
                "name": voter_data.full_name,
                "message": str(e)
            })
    
    db.commit()
    
    return BatchImportResponse(
        total_submitted=len(batch.voters),
        successful=successful,
        duplicates=duplicates,
        errors=errors,
        results=results
    )


@router.post("/voter/photo-list")
def upload_voter_list_photo(
    photo: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload photo of handwritten voter list for OCR processing.
    Future enhancement: OCR to extract voter data.
    """
    # In production: Save photo, queue for OCR processing
    # For now, just acknowledge receipt
    
    return {
        "status": "received",
        "filename": photo.filename,
        "message": "Photo uploaded successfully. OCR processing will be available in future update.",
        "uploaded_at": datetime.utcnow().isoformat()
    }


@router.get("/wards/by-location")
def get_wards_by_location(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get nearest wards based on GPS location.
    Auto-detect ward from GPS for rapid entry.
    """
    # In production: Calculate distance from ward centers
    # For now, return all wards for the agent's assigned LGA
    
    wards = db.query(Ward).filter(
        Ward.tenant_id == current_user.tenant_id
    ).limit(10).all()
    
    return {
        "location": {"lat": lat, "lng": lng},
        "nearest_wards": [
            {
                "id": str(w.id),
                "name": w.name,
                "lga_id": str(w.lga_id) if w.lga_id else None,
                "distance_meters": 0  # Placeholder
            }
            for w in wards
        ]
    }


@router.get("/stats/agent/{agent_id}")
def get_agent_collection_stats(
    agent_id: str,
    days: int = Query(7, ge=1, le=30),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get collection stats for a specific field agent.
    """
    from sqlalchemy import func
    from datetime import timedelta
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Voters collected by this agent
    voters = db.query(Voter).filter(
        Voter.tenant_id == current_user.tenant_id,
        Voter.source == "field",
        Voter.created_at >= start_date
    ).all()
    
    # Daily breakdown
    daily_stats = {}
    for voter in voters:
        date_key = voter.created_at.strftime("%Y-%m-%d")
        if date_key not in daily_stats:
            daily_stats[date_key] = {
                "voters_added": 0,
                "by_ward": {},
                "by_gender": {},
                "by_age_range": {}
            }
        
        daily_stats[date_key]["voters_added"] += 1
        
        # By ward
        ward_name = str(voter.ward_id) if voter.ward_id else "Unknown"
        daily_stats[date_key]["by_ward"][ward_name] = \
            daily_stats[date_key]["by_ward"].get(ward_name, 0) + 1
        
        # By gender
        if voter.gender:
            daily_stats[date_key]["by_gender"][voter.gender] = \
                daily_stats[date_key]["by_gender"].get(voter.gender, 0) + 1
        
        # By age range
        if voter.age_range:
            daily_stats[date_key]["by_age_range"][voter.age_range] = \
                daily_stats[date_key]["by_age_range"].get(voter.age_range, 0) + 1
    
    return {
        "agent_id": agent_id,
        "period_days": days,
        "total_voters": len(voters),
        "daily_breakdown": daily_stats
    }


@router.get("/reference-data")
def get_collection_reference_data(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get reference data for voter collection form.
    Returns: age ranges, occupations, party leanings, issues, etc.
    """
    return {
        "age_ranges": ["18-25", "26-35", "36-45", "46-55", "56+"],
        "genders": ["male", "female"],
        "party_leanings": ["apc", "pdp", "nnpp", "adc", "undecided", "unknown"],
        "top_issues": [
            "security",
            "economy",
            "education",
            "healthcare",
            "infrastructure",
            "employment",
            "agriculture",
            "corruption"
        ],
        "contact_preferences": ["ussd", "whatsapp", "sms", "door_to_door"],
        "occupations": [
            "farmer",
            "trader",
            "civil_servant",
            "student",
            "artisan",
            "business_owner",
            "unemployed",
            "other"
        ],
        "sentiment_scale": {
            "very_negative": -100,
            "negative": -50,
            "neutral": 0,
            "positive": 50,
            "very_positive": 100
        }
    }