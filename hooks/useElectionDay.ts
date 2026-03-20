/**
 * Election Day Hooks
 * React Query hooks for election day operations
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api/client";

// Types
export interface PollingUnit {
  id: string;
  code: string;
  name: string;
  lga_id: string;
  lga_name: string;
  ward_id: string;
  ward_name: string;
  registered_voters: number;
  accredited_voters?: number;
  votes_cast?: number;
  latitude?: number;
  longitude?: number;
}

export interface VoteTally {
  id: string;
  polling_unit_id: string;
  polling_unit_code: string;
  registered_voters: number;
  accredited_voters: number;
  votes_cast: number;
  rejected_votes: number;
  party_results: {
    party: string;
    votes: number;
  }[];
  submitted_by: string;
  submitted_at: string;
  verified_by?: string;
  verified_at?: string;
  status: 'pending' | 'verified' | 'disputed';
  evidence_urls?: string[];
}

export interface Monitor {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  assigned_polling_units: string[];
  last_checkin?: string;
  last_location?: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'inactive' | 'offline';
}

export interface MonitorCheckin {
  id: string;
  monitor_id: string;
  polling_unit_id: string;
  latitude: number;
  longitude: number;
  photo_url?: string;
  notes?: string;
  timestamp: string;
}

export interface ElectionResult {
  total_polling_units: number;
  reporting: number;
  total_votes: number;
  party_totals: {
    party: string;
    votes: number;
    percentage: number;
  }[];
  by_lga: {
    lga_id: string;
    lga_name: string;
    total: number;
    reporting: number;
  }[];
}

export interface ResultEntryData {
  polling_unit_id: string;
  accredited_voters: number;
  votes_cast: number;
  rejected_votes: number;
  party_results: {
    party: string;
    votes: number;
  }[];
  evidence?: File[];
}

// Query keys
export const electionQueryKeys = {
  results: () => ["election", "results"],
  resultDetail: (id: string) => ["election", "results", id],
  monitors: () => ["election", "monitors"],
  monitor: (id: string) => ["election", "monitors", id],
  pollingUnits: () => ["election", "polling-units"],
  summary: () => ["election", "summary"],
};

// ==================== ELECTION DAY API ====================

export const electionDayApi = {
  // Results
  getResults: () =>
    api.get<ElectionResult>("/api/election-day/results"),

  getResultDetail: (id: string) =>
    api.get<VoteTally>(`/api/election-day/results/${id}`),

  submitResult: (data: ResultEntryData) =>
    api.post<VoteTally>("/api/election-day/results", data),

  verifyResult: (id: string) =>
    api.post<VoteTally>(`/api/election-day/results/${id}/verify`),

  // Monitors
  getMonitors: () =>
    api.get<Monitor[]>("/api/election-day/monitors"),

  getMonitor: (id: string) =>
    api.get<Monitor>(`/api/election-day/monitors/${id}`),

  getMonitorLocations: () =>
    api.get<{ monitors: Monitor[]; locations: { lat: number; lng: number; name: string }[] }>("/api/election-day/monitors/locations"),

  sendBroadcast: (message: string, monitorIds?: string[]) =>
    api.post<void>("/api/election-day/monitors/broadcast", { message, monitor_ids: monitorIds }),

  // Polling Units
  getPollingUnits: () =>
    api.get<PollingUnit[]>("/api/election-day/polling-units"),

  getPollingUnit: (id: string) =>
    api.get<PollingUnit>(`/api/election-day/polling-units/${id}`),

  // Summary
  getSummary: () =>
    api.get<{
      total_polling_units: number;
      total_monitors: number;
      reporting_percentage: number;
      incidents_reported: number;
    }>("/api/election-day/summary"),

  exportResults: (format: 'csv' | 'pdf' | 'inec' = 'csv') =>
    api.get<Blob>(`/api/election-day/export?format=${format}`, { responseType: 'blob' }),
};

// ==================== HOOKS ====================

/**
 * Get election results
 */
export function useElectionResults() {
  return useQuery({
    queryKey: electionQueryKeys.results(),
    queryFn: async () => {
      const response = await electionDayApi.getResults();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds on election day
  });
}

/**
 * Get monitors list
 */
export function useMonitors() {
  return useQuery({
    queryKey: electionQueryKeys.monitors(),
    queryFn: async () => {
      const response = await electionDayApi.getMonitors();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });
}

/**
 * Get monitor locations
 */
export function useMonitorLocations() {
  return useQuery({
    queryKey: ["election", "monitors", "locations"],
    queryFn: async () => {
      const response = await electionDayApi.getMonitorLocations();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });
}

/**
 * Submit result mutation
 */
export function useSubmitResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: electionDayApi.submitResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["election", "results"] });
      queryClient.invalidateQueries({ queryKey: ["election", "summary"] });
    },
  });
}

/**
 * Verify result mutation
 */
export function useVerifyResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: electionDayApi.verifyResult,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["election", "results"] });
    },
  });
}

/**
 * Send broadcast mutation
 */
export function useSendBroadcast() {
  return useMutation({
    mutationFn: ({ message, monitorIds }: { message: string; monitorIds?: string[] }) =>
      electionDayApi.sendBroadcast(message, monitorIds),
  });
}

/**
 * Get polling units
 */
export function usePollingUnits() {
  return useQuery({
    queryKey: electionQueryKeys.pollingUnits(),
    queryFn: async () => {
      const response = await electionDayApi.getPollingUnits();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });
}

/**
 * Get election summary
 */
export function useElectionSummary() {
  return useQuery({
    queryKey: electionQueryKeys.summary(),
    queryFn: async () => {
      const response = await electionDayApi.getSummary();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    refetchInterval: 30000,
  });
}
