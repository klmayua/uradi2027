"""
News Scraper for Nigerian News Sources

Supports major Nigerian news outlets:
- Premium Times
- Vanguard
- Daily Trust
- The Guardian Nigeria
- Punch
- Sahara Reporters
- Channels TV
- Arise News
"""

import asyncio
import aiohttp
import feedparser
from datetime import datetime
from typing import Dict, List, Optional
from urllib.parse import urljoin, urlparse
import xml.etree.ElementTree as ET


class NewsScraper:
    """Scraper for Nigerian news sources."""

    # RSS feed URLs for major Nigerian news sources
    RSS_FEEDS = {
        "premium_times": "https://www.premiumtimesng.com/feed",
        "vanguard": "https://www.vanguardngr.com/feed",
        "daily_trust": "https://dailytrust.com/feed",
        "guardian_nigeria": "https://guardian.ng/feed",
        "punch": "https://punchng.com/feed",
        "sahara_reporters": "https://saharareporters.com/rss.xml",
        "channels_tv": "https://www.channelstv.com/feed",
    }

    def __init__(self, config: Dict = None):
        self.config = config or {}
        self.session = None
        self.timeout = aiohttp.ClientTimeout(total=30)

    async def __aenter__(self):
        self.session = aiohttp.ClientSession(timeout=self.timeout)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def fetch_articles(self, source_url: str) -> List[Dict]:
        """
        Fetch articles from a news source.

        Args:
            source_url: URL of the news source or RSS feed

        Returns:
            List of article dictionaries
        """
        articles = []

        try:
            # Determine source type from URL
            source_name = self._identify_source(source_url)

            if source_name in self.RSS_FEEDS:
                articles = await self._fetch_rss(self.RSS_FEEDS[source_name], source_name)
            else:
                # Try to fetch as RSS anyway
                articles = await self._fetch_rss(source_url, "unknown")

        except Exception as e:
            print(f"Error fetching from {source_url}: {e}")

        return articles

    async def _fetch_rss(self, feed_url: str, source_name: str) -> List[Dict]:
        """Fetch and parse RSS feed."""
        articles = []

        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.get(feed_url, headers=self._get_headers()) as response:
                    if response.status == 200:
                        content = await response.text()
                        feed = feedparser.parse(content)

                        for entry in feed.entries[:20]:  # Limit to 20 most recent
                            article = {
                                "id": entry.get("id", entry.get("link", "")),
                                "title": entry.get("title", ""),
                                "content": self._extract_content(entry),
                                "url": entry.get("link", ""),
                                "author": entry.get("author", ""),
                                "published_at": self._parse_date(entry.get("published", "")),
                                "source": source_name,
                                "language": "en"
                            }
                            articles.append(article)

        except Exception as e:
            print(f"Error parsing RSS feed {feed_url}: {e}")

        return articles

    def _extract_content(self, entry) -> str:
        """Extract full content from RSS entry."""
        # Try different content fields
        if hasattr(entry, 'content'):
            return entry.content[0].value if entry.content else ""
        elif hasattr(entry, 'summary'):
            return entry.summary
        elif hasattr(entry, 'description'):
            return entry.description
        return ""

    def _parse_date(self, date_str: str) -> datetime:
        """Parse RSS date string."""
        try:
            # Try common RSS date formats
            parsed = feedparser._parse_date(date_str)
            if parsed:
                return datetime(*parsed[:6])
        except:
            pass
        return datetime.utcnow()

    def _identify_source(self, url: str) -> str:
        """Identify news source from URL."""
        url_lower = url.lower()
        for name, feed_url in self.RSS_FEEDS.items():
            if name.replace("_", "") in url_lower:
                return name
        return "unknown"

    def _get_headers(self) -> Dict[str, str]:
        """Get HTTP headers for requests."""
        return {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "application/rss+xml, application/xml, text/xml, */*",
        }

    async def health_check(self, source_url: str) -> bool:
        """Check if source is accessible."""
        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.get(source_url, headers=self._get_headers()) as response:
                    return response.status == 200
        except:
            return False


class PremiumTimesScraper(NewsScraper):
    """Specialized scraper for Premium Times."""

    async def fetch_articles(self, **kwargs) -> List[Dict]:
        """Fetch articles from Premium Times."""
        return await super().fetch_articles(self.RSS_FEEDS["premium_times"])


class VanguardScraper(NewsScraper):
    """Specialized scraper for Vanguard."""

    async def fetch_articles(self, **kwargs) -> List[Dict]:
        """Fetch articles from Vanguard."""
        return await super().fetch_articles(self.RSS_FEEDS["vanguard"])


class DailyTrustScraper(NewsScraper):
    """Specialized scraper for Daily Trust."""

    async def fetch_articles(self, **kwargs) -> List[Dict]:
        """Fetch articles from Daily Trust."""
        return await super().fetch_articles(self.RSS_FEEDS["daily_trust"])
