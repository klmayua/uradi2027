"""
Rapid Response System API - Task 4.6
Incident logging, AI-assisted response builder, response analytics
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
from database import get_db
from models import (
    SentimentEntry, ContentItem, MessageLog, User
)
from auth.utils import get_current_user

router = APIRouter(prefix="/api/rapid-response", tags=["Rapid Response"])


# ==================== PYDANTIC MODELS ====================

class RapidResponseIncidentCreate(BaseModel):
    title: str
    description: str
    incident_type: str  # attack, misinformation, crisis, opportunity
    severity: str  # low, medium, high, critical
    source: str  # social_media, news, field_report, intelligence
    target_audience: Optional[List[str]] = None  # LGAs or segments
    related_lgas: Optional[List[str]] = None


class RapidResponseIncidentResponse(BaseModel):
    id: str
    title: str
    description: str
    incident_type: str
    severity: str
    status: str  # detected, analyzing, drafting, approved, deployed, closed
    created_at: str
    response_time_seconds: Optional[float] = None


class AIResponseSuggestionRequest(BaseModel):
    incident_id: str
    tone: str = "factual"  # factual, empathetic, assertive
    channels: List[str] = ["sms", "whatsapp", "social"]


class AIResponseSuggestion(BaseModel):
    channel: str
    message: str
    estimated_impact: str  # high, medium, low
    tone_analysis: str


class ResponseDeployRequest(BaseModel):
    incident_id: str
    message: str
    channel: str  # sms, whatsapp, social_media, all
    target_segments: Optional[List[str]] = None
    target_lgas: Optional[List[str]] = None


class ResponseAnalytics(BaseModel):
    total_incidents: int
    avg_response_time_minutes: float
    incidents_by_type: Dict[str, int]
    incidents_by_severity: Dict[str, int]
    response_time_trend: str  # improving, stable, worsening
    top_attack_vectors: List[Dict[str, Any]]
    effectiveness_metrics: Dict[str, Any]


class IncidentTimelineEntry(BaseModel):
    timestamp: str
    event: str
    actor: str
    details: Optional[str] = None


# ==================== RAPID RESPONSE SYSTEM ====================

# In-memory storage for rapid response incidents (in production, use database table)
rapid_response_incidents = {}


def generate_ai_response_suggestions(description: str, tone: str, channels: List[str]) -> List[Dict[str, Any]]:
    """
    AI-assisted response generation
    In production, this would call Kimi/Ollama API
    """
    suggestions = []
    
    for channel in channels:
        if channel == "sms":
            if tone == "factual":
                message = f"FACT CHECK: Recent claims are inaccurate. Our position remains clear and unchanged. For verified information, contact our office."
            elif tone == "empathetic":
                message = f"We understand concerns raised. We are listening and working to address these issues. Your voice matters to us."
            else:  # assertive
                message = f"FALSE: The recent allegations are baseless and politically motivated. We stand by our record and reject these smears."
            
            suggestions.append({
                "channel": "sms",
                "message": message[:160],  # SMS limit
                "estimated_impact": "high" if tone == "factual" else "medium",
                "tone_analysis": tone
            })
        
        elif channel == "whatsapp":
            if tone == "factual":
                message = f"📢 *Official Statement*\n\nWe have noted recent developments. Here are the facts:\n\n✓ Our position remains consistent\n✓ We are committed to transparency\n✓ Verified information available on request\n\nFor questions, reply to this message."
            elif tone == "empathetic":
                message = f"💬 *We Hear You*\n\nWe understand the concerns being raised by our community. We want you to know:\n\n• We are listening\n• Your feedback matters\n• We are taking action\n\nThank you for your patience and trust."
            else:
                message = f"⚠️ *Response to False Allegations*\n\nRecent attacks against our campaign are:\n\n❌ Completely unfounded\n❌ Politically motivated\n❌ Contradicted by facts\n\nWe will not be distracted from serving the people."
            
            suggestions.append({
                "channel": "whatsapp",
                "message": message,
                "estimated_impact": "high",
                "tone_analysis": tone
            })
        
        elif channel == "social":
            if tone == "factual":
                message = f"🧵 Thread: Addressing recent claims with facts and context. (1/5)\n\nThere's been misinformation circulating. Let's set the record straight with verified information. 👇"
            elif tone == "empathetic":
                message = f"We hear you. 💙\n\nTo everyone who has raised concerns: we are listening. Your voices shape our priorities. Here's what we're doing..."
            else:
                message = f"🚨 FACT CHECK: False claims debunked\n\nThe smear campaign continues, but facts are stubborn. Here's the truth they don't want you to see..."
            
            suggestions.append({
                "channel": "social",
                "message": message,
                "estimated_impact": "high" if tone in ["assertive", "factual"] else "medium",
                "tone_analysis": tone
            })
    
    return suggestions


@router.post("/incidents", response_model=RapidResponseIncidentResponse)
def create_rapid_response_incident(
    request: RapidResponseIncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new rapid response incident
    Timer starts automatically
    """
    incident_id = str(uuid.uuid4())
    
    incident = {
        "id": incident_id,
        "tenant_id": current_user.tenant_id,
        "title": request.title,
        "description": request.description,
        "incident_type": request.incident_type,
        "severity": request.severity,
        "source": request.source,
        "target_audience": request.target_audience or [],
        "related_lgas": request.related_lgas or [],
        "status": "detected",
        "created_at": datetime.utcnow(),
        "created_by": str(current_user.id),
        "timeline": [
            {
                "timestamp": datetime.utcnow().isoformat(),
                "event": "Incident detected",
                "actor": current_user.full_name,
                "details": f"Severity: {request.severity}, Source: {request.source}"
            }
        ],
        "response_time_seconds": None,
        "deployed_at": None,
        "message_sent": None,
        "channel_used": None
    }
    
    rapid_response_incidents[incident_id] = incident
    
    return RapidResponseIncidentResponse(
        id=incident_id,
        title=request.title,
        description=request.description,
        incident_type=request.incident_type,
        severity=request.severity,
        status="detected",
        created_at=incident["created_at"].isoformat(),
        response_time_seconds=None
    )


