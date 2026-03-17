"""
Public API - Candidate Website Endpoints
Unauthenticated endpoints for the public-facing candidate website
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from database import get_db
from models import (
    Tenant, Voter, NewsArticle, Event, Promise, Metric,
    Office, FAQ, Resource, Testimonial, Donation, Volunteer,
    ContactMessage, RS VP
)
import uuid

router = APIRouter(prefix="/api/public", tags=["Public Website"])

# ==================== PYDANTIC MODELS ====================

class ContactFormRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str


class NewsletterSignupRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    location: Optional[str] = None


class DonationRequest(BaseModel):
    amount: int
    currency: str = "NGN"
    name: str
    email: EmailStr
    phone: Optional[str] = None
    show_name: bool = True
    is_recurring: bool = False
    payment_method: str  # card, bank, ussd, intl


class VolunteerSignupRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    location: str
    ward: Optional[str] = None
    role: str
    availability: str
    experience: Optional[str] = None
    message: Optional[str] = None


class RSVPRequest(BaseModel):
    event_id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None


class HostEventRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    event_type: str
    proposed_date: str
    location: str
    expected_attendees: str
    additional_info: Optional[str] = None


class ChatMessageRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


# ==================== PUBLIC STATS ====================

@router.get("/stats")
def get_public_stats(db: Session = Depends(get_db)):
    """
    Get public-facing statistics for the landing page.
    """
    # In production, these would be calculated from actual data
    return {
        "supporters": 50000,
        "days_to_election": 247,
        "lgas_covered": 27,
        "projects_completed": 156,
        "volunteers": 2500,
        "events_hosted": 150
    }


# ==================== NEWS ====================

@router.get("/news")
def get_news(
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(10, ge=1, le=50),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Get news articles with optional filtering.
    """
    query = db.query(NewsArticle).filter(NewsArticle.status == "published")

    if category:
        query = query.filter(NewsArticle.category == category)

    if search:
        query = query.filter(
            NewsArticle.title.ilike(f"%{search}%") |
            NewsArticle.content.ilike(f"%{search}%")
        )

    total = query.count()
    articles = query.order_by(desc(NewsArticle.published_at)).offset(offset).limit(limit).all()

    return {
        "items": articles,
        "total": total,
        "limit": limit,
        "offset": offset
    }


@router.get("/news/{article_id}")
def get_news_article(article_id: str, db: Session = Depends(get_db)):
    """
    Get a single news article by ID.
    """
    article = db.query(NewsArticle).filter(
        NewsArticle.id == article_id,
        NewsArticle.status == "published"
    ).first()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    return article


# ==================== EVENTS ====================

