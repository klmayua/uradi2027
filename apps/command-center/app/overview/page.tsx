'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import {
  Users,
  HeartPulse,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  FileText,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

// Mock data for the dashboard - will be replaced with API calls
const mockKpiData = [
  {
    name: 'Total Voter Contacts',
    value: 142387,
    change: '+12.5%',
    trend: 'up',
    icon: Users,
    color: 'uradi-status-info',
  },
  {
    name: 'Avg Sentiment',
    value: '+12',
    change: '+3.2%',
    trend: 'up',
    icon: HeartPulse,
    color: 'uradi-status-positive',
  },
  {
    name: 'LGAs Won (proj)',
    value: '18/27',
    change: '+2',
    trend: 'up',
    icon: MapPin,
    color: 'uradi-gold',
  },
  {
    name: 'Days to Election',
    value: 247,
    change: null,
    trend: 'neutral',
    icon: Calendar,
    color: 'uradi-text-secondary',
  },
];

const mockSentimentData = [
  { date: '2026-03-01', sentiment: 62, jigawa: 65, kano: 58 },
  { date: '2026-03-02', sentiment: 58, jigawa: 61, kano: 54 },
  { date: '2026-03-03', sentiment: 65, jigawa: 68, kano: 61 },
  { date: '2026-03-04', sentiment: 67, jigawa: 70, kano: 63 },
  { date: '2026-03-05', sentiment: 70, jigawa: 73, kano: 66 },
  { date: '2026-03-06', sentiment: 68, jigawa: 71, kano: 64 },
  { date: '2026-03-07', sentiment: 72, jigawa: 75, kano: 68 },
  { date: '2026-03-08', sentiment: 75, jigawa: 78, kano: 71 },
  { date: '2026-03-09', sentiment: 73, jigawa: 76, kano: 69 },
  { date: '2026-03-10', sentiment: 77, jigawa: 80, kano: 73 },
  { date: '2026-03-11', sentiment: 79, jigawa: 82, kano: 75 },
  { date: '2026-03-12', sentiment: 81, jigawa: 84, kano: 77 },
  { date: '2026-03-13', sentiment: 80, jigawa: 83, kano: 76 },
  { date: '2026-03-14', sentiment: 82, jigawa: 85, kano: 78 },
  { date: '2026-03-15', sentiment: 85, jigawa: 88, kano: 81 },
];

const mockLgaHeatmapData = [
  { name: 'Babura', sentiment: 85, voters: 12000 },
  { name: 'Birnin Kudu', sentiment: 78, voters: 15000 },
  { name: 'Buji', sentiment: 72, voters: 8000 },
  { name: 'Dutse', sentiment: 88, voters: 20000 },
  { name: 'Gagarawa', sentiment: 65, voters: 10000 },
  { name: 'Garki', sentiment: 75, voters: 18000 },
  { name: 'Gumel', sentiment: 68, voters: 9000 },
  { name: 'Gwiwa', sentiment: 70, voters: 7000 },
  { name: 'Hadejia', sentiment: 82, voters: 15000 },
  { name: 'Jahun', sentiment: 79, voters: 13000 },
  { name: 'Kafin Hausa', sentiment: 60, voters: 6000 },
  { name: 'Kaugama', sentiment: 74, voters: 11000 },
  { name: 'Kazaure', sentiment: 76, voters: 14000 },
  { name: 'Kiri Kasamma', sentiment: 80, voters: 16000 },
  { name: 'Kiyawa', sentiment: 67, voters: 8000 },
  { name: 'Maigatari', sentiment: 84, voters: 19000 },
  { name: 'Malam Maduri', sentiment: 71, voters: 10000 },
  { name: 'Miga', sentiment: 77, voters: 12000 },
  { name: 'Ringim', sentiment: 69, voters: 9000 },
  { name: 'Roni', sentiment: 73, voters: 11000 },
  { name: 'Sule Tankarkar', sentiment: 86, voters: 17000 },
  { name: 'Taura', sentiment: 66, voters: 7000 },
  { name: 'Yankwashi', sentiment: 81, voters: 15000 },
];

const mockTopIssues = [
  { name: 'Security', value: 3420, color: '#EF4444' },
  { name: 'Economy', value: 2850, color: '#F59E0B' },
  { name: 'Education', value: 2100, color: '#3B82F6' },
  { name: 'Infrastructure', value: 1850, color: '#10B981' },
  { name: 'Healthcare', value: 1200, color: '#6366F1' },
];

const mockPartyLeaning = [
  { name: 'APC', value: 35, color: '#1E40AF' },
  { name: 'PDP', value: 25, color: '#DC2626' },
  { name: 'NNPP', value: 20, color: '#7C3AED' },
  { name: 'ADC', value: 8, color: '#059669' },
  { name: 'Undecided', value: 12, color: '#9CA3AF' },
];

const mockActivityData = [
  { id: 1, user: 'Ahmad Abdullahi', action: 'Added 500 new voters in Dutse LGA', time: '2 min ago', type: 'voter' },
  { id: 2, user: 'Fatima Yusuf', action: 'Published Q3 Governance Scorecard', time: '15 min ago', type: 'content' },
  { id: 3, user: 'Usman Ibrahim', action: 'Sentiment alert: Ringim LGA dropped -8 points', time: '1 hour ago', type: 'alert' },
  { id: 4, user: 'Aisha Mohammed', action: 'Sent WhatsApp messages to 5,000 constituents', time: '2 hours ago', type: 'messaging' },
  { id: 5, user: 'Ibrahim Ali', action: 'Created new intelligence report on opposition', time: '3 hours ago', type: 'intelligence' },
  { id: 6, user: 'Coordinator Network', action: '15 field agents checked in today', time: '4 hours ago', type: 'field' },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'voter':
      return <Users className="h-4 w-4 text-uradi-status-info" />;
    case 'content':
      return <FileText className="h-4 w-4 text-uradi-gold" />;
    case 'alert':
      return <AlertCircle className="h-4 w-4 text-uradi-status-critical" />;
    case 'messaging':
      return <MessageSquare className="h-4 w-4 text-uradi-status-positive" />;
    case 'intelligence':
      return <Activity className="h-4 w-4 text-uradi-status-neutral" />;
    case 'field':
      return <MapPin className="h-4 w-4 text-uradi-status-warning" />;
    default:
      return <Activity className="h-4 w-4 text-uradi-text-tertiary" />;
  }
};

