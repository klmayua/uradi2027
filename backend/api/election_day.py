"""
Election Day Monitor Mode API - Task 3.5
Monitor check-in, accreditation tracking, vote tally, and incident reporting
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from pydantic import BaseModel, Field
from typing import List, Optional
from database import get_db
from models import (
    PollingUnit, MonitorAssignment, AccreditationRecord, 
    VoteTally, ElectionDayIncident, User, LGA, Ward
)
from auth.utils import get_current_user
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/election-day", tags=["Election Day Monitor"])


# ==================== PYDANTIC MODELS ====================

class MonitorCheckInRequest(BaseModel):
    polling_unit_id: str
    latitude: float
    longitude: float
    notes: Optional[str] = None


class MonitorCheckInResponse(BaseModel):
    assignment_id: str
    polling_unit_name: str
    pu_code: str
    check_in_time: str
    distance_meters: float
    message: str


class AccreditationUpdateRequest(BaseModel):
    polling_unit_id: str
    time_slot: str  # 08:00, 10:00, 12:00, 14:00, 16:00
    accredited_count: int
    bvas_functional: bool = True
    queue_length: str  # short, medium, long
    issues: Optional[List[str]] = []


class AccreditationUpdateResponse(BaseModel):
    record_id: str
    polling_unit_id: str
    time_slot: str
    accredited_count: int
    total_accredited_so_far: int
    recorded_at: str


class VoteTallyRequest(BaseModel):
    polling_unit_id: str
    candidate_name: str
    party: str
    votes_received: int
    is_incumbent: bool = False


class VoteTallyResponse(BaseModel):
    tally_id: str
    polling_unit_id: str
    candidate_name: str
    party: str
    votes_received: int
    total_votes_in_pu: int
    recorded_at: str


class ElectionIncidentRequest(BaseModel):
    polling_unit_id: str
    incident_type: str  # violence, ballot_snatching, bribery, accreditation_issue, materials_shortage, other
    severity: str  # low, medium, high, critical
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ElectionIncidentResponse(BaseModel):
    incident_id: str
    polling_unit_id: str
    incident_type: str
    severity: str
    status: str
    reported_at: str


class PollingUnitSummary(BaseModel):
    id: str
    pu_code: str
    pu_name: str
    lga_name: str
    ward_name: str
    registered_voters: int
    accredited_voters: int
    votes_cast: int
    turnout_percentage: float
    status: str
    last_update: Optional[str] = None


class MonitorStatusResponse(BaseModel):
    monitor_id: str
    monitor_name: str
    assignment_status: str
    assigned_polling_unit: Optional[dict] = None
    check_in_time: Optional[str] = None
    last_activity: Optional[str] = None


class PVTResultsResponse(BaseModel):
    total_polling_units: int
    reporting_polling_units: int
    reporting_percentage: float
    total_registered_voters: int
    total_accredited: int
    total_votes_cast: int
    turnout_percentage: float
    candidate_results: List[dict]
    lga_breakdown: List[dict]


# ==================== HELPER FUNCTIONS ====================

def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance in meters between two coordinates using Haversine formula"""
    import math
    R = 6371000  # Earth's radius in meters
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c


# ==================== API ENDPOINTS ====================

