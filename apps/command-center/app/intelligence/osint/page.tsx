'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  FileText,
  Filter,
  Globe,
  RefreshCw,
  Rss,
  Search,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  useOSINTDashboardMetrics,
  useOSINTSources,
  useOSINTMentions,
  useOSINTAlerts,
  useDailyBriefs,
  useNarrativeClusters,
} from '@/hooks/useData';
import Link from 'next/link';

export default function OSINTDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: metrics, isLoading: metricsLoading } = useOSINTDashboardMetrics();
  const { data: sources } = useOSINTSources();
  const { data: mentions } = useOSINTMentions({ limit: 5 });
  const { data: alerts } = useOSINTAlerts({ status: 'open', limit: 5 });
  const { data: briefs } = useDailyBriefs();
  const { data: narratives } = useNarrativeClusters();

  const activeSources = sources?.filter((s) => s.is_active).length || 0;
  const criticalAlerts = alerts?.items?.filter((a) => a.severity === 'critical').length || 0;
  const highAlerts = alerts?.items?.filter((a) => a.severity === 'high').length || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-amber-400" />
            OSINT Intelligence Center
          </h1>
          <p className="text-slate-400 mt-1">
            Real-time monitoring and analysis of open-source intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/intelligence/osint/mentions">
            <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
              <Search className="w-4 h-4 mr-2" />
              Browse Mentions
            </Button>
          </Link>
          <Link href="/intelligence/osint/alerts">
            <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Alerts
              {(criticalAlerts > 0 || highAlerts > 0) && (
                <Badge variant="destructive" className="ml-2">
                  {criticalAlerts + highAlerts}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Mentions (24h)"
          value={metrics?.mentions_24h || 0}
          icon={<Activity className="w-5 h-5" />}
          trend={metrics?.mentions_24h && metrics.mentions_24h > 100 ? 'up' : 'neutral'}
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Avg Sentiment"
          value={metrics?.avg_sentiment_24h?.toFixed(2) || '0.00'}
          icon={
            (metrics?.avg_sentiment_24h || 0) >= 0 ? (
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-rose-400" />
            )
          }
          subtitle={getSentimentLabel(metrics?.avg_sentiment_24h)}
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Active Alerts"
          value={metrics?.active_alerts || 0}
          icon={<AlertTriangle className="w-5 h-5" />}
          alert={criticalAlerts > 0}
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Active Sources"
          value={activeSources}
          icon={<Rss className="w-5 h-5" />}
          subtitle={`of ${sources?.length || 0} configured`}
          isLoading={metricsLoading}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">
            Overview
          </TabsTrigger>
          <TabsTrigger value="mentions" className="data-[state=active]:bg-slate-700">
            Recent Mentions
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-slate-700">
            Active Alerts
          </TabsTrigger>
          <TabsTrigger value="briefs" className="data-[state=active]:bg-slate-700">
            Daily Briefs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Activity */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">
                  Recent Activity
                </CardTitle>
                <RefreshCw className="w-4 h-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mentions?.items?.slice(0, 5).map((mention) => (
                    <div
                      key={mention.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 hover:bg-slate-900 transition-colors"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          mention.sentiment_score && mention.sentiment_score > 0
                            ? 'bg-emerald-400'
                            : mention.sentiment_score && mention.sentiment_score < 0
                            ? 'bg-rose-400'
                            : 'bg-slate-400'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 truncate">
                          {mention.title || mention.content?.slice(0, 100)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs border-slate-600">
                            {mention.source?.name || mention.source_id.slice(0, 8)}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {mention.urgency_label && (
                              <span
                                className={`capitalize ${
                                  mention.urgency_label === 'critical'
                                    ? 'text-rose-400'
                                    : mention.urgency_label === 'high'
                                    ? 'text-amber-400'
                                    : 'text-slate-400'
                                }`}
                              >
                                {mention.urgency_label}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!mentions?.items?.length && (
                    <p className="text-sm text-slate-500 text-center py-4">
                      No recent mentions
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Narratives */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">
                  Active Narratives
                </CardTitle>
                <Brain className="w-4 h-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {narratives?.slice(0, 5).map((narrative) => (
                    <div
                      key={narrative.id}
                      className="p-3 rounded-lg bg-slate-900/50 hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-slate-200">
                          {narrative.narrative_title || 'Untitled Narrative'}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            narrative.sentiment_trend === 'improving'
                              ? 'border-emerald-500 text-emerald-400'
                              : narrative.sentiment_trend === 'declining'
                              ? 'border-rose-500 text-rose-400'
                              : 'border-slate-500 text-slate-400'
                          }`}
                        >
                          {narrative.sentiment_trend}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {narrative.narrative_summary}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span>{narrative.mention_count} mentions</span>
                        <span>•</span>
                        <span>{narrative.affected_lgas?.length || 0} LGAs</span>
                      </div>
                    </div>
                  ))}
                  {!narratives?.length && (
                    <p className="text-sm text-slate-500 text-center py-4">
                      No active narratives
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Source Health */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Source Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {sources?.map((source) => (
                  <div
                    key={source.id}
                    className={`p-3 rounded-lg border ${
                      source.is_active
                        ? source.last_fetch_status === 'success'
                          ? 'border-emerald-500/30 bg-emerald-500/10'
                          : 'border-amber-500/30 bg-amber-500/10'
                        : 'border-slate-700 bg-slate-900/50'
                    }`}
                  >
                    <p className="text-xs font-medium text-slate-200 truncate">
                      {source.name}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          source.is_active
                            ? source.last_fetch_status === 'success'
                              ? 'bg-emerald-400'
                              : 'bg-amber-400'
                            : 'bg-slate-500'
                        }`}
                      />
                      <span className="text-xs text-slate-500 capitalize">
                        {source.last_fetch_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentions">
          <Link href="/intelligence/osint/mentions">
            <Button className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700">
              <Search className="w-4 h-4 mr-2" />
              View All Mentions with Advanced Filters
            </Button>
          </Link>
        </TabsContent>

        <TabsContent value="alerts">
          <Link href="/intelligence/osint/alerts">
            <Button className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700">
              <AlertTriangle className="w-4 h-4 mr-2" />
              View All Alerts and Manage Responses
            </Button>
          </Link>
        </TabsContent>

        <TabsContent value="briefs">
          <Link href="/intelligence/osint/briefs">
            <Button className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700">
              <FileText className="w-4 h-4 mr-2" />
              View Daily Brief Archive
            </Button>
          </Link>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Components
function MetricCard({
  title,
  value,
  icon,
  subtitle,
  trend,
  alert,
  isLoading,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  alert?: boolean;
  isLoading?: boolean;
}) {
  return (
    <Card className={`bg-slate-800 border-slate-700 ${alert ? 'border-rose-500/50' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">
              {isLoading ? '-' : value}
            </p>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
          <div
            className={`p-3 rounded-lg ${
              alert
                ? 'bg-rose-500/20 text-rose-400'
                : trend === 'up'
                ? 'bg-emerald-500/20 text-emerald-400'
                : trend === 'down'
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getSentimentLabel(score?: number): string {
  if (score === undefined) return 'Neutral';
  if (score >= 0.6) return 'Very Positive';
  if (score >= 0.2) return 'Positive';
  if (score >= -0.2) return 'Neutral';
  if (score >= -0.6) return 'Negative';
  return 'Very Negative';
}
