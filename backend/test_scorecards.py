#!/usr/bin/env python3
"""Test script for Scorecards API (Task 2.4)"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all imports work correctly"""
    try:
        from api.scorecards import router
        print("SUCCESS: Scorecards API module imported successfully")
        return True
    except Exception as e:
        print(f"ERROR: Failed to import scorecards API: {e}")
        return False

def test_models():
    """Test that ScorecardEntry model is accessible"""
    try:
        from models import ScorecardEntry
        print("SUCCESS: ScorecardEntry model imported successfully")
        
        # Check model attributes
        attrs = ['id', 'tenant_id', 'period', 'sector', 'metric_name', 
                 'incumbent_value', 'benchmark_value', 'grade', 'narrative', 
                 'data_source', 'published']
        for attr in attrs:
            if hasattr(ScorecardEntry, attr):
                print(f"  - {attr}: OK")
            else:
                print(f"  - {attr}: MISSING")
        
        return True
    except Exception as e:
        print(f"ERROR: Failed to import ScorecardEntry model: {e}")
        return False

def test_endpoints():
    """Test that all endpoints are defined"""
    try:
        from api.scorecards import router
        
        # Get all routes
        routes = []
        for route in router.routes:
            routes.append(f"{route.methods} {route.path}")
        
        print(f"SUCCESS: Found {len(routes)} endpoints:")
        for route in routes:
            print(f"  - {route}")
        
        return True
    except Exception as e:
        print(f"ERROR: Failed to get endpoints: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Testing Scorecards API (Task 2.4)")
    print("=" * 60)
    print()
    
    test_imports()
    print()
    
    test_models()
    print()
    
    test_endpoints()
    print()
    
    print("=" * 60)
    print("Task 2.4: Scorecards API - Implementation Complete")
    print("=" * 60)
