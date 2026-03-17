"""
Incident Reporting API - Task 3.4
Incident and feedback reporting endpoints for Field App
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from models import SentimentEntry
from auth.utils import get_current_user
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/field/reports", tags=["Incident Reporting"])


# Pydantic Models
class IncidentReportCreate(BaseModel):
    category: str  # governance_feedback, security_incident, community_issue, campaign_update
    severity: str  # low, medium, high, critical
    description: str
    ward_id: str
    lga_id: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None


class IncidentReportResponse(BaseModel):
    id: str
    category: str
    severity: str
    description: str
    ward_id: str
    status: str  # submitted, acknowledged, in_progress, resolved, closed
    created_at: str
    submitted_by: str


class MyReportSummary(BaseModel):
    id: str
    category: str
    severity: str
    status: str
    created_at: str
    has_photo: bool


# In-memory storage for reports
reports_db = {}


@router.post("/incident", response_model=IncidentReportResponse)
def submit_incident_report(
    report: IncidentReportCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit an incident or feedback report from field.
    """
    report_id = str(uuid.uuid4())
    
    report_data = {
        "id": report_id,
        "tenant_id": current_user.tenant_id,
        "submitted_by": str(current_user.id),
        "submitter_name": current_user.full_name,
        "category": report.category,
        "severity": report.severity,
        "description": report.description,
        "ward_id": report.ward_id,
        "lga_id": report.lga_id,
        "location_lat": report.location_lat,
        "location_lng": report.location_lng,
        "status": "submitted",
        "photos": [],
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    reports_db[report_id] = report_data
    
    # Also create as sentiment entry if it's feedback
    if report.category == "governance_feedback":
        sentiment = SentimentEntry(
            id=uuid.uuid4(),
            tenant_id=current_user.tenant_id,
            source="field_report",
            ward_id=report.ward_id,
            lga_id=report.lga_id,
            raw_text=report.description,
            category="governance",
            processed=False,
            created_at=datetime.utcnow()
        )
        db.add(sentiment)
        db.commit()
    
    return IncidentReportResponse(
        id=report_id,
        category=report.category,
        severity=report.severity,
        description=report.description,
        ward_id=report.ward_id,
        status="submitted",
        created_at=report_data["created_at"],
        submitted_by=current_user.full_name
    )


@router.post("/incident/{report_id}/photo")
def upload_incident_photo(
    report_id: str,
    photo: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload photo for an incident report.
    """
    if report_id not in reports_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    report = reports_db[report_id]
    
    if report["submitted_by"] != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # In production: Save photo to storage, get URL
    photo_url = f"/uploads/{photo.filename}"
    
    report["photos"].append(photo_url)
    report["updated_at"] = datetime.utcnow().isoformat()
    
    return {
        "status": "success",
        "photo_url": photo_url,
        "total_photos": len(report["photos"])
    }


@router.get("/my-reports")
def get_my_reports(
    status: Optional[str] = Query(None, description="Filter by status"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of reports submitted by current user.
    """
    my_reports = [
        report for report in reports_db.values()
        if report["submitted_by"] == str(current_user.id)
        and report["tenant_id"] == current_user.tenant_id
    ]
    
    if status:
        my_reports = [r for r in my_reports if r["status"] == status]
    
    # Sort by date (newest first)
    my_reports.sort(key=lambda x: x["created_at"], reverse=True)
    
    return {
        "total_reports": len(my_reports),
        "reports": [
            {
                "id": r["id"],
                "category": r["category"],
                "severity": r["severity"],
                "status": r["status"],
                "description": r["description"][:100] + "..." if len(r["description"]) > 100 else r["description"],
                "created_at": r["created_at"],
                "has_photo": len(r.get("photos", [])) > 0
            }
            for r in my_reports
        ]
    }


@router.get("/my-reports/{report_id}")
def get_my_report_detail(
    report_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed view of a specific report.
    """
    if report_id not in reports_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    report = reports_db[report_id]
    
    if report["submitted_by"] != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return {
        "id": report["id"],
        "category": report["category"],
        "severity": report["severity"],
        "description": report["description"],
        "status": report["status"],
        "ward_id": report["ward_id"],
        "lga_id": report["lga_id"],
        "location": {
            "lat": report.get("location_lat"),
            "lng": report.get("location_lng")
        },
        "photos": report.get("photos", []),
        "created_at": report["created_at"],
        "updated_at": report.get("updated_at"),
        "status_history": [
            {
                "status": "submitted",
                "timestamp": report["created_at"],
                "note": "Report submitted successfully"
            }
        ]
    }


@router.get("/categories")
def get_report_categories(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of report categories and severity levels.
    """
    return {
        "categories": [
            {
                "id": "governance_feedback",
                "name": "Governance Feedback",
                "description": "Feedback on government performance and services"
            },
            {
                "id": "security_incident",
                "name": "Security Incident",
                "description": "Security-related incidents or concerns"
            },
            {
                "id": "community_issue",
                "name": "Community Issue",
                "description": "Local community problems or needs"
            },
            {
                "id": "campaign_update",
                "name": "Campaign Update",
                "description": "Updates from campaign activities"
            }
        ],
        "severity_levels": [
            {
                "id": "low",
                "name": "Low",
                "description": "Minor issue, no immediate action required",
                "color": "green"
            },
            {
                "id": "medium",
                "name": "Medium",
                "description": "Moderate issue, attention needed",
                "color": "amber"
            },
            {
                "id": "high",
                "name": "High",
                "description": "Serious issue, urgent attention required",
                "color": "orange"
            },
            {
                "id": "critical",
                "name": "Critical",
                "description": "Critical issue, immediate action required",
                "color": "red"
            }
        ]
    }


@router.get("/stats/my-activity")
def get_my_reporting_stats(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get reporting statistics for current user.
    """
    my_reports = [
        report for report in reports_db.values()
        if report["submitted_by"] == str(current_user.id)
        and report["tenant_id"] == current_user.tenant_id
    ]
    
    # Count by category
    by_category = {}
    by_severity = {}
    by_status = {}
    
    for report in my_reports:
        by_category[report["category"]] = by_category.get(report["category"], 0) + 1
        by_severity[report["severity"]] = by_severity.get(report["severity"], 0) + 1
        by_status[report["status"]] = by_status.get(report["status"], 0) + 1
    
    return {
        "total_reports": len(my_reports),
        "by_category": by_category,
        "by_severity": by_severity,
        "by_status": by_status,
        "this_month": len([r for r in my_reports if r["created_at"].startswith(datetime.utcnow().strftime("%Y-%m"))])
    }