"""
Input Sanitization Utilities for URADI-360
Prevents XSS, NoSQL injection, and other injection attacks
"""

import bleach
import re
from typing import Optional

# Allowed HTML tags for rich text fields
ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4']
ALLOWED_ATTRIBUTES = {
    '*': ['class'],
    'a': ['href', 'title'],
}
ALLOWED_PROTOCOLS = ['http', 'https', 'mailto']

def sanitize_html(text: Optional[str]) -> Optional[str]:
    """
    Sanitize HTML content to prevent XSS attacks.
    Allows only safe HTML tags and attributes.

    Args:
        text: Raw text that may contain HTML

    Returns:
        Sanitized text with only allowed HTML
    """
    if not text:
        return text

    return bleach.clean(
        text,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        protocols=ALLOWED_PROTOCOLS,
        strip=True  # Remove disallowed tags completely
    )

def sanitize_plain_text(text: Optional[str]) -> Optional[str]:
    """
    Sanitize plain text by removing all HTML tags.
    Use for fields that should never contain HTML.

    Args:
        text: Raw text

    Returns:
        Plain text with all HTML removed
    """
    if not text:
        return text

    # First bleach to remove any HTML
    cleaned = bleach.clean(text, tags=[], strip=True)
    # Then unescape any HTML entities
    return bleach.clean(cleaned, tags=[], strip=True)

def sanitize_no_sql(text: Optional[str]) -> Optional[str]:
    """
    Sanitize text to prevent NoSQL injection.
    Removes MongoDB/JSON operators that could be used in injection attacks.

    Args:
        text: Raw text

    Returns:
        Sanitized text safe for NoSQL queries
    """
    if not text:
        return text

    # Remove NoSQL injection patterns
    dangerous_patterns = [
        r'\$where',
        r'\$gt',
        r'\$gte',
        r'\$lt',
        r'\$lte',
        r'\$ne',
        r'\$in',
        r'\$nin',
        r'\$regex',
        r'\$exists',
        r'\$or',
        r'\$and',
        r'\$not',
        r'\{.*\$.*\}',  # Any JSON with $ operators
    ]

    sanitized = text
    for pattern in dangerous_patterns:
        sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE)

    return sanitized

def sanitize_phone_number(phone: Optional[str]) -> Optional[str]:
    """
    Sanitize and validate phone number.
    Removes all non-digit characters except leading +.

    Args:
        phone: Raw phone number string

    Returns:
        Sanitized phone number or None if invalid
    """
    if not phone:
        return None

    # Remove whitespace and common separators
    cleaned = re.sub(r'[\s\-\(\)\.]', '', phone)

    # Validate: should be digits only, optionally starting with +
    if not re.match(r'^\+?\d{10,15}$', cleaned):
        return None

    return cleaned

def sanitize_email(email: Optional[str]) -> Optional[str]:
    """
    Sanitize and normalize email address.

    Args:
        email: Raw email string

    Returns:
        Lowercase, stripped email or None if invalid
    """
    if not email:
        return None

    email = email.strip().lower()

    # Basic email validation
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
        return None

    return email

def sanitize_json_key(key: str) -> str:
    """
    Sanitize JSON/dict keys to prevent injection.
    Removes characters that could be used in injection attacks.

    Args:
        key: Dictionary key string

    Returns:
        Sanitized key
    """
    if not key:
        return key

    # Remove dangerous characters
    sanitized = re.sub(r'[\$\.\[\]\\]', '', key)
    return sanitized[:256]  # Limit length

def truncate_text(text: Optional[str], max_length: int = 1000) -> Optional[str]:
    """
    Truncate text to maximum length.

    Args:
        text: Input text
        max_length: Maximum allowed length

    Returns:
        Truncated text
    """
    if not text:
        return text

    if len(text) <= max_length:
        return text

    return text[:max_length] + "..."

# Field-specific sanitizers
def sanitize_sentiment_text(text: Optional[str]) -> Optional[str]:
    """Sanitize sentiment entry text"""
    if not text:
        return text
    text = truncate_text(text, max_length=5000)
    text = sanitize_no_sql(text)
    text = sanitize_plain_text(text)
    return text

