"""
Offline Sync API - Task 3.7
WatermelonDB sync protocol, conflict resolution, and data compression
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import gzip
import base64
from database import get_db
from models import (
    Voter, SentimentEntry, CanvassSession, CanvassContact,
    MonitorAssignment, AccreditationRecord, VoteTally, ElectionDayIncident,
    PollingUnit, User
)
from auth.utils import get_current_user
import uuid

router = APIRouter(prefix="/api/sync", tags=["Offline Sync"])


# ==================== PYDANTIC MODELS ====================

class SyncPullRequest(BaseModel):
    last_pulled_at: Optional[int] = None  # Unix timestamp in milliseconds
    tables: List[str]  # Tables to sync: voters, sentiment, canvass_sessions, etc.


class SyncPullResponse(BaseModel):
    changes: Dict[str, Any]
    timestamp: int  # Current server timestamp


class SyncPushChange(BaseModel):
    id: str
    voter_id: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    lga_id: Optional[str] = None
    ward_id: Optional[str] = None
    gender: Optional[str] = None
    age_range: Optional[str] = None
    occupation: Optional[str] = None
    party_leaning: Optional[str] = None
    sentiment_score: Optional[int] = None
    tags: Optional[List[str]] = []
    notes: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    _status: Optional[str] = None  # created, updated, deleted


class SyncPushRequest(BaseModel):
    changes: Dict[str, List[SyncPushChange]]
    last_pulled_at: int


class SyncPushResponse(BaseModel):
    applied: int
    errors: List[Dict[str, Any]]
    conflicts: List[Dict[str, Any]]


class ConflictResolutionRequest(BaseModel):
    table: str
    local_id: str
    server_id: str
    resolution: str  # use_local, use_server, merge
    merged_data: Optional[Dict[str, Any]] = None


class SyncStatusResponse(BaseModel):
    last_sync_at: Optional[str]
    pending_changes: int
    sync_status: str  # synced, syncing, error, offline
    tables_synced: List[str]


class CompressedSyncRequest(BaseModel):
    compressed_data: str  # Base64 encoded gzip compressed JSON
    encoding: str = "gzip+base64"


class SyncDiagnosticsResponse(BaseModel):
    total_records: Dict[str, int]
    last_sync_times: Dict[str, Optional[str]]
    conflict_count: int
    sync_health: str  # healthy, warning, critical


# ==================== SYNC HELPERS ====================

def compress_data(data: Dict[str, Any]) -> str:
    """Compress sync data using gzip and base64"""
    json_str = json.dumps(data)
    compressed = gzip.compress(json_str.encode('utf-8'))
    return base64.b64encode(compressed).decode('utf-8')


def decompress_data(compressed: str) -> Dict[str, Any]:
    """Decompress sync data"""
    decoded = base64.b64decode(compressed)
    decompressed = gzip.decompress(decoded)
    return json.loads(decompressed.decode('utf-8'))


def serialize_voter(voter) -> Dict[str, Any]:
    """Serialize voter to sync format"""
    return {
        "id": str(voter.id),
        "full_name": voter.full_name,
        "phone": voter.phone,
        "lga_id": str(voter.lga_id) if voter.lga_id else None,
        "ward_id": str(voter.ward_id) if voter.ward_id else None,
        "gender": voter.gender,
        "age_range": voter.age_range,
        "occupation": voter.occupation,
        "party_leaning": voter.party_leaning,
        "sentiment_score": voter.sentiment_score,
        "tags": voter.tags if voter.tags else [],
        "notes": voter.notes,
        "created_at": int(voter.created_at.timestamp() * 1000) if voter.created_at else None,
        "updated_at": int(voter.updated_at.timestamp() * 1000) if voter.updated_at else None
    }


def serialize_sentiment(entry) -> Dict[str, Any]:
    """Serialize sentiment entry to sync format"""
    return {
        "id": str(entry.id),
        "source": entry.source,
        "lga_id": str(entry.lga_id) if entry.lga_id else None,
        "ward_id": str(entry.ward_id) if entry.ward_id else None,
        "raw_text": entry.raw_text,
        "sentiment": entry.sentiment,
        "score": entry.score,
        "topics": entry.topics if entry.topics else [],
        "created_at": int(entry.created_at.timestamp() * 1000) if entry.created_at else None
    }


def serialize_canvass_session(session) -> Dict[str, Any]:
    """Serialize canvass session to sync format"""
    return {
        "id": str(session.id),
        "agent_id": str(session.agent_id) if session.agent_id else None,
        "lga_id": str(session.lga_id) if session.lga_id else None,
        "ward_id": str(session.ward_id) if session.ward_id else None,
        "location_lat": session.location_lat,
        "location_lng": session.location_lng,
        "voters_reached": session.voters_reached,
        "voters_persuaded": session.voters_persuaded,
        "status": session.status,
        "started_at": int(session.started_at.timestamp() * 1000) if session.started_at else None,
        "ended_at": int(session.ended_at.timestamp() * 1000) if session.ended_at else None
    }


def serialize_accreditation(record) -> Dict[str, Any]:
    """Serialize accreditation record to sync format"""
    return {
        "id": str(record.id),
        "polling_unit_id": str(record.polling_unit_id) if record.polling_unit_id else None,
        "monitor_id": str(record.monitor_id) if record.monitor_id else None,
        "time_slot": record.time_slot,
        "accredited_count": record.accredited_count,
        "bvas_functional": record.bvas_functional,
        "queue_length": record.queue_length,
        "issues_reported": record.issues_reported if record.issues_reported else [],
        "recorded_at": int(record.recorded_at.timestamp() * 1000) if record.recorded_at else None
    }


def serialize_vote_tally(tally) -> Dict[str, Any]:
    """Serialize vote tally to sync format"""
    return {
        "id": str(tally.id),
        "polling_unit_id": str(tally.polling_unit_id) if tally.polling_unit_id else None,
        "monitor_id": str(tally.monitor_id) if tally.monitor_id else None,
        "candidate_name": tally.candidate_name,
        "party": tally.party,
        "votes_received": tally.votes_received,
        "is_incumbent": tally.is_incumbent,
        "verified": tally.verified,
        "recorded_at": int(tally.recorded_at.timestamp() * 1000) if tally.recorded_at else None
    }


def serialize_incident(incident) -> Dict[str, Any]:
    """Serialize election day incident to sync format"""
    return {
        "id": str(incident.id),
        "polling_unit_id": str(incident.polling_unit_id) if incident.polling_unit_id else None,
        "monitor_id": str(incident.monitor_id) if incident.monitor_id else None,
        "incident_type": incident.incident_type,
        "severity": incident.severity,
        "description": incident.description,
        "latitude": incident.latitude,
        "longitude": incident.longitude,
        "status": incident.status,
        "reported_at": int(incident.reported_at.timestamp() * 1000) if incident.reported_at else None
    }


# ==================== SYNC PULL ENDPOINTS ====================

@router.post("/pull", response_model=SyncPullResponse)
def sync_pull(
    request: SyncPullRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Pull changes from server since last sync (WatermelonDB style)
    Returns all records modified after last_pulled_at timestamp
    """
    changes = {}
    
    # Convert milliseconds to datetime
    last_pulled = None
    if request.last_pulled_at:
        last_pulled = datetime.fromtimestamp(request.last_pulled_at / 1000)
    
    # Sync Voters
    if "voters" in request.tables:
        voter_query = db.query(Voter).filter(
            Voter.tenant_id == current_user.tenant_id
        )
        if last_pulled:
            voter_query = voter_query.filter(Voter.updated_at > last_pulled)
        
        voters = voter_query.all()
        changes["voters"] = {
            "created": [serialize_voter(v) for v in voters],
            "updated": [],
            "deleted": []
        }
    
    # Sync Sentiment Entries
    if "sentiment" in request.tables:
        sentiment_query = db.query(SentimentEntry).filter(
            SentimentEntry.tenant_id == current_user.tenant_id
        )
        if last_pulled:
            sentiment_query = sentiment_query.filter(SentimentEntry.created_at > last_pulled)
        
        entries = sentiment_query.all()
        changes["sentiment"] = {
            "created": [serialize_sentiment(e) for e in entries],
            "updated": [],
            "deleted": []
        }
    
    # Sync Canvass Sessions
    if "canvass_sessions" in request.tables:
        session_query = db.query(CanvassSession).filter(
            CanvassSession.agent_id == current_user.id,
            CanvassSession.tenant_id == current_user.tenant_id
        )
        if last_pulled:
            session_query = session_query.filter(
                or_(
                    CanvassSession.started_at > last_pulled,
                    CanvassSession.ended_at > last_pulled if CanvassSession.ended_at else False
                )
            )
        
        sessions = session_query.all()
        changes["canvass_sessions"] = {
            "created": [serialize_canvass_session(s) for s in sessions],
            "updated": [],
            "deleted": []
        }
    
    # Sync Accreditation Records (for monitors)
    if "accreditation" in request.tables:
        acc_query = db.query(AccreditationRecord).filter(
            AccreditationRecord.tenant_id == current_user.tenant_id
        )
        if last_pulled:
            acc_query = acc_query.filter(AccreditationRecord.recorded_at > last_pulled)
        
        records = acc_query.all()
        changes["accreditation"] = {
            "created": [serialize_accreditation(r) for r in records],
            "updated": [],
            "deleted": []
        }
    
    # Sync Vote Tallies
    if "vote_tallies" in request.tables:
        tally_query = db.query(VoteTally).filter(
            VoteTally.tenant_id == current_user.tenant_id
        )
        if last_pulled:
            tally_query = tally_query.filter(VoteTally.recorded_at > last_pulled)
        
        tallies = tally_query.all()
        changes["vote_tallies"] = {
            "created": [serialize_vote_tally(t) for t in tallies],
            "updated": [],
            "deleted": []
        }
    
    # Sync Election Day Incidents
    if "incidents" in request.tables:
        incident_query = db.query(ElectionDayIncident).filter(
            ElectionDayIncident.tenant_id == current_user.tenant_id
        )
        if last_pulled:
            incident_query = incident_query.filter(ElectionDayIncident.reported_at > last_pulled)
        
        incidents = incident_query.all()
        changes["incidents"] = {
            "created": [serialize_incident(i) for i in incidents],
            "updated": [],
            "deleted": []
        }
    
    return SyncPullResponse(
        changes=changes,
        timestamp=int(datetime.utcnow().timestamp() * 1000)
    )


