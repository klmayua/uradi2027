"""
Mobile App API Module
Handles mobile-specific endpoints for field agents
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime, timedelta
from uuid import UUID, uuid4

from utils.auth import get_current_user, require_permissions
from models import User

router = APIRouter(prefix="/mobile", tags=["Mobile App"])


# ============ Pydantic Models ============

class MobileSyncRequest(BaseModel):
    last_sync_at: Optional[datetime] = None
    device_id: str
    app_version: str


class MobileSyncResponse(BaseModel):
    sync_id: UUID
    timestamp: datetime
    updates: dict
    conflicts: List[dict]


class PollingUnitStatus(BaseModel):
    polling_unit_id: UUID
    code: str
    name: str
    registered_voters: int
    status: Literal["not_started", "accreditation_ongoing", "voting_ongoing", "counting", "completed", "cancelled"]
    accreditation_count: int
    accredited_count: int
    votes_cast: int
    issues_count: int
    last_updated: Optional[datetime]


class AccreditationSubmission(BaseModel):
    polling_unit_id: UUID
    time_slot: Literal["08:00", "10:00", "12:00", "14:00", "16:00"]
    accredited_count: int = Field(..., ge=0)
    bvas_functional: bool
    queue_length: Literal["short", "medium", "long", "very_long"]
    issues: List[str] = Field(default_factory=list)
    notes: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class VoteResultSubmission(BaseModel):
    polling_unit_id: UUID
    results: List[dict]  # [{"candidate_name": str, "party": str, "votes": int}]
    total_votes_cast: int
    total_accredited: int
    rejected_ballots: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class IncidentReport(BaseModel):
    incident_type: Literal["violence", "intimidation", "ballot_snatching", "bribery", "accreditation_issue", "materials_shortage", "bvas_failure", "other"]
    severity: Literal["low", "medium", "high", "critical"]
    description: str = Field(..., min_length=10, max_length=1000)
    polling_unit_id: Optional[UUID] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photos: List[str] = Field(default_factory=list)


class AssignedPollingUnit(BaseModel):
    id: UUID
    code: str
    name: str
    lga: str
    ward: str
    registered_voters: int
    status: str
    accreditation_count: int


class MobileCheckInRequest(BaseModel):
    assignment_id: UUID
    latitude: float
    longitude: float
    check_in_type: Literal["arrival", "departure"]


class MobileProfile(BaseModel):
    id: UUID
    full_name: str
    phone: str
    role: str
    assigned_lga: Optional[str]
    assigned_polling_units: int
    assignments_completed: int
    is_active: bool
    last_sync_at: Optional[datetime]


# ============ Mock Data Store ============

MOBILE_PROFILES = {}
ASSIGNMENTS_DB = {}
ACCREDITATION_RECORDS = {}
VOTE_RESULTS = {}
INCIDENTS_DB = {}

# Seed assignments
_seed_assignments = [
    {
        "id": uuid4(),
        "user_id": None,
        "polling_unit_id": uuid4(),
        "polling_unit_code": "001",
        "polling_unit_name": "Primary School A",
        "lga": "Lagos Central",
        "ward": "Ward 1",
        "registered_voters": 850,
        "status": "assigned",
        "accreditation_count": 0,
        "assigned_at": datetime.now() - timedelta(days=1)
    },
    {
        "id": uuid4(),
        "user_id": None,
        "polling_unit_id": uuid4(),
        "polling_unit_code": "002",
        "polling_unit_name": "Community Center",
        "lga": "Lagos Central",
        "ward": "Ward 1",
        "registered_voters": 620,
        "status": "assigned",
        "accreditation_count": 0,
        "assigned_at": datetime.now() - timedelta(days=1)
    },
]

for assignment in _seed_assignments:
    ASSIGNMENTS_DB[assignment["id"]] = assignment


# ============ API Endpoints ============

@router.get("/profile", response_model=MobileProfile)
async def get_mobile_profile(
    current_user: User = Depends(get_current_user)
):
    """Get mobile app user profile"""
    # Get user's assignments
    user_assignments = [a for a in ASSIGNMENTS_DB.values() if a.get("user_id") == current_user.id]
    completed = sum(1 for a in user_assignments if a.get("status") == "completed")

    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "phone": current_user.phone or "",
        "role": current_user.role,
        "assigned_lga": current_user.assigned_lga,
        "assigned_polling_units": len(user_assignments),
        "assignments_completed": completed,
        "is_active": current_user.active,
        "last_sync_at": None
    }


@router.post("/sync")
async def sync_mobile_data(
    sync_request: MobileSyncRequest,
    current_user: User = Depends(get_current_user)
):
    """Sync mobile app data with server"""
    # Get updates since last sync
    updates = {
        "assignments": [a for a in ASSIGNMENTS_DB.values() if a.get("user_id") == current_user.id],
        "polling_units": [],
        "notifications": []
    }

    return {
        "sync_id": uuid4(),
        "timestamp": datetime.now(),
        "updates": updates,
        "conflicts": []
    }


# ============ Polling Unit Endpoints ============

@router.get("/assigned-units", response_model=List[AssignedPollingUnit])
async def get_assigned_polling_units(
    current_user: User = Depends(get_current_user)
):
    """Get polling units assigned to the current agent"""
    assignments = [a for a in ASSIGNMENTS_DB.values() if a.get("user_id") == current_user.id]

    return [
        {
            "id": a["polling_unit_id"],
            "code": a["polling_unit_code"],
            "name": a["polling_unit_name"],
            "lga": a["lga"],
            "ward": a["ward"],
            "registered_voters": a["registered_voters"],
            "status": a["status"],
            "accreditation_count": a["accreditation_count"]
        }
        for a in assignments
    ]


@router.get("/polling-units/{polling_unit_id}/status")
async def get_polling_unit_status(
    polling_unit_id: UUID,
    current_user: User = Depends(get_current_user)
):
    """Get current status of a polling unit"""
    # Verify user has access to this polling unit
    assignment = next(
        (a for a in ASSIGNMENTS_DB.values()
         if a.get("polling_unit_id") == polling_unit_id and a.get("user_id") == current_user.id),
        None
    )

    if not assignment:
        raise HTTPException(status_code=403, detail="You don't have access to this polling unit")

    return {
        "polling_unit_id": polling_unit_id,
        "code": assignment["polling_unit_code"],
        "name": assignment["polling_unit_name"],
        "registered_voters": assignment["registered_voters"],
        "status": assignment["status"],
        "accreditation_count": assignment["accreditation_count"],
        "accredited_count": 0,  # Would calculate from records
        "votes_cast": 0,
        "issues_count": 0,
        "last_updated": datetime.now()
    }


# ============ Check-in/out ============

@router.post("/check-in")
async def check_in(
    request: MobileCheckInRequest,
    current_user: User = Depends(get_current_user)
):
    """Check in/out at a polling unit"""
    if request.assignment_id not in ASSIGNMENTS_DB:
        raise HTTPException(status_code=404, detail="Assignment not found")

    assignment = ASSIGNMENTS_DB[request.assignment_id]

    if assignment.get("user_id") != current_user.id:
        raise HTTPException(status_code=403, detail="Not your assignment")

    if request.check_in_type == "arrival":
        assignment["status"] = "checked_in"
        assignment["check_in_at"] = datetime.now()
        assignment["check_in_lat"] = request.latitude
        assignment["check_in_lng"] = request.longitude
    else:
        assignment["status"] = "checked_out"
        assignment["check_out_at"] = datetime.now()

    return {
        "success": True,
        "check_in_type": request.check_in_type,
        "timestamp": datetime.now(),
        "assignment_status": assignment["status"]
    }


# ============ Accreditation ============

@router.post("/accreditation/submit")
async def submit_accreditation(
    data: AccreditationSubmission,
    current_user: User = Depends(get_current_user)
):
    """Submit accreditation data"""
    record_id = uuid4()

    record = {
        "id": record_id,
        "polling_unit_id": data.polling_unit_id,
        "monitor_id": current_user.id,
        "time_slot": data.time_slot,
        "accredited_count": data.accredited_count,
        "bvas_functional": data.bvas_functional,
        "queue_length": data.queue_length,
        "issues_reported": data.issues,
        "notes": data.notes,
        "latitude": data.latitude,
        "longitude": data.longitude,
        "recorded_at": datetime.now()
    }

    ACCREDITATION_RECORDS[record_id] = record

    # Update assignment
    for assignment in ASSIGNMENTS_DB.values():
        if assignment.get("polling_unit_id") == data.polling_unit_id:
            assignment["accreditation_count"] += data.accredited_count
            assignment["status"] = "accreditation_ongoing"

    return {
        "success": True,
        "record_id": record_id,
        "message": "Accreditation data submitted"
    }


@router.get("/accreditation/history/{polling_unit_id}")
async def get_accreditation_history(
    polling_unit_id: UUID,
    current_user: User = Depends(get_current_user)
):
    """Get accreditation history for a polling unit"""
    records = [
        r for r in ACCREDITATION_RECORDS.values()
        if r.get("polling_unit_id") == polling_unit_id
    ]

    return sorted(records, key=lambda x: x["recorded_at"], reverse=True)


# ============ Results Submission ============

@router.post("/results/submit")
async def submit_results(
    data: VoteResultSubmission,
    current_user: User = Depends(get_current_user)
):
    """Submit vote results from a polling unit"""
    result_id = uuid4()

    # Validate total
    total_from_candidates = sum(r.get("votes", 0) for r in data.results)
    if total_from_candidates != data.total_votes_cast:
        raise HTTPException(
            status_code=400,
            detail=f"Total votes ({total_from_candidates}) don't match declared total ({data.total_votes_cast})"
        )

    result = {
        "id": result_id,
        "polling_unit_id": data.polling_unit_id,
        "monitor_id": current_user.id,
        "results": data.results,
        "total_votes_cast": data.total_votes_cast,
        "total_accredited": data.total_accredited,
        "rejected_ballots": data.rejected_ballots,
        "latitude": data.latitude,
        "longitude": data.longitude,
        "submitted_at": datetime.now(),
        "verified": False
    }

    VOTE_RESULTS[result_id] = result

    # Update assignment status
    for assignment in ASSIGNMENTS_DB.values():
        if assignment.get("polling_unit_id") == data.polling_unit_id:
            assignment["status"] = "completed"

    return {
        "success": True,
        "result_id": result_id,
        "message": "Results submitted successfully"
    }


@router.post("/results/upload-photo")
async def upload_result_photo(
    polling_unit_id: UUID,
    photo: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload a photo of the result sheet"""
    # In real implementation, save file and return URL
    return {
        "success": True,
        "photo_url": f"/uploads/results/{uuid4()}.jpg",
        "message": "Photo uploaded"
    }


