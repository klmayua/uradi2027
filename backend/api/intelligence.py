"""
Intelligence Reports API - Task 2.7
Intelligence Report System Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from models import IntelligenceReport
from auth.utils import get_current_user
import uuid
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/intelligence", tags=["Intelligence Reports"])


# Pydantic Models
class IntelligenceReportCreate(BaseModel):
    report_type: str  # weekly_brief, scenario_analysis, opposition_report, crisis_alert, political_atlas
    title: str
    summary: Optional[str] = None
    body: str
    classification: str = "confidential"  # public, internal, confidential, eyes_only
    lga_id: Optional[str] = None
    tags: Optional[List[str]] = None


class IntelligenceReportUpdate(BaseModel):
    report_type: Optional[str] = None
    title: Optional[str] = None
    summary: Optional[str] = None
    body: Optional[str] = None
    classification: Optional[str] = None
    lga_id: Optional[str] = None
    tags: Optional[List[str]] = None


class IntelligenceReportResponse(BaseModel):
    id: str
    tenant_id: str
    report_type: str
    title: str
    summary: Optional[str]
    body: str
    classification: str
    lga_id: Optional[str]
    tags: Optional[List[str]]
    attachments: Optional[List[str]]
    created_by: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


def convert_report_to_response(report: IntelligenceReport) -> IntelligenceReportResponse:
    """Convert IntelligenceReport model to response schema"""
    return IntelligenceReportResponse(
        id=str(report.id),
        tenant_id=report.tenant_id,
        report_type=report.report_type,
        title=report.title,
        summary=report.summary,
        body=report.body,
        classification=report.classification,
        lga_id=report.lga_id,
        tags=report.tags,
        attachments=report.attachments,
        created_by=str(report.created_by) if report.created_by else None,
        created_at=report.created_at.isoformat() if report.created_at else None
    )


@router.get("/reports", response_model=List[IntelligenceReportResponse])
def list_intelligence_reports(
    report_type: Optional[str] = Query(None, description="Filter by report type"),
    classification: Optional[str] = Query(None, description="Filter by classification"),
    lga_id: Optional[str] = Query(None, description="Filter by LGA"),
    days: int = Query(30, ge=1, le=365, description="Reports from last N days"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all intelligence reports with optional filtering.
    """
    from_date = datetime.utcnow() - timedelta(days=days)
    
    query = db.query(IntelligenceReport).filter(
        IntelligenceReport.tenant_id == current_user.tenant_id,
        IntelligenceReport.created_at >= from_date
    )
    
    if report_type:
        query = query.filter(IntelligenceReport.report_type == report_type)
    if classification:
        query = query.filter(IntelligenceReport.classification == classification)
    if lga_id:
        query = query.filter(IntelligenceReport.lga_id == lga_id)
    
    reports = query.order_by(IntelligenceReport.created_at.desc()).all()
    return [convert_report_to_response(report) for report in reports]


