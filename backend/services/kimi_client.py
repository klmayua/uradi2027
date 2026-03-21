"""
Kimi AI Client for URADI-360
Integrates with Moonshot AI's Kimi API for sentiment analysis, targeting, and scenario simulation
"""

import os
import json
import hashlib
import httpx
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from dataclasses import dataclass
import asyncio

# Redis for caching
try:
    import redis
    redis_client = redis.from_url(
        os.getenv("REDIS_URL", "redis://localhost:6379/0"),
        encoding="utf-8",
        decode_responses=True
    )
except Exception:
    redis_client = None


@dataclass
class SentimentResult:
    """Result from sentiment analysis"""
    score: int  # -100 to +100
    label: str  # very_negative, negative, neutral, positive, very_positive
    category: str  # governance, security, economy, infrastructure, candidate, general
    key_issues: List[str]
    urgency_level: str  # low, medium, high, critical
    language: str
    confidence: float
    raw_response: Optional[str] = None


@dataclass
class TargetingRecommendation:
    """Result from targeting recommendation"""
    voter_segments: List[Dict[str, Any]]
    total_voters_found: int
    confidence_score: float
    strategy_notes: str
    message_templates: List[str]
    resource_allocation: Dict[str, Any]


@dataclass
class ScenarioProjection:
    """Result from scenario simulation"""
    projected_vote_shifts: Dict[str, float]  # LGA -> percentage shift
    confidence_interval: Dict[str, float]
    key_factors: List[str]
    risk_assessment: str
    recommendation: str
    coalition_impact: Optional[Dict[str, Any]] = None