# ============ Incident Reporting ============

@router.post("/incidents/report")
async def report_incident(
    incident: IncidentReport,
    current_user: User = Depends(get_current_user)
):
    """Report an election day incident"""
    incident_id = uuid4()

    record = {
        "id": incident_id,
        "polling_unit_id": incident.polling_unit_id,
        "monitor_id": current_user.id,
        "incident_type": incident.incident_type,
        "severity": incident.severity,
        "description": incident.description,
        "latitude": incident.latitude,
        "longitude": incident.longitude,
        "photos": incident.photos,
        "status": "reported",
        "reported_at": datetime.now(),
        "resolved_at": None
    }

    INCIDENTS_DB[incident_id] = record

    return {
        "success": True,
        "incident_id": incident_id,
        "message": "Incident reported successfully"
    }


@router.post("/incidents/{incident_id}/attach-photo")
async def attach_incident_photo(
    incident_id: UUID,
    photo: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Attach a photo to an incident report"""
    if incident_id not in INCIDENTS_DB:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident = INCIDENTS_DB[incident_id]

    if incident.get("monitor_id") != current_user.id:
        raise HTTPException(status_code=403, detail="Not your incident report")

    # In real implementation, save file
    photo_url = f"/uploads/incidents/{uuid4()}.jpg"
    incident["photos"] = incident.get("photos", []) + [photo_url]

    return {
        "success": True,
        "photo_url": photo_url
    }


# ============ Evidence Capture ============

@router.post("/evidence/capture")
async def capture_evidence(
    evidence_type: Literal["result_sheet", "incident", "accreditation", "irregularity"],
    polling_unit_id: UUID,
    photo: UploadFile = File(...),
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Capture evidence photo"""
    # In real implementation, save file
    photo_url = f"/uploads/evidence/{uuid4()}.jpg"

    return {
        "success": True,
        "evidence_id": uuid4(),
        "photo_url": photo_url,
        "type": evidence_type,
        "uploaded_at": datetime.now()
    }


# ============ Offline Support ============

@router.post("/offline/queue")
async def queue_offline_action(
    action_type: str,
    data: dict,
    current_user: User = Depends(get_current_user)
):
    """Queue an action for when connection is restored"""
    # In real implementation, store in local queue
    return {
        "success": True,
        "queued": True,
        "action_type": action_type,
        "local_id": str(uuid4())
    }


@router.post("/offline/sync")
async def sync_offline_queue(
    queue_data: List[dict],
    current_user: User = Depends(get_current_user)
):
    """Sync queued offline actions"""
    results = []

    for item in queue_data:
        # Process each queued item
        results.append({
            "local_id": item.get("local_id"),
            "status": "synced",
            "server_id": str(uuid4())
        })

    return {
        "success": True,
        "synced_count": len(results),
        "results": results
    }


# ============ Dashboard Stats ============

@router.get("/dashboard")
async def get_mobile_dashboard(
    current_user: User = Depends(get_current_user)
):
    """Get mobile app dashboard data"""
    user_assignments = [a for a in ASSIGNMENTS_DB.values() if a.get("user_id") == current_user.id]

    return {
        "assigned_units": len(user_assignments),
        "completed_units": sum(1 for a in user_assignments if a.get("status") == "completed"),
        "pending_units": sum(1 for a in user_assignments if a.get("status") in ["assigned", "checked_in"]),
        "incidents_reported": sum(
            1 for i in INCIDENTS_DB.values()
            if i.get("monitor_id") == current_user.id
        ),
        "accreditation_submissions": sum(
            1 for r in ACCREDITATION_RECORDS.values()
            if r.get("monitor_id") == current_user.id
        ),
        "results_submitted": sum(
            1 for r in VOTE_RESULTS.values()
            if r.get("monitor_id") == current_user.id
        ),
        "election_status": "accreditation_phase",  # Would be dynamic
        "sync_status": {
            "last_sync": datetime.now() - timedelta(minutes=5),
            "pending_uploads": 0
        }
    }
