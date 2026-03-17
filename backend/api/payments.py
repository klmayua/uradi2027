"""
Payment API Endpoints
Paystack payment processing for donations and subscriptions
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
from database import get_db
from auth.utils import get_current_user
from services.payment_service import paystack_service
import logging

router = APIRouter(prefix="/api/payments", tags=["Payments"])
logger = logging.getLogger(__name__)


# Pydantic Models
class InitializePaymentRequest(BaseModel):
    email: str
    amount: int  # Amount in kobo (NGN * 100)
    reference: Optional[str] = None
    callback_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class VerifyPaymentRequest(BaseModel):
    reference: str


class CreateCustomerRequest(BaseModel):
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None


class CreateSubscriptionRequest(BaseModel):
    customer_email: str
    plan_code: str
    authorization_code: Optional[str] = None


# API Endpoints
@router.post("/initialize")
def initialize_payment(
    request: InitializePaymentRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Initialize a payment transaction"""
    if not paystack_service.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment service not configured. Set PAYSTACK_SECRET_KEY environment variable."
        )
    
    result = paystack_service.initialize_transaction(
        email=request.email,
        amount=request.amount,
        reference=request.reference,
        callback_url=request.callback_url,
        metadata=request.metadata
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to initialize payment")
        )
    
    return result


@router.post("/verify")
def verify_payment(
    request: VerifyPaymentRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Verify a payment transaction"""
    if not paystack_service.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment service not configured"
        )
    
    result = paystack_service.verify_transaction(request.reference)
    
    return result


@router.post("/customers")
def create_customer(
    request: CreateCustomerRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a Paystack customer"""
    if not paystack_service.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment service not configured"
        )
    
    result = paystack_service.create_customer(
        email=request.email,
        first_name=request.first_name,
        last_name=request.last_name,
        phone=request.phone
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to create customer")
        )
    
    return result


@router.post("/subscriptions")
def create_subscription(
    request: CreateSubscriptionRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a subscription"""
    if not paystack_service.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment service not configured"
        )
    
    result = paystack_service.create_subscription(
        customer_email=request.customer_email,
        plan_code=request.plan_code,
        authorization_code=request.authorization_code
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to create subscription")
        )
    
    return result


@router.post("/webhook")
def paystack_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle Paystack webhook events
    This endpoint should be publicly accessible (no auth required)
    """
    if not paystack_service.is_configured():
        logger.warning("Paystack webhook received but service not configured")
        return {"status": "ignored"}
    
    try:
        # Get signature from header
        signature = request.headers.get("x-paystack-signature")
        if not signature:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing signature"
            )
        
        # Get payload
        payload = await request.body()
        
        # Verify signature
        if not paystack_service.verify_webhook(payload, signature):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid signature"
            )
        
        # Parse event data
        import json
        event_data = json.loads(payload)
        
        # Process webhook
        result = paystack_service.process_webhook(event_data)
        
        # TODO: Store event in database
        # TODO: Trigger notifications
        
        logger.info(f"Paystack webhook processed: {result}")
        
        return {"status": "success", "processed": result}
        
    except Exception as e:
        logger.error(f"Webhook processing failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook processing failed"
        )


@router.get("/status")
def get_payment_status():
    """Check if payment service is configured"""
    return {
        "configured": paystack_service.is_configured(),
        "base_url": paystack_service.base_url if paystack_service.is_configured() else None
    }
