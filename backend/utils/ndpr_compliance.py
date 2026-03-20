"""
NDPR (Nigeria Data Protection Regulation) Compliance Module for URADI-360
Implements data subject rights, consent management, and data retention policies
"""

import os
import json
import hashlib
import uuid
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import redis

# Redis for audit log
redis_client = redis.from_url(
    os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    encoding="utf-8",
    decode_responses=True
)


class ConsentType(Enum):
    """Types of consent"""
    VOTER_REGISTRATION = "voter_registration"
    COMMUNICATION = "communication"
    DATA_SHARING = "data_sharing"
    MARKETING = "marketing"
    ANALYTICS = "analytics"


class ConsentStatus(Enum):
    """Consent status"""
    GRANTED = "granted"
    REVOKED = "revoked"
    EXPIRED = "expired"
    PENDING = "pending"


class DataRetentionPolicy(Enum):
    """Data retention periods"""
    VOTER_DATA = 1095  # 3 years
    SENTIMENT_DATA = 365  # 1 year
    MESSAGE_LOGS = 180  # 6 months
    AUDIT_LOGS = 2555  # 7 years (legal requirement)
    INCIDENT_REPORTS = 730  # 2 years


@dataclass
class ConsentRecord:
    """Consent record"""
    voter_id: str
    consent_type: str
    status: str
    granted_at: Optional[str]
    revoked_at: Optional[str]
    expires_at: Optional[str]
    purpose: str
    channel: str
    ip_address: Optional[str]
    user_agent: Optional[str]


