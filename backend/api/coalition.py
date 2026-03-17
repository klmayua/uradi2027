"""
Coalition API - Task 2.3
Coalition Management Dashboard Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from models import CoalitionPartner
from auth.utils import get_current_user
import uuid

router = APIRouter(prefix="/api/coalition", tags=["Coalition"])


# Pydantic Models
class CoalitionPartnerCreate(BaseModel):
    party: str
    leader_name: str
    commitment_level: Optional[int] = None
    lgas_responsible: Optional[List[str]] = None
    resources_pledged: Optional[dict] = None
    notes: Optional[str] = None


class CoalitionPartnerUpdate(BaseModel):
    party: Optional[str] = None
    leader_name: Optional[str] = None
    commitment_level: Optional[int] = None
    lgas_responsible: Optional[List[str]] = None
    resources_pledged: Optional[dict] = None
    resources_delivered: Optional[dict] = None
    health_status: Optional[str] = None
    notes: Optional[str] = None


class CoalitionPartnerResponse(BaseModel):
    id: str
    tenant_id: str
    party: str
    leader_name: str
    commitment_level: Optional[int]
    lgas_responsible: Optional[List[str]]
    resources_pledged: Optional[dict]
    resources_delivered: Optional[dict]
    health_status: str
    last_contact_at: Optional[str]
    notes: Optional[str]
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


def convert_partner_to_response(partner: CoalitionPartner) -> CoalitionPartnerResponse:
    """Convert CoalitionPartner model to response schema"""
    return CoalitionPartnerResponse(
        id=str(partner.id),
        tenant_id=partner.tenant_id,
        party=partner.party,
        leader_name=partner.leader_name,
        commitment_level=partner.commitment_level,
        lgas_responsible=partner.lgas_responsible,
        resources_pledged=partner.resources_pledged,
        resources_delivered=partner.resources_delivered,
        health_status=partner.health_status,
        last_contact_at=partner.last_contact_at.isoformat() if partner.last_contact_at else None,
        notes=partner.notes,
        created_at=partner.created_at.isoformat() if partner.created_at else None,
        updated_at=partner.updated_at.isoformat() if partner.updated_at else None
    )


@router.get("/partners", response_model=List[CoalitionPartnerResponse])
def list_coalition_partners(
    health_status: Optional[str] = Query(None, description="Filter by health status"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all coalition partners with optional filtering.
    """
    query = db.query(CoalitionPartner).filter(
        CoalitionPartner.tenant_id == current_user.tenant_id
    )
    
    if health_status:
        query = query.filter(CoalitionPartner.health_status == health_status)
    
    partners = query.all()
    return [convert_partner_to_response(partner) for partner in partners]


