"""
Custom Source Scraper

For user-defined or specialized data sources.
Supports:
- Custom RSS feeds
- JSON APIs
- Web scraping with configurable selectors
"""

import asyncio
import aiohttp
import json
from datetime import datetime
from typing import Dict, List, Optional
from urllib.parse import urljoin


class CustomScraper:
    """Scraper for custom/user-defined sources."""

    def __init__(self, config: Dict = None):
        self.config = config or {}
        self.timeout = aiohttp.ClientTimeout(total=30)

    async def fetch(self, source_url: str) -> List[Dict]:
        """
        Fetch from custom source based on configuration.

        Args:
            source_url: URL of the custom source

        Returns:
            List of item dictionaries
        """
        source_type = self.config.get("custom_type", "rss")

        if source_type == "rss":
            return await self._fetch_rss(source_url)
        elif source_type == "json_api":
            return await self._fetch_json_api(source_url)
        elif source_type == "html":
            return await self._fetch_html(source_url)
        else:
            return []

    async def _fetch_rss(self, url: str) -> List[Dict]:
        """Fetch from custom RSS feed."""
        items = []

        try:
            import feedparser

            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.get(url, headers=self._get_headers()) as response:
                    if response.status == 200:
                        content = await response.text()
                        feed = feedparser.parse(content)

                        for entry in feed.entries[:20]:
                            item = {
                                "id": entry.get("id", entry.get("link", "")),
                                "title": entry.get("title", ""),
                                "content": entry.get("summary", entry.get("description", "")),
                                "url": entry.get("link", ""),
                                "author": entry.get("author", ""),
                                "published_at": self._parse_date(entry.get("published", "")),
                                "source": "custom_rss",
                                "language": self.config.get("language", "en")
                            }
                            items.append(item)

        except Exception as e:
            print(f"Error fetching custom RSS from {url}: {e}")

        return items

    async def _fetch_json_api(self, url: str) -> List[Dict]:
        """Fetch from custom JSON API."""
        items = []

        try:
            headers = self._get_headers()
            if self.config.get("api_key"):
                headers["Authorization"] = f"Bearer {self.config['api_key']}"

            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()

                        # Extract items using configured path
                        items_path = self.config.get("items_path", "")
                        if items_path:
                            for key in items_path.split("."):
                                data = data.get(key, {})

                        if isinstance(data, list):
                            for entry in data[:20]:
                                item = self._transform_json_entry(entry)
                                if item:
                                    items.append(item)

        except Exception as e:
            print(f"Error fetching custom JSON API from {url}: {e}")

        return items

    async def _fetch_html(self, url: str) -> List[Dict]:
        """Fetch from custom HTML page using selectors."""
        items = []

        try:
            from bs4 import BeautifulSoup

            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.get(url, headers=self._get_headers()) as response:
                    if response.status == 200:
                        html = await response.text()
                        soup = BeautifulSoup(html, 'html.parser')

                        # Use configured selectors
                        item_selector = self.config.get("item_selector", "article")
                        title_selector = self.config.get("title_selector", "h2")
                        content_selector = self.config.get("content_selector", "p")
                        link_selector = self.config.get("link_selector", "a")

                        elements = soup.select(item_selector)

                        for elem in elements[:20]:
                            title_elem = elem.select_one(title_selector)
                            content_elem = elem.select_one(content_selector)
                            link_elem = elem.select_one(link_selector)

                            item = {
                                "id": link_elem.get("href", "") if link_elem else "",
                                "title": title_elem.get_text(strip=True) if title_elem else "",
                                "content": content_elem.get_text(strip=True) if content_elem else "",
                                "url": urljoin(url, link_elem.get("href", "")) if link_elem else url,
                                "author": "",
                                "published_at": datetime.utcnow(),
                                "source": "custom_html",
                                "language": self.config.get("language", "en")
                            }
                            items.append(item)

        except ImportError:
            print("BeautifulSoup not installed. Install with: pip install beautifulsoup4")
        except Exception as e:
            print(f"Error fetching custom HTML from {url}: {e}")

        return items

    def _transform_json_entry(self, entry: Dict) -> Optional[Dict]:
        """Transform JSON entry to standard format using field mappings."""
        mapping = self.config.get("field_mapping", {})

        item = {
            "id": self._extract_field(entry, mapping.get("id", "id")),
            "title": self._extract_field(entry, mapping.get("title", "title")),
            "content": self._extract_field(entry, mapping.get("content", "content")),
            "url": self._extract_field(entry, mapping.get("url", "url")),
            "author": self._extract_field(entry, mapping.get("author", "author")),
            "published_at": self._parse_date(
                self._extract_field(entry, mapping.get("date", "published_at"), "")
            ),
            "source": "custom_api",
            "language": self.config.get("language", "en")
        }

        return item if item.get("title") or item.get("content") else None

    def _extract_field(self, data: Dict, path: str) -> str:
        """Extract field from nested JSON using dot notation."""
        value = data
        for key in path.split("."):
            if isinstance(value, dict):
                value = value.get(key, "")
            else:
                return ""
        return str(value) if value else ""

    def _parse_date(self, date_str: str) -> datetime:
        """Parse date string."""
        try:
            # Try ISO format
            return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        except:
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
            "User-Agent": self.config.get(
                "user_agent",
                "Mozilla/5.0 (compatible; URADI-360 OSINT Bot)"
            ),
            "Accept": "application/json, application/rss+xml, text/html",
        }

    async def health_check(self, source_url: str) -> bool:
        """Check if custom source is accessible."""
        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.get(source_url, headers=self._get_headers()) as response:
                    return response.status == 200
        except:
            return False
