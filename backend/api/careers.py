"""
Careers API Module
Handles job postings and applications
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime, timedelta
from uuid import UUID, uuid4

from utils.auth import get_current_user, require_permissions
from models import User

router = APIRouter(prefix="/careers", tags=["Careers"])


# ============ Pydantic Models ============

class JobPostingCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    department: str = Field(..., min_length=1)
    location: str = Field(..., min_length=1)
    type: Literal["Full-time", "Part-time", "Contract", "Volunteer"] = "Full-time"
    description: str = Field(..., min_length=10)
    requirements: List[str] = Field(default_factory=list)
    responsibilities: List[str] = Field(default_factory=list)
    salary_range: Optional[str] = None
    benefits: List[str] = Field(default_factory=list)
    status: Literal["draft", "open", "closing_soon", "closed"] = "draft"


class JobPostingResponse(BaseModel):
    id: UUID
    title: str
    department: str
    location: str
    type: str
    description: str
    requirements: List[str]
    responsibilities: List[str]
    salary_range: Optional[str]
    benefits: List[str]
    status: str
    posted_at: datetime
    closes_at: Optional[datetime]
    application_count: int


class JobApplicationCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., regex=r'^\S+@\S+\.\S+$')
    phone: str = Field(..., min_length=10)
    cover_letter: Optional[str] = Field(None, max_length=2000)
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    referral_source: Optional[str] = None


class JobApplicationResponse(BaseModel):
    id: UUID
    job_id: UUID
    job_title: str
    applicant_name: str
    email: str
    phone: str
    status: str
    applied_at: datetime
    reviewed_at: Optional[datetime]
    reviewer_notes: Optional[str]


class ApplicationReviewRequest(BaseModel):
    status: Literal["reviewing", "shortlisted", "rejected", "hired"]
    notes: Optional[str] = None


# ============ Mock Data Store ============

JOBS_DB = {}
APPLICATIONS_DB = {}

# Seed job postings
_seed_jobs = [
    {
        "id": uuid4(),
        "title": "Field Operations Manager",
        "department": "Operations",
        "location": "Lagos",
        "type": "Full-time",
        "description": "Lead field operations across Lagos state, coordinating volunteers and managing campaign activities.",
        "requirements": ["5+ years operations experience", "Strong leadership skills", "Knowledge of Nigerian political landscape"],
        "responsibilities": ["Coordinate field teams", "Manage volunteer recruitment", "Oversee logistics"],
        "salary_range": "₦500,000 - ₦700,000",
        "benefits": ["Health insurance", "Transport allowance", "Performance bonus"],
        "status": "open",
        "posted_at": datetime.now() - timedelta(days=2),
        "closes_at": datetime.now() + timedelta(days=28),
        "application_count": 12
    },
    {
        "id": uuid4(),
        "title": "Digital Marketing Specialist",
        "department": "Communications",
        "location": "Abuja",
        "type": "Full-time",
        "description": "Develop and execute digital marketing strategies to engage voters and promote campaign messaging.",
        "requirements": ["3+ years digital marketing experience", "Social media expertise", "Content creation skills"],
        "responsibilities": ["Manage social media accounts", "Create engaging content", "Analyze campaign metrics"],
        "salary_range": "₦300,000 - ₦450,000",
        "benefits": ["Health insurance", "Remote work option", "Training budget"],
        "status": "open",
        "posted_at": datetime.now() - timedelta(days=3),
        "closes_at": datetime.now() + timedelta(days=27),
        "application_count": 8
    },
    {
        "id": uuid4(),
        "title": "Data Analyst",
        "department": "Analytics",
        "location": "Remote",
        "type": "Contract",
        "description": "Analyze voter data, polling trends, and campaign metrics to inform strategic decisions.",
        "requirements": ["Strong Python/R skills", "Experience with data visualization", "Statistical analysis background"],
        "responsibilities": ["Analyze voter databases", "Create dashboards", "Generate reports"],
        "salary_range": "₦250,000 - ₦350,000",
        "benefits": ["Flexible hours", "Equipment stipend"],
        "status": "open",
        "posted_at": datetime.now() - timedelta(days=5),
        "closes_at": datetime.now() + timedelta(days=25),
        "application_count": 5
    },
    {
        "id": uuid4(),
        "title": "Volunteer Coordinator",
        "department": "Volunteer Management",
        "location": "Kano",
        "type": "Full-time",
        "description": "Recruit, train, and coordinate volunteers across Kano state for campaign activities.",
        "requirements": ["Experience in volunteer management", "Strong interpersonal skills", "Fluency in Hausa"],
        "responsibilities": ["Recruit volunteers", "Organize training sessions", "Coordinate volunteer schedules"],
        "salary_range": "₦200,000 - ₦300,000",
        "benefits": ["Health insurance", "Transport allowance"],
        "status": "closing_soon",
        "posted_at": datetime.now() - timedelta(days=7),
        "closes_at": datetime.now() + timedelta(days=3),
        "application_count": 15
    },
]

for job in _seed_jobs:
    JOBS_DB[job["id"]] = job


# ============ API Endpoints ============

@router.get("/jobs", response_model=List[JobPostingResponse])
async def list_jobs(
    status: Optional[str] = None,
    department: Optional[str] = None,
    location: Optional[str] = None,
    type: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0)
):
    """List job postings (public endpoint)"""
    results = []

    for job in JOBS_DB.values():
        # Only show open and closing_soon jobs to public
        if job.get("status") not in ["open", "closing_soon"]:
            continue

        if status and job.get("status") != status:
            continue
        if department and job.get("department") != department:
            continue
        if location and job.get("location") != location:
            continue
        if type and job.get("type") != type:
            continue
        if search and search.lower() not in job.get("title", "").lower():
            continue

        results.append(job)

    # Sort by posted date
    results.sort(key=lambda x: x["posted_at"], reverse=True)

    return results[offset:offset + limit]


@router.get("/jobs/{job_id}", response_model=JobPostingResponse)
async def get_job(
    job_id: UUID,
    current_user: User = Depends(get_current_user)
):
    """Get a specific job posting"""
    if job_id not in JOBS_DB:
        raise HTTPException(status_code=404, detail="Job not found")

    return JOBS_DB[job_id]


@router.post("/jobs", response_model=JobPostingResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    job: JobPostingCreate,
    current_user: User = Depends(require_permissions(["admin", "hr", "mother_portal"]))
):
    """Create a new job posting"""
    job_id = uuid4()

    new_job = {
        "id": job_id,
        "title": job.title,
        "department": job.department,
        "location": job.location,
        "type": job.type,
        "description": job.description,
        "requirements": job.requirements,
        "responsibilities": job.responsibilities,
        "salary_range": job.salary_range,
        "benefits": job.benefits,
        "status": job.status,
        "posted_at": datetime.now() if job.status == "open" else None,
        "closes_at": datetime.now() + timedelta(days=30) if job.status == "open" else None,
        "application_count": 0
    }

    JOBS_DB[job_id] = new_job

    return new_job


@router.put("/jobs/{job_id}", response_model=JobPostingResponse)
async def update_job(
    job_id: UUID,
    job_update: JobPostingCreate,
    current_user: User = Depends(require_permissions(["admin", "hr", "mother_portal"]))
):
    """Update a job posting"""
    if job_id not in JOBS_DB:
        raise HTTPException(status_code=404, detail="Job not found")

    job = JOBS_DB[job_id]

    job["title"] = job_update.title
    job["department"] = job_update.department
    job["location"] = job_update.location
    job["type"] = job_update.type
    job["description"] = job_update.description
    job["requirements"] = job_update.requirements
    job["responsibilities"] = job_update.responsibilities
    job["salary_range"] = job_update.salary_range
    job["benefits"] = job_update.benefits

    # Handle status changes
    if job_update.status != job.get("status"):
        job["status"] = job_update.status
        if job_update.status == "open" and not job.get("posted_at"):
            job["posted_at"] = datetime.now()
            job["closes_at"] = datetime.now() + timedelta(days=30)

    return job


@router.delete("/jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
    job_id: UUID,
    current_user: User = Depends(require_permissions(["admin", "hr"]))
):
    """Delete a job posting"""
    if job_id not in JOBS_DB:
        raise HTTPException(status_code=404, detail="Job not found")

    del JOBS_DB[job_id]
    return {"message": "Job posting deleted"}


# ============ Job Applications ============

@router.post("/jobs/{job_id}/apply", response_model=JobApplicationResponse, status_code=status.HTTP_201_CREATED)
async def apply_for_job(
    job_id: UUID,
    application: JobApplicationCreate,
    resume: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user)
):
    """Submit a job application"""
    if job_id not in JOBS_DB:
        raise HTTPException(status_code=404, detail="Job not found")

    job = JOBS_DB[job_id]

    if job.get("status") not in ["open", "closing_soon"]:
        raise HTTPException(status_code=400, detail="This position is no longer accepting applications")

    # Check if user already applied
    for app in APPLICATIONS_DB.values():
        if app.get("job_id") == job_id and app.get("applicant_email") == application.email:
            raise HTTPException(status_code=400, detail="You have already applied for this position")

    application_id = uuid4()

    new_application = {
        "id": application_id,
        "job_id": job_id,
        "job_title": job["title"],
        "applicant_name": application.full_name,
        "applicant_email": application.email,
        "email": application.email,
        "phone": application.phone,
        "cover_letter": application.cover_letter,
        "linkedin_url": application.linkedin_url,
        "portfolio_url": application.portfolio_url,
        "referral_source": application.referral_source,
        "status": "submitted",
        "applied_at": datetime.now(),
        "reviewed_at": None,
        "reviewer_notes": None,
        "resume_filename": resume.filename if resume else None
    }

    APPLICATIONS_DB[application_id] = new_application

    # Increment application count
    job["application_count"] = job.get("application_count", 0) + 1

    return new_application


@router.get("/applications", response_model=List[JobApplicationResponse])
async def list_applications(
    job_id: Optional[UUID] = None,
    status: Optional[str] = None,
    current_user: User = Depends(require_permissions(["admin", "hr", "mother_portal"]))
):
    """List all job applications (admin/hr only)"""
    results = []

    for app in APPLICATIONS_DB.values():
        if job_id and app.get("job_id") != job_id:
            continue
        if status and app.get("status") != status:
            continue
        results.append(app)

    return sorted(results, key=lambda x: x["applied_at"], reverse=True)


@router.get("/my-applications", response_model=List[JobApplicationResponse])
async def get_my_applications(
    current_user: User = Depends(get_current_user)
):
    """Get current user's job applications"""
    results = []

    for app in APPLICATIONS_DB.values():
        # In a real app, we'd match by user ID, here we match by email
        if app.get("applicant_email") == current_user.email:
            results.append(app)

    return sorted(results, key=lambda x: x["applied_at"], reverse=True)


