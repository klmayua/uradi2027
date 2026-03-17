/**
 * WebSocket Hook for Real-time Updates
 * Handles live election results, incidents, and monitor updates
 */

import { useEffect, useRef, useState, useCallback } from "react";

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

type WebSocketRoom = "live_results" | "incidents" | "monitor" | "public";

interface WebSocketMessage {
  type: string;
  timestamp: string;
  data?: any;
  [key: string]: any;
}

interface UseWebSocketOptions {
  room: WebSocketRoom;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export function useWebSocket({
  room,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  autoReconnect = true,
  reconnectInterval = 5000,
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnect = useRef(true);

  const getWsUrl = (roomName: WebSocketRoom): string => {
    const paths: Record<WebSocketRoom, string> = {
      live_results: "/ws/live-results",
      incidents: "/ws/incidents",
      monitor: "/ws/monitor",
      public: "/ws/public",
    };
    return `${WS_BASE_URL}${paths[roomName]}`;
  };

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(getWsUrl(room));
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        onDisconnect?.();

        if (shouldReconnect.current && autoReconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        onError?.(error);
      };
    } catch (error) {
      console.error("WebSocket connection error:", error);
    }
  }, [room, onMessage, onConnect, onDisconnect, onError, autoReconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
    shouldReconnect.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: string | object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const data = typeof message === "string" ? message : JSON.stringify(message);
      wsRef.current.send(data);
    }
  }, []);

  useEffect(() => {
    shouldReconnect.current = true;
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
  };
}

// ==================== SPECIALIZED HOOKS ====================

/**
 * Hook for live election results
 */
export function useLiveResults(onUpdate?: (data: any) => void) {
  return useWebSocket({
    room: "live_results",
    onMessage: (message) => {
      if (message.type === "result_update") {
        onUpdate?.(message.data);
      }
    },
  });
}

/**
 * Hook for incident alerts
 */
export function useIncidentAlerts(onAlert?: (data: any) => void) {
  return useWebSocket({
    room: "incidents",
    onMessage: (message) => {
      if (message.type === "incident_alert") {
        onAlert?.(message.data);
      }
    },
  });
}

/**
 * Hook for monitoring dashboard
 */
export function useMonitorUpdates(onUpdate?: (data: any) => void) {
  return useWebSocket({
    room: "monitor",
    onMessage: (message) => {
      onUpdate?.(message);
    },
  });
}

/**
 * Hook for public website real-time updates
 */
export function usePublicUpdates(onUpdate?: (data: any) => void) {
  return useWebSocket({
    room: "public",
    onMessage: (message) => {
      onUpdate?.(message);
    },
  });
}