@router.post("/monitor/check-in", response_model=MonitorCheckInResponse)
def monitor_check_in(
    request: MonitorCheckInRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Monitor check-in with GPS verification
    Verifies monitor is within 200m of assigned polling unit
    """
    # Get polling unit
    pu = db.query(PollingUnit).filter(
        PollingUnit.id == request.polling_unit_id,
        PollingUnit.tenant_id == current_user.tenant_id
    ).first()
    
    if not pu:
        raise HTTPException(status_code=404, detail="Polling unit not found")
    
    # Check if monitor has assignment
    assignment = db.query(MonitorAssignment).filter(
        MonitorAssignment.user_id == current_user.id,
        MonitorAssignment.polling_unit_id == request.polling_unit_id,
        MonitorAssignment.tenant_id == current_user.tenant_id
    ).first()
    
    if not assignment:
        # Create new assignment
        assignment = MonitorAssignment(
            id=uuid.uuid4(),
            tenant_id=current_user.tenant_id,
            user_id=current_user.id,
            polling_unit_id=request.polling_unit_id,
            status="assigned"
        )
        db.add(assignment)
    
    # Calculate distance from polling unit
    if pu.latitude and pu.longitude:
        distance = calculate_distance(
            request.latitude, request.longitude,
            pu.latitude, pu.longitude
        )
    else:
        distance = 0  # If no coordinates, assume valid
    
    # Verify within 200m radius
    if distance > 200:
        raise HTTPException(
            status_code=400, 
            detail=f"Too far from polling unit. Distance: {distance:.0f}m. Must be within 200m."
        )
    
    # Update assignment
    assignment.check_in_at = datetime.utcnow()
    assignment.check_in_lat = request.latitude
    assignment.check_in_lng = request.longitude
    assignment.check_in_verified = True
    assignment.status = "checked_in"
    if request.notes:
        assignment.notes = request.notes
    
    db.commit()
    
    return MonitorCheckInResponse(
        assignment_id=str(assignment.id),
        polling_unit_name=pu.pu_name or f"PU {pu.pu_code}",
        pu_code=pu.pu_code,
        check_in_time=assignment.check_in_at.isoformat(),
        distance_meters=round(distance, 2),
        message="Check-in successful. You are verified at your assigned polling unit."
    )


@router.post("/monitor/check-out")
def monitor_check_out(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Monitor check-out after completing election day duties
    """
    # Find active assignment
    assignment = db.query(MonitorAssignment).filter(
        MonitorAssignment.user_id == current_user.id,
        MonitorAssignment.status == "checked_in",
        MonitorAssignment.tenant_id == current_user.tenant_id
    ).first()
    
    if not assignment:
        raise HTTPException(status_code=404, detail="No active check-in found")
    
    assignment.check_out_at = datetime.utcnow()
    assignment.status = "checked_out"
    
    db.commit()
    
    return {
        "message": "Check-out successful",
        "check_out_time": assignment.check_out_at.isoformat(),
        "duration_hours": round(
            (assignment.check_out_at - assignment.check_in_at).total_seconds() / 3600, 2
        ) if assignment.check_in_at else 0
    }


@router.get("/monitor/my-assignment")
def get_my_assignment(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get current monitor's polling unit assignment
    """
    assignment = db.query(MonitorAssignment).filter(
        MonitorAssignment.user_id == current_user.id,
        MonitorAssignment.tenant_id == current_user.tenant_id
    ).order_by(MonitorAssignment.assignment_date.desc()).first()
    
    if not assignment:
        return {"assigned": False, "message": "No polling unit assigned"}
    
    pu = db.query(PollingUnit).filter(PollingUnit.id == assignment.polling_unit_id).first()
    
    return {
        "assigned": True,
        "assignment_id": str(assignment.id),
        "status": assignment.status,
        "polling_unit": {
            "id": str(pu.id) if pu else None,
            "pu_code": pu.pu_code if pu else None,
            "pu_name": pu.pu_name if pu else None,
            "registered_voters": pu.registered_voters if pu else 0,
            "latitude": pu.latitude if pu else None,
            "longitude": pu.longitude if pu else None
        },
        "check_in": {
            "time": assignment.check_in_at.isoformat() if assignment.check_in_at else None,
            "verified": assignment.check_in_verified
        } if assignment.check_in_at else None
    }


@router.post("/accreditation/update", response_model=AccreditationUpdateResponse)
def update_accreditation(
    request: AccreditationUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit accreditation count update for a time slot
    """
    # Verify monitor is checked in to this polling unit
    assignment = db.query(MonitorAssignment).filter(
        MonitorAssignment.user_id == current_user.id,
        MonitorAssignment.polling_unit_id == request.polling_unit_id,
        MonitorAssignment.status == "checked_in",
        MonitorAssignment.tenant_id == current_user.tenant_id
    ).first()
    
    if not assignment:
        raise HTTPException(
            status_code=403, 
            detail="You must be checked in to this polling unit to submit accreditation data"
        )
    
    # Create accreditation record
    record = AccreditationRecord(
        id=uuid.uuid4(),
        tenant_id=current_user.tenant_id,
        polling_unit_id=request.polling_unit_id,
        monitor_id=current_user.id,
        time_slot=request.time_slot,
        accredited_count=request.accredited_count,
        bvas_functional=request.bvas_functional,
        queue_length=request.queue_length,
        issues_reported=request.issues or []
    )
    
    db.add(record)
    
    # Update polling unit totals
    pu = db.query(PollingUnit).filter(PollingUnit.id == request.polling_unit_id).first()
    if pu:
        # Get total accredited so far
        total_accredited = db.query(func.sum(AccreditationRecord.accredited_count)).filter(
            AccreditationRecord.polling_unit_id == request.polling_unit_id,
            AccreditationRecord.tenant_id == current_user.tenant_id
        ).scalar() or 0
        
        pu.accredited_voters = total_accredited + request.accredited_count
    
    db.commit()
    db.refresh(record)
    
    # Calculate new total
    total_accredited = db.query(func.sum(AccreditationRecord.accredited_count)).filter(
        AccreditationRecord.polling_unit_id == request.polling_unit_id,
        AccreditationRecord.tenant_id == current_user.tenant_id
    ).scalar() or 0
    
    return AccreditationUpdateResponse(
        record_id=str(record.id),
        polling_unit_id=request.polling_unit_id,
        time_slot=request.time_slot,
        accredited_count=request.accredited_count,
        total_accredited_so_far=total_accredited,
        recorded_at=record.recorded_at.isoformat()
    )


@router.get("/accreditation/polling-unit/{polling_unit_id}")
def get_pu_accreditation_history(
    polling_unit_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get accreditation history for a polling unit
    """
    records = db.query(AccreditationRecord).filter(
        AccreditationRecord.polling_unit_id == polling_unit_id,
        AccreditationRecord.tenant_id == current_user.tenant_id
    ).order_by(AccreditationRecord.time_slot).all()
    
    pu = db.query(PollingUnit).filter(PollingUnit.id == polling_unit_id).first()
    
    return {
        "polling_unit_id": polling_unit_id,
        "pu_code": pu.pu_code if pu else None,
        "registered_voters": pu.registered_voters if pu else 0,
        "current_accredited": pu.accredited_voters if pu else 0,
        "accreditation_records": [
            {
                "time_slot": r.time_slot,
                "accredited_count": r.accredited_count,
                "bvas_functional": r.bvas_functional,
                "queue_length": r.queue_length,
                "issues": r.issues_reported,
                "recorded_at": r.recorded_at.isoformat()
            }
            for r in records
        ]
    }


@router.post("/vote-tally/submit", response_model=VoteTallyResponse)
def submit_vote_tally(
    request: VoteTallyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit vote tally for a candidate at a polling unit
    """
    # Verify monitor is checked in
    assignment = db.query(MonitorAssignment).filter(
        MonitorAssignment.user_id == current_user.id,
        MonitorAssignment.polling_unit_id == request.polling_unit_id,
        MonitorAssignment.status == "checked_in",
        MonitorAssignment.tenant_id == current_user.tenant_id
    ).first()
    
    if not assignment:
        raise HTTPException(
            status_code=403,
            detail="You must be checked in to submit vote tallies"
        )
    
    # Check if tally already exists for this candidate
    existing = db.query(VoteTally).filter(
        VoteTally.polling_unit_id == request.polling_unit_id,
        VoteTally.candidate_name == request.candidate_name,
        VoteTally.tenant_id == current_user.tenant_id
    ).first()
    
    if existing:
        # Update existing
        existing.votes_received = request.votes_received
        existing.is_incumbent = request.is_incumbent
        existing.recorded_at = datetime.utcnow()
        db.commit()
        tally = existing
    else:
        # Create new
        tally = VoteTally(
            id=uuid.uuid4(),
            tenant_id=current_user.tenant_id,
            polling_unit_id=request.polling_unit_id,
            monitor_id=current_user.id,
            candidate_name=request.candidate_name,
            party=request.party,
            votes_received=request.votes_received,
            is_incumbent=request.is_incumbent
        )
        db.add(tally)
        db.commit()
        db.refresh(tally)
    
    # Update polling unit total votes
    total_votes = db.query(func.sum(VoteTally.votes_received)).filter(
        VoteTally.polling_unit_id == request.polling_unit_id,
        VoteTally.tenant_id == current_user.tenant_id
    ).scalar() or 0
    
    pu = db.query(PollingUnit).filter(PollingUnit.id == request.polling_unit_id).first()
    if pu:
        pu.votes_cast = total_votes
        db.commit()
    
    return VoteTallyResponse(
        tally_id=str(tally.id),
        polling_unit_id=request.polling_unit_id,
        candidate_name=request.candidate_name,
        party=request.party,
        votes_received=request.votes_received,
        total_votes_in_pu=total_votes,
        recorded_at=tally.recorded_at.isoformat()
    )


@router.post("/vote-tally/{tally_id}/upload-photo")
def upload_tally_photo(
    tally_id: str,
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload photo of result sheet for verification
    """
    tally = db.query(VoteTally).filter(
        VoteTally.id == tally_id,
        VoteTally.monitor_id == current_user.id,
        VoteTally.tenant_id == current_user.tenant_id
    ).first()
    
    if not tally:
        raise HTTPException(status_code=404, detail="Tally record not found")
    
    # In production, upload to S3/cloud storage
    # For now, store filename
    tally.photo_url = f"/uploads/tally/{tally_id}_{photo.filename}"
    db.commit()
    
    return {
        "message": "Photo uploaded successfully",
        "tally_id": tally_id,
        "photo_url": tally.photo_url
    }


@router.get("/vote-tally/polling-unit/{polling_unit_id}")
def get_pu_vote_tallies(
    polling_unit_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all vote tallies for a polling unit
    """
    tallies = db.query(VoteTally).filter(
        VoteTally.polling_unit_id == polling_unit_id,
        VoteTally.tenant_id == current_user.tenant_id
    ).order_by(VoteTally.votes_received.desc()).all()
    
    pu = db.query(PollingUnit).filter(PollingUnit.id == polling_unit_id).first()
    
    total_votes = sum(t.votes_received for t in tallies)
    
    return {
        "polling_unit_id": polling_unit_id,
        "pu_code": pu.pu_code if pu else None,
        "registered_voters": pu.registered_voters if pu else 0,
        "accredited_voters": pu.accredited_voters if pu else 0,
        "total_votes_cast": total_votes,
        "turnout_percentage": round((total_votes / pu.registered_voters * 100), 2) if pu and pu.registered_voters > 0 else 0,
        "results": [
            {
                "candidate_name": t.candidate_name,
                "party": t.party,
                "votes": t.votes_received,
                "percentage": round((t.votes_received / total_votes * 100), 2) if total_votes > 0 else 0,
                "is_incumbent": t.is_incumbent,
                "has_photo": t.photo_url is not None,
                "recorded_at": t.recorded_at.isoformat()
            }
            for t in tallies
        ]
    }


@router.post("/incidents/report", response_model=ElectionIncidentResponse)
def report_election_incident(
    request: ElectionIncidentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Report an election day incident
    """
    incident = ElectionDayIncident(
        id=uuid.uuid4(),
        tenant_id=current_user.tenant_id,
        polling_unit_id=request.polling_unit_id,
        monitor_id=current_user.id,
        incident_type=request.incident_type,
        severity=request.severity,
        description=request.description,
        latitude=request.latitude,
        longitude=request.longitude
    )
    
    db.add(incident)
    db.commit()
    db.refresh(incident)
    
    return ElectionIncidentResponse(
        incident_id=str(incident.id),
        polling_unit_id=request.polling_unit_id,
        incident_type=request.incident_type,
        severity=request.severity,
        status=incident.status,
        reported_at=incident.reported_at.isoformat()
    )


@router.post("/incidents/{incident_id}/upload-photos")
def upload_incident_photos(
    incident_id: str,
    photos: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload photos for an incident report
    """
    incident = db.query(ElectionDayIncident).filter(
        ElectionDayIncident.id == incident_id,
        ElectionDayIncident.monitor_id == current_user.id,
        ElectionDayIncident.tenant_id == current_user.tenant_id
    ).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    photo_urls = []
    for photo in photos:
        url = f"/uploads/incidents/{incident_id}_{photo.filename}"
        photo_urls.append(url)
    
    incident.photos = photo_urls
    db.commit()
    
    return {
        "message": f"{len(photo_urls)} photos uploaded",
        "incident_id": incident_id,
        "photos": photo_urls
    }


@router.get("/incidents/my-reports")
def get_my_incident_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all incident reports submitted by current monitor
    """
    incidents = db.query(ElectionDayIncident).filter(
        ElectionDayIncident.monitor_id == current_user.id,
        ElectionDayIncident.tenant_id == current_user.tenant_id
    ).order_by(ElectionDayIncident.reported_at.desc()).all()
    
    return {
        "total": len(incidents),
        "incidents": [
            {
                "id": str(i.id),
                "incident_type": i.incident_type,
                "severity": i.severity,
                "description": i.description[:100] + "..." if len(i.description) > 100 else i.description,
                "status": i.status,
                "reported_at": i.reported_at.isoformat(),
                "photo_count": len(i.photos) if i.photos else 0
            }
            for i in incidents
        ]
    }


# ==================== COMMAND CENTER ENDPOINTS ====================

@router.get("/command-center/polling-units")
def get_all_polling_units_summary(
    lga_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get summary of all polling units (Command Center view)
    """
    query = db.query(PollingUnit).filter(
        PollingUnit.tenant_id == current_user.tenant_id
    )
    
    if lga_id:
        query = query.filter(PollingUnit.lga_id == lga_id)
    if status:
        query = query.filter(PollingUnit.status == status)
    
    polling_units = query.all()
    
    return {
        "total": len(polling_units),
        "polling_units": [
            {
                "id": str(pu.id),
                "pu_code": pu.pu_code,
                "pu_name": pu.pu_name,
                "registered_voters": pu.registered_voters,
                "accredited_voters": pu.accredited_voters,
                "votes_cast": pu.votes_cast,
                "turnout_percentage": round((pu.accredited_voters / pu.registered_voters * 100), 2) if pu.registered_voters > 0 else 0,
                "status": pu.status,
                "has_monitor": db.query(MonitorAssignment).filter(
                    MonitorAssignment.polling_unit_id == pu.id,
                    MonitorAssignment.status.in_(["assigned", "checked_in"])
                ).first() is not None
            }
            for pu in polling_units
        ]
    }


@router.get("/command-center/monitors")
def get_monitor_status_board(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get monitor status board for Command Center
    """
    query = db.query(MonitorAssignment).filter(
        MonitorAssignment.tenant_id == current_user.tenant_id
    )
    
    if status_filter:
        query = query.filter(MonitorAssignment.status == status_filter)
    
    assignments = query.all()
    
    monitors = []
    for assignment in assignments:
        user = db.query(User).filter(User.id == assignment.user_id).first()
        pu = db.query(PollingUnit).filter(PollingUnit.id == assignment.polling_unit_id).first()
        
        # Get last activity
        last_accreditation = db.query(AccreditationRecord).filter(
            AccreditationRecord.monitor_id == assignment.user_id
        ).order_by(AccreditationRecord.recorded_at.desc()).first()
        
        last_tally = db.query(VoteTally).filter(
            VoteTally.monitor_id == assignment.user_id
        ).order_by(VoteTally.recorded_at.desc()).first()
        
        last_activity = None
        if last_accreditation and last_tally:
            last_activity = max(last_accreditation.recorded_at, last_tally.recorded_at).isoformat()
        elif last_accreditation:
            last_activity = last_accreditation.recorded_at.isoformat()
        elif last_tally:
            last_activity = last_tally.recorded_at.isoformat()
        
        monitors.append({
            "monitor_id": str(assignment.user_id),
            "monitor_name": user.full_name if user else "Unknown",
            "assignment_status": assignment.status,
            "polling_unit": {
                "id": str(pu.id) if pu else None,
                "code": pu.pu_code if pu else None,
                "name": pu.pu_name if pu else None
            },
            "check_in_time": assignment.check_in_at.isoformat() if assignment.check_in_at else None,
            "last_activity": last_activity
        })
    
    return {
        "total_monitors": len(monitors),
        "checked_in": len([m for m in monitors if m["assignment_status"] == "checked_in"]),
        "assigned": len([m for m in monitors if m["assignment_status"] == "assigned"]),
        "completed": len([m for m in monitors if m["assignment_status"] in ["checked_out", "completed"]]),
        "monitors": monitors
    }


@router.get("/command-center/pvt-results")
def get_pvt_results(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get Parallel Vote Tabulation (PVT) aggregated results
    """
    # Get all polling units
    polling_units = db.query(PollingUnit).filter(
        PollingUnit.tenant_id == current_user.tenant_id
    ).all()
    
    total_pu = len(polling_units)
    
    # Count reporting PUs (those with vote tallies)
    reporting_pu_ids = db.query(VoteTally.polling_unit_id).filter(
        VoteTally.tenant_id == current_user.tenant_id
    ).distinct().count()
    
    # Calculate totals
    total_registered = sum(pu.registered_voters for pu in polling_units)
    total_accredited = sum(pu.accredited_voters for pu in polling_units)
    total_votes = sum(pu.votes_cast for pu in polling_units)
    
    # Get candidate results
    candidate_totals = db.query(
        VoteTally.candidate_name,
        VoteTally.party,
        VoteTally.is_incumbent,
        func.sum(VoteTally.votes_received).label("total_votes")
    ).filter(
        VoteTally.tenant_id == current_user.tenant_id
    ).group_by(
        VoteTally.candidate_name,
        VoteTally.party,
        VoteTally.is_incumbent
    ).order_by(func.sum(VoteTally.votes_received).desc()).all()
    
    candidate_results = [
        {
            "candidate_name": c.candidate_name,
            "party": c.party,
            "is_incumbent": c.is_incumbent,
            "votes": int(c.total_votes or 0),
            "percentage": round((c.total_votes / total_votes * 100), 2) if total_votes > 0 else 0
        }
        for c in candidate_totals
    ]
    
    # LGA breakdown
    lga_results = []
    lgas = db.query(LGA).filter(LGA.tenant_id == current_user.tenant_id).all()
    for lga in lgas:
        lga_pu_ids = [pu.id for pu in polling_units if str(pu.lga_id) == str(lga.id)]
        if lga_pu_ids:
            lga_votes = db.query(func.sum(VoteTally.votes_received)).filter(
                VoteTally.polling_unit_id.in_(lga_pu_ids),
                VoteTally.tenant_id == current_user.tenant_id
            ).scalar() or 0
            
            lga_registered = sum(pu.registered_voters for pu in polling_units if str(pu.lga_id) == str(lga.id))
            
            lga_results.append({
                "lga_id": str(lga.id),
                "lga_name": lga.name,
                "registered_voters": lga_registered,
                "votes_cast": int(lga_votes),
                "turnout": round((lga_votes / lga_registered * 100), 2) if lga_registered > 0 else 0
            })
    
    return PVTResultsResponse(
        total_polling_units=total_pu,
        reporting_polling_units=reporting_pu_ids,
        reporting_percentage=round((reporting_pu_ids / total_pu * 100), 2) if total_pu > 0 else 0,
        total_registered_voters=total_registered,
        total_accredited=total_accredited,
        total_votes_cast=total_votes,
        turnout_percentage=round((total_votes / total_registered * 100), 2) if total_registered > 0 else 0,
        candidate_results=candidate_results,
        lga_breakdown=lga_results
    )


@router.get("/command-center/incidents")
def get_election_incidents(
    severity: Optional[str] = Query(None),
    incident_type: Optional[str] = Query(None, alias="type"),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all election day incidents (Command Center view)
    """
    query = db.query(ElectionDayIncident).filter(
        ElectionDayIncident.tenant_id == current_user.tenant_id
    )
    
    if severity:
        query = query.filter(ElectionDayIncident.severity == severity)
    if incident_type:
        query = query.filter(ElectionDayIncident.incident_type == incident_type)
    if status:
        query = query.filter(ElectionDayIncident.status == status)
    
    incidents = query.order_by(ElectionDayIncident.reported_at.desc()).all()
    
    return {
        "total": len(incidents),
        "by_severity": {
            "critical": len([i for i in incidents if i.severity == "critical"]),
            "high": len([i for i in incidents if i.severity == "high"]),
            "medium": len([i for i in incidents if i.severity == "medium"]),
            "low": len([i for i in incidents if i.severity == "low"])
        },
        "by_status": {
            "reported": len([i for i in incidents if i.status == "reported"]),
            "acknowledged": len([i for i in incidents if i.status == "acknowledged"]),
            "resolved": len([i for i in incidents if i.status == "resolved"]),
            "escalated": len([i for i in incidents if i.status == "escalated"])
        },
        "incidents": [
            {
                "id": str(i.id),
                "polling_unit_id": str(i.polling_unit_id),
                "incident_type": i.incident_type,
                "severity": i.severity,
                "description": i.description[:150] + "..." if len(i.description) > 150 else i.description,
                "status": i.status,
                "has_location": i.latitude is not None and i.longitude is not None,
                "photo_count": len(i.photos) if i.photos else 0,
                "reported_at": i.reported_at.isoformat()
            }
            for i in incidents
        ]
    }


@router.patch("/command-center/incidents/{incident_id}/status")
def update_incident_status(
    incident_id: str,
    status: str,  # acknowledged, resolved, escalated
    resolution_notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update incident status from Command Center
    """
    incident = db.query(ElectionDayIncident).filter(
        ElectionDayIncident.id == incident_id,
        ElectionDayIncident.tenant_id == current_user.tenant_id
    ).first()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    incident.status = status
    if status == "resolved":
        incident.resolved_at = datetime.utcnow()
        if resolution_notes:
            incident.resolution_notes = resolution_notes
    
    db.commit()
    
    return {
        "message": f"Incident status updated to {status}",
        "incident_id": incident_id,
        "new_status": status,
        "updated_at": datetime.utcnow().isoformat()
    }


@router.get("/command-center/live-dashboard")
def get_live_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get live election day dashboard data
    """
    # Polling units stats
    pu_stats = db.query(
        func.count(PollingUnit.id).label("total"),
        func.sum(PollingUnit.registered_voters).label("total_registered"),
        func.sum(PollingUnit.accredited_voters).label("total_accredited"),
        func.sum(PollingUnit.votes_cast).label("total_votes")
    ).filter(
        PollingUnit.tenant_id == current_user.tenant_id
    ).first()
    
    # Monitor stats
    monitor_stats = db.query(
        func.count(MonitorAssignment.id).label("total"),
        func.sum(func.case([(MonitorAssignment.status == "checked_in", 1)], else_=0)).label("checked_in")
    ).filter(
        MonitorAssignment.tenant_id == current_user.tenant_id
    ).first()
    
    # Incident stats
    incident_stats = db.query(
        func.count(ElectionDayIncident.id).label("total"),
        func.sum(func.case([(ElectionDayIncident.severity == "critical", 1)], else_=0)).label("critical")
    ).filter(
        ElectionDayIncident.tenant_id == current_user.tenant_id
    ).first()
    
    # Recent activity (last 30 minutes)
    thirty_mins_ago = datetime.utcnow() - __import__('datetime').timedelta(minutes=30)
    
    recent_accreditations = db.query(AccreditationRecord).filter(
        AccreditationRecord.tenant_id == current_user.tenant_id,
        AccreditationRecord.recorded_at >= thirty_mins_ago
    ).count()
    
    recent_tallies = db.query(VoteTally).filter(
        VoteTally.tenant_id == current_user.tenant_id,
        VoteTally.recorded_at >= thirty_mins_ago
    ).count()
    
    recent_incidents = db.query(ElectionDayIncident).filter(
        ElectionDayIncident.tenant_id == current_user.tenant_id,
        ElectionDayIncident.reported_at >= thirty_mins_ago
    ).count()
    
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "polling_units": {
            "total": pu_stats.total or 0,
            "registered_voters": int(pu_stats.total_registered or 0),
            "accredited_voters": int(pu_stats.total_accredited or 0),
            "votes_cast": int(pu_stats.total_votes or 0),
            "turnout_percentage": round(
                (pu_stats.total_votes / pu_stats.total_registered * 100), 2
            ) if pu_stats.total_registered and pu_stats.total_registered > 0 else 0
        },
        "monitors": {
            "total": monitor_stats.total or 0,
            "checked_in": int(monitor_stats.checked_in or 0),
            "check_in_rate": round(
                (monitor_stats.checked_in / monitor_stats.total * 100), 2
            ) if monitor_stats.total and monitor_stats.total > 0 else 0
        },
        "incidents": {
            "total": incident_stats.total or 0,
            "critical": int(incident_stats.critical or 0)
        },
        "recent_activity": {
            "accreditation_updates": recent_accreditations,
            "vote_tallies": recent_tallies,
            "incidents": recent_incidents,
            "time_window": "last_30_minutes"
        }
    }
