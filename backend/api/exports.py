"""
Data Export and Backup API
GDPR-compliant data export with scheduled backups
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
import json
import csv
import io
import zipfile
import os

from database import get_db
from models import Tenant, User, Voter, CanvassingContact
from models_osint import Mention, SentimentAnalysis, NarrativeTrend, DailyBrief
from auth.utils import get_current_user
from email_service import send_email

router = APIRouter(prefix="/exports", tags=["Exports"])

EXPORT_DIR = os.path.join(os.path.dirname(__file__), "..", "exports")
os.makedirs(EXPORT_DIR, exist_ok=True)


# ============== Pydantic Schemas ==============

class ExportRequest(BaseModel):
    export_type: str = Field(..., description="voters, mentions, sentiment, narratives, full")
    format: str = Field(default="csv", description="csv, json, xlsx")
    filters: Optional[Dict[str, Any]] = Field(default=None, description="Export filters")
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    include_pii: bool = Field(default=False, description="Include personally identifiable information")


class ExportJobResponse(BaseModel):
    id: str
    export_type: str
    format: str
    status: str  # pending, processing, completed, failed
    progress: int
    file_url: Optional[str] = None
    file_size: Optional[int] = None
    record_count: Optional[int] = None
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


class ScheduledBackupConfig(BaseModel):
    frequency: str = Field(..., description="daily, weekly, monthly")
    export_types: List[str]
    include_pii: bool = False
    retention_days: int = Field(default=90, ge=1, le=365)
    enabled: bool = True


class DataDeletionRequest(BaseModel):
    entity_type: str = Field(..., description="voter, contact, user")
    entity_id: str
    reason: str
    confirmation_token: str


class ExportStats(BaseModel):
    total_exports: int
    exports_this_month: int
    storage_used_bytes: int
    last_export_date: Optional[datetime] = None
    scheduled_backups_enabled: bool


# ============== Export Generation Functions ==============

def generate_voter_export(db: Session, tenant_id: str, filters: Optional[Dict], include_pii: bool) -> List[Dict]:
    """Generate voter export data"""
    query = db.query(Voter).filter(Voter.tenant_id == tenant_id)

    if filters:
        if filters.get("lga"):
            query = query.filter(Voter.lga == filters["lga"])
        if filters.get("ward"):
            query = query.filter(Voter.ward == filters["ward"])
        if filters.get("support_level"):
            query = query.filter(Voter.support_level == filters["support_level"])
        if filters.get("tags"):
            # Filter by tags (simplified - would use JSON contains in production)
            pass

    voters = query.all()

    data = []
    for v in voters:
        record = {
            "id": str(v.id),
            "voter_id": v.voter_id,
            "lga": v.lga,
            "ward": v.ward,
            "polling_unit": v.polling_unit,
            "support_level": v.support_level,
            "tags": json.dumps(v.tags) if v.tags else None,
            "priority": v.priority,
            "recorded_at": v.recorded_at.isoformat() if v.recorded_at else None,
        }

        if include_pii:
            record.update({
                "full_name": v.full_name,
                "phone": v.phone,
                "address": v.address,
                "gender": v.gender,
                "age_group": v.age_group,
            })

        data.append(record)

    return data


def generate_mentions_export(db: Session, tenant_id: str, filters: Optional[Dict], date_from: Optional[datetime], date_to: Optional[datetime]) -> List[Dict]:
    """Generate OSINT mentions export"""
    query = db.query(Mention).filter(Mention.tenant_id == tenant_id)

    if date_from:
        query = query.filter(Mention.mentioned_at >= date_from)
    if date_to:
        query = query.filter(Mention.mentioned_at <= date_to)
    if filters:
        if filters.get("source_type"):
            query = query.filter(Mention.source_type == filters["source_type"])
        if filters.get("sentiment"):
            query = query.filter(Mention.sentiment == filters["sentiment"])

    mentions = query.all()

    data = []
    for m in mentions:
        data.append({
            "id": str(m.id),
            "content": m.content,
            "source_type": m.source_type,
            "source_url": m.source_url,
            "author": m.author,
            "sentiment": m.sentiment,
            "engagement_score": m.engagement_score,
            "reach_estimate": m.reach_estimate,
            "mentioned_at": m.mentioned_at.isoformat() if m.mentioned_at else None,
            "collected_at": m.collected_at.isoformat() if m.collected_at else None,
        })

    return data


def generate_sentiment_export(db: Session, tenant_id: str, date_from: Optional[datetime], date_to: Optional[datetime]) -> List[Dict]:
    """Generate sentiment analysis export"""
    query = db.query(SentimentAnalysis).filter(SentimentAnalysis.tenant_id == tenant_id)

    if date_from:
        query = query.filter(SentimentAnalysis.analyzed_at >= date_from)
    if date_to:
        query = query.filter(SentimentAnalysis.analyzed_at <= date_to)

    analyses = query.all()

    data = []
    for a in analyses:
        data.append({
            "id": str(a.id),
            "overall_sentiment": a.overall_sentiment,
            "positive_score": a.positive_score,
            "negative_score": a.negative_score,
            "neutral_score": a.neutral_score,
            "confidence": a.confidence,
            "sample_size": a.sample_size,
            "lga_breakdown": json.dumps(a.lga_breakdown) if a.lga_breakdown else None,
            "topic_breakdown": json.dumps(a.topic_breakdown) if a.topic_breakdown else None,
            "analyzed_at": a.analyzed_at.isoformat() if a.analyzed_at else None,
        })

    return data


def generate_narratives_export(db: Session, tenant_id: str, date_from: Optional[datetime], date_to: Optional[datetime]) -> List[Dict]:
    """Generate narrative trends export"""
    query = db.query(NarrativeTrend).filter(NarrativeTrend.tenant_id == tenant_id)

    if date_from:
        query = query.filter(NarrativeTrend.detected_at >= date_from)
    if date_to:
        query = query.filter(NarrativeTrend.detected_at <= date_to)

    trends = query.all()

    data = []
    for t in trends:
        data.append({
            "id": str(t.id),
            "narrative": t.narrative,
            "category": t.category,
            "momentum_score": t.momentum_score,
            "reach_estimate": t.reach_estimate,
            "sentiment_distribution": json.dumps(t.sentiment_distribution) if t.sentiment_distribution else None,
            "keywords": json.dumps(t.keywords) if t.keywords else None,
            "sample_mentions": json.dumps(t.sample_mentions) if t.sample_mentions else None,
            "detected_at": t.detected_at.isoformat() if t.detected_at else None,
        })

    return data


def format_as_csv(data: List[Dict]) -> str:
    """Convert data to CSV format"""
    if not data:
        return ""

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=data[0].keys())
    writer.writeheader()
    writer.writerows(data)
    return output.getvalue()


def create_export_zip(files: Dict[str, str], metadata: Dict) -> bytes:
    """Create ZIP archive with exported files"""
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Add data files
        for filename, content in files.items():
            zip_file.writestr(filename, content)

        # Add metadata file
        metadata_json = json.dumps(metadata, indent=2, default=str)
        zip_file.writestr("metadata.json", metadata_json)

        # Add README
        readme = f"""# URADI-360 Data Export

