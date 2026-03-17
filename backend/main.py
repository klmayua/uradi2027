from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import os

from services.websocket import ws_manager, election_ws

# Import routers
from auth.routes import router as auth_router
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
from api.email import router as email_router
from api.payments import router as payments_router
from api.public import router as public_router

app = FastAPI(
    title="URADI-360 API",
    description="Fully Managed Multi-Tenant Political Intelligence Platform",
    version="1.0.0"
)

# Add CORS middleware
origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
if origins and origins[0]:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include routers
app.include_router(auth_router)
app.include_router(tenants_router)
app.include_router(users_router)
app.include_router(political_actors_router)
app.include_router(scenarios_router)
app.include_router(coalition_router)
app.include_router(scorecards_router)
app.include_router(content_router)
app.include_router(budget_router)
app.include_router(intelligence_router)
app.include_router(targeting_router)
app.include_router(field_app_router)
app.include_router(collection_router)
app.include_router(canvassing_router)
app.include_router(incidents_router)
app.include_router(election_day_router)
app.include_router(sync_router)
app.include_router(ai_agents_router)
app.include_router(governance_router)
app.include_router(rapid_response_router)
app.include_router(polls_router)
app.include_router(email_router)
app.include_router(payments_router)
app.include_router(public_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to URADI-360 API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}


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
def websocket_status():
    """Get WebSocket connection statistics."""
    return {
        "live_results_connections": ws_manager.get_connection_count("live_results"),
        "incident_connections": ws_manager.get_connection_count("incident_alerts"),
        "monitor_connections": ws_manager.get_connection_count("monitor_updates"),
        "public_connections": ws_manager.get_connection_count("public_updates")
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)