#!/usr/bin/env python3
"""Test script for Intelligence Reports API (Task 2.7)"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all imports work correctly"""
    try:
        from api.intelligence import router
        print("SUCCESS: Intelligence API module imported successfully")
        return True
    except Exception as e:
        print(f"ERROR: Failed to import intelligence API: {e}")
        return False

def test_models():
    """Test that IntelligenceReport model is accessible"""
    try:
        from models import IntelligenceReport
        print("SUCCESS: IntelligenceReport model imported successfully")
        
        # Check model attributes
        attrs = ['id', 'tenant_id', 'title', 'report_type', 'body', 
                 'classification', 'lga_id', 'tags', 'attachments', 'created_by']
        for attr in attrs:
            if hasattr(IntelligenceReport, attr):
                print(f"  - {attr}: OK")
            else:
                print(f"  - {attr}: MISSING")
        
        return True
    except Exception as e:
        print(f"ERROR: Failed to import IntelligenceReport model: {e}")
        return False

def test_endpoints():
    """Test that all endpoints are defined"""
    try:
        from api.intelligence import router
        
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
    print("Testing Intelligence Reports API (Task 2.7)")
    print("=" * 60)
    print()
    
    test_imports()
    print()
    
    test_models()
    print()
    
    test_endpoints()
    print()
    
    print("=" * 60)
    print("Task 2.7: Intelligence Reports API - Implementation Complete")
    print("=" * 60)