class KimiClient:
    """
    Client for Kimi AI API (Moonshot)
    Handles sentiment analysis, targeting recommendations, and scenario simulation
    """

    def __init__(self):
        self.api_key = os.getenv("KIMI_API_KEY")
        self.base_url = os.getenv("KIMI_BASE_URL", "https://api.moonshot.cn/v1")
        self.model = os.getenv("KIMI_MODEL", "kimi-k2-turbo-preview")
        self.timeout = 30.0
        self.max_retries = 3
        self.retry_delay = 1.0

        # Usage tracking
        self.usage_stats = {
            "total_requests": 0,
            "total_tokens": 0,
            "errors": 0,
            "cache_hits": 0,
            "last_request": None
        }

    def _get_cache_key(self, text: str, task_type: str) -> str:
        """Generate cache key for text + task combination"""
        text_hash = hashlib.sha256(f"{task_type}:{text}".encode()).hexdigest()
        return f"kimi:{task_type}:{text_hash}"

    def _get_from_cache(self, cache_key: str) -> Optional[Dict]:
        """Get cached result from Redis"""
        if not redis_client:
            return None
        try:
            cached = redis_client.get(cache_key)
            if cached:
                self.usage_stats["cache_hits"] += 1
                return json.loads(cached)
        except Exception as e:
            print(f"Cache read error: {e}")
        return None

    def _set_cache(self, cache_key: str, data: Dict, ttl: int = 86400):
        """Cache result in Redis with TTL (default 24 hours)"""
        if not redis_client:
            return
        try:
            redis_client.setex(cache_key, ttl, json.dumps(data))
        except Exception as e:
            print(f"Cache write error: {e}")

    async def _make_request(self, messages: List[Dict[str, str]], temperature: float = 0.3) -> Dict[str, Any]:
        """Make API request to Kimi with retry logic"""
        if not self.api_key or self.api_key == "sk-YOUR_KIMI_API_KEY_HERE"::
            raise ValueError("KIMI_API_KEY not configured")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "response_format": {"type": "json_object"}
        }

        for attempt in range(self.max_retries):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(
                        f"{self.base_url}/chat/completions",
                        headers=headers,
                        json=payload
                    )
                    response.raise_for_status()

                    data = response.json()
                    self.usage_stats["total_requests"] += 1
                    self.usage_stats["last_request"] = datetime.utcnow().isoformat()

                    if "usage" in data:
                        self.usage_stats["total_tokens"] += data["usage"].get("total_tokens", 0)

                    return data

            except httpx.HTTPStatusError as e:
                self.usage_stats["errors"] += 1
                if e.response.status_code == 429:  # Rate limited
                    wait_time = (attempt + 1) * 5
                    print(f"Rate limited. Waiting {wait_time}s...")
                    await asyncio.sleep(wait_time)
                elif attempt < self.max_retries - 1:
                    await asyncio.sleep(self.retry_delay * (attempt + 1))
                else:
                    raise

            except Exception as e:
                self.usage_stats["errors"] += 1
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.retry_delay * (attempt + 1))
                else:
                    raise Exception(f"Kimi API request failed after {self.max_retries} attempts: {e}")

        raise Exception("Max retries exceeded")

    async def analyze_sentiment(
        self,
        text: str,
        language: Optional[str] = None,
        context: Optional[str] = None
    ) -> SentimentResult:
        """
        Analyze sentiment of text using Kimi AI

        Args:
            text: The text to analyze
            language: Language code (ha, en, ff) - auto-detected if not provided
            context: Additional context about the source

        Returns:
            SentimentResult with score, category, issues, etc.
        """
        # Check cache first
        cache_key = self._get_cache_key(text, "sentiment")
        cached = self._get_from_cache(cache_key)
        if cached:
            return SentimentResult(**cached)

        # Build prompt
        lang_hint = f"Language: {language}\n" if language else ""
        context_hint = f"Context: {context}\n" if context else ""

        system_prompt = """You are a sentiment analysis expert for Nigerian political data.
Analyze the sentiment of the provided text and return a JSON object with:
- score: integer from -100 (very negative) to +100 (very positive)
- label: one of [very_negative, negative, neutral, positive, very_positive]
- category: one of [governance, security, economy, infrastructure, candidate, general]
- key_issues: array of specific issues mentioned (max 5)
- urgency_level: one of [low, medium, high, critical]
- language_detected: language code (ha, en, ff, etc.)
- confidence: float from 0.0 to 1.0

Be objective and analytical. Consider Nigerian political context."""

        user_prompt = f"""{lang_hint}{context_hint}Text to analyze:
{text}

Respond ONLY with a valid JSON object."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            response = await self._make_request(messages, temperature=0.3)
            content = response["choices"][0]["message"]["content"]
            result_data = json.loads(content)

            result = SentimentResult(
                score=max(-100, min(100, int(result_data.get("score", 0)))),
                label=result_data.get("label", "neutral"),
                category=result_data.get("category", "general"),
                key_issues=result_data.get("key_issues", [])[:5],
                urgency_level=result_data.get("urgency_level", "low"),
                language=result_data.get("language_detected", language or "unknown"),
                confidence=max(0.0, min(1.0, float(result_data.get("confidence", 0.5)))),
                raw_response=content
            )

            # Cache the result
            self._set_cache(cache_key, result.__dict__)
            return result

        except Exception as e:
            print(f"Sentiment analysis error: {e}")
            # Fallback to neutral
            return SentimentResult(
                score=0,
                label="neutral",
                category="general",
                key_issues=[],
                urgency_level="low",
                language=language or "unknown",
                confidence=0.0,
                raw_response=str(e)
            )

    async def get_targeting_recommendations(
        self,
        voter_segments: List[Dict[str, Any]],
        campaign_goals: str,
        budget_constraint: Optional[float] = None
    ) -> TargetingRecommendation:
        """
        Get AI-powered targeting recommendations

        Args:
            voter_segments: List of voter segment data
            campaign_goals: Description of campaign objectives
            budget_constraint: Optional budget limit

        Returns:
            TargetingRecommendation with strategy and message templates
        """
        cache_key = self._get_cache_key(
            f"{campaign_goals}:{json.dumps(voter_segments, sort_keys=True)}",
            "targeting"
        )
        cached = self._get_from_cache(cache_key)
        if cached:
            return TargetingRecommendation(**cached)

        budget_hint = f"\nBudget Constraint: ${budget_constraint:,.2f}" if budget_constraint else ""

        system_prompt = """You are a political campaign strategist specializing in Nigerian elections.
Analyze voter segments and provide targeting recommendations.
Return a JSON object with:
- voter_segments: array of prioritized segments with rationale
- total_voters_found: estimated count
- confidence_score: float 0.0-1.0
- strategy_notes: detailed strategy text
- message_templates: array of 3 message templates in Hausa/English
- resource_allocation: object with budget/time recommendations per channel

Consider: voter demographics, past voting patterns, current sentiment, regional factors."""

        user_prompt = f"""Campaign Goals: {campaign_goals}
Voter Segments: {json.dumps(voter_segments, indent=2)}
{budget_hint}

