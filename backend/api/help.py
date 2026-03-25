"""
Help & Support API Module
Handles FAQ, help articles, and support tickets
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
from uuid import UUID, uuid4

from utils.auth import get_current_user, require_permissions
from models import User

router = APIRouter(prefix="/help", tags=["Help & Support"])


# ============ Pydantic Models ============

class FAQItem(BaseModel):
    id: UUID
    question: str
    answer: str
    category: str
    order: int
    helpful_count: int
    not_helpful_count: int


class FAQFeedbackRequest(BaseModel):
    helpful: bool


class SupportTicketCreate(BaseModel):
    subject: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    category: Literal["technical", "account", "billing", "campaign", "other"] = "other"
    priority: Literal["low", "medium", "high", "urgent"] = "medium"
    attachments: List[str] = Field(default_factory=list)


class SupportTicketUpdate(BaseModel):
    status: Optional[Literal["open", "in_progress", "resolved", "closed"]] = None
    response: Optional[str] = None


class SupportTicketResponse(BaseModel):
    id: UUID
    subject: str
    description: str
    category: str
    priority: str
    status: str
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime]
    resolved_at: Optional[datetime]
    response: Optional[str]
    responded_by: Optional[str]


class HelpArticleCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=10)
    category: str
    tags: List[str] = Field(default_factory=list)
    is_published: bool = True


class HelpArticle(BaseModel):
    id: UUID
    title: str
    content: str
    category: str
    tags: List[str]
    view_count: int
    is_published: bool
    created_at: datetime
    updated_at: Optional[datetime]


class ContactMethod(BaseModel):
    type: str
    label: str
    value: str
    description: Optional[str]
    icon: Optional[str]


# ============ Mock Data Store ============

FAQ_DB = {}
TICKETS_DB = {}
ARTICLES_DB = {}
FAQ_FEEDBACK_DB = {}

# Seed FAQ data
_seed_faqs = [
    {
        "id": uuid4(),
        "question": "How do I volunteer for the campaign?",
        "answer": "You can volunteer by visiting the Citizen Portal and clicking on the 'Volunteer' section. Fill out the registration form and select your preferred role. Our team will contact you within 48 hours.",
        "category": "Getting Started",
        "order": 1,
        "helpful_count": 156,
        "not_helpful_count": 12
    },
    {
        "id": uuid4(),
        "question": "How can I make a donation?",
        "answer": "Donations can be made through the Donate page. We accept payments via Paystack, Flutterwave, and direct bank transfer. All donations are securely processed and you will receive a receipt via email.",
        "category": "Donations",
        "order": 2,
        "helpful_count": 89,
        "not_helpful_count": 5
    },
    {
        "id": uuid4(),
        "question": "Where can I find upcoming events?",
        "answer": "All upcoming events are listed on the Events page. You can filter by location and date to find events near you. You can also subscribe to event notifications in your account settings.",
        "category": "Events",
        "order": 3,
        "helpful_count": 67,
        "not_helpful_count": 3
    },
    {
        "id": uuid4(),
        "question": "How do I report an issue with the platform?",
        "answer": "You can report issues through the Feedback page or contact our support team directly at support@uradi.ng. For urgent technical issues, use the Support Tickets feature in the Help Center.",
        "category": "Support",
        "order": 4,
        "helpful_count": 45,
        "not_helpful_count": 2
    },
    {
        "id": uuid4(),
        "question": "What roles are available for volunteers?",
        "answer": "We offer various volunteer roles including: Polling Unit Monitors, Field Agents, Digital Supporters, Event Coordinators, and Canvassers. Each role has different requirements and time commitments.",
        "category": "Volunteering",
        "order": 5,
        "helpful_count": 123,
        "not_helpful_count": 8
    },
    {
        "id": uuid4(),
        "question": "Is my personal data secure?",
        "answer": "Yes, we take data security seriously. All personal information is encrypted and stored securely. We comply with Nigeria's Data Protection Regulation (NDPR) and never share your data with third parties without consent.",
        "category": "Privacy & Security",
        "order": 6,
        "helpful_count": 78,
        "not_helpful_count": 4
    },
]

for faq in _seed_faqs:
    FAQ_DB[faq["id"]] = faq

# Seed help articles
_seed_articles = [
    {
        "id": uuid4(),
        "title": "Getting Started with Uradi2027",
        "content": "Welcome to Uradi2027! This guide will help you navigate the platform...",
        "category": "Guides",
        "tags": ["beginner", "getting-started"],
        "view_count": 1250,
        "is_published": True,
        "created_at": datetime.now(),
        "updated_at": None
    },
    {
        "id": uuid4(),
        "title": "Mobile App User Guide",
        "content": "The Uradi2027 mobile app allows field agents to report from polling units...",
        "category": "Guides",
        "tags": ["mobile", "field-agents"],
        "view_count": 890,
        "is_published": True,
        "created_at": datetime.now(),
        "updated_at": None
    },
]

for article in _seed_articles:
    ARTICLES_DB[article["id"]] = article


# ============ API Endpoints ============

@router.get("/faq", response_model=List[FAQItem])
async def get_faqs(
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100)
):
    """Get frequently asked questions"""
    results = []

    for faq in FAQ_DB.values():
        if category and faq.get("category") != category:
            continue
        if search and search.lower() not in faq["question"].lower():
            continue
        results.append(faq)

    # Sort by order
    results.sort(key=lambda x: x.get("order", 0))

    return results[:limit]


@router.get("/faq/categories")
async def get_faq_categories():
    """Get all FAQ categories"""
    categories = set()
    for faq in FAQ_DB.values():
        categories.add(faq.get("category", "General"))
    return sorted(list(categories))


@router.post("/faq/{faq_id}/feedback")
async def submit_faq_feedback(
    faq_id: UUID,
    feedback: FAQFeedbackRequest,
    current_user: User = Depends(get_current_user)
):
    """Submit feedback on whether FAQ was helpful"""
    if faq_id not in FAQ_DB:
        raise HTTPException(status_code=404, detail="FAQ not found")

    faq = FAQ_DB[faq_id]

    if feedback.helpful:
        faq["helpful_count"] = faq.get("helpful_count", 0) + 1
    else:
        faq["not_helpful_count"] = faq.get("not_helpful_count", 0) + 1

    # Track user feedback to prevent duplicates
    feedback_key = f"{current_user.id}_{faq_id}"
    FAQ_FEEDBACK_DB[feedback_key] = {
        "helpful": feedback.helpful,
        "timestamp": datetime.now()
    }

    return {"message": "Feedback recorded", "helpful": feedback.helpful}


# ============ Support Tickets ============

@router.get("/tickets", response_model=List[SupportTicketResponse])
async def list_support_tickets(
    status: Optional[str] = None,
    category: Optional[str] = None,
    my_tickets_only: bool = True,
    current_user: User = Depends(get_current_user)
):
    """List support tickets"""
    results = []

    for ticket in TICKETS_DB.values():
        # Filter by ownership unless admin
        if my_tickets_only and current_user.role not in ["admin", "support"]:
            if ticket.get("created_by_id") != current_user.id:
                continue

        if status and ticket.get("status") != status:
            continue
        if category and ticket.get("category") != category:
            continue

        results.append(ticket)

    return sorted(results, key=lambda x: x["created_at"], reverse=True)


@router.post("/tickets", response_model=SupportTicketResponse, status_code=status.HTTP_201_CREATED)
async def create_support_ticket(
    ticket: SupportTicketCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new support ticket"""
    ticket_id = uuid4()

    new_ticket = {
        "id": ticket_id,
        "subject": ticket.subject,
        "description": ticket.description,
        "category": ticket.category,
        "priority": ticket.priority,
        "status": "open",
        "created_by": current_user.full_name,
        "created_by_id": current_user.id,
        "created_at": datetime.now(),
        "updated_at": None,
        "resolved_at": None,
        "response": None,
        "responded_by": None,
        "attachments": ticket.attachments
    }

    TICKETS_DB[ticket_id] = new_ticket

    return new_ticket


