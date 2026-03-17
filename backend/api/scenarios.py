"""
Scenarios API - Task 2.2
Scenario Modelling and Projections Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from models import Scenario
from auth.utils import get_current_user
import uuid

router = APIRouter(prefix="/api/scenarios", tags=["Scenarios"])


# Pydantic Models
class ScenarioCreate(BaseModel):
    title: str
    description: Optional[str] = None
    probability: Optional[float] = None
    impact: Optional[str] = None
    variables: Optional[dict] = None
    our_response: Optional[str] = None
    vote_projection: Optional[dict] = None


class ScenarioUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    probability: Optional[float] = None
    impact: Optional[str] = None
    variables: Optional[dict] = None
    our_response: Optional[str] = None
    vote_projection: Optional[dict] = None
    status: Optional[str] = None


class ScenarioResponse(BaseModel):
    id: str
    tenant_id: str
    title: str
    description: Optional[str]
    probability: Optional[float]
    impact: Optional[str]
    variables: Optional[dict]
    our_response: Optional[str]
    vote_projection: Optional[dict]
    status: str
    last_assessed_at: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


def convert_scenario_to_response(scenario: Scenario) -> ScenarioResponse:
    """Convert Scenario model to response schema"""
    return ScenarioResponse(
        id=str(scenario.id),
        tenant_id=scenario.tenant_id,
        title=scenario.title,
        description=scenario.description,
        probability=scenario.probability,
        impact=scenario.impact,
        variables=scenario.variables,
        our_response=scenario.our_response,
        vote_projection=scenario.vote_projection,
        status=scenario.status,
        last_assessed_at=scenario.last_assessed_at.isoformat() if scenario.last_assessed_at else None,
        created_at=scenario.created_at.isoformat() if scenario.created_at else None
    )


@router.get("/", response_model=List[ScenarioResponse])
def list_scenarios(
    status: Optional[str] = Query(None, description="Filter by status (active, resolved, superseded)"),
    impact: Optional[str] = Query(None, description="Filter by impact (positive, negative, neutral)"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all scenarios with optional filtering.
    Returns scenarios filtered by tenant_id for multi-tenant isolation.
    """
    query = db.query(Scenario).filter(
        Scenario.tenant_id == current_user.tenant_id
    )
    
    # Apply filters
    if status:
        query = query.filter(Scenario.status == status)
    if impact:
        query = query.filter(Scenario.impact == impact)
    
    scenarios = query.order_by(Scenario.probability.desc()).all()
    return [convert_scenario_to_response(scenario) for scenario in scenarios]