@router.get("/applications/{application_id}", response_model=JobApplicationResponse)
async def get_application(
    application_id: UUID,
    current_user: User = Depends(get_current_user)
):
    """Get a specific application"""
    if application_id not in APPLICATIONS_DB:
        raise HTTPException(status_code=404, detail="Application not found")

    app = APPLICATIONS_DB[application_id]

    # Only allow access if user owns it or has admin/hr role
    if app.get("applicant_email") != current_user.email and current_user.role not in ["admin", "hr", "mother_portal"]:
        raise HTTPException(status_code=403, detail="Access denied")

    return app


@router.put("/applications/{application_id}/review")
async def review_application(
    application_id: UUID,
    review: ApplicationReviewRequest,
    current_user: User = Depends(require_permissions(["admin", "hr"]))
):
    """Review/update application status (hr/admin only)"""
    if application_id not in APPLICATIONS_DB:
        raise HTTPException(status_code=404, detail="Application not found")

    app = APPLICATIONS_DB[application_id]

    app["status"] = review.status
    app["reviewed_at"] = datetime.now()
    app["reviewer_notes"] = review.notes

    return app


# ============ Statistics ============

@router.get("/stats/overview")
async def get_career_stats(
    current_user: User = Depends(require_permissions(["admin", "hr", "mother_portal"]))
):
    """Get career portal statistics"""
    total_jobs = len(JOBS_DB)
    open_jobs = sum(1 for j in JOBS_DB.values() if j.get("status") == "open")
    closing_soon = sum(1 for j in JOBS_DB.values() if j.get("status") == "closing_soon")

    by_department = {}
    by_location = {}

    for job in JOBS_DB.values():
        dept = job.get("department", "Other")
        loc = job.get("location", "Unknown")
        by_department[dept] = by_department.get(dept, 0) + 1
        by_location[loc] = by_location.get(loc, 0) + 1

    total_applications = len(APPLICATIONS_DB)
    by_status = {}
    for app in APPLICATIONS_DB.values():
        status = app.get("status", "submitted")
        by_status[status] = by_status.get(status, 0) + 1

    return {
        "jobs": {
            "total": total_jobs,
            "open": open_jobs,
            "closing_soon": closing_soon,
            "by_department": by_department,
            "by_location": by_location
        },
        "applications": {
            "total": total_applications,
            "by_status": by_status
        }
    }


@router.get("/departments")
async def get_departments(
    current_user: User = Depends(get_current_user)
):
    """Get list of all departments with openings"""
    departments = set()
    for job in JOBS_DB.values():
        if job.get("status") in ["open", "closing_soon"]:
            departments.add(job.get("department"))
    return sorted(list(departments))


@router.get("/locations")
async def get_locations(
    current_user: User = Depends(get_current_user)
):
    """Get list of all job locations"""
    locations = set()
    for job in JOBS_DB.values():
        if job.get("status") in ["open", "closing_soon"]:
            locations.add(job.get("location"))
    return sorted(list(locations))
