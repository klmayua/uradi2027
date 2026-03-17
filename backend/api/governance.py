"""
Governance Mode API - Task 4.4
Citizen Service CRM, Security Coordination, Budget Tracking
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
from database import get_db
from models import (
    SentimentEntry, LGA, Ward, User, Tenant
)
from auth.utils import get_current_user

router = APIRouter(prefix="/api/governance", tags=["Governance Mode"])


# ==================== PYDANTIC MODELS ====================

class CitizenFeedbackCreate(BaseModel):
    category: str  # governance, security, economy, infrastructure, health, education
    sector: Optional[str] = None  # specific ministry/department
    message: str
    lga_id: Optional[str] = None
    ward_id: Optional[str] = None
    respondent_name: Optional[str] = None
    respondent_phone: Optional[str] = None
    urgency: str = "medium"  # low, medium, high, critical


class CitizenFeedbackResponse(BaseModel):
    id: str
    category: str
    sector: Optional[str]
    message: str
    status: str  # received, acknowledged, in_progress, resolved, closed
    lga_name: Optional[str]
    ward_name: Optional[str]
    created_at: str
    response_time_hours: Optional[float]


class FeedbackStatusUpdate(BaseModel):
    status: str  # acknowledged, in_progress, resolved, closed
    notes: Optional[str] = None
    assigned_to: Optional[str] = None  # User ID


class ResolutionDashboardResponse(BaseModel):
    total_feedback: int
    open_tickets: int
    avg_resolution_time_hours: float
    satisfaction_rate: float
    by_sector: List[Dict[str, Any]]
    by_lga: List[Dict[str, Any]]
    trend: str  # improving, stable, worsening


class SecurityIncidentMapResponse(BaseModel):
    incidents: List[Dict[str, Any]]
    clusters: List[Dict[str, Any]]
    heat_zones: List[Dict[str, Any]]
    time_range: str


class EarlyWarningAlert(BaseModel):
    alert_type: str
    severity: str
    message: str
    affected_lgas: List[str]
    triggered_at: str
    recommendation: str


class BudgetTrackerEntry(BaseModel):
    fiscal_year: str
    sector: str
    project_name: str
    budget_allocated: float
    budget_spent: float
    completion_percentage: float
    status: str  # not_started, in_progress, completed, stalled
    lga_id: Optional[str] = None


class PublicFeedbackStatusRequest(BaseModel):
    reference_number: str
    phone: Optional[str] = None


class PublicFeedbackStatusResponse(BaseModel):
    reference_number: str
    status: str
    category: str
    submitted_at: str
    last_updated: str
    estimated_resolution: Optional[str]
    public_update: Optional[str]


# ==================== CITIZEN SERVICE CRM ====================

@router.post("/feedback/submit", response_model=CitizenFeedbackResponse)
def submit_citizen_feedback(
    request: CitizenFeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit citizen feedback (can be done by field agents or citizens directly)
    """
    # Generate reference number
    ref_num = f"CF-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    
    feedback = SentimentEntry(
        id=uuid.uuid4(),
        tenant_id=current_user.tenant_id,
        source="citizen_feedback",
        lga_id=request.lga_id,
        ward_id=request.ward_id,
        raw_text=request.message,
        sentiment="pending",
        score=0,
        topics=[request.category, request.sector] if request.sector else [request.category],
        language="en",
        processed=False,
        # Additional metadata stored in a way that doesn't require model changes
        # In production, you'd have a dedicated citizen_feedback table
    )
    
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    
    # Get LGA/Ward names
    lga = db.query(LGA).filter(LGA.id == request.lga_id).first() if request.lga_id else None
    ward = db.query(Ward).filter(Ward.id == request.ward_id).first() if request.ward_id else None
    
    return CitizenFeedbackResponse(
        id=str(feedback.id),
        category=request.category,
        sector=request.sector,
        message=request.message,
        status="received",
        lga_name=lga.name if lga else None,
        ward_name=ward.name if ward else None,
        created_at=feedback.created_at.isoformat(),
        response_time_hours=None
    )


