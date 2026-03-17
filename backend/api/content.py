"""
Content API - Task 2.5
Content Management and Messaging Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from models import ContentItem, MessageLog
from auth.utils import get_current_user
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/content", tags=["Content"])


# Pydantic Models
class ContentItemCreate(BaseModel):
    title: str
    body: Optional[str] = None
    content_type: str  # social_post, infographic, voice_note, video, radio_script, ussd_message
    platform: Optional[str] = None  # tiktok, instagram, whatsapp, ussd, radio, all
    language: str = "ha"
    media_url: Optional[str] = None
    scheduled_at: Optional[datetime] = None


class ContentItemUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    content_type: Optional[str] = None
    platform: Optional[str] = None
    language: Optional[str] = None
    media_url: Optional[str] = None
    status: Optional[str] = None  # draft, approved, published, archived
    scheduled_at: Optional[datetime] = None


class ContentItemResponse(BaseModel):
    id: str
    tenant_id: str
    title: str
    body: Optional[str]
    content_type: str
    platform: Optional[str]
    language: str
    media_url: Optional[str]
    status: str
    scheduled_at: Optional[str]
    published_at: Optional[str]
    engagement: Optional[dict]
    created_by: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


class MessageSendRequest(BaseModel):
    channel: str  # ussd, sms, whatsapp
    content_id: Optional[str] = None
    custom_message: Optional[str] = None
    target_lgas: Optional[List[str]] = None
    target_demographics: Optional[dict] = None
    schedule_for: Optional[datetime] = None


class MessageResponse(BaseModel):
    id: str
    tenant_id: str
    channel: str
    template_name: Optional[str]
    recipients_count: int
    delivered: int
    read_count: int
    reply_count: int
    sent_at: str

    class Config:
        from_attributes = True


def convert_content_to_response(item: ContentItem) -> ContentItemResponse:
    """Convert ContentItem model to response schema"""
    return ContentItemResponse(
        id=str(item.id),
        tenant_id=item.tenant_id,
        title=item.title,
        body=item.body,
        content_type=item.content_type,
        platform=item.platform,
        language=item.language,
        media_url=item.media_url,
        status=item.status,
        scheduled_at=item.scheduled_at.isoformat() if item.scheduled_at else None,
        published_at=item.published_at.isoformat() if item.published_at else None,
        engagement=item.engagement,
        created_by=str(item.created_by) if item.created_by else None,
        created_at=item.created_at.isoformat() if item.created_at else None
    )


def convert_message_to_response(msg: MessageLog) -> MessageResponse:
    """Convert MessageLog model to response schema"""
    return MessageResponse(
        id=str(msg.id),
        tenant_id=msg.tenant_id,
        channel=msg.channel,
        template_name=msg.template_name,
        recipients_count=msg.recipients_count or 0,
        delivered=msg.delivered or 0,
        read_count=msg.read_count or 0,
        reply_count=msg.reply_count or 0,
        sent_at=msg.sent_at.isoformat() if msg.sent_at else None
    )


@router.get("/items", response_model=List[ContentItemResponse])
def list_content_items(
    status: Optional[str] = Query(None, description="Filter by status"),
    content_type: Optional[str] = Query(None, description="Filter by content type"),
    platform: Optional[str] = Query(None, description="Filter by platform"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all content items with optional filtering.
    """
    query = db.query(ContentItem).filter(
        ContentItem.tenant_id == current_user.tenant_id
    )
    
    if status:
        query = query.filter(ContentItem.status == status)
    if content_type:
        query = query.filter(ContentItem.content_type == content_type)
    if platform:
        query = query.filter(ContentItem.platform == platform)
    
    items = query.order_by(ContentItem.created_at.desc()).all()
    return [convert_content_to_response(item) for item in items]


