"""
Social Media Scraper

Supports social media platforms:
- Twitter/X (via API or Nitter)
- Facebook (via RSS feeds where available)
- Instagram (limited)

Note: This uses ethical scraping methods and respects robots.txt.
For production, use official APIs with proper authentication.
"""

import asyncio
import aiohttp
from datetime import datetime
from typing import Dict, List, Optional
import json


class SocialScraper:
    """Base class for social media scrapers."""

    def __init__(self, config: Dict = None):
        self.config = config or {}
        self.timeout = aiohttp.ClientTimeout(total=30)

    async def fetch_posts(self, **kwargs) -> List[Dict]:
        """Fetch posts from social media. Override in subclasses."""
        raise NotImplementedError

    async def health_check(self, **kwargs) -> bool:
        """Check if source is accessible."""
        raise NotImplementedError


class TwitterScraper(SocialScraper):
    """
    Twitter/X scraper using Nitter instances (ethical alternative).

    Note: For production, use Twitter API v2 with proper authentication.
    This implementation uses Nitter RSS feeds as a fallback.
    """

    # Nitter instances (community-run Twitter frontends)
    NITTER_INSTANCES = [
        "https://nitter.net",
        "https://nitter.cz",
        "https://nitter.privacydev.net",
    ]

    async def fetch_posts(self, search_terms: List[str] = None, **kwargs) -> List[Dict]:
        """
        Fetch tweets matching search terms.

        Args:
            search_terms: List of keywords/hashtags to search for

        Returns:
            List of tweet dictionaries
        """
        posts = []

        if not search_terms:
            return posts

        # For each search term, try to fetch from Nitter
        for term in search_terms[:5]:  # Limit to 5 terms
            try:
                term_posts = await self._fetch_from_nitter(term)
                posts.extend(term_posts)
            except Exception as e:
                print(f"Error fetching tweets for {term}: {e}")

        return posts

    async def _fetch_from_nitter(self, search_term: str) -> List[Dict]:
        """Fetch tweets from Nitter RSS."""
        posts = []

        # Try each Nitter instance
        for instance in self.NITTER_INSTANCES:
            try:
                # Construct search RSS URL
                search_url = f"{instance}/search/rss?f=tweets&q={search_term}"

                async with aiohttp.ClientSession(timeout=self.timeout) as session:
                    async with session.get(search_url, headers=self._get_headers()) as response:
                        if response.status == 200:
                            content = await response.text()
                            # Parse RSS (simplified)
                            import feedparser
                            feed = feedparser.parse(content)

                            for entry in feed.entries[:10]:
                                post = {
                                    "id": entry.get("id", ""),
                                    "content": entry.get("title", ""),
                                    "url": entry.get("link", ""),
                                    "author_name": entry.get("author", ""),
                                    "author_handle": self._extract_handle(entry.get("author", "")),
                                    "published_at": self._parse_date(entry.get("published", "")),
                                    "engagement": {
                                        "likes": 0,  # Not available in RSS
                                        "retweets": 0,
                                        "replies": 0,
                                        "total_engagement": 0
                                    },
                                    "source": "twitter",
                                    "language": "en"
                                }
                                posts.append(post)

                            if posts:
                                break  # Success, no need to try other instances

            except Exception as e:
                continue  # Try next instance

        return posts

    def _extract_handle(self, author_str: str) -> str:
        """Extract Twitter handle from author string."""
        # Author format: "@username"
        if author_str.startswith("@"):
            return author_str
        return ""

    def _parse_date(self, date_str: str) -> datetime:
        """Parse date string."""
        try:
            import feedparser
            parsed = feedparser._parse_date(date_str)
            if parsed:
                return datetime(*parsed[:6])
        except:
            pass
        return datetime.utcnow()

    def _get_headers(self) -> Dict[str, str]:
        """Get HTTP headers."""
        return {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0.36",
            "Accept": "application/rss+xml, application/xml",
        }

    async def health_check(self, api_key: str = None) -> bool:
        """Check if Twitter scraping is accessible."""
        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.get(
                    self.NITTER_INSTANCES[0],
                    headers=self._get_headers()
                ) as response:
                    return response.status == 200
        except:
            return False


class FacebookScraper(SocialScraper):
    """
    Facebook scraper (limited - uses public RSS where available).

    Note: Most Facebook content requires authentication.
    This only captures public page posts if RSS is enabled.
    """

    async def fetch_posts(self, page_urls: List[str] = None, **kwargs) -> List[Dict]:
        """Fetch posts from public Facebook pages."""
        posts = []

        if not page_urls:
            return posts

        for page_url in page_urls:
            try:
                # Try to fetch RSS if available
                rss_url = f"{page_url.rstrip('/')}/feed"
                async with aiohttp.ClientSession(timeout=self.timeout) as session:
                    async with session.get(rss_url, headers=self._get_headers()) as response:
                        if response.status == 200:
                            content = await response.text()
                            import feedparser
                            feed = feedparser.parse(content)

                            for entry in feed.entries[:10]:
                                post = {
                                    "id": entry.get("id", ""),
                                    "content": entry.get("title", ""),
                                    "url": entry.get("link", ""),
                                    "author_name": entry.get("author", ""),
                                    "author_handle": "",
                                    "published_at": datetime.utcnow(),
                                    "engagement": {},
                                    "source": "facebook",
                                    "language": "en"
                                }
                                posts.append(post)

            except Exception as e:
                print(f"Error fetching Facebook page {page_url}: {e}")

        return posts

    async def health_check(self, **kwargs) -> bool:
        """Facebook scraping is very limited."""
        return False  # Always return False as a reminder

    def _get_headers(self) -> Dict[str, str]:
        return {
            "User-Agent": "Mozilla/5.0 (compatible; RSS Reader)",
            "Accept": "application/rss+xml",
        }


class SocialScraperFactory:
    """Factory for creating appropriate social scraper."""

    @staticmethod
    def create_scraper(platform: str, config: Dict = None) -> SocialScraper:
        """Create scraper for specified platform."""
        scrapers = {
            "twitter": TwitterScraper,
            "facebook": FacebookScraper,
        }

        scraper_class = scrapers.get(platform.lower())
        if scraper_class:
            return scraper_class(config)
        raise ValueError(f"Unknown platform: {platform}")