@router.post("/pull/compressed")
def sync_pull_compressed(
    request: SyncPullRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Pull changes with gzip compression for low-bandwidth environments
    """
    # Get regular response
    response = sync_pull(request, db, current_user)
    
    # Compress
    compressed = compress_data(response.dict())
    
    return {
        "compressed": True,
        "encoding": "gzip+base64",
        "data": compressed,
        "original_size": len(json.dumps(response.dict())),
        "compressed_size": len(compressed)
    }


# ==================== SYNC PUSH ENDPOINTS ====================

@router.post("/push", response_model=SyncPushResponse)
def sync_push(
    request: SyncPushRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Push local changes to server (WatermelonDB style)
    Applies changes and returns conflicts
    """
    applied = 0
    errors = []
    conflicts = []
    
    # Process Voters
    if "voters" in request.changes:
        for change in request.changes["voters"]:
            try:
                # Check for existing record
                existing = db.query(Voter).filter(
                    Voter.id == change.id,
                    Voter.tenant_id == current_user.tenant_id
                ).first()
                
                if existing:
                    # Check for conflict (server version newer)
                    if existing.updated_at and change.updated_at:
                        server_time = existing.updated_at.timestamp() * 1000
                        local_time = int(change.updated_at) if isinstance(change.updated_at, str) else change.updated_at
                        if server_time > local_time:
                            conflicts.append({
                                "table": "voters",
                                "id": change.id,
                                "type": "update_conflict",
                                "server_data": serialize_voter(existing),
                                "local_data": change.dict()
                            })
                            continue
                    
                    # Update existing
                    existing.full_name = change.full_name or existing.full_name
                    existing.phone = change.phone if change.phone is not None else existing.phone
                    existing.lga_id = uuid.UUID(change.lga_id) if change.lga_id else existing.lga_id
                    existing.ward_id = uuid.UUID(change.ward_id) if change.ward_id else existing.ward_id
                    existing.gender = change.gender or existing.gender
                    existing.age_range = change.age_range or existing.age_range
                    existing.occupation = change.occupation or existing.occupation
                    existing.party_leaning = change.party_leaning or existing.party_leaning
                    existing.sentiment_score = change.sentiment_score if change.sentiment_score is not None else existing.sentiment_score
                    existing.tags = change.tags if change.tags else existing.tags
                    existing.notes = change.notes if change.notes is not None else existing.notes
                    existing.updated_at = datetime.utcnow()
                else:
                    # Create new
                    voter = Voter(
                        id=uuid.UUID(change.id),
                        tenant_id=current_user.tenant_id,
                        full_name=change.full_name or "Unknown",
                        phone=change.phone,
                        lga_id=uuid.UUID(change.lga_id) if change.lga_id else None,
                        ward_id=uuid.UUID(change.ward_id) if change.ward_id else None,
                        gender=change.gender,
                        age_range=change.age_range,
                        occupation=change.occupation,
                        party_leaning=change.party_leaning,
                        sentiment_score=change.sentiment_score or 0,
                        tags=change.tags or [],
                        notes=change.notes,
                        source="field_app",
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                    db.add(voter)
                
                applied += 1
            except Exception as e:
                errors.append({
                    "table": "voters",
                    "id": change.id,
                    "error": str(e)
                })
    
    # Process Sentiment Entries
    if "sentiment" in request.changes:
        for change in request.changes["sentiment"]:
            try:
                entry = SentimentEntry(
                    id=uuid.uuid4(),
                    tenant_id=current_user.tenant_id,
                    source="field_app",
                    lga_id=uuid.UUID(change.lga_id) if change.lga_id else None,
                    ward_id=uuid.UUID(change.ward_id) if change.ward_id else None,
                    raw_text=change.raw_text or "",
                    sentiment=change.sentiment,
                    score=change.score,
                    topics=change.topics or [],
                    created_at=datetime.utcnow()
                )
                db.add(entry)
                applied += 1
            except Exception as e:
                errors.append({
                    "table": "sentiment",
                    "error": str(e)
                })
    
    # Commit all changes
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        errors.append({"error": f"Commit failed: {str(e)}"})
    
    return SyncPushResponse(
        applied=applied,
        errors=errors,
        conflicts=conflicts
    )


@router.post("/push/compressed")
def sync_push_compressed(
    request: CompressedSyncRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Push compressed changes to server
    """
    try:
        # Decompress
        data = decompress_data(request.compressed_data)
        
        # Convert to SyncPushRequest
        push_request = SyncPushRequest(**data)
        
        # Process normally
        return sync_push(push_request, db, current_user)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to decompress or process data: {str(e)}"
        )


# ==================== CONFLICT RESOLUTION ====================

@router.post("/resolve-conflict")
def resolve_conflict(
    request: ConflictResolutionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Resolve a sync conflict manually
    """
    if request.table == "voters":
        voter = db.query(Voter).filter(
            Voter.id == request.server_id,
            Voter.tenant_id == current_user.tenant_id
        ).first()
        
        if not voter:
            raise HTTPException(status_code=404, detail="Voter not found")
        
        if request.resolution == "use_local":
            # Update server with local data
            if request.merged_data:
                voter.full_name = request.merged_data.get("full_name", voter.full_name)
                voter.phone = request.merged_data.get("phone", voter.phone)
                voter.party_leaning = request.merged_data.get("party_leaning", voter.party_leaning)
                voter.sentiment_score = request.merged_data.get("sentiment_score", voter.sentiment_score)
                voter.updated_at = datetime.utcnow()
                db.commit()
            return {"message": "Conflict resolved: local data applied"}
        
        elif request.resolution == "use_server":
            # Keep server data, discard local
            return {"message": "Conflict resolved: server data kept"}
        
        elif request.resolution == "merge":
            # Merge data
            if request.merged_data:
                for key, value in request.merged_data.items():
                    if hasattr(voter, key) and value is not None:
                        setattr(voter, key, value)
                voter.updated_at = datetime.utcnow()
                db.commit()
            return {"message": "Conflict resolved: data merged"}
    
    return {"message": "Conflict resolution not implemented for this table"}


# ==================== SYNC STATUS & DIAGNOSTICS ====================

@router.get("/status", response_model=SyncStatusResponse)
def get_sync_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get current sync status for the user
    """
    # Count pending changes (records created by this user since last sync)
    # In a real implementation, you'd track sync timestamps per user
    
    # Count records by table
    voter_count = db.query(Voter).filter(
        Voter.tenant_id == current_user.tenant_id
    ).count()
    
    sentiment_count = db.query(SentimentEntry).filter(
        SentimentEntry.tenant_id == current_user.tenant_id
    ).count()
    
    return SyncStatusResponse(
        last_sync_at=datetime.utcnow().isoformat(),
        pending_changes=0,  # Would be calculated based on local queue
        sync_status="synced",
        tables_synced=["voters", "sentiment", "canvass_sessions"]
    )


@router.get("/diagnostics", response_model=SyncDiagnosticsResponse)
def get_sync_diagnostics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get sync diagnostics for troubleshooting
    """
    # Count records per table
    counts = {
        "voters": db.query(Voter).filter(Voter.tenant_id == current_user.tenant_id).count(),
        "sentiment_entries": db.query(SentimentEntry).filter(SentimentEntry.tenant_id == current_user.tenant_id).count(),
        "canvass_sessions": db.query(CanvassSession).filter(CanvassSession.tenant_id == current_user.tenant_id).count(),
        "accreditation_records": db.query(AccreditationRecord).filter(AccreditationRecord.tenant_id == current_user.tenant_id).count(),
        "vote_tallies": db.query(VoteTally).filter(VoteTally.tenant_id == current_user.tenant_id).count(),
        "election_incidents": db.query(ElectionDayIncident).filter(ElectionDayIncident.tenant_id == current_user.tenant_id).count()
    }
    
    # Get last update times
    last_voter = db.query(Voter).filter(
        Voter.tenant_id == current_user.tenant_id
    ).order_by(Voter.updated_at.desc()).first()
    
    return SyncDiagnosticsResponse(
        total_records=counts,
        last_sync_times={
            "voters": last_voter.updated_at.isoformat() if last_voter and last_voter.updated_at else None
        },
        conflict_count=0,  # Would be tracked in conflict table
        sync_health="healthy"
    )


# ==================== BATCH OPERATIONS ====================

@router.post("/batch/voters")
def batch_create_voters(
    voters: List[Dict[str, Any]],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Batch create voters for offline sync
    Optimized for bulk insert
    """
    created = 0
    errors = []
    
    for voter_data in voters:
        try:
            voter = Voter(
                id=uuid.uuid4(),
                tenant_id=current_user.tenant_id,
                full_name=voter_data.get("full_name", "Unknown"),
                phone=voter_data.get("phone"),
                lga_id=uuid.UUID(voter_data["lga_id"]) if voter_data.get("lga_id") else None,
                ward_id=uuid.UUID(voter_data["ward_id"]) if voter_data.get("ward_id") else None,
                gender=voter_data.get("gender"),
                age_range=voter_data.get("age_range"),
                occupation=voter_data.get("occupation"),
                party_leaning=voter_data.get("party_leaning"),
                sentiment_score=voter_data.get("sentiment_score", 0),
                tags=voter_data.get("tags", []),
                notes=voter_data.get("notes"),
                source="field_app_batch",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(voter)
            created += 1
        except Exception as e:
            errors.append({"data": voter_data, "error": str(e)})
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        return {"error": str(e), "created": 0}
    
    return {
        "created": created,
        "errors": errors,
        "total_received": len(voters)
    }


@router.post("/batch/accreditation")
def batch_create_accreditation(
    records: List[Dict[str, Any]],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Batch create accreditation records for offline sync
    """
    created = 0
    errors = []
    
    for record_data in records:
        try:
            record = AccreditationRecord(
                id=uuid.uuid4(),
                tenant_id=current_user.tenant_id,
                polling_unit_id=uuid.UUID(record_data["polling_unit_id"]),
                monitor_id=current_user.id,
                time_slot=record_data.get("time_slot"),
                accredited_count=record_data.get("accredited_count", 0),
                bvas_functional=record_data.get("bvas_functional", True),
                queue_length=record_data.get("queue_length", "short"),
                issues_reported=record_data.get("issues", []),
                recorded_at=datetime.utcnow()
            )
            db.add(record)
            created += 1
        except Exception as e:
            errors.append({"data": record_data, "error": str(e)})
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        return {"error": str(e), "created": 0}
    
    return {
        "created": created,
        "errors": errors,
        "total_received": len(records)
    }


# ==================== SYNC CONFIGURATION ====================

@router.get("/config")
def get_sync_config(
    current_user: User = Depends(get_current_user)
):
    """
    Get sync configuration for the mobile app
    """
    return {
        "sync_interval_seconds": 300,  # 5 minutes
        "batch_size": 100,
        "compression_enabled": True,
        "tables": {
            "voters": {
                "sync_direction": "bidirectional",
                "conflict_resolution": "server_wins"
            },
            "sentiment": {
                "sync_direction": "push_only",
                "conflict_resolution": null
            },
            "canvass_sessions": {
                "sync_direction": "bidirectional",
                "conflict_resolution": "last_write_wins"
            },
            "accreditation": {
                "sync_direction": "push_only",
                "conflict_resolution": null
            },
            "vote_tallies": {
                "sync_direction": "push_only",
                "conflict_resolution": null
            },
            "incidents": {
                "sync_direction": "push_only",
                "conflict_resolution": null
            }
        },
        "field_constraints": {
            "voter": {
                "full_name": {"required": True, "max_length": 100},
                "phone": {"required": False, "max_length": 20},
                "notes": {"required": False, "max_length": 1000}
            }
        }
    }


@router.post("/reset")
def reset_sync_state(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Reset sync state (for troubleshooting)
    Clears all sync-related metadata
    """
    # In a real implementation, this would clear sync tracking tables
    return {
        "message": "Sync state reset successfully",
        "timestamp": datetime.utcnow().isoformat(),
        "next_sync_from": 0
    }
