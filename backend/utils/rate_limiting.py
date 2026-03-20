"""
Rate Limiting Configuration for URADI-360
Uses slowapi with Redis backend for distributed rate limiting
"""

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, Response
import os
import redis

# Redis connection for rate limiting
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Create Redis client
redis_client = redis.from_url(redis_url, encoding="utf-8", decode_responses=True)

# Create limiter with Redis storage
# Uses IP address as key by default
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=redis_url,
    storage_options={"socket_connect_timeout": 30, "socket_timeout": 30},
    default_limits=["100/minute"]  # Global default: 100 requests per minute
)

# Custom rate limit exceeded handler
def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Custom handler for rate limit exceeded"""
    return Response(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "message": "Too many requests. Please try again later.",
            "retry_after": exc.detail.get("retry_after", 60) if hasattr(exc, 'detail') else 60
        },
        media_type="application/json"
    )

# Rate limit tiers
class RateLimitTiers:
    """Rate limit configurations for different endpoint types"""

    # Authentication endpoints - very strict
    AUTH = ["5/minute", "20/hour"]  # 5 per minute, 20 per hour

    # Public read endpoints - moderate
    PUBLIC_READ = ["100/minute", "1000/hour"]

    # API read endpoints - standard
    API_READ = ["200/minute", "5000/hour"]

    # API write endpoints - more restrictive
    API_WRITE = ["30/minute", "500/hour"]

    # Webhook endpoints - generous but monitored
    WEBHOOK = ["60/minute", "2000/hour"]

    # Election day endpoints - high traffic expected
    ELECTION_DAY = ["300/minute", "10000/hour"]

    # Admin endpoints - strict
    ADMIN = ["50/minute", "1000/hour"]

# Decorator helpers
def auth_limit():
    """Rate limit for authentication endpoints"""
    return limiter.limit("5/minute")

def public_read_limit():
    """Rate limit for public read endpoints"""
    return limiter.limit("100/minute")

def api_read_limit():
    """Rate limit for API read endpoints"""
    return limiter.limit("200/minute")

def api_write_limit():
    """Rate limit for API write endpoints"""
    return limiter.limit("30/minute")

def webhook_limit():
    """Rate limit for webhook endpoints"""
    return limiter.limit("60/minute")

def election_day_limit():
    """Rate limit for election day endpoints"""
    return limiter.limit("300/minute")

def admin_limit():
    """Rate limit for admin endpoints"""
    return limiter.limit("50/minute")

# Custom key functions
def get_user_key(request: Request) -> str:
    """Use user ID as rate limit key if authenticated, otherwise IP"""
    user_id = getattr(request.state, "user_id", None)
    if user_id:
        return f"user:{user_id}"
    return get_remote_address(request)

def get_tenant_key(request: Request) -> str:
    """Use tenant ID as rate limit key for tenant-scoped limits"""
    tenant_id = getattr(request.state, "tenant_id", None)
    if tenant_id:
        return f"tenant:{tenant_id}"
    return get_remote_address(request)

# Tenant-scoped limiter
tenant_limiter = Limiter(
    key_func=get_tenant_key,
    storage_uri=redis_url,
    default_limits=["1000/minute"]  # Per-tenant limit
)
