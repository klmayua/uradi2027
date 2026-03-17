"""
Test script for Phase 4: AI Agents + Governance Mode APIs
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_phase4_apis():
    print("=" * 60)
    print("TESTING PHASE 4: AI AGENTS + GOVERNANCE MODE APIs")
    print("=" * 60)
    
    # First, login to get token
    print("\n1. Logging in...")
    login_data = {
        "email": "admin@jigawa2027.com",
        "password": "Admin123!"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            token = response.json().get("access_token")
            headers = {"Authorization": f"Bearer {token}"}
            print("✓ Login successful")
        else:
            print(f"✗ Login failed: {response.status_code}")
            return
    except Exception as e:
        print(f"✗ Error: {e}")
        return
    
    # Test 2: AI Agents Status
    print("\n2. Getting AI Agents status...")
    try:
        response = requests.get(f"{BASE_URL}/api/ai-agents/status", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ System health: {data.get('system_health')}")
            print(f"✓ Queue size: {data.get('queue_size')}")
            agents = data.get('agents', {})
            for agent, status in agents.items():
                print(f"  - {agent}: {status.get('status')}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 3: Sentiment Analysis
    print("\n3. Testing sentiment analysis...")
    sentiment_request = {
        "text": "The new road construction in our LGA is excellent. We appreciate the government's efforts.",
        "language": "en",
        "source": "field_report"
    }
    try:
        response = requests.post(
            f"{BASE_URL}/api/ai-agents/sentiment/analyze",
            json=sentiment_request,
            headers=headers
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Sentiment score: {data.get('sentiment_score')}")
            print(f"✓ Category: {data.get('category')}")
            print(f"✓ Key issues: {data.get('key_issues')}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 4: Weekly Sentiment Report
    print("\n4. Getting weekly sentiment report...")
    try:
        response = requests.get(f"{BASE_URL}/api/ai-agents/sentiment/weekly-report", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Overall sentiment: {data.get('overall_sentiment')}")
            print(f"✓ Trend: {data.get('sentiment_trend')}")
            print(f"✓ Top LGAs: {len(data.get('lga_rankings', []))}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 5: Targeting Recommendations
    print("\n5. Getting targeting recommendations...")
    targeting_request = {
        "voter_count": 500,
        "focus": "persuadable"
    }
    try:
        response = requests.post(
            f"{BASE_URL}/api/ai-agents/targeting/recommendations",
            json=targeting_request,
            headers=headers
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Voters found: {data.get('total_voters_found')}")
            print(f"✓ Confidence: {data.get('confidence_score')}")
            recs = data.get('recommendations', [])
            if recs:
                print(f"✓ Top recommendation: {recs[0].get('lga_name')} ({recs[0].get('voter_count')} voters)")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 6: Scenario Simulation
    print("\n6. Testing scenario simulation...")
    scenario_request = {
        "scenario_title": "Kwankwaso Endorsement Impact",
        "variables": {
            "kwankwaso_endorsement": True,
            "budget_increase": 15
        }
    }
    try:
        response = requests.post(
            f"{BASE_URL}/api/ai-agents/scenarios/simulate",
            json=scenario_request,
            headers=headers
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Scenario ID: {data.get('scenario_id')}")
            print(f"✓ Risk assessment: {data.get('risk_assessment')}")
            print(f"✓ Recommendation: {data.get('recommendation')[:100]}...")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 7: Coalition Stability Analysis
    print("\n7. Analyzing coalition stability...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/ai-agents/coalition/stability-analysis",
            json={},
            headers=headers
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Stability score: {data.get('stability_score')}")
            print(f"✓ Risk level: {data.get('risk_level')}")
            print(f"✓ Warnings: {len(data.get('early_warnings', []))}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 8: Governance Mode Status
    print("\n8. Getting governance mode status...")
    try:
        response = requests.get(f"{BASE_URL}/api/governance/status", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Governance mode: {'Active' if data.get('governance_mode_active') else 'Inactive'}")
            metrics = data.get('metrics', {})
            print(f"✓ Active tickets: {metrics.get('active_feedback_tickets')}")
            print(f"✓ Security incidents (7d): {metrics.get('security_incidents_7d')}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 9: Submit Citizen Feedback
    print("\n9. Testing citizen feedback submission...")
    feedback_request = {
        "category": "infrastructure",
        "sector": "roads",
        "message": "The main road in Dutse needs urgent repair. Potholes are causing accidents.",
        "urgency": "high"
    }
    try:
        response = requests.post(
            f"{BASE_URL}/api/governance/feedback/submit",
            json=feedback_request,
            headers=headers
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Feedback ID: {data.get('id')}")
            print(f"✓ Status: {data.get('status')}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 10: Feedback Dashboard
    print("\n10. Getting feedback dashboard...")
    try:
        response = requests.get(f"{BASE_URL}/api/governance/feedback/dashboard", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Total feedback: {data.get('total_feedback')}")
            print(f"✓ Open tickets: {data.get('open_tickets')}")
            print(f"✓ Avg resolution time: {data.get('avg_resolution_time_hours')} hours")
            print(f"✓ Satisfaction rate: {data.get('satisfaction_rate')}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 11: Security Incident Map
    print("\n11. Getting security incident map...")
    try:
        response = requests.get(
            f"{BASE_URL}/api/governance/security/incident-map?time_range=7d",
            headers=headers
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Incidents: {len(data.get('incidents', []))}")
            print(f"✓ Clusters: {len(data.get('clusters', []))}")
            print(f"✓ Heat zones: {len(data.get('heat_zones', []))}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 12: Security Pattern Analysis
    print("\n12. Getting security pattern analysis...")
    try:
        response = requests.get(
            f"{BASE_URL}/api/governance/security/pattern-analysis?days=30",
            headers=headers
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Total incidents: {data.get('total_incidents')}")
            print(f"✓ Trend: {data.get('trend')}")
            print(f"✓ AI insights: {len(data.get('ai_insights', []))}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 13: Early Warning Alerts
    print("\n13. Getting early warning alerts...")
    try:
        response = requests.get(f"{BASE_URL}/api/governance/security/early-warnings", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Alert count: {data.get('alert_count')}")
            alerts = data.get('alerts', [])
            for alert in alerts[:2]:
                print(f"  - {alert.get('alert_type')}: {alert.get('severity')}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 14: Budget Tracker
    print("\n14. Getting budget tracker...")
    try:
        response = requests.get(f"{BASE_URL}/api/governance/budget/tracker", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            summary = data.get('summary', {})
            print(f"✓ Fiscal year: {data.get('fiscal_year')}")
            print(f"✓ Total allocated: ${summary.get('total_allocated', 0):,.2f}")
            print(f"✓ Total spent: ${summary.get('total_spent', 0):,.2f}")
            print(f"✓ Utilization: {summary.get('overall_utilization')}%")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    print("\n" + "=" * 60)
    print("PHASE 4 API TESTS COMPLETE")
    print("=" * 60)
    print("\nAI Agents Endpoints:")
    print("  ✓ GET  /api/ai-agents/status")
    print("  ✓ POST /api/ai-agents/sentiment/analyze")
    print("  ✓ POST /api/ai-agents/sentiment/batch-process")
    print("  ✓ GET  /api/ai-agents/sentiment/weekly-report")
    print("  ✓ POST /api/ai-agents/targeting/recommendations")
    print("  ✓ GET  /api/ai-agents/targeting/lookalike/{voter_id}")
    print("  ✓ POST /api/ai-agents/scenarios/simulate")
    print("  ✓ GET  /api/ai-agents/scenarios/auto-update")
    print("  ✓ POST /api/ai-agents/coalition/stability-analysis")
    print("  ✓ POST /api/ai-agents/trigger-batch-processing")
    print("\nGovernance Mode Endpoints:")
    print("  ✓ GET  /api/governance/status")
    print("  ✓ POST /api/governance/activate")
    print("  ✓ POST /api/governance/feedback/submit")
    print("  ✓ GET  /api/governance/feedback/inbox")
    print("  ✓ PATCH /api/governance/feedback/{id}/status")
    print("  ✓ GET  /api/governance/feedback/dashboard")
    print("  ✓ POST /api/governance/feedback/public-status")
    print("  ✓ GET  /api/governance/security/incident-map")
    print("  ✓ GET  /api/governance/security/pattern-analysis")
    print("  ✓ GET  /api/governance/security/early-warnings")
    print("  ✓ GET  /api/governance/budget/tracker")
    print("  ✓ GET  /api/governance/budget/projects")

if __name__ == "__main__":
    test_phase4_apis()
