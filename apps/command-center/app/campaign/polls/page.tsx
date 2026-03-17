'use client';

import { useState } from 'react';
import {
  BarChart3,
  PieChart,
  Users,
  CheckCircle,
  Clock,
  Plus,
  MoreHorizontal,
  Filter,
  Download,
  TrendingUp,
  MapPin,
  Calendar,
  Eye,
  Edit3,
  Copy,
  Trash2,
  Send,
  MessageSquare,
  Smartphone,
  CheckSquare,
  Radio,
  AlertCircle,
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

interface Poll {
  id: string;
  title: string;
  type: 'opinion' | 'preference' | 'approval' | 'issue';
  status: 'draft' | 'active' | 'closed' | 'archived';
  responses: number;
  target: number;
  started_at?: string;
  ends_at?: string;
  questions: number;
  completion_rate: number;
  top_result?: string;
}

const mockPolls: Poll[] = [
  {
    id: '1',
    title: 'Top Issues Survey - March 2026',
    type: 'issue',
    status: 'active',
    responses: 8934,
    target: 10000,
    started_at: '2026-03-10',
    ends_at: '2026-03-20',
    questions: 5,
    completion_rate: 87.3,
    top_result: 'Employment',
  },
  {
    id: '2',
    title: 'Candidate Approval Rating',
    type: 'approval',
    status: 'active',
    responses: 12450,
    target: 15000,
    started_at: '2026-03-01',
    ends_at: '2026-03-31',
    questions: 3,
    completion_rate: 92.1,
    top_result: 'Approve: 68%',
  },
  {
    id: '3',
    title: 'Policy Preference: Healthcare vs Education',
    type: 'preference',
    status: 'closed',
    responses: 5620,
    target: 5000,
    started_at: '2026-02-15',
    ends_at: '2026-02-25',
    questions: 2,
    completion_rate: 95.4,
    top_result: 'Education: 54%',
  },
  {
    id: '4',
    title: 'Voter Turnout Intention',
    type: 'opinion',
    status: 'draft',
    responses: 0,
    target: 20000,
    questions: 4,
    completion_rate: 0,
  },
  {
    id: '5',
    title: 'Youth Engagement Survey',
    type: 'issue',
    status: 'closed',
    responses: 3420,
    target: 5000,
    started_at: '2026-02-01',
    ends_at: '2026-02-10',
    questions: 6,
    completion_rate: 78.2,
    top_result: 'Education',
  },
];

const getTypeBadge = (type: string) => {
  switch (type) {
    case 'opinion': return <Badge variant="secondary">Opinion</Badge>;
    case 'preference': return <Badge className="bg-uradi-gold/20 text-uradi-gold">Preference</Badge>;
    case 'approval': return <Badge className="bg-uradi-status-info/20 text-uradi-status-info">Approval</Badge>;
    case 'issue': return <Badge className="bg-uradi-status-positive/20 text-uradi-status-positive">Issue</Badge>;
    default: return <Badge variant="secondary">{type}</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active': return <Badge variant="success">Active</Badge>;
    case 'draft': return <Badge variant="secondary">Draft</Badge>;
    case 'closed': return <Badge className="bg-uradi-status-warning/20 text-uradi-status-warning">Closed</Badge>;
    case 'archived': return <Badge variant="secondary">Archived</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function PollsPage() {
  const [activeTab, setActiveTab] = useState('polls');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-uradi-text-primary">Polls & Surveys</h1>
          <p className="text-uradi-text-secondary mt-1">
            Create polls, gather voter opinions, and analyze survey results
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Results
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Poll
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl bg-uradi-bg-secondary border-uradi-border">
              <DialogHeader>
                <DialogTitle className="text-uradi-text-primary">Create New Poll</DialogTitle>
              </DialogHeader>
              <PollBuilder />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard title="Active Polls" value="2" change="Running" icon={BarChart3} color="uradi-status-info" />
        <StatCard title="Total Responses" value="30.4K" change="+5.2K" icon={Users} color="uradi-status-positive" />
        <StatCard title="Avg Completion" value="88.2%" change="+3.1%" icon={CheckCircle} color="uradi-gold" />
        <StatCard title="Response Rate" value="24.5%" change="+2.8%" icon={TrendingUp} color="uradi-status-neutral" />
        <StatCard title="Top Issue" value="Jobs" change="42% mention" icon={AlertCircle} color="uradi-status-warning" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-uradi-bg-secondary border border-uradi-border">
          <TabsTrigger value="polls">Polls</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="polls" className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 p-4 bg-uradi-bg-secondary border border-uradi-border rounded-xl">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Filter className="h-4 w-4 text-uradi-text-tertiary" />
              <Input placeholder="Search polls..." className="flex-1" />
            </div>

            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="opinion">Opinion</SelectItem>
                <SelectItem value="preference">Preference</SelectItem>
                <SelectItem value="approval">Approval</SelectItem>
                <SelectItem value="issue">Issue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-uradi-border hover:bg-transparent">
                  <TableHead>Poll</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Responses</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead>Top Result</TableHead>
                  <TableHead>Ends</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPolls.map((poll) => (
                  <TableRow key={poll.id} className="border-uradi-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-uradi-gold/10 flex items-center justify-center">
                          <BarChart3 className="h-4 w-4 text-uradi-gold" />
                        </div>
                        <div>
                          <p className="font-medium text-uradi-text-primary">{poll.title}</p>
                          <p className="text-xs text-uradi-text-tertiary">{poll.questions} questions</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(poll.type)}</TableCell>
                    <TableCell>{getStatusBadge(poll.status)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-uradi-text-primary">
                          {poll.responses.toLocaleString()}
                        </span>
                        <span className="text-xs text-uradi-text-tertiary">
                          of {poll.target.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-uradi-bg-tertiary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-uradi-status-positive"
                            style={{ width: `${poll.completion_rate}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono text-uradi-text-secondary">
                          {poll.completion_rate}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-uradi-text-secondary">
                      {poll.top_result || '-'}
                    </TableCell>
                    <TableCell className="text-uradi-text-secondary">
                      {poll.ends_at || '-'}
                    </TableCell>
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

        <TabsContent value="results">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Top Issues Survey Results</CardTitle>
                <CardDescription>What matters most to voters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { issue: 'Employment/Jobs', percentage: 42, count: 3750 },
                  { issue: 'Education', percentage: 28, count: 2500 },
                  { issue: 'Healthcare', percentage: 18, count: 1608 },
                  { issue: 'Security', percentage: 8, count: 715 },
                  { issue: 'Infrastructure', percentage: 4, count: 361 },
                ].map((item) => (
                  <div key={item.issue} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-uradi-text-primary">{item.issue}</span>
                      <div className="text-right">
                        <span className="text-sm font-mono text-uradi-gold">{item.percentage}%</span>
                        <span className="text-xs text-uradi-text-tertiary ml-2">({item.count.toLocaleString()})</span>
                      </div>
                    </div>
                    <div className="h-3 bg-uradi-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-uradi-gold"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Candidate Approval Rating</CardTitle>
                <CardDescription>Current approval status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-uradi-status-positive relative">
                    <span className="text-3xl font-bold text-uradi-status-positive">68%</span>
                  </div>
                  <p className="text-lg text-uradi-text-primary mt-4">Approval Rating</p>
                  <p className="text-sm text-uradi-text-secondary">Based on 12,450 responses</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-uradi-text-secondary">Strongly Approve</span>
                    <span className="text-sm font-mono text-uradi-status-positive">42%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-uradi-text-secondary">Somewhat Approve</span>
                    <span className="text-sm font-mono text-uradi-gold">26%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-uradi-text-secondary">Somewhat Disapprove</span>
                    <span className="text-sm font-mono text-uradi-status-warning">18%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-uradi-text-secondary">Strongly Disapprove</span>
                    <span className="text-sm font-mono text-uradi-status-critical">14%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="builder">
          <PollBuilder />
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Response by LGA</CardTitle>
                <CardDescription>Top participating areas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { lga: 'Dutse', responses: 3240, percentage: 36 },
                  { lga: 'Hadejia', responses: 1890, percentage: 21 },
                  { lga: 'Gumel', responses: 1245, percentage: 14 },
                  { lga: 'Kazaure', responses: 980, percentage: 11 },
                  { lga: 'Others', responses: 1579, percentage: 18 },
                ].map((item) => (
                  <div key={item.lga} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-uradi-gold" />
                      <span className="text-sm text-uradi-text-primary">{item.lga}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono text-uradi-text-primary">
                        {item.responses.toLocaleString()}
                      </span>
                      <span className="text-xs text-uradi-text-tertiary ml-2">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Demographics</CardTitle>
                <CardDescription>Response by age group</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { age: '18-25', percentage: 32, color: 'bg-uradi-status-positive' },
                  { age: '26-35', percentage: 28, color: 'bg-uradi-gold' },
                  { age: '36-50', percentage: 24, color: 'bg-uradi-status-info' },
                  { age: '50+', percentage: 16, color: 'bg-uradi-status-neutral' },
                ].map((item) => (
                  <div key={item.age} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-uradi-text-primary">{item.age}</span>
                      <span className="text-sm font-mono text-uradi-text-secondary">{item.percentage}%</span>
                    </div>
                    <div className="h-2 bg-uradi-bg-tertiary rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Trending Topics</CardTitle>
                <CardDescription>Emerging issues from open responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[
                    { term: 'Youth Employment', count: 1240 },
                    { term: 'Healthcare Access', count: 890 },
                    { term: 'Education Reform', count: 756 },
                    { term: 'Road Infrastructure', count: 623 },
                    { term: 'Security', count: 534 },
                    { term: 'Women Empowerment', count: 445 },
                    { term: 'Agriculture', count: 389 },
                    { term: 'Electricity', count: 312 },
                  ].map((topic) => (
                    <Badge
                      key={topic.term}
                      variant="secondary"
                      className="text-sm py-1 px-3"
                    >
                      {topic.term}
                      <span className="ml-2 text-uradi-gold">{topic.count}</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PollBuilder() {
  return (
    <div className="space-y-6 mt-4">
      <div className="space-y-2">
        <label className="text-sm text-uradi-text-secondary">Poll Title</label>
        <Input placeholder="e.g., Top Issues Survey - March 2026" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">Poll Type</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
              <SelectItem value="opinion">Opinion Poll</SelectItem>
              <SelectItem value="preference">Preference Poll</SelectItem>
              <SelectItem value="approval">Approval Rating</SelectItem>
              <SelectItem value="issue">Issue Survey</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">Target Responses</label>
          <Input type="number" placeholder="e.g., 10000" />
        </div>
      </div>

      <div className="border border-uradi-border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-uradi-text-primary">Questions</h3>
          <Button size="sm" variant="outline" className="gap-1">
            <Plus className="h-3 w-3" />
            Add Question
          </Button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-uradi-bg-tertiary rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-uradi-gold">Q1</span>
              <Input
                defaultValue="What is the most important issue for you?"
                className="flex-1"
              />
            </div>
            <div className="pl-6 space-y-2">
              {['Employment/Jobs', 'Education', 'Healthcare', 'Security', 'Infrastructure'].map((option) => (
                <div key={option} className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-uradi-text-tertiary" />
                  <Input defaultValue={option} className="flex-1 h-8" />
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-uradi-bg-tertiary rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-uradi-gold">Q2</span>
              <Input
                defaultValue="How would you rate the candidate's performance?"
                className="flex-1"
              />
            </div>
            <div className="pl-6 space-y-2">
              {['Excellent', 'Good', 'Fair', 'Poor'].map((option) => (
                <div key={option} className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-uradi-text-tertiary" />
                  <Input defaultValue={option} className="flex-1 h-8" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">Start Date</label>
          <Input type="date" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">End Date</label>
          <Input type="date" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-uradi-text-secondary">Distribution Channels</label>
        <div className="flex flex-wrap gap-2">
          {['USSD', 'WhatsApp', 'SMS', 'Web Link', 'Field Agents'].map((channel) => (
            <Badge
              key={channel}
              variant="secondary"
              className="cursor-pointer hover:bg-uradi-gold/20 hover:text-uradi-gold px-3 py-1"
            >
              {channel}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Save Draft</Button>
        <Button className="gap-2">
          <Send className="h-4 w-4" />
          Launch Poll
        </Button>
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
