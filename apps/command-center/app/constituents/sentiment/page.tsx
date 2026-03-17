'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  HeartPulse,
  MessageSquare,
  Phone,
  Smartphone,
  Users,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const sentimentTrendData = [
  { date: '2026-03-01', sentiment: 62 },
  { date: '2026-03-05', sentiment: 65 },
  { date: '2026-03-10', sentiment: 70 },
  { date: '2026-03-15', sentiment: 75 },
  { date: '2026-03-20', sentiment: 72 },
  { date: '2026-03-25', sentiment: 78 },
  { date: '2026-03-30', sentiment: 82 },
];

const sourceData = [
  { name: 'USSD', value: 45, color: '#C8A94E' },
  { name: 'WhatsApp', value: 30, color: '#10B981' },
  { name: 'SMS', value: 15, color: '#3B82F6' },
  { name: 'Canvass', value: 10, color: '#6366F1' },
];

const sentimentFeed = [
  { id: 1, source: 'USSD', text: 'Government should focus more on security in our area', sentiment: 45, category: 'Security', ward: 'Dutse Central', time: '2 min ago' },
  { id: 2, source: 'WhatsApp', text: 'The new road construction is really helping our business', sentiment: 85, category: 'Infrastructure', ward: 'Hadejia North', time: '15 min ago' },
  { id: 3, source: 'USSD', text: 'Education quality needs improvement in public schools', sentiment: 35, category: 'Education', ward: 'Birnin Kudu', time: '1 hour ago' },
  { id: 4, source: 'Canvass', text: 'Very satisfied with the healthcare services now', sentiment: 90, category: 'Healthcare', ward: 'Gumel South', time: '2 hours ago' },
  { id: 5, source: 'WhatsApp', text: 'Economy is tough, prices are too high', sentiment: 25, category: 'Economy', ward: 'Kazaure', time: '3 hours ago' },
];

const lgaSentiment = [
  { lga: 'Dutse', score: 78, trend: 'up', entries: 1240 },
  { lga: 'Hadejia', score: 72, trend: 'up', entries: 980 },
  { lga: 'Birnin Kudu', score: 65, trend: 'down', entries: 856 },
  { lga: 'Gumel', score: 81, trend: 'up', entries: 743 },
  { lga: 'Kazaure', score: 58, trend: 'down', entries: 621 },
];

const getSentimentColor = (score: number) => {
  if (score >= 70) return 'text-uradi-status-positive';
  if (score >= 40) return 'text-uradi-status-warning';
  return 'text-uradi-status-critical';
};

const getSentimentBg = (score: number) => {
  if (score >= 70) return 'bg-uradi-status-positive/10';
  if (score >= 40) return 'bg-uradi-status-warning/10';
  return 'bg-uradi-status-critical/10';
};

