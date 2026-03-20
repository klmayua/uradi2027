"""
USSD API Endpoints for URADI-360
Receives webhook calls from USSD providers (Africa's Talking, etc.)
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
from database import get_db
from services.ussd_service import ussd_service, USSDService
from utils.rate_limiting import webhook_limit
import os

router = APIRouter(prefix="/api/ussd", tags=["USSD"])


# ==================== USSD WEBHOOK MODELS ====================

class USSDWebhookRequest(BaseModel):
    """USSD webhook request from provider"""
    session_id: str
    phone_number: str
    network_code: str
    service_code: str  # e.g., *383*KANO#
    text: str  # User input
    tenant_id: Optional[str] = None  # Extracted from service_code


class USSDResponse(BaseModel):
    """USSD response to provider"""
    text: str
    action: str = "request"  # "request" to continue, "end" to terminate


# ==================== USSD WEBHOOK ENDPOINTS ====================

@router.post("/webhook")
@webhook_limit()
async def ussd_webhook(
    request: Request,
    session_id: str = Form(...),
    phone_number: str = Form(...),
    network_code: str = Form(...),
    service_code: str = Form(...),
    text: str = Form(default=""),
    db: Session = Depends(get_db)
):
    """
    Main USSD webhook endpoint
    Receives requests from Africa's Talking or other USSD providers

    Expected form data:
    - sessionId: Unique session ID from provider
    - phoneNumber: User's phone number
    - networkCode: Mobile network code
    - serviceCode: USSD code dialed (*383*KANO#)
    - text: User input (empty for new session)
    """
    # Extract tenant from service code
    # Format: *383*KANO# or *383*JIGAWA#
    tenant_id = _extract_tenant_from_service_code(service_code)

    if not tenant_id:
        return {
            "text": "Invalid service code. Please check and try again.",
            "action": "end"
        }

    # Clean phone number
    phone_number = _clean_phone_number(phone_number)

    # Process through USSD service
    response_text = ussd_service.process_input(
        phone_number=phone_number,
        tenant_id=tenant_id,
        text=text,
        session_id=session_id
    )

    # Determine if session should end
    action = "end" if "Thank you" in response_text or "Na gode" in response_text or "A jaɓɓaama" in response_text else "request"

    return {
        "text": response_text,
        "action": action
    }


@router.post("/webhook/termii")
@webhook_limit()
async def ussd_webhook_termii(
    request: Request,
    session_id: str = Form(..., alias="session_id"),
    phone_number: str = Form(..., alias="phone_number"),
    network_code: str = Form(..., alias="network_code"),
    service_code: str = Form(..., alias="service_code"),
    text: str = Form(default=""),
    db: Session = Depends(get_db)
):
    """
    USSD webhook endpoint for Termii provider
    Termii uses slightly different parameter names
    """
    return await ussd_webhook(
        request=request,
        session_id=session_id,
        phone_number=phone_number,
        network_code=network_code,
        service_code=service_code,
        text=text,
        db=db
    )


@router.post("/webhook/test")
async def ussd_webhook_test(
    phone_number: str = "+2348012345678",
    text: str = "",
    tenant_id: str = "kano",
    db: Session = Depends(get_db)
):
    """
    Test endpoint for USSD flow
    Allows manual testing without actual USSD provider
    """
    phone_number = _clean_phone_number(phone_number)

    response_text = ussd_service.process_input(
        phone_number=phone_number,
        tenant_id=tenant_id,
        text=text
    )

    # Get session info
    session_stats = ussd_service.get_session_stats(phone_number)

    return {
        "response": response_text,
        "session": session_stats,
        "next_prompt": "Enter next input (or 'end' to clear session):"
    }


@router.post("/webhook/test/reset")
async def ussd_test_reset(phone_number: str = "+2348012345678"):
    """
    Reset test session
    """
    phone_number = _clean_phone_number(phone_number)
    ussd_service.end_session(phone_number)
    return {"message": "Session cleared", "phone_number": phone_number}


# ==================== USSD SESSION MANAGEMENT ====================

@router.get("/sessions/{phone_number}")
async def get_session_status(phone_number: str):
    """
    Get current USSD session status for a phone number
    """
    phone_number = _clean_phone_number(phone_number)
    stats = ussd_service.get_session_stats(phone_number)

    if not stats:
        return {
            "phone_number": phone_number,
            "active": False,
            "message": "No active session"
        }

    return {
        "phone_number": phone_number,
        "active": True,
        **stats
    }


@router.delete("/sessions/{phone_number}")
async def end_session(phone_number: str):
    """
    Force end a USSD session
    """
    phone_number = _clean_phone_number(phone_number)
    ussd_service.end_session(phone_number)
    return {"message": "Session ended", "phone_number": phone_number}


# ==================== USSD CONFIGURATION ====================

@router.get("/config/{tenant_id}")
async def get_ussd_config(tenant_id: str):
    """
    Get USSD configuration for a tenant
    Returns the USSD code and supported features
    """
    configs = {
        "kano": {
            "service_code": "*383*KANO#",
            "name": "Kano Citizen Feedback",
            "languages": ["en", "ha", "ff"],
            "features": ["feedback", "status_check"],
            "lgas": 44,
            "active": True
        },
        "jigawa": {
            "service_code": "*383*JIGAWA#",
            "name": "Jigawa Citizen Feedback",
            "languages": ["en", "ha", "ff"],
            "features": ["feedback", "status_check"],
            "lgas": 27,
            "active": True
        }
    }

    config = configs.get(tenant_id)
    if not config:
        raise HTTPException(status_code=404, detail="Tenant not found")

    return config


@router.get("/providers")
async def get_supported_providers():
    """
    Get list of supported USSD providers and their webhook URLs
    """
    return {
        "providers": [
            {
                "name": "Africa's Talking",
                "webhook_url": "/api/ussd/webhook",
                "docs": "https://africastalking.com/ussd",
                "supported": True
            },
            {
                "name": "Termii",
                "webhook_url": "/api/ussd/webhook/termii",
                "docs": "https://termii.com/ussd",
                "supported": True
            }
        ],
        "configuration": {
            "method": "POST",
            "content_type": "application/x-www-form-urlencoded",
            "required_fields": ["sessionId", "phoneNumber", "serviceCode", "text"]
        }
    }


# ==================== HELPER FUNCTIONS ====================

def _extract_tenant_from_service_code(service_code: str) -> Optional[str]:
    """
    Extract tenant ID from USSD service code
    Examples:
    - *383*KANO# -> kano
    - *383*JIGAWA# -> jigawa
    - *383*KANO*1# -> kano
    """
    try:
        # Remove * and #
        clean = service_code.replace("*", " ").replace("#", " ").strip()
        parts = clean.split()

        # Find the tenant code (usually after 383)
        for i, part in enumerate(parts):
            if part == "383" and i + 1 < len(parts):
                return parts[i + 1].lower()

        # Fallback: check if any known tenant in the code
        code_lower = service_code.lower()
        if "kano" in code_lower:
            return "kano"
        elif "jigawa" in code_lower:
            return "jigawa"

        return None
    except Exception:
        return None


def _clean_phone_number(phone_number: str) -> str:
    """
    Clean and normalize phone number
    - Remove spaces
    - Ensure +234 prefix
    """
    # Remove spaces and dashes
    cleaned = phone_number.replace(" ", "").replace("-", "")

    # Ensure + prefix
    if not cleaned.startswith("+"):
        if cleaned.startswith("234"):
            cleaned = "+" + cleaned
        elif cleaned.startswith("0"):
            cleaned = "+234" + cleaned[1:]
        else:
            cleaned = "+234" + cleaned

    return cleaned


# ==================== USSD FLOW DOCUMENTATION ====================

@router.get("/flow")
async def get_ussd_flow():
    """
    Get USSD menu flow documentation
    """
    return {
        "flow": [
            {
                "step": 1,
                "state": "MAIN_MENU",
                "description": "Welcome menu",
                "options": {
                    "1": "Submit Feedback",
                    "2": "Check Status",
                    "3": "Change Language"
                }
            },
            {
                "step": 2,
                "state": "SELECT_LGA",
                "description": "LGA selection",
                "trigger": "Select option 1 from main menu",
                "options": "List of LGAs (1-5 shown at a time)"
            },
            {
                "step": 3,
                "state": "SELECT_WARD",
                "description": "Ward selection",
                "trigger": "Select LGA",
                "options": "List of wards in selected LGA"
            },
            {
                "step": 4,
                "state": "FEEDBACK_CATEGORY",
                "description": "Feedback category selection",
                "trigger": "Select ward",
                "options": {
                    "1": "Governance",
                    "2": "Security",
                    "3": "Economy",
                    "4": "Infrastructure",
                    "5": "Other"
                }
            },
            {
                "step": 5,
                "state": "FEEDBACK_TEXT",
                "description": "Feedback text input",
                "trigger": "Select category",
                "input": "Free text (max 500 characters)"
            },
            {
                "step": 6,
                "state": "CONFIRM_SUBMISSION",
                "description": "Confirm submission",
                "trigger": "Enter feedback text",
                "options": {
                    "1": "Yes, submit",
                    "2": "No, go back"
                }
            },
            {
                "step": 7,
                "state": "END",
                "description": "Session ends",
                "trigger": "Confirm submission",
                "response": "Reference number provided"
            }
        ],
        "navigation": {
            "0": "Go back to previous menu",
            "timeout": "5 minutes of inactivity"
        },
        "languages": {
            "en": "English",
            "ha": "Hausa",
            "ff": "Fulfulde"
        }
    }
