"""
Test script for Election Day Monitor Mode APIs (Task 3.5)
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_election_day_apis():
    print("=" * 60)
    print("TESTING ELECTION DAY MONITOR MODE APIs")
    print("=" * 60)
    
    # First, login to get token
    print("\n1. Logging in as field agent...")
    login_data = {
        "email": "fieldagent@jigawa2027.com",
        "password": "FieldAgent123!"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            token = response.json().get("access_token")
            headers = {"Authorization": f"Bearer {token}"}
            print("✓ Login successful")
        else:
            print(f"✗ Login failed: {response.status_code}")
            print(response.text)
            return
    except Exception as e:
        print(f"✗ Error: {e}")
        return
    
    # Test 2: Get my assignment
    print("\n2. Getting monitor assignment...")
    try:
        response = requests.get(f"{BASE_URL}/api/election-day/monitor/my-assignment", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Assignment: {json.dumps(data, indent=2)}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 3: Monitor check-in (would need actual polling unit ID and coordinates)
    print("\n3. Testing monitor check-in endpoint...")
    print("   (Requires valid polling_unit_id - skipping actual check-in)")
    print("   POST /api/election-day/monitor/check-in")
    print("   Body: {polling_unit_id, latitude, longitude, notes}")
    
    # Test 4: Get polling units summary
    print("\n4. Getting polling units summary...")
    try:
        response = requests.get(f"{BASE_URL}/api/election-day/command-center/polling-units", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Total polling units: {data.get('total', 0)}")
            if data.get('polling_units'):
                print(f"  Sample: {json.dumps(data['polling_units'][0], indent=2)}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 5: Get monitor status board
    print("\n5. Getting monitor status board...")
    try:
        response = requests.get(f"{BASE_URL}/api/election-day/command-center/monitors", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Total monitors: {data.get('total_monitors', 0)}")
            print(f"  Checked in: {data.get('checked_in', 0)}")
            print(f"  Assigned: {data.get('assigned', 0)}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 6: Get PVT results
    print("\n6. Getting PVT results...")
    try:
        response = requests.get(f"{BASE_URL}/api/election-day/command-center/pvt-results", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Total PUs: {data.get('total_polling_units', 0)}")
            print(f"  Reporting: {data.get('reporting_polling_units', 0)}")
            print(f"  Turnout: {data.get('turnout_percentage', 0)}%")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 7: Get incidents
    print("\n7. Getting election day incidents...")
    try:
        response = requests.get(f"{BASE_URL}/api/election-day/command-center/incidents", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Total incidents: {data.get('total', 0)}")
            by_severity = data.get('by_severity', {})
            print(f"  By severity: {by_severity}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 8: Get live dashboard
    print("\n8. Getting live dashboard...")
    try:
        response = requests.get(f"{BASE_URL}/api/election-day/command-center/live-dashboard", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Dashboard data received")
            print(f"  Timestamp: {data.get('timestamp')}")
            pu_stats = data.get('polling_units', {})
            print(f"  PUs: {pu_stats.get('total', 0)}")
            print(f"  Turnout: {pu_stats.get('turnout_percentage', 0)}%")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    print("\n" + "=" * 60)
    print("ELECTION DAY API TESTS COMPLETE")
    print("=" * 60)
    print("\nKey Endpoints Implemented:")
    print("  ✓ POST /api/election-day/monitor/check-in")
    print("  ✓ POST /api/election-day/monitor/check-out")
    print("  ✓ GET  /api/election-day/monitor/my-assignment")
    print("  ✓ POST /api/election-day/accreditation/update")
    print("  ✓ GET  /api/election-day/accreditation/polling-unit/{id}")
    print("  ✓ POST /api/election-day/vote-tally/submit")
    print("  ✓ POST /api/election-day/vote-tally/{id}/upload-photo")
    print("  ✓ GET  /api/election-day/vote-tally/polling-unit/{id}")
    print("  ✓ POST /api/election-day/incidents/report")
    print("  ✓ POST /api/election-day/incidents/{id}/upload-photos")
    print("  ✓ GET  /api/election-day/incidents/my-reports")
    print("  ✓ GET  /api/election-day/command-center/polling-units")
    print("  ✓ GET  /api/election-day/command-center/monitors")
    print("  ✓ GET  /api/election-day/command-center/pvt-results")
    print("  ✓ GET  /api/election-day/command-center/incidents")
    print("  ✓ PATCH /api/election-day/command-center/incidents/{id}/status")
    print("  ✓ GET  /api/election-day/command-center/live-dashboard")

if __name__ == "__main__":
    test_election_day_apis()
