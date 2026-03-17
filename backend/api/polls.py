"""
Polls + Survey Builder API - Task 4.7
Create polls, deploy via multiple channels, results dashboard
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
from database import get_db
from models import (
    Voter, LGA, Ward, User
)
from auth.utils import get_current_user

router = APIRouter(prefix="/api/polls", tags=["Polls & Surveys"])


# ==================== PYDANTIC MODELS ====================

class PollOption(BaseModel):
    label: str
    value: str


class PollCreateRequest(BaseModel):
    title: str
    question: str
    question_ha: Optional[str] = None  # Hausa translation
    question_ff: Optional[str] = None  # Fulfulde translation
    options: List[PollOption]
    target_lgas: Optional[List[str]] = None
    target_demographics: Optional[Dict[str, Any]] = None  # age_range, gender, etc.
    channels: List[str] = ["ussd", "whatsapp"]  # ussd, whatsapp, field_app
    starts_at: Optional[str] = None
    closes_at: Optional[str] = None
    max_responses: Optional[int] = None


class PollResponse(BaseModel):
    id: str
    title: str
    question: str
    options: List[PollOption]
    status: str  # draft, active, closed
    total_responses: int
    starts_at: Optional[str]
    closes_at: Optional[str]


class PollResponseSubmit(BaseModel):
    poll_id: str
    option_value: str
    voter_id: Optional[str] = None
    lga_id: Optional[str] = None
    ward_id: Optional[str] = None
    channel: str  # ussd, whatsapp, field_app
    demographic: Optional[Dict[str, Any]] = None


class PollResultsResponse(BaseModel):
    poll_id: str
    title: str
    total_responses: int
    results_by_option: List[Dict[str, Any]]
    results_by_lga: List[Dict[str, Any]]
    results_by_demographic: Dict[str, Any]
    geographic_distribution: List[Dict[str, Any]]


class PollListResponse(BaseModel):
    id: str
    title: str
    status: str
    total_responses: int
    response_rate: Optional[float]
    closes_at: Optional[str]


# ==================== POLLS SYSTEM ====================

# In-memory storage for polls (in production, use database table)
polls_db = {}
poll_responses_db = {}


@router.post("/create", response_model=PollResponse)
def create_poll(
    request: PollCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new poll/survey
    """
    poll_id = str(uuid.uuid4())
    
    now = datetime.utcnow()
    starts_at = datetime.fromisoformat(request.starts_at) if request.starts_at else now
    closes_at = datetime.fromisoformat(request.closes_at) if request.closes_at else now + timedelta(days=7)
    
    poll = {
        "id": poll_id,
        "tenant_id": current_user.tenant_id,
        "title": request.title,
        "question": request.question,
        "question_ha": request.question_ha,
        "question_ff": request.question_ff,
        "options": [opt.dict() for opt in request.options],
        "target_lgas": request.target_lgas or [],
        "target_demographics": request.target_demographics or {},
        "channels": request.channels,
        "status": "draft",
        "total_responses": 0,
        "starts_at": starts_at,
        "closes_at": closes_at,
        "max_responses": request.max_responses,
        "created_by": str(current_user.id),
        "created_at": now,
        "deployed_at": None
    }
    
    polls_db[poll_id] = poll
    poll_responses_db[poll_id] = []
    
    return PollResponse(
        id=poll_id,
        title=request.title,
        question=request.question,
        options=request.options,
        status="draft",
        total_responses=0,
        starts_at=starts_at.isoformat(),
        closes_at=closes_at.isoformat()
    )


