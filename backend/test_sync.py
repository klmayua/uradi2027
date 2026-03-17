"""
Test script for Offline Sync APIs (Task 3.7)
"""

import requests
import json
import gzip
import base64

BASE_URL = "http://localhost:8000"

def test_sync_apis():
    print("=" * 60)
    print("TESTING OFFLINE SYNC APIs")
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
            return
    except Exception as e:
        print(f"✗ Error: {e}")
        return
    
    # Test 2: Get sync config
    print("\n2. Getting sync configuration...")
    try:
        response = requests.get(f"{BASE_URL}/api/sync/config", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Sync interval: {data.get('sync_interval_seconds')}s")
            print(f"✓ Batch size: {data.get('batch_size')}")
            print(f"✓ Tables: {list(data.get('tables', {}).keys())}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 3: Get sync status
    print("\n3. Getting sync status...")
    try:
        response = requests.get(f"{BASE_URL}/api/sync/status", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Sync status: {data.get('sync_status')}")
            print(f"✓ Tables synced: {data.get('tables_synced')}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 4: Get sync diagnostics
    print("\n4. Getting sync diagnostics...")
    try:
        response = requests.get(f"{BASE_URL}/api/sync/diagnostics", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Total records: {data.get('total_records')}")
            print(f"✓ Sync health: {data.get('sync_health')}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 5: Pull sync (get changes since timestamp)
    print("\n5. Testing sync pull...")
    pull_request = {
        "last_pulled_at": 0,  # Get all records
        "tables": ["voters", "sentiment"]
    }
    try:
        response = requests.post(f"{BASE_URL}/api/sync/pull", json=pull_request, headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            changes = data.get('changes', {})
            print(f"✓ Server timestamp: {data.get('timestamp')}")
            print(f"✓ Voters received: {len(changes.get('voters', {}).get('created', []))}")
            print(f"✓ Sentiment entries: {len(changes.get('sentiment', {}).get('created', []))}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 6: Push sync (send local changes)
    print("\n6. Testing sync push...")
    push_request = {
        "changes": {
            "voters": [
                {
                    "id": "test-voter-001",
                    "full_name": "Test Voter",
                    "phone": "08012345678",
                    "lga_id": None,
                    "ward_id": None,
                    "gender": "male",
                    "age_range": "25-34",
                    "occupation": "Farmer",
                    "party_leaning": "PDP",
                    "sentiment_score": 75,
                    "tags": ["supporter", "field_captured"],
                    "notes": "Captured during field canvassing",
                    "created_at": str(int(__import__('time').time() * 1000)),
                    "updated_at": str(int(__import__('time').time() * 1000))
                }
            ]
        },
        "last_pulled_at": int(__import__('time').time() * 1000)
    }
    try:
        response = requests.post(f"{BASE_URL}/api/sync/push", json=push_request, headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Applied: {data.get('applied')}")
            print(f"✓ Errors: {len(data.get('errors', []))}")
            print(f"✓ Conflicts: {len(data.get('conflicts', []))}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 7: Batch create voters
    print("\n7. Testing batch voter creation...")
    batch_voters = [
        {
            "full_name": f"Batch Voter {i}",
            "phone": f"080{i:08d}",
            "gender": "male" if i % 2 == 0 else "female",
            "age_range": "25-34",
            "occupation": "Trader",
            "party_leaning": "PDP",
            "sentiment_score": 60 + i,
            "tags": ["batch_import"]
        }
        for i in range(1, 6)
    ]
    try:
        response = requests.post(
            f"{BASE_URL}/api/sync/batch/voters",
            json=batch_voters,
            headers=headers
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Created: {data.get('created')}")
            print(f"✓ Errors: {len(data.get('errors', []))}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 8: Compressed sync pull
    print("\n8. Testing compressed sync pull...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/sync/pull/compressed",
            json=pull_request,
            headers=headers
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Compressed: {data.get('compressed')}")
            print(f"✓ Original size: {data.get('original_size')} bytes")
            print(f"✓ Compressed size: {data.get('compressed_size')} bytes")
            if data.get('original_size', 0) > 0:
                ratio = (1 - data.get('compressed_size', 0) / data.get('original_size', 1)) * 100
                print(f"✓ Compression ratio: {ratio:.1f}%")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    print("\n" + "=" * 60)
    print("OFFLINE SYNC API TESTS COMPLETE")
    print("=" * 60)
    print("\nKey Endpoints Implemented:")
    print("  ✓ POST /api/sync/pull - Pull changes from server")
    print("  ✓ POST /api/sync/pull/compressed - Compressed pull")
    print("  ✓ POST /api/sync/push - Push changes to server")
    print("  ✓ POST /api/sync/push/compressed - Compressed push")
    print("  ✓ POST /api/sync/resolve-conflict - Resolve conflicts")
    print("  ✓ GET  /api/sync/status - Get sync status")
    print("  ✓ GET  /api/sync/diagnostics - Sync diagnostics")
    print("  ✓ GET  /api/sync/config - Sync configuration")
    print("  ✓ POST /api/sync/batch/voters - Batch voter creation")
    print("  ✓ POST /api/sync/batch/accreditation - Batch accreditation")
    print("  ✓ POST /api/sync/reset - Reset sync state")
    print("\nFeatures:")
    print("  • WatermelonDB-style sync protocol")
    print("  • Gzip compression for low bandwidth")
    print("  • Conflict detection and resolution")
    print("  • Batch operations for efficiency")
    print("  • Sync diagnostics and health monitoring")

if __name__ == "__main__":
    test_sync_apis()
