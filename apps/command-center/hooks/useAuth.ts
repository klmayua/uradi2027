/**
 * Authentication Hooks
 * React Query hooks for auth operations
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api/client";

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    tenant_id: string;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  tenant_id: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  tenant_id: string;
  assigned_lga?: string;
  active: boolean;
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
}

// Query keys
export const authQueryKeys = {
  user: ["auth", "user"],
  users: (tenantId?: string) => ["auth", "users", tenantId],
};

// ==================== AUTH API ====================

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<LoginResponse>("/auth/login", credentials),

  logout: () => api.post<void>("/auth/logout", {}),

  me: () => api.get<User>("/auth/me"),

  register: (data: RegisterData) =>
    api.post<User>("/users/", data),

  forgotPassword: (data: PasswordResetData) =>
    api.post<void>("/auth/forgot-password", data),

  resetPassword: (token: string, newPassword: string) =>
    api.post<void>("/auth/reset-password", { token, new_password: newPassword }),

  changePassword: (data: PasswordChangeData) =>
    api.post<void>("/auth/change-password", data),

  refreshToken: (refreshToken: string) =>
    api.post<{ access_token: string }>("/auth/refresh", { refresh_token: refreshToken }),
};

// ==================== HOOKS ====================

/**
 * Login mutation
 */
export function useLogin() {
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (data.success && data.data) {
        // Store tokens
        localStorage.setItem("token", data.data.access_token);
        if (data.data.refresh_token) {
          localStorage.setItem("refresh_token", data.data.refresh_token);
        }
        if (data.data.user) {
          localStorage.setItem("user", JSON.stringify(data.data.user));
        }
      }
    },
  });
}

/**
 * Logout mutation
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await authApi.logout();
      // Clear local storage regardless of API response
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      return response;
    },
    onSuccess: () => {
      // Clear all cached queries
      queryClient.clear();
    },
  });
}

/**
 * Get current user query
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authQueryKeys.user,
    queryFn: async () => {
      const response = await authApi.me();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    // Only run if we have a token
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });
}

/**
 * Register mutation
 */
export function useRegister() {
  return useMutation({
    mutationFn: authApi.register,
  });
}

/**
 * Forgot password mutation
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  });
}

/**
 * Reset password mutation (with token)
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authApi.resetPassword(token, newPassword),
  });
}

/**
 * Change password mutation
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: authApi.changePassword,
  });
}

// ==================== UTILS ====================

/**
 * Get stored token
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/**
 * Get stored user
 */
export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const userJson = localStorage.getItem("user");
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Check if user has specific role
 */
export function hasRole(role: string | string[]): boolean {
  const user = getStoredUser();
  if (!user) return false;
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  return user.role === role;
}

/**
 * Logout helper (can be used outside React components)
 */
export function logout(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
}
