"""
Candidate Portal API Module
Handles candidate-facing pages and functionality
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime, timedelta
from uuid import UUID, uuid4

from utils.auth import get_current_user, require_permissions
from models import User

router = APIRouter(prefix="/candidate-portal", tags=["Candidate Portal"])


# ============ Pydantic Models ============

class OverviewStats(BaseModel):
    polling_percentage: float
    projected_votes: int
    confidence_level: str
    volunteer_count: int
    donation_total: float
    event_count: int


class SentimentMetrics(BaseModel):
    overall_score: float
    positive_percentage: float
    neutral_percentage: float
    negative_percentage: float
    trend: Literal["up", "down", "stable"]
    by_region: List[dict]


class BenchmarkData(BaseModel):
    metric: str
    our_value: float
    opponent_value: float
    benchmark_average: float
    percentile: int


class ScorecardData(BaseModel):
    period: str
    sector: str
    metrics: List[dict]
    overall_grade: str
    summary: str


class VisionItem(BaseModel):
    id: UUID
    title: str
    description: str
    category: str
    priority: int
    status: str


class BudgetOverview(BaseModel):
    total_budget: float
    spent_to_date: float
    remaining: float
    burn_rate: float
    by_category: List[dict]
    projected_shortfall: Optional[float]


class EventItem(BaseModel):
    id: UUID
    title: str
    location: str
    date: datetime
    type: str
    attendees_expected: int
    status: str


class PressItem(BaseModel):
    id: UUID
    title: str
    content: str
    media_type: Literal["press_release", "speech", "statement", "interview"]
    published_at: Optional[datetime]
    status: Literal["draft", "reviewing", "approved", "published"]


class CallCenterMetrics(BaseModel):
    total_calls: int
    answered_calls: int
    average_wait_time: int
    satisfaction_score: float
    top_issues: List[dict]


class RapidResponseItem(BaseModel):
    id: UUID
    title: str
    description: str
    priority: str
    status: str
    assigned_to: Optional[str]
    created_at: datetime
    due_at: Optional[datetime]


class TargetingSegment(BaseModel):
    id: UUID
    name: str
    description: str
    size: int
    persuadability: float
    priority: Literal["high", "medium", "low"]
    turnout_likelihood: float


# ============ Mock Data Store ============

OVERVIEW_STATS = {
    "polling_percentage": 42.5,
    "projected_votes": 485000,
    "confidence_level": "High",
    "volunteer_count": 3240,
    "donation_total": 125000000,
    "event_count": 48
}

SENTIMENT_DATA = {
    "overall_score": 0.72,
    "positive_percentage": 58,
    "neutral_percentage": 25,
    "negative_percentage": 17,
    "trend": "up",
    "by_region": [
        {"region": "Lagos", "score": 0.78, "volume": 12500},
        {"region": "Abuja", "score": 0.65, "volume": 8900},
        {"region": "Kano", "score": 0.71, "volume": 10200},
        {"region": "Port Harcourt", "score": 0.69, "volume": 5600},
    ]
}

VISION_ITEMS = [
    {"id": uuid4(), "title": "Economic Diversification", "description": "Focus on non-oil sectors", "category": "Economy", "priority": 1, "status": "active"},
    {"id": uuid4(), "title": "Healthcare for All", "description": "Universal healthcare coverage", "category": "Health", "priority": 2, "status": "active"},
    {"id": uuid4(), "title": "Education Reform", "description": "Modernize education system", "category": "Education", "priority": 3, "status": "planning"},
]

BUDGET_DATA = {
    "total_budget": 2500000000,
    "spent_to_date": 875000000,
    "remaining": 1625000000,
    "burn_rate": 125000000,
    "by_category": [
        {"category": "Media & Advertising", "allocated": 800000000, "spent": 320000000},
        {"category": "Field Operations", "allocated": 600000000, "spent": 180000000},
        {"category": "Events", "allocated": 400000000, "spent": 150000000},
        {"category": "Technology", "allocated": 300000000, "spent": 125000000},
        {"category": "Research", "allocated": 250000000, "spent": 75000000},
        {"category": "Administration", "allocated": 150000000, "spent": 25000000},
    ],
    "projected_shortfall": None
}

EVENTS_DB = []
PRESS_ITEMS = []
RAPID_RESPONSE_ITEMS = []

# Seed events
_seed_events = [
    {"id": uuid4(), "title": "Campaign Launch Rally", "location": "Lagos", "date": datetime.now() + timedelta(days=7), "type": "Rally", "attendees_expected": 5000, "status": "confirmed"},
    {"id": uuid4(), "title": "Town Hall - Abuja", "location": "Abuja", "date": datetime.now() + timedelta(days=14), "type": "Town Hall", "attendees_expected": 800, "status": "confirmed"},
    {"id": uuid4(), "title": "Youth Summit", "location": "Kano", "date": datetime.now() + timedelta(days=21), "type": "Summit", "attendees_expected": 1200, "status": "planning"},
]
for event in _seed_events:
    EVENTS_DB.append(event)

# Seed press items
_seed_press = [
    {"id": uuid4(), "title": "Campaign Launch Speech", "content": "Full text of launch speech...", "media_type": "speech", "published_at": datetime.now() - timedelta(days=2), "status": "published"},
    {"id": uuid4(), "title": "Economic Policy Statement", "content": "Details on economic plans...", "media_type": "statement", "published_at": None, "status": "reviewing"},
]
for press in _seed_press:
    PRESS_ITEMS.append(press)


# ============ API Endpoints ============

@router.get("/overview")
async def get_candidate_overview(
    current_user: User = Depends(require_permissions(["candidate", "admin", "mother_portal"]))
):
    """Get candidate overview/dashboard data"""
    return {
        "stats": OVERVIEW_STATS,
        "recent_activity": [
            {"type": "donation", "description": "Large donation received", "time": "10 minutes ago"},
            {"type": "volunteer", "description": "50 new volunteers joined", "time": "1 hour ago"},
            {"type": "event", "description": "Town hall scheduled", "time": "3 hours ago"},
        ],
        "upcoming_events": EVENTS_DB[:3],
        "key_metrics": {
            "polling_trend": "up",
            "volunteer_growth": 12.5,
            "donation_velocity": 8500000
        }
    }


@router.get("/sentiment")
async def get_sentiment_analysis(
    days: int = Query(30, ge=1, le=90),
    current_user: User = Depends(require_permissions(["candidate", "admin", "mother_portal"]))
):
    """Get sentiment analysis data"""
    return {
        "summary": SENTIMENT_DATA,
        "trend_data": [
            {"date": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"),
             "score": 0.70 + (i * 0.001)}
            for i in range(days, 0, -1)
        ],
        "top_keywords": [
            {"word": "development", "count": 1240, "sentiment": "positive"},
            {"word": "economy", "count": 980, "sentiment": "neutral"},
            {"word": "jobs", "count": 850, "sentiment": "positive"},
            {"word": "security", "count": 720, "sentiment": "mixed"},
        ],
        "source_breakdown": [
            {"source": "Twitter", "volume": 8500, "sentiment": 0.68},
            {"source": "Facebook", "volume": 6200, "sentiment": 0.74},
            {"source": "News", "volume": 3400, "sentiment": 0.71},
        ]
    }


@router.get("/benchmarking")
async def get_benchmarking_data(
    current_user: User = Depends(require_permissions(["candidate", "admin", "mother_portal"]))
):
    """Get benchmarking comparison data"""
    return {
        "overall_rank": 1,
        "total_candidates": 6,
        "metrics": [
            {"metric": "Name Recognition", "our_value": 78, "opponent_value": 65, "benchmark": 70, "percentile": 85},
            {"metric": "Favorability", "our_value": 72, "opponent_value": 58, "benchmark": 65, "percentile": 90},
            {"metric": "Policy Support", "our_value": 68, "opponent_value": 62, "benchmark": 65, "percentile": 75},
            {"metric": "Trust Index", "our_value": 74, "opponent_value": 55, "benchmark": 62, "percentile": 92},
            {"metric": "Social Media Engagement", "our_value": 85000, "opponent_value": 42000, "benchmark": 60000, "percentile": 88},
        ],
        "trending_topics": [
            {"topic": "Economic Policy", "our_mentions": 1250, "opponent_mentions": 890},
            {"topic": "Security", "our_mentions": 980, "opponent_mentions": 1100},
            {"topic": "Education", "our_mentions": 850, "opponent_mentions": 620},
        ]
    }


@router.get("/scorecard")
async def get_scorecard_data(
    period: str = Query("2027-Q1"),
    current_user: User = Depends(require_permissions(["candidate", "admin", "mother_portal"]))
):
    """Get scorecard metrics"""
    return {
        "period": period,
        "overall_grade": "A-",
        "sectors": [
            {
                "sector": "Education",
                "grade": "B+",
                "score": 82,
                "metrics": [
                    {"name": "School Enrollment", "value": 78, "target": 80},
                    {"name": "Teacher Training", "value": 85, "target": 85},
                    {"name": "Infrastructure", "value": 80, "target": 85},
                ]
            },
            {
                "sector": "Healthcare",
                "grade": "A",
                "score": 88,
                "metrics": [
                    {"name": "Facility Access", "value": 90, "target": 85},
                    {"name": "Staffing", "value": 85, "target": 85},
                    {"name": "Equipment", "value": 88, "target": 90},
                ]
            },
            {
                "sector": "Infrastructure",
                "grade": "B",
                "score": 76,
                "metrics": [
                    {"name": "Road Completion", "value": 72, "target": 80},
                    {"name": "Power Access", "value": 78, "target": 85},
                    {"name": "Water Supply", "value": 80, "target": 85},
                ]
            },
        ]
    }


@router.get("/vision")
async def get_vision_items(
    category: Optional[str] = None,
    current_user: User = Depends(require_permissions(["candidate", "admin", "mother_portal"]))
):
    """Get vision/policy items"""
    items = VISION_ITEMS
    if category:
        items = [i for i in items if i["category"].lower() == category.lower()]
    return items


@router.post("/vision")
async def create_vision_item(
    title: str,
    description: str,
    category: str,
    priority: int = 1,
    current_user: User = Depends(require_permissions(["candidate", "admin"]))
):
    """Create a new vision item"""
    item = {
        "id": uuid4(),
        "title": title,
        "description": description,
        "category": category,
        "priority": priority,
        "status": "planning"
    }
    VISION_ITEMS.append(item)
    return item


@router.get("/budget")
async def get_budget_overview(
    current_user: User = Depends(require_permissions(["candidate", "admin", "mother_portal"]))
):
    """Get budget overview"""
    return BUDGET_DATA


@router.get("/budget/timeline")
async def get_budget_timeline(
    current_user: User = Depends(require_permissions(["candidate", "admin", "mother_portal"]))
):
    """Get budget spending timeline"""
    return [
        {"month": "Jan 2027", "budgeted": 200000000, "spent": 180000000, "projected": 190000000},
        {"month": "Feb 2027", "budgeted": 200000000, "spent": 195000000, "projected": 200000000},
        {"month": "Mar 2027", "budgeted": 250000000, "spent": 250000000, "projected": 255000000},
        {"month": "Apr 2027", "budgeted": 250000000, "spent": 0, "projected": 250000000},
    ]


@router.get("/events")
async def list_candidate_events(
    status: Optional[str] = None,
    type: Optional[str] = None,
    upcoming_only: bool = True,
    current_user: User = Depends(require_permissions(["candidate", "admin", "mother_portal"]))
):
    """List candidate events"""
    events = EVENTS_DB

    if status:
        events = [e for e in events if e.get("status") == status]
    if type:
        events = [e for e in events if e.get("type") == type]
    if upcoming_only:
        events = [e for e in events if e.get("date") >= datetime.now()]

    return sorted(events, key=lambda x: x["date"])


@router.post("/events")
async def create_event(
    title: str,
    location: str,
    event_date: datetime,
    type: str,
    attendees_expected: int = 0,
    current_user: User = Depends(require_permissions(["candidate", "admin"]))
):
    """Create a new event"""
    event = {
        "id": uuid4(),
        "title": title,
        "location": location,
        "date": event_date,
        "type": type,
        "attendees_expected": attendees_expected,
        "status": "planning"
    }
    EVENTS_DB.append(event)
    return event


@router.get("/press")
async def list_press_items(
    status: Optional[str] = None,
    media_type: Optional[str] = None,
    current_user: User = Depends(require_permissions(["candidate", "admin", "mother_portal", "communications"]))
):
    """List press/media items"""
    items = PRESS_ITEMS

    if status:
        items = [i for i in items if i.get("status") == status]
    if media_type:
        items = [i for i in items if i.get("media_type") == media_type]

    return sorted(items, key=lambda x: x.get("published_at") or datetime.min, reverse=True)


@router.post("/press")
async def create_press_item(
    title: str,
    content: str,
    media_type: str,
    current_user: User = Depends(require_permissions(["candidate", "admin", "communications"]))
):
    """Create a press item"""
    item = {
        "id": uuid4(),
        "title": title,
        "content": content,
        "media_type": media_type,
        "published_at": None,
        "status": "draft"
    }
    PRESS_ITEMS.append(item)
    return item


@router.get("/call-center")
async def get_call_center_metrics(
    days: int = Query(7, ge=1, le=90),
    current_user: User = Depends(require_permissions(["candidate", "admin", "mother_portal"]))
):
    """Get call center metrics"""
    return {
        "summary": {
            "total_calls": 4250,
            "answered_calls": 3890,
            "missed_calls": 360,
            "average_wait_time": 45,
            "average_handle_time": 240,
            "satisfaction_score": 4.2
        },
        "hourly_distribution": [
            {"hour": f"{h:02d}:00", "calls": 150 + (h % 12) * 20}
            for h in range(8, 20)
        ],
        "top_issues": [
            {"issue": "Volunteer Information", "count": 850},
            {"issue": "Event Details", "count": 620},
            {"issue": "Donation Questions", "count": 480},
            {"issue": "Policy Questions", "count": 320},
        ],
        "agent_performance": [
            {"name": "Agent A", "calls_handled": 245, "satisfaction": 4.5},
            {"name": "Agent B", "calls_handled": 198, "satisfaction": 4.3},
            {"name": "Agent C", "calls_handled": 312, "satisfaction": 4.1},
        ]
    }


@router.get("/rapid-response")
async def list_rapid_response_items(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    current_user: User = Depends(require_permissions(["candidate", "admin", "mother_portal"]))
):
    """List rapid response items"""
    items = [
        {
            "id": uuid4(),
            "title": "Respond to opponent's healthcare claims",
            "description": "Fact-check and prepare counter-messaging",
            "priority": "high",
            "status": "in_progress",
            "assigned_to": "Communications Team",
            "created_at": datetime.now() - timedelta(hours=2),
            "due_at": datetime.now() + timedelta(hours=4)
        },
        {
            "id": uuid4(),
            "title": "Address social media misinformation",
            "description": "Viral post contains false statements about policy",
            "priority": "urgent",
            "status": "pending",
            "assigned_to": None,
            "created_at": datetime.now() - timedelta(minutes=30),
            "due_at": datetime.now() + timedelta(hours=1)
        },
    ]

    if status:
        items = [i for i in items if i.get("status") == status]
    if priority:
        items = [i for i in items if i.get("priority") == priority]

    return items


@router.post("/rapid-response")
async def create_rapid_response(
    title: str,
    description: str,
    priority: str,
    due_hours: int = 24,
    current_user: User = Depends(require_permissions(["candidate", "admin", "communications"]))
):
    """Create a rapid response task"""
    return {
        "id": uuid4(),
        "title": title,
        "description": description,
        "priority": priority,
        "status": "pending",
        "assigned_to": None,
        "created_at": datetime.now(),
        "due_at": datetime.now() + timedelta(hours=due_hours)
    }


@router.get("/targeting")
async def get_targeting_data(
    current_user: User = Depends(require_permissions(["candidate", "admin", "mother_portal"]))
):
    """Get voter targeting/segmentation data"""
    return {
        "segments": [
            {
                "id": uuid4(),
                "name": "Undecided Urban Professionals",
                "description": "Young professionals in urban centers, undecided",
                "size": 125000,
                "persuadability": 0.75,
                "priority": "high",
                "turnout_likelihood": 0.65
            },
            {
                "id": uuid4(),
                "name": "Disillusioned Incumbent Supporters",
                "description": "Previously supported incumbent, now dissatisfied",
                "size": 85000,
                "persuadability": 0.68,
                "priority": "high",
                "turnout_likelihood": 0.72
            },
            {
                "id": uuid4(),
                "name": "First-Time Voters",
                "description": "18-25 year olds, first time voting",
                "size": 95000,
                "persuadability": 0.82,
                "priority": "medium",
                "turnout_likelihood": 0.45
            },
            {
                "id": uuid4(),
                "name": "Rural Traditional Voters",
                "description": "Older voters in rural communities",
                "size": 110000,
                "persuadability": 0.35,
                "priority": "low",
                "turnout_likelihood": 0.88
            },
        ],
        "geographic_focus": [
            {"lga": "Lagos Island", "priority": "high", "swing_potential": "medium"},
            {"lga": "Ikeja", "priority": "high", "swing_potential": "high"},
            {"lga": "Eti-Osa", "priority": "medium", "swing_potential": "medium"},
        ],
        "recommended_actions": [
            {"action": "Town hall in Ikeja", "expected_reach": 2500, "priority": "high"},
            {"action": "Digital campaign targeting young professionals", "expected_reach": 50000, "priority": "high"},
        ]
    }


@router.get("/get-involved")
async def get_get_involved_data(
    current_user: User = Depends(get_current_user)
):
    """Get data for 'Get Involved' page"""
    return {
        "volunteer_opportunities": [
            {"role": "Field Agent", "description": "Door-to-door canvassing", "commitment": "10 hrs/week"},
            {"role": "Event Coordinator", "description": "Organize local events", "commitment": "Flexible"},
            {"role": "Digital Ambassador", "description": "Social media advocacy", "commitment": "5 hrs/week"},
            {"role": "Phone Banker", "description": "Voter outreach calls", "commitment": "4 hrs/week"},
        ],
        "donation_tiers": [
            {"amount": 1000, "label": "Supporter", "benefits": ["Newsletter", "Name on website"]},
            {"amount": 5000, "label": "Advocate", "benefits": ["All above", "Campaign updates"]},
            {"amount": 10000, "label": "Champion", "benefits": ["All above", "Event invites"]},
            {"amount": 50000, "label": "Patron", "benefits": ["All above", "Private briefings"]},
        ],
        "upcoming_actions": [
            {"date": datetime.now() + timedelta(days=3), "action": "Phone Banking", "location": "Virtual"},
            {"date": datetime.now() + timedelta(days=5), "action": "Canvassing", "location": "Ikeja"},
            {"date": datetime.now() + timedelta(days=7), "action": "Town Hall", "location": "Lagos Island"},
        ]
    }


@router.get("/news")
async def get_candidate_news(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user)
):
    """Get news feed for candidate"""
    return [
        {
            "id": uuid4(),
            "title": "Campaign Launches New Initiative",
            "content": "Today we announced our comprehensive education reform plan...",
            "source": "Campaign Team",
            "published_at": datetime.now() - timedelta(hours=2),
            "category": "announcement"
        },
        {
            "id": uuid4(),
            "title": "Poll Results: Positive Trend",
            "content": "Latest polling shows continued growth in support...",
            "source": "Internal Research",
            "published_at": datetime.now() - timedelta(hours=5),
            "category": "analysis"
        },
        {
            "id": uuid4(),
            "title": "Volunteer Milestone Reached",
            "content": "We've surpassed 3,000 active volunteers across the state...",
            "source": "Field Operations",
            "published_at": datetime.now() - timedelta(hours=8),
            "category": "update"
        },
    ][:limit]
