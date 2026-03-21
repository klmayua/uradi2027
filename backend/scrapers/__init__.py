"""
OSINT Scrapers Package

Scrapers for collecting data from various sources:
- News websites (Premium Times, Vanguard, Daily Trust, etc.)
- Social media (Twitter/X)
- Government sources (INEC, etc.)
- Custom sources
"""

from .news_scraper import NewsScraper
from .social_scraper import SocialScraper
from .government_scraper import GovernmentScraper
from .custom_scraper import CustomScraper

__all__ = [
    'NewsScraper',
    'SocialScraper',
    'GovernmentScraper',
    'CustomScraper',
]
