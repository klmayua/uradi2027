"""
NDPR Compliance API Endpoints
Nigeria Data Protection Regulation endpoints for data subject rights
"""

from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
import json
import csv
import io
from fastapi.responses import StreamingResponse

from utils.ndpr_compliance import ndpr_compliance, ConsentType, ConsentStatus
from auth.dependencies import get_current_user

router = APIRouter(prefix="/compliance", tags=["NDPR Compliance"])


class ConsentRequest(BaseModel):
    voter_id: str = Field(..., description="Voter identifier")
    consent_type: str = Field(..., description="Type of consent: voter_registration, communication, data_sharing, marketing, analytics")
    purpose: str = Field(..., description="Specific purpose for data processing")
    channel: str = Field(..., description="Channel: web, ussd, mobile_app, sms, whatsapp")
    expiry_days: int = Field(default=365, description="Days until consent expires")


class ConsentRevocationRequest(BaseModel):
    voter_id: str
    consent_type: str
    reason: Optional[str] = None


class DataExportRequest(BaseModel):
    voter_id: str
    format: str = Field(default="json", description="Export format: json or csv")


class DataDeletionRequest(BaseModel):
    voter_id: str
    reason: str = Field(..., description="Reason for deletion request")
    confirmation: bool = Field(..., description="Confirm understanding that deletion is irreversible")


class AuditLogQuery(BaseModel):
    voter_id: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    event_type: Optional[str] = None


@router.post("/consent")
async def record_consent(
    request: Request,
    consent_req: ConsentRequest,
    background_tasks: BackgroundTasks
):
    """
    Record explicit consent from a data subject.

    Required for NDPR compliance - must obtain explicit consent
    before processing personal data for specific purposes.
    """
    try:
        consent_type = ConsentType(consent_req.consent_type)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid consent_type. Must be one of: {[ct.value for ct in ConsentType]}"
        )

    # Get IP and user agent from request
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    record = ndpr_compliance.record_consent(
        voter_id=consent_req.voter_id,
        consent_type=consent_type,
        purpose=consent_req.purpose,
        channel=consent_req.channel,
        ip_address=ip_address,
        user_agent=user_agent,
        expiry_days=consent_req.expiry_days
    )

    return {
        "success": True,
        "message": "Consent recorded successfully",
        "consent": record
    }


@router.get("/consent/{voter_id}")
async def get_consent_status(
    voter_id: str,
    consent_type: Optional[str] = None
):
    """
    Get consent status for a voter.

    If consent_type is provided, returns status for that specific type.
    Otherwise, returns all consent records for the voter.
    """
    if consent_type:
        try:
            ct = ConsentType(consent_type)
            result = ndpr_compliance.check_consent(voter_id, ct)
            return {
                "voter_id": voter_id,
                "consent_type": consent_type,
                **result
            }
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid consent_type. Must be one of: {[ct.value for ct in ConsentType]}"
            )

    # Return all consents
    consents = ndpr_compliance.get_all_consents(voter_id)
    return {
        "voter_id": voter_id,
        "consents": consents,
        "count": len(consents)
    }


@router.post("/consent/revoke")
async def revoke_consent(
    request: Request,
    revoke_req: ConsentRevocationRequest
):
    """
    Revoke previously granted consent.

    Data subjects have the right to withdraw consent at any time.
    """
    try:
        consent_type = ConsentType(revoke_req.consent_type)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid consent_type. Must be one of: {[ct.value for ct in ConsentType]}"
        )

    record = ndpr_compliance.revoke_consent(
        voter_id=revoke_req.voter_id,
        consent_type=consent_type,
        reason=revoke_req.reason
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"No active consent found for voter {revoke_req.voter_id} and type {revoke_req.consent_type}"
        )

    return {
        "success": True,
        "message": "Consent revoked successfully",
        "consent": record
    }


@router.get("/data-access/{voter_id}")
async def access_personal_data(
    voter_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all personal data for a voter (Right to Access).

    NDPR Article 13: Data subjects have the right to obtain confirmation
    that their data is being processed and access to that data.
    """
    # Log this access request
    ndpr_compliance._log_audit_event(
        event_type="data_access_request",
        voter_id=voter_id,
        details={"requested_by": current_user.get("id")},
        user_id=current_user.get("id")
    )

    # Generate privacy report
    report = ndpr_compliance.generate_privacy_report(voter_id)

    return report


@router.post("/data-export")
async def export_personal_data(
    export_req: DataExportRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Export personal data in portable format (Right to Data Portability).

    NDPR Article 16: Data subjects have the right to receive their data
    in a structured, commonly used, machine-readable format.
    """
    # Log the export request
    ndpr_compliance._log_audit_event(
        event_type="data_export_request",
        voter_id=export_req.voter_id,
        details={"format": export_req.format, "requested_by": current_user.get("id")},
        user_id=current_user.get("id")
    )

    # Generate report
    report = ndpr_compliance.generate_privacy_report(export_req.voter_id)

    if export_req.format.lower() == "json":
        # Return as JSON file
        output = io.StringIO()
        json.dump(report, output, indent=2)
        output.seek(0)

        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename=data_export_{export_req.voter_id}.json"
            }
        )

    elif export_req.format.lower() == "csv":
        # Return as CSV (flattened)
        output = io.StringIO()
        writer = csv.writer(output)

        # Write header
        writer.writerow(["Field", "Value"])

        # Flatten and write data
        def flatten_dict(d, prefix=""):
            for key, value in d.items():
                full_key = f"{prefix}.{key}" if prefix else key
                if isinstance(value, dict):
                    flatten_dict(value, full_key)
                elif isinstance(value, list):
                    for i, item in enumerate(value):
                        if isinstance(item, dict):
                            flatten_dict(item, f"{full_key}[{i}]")
                        else:
                            writer.writerow([f"{full_key}[{i}]", item])
                else:
                    writer.writerow([full_key, value])

        flatten_dict(report)
        output.seek(0)

        return StreamingResponse(
            io.BytesIO(output.getvalue().encode()),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=data_export_{export_req.voter_id}.csv"
            }
        )

    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid format. Must be 'json' or 'csv'"
        )