Provide targeting recommendations as JSON."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            response = await self._make_request(messages, temperature=0.4)
            content = response["choices"][0]["message"]["content"]
            result_data = json.loads(content)

            result = TargetingRecommendation(
                voter_segments=result_data.get("voter_segments", []),
                total_voters_found=int(result_data.get("total_voters_found", 0)),
                confidence_score=float(result_data.get("confidence_score", 0.5)),
                strategy_notes=result_data.get("strategy_notes", ""),
                message_templates=result_data.get("message_templates", [])[:3],
                resource_allocation=result_data.get("resource_allocation", {})
            )

            self._set_cache(cache_key, result.__dict__, ttl=3600)  # 1 hour cache
            return result

        except Exception as e:
            print(f"Targeting recommendation error: {e}")
            return TargetingRecommendation(
                voter_segments=[],
                total_voters_found=0,
                confidence_score=0.0,
                strategy_notes=f"Error: {str(e)}",
                message_templates=[],
                resource_allocation={}
            )

    async def simulate_scenario(
        self,
        scenario_title: str,
        variables: Dict[str, Any],
        current_polling: Dict[str, float],
        affected_lgas: Optional[List[str]] = None
    ) -> ScenarioProjection:
        """
        Simulate election scenario and project outcomes

        Args:
            scenario_title: Description of the scenario
            variables: Key variables (e.g., {"kwankwaso_endorsement": True})
            current_polling: Current polling percentages by LGA
            affected_lgas: List of LGAs affected by this scenario

        Returns:
            ScenarioProjection with vote shifts and recommendations
        """
        cache_key = self._get_cache_key(
            f"{scenario_title}:{json.dumps(variables, sort_keys=True)}",
            "scenario"
        )
        cached = self._get_from_cache(cache_key)
        if cached:
            return ScenarioProjection(**cached)

        lgas_hint = f"\nAffected LGAs: {', '.join(affected_lgas)}" if affected_lgas else ""

        system_prompt = """You are an election forecasting expert for Nigerian politics.
Simulate scenarios and project vote outcomes.
Return a JSON object with:
- projected_vote_shifts: object with LGA codes as keys, percentage shifts as values
- confidence_interval: object with lower and upper bounds
- key_factors: array of factors driving the projection
- risk_assessment: text describing risks
- recommendation: strategic recommendation text
- coalition_impact: object describing impact on coalition partners

Be realistic about Nigerian political dynamics. Consider historical voting patterns."""

        user_prompt = f"""Scenario: {scenario_title}
Variables: {json.dumps(variables, indent=2)}
Current Polling: {json.dumps(current_polling, indent=2)}{lgas_hint}

Provide scenario projection as JSON."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            response = await self._make_request(messages, temperature=0.5)
            content = response["choices"][0]["message"]["content"]
            result_data = json.loads(content)

            result = ScenarioProjection(
                projected_vote_shifts=result_data.get("projected_vote_shifts", {}),
                confidence_interval=result_data.get("confidence_interval", {"lower": 0.0, "upper": 0.0}),
                key_factors=result_data.get("key_factors", []),
                risk_assessment=result_data.get("risk_assessment", ""),
                recommendation=result_data.get("recommendation", ""),
                coalition_impact=result_data.get("coalition_impact")
            )

            self._set_cache(cache_key, result.__dict__, ttl=7200)  # 2 hour cache
            return result

        except Exception as e:
            print(f"Scenario simulation error: {e}")
            return ScenarioProjection(
                projected_vote_shifts={},
                confidence_interval={"lower": 0.0, "upper": 0.0},
                key_factors=[],
                risk_assessment=f"Error: {str(e)}",
                recommendation="Unable to simulate scenario",
                coalition_impact=None
            )

    def get_usage_stats(self) -> Dict[str, Any]:
        """Get current usage statistics"""
        return {
            **self.usage_stats,
            "estimated_cost_usd": self.usage_stats["total_tokens"] * 0.000002  # Rough estimate
        }

    async def health_check(self) -> bool:
        """Check if Kimi API is accessible"""
        try:
            messages = [{"role": "user", "content": "Hello"}]
            await self._make_request(messages, temperature=0.0)
            return True
        except Exception:
            return False


    # ==================== OSINT Layer Methods ====================

    async def classify_osint_content(
        self,
        content: str,
        language: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Classify OSINT content for sentiment, urgency, topics, and stance.

        Args:
            content: The content to classify
            language: Language code (en, ha, yo, ig)

        Returns:
            Dictionary with classification results
        """
        cache_key = self._get_cache_key(content[:500], "osint_classify")
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached

        lang_hint = f"Language: {language}\n" if language else ""

        system_prompt = """You are an OSINT analyst for Nigerian political intelligence.
Analyze the provided content and return a JSON object with:
- sentiment_score: float from -1.0 (very negative) to +1.0 (very positive)
- urgency_score: integer from 0 (no urgency) to 100 (critical)
- stance: one of [opposing, neutral, supporting, mixed] towards the political candidate
- topics: array of topics mentioned (max 5), e.g., ["security", "economy", "infrastructure", "education", "healthcare"]
- lgas_mentioned: array of Nigerian LGA names mentioned (if any)
- key_entities: array of key people, organizations, or places mentioned

Consider Nigerian political context, local issues, and regional dynamics."""

        user_prompt = f"""{lang_hint}Content to analyze:
{content[:2000]}  # Limit content length

Respond ONLY with a valid JSON object."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            response = await self._make_request(messages, temperature=0.3)
            content_response = response["choices"][0]["message"]["content"]
            result = json.loads(content_response)

            # Normalize and validate
            result["sentiment_score"] = max(-1.0, min(1.0, float(result.get("sentiment_score", 0))))
            result["urgency_score"] = max(0, min(100, int(result.get("urgency_score", 0))))
            result["stance"] = result.get("stance", "neutral")
            result["topics"] = result.get("topics", [])[:5]
            result["lgas_mentioned"] = result.get("lgas_mentioned", [])

            self._set_cache(cache_key, result, ttl=3600)
            return result

        except Exception as e:
            print(f"OSINT classification error: {e}")
            return {
                "sentiment_score": 0.0,
                "urgency_score": 0,
                "stance": "neutral",
                "topics": [],
                "lgas_mentioned": [],
                "key_entities": [],
                "error": str(e)
            }

    async def extract_entities(self, content: str, language: Optional[str] = None) -> List[Dict]:
        """
        Extract named entities from content.

        Args:
            content: Text to analyze
            language: Language code

        Returns:
            List of extracted entities with types
        """
        cache_key = self._get_cache_key(content[:500], "entity_extraction")
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached.get("entities", [])

        system_prompt = """Extract named entities from the provided text.
