# URADI-360 Code Issues Audit Report

**Date:** March 21, 2026
**Status:** CRITICAL ISSUES FOUND

---

## 🔴 CRITICAL SECURITY ISSUES - FIXED ✅

### 1. Hardcoded JWT Secret Key - FIXED ✅
**File:** `backend/auth/utils.py:12`
**Issue:** Fallback hardcoded secret key for JWT signing
**Fix:** Now generates random secure key if env var not set, with warning. Production requires JWT_SECRET to be set.

### 2. Hardcoded Admin Password - FIXED ✅
**File:** `backend/seed.py:82`
**Issue:** Hardcoded admin password in seed data
**Fix:** Now generates secure random password and prints it to console on first run.

### 3. Hardcoded Database Password - FIXED ✅
**File:** `backend/database.py:6`
**Issue:** Default database URL contains hardcoded password
**Fix:** Now raises ValueError if DATABASE_URL not set, with clear error message.

### 4. Hardcoded Confirmation Token - FIXED ✅
**File:** `backend/api/exports.py:487`
**Issue:** GDPR delete confirmation token is hardcoded
**Fix:** Now reads from GDPR_DELETE_CONFIRMATION_TOKEN environment variable.

---

## 🟡 HIGH PRIORITY ISSUES

### 5. Middleware Function Signature Error - FIXED ✅
**File:** `backend/middleware.py:10`
**Issue:** `get_tenant_from_token()` called without required token parameter
**Fix:** Rewrote middleware to properly extract token from Authorization header and handle it correctly.

### 6. Missing TODO Implementations
**Files:** Multiple
- `api/admin.py:259, 347, 397, 420` - Superadmin permission checks not implemented
- `api/payments.py:187-188` - Payment event handling incomplete
- `api/public.py:211, 221, 399` - Email notifications not implemented
- `scrapers/government_scraper.py:183, 200` - Government scrapers incomplete

### 7. Celery Error Handling Incomplete
**File:** `backend/celery_app.py:115-116`
**Issue:** Error tracking service integration not implemented

---

## 🟢 MEDIUM PRIORITY ISSUES

### 8. Test Files Need Organization
**Issue:** 12 test files in root directory, not in tests/ folder
**Fix:** Move to tests/ directory with proper structure

### 9. Missing Input Validation
**Files:** Various API endpoints
**Issue:** Some endpoints lack proper input validation

### 10. No Rate Limiting on Some Endpoints
**Files:** WebSocket endpoints
**Issue:** WebSocket connections not rate limited

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 4 | Must fix before deployment |
| 🟡 High | 3 | Should fix before deployment |
| 🟢 Medium | 3 | Fix if time permits |

**Recommendation:** DO NOT DEPLOY until critical issues are fixed.
