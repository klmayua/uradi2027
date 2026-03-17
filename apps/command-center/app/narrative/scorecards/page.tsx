'use client';

import { useState } from 'react';
import {
  FileText,
  TrendingUp,
  Calendar,
  Download,
  Plus,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  Building2,
  Shield,
  Route,
  GraduationCap,
  HeartPulse,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Scorecard {
  id: string;
  title: string;
  period: string;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  metrics: {
    fiscal: { score: number; grade: string };
    security: { score: number; grade: string };
    infrastructure: { score: number; grade: string };
    education: { score: number; grade: string };
    health: { score: number; grade: string };
  };
}

const mockScorecards: Scorecard[] = [
  {
    id: '1',
    title: 'Q1 2026 Governance Scorecard',
    period: '2026-Q1',
    status: 'published',
    published_at: '2026-04-15',
    metrics: {
      fiscal: { score: 72, grade: 'B' },
      security: { score: 65, grade: 'C+' },
      infrastructure: { score: 78, grade: 'B+' },
      education: { score: 81, grade: 'A-' },
      health: { score: 74, grade: 'B' },
    },
  },
  {
    id: '2',
    title: 'Q4 2025 Governance Scorecard',
    period: '2025-Q4',
    status: 'archived',
    published_at: '2026-01-15',
    metrics: {
      fiscal: { score: 68, grade: 'C+' },
      security: { score: 62, grade: 'C' },
      infrastructure: { score: 71, grade: 'B-' },
      education: { score: 76, grade: 'B' },
      health: { score: 69, grade: 'C+' },
    },
  },
  {
    id: '3',
    title: 'Q3 2025 Governance Scorecard',
    period: '2025-Q3',
    status: 'archived',
    published_at: '2025-10-15',
    metrics: {
      fiscal: { score: 64, grade: 'C' },
      security: { score: 58, grade: 'D+' },
      infrastructure: { score: 66, grade: 'C+' },
      education: { score: 72, grade: 'B-' },
      health: { score: 65, grade: 'C' },
    },
  },
];

const getGradeColor = (grade: string) => {
  if (grade.startsWith('A')) return 'text-uradi-status-positive';
  if (grade.startsWith('B')) return 'text-uradi-gold';
  if (grade.startsWith('C')) return 'text-uradi-status-warning';
  return 'text-uradi-status-critical';
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'published':
      return <Badge variant="success">Published</Badge>;
    case 'draft':
      return <Badge variant="warning">Draft</Badge>;
    case 'archived':
      return <Badge variant="secondary">Archived</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function ScorecardsPage() {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-uradi-text-primary">Governance Scorecards</h1>
          <p className="text-uradi-text-secondary mt-1">
            Track and publish governance performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Scorecard
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-uradi-bg-secondary border-uradi-border">
              <DialogHeader>
                <DialogTitle className="text-uradi-text-primary">Create New Scorecard</DialogTitle>
              </DialogHeader>
              <ScorecardBuilder />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard title="Published" value="12" change="+2" icon={FileText} color="uradi-status-info" />
        <StatCard title="Avg Score" value="72.4" change="+4.2" icon={TrendingUp} color="uradi-status-positive" />
        <StatCard title="This Quarter" value="Q1 2026" change="Published" icon={Calendar} color="uradi-gold" />
        <StatCard title="Top Sector" value="Education" change="A-" icon={GraduationCap} color="uradi-status-positive" />
        <StatCard title="Needs Work" value="Security" change="C+" icon={Shield} color="uradi-status-warning" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-uradi-bg-secondary border border-uradi-border">
          <TabsTrigger value="list">Scorecards</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-uradi-border hover:bg-transparent">
                  <TableHead>Title</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Fiscal</TableHead>
                  <TableHead>Security</TableHead>
                  <TableHead>Infrastructure</TableHead>
                  <TableHead>Education</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockScorecards.map((scorecard) => (
                  <TableRow key={scorecard.id} className="border-uradi-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-uradi-gold/10 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-uradi-gold" />
                        </div>
                        <span className="font-medium text-uradi-text-primary">{scorecard.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-uradi-text-secondary">{scorecard.period}</TableCell>
                    <TableCell>
                      <GradeBadge grade={scorecard.metrics.fiscal.grade} score={scorecard.metrics.fiscal.score} />
                    </TableCell>
                    <TableCell>
                      <GradeBadge grade={scorecard.metrics.security.grade} score={scorecard.metrics.security.score} />
                    </TableCell>
                    <TableCell>
                      <GradeBadge
                        grade={scorecard.metrics.infrastructure.grade}
                        score={scorecard.metrics.infrastructure.score}
                      />
                    </TableCell>
                    <TableCell>
                      <GradeBadge
                        grade={scorecard.metrics.education.grade}
                        score={scorecard.metrics.education.score}
                      />
                    </TableCell>
                    <TableCell>
                      <GradeBadge grade={scorecard.metrics.health.grade} score={scorecard.metrics.health.score} />
                    </TableCell>
                    <TableCell>{getStatusBadge(scorecard.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="builder">
          <ScorecardBuilder />
        </TabsContent>

        <TabsContent value="trends">
          <Card className="bg-uradi-bg-secondary border-uradi-border">
            <CardHeader>
              <CardTitle className="text-uradi-text-primary">Score Trends by Sector</CardTitle>
              <CardDescription>Track governance performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { sector: 'Education', scores: [72, 76, 81], color: 'bg-uradi-status-positive' },
                  { sector: 'Infrastructure', scores: [66, 71, 78], color: 'bg-uradi-gold' },
                  { sector: 'Health', scores: [65, 69, 74], color: 'bg-uradi-status-info' },
                  { sector: 'Fiscal Transparency', scores: [64, 68, 72], color: 'bg-uradi-status-neutral' },
                  { sector: 'Security', scores: [58, 62, 65], color: 'bg-uradi-status-warning' },
                ].map((item) => (
                  <div key={item.sector} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-uradi-text-primary">{item.sector}</span>
                      <span className="text-sm font-mono text-uradi-gold">{item.scores[item.scores.length - 1]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.scores.map((score, i) => (
                        <div key={i} className="flex-1">
                          <div className="h-2 bg-uradi-bg-tertiary rounded-full overflow-hidden">
                            <div className={`h-full ${item.color}`} style={{ width: `${score}%` }} />
                          </div>
                          <p className="text-xs text-uradi-text-tertiary mt-1 text-center">Q{i + 3}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GradeBadge({ grade, score }: { grade: string; score: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-lg font-bold ${getGradeColor(grade)}`}>{grade}</span>
      <span className="text-xs text-uradi-text-tertiary">({score})</span>
    </div>
  );
}

function ScorecardBuilder() {
  const sectors = [
    { id: 'fiscal', name: 'Fiscal Transparency', icon: DollarSign, benchmark: 75 },
    { id: 'security', name: 'Security', icon: Shield, benchmark: 70 },
    { id: 'infrastructure', name: 'Infrastructure', icon: Route, benchmark: 80 },
    { id: 'education', name: 'Education', icon: GraduationCap, benchmark: 85 },
    { id: 'health', name: 'Health', icon: HeartPulse, benchmark: 75 },
  ];

  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">Title</label>
          <Input placeholder="e.g., Q2 2026 Governance Scorecard" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">Period</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
              <SelectItem value="2026-q2">Q2 2026</SelectItem>
              <SelectItem value="2026-q3">Q3 2026</SelectItem>
              <SelectItem value="2026-q4">Q4 2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-uradi-text-primary">Sector Metrics</h3>
        {sectors.map((sector) => {
          const Icon = sector.icon;
          return (
            <div key={sector.id} className="p-4 border border-uradi-border rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-uradi-bg-tertiary flex items-center justify-center">
                  <Icon className="h-4 w-4 text-uradi-gold" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-uradi-text-primary">{sector.name}</p>
                  <p className="text-xs text-uradi-text-tertiary">Benchmark: {sector.benchmark}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-uradi-text-tertiary">Current Value</label>
                  <Input type="number" placeholder="0-100" className="h-8" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-uradi-text-tertiary">Benchmark</label>
                  <Input type="number" defaultValue={sector.benchmark} className="h-8" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-uradi-text-tertiary">Grade</label>
                  <Select>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                      {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'].map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <label className="text-sm text-uradi-text-secondary">Executive Summary</label>
        <textarea
          className="w-full min-h-[100px] rounded-lg border border-uradi-border bg-uradi-bg-primary px-3 py-2 text-sm text-uradi-text-primary placeholder:text-uradi-text-tertiary focus:outline-none focus:ring-2 focus:ring-uradi-gold/50 focus:border-uradi-gold"
          placeholder="Write a summary of this period's performance..."
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Save Draft</Button>
        <Button>Publish Scorecard</Button>
      </div>
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
