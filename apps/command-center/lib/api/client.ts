/**
 * API Client Configuration
 * Base configuration for all API requests
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Add auth token if available
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.detail || `HTTP error! status: ${response.status}`,
      };
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return { success: true, data: undefined as T };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// HTTP method helpers
export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body: unknown) =>
    fetchApi<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  put: <T>(endpoint: string, body: unknown) =>
    fetchApi<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  patch: <T>(endpoint: string, body: unknown) =>
    fetchApi<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  delete: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: "DELETE" }),
};
