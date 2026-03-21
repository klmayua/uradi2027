'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useOSINTMentions, useOSINTSources, useReprocessMention } from '@/hooks/useData';
import { formatDistanceToNow } from '@/lib/utils';
import Link from 'next/link';

export default function MentionsPage() {
  const [filters, setFilters] = useState({
    search: '',
    sentiment: '',
    urgency: '',
    stance: '',
    source_id: '',
    limit: 50,
    offset: 0,
  });

  const { data: mentions, isLoading, refetch } = useOSINTMentions(filters);
  const { data: sources } = useOSINTSources();
  const reprocessMutation = useReprocessMention();

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, offset: 0 }));
  };

  const getSentimentColor = (label?: string) => {
    switch (label) {
      case 'very_positive':
      case 'positive':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'very_negative':
      case 'negative':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getUrgencyColor = (label?: string) => {
    switch (label) {
      case 'critical':
        return 'bg-rose-500 text-white';
      case 'high':
        return 'bg-amber-500 text-white';
      case 'medium':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  const getStanceColor = (stance?: string) => {
    switch (stance) {
      case 'supporting':
        return 'text-emerald-400';
      case 'opposing':
        return 'text-rose-400';
      case 'mixed':
        return 'text-amber-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Search className="w-6 h-6 text-amber-400" />
            OSINT Mentions
          </h1>
          <p className="text-slate-400 mt-1">
            Browse and search through collected intelligence mentions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="border-slate-700 hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link href="/intelligence/osint">
            <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search mentions..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 bg-slate-900 border-slate-700"
              />
            </div>

            <Select
              value={filters.sentiment}
              onValueChange={(value) => handleFilterChange('sentiment', value)}
            >
              <SelectTrigger className="bg-slate-900 border-slate-700">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="">All Sentiments</SelectItem>
                <SelectItem value="very_positive">Very Positive</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
                <SelectItem value="very_negative">Very Negative</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.urgency}
              onValueChange={(value) => handleFilterChange('urgency', value)}
            >
              <SelectTrigger className="bg-slate-900 border-slate-700">
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="">All Urgency</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.stance}
              onValueChange={(value) => handleFilterChange('stance', value)}
            >
              <SelectTrigger className="bg-slate-900 border-slate-700">
                <SelectValue placeholder="Stance" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="">All Stances</SelectItem>
                <SelectItem value="supporting">Supporting</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="opposing">Opposing</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.source_id}
              onValueChange={(value) => handleFilterChange('source_id', value)}
            >
              <SelectTrigger className="bg-slate-900 border-slate-700">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="">All Sources</SelectItem>
                {sources?.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">
            Mentions ({mentions?.total || 0})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700"
              disabled={filters.offset === 0}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  offset: Math.max(0, prev.offset - prev.limit),
                }))
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700"
              disabled={!mentions || mentions.offset + mentions.limit >= mentions.total}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  offset: prev.offset + prev.limit,
                }))
              }
            >
              Next
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="text-slate-300">Title/Content</TableHead>
                <TableHead className="text-slate-300">Source</TableHead>
                <TableHead className="text-slate-300">Sentiment</TableHead>
                <TableHead className="text-slate-300">Urgency</TableHead>
                <TableHead className="text-slate-300">Stance</TableHead>
                <TableHead className="text-slate-300">Time</TableHead>
                <TableHead className="text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    Loading mentions...
                  </TableCell>
                </TableRow>
              ) : mentions?.items?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No mentions found
                  </TableCell>
                </TableRow>
              ) : (
                mentions?.items?.map((mention) => (
                  <TableRow
                    key={mention.id}
                    className="border-slate-700 hover:bg-slate-700/50"
                  >
                    <TableCell>
                      <div className="max-w-md">
                        <p className="text-sm text-slate-200 line-clamp-2">
                          {mention.title || mention.content?.slice(0, 100)}
                        </p>
                        {mention.topics?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {mention.topics.slice(0, 3).map((topic) => (
                              <Badge
                                key={topic}
                                variant="outline"
                                className="text-xs border-slate-600"
                              >
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-300">
                        {mention.source?.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {mention.author || 'No author'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {mention.sentiment_label ? (
                        <Badge
                          variant="outline"
                          className={`capitalize ${getSentimentColor(
                            mention.sentiment_label
                          )}`}
                        >
                          {mention.sentiment_label.replace('_', ' ')}
                        </Badge>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {mention.urgency_label ? (
                        <Badge className={`capitalize ${getUrgencyColor(mention.urgency_label)}`}>
                          {mention.urgency_label}
                        </Badge>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`capitalize ${getStanceColor(mention.stance_towards_candidate)}`}>
                        {mention.stance_towards_candidate || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-400">
                        {mention.published_at
                          ? formatDistanceToNow(new Date(mention.published_at))
                          : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {mention.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => window.open(mention.url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => reprocessMutation.mutate(mention.id)}
                          disabled={reprocessMutation.isPending}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
