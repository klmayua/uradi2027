/**
 * React Query Hooks for Public API
 * Provides caching, error handling, and loading states
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { publicApi } from "@/lib/api/public";
import type {
  ContactFormData,
  NewsletterSignupData,
  VolunteerSignupData,
  DonationData,
  RSVPData,
  HostEventData,
  ChatMessageData,
} from "@/lib/api/public";

// Query keys for cache management
export const queryKeys = {
  stats: ["public", "stats"],
  news: (params?: object) => ["public", "news", params],
  newsArticle: (id: string) => ["public", "news", id],
  events: (params?: object) => ["public", "events", params],
  scorecard: ["public", "scorecard"],
  promises: (params?: object) => ["public", "promises", params],
  promise: (id: string) => ["public", "promises", id],
  policies: ["public", "policies"],
  biography: ["public", "biography"],
  transparency: ["public", "transparency"],
  resources: (category?: string) => ["public", "resources", category],
  faq: ["public", "faq"],
  testimonials: (limit?: number) => ["public", "testimonials", limit],
  offices: ["public", "offices"],
};

// ==================== STATS ====================

export function usePublicStats() {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: async () => {
      const response = await publicApi.getStats();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ==================== NEWS ====================

export function useNews(
  params?: { category?: string; search?: string; limit?: number; offset?: number }
) {
  return useQuery({
    queryKey: queryKeys.news(params),
    queryFn: async () => {
      const response = await publicApi.getNews(params);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useNewsArticle(id: string) {
  return useQuery({
    queryKey: queryKeys.newsArticle(id),
    queryFn: async () => {
      const response = await publicApi.getNewsArticle(id);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    enabled: !!id,
  });
}

// ==================== EVENTS ====================

export function useEvents(
  params?: { upcoming?: boolean; category?: string; limit?: number }
) {
  return useQuery({
    queryKey: queryKeys.events(params),
    queryFn: async () => {
      const response = await publicApi.getEvents(params);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useRSVP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, data }: { eventId: string; data: RSVPData }) => {
      const response = await publicApi.rsvpToEvent(eventId, data);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events() });
    },
  });
}

export function useHostEvent() {
  return useMutation({
    mutationFn: async (data: HostEventData) => {
      const response = await publicApi.hostEvent(data);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });
}

// ==================== SCORECARD ====================

export function useScorecard() {
  return useQuery({
    queryKey: queryKeys.scorecard,
    queryFn: async () => {
      const response = await publicApi.getScorecard();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePromises(
  params?: { category?: string; status?: string }
) {
  return useQuery({
    queryKey: queryKeys.promises(params),
    queryFn: async () => {
      const response = await publicApi.getPromises(params);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePromise(id: string) {
  return useQuery({
    queryKey: queryKeys.promise(id),
    queryFn: async () => {
      const response = await publicApi.getPromise(id);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    enabled: !!id,
  });
}

// ==================== POLICIES & BIOGRAPHY ====================

export function usePolicies() {
  return useQuery({
    queryKey: queryKeys.policies,
    queryFn: async () => {
      const response = await publicApi.getPolicies();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useBiography() {
  return useQuery({
    queryKey: queryKeys.biography,
    queryFn: async () => {
      const response = await publicApi.getBiography();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

// ==================== FORMS ====================

export function useContactForm() {
  return useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await publicApi.submitContact(data);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });
}

export function useNewsletterSignup() {
  return useMutation({
    mutationFn: async (data: NewsletterSignupData) => {
      const response = await publicApi.signupNewsletter(data);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });
}

export function useVolunteerSignup() {
  return useMutation({
    mutationFn: async (data: VolunteerSignupData) => {
      const response = await publicApi.signupVolunteer(data);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });
}

export function useCreateDonation() {
  return useMutation({
    mutationFn: async (data: DonationData) => {
      const response = await publicApi.createDonation(data);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });
}

// ==================== TRANSPARENCY ====================

export function useTransparencyStats() {
  return useQuery({
    queryKey: queryKeys.transparency,
    queryFn: async () => {
      const response = await publicApi.getTransparencyStats();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== RESOURCES ====================

export function useResources(category?: string) {
  return useQuery({
    queryKey: queryKeys.resources(category),
    queryFn: async () => {
      const response = await publicApi.getResources(category);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDownloadResource() {
  return useMutation({
    mutationFn: async (resourceId: string) => {
      const response = await publicApi.downloadResource(resourceId);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });
}

// ==================== FAQ & TESTIMONIALS ====================

export function useFAQ() {
  return useQuery({
    queryKey: queryKeys.faq,
    queryFn: async () => {
      const response = await publicApi.getFAQ();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useTestimonials(limit: number = 10) {
  return useQuery({
    queryKey: queryKeys.testimonials(limit),
    queryFn: async () => {
      const response = await publicApi.getTestimonials(limit);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== OFFICES ====================

export function useOffices() {
  return useQuery({
    queryKey: queryKeys.offices,
    queryFn: async () => {
      const response = await publicApi.getOffices();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

// ==================== CHATBOT ====================

export function useChatbot() {
  return useMutation({
    mutationFn: async (data: ChatMessageData) => {
      const response = await publicApi.sendChatMessage(data);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });
}