@router.get("/feedback/inbox")
def get_feedback_inbox(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    lga_id: Optional[str] = Query(None),
    assigned_to: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get citizen feedback inbox (ticketing interface)
    """
    query = db.query(SentimentEntry).filter(
        SentimentEntry.tenant_id == current_user.tenant_id,
        SentimentEntry.source == "citizen_feedback"
    )
    
    if status:
        query = query.filter(SentimentEntry.sentiment == status)
    if category:
        query = query.filter(SentimentEntry.topics.contains([category]))
    if lga_id:
        query = query.filter(SentimentEntry.lga_id == lga_id)
    if date_from:
        query = query.filter(SentimentEntry.created_at >= date_from)
    if date_to:
        query = query.filter(SentimentEntry.created_at <= date_to)
    
    total = query.count()
    entries = query.order_by(SentimentEntry.created_at.desc()).offset(offset).limit(limit).all()
    
    feedback_list = []
    for entry in entries:
        lga = db.query(LGA).filter(LGA.id == entry.lga_id).first() if entry.lga_id else None
        ward = db.query(Ward).filter(Ward.id == entry.ward_id).first() if entry.ward_id else None
        
        feedback_list.append({
            "id": str(entry.id),
            "category": entry.topics[0] if entry.topics else "general",
            "sector": entry.topics[1] if len(entry.topics) > 1 else None,
            "message": entry.raw_text[:200] + "..." if len(entry.raw_text) > 200 else entry.raw_text,
            "status": entry.sentiment if entry.sentiment != "pending" else "received",
            "lga_name": lga.name if lga else None,
            "ward_name": ward.name if ward else None,
            "created_at": entry.created_at.isoformat(),
            "full_message": entry.raw_text
        })
    
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "feedback": feedback_list
    }


@router.patch("/feedback/{feedback_id}/status")
def update_feedback_status(
    feedback_id: str,
    update: FeedbackStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update feedback status (acknowledge, assign, resolve, close)
    """
    feedback = db.query(SentimentEntry).filter(
        SentimentEntry.id == feedback_id,
        SentimentEntry.tenant_id == current_user.tenant_id
    ).first()
    
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    # Update status
    feedback.sentiment = update.status
    
    # In production, you'd track assignment, response times, etc.
    
    db.commit()
    
    return {
        "message": f"Feedback status updated to {update.status}",
        "feedback_id": feedback_id,
        "new_status": update.status,
        "notes": update.notes,
        "updated_at": datetime.utcnow().isoformat()
    }


@router.get("/feedback/dashboard", response_model=ResolutionDashboardResponse)
def get_resolution_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get resolution dashboard KPIs
    """
    # Get all feedback entries
    all_feedback = db.query(SentimentEntry).filter(
        SentimentEntry.tenant_id == current_user.tenant_id,
        SentimentEntry.source == "citizen_feedback"
    ).all()
    
    total = len(all_feedback)
    
    # Count by status
    open_count = sum(1 for f in all_feedback if f.sentiment not in ["resolved", "closed"])
    
    # Calculate average resolution time (simplified)
    resolved = [f for f in all_feedback if f.sentiment == "resolved"]
    avg_resolution_time = 48.0  # Placeholder
    
    # Satisfaction rate (placeholder)
    satisfaction = 0.75
    
    # By sector
    sector_counts = {}
    for f in all_feedback:
        sector = f.topics[1] if len(f.topics) > 1 else "general"
        if sector not in sector_counts:
            sector_counts[sector] = {"total": 0, "open": 0}
        sector_counts[sector]["total"] += 1
        if f.sentiment not in ["resolved", "closed"]:
            sector_counts[sector]["open"] += 1
    
    by_sector = [
        {"sector": s, "total": c["total"], "open": c["open"]}
        for s, c in sector_counts.items()
    ]
    by_sector.sort(key=lambda x: x["total"], reverse=True)
    
    # By LGA
    lga_counts = {}
    for f in all_feedback:
        if f.lga_id:
            if f.lga_id not in lga_counts:
                lga_counts[f.lga_id] = {"total": 0, "open": 0}
            lga_counts[f.lga_id]["total"] += 1
            if f.sentiment not in ["resolved", "closed"]:
                lga_counts[f.lga_id]["open"] += 1
    
    by_lga = []
    for lga_id, counts in lga_counts.items():
        lga = db.query(LGA).filter(LGA.id == lga_id).first()
        by_lga.append({
            "lga_id": str(lga_id),
            "lga_name": lga.name if lga else "Unknown",
            "total": counts["total"],
            "open": counts["open"]
        })
    by_lga.sort(key=lambda x: x["open"], reverse=True)
    
    return ResolutionDashboardResponse(
        total_feedback=total,
        open_tickets=open_count,
        avg_resolution_time_hours=avg_resolution_time,
        satisfaction_rate=satisfaction,
        by_sector=by_sector[:10],
        by_lga=by_lga[:10],
        trend="stable"
    )


@router.post("/feedback/public-status")
def get_public_feedback_status(
    request: PublicFeedbackStatusRequest,
    db: Session = Depends(get_db)
):
    """
    Public endpoint to check feedback status (anonymous)
    """
    # Find feedback by reference number
    # In production, you'd have a dedicated reference number field
    feedback = db.query(SentimentEntry).filter(
        SentimentEntry.id == request.reference_number.replace("CF-", "")
    ).first()
    
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    return PublicFeedbackStatusResponse(
        reference_number=request.reference_number,
        status=feedback.sentiment if feedback.sentiment != "pending" else "received",
        category=feedback.topics[0] if feedback.topics else "general",
        submitted_at=feedback.created_at.isoformat(),
        last_updated=feedback.created_at.isoformat(),
        estimated_resolution="3-5 business days",
        public_update="Your feedback has been received and is being reviewed by the relevant department."
    )


# ==================== SECURITY COORDINATION MODULE ====================

@router.get("/security/incident-map")
def get_security_incident_map(
    time_range: str = Query("7d"),  # 24h, 7d, 30d
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get security incidents for live map display
    """
    # Calculate time filter
    days = {"24h": 1, "7d": 7, "30d": 30}.get(time_range, 7)
    since = datetime.utcnow() - timedelta(days=days)
    
    # Get security-related sentiment entries
    query = db.query(SentimentEntry).filter(
        SentimentEntry.tenant_id == current_user.tenant_id,
        SentimentEntry.created_at >= since,
        SentimentEntry.topics.contains(["security"])
    )
    
    if category:
        query = query.filter(SentimentEntry.topics.contains([category]))
    
    incidents = query.all()
    
    # Format for map
    incident_list = []
    for incident in incidents:
        lga = db.query(LGA).filter(LGA.id == incident.lga_id).first() if incident.lga_id else None
        
        incident_list.append({
            "id": str(incident.id),
            "category": "security",
            "description": incident.raw_text[:100] + "..." if len(incident.raw_text) > 100 else incident.raw_text,
            "lga_id": str(incident.lga_id) if incident.lga_id else None,
            "lga_name": lga.name if lga else "Unknown",
            "severity": "high" if incident.score < -50 else "medium" if incident.score < 0 else "low",
            "reported_at": incident.created_at.isoformat(),
            "lat": None,  # Would come from location data
            "lng": None
        })
    
    # Generate clusters (simplified)
    clusters = []
    lga_groups = {}
    for inc in incident_list:
        lga = inc["lga_id"]
        if lga not in lga_groups:
            lga_groups[lga] = []
        lga_groups[lga].append(inc)
    
    for lga_id, group in lga_groups.items():
        if len(group) >= 3:
            clusters.append({
                "lga_id": lga_id,
                "incident_count": len(group),
                "center_lat": None,
                "center_lng": None
            })
    
    # Heat zones (LGAs with high incident density)
    heat_zones = [
        {"lga_id": lga, "intensity": len(group)}
        for lga, group in lga_groups.items()
        if len(group) >= 5
    ]
    heat_zones.sort(key=lambda x: x["intensity"], reverse=True)
    
    return SecurityIncidentMapResponse(
        incidents=incident_list,
        clusters=clusters,
        heat_zones=heat_zones[:5],
        time_range=time_range
    )


@router.get("/security/pattern-analysis")
def get_security_pattern_analysis(
    lga_id: Optional[str] = Query(None),
    days: int = Query(30),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    AI-assisted security pattern analysis
    """
    since = datetime.utcnow() - timedelta(days=days)
    
    query = db.query(SentimentEntry).filter(
        SentimentEntry.tenant_id == current_user.tenant_id,
        SentimentEntry.created_at >= since,
        SentimentEntry.topics.contains(["security"])
    )
    
    if lga_id:
        query = query.filter(SentimentEntry.lga_id == lga_id)
    
    incidents = query.all()
    
    if not incidents:
        return {
            "message": "No security incidents found for the specified period",
            "period_days": days
        }
    
    # Category breakdown
    categories = {}
    for inc in incidents:
        for topic in inc.topics:
            if topic != "security":
                categories[topic] = categories.get(topic, 0) + 1
    
    # Time analysis (hour of day)
    hour_distribution = {}
    for inc in incidents:
        hour = inc.created_at.hour
        hour_distribution[hour] = hour_distribution.get(hour, 0) + 1
    
    peak_hours = sorted(hour_distribution.items(), key=lambda x: x[1], reverse=True)[:3]
    
    # Trend analysis
    recent = [inc for inc in incidents if inc.created_at >= datetime.utcnow() - timedelta(days=7)]
    previous = [inc for inc in incidents if inc.created_at < datetime.utcnow() - timedelta(days=7)]
    
    recent_rate = len(recent) / 7
    previous_rate = len(previous) / (days - 7) if days > 7 else recent_rate
    
    trend = "increasing" if recent_rate > previous_rate * 1.5 else \
            "decreasing" if recent_rate < previous_rate * 0.5 else "stable"
    
    # AI insights
    insights = []
    if recent_rate > previous_rate * 2:
        insights.append(f"Security incidents have increased by {((recent_rate/previous_rate - 1) * 100):.0f}% in the last week")
    
    top_category = max(categories.items(), key=lambda x: x[1]) if categories else ("none", 0)
    if top_category[1] > len(incidents) * 0.3:
        insights.append(f"{top_category[0].title()} represents {top_category[1]} of all security incidents")
    
    return {
        "total_incidents": len(incidents),
        "period_days": days,
        "trend": trend,
        "category_breakdown": categories,
        "peak_hours": [f"{h:02d}:00" for h, _ in peak_hours],
        "recent_rate_per_day": round(recent_rate, 2),
        "ai_insights": insights,
        "recommendations": [
            "Increase patrols during peak hours" if peak_hours else None,
            f"Focus on {top_category[0]} prevention" if top_category[0] != "none" else None
        ]
    }


@router.get("/security/early-warnings")
def get_early_warning_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get early warning alerts based on thresholds
    """
    alerts = []
    
    # Check for LGA-level spikes
    since = datetime.utcnow() - timedelta(days=7)
    
    lgas = db.query(LGA).filter(LGA.tenant_id == current_user.tenant_id).all()
    
    for lga in lgas:
        # Current week
        current = db.query(SentimentEntry).filter(
            SentimentEntry.tenant_id == current_user.tenant_id,
            SentimentEntry.lga_id == lga.id,
            SentimentEntry.created_at >= since,
            SentimentEntry.topics.contains(["security"])
        ).count()
        
        # Previous week
        prev_since = datetime.utcnow() - timedelta(days=14)
        prev_until = datetime.utcnow() - timedelta(days=7)
        previous = db.query(SentimentEntry).filter(
            SentimentEntry.tenant_id == current_user.tenant_id,
            SentimentEntry.lga_id == lga.id,
            SentimentEntry.created_at >= prev_since,
            SentimentEntry.created_at < prev_until,
            SentimentEntry.topics.contains(["security"])
        ).count()
        
        # Alert if 2x increase
        if previous > 0 and current >= previous * 2:
            alerts.append({
                "alert_type": "incident_spike",
                "severity": "high" if current >= previous * 3 else "medium",
                "message": f"Security incidents in {lga.name} increased from {previous} to {current} in the past week",
                "affected_lgas": [lga.name],
                "triggered_at": datetime.utcnow().isoformat(),
                "recommendation": f"Deploy additional security resources to {lga.name} immediately"
            })
    
    # Check for sentiment-based alerts
    negative_sentiment = db.query(SentimentEntry).filter(
        SentimentEntry.tenant_id == current_user.tenant_id,
        SentimentEntry.created_at >= since,
        SentimentEntry.score < -70,
        SentimentEntry.topics.contains(["security"])
    ).count()
    
    if negative_sentiment > 10:
        alerts.append({
            "alert_type": "sentiment_crisis",
            "severity": "critical",
            "message": f"{negative_sentiment} highly negative security-related reports in the past week",
            "affected_lgas": ["Multiple"],
            "triggered_at": datetime.utcnow().isoformat(),
            "recommendation": "Convene emergency security meeting and prepare public communication"
        })
    
    return {
        "alert_count": len(alerts),
        "alerts": alerts
    }


# ==================== BUDGET TRACKER ====================

@router.get("/budget/tracker")
def get_budget_tracker(
    fiscal_year: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    lga_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get budget tracking data for governance mode
    """
    # In production, this would query a dedicated budget_items table
    # For now, return placeholder data structure
    
    current_year = fiscal_year or datetime.utcnow().strftime("%Y")
    
    # Mock budget data
    sectors = ["Education", "Health", "Infrastructure", "Agriculture", "Security"]
    
    budget_data = []
    for sec in sectors:
        allocated = 1000000 + hash(sec) % 5000000  # Mock allocation
        spent = allocated * (0.3 + (hash(sec + current_year) % 50) / 100)  # Mock spending
        
        budget_data.append({
            "sector": sec,
            "fiscal_year": current_year,
            "budget_allocated": allocated,
            "budget_spent": spent,
            "budget_remaining": allocated - spent,
            "utilization_rate": round((spent / allocated) * 100, 2),
            "status": "on_track" if spent < allocated * 0.8 else "overspending" if spent > allocated else "critical"
        })
    
    # Summary
    total_allocated = sum(b["budget_allocated"] for b in budget_data)
    total_spent = sum(b["budget_spent"] for b in budget_data)
    
    return {
        "fiscal_year": current_year,
        "summary": {
            "total_allocated": total_allocated,
            "total_spent": total_spent,
            "total_remaining": total_allocated - total_spent,
            "overall_utilization": round((total_spent / total_allocated) * 100, 2)
        },
        "sector_breakdown": budget_data,
        "lga_breakdown": []  # Would include LGA-specific data
    }


@router.get("/budget/projects")
def get_budget_projects(
    status: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get list of budget projects with status
    """
    # Mock project data
    projects = [
        {
            "id": f"PRJ-{i:03d}",
            "name": f"{sector or 'Development'} Project {i}",
            "sector": sector or ["Education", "Health", "Infrastructure"][i % 3],
            "budget_allocated": 500000 + (i * 100000),
            "budget_spent": 200000 + (i * 50000),
            "completion_percentage": 20 + (i * 10),
            "status": ["not_started", "in_progress", "completed", "stalled"][i % 4],
            "lga": f"LGA {i % 27 + 1}"
        }
        for i in range(1, 11)
    ]
    
    if status:
        projects = [p for p in projects if p["status"] == status]
    
    return {
        "total": len(projects),
        "projects": projects
    }


# ==================== GOVERNANCE MODE STATUS ====================

@router.get("/status")
def get_governance_mode_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get overall governance mode status
    """
    # Check if tenant is in governance mode
    tenant = db.query(Tenant).filter(Tenant.id == current_user.tenant_id).first()
    
    # Count active feedback
    active_feedback = db.query(SentimentEntry).filter(
        SentimentEntry.tenant_id == current_user.tenant_id,
        SentimentEntry.source == "citizen_feedback",
        SentimentEntry.sentiment.notin_(["resolved", "closed"])
    ).count()
    
    # Count security incidents
    security_incidents = db.query(SentimentEntry).filter(
        SentimentEntry.tenant_id == current_user.tenant_id,
        SentimentEntry.created_at >= datetime.utcnow() - timedelta(days=7),
        SentimentEntry.topics.contains(["security"])
    ).count()
    
    return {
        "governance_mode_active": True,  # Would check tenant config
        "tenant": tenant.display_name if tenant else current_user.tenant_id,
        "metrics": {
            "active_feedback_tickets": active_feedback,
            "security_incidents_7d": security_incidents,
            "avg_resolution_time_hours": 48.0,
            "citizen_satisfaction": 0.75
        },
        "modules": {
            "citizen_service_crm": "active",
            "security_coordination": "active",
            "budget_tracker": "active"
        },
        "last_updated": datetime.utcnow().isoformat()
    }


@router.post("/activate")
def activate_governance_mode(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Activate governance mode (post-election)
    """
    # In production, this would update tenant configuration
    return {
        "message": "Governance mode activated",
        "activated_at": datetime.utcnow().isoformat(),
        "activated_by": str(current_user.id),
        "modules_enabled": [
            "citizen_service_crm",
            "security_coordination",
            "budget_tracker",
            "public_feedback_portal"
        ]
    }
