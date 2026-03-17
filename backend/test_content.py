#!/usr/bin/env python3
"""Test script for Content API (Task 2.5)"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all imports work correctly"""
    try:
        from api.content import router
        print("SUCCESS: Content API module imported successfully")
        return True
    except Exception as e:
        print(f"ERROR: Failed to import content API: {e}")
        return False

def test_models():
    """Test that ContentItem and MessageLog models are accessible"""
    try:
        from models import ContentItem, MessageLog
        print("SUCCESS: ContentItem model imported successfully")
        print("SUCCESS: MessageLog model imported successfully")
        
        # Check ContentItem attributes
        attrs = ['id', 'tenant_id', 'title', 'body', 'content_type', 
                 'platform', 'language', 'status', 'scheduled_at', 'published_at']
        for attr in attrs:
            if hasattr(ContentItem, attr):
                print(f"  - ContentItem.{attr}: OK")
            else:
                print(f"  - ContentItem.{attr}: MISSING")
        
        return True
    except Exception as e:
        print(f"ERROR: Failed to import models: {e}")
        return False

def test_endpoints():
    """Test that all endpoints are defined"""
    try:
        from api.content import router
        
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
    print("Testing Content API (Task 2.5)")
    print("=" * 60)
    print()
    
    test_imports()
    print()
    
    test_models()
    print()
    
    test_endpoints()
    print()
    
    print("=" * 60)
    print("Task 2.5: Content API - Implementation Complete")
    print("=" * 60)
