'use client';

import { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  Phone,
  MessageSquare,
  FileText,
  Plus,
  MoreHorizontal,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit3,
  Trash2,
  Send,
  ChevronRight,
  Activity,
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

interface ElectionIncident {
  id: string;
  title: string;
  category: 'security' | 'logistics' | 'violence' | 'fraud' | 'technical';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'reported' | 'investigating' | 'escalated' | 'resolved' | 'closed';
  location: string;
  reported_by: string;
  reported_at: string;
  assigned_to?: string;
  description: string;
  actions: string[];
}

const mockIncidents: ElectionIncident[] = [
  {
    id: 'INC-001',
    title: 'Security Threat at Polling Unit',
    category: 'security',
    severity: 'critical',
    status: 'escalated',
    location: 'Dutse, Ward 3, PU 001',
    reported_by: 'Monitor: Ibrahim Musa',
    reported_at: '2026-03-16 08:45',
    assigned_to: 'Security Team',
    description: 'Suspicious activity reported near polling unit. Security personnel deployed.',
    actions: ['Security notified', 'Police dispatched', 'Area secured'],
  },
  {
    id: 'INC-002',
    title: 'Ballot Paper Shortage',
    category: 'logistics',
    severity: 'high',
    status: 'resolved',
    location: 'Hadejia, Ward 2, PU 005',
    reported_by: 'Monitor: Yusuf Abubakar',
    reported_at: '2026-03-16 09:30',
    assigned_to: 'Logistics Team',
    description: 'Insufficient ballot papers delivered to polling unit.',
    actions: ['Additional ballots requested', 'Delivered at 10:15', 'Voting resumed'],
  },
  {
    id: 'INC-003',
    title: 'Voter Intimidation Report',
    category: 'violence',
    severity: 'high',
    status: 'investigating',
    location: 'Gumel, Ward 1, PU 003',
    reported_by: 'Monitor: Fatima Danladi',
    reported_at: '2026-03-16 10:15',
    assigned_to: 'Security Team',
    description: 'Allegations of voter intimidation by unknown individuals.',
    actions: ['Investigation ongoing', 'Witness statements collected'],
  },
  {
    id: 'INC-004',
    title: 'Card Reader Malfunction',
    category: 'technical',
    severity: 'medium',
    status: 'resolved',
    location: 'Kazaure, Ward 4, PU 008',
    reported_by: 'Monitor: Musa Ibrahim',
    reported_at: '2026-03-16 11:00',
    assigned_to: 'Tech Team',
    description: 'Card reader not functioning properly.',
    actions: ['Technician dispatched', 'Device replaced', 'Functioning normally'],
  },
  {
    id: 'INC-005',
    title: 'Alleged Vote Buying',
    category: 'fraud',
    severity: 'high',
    status: 'investigating',
    location: 'Dutse, Ward 5, PU 012',
    reported_by: 'Monitor: Amina Hassan',
    reported_at: '2026-03-16 12:30',
    assigned_to: 'Legal Team',
    description: 'Reports of money being distributed to voters.',
    actions: ['Evidence collected', 'Photos documented', 'Under review'],
  },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'security':
      return Shield;
    case 'logistics':
      return FileText;
    case 'violence':
      return AlertTriangle;
    case 'fraud':
      return Eye;
    case 'technical':
      return Activity;
    default:
      return AlertCircle;
  }
};

