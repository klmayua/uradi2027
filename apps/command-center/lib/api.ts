import { useAuthStore } from '@/stores/authStore';
import { useTenantStore } from '@/stores/tenantStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper to get auth headers
function getHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  const currentTenant = useTenantStore.getState().currentTenant;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (currentTenant) {
    headers['X-Tenant-ID'] = currentTenant.id;
  }

  return headers;
}

// Generic fetch wrapper
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    fetchApi('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => fetchApi('/api/auth/me'),

  refresh: () => fetchApi('/api/auth/refresh'),
};

// Dashboard API
export const dashboardApi = {
  overview: () => fetchApi('/api/dashboard/overview'),
  activity: (limit = 20) => fetchApi(`/api/dashboard/activity?limit=${limit}`),
};

// Voters API
export const votersApi = {
  list: (filters: Record<string, string | number | undefined> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
    return fetchApi(`/api/voters?${params.toString()}`);
  },

  get: (id: string) => fetchApi(`/api/voters/${id}`),

  create: (data: Record<string, unknown>) =>
    fetchApi('/api/voters', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, unknown>) =>
    fetchApi(`/api/voters/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi(`/api/voters/${id}`, {
      method: 'DELETE',
    }),

  import: (formData: FormData) =>
    fetchApi('/api/voters/import', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type for FormData
    }),

  export: (filters: Record<string, string | number | undefined> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
    return fetchApi(`/api/voters/export?${params.toString()}`);
  },
};

// LGAs API
export const lgasApi = {
  list: () => fetchApi('/api/lgas'),
  get: (id: string) => fetchApi(`/api/lgas/${id}`),
  stats: () => fetchApi('/api/lgas/stats'),
};

// Wards API
export const wardsApi = {
  list: (lgaId?: string) => {
    const params = lgaId ? `?lga_id=${lgaId}` : '';
    return fetchApi(`/api/wards${params}`);
  },
  get: (id: string) => fetchApi(`/api/wards/${id}`),
};

// Sentiment API
export const sentimentApi = {
  list: (filters: Record<string, string | number | undefined> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
    return fetchApi(`/api/sentiment?${params.toString()}`);
  },

  aggregate: (type: 'lga' | 'ward' | 'category') =>
    fetchApi(`/api/sentiment/aggregate?type=${type}`),

  trend: (days = 30) => fetchApi(`/api/sentiment/trend?days=${days}`),

  create: (data: Record<string, unknown>) =>
    fetchApi('/api/sentiment', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Political Actors API
export const politicalActorsApi = {
  list: (filters: Record<string, string | number | undefined> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
    return fetchApi(`/api/political-actors?${params.toString()}`);
  },

  get: (id: string) => fetchApi(`/api/political-actors/${id}`),

  network: () => fetchApi('/api/political-actors/network/data'),
};

// Scenarios API
export const scenariosApi = {
  list: () => fetchApi('/api/scenarios'),
  get: (id: string) => fetchApi(`/api/scenarios/${id}`),
  comparison: () => fetchApi('/api/scenarios/comparison/all'),
  projections: () => fetchApi('/api/scenarios/projections/summary'),
};

// Coalition API
export const coalitionApi = {
  list: () => fetchApi('/api/coalition/partners'),
  overview: () => fetchApi('/api/coalition/overview'),
};

// Scorecards API
export const scorecardsApi = {
  list: () => fetchApi('/api/scorecards/entries'),
  get: (id: string) => fetchApi(`/api/scorecards/entries/${id}`),
  byPeriod: (period: string) => fetchApi(`/api/scorecards/by-period/${period}`),
  trends: (sector: string) => fetchApi(`/api/scorecards/trends/${sector}`),
};

// Content API
export const contentApi = {
  list: () => fetchApi('/api/content/items'),
  get: (id: string) => fetchApi(`/api/content/items/${id}`),
  calendar: () => fetchApi('/api/content/calendar'),
};

// Messaging API
export const messagingApi = {
  send: (data: Record<string, unknown>) =>
    fetchApi('/api/content/messaging/send', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  history: () => fetchApi('/api/content/messaging/history'),
  stats: () => fetchApi('/api/content/messaging/stats'),
};

// Targeting API
export const targetingApi = {
  segments: () => fetchApi('/api/targeting/segments'),
  mapDensity: () => fetchApi('/api/targeting/map/density'),
  priorityWards: () => fetchApi('/api/targeting/priority-wards'),
  recommendations: (data: Record<string, unknown>) =>
    fetchApi('/api/targeting/recommendations/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Intelligence API
export const intelligenceApi = {
  reports: () => fetchApi('/api/intelligence/reports'),
  get: (id: string) => fetchApi(`/api/intelligence/reports/${id}`),
  stats: () => fetchApi('/api/intelligence/reports/stats/overview'),
};

// Election Day API
export const electionDayApi = {
  monitors: () => fetchApi('/api/election-day/monitors'),
  results: () => fetchApi('/api/election-day/results'),
  incidents: () => fetchApi('/api/election-day/incidents'),
  projections: () => fetchApi('/api/election-day/projections'),
};

// Governance API
export const governanceApi = {
  budget: () => fetchApi('/api/budget/overview'),
  feedback: () => fetchApi('/api/governance/feedback'),
  security: () => fetchApi('/api/governance/security'),
};

// OSINT API
export const osintApi = {
  // Sources
  sources: () => fetchApi('/api/osint/sources'),
  createSource: (data: Record<string, unknown>) =>
    fetchApi('/api/osint/sources', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  testSource: (id: string) =>
    fetchApi(`/api/osint/sources/${id}/test`, { method: 'POST' }),
  fetchSource: (id: string) =>
    fetchApi(`/api/osint/sources/${id}/fetch`, { method: 'POST' }),

  // Mentions
  mentions: (filters: Record<string, string | number | undefined> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
    return fetchApi(`/api/osint/mentions?${params.toString()}`);
  },
  getMention: (id: string) => fetchApi(`/api/osint/mentions/${id}`),
  reprocessMention: (id: string) =>
    fetchApi(`/api/osint/mentions/${id}/reprocess`, { method: 'POST' }),
  getSimilarMentions: (id: string, limit = 10) =>
    fetchApi(`/api/osint/mentions/${id}/similar?limit=${limit}`),

  // Search
  search: (query: string, limit = 20) =>
    fetchApi('/api/osint/search', {
      method: 'POST',
      body: JSON.stringify({ query, limit }),
    }),

  // Alerts
  alerts: (filters: Record<string, string | number | undefined> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
    return fetchApi(`/api/osint/alerts?${params.toString()}`);
  },
  getAlert: (id: string) => fetchApi(`/api/osint/alerts/${id}`),
  acknowledgeAlert: (id: string) =>
    fetchApi(`/api/osint/alerts/${id}/acknowledge`, { method: 'POST' }),
  resolveAlert: (id: string, notes: string) =>
    fetchApi(`/api/osint/alerts/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),

  // Briefs
  briefs: () => fetchApi('/api/osint/briefs'),
  getBrief: (id: string) => fetchApi(`/api/osint/briefs/${id}`),
  generateBrief: (date?: string) =>
    fetchApi(`/api/osint/briefs/generate${date ? `?date=${date}` : ''}`, {
      method: 'POST',
    }),

  // Narratives
  narratives: () => fetchApi('/api/osint/narratives'),
  clusterNarratives: (hoursBack = 24) =>
    fetchApi(`/api/osint/narratives/cluster?hours_back=${hoursBack}`, {
      method: 'POST',
    }),

  // Metrics
  dashboardMetrics: () => fetchApi('/api/osint/metrics/dashboard'),
};

// Export all APIs
export const api = {
  auth: authApi,
  dashboard: dashboardApi,
  voters: votersApi,
  lgas: lgasApi,
  wards: wardsApi,
  sentiment: sentimentApi,
  politicalActors: politicalActorsApi,
  scenarios: scenariosApi,
  coalition: coalitionApi,
  scorecards: scorecardsApi,
  content: contentApi,
  messaging: messagingApi,
  targeting: targetingApi,
  intelligence: intelligenceApi,
  electionDay: electionDayApi,
  governance: governanceApi,
  osint: osintApi,
};
