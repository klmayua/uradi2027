"""
AI Agents Module - Phase 4
Sentiment Analysis Agent, Targeting Recommendations, Scenario Simulation
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import uuid
from database import get_db
from models import (
    Voter, SentimentEntry, IntelligenceReport, Scenario, CoalitionPartner,
    LGA, Ward, ContentItem
)
from auth.utils import get_current_user

router = APIRouter(prefix="/api/ai-agents", tags=["AI Agents"])


# ==================== PYDANTIC MODELS ====================

class SentimentAnalysisRequest(BaseModel):
    text: str
    language: Optional[str] = None  # auto-detect if not provided
    lga_id: Optional[str] = None
    ward_id: Optional[str] = None
    source: str = "api"  # ussd, whatsapp, field_report, social_media


class SentimentAnalysisResponse(BaseModel):
    sentiment_score: int  # -100 to +100
    sentiment_label: str  # very_negative, negative, neutral, positive, very_positive
    category: str  # governance, security, economy, infrastructure, candidate, general
    key_issues: List[str]
    urgency_level: str  # low, medium, high, critical
    language_detected: str
    confidence: float  # 0.0 to 1.0


class BatchSentimentRequest(BaseModel):
    entry_ids: List[str]  # Process specific entries
    lga_filter: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None


class BatchSentimentResponse(BaseModel):
    processed: int
    errors: int
    avg_sentiment: float
    category_breakdown: Dict[str, int]


class TargetingRecommendationRequest(BaseModel):
    target_lgas: Optional[List[str]] = None
    voter_count: int = 1000
    focus: str = "persuadable"  # persuadable, supporters, undecided


class TargetingRecommendationResponse(BaseModel):
    recommendations: List[Dict[str, Any]]
    total_voters_found: int
    confidence_score: float
    strategy_notes: str


class ScenarioSimulationRequest(BaseModel):
    scenario_title: str
    variables: Dict[str, Any]  # e.g., {"kwankwaso_endorsement": true, "budget_increase": 20}
    affected_lgas: Optional[List[str]] = None


class ScenarioSimulationResponse(BaseModel):
    scenario_id: str
    projected_vote_shifts: Dict[str, float]  # LGA -> vote shift percentage
    confidence_interval: Dict[str, float]  # {lower: 0.05, upper: 0.15}
    key_factors: List[str]
    risk_assessment: str
    recommendation: str


class WeeklySentimentReport(BaseModel):
    period_start: str
    period_end: str
    overall_sentiment: float
    sentiment_trend: str  # improving, stable, declining
    lga_rankings: List[Dict[str, Any]]
    top_issues: List[Dict[str, Any]]
    alerts: List[Dict[str, Any]]
    summary: str


class CoalitionStabilityRequest(BaseModel):
    partner_ids: Optional[List[str]] = None


class CoalitionStabilityResponse(BaseModel):
    stability_score: float  # 0-100
    risk_level: str  # low, medium, high, critical
    defection_probability: Dict[str, float]  # partner_id -> probability
    early_warnings: List[str]
    recommendations: List[str]


# ==================== SENTIMENT ANALYSIS AGENT (Task 4.1) ====================

def analyze_sentiment_with_ai(text: str, language: Optional[str] = None) -> Dict[str, Any]:
    """
    AI-powered sentiment analysis using Kimi/Ollama
    In production, this would call the Ollama API
    """
    # Simulated AI analysis (replace with actual Ollama call)
    # Example: response = ollama.chat(model='kimi', messages=[...])
    
    text_lower = text.lower()
    
    # Simple keyword-based analysis for demo
    positive_words = ['good', 'great', 'excellent', 'happy', 'support', 'best', 'love', 'thank', 'appreciate', 'murna', 'kyauta', 'godiya']
    negative_words = ['bad', 'terrible', 'worst', 'hate', 'angry', 'disappointed', 'problem', 'issue', 'complaint', 'ba dadi', 'matsala', 'ba kyauta']
    
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    # Calculate score (-100 to +100)
    total = positive_count + negative_count
    if total == 0:
        score = 0
    else:
        score = int(((positive_count - negative_count) / total) * 100)
    
    # Determine label
    if score >= 80:
        label = "very_positive"
    elif score >= 30:
        label = "positive"
    elif score >= -30:
        label = "neutral"
    elif score >= -80:
        label = "negative"
    else:
        label = "very_negative"
    
    # Category detection
    categories = {
        'governance': ['government', 'administration', 'leadership', 'policy', 'maji'],
        'security': ['security', 'police', 'crime', 'violence', 'tsaro', 'barayi'],
        'economy': ['economy', 'money', 'price', 'cost', 'business', 'kudi', 'kasuwanci'],
        'infrastructure': ['road', 'water', 'electricity', 'hospital', 'school', 'hanya', 'ruwa', 'wutar lantarki'],
        'candidate': ['candidate', 'mustapha', 'lamido', 'election', 'vote', 'zabe', 'dan takara']
    }
    
    detected_category = "general"
    max_matches = 0
    for cat, keywords in categories.items():
        matches = sum(1 for kw in keywords if kw in text_lower)
        if matches > max_matches:
            max_matches = matches
            detected_category = cat
    
    # Extract key issues
    key_issues = []
    issue_keywords = {
        'unemployment': ['unemployment', 'job', 'work', 'aiki'],
        'education': ['school', 'education', 'teachers', 'makaranta', 'ilimi'],
        'healthcare': ['hospital', 'health', 'clinic', 'asibiti', 'lafiya'],
        'roads': ['road', 'transport', 'hanya', 'tafiya'],
        'electricity': ['power', 'electricity', 'light', 'wutar lantarki', 'kaji'],
        'water': ['water', 'supply', 'ruwa', 'sha ruwa']
    }
    
    for issue, keywords in issue_keywords.items():
        if any(kw in text_lower for kw in keywords):
            key_issues.append(issue)
    
    # Urgency level
    urgency_keywords = ['urgent', 'emergency', 'critical', 'immediately', 'yau da kullum', 'gaggawa']
    urgency = "critical" if any(kw in text_lower for kw in urgency_keywords) else \
              "high" if negative_count > 2 else \
              "medium" if negative_count > 0 else "low"
    
    return {
        "sentiment_score": score,
        "sentiment_label": label,
        "category": detected_category,
        "key_issues": key_issues[:3],  # Top 3 issues
        "urgency_level": urgency,
        "language_detected": language or "auto",
        "confidence": 0.75 + (abs(score) / 400)  # Higher confidence for extreme scores
    }


@router.post("/sentiment/analyze", response_model=SentimentAnalysisResponse)
def analyze_sentiment(
    request: SentimentAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze sentiment of a single text entry using AI
    """
    result = analyze_sentiment_with_ai(request.text, request.language)
    
    # Save to database
    entry = SentimentEntry(
        id=uuid.uuid4(),
        tenant_id=current_user.tenant_id,
        source=request.source,
        lga_id=request.lga_id,
        ward_id=request.ward_id,
        raw_text=request.text,
        sentiment=result["sentiment_label"],
        score=result["sentiment_score"],
        topics=result["key_issues"],
        language=result["language_detected"],
        processed=True
    )
    
    db.add(entry)
    db.commit()
    
    return SentimentAnalysisResponse(**result)