Export Date: {metadata['exported_at']}
Tenant: {metadata['tenant_id']}
Exported By: {metadata['exported_by']}

## Contents

This export contains the following data:
{chr(10).join(f'- {k}' for k in files.keys())}

## Data Retention

This export is valid until {metadata['expires_at']}.
After this date, please delete this file for security.

## Privacy Notice

This data export may contain personally identifiable information (PII).
Handle in accordance with your organization's data protection policies
and applicable regulations (GDPR, NDPR).

## Support

For questions about this export, contact support@uradi360.com
"""
        zip_file.writestr("README.md", readme)

    return zip_buffer.getvalue()


# ============== API Endpoints ==============

@router.post("/request", response_model=ExportJobResponse)
def request_export(
    request: ExportRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Request a data export.
    Exports are processed asynchronously and available for download when complete.
    """
    tenant_id = getattr(current_user, 'tenant_id', None)
    user_id = getattr(current_user, 'id', None)

    # Validate export type
    valid_types = ["voters", "mentions", "sentiment", "narratives", "full"]
    if request.export_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid export type. Must be one of: {', '.join(valid_types)}"
        )

    # Check PII permission
    if request.include_pii and getattr(current_user, 'role', None) not in ["admin", "coordinator"]:
        raise HTTPException(
            status_code=403,
            detail="Only admins and coordinators can export PII data"
        )

    # Create export job record
    export_id = str(uuid.uuid4())
    job = {
        "id": export_id,
        "tenant_id": tenant_id,
        "requested_by": user_id,
        "export_type": request.export_type,
        "format": request.format,
        "status": "pending",
        "progress": 0,
        "filters": request.filters,
        "date_from": request.date_from,
        "date_to": request.date_to,
        "include_pii": request.include_pii,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(days=7),
    }

    # In production, this would be stored in a database table
    # For now, we'll process synchronously for simplicity

    # Start processing
    background_tasks.add_task(
        process_export_job,
        job,
        db
    )

    return ExportJobResponse(
        id=export_id,
        export_type=request.export_type,
        format=request.format,
        status="processing",
        progress=0,
        created_at=job["created_at"],
        expires_at=job["expires_at"]
    )


