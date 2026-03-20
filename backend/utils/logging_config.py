"""
Structured Logging Configuration for URADI-360
Implements JSON logging, correlation IDs, and audit logging for NDPR compliance
"""

import os
import uuid
import time
from typing import Any, Dict, Optional
from contextvars import ContextVar
import structlog
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

# Context variable for correlation ID
correlation_id_var: ContextVar[Optional[str]] = ContextVar("correlation_id", default=None)


def configure_structlog():
    """
    Configure structlog for production use.
    Uses JSON output in production, colored console in development.
    """
    is_production = os.getenv("NODE_ENV", "production") == "production"

    shared_processors = [
        # Add timestamp
        structlog.processors.TimeStamper(fmt="iso"),
        # Add log level
        structlog.stdlib.add_log_level,
        # Add logger name
        structlog.stdlib.add_logger_name,
        # Add correlation ID
        structlog.contextvars.merge_contextvars,
    ]

    if is_production:
        # Production: JSON output
        processors = [
            *shared_processors,
            # Format exceptions
            structlog.processors.format_exc_info,
            # JSON output
            structlog.processors.JSONRenderer(),
        ]
    else:
        # Development: colored console output
        processors = [
            *shared_processors,
            # Pretty print
            structlog.dev.ConsoleRenderer(colors=True),
        ]

    structlog.configure(
        processors=processors,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add correlation IDs to requests.
    Correlation IDs enable tracing requests across logs.
    """

    async def dispatch(self, request: Request, call_next):
        # Get or generate correlation ID
        correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))

        # Set in context variable
        correlation_id_var.set(correlation_id)

        # Bind to structlog context
        structlog.contextvars.bind_contextvars(correlation_id=correlation_id)

        # Process request
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time

        # Add correlation ID to response
        response.headers["X-Correlation-ID"] = correlation_id
        response.headers["X-Process-Time"] = str(process_time)

        # Log request
        logger = structlog.get_logger("uradi360.access")
        logger.info(
            "Request processed",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            process_time_ms=round(process_time * 1000, 2),
            client_ip=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )

        # Clear context
        structlog.contextvars.clear_contextvars()

        return response


def get_logger(name: str = "uradi360"):
    """
    Get a structured logger instance.

    Usage:
        logger = get_logger("uradi360.auth")
        logger.info("User logged in", user_id=user_id, ip=ip_address)
    """
    return structlog.get_logger(name)


def get_correlation_id() -> Optional[str]:
    """Get the current correlation ID"""
    return correlation_id_var.get()


class AuditLogger:
    """
    Audit logger for sensitive operations.
    Logs voter data access, authentication events, and compliance actions.
    """

    def __init__(self):
        self.logger = get_logger("uradi360.audit")

    def log_voter_data_access(
        self,
        voter_id: str,
        action: str,
        user_id: str,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None
    ):
        """
        Log voter data access for NDPR compliance.

        Args:
            voter_id: The voter whose data was accessed
            action: Type of access (view, export, delete, update)
            user_id: User who accessed the data
            details: Additional context
            ip_address: Client IP address
        """
        self.logger.info(
            "Voter data accessed",
            event_type="voter_data_access",
            voter_id=voter_id,
            action=action,
            user_id=user_id,
            ip_address=ip_address,
            details=details or {},
            compliance="NDPR"
        )

    def log_auth_event(
        self,
        event_type: str,
        user_id: Optional[str] = None,
        success: bool = False,
        ip_address: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        """
        Log authentication event.

        Args:
            event_type: Type of event (login, logout, failed_login, token_refresh)
            user_id: User identifier
            success: Whether the operation succeeded
            ip_address: Client IP address
            details: Additional context
        """
        log_data = {
            "event_type": event_type,
            "success": success,
            "ip_address": ip_address,
            "compliance": "NDPR"
        }

        if user_id:
            log_data["user_id"] = user_id

        if details:
            log_data.update(details)

        if success:
            self.logger.info("Authentication event", **log_data)
        else:
            self.logger.warning("Authentication failure", **log_data)

    def log_consent_event(
        self,
        voter_id: str,
        action: str,  # granted, revoked, checked
        consent_type: str,
        ip_address: Optional[str] = None
    ):
        """
        Log consent-related event.

        Args:
            voter_id: Voter identifier
            action: Consent action performed
            consent_type: Type of consent
            ip_address: Client IP address
        """
        self.logger.info(
            "Consent event",
            event_type="consent",
            action=action,
            voter_id=voter_id,
            consent_type=consent_type,
            ip_address=ip_address,
            compliance="NDPR"
        )

    def log_data_modification(
        self,
        table: str,
        record_id: str,
        action: str,  # create, update, delete
        user_id: str,
        changes: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None
    ):
        """
        Log data modification for audit trail.

        Args:
            table: Database table modified
            record_id: ID of record
            action: Type of modification
            user_id: User who made the change
            changes: Dict of changes (field: new_value)
            ip_address: Client IP address
        """
        self.logger.info(
            "Data modification",
            event_type="data_modification",
            table=table,
            record_id=record_id,
            action=action,
            user_id=user_id,
            changes=changes,
            ip_address=ip_address,
            compliance="NDPR"
        )

    def log_security_event(
        self,
        event_type: str,
        severity: str,  # low, medium, high, critical
        description: str,
        ip_address: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        """
        Log security-related event.

        Args:
            event_type: Type of security event
            severity: Severity level
            description: Human-readable description
            ip_address: Client IP address
            details: Additional context
        """
        log_data = {
            "event_type": event_type,
            "severity": severity,
            "description": description,
            "ip_address": ip_address,
            "compliance": "NDPR"
        }

        if details:
            log_data.update(details)

        if severity in ["high", "critical"]:
            self.logger.error("Security event", **log_data)
        elif severity == "medium":
            self.logger.warning("Security event", **log_data)
        else:
            self.logger.info("Security event", **log_data)

    def log_rate_limit_hit(
        self,
        endpoint: str,
        client_id: str,
        limit: str,
        ip_address: Optional[str] = None
    ):
        """
        Log rate limit enforcement.

        Args:
            endpoint: API endpoint
            client_id: Client identifier
            limit: Rate limit that was hit
            ip_address: Client IP address
        """
        self.logger.warning(
            "Rate limit hit",
            event_type="rate_limit",
            endpoint=endpoint,
            client_id=client_id,
            limit=limit,
            ip_address=ip_address
        )

    def log_ai_interaction(
        self,
        operation: str,  # sentiment_analysis, targeting, etc.
        input_tokens: int,
        output_tokens: int,
        duration_ms: float,
        cached: bool = False,
        success: bool = True
    ):
        """
        Log AI API interaction.

        Args:
            operation: Type of AI operation
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            duration_ms: Duration in milliseconds
            cached: Whether result was cached
            success: Whether operation succeeded
        """
        self.logger.info(
            "AI interaction",
            event_type="ai_interaction",
            operation=operation,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            duration_ms=duration_ms,
            cached=cached,
            success=success
        )


# Singleton instance for audit logging
audit_logger = AuditLogger()


# Convenience functions for common logging patterns
def log_voter_access(voter_id: str, action: str, user_id: str, request: Optional[Request] = None):
    """Log voter data access"""
    ip = request.client.host if request and request.client else None
    audit_logger.log_voter_data_access(voter_id, action, user_id, ip_address=ip)


def log_auth(event_type: str, success: bool, user_id: Optional[str] = None, request: Optional[Request] = None):
    """Log authentication event"""
    ip = request.client.host if request and request.client else None
    audit_logger.log_auth_event(event_type, user_id, success, ip)


def log_security(event_type: str, severity: str, description: str, request: Optional[Request] = None):
    """Log security event"""
    ip = request.client.host if request and request.client else None
    audit_logger.log_security_event(event_type, severity, description, ip)


# Configure on module import
configure_structlog()
