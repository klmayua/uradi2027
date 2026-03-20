/**
 * Election Day Hooks
 * React Query hooks for election day operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

// Types
interface ElectionResult {
  id: string;
  polling_unit_id: string;
  polling_unit_name: string;
  polling_unit_code: string;
  lga_id: string;
  lga_name: string;
  votes_cast: number;
  valid_votes: number;
  rejected_votes: number;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface PollingUnit {
  id: string;
  name: string;
  code: string;
  lga_id: string;
  lga_name: string;
  ward_id: string;
  ward_name: string;
  registered_voters: number;
  status: string;
}

interface ElectionMonitor {
  id: string;
  name: string;
  phone: string;
  email: string;
  lga_id: string;
  lga_name: string;
  status: 'active' | 'inactive';
  last_seen: string;
}

interface ElectionDayDashboard {
  total_votes_cast: number;
  polling_units_reporting: number;
  total_polling_units: number;
  active_monitors: number;
  open_incidents: number;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Query keys
export const electionDayKeys = {
  all: ['election-day'] as const,
  dashboard: () => [...electionDayKeys.all, 'dashboard'] as const,
  results: (params?: Record<string, any>) =>
    [...electionDayKeys.all, 'results', params] as const,
  pollingUnits: (params?: Record<string, any>) =>
    [...electionDayKeys.all, 'polling-units', params] as const,
  monitors: (params?: Record<string, any>) =>
    [...electionDayKeys.all, 'monitors', params] as const,
};

// Dashboard
export function useElectionDayDashboard() {
  return useQuery({
    queryKey: electionDayKeys.dashboard(),
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: ElectionDayDashboard }>('/election-day/dashboard');
      if (!response.success) throw new Error('Failed to fetch dashboard');
      return response;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Results
export function useElectionResults(params?: {
  page?: number;
  limit?: number;
  lga_id?: string;
  polling_unit_id?: string;
}) {
  return useQuery({
    queryKey: electionDayKeys.results(params),
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: PaginatedResponse<ElectionResult>;
      }>('/election-day/results', { params });
      if (!response.success) throw new Error('Failed to fetch results');
      return response;
    },
  });
}

// Create result
export function useCreateElectionResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      polling_unit_id: string;
      votes_cast: number;
      valid_votes: number;
      rejected_votes: number;
    }) => {
      const response = await api.post<{ success: boolean; data: ElectionResult }>('/election-day/results', data);
      if (!response.success) throw new Error('Failed to create result');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: electionDayKeys.all });
    },
  });
}

// Polling Units
export function usePollingUnits(params?: {
  page?: number;
  limit?: number;
  lga_id?: string;
  ward_id?: string;
}) {
  return useQuery({
    queryKey: electionDayKeys.pollingUnits(params),
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: PaginatedResponse<PollingUnit>;
      }>('/election-day/polling-units', { params });
      if (!response.success) throw new Error('Failed to fetch polling units');
      return response;
    },
  });
}

// Monitors
export function useElectionMonitors(params?: {
  page?: number;
  limit?: number;
  lga_id?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: electionDayKeys.monitors(params),
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: PaginatedResponse<ElectionMonitor>;
      }>('/election-day/monitors', { params });
      if (!response.success) throw new Error('Failed to fetch monitors');
      return response;
    },
  });
}

// Update monitor status
export function useUpdateMonitorStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      monitorId,
      status,
    }: {
      monitorId: string;
      status: 'active' | 'inactive';
    }) => {
      const response = await api.patch<{ success: boolean; data: ElectionMonitor }>(`/election-day/monitors/${monitorId}/status`, { status });
      if (!response.success) throw new Error('Failed to update monitor');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: electionDayKeys.monitors() });
    },
  });
}

// Real-time results subscription (WebSocket)
export function useRealtimeResults() {
  const queryClient = useQueryClient();

  return {
    subscribe: () => {
      // This would connect to WebSocket in a real implementation
      console.log('Subscribed to real-time results');
    },
    unsubscribe: () => {
      console.log('Unsubscribed from real-time results');
    },
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: electionDayKeys.results() });
    },
  };
}
