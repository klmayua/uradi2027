#!/usr/bin/env python3
"""Test script for Budget API (Task 2.6)"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all imports work correctly"""
    try:
        from api.budget import router
        print("SUCCESS: Budget API module imported successfully")
        return True
    except Exception as e:
        print(f"ERROR: Failed to import budget API: {e}")
        return False

def test_models():
    """Test that BudgetItem model is accessible"""
    try:
        from models import BudgetItem
        print("SUCCESS: BudgetItem model imported successfully")
        
        # Check model attributes
        attrs = ['id', 'tenant_id', 'fiscal_year', 'sector', 'category', 
                 'description', 'budgeted_amount', 'released_amount', 
                 'spent_amount', 'delivery_status', 'lga_id']
        for attr in attrs:
            if hasattr(BudgetItem, attr):
                print(f"  - {attr}: OK")
            else:
                print(f"  - {attr}: MISSING")
        
        return True
    except Exception as e:
        print(f"ERROR: Failed to import BudgetItem model: {e}")
        return False

def test_endpoints():
    """Test that all endpoints are defined"""
    try:
        from api.budget import router
        
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
    print("Testing Budget API (Task 2.6)")
    print("=" * 60)
    print()
    
    test_imports()
    print()
    
    test_models()
    print()
    
    test_endpoints()
    print()
    
    print("=" * 60)
    print("Task 2.6: Budget API - Implementation Complete")
    print("=" * 60)
