"""
Budget API - Task 2.6
Budget Transparency Engine for Citizen Portal
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from models import BudgetItem
from auth.utils import get_current_user
import uuid

router = APIRouter(prefix="/api/budget", tags=["Budget Transparency"])


# Pydantic Models
class BudgetItemCreate(BaseModel):
    fiscal_year: str
    sector: str
    category: str  # capital, recurrent
    description: str
    budgeted_amount: float
    lga_id: Optional[str] = None
    source: Optional[str] = None
    source_url: Optional[str] = None


class BudgetItemUpdate(BaseModel):
    fiscal_year: Optional[str] = None
    sector: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    budgeted_amount: Optional[float] = None
    released_amount: Optional[float] = None
    spent_amount: Optional[float] = None
    delivery_status: Optional[str] = None
    lga_id: Optional[str] = None


class BudgetItemResponse(BaseModel):
    id: str
    tenant_id: str
    fiscal_year: str
    sector: str
    category: str
    description: str
    budgeted_amount: float
    released_amount: float
    spent_amount: float
    delivery_status: str
    lga_id: Optional[str]
    source: Optional[str]
    source_url: Optional[str]
    notes: Optional[str]
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


def convert_budget_to_response(item: BudgetItem) -> BudgetItemResponse:
    """Convert BudgetItem model to response schema"""
    return BudgetItemResponse(
        id=str(item.id),
        tenant_id=item.tenant_id,
        fiscal_year=item.fiscal_year,
        sector=item.sector,
        category=item.category,
        description=item.description,
        budgeted_amount=item.budgeted_amount,
        released_amount=item.released_amount or 0,
        spent_amount=item.spent_amount or 0,
        delivery_status=item.delivery_status,
        lga_id=item.lga_id,
        source=item.source,
        source_url=item.source_url,
        notes=item.notes,
        created_at=item.created_at.isoformat() if item.created_at else None,
        updated_at=item.updated_at.isoformat() if item.updated_at else None
    )


@router.get("/items", response_model=List[BudgetItemResponse])
def list_budget_items(
    fiscal_year: Optional[str] = Query(None, description="Filter by fiscal year"),
    sector: Optional[str] = Query(None, description="Filter by sector"),
    category: Optional[str] = Query(None, description="Filter by category (capital/recurrent)"),
    lga_id: Optional[str] = Query(None, description="Filter by LGA"),
    delivery_status: Optional[str] = Query(None, description="Filter by delivery status"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all budget items with optional filtering.
    """
    query = db.query(BudgetItem).filter(
        BudgetItem.tenant_id == current_user.tenant_id
    )
    
    if fiscal_year:
        query = query.filter(BudgetItem.fiscal_year == fiscal_year)
    if sector:
        query = query.filter(BudgetItem.sector == sector)
    if category:
        query = query.filter(BudgetItem.category == category)
    if lga_id:
        query = query.filter(BudgetItem.lga_id == lga_id)
    if delivery_status:
        query = query.filter(BudgetItem.delivery_status == delivery_status)
    
    items = query.order_by(BudgetItem.sector, BudgetItem.description).all()
    return [convert_budget_to_response(item) for item in items]


