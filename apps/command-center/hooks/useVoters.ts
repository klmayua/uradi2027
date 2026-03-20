/**
 * Voter Management Hooks
 * React Query hooks for voter CRUD operations
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api/client";

// Types
export interface Voter {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
  lga_id: string;
  lga_name?: string;
  ward_id: string;
  ward_name?: string;
  polling_unit?: string;
  gender?: 'male' | 'female' | 'other';
  age_range?: string;
  occupation?: string;
  language_pref?: string;
  party_leaning?: string;
  sentiment_score: number;
  persuadability: number;
  contact_count: number;
  last_contacted?: string;
  source?: string;
  tags: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VoterFilters {
  lga_id?: string;
  ward_id?: string;
  gender?: string;
  age_range?: string;
  party_leaning?: string;
  sentiment_min?: number;
  sentiment_max?: number;
  tags?: string[];
  search?: string;
}

export interface VoterListParams extends VoterFilters {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface VoterListResponse {
  items: Voter[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CreateVoterData {
  full_name: string;
  phone?: string;
  email?: string;
  lga_id: string;
  ward_id: string;
  polling_unit?: string;
  gender?: 'male' | 'female' | 'other';
  age_range?: string;
  occupation?: string;
  language_pref?: string;
  party_leaning?: string;
  sentiment_score?: number;
  tags?: string[];
  notes?: string;
}

export interface UpdateVoterData extends Partial<CreateVoterData> {}

export interface SentimentEntry {
  id: string;
  voter_id: string;
  score: number;
  category?: string;
  notes?: string;
  source: string;
  created_at: string;
}

// Query keys
export const voterQueryKeys = {
  voters: (params?: VoterListParams) => ["voters", params],
  voter: (id: string) => ["voters", id],
  sentiment: (voterId: string) => ["voters", voterId, "sentiment"],
  stats: () => ["voters", "stats"],
  dashboard: () => ["voters", "dashboard"],
};

// ==================== VOTER API ====================

export const votersApi = {
  list: (params?: VoterListParams) =>
    api.get<VoterListResponse>("/api/voters", { params }),

  get: (id: string) =>
    api.get<Voter>(`/api/voters/${id}`),

  create: (data: CreateVoterData) =>
    api.post<Voter>("/api/voters", data),

  update: (id: string, data: UpdateVoterData) =>
    api.put<Voter>(`/api/voters/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`/api/voters/${id}`),

  import: (file: File, lgaId?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (lgaId) formData.append("lga_id", lgaId);
    return api.post<{ imported: number; errors: number }>("/api/voters/import", formData);
  },

  export: (format: 'csv' | 'excel' = 'csv') =>
    api.get<Blob>(`/api/voters/export?format=${format}`, { responseType: 'blob' }),

  addSentiment: (voterId: string, data: { score: number; category?: string; notes?: string }) =>
    api.post<SentimentEntry>(`/api/voters/${voterId}/sentiment`, data),

  getSentimentHistory: (voterId: string) =>
    api.get<SentimentEntry[]>(`/api/voters/${voterId}/sentiment`),

  getStats: () =>
    api.get<{
      total: number;
      by_lga: { lga_id: string; lga_name: string; count: number }[];
      by_sentiment: { range: string; count: number }[];
      by_party: { party: string; count: number }[];
    }>("/api/voters/stats"),

  getDashboard: () =>
    api.get<{
      total_voters: number;
      new_this_week: number;
      avg_sentiment: number;
      contact_rate: number;
    }>("/api/dashboard/stats"),

  bulkTag: (voterIds: string[], tags: string[]) =>
    api.post<void>("/api/voters/bulk/tag", { voter_ids: voterIds, tags }),

  bulkUpdateSentiment: (voterIds: string[], sentiment: number) =>
    api.post<void>("/api/voters/bulk/sentiment", { voter_ids: voterIds, sentiment_score: sentiment }),
};

// ==================== HOOKS ====================

/**
 * Get voters list with pagination and filters
 */
export function useVoters(params?: VoterListParams) {
  return useQuery({
    queryKey: voterQueryKeys.voters(params),
    queryFn: async () => {
      const response = await votersApi.list(params);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });
}

/**
 * Get single voter
 */
export function useVoter(id: string) {
  return useQuery({
    queryKey: voterQueryKeys.voter(id),
    queryFn: async () => {
      const response = await votersApi.get(id);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Create voter mutation
 */
export function useCreateVoter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: votersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voters"] });
      queryClient.invalidateQueries({ queryKey: ["voters", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["voters", "dashboard"] });
    },
  });
}

/**
 * Update voter mutation
 */
export function useUpdateVoter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVoterData }) =>
      votersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: voterQueryKeys.voter(id) });
      queryClient.invalidateQueries({ queryKey: ["voters"] });
    },
  });
}

/**
 * Delete voter mutation
 */
export function useDeleteVoter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: votersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voters"] });
      queryClient.invalidateQueries({ queryKey: ["voters", "stats"] });
    },
  });
}

/**
 * Import voters mutation
 */
export function useImportVoters() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, lgaId }: { file: File; lgaId?: string }) =>
      votersApi.import(file, lgaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voters"] });
      queryClient.invalidateQueries({ queryKey: ["voters", "stats"] });
    },
  });
}

/**
 * Add sentiment mutation
 */
export function useAddSentiment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ voterId, data }: { voterId: string; data: { score: number; category?: string; notes?: string } }) =>
      votersApi.addSentiment(voterId, data),
    onSuccess: (_, { voterId }) => {
      queryClient.invalidateQueries({ queryKey: voterQueryKeys.voter(voterId) });
      queryClient.invalidateQueries({ queryKey: voterQueryKeys.sentiment(voterId) });
    },
  });
}

/**
 * Get voter sentiment history
 */
export function useVoterSentiment(voterId: string) {
  return useQuery({
    queryKey: voterQueryKeys.sentiment(voterId),
    queryFn: async () => {
      const response = await votersApi.getSentimentHistory(voterId);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    enabled: !!voterId,
  });
}

/**
 * Get voter stats
 */
export function useVoterStats() {
  return useQuery({
    queryKey: voterQueryKeys.stats(),
    queryFn: async () => {
      const response = await votersApi.getStats();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });
}

/**
 * Get dashboard stats
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: voterQueryKeys.dashboard(),
    queryFn: async () => {
      const response = await votersApi.getDashboard();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Bulk tag voters mutation
 */
export function useBulkTagVoters() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ voterIds, tags }: { voterIds: string[]; tags: string[] }) =>
      votersApi.bulkTag(voterIds, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voters"] });
    },
  });
}