@router.get("/reports/{report_id}", response_model=IntelligenceReportResponse)
def get_intelligence_report(
    report_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific intelligence report by ID"""
    report = db.query(IntelligenceReport).filter(
        IntelligenceReport.id == report_id,
        IntelligenceReport.tenant_id == current_user.tenant_id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intelligence report not found"
        )
    
    return convert_report_to_response(report)


@router.post("/reports", response_model=IntelligenceReportResponse, status_code=status.HTTP_201_CREATED)
def create_intelligence_report(
    report: IntelligenceReportCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new intelligence report"""
    db_report = IntelligenceReport(
        id=uuid.uuid4(),
        tenant_id=current_user.tenant_id,
        report_type=report.report_type,
        title=report.title,
        summary=report.summary,
        body=report.body,
        classification=report.classification,
        lga_id=report.lga_id,
        tags=report.tags or [],
        attachments=[],
        created_by=current_user.id
    )
    
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    return convert_report_to_response(db_report)


@router.patch("/reports/{report_id}", response_model=IntelligenceReportResponse)
def update_intelligence_report(
    report_id: str,
    report_update: IntelligenceReportUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing intelligence report"""
    report = db.query(IntelligenceReport).filter(
        IntelligenceReport.id == report_id,
        IntelligenceReport.tenant_id == current_user.tenant_id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intelligence report not found"
        )
    
    # Update fields if provided
    update_data = report_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(report, field, value)
    
    db.commit()
    db.refresh(report)
    
    return convert_report_to_response(report)


@router.delete("/reports/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_intelligence_report(
    report_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an intelligence report"""
    report = db.query(IntelligenceReport).filter(
        IntelligenceReport.id == report_id,
        IntelligenceReport.tenant_id == current_user.tenant_id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intelligence report not found"
        )
    
    db.delete(report)
    db.commit()
    
    return None


@router.post("/reports/{report_id}/attachments")
def add_report_attachment(
    report_id: str,
    attachment_url: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add an attachment to an intelligence report"""
    report = db.query(IntelligenceReport).filter(
        IntelligenceReport.id == report_id,
        IntelligenceReport.tenant_id == current_user.tenant_id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intelligence report not found"
        )
    
    if not report.attachments:
        report.attachments = []
    
    report.attachments.append(attachment_url)
    db.commit()
    db.refresh(report)
    
    return convert_report_to_response(report)


@router.get("/reports/weekly-brief/template")
def get_weekly_brief_template(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get weekly brief template with pre-structured sections.
    Auto-populates with current platform data.
    """
    # Get recent data for auto-population
    from sqlalchemy import func
    from models import SentimentEntry, PoliticalActor
    
    # Sentiment changes (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_sentiment = db.query(SentimentEntry).filter(
        SentimentEntry.tenant_id == current_user.tenant_id,
        SentimentEntry.created_at >= week_ago
    ).count()
    
    # Opposition activity
    opposition_activity = db.query(PoliticalActor).filter(
        PoliticalActor.tenant_id == current_user.tenant_id,
        PoliticalActor.loyalty == "opposed"
    ).count()
    
    template = {
        "title": f"Weekly Intelligence Brief - {datetime.utcnow().strftime('%B %d, %Y')}",
        "report_type": "weekly_brief",
        "classification": "confidential",
        "sections": {
            "executive_summary": {
                "label": "Executive Summary",
                "placeholder": "Key findings and recommendations...",
                "auto_populate": False
            },
            "sentiment_changes": {
                "label": "Sentiment Changes",
                "placeholder": "Analysis of sentiment shifts...",
                "auto_populate": True,
                "data": f"{recent_sentiment} new sentiment entries in past 7 days"
            },
            "opposition_moves": {
                "label": "Opposition Activity",
                "placeholder": "Opposition party activities and strategies...",
                "auto_populate": True,
                "data": f"{opposition_activity} opposition actors tracked"
            },
            "coalition_status": {
                "label": "Coalition Status",
                "placeholder": "Alliance health and partner updates...",
                "auto_populate": False
            },
            "recommendations": {
                "label": "Strategic Recommendations",
                "placeholder": "Action items and strategic guidance...",
                "auto_populate": False
            }
        }
    }
    
    return template


@router.get("/reports/stats/overview")
def get_intelligence_stats(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get intelligence report statistics.
    """
    from sqlalchemy import func
    
    # Total reports
    total_reports = db.query(IntelligenceReport).filter(
        IntelligenceReport.tenant_id == current_user.tenant_id
    ).count()
    
    # By type
    type_counts = db.query(
        IntelligenceReport.report_type,
        func.count(IntelligenceReport.id)
    ).filter(
        IntelligenceReport.tenant_id == current_user.tenant_id
    ).group_by(IntelligenceReport.report_type).all()
    
    # By classification
    classification_counts = db.query(
        IntelligenceReport.classification,
        func.count(IntelligenceReport.id)
    ).filter(
        IntelligenceReport.tenant_id == current_user.tenant_id
    ).group_by(IntelligenceReport.classification).all()
    
    # Recent reports (last 30 days)
    month_ago = datetime.utcnow() - timedelta(days=30)
    recent_count = db.query(IntelligenceReport).filter(
        IntelligenceReport.tenant_id == current_user.tenant_id,
        IntelligenceReport.created_at >= month_ago
    ).count()
    
    return {
        "total_reports": total_reports,
        "recent_reports_30d": recent_count,
        "by_type": {t: c for t, c in type_counts},
        "by_classification": {c: n for c, n in classification_counts}
    }


@router.get("/reports/search")
def search_intelligence_reports(
    query: str = Query(..., description="Search query"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search intelligence reports by title, summary, or body content.
    """
    search_filter = f"%{query}%"
    
    reports = db.query(IntelligenceReport).filter(
        IntelligenceReport.tenant_id == current_user.tenant_id,
        (
            IntelligenceReport.title.ilike(search_filter) |
            IntelligenceReport.summary.ilike(search_filter) |
            IntelligenceReport.body.ilike(search_filter)
        )
    ).order_by(IntelligenceReport.created_at.desc()).limit(20).all()
    
    return {
        "query": query,
        "total_results": len(reports),
        "reports": [convert_report_to_response(r) for r in reports]
    }