from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from datetime import datetime

from services.websocket import ws_manager, election_ws

# Import rate limiting
from utils.rate_limiting import limiter, rate_limit_exceeded_handler

# Import structured logging
from utils.logging_config import CorrelationIdMiddleware, configure_structlog, get_logger

# Import health checks
from utils.health_checks import health_checker
from slowapi.errors import RateLimitExceeded

# Import middleware
from middleware import tenant_middleware

# Import routers
from auth.routes import router as auth_router
from auth.oauth import router as oauth_router
from auth.password_reset import router as password_reset_router
from tenants.routes import router as tenants_router
from users.routes import router as users_router
from api.political_actors import router as political_actors_router
from api.scenarios import router as scenarios_router
from api.coalition import router as coalition_router
from api.scorecards import router as scorecards_router
from api.content import router as content_router
from api.budget import router as budget_router
from api.intelligence import router as intelligence_router
from api.targeting import router as targeting_router
from api.field_app import router as field_app_router
from api.collection import router as collection_router
from api.canvassing import router as canvassing_router
from api.incidents import router as incidents_router
from api.election_day import router as election_day_router
from api.sync import router as sync_router
from api.ai_agents import router as ai_agents_router
from api.governance import router as governance_router
from api.rapid_response import router as rapid_response_router
from api.polls import router as polls_router
# from api.email import router as email_router  # Disabled - sendgrid not installed
from api.payments import router as payments_router
# from api.public import router as public_router  # Disabled - missing models
from api.ussd import router as ussd_router
from api.compliance import router as compliance_router
# from api.osint import router as osint_router  # Disabled - missing models
# from api.exports import router as exports_router  # Disabled
# from api.admin import router as admin_router  # Disabled - missing function
from api.users import router as users_api_router
from api.platform_admin import router as platform_admin_router
from api.electoral import router as electoral_router

# New API modules for frontend support
from api.dashboard import router as dashboard_router
from api.citizen_portal import router as citizen_portal_router
from api.mother_portal import router as mother_portal_router
from api.candidate_portal import router as candidate_portal_router
from api.notifications import router as notifications_router
from api.documents import router as documents_router
from api.help import router as help_router
from api.careers import router as careers_router
from api.website_analytics import router as website_analytics_router
from api.mobile import router as mobile_router

app = FastAPI(
    title="URADI-360 API",
    description="Fully Managed Multi-Tenant Political Intelligence Platform",
    version="1.0.0"
)

# Add rate limiter to app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# Add correlation ID middleware for structured logging
app.add_middleware(CorrelationIdMiddleware)

# Add tenant middleware
app.middleware("http")(tenant_middleware)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses"""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url.path)
        }
    )

# CORS Configuration
origins_str = os.getenv("CORS_ORIGIN", "")
origins = [origin.strip() for origin in origins_str.split(",") if origin.strip()]

if origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include routers with rate limiting
# Auth router - strict limits
app.include_router(auth_router, prefix="/auth")
app.include_router(oauth_router)
app.include_router(password_reset_router)

# API routers - standard limits
app.include_router(tenants_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(political_actors_router, prefix="/api")
app.include_router(scenarios_router, prefix="/api")
app.include_router(coalition_router, prefix="/api")
app.include_router(scorecards_router, prefix="/api")
app.include_router(content_router, prefix="/api")
app.include_router(budget_router, prefix="/api")
app.include_router(intelligence_router, prefix="/api")
app.include_router(targeting_router, prefix="/api")
app.include_router(field_app_router, prefix="/api")
app.include_router(collection_router, prefix="/api")
app.include_router(canvassing_router, prefix="/api")
app.include_router(incidents_router, prefix="/api")
app.include_router(election_day_router, prefix="/api")
app.include_router(sync_router, prefix="/api")
app.include_router(ai_agents_router, prefix="/api")
app.include_router(governance_router, prefix="/api")
app.include_router(rapid_response_router, prefix="/api")
app.include_router(polls_router, prefix="/api")
# app.include_router(email_router, prefix="/api")  # Disabled
app.include_router(payments_router, prefix="/api")
# app.include_router(public_router, prefix="/api")  # Disabled
app.include_router(ussd_router)
app.include_router(compliance_router, prefix="/api")
# app.include_router(osint_router, prefix="/api")  # Disabled
# app.include_router(exports_router, prefix="/api")  # Disabled
# app.include_router(admin_router, prefix="/api")  # Disabled
app.include_router(platform_admin_router, prefix="/api")
app.include_router(users_api_router, prefix="/api")
app.include_router(electoral_router, prefix="/api")

# New frontend-supporting routers
app.include_router(dashboard_router, prefix="/api")
app.include_router(citizen_portal_router, prefix="/api")
app.include_router(mother_portal_router, prefix="/api")
app.include_router(candidate_portal_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
app.include_router(help_router, prefix="/api")
app.include_router(careers_router, prefix="/api")
app.include_router(website_analytics_router, prefix="/api")
app.include_router(mobile_router, prefix="/api")

@app.get("/")
@limiter.limit("100/minute")
def read_root(request: Request):
    return {"message": "Welcome to URADI-360 API"}


@app.get("/health")
@limiter.limit("60/minute")
async def health_check(request: Request):
    """Comprehensive health check endpoint"""
    return await health_checker.run_all_checks()


@app.get("/health/simple")
@limiter.limit("100/minute")
def health_check_simple(request: Request):
    """Simple health check for load balancers"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


# ==================== WEBSOCKET ENDPOINTS ====================

@app.websocket("/ws/live-results")
async def websocket_live_results(websocket: WebSocket):
    """WebSocket for real-time election results."""
    await ws_manager.connect(websocket, room="live_results")
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back any client messages
            await ws_manager.send_personal_message(
                {"type": "ack", "message": "Connected to live results"},
                websocket
            )
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


@app.websocket("/ws/incidents")
async def websocket_incidents(websocket: WebSocket):
    """WebSocket for real-time incident alerts."""
    await ws_manager.connect(websocket, room="incident_alerts")
    try:
        while True:
            await websocket.receive_text()  # Keep connection alive
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


@app.websocket("/ws/monitor")
async def websocket_monitor(websocket: WebSocket):
    """WebSocket for monitoring dashboard updates."""
    await ws_manager.connect(websocket, room="monitor_updates")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


@app.websocket("/ws/public")
async def websocket_public(websocket: WebSocket):
    """WebSocket for public website real-time updates."""
    await ws_manager.connect(websocket, room="public_updates")
    try:
        while True:
            data = await websocket.receive_text()
            # Handle public chat or live updates
            message = {"type": "public_message", "data": data}
            await ws_manager.broadcast(message, room="public_updates")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


@app.get("/ws/status")
@limiter.limit("30/minute")
def websocket_status(request: Request):
    """Get WebSocket connection statistics."""
    return {
        "live_results_connections": ws_manager.get_connection_count("live_results"),
        "incident_connections": ws_manager.get_connection_count("incident_alerts"),
        "monitor_connections": ws_manager.get_connection_count("monitor_updates"),
        "public_connections": ws_manager.get_connection_count("public_updates")
    }


@app.on_event("startup")
async def startup_event():
    """Configure logging on startup"""
    configure_structlog()
    logger = get_logger("uradi360.main")
    logger.info("URADI-360 API starting up", version="1.0.0")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
