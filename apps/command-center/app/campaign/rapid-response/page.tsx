'use client';

import { useState } from 'react';
import {
  Zap,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Send,
  Users,
  TrendingUp,
  TrendingDown,
  Plus,
  MoreHorizontal,
  Filter,
  Download,
  Shield,
  Radio,
  FileText,
  Phone,
  Video,
  Eye,
  Edit3,
  Trash2,
  Play,
  Pause,
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

interface Incident {
  id: string;
  title: string;
  type: 'attack' | 'rumor' | 'opportunity' | 'crisis';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'new' | 'analyzing' | 'responding' | 'resolved' | 'monitoring';
  description: string;
  detected_at: string;
  response_time?: string;
  assigned_to?: string;
  actions_taken: string[];
  sentiment_impact: number;
}

const mockIncidents: Incident[] = [
  {
    id: '1',
    title: 'Opponent Claims on Infrastructure',
    type: 'attack',
    severity: 'high',
    status: 'responding',
    description: 'Opposition candidate made false claims about our infrastructure record',
    detected_at: '2026-03-16 14:23',
    response_time: '12 min',
    assigned_to: 'Communications Team',
    actions_taken: ['Fact-check prepared', 'Counter-messaging drafted', 'Social media response queued'],
    sentiment_impact: -5.2,
  },
  {
    id: '2',
    title: 'Fake News: Candidate Health',
    type: 'rumor',
    severity: 'critical',
    status: 'analyzing',
    description: 'Rumors circulating about candidate health issues on WhatsApp',
    detected_at: '2026-03-16 13:45',
    assigned_to: 'Digital Team',
    actions_taken: ['Monitoring spread', 'Preparing clarification video'],
    sentiment_impact: -8.7,
  },
  {
    id: '3',
    title: 'Endorsement from Youth Leader',
    type: 'opportunity',
    severity: 'medium',
    status: 'responding',
    description: 'Popular youth influencer posted positive message about our education policy',
    detected_at: '2026-03-16 12:30',
    response_time: '8 min',
    assigned_to: 'Social Media Team',
    actions_taken: ['Amplified post', 'Created graphic', 'Scheduled follow-up content'],
    sentiment_impact: +12.3,
  },
  {
    id: '4',
    title: 'Security Incident at Rally Venue',
    type: 'crisis',
    severity: 'critical',
    status: 'resolved',
    description: 'Minor security concern reported at upcoming rally location',
    detected_at: '2026-03-16 10:15',
    response_time: '45 min',
    assigned_to: 'Security Team',
    actions_taken: ['Venue secured', 'Additional personnel deployed', 'Statement prepared'],
    sentiment_impact: -2.1,
  },
  {
    id: '5',
    title: 'Policy Misrepresentation',
    type: 'attack',
    severity: 'medium',
    status: 'monitoring',
    description: 'Opposition misrepresenting our healthcare policy stance',
    detected_at: '2026-03-15 16:20',
    response_time: '1 hour',
    assigned_to: 'Policy Team',
    actions_taken: ['Clarification issued', 'Policy document shared'],
    sentiment_impact: -1.8,
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'attack': return Shield;
    case 'rumor': return AlertTriangle;
    case 'opportunity': return Zap;
    case 'crisis': return Radio;
    default: return AlertTriangle;
  }
};

const getTypeBadge = (type: string) => {
  switch (type) {
    case 'attack': return <Badge variant="destructive">Attack</Badge>;
    case 'rumor': return <Badge variant="warning">Rumor</Badge>;
    case 'opportunity': return <Badge className="bg-uradi-status-positive/20 text-uradi-status-positive">Opportunity</Badge>;
    case 'crisis': return <Badge className="bg-uradi-status-critical/20 text-uradi-status-critical">Crisis</Badge>;
    default: return <Badge variant="secondary">{type}</Badge>;
  }
};

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'critical': return <Badge className="bg-red-600">Critical</Badge>;
    case 'high': return <Badge variant="destructive">High</Badge>;
    case 'medium': return <Badge variant="warning">Medium</Badge>;
    case 'low': return <Badge variant="secondary">Low</Badge>;
    default: return <Badge variant="secondary">{severity}</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'new': return <Badge className="bg-uradi-status-info/20 text-uradi-status-info animate-pulse">New</Badge>;
    case 'analyzing': return <Badge variant="warning">Analyzing</Badge>;
    case 'responding': return <Badge className="bg-uradi-gold/20 text-uradi-gold">Responding</Badge>;
    case 'resolved': return <Badge variant="success">Resolved</Badge>;
    case 'monitoring': return <Badge variant="secondary">Monitoring</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function RapidResponsePage() {
  const [activeTab, setActiveTab] = useState('incidents');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-uradi-text-primary">Rapid Response</h1>
          <p className="text-uradi-text-secondary mt-1">
            Monitor, analyze, and respond to campaign incidents in real-time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Log Incident
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-uradi-bg-secondary border-uradi-border">
              <DialogHeader>
                <DialogTitle className="text-uradi-text-primary">Log New Incident</DialogTitle>
              </DialogHeader>
              <IncidentForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard title="Active Incidents" value="8" change="+3 today" icon={AlertTriangle} color="uradi-status-critical" />
        <StatCard title="Avg Response Time" value="18 min" change="-5 min" icon={Clock} color="uradi-status-positive" />
        <StatCard title="Resolved Today" value="12" change="On track" icon={CheckCircle} color="uradi-gold" />
        <StatCard title="Sentiment Impact" value="-2.4%" change="Monitor" icon={TrendingDown} color="uradi-status-warning" />
        <StatCard title="Team Online" value="24" change="8 teams" icon={Users} color="uradi-status-neutral" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-uradi-bg-secondary border border-uradi-border">
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="playbook">Response Playbook</TabsTrigger>
          <TabsTrigger value="team">Response Team</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 p-4 bg-uradi-bg-secondary border border-uradi-border rounded-xl">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Filter className="h-4 w-4 text-uradi-text-tertiary" />
              <Input placeholder="Search incidents..." className="flex-1" />
            </div>

            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="attack">Attack</SelectItem>
                <SelectItem value="rumor">Rumor</SelectItem>
                <SelectItem value="opportunity">Opportunity</SelectItem>
                <SelectItem value="crisis">Crisis</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="analyzing">Analyzing</SelectItem>
                <SelectItem value="responding">Responding</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-uradi-border hover:bg-transparent">
                  <TableHead>Incident</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Detected</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockIncidents.map((incident) => {
                  const TypeIcon = getTypeIcon(incident.type);
                  return (
                    <TableRow key={incident.id} className="border-uradi-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                            incident.type === 'opportunity' ? 'bg-uradi-status-positive/10' : 'bg-uradi-status-critical/10'
                          }`}>
                            <TypeIcon className={`h-4 w-4 ${
                              incident.type === 'opportunity' ? 'text-uradi-status-positive' : 'text-uradi-status-critical'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-uradi-text-primary">{incident.title}</p>
                            <p className="text-xs text-uradi-text-tertiary truncate max-w-[200px]">
                              {incident.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(incident.type)}</TableCell>
                      <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                      <TableCell>{getStatusBadge(incident.status)}</TableCell>
                      <TableCell className="text-uradi-text-secondary">{incident.detected_at}</TableCell>
                      <TableCell className="text-uradi-text-secondary">
                        {incident.response_time || '-'}
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-mono ${
                          incident.sentiment_impact > 0 ? 'text-uradi-status-positive' : 'text-uradi-status-critical'
                        }`}>
                          {incident.sentiment_impact > 0 ? '+' : ''}{incident.sentiment_impact}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="playbook">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { type: 'attack', title: 'Opposition Attack Response', steps: ['Verify facts', 'Prepare counter-evidence', 'Draft response', 'Get approval', 'Deploy across channels'], avgTime: '15 min' },
              { type: 'rumor', title: 'Fake News Response', steps: ['Track spread', 'Prepare clarification', 'Deploy fact-check', 'Monitor sentiment', 'Follow up'], avgTime: '30 min' },
              { type: 'opportunity', title: 'Positive Moment Amplification', steps: ['Verify authenticity', 'Create content', 'Deploy quickly', 'Engage influencers', 'Track reach'], avgTime: '10 min' },
              { type: 'crisis', title: 'Crisis Management', steps: ['Assess severity', 'Alert leadership', 'Prepare statement', 'Coordinate response', 'Monitor media'], avgTime: '45 min' },
            ].map((playbook) => {
              const TypeIcon = getTypeIcon(playbook.type);
              return (
                <Card key={playbook.title} className="bg-uradi-bg-secondary border-uradi-border">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-uradi-gold/10 flex items-center justify-center">
                          <TypeIcon className="h-5 w-5 text-uradi-gold" />
                        </div>
                        <div>
                          <h3 className="font-medium text-uradi-text-primary">{playbook.title}</h3>
                          <p className="text-sm text-uradi-text-secondary">Avg response: {playbook.avgTime}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">View</Button>
                    </div>

                    <div className="space-y-2">
                      {playbook.steps.map((step, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="h-6 w-6 rounded-full bg-uradi-bg-tertiary flex items-center justify-center text-xs text-uradi-gold font-medium">
                            {i + 1}
                          </div>
                          <span className="text-sm text-uradi-text-secondary">{step}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="team">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Communications Team', lead: 'Amina Hassan', members: 8, active: 6, avgResponse: '12 min' },
              { name: 'Digital Team', lead: 'Ibrahim Yusuf', members: 12, active: 10, avgResponse: '8 min' },
              { name: 'Policy Team', lead: 'Dr. Musa Danladi', members: 5, active: 4, avgResponse: '25 min' },
              { name: 'Security Team', lead: 'Alhaji Abubakar', members: 6, active: 6, avgResponse: '15 min' },
              { name: 'Social Media Team', lead: 'Fatima Abdullahi', members: 10, active: 8, avgResponse: '6 min' },
              { name: 'Field Operations', lead: 'Yusuf Ibrahim', members: 15, active: 12, avgResponse: '20 min' },
            ].map((team) => (
              <Card key={team.name} className="bg-uradi-bg-secondary border-uradi-border">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-uradi-text-primary">{team.name}</h3>
                      <p className="text-sm text-uradi-text-secondary">Lead: {team.lead}</p>
                    </div>
                    <Badge variant="success" className="animate-pulse">{team.active}/{team.members} online</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-2 bg-uradi-bg-tertiary rounded-lg">
                      <p className="text-lg font-bold text-uradi-text-primary">{team.members}</p>
                      <p className="text-xs text-uradi-text-tertiary">Members</p>
                    </div>
                    <div className="p-2 bg-uradi-bg-tertiary rounded-lg">
                      <p className="text-lg font-bold text-uradi-gold">{team.avgResponse}</p>
                      <p className="text-xs text-uradi-text-tertiary">Avg Response</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Incidents by Type</CardTitle>
                <CardDescription>Distribution over last 30 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { type: 'Attack', count: 45, color: 'bg-uradi-status-critical' },
                  { type: 'Rumor', count: 32, color: 'bg-uradi-status-warning' },
                  { type: 'Opportunity', count: 28, color: 'bg-uradi-status-positive' },
                  { type: 'Crisis', count: 8, color: 'bg-uradi-status-info' },
                ].map((item) => (
                  <div key={item.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-uradi-text-primary">{item.type}</span>
                      <span className="text-sm font-mono text-uradi-text-secondary">{item.count}</span>
                    </div>
                    <div className="h-2 bg-uradi-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color}`}
                        style={{ width: `${(item.count / 45) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Response Performance</CardTitle>
                <CardDescription>Team response times (minutes)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { team: 'Social Media', time: 6, target: 10 },
                  { team: 'Digital', time: 8, target: 15 },
                  { team: 'Communications', time: 12, target: 15 },
                  { team: 'Security', time: 15, target: 20 },
                  { team: 'Field Ops', time: 20, target: 25 },
                  { team: 'Policy', time: 25, target: 30 },
                ].map((item) => (
                  <div key={item.team} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-uradi-text-primary">{item.team}</span>
                      <span className={`text-sm font-mono ${
                        item.time <= item.target ? 'text-uradi-status-positive' : 'text-uradi-status-warning'
                      }`}>
                        {item.time}m
                      </span>
                    </div>
                    <div className="h-2 bg-uradi-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          item.time <= item.target ? 'bg-uradi-status-positive' : 'bg-uradi-status-warning'
                        }`}
                        style={{ width: `${(item.time / 30) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function IncidentForm() {
  return (
    <div className="space-y-6 mt-4">
      <div className="space-y-2">
        <label className="text-sm text-uradi-text-secondary">Incident Title</label>
        <Input placeholder="Brief description of the incident" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">Type</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
              <SelectItem value="attack">Opposition Attack</SelectItem>
              <SelectItem value="rumor">Rumor/Fake News</SelectItem>
              <SelectItem value="opportunity">Opportunity</SelectItem>
              <SelectItem value="crisis">Crisis</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">Severity</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-uradi-text-secondary">Description</label>
        <textarea
          className="w-full min-h-[100px] rounded-lg border border-uradi-border bg-uradi-bg-primary px-3 py-2 text-sm text-uradi-text-primary placeholder:text-uradi-text-tertiary focus:outline-none focus:ring-2 focus:ring-uradi-gold/50 focus:border-uradi-gold"
          placeholder="Detailed description of the incident..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-uradi-text-secondary">Assign To</label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select team" />
          </SelectTrigger>
          <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
            <SelectItem value="communications">Communications Team</SelectItem>
            <SelectItem value="digital">Digital Team</SelectItem>
            <SelectItem value="policy">Policy Team</SelectItem>
            <SelectItem value="security">Security Team</SelectItem>
            <SelectItem value="social">Social Media Team</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button className="gap-2">
          <AlertTriangle className="h-4 w-4" />
          Log Incident
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