@router.get("/items/{item_id}", response_model=ContentItemResponse)
def get_content_item(
    item_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific content item by ID"""
    item = db.query(ContentItem).filter(
        ContentItem.id == item_id,
        ContentItem.tenant_id == current_user.tenant_id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content item not found"
        )
    
    return convert_content_to_response(item)


@router.post("/items", response_model=ContentItemResponse, status_code=status.HTTP_201_CREATED)
def create_content_item(
    item: ContentItemCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new content item"""
    db_item = ContentItem(
        id=uuid.uuid4(),
        tenant_id=current_user.tenant_id,
        title=item.title,
        body=item.body,
        content_type=item.content_type,
        platform=item.platform,
        language=item.language,
        media_url=item.media_url,
        status="draft",
        scheduled_at=item.scheduled_at,
        engagement={},
        created_by=current_user.id
    )
    
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    return convert_content_to_response(db_item)


@router.patch("/items/{item_id}", response_model=ContentItemResponse)
def update_content_item(
    item_id: str,
    item_update: ContentItemUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing content item"""
    item = db.query(ContentItem).filter(
        ContentItem.id == item_id,
        ContentItem.tenant_id == current_user.tenant_id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content item not found"
        )
    
    # Update fields if provided
    update_data = item_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    
    return convert_content_to_response(item)


@router.post("/items/{item_id}/publish", response_model=ContentItemResponse)
def publish_content_item(
    item_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Publish a content item"""
    item = db.query(ContentItem).filter(
        ContentItem.id == item_id,
        ContentItem.tenant_id == current_user.tenant_id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content item not found"
        )
    
    item.status = "published"
    item.published_at = datetime.utcnow()
    
    db.commit()
    db.refresh(item)
    
    return convert_content_to_response(item)


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_content_item(
    item_id: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a content item"""
    item = db.query(ContentItem).filter(
        ContentItem.id == item_id,
        ContentItem.tenant_id == current_user.tenant_id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content item not found"
        )
    
    db.delete(item)
    db.commit()
    
    return None


@router.get("/calendar")
def get_content_calendar(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get content calendar view.
    Returns scheduled content items grouped by date.
    """
    query = db.query(ContentItem).filter(
        ContentItem.tenant_id == current_user.tenant_id,
        ContentItem.scheduled_at != None
    )
    
    if start_date:
        query = query.filter(ContentItem.scheduled_at >= start_date)
    if end_date:
        query = query.filter(ContentItem.scheduled_at <= end_date)
    
    items = query.order_by(ContentItem.scheduled_at).all()
    
    # Group by date
    calendar = {}
    for item in items:
        date_key = item.scheduled_at.strftime("%Y-%m-%d") if item.scheduled_at else "unscheduled"
        if date_key not in calendar:
            calendar[date_key] = []
        calendar[date_key].append(convert_content_to_response(item))
    
    return {
        "calendar": calendar,
        "total_scheduled": len(items)
    }


@router.post("/messaging/send", response_model=MessageResponse)
def send_message(
    request: MessageSendRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send broadcast message to target audience.
    """
    # Get content if content_id provided
    content = None
    if request.content_id:
        content = db.query(ContentItem).filter(
            ContentItem.id == request.content_id,
            ContentItem.tenant_id == current_user.tenant_id
        ).first()
        
        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content item not found"
            )
    
    # Calculate estimated reach (simplified - in production would query voter database)
    estimated_reach = 1000  # Placeholder
    
    # Create message log
    message = MessageLog(
        id=uuid.uuid4(),
        tenant_id=current_user.tenant_id,
        channel=request.channel,
        template_name=content.title if content else None,
        recipients_count=estimated_reach,
        lga_filter=request.target_lgas,
        segment_filter=request.target_demographics,
        sent_by=current_user.id,
        sent_at=datetime.utcnow() if not request.schedule_for else request.schedule_for
    )
    
    db.add(message)
    db.commit()
    db.refresh(message)
    
    return convert_message_to_response(message)


@router.get("/messaging/history", response_model=List[MessageResponse])
def get_messaging_history(
    channel: Optional[str] = Query(None, description="Filter by channel"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get messaging history.
    """
    query = db.query(MessageLog).filter(
        MessageLog.tenant_id == current_user.tenant_id
    )
    
    if channel:
        query = query.filter(MessageLog.channel == channel)
    
    messages = query.order_by(MessageLog.sent_at.desc()).all()
    return [convert_message_to_response(msg) for msg in messages]


@router.get("/messaging/stats")
def get_messaging_stats(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get messaging statistics.
    """
    from sqlalchemy import func
    
    # Stats by channel
    channel_stats = db.query(
        MessageLog.channel,
        func.count(MessageLog.id),
        func.sum(MessageLog.recipients_count),
        func.sum(MessageLog.delivered),
        func.sum(MessageLog.read_count)
    ).filter(
        MessageLog.tenant_id == current_user.tenant_id
    ).group_by(MessageLog.channel).all()
    
    stats = []
    for channel, count, recipients, delivered, read_count in channel_stats:
        delivery_rate = (delivered / recipients * 100) if recipients and recipients > 0 else 0
        read_rate = (read_count / delivered * 100) if delivered and delivered > 0 else 0
        
        stats.append({
            "channel": channel,
            "total_messages": count,
            "total_recipients": recipients or 0,
            "total_delivered": delivered or 0,
            "total_read": read_count or 0,
            "delivery_rate": round(delivery_rate, 2),
            "read_rate": round(read_rate, 2)
        })
    
    return {
        "channel_stats": stats,
        "total_messages": sum(s["total_messages"] for s in stats)
    }