@router.get("/tickets/{ticket_id}", response_model=SupportTicketResponse)
async def get_support_ticket(
    ticket_id: UUID,
    current_user: User = Depends(get_current_user)
):
    """Get a specific support ticket"""
    if ticket_id not in TICKETS_DB:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket = TICKETS_DB[ticket_id]

    # Check permissions
    if ticket.get("created_by_id") != current_user.id and current_user.role not in ["admin", "support"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this ticket")

    return ticket


@router.put("/tickets/{ticket_id}")
async def update_support_ticket(
    ticket_id: UUID,
    update: SupportTicketUpdate,
    current_user: User = Depends(require_permissions(["admin", "support"]))
):
    """Update a support ticket (admin/support only)"""
    if ticket_id not in TICKETS_DB:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket = TICKETS_DB[ticket_id]
    now = datetime.now()

    if update.status:
        ticket["status"] = update.status
        if update.status in ["resolved", "closed"]:
            ticket["resolved_at"] = now

    if update.response:
        ticket["response"] = update.response
        ticket["responded_by"] = current_user.full_name
        ticket["updated_at"] = now

    return ticket


# ============ Help Articles ============

@router.get("/articles", response_model=List[HelpArticle])
async def list_help_articles(
    category: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """List help articles"""
    results = []

    for article in ARTICLES_DB.values():
        # Only show published articles to non-admins
        if not article.get("is_published") and current_user.role not in ["admin", "content"]:
            continue

        if category and article.get("category") != category:
            continue
        if search and search.lower() not in article["title"].lower():
            continue

        results.append(article)

    return sorted(results, key=lambda x: x["view_count"], reverse=True)


@router.get("/articles/{article_id}", response_model=HelpArticle)
async def get_help_article(
    article_id: UUID,
    current_user: User = Depends(get_current_user)
):
    """Get a specific help article"""
    if article_id not in ARTICLES_DB:
        raise HTTPException(status_code=404, detail="Article not found")

    article = ARTICLES_DB[article_id]

    # Increment view count
    article["view_count"] = article.get("view_count", 0) + 1

    return article


@router.post("/articles", response_model=HelpArticle, status_code=status.HTTP_201_CREATED)
async def create_help_article(
    article: HelpArticleCreate,
    current_user: User = Depends(require_permissions(["admin", "content"]))
):
    """Create a new help article (admin/content only)"""
    article_id = uuid4()

    new_article = {
        "id": article_id,
        "title": article.title,
        "content": article.content,
        "category": article.category,
        "tags": article.tags,
        "view_count": 0,
        "is_published": article.is_published,
        "created_at": datetime.now(),
        "updated_at": None
    }

    ARTICLES_DB[article_id] = new_article

    return new_article


@router.put("/articles/{article_id}", response_model=HelpArticle)
async def update_help_article(
    article_id: UUID,
    article_update: HelpArticleCreate,
    current_user: User = Depends(require_permissions(["admin", "content"]))
):
    """Update a help article"""
    if article_id not in ARTICLES_DB:
        raise HTTPException(status_code=404, detail="Article not found")

    article = ARTICLES_DB[article_id]

    article["title"] = article_update.title
    article["content"] = article_update.content
    article["category"] = article_update.category
    article["tags"] = article_update.tags
    article["is_published"] = article_update.is_published
    article["updated_at"] = datetime.now()

    return article


# ============ Contact Info ============

@router.get("/contact")
async def get_contact_info():
    """Get support contact information"""
    return {
        "methods": [
            {
                "type": "email",
                "label": "Email Support",
                "value": "support@uradi.ng",
                "description": "For general inquiries and technical support",
                "icon": "mail"
            },
            {
                "type": "phone",
                "label": "Phone Support",
                "value": "+234 800 URADI",
                "description": "Available Mon-Fri 9AM-5PM WAT",
                "icon": "phone"
            },
            {
                "type": "chat",
                "label": "Live Chat",
                "value": "#",
                "description": "Chat with our support team in real-time",
                "icon": "message-square"
            },
            {
                "type": "docs",
                "label": "Documentation",
                "value": "/help/articles",
                "description": "Browse our knowledge base",
                "icon": "book"
            }
        ],
        "hours": {
            "weekdays": "9:00 AM - 5:00 PM WAT",
            "weekend": "10:00 AM - 2:00 PM WAT",
            "emergency": "24/7 for election-related incidents"
        }
    }


@router.get("/search")
async def search_help(
    q: str = Query(..., min_length=2),
    current_user: User = Depends(get_current_user)
):
    """Search across FAQ and help articles"""
    results = {
        "faqs": [],
        "articles": [],
        "total": 0
    }

    query = q.lower()

    # Search FAQs
    for faq in FAQ_DB.values():
        if query in faq["question"].lower() or query in faq["answer"].lower():
            results["faqs"].append(faq)

    # Search articles
    for article in ARTICLES_DB.values():
        if article.get("is_published") and (query in article["title"].lower() or query in article["content"].lower()):
            results["articles"].append(article)

    results["total"] = len(results["faqs"]) + len(results["articles"])

    return results