class NDPRCompliance:
    """
    NDPR Compliance Manager
    Handles data subject rights, consent, and retention
    """

    def __init__(self):
        self.redis = redis_client
        self.anonymization_salt = os.getenv("ANONYMIZATION_SALT", "uradi360-salt")

    # ==================== CONSENT MANAGEMENT ====================

    def record_consent(
        self,
        voter_id: str,
        consent_type: ConsentType,
        purpose: str,
        channel: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        expiry_days: int = 365
    ) -> Dict[str, Any]:
        """
        Record explicit consent from data subject

        Args:
            voter_id: Unique voter identifier
            consent_type: Type of consent being granted
            purpose: Specific purpose for data processing
            channel: Channel through which consent was obtained (ussd, web, etc.)
            ip_address: Optional IP address
            user_agent: Optional user agent
            expiry_days: Days until consent expires

        Returns:
            Consent record
        """
        now = datetime.utcnow()
        expires_at = now + timedelta(days=expiry_days)

        record = {
            "id": str(uuid.uuid4()),
            "voter_id": voter_id,
            "consent_type": consent_type.value,
            "status": ConsentStatus.GRANTED.value,
            "granted_at": now.isoformat(),
            "revoked_at": None,
            "expires_at": expires_at.isoformat(),
            "purpose": purpose,
            "channel": channel,
            "ip_address": self._hash_ip(ip_address) if ip_address else None,
            "user_agent": user_agent,
            "created_at": now.isoformat()
        }

        # Store in Redis
        key = f"consent:{voter_id}:{consent_type.value}"
        self.redis.setex(key, int(expiry_days * 86400), json.dumps(record))

        # Log the consent
        self._log_audit_event("consent_granted", voter_id, {
            "consent_type": consent_type.value,
            "purpose": purpose,
            "channel": channel
        })

        return record

    def revoke_consent(
        self,
        voter_id: str,
        consent_type: ConsentType,
        reason: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Revoke previously granted consent

        Args:
            voter_id: Unique voter identifier
            consent_type: Type of consent to revoke
            reason: Optional reason for revocation

        Returns:
            Updated consent record or None if not found
        """
        key = f"consent:{voter_id}:{consent_type.value}"
        data = self.redis.get(key)

        if not data:
            return None

        record = json.loads(data)
        record["status"] = ConsentStatus.REVOKED.value
        record["revoked_at"] = datetime.utcnow().isoformat()
        record["revocation_reason"] = reason

        # Update with shorter TTL (retain for audit)
        self.redis.setex(key, DataRetentionPolicy.AUDIT_LOGS.value * 86400, json.dumps(record))

        # Log the revocation
        self._log_audit_event("consent_revoked", voter_id, {
            "consent_type": consent_type.value,
            "reason": reason
        })

        return record

    def check_consent(self, voter_id: str, consent_type: ConsentType) -> Dict[str, Any]:
        """
        Check if valid consent exists

        Returns:
            Dict with valid (bool), status, and record
        """
        key = f"consent:{voter_id}:{consent_type.value}"
        data = self.redis.get(key)

        if not data:
            return {
                "valid": False,
                "status": "not_found",
                "record": None
            }

        record = json.loads(data)
        status = record.get("status")

        # Check if expired
        if status == ConsentStatus.GRANTED.value:
            expires_at = datetime.fromisoformat(record["expires_at"])
            if datetime.utcnow() > expires_at:
                record["status"] = ConsentStatus.EXPIRED.value
                return {
                    "valid": False,
                    "status": "expired",
                    "record": record
                }

            return {
                "valid": True,
                "status": "active",
                "record": record
            }

        return {
            "valid": False,
            "status": status,
            "record": record
        }

    def get_all_consents(self, voter_id: str) -> List[Dict[str, Any]]:
        """Get all consent records for a voter"""
        pattern = f"consent:{voter_id}:*"
        keys = self.redis.keys(pattern)
        records = []

        for key in keys:
            data = self.redis.get(key)
            if data:
                records.append(json.loads(data))

        return records

    # ==================== DATA SUBJECT RIGHTS ====================

    def get_data_subject_rights(self, voter_id: str) -> Dict[str, Any]:
        """
        Get information about data subject rights

        Returns:
            Dict with rights explanation
        """
        return {
            "voter_id": voter_id,
            "rights": [
                {
                    "right": "access",
                    "description": "Right to access personal data",
                    "endpoint": f"/api/compliance/data-access/{voter_id}",
                    "method": "GET"
                },
                {
                    "right": "rectification",
                    "description": "Right to correct inaccurate data",
                    "endpoint": f"/api/voters/{voter_id}",
                    "method": "PATCH"
                },
                {
                    "right": "erasure",
                    "description": "Right to delete personal data",
                    "endpoint": "/api/compliance/data-deletion",
                    "method": "POST"
                },
                {
                    "right": "portability",
                    "description": "Right to data portability",
                    "endpoint": "/api/compliance/data-export",
                    "method": "POST"
                },
                {
                    "right": "objection",
                    "description": "Right to object to processing",
                    "endpoint": "/api/compliance/consent/revoke",
                    "method": "POST"
                }
            ],
            "contact": {
                "dpo_email": "dpo@uradi360.com",
                "dpo_phone": "+234-XXX-XXXX-XXX"
            }
        }

    # ==================== DATA RETENTION ====================

    def should_delete_data(self, data_type: str, created_at: datetime) -> bool:
        """
        Check if data should be deleted based on retention policy

        Args:
            data_type: Type of data (voter, sentiment, etc.)
            created_at: When the data was created

        Returns:
            True if data should be deleted
        """
        policies = {
            "voter": DataRetentionPolicy.VOTER_DATA.value,
            "sentiment": DataRetentionPolicy.SENTIMENT_DATA.value,
            "message_log": DataRetentionPolicy.MESSAGE_LOGS.value,
            "incident": DataRetentionPolicy.INCIDENT_REPORTS.value
        }

        retention_days = policies.get(data_type, 365)
        cutoff_date = datetime.utcnow() - timedelta(days=retention_days)

        return created_at < cutoff_date

    def get_retention_policy(self, data_type: str) -> Dict[str, Any]:
        """Get retention policy for data type"""
        policies = {
            "voter": {
                "days": DataRetentionPolicy.VOTER_DATA.value,
                "years": 3,
                "description": "Voter data retained for 3 years after last activity"
            },
            "sentiment": {
                "days": DataRetentionPolicy.SENTIMENT_DATA.value,
                "years": 1,
                "description": "Sentiment data retained for 1 year"
            },
            "message_log": {
                "days": DataRetentionPolicy.MESSAGE_LOGS.value,
                "years": 0.5,
                "description": "Message logs retained for 6 months"
            },
            "audit_log": {
                "days": DataRetentionPolicy.AUDIT_LOGS.value,
                "years": 7,
                "description": "Audit logs retained for 7 years (legal requirement)"
            }
        }

        return policies.get(data_type, {"days": 365, "description": "Default 1 year retention"})

    # ==================== ANONYMIZATION ====================

    def anonymize_voter(self, voter_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Anonymize voter data for analytics

        Removes PII but preserves demographic patterns
        """
        # Create hash of identifying information
        identifying = f"{voter_data.get('phone', '')}{voter_data.get('full_name', '')}"
        anonymous_id = hashlib.sha256(
            f"{identifying}{self.anonymization_salt}".encode()
        ).hexdigest()[:16]

        return {
            "anonymous_id": anonymous_id,
            "lga_id": voter_data.get("lga_id"),
            "ward_id": voter_data.get("ward_id"),
            "gender": voter_data.get("gender"),
            "age_range": voter_data.get("age_range"),
            "sentiment_score": voter_data.get("sentiment_score"),
            "party_leaning": voter_data.get("party_leaning"),
            # Remove PII fields
            "phone": None,
            "full_name": None,
            "notes": None
        }

    def pseudonymize(self, identifier: str) -> str:
        """
        Create pseudonym for an identifier
        Reversible with proper authorization
        """
        return hashlib.sha256(
            f"{identifier}{self.anonymization_salt}".encode()
        ).hexdigest()[:20]

    # ==================== AUDIT LOGGING ====================

    def _log_audit_event(
        self,
        event_type: str,
        voter_id: str,
        details: Dict[str, Any],
        user_id: Optional[str] = None
    ):
        """Log audit event"""
        event = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "voter_id": voter_id,
            "user_id": user_id,
            "details": details,
            "ip_address": None  # Will be set by middleware
        }

        key = f"audit:{datetime.utcnow().strftime('%Y-%m-%d')}:{voter_id}"
        self.redis.lpush(key, json.dumps(event))
        self.redis.expire(key, DataRetentionPolicy.AUDIT_LOGS.value * 86400)

    def get_audit_log(
        self,
        voter_id: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        event_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get audit log entries

        Args:
            voter_id: Filter by voter (None for all)
            date_from: Start date (ISO format)
            date_to: End date (ISO format)
            event_type: Filter by event type
        """
        events = []

        # Get keys for date range
        if date_from and date_to:
            start = datetime.fromisoformat(date_from)
            end = datetime.fromisoformat(date_to)
            keys = []
            current = start
            while current <= end:
                if voter_id:
                    keys.append(f"audit:{current.strftime('%Y-%m-%d')}:{voter_id}")
                else:
                    pattern = f"audit:{current.strftime('%Y-%m-%d')}:*"
                    keys.extend(self.redis.keys(pattern))
                current += timedelta(days=1)
        else:
            # Get last 7 days
            pattern = "audit:*"
            if voter_id:
                pattern = f"audit:*:{voter_id}"
            keys = self.redis.keys(pattern)

        # Fetch events
        for key in keys:
            entries = self.redis.lrange(key, 0, -1)
            for entry in entries:
                event = json.loads(entry)
                if event_type and event.get("event_type") != event_type:
                    continue
                events.append(event)

        # Sort by timestamp
        events.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return events

    # ==================== HELPER METHODS ====================

    def _hash_ip(self, ip_address: str) -> str:
        """Hash IP address for privacy"""
        return hashlib.sha256(f"{ip_address}{self.anonymization_salt}".encode()).hexdigest()[:16]

    def generate_privacy_report(self, voter_id: str) -> Dict[str, Any]:
        """
        Generate comprehensive privacy report for data subject

        Returns:
            Report with all data processing information
        """
        consents = self.get_all_consents(voter_id)
        audit_log = self.get_audit_log(voter_id=voter_id)

        return {
            "generated_at": datetime.utcnow().isoformat(),
            "voter_id": voter_id,
            "consent_status": consents,
            "data_processing_activities": [
                {
                    "activity": "voter_registration",
                    "legal_basis": "consent" if any(c["consent_type"] == ConsentType.VOTER_REGISTRATION.value for c in consents) else "legitimate_interest",
                    "retention_days": DataRetentionPolicy.VOTER_DATA.value
                },
                {
                    "activity": "sentiment_analysis",
                    "legal_basis": "consent" if any(c["consent_type"] == ConsentType.ANALYTICS.value for c in consents) else "legitimate_interest",
                    "retention_days": DataRetentionPolicy.SENTIMENT_DATA.value
                },
                {
                    "activity": "communication",
                    "legal_basis": "consent" if any(c["consent_type"] == ConsentType.COMMUNICATION.value for c in consents) else None,
                    "retention_days": DataRetentionPolicy.MESSAGE_LOGS.value
                }
            ],
            "recent_audit_events": audit_log[:10],
            "data_retention_policies": {
                "voter_data": f"{DataRetentionPolicy.VOTER_DATA.value} days",
                "sentiment_data": f"{DataRetentionPolicy.SENTIMENT_DATA.value} days",
                "message_logs": f"{DataRetentionPolicy.MESSAGE_LOGS.value} days"
            },
            "contact_for_questions": {
                "email": "dpo@uradi360.com",
                "response_time": "72 hours"
            }
        }


# Singleton instance
ndpr_compliance = NDPRCompliance()
