/**
 * Incident Management Hooks
 * React Query hooks for incident reporting and management
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api/client";

// Types
export type IncidentCategory = 'security' | 'logistics' | 'violence' | 'fraud' | 'technical' | 'other';
export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'reported' | 'investigating' | 'escalated' | 'resolved' | 'closed';

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  lga_id: string;
  lga_name?: string;
  ward_id?: string;
  ward_name?: string;
  polling_unit_id?: string;
  polling_unit_name?: string;
  latitude?: number;
  longitude?: number;
  reported_by: string;
  reporter_name?: string;
  reporter_phone?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  actions: string[];
  media_urls: string[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface IncidentFilters {
  category?: IncidentCategory;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  lga_id?: string;
  ward_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface IncidentListParams extends IncidentFilters {
  page?: number;
  limit?: number;
}

export interface IncidentListResponse {
  items: Incident[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  by_status: Record<IncidentStatus, number>;
  by_severity: Record<IncidentSeverity, number>;
}

export interface CreateIncidentData {
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  lga_id: string;
  ward_id?: string;
  polling_unit_id?: string;
  latitude?: number;
  longitude?: number;
  media?: File[];
}

export interface UpdateIncidentData {
  title?: string;
  description?: string;
  category?: IncidentCategory;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  assigned_to?: string;
  actions?: string[];
}

export interface IncidentStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  by_category: Record<string, number>;
  by_lga: { lga_id: string; lga_name: string; count: number }[];
  trend: { date: string; count: number }[];
}

// Query keys
export const incidentQueryKeys = {
  incidents: (params?: IncidentListParams) => ["incidents", params],
  incident: (id: string) => ["incidents", id],
  stats: () => ["incidents", "stats"],
  dashboard: () => ["incidents", "dashboard"],
};

// ==================== INCIDENT API ====================

export const incidentsApi = {
  list: (params?: IncidentListParams) =>
    api.get<IncidentListResponse>("/api/incidents", { params }),

  get: (id: string) =>
    api.get<Incident>(`/api/incidents/${id}`),

  create: (data: CreateIncidentData) =>
    api.post<Incident>("/api/incidents", data),

  update: (id: string, data: UpdateIncidentData) =>
    api.put<Incident>(`/api/incidents/${id}`, data),

  updateStatus: (id: string, status: IncidentStatus) =>
    api.patch<Incident>(`/api/incidents/${id}/status`, { status }),

  assign: (id: string, userId: string) =>
    api.post<Incident>(`/api/incidents/${id}/assign`, { user_id: userId }),

  addAction: (id: string, action: string) =>
    api.post<Incident>(`/api/incidents/${id}/actions`, { action }),

  delete: (id: string) =>
    api.delete<void>(`/api/incidents/${id}`),

  getStats: () =>
    api.get<IncidentStats>("/api/incidents/stats"),

  getMapData: () =>
    api.get<{ incidents: Incident[]; heatmap: { lat: number; lng: number; intensity: number }[] }>("/api/incidents/map"),

  export: (format: 'csv' | 'pdf' = 'csv') =>
    api.get<Blob>(`/api/incidents/export?format=${format}`, { responseType: 'blob' }),
};

// ==================== HOOKS ====================

/**
 * Get incidents list
 */
export function useIncidents(params?: IncidentListParams) {
  return useQuery({
    queryKey: incidentQueryKeys.incidents(params),
    queryFn: async () => {
      const response = await incidentsApi.list(params);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });
}

/**
 * Get single incident
 */
export function useIncident(id: string) {
  return useQuery({
    queryKey: incidentQueryKeys.incident(id),
    queryFn: async () => {
      const response = await incidentsApi.get(id);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Create incident mutation
 */
export function useCreateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: incidentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incidents", "stats"] });
    },
  });
}

/**
 * Update incident mutation
 */
export function useUpdateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIncidentData }) =>
      incidentsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: incidentQueryKeys.incident(id) });
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });
}

/**
 * Update incident status mutation
 */
export function useUpdateIncidentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: IncidentStatus }) =>
      incidentsApi.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: incidentQueryKeys.incident(id) });
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incidents", "stats"] });
    },
  });
}

/**
 * Assign incident mutation
 */
export function useAssignIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      incidentsApi.assign(id, userId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: incidentQueryKeys.incident(id) });
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });
}

/**
 * Add action to incident
 */
export function useAddIncidentAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      incidentsApi.addAction(id, action),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: incidentQueryKeys.incident(id) });
    },
  });
}

/**
 * Delete incident mutation
 */
export function useDeleteIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: incidentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incidents", "stats"] });
    },
  });
}

/**
 * Get incident stats
 */
export function useIncidentStats() {
  return useQuery({
    queryKey: incidentQueryKeys.stats(),
    queryFn: async () => {
      const response = await incidentsApi.getStats();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get incident map data
 */
export function useIncidentMapData() {
  return useQuery({
    queryKey: ["incidents", "map"],
    queryFn: async () => {
      const response = await incidentsApi.getMapData();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });
}
