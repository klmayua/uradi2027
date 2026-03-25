"""
Notifications API Module
Handles user notifications, alerts, and notification preferences
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime, timedelta
from uuid import UUID, uuid4

from utils.auth import get_current_user, require_permissions
from models import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])


# ============ Pydantic Models ============

class NotificationCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1, max_length=1000)
    type: Literal["info", "success", "warning", "error", "alert"] = "info"
    category: Literal["system", "election", "security", "campaign", "general"] = "general"
    link: Optional[str] = None
    recipient_ids: Optional[List[UUID]] = None  # None = broadcast to all


class NotificationResponse(BaseModel):
    id: UUID
    title: str
    message: str
    type: str
    category: str
    link: Optional[str]
    is_read: bool
    read_at: Optional[datetime]
    created_at: datetime
    sender_name: Optional[str]


class NotificationList(BaseModel):
    notifications: List[NotificationResponse]
    unread_count: int
    total_count: int


class NotificationPreferences(BaseModel):
    email_enabled: bool = True
    push_enabled: bool = True
    sms_enabled: bool = False
    election_alerts: bool = True
    security_alerts: bool = True
    campaign_updates: bool = True
    system_notifications: bool = True
    digest_frequency: Literal["immediate", "hourly", "daily", "weekly"] = "immediate"


class MarkReadRequest(BaseModel):
    notification_ids: List[UUID]


# ============ Mock Data Store ============

NOTIFICATIONS_DB = {}
USER_NOTIFICATIONS_DB = {}  # user_id -> list of notification_ids
NOTIFICATION_PREFERENCES_DB = {}

# Seed some notifications
_seed_notifications = [
    {
        "id": uuid4(),
        "title": "Welcome to Uradi2027",
        "message": "Your account has been created successfully. Explore the platform!",
        "type": "success",
        "category": "system",
        "link": "/dashboard",
        "is_broadcast": True,
        "created_at": datetime.now() - timedelta(days=7),
        "sender_name": "System"
    },
    {
        "id": uuid4(),
        "title": "Election Day Approaching",
        "message": "The governorship election is scheduled for March 15, 2027. Prepare your monitoring teams.",
        "type": "info",
        "category": "election",
        "link": "/mother-portal/election-day",
        "is_broadcast": True,
        "created_at": datetime.now() - timedelta(days=2),
        "sender_name": "Election Committee"
    },
    {
        "id": uuid4(),
        "title": "Security Alert: Kano Central",
        "message": "Increased security presence reported in Kano Central LGA. Exercise caution.",
        "type": "warning",
        "category": "security",
        "link": "/incidents",
        "is_broadcast": False,
        "recipient_ids": [],
        "created_at": datetime.now() - timedelta(hours=4),
        "sender_name": "Security Team"
    },
]

for notif in _seed_notifications:
    NOTIFICATIONS_DB[notif["id"]] = notif


# ============ API Endpoints ============

@router.get("/", response_model=NotificationList)
async def get_notifications(
    unread_only: bool = False,
    category: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user)
):
    """Get notifications for the current user"""
    user_notifs = []

    for notif_id, notif in NOTIFICATIONS_DB.items():
        # Include if broadcast or specifically for user
        if notif.get("is_broadcast") or current_user.id in notif.get("recipient_ids", []):
            # Apply filters
            if unread_only and notif.get("read_by", {}).get(str(current_user.id), False):
                continue
            if category and notif.get("category") != category:
                continue

            user_notifs.append({
                "id": notif["id"],
                "title": notif["title"],
                "message": notif["message"],
                "type": notif["type"],
                "category": notif["category"],
                "link": notif.get("link"),
                "is_read": notif.get("read_by", {}).get(str(current_user.id), False),
                "read_at": notif.get("read_by", {}).get(f"{current_user.id}_at"),
                "created_at": notif["created_at"],
                "sender_name": notif.get("sender_name")
            })

    # Sort by created_at descending
    user_notifs.sort(key=lambda x: x["created_at"], reverse=True)

    total_count = len(user_notifs)
    unread_count = sum(1 for n in user_notifs if not n["is_read"])

    # Apply pagination
    paginated = user_notifs[offset:offset + limit]

    return {
        "notifications": paginated,
        "unread_count": unread_count,
        "total_count": total_count
    }


@router.post("/mark-read", response_model=dict)
async def mark_notifications_read(
    request: MarkReadRequest,
    current_user: User = Depends(get_current_user)
):
    """Mark specific notifications as read"""
    marked_count = 0
    now = datetime.now()

    for notif_id in request.notification_ids:
        if notif_id in NOTIFICATIONS_DB:
            notif = NOTIFICATIONS_DB[notif_id]
            if "read_by" not in notif:
                notif["read_by"] = {}
            notif["read_by"][str(current_user.id)] = True
            notif["read_by"][f"{current_user.id}_at"] = now
            marked_count += 1

    return {"message": f"Marked {marked_count} notifications as read"}


@router.post("/mark-all-read", response_model=dict)
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read"""
    now = datetime.now()
    marked_count = 0

    for notif in NOTIFICATIONS_DB.values():
        if notif.get("is_broadcast") or current_user.id in notif.get("recipient_ids", []):
            if "read_by" not in notif:
                notif["read_by"] = {}
            if not notif["read_by"].get(str(current_user.id), False):
                notif["read_by"][str(current_user.id)] = True
                notif["read_by"][f"{current_user.id}_at"] = now
                marked_count += 1

    return {"message": f"Marked {marked_count} notifications as read"}


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: UUID,
    current_user: User = Depends(require_permissions(["admin", "mother_portal"]))
):
    """Delete a notification (admin only)"""
    if notification_id not in NOTIFICATIONS_DB:
        raise HTTPException(status_code=404, detail="Notification not found")

    del NOTIFICATIONS_DB[notification_id]
    return {"message": "Notification deleted"}


