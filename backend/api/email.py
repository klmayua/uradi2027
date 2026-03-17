"""
Email API Endpoints
SendGrid email integration for notifications and reports
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from auth.utils import get_current_user
from services.email_service import email_service

router = APIRouter(prefix="/api/email", tags=["Email"])


# Pydantic Models
class SendEmailRequest(BaseModel):
    to_email: str
    subject: str
    content: str
    content_type: str = "text/html"


class SendBulkEmailRequest(BaseModel):
    to_emails: List[str]
    subject: str
    content: str
    content_type: str = "text/html"


class SendAlertRequest(BaseModel):
    to_emails: List[str]
    alert_type: str
    message: str
    severity: str = "medium"


class WeeklyReportRequest(BaseModel):
    to_email: str
    period: str
    overall_sentiment: float
    sentiment_trend: str
    total_contacts: int
    active_agents: int
    incidents: int
    top_lgas: List[str]
    alerts: List[dict]


# API Endpoints
@router.post("/send")
def send_email(
    request: SendEmailRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Send a single email"""
    if not email_service.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Email service not configured. Set SENDGRID_API_KEY environment variable."
        )
    
    result = email_service.send_email(
        to_email=request.to_email,
        subject=request.subject,
        content=request.content,
        content_type=request.content_type
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to send email")
        )
    
    return result


@router.post("/send-bulk")
def send_bulk_email(
    request: SendBulkEmailRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Send email to multiple recipients"""
    if not email_service.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Email service not configured"
        )
    
    result = email_service.send_bulk_email(
        to_emails=request.to_emails,
        subject=request.subject,
        content=request.content,
        content_type=request.content_type
    )
    
    return result


@router.post("/send-alert")
def send_alert(
    request: SendAlertRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Send alert notification"""
    if not email_service.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Email service not configured"
        )
    
    result = email_service.send_alert(
        to_emails=request.to_emails,
        alert_type=request.alert_type,
        message=request.message,
        severity=request.severity
    )
    
    return result


@router.post("/send-weekly-report")
def send_weekly_report(
    request: WeeklyReportRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Send weekly report email"""
    if not email_service.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Email service not configured"
        )
    
    report_data = {
        "period": request.period,
        "overall_sentiment": request.overall_sentiment,
        "sentiment_trend": request.sentiment_trend,
        "total_contacts": request.total_contacts,
        "active_agents": request.active_agents,
        "incidents": request.incidents,
        "top_lgas": request.top_lgas,
        "alerts": request.alerts
    }
    
    result = email_service.send_weekly_report(
        to_email=request.to_email,
        report_data=report_data
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("error", "Failed to send report")
        )
    
    return result


@router.get("/status")
def get_email_status():
    """Check if email service is configured"""
    return {
        "configured": email_service.is_configured(),
        "from_email": email_service.from_email if email_service.is_configured() else None,
        "from_name": email_service.from_name if email_service.is_configured() else None
    }
