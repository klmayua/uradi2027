"""
Authentication Dependencies
Re-exports from utils.py for backward compatibility
"""
from auth.utils import get_current_user

__all__ = ['get_current_user']
