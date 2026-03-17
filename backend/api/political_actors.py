"""
Political Atlas API - Task 2.1
Political Actors CRUD and Network Data Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from models import PoliticalActor
from auth.utils import get_current_user
import uuid

router = APIRouter(prefix="/api/political-actors", tags=["Political Atlas"])


# Pydantic Models
class PoliticalActorCreate(BaseModel):
    full_name: str
    title: Optional[str] = None
    party: Optional[str] = None
    lga_id: Optional[str] = None
    influence_type: Optional[str] = None
    influence_level: Optional[int] = None
    loyalty: Optional[str] = None
    faction: Optional[str] = None
    vulnerability_notes: Optional[str] = None
    contact_info: Optional[dict] = None
    notes: Optional[str] = None


class PoliticalActorUpdate(BaseModel):
    full_name: Optional[str] = None
    title: Optional[str] = None
    party: Optional[str] = None
    lga_id: Optional[str] = None
    influence_type: Optional[str] = None
    influence_level: Optional[int] = None
    loyalty: Optional[str] = None
    faction: Optional[str] = None
    vulnerability_notes: Optional[str] = None
    contact_info: Optional[dict] = None
    notes: Optional[str] = None


class PoliticalActorResponse(BaseModel):
    id: str
    tenant_id: str
    full_name: str
    title: Optional[str]
    party: Optional[str]
    lga_id: Optional[str]
    influence_type: Optional[str]
    influence_level: Optional[int]
    loyalty: Optional[str]
    faction: Optional[str]
    vulnerability_notes: Optional[str]
    contact_info: Optional[dict]
    last_assessed_at: Optional[str]
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


def convert_actor_to_response(actor: PoliticalActor) -> PoliticalActorResponse:
    """Convert PoliticalActor model to response schema"""
    return PoliticalActorResponse(
        id=str(actor.id),
        tenant_id=actor.tenant_id,
        full_name=actor.full_name,
        title=actor.title,
        party=actor.party,
        lga_id=actor.lga_id,
        influence_type=actor.influence_type,
        influence_level=actor.influence_level,
        loyalty=actor.loyalty,
        faction=actor.faction,
        vulnerability_notes=actor.vulnerability_notes,
        contact_info=actor.contact_info,
        last_assessed_at=actor.last_assessed_at.isoformat() if actor.last_assessed_at else None,
        created_at=actor.created_at.isoformat() if actor.created_at else None,
        updated_at=actor.updated_at.isoformat() if actor.updated_at else None
    )


@router.get("/", response_model=List[PoliticalActorResponse])
def list_political_actors(
    party: Optional[str] = Query(None, description="Filter by party"),
    loyalty: Optional[str] = Query(None, description="Filter by loyalty status"),
    influence_type: Optional[str] = Query(None, description="Filter by influence type"),
    lga_id: Optional[str] = Query(None, description="Filter by LGA"),
    faction: Optional[str] = Query(None, description="Filter by faction"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all political actors with optional filtering.
    Returns actors filtered by tenant_id for multi-tenant isolation.
    """
    query = db.query(PoliticalActor).filter(
        PoliticalActor.tenant_id == current_user.tenant_id
    )
    
    # Apply filters
    if party:
        query = query.filter(PoliticalActor.party == party)
    if loyalty:
        query = query.filter(PoliticalActor.loyalty == loyalty)
    if influence_type:
        query = query.filter(PoliticalActor.influence_type == influence_type)
    if lga_id:
        query = query.filter(PoliticalActor.lga_id == lga_id)
    if faction:
        query = query.filter(PoliticalActor.faction == faction)
    
    actors = query.all()
    return [convert_actor_to_response(actor) for actor in actors]


