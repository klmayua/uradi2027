"""
Documents API Module
Handles document management, uploads, and file organization
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
from uuid import UUID, uuid4

from utils.auth import get_current_user, require_permissions
from models import User

router = APIRouter(prefix="/documents", tags=["Documents"])


# ============ Pydantic Models ============

class DocumentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    category: Literal["campaign", "legal", "financial", "press", "strategy", "research", "other"] = "other"
    tags: List[str] = Field(default_factory=list)
    access_level: Literal["public", "internal", "confidential", "restricted"] = "internal"
    folder_id: Optional[UUID] = None


class DocumentUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    access_level: Optional[str] = None


class DocumentResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    filename: str
    file_size: int
    mime_type: str
    category: str
    tags: List[str]
    access_level: str
    folder_id: Optional[UUID]
    uploaded_by: str
    uploaded_at: datetime
    download_url: Optional[str]


class FolderCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=200)
    parent_id: Optional[UUID] = None


class FolderResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    parent_id: Optional[UUID]
    document_count: int
    created_at: datetime


class DocumentShareRequest(BaseModel):
    user_ids: List[UUID]
    permission: Literal["view", "edit", "admin"] = "view"
    expires_at: Optional[datetime] = None


# ============ Mock Data Store ============

DOCUMENTS_DB = {}
FOLDERS_DB = {}
DOCUMENT_SHARES_DB = {}

# Seed folders
_seed_folders = [
    {"id": uuid4(), "name": "Campaign Materials", "description": "Campaign strategy and planning documents", "parent_id": None, "created_at": datetime.now()},
    {"id": uuid4(), "name": "Financial Reports", "description": "Budget and expenditure reports", "parent_id": None, "created_at": datetime.now()},
    {"id": uuid4(), "name": "Press Releases", "description": "Official press statements", "parent_id": None, "created_at": datetime.now()},
    {"id": uuid4(), "name": "Legal Documents", "description": "Contracts and legal filings", "parent_id": None, "created_at": datetime.now()},
]
for folder in _seed_folders:
    FOLDERS_DB[folder["id"]] = folder

# Seed documents
_seed_docs = [
    {"id": uuid4(), "title": "2027 Campaign Strategy", "description": "Main campaign strategy document", "filename": "campaign_strategy_2027.pdf", "file_size": 2450000, "mime_type": "application/pdf", "category": "strategy", "tags": ["strategy", "2027"], "access_level": "confidential", "folder_id": None, "uploaded_by": "Admin User", "uploaded_at": datetime.now()},
    {"id": uuid4(), "title": "Q1 Financial Report", "description": "First quarter financial summary", "filename": "q1_financials.xlsx", "file_size": 890000, "mime_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "category": "financial", "tags": ["finance", "q1"], "access_level": "internal", "folder_id": None, "uploaded_by": "Finance Team", "uploaded_at": datetime.now()},
    {"id": uuid4(), "title": "Press Release - Campaign Launch", "description": "Official campaign launch announcement", "filename": "press_launch.docx", "file_size": 45000, "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "category": "press", "tags": ["press", "launch"], "access_level": "public", "folder_id": None, "uploaded_by": "Communications", "uploaded_at": datetime.now()},
]
for doc in _seed_docs:
    DOCUMENTS_DB[doc["id"]] = doc


# ============ Helper Functions ============

def format_file_size(size_bytes: int) -> str:
    """Format file size for human reading"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.1f} TB"


def check_access(document: dict, user: User) -> bool:
    """Check if user has access to document"""
    access = document.get("access_level", "internal")
    if access == "public":
        return True
    if access == "internal":
        return True  # Any logged-in user
    if access in ["confidential", "restricted"]:
        # Would check user roles here
        return user.role in ["admin", "mother_portal", "candidate"]
    return False


# ============ API Endpoints ============

