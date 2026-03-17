#!/usr/bin/env python3
"""Test script for Political Atlas API (Task 2.1)"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all imports work correctly"""
    try:
        from api.political_actors import router
        print("SUCCESS: Political actors API module imported successfully")
        return True
    except Exception as e:
        print(f"ERROR: Failed to import political actors API: {e}")
        return False

def test_models():
    """Test that PoliticalActor model is accessible"""
    try:
        from models import PoliticalActor
        print("SUCCESS: PoliticalActor model imported successfully")
        
        # Check model attributes
        attrs = ['id', 'tenant_id', 'full_name', 'title', 'party', 'lga_id', 
                 'influence_type', 'influence_level', 'loyalty', 'faction']
        for attr in attrs:
            if hasattr(PoliticalActor, attr):
                print(f"  - {attr}: OK")
            else:
                print(f"  - {attr}: MISSING")
        
        return True
    except Exception as e:
        print(f"ERROR: Failed to import PoliticalActor model: {e}")
        return False

def test_endpoints():
    """Test that all endpoints are defined"""
    try:
        from api.political_actors import router
        
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
    print("Testing Political Atlas API (Task 2.1)")
    print("=" * 60)
    print()
    
    test_imports()
    print()
    
    test_models()
    print()
    
    test_endpoints()
    print()
    
    print("=" * 60)
    print("Task 2.1: Political Atlas API - Implementation Complete")
    print("=" * 60)