@router.post("/sentiment/batch-process", response_model=BatchSentimentResponse)
def batch_process_sentiment(
    request: BatchSentimentRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Batch process sentiment entries (Celery background task)
    """
    # Get entries to process
    query = db.query(SentimentEntry).filter(
        SentimentEntry.tenant_id == current_user.tenant_id,
        SentimentEntry.processed == False
    )
    
    if request.entry_ids:
        query = query.filter(SentimentEntry.id.in_(request.entry_ids))
    if request.lga_filter:
        query = query.filter(SentimentEntry.lga_id == request.lga_filter)
    if request.date_from:
        query = query.filter(SentimentEntry.created_at >= request.date_from)
    if request.date_to:
        query = query.filter(SentimentEntry.created_at <= request.date_to)
    
    entries = query.all()
    
    processed = 0
    errors = 0
    total_score = 0
    categories = {}
    
    for entry in entries:
        try:
            result = analyze_sentiment_with_ai(entry.raw_text, entry.language)
            
            entry.sentiment = result["sentiment_label"]
            entry.score = result["sentiment_score"]
            entry.topics = result["key_issues"]
            entry.processed = True
            
            total_score += result["sentiment_score"]
            categories[result["category"]] = categories.get(result["category"], 0) + 1
            
            processed += 1
        except Exception as e:
            errors += 1
            print(f"Error processing entry {entry.id}: {e}")
    
    db.commit()
    
    avg_sentiment = total_score / processed if processed > 0 else 0
    
    return BatchSentimentResponse(
        processed=processed,
        errors=errors,
        avg_sentiment=round(avg_sentiment, 2),
        category_breakdown=categories
    )


@router.get("/sentiment/weekly-report")
def generate_weekly_sentiment_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate weekly sentiment summary report
    """
    # Get last 7 days
    week_ago = datetime.utcnow() - timedelta(days=7)
    
    entries = db.query(SentimentEntry).filter(
        SentimentEntry.tenant_id == current_user.tenant_id,
        SentimentEntry.created_at >= week_ago,
        SentimentEntry.processed == True
    ).all()
    
    if not entries:
        return {
            "message": "No sentiment data for the past week",
            "period_start": week_ago.isoformat(),
            "period_end": datetime.utcnow().isoformat()
        }
    
    # Calculate overall sentiment
    avg_score = sum(e.score for e in entries) / len(entries)
    
    # Compare with previous week
    two_weeks_ago = datetime.utcnow() - timedelta(days=14)
    prev_entries = db.query(SentimentEntry).filter(
        SentimentEntry.tenant_id == current_user.tenant_id,
        SentimentEntry.created_at >= two_weeks_ago,
        SentimentEntry.created_at < week_ago,
        SentimentEntry.processed == True
    ).all()
    
    prev_avg = sum(e.score for e in prev_entries) / len(prev_entries) if prev_entries else avg_score
    
    trend = "improving" if avg_score > prev_avg + 5 else \
            "declining" if avg_score < prev_avg - 5 else "stable"
    
    # LGA rankings
    lga_scores = {}
    for entry in entries:
        if entry.lga_id:
            if entry.lga_id not in lga_scores:
                lga_scores[entry.lga_id] = []
            lga_scores[entry.lga_id].append(entry.score)
    
    lga_rankings = []
    for lga_id, scores in lga_scores.items():
        lga = db.query(LGA).filter(LGA.id == lga_id).first()
        avg = sum(scores) / len(scores)
        lga_rankings.append({
            "lga_id": str(lga_id),
            "lga_name": lga.name if lga else "Unknown",
            "avg_sentiment": round(avg, 2),
            "entry_count": len(scores)
        })
    
    lga_rankings.sort(key=lambda x: x["avg_sentiment"], reverse=True)
    
    # Top issues
    issue_counts = {}
    for entry in entries:
        for topic in (entry.topics or []):
            issue_counts[topic] = issue_counts.get(topic, 0) + 1
    
    top_issues = [
        {"issue": issue, "mentions": count}
        for issue, count in sorted(issue_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    ]
    
    # Alerts for significant shifts
    alerts = []
    for lga_id, scores in lga_scores.items():
        if len(scores) >= 5:  # Minimum sample size
            current_avg = sum(scores) / len(scores)
            
            # Compare with historical average
            historical = db.query(SentimentEntry).filter(
                SentimentEntry.tenant_id == current_user.tenant_id,
                SentimentEntry.lga_id == lga_id,
                SentimentEntry.created_at < week_ago,
                SentimentEntry.processed == True
            ).all()
            
            if historical:
                hist_avg = sum(e.score for e in historical) / len(historical)
                shift = current_avg - hist_avg
                
                if abs(shift) >= 15:
                    lga = db.query(LGA).filter(LGA.id == lga_id).first()
                    alerts.append({
                        "lga_id": str(lga_id),
                        "lga_name": lga.name if lga else "Unknown",
                        "shift": round(shift, 2),
                        "direction": "positive" if shift > 0 else "negative",
                        "severity": "high" if abs(shift) > 25 else "medium"
                    })
    
    # Generate summary
    summary = f"""
    Weekly Sentiment Report ({week_ago.strftime('%Y-%m-%d')} to {datetime.utcnow().strftime('%Y-%m-%d')})
    
    Overall Sentiment: {avg_score:.1f}/100 ({trend})
    Total Entries Analyzed: {len(entries)}
    
    Top Performing LGAs: {', '.join([r['lga_name'] for r in lga_rankings[:3]])}
    Areas of Concern: {', '.join([r['lga_name'] for r in lga_rankings[-3:]])}
    
    Key Issues: {', '.join([i['issue'] for i in top_issues])}
    
    Alerts: {len(alerts)} significant shifts detected
    """
    
    return WeeklySentimentReport(
        period_start=week_ago.isoformat(),
        period_end=datetime.utcnow().isoformat(),
        overall_sentiment=round(avg_score, 2),
        sentiment_trend=trend,
        lga_rankings=lga_rankings[:10],
        top_issues=top_issues,
        alerts=alerts,
        summary=summary
    )


# ==================== TARGETING RECOMMENDATION AGENT (Task 4.2) ====================

@router.post("/targeting/recommendations", response_model=TargetingRecommendationResponse)
def get_targeting_recommendations(
    request: TargetingRecommendationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    AI-powered voter targeting recommendations
    """
    # Build query based on focus
    query = db.query(Voter).filter(
        Voter.tenant_id == current_user.tenant_id
    )
    
    if request.target_lgas:
        query = query.filter(Voter.lga_id.in_(request.target_lgas))
    
    if request.focus == "persuadable":
        # Voters with neutral sentiment but high persuadability
        query = query.filter(
            Voter.sentiment_score.between(-30, 30),
            Voter.persuadability >= 60
        )
    elif request.focus == "supporters":
        query = query.filter(Voter.sentiment_score > 50)
    elif request.focus == "undecided":
        query = query.filter(
            Voter.sentiment_score.between(-10, 10),
            Voter.contact_count == 0
        )
    
    # Get voters
    voters = query.limit(request.voter_count).all()
    
    # Group by LGA
    lga_groups = {}
    for voter in voters:
        lga_id = str(voter.lga_id) if voter.lga_id else "unknown"
        if lga_id not in lga_groups:
            lga_groups[lga_id] = []
        lga_groups[lga_id].append(voter)
    
    # Build recommendations
    recommendations = []
    for lga_id, voter_list in lga_groups.items():
        lga = db.query(LGA).filter(LGA.id == lga_id).first()
        
        # Calculate strategy
        avg_sentiment = sum(v.sentiment_score for v in voter_list) / len(voter_list)
        avg_persuadability = sum(v.persuadability for v in voter_list) / len(voter_list)
        
        if avg_sentiment < -20:
            strategy = "Intensive engagement required. Focus on issue-based messaging."
        elif avg_sentiment < 20:
            strategy = "Moderate engagement. Highlight candidate achievements."
        else:
            strategy = "Maintenance mode. Reinforce positive sentiment."
        
        recommendations.append({
            "lga_id": lga_id,
            "lga_name": lga.name if lga else "Unknown",
            "voter_count": len(voter_list),
            "avg_sentiment": round(avg_sentiment, 2),
            "avg_persuadability": round(avg_persuadability, 2),
            "strategy": strategy,
            "priority": "high" if len(voter_list) > 100 else "medium"
        })
    
    # Sort by voter count
    recommendations.sort(key=lambda x: x["voter_count"], reverse=True)
    
    # Generate strategy notes
    total_voters = len(voters)
    top_lgas = recommendations[:3]
    
    strategy_notes = f"""
    Targeting Analysis for {request.focus} voters:
    
    Total Voters Identified: {total_voters}
    Focus Areas: {len(recommendations)} LGAs
    
    Recommended Priority LGAs:
    {chr(10).join([f"- {r['lga_name']}: {r['voter_count']} voters ({r['strategy']})" for r in top_lgas])}
    
    Next Actions:
    1. Deploy field teams to top 3 LGAs within 48 hours
    2. Customize messaging based on sentiment analysis
    3. Track contact rates and sentiment shifts weekly
    """
    
    return TargetingRecommendationResponse(
        recommendations=recommendations[:10],
        total_voters_found=total_voters,
        confidence_score=0.82,
        strategy_notes=strategy_notes
    )


@router.get("/targeting/lookalike/{voter_id}")
def find_lookalike_voters(
    voter_id: str,
    count: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Find voters similar to a given "ideal" voter
    """
    # Get source voter
    source = db.query(Voter).filter(
        Voter.id == voter_id,
        Voter.tenant_id == current_user.tenant_id
    ).first()
    
    if not source:
        raise HTTPException(status_code=404, detail="Source voter not found")
    
    # Find similar voters
    # In production, this would use Qdrant vector similarity search
    similar = db.query(Voter).filter(
        Voter.tenant_id == current_user.tenant_id,
        Voter.id != voter_id,
        Voter.lga_id == source.lga_id,  # Same LGA
        Voter.age_range == source.age_range,  # Same age group
        Voter.occupation == source.occupation,  # Same occupation
        Voter.contact_count == 0  # Not yet contacted
    ).limit(count).all()
    
    return {
        "source_voter": {
            "id": str(source.id),
            "name": source.full_name,
            "lga_id": str(source.lga_id) if source.lga_id else None,
            "sentiment_score": source.sentiment_score
        },
        "similar_voters_found": len(similar),
        "similar_voters": [
            {
                "id": str(v.id),
                "name": v.full_name,
                "lga_id": str(v.lga_id) if v.lga_id else None,
                "match_score": 85  # Would be calculated from embeddings
            }
            for v in similar
        ],
        "recommendation": f"These {len(similar)} voters have similar profiles to your ideal supporter but haven't been contacted yet. Prioritize outreach."
    }


# ==================== SCENARIO SIMULATION AGENT (Task 4.3) ====================

@router.post("/scenarios/simulate", response_model=ScenarioSimulationResponse)
def simulate_scenario(
    request: ScenarioSimulationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    AI-powered scenario simulation
    """
    # Get current baseline data
    lgas = db.query(LGA).filter(
        LGA.tenant_id == current_user.tenant_id
    ).all()
    
    if request.affected_lgas:
        lgas = [l for l in lgas if str(l.id) in request.affected_lgas]
    
    # Simulate vote shifts based on variables
    projected_shifts = {}
    key_factors = []
    
    for lga in lgas:
        base_shift = 0.0
        
        # Apply variable effects
        if request.variables.get("kwankwaso_endorsement"):
            # Kwankwaso endorsement effect (higher in urban LGAs)
            if lga.population and lga.population > 50000:
                base_shift += 8.5
            else:
                base_shift += 4.2
            key_factors.append("Kwankwaso endorsement carries significant weight")
        
        if request.variables.get("budget_increase"):
            budget_pct = request.variables.get("budget_increase", 0)
            base_shift += budget_pct * 0.15  # 0.15% per 1% budget increase
            key_factors.append(f"Budget increase of {budget_pct}% improves perception")
        
        if request.variables.get("security_incident"):
            base_shift -= 12.0
            key_factors.append("Security incident creates negative sentiment")
        
        # Add randomness
        import random
        base_shift += random.uniform(-2.0, 2.0)
        
        projected_shifts[str(lga.id)] = round(base_shift, 2)
    
    # Calculate confidence interval
    shifts = list(projected_shifts.values())
    avg_shift = sum(shifts) / len(shifts) if shifts else 0
    std_dev = (sum((s - avg_shift) ** 2 for s in shifts) / len(shifts)) ** 0.5 if shifts else 0
    
    confidence_interval = {
        "lower": round(avg_shift - 1.96 * std_dev, 2),
        "upper": round(avg_shift + 1.96 * std_dev, 2)
    }
    
    # Risk assessment
    negative_lgas = sum(1 for s in projected_shifts.values() if s < 0)
    risk_level = "high" if negative_lgas > len(projected_shifts) * 0.3 else \
                 "medium" if negative_lgas > 0 else "low"
    
    # Generate recommendation
    if avg_shift > 5:
        recommendation = "Scenario is favorable. Proceed with confidence."
    elif avg_shift > -5:
        recommendation = "Scenario has mixed impact. Monitor closely and prepare contingency plans."
    else:
        recommendation = "Scenario poses significant risk. Consider alternative strategies."
    
    # Create scenario record
    scenario = Scenario(
        id=uuid.uuid4(),
        tenant_id=current_user.tenant_id,
        title=request.scenario_title,
        description=f"Simulated scenario with variables: {request.variables}",
        probability=0.6,
        impact="positive" if avg_shift > 0 else "negative",
        variables=request.variables,
        our_response=recommendation,
        vote_projection=projected_shifts,
        status="active"
    )
    
    db.add(scenario)
    db.commit()
    
    return ScenarioSimulationResponse(
        scenario_id=str(scenario.id),
        projected_vote_shifts=projected_shifts,
        confidence_interval=confidence_interval,
        key_factors=list(set(key_factors)),  # Remove duplicates
        risk_assessment=risk_level,
        recommendation=recommendation
    )


@router.get("/scenarios/auto-update")
def auto_update_scenario_probabilities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Auto-update scenario probabilities based on new intelligence
    """
    scenarios = db.query(Scenario).filter(
        Scenario.tenant_id == current_user.tenant_id,
        Scenario.status == "active"
    ).all()
    
    updated = []
    
    for scenario in scenarios:
        # Get recent intelligence
        recent_reports = db.query(IntelligenceReport).filter(
            IntelligenceReport.tenant_id == current_user.tenant_id,
            IntelligenceReport.created_at >= datetime.utcnow() - timedelta(days=7)
        ).count()
        
        # Adjust probability based on new data
        old_prob = scenario.probability
        
        if recent_reports > 5:
            # More intelligence = more confident
            scenario.probability = min(0.95, scenario.probability * 1.1)
        
        if scenario.probability != old_prob:
            scenario.last_assessed_at = datetime.utcnow()
            updated.append({
                "scenario_id": str(scenario.id),
                "title": scenario.title,
                "old_probability": old_prob,
                "new_probability": scenario.probability,
                "shift": abs(scenario.probability - old_prob) > 0.1
            })
    
    db.commit()
    
    return {
        "scenarios_checked": len(scenarios),
        "scenarios_updated": len(updated),
        "significant_shifts": [u for u in updated if u["shift"]],
        "updated_scenarios": updated
    }


# ==================== COALITION STABILITY PREDICTOR ====================

@router.post("/coalition/stability-analysis", response_model=CoalitionStabilityResponse)
def analyze_coalition_stability(
    request: CoalitionStabilityRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Analyze coalition partner stability and predict defection risk
    """
    # Get partners
    query = db.query(CoalitionPartner).filter(
        CoalitionPartner.tenant_id == current_user.tenant_id
    )
    
    if request.partner_ids:
        query = query.filter(CoalitionPartner.id.in_(request.partner_ids))
    
    partners = query.all()
    
    if not partners:
        raise HTTPException(status_code=404, detail="No coalition partners found")
    
    defection_probs = {}
    early_warnings = []
    recommendations = []
    
    total_stability = 0
    
    for partner in partners:
        # Calculate defection probability
        prob = 0.0
        
        # Factor 1: Commitment level (inverse relationship)
        if partner.commitment_level:
            prob += (10 - partner.commitment_level) * 0.05
        
        # Factor 2: Resource delivery gap
        if partner.resources_pledged and partner.resources_delivered:
            for resource_type, pledged in partner.resources_pledged.items():
                delivered = partner.resources_delivered.get(resource_type, 0)
                if pledged > 0:
                    gap = (pledged - delivered) / pledged
                    prob += gap * 0.15
        
        # Factor 3: Health status
        health_risk = {
            "strong": 0.0,
            "stable": 0.05,
            "fragile": 0.15,
            "at_risk": 0.35
        }
        prob += health_risk.get(partner.health_status, 0.1)
        
        # Factor 4: Time since last contact
        if partner.last_contact_at:
            days_since = (datetime.utcnow() - partner.last_contact_at).days
            if days_since > 14:
                prob += 0.1
                early_warnings.append(f"{partner.party}: No contact in {days_since} days")
        
        prob = min(0.95, prob)  # Cap at 95%
        defection_probs[str(partner.id)] = round(prob, 2)
        
        # Generate recommendation
        if prob > 0.5:
            recommendations.append(f"URGENT: Schedule immediate meeting with {partner.party} leadership")
        elif prob > 0.3:
            recommendations.append(f"Schedule check-in with {partner.party} within 48 hours")
        
        total_stability += (1 - prob)
    
    # Overall stability score
    stability_score = (total_stability / len(partners)) * 100 if partners else 0
    
    # Risk level
    avg_defection = sum(defection_probs.values()) / len(defection_probs) if defection_probs else 0
    risk_level = "critical" if avg_defection > 0.5 else \
                 "high" if avg_defection > 0.3 else \
                 "medium" if avg_defection > 0.15 else "low"
    
    return CoalitionStabilityResponse(
        stability_score=round(stability_score, 2),
        risk_level=risk_level,
        defection_probability=defection_probs,
        early_warnings=early_warnings,
        recommendations=recommendations
    )


# ==================== AI AGENT STATUS & CONTROLS ====================

@router.get("/status")
def get_ai_agents_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get status of all AI agents
    """
    # Count unprocessed entries
    unprocessed_sentiment = db.query(SentimentEntry).filter(
        SentimentEntry.tenant_id == current_user.tenant_id,
        SentimentEntry.processed == False
    ).count()
    
    # Get last run times
    last_sentiment_report = db.query(IntelligenceReport).filter(
        IntelligenceReport.tenant_id == current_user.tenant_id,
        IntelligenceReport.report_type == "sentiment_summary"
    ).order_by(IntelligenceReport.created_at.desc()).first()
    
    return {
        "agents": {
            "sentiment_analysis": {
                "status": "active",
                "unprocessed_entries": unprocessed_sentiment,
                "last_run": last_sentiment_report.created_at.isoformat() if last_sentiment_report else None
            },
            "targeting_recommendations": {
                "status": "active",
                "last_run": None
            },
            "scenario_simulation": {
                "status": "active",
                "active_scenarios": db.query(Scenario).filter(
                    Scenario.tenant_id == current_user.tenant_id,
                    Scenario.status == "active"
                ).count()
            },
            "coalition_monitoring": {
                "status": "active",
                "partners_monitored": db.query(CoalitionPartner).filter(
                    CoalitionPartner.tenant_id == current_user.tenant_id
                ).count()
            }
        },
        "queue_size": unprocessed_sentiment,
        "system_health": "healthy" if unprocessed_sentiment < 100 else "backlogged"
    }


@router.post("/trigger-batch-processing")
def trigger_batch_processing(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Manually trigger batch processing of queued items
    """
    # In production, this would trigger Celery tasks
    return {
        "message": "Batch processing triggered",
        "timestamp": datetime.utcnow().isoformat(),
        "estimated_completion": "5-10 minutes",
        "items_queued": db.query(SentimentEntry).filter(
            SentimentEntry.tenant_id == current_user.tenant_id,
            SentimentEntry.processed == False
        ).count()
    }