@router.get("/partners/{partner_id}", response_model=CoalitionPartnerResponse)
def get_coalition_partner(
    partner_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific coalition partner by ID"""
    partner = db.query(CoalitionPartner).filter(
        CoalitionPartner.id == partner_id,
        CoalitionPartner.tenant_id == current_user.tenant_id
    ).first()
    
    if not partner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coalition partner not found"
        )
    
    return convert_partner_to_response(partner)


@router.post("/partners", response_model=CoalitionPartnerResponse, status_code=status.HTTP_201_CREATED)
def create_coalition_partner(
    partner: CoalitionPartnerCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new coalition partner"""
    db_partner = CoalitionPartner(
        id=uuid.uuid4(),
        tenant_id=current_user.tenant_id,
        party=partner.party,
        leader_name=partner.leader_name,
        commitment_level=partner.commitment_level,
        lgas_responsible=partner.lgas_responsible,
        resources_pledged=partner.resources_pledged,
        resources_delivered={},
        health_status="stable",
        notes=partner.notes
    )
    
    db.add(db_partner)
    db.commit()
    db.refresh(db_partner)
    
    return convert_partner_to_response(db_partner)


@router.patch("/partners/{partner_id}", response_model=CoalitionPartnerResponse)
def update_coalition_partner(
    partner_id: str,
    partner_update: CoalitionPartnerUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing coalition partner"""
    partner = db.query(CoalitionPartner).filter(
        CoalitionPartner.id == partner_id,
        CoalitionPartner.tenant_id == current_user.tenant_id
    ).first()
    
    if not partner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coalition partner not found"
        )
    
    # Update fields if provided
    update_data = partner_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(partner, field, value)
    
    db.commit()
    db.refresh(partner)
    
    return convert_partner_to_response(partner)


@router.delete("/partners/{partner_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_coalition_partner(
    partner_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a coalition partner"""
    partner = db.query(CoalitionPartner).filter(
        CoalitionPartner.id == partner_id,
        CoalitionPartner.tenant_id == current_user.tenant_id
    ).first()
    
    if not partner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coalition partner not found"
        )
    
    db.delete(partner)
    db.commit()
    
    return None


@router.get("/overview")
def get_coalition_overview(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get coalition overview dashboard data.
    Returns partner cards, overall health, and resource metrics.
    """
    from sqlalchemy import func
    
    partners = db.query(CoalitionPartner).filter(
        CoalitionPartner.tenant_id == current_user.tenant_id
    ).all()
    
    # Calculate overall health
    total_partners = len(partners)
    if total_partners == 0:
        return {
            "total_partners": 0,
            "overall_health": "no_partners",
            "partners": []
        }
    
    # Health distribution
    health_counts = {"strong": 0, "stable": 0, "fragile": 0, "at_risk": 0}
    for partner in partners:
        if partner.health_status in health_counts:
            health_counts[partner.health_status] += 1
    
    # Determine overall health
    if health_counts["at_risk"] > total_partners * 0.3:
        overall_health = "critical"
    elif health_counts["fragile"] > total_partners * 0.3:
        overall_health = "concerning"
    elif health_counts["strong"] >= total_partners * 0.5:
        overall_health = "strong"
    else:
        overall_health = "stable"
    
    # Calculate resource metrics
    total_pledged = 0
    total_delivered = 0
    for partner in partners:
        if partner.resources_pledged:
            total_pledged += sum(partner.resources_pledged.values())
        if partner.resources_delivered:
            total_delivered += sum(partner.resources_delivered.values())
    
    delivery_rate = (total_delivered / total_pledged * 100) if total_pledged > 0 else 0
    
    return {
        "total_partners": total_partners,
        "overall_health": overall_health,
        "health_distribution": health_counts,
        "resources": {
            "total_pledged": total_pledged,
            "total_delivered": total_delivered,
            "delivery_rate": round(delivery_rate, 2),
            "remaining": total_pledged - total_delivered
        },
        "partners": [convert_partner_to_response(p) for p in partners]
    }


@router.get("/resources/allocation")
def get_resource_allocation(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get resource allocation dashboard data.
    Returns spending tracker and alerts for under-delivery.
    """
    partners = db.query(CoalitionPartner).filter(
        CoalitionPartner.tenant_id == current_user.tenant_id
    ).all()
    
    allocation_data = []
    alerts = []
    
    for partner in partners:
        pledged = partner.resources_pledged or {}
        delivered = partner.resources_delivered or {}
        
        # Calculate delivery percentage for each resource type
        partner_allocation = {
            "partner_id": str(partner.id),
            "party": partner.party,
            "leader": partner.leader_name,
            "resources": []
        }
        
        for resource_type, pledged_amount in pledged.items():
            delivered_amount = delivered.get(resource_type, 0)
            delivery_pct = (delivered_amount / pledged_amount * 100) if pledged_amount > 0 else 0
            
            partner_allocation["resources"].append({
                "type": resource_type,
                "pledged": pledged_amount,
                "delivered": delivered_amount,
                "remaining": pledged_amount - delivered_amount,
                "delivery_percentage": round(delivery_pct, 2)
            })
            
            # Alert if delivery is below 30%
            if delivery_pct < 30 and pledged_amount > 0:
                alerts.append({
                    "partner": partner.party,
                    "resource": resource_type,
                    "delivery_percentage": round(delivery_pct, 2),
                    "message": f"{partner.party} has delivered only {round(delivery_pct)}% of pledged {resource_type}"
                })
        
        allocation_data.append(partner_allocation)
    
    return {
        "allocations": allocation_data,
        "alerts": alerts,
        "alert_count": len(alerts)
    }


@router.get("/health/timeline")
def get_health_timeline(
    days: int = Query(30, ge=7, le=365),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get alliance health timeline data.
    Returns commitment levels over time per partner.
    """
    # In a real implementation, this would query historical data
    # For now, return current state as timeline data
    
    partners = db.query(CoalitionPartner).filter(
        CoalitionPartner.tenant_id == current_user.tenant_id
    ).all()
    
    timeline_data = []
    for partner in partners:
        timeline_data.append({
            "partner_id": str(partner.id),
            "party": partner.party,
            "current_commitment": partner.commitment_level,
            "health_status": partner.health_status,
            "last_contact": partner.last_contact_at.isoformat() if partner.last_contact_at else None
        })
    
    return {
        "days": days,
        "partners": timeline_data,
        "early_warnings": [
            {
                "partner": p.party,
                "issue": "Commitment level below 5",
                "recommendation": "Schedule high-level meeting"
            }
            for p in partners if p.commitment_level and p.commitment_level < 5
        ]
    }


@router.post("/partners/{partner_id}/contact")
def record_partner_contact(
    partner_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Record contact with a coalition partner.
    Updates last_contact_at timestamp.
    """
    from datetime import datetime
    
    partner = db.query(CoalitionPartner).filter(
        CoalitionPartner.id == partner_id,
        CoalitionPartner.tenant_id == current_user.tenant_id
    ).first()
    
    if not partner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coalition partner not found"
        )
    
    partner.last_contact_at = datetime.utcnow()
    db.commit()
    db.refresh(partner)
    
    return convert_partner_to_response(partner)