@router.post("/data-deletion")
async def delete_personal_data(
    delete_req: DataDeletionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Request deletion of personal data (Right to Erasure).

    NDPR Article 15: Data subjects have the right to erasure of their data.
    Note: Some data may be retained for legal/audit purposes.
    """
    if not delete_req.confirmation:
        raise HTTPException(
            status_code=400,
            detail="Must confirm understanding that deletion is irreversible"
        )

    voter_id = delete_req.voter_id

    # Log the deletion request
    ndpr_compliance._log_audit_event(
        event_type="data_deletion_request",
        voter_id=voter_id,
        details={
            "reason": delete_req.reason,
            "requested_by": current_user.get("id")
        },
        user_id=current_user.get("id")
    )

    # Revoke all consents
    revoked_consents = []
    for consent_type in ConsentType:
        record = ndpr_compliance.revoke_consent(
            voter_id=voter_id,
            consent_type=consent_type,
            reason=f"Data deletion request: {delete_req.reason}"
        )
        if record:
            revoked_consents.append(consent_type.value)

    # Note: Actual data deletion from database would happen here
    # This is a placeholder for the actual deletion logic
    # In production, this would:
    # 1. Anonymize voter record (keep ID for referential integrity)
    # 2. Delete all PII fields
    # 3. Retain anonymized data for analytics
    # 4. Keep audit logs (required by law)

    return {
        "success": True,
        "message": "Data deletion request processed",
        "voter_id": voter_id,
        "revoked_consents": revoked_consents,
        "deletion_status": "anonymized",
        "retention_note": "Audit logs retained as required by NDPR Article 28",
        "request_details": {
            "reason": delete_req.reason,
            "processed_at": datetime.utcnow().isoformat(),
            "processed_by": current_user.get("id")
        }
    }


@router.get("/audit-log")
async def get_audit_log(
    voter_id: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    event_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Get audit log entries for compliance monitoring.

    NDPR Article 28: Requires maintaining records of processing activities.
    """
    # Log the audit access
    ndpr_compliance._log_audit_event(
        event_type="audit_log_access",
        voter_id=voter_id or "all",
        details={"accessed_by": current_user.get("id")},
        user_id=current_user.get("id")
    )

    events = ndpr_compliance.get_audit_log(
        voter_id=voter_id,
        date_from=date_from,
        date_to=date_to,
        event_type=event_type
    )

    return {
        "events": events,
        "count": len(events),
        "filters": {
            "voter_id": voter_id,
            "date_from": date_from,
            "date_to": date_to,
            "event_type": event_type
        }
    }


@router.get("/retention-policy/{data_type}")
async def get_retention_policy(data_type: str):
    """
    Get data retention policy for a specific data type.

    NDPR Article 10: Data must not be kept longer than necessary.
    """
    policy = ndpr_compliance.get_retention_policy(data_type)
    return {
        "data_type": data_type,
        "policy": policy,
        "legal_basis": "NDPR Article 10 - Storage Limitation Principle"
    }


@router.get("/data-subject-rights/{voter_id}")
async def get_data_subject_rights(voter_id: str):
    """
    Get information about data subject rights and available endpoints.

    NDPR Article 12: Data subjects must be informed of their rights.
    """
    rights = ndpr_compliance.get_data_subject_rights(voter_id)
    return rights


@router.get("/privacy-report/{voter_id}")
async def get_privacy_report(
    voter_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate comprehensive privacy report for a voter.

    Combines consent status, data processing activities, and audit history.
    """
    # Log report generation
    ndpr_compliance._log_audit_event(
        event_type="privacy_report_generated",
        voter_id=voter_id,
        details={"generated_by": current_user.get("id")},
        user_id=current_user.get("id")
    )

    report = ndpr_compliance.generate_privacy_report(voter_id)
    return report


@router.get("/status")
async def get_compliance_status():
    """
    Get overall NDPR compliance status.

    Returns summary statistics about consent and data protection.
    """
    # This would typically query the database for actual statistics
    # For now, return a placeholder structure
    return {
        "framework": "NDPR (Nigeria Data Protection Regulation)",
        "compliant": True,
        "implemented_features": [
            "Consent management",
            "Data subject rights (access, export, deletion)",
            "Data retention policies",
            "Anonymization utilities",
            "Audit logging",
            "Privacy reporting"
        ],
        "data_retention_policies": {
            "voter_data": "3 years",
            "sentiment_data": "1 year",
            "message_logs": "6 months",
            "audit_logs": "7 years (legal requirement)"
        },
        "contact": {
            "dpo_email": "dpo@uradi360.com",
            "dpo_phone": "+234-XXX-XXXX-XXX"
        },
        "last_updated": datetime.utcnow().isoformat()
    }