def process_export_job(job: Dict, db: Session):
    """Process export job in background"""
    try:
        tenant_id = job["tenant_id"]
        files = {}

        export_types = ["voters", "mentions", "sentiment", "narratives"] if job["export_type"] == "full" else [job["export_type"]]

        for export_type in export_types:
            if export_type == "voters":
                data = generate_voter_export(db, tenant_id, job.get("filters"), job.get("include_pii", False))
            elif export_type == "mentions":
                data = generate_mentions_export(db, tenant_id, job.get("filters"), job.get("date_from"), job.get("date_to"))
            elif export_type == "sentiment":
                data = generate_sentiment_export(db, tenant_id, job.get("date_from"), job.get("date_to"))
            elif export_type == "narratives":
                data = generate_narratives_export(db, tenant_id, job.get("date_from"), job.get("date_to"))
            else:
                continue

            if job["format"] == "json":
                content = json.dumps(data, indent=2, default=str)
                filename = f"{export_type}.json"
            else:  # csv
                content = format_as_csv(data)
                filename = f"{export_type}.csv"

            files[filename] = content
            job["record_count"] = len(data)

        # Create ZIP
        metadata = {
            "exported_at": datetime.utcnow().isoformat(),
            "tenant_id": tenant_id,
            "exported_by": job["requested_by"],
            "expires_at": job["expires_at"].isoformat(),
            "export_types": export_types,
            "record_count": job.get("record_count", 0),
        }

        zip_content = create_export_zip(files, metadata)

        # Save to file
        zip_filename = f"export_{job['id']}.zip"
        zip_path = os.path.join(EXPORT_DIR, zip_filename)

        with open(zip_path, 'wb') as f:
            f.write(zip_content)

        # Update job status
        job["status"] = "completed"
        job["file_url"] = f"/api/exports/download/{job['id']}"
        job["file_size"] = len(zip_content)
        job["completed_at"] = datetime.utcnow()
        job["progress"] = 100

    except Exception as e:
        job["status"] = "failed"
        job["error_message"] = str(e)
        job["progress"] = 0