@router.get("/items/{item_id}", response_model=BudgetItemResponse)
def get_budget_item(
    item_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific budget item by ID"""
    item = db.query(BudgetItem).filter(
        BudgetItem.id == item_id,
        BudgetItem.tenant_id == current_user.tenant_id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget item not found"
        )
    
    return convert_budget_to_response(item)


@router.post("/items", response_model=BudgetItemResponse, status_code=status.HTTP_201_CREATED)
def create_budget_item(
    item: BudgetItemCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new budget item"""
    db_item = BudgetItem(
        id=uuid.uuid4(),
        tenant_id=current_user.tenant_id,
        fiscal_year=item.fiscal_year,
        sector=item.sector,
        category=item.category,
        description=item.description,
        budgeted_amount=item.budgeted_amount,
        released_amount=0,
        spent_amount=0,
        delivery_status="not_started",
        lga_id=item.lga_id,
        source=item.source,
        source_url=item.source_url
    )
    
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    return convert_budget_to_response(db_item)


@router.patch("/items/{item_id}", response_model=BudgetItemResponse)
def update_budget_item(
    item_id: str,
    item_update: BudgetItemUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing budget item"""
    item = db.query(BudgetItem).filter(
        BudgetItem.id == item_id,
        BudgetItem.tenant_id == current_user.tenant_id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget item not found"
        )
    
    # Update fields if provided
    update_data = item_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    
    return convert_budget_to_response(item)


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget_item(
    item_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a budget item"""
    item = db.query(BudgetItem).filter(
        BudgetItem.id == item_id,
        BudgetItem.tenant_id == current_user.tenant_id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget item not found"
        )
    
    db.delete(item)
    db.commit()
    
    return None


@router.get("/overview")
def get_budget_overview(
    fiscal_year: Optional[str] = Query(None, description="Fiscal year"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get budget overview dashboard data.
    Returns key stats: total budget, % released, % spent, top spending sector.
    """
    from sqlalchemy import func
    
    # Default to current year if not specified
    if not fiscal_year:
        fiscal_year = "2026"  # Default
    
    query = db.query(BudgetItem).filter(
        BudgetItem.tenant_id == current_user.tenant_id,
        BudgetItem.fiscal_year == fiscal_year
    )
    
    # Calculate totals
    total_budgeted = db.query(func.sum(BudgetItem.budgeted_amount)).filter(
        BudgetItem.tenant_id == current_user.tenant_id,
        BudgetItem.fiscal_year == fiscal_year
    ).scalar() or 0
    
    total_released = db.query(func.sum(BudgetItem.released_amount)).filter(
        BudgetItem.tenant_id == current_user.tenant_id,
        BudgetItem.fiscal_year == fiscal_year
    ).scalar() or 0
    
    total_spent = db.query(func.sum(BudgetItem.spent_amount)).filter(
        BudgetItem.tenant_id == current_user.tenant_id,
        BudgetItem.fiscal_year == fiscal_year
    ).scalar() or 0
    
    # Calculate percentages
    percent_released = (total_released / total_budgeted * 100) if total_budgeted > 0 else 0
    percent_spent = (total_spent / total_released * 100) if total_released > 0 else 0
    
    # Get top spending sector
    sector_spending = db.query(
        BudgetItem.sector,
        func.sum(BudgetItem.spent_amount)
    ).filter(
        BudgetItem.tenant_id == current_user.tenant_id,
        BudgetItem.fiscal_year == fiscal_year
    ).group_by(BudgetItem.sector).order_by(func.sum(BudgetItem.spent_amount).desc()).first()
    
    top_sector = sector_spending[0] if sector_spending else None
    top_sector_amount = sector_spending[1] if sector_spending else 0
    
    return {
        "fiscal_year": fiscal_year,
        "total_budget": total_budgeted,
        "total_released": total_released,
        "total_spent": total_spent,
        "percent_released": round(percent_released, 2),
        "percent_spent": round(percent_spent, 2),
        "top_spending_sector": {
            "sector": top_sector,
            "amount": top_sector_amount
        } if top_sector else None
    }


@router.get("/by-sector")
def get_budget_by_sector(
    fiscal_year: Optional[str] = Query(None, description="Fiscal year"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get budget breakdown by sector.
    Returns sector cards with budget allocation.
    """
    from sqlalchemy import func
    
    if not fiscal_year:
        fiscal_year = "2026"
    
    sectors = db.query(
        BudgetItem.sector,
        func.sum(BudgetItem.budgeted_amount),
        func.sum(BudgetItem.released_amount),
        func.sum(BudgetItem.spent_amount),
        func.count(BudgetItem.id)
    ).filter(
        BudgetItem.tenant_id == current_user.tenant_id,
        BudgetItem.fiscal_year == fiscal_year
    ).group_by(BudgetItem.sector).order_by(func.sum(BudgetItem.budgeted_amount).desc()).all()
    
    sector_data = []
    for sector, budgeted, released, spent, count in sectors:
        release_rate = (released / budgeted * 100) if budgeted > 0 else 0
        spend_rate = (spent / released * 100) if released > 0 else 0
        
        # Determine status color
        if spend_rate >= 80:
            status = "good"
            color = "green"
        elif spend_rate >= 50:
            status = "moderate"
            color = "amber"
        else:
            status = "poor"
            color = "red"
        
        sector_data.append({
            "sector": sector,
            "budgeted": budgeted or 0,
            "released": released or 0,
            "spent": spent or 0,
            "item_count": count,
            "release_rate": round(release_rate, 2),
            "spend_rate": round(spend_rate, 2),
            "status": status,
            "color": color
        })
    
    return {
        "fiscal_year": fiscal_year,
        "sectors": sector_data,
        "total_sectors": len(sector_data)
    }


@router.get("/by-lga")
def get_budget_by_lga(
    fiscal_year: Optional[str] = Query(None, description="Fiscal year"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get budget allocation by LGA.
    Returns map data showing budget distribution.
    """
    from sqlalchemy import func
    
    if not fiscal_year:
        fiscal_year = "2026"
    
    lga_budgets = db.query(
        BudgetItem.lga_id,
        func.sum(BudgetItem.budgeted_amount),
        func.sum(BudgetItem.spent_amount)
    ).filter(
        BudgetItem.tenant_id == current_user.tenant_id,
        BudgetItem.fiscal_year == fiscal_year,
        BudgetItem.lga_id != None
    ).group_by(BudgetItem.lga_id).all()
    
    lga_data = []
    for lga_id, budgeted, spent in lga_budgets:
        utilization = (spent / budgeted * 100) if budgeted > 0 else 0
        
        lga_data.append({
            "lga_id": lga_id,
            "budgeted": budgeted or 0,
            "spent": spent or 0,
            "utilization_rate": round(utilization, 2)
        })
    
    return {
        "fiscal_year": fiscal_year,
        "lga_allocations": lga_data,
        "total_lgas": len(lga_data)
    }


@router.get("/explorer")
def get_budget_explorer(
    fiscal_year: Optional[str] = Query(None, description="Fiscal year"),
    sector: Optional[str] = Query(None, description="Filter by sector"),
    min_amount: Optional[float] = Query(None, description="Minimum amount"),
    max_amount: Optional[float] = Query(None, description="Maximum amount"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Budget explorer with search and filter.
    """
    query = db.query(BudgetItem).filter(
        BudgetItem.tenant_id == current_user.tenant_id
    )
    
    if fiscal_year:
        query = query.filter(BudgetItem.fiscal_year == fiscal_year)
    if sector:
        query = query.filter(BudgetItem.sector == sector)
    if min_amount is not None:
        query = query.filter(BudgetItem.budgeted_amount >= min_amount)
    if max_amount is not None:
        query = query.filter(BudgetItem.budgeted_amount <= max_amount)
    
    items = query.order_by(BudgetItem.budgeted_amount.desc()).all()
    
    return {
        "filters": {
            "fiscal_year": fiscal_year,
            "sector": sector,
            "min_amount": min_amount,
            "max_amount": max_amount
        },
        "total_items": len(items),
        "items": [convert_budget_to_response(item) for item in items]
    }


@router.get("/transparency-score")
def get_transparency_score(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Calculate budget transparency score.
    Based on data completeness and source attribution.
    """
    from sqlalchemy import func
    
    total_items = db.query(BudgetItem).filter(
        BudgetItem.tenant_id == current_user.tenant_id
    ).count()
    
    if total_items == 0:
        return {
            "score": 0,
            "rating": "No Data",
            "breakdown": {}
        }
    
    # Items with source attribution
    with_source = db.query(BudgetItem).filter(
        BudgetItem.tenant_id == current_user.tenant_id,
        BudgetItem.source != None
    ).count()
    
    # Items with source URL
    with_url = db.query(BudgetItem).filter(
        BudgetItem.tenant_id == current_user.tenant_id,
        BudgetItem.source_url != None
    ).count()
    
    # Items with spending data
    with_spending = db.query(BudgetItem).filter(
        BudgetItem.tenant_id == current_user.tenant_id,
        BudgetItem.spent_amount > 0
    ).count()
    
    # Calculate scores
    source_score = (with_source / total_items * 100)
    url_score = (with_url / total_items * 100)
    spending_score = (with_spending / total_items * 100)
    
    # Overall score (weighted)
    overall_score = (source_score * 0.4) + (url_score * 0.3) + (spending_score * 0.3)
    
    # Rating
    if overall_score >= 80:
        rating = "Excellent"
    elif overall_score >= 60:
        rating = "Good"
    elif overall_score >= 40:
        rating = "Fair"
    else:
        rating = "Needs Improvement"
    
    return {
        "score": round(overall_score, 2),
        "rating": rating,
        "breakdown": {
            "source_attribution": round(source_score, 2),
            "source_urls": round(url_score, 2),
            "spending_data": round(spending_score, 2)
        },
        "total_items": total_items,
        "items_with_source": with_source,
        "items_with_url": with_url,
        "items_with_spending": with_spending
    }