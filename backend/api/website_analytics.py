"""
Website Analytics API Module
Handles website traffic analytics and metrics
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from uuid import UUID

from utils.auth import get_current_user, require_permissions
from models import User

router = APIRouter(prefix="/analytics/website", tags=["Website Analytics"])


# ============ Pydantic Models ============

class PageViewStats(BaseModel):
    page_path: str
    views: int
    unique_visitors: int
    avg_time_on_page: int  # seconds
    bounce_rate: float  # percentage


class TrafficSource(BaseModel):
    source: str
    visitors: int
    percentage: float


class DeviceStats(BaseModel):
    device_type: str  # desktop, mobile, tablet
    visitors: int
    percentage: float


class GeographicStats(BaseModel):
    country: str
    region: Optional[str]
    visitors: int
    percentage: float


class TimeSeriesData(BaseModel):
    date: str
    visitors: int
    page_views: int
    sessions: int


class AnalyticsOverview(BaseModel):
    total_visitors: int
    total_page_views: int
    avg_session_duration: int
    bounce_rate: float
    new_visitors: int
    returning_visitors: int
    date_range: Dict[str, str]


class ConversionEvent(BaseModel):
    event_name: str
    count: int
    conversion_rate: float


class RealTimeStats(BaseModel):
    active_visitors: int
    top_pages: List[Dict[str, Any]]
    top_locations: List[Dict[str, Any]]


# ============ Mock Data Store ============

ANALYTICS_DB = {
    "page_views": [
        {"page_path": "/", "views": 15420, "unique_visitors": 8750, "avg_time_on_page": 145, "bounce_rate": 35.2},
        {"page_path": "/citizen", "views": 12300, "unique_visitors": 6800, "avg_time_on_page": 180, "bounce_rate": 28.5},
        {"page_path": "/citizen/donate", "views": 8900, "unique_visitors": 5200, "avg_time_on_page": 210, "bounce_rate": 22.1},
        {"page_path": "/citizen/volunteer", "views": 7600, "unique_visitors": 4100, "avg_time_on_page": 195, "bounce_rate": 25.8},
        {"page_path": "/candidate/overview", "views": 5400, "unique_visitors": 3200, "avg_time_on_page": 165, "bounce_rate": 32.4},
        {"page_path": "/careers", "views": 4200, "unique_visitors": 2800, "avg_time_on_page": 150, "bounce_rate": 38.7},
        {"page_path": "/help", "views": 3800, "unique_visitors": 2400, "avg_time_on_page": 120, "bounce_rate": 45.2},
        {"page_path": "/login", "views": 12000, "unique_visitors": 8900, "avg_time_on_page": 45, "bounce_rate": 65.0},
    ],
    "traffic_sources": [
        {"source": "Organic Search", "visitors": 15200, "percentage": 38.5},
        {"source": "Social Media", "visitors": 12400, "percentage": 31.4},
        {"source": "Direct", "visitors": 6800, "percentage": 17.2},
        {"source": "Referral", "visitors": 3200, "percentage": 8.1},
        {"source": "Email", "visitors": 1800, "percentage": 4.6},
        {"source": "Paid Ads", "visitors": 80, "percentage": 0.2},
    ],
    "devices": [
        {"device_type": "Mobile", "visitors": 22400, "percentage": 56.7},
        {"device_type": "Desktop", "visitors": 14800, "percentage": 37.5},
        {"device_type": "Tablet", "visitors": 2280, "percentage": 5.8},
    ],
    "geography": [
        {"country": "Nigeria", "region": "Lagos", "visitors": 18600, "percentage": 47.1},
        {"country": "Nigeria", "region": "Abuja", "visitors": 8400, "percentage": 21.3},
        {"country": "Nigeria", "region": "Kano", "visitors": 5200, "percentage": 13.2},
        {"country": "Nigeria", "region": "Rivers", "visitors": 2800, "percentage": 7.1},
        {"country": "Nigeria", "region": "Other", "visitors": 4400, "percentage": 11.1},
    ],
    "conversions": [
        {"event_name": "volunteer_signup", "count": 1240, "conversion_rate": 30.2},
        {"event_name": "donation_initiated", "count": 890, "conversion_rate": 17.1},
        {"event_name": "donation_completed", "count": 650, "conversion_rate": 12.5},
        {"event_name": "newsletter_signup", "count": 2100, "conversion_rate": 5.3},
        {"event_name": "account_created", "count": 3200, "conversion_rate": 26.7},
        {"event_name": "event_rsvp", "count": 1850, "conversion_rate": 24.3},
    ],
    "time_series": []
}

# Generate 30 days of time series data
for i in range(30):
    date = datetime.now() - timedelta(days=29-i)
    base_visitors = 1000 + (i * 20)  # Trending upward
    ANALYTICS_DB["time_series"].append({
        "date": date.strftime("%Y-%m-%d"),
        "visitors": base_visitors + (100 if i % 7 < 5 else -100),  # Weekend dip
        "page_views": int(base_visitors * 2.5),
        "sessions": int(base_visitors * 0.8)
    })


# ============ API Endpoints ============

@router.get("/overview", response_model=AnalyticsOverview)
async def get_analytics_overview(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(require_permissions(["admin", "mother_portal", "analytics"]))
):
    """Get website analytics overview"""
    # Get time series for the date range
    series_data = ANALYTICS_DB["time_series"][-days:]

    total_visitors = sum(d["visitors"] for d in series_data)
    total_page_views = sum(d["page_views"] for d in series_data)
    total_sessions = sum(d["sessions"] for d in series_data)

    # Calculate percentages (mock data)
    new_visitors = int(total_visitors * 0.65)
    returning_visitors = total_visitors - new_visitors

    return {
        "total_visitors": total_visitors,
        "total_page_views": total_page_views,
        "avg_session_duration": 180,  # 3 minutes
        "bounce_rate": 32.5,
        "new_visitors": new_visitors,
        "returning_visitors": returning_visitors,
        "date_range": {
            "start": (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d"),
            "end": datetime.now().strftime("%Y-%m-%d")
        }
    }


@router.get("/pages", response_model=List[PageViewStats])
async def get_page_analytics(
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_permissions(["admin", "mother_portal", "analytics"]))
):
    """Get analytics for specific pages"""
    pages = ANALYTICS_DB["page_views"][:limit]
    return pages


@router.get("/traffic-sources", response_model=List[TrafficSource])
async def get_traffic_sources(
    current_user: User = Depends(require_permissions(["admin", "mother_portal", "analytics"]))
):
    """Get traffic source breakdown"""
    return ANALYTICS_DB["traffic_sources"]


@router.get("/devices", response_model=List[DeviceStats])
async def get_device_stats(
    current_user: User = Depends(require_permissions(["admin", "mother_portal", "analytics"]))
):
    """Get device type breakdown"""
    return ANALYTICS_DB["devices"]


@router.get("/geography", response_model=List[GeographicStats])
async def get_geographic_stats(
    current_user: User = Depends(require_permissions(["admin", "mother_portal", "analytics"]))
):
    """Get geographic visitor distribution"""
    return ANALYTICS_DB["geography"]


@router.get("/time-series")
async def get_time_series_data(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(require_permissions(["admin", "mother_portal", "analytics"]))
):
    """Get time series analytics data"""
    return ANALYTICS_DB["time_series"][-days:]


@router.get("/conversions", response_model=List[ConversionEvent])
async def get_conversion_analytics(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(require_permissions(["admin", "mother_portal", "analytics"]))
):
    """Get conversion event analytics"""
    return ANALYTICS_DB["conversions"]


@router.get("/realtime", response_model=RealTimeStats)
async def get_realtime_stats(
    current_user: User = Depends(require_permissions(["admin", "mother_portal", "analytics"]))
):
    """Get real-time visitor statistics"""
    return {
        "active_visitors": 247,
        "top_pages": [
            {"path": "/citizen", "active_users": 45},
            {"path": "/", "active_users": 38},
            {"path": "/citizen/donate", "active_users": 32},
            {"path": "/citizen/volunteer", "active_users": 28},
            {"path": "/login", "active_users": 25},
        ],
        "top_locations": [
            {"location": "Lagos, Nigeria", "active_users": 78},
            {"location": "Abuja, Nigeria", "active_users": 42},
            {"location": "Kano, Nigeria", "active_users": 31},
            {"location": "Port Harcourt, Nigeria", "active_users": 18},
            {"location": "Ibadan, Nigeria", "active_users": 15},
        ]
    }


@router.get("/export")
async def export_analytics(
    format: str = Query("json", regex="^(json|csv)$"),
    report_type: str = Query("full", regex="^(full|traffic|conversions|pages)$"),
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(require_permissions(["admin", "mother_portal"]))
):
    """Export analytics data"""
    overview = await get_analytics_overview(days=days, current_user=current_user)

    export_data = {
        "generated_at": datetime.now().isoformat(),
        "report_type": report_type,
        "date_range_days": days,
        "overview": overview,
    }

    if report_type in ["full", "traffic"]:
        export_data["traffic_sources"] = ANALYTICS_DB["traffic_sources"]
        export_data["devices"] = ANALYTICS_DB["devices"]
        export_data["geography"] = ANALYTICS_DB["geography"]

    if report_type in ["full", "conversions"]:
        export_data["conversions"] = ANALYTICS_DB["conversions"]

    if report_type in ["full", "pages"]:
        export_data["page_views"] = ANALYTICS_DB["page_views"]

    if report_type == "full":
        export_data["time_series"] = ANALYTICS_DB["time_series"][-days:]

    return {
        "format": format,
        "data": export_data,
        "download_url": f"/api/analytics/website/download?format={format}"
    }


@router.post("/events/track")
async def track_event(
    event_name: str,
    properties: Optional[Dict[str, Any]] = None,
    current_user: User = Depends(get_current_user)
):
    """Track a custom analytics event"""
    # In a real app, this would save to analytics database
    return {
        "event": event_name,
        "tracked": True,
        "timestamp": datetime.now().isoformat()
    }


@router.get("/portal/{portal_name}")
async def get_portal_analytics(
    portal_name: str,
    days: int = Query(30, ge=1, le=90),
    current_user: User = Depends(require_permissions(["admin", "mother_portal", "analytics"]))
):
    """Get analytics for a specific portal (citizen, candidate, field, etc.)"""
    portal_paths = {
        "citizen": ["/citizen", "/citizen/donate", "/citizen/volunteer", "/citizen/events"],
        "candidate": ["/candidate", "/candidate/overview", "/candidate/vision"],
        "field": ["/field", "/mobile"],
        "mother_portal": ["/mother-portal"],
    }

    paths = portal_paths.get(portal_name, [])

    # Filter page views for this portal
    portal_pages = [p for p in ANALYTICS_DB["page_views"] if any(p["page_path"].startswith(path) for path in paths)]

    total_views = sum(p["views"] for p in portal_pages)
    total_visitors = sum(p["unique_visitors"] for p in portal_pages)

    return {
        "portal": portal_name,
        "total_page_views": total_views,
        "total_unique_visitors": total_visitors,
        "top_pages": sorted(portal_pages, key=lambda x: x["views"], reverse=True)[:5],
        "date_range_days": days
    }


@router.get("/reports/daily")
async def get_daily_report(
    date: Optional[str] = None,
    current_user: User = Depends(require_permissions(["admin", "mother_portal"]))
):
    """Get daily analytics report"""
    if date is None:
        date = datetime.now().strftime("%Y-%m-%d")

    # Mock daily data
    return {
        "date": date,
        "visitors": 1240,
        "page_views": 3100,
        "sessions": 980,
        "avg_session_duration": 195,
        "bounce_rate": 31.2,
        "top_pages": [
            {"path": "/citizen", "views": 580},
            {"path": "/", "views": 420},
            {"path": "/citizen/volunteer", "views": 310},
        ],
        "conversions": {
            "volunteer_signups": 42,
            "donations": 28,
            "new_accounts": 56
        }
    }