@router.post("/send", response_model=dict)
async def send_notification(
    notification: NotificationCreate,
    current_user: User = Depends(require_permissions(["admin", "mother_portal", "communications"]))
):
    """Send a notification to users"""
    notif_id = uuid4()

    NOTIFICATIONS_DB[notif_id] = {
        "id": notif_id,
        "title": notification.title,
        "message": notification.message,
        "type": notification.type,
        "category": notification.category,
        "link": notification.link,
        "is_broadcast": notification.recipient_ids is None,
        "recipient_ids": notification.recipient_ids or [],
        "created_at": datetime.now(),
        "sender_name": current_user.full_name,
        "read_by": {}
    }

    recipient_count = len(notification.recipient_ids) if notification.recipient_ids else "all users"

    return {
        "message": "Notification sent successfully",
        "notification_id": notif_id,
        "recipients": recipient_count
    }


@router.get("/preferences", response_model=NotificationPreferences)
async def get_notification_preferences(
    current_user: User = Depends(get_current_user)
):
    """Get user's notification preferences"""
    return NOTIFICATION_PREFERENCES_DB.get(str(current_user.id), NotificationPreferences())


@router.put("/preferences", response_model=NotificationPreferences)
async def update_notification_preferences(
    preferences: NotificationPreferences,
    current_user: User = Depends(get_current_user)
):
    """Update user's notification preferences"""
    NOTIFICATION_PREFERENCES_DB[str(current_user.id)] = preferences
    return preferences


@router.get("/stats")
async def get_notification_stats(
    current_user: User = Depends(require_permissions(["admin", "mother_portal"]))
):
    """Get notification system statistics"""
    total = len(NOTIFICATIONS_DB)
    by_type = {}
    by_category = {}

    for notif in NOTIFICATIONS_DB.values():
        notif_type = notif.get("type", "unknown")
        category = notif.get("category", "unknown")
        by_type[notif_type] = by_type.get(notif_type, 0) + 1
        by_category[category] = by_category.get(category, 0) + 1

    return {
        "total_notifications": total,
        "by_type": by_type,
        "by_category": by_category,
        "broadcast_count": sum(1 for n in NOTIFICATIONS_DB.values() if n.get("is_broadcast"))
    }
