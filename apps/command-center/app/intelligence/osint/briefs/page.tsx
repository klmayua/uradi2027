'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Sparkles,
  Users,
  Newspaper,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useDailyBriefs, useDailyBrief, useGenerateBrief } from '@/hooks/useData';
import { format } from '@/lib/utils';
import Link from 'next/link';

export default function BriefsPage() {
  const [selectedBrief, setSelectedBrief] = useState<string | null>(null);

  const { data: briefs, isLoading: briefsLoading } = useDailyBriefs();
  const { data: currentBrief } = useDailyBrief(selectedBrief || briefs?.[0]?.id || '');
  const generateMutation = useGenerateBrief();

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  const getSentimentIcon = (change?: number) => {
    if (!change || change === 0) return <Minus className="w-4 h-4 text-slate-400" />;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    return <TrendingDown className="w-4 h-4 text-rose-400" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'generating':
        return <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />;
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-400" />
            Daily Intelligence Briefs
          </h1>
          <p className="text-slate-400 mt-1">
            AI-generated daily summaries of intelligence activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generateMutation.isPending ? 'Generating...' : 'Generate Brief'}
          </Button>
          <Link href="/intelligence/osint">
            <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brief List */}
        <Card className="bg-slate-800 border-slate-700 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white">Brief Archive</CardTitle>
            <CardDescription>Select a brief to view details</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="space-y-2 p-4">
                {briefsLoading ? (
                  <p className="text-slate-500 text-center py-4">Loading briefs...</p>
                ) : briefs?.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No briefs generated yet</p>
                ) : (
                  briefs?.map((brief) => (
                    <button
                      key={brief.id}
                      onClick={() => setSelectedBrief(brief.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        selectedBrief === brief.id ||
                        (!selectedBrief && briefs?.[0]?.id === brief.id)
                          ? 'border-amber-500/50 bg-amber-500/10'
                          : 'border-slate-700 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-200">
                            {format(new Date(brief.brief_date), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-sm text-slate-400 mt-1 line-clamp-1">
                            {brief.headline_summary?.slice(0, 60)}...
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(brief.status)}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Newspaper className="w-3 h-3" />
                          {brief.total_mentions} mentions
                        </span>
                        <span className="flex items-center gap-1">
                          {getSentimentIcon(brief.sentiment_change)}
                          {brief.sentiment_change > 0 ? '+' : ''}
                          {brief.sentiment_change?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Brief Detail */}
        <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
          <CardContent className="p-6">
            {currentBrief ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="border-b border-slate-700 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={`capitalize ${
                        currentBrief.status === 'ready'
                          ? 'border-emerald-500 text-emerald-400'
                          : currentBrief.status === 'generating'
                          ? 'border-amber-500 text-amber-400'
                          : 'border-slate-500 text-slate-400'
                      }`}
                    >
                      {currentBrief.status}
                    </Badge>
                    {currentBrief.generated_by === 'ai' && (
                      <Badge variant="outline" className="border-purple-500 text-purple-400">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Generated
                      </Badge>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-white">
                    {currentBrief.headline_summary || 'Daily Intelligence Brief'}
                  </h2>

                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(currentBrief.brief_date), 'MMMM dd, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Newspaper className="w-4 h-4" />
                      {currentBrief.total_mentions} mentions
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {currentBrief.unique_sources} sources
                    </span>
                    <span className="flex items-center gap-1">
                      Avg Sentiment: {currentBrief.avg_sentiment?.toFixed(2) || '0.00'}
                      {getSentimentIcon(currentBrief.sentiment_change)}
                    </span>
                  </div>
                </div>

                {/* Key Developments */}
                {currentBrief.key_developments?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Key Developments
                    </h3>
                    <div className="space-y-3">
                      {currentBrief.key_developments.map((dev, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-slate-900/50 rounded-lg border-l-4 border-amber-500"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                dev.impact === 'high'
                                  ? 'border-rose-500 text-rose-400'
                                  : dev.impact === 'medium'
                                  ? 'border-amber-500 text-amber-400'
                                  : 'border-slate-500 text-slate-400'
                              }`}
                            >
                              {dev.impact} impact
                            </Badge>
                          </div>
                          <h4 className="font-medium text-slate-200">{dev.title}</h4>
                          <p className="text-sm text-slate-400 mt-1">{dev.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Narratives */}
                {currentBrief.top_narratives?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Top Narratives
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentBrief.top_narratives.map((narrative, idx) => (
                        <Card
                          key={idx}
                          className="bg-slate-900/50 border-slate-700"
                        >
                          <CardContent className="p-4">
                            <h4 className="font-medium text-slate-200">{narrative.title}</h4>
                            <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
                              <span>{narrative.mention_count} mentions</span>
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
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emerging Threats */}
                {currentBrief.emerging_threats?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                      Emerging Threats
                    </h3>
                    <ul className="space-y-2">
                      {currentBrief.emerging_threats.map((threat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-300">
                          <span className="text-rose-400 mt-1">•</span>
                          {threat}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Opposition Activity */}
                {currentBrief.opposition_activity && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Opposition Activity
                    </h3>
                    <div className="p-4 bg-slate-900/50 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-slate-400">Mentions</p>
                          <p className="text-lg font-semibold text-white">
                            {currentBrief.opposition_activity.mention_count}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Avg Sentiment</p>
                          <p className="text-lg font-semibold text-white">
                            {currentBrief.opposition_activity.avg_sentiment?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {currentBrief.opposition_activity.top_topics?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {currentBrief.opposition_activity.top_topics.map((topic) => (
                            <Badge
                              key={topic}
                              variant="outline"
                              className="border-slate-600"
                            >
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Strategic Recommendations */}
                {currentBrief.strategic_recommendations?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Strategic Recommendations
                    </h3>
                    <div className="space-y-2">
                      {currentBrief.strategic_recommendations.map((rec, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-start gap-2"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                          <span className="text-slate-300">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-slate-500">
                <FileText className="w-12 h-12 mb-4" />
                <p className="text-lg">Select a brief to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