@router.get("/events")
def get_events(
    upcoming: bool = True,
    category: Optional[str] = None,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Get events (upcoming or past).
    """
    query = db.query(Event)

    if upcoming:
        query = query.filter(Event.date >= datetime.utcnow())
    else:
        query = query.filter(Event.date < datetime.utcnow())

    if category:
        query = query.filter(Event.category == category)

    events = query.order_by(Event.date).limit(limit).all()
    return {"items": events}


@router.post("/events/{event_id}/rsvp")
def rsvp_to_event(event_id: str, rsvp: RSVPRequest, db: Session = Depends(get_db)):
    """
    RSVP to an event.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Check if already registered
    existing = db.query(RSVP).filter(
        RSVP.event_id == event_id,
        RSVP.email == rsvp.email
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already registered for this event")

    new_rsvp = RSVP(
        id=str(uuid.uuid4()),
        event_id=event_id,
        name=rsvp.name,
        email=rsvp.email,
        phone=rsvp.phone,
        created_at=datetime.utcnow()
    )

    db.add(new_rsvp)
    db.commit()

    # TODO: Send confirmation email

    return {"success": True, "message": "RSVP confirmed"}


@router.post("/host-event")
def host_event(request: HostEventRequest, db: Session = Depends(get_db)):
    """
    Submit a request to host an event.
    """
    # TODO: Store in database and notify campaign team
    return {
        "success": True,
        "message": "Thank you for your interest! Our team will contact you within 24 hours."
    }


# ==================== SCORECARD / PROMISES ====================

@router.get("/scorecard")
def get_scorecard_overview(db: Session = Depends(get_db)):
    """
    Get public scorecard overview statistics.
    """
    total = db.query(Promise).count()
    completed = db.query(Promise).filter(Promise.status == "completed").count()
    in_progress = db.query(Promise).filter(Promise.status == "in_progress").count()
    not_started = db.query(Promise).filter(Promise.status == "not_started").count()

    completion_rate = round((completed / total * 100), 1) if total > 0 else 0

    return {
        "total_promises": total,
        "completed": completed,
        "in_progress": in_progress,
        "not_started": not_started,
        "completion_rate": completion_rate,
        "last_updated": datetime.utcnow().isoformat()
    }


@router.get("/promises")
def get_promises(
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get promises/policies with filtering.
    """
    query = db.query(Promise)

    if category:
        query = query.filter(Promise.category == category)
    if status:
        query = query.filter(Promise.status == status)

    promises = query.order_by(desc(Promise.created_at)).all()
    return {"items": promises}


@router.get("/promises/{promise_id}")
def get_promise_details(promise_id: str, db: Session = Depends(get_db)):
    """
    Get detailed information about a specific promise.
    """
    promise = db.query(Promise).filter(Promise.id == promise_id).first()
    if not promise:
        raise HTTPException(status_code=404, detail="Promise not found")

    return promise


# ==================== POLICIES / VISION ====================

@router.get("/policies")
def get_policies(db: Session = Depends(get_db)):
    """
    Get all policy areas/vision documents.
    """
    # This could be stored in the database or returned as static content
    return {
        "items": [
            {
                "id": "education",
                "title": "Education Reform",
                "tagline": "Every Child Deserves Quality Education",
                "description": "Free primary education and teacher training for every child in Jigawa.",
                "stats": [
                    {"value": "45", "label": "New Schools Built"},
                    {"value": "2,500+", "label": "Teachers Trained"},
                    {"value": "87%", "label": "Enrollment Increase"}
                ],
                "initiatives": [
                    "Free primary education for all children",
                    "Teacher training and professional development",
                    "School infrastructure modernization",
                    "Digital literacy programs",
                    "Scholarships for higher education"
                ]
            },
            {
                "id": "healthcare",
                "title": "Healthcare Access",
                "tagline": "Quality Healthcare Within Reach",
                "description": "Upgrading 30 primary healthcare centers with modern equipment.",
                "stats": [
                    {"value": "28", "label": "Health Centers Upgraded"},
                    {"value": "150k", "label": "Patients Served"},
                    {"value": "93%", "label": "Equipment Delivered"}
                ],
                "initiatives": [
                    "Primary healthcare center upgrades",
                    "Free maternal and child health services",
                    "Mobile clinics for rural areas",
                    "Medical equipment modernization",
                    "Health insurance for vulnerable populations"
                ]
            }
            # ... more policies
        ]
    }


# ==================== ABOUT / BIOGRAPHY ====================

@router.get("/biography")
def get_biography(db: Session = Depends(get_db)):
    """
    Get candidate biography.
    """
    return {
        "full_name": "Alhaji Musa Danladi",
        "title": "Governor of Jigawa State",
        "party": "APC",
        "born": "1968",
        "education": "Ahmadu Bello University",
        "career": [
            {"year": "2023", "title": "Governor of Jigawa State", "description": "Elected as the 5th Executive Governor..."},
            {"year": "2019", "title": "Senator, Jigawa North", "description": "Represented Jigawa North Senatorial District..."},
            {"year": "2015", "title": "Commissioner for Education", "description": "Appointed Commissioner for Education..."},
            {"year": "2011", "title": "House of Representatives", "description": "Elected to represent Dutse Federal Constituency..."}
        ],
        "achievements": [
            {"number": "45", "label": "Schools Built", "description": "New classrooms and educational facilities"},
            {"number": "300km", "label": "Roads Constructed", "description": "Connecting rural and urban communities"},
            {"number": "10,000+", "label": "Jobs Created", "description": "Through public and private sector initiatives"}
        ],
        "values": [
            {"title": "Integrity", "description": "Unwavering commitment to honesty and transparency..."},
            {"title": "Service", "description": "Leadership is about serving the people..."},
            {"title": "Excellence", "description": "Striving for the highest standards..."},
            {"title": "Inclusivity", "description": "Building a Jigawa that works for everyone..."}
        ]
    }


# ==================== VOLUNTEER ====================

@router.post("/volunteers")
def signup_volunteer(request: VolunteerSignupRequest, db: Session = Depends(get_db)):
    """
    Sign up as a volunteer.
    """
    # Check if email already exists
    existing = db.query(Volunteer).filter(Volunteer.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    volunteer = Volunteer(
        id=str(uuid.uuid4()),
        first_name=request.first_name,
        last_name=request.last_name,
        email=request.email,
        phone=request.phone,
        location=request.location,
        ward=request.ward,
        role=request.role,
        availability=request.availability,
        experience=request.experience,
        message=request.message,
        status="pending",
        created_at=datetime.utcnow()
    )

    db.add(volunteer)
    db.commit()

    # TODO: Send confirmation email
    # TODO: Notify coordinator

    return {
        "success": True,
        "message": "Thank you for signing up! We will contact you within 24 hours."
    }


# ==================== DONATIONS ====================

@router.get("/transparency")
def get_transparency_stats(db: Session = Depends(get_db)):
    """
    Get donation transparency statistics.
    """
    total_raised = db.query(func.sum(Donation.amount)).filter(Donation.status == "completed").scalar() or 0
    total_donors = db.query(Donation).filter(Donation.status == "completed").distinct(Donation.email).count()
    avg_donation = total_raised / total_donors if total_donors > 0 else 0

    # Get recent donors (anonymized)
    recent_donations = db.query(Donation).filter(
        Donation.status == "completed",
        Donation.show_name == True
    ).order_by(desc(Donation.created_at)).limit(5).all()

    return {
        "total_raised": total_raised,
        "total_donors": total_donors,
        "avg_donation": round(avg_donation, 2),
        "spent_on_programs": "92%",
        "recent_donors": [
            {
                "amount": d.amount,
                "location": d.location or "Anonymous",
                "time": d.created_at.isoformat()
            }
            for d in recent_donations
        ]
    }


@router.post("/donations")
def create_donation(request: DonationRequest, db: Session = Depends(get_db)):
    """
    Create a new donation (initiates payment).
    """
    donation = Donation(
        id=str(uuid.uuid4()),
        amount=request.amount,
        currency=request.currency,
        name=request.name,
        email=request.email,
        phone=request.phone,
        show_name=request.show_name,
        is_recurring=request.is_recurring,
        payment_method=request.payment_method,
        status="pending",
        created_at=datetime.utcnow()
    )

    db.add(donation)
    db.commit()

    # TODO: Initialize Paystack/Flutterwave payment
    # TODO: Return payment authorization URL

    return {
        "success": True,
        "donation_id": donation.id,
        "message": "Donation initiated",
        "payment_url": "https://paystack.com/pay/..."  # Placeholder
    }


# ==================== CONTACT ====================

@router.post("/contact")
def submit_contact_form(request: ContactFormRequest, db: Session = Depends(get_db)):
    """
    Submit contact form.
    """
    message = ContactMessage(
        id=str(uuid.uuid4()),
        name=request.name,
        email=request.email,
        phone=request.phone,
        subject=request.subject,
        message=request.message,
        status="new",
        created_at=datetime.utcnow()
    )

    db.add(message)
    db.commit()

    # TODO: Send notification to campaign team
    # TODO: Send auto-reply to user

    return {
        "success": True,
        "message": "Thank you for your message! We will get back to you within 24 hours."
    }


@router.post("/newsletter")
def signup_newsletter(request: NewsletterSignupRequest, db: Session = Depends(get_db)):
    """
    Sign up for newsletter.
    """
    # TODO: Add to mailing list (Mailchimp/SendGrid)
    return {
        "success": True,
        "message": "Thank you for subscribing to our newsletter!"
    }


# ==================== RESOURCES ====================

@router.get("/resources")
def get_resources(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get downloadable resources.
    """
    query = db.query(Resource)
    if category:
        query = query.filter(Resource.category == category)

    resources = query.order_by(desc(Resource.created_at)).all()
    return {"items": resources}


@router.get("/faq")
def get_faq(db: Session = Depends(get_db)):
    """
    Get frequently asked questions.
    """
    faqs = db.query(FAQ).filter(FAQ.active == True).order_by(FAQ.category, FAQ.order).all()

    # Group by category
    grouped = {}
    for faq in faqs:
        if faq.category not in grouped:
            grouped[faq.category] = []
        grouped[faq.category].append({
            "question": faq.question,
            "answer": faq.answer
        })

    return {"categories": grouped}


# ==================== TESTIMONIALS ====================

@router.get("/testimonials")
def get_testimonials(limit: int = 10, db: Session = Depends(get_db)):
    """
    Get volunteer testimonials.
    """
    testimonials = db.query(Testimonial).filter(
        Testimonial.active == True
    ).order_by(desc(Testimonial.created_at)).limit(limit).all()

    return {"items": testimonials}


# ==================== OFFICES ====================

@router.get("/offices")
def get_offices(db: Session = Depends(get_db)):
    """
    Get campaign office locations.
    """
    offices = db.query(Office).filter(Office.active == True).order_by(Office.type.desc(), Office.name).all()
    return {"items": offices}


# ==================== CHATBOT ====================

@router.post("/chatbot")
def chatbot_response(request: ChatMessageRequest, db: Session = Depends(get_db)):
    """
    Get chatbot response.
    """
    message = request.message.lower()
    session_id = request.session_id or str(uuid.uuid4())

    # Simple rule-based responses (can be replaced with OpenAI GPT-4)
    if "volunteer" in message:
        response = "Great! You can sign up to volunteer at /get-involved. Would you like me to direct you there?"
    elif "donate" in message or "contribution" in message:
        response = "Thank you for your support! You can donate securely at /donate. Every contribution helps!"
    elif "event" in message:
        response = "Check out our upcoming events on the Events page. Would you like to see what's coming up?"
    elif "policy" in message or "vision" in message:
        response = "You can read about our comprehensive vision for Jigawa at /vision. We cover Education, Healthcare, Infrastructure, and more!"
    elif "contact" in message:
        response = "You can reach us at contact@musadanladi.com or call +234 800 123 4567."
    else:
        response = "Thank you for your message. For more information, please visit our website or contact us directly."

    return {
        "session_id": session_id,
        "message": response,
        "suggestions": [
            "How can I volunteer?",
            "Make a donation",
            "Upcoming events?",
            "What are your policies?"
        ]
    }


# ==================== DOWNLOADS ====================

@router.get("/downloads/{resource_id}")
def download_resource(resource_id: str, db: Session = Depends(get_db)):
    """
    Download a resource file.
    """
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    # Increment download count
    resource.download_count += 1
    db.commit()

    # TODO: Return file or redirect to S3 URL
    return {
        "success": True,
        "download_url": resource.file_url,
        "filename": resource.filename
    }