@router.get("/", response_model=List[DocumentResponse])
async def list_documents(
    folder_id: Optional[UUID] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    access_level: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """List documents with optional filtering"""
    results = []

    for doc in DOCUMENTS_DB.values():
        # Check access
        if not check_access(doc, current_user):
            continue

        # Apply filters
        if folder_id is not None and doc.get("folder_id") != folder_id:
            continue
        if category and doc.get("category") != category:
            continue
        if access_level and doc.get("access_level") != access_level:
            continue
        if search and search.lower() not in doc.get("title", "").lower():
            continue

        results.append({
            **doc,
            "download_url": f"/api/documents/{doc['id']}/download"
        })

    return sorted(results, key=lambda x: x["uploaded_at"], reverse=True)


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    metadata: DocumentCreate,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload a new document"""
    doc_id = uuid4()

    # In real implementation, save file to storage
    file_content = await file.read()
    file_size = len(file_content)

    document = {
        "id": doc_id,
        "title": metadata.title,
        "description": metadata.description,
        "filename": file.filename,
        "file_size": file_size,
        "mime_type": file.content_type or "application/octet-stream",
        "category": metadata.category,
        "tags": metadata.tags,
        "access_level": metadata.access_level,
        "folder_id": metadata.folder_id,
        "uploaded_by": current_user.full_name,
        "uploaded_at": datetime.now()
    }

    DOCUMENTS_DB[doc_id] = document

    return {
        **document,
        "download_url": f"/api/documents/{doc_id}/download"
    }


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user)
):
    """Get a specific document"""
    if document_id not in DOCUMENTS_DB:
        raise HTTPException(status_code=404, detail="Document not found")

    doc = DOCUMENTS_DB[document_id]

    if not check_access(doc, current_user):
        raise HTTPException(status_code=403, detail="Access denied")

    return {
        **doc,
        "download_url": f"/api/documents/{document_id}/download"
    }


@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: UUID,
    update: DocumentUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update document metadata"""
    if document_id not in DOCUMENTS_DB:
        raise HTTPException(status_code=404, detail="Document not found")

    doc = DOCUMENTS_DB[document_id]

    # Check if user can edit (would be more complex in real app)
    if doc.get("uploaded_by") != current_user.full_name and current_user.role not in ["admin", "mother_portal"]:
        raise HTTPException(status_code=403, detail="Not authorized to edit this document")

    if update.title is not None:
        doc["title"] = update.title
    if update.description is not None:
        doc["description"] = update.description
    if update.category is not None:
        doc["category"] = update.category
    if update.tags is not None:
        doc["tags"] = update.tags
    if update.access_level is not None:
        doc["access_level"] = update.access_level

    return {
        **doc,
        "download_url": f"/api/documents/{document_id}/download"
    }


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: UUID,
    current_user: User = Depends(require_permissions(["admin", "mother_portal"]))
):
    """Delete a document"""
    if document_id not in DOCUMENTS_DB:
        raise HTTPException(status_code=404, detail="Document not found")

    del DOCUMENTS_DB[document_id]
    return {"message": "Document deleted"}


@router.get("/{document_id}/download")
async def download_document(
    document_id: UUID,
    current_user: User = Depends(get_current_user)
):
    """Download a document"""
    if document_id not in DOCUMENTS_DB:
        raise HTTPException(status_code=404, detail="Document not found")

    doc = DOCUMENTS_DB[document_id]

    if not check_access(doc, current_user):
        raise HTTPException(status_code=403, detail="Access denied")

    # In real implementation, return FileResponse
    return {
        "message": "Download endpoint - would return file",
        "filename": doc["filename"],
        "size": format_file_size(doc["file_size"])
    }


# ============ Folder Endpoints ============

@router.get("/folders/", response_model=List[FolderResponse])
async def list_folders(
    parent_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_user)
):
    """List folders"""
    results = []

    for folder in FOLDERS_DB.values():
        if folder.get("parent_id") == parent_id:
            # Count documents in folder
            doc_count = sum(1 for d in DOCUMENTS_DB.values() if d.get("folder_id") == folder["id"])
            results.append({
                **folder,
                "document_count": doc_count
            })

    return results


@router.post("/folders/", response_model=FolderResponse, status_code=status.HTTP_201_CREATED)
async def create_folder(
    folder: FolderCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new folder"""
    folder_id = uuid4()

    new_folder = {
        "id": folder_id,
        "name": folder.name,
        "description": folder.description,
        "parent_id": folder.parent_id,
        "created_at": datetime.now()
    }

    FOLDERS_DB[folder_id] = new_folder

    return {
        **new_folder,
        "document_count": 0
    }


@router.delete("/folders/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_folder(
    folder_id: UUID,
    current_user: User = Depends(require_permissions(["admin", "mother_portal"]))
):
    """Delete a folder"""
    if folder_id not in FOLDERS_DB:
        raise HTTPException(status_code=404, detail="Folder not found")

    # Check if folder has documents
    has_docs = any(d.get("folder_id") == folder_id for d in DOCUMENTS_DB.values())
    if has_docs:
        raise HTTPException(status_code=400, detail="Cannot delete folder containing documents")

    del FOLDERS_DB[folder_id]
    return {"message": "Folder deleted"}


# ============ Statistics ============

@router.get("/stats/overview")
async def get_document_stats(
    current_user: User = Depends(get_current_user)
):
    """Get document library statistics"""
    total_size = sum(d.get("file_size", 0) for d in DOCUMENTS_DB.values())

    by_category = {}
    by_access = {}

    for doc in DOCUMENTS_DB.values():
        cat = doc.get("category", "other")
        access = doc.get("access_level", "internal")
        by_category[cat] = by_category.get(cat, 0) + 1
        by_access[access] = by_access.get(access, 0) + 1

    return {
        "total_documents": len(DOCUMENTS_DB),
        "total_folders": len(FOLDERS_DB),
        "total_size_bytes": total_size,
        "total_size_formatted": format_file_size(total_size),
        "by_category": by_category,
        "by_access_level": by_access
    }
