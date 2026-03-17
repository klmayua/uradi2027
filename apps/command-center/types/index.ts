// User Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  tenant_id: string;
  assigned_lga?: string;
  avatar_url?: string;
  phone?: string;
  active: boolean;
  last_seen_at?: string;
  created_at: string;
}

export type UserRole =
  | 'admin'
  | 'strategist'
  | 'coordinator'
  | 'analyst'
  | 'field_agent'
  | 'monitor';

// Tenant Types
export interface Tenant {
  id: string;
  name: string;
  state: string;
  lga_count: number;
  candidate_name: string;
  candidate_party: string;
  config: Record<string, unknown>;
  created_at: string;
}

// LGA Types
export interface LGA {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  geojson?: GeoJSON.Polygon;
  population?: number;
  registered_voters?: number;
  polling_units?: number;
  ward_count: number;
  meta?: Record<string, unknown>;
  created_at: string;
}

// Ward Types
export interface Ward {
  id: string;
  lga_id: string;
  tenant_id: string;
  name: string;
  code?: string;
  polling_units?: number;
  population_estimate?: number;
  geojson?: GeoJSON.Polygon;
  created_at: string;
}

// Voter Types
export interface Voter {
  id: string;
  tenant_id: string;
  full_name: string;
  phone?: string;
  phone_secondary?: string;
  whatsapp_id?: string;
  ward_id?: string;
  lga_id?: string;
  gender?: 'male' | 'female' | 'other';
  age_range?: '18-25' | '26-35' | '36-45' | '46-55' | '56+';
  occupation?: string;
  education_level?: string;
  language_preference?: 'ha' | 'ff' | 'en';
  contact_preference?: 'ussd' | 'whatsapp' | 'sms' | 'door_to_door';
  sentiment_score?: number;
  persuadability_score?: number;
  party_leaning?: 'apc' | 'pdp' | 'nnpp' | 'adc' | 'undecided' | 'unknown';
  issues?: string[];
  last_contacted_at?: string;
  contact_count: number;
  tags?: string[];
  source?: 'ussd' | 'whatsapp' | 'canvass' | 'rally' | 'referral';
  notes?: string;
  created_at: string;
  updated_at: string;

  // Joined fields
  ward?: Ward;
  lga?: LGA;
}

// Sentiment Types
export interface SentimentEntry {
  id: string;
  tenant_id: string;
  voter_id?: string;
  ward_id?: string;
  lga_id?: string;
  source: 'ussd' | 'whatsapp' | 'sms' | 'canvass' | 'social';
  raw_text: string;
  language: 'ha' | 'ff' | 'en';
  ai_analysis?: {
    sentiment: number;
    category: string;
    key_issues: string[];
    summary_en: string;
  };
  created_at: string;

  // Joined fields
  voter?: Voter;
  ward?: Ward;
  lga?: LGA;
}

// Dashboard Types
export interface DashboardOverview {
  total_voter_contacts: number;
  avg_sentiment: number;
  lgas_won_projected: number;
  total_lgas: number;
  days_to_election: number;
  sentiment_trend: { date: string; sentiment: number }[];
  top_issues: { name: string; count: number }[];
  party_leaning: { party: string; percentage: number }[];
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface ApiError {
  detail: string;
  status_code: number;
}

// Filter Types
export interface VoterFilters {
  search?: string;
  lga_id?: string;
  ward_id?: string;
  sentiment_min?: number;
  sentiment_max?: number;
  party_leaning?: string[];
  source?: string[];
  persuadability_min?: number;
  persuadability_max?: number;
  page?: number;
  page_size?: number;
}

export interface SentimentFilters {
  lga_id?: string;
  ward_id?: string;
  category?: string;
  source?: string;
  date_from?: string;
  date_to?: string;
  score_min?: number;
  score_max?: number;
}