def sanitize_content_body(text: Optional[str]) -> Optional[str]:
    """Sanitize content item body (allows safe HTML)"""
    if not text:
        return text
    text = truncate_text(text, max_length=50000)
    text = sanitize_no_sql(text)
    text = sanitize_html(text)
    return text

def sanitize_report_body(text: Optional[str]) -> Optional[str]:
    """Sanitize intelligence report body (allows safe HTML)"""
    if not text:
        return text
    text = truncate_text(text, max_length=100000)
    text = sanitize_no_sql(text)
    text = sanitize_html(text)
    return text

def sanitize_incident_description(text: Optional[str]) -> Optional[str]:
    """Sanitize incident description"""
    if not text:
        return text
    text = truncate_text(text, max_length=10000)
    text = sanitize_no_sql(text)
    text = sanitize_plain_text(text)
    return text

def sanitize_notes(text: Optional[str]) -> Optional[str]:
    """Sanitize general notes field"""
    if not text:
        return text
    text = truncate_text(text, max_length=5000)
    text = sanitize_no_sql(text)
    text = sanitize_plain_text(text)
    return text

# Validation functions
def is_valid_nigerian_phone(phone: str) -> bool:
    """Validate Nigerian phone number format"""
    if not phone:
        return False

    # Remove common prefixes and spaces
    cleaned = phone.replace(' ', '').replace('-', '').replace('+', '')

    # Nigerian numbers: 234 prefix or 0 prefix, followed by 10 digits
    # Valid formats: +2348012345678, 2348012345678, 08012345678
    if cleaned.startswith('234') and len(cleaned) == 13:
        return True
    if cleaned.startswith('0') and len(cleaned) == 11:
        return True
    if cleaned.startswith('7') or cleaned.startswith('8') or cleaned.startswith('9'):
        if len(cleaned) == 10:  # Without country code
            return True

    return False

def is_valid_vin(vin: str) -> bool:
    """Validate Voter Identification Number format"""
    if not vin:
        return False

    # VIN format varies by state, but generally alphanumeric
    # This is a basic check - adjust based on actual VIN format
    return bool(re.match(r'^[A-Z0-9]{10,20}$', vin.upper()))

def sanitize_vin(vin: Optional[str]) -> Optional[str]:
    """Sanitize Voter ID Number"""
    if not vin:
        return None

    # Remove whitespace and convert to uppercase
    cleaned = vin.strip().upper()
    cleaned = re.sub(r'\s+', '', cleaned)

    if not is_valid_vin(cleaned):
        return None

    return cleaned


def sanitize_text(text: Optional[str]) -> Optional[str]:
    """
    General text sanitization for OSINT content.
    Removes HTML and NoSQL injection patterns.
    """
    if not text:
        return text

    text = sanitize_no_sql(text)
    text = sanitize_plain_text(text)
    return text


def sanitize_url(url: Optional[str]) -> Optional[str]:
    """
    Sanitize URL to prevent injection.
    Validates URL format and removes dangerous characters.
    """
    if not url:
        return url

    from urllib.parse import urlparse

    # Remove dangerous characters
    cleaned = re.sub(r'[<>"{}|\\^\[\]`]', '', url)

    # Validate URL format
    try:
        parsed = urlparse(cleaned)
        if not parsed.scheme in ('http', 'https'):
            return None
        if not parsed.netloc:
            return None
    except:
        return None

    return cleaned[:2000]  # Limit length


def sanitize_json(data: Optional[dict]) -> Optional[dict]:
    """
    Sanitize JSON data by sanitizing all string values.
    Recursively processes nested dictionaries and lists.
    """
    if not data:
        return data

    if isinstance(data, dict):
        sanitized = {}
        for key, value in data.items():
            # Sanitize key
            clean_key = sanitize_json_key(key)
            # Recursively sanitize value
            if isinstance(value, str):
                sanitized[clean_key] = sanitize_text(value)
            elif isinstance(value, dict):
                sanitized[clean_key] = sanitize_json(value)
            elif isinstance(value, list):
                sanitized[clean_key] = [
                    sanitize_json(item) if isinstance(item, dict) else
                    sanitize_text(item) if isinstance(item, str) else item
                    for item in value
                ]
            else:
                sanitized[clean_key] = value
        return sanitized

    return data