@router.get("/{scenario_id}", response_model=ScenarioResponse)
def get_scenario(
    scenario_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific scenario by ID"""
    scenario = db.query(Scenario).filter(
        Scenario.id == scenario_id,
        Scenario.tenant_id == current_user.tenant_id
    ).first()
    
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found"
        )
    
    return convert_scenario_to_response(scenario)


@router.post("/", response_model=ScenarioResponse, status_code=status.HTTP_201_CREATED)
def create_scenario(
    scenario: ScenarioCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new scenario"""
    db_scenario = Scenario(
        id=uuid.uuid4(),
        tenant_id=current_user.tenant_id,
        title=scenario.title,
        description=scenario.description,
        probability=scenario.probability,
        impact=scenario.impact,
        variables=scenario.variables,
        our_response=scenario.our_response,
        vote_projection=scenario.vote_projection,
        status="active"
    )
    
    db.add(db_scenario)
    db.commit()
    db.refresh(db_scenario)
    
    return convert_scenario_to_response(db_scenario)


@router.patch("/{scenario_id}", response_model=ScenarioResponse)
def update_scenario(
    scenario_id: str,
    scenario_update: ScenarioUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing scenario"""
    scenario = db.query(Scenario).filter(
        Scenario.id == scenario_id,
        Scenario.tenant_id == current_user.tenant_id
    ).first()
    
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found"
        )
    
    # Update fields if provided
    update_data = scenario_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(scenario, field, value)
    
    db.commit()
    db.refresh(scenario)
    
    return convert_scenario_to_response(scenario)


@router.delete("/{scenario_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scenario(
    scenario_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a scenario"""
    scenario = db.query(Scenario).filter(
        Scenario.id == scenario_id,
        Scenario.tenant_id == current_user.tenant_id
    ).first()
    
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found"
        )
    
    db.delete(scenario)
    db.commit()
    
    return None


@router.get("/comparison/all")
def get_scenario_comparison(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get side-by-side comparison of all scenarios.
    Returns scenarios with vote projections for comparison view.
    """
    scenarios = db.query(Scenario).filter(
        Scenario.tenant_id == current_user.tenant_id,
        Scenario.status == "active"
    ).order_by(Scenario.probability.desc()).all()
    
    comparison_data = []
    for scenario in scenarios:
        comparison_data.append({
            "id": str(scenario.id),
            "title": scenario.title,
            "probability": scenario.probability,
            "impact": scenario.impact,
            "status": scenario.status,
            "vote_projection": scenario.vote_projection
        })
    
    return {
        "scenarios": comparison_data,
        "total_scenarios": len(comparison_data)
    }


@router.get("/projections/summary")
def get_electoral_projections(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get electoral projection dashboard data.
    Aggregates vote projections across all active scenarios.
    """
    from sqlalchemy import func
    
    # Get active scenarios
    scenarios = db.query(Scenario).filter(
        Scenario.tenant_id == current_user.tenant_id,
        Scenario.status == "active"
    ).all()
    
    # Calculate weighted projections
    total_probability = sum(s.probability for s in scenarios if s.probability)
    
    aggregated_projection = {}
    for scenario in scenarios:
        if scenario.vote_projection and scenario.probability:
            weight = scenario.probability / total_probability if total_probability > 0 else 0
            for candidate, votes in scenario.vote_projection.items():
                if candidate not in aggregated_projection:
                    aggregated_projection[candidate] = 0
                aggregated_projection[candidate] += votes * weight
    
    return {
        "total_scenarios": len(scenarios),
        "weighted_projections": aggregated_projection,
        "scenarios": [
            {
                "id": str(s.id),
                "title": s.title,
                "probability": s.probability,
                "vote_projection": s.vote_projection
            }
            for s in scenarios
        ]
    }


@router.get("/kwankwaso/matrix")
def get_kwankwaso_scenario_matrix(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get Kwankwaso Scenario Matrix (Kano-specific).
    Returns 4 predefined scenarios with live probability tracking.
    """
    # This is a specialized endpoint for Kano state
    # In production, these would be predefined scenarios in the database
    
    matrix = {
        "state": "kano",
        "scenarios": [
            {
                "id": "kwankwaso-united",
                "title": "Kwankwaso United Front",
                "description": "NNPP and Kwankwasiyya remain fully united behind candidate",
                "probability": 0.65,
                "impact": "positive",
                "strategic_response": "Maintain coalition strength, focus on grassroots mobilization",
                "resource_allocation": "Standard deployment",
                "messaging_shift": "Unity and progress messaging"
            },
            {
                "id": "kwankwaso-fractured",
                "title": "Kwankwaso Fractured",
                "description": "Internal divisions emerge within Kwankwasiyya movement",
                "probability": 0.25,
                "impact": "negative",
                "strategic_response": "Crisis management, reconciliation efforts",
                "resource_allocation": "Damage control focus",
                "messaging_shift": "Stability and experience messaging"
            },
            {
                "id": "ganduje-alliance",
                "title": "Ganduje-APC Alliance",
                "description": "Former governor Ganduje fully commits to APC candidate",
                "probability": 0.45,
                "impact": "negative",
                "strategic_response": "Counter-mobilization in strongholds",
                "resource_allocation": "Defensive deployment",
                "messaging_shift": "Anti-corruption messaging"
            },
            {
                "id": "neutral-ground",
                "title": "Neutral Ground",
                "description": "Key power brokers remain neutral or divided",
                "probability": 0.35,
                "impact": "neutral",
                "strategic_response": "Persuasion campaign targeting undecideds",
                "resource_allocation": "Swing LGA focus",
                "messaging_shift": "Development and competence messaging"
            }
        ]
    }
    
    return matrix


@router.post("/{scenario_id}/assess")
def assess_scenario(
    scenario_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update last_assessed_at timestamp for a scenario.
    Called when strategists review and update scenario assessments.
    """
    from datetime import datetime
    
    scenario = db.query(Scenario).filter(
        Scenario.id == scenario_id,
        Scenario.tenant_id == current_user.tenant_id
    ).first()
    
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found"
        )
    
    scenario.last_assessed_at = datetime.utcnow()
    db.commit()
    db.refresh(scenario)
    
    return convert_scenario_to_response(scenario)