export default function OverviewPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-uradi-bg-tertiary rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-uradi-bg-secondary rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-uradi-text-primary">Dashboard Overview</h1>
          <p className="text-uradi-text-secondary mt-1">Real-time campaign intelligence and voter sentiment</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-uradi-text-tertiary">
          <span className="w-2 h-2 rounded-full bg-uradi-status-positive animate-pulse" />
          Live data
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockKpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          const colorClasses: Record<string, { bg: string; text: string }> = {
            'uradi-status-info': { bg: 'bg-uradi-status-info/10', text: 'text-uradi-status-info' },
            'uradi-status-positive': { bg: 'bg-uradi-status-positive/10', text: 'text-uradi-status-positive' },
            'uradi-status-critical': { bg: 'bg-uradi-status-critical/10', text: 'text-uradi-status-critical' },
            'uradi-gold': { bg: 'bg-uradi-gold/10', text: 'text-uradi-gold' },
          };
          const colors = colorClasses[kpi.color] || colorClasses['uradi-status-info'];
          return (
            <div
              key={index}
              className="bg-uradi-bg-secondary border border-uradi-border rounded-xl p-6 hover:border-uradi-gold/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-uradi-text-secondary text-sm font-medium">{kpi.name}</p>
                  <p className="text-3xl font-bold text-uradi-text-primary font-mono mt-2">
                    {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                  </p>
                  {kpi.change && (
                    <div className="flex items-center gap-1 mt-2">
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-uradi-status-positive" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-uradi-status-critical" />
                      )}
                      <span className={`text-sm ${kpi.trend === 'up' ? 'text-uradi-status-positive' : 'text-uradi-status-critical'}`}>
                        {kpi.change}
                      </span>
                      <span className="text-uradi-text-tertiary text-sm">vs last week</span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${colors.bg}`}>
                  <Icon className={`h-6 w-6 ${colors.text}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Trend Chart */}
        <div className="lg:col-span-2 bg-uradi-bg-secondary border border-uradi-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-uradi-text-primary">Sentiment Trend</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-uradi-gold" />
                <span className="text-uradi-text-secondary">Overall</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-uradi-status-info" />
                <span className="text-uradi-text-secondary">Jigawa</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockSentimentData}>
                <defs>
                  <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8A94E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C8A94E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  tick={{ fill: '#6B7280', fontSize: 12, fontFamily: 'Inter' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis
                  stroke="#6B7280"
                  tick={{ fill: '#6B7280', fontSize: 12, fontFamily: 'JetBrains Mono' }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#374151',
                    borderRadius: '8px',
                  }}
                  itemStyle={{ color: '#F9FAFB' }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
                <Area
                  type="monotone"
                  dataKey="sentiment"
                  stroke="#C8A94E"
                  strokeWidth={2}
                  fill="url(#sentimentGradient)"
                  name="Overall"
                />
                <Line
                  type="monotone"
                  dataKey="jigawa"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false}
                  name="Jigawa"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-uradi-text-primary">Activity Feed</h2>
            <button className="text-sm text-uradi-gold hover:text-uradi-gold-light transition-colors">
              Mark all read
            </button>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {mockActivityData.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-uradi-bg-tertiary transition-colors cursor-pointer"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-uradi-text-primary">
                    <span className="font-medium">{activity.user}</span>
                    <span className="text-uradi-text-secondary"> {activity.action}</span>
                  </p>
                  <p className="text-xs text-uradi-text-tertiary mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LGA Sentiment Heatmap */}
        <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-uradi-text-primary mb-4">LGA Sentiment</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockLgaHeatmapData.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#6B7280"
                  tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  domain={[0, 100]}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#6B7280"
                  tick={{ fill: '#9CA3AF', fontSize: 11, fontFamily: 'Inter' }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#374151',
                    borderRadius: '8px',
                  }}
                  itemStyle={{ color: '#F9FAFB' }}
                  formatter={(value) => [`${value}%`, 'Sentiment']}
                />
                <Bar
                  dataKey="sentiment"
                  name="Sentiment"
                  fill="#C8A94E"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Issues */}
        <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-uradi-text-primary mb-4">Top Issues</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockTopIssues} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#6B7280"
                  tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#6B7280"
                  tick={{ fill: '#9CA3AF', fontSize: 11, fontFamily: 'Inter' }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#374151',
                    borderRadius: '8px',
                  }}
                  itemStyle={{ color: '#F9FAFB' }}
                  formatter={(value) => [value.toLocaleString(), 'Mentions']}
                />
                <Bar dataKey="value" name="Mentions" radius={[0, 4, 4, 0]}>
                  {mockTopIssues.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Party Leaning */}
        <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-uradi-text-primary mb-4">Party Leaning</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockPartyLeaning}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {mockPartyLeaning.map((entry, index) => (
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
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {mockPartyLeaning.map((party) => (
              <div key={party.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: party.color }}
                />
                <span className="text-xs text-uradi-text-secondary">
                  {party.name} ({party.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
