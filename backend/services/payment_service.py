"""
Payment Service Integration
Paystack payment processing for donations and subscriptions
"""

import os
import requests
from typing import Dict, Any, Optional
import logging
import hmac
import hashlib

logger = logging.getLogger(__name__)

class PaystackService:
    """Paystack payment service for URADI-360"""
    
    def __init__(self):
        self.secret_key = os.getenv("PAYSTACK_SECRET_KEY")
        self.public_key = os.getenv("PAYSTACK_PUBLIC_KEY")
        self.webhook_secret = os.getenv("PAYSTACK_WEBHOOK_SECRET")
        self.base_url = os.getenv("PAYSTACK_BASE_URL", "https://api.paystack.co")
        
        self.headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        } if self.secret_key else {}
    
    def is_configured(self) -> bool:
        """Check if Paystack is properly configured"""
        return bool(self.secret_key and self.public_key)
    
    def initialize_transaction(
        self,
        email: str,
        amount: int,  # Amount in kobo (NGN * 100)
        reference: Optional[str] = None,
        callback_url: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Initialize a payment transaction
        
        Args:
            email: Customer email
            amount: Amount in kobo (NGN * 100)
            reference: Unique transaction reference
            callback_url: URL to redirect after payment
            metadata: Additional transaction data
        
        Returns:
            dict: Transaction details including authorization_url
        """
        if not self.is_configured():
            logger.error("Paystack not configured")
            return {"success": False, "error": "Paystack not configured"}
        
        try:
            payload = {
                "email": email,
                "amount": amount,
                "reference": reference,
                "callback_url": callback_url,
                "metadata": metadata or {}
            }
            
            # Remove None values
            payload = {k: v for k, v in payload.items() if v is not None}
            
            response = requests.post(
                f"{self.base_url}/transaction/initialize",
                headers=self.headers,
                json=payload
            )
            
            data = response.json()
            
            if data.get("status"):
                return {
                    "success": True,
                    "authorization_url": data["data"]["authorization_url"],
                    "access_code": data["data"]["access_code"],
                    "reference": data["data"]["reference"]
                }
            else:
                return {
                    "success": False,
                    "error": data.get("message", "Unknown error")
                }
                
        except Exception as e:
            logger.error(f"Failed to initialize transaction: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def verify_transaction(self, reference: str) -> Dict[str, Any]:
        """
        Verify a transaction
        
        Args:
            reference: Transaction reference
        
        Returns:
            dict: Transaction verification details
        """
        if not self.is_configured():
            return {"success": False, "error": "Paystack not configured"}
        
        try:
            response = requests.get(
                f"{self.base_url}/transaction/verify/{reference}",
                headers=self.headers
            )
            
            data = response.json()
            
            if data.get("status"):
                transaction_data = data["data"]
                return {
                    "success": True,
                    "status": transaction_data.get("status"),
                    "amount": transaction_data.get("amount"),
                    "currency": transaction_data.get("currency"),
                    "paid_at": transaction_data.get("paid_at"),
                    "channel": transaction_data.get("channel"),
                    "customer": transaction_data.get("customer", {})
                }
            else:
                return {
                    "success": False,
                    "error": data.get("message", "Verification failed")
                }
                
        except Exception as e:
            logger.error(f"Failed to verify transaction: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def create_customer(
        self,
        email: str,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        phone: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a Paystack customer
        
        Args:
            email: Customer email
            first_name: First name
            last_name: Last name
            phone: Phone number
        
        Returns:
            dict: Customer details
        """
        if not self.is_configured():
            return {"success": False, "error": "Paystack not configured"}
        
        try:
            payload = {
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "phone": phone
            }
            
            # Remove None values
            payload = {k: v for k, v in payload.items() if v is not None}
            
            response = requests.post(
                f"{self.base_url}/customer",
                headers=self.headers,
                json=payload
            )
            
            data = response.json()
            
            if data.get("status"):
                return {
                    "success": True,
                    "customer_code": data["data"]["customer_code"],
                    "id": data["data"]["id"]
                }
            else:
                return {
                    "success": False,
                    "error": data.get("message", "Failed to create customer")
                }
                
        except Exception as e:
            logger.error(f"Failed to create customer: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def create_subscription(
        self,
        customer_email: str,
        plan_code: str,
        authorization_code: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a subscription
        
        Args:
            customer_email: Customer email
            plan_code: Paystack plan code
            authorization_code: Authorization code from previous transaction
        
        Returns:
            dict: Subscription details
        """
        if not self.is_configured():
            return {"success": False, "error": "Paystack not configured"}
        
        try:
            payload = {
                "customer": customer_email,
                "plan": plan_code
            }
            
            if authorization_code:
                payload["authorization"] = authorization_code
            
            response = requests.post(
                f"{self.base_url}/subscription",
                headers=self.headers,
                json=payload
            )
            
            data = response.json()
            
            if data.get("status"):
                return {
                    "success": True,
                    "subscription_code": data["data"]["subscription_code"],
                    "status": data["data"]["status"]
                }
            else:
                return {
                    "success": False,
                    "error": data.get("message", "Failed to create subscription")
                }
                
        except Exception as e:
            logger.error(f"Failed to create subscription: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def verify_webhook(self, payload: bytes, signature: str) -> bool:
        """
        Verify Paystack webhook signature
        
        Args:
            payload: Request body bytes
            signature: X-Paystack-Signature header
        
        Returns:
            bool: True if signature is valid
        """
        if not self.webhook_secret:
            logger.warning("Webhook secret not configured")
            return False
        
        try:
            expected_signature = hmac.new(
                self.webhook_secret.encode(),
                payload,
                hashlib.sha512
            ).hexdigest()
            
            return hmac.compare_digest(expected_signature, signature)
            
        except Exception as e:
            logger.error(f"Webhook verification failed: {str(e)}")
            return False
    
    def process_webhook(self, event_data: Dict) -> Dict[str, Any]:
        """
        Process Paystack webhook event
        
        Args:
            event_data: Webhook event data
        
        Returns:
            dict: Processed event details
        """
        event_type = event_data.get("event")
        data = event_data.get("data", {})
        
        if event_type == "charge.success":
            return {
                "event": "payment_success",
                "reference": data.get("reference"),
                "amount": data.get("amount"),
                "customer_email": data.get("customer", {}).get("email"),
                "status": data.get("status")
            }
        
        elif event_type == "subscription.create":
            return {
                "event": "subscription_created",
                "subscription_code": data.get("subscription_code"),
                "customer_email": data.get("customer"),
                "plan": data.get("plan")
            }
        
        elif event_type == "subscription.disable":
            return {
                "event": "subscription_cancelled",
                "subscription_code": data.get("subscription_code")
            }
        
        return {"event": event_type, "data": data}


# Global instance
paystack_service = PaystackService()