@router.get("/list")
def list_polls(
    status: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all polls
    """
    polls = [
        p for p in polls_db.values()
        if p["tenant_id"] == current_user.tenant_id
    ]
    
    if status:
        polls = [p for p in polls if p["status"] == status]
    
    # Sort by created_at desc
    polls.sort(key=lambda x: x["created_at"], reverse=True)
    
    return {
        "total": len(polls),
        "polls": [
            PollListResponse(
                id=p["id"],
                title=p["title"],
                status=p["status"],
                total_responses=p["total_responses"],
                response_rate=None,  # Would calculate based on target audience
                closes_at=p["closes_at"].isoformat() if p["closes_at"] else None
            )
            for p in polls[:limit]
        ]
    }


@router.get("/{poll_id}")
def get_poll_details(
    poll_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get poll details
    """
    poll = polls_db.get(poll_id)
    
    if not poll or poll["tenant_id"] != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    return {
        "id": poll["id"],
        "title": poll["title"],
        "question": poll["question"],
        "question_ha": poll.get("question_ha"),
        "question_ff": poll.get("question_ff"),
        "options": poll["options"],
        "target_lgas": poll["target_lgas"],
        "target_demographics": poll["target_demographics"],
        "channels": poll["channels"],
        "status": poll["status"],
        "total_responses": poll["total_responses"],
        "starts_at": poll["starts_at"].isoformat() if poll["starts_at"] else None,
        "closes_at": poll["closes_at"].isoformat() if poll["closes_at"] else None,
        "max_responses": poll.get("max_responses"),
        "created_at": poll["created_at"].isoformat()
    }


@router.post("/{poll_id}/deploy")
def deploy_poll(
    poll_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Deploy poll to selected channels
    """
    poll = polls_db.get(poll_id)
    
    if not poll or poll["tenant_id"] != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    if poll["status"] == "active":
        raise HTTPException(status_code=400, detail="Poll is already active")
    
    poll["status"] = "active"
    poll["deployed_at"] = datetime.utcnow()
    
    # In production, this would:
    # 1. Push to USSD shortcode
    # 2. Send WhatsApp broadcast
    # 3. Push to field app
    
    deployment_summary = {
        "ussd": len(poll["target_lgas"]) * 1000 if "ussd" in poll["channels"] else 0,  # Estimated reach
        "whatsapp": len(poll["target_lgas"]) * 500 if "whatsapp" in poll["channels"] else 0,
        "field_app": "Active" if "field_app" in poll["channels"] else "Not deployed"
    }
    
    return {
        "message": "Poll deployed successfully",
        "poll_id": poll_id,
        "status": "active",
        "channels": poll["channels"],
        "estimated_reach": deployment_summary,
        "deployed_at": poll["deployed_at"].isoformat()
    }


@router.post("/{poll_id}/close")
def close_poll(
    poll_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Close a poll manually
    """
    poll = polls_db.get(poll_id)
    
    if not poll or poll["tenant_id"] != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    poll["status"] = "closed"
    poll["closes_at"] = datetime.utcnow()
    
    return {
        "message": "Poll closed",
        "poll_id": poll_id,
        "total_responses": poll["total_responses"],
        "closed_at": poll["closes_at"].isoformat()
    }


@router.post("/respond")
def submit_poll_response(
    request: PollResponseSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit a poll response
    """
    poll = polls_db.get(request.poll_id)
    
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    if poll["status"] != "active":
        raise HTTPException(status_code=400, detail="Poll is not active")
    
    # Validate option
    valid_options = [opt["value"] for opt in poll["options"]]
    if request.option_value not in valid_options:
        raise HTTPException(status_code=400, detail="Invalid option")
    
    # Check max responses
    if poll.get("max_responses") and poll["total_responses"] >= poll["max_responses"]:
        raise HTTPException(status_code=400, detail="Poll has reached maximum responses")
    
    # Record response
    response = {
        "id": str(uuid.uuid4()),
        "poll_id": request.poll_id,
        "option_value": request.option_value,
        "voter_id": request.voter_id,
        "lga_id": request.lga_id,
        "ward_id": request.ward_id,
        "channel": request.channel,
        "demographic": request.demographic or {},
        "responded_at": datetime.utcnow()
    }
    
    poll_responses_db[request.poll_id].append(response)
    poll["total_responses"] += 1
    
    return {
        "message": "Response recorded",
        "response_id": response["id"],
        "poll_id": request.poll_id,
        "total_responses": poll["total_responses"]
    }


@router.get("/{poll_id}/results", response_model=PollResultsResponse)
def get_poll_results(
    poll_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get poll results with breakdowns
    """
    poll = polls_db.get(poll_id)
    
    if not poll or poll["tenant_id"] != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    responses = poll_responses_db.get(poll_id, [])
    
    if not responses:
        return PollResultsResponse(
            poll_id=poll_id,
            title=poll["title"],
            total_responses=0,
            results_by_option=[],
            results_by_lga=[],
            results_by_demographic={},
            geographic_distribution=[]
        )
    
    # Results by option
    option_counts = {}
    for resp in responses:
        option_counts[resp["option_value"]] = option_counts.get(resp["option_value"], 0) + 1
    
    results_by_option = []
    for opt in poll["options"]:
        count = option_counts.get(opt["value"], 0)
        results_by_option.append({
            "option_label": opt["label"],
            "option_value": opt["value"],
            "count": count,
            "percentage": round(count / len(responses) * 100, 2) if responses else 0
        })
    
    # Results by LGA
    lga_counts = {}
    for resp in responses:
        lga = resp.get("lga_id", "unknown")
        if lga not in lga_counts:
            lga_counts[lga] = {}
        lga_counts[lga][resp["option_value"]] = lga_counts[lga].get(resp["option_value"], 0) + 1
    
    results_by_lga = []
    for lga_id, counts in lga_counts.items():
        lga = db.query(LGA).filter(LGA.id == lga_id).first() if lga_id != "unknown" else None
        total = sum(counts.values())
        results_by_lga.append({
            "lga_id": lga_id if lga_id != "unknown" else None,
            "lga_name": lga.name if lga else "Unknown",
            "total_responses": total,
            "breakdown": [
                {"option": opt, "count": cnt, "percentage": round(cnt/total*100, 2)}
                for opt, cnt in counts.items()
            ]
        })
    
    # Results by demographic
    demo_breakdown = {}
    for resp in responses:
        demo = resp.get("demographic", {})
        age = demo.get("age_range", "unknown")
        gender = demo.get("gender", "unknown")
        
        if age not in demo_breakdown:
            demo_breakdown[age] = {}
        demo_breakdown[age][resp["option_value"]] = demo_breakdown[age].get(resp["option_value"], 0) + 1
    
    # Geographic distribution for map
    geo_distribution = []
    for lga_id, counts in lga_counts.items():
        lga = db.query(LGA).filter(LGA.id == lga_id).first() if lga_id != "unknown" else None
        if lga:
            geo_distribution.append({
                "lga_id": str(lga_id),
                "lga_name": lga.name,
                "total_responses": sum(counts.values()),
                "dominant_response": max(counts.items(), key=lambda x: x[1])[0]
            })
    
    return PollResultsResponse(
        poll_id=poll_id,
        title=poll["title"],
        total_responses=len(responses),
        results_by_option=results_by_option,
        results_by_lga=results_by_lga,
        results_by_demographic=demo_breakdown,
        geographic_distribution=geo_distribution
    )


@router.get("/{poll_id}/results/realtime")
def get_realtime_results(
    poll_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get real-time poll results (for live dashboard)
    """
    poll = polls_db.get(poll_id)
    
    if not poll or poll["tenant_id"] != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    responses = poll_responses_db.get(poll_id, [])
    
    # Quick summary
    option_counts = {}
    for resp in responses:
        option_counts[resp["option_value"]] = option_counts.get(resp["option_value"], 0) + 1
    
    total = len(responses)
    
    return {
        "poll_id": poll_id,
        "title": poll["title"],
        "status": poll["status"],
        "total_responses": total,
        "last_response_at": responses[-1]["responded_at"].isoformat() if responses else None,
        "results": [
            {
                "option": opt["label"],
                "count": option_counts.get(opt["value"], 0),
                "percentage": round(option_counts.get(opt["value"], 0) / total * 100, 1) if total > 0 else 0
            }
            for opt in poll["options"]
        ]
    }


@router.get("/dashboard/active")
def get_active_polls_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get dashboard of active polls
    """
    active_polls = [
        p for p in polls_db.values()
        if p["tenant_id"] == current_user.tenant_id and p["status"] == "active"
    ]
    
    return {
        "active_polls_count": len(active_polls),
        "total_responses_today": sum(
            len([r for r in poll_responses_db.get(p["id"], [])
             if r["responded_at"] >= datetime.utcnow().replace(hour=0, minute=0, second=0)])
            for p in active_polls
        ),
        "polls": [
            {
                "id": p["id"],
                "title": p["title"],
                "responses": p["total_responses"],
                "closes_in_hours": round((p["closes_at"] - datetime.utcnow()).total_seconds() / 3600, 1) if p["closes_at"] else None
            }
            for p in sorted(active_polls, key=lambda x: x["total_responses"], reverse=True)
        ]
    }


@router.delete("/{poll_id}")
def delete_poll(
    poll_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a poll (only if no responses)
    """
    poll = polls_db.get(poll_id)
    
    if not poll or poll["tenant_id"] != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    if poll["total_responses"] > 0:
        raise HTTPException(status_code=400, detail="Cannot delete poll with responses")
    
    del polls_db[poll_id]
    if poll_id in poll_responses_db:
        del poll_responses_db[poll_id]
    
    return {"message": "Poll deleted", "poll_id": poll_id}