@router.get("/{actor_id}", response_model=PoliticalActorResponse)
def get_political_actor(
    actor_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific political actor by ID"""
    actor = db.query(PoliticalActor).filter(
        PoliticalActor.id == actor_id,
        PoliticalActor.tenant_id == current_user.tenant_id
    ).first()
    
    if not actor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Political actor not found"
        )
    
    return convert_actor_to_response(actor)


@router.post("/", response_model=PoliticalActorResponse, status_code=status.HTTP_201_CREATED)
def create_political_actor(
    actor: PoliticalActorCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new political actor"""
    db_actor = PoliticalActor(
        id=uuid.uuid4(),
        tenant_id=current_user.tenant_id,
        full_name=actor.full_name,
        title=actor.title,
        party=actor.party,
        lga_id=actor.lga_id,
        influence_type=actor.influence_type,
        influence_level=actor.influence_level,
        loyalty=actor.loyalty,
        faction=actor.faction,
        vulnerability_notes=actor.vulnerability_notes,
        contact_info=actor.contact_info,
        notes=actor.notes
    )
    
    db.add(db_actor)
    db.commit()
    db.refresh(db_actor)
    
    return convert_actor_to_response(db_actor)


@router.patch("/{actor_id}", response_model=PoliticalActorResponse)
def update_political_actor(
    actor_id: str,
    actor_update: PoliticalActorUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing political actor"""
    actor = db.query(PoliticalActor).filter(
        PoliticalActor.id == actor_id,
        PoliticalActor.tenant_id == current_user.tenant_id
    ).first()
    
    if not actor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Political actor not found"
        )
    
    # Update fields if provided
    update_data = actor_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(actor, field, value)
    
    db.commit()
    db.refresh(actor)
    
    return convert_actor_to_response(actor)


@router.delete("/{actor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_political_actor(
    actor_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a political actor"""
    actor = db.query(PoliticalActor).filter(
        PoliticalActor.id == actor_id,
        PoliticalActor.tenant_id == current_user.tenant_id
    ).first()
    
    if not actor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Political actor not found"
        )
    
    db.delete(actor)
    db.commit()
    
    return None


@router.get("/network/data")
def get_network_data(
    lga_id: Optional[str] = Query(None, description="Filter by LGA"),
    party: Optional[str] = Query(None, description="Filter by party"),
    faction: Optional[str] = Query(None, description="Filter by faction"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get network graph data for visualization.
    Returns nodes (actors) and edges (connections) for D3.js or vis-network.
    """
    query = db.query(PoliticalActor).filter(
        PoliticalActor.tenant_id == current_user.tenant_id
    )
    
    if lga_id:
        query = query.filter(PoliticalActor.lga_id == lga_id)
    if party:
        query = query.filter(PoliticalActor.party == party)
    if faction:
        query = query.filter(PoliticalActor.faction == faction)
    
    actors = query.all()
    
    # Build nodes
    nodes = []
    for actor in actors:
        nodes.append({
            "id": str(actor.id),
            "name": actor.full_name,
            "party": actor.party,
            "loyalty": actor.loyalty,
            "influence_level": actor.influence_level or 5,
            "influence_type": actor.influence_type,
            "faction": actor.faction,
            "lga_id": actor.lga_id
        })
    
    # Build edges (simplified - in production, you'd have a connections table)
    # For now, create edges based on same LGA or faction
    edges = []
    actor_list = list(actors)
    for i, actor1 in enumerate(actor_list):
        for actor2 in actor_list[i+1:]:
            if (actor1.lga_id and actor1.lga_id == actor2.lga_id) or \
               (actor1.faction and actor1.faction == actor2.faction):
                edges.append({
                    "source": str(actor1.id),
                    "target": str(actor2.id),
                    "type": "same_lga" if actor1.lga_id == actor2.lga_id else "same_faction"
                })
    
    return {
        "nodes": nodes,
        "edges": edges,
        "total_nodes": len(nodes),
        "total_edges": len(edges)
    }


@router.get("/lga/{lga_id}/top-actors")
def get_top_actors_by_lga(
    lga_id: str,
    limit: int = Query(5, ge=1, le=20),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get top N political actors in a specific LGA.
    Used for LGA power map drill-down.
    """
    actors = db.query(PoliticalActor).filter(
        PoliticalActor.tenant_id == current_user.tenant_id,
        PoliticalActor.lga_id == lga_id
    ).order_by(
        PoliticalActor.influence_level.desc()
    ).limit(limit).all()
    
    return {
        "lga_id": lga_id,
        "total_actors": len(actors),
        "actors": [convert_actor_to_response(actor) for actor in actors]
    }


@router.get("/stats/overview")
def get_political_atlas_stats(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get overview statistics for the Political Atlas dashboard.
    """
    from sqlalchemy import func
    
    # Total actors
    total_actors = db.query(PoliticalActor).filter(
        PoliticalActor.tenant_id == current_user.tenant_id
    ).count()
    
    # By loyalty
    loyalty_counts = db.query(
        PoliticalActor.loyalty,
        func.count(PoliticalActor.id)
    ).filter(
        PoliticalActor.tenant_id == current_user.tenant_id
    ).group_by(PoliticalActor.loyalty).all()
    
    # By party
    party_counts = db.query(
        PoliticalActor.party,
        func.count(PoliticalActor.id)
    ).filter(
        PoliticalActor.tenant_id == current_user.tenant_id
    ).group_by(PoliticalActor.party).all()
    
    # Average influence level
    avg_influence = db.query(
        func.avg(PoliticalActor.influence_level)
    ).filter(
        PoliticalActor.tenant_id == current_user.tenant_id,
        PoliticalActor.influence_level != None
    ).scalar()
    
    return {
        "total_actors": total_actors,
        "loyalty_distribution": {loyalty: count for loyalty, count in loyalty_counts if loyalty},
        "party_distribution": {party: count for party, count in party_counts if party},
        "average_influence_level": round(float(avg_influence), 2) if avg_influence else 0
    }