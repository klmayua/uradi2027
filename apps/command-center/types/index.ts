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

// ==================== OSINT Types ====================

export type OSINTSourceType = 'news' | 'social' | 'government' | 'traditional' | 'custom';

export interface OSINTSource {
  id: string;
  tenant_id: string;
  name: string;
  source_type: OSINTSourceType;
  source_url?: string;
  api_endpoint?: string;
  config: Record<string, unknown>;
  fetch_interval_minutes: number;
  last_fetch_at?: string;
  last_fetch_status: 'pending' | 'success' | 'failed';
  last_error?: string;
  is_active: boolean;
  priority: number;
  language_filter: string[];
  created_at: string;
  updated_at: string;
}

export type SentimentLabel = 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
export type UrgencyLabel = 'low' | 'medium' | 'high' | 'critical';
export type StanceLabel = 'opposing' | 'neutral' | 'supporting' | 'mixed';

export interface OSINTMention {
  id: string;
  tenant_id: string;
  source_id: string;
  external_id?: string;
  content_hash: string;
  title?: string;
  content?: string;
  content_summary?: string;
  url?: string;
  author?: string;
  author_handle?: string;
  published_at: string;
  collected_at: string;
  language: string;
  sentiment_score?: number;
  sentiment_label?: SentimentLabel;
  urgency_score?: number;
  urgency_label?: UrgencyLabel;
  stance_towards_candidate?: StanceLabel;
  topics: string[];
  entities_mentioned: Array<{
    name: string;
    type: string;
    confidence: number;
  }>;
  lga_mentioned: string[];
  engagement_metrics?: {
    likes?: number;
    shares?: number;
    comments?: number;
    total_engagement?: number;
  };
  ai_processed: boolean;
  ai_processed_at?: string;
  is_duplicate: boolean;
  status: 'pending' | 'processed' | 'archived' | 'flagged';
  flag_reason?: string;
  // Joined fields
  source?: OSINTSource;
}

export type AlertType = 'sentiment_crash' | 'volume_spike' | 'crisis_detected' | 'narrative_shift' | 'security_incident';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'open' | 'acknowledged' | 'resolved' | 'dismissed';

export interface OSINTAlert {
  id: string;
  tenant_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  description?: string;
  triggered_by_mention_ids: string[];
  affected_lgas: string[];
  metrics_snapshot: Record<string, unknown>;
  recommended_actions: string[];
  status: AlertStatus;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  notification_sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NarrativeCluster {
  id: string;
  tenant_id: string;
  cluster_label: string;
  narrative_title?: string;
  narrative_summary?: string;
  key_themes: string[];
  sentiment_trend: 'improving' | 'stable' | 'declining';
  mention_count: number;
  first_mention_at?: string;
  last_mention_at?: string;
  affected_lgas: string[];
  representative_mention_ids: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyBrief {
  id: string;
  tenant_id: string;
  brief_date: string;
  period_start: string;
  period_end: string;
  total_mentions: number;
  unique_sources: number;
  avg_sentiment?: number;
  sentiment_change?: number;
  headline_summary?: string;
  key_developments: Array<{
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  top_narratives: Array<{
    title: string;
    mention_count: number;
    sentiment_trend: string;
  }>;
  emerging_threats: string[];
  opposition_activity: {
    mention_count: number;
    avg_sentiment: number;
    top_topics: string[];
  };
  media_coverage_analysis: Record<string, unknown>;
  top_performing_content: Array<{
    title?: string;
    content_preview?: string;
    engagement: Record<string, number>;
    sentiment: string;
  }>;
  influencer_mentions: Array<{
    name: string;
    mention_count: number;
  }>;
  strategic_recommendations: string[];
  recommended_actions: string[];
  status: 'draft' | 'generating' | 'ready' | 'sent';
  generated_by: 'ai' | 'manual' | 'hybrid';
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OSINTDashboardMetrics {
  mentions_24h: number;
  avg_sentiment_24h: number;
  active_alerts: number;
  active_sources: number;
  generated_at: string;
}

export interface MentionFilters {
  source_id?: string;
  sentiment?: SentimentLabel;
  urgency?: UrgencyLabel;
  stance?: StanceLabel;
  topic?: string;
  lga?: string;
  start_date?: string;
  end_date?: string;
  is_duplicate?: boolean;
  page?: number;
  limit?: number;
}

export interface AlertFilters {
  status?: AlertStatus;
  severity?: AlertSeverity;
  alert_type?: AlertType;
  page?: number;
  limit?: number;
}
