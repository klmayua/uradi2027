/**
 * User Management Hooks
 * React Query hooks for user CRUD operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

// Types
export type UserRole =
  | 'superadmin'
  | 'admin'
  | 'strategist'
  | 'coordinator'
  | 'analyst'
  | 'field_agent'
  | 'monitor'
  | 'content_manager'
  | 'finance_manager';

export type UserStatus = 'active' | 'pending' | 'inactive' | 'suspended';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  assigned_lga?: string;
  assigned_ward?: string;
  status: UserStatus;
  last_login?: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  avatar_url?: string;
}

export interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface UserStats {
  total_users: number;
  by_role: Record<string, number>;
  by_status: Record<string, number>;
  active_today: number;
  active_this_week: number;
  pending_invites: number;
}

export interface CreateUserRequest {
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  assigned_lga?: string;
  assigned_ward?: string;
  send_invite?: boolean;
}

export interface UpdateUserRequest {
  full_name?: string;
  phone?: string;
  role?: UserRole;
  assigned_lga?: string;
  assigned_ward?: string;
  status?: UserStatus;
}

export interface UserFilters {
  role?: string;
  status?: string;
  lga?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PermissionCheck {
  resource: string;
  action: string;
  allowed: boolean;
  reason?: string;
}

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: (filters?: UserFilters) => [...userKeys.all, 'list', filters] as const,
  details: (id: string) => [...userKeys.all, 'detail', id] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
  me: () => [...userKeys.all, 'me'] as const,
  permissions: () => [...userKeys.all, 'permissions'] as const,
};

// ==================== API FUNCTIONS ====================

const usersApi = {
  // List users with filters
  list: async (filters?: UserFilters): Promise<UserListResponse> => {
    const response = await apiClient.get('/users', { params: filters });
    return response.data;
  },

  // Get single user
  get: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Get current user
  me: async (): Promise<User> => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  // Create user
  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  // Update user
  update: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response.data;
  },

  // Delete user
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  // Resend invite
  resendInvite: async (id: string): Promise<void> => {
    await apiClient.post(`/users/${id}/resend-invite`);
  },

  // Get stats
  getStats: async (): Promise<UserStats> => {
    const response = await apiClient.get('/users/stats/overview');
    return response.data;
  },

  // Check permission
  checkPermission: async (resource: string, action: string): Promise<PermissionCheck> => {
    const response = await apiClient.post('/users/check-permission', { resource, action });
    return response.data;
  },

  // Get role permissions
  getRolePermissions: async (): Promise<{ roles: any[]; permissions: Record<string, any> }> => {
    const response = await apiClient.get('/users/roles/permissions');
    return response.data;
  },

  // Bulk action
  bulkAction: async (userIds: string[], action: string, value?: string): Promise<{ processed: number; total: number }> => {
    const response = await apiClient.post('/users/bulk-action', { user_ids: userIds, action, value });
    return response.data;
  },
};

// ==================== HOOKS ====================

/**
 * Get users list with filtering
 */
export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: userKeys.lists(filters),
    queryFn: () => usersApi.list(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Get single user
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.details(id),
    queryFn: () => usersApi.get(id),
    enabled: !!id,
  });
}

/**
 * Get current user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: () => usersApi.me(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create user mutation
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

/**
 * Update user mutation
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      usersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.details(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

/**
 * Delete user mutation
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

/**
 * Resend invite mutation
 */
export function useResendInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.resendInvite,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.details(id) });
    },
  });
}

/**
 * Get user stats
 */
export function useUserStats() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => usersApi.getStats(),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Check permission hook
 */
export function useCheckPermission(resource: string, action: string) {
  return useQuery({
    queryKey: [...userKeys.permissions(), resource, action],
    queryFn: () => usersApi.checkPermission(resource, action),
    staleTime: 5 * 60 * 1000, // 5 minutes - permissions don't change often
  });
}

/**
 * Get role permissions
 */
export function useRolePermissions() {
  return useQuery({
    queryKey: userKeys.permissions(),
    queryFn: () => usersApi.getRolePermissions(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Bulk action mutation
 */
export function useBulkUserAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userIds, action, value }: { userIds: string[]; action: string; value?: string }) =>
      usersApi.bulkAction(userIds, action, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

// ==================== UTILITY HOOKS ====================

/**
 * Hook to check if current user can perform an action
 * Returns boolean for easy use in conditional rendering
 */
export function useCan(resource: string, action: string): boolean {
  const { data } = useCheckPermission(resource, action);
  return data?.allowed ?? false;
}

/**
 * Hook to get users by role
 */
export function useUsersByRole(role: UserRole) {
  return useUsers({ role, status: 'active' });
}

/**
 * Hook to get team members (all users except self)
 */
export function useTeamMembers() {
  const { data: currentUser } = useCurrentUser();
  const { data: users } = useUsers({ status: 'active' });

  return {
    ...users,
    items: users?.items.filter((u) => u.id !== currentUser?.id) ?? [],
  };
}

/**
 * Hook to get pending invites
 */
export function usePendingInvites() {
  return useUsers({ status: 'pending' });
}

// Role display names
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  strategist: 'Strategist',
  coordinator: 'Coordinator',
  analyst: 'Analyst',
  field_agent: 'Field Agent',
  monitor: 'Monitor',
  content_manager: 'Content Manager',
  finance_manager: 'Finance Manager',
};

// Role descriptions
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  superadmin: 'Full platform access across all tenants',
  admin: 'Full campaign management and team administration',
  strategist: 'Data analysis and campaign planning',
  coordinator: 'Field operations and agent management',
  analyst: 'Reports and data insights',
  field_agent: 'Ground canvassing and voter registration',
  monitor: 'Election day observation and reporting',
  content_manager: 'Communications and content management',
  finance_manager: 'Budget tracking and financial oversight',
};

// Role colors for UI
export const ROLE_COLORS: Record<UserRole, string> = {
  superadmin: 'bg-rose-500',
  admin: 'bg-amber-500',
  strategist: 'bg-violet-500',
  coordinator: 'bg-blue-500',
  analyst: 'bg-cyan-500',
  field_agent: 'bg-emerald-500',
  monitor: 'bg-teal-500',
  content_manager: 'bg-pink-500',
  finance_manager: 'bg-green-500',
};

// Status display names
export const STATUS_DISPLAY_NAMES: Record<UserStatus, string> = {
  active: 'Active',
  pending: 'Pending Invite',
  inactive: 'Inactive',
  suspended: 'Suspended',
};

// Status colors for UI
export const STATUS_COLORS: Record<UserStatus, string> = {
  active: 'bg-emerald-500',
  pending: 'bg-amber-500',
  inactive: 'bg-slate-500',
  suspended: 'bg-rose-500',
};
