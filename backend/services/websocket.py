"""
WebSocket Manager for Real-time Updates
Handles live election results, incident alerts, and real-time monitoring
"""

from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict, Set
import json
import asyncio
from datetime import datetime

class ConnectionManager:
    """Manages WebSocket connections for different rooms/channels."""

    def __init__(self):
        # Active connections by room
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # User subscriptions for targeted messages
        self.user_subscriptions: Dict[str, Set[str]] = {}
        # Connection metadata
        self.connection_info: Dict[WebSocket, dict] = {}

    async def connect(self, websocket: WebSocket, room: str = "general"):
        """Accept connection and add to room."""
        await websocket.accept()

        if room not in self.active_connections:
            self.active_connections[room] = []

        self.active_connections[room].append(websocket)
        self.connection_info[websocket] = {
            "room": room,
            "connected_at": datetime.utcnow().isoformat(),
            "client_id": None
        }

    def disconnect(self, websocket: WebSocket):
        """Remove connection from all rooms."""
        room = self.connection_info.get(websocket, {}).get("room", "general")

        if room in self.active_connections:
            if websocket in self.active_connections[room]:
                self.active_connections[room].remove(websocket)

        if websocket in self.connection_info:
            del self.connection_info[websocket]

    async def broadcast(self, message: dict, room: str = "general"):
        """Broadcast message to all connections in a room."""
        if room not in self.active_connections:
            return

        message_json = json.dumps(message)
        disconnected = []

        for connection in self.active_connections[room]:
            try:
                await connection.send_text(message_json)
            except Exception:
                disconnected.append(connection)

        # Clean up disconnected clients
        for conn in disconnected:
            self.disconnect(conn)

    async def broadcast_to_all(self, message: dict):
        """Broadcast to all connected clients across all rooms."""
        for room in self.active_connections:
            await self.broadcast(message, room)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send message to specific client."""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception:
            self.disconnect(websocket)

    def get_connection_count(self, room: str = "general") -> int:
        """Get number of active connections in a room."""
        return len(self.active_connections.get(room, []))


# Global manager instance
manager = ConnectionManager()


class ElectionWebSocketHandler:
    """Handles election-specific WebSocket events."""

    ROOMS = {
        "results": "live_results",
        "incidents": "incident_alerts",
        "monitors": "monitor_updates",
        "turnout": "turnout_data",
        "announcements": "announcements"
    }

    @staticmethod
    async def broadcast_result_update(data: dict):
        """Broadcast new result data."""
        message = {
            "type": "result_update",
            "timestamp": datetime.utcnow().isoformat(),
            "data": data
        }
        await manager.broadcast(message, ElectionWebSocketHandler.ROOMS["results"])

    @staticmethod
    async def broadcast_incident(incident: dict):
        """Broadcast incident alert."""
        message = {
            "type": "incident_alert",
            "timestamp": datetime.utcnow().isoformat(),
            "data": incident
        }
        await manager.broadcast(message, ElectionWebSocketHandler.ROOMS["incidents"])

    @staticmethod
    async def broadcast_turnout_update(data: dict):
        """Broadcast voter turnout update."""
        message = {
            "type": "turnout_update",
            "timestamp": datetime.utcnow().isoformat(),
            "data": data
        }
        await manager.broadcast(message, ElectionWebSocketHandler.ROOMS["turnout"])

    @staticmethod
    async def broadcast_announcement(text: str, priority: str = "normal"):
        """Broadcast announcement to all clients."""
        message = {
            "type": "announcement",
            "timestamp": datetime.utcnow().isoformat(),
            "priority": priority,
            "text": text
        }
        await manager.broadcast_to_all(message)


# Convenience exports
ws_manager = manager
election_ws = ElectionWebSocketHandler()