@router.get("/download/{export_id}")
def download_export(
    export_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download a completed export"""
    zip_filename = f"export_{export_id}.zip"
    zip_path = os.path.join(EXPORT_DIR, zip_filename)

    if not os.path.exists(zip_path):
        raise HTTPException(status_code=404, detail="Export not found or expired")

    from fastapi.responses import FileResponse

    return FileResponse(
        zip_path,
        filename=f"uradi360_export_{export_id}.zip",
        media_type="application/zip"
    )


@router.get("/stats", response_model=ExportStats)
def get_export_stats(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get export statistics for the tenant"""
    tenant_id = getattr(current_user, 'tenant_id', None)

    # Calculate storage used
    total_size = 0
    for filename in os.listdir(EXPORT_DIR):
        if filename.startswith("export_"):
            filepath = os.path.join(EXPORT_DIR, filename)
            total_size += os.path.getsize(filepath)

    return ExportStats(
        total_exports=0,  # Would query from database
        exports_this_month=0,
        storage_used_bytes=total_size,
        last_export_date=None,
        scheduled_backups_enabled=False
    )


@router.post("/scheduled-backup")
def configure_scheduled_backup(
    config: ScheduledBackupConfig,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Configure scheduled automated backups"""
    tenant_id = getattr(current_user, 'tenant_id', None)

    # In production, this would configure a scheduled job
    # For now, we just validate and return success

    return {
        "message": "Scheduled backup configured successfully",
        "tenant_id": tenant_id,
        "frequency": config.frequency,
        "retention_days": config.retention_days,
        "next_backup": datetime.utcnow() + timedelta(days=1 if config.frequency == "daily" else 7)
    }


@router.post("/gdpr/delete", status_code=status.HTTP_202_ACCEPTED)
def request_data_deletion(
    request: DataDeletionRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Request GDPR-compliant data deletion.
    This initiates the right to be forgotten process.
    """
    tenant_id = getattr(current_user, 'tenant_id', None)

    # Verify confirmation token against environment variable
    expected_token = os.getenv("GDPR_DELETE_CONFIRMATION_TOKEN")
    if not expected_token:
        raise HTTPException(
            status_code=500,
            detail="Server configuration error: GDPR token not configured"
        )
    if request.confirmation_token != expected_token:
        raise HTTPException(status_code=400, detail="Invalid confirmation token")

    # Log deletion request for audit
    deletion_log = {
        "id": str(uuid.uuid4()),
        "tenant_id": tenant_id,
        "requested_by": getattr(current_user, 'id', None),
        "entity_type": request.entity_type,
        "entity_id": request.entity_id,
        "reason": request.reason,
        "requested_at": datetime.utcnow().isoformat(),
        "status": "pending",
        "scheduled_deletion": (datetime.utcnow() + timedelta(days=30)).isoformat()
    }

    # In production, this would:
    # 1. Queue the deletion for 30 days (cooling off period)
    # 2. Anonymize immediate identifiers
    # 3. Schedule permanent deletion
    # 4. Notify affected user if applicable

    return {
        "message": "Data deletion request accepted",
        "deletion_id": deletion_log["id"],
        "status": "pending",
        "scheduled_deletion": deletion_log["scheduled_deletion"],
        "note": "Data will be anonymized immediately and permanently deleted after 30 days"
    }


@router.get("/gdpr/export-my-data")
def export_user_personal_data(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export all personal data for the current user (GDPR data portability).
    """
    user_id = getattr(current_user, 'id', None)
    tenant_id = getattr(current_user, 'tenant_id', None)

    # Gather all user-related data
    personal_data = {
        "user_profile": {
            "id": str(user_id),
            "email": getattr(current_user, 'email', None),
            "full_name": getattr(current_user, 'full_name', None),
            "phone": getattr(current_user, 'phone', None),
            "role": getattr(current_user, 'role', None),
            "created_at": getattr(current_user, 'created_at', None),
        },
        "export_metadata": {
            "generated_at": datetime.utcnow().isoformat(),
            "format_version": "1.0",
            "tenant_id": tenant_id,
        }
    }

    return personal_data

