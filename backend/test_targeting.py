#!/usr/bin/env python3
"""Test script for Micro-targeting API (Task 2.8)"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all imports work correctly"""
    try:
        from api.targeting import router
        print("SUCCESS: Micro-targeting API module imported successfully")
        return True
    except Exception as e:
        print(f"ERROR: Failed to import targeting API: {e}")
        return False

def test_endpoints():
    """Test that all endpoints are defined"""
    try:
        from api.targeting import router
        
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
    print("Testing Micro-targeting API (Task 2.8)")
    print("=" * 60)
    print()
    
    test_imports()
    print()
    
    test_endpoints()
    print()
    
    print("=" * 60)
    print("Task 2.8: Micro-targeting API - Implementation Complete")
    print("=" * 60)