Return a JSON object with:
- entities: array of objects, each with:
  - name: the entity name
  - type: one of [person, organization, location, event, topic]
  - confidence: float 0.0-1.0

Focus on Nigerian political entities, locations (LGAs, states), and political figures."""

        user_prompt = f"""Extract entities from:
{content[:2000]}

Respond with JSON: {{"entities": [...]}}"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            response = await self._make_request(messages, temperature=0.2)
            result = json.loads(response["choices"][0]["message"]["content"])
            entities = result.get("entities", [])

            self._set_cache(cache_key, {"entities": entities}, ttl=86400)
            return entities

        except Exception as e:
            print(f"Entity extraction error: {e}")
            return []

    async def analyze_sentiment_detailed(
        self,
        text: str,
        language: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Perform detailed sentiment analysis.

        Args:
            text: Text to analyze
            language: Language code

        Returns:
            Detailed sentiment analysis
        """
        cache_key = self._get_cache_key(text[:500], "sentiment_detailed")
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached

        system_prompt = """Perform detailed sentiment analysis.
Return a JSON object with:
- overall_score: float -1.0 to +1.0
- emotional_tone: one of [angry, concerned, hopeful, enthusiastic, neutral, sarcastic]
- sentiment_by_topic: object mapping topics to sentiment scores
- key_phrases: array of phrases driving sentiment
- intensity: one of [low, medium, high]
- comparative_sentiment: how this compares to typical political discourse"""

        user_prompt = f"""Analyze sentiment:
{text[:1500]}

Respond with detailed JSON."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            response = await self._make_request(messages, temperature=0.3)
            result = json.loads(response["choices"][0]["message"]["content"])
            self._set_cache(cache_key, result, ttl=3600)
            return result

        except Exception as e:
            print(f"Detailed sentiment error: {e}")
            return {
                "overall_score": 0.0,
                "emotional_tone": "neutral",
                "sentiment_by_topic": {},
                "key_phrases": [],
                "intensity": "low"
            }

    async def generate_embedding(self, text: str) -> Optional[List[float]]:
        """
        Generate vector embedding for text.

        Note: Kimi doesn't have a direct embedding API yet.
        This is a placeholder that would use an embedding model.

        Args:
            text: Text to embed

        Returns:
            Vector embedding or None
        """
        # TODO: Implement when Kimi releases embedding API
        # For now, return None - would use OpenAI or local model
        return None

    async def summarize_narrative(self, texts: List[str]) -> Dict[str, Any]:
        """
        Summarize a collection of texts into a narrative.

        Args:
            texts: List of related texts

        Returns:
            Narrative summary with title, summary, and themes
        """
        if not texts:
            return {"title": "", "summary": "", "themes": []}

        combined = "\n\n".join(texts[:10])  # Limit to 10 texts

        system_prompt = """Summarize a collection of related texts into a coherent narrative.
Return a JSON object with:
- title: A concise title for this narrative (max 100 chars)
- summary: A 2-3 sentence summary of the narrative
- themes: Array of key themes (max 5)
- sentiment_direction: one of [positive, negative, mixed, neutral]
- importance_score: integer 0-100 indicating narrative importance

Focus on identifying the core story and its political implications."""

        user_prompt = f"""Summarize these related mentions:

{combined[:3000]}

Respond with JSON."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            response = await self._make_request(messages, temperature=0.4)
            result = json.loads(response["choices"][0]["message"]["content"])
            return {
                "title": result.get("title", "Untitled Narrative"),
                "summary": result.get("summary", ""),
                "themes": result.get("themes", [])[:5],
                "sentiment_direction": result.get("sentiment_direction", "neutral"),
                "importance_score": result.get("importance_score", 50)
            }

        except Exception as e:
            print(f"Narrative summary error: {e}")
            return {
                "title": "Error generating title",
                "summary": "",
                "themes": [],
                "sentiment_direction": "neutral",
                "importance_score": 0
            }

    async def generate_brief_summary(self, brief_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate AI summary for daily brief.

        Args:
            brief_data: Aggregated data for the brief

        Returns:
            AI-generated summary components
        """
        system_prompt = """You are a political intelligence analyst writing a daily brief.
Generate a comprehensive summary based on the provided data.
Return a JSON object with:
- headline: A compelling headline summarizing the day (max 150 chars)
- key_developments: Array of 3-5 key developments, each with title and description
- emerging_threats: Array of potential threats or concerns
- recommendations: Array of 3-5 strategic recommendations
- actions: Array of specific recommended actions

Write in a professional, analytical tone suitable for campaign leadership."""

        user_prompt = f"""Generate daily brief summary from:

Total Mentions: {brief_data.get('total_mentions', 0)}
Unique Sources: {brief_data.get('unique_sources', 0)}
Average Sentiment: {brief_data.get('avg_sentiment', 0):.2f}
Sentiment Change: {brief_data.get('sentiment_change', 0):+.2f}

Top Topics: {json.dumps(brief_data.get('mentions_by_topic', {}))}
Top Narratives: {json.dumps(brief_data.get('top_narratives', []))}
Opposition Activity: {json.dumps(brief_data.get('opposition_activity', {}))}

Respond with JSON."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            response = await self._make_request(messages, temperature=0.4)
            result = json.loads(response["choices"][0]["message"]["content"])
            return {
                "headline": result.get("headline", "Daily Intelligence Brief"),
                "key_developments": result.get("key_developments", []),
                "emerging_threats": result.get("emerging_threats", []),
                "recommendations": result.get("recommendations", []),
                "actions": result.get("actions", [])
            }

        except Exception as e:
            print(f"Brief generation error: {e}")
            return {
                "headline": "Daily Intelligence Brief",
                "key_developments": [],
                "emerging_threats": [],
                "recommendations": [],
                "actions": []
            }

    async def generate_weekly_summary(self, daily_briefs: List[Dict]) -> Dict[str, Any]:
        """
        Generate weekly summary from daily briefs.

        Args:
            daily_briefs: List of daily brief summaries

        Returns:
            Weekly summary
        """
        if not daily_briefs:
            return {"summary": "", "key_trends": [], "recommendations": []}

        briefs_text = "\n\n".join([
            f"Date: {b.get('date')}\nHeadline: {b.get('headline')}\nSentiment: {b.get('sentiment')}\nDevelopments: {json.dumps(b.get('key_developments', []))}"
            for b in daily_briefs
        ])

        system_prompt = """Generate a weekly summary from daily briefs.
Return a JSON object with:
- summary: 3-4 paragraph summary of the week
- key_trends: Array of major trends identified
- sentiment_trajectory: description of how sentiment evolved
- recommendations: Strategic recommendations for the coming week
- alert_level: one of [low, medium, high, critical]"""

        user_prompt = f"""Weekly data:
{briefs_text[:4000]}

Respond with JSON."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            response = await self._make_request(messages, temperature=0.4)
            return json.loads(response["choices"][0]["message"]["content"])

        except Exception as e:
            print(f"Weekly summary error: {e}")
            return {
                "summary": "Error generating summary",
                "key_trends": [],
                "sentiment_trajectory": "unknown",
                "recommendations": [],
                "alert_level": "low"
            }


# Singleton instance
kimi_client = KimiClient()
