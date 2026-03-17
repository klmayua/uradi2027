/**
 * Public API Service
 * Handles all public-facing API calls for the candidate website
 */

import { api } from "./client";

// ==================== TYPES ====================

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface NewsletterSignupData {
  email: string;
  name?: string;
  location?: string;
}

export interface VolunteerSignupData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  location: string;
  ward?: string;
  role: string;
  availability: string;
  experience?: string;
  message?: string;
}

export interface DonationData {
  amount: number;
  currency?: string;
  name: string;
  email: string;
  phone?: string;
  show_name?: boolean;
  is_recurring?: boolean;
  payment_method: "card" | "bank" | "ussd" | "intl";
}

export interface RSVPData {
  event_id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface HostEventData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  event_type: string;
  proposed_date: string;
  location: string;
  expected_attendees: string;
  additional_info?: string;
}

export interface ChatMessageData {
  message: string;
  session_id?: string;
}

export interface PublicStats {
  supporters: number;
  days_to_election: number;
  lgas_covered: number;
  projects_completed: number;
  volunteers: number;
  events_hosted: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  published_at: string;
  image_url?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
}

export interface Promise {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "completed" | "in_progress" | "not_started";
  created_at: string;
}

export interface ScorecardOverview {
  total_promises: number;
  completed: number;
  in_progress: number;
  not_started: number;
  completion_rate: number;
  last_updated: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface FAQCategory {
  [category: string]: FAQ[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  image_url?: string;
  active: boolean;
}

export interface Office {
  id: string;
  name: string;
  type: string;
  address: string;
  phone?: string;
  email?: string;
  active: boolean;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  file_url: string;
  filename: string;
  download_count: number;
  created_at: string;
}

// ==================== API FUNCTIONS ====================

export const publicApi = {
  // Stats
  getStats: () => api.get<PublicStats>("/api/public/stats"),

  // News
  getNews: (params?: { category?: string; search?: string; limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    return api.get<{ items: NewsArticle[]; total: number; limit: number; offset: number }>(`/api/public/news?${queryParams}`);
  },

  getNewsArticle: (id: string) => api.get<NewsArticle>(`/api/public/news/${id}`),

  // Events
  getEvents: (params?: { upcoming?: boolean; category?: string; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.upcoming !== undefined) queryParams.append("upcoming", params.upcoming.toString());
    if (params?.category) queryParams.append("category", params.category);
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    return api.get<{ items: Event[] }>(`/api/public/events?${queryParams}`);
  },

  rsvpToEvent: (eventId: string, data: RSVPData) =>
    api.post<{ success: boolean; message: string }>(`/api/public/events/${eventId}/rsvp`, data),

  hostEvent: (data: HostEventData) =>
    api.post<{ success: boolean; message: string }>("/api/public/host-event", data),

  // Scorecard / Promises
  getScorecard: () => api.get<ScorecardOverview>("/api/public/scorecard"),

  getPromises: (params?: { category?: string; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.status) queryParams.append("status", params.status);

    return api.get<{ items: Promise[] }>(`/api/public/promises?${queryParams}`);
  },

  getPromise: (id: string) => api.get<Promise>(`/api/public/promises/${id}`),

  // Policies / Biography
  getPolicies: () => api.get<{ items: any[] }>("/api/public/policies"),
  getBiography: () => api.get<any>("/api/public/biography"),

  // Forms
  submitContact: (data: ContactFormData) =>
    api.post<{ success: boolean; message: string }>("/api/public/contact", data),

  signupNewsletter: (data: NewsletterSignupData) =>
    api.post<{ success: boolean; message: string }>("/api/public/newsletter", data),

  signupVolunteer: (data: VolunteerSignupData) =>
    api.post<{ success: boolean; message: string }>("/api/public/volunteers", data),

  createDonation: (data: DonationData) =>
    api.post<{ success: boolean; donation_id: string; message: string; payment_url: string }>("/api/public/donations", data),

  // Transparency
  getTransparencyStats: () => api.get<{
    total_raised: number;
    total_donors: number;
    avg_donation: number;
    spent_on_programs: string;
    recent_donors: { amount: number; location: string; time: string }[];
  }>("/api/public/transparency"),

  // Resources
  getResources: (category?: string) => {
    const queryParams = category ? `?category=${category}` : "";
    return api.get<{ items: Resource[] }>(`/api/public/resources${queryParams}`);
  },

  downloadResource: (resourceId: string) =>
    api.get<{ success: boolean; download_url: string; filename: string }>(`/api/public/downloads/${resourceId}`),

  // FAQ
  getFAQ: () => api.get<{ categories: FAQCategory }>("/api/public/faq"),

  // Testimonials
  getTestimonials: (limit: number = 10) =>
    api.get<{ items: Testimonial[] }>(`/api/public/testimonials?limit=${limit}`),

  // Offices
  getOffices: () => api.get<{ items: Office[] }>("/api/public/offices"),

  // Chatbot
  sendChatMessage: (data: ChatMessageData) =>
    api.post<{ session_id: string; message: string; suggestions: string[] }>("/api/public/chatbot", data),
};

export default publicApi;