const getCategoryBadge = (category: string) => {
  switch (category) {
    case 'security':
      return <Badge className="bg-red-600">Security</Badge>;
    case 'logistics':
      return <Badge className="bg-uradi-status-info">Logistics</Badge>;
    case 'violence':
      return <Badge variant="destructive">Violence</Badge>;
    case 'fraud':
      return <Badge className="bg-uradi-status-warning">Fraud</Badge>;
    case 'technical':
      return <Badge variant="secondary">Technical</Badge>;
    default:
      return <Badge variant="secondary">{category}</Badge>;
  }
};

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <Badge className="bg-red-600 animate-pulse">Critical</Badge>;
    case 'high':
      return <Badge variant="destructive">High</Badge>;
    case 'medium':
      return <Badge variant="warning">Medium</Badge>;
    case 'low':
      return <Badge variant="secondary">Low</Badge>;
    default:
      return <Badge variant="secondary">{severity}</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'reported':
      return <Badge className="bg-uradi-status-info/20 text-uradi-status-info">Reported</Badge>;
    case 'investigating':
      return <Badge variant="warning">Investigating</Badge>;
    case 'escalated':
      return <Badge className="bg-uradi-status-critical/20 text-uradi-status-critical animate-pulse">Escalated</Badge>;
    case 'resolved':
      return <Badge variant="success">Resolved</Badge>;
    case 'closed':
      return <Badge variant="secondary">Closed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function IncidentsPage() {
  const [activeTab, setActiveTab] = useState('active');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-uradi-text-primary">Incident Management</h1>
          <p className="text-uradi-text-secondary mt-1">
            Track and manage election day incidents and security issues
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
                Report Incident
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-uradi-bg-secondary border-uradi-border">
              <DialogHeader>
                <DialogTitle className="text-uradi-text-primary">Report New Incident</DialogTitle>
              </DialogHeader>
              <IncidentForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard title="Total Incidents" value="23" change="+5 today" icon={AlertCircle} color="uradi-status-info" />
        <StatCard title="Critical" value="3" change="Requires attention" icon={AlertTriangle} color="uradi-status-critical" />
        <StatCard title="Resolved" value="12" change="52% resolved" icon={CheckCircle} color="uradi-status-positive" />
        <StatCard title="Avg Response" value="18 min" change="-5 min" icon={Clock} color="uradi-gold" />
        <StatCard title="Security Teams" value="8" change="On standby" icon={Shield} color="uradi-status-neutral" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-uradi-bg-secondary border border-uradi-border">
          <TabsTrigger value="active">Active Incidents</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="teams">Response Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 p-4 bg-uradi-bg-secondary border border-uradi-border rounded-xl">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Filter className="h-4 w-4 text-uradi-text-tertiary" />
              <Input placeholder="Search incidents..." className="flex-1" />
            </div>

            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="logistics">Logistics</SelectItem>
                <SelectItem value="violence">Violence</SelectItem>
                <SelectItem value="fraud">Fraud</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
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
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-uradi-border hover:bg-transparent">
                  <TableHead>Incident</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockIncidents.filter(i => i.status !== 'resolved' && i.status !== 'closed').map((incident) => {
                  const CategoryIcon = getCategoryIcon(incident.category);
                  return (
                    <TableRow key={incident.id} className="border-uradi-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-uradi-gold/10 flex items-center justify-center">
                            <CategoryIcon className="h-4 w-4 text-uradi-gold" />
                          </div>
                          <div>
                            <p className="font-medium text-uradi-text-primary">{incident.title}</p>
                            <p className="text-xs text-uradi-text-tertiary">{incident.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(incident.category)}</TableCell>
                      <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                      <TableCell className="text-uradi-text-secondary">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {incident.location}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(incident.status)}</TableCell>
                      <TableCell className="text-uradi-text-secondary">{incident.reported_at}</TableCell>
                      <TableCell className="text-uradi-text-secondary">{incident.assigned_to || '-'}</TableCell>
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

        <TabsContent value="resolved">
          <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-uradi-border hover:bg-transparent">
                  <TableHead>Incident</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Resolved At</TableHead>
                  <TableHead>Resolution Time</TableHead>
                  <TableHead>Actions Taken</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockIncidents.filter(i => i.status === 'resolved' || i.status === 'closed').map((incident) => (
                  <TableRow key={incident.id} className="border-uradi-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-uradi-status-positive" />
                        <div>
                          <p className="font-medium text-uradi-text-primary">{incident.title}</p>
                          <p className="text-xs text-uradi-text-tertiary">{incident.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryBadge(incident.category)}</TableCell>
                    <TableCell className="text-uradi-text-secondary">{incident.location}</TableCell>
                    <TableCell className="text-uradi-text-secondary">{incident.reported_at}</TableCell>
                    <TableCell>
                      <Badge variant="success">45 min</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {incident.actions.slice(0, 2).map((action, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{action}</Badge>
                        ))}
                        {incident.actions.length > 2 && (
                          <Badge variant="secondary" className="text-xs">+{incident.actions.length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Incidents by Category</CardTitle>
                <CardDescription>Distribution of incident types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { category: 'Security', count: 8, color: 'bg-red-600' },
                  { category: 'Logistics', count: 6, color: 'bg-uradi-status-info' },
                  { category: 'Violence', count: 4, color: 'bg-uradi-status-critical' },
                  { category: 'Fraud', count: 3, color: 'bg-uradi-status-warning' },
                  { category: 'Technical', count: 2, color: 'bg-uradi-text-tertiary' },
                ].map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-uradi-text-primary">{item.category}</span>
                      <span className="text-sm font-mono text-uradi-text-secondary">{item.count}</span>
                    </div>
                    <div className="h-2 bg-uradi-bg-tertiary rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${(item.count / 8) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Response Performance</CardTitle>
                <CardDescription>Average resolution time by category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { category: 'Technical', time: 25, target: 30 },
                  { category: 'Logistics', time: 45, target: 60 },
                  { category: 'Security', time: 35, target: 30 },
                  { category: 'Violence', time: 90, target: 60 },
                  { category: 'Fraud', time: 120, target: 90 },
                ].map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-uradi-text-primary">{item.category}</span>
                      <span className={`text-sm font-mono ${item.time <= item.target ? 'text-uradi-status-positive' : 'text-uradi-status-warning'}`}>
                        {item.time} min
                      </span>
                    </div>
                    <div className="h-2 bg-uradi-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.time <= item.target ? 'bg-uradi-status-positive' : 'bg-uradi-status-warning'}`}
                        style={{ width: `${Math.min((item.time / 120) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teams">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Security Response', members: 12, active: 8, incidents: 8, avgResponse: '35 min' },
              { name: 'Logistics Support', members: 6, active: 5, incidents: 6, avgResponse: '45 min' },
              { name: 'Legal Affairs', members: 4, active: 3, incidents: 3, avgResponse: '120 min' },
              { name: 'Tech Support', members: 5, active: 4, incidents: 2, avgResponse: '25 min' },
              { name: 'Crisis Management', members: 8, active: 6, incidents: 4, avgResponse: '90 min' },
              { name: 'Field Operations', members: 15, active: 12, incidents: 0, avgResponse: '-' },
            ].map((team) => (
              <Card key={team.name} className="bg-uradi-bg-secondary border-uradi-border">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-uradi-text-primary">{team.name}</h3>
                      <p className="text-sm text-uradi-text-secondary">{team.active}/{team.members} active</p>
                    </div>
                    <Badge variant="success" className="animate-pulse">Online</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-2 bg-uradi-bg-tertiary rounded-lg">
                      <p className="text-lg font-bold text-uradi-text-primary">{team.incidents}</p>
                      <p className="text-xs text-uradi-text-tertiary">Incidents</p>
                    </div>
                    <div className="p-2 bg-uradi-bg-tertiary rounded-lg">
                      <p className="text-lg font-bold text-uradi-gold">{team.avgResponse}</p>
                      <p className="text-xs text-uradi-text-tertiary">Avg Response</p>
                    </div>
                  </div>

                  <Button size="sm" variant="outline" className="w-full">View Team</Button>
                </CardContent>
              </Card>
            ))}
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
          <label className="text-sm text-uradi-text-secondary">Category</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="logistics">Logistics</SelectItem>
              <SelectItem value="violence">Violence</SelectItem>
              <SelectItem value="fraud">Fraud</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
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
        <label className="text-sm text-uradi-text-secondary">Location</label>
        <Input placeholder="LGA, Ward, Polling Unit" />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-uradi-text-secondary">Description</label>
        <textarea
          className="w-full min-h-[100px] rounded-lg border border-uradi-border bg-uradi-bg-primary px-3 py-2 text-sm text-uradi-text-primary placeholder:text-uradi-text-tertiary focus:outline-none focus:ring-2 focus:ring-uradi-gold/50 focus:border-uradi-gold"
          placeholder="Detailed description of what happened..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-uradi-text-secondary">Assign To</label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select team" />
          </SelectTrigger>
          <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
            <SelectItem value="security">Security Response</SelectItem>
            <SelectItem value="logistics">Logistics Support</SelectItem>
            <SelectItem value="legal">Legal Affairs</SelectItem>
            <SelectItem value="tech">Tech Support</SelectItem>
            <SelectItem value="crisis">Crisis Management</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button className="gap-2">
          <Send className="h-4 w-4" />
          Submit Report
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