export default function SentimentPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-uradi-text-primary">Sentiment Dashboard</h1>
          <p className="text-uradi-text-secondary mt-1">
            Real-time citizen sentiment analysis and feedback monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Overall Sentiment"
          value="+72"
          change="+5.2%"
          trend="up"
          icon={HeartPulse}
          color="uradi-status-positive"
        />
        <StatCard
          title="Total Entries"
          value="12,456"
          change="+234"
          trend="up"
          icon={MessageSquare}
          color="uradi-gold"
        />
        <StatCard
          title="USSD Responses"
          value="5,605"
          change="45%"
          trend="neutral"
          icon={Phone}
          color="uradi-status-info"
        />
        <StatCard
          title="WhatsApp Responses"
          value="3,737"
          change="30%"
          trend="neutral"
          icon={Smartphone}
          color="uradi-status-positive"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-uradi-bg-secondary border border-uradi-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="feed">Raw Feed</TabsTrigger>
          <TabsTrigger value="lga">By LGA</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-uradi-text-primary mb-4">Sentiment Trend (30 Days)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sentimentTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      stroke="#6B7280"
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis
                      stroke="#6B7280"
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#374151',
                        borderRadius: '8px',
                      }}
                      itemStyle={{ color: '#F9FAFB' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sentiment"
                      stroke="#C8A94E"
                      strokeWidth={2}
                      dot={{ fill: '#C8A94E' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-uradi-text-primary mb-4">Source Breakdown</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#374151',
                        borderRadius: '8px',
                      }}
                      itemStyle={{ color: '#F9FAFB' }}
                      formatter={(value) => [`${value}%`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {sourceData.map((source) => (
                  <div key={source.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                    <span className="text-sm text-uradi-text-secondary">{source.name} ({source.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="feed">
          <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-uradi-border flex items-center gap-4">
              <Select>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by LGA" />
                </SelectTrigger>
                <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                  <SelectItem value="all">All LGAs</SelectItem>
                  <SelectItem value="dutse">Dutse</SelectItem>
                  <SelectItem value="hadejia">Hadejia</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="divide-y divide-uradi-border">
              {sentimentFeed.map((entry) => (
                <div key={entry.id} className="p-4 hover:bg-uradi-bg-tertiary/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{entry.source}</Badge>
                      <span className="text-uradi-text-tertiary text-sm">{entry.ward}</span>
                      <span className="text-uradi-text-tertiary text-sm">• {entry.time}</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getSentimentBg(entry.sentiment)}`}>
                      <span className={`text-sm font-mono font-medium ${getSentimentColor(entry.sentiment)}`}>
                        {entry.sentiment > 0 ? '+' : ''}{entry.sentiment}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-uradi-text-primary">{entry.text}</p>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">{entry.category}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="lga">
          <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-uradi-border">
                <tr>
                  <th className="text-left p-4 text-uradi-text-secondary font-medium">LGA</th>
                  <th className="text-left p-4 text-uradi-text-secondary font-medium">Avg Score</th>
                  <th className="text-left p-4 text-uradi-text-secondary font-medium">Trend</th>
                  <th className="text-left p-4 text-uradi-text-secondary font-medium">Entries</th>
                  <th className="text-left p-4 text-uradi-text-secondary font-medium">Top Issue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-uradi-border">
                {lgaSentiment.map((lga) => (
                  <tr key={lga.lga} className="hover:bg-uradi-bg-tertiary/50">
                    <td className="p-4 text-uradi-text-primary font-medium">{lga.lga}</td>
                    <td className="p-4">
                      <span className={`font-mono font-medium ${getSentimentColor(lga.score)}`}>
                        {lga.score}
                      </span>
                    </td>
                    <td className="p-4">
                      {lga.trend === 'up' ? (
                        <div className="flex items-center gap-1 text-uradi-status-positive">
                          <TrendingUp className="h-4 w-4" />
                          <span>Rising</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-uradi-status-critical">
                          <TrendingDown className="h-4 w-4" />
                          <span>Falling</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-uradi-text-primary font-mono">{lga.entries.toLocaleString()}</td>
                    <td className="p-4">
                      <Badge variant="secondary">Security</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
}) {
  const colorClasses: Record<string, { text: string; bg: string }> = {
    'uradi-status-info': { text: 'text-uradi-status-info', bg: 'bg-uradi-status-info/10' },
    'uradi-status-positive': { text: 'text-uradi-status-positive', bg: 'bg-uradi-status-positive/10' },
    'uradi-status-critical': { text: 'text-uradi-status-critical', bg: 'bg-uradi-status-critical/10' },
    'uradi-status-warning': { text: 'text-uradi-status-warning', bg: 'bg-uradi-status-warning/10' },
    'uradi-gold': { text: 'text-uradi-gold', bg: 'bg-uradi-gold/10' },
    'uradi-status-neutral': { text: 'text-uradi-status-neutral', bg: 'bg-uradi-status-neutral/10' },
    'uradi-party-pdp': { text: 'text-uradi-party-pdp', bg: 'bg-uradi-party-pdp/10' },
    'uradi-party-apc': { text: 'text-uradi-party-apc', bg: 'bg-uradi-party-apc/10' },
    'uradi-party-nnpp': { text: 'text-uradi-party-nnpp', bg: 'bg-uradi-party-nnpp/10' },
  };
  const colors = colorClasses[color] || colorClasses['uradi-status-info'];

  return (
    <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-uradi-text-secondary text-sm">{title}</p>
          <p className="text-2xl font-bold text-uradi-text-primary font-mono mt-1">{value}</p>
          <div className={`flex items-center gap-1 mt-1 ${colors.text}`}>
            {trend === 'up' && <TrendingUp className="h-4 w-4" />}
            {trend === 'down' && <TrendingDown className="h-4 w-4" />}
            <span className="text-sm">{change}</span>
          </div>
        </div>
        <div className={`p-2 rounded-lg ${colors.bg}`}>
          <Icon className={`h-5 w-5 ${colors.text}`} />
        </div>
      </div>
    </div>
  );
}
