import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  Voter,
  VoterFilters,
  SentimentEntry,
  SentimentFilters,
  DashboardOverview,
  ActivityLog,
  LGA,
  Ward,
  PaginatedResponse,
} from '@/types';

// Dashboard Hooks
export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => api.dashboard.overview(),
    refetchInterval: 60000, // 60 seconds
  });
}

export function useActivityFeed(limit = 20) {
  return useQuery({
    queryKey: ['dashboard', 'activity', limit],
    queryFn: () => api.dashboard.activity(limit),
    refetchInterval: 30000, // 30 seconds
  });
}

// Voter Hooks
export function useVoters(filters: VoterFilters = {}) {
  return useQuery<PaginatedResponse<Voter>>({
    queryKey: ['voters', filters],
    queryFn: () => api.voters.list(filters),
    refetchInterval: 60000,
  });
}

export function useVoter(id: string) {
  return useQuery<Voter>({
    queryKey: ['voters', id],
    queryFn: () => api.voters.get(id),
    enabled: !!id,
  });
}

export function useCreateVoter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.voters.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voters'] });
    },
  });
}

export function useUpdateVoter(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.voters.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voters', id] });
      queryClient.invalidateQueries({ queryKey: ['voters'] });
    },
  });
}

export function useDeleteVoter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.voters.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voters'] });
    },
  });
}

// LGA Hooks
export function useLGAs() {
  return useQuery<LGA[]>({
    queryKey: ['lgas'],
    queryFn: () => api.lgas.list(),
    staleTime: 300000, // 5 minutes
  });
}

export function useLGA(id: string) {
  return useQuery<LGA>({
    queryKey: ['lgas', id],
    queryFn: () => api.lgas.get(id),
    enabled: !!id,
  });
}

export function useLGAStats() {
  return useQuery({
    queryKey: ['lgas', 'stats'],
    queryFn: () => api.lgas.stats(),
    refetchInterval: 300000,
  });
}

// Ward Hooks
export function useWards(lgaId?: string) {
  return useQuery<Ward[]>({
    queryKey: ['wards', lgaId],
    queryFn: () => api.wards.list(lgaId),
    enabled: !lgaId || !!lgaId,
    staleTime: 300000,
  });
}

export function useWard(id: string) {
  return useQuery<Ward>({
    queryKey: ['wards', id],
    queryFn: () => api.wards.get(id),
    enabled: !!id,
  });
}

// Sentiment Hooks
export function useSentiment(filters: SentimentFilters = {}) {
  return useQuery<PaginatedResponse<SentimentEntry>>({
    queryKey: ['sentiment', filters],
    queryFn: () => api.sentiment.list(filters),
    refetchInterval: 30000,
  });
}

export function useSentimentAggregate(type: 'lga' | 'ward' | 'category') {
  return useQuery({
    queryKey: ['sentiment', 'aggregate', type],
    queryFn: () => api.sentiment.aggregate(type),
    refetchInterval: 60000,
  });
}

export function useSentimentTrend(days = 30) {
  return useQuery({
    queryKey: ['sentiment', 'trend', days],
    queryFn: () => api.sentiment.trend(days),
  });
}

export function useCreateSentiment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.sentiment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentiment'] });
    },
  });
}

// Political Actors Hooks
export function usePoliticalActors(filters: Record<string, string | undefined> = {}) {
  return useQuery({
    queryKey: ['political-actors', filters],
    queryFn: () => api.politicalActors.list(filters),
  });
}

export function usePoliticalActorNetwork() {
  return useQuery({
    queryKey: ['political-actors', 'network'],
    queryFn: () => api.politicalActors.network(),
  });
}

// Scenarios Hooks
export function useScenarios() {
  return useQuery({
    queryKey: ['scenarios'],
    queryFn: () => api.scenarios.list(),
  });
}

export function useScenarioComparison() {
  return useQuery({
    queryKey: ['scenarios', 'comparison'],
    queryFn: () => api.scenarios.comparison(),
  });
}

export function useProjections() {
  return useQuery({
    queryKey: ['scenarios', 'projections'],
    queryFn: () => api.scenarios.projections(),
    refetchInterval: 300000,
  });
}

// Coalition Hooks
export function useCoalitionPartners() {
  return useQuery({
    queryKey: ['coalition', 'partners'],
    queryFn: () => api.coalition.list(),
  });
}

export function useCoalitionOverview() {
  return useQuery({
    queryKey: ['coalition', 'overview'],
    queryFn: () => api.coalition.overview(),
    refetchInterval: 300000,
  });
}

// Scorecards Hooks
export function useScorecards() {
  return useQuery({
    queryKey: ['scorecards'],
    queryFn: () => api.scorecards.list(),
  });
}

export function useScorecardTrends(sector: string) {
  return useQuery({
    queryKey: ['scorecards', 'trends', sector],
    queryFn: () => api.scorecards.trends(sector),
  });
}

// Content Hooks
export function useContent() {
  return useQuery({
    queryKey: ['content'],
    queryFn: () => api.content.list(),
  });
}

export function useContentCalendar() {
  return useQuery({
    queryKey: ['content', 'calendar'],
    queryFn: () => api.content.calendar(),
  });
}

// Messaging Hooks
export function useMessagingHistory() {
  return useQuery({
    queryKey: ['messaging', 'history'],
    queryFn: () => api.messaging.history(),
  });
}

export function useMessagingStats() {
  return useQuery({
    queryKey: ['messaging', 'stats'],
    queryFn: () => api.messaging.stats(),
    refetchInterval: 60000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.messaging.send(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messaging'] });
    },
  });
}

// Targeting Hooks
export function useTargetingSegments() {
  return useQuery({
    queryKey: ['targeting', 'segments'],
    queryFn: () => api.targeting.segments(),
  });
}

export function useMapDensity() {
  return useQuery({
    queryKey: ['targeting', 'map-density'],
    queryFn: () => api.targeting.mapDensity(),
  });
}

export function usePriorityWards() {
  return useQuery({
    queryKey: ['targeting', 'priority-wards'],
    queryFn: () => api.targeting.priorityWards(),
  });
}

// Intelligence Hooks
export function useIntelligenceReports() {
  return useQuery({
    queryKey: ['intelligence', 'reports'],
    queryFn: () => api.intelligence.reports(),
  });
}

export function useIntelligenceStats() {
  return useQuery({
    queryKey: ['intelligence', 'stats'],
    queryFn: () => api.intelligence.stats(),
  });
}

// Election Day Hooks
export function useMonitors() {
  return useQuery({
    queryKey: ['election-day', 'monitors'],
    queryFn: () => api.electionDay.monitors(),
    refetchInterval: 30000,
  });
}

export function useResults() {
  return useQuery({
    queryKey: ['election-day', 'results'],
    queryFn: () => api.electionDay.results(),
    refetchInterval: 30000,
  });
}

export function useIncidents() {
  return useQuery({
    queryKey: ['election-day', 'incidents'],
    queryFn: () => api.electionDay.incidents(),
    refetchInterval: 30000,
  });
}

// Governance Hooks
export function useBudgetOverview() {
  return useQuery({
    queryKey: ['governance', 'budget'],
    queryFn: () => api.governance.budget(),
  });
}

export function useCitizenFeedback() {
  return useQuery({
    queryKey: ['governance', 'feedback'],
    queryFn: () => api.governance.feedback(),
  });
}
