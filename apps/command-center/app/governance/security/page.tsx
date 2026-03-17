'use client';

import { useState } from 'react';
import {
  Shield,
  Users,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  MoreHorizontal,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Phone,
  Radio,
  Activity,
  Eye,
  FileText,
  ChevronRight,
  Target,
  Zap,
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

interface SecurityAsset {
  id: string;
  name: string;
  type: 'personnel' | 'vehicle' | 'equipment';
  status: 'available' | 'deployed' | 'maintenance' | 'offline';
  location: string;
  last_checkin: string;
}

const mockAssets: SecurityAsset[] = [
  {
    id: 'SEC-001',
    name: 'Alpha Squad',
    type: 'personnel',
    status: 'deployed',
    location: 'Dutse Central',
    last_checkin: '5 min ago',
  },
  {
    id: 'SEC-002',
    name: 'Patrol Vehicle 1',
    type: 'vehicle',
    status: 'deployed',
    location: 'Hadejia Road',
    last_checkin: '12 min ago',
  },
  {
    id: 'SEC-003',
    name: 'Bravo Squad',
    type: 'personnel',
    status: 'available',
    location: 'Base',
    last_checkin: '1 hour ago',
  },
  {
    id: 'SEC-004',
    name: 'Drone Unit',
    type: 'equipment',
    status: 'maintenance',
    location: 'Base',
    last_checkin: '3 hours ago',
  },
  {
    id: 'SEC-005',
    name: 'Charlie Squad',
    type: 'personnel',
    status: 'deployed',
    location: 'Gumel',
    last_checkin: '8 min ago',
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'personnel':
      return Users;
    case 'vehicle':
      return MapPin;
    case 'equipment':
      return Shield;
    default:
      return Shield;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'available':
      return <Badge variant="success">Available</Badge>;
    case 'deployed':
      return <Badge className="bg-uradi-gold/20 text-uradi-gold animate-pulse">Deployed</Badge>;
    case 'maintenance':
      return <Badge variant="warning">Maintenance</Badge>;
    case 'offline':
      return <Badge variant="secondary">Offline</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-uradi-text-primary">Security Coordination</h1>
          <p className="text-uradi-text-secondary mt-1">
            Manage security assets, deployments, and incident response
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
                Deploy Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-uradi-bg-secondary border-uradi-border">
              <DialogHeader>
                <DialogTitle className="text-uradi-text-primary">Deploy Security Asset</DialogTitle>
              </DialogHeader>
              <DeploymentForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard title="Total Assets" value="24" change="+3" icon={Shield} color="uradi-status-info" />
        <StatCard title="Deployed" value="18" change="75%" icon={Target} color="uradi-status-positive" />
        <StatCard title="Available" value="4" change="On standby" icon={CheckCircle} color="uradi-gold" />
        <StatCard title="Active Alerts" value="3" change="Monitor" icon={AlertTriangle} color="uradi-status-warning" />
        <StatCard title="Coverage" value="89%" change="of LGAs" icon={MapPin} color="uradi-status-neutral" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-uradi-bg-secondary border border-uradi-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Security Status by LGA</CardTitle>
                <CardDescription>Current threat levels and coverage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { lga: 'Dutse', status: 'secure', coverage: 95, personnel: 8 },
                  { lga: 'Hadejia', status: 'secure', coverage: 90, personnel: 6 },
                  { lga: 'Gumel', status: 'caution', coverage: 85, personnel: 5 },
                  { lga: 'Kazaure', status: 'secure', coverage: 88, personnel: 4 },
                  { lga: 'Birnin Kudu', status: 'alert', coverage: 75, personnel: 3 },
                ].map((item) => (
                  <div key={item.lga} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-uradi-gold" />
                        <span className="text-sm text-uradi-text-primary">{item.lga}</span>
                      </div>
                      <Badge
                        variant={
                          item.status === 'secure'
                            ? 'success'
                            : item.status === 'caution'
                              ? 'warning'
                              : 'destructive'
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <div className="h-2 bg-uradi-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          item.status === 'secure'
                            ? 'bg-uradi-status-positive'
                            : item.status === 'caution'
                              ? 'bg-uradi-status-warning'
                              : 'bg-uradi-status-critical'
                        }`}
                        style={{ width: `${item.coverage}%` }}
                      />
                    </div>
                    <p className="text-xs text-uradi-text-tertiary">{item.personnel} personnel assigned</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Active Alerts</CardTitle>
                <CardDescription>Security incidents requiring attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    id: 'ALT-001',
                    title: 'Large crowd gathering',
                    location: 'Dutse Stadium',
                    level: 'medium',
                    time: '15 min ago',
                  },
                  {
                    id: 'ALT-002',
                    title: 'Traffic congestion',
                    location: 'Hadejia Road',
                    level: 'low',
                    time: '30 min ago',
                  },
                  {
                    id: 'ALT-003',
                    title: 'Suspicious activity reported',
                    location: 'Gumel Market',
                    level: 'high',
                    time: '5 min ago',
                  },
                ].map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${
                      alert.level === 'high'
                        ? 'bg-uradi-status-critical/10 border-uradi-status-critical/30'
                        : alert.level === 'medium'
                          ? 'bg-uradi-status-warning/10 border-uradi-status-warning/30'
                          : 'bg-uradi-bg-tertiary border-uradi-border'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-uradi-text-primary">{alert.title}</p>
                        <p className="text-xs text-uradi-text-secondary">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {alert.location}
                        </p>
                      </div>
                      <Badge
                        variant={
                          alert.level === 'high'
                            ? 'destructive'
                            : alert.level === 'medium'
                              ? 'warning'
                              : 'secondary'
                        }
                      >
                        {alert.level}
                      </Badge>
                    </div>
                    <p className="text-xs text-uradi-text-tertiary mt-2">{alert.time}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 p-4 bg-uradi-bg-secondary border border-uradi-border rounded-xl">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Filter className="h-4 w-4 text-uradi-text-tertiary" />
              <Input placeholder="Search assets..." className="flex-1" />
            </div>

            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="personnel">Personnel</SelectItem>
                <SelectItem value="vehicle">Vehicles</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="deployed">Deployed</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-uradi-border hover:bg-transparent">
                  <TableHead>Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Last Check-in</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAssets.map((asset) => {
                  const TypeIcon = getTypeIcon(asset.type);
                  return (
                    <TableRow key={asset.id} className="border-uradi-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-uradi-gold/10 flex items-center justify-center">
                            <TypeIcon className="h-4 w-4 text-uradi-gold" />
                          </div>
                          <div>
                            <p className="font-medium text-uradi-text-primary">{asset.name}</p>
                            <p className="text-xs text-uradi-text-tertiary">{asset.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-uradi-text-secondary capitalize">{asset.type}</TableCell>
                      <TableCell>{getStatusBadge(asset.status)}</TableCell>
                      <TableCell className="text-uradi-text-secondary">{asset.location}</TableCell>
                      <TableCell className="text-uradi-text-secondary">{asset.last_checkin}</TableCell>
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

        <TabsContent value="deployments">
          <Card className="bg-uradi-bg-secondary border-uradi-border">
            <CardHeader>
              <CardTitle className="text-uradi-text-primary">Active Deployments</CardTitle>
              <CardDescription>Current security operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  name: 'Operation Safe Passage',
                  location: 'Dutse - Hadejia Road',
                  assets: 'Alpha Squad, Patrol Vehicle 1',
                  start: '06:00',
                  status: 'active',
                },
                {
                  name: 'Market Security Detail',
                  location: 'Gumel Central Market',
                  assets: 'Charlie Squad',
                  start: '08:00',
                  status: 'active',
                },
                {
                  name: 'VIP Protection',
                  location: 'Campaign Rally Venue',
                  assets: 'Delta Squad',
                  start: '14:00',
                  status: 'standby',
                },
              ].map((op) => (
                <div key={op.name} className="p-4 border border-uradi-border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-uradi-text-primary">{op.name}</p>
                      <p className="text-sm text-uradi-text-secondary">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {op.location}
                      </p>
                    </div>
                    <Badge variant={op.status === 'active' ? 'success' : 'secondary'}>{op.status}</Badge>
                  </div>
                  <p className="text-sm text-uradi-text-secondary">
                    <Users className="h-3 w-3 inline mr-1" />
                    {op.assets}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-uradi-text-tertiary">Started: {op.start}</span>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Alert History</CardTitle>
                <CardDescription>Recent security alerts and responses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { time: '14:30', type: 'info', message: 'Routine patrol completed - Dutse', resolved: true },
                  { time: '14:15', type: 'warning', message: 'Crowd forming at polling unit 12', resolved: true },
                  { time: '13:45', type: 'alert', message: 'Security escort requested for official', resolved: true },
                  { time: '12:30', type: 'info', message: 'Shift change completed', resolved: true },
                  { time: '11:00', type: 'warning', message: 'Traffic delay on main road', resolved: true },
                ].map((alert, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 border border-uradi-border rounded-lg">
                    <div
                      className={`h-2 w-2 rounded-full mt-2 ${
                        alert.type === 'info'
                          ? 'bg-uradi-status-info'
                          : alert.type === 'warning'
                            ? 'bg-uradi-status-warning'
                            : 'bg-uradi-status-critical'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-uradi-text-primary">{alert.message}</p>
                      <p className="text-xs text-uradi-text-tertiary">{alert.time}</p>
                    </div>
                    {alert.resolved && <CheckCircle className="h-4 w-4 text-uradi-status-positive" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Response Metrics</CardTitle>
                <CardDescription>Security team performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { metric: 'Avg Response Time', value: '8.5 min', target: '10 min', status: 'good' },
                  { metric: 'Alert Resolution Rate', value: '94%', target: '90%', status: 'good' },
                  { metric: 'Coverage Score', value: '89%', target: '85%', status: 'good' },
                  { metric: 'Personnel Utilization', value: '75%', target: '80%', status: 'warning' },
                ].map((item) => (
                  <div key={item.metric} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-uradi-text-primary">{item.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-uradi-text-primary">{item.value}</span>
                        <Badge variant={item.status === 'good' ? 'success' : 'warning'}>vs {item.target}</Badge>
                      </div>
                    </div>
                    <div className="h-2 bg-uradi-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.status === 'good' ? 'bg-uradi-status-positive' : 'bg-uradi-status-warning'}`}
                        style={{ width: `${parseInt(item.value)}%` }}
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

function DeploymentForm() {
  return (
    <div className="space-y-6 mt-4">
      <div className="space-y-2">
        <label className="text-sm text-uradi-text-secondary">Operation Name</label>
        <Input placeholder="e.g., Operation Safe Passage" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">Location</label>
          <Input placeholder="Deployment location" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">LGA</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select LGA" />
            </SelectTrigger>
            <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
              <SelectItem value="dutse">Dutse</SelectItem>
              <SelectItem value="hadejia">Hadejia</SelectItem>
              <SelectItem value="gumel">Gumel</SelectItem>
              <SelectItem value="kazaure">Kazaure</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-uradi-text-secondary">Select Assets</label>
        <div className="grid grid-cols-2 gap-2">
          {mockAssets
            .filter((a) => a.status === 'available')
            .map((asset) => (
              <div
                key={asset.id}
                className="p-3 border border-uradi-border rounded-lg cursor-pointer hover:border-uradi-gold/50"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-uradi-gold" />
                  <span className="text-sm text-uradi-text-primary">{asset.name}</span>
                </div>
                <p className="text-xs text-uradi-text-tertiary mt-1 capitalize">{asset.type}</p>
              </div>
            ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-uradi-text-secondary">Mission Brief</label>
        <textarea
          className="w-full min-h-[80px] rounded-lg border border-uradi-border bg-uradi-bg-primary px-3 py-2 text-sm text-uradi-text-primary placeholder:text-uradi-text-tertiary focus:outline-none focus:ring-2 focus:ring-uradi-gold/50 focus:border-uradi-gold"
          placeholder="Brief description of deployment objectives..."
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button className="gap-2">
          <Target className="h-4 w-4" />
          Deploy Assets
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
