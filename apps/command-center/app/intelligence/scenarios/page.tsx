'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Download,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const scenarios = [
  {
    id: 1,
    title: 'Kwankwaso Endorses Candidate',
    probability: 65,
    impact: 'High',
    description: 'Kwankwaso publicly endorses our candidate, boosting NNPP crossover votes',
    vote_projection: { us: 45, opponent: 35, others: 20 },
    response: 'Prepare rally in Kano, leverage social media',
    status: 'monitoring',
  },
  {
    id: 2,
    title: 'APC Internal Crisis Escalates',
    probability: 45,
    impact: 'Medium',
    description: 'Factional fighting within APC leads to voter apathy',
    vote_projection: { us: 42, opponent: 32, others: 26 },
    response: 'Target disaffected APC voters with messaging',
    status: 'active',
  },
  {
    id: 3,
    title: 'Security Incident in Key LGA',
    probability: 25,
    impact: 'Critical',
    description: 'Major security incident affects turnout in stronghold LGA',
    vote_projection: { us: 38, opponent: 40, others: 22 },
    response: 'Deploy security resources, alternative voting plans',
    status: 'monitoring',
  },
  {
    id: 4,
    title: 'Opposition Coalition Forms',
    probability: 35,
    impact: 'High',
    description: 'APC and NNPP form tactical alliance against us',
    vote_projection: { us: 35, opponent: 45, others: 20 },
    response: 'Emphasize our independent track record',
    status: 'monitoring',
  },
];

const projectionData = [
  { month: 'Jan', base: 38, optimistic: 42, pessimistic: 35 },
  { month: 'Feb', base: 40, optimistic: 45, pessimistic: 36 },
  { month: 'Mar', base: 42, optimistic: 48, pessimistic: 38 },
  { month: 'Apr', base: 43, optimistic: 50, pessimistic: 39 },
  { month: 'May', base: 45, optimistic: 52, pessimistic: 40 },
  { month: 'Jun', base: 46, optimistic: 54, pessimistic: 41 },
];

const getImpactColor = (impact: string) => {
  switch (impact) {
    case 'Critical': return 'text-uradi-status-critical';
    case 'High': return 'text-uradi-status-warning';
    case 'Medium': return 'text-uradi-gold';
    case 'Low': return 'text-uradi-status-positive';
    default: return 'text-uradi-text-secondary';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active': return <Badge variant="success">Active</Badge>;
    case 'monitoring': return <Badge variant="warning">Monitoring</Badge>;
    case 'resolved': return <Badge variant="secondary">Resolved</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function ScenariosPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-uradi-text-primary">Scenario Modeling</h1>
          <p className="text-uradi-text-secondary mt-1">
            Simulate electoral outcomes and prepare response strategies
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Scenario
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Active Scenarios" value="12" change="+3" icon={Brain} color="uradi-status-info" />
        <StatCard title="Avg Probability" value="42%" change="+5%" icon={TrendingUp} color="uradi-gold" />
        <StatCard title="High Impact" value="4" change="Monitor" icon={AlertTriangle} color="uradi-status-warning" />
        <StatCard title="Projected Votes" value="45%" change="+2%" icon={CheckCircle} color="uradi-status-positive" />
      </div>

      <Tabs defaultValue="scenarios" className="space-y-6">
        <TabsList className="bg-uradi-bg-secondary border border-uradi-border">
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {scenarios.map((scenario) => (
              <Card key={scenario.id} className="bg-uradi-bg-secondary border-uradi-border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-uradi-text-primary">{scenario.title}</CardTitle>
                      <CardDescription className="mt-1">{scenario.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(scenario.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-uradi-text-tertiary uppercase">Probability</p>
                      <p className="text-2xl font-bold text-uradi-gold font-mono">{scenario.probability}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-uradi-text-tertiary uppercase">Impact</p>
                      <p className={`text-lg font-semibold ${getImpactColor(scenario.impact)}`}>{scenario.impact}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-uradi-text-tertiary uppercase mb-2">Vote Projection</p>
                    <div className="flex items-center gap-2 h-4">
                      <div
                        className="h-full bg-uradi-status-positive rounded-l"
                        style={{ width: `${scenario.vote_projection.us}%` }}
                      />
                      <div
                        className="h-full bg-uradi-status-critical"
                        style={{ width: `${scenario.vote_projection.opponent}%` }}
                      />
                      <div
                        className="h-full bg-uradi-text-tertiary rounded-r"
                        style={{ width: `${scenario.vote_projection.others}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-uradi-status-positive">Us: {scenario.vote_projection.us}%</span>
                      <span className="text-uradi-status-critical">Opp: {scenario.vote_projection.opponent}%</span>
                      <span className="text-uradi-text-tertiary">Other: {scenario.vote_projection.others}%</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-uradi-border">
                    <p className="text-xs text-uradi-text-tertiary uppercase mb-1">Response Plan</p>
                    <p className="text-sm text-uradi-text-secondary">{scenario.response}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="projections">
          <Card className="bg-uradi-bg-secondary border-uradi-border">
            <CardHeader>
              <CardTitle className="text-uradi-text-primary">Electoral Projection</CardTitle>
              <CardDescription>Vote share projections over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" domain={[30, 60]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#374151',
                        borderRadius: '8px',
                      }}
                      itemStyle={{ color: '#F9FAFB' }}
                    />
                    <Line type="monotone" dataKey="base" stroke="#C8A94E" strokeWidth={2} name="Base Case" />
                    <Line type="monotone" dataKey="optimistic" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" name="Optimistic" />
                    <Line type="monotone" dataKey="pessimistic" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" name="Pessimistic" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card className="bg-uradi-bg-secondary border-uradi-border">
            <CardHeader>
              <CardTitle className="text-uradi-text-primary">Scenario Comparison</CardTitle>
              <CardDescription>Compare outcomes across different scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={scenarios.map(s => ({
                      name: s.title.substring(0, 15) + '...',
                      us: s.vote_projection.us,
                      opponent: s.vote_projection.opponent,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#374151',
                        borderRadius: '8px',
                      }}
                      itemStyle={{ color: '#F9FAFB' }}
                    />
                    <Bar dataKey="us" fill="#10B981" name="Our Votes %" />
                    <Bar dataKey="opponent" fill="#EF4444" name="Opponent %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  change: string;
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
          <p className={`text-sm mt-1 ${colors.text}`}>{change}</p>
        </div>
        <div className={`p-2 rounded-lg ${colors.bg}`}>
          <Icon className={`h-5 w-5 ${colors.text}`} />
        </div>
      </div>
    </div>
  );
}
