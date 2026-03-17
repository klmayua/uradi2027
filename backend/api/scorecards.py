"""
Scorecard API - Task 2.4
Governance Scorecard Builder Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from models import ScorecardEntry
from auth.utils import get_current_user
import uuid

router = APIRouter(prefix="/api/scorecards", tags=["Scorecards"])


# Pydantic Models
class ScorecardEntryCreate(BaseModel):
    period: str
    sector: str
    metric_name: str
    incumbent_value: Optional[float] = None
    benchmark_value: Optional[float] = None
    grade: Optional[str] = None
    narrative: Optional[str] = None
    data_source: Optional[str] = None


class ScorecardEntryUpdate(BaseModel):
    period: Optional[str] = None
    sector: Optional[str] = None
    metric_name: Optional[str] = None
    incumbent_value: Optional[float] = None
    benchmark_value: Optional[float] = None
    grade: Optional[str] = None
    narrative: Optional[str] = None
    data_source: Optional[str] = None
    published: Optional[bool] = None


class ScorecardEntryResponse(BaseModel):
    id: str
    tenant_id: str
    period: str
    sector: str
    metric_name: str
    incumbent_value: Optional[float]
    benchmark_value: Optional[float]
    grade: Optional[str]
    narrative: Optional[str]
    data_source: Optional[str]
    published: bool
    created_at: str

    class Config:
        from_attributes = True


def convert_entry_to_response(entry: ScorecardEntry) -> ScorecardEntryResponse:
    """Convert ScorecardEntry model to response schema"""
    return ScorecardEntryResponse(
        id=str(entry.id),
        tenant_id=entry.tenant_id,
        period=entry.period,
        sector=entry.sector,
        metric_name=entry.metric_name,
        incumbent_value=entry.incumbent_value,
        benchmark_value=entry.benchmark_value,
        grade=entry.grade,
        narrative=entry.narrative,
        data_source=entry.data_source,
        published=entry.published,
        created_at=entry.created_at.isoformat() if entry.created_at else None
    )


@router.get("/entries", response_model=List[ScorecardEntryResponse])
def list_scorecard_entries(
    period: Optional[str] = Query(None, description="Filter by period (e.g., 2026-Q3)"),
    sector: Optional[str] = Query(None, description="Filter by sector"),
    published: Optional[bool] = Query(None, description="Filter by published status"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all scorecard entries with optional filtering.
    """
    query = db.query(ScorecardEntry).filter(
        ScorecardEntry.tenant_id == current_user.tenant_id
    )
    
    if period:
        query = query.filter(ScorecardEntry.period == period)
    if sector:
        query = query.filter(ScorecardEntry.sector == sector)
    if published is not None:
        query = query.filter(ScorecardEntry.published == published)
    
    entries = query.all()
    return [convert_entry_to_response(entry) for entry in entries]