@router.get("/incidents")
def get_rapid_response_incidents(
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    incident_type: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get rapid response incident log
    """
    incidents = [
        inc for inc in rapid_response_incidents.values()
        if inc["tenant_id"] == current_user.tenant_id
    ]
    
    if status:
        incidents = [inc for inc in incidents if inc["status"] == status]
    if severity:
        incidents = [inc for inc in incidents if inc["severity"] == severity]
    if incident_type:
        incidents = [inc for inc in incidents if inc["incident_type"] == incident_type]
    
    # Sort by created_at desc
    incidents.sort(key=lambda x: x["created_at"], reverse=True)
    
    return {
        "total": len(incidents),
        "incidents": [
            {
                "id": inc["id"],
                "title": inc["title"],
                "incident_type": inc["incident_type"],
                "severity": inc["severity"],
                "status": inc["status"],
                "created_at": inc["created_at"].isoformat(),
                "response_time_minutes": round(inc["response_time_seconds"] / 60, 2) if inc["response_time_seconds"] else None
            }
            for inc in incidents[:limit]
        ]
    }


@router.get("/incidents/{incident_id}")
def get_incident_details(
    incident_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed incident information with timeline
    """
    incident = rapid_response_incidents.get(incident_id)
    
    if not incident or incident["tenant_id"] != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    return {
        "id": incident["id"],
        "title": incident["title"],
        "description": incident["description"],
        "incident_type": incident["incident_type"],
        "severity": incident["severity"],
        "source": incident["source"],
        "status": incident["status"],
        "target_audience": incident["target_audience"],
        "related_lgas": incident["related_lgas"],
        "created_at": incident["created_at"].isoformat(),
        "created_by": incident["created_by"],
        "response_time_seconds": incident["response_time_seconds"],
        "timeline": incident["timeline"]
    }


@router.post("/incidents/{incident_id}/ai-suggestions")
def get_ai_response_suggestions(
    incident_id: str,
    request: AIResponseSuggestionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get AI-assisted response suggestions
    """
    incident = rapid_response_incidents.get(incident_id)
    
    if not incident or incident["tenant_id"] != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Update status
    incident["status"] = "analyzing"
    incident["timeline"].append({
        "timestamp": datetime.utcnow().isoformat(),
        "event": "AI analysis started",
        "actor": "AI Agent",
        "details": f"Tone: {request.tone}, Channels: {', '.join(request.channels)}"
    })
    
    # Generate suggestions
    suggestions = generate_ai_response_suggestions(
        incident["description"],
        request.tone,
        request.channels
    )
    
    return {
        "incident_id": incident_id,
        "suggestions": suggestions,
        "generated_at": datetime.utcnow().isoformat()
    }


@router.post("/incidents/{incident_id}/deploy")
def deploy_response(
    incident_id: str,
    request: ResponseDeployRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Deploy response to selected channels
    Timer stops when response is deployed
    """
    incident = rapid_response_incidents.get(incident_id)
    
    if not incident or incident["tenant_id"] != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Calculate response time
    deployed_at = datetime.utcnow()
    response_time = (deployed_at - incident["created_at"]).total_seconds()
    
    # Update incident
    incident["status"] = "deployed"
    incident["deployed_at"] = deployed_at
    incident["response_time_seconds"] = response_time
    incident["message_sent"] = request.message
    incident["channel_used"] = request.channel
    incident["timeline"].append({
        "timestamp": deployed_at.isoformat(),
        "event": "Response deployed",
        "actor": current_user.full_name,
        "details": f"Channel: {request.channel}, Message length: {len(request.message)} chars"
    })
    
    # Log message (in production, actually send via appropriate channel)
    message_log = MessageLog(
        id=uuid.uuid4(),
        tenant_id=current_user.tenant_id,
        channel=request.channel,
        template_name="rapid_response",
        recipients_count=0,  # Would calculate based on target
        sent_by=current_user.id,
        sent_at=deployed_at
    )
    db.add(message_log)
    db.commit()
    
    return {
        "message": "Response deployed successfully",
        "incident_id": incident_id,
        "response_time_seconds": response_time,
        "response_time_minutes": round(response_time / 60, 2),
        "channel": request.channel,
        "deployed_at": deployed_at.isoformat()
    }


@router.post("/incidents/{incident_id}/close")
def close_incident(
    incident_id: str,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Close a rapid response incident
    """
    incident = rapid_response_incidents.get(incident_id)
    
    if not incident or incident["tenant_id"] != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    incident["status"] = "closed"
    incident["timeline"].append({
        "timestamp": datetime.utcnow().isoformat(),
        "event": "Incident closed",
        "actor": current_user.full_name,
        "details": notes or "No additional notes"
    })
    
    return {
        "message": "Incident closed",
        "incident_id": incident_id,
        "closed_at": datetime.utcnow().isoformat(),
        "total_response_time_minutes": round(incident["response_time_seconds"] / 60, 2) if incident["response_time_seconds"] else None
    }


@router.get("/analytics")
def get_response_analytics(
    days: int = Query(30),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get rapid response analytics
    """
    since = datetime.utcnow() - timedelta(days=days)
    
    incidents = [
        inc for inc in rapid_response_incidents.values()
        if inc["tenant_id"] == current_user.tenant_id and inc["created_at"] >= since
    ]
    
    if not incidents:
        return {
            "message": "No incidents in the specified period",
            "period_days": days
        }
    
    total = len(incidents)
    
    # Calculate average response time
    responded = [inc for inc in incidents if inc["response_time_seconds"]]
    avg_response_time = sum(inc["response_time_seconds"] for inc in responded) / len(responded) if responded else 0
    
    # By type
    by_type = {}
    for inc in incidents:
        by_type[inc["incident_type"]] = by_type.get(inc["incident_type"], 0) + 1
    
    # By severity
    by_severity = {}
    for inc in incidents:
        by_severity[inc["severity"]] = by_severity.get(inc["severity"], 0) + 1
    
    # Trend analysis
    recent = [inc for inc in incidents if inc["created_at"] >= datetime.utcnow() - timedelta(days=7)]
    previous = [inc for inc in incidents if inc["created_at"] < datetime.utcnow() - timedelta(days=7)]
    
    recent_avg = sum(inc["response_time_seconds"] or 0 for inc in recent) / len(recent) if recent else 0
    prev_avg = sum(inc["response_time_seconds"] or 0 for inc in previous) / len(previous) if previous else 0
    
    trend = "improving" if recent_avg < prev_avg * 0.8 else \
            "worsening" if recent_avg > prev_avg * 1.2 else "stable"
    
    # Top attack vectors
    top_types = sorted(by_type.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return ResponseAnalytics(
        total_incidents=total,
        avg_response_time_minutes=round(avg_response_time / 60, 2),
        incidents_by_type=by_type,
        incidents_by_severity=by_severity,
        response_time_trend=trend,
        top_attack_vectors=[
            {"type": t, "count": c, "percentage": round(c/total*100, 1)}
            for t, c in top_types
        ],
        effectiveness_metrics={
            "deployment_rate": round(len(responded) / total * 100, 1) if total > 0 else 0,
            "avg_response_time_trend": trend,
            "critical_incidents": by_severity.get("critical", 0)
        }
    )


@router.get("/dashboard")
def get_rapid_response_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get rapid response dashboard summary
    """
    # Active incidents (not closed)
    active = [
        inc for inc in rapid_response_incidents.values()
        if inc["tenant_id"] == current_user.tenant_id and inc["status"] != "closed"
    ]
    
    # Critical incidents
    critical = [inc for inc in active if inc["severity"] == "critical"]
    
    # Today's incidents
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_incidents = [
        inc for inc in rapid_response_incidents.values()
        if inc["tenant_id"] == current_user.tenant_id and inc["created_at"] >= today
    ]
    
    return {
        "active_incidents": len(active),
        "critical_incidents": len(critical),
        "today_incidents": len(today_incidents),
        "avg_response_time_today_minutes": None,  # Would calculate
        "recent_incidents": [
            {
                "id": inc["id"],
                "title": inc["title"],
                "severity": inc["severity"],
                "status": inc["status"],
                "created_at": inc["created_at"].isoformat()
            }
            for inc in sorted(active, key=lambda x: x["created_at"], reverse=True)[:5]
        ]
    }