@router.get("/entries/{entry_id}", response_model=ScorecardEntryResponse)
def get_scorecard_entry(
    entry_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific scorecard entry by ID"""
    entry = db.query(ScorecardEntry).filter(
        ScorecardEntry.id == entry_id,
        ScorecardEntry.tenant_id == current_user.tenant_id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scorecard entry not found"
        )
    
    return convert_entry_to_response(entry)


@router.post("/entries", response_model=ScorecardEntryResponse, status_code=status.HTTP_201_CREATED)
def create_scorecard_entry(
    entry: ScorecardEntryCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new scorecard entry"""
    # Auto-calculate grade if not provided
    grade = entry.grade
    if not grade and entry.incumbent_value is not None and entry.benchmark_value is not None:
        grade = calculate_grade(entry.incumbent_value, entry.benchmark_value)
    
    db_entry = ScorecardEntry(
        id=uuid.uuid4(),
        tenant_id=current_user.tenant_id,
        period=entry.period,
        sector=entry.sector,
        metric_name=entry.metric_name,
        incumbent_value=entry.incumbent_value,
        benchmark_value=entry.benchmark_value,
        grade=grade,
        narrative=entry.narrative,
        data_source=entry.data_source,
        published=False
    )
    
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    
    return convert_entry_to_response(db_entry)


@router.patch("/entries/{entry_id}", response_model=ScorecardEntryResponse)
def update_scorecard_entry(
    entry_id: str,
    entry_update: ScorecardEntryUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing scorecard entry"""
    entry = db.query(ScorecardEntry).filter(
        ScorecardEntry.id == entry_id,
        ScorecardEntry.tenant_id == current_user.tenant_id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scorecard entry not found"
        )
    
    # Update fields if provided
    update_data = entry_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(entry, field, value)
    
    # Recalculate grade if values changed
    if 'incumbent_value' in update_data or 'benchmark_value' in update_data:
        if entry.incumbent_value is not None and entry.benchmark_value is not None:
            entry.grade = calculate_grade(entry.incumbent_value, entry.benchmark_value)
    
    db.commit()
    db.refresh(entry)
    
    return convert_entry_to_response(entry)


@router.delete("/entries/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scorecard_entry(
    entry_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a scorecard entry"""
    entry = db.query(ScorecardEntry).filter(
        ScorecardEntry.id == entry_id,
        ScorecardEntry.tenant_id == current_user.tenant_id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scorecard entry not found"
        )
    
    db.delete(entry)
    db.commit()
    
    return None


@router.post("/entries/{entry_id}/publish", response_model=ScorecardEntryResponse)
def publish_scorecard_entry(
    entry_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Publish a scorecard entry"""
    entry = db.query(ScorecardEntry).filter(
        ScorecardEntry.id == entry_id,
        ScorecardEntry.tenant_id == current_user.tenant_id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scorecard entry not found"
        )
    
    entry.published = True
    db.commit()
    db.refresh(entry)
    
    return convert_entry_to_response(entry)


@router.get("/by-period/{period}")
def get_scorecard_by_period(
    period: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get complete scorecard for a specific period.
    Groups entries by sector and calculates overall grade.
    """
    entries = db.query(ScorecardEntry).filter(
        ScorecardEntry.tenant_id == current_user.tenant_id,
        ScorecardEntry.period == period
    ).all()
    
    # Group by sector
    sectors = {}
    for entry in entries:
        if entry.sector not in sectors:
            sectors[entry.sector] = []
        sectors[entry.sector].append(convert_entry_to_response(entry))
    
    # Calculate overall grade
    grades = [e.grade for e in entries if e.grade]
    overall_grade = calculate_overall_grade(grades)
    
    return {
        "period": period,
        "overall_grade": overall_grade,
        "total_metrics": len(entries),
        "sectors": sectors
    }


@router.get("/archive")
def get_scorecard_archive(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get scorecard archive with historical data.
    Returns all published scorecards grouped by period.
    """
    from sqlalchemy import distinct
    
    # Get all unique periods
    periods = db.query(distinct(ScorecardEntry.period)).filter(
        ScorecardEntry.tenant_id == current_user.tenant_id,
        ScorecardEntry.published == True
    ).order_by(ScorecardEntry.period.desc()).all()
    
    archive = []
    for (period,) in periods:
        entries = db.query(ScorecardEntry).filter(
            ScorecardEntry.tenant_id == current_user.tenant_id,
            ScorecardEntry.period == period,
            ScorecardEntry.published == True
        ).all()
        
        grades = [e.grade for e in entries if e.grade]
        
        archive.append({
            "period": period,
            "total_metrics": len(entries),
            "overall_grade": calculate_overall_grade(grades),
            "sectors": list(set(e.sector for e in entries))
        })
    
    return {
        "archive": archive,
        "total_periods": len(archive)
    }


@router.get("/trends/{sector}")
def get_sector_trends(
    sector: str,
    metric_name: Optional[str] = Query(None, description="Filter by specific metric"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get trend data for a specific sector.
    Shows how metrics have changed over time.
    """
    query = db.query(ScorecardEntry).filter(
        ScorecardEntry.tenant_id == current_user.tenant_id,
        ScorecardEntry.sector == sector,
        ScorecardEntry.published == True
    )
    
    if metric_name:
        query = query.filter(ScorecardEntry.metric_name == metric_name)
    
    entries = query.order_by(ScorecardEntry.period).all()
    
    trends = []
    for entry in entries:
        trends.append({
            "period": entry.period,
            "metric": entry.metric_name,
            "incumbent_value": entry.incumbent_value,
            "benchmark_value": entry.benchmark_value,
            "grade": entry.grade
        })
    
    return {
        "sector": sector,
        "metric": metric_name,
        "trends": trends
    }


def calculate_grade(incumbent_value: float, benchmark_value: float) -> str:
    """
    Calculate grade (A-F) based on incumbent vs benchmark performance.
    """
    if benchmark_value == 0:
        return "N/A"
    
    percentage = (incumbent_value / benchmark_value) * 100
    
    if percentage >= 120:
        return "A"
    elif percentage >= 100:
        return "B"
    elif percentage >= 80:
        return "C"
    elif percentage >= 60:
        return "D"
    else:
        return "F"


def calculate_overall_grade(grades: List[str]) -> str:
    """
    Calculate overall grade from list of individual grades.
    """
    if not grades:
        return "N/A"
    
    grade_values = {"A": 5, "B": 4, "C": 3, "D": 2, "F": 1}
    
    total = sum(grade_values.get(g, 0) for g in grades)
    average = total / len(grades)
    
    if average >= 4.5:
        return "A"
    elif average >= 3.5:
        return "B"
    elif average >= 2.5:
        return "C"
    elif average >= 1.5:
        return "D"
    else:
        return "F"