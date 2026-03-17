'use client';

import { useState, useCallback } from 'react';
import {
  Radio,
  Users,
  MapPin,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  Download,
  Phone,
  MessageSquare,
  Shield,
  Eye,
  FileText,
  MoreHorizontal,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { Map, PollingUnitMarkers } from '@/components/Map';
import type mapboxgl from 'mapbox-gl';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Monitor {
  id: string;
  name: string;
  phone: string;
  lga: string;
  ward: string;
  polling_unit: string;
  status: 'active' | 'inactive' | 'issue';
  last_report: string;
  reports_count: number;
  issues_count: number;
}

const mockMonitors: Monitor[] = [
  {
    id: '1',
    name: 'Ibrahim Musa',
    phone: '+234 801 234 5678',
    lga: 'Dutse',
    ward: 'Ward 3',
    polling_unit: 'PU 001 - Government School',
    status: 'active',
    last_report: '5 min ago',
    reports_count: 12,
    issues_count: 0,
  },
  {
    id: '2',
    name: 'Amina Hassan',
    phone: '+234 802 345 6789',
    lga: 'Dutse',
    ward: 'Ward 5',
    polling_unit: 'PU 012 - Market Square',
    status: 'active',
    last_report: '12 min ago',
    reports_count: 8,
    issues_count: 1,
  },
  {
    id: '3',
    name: 'Yusuf Abubakar',
    phone: '+234 803 456 7890',
    lga: 'Hadejia',
    ward: 'Ward 2',
    polling_unit: 'PU 005 - Town Hall',
    status: 'issue',
    last_report: '1 hour ago',
    reports_count: 5,
    issues_count: 2,
  },
  {
    id: '4',
    name: 'Fatima Danladi',
    phone: '+234 804 567 8901',
    lga: 'Gumel',
    ward: 'Ward 1',
    polling_unit: 'PU 003 - Primary School',
    status: 'active',
    last_report: '8 min ago',
    reports_count: 15,
    issues_count: 0,
  },
  {
    id: '5',
    name: 'Musa Ibrahim',
    phone: '+234 805 678 9012',
    lga: 'Kazaure',
    ward: 'Ward 4',
    polling_unit: 'PU 008 - Community Center',
    status: 'inactive',
    last_report: '3 hours ago',
    reports_count: 3,
    issues_count: 0,
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge variant="success">Active</Badge>;
    case 'inactive':
      return <Badge variant="secondary">Inactive</Badge>;
    case 'issue':
      return <Badge variant="destructive">Issue</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function MonitorsPage() {
  const [activeTab, setActiveTab] = useState('live');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-uradi-text-primary">Election Day Monitors</h1>
          <p className="text-uradi-text-secondary mt-1">
            Real-time monitoring of polling units and field agents
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="gap-2">
            <Radio className="h-4 w-4 animate-pulse" />
            Live Dashboard
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard
          title="Total Monitors"
          value="247"
          change="+12"
          icon={Users}
          color="uradi-status-info"
        />
        <StatCard
          title="Active Now"
          value="198"
          change="80%"
          icon={Radio}
          color="uradi-status-positive"
        />
        <StatCard
          title="Reports Today"
          value="1,245"
          change="+89"
          icon={FileText}
          color="uradi-gold"
        />
        <StatCard
          title="Issues Raised"
          value="23"
          change="5 critical"
          icon={AlertCircle}
          color="uradi-status-warning"
        />
        <StatCard
          title="Coverage"
          value="89%"
          change="of PUs"
          icon={MapPin}
          color="uradi-status-neutral"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-uradi-bg-secondary border border-uradi-border">
          <TabsTrigger value="live">Live Feed</TabsTrigger>
          <TabsTrigger value="monitors">Monitors</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-uradi-bg-secondary border-uradi-border">
                <CardHeader>
                  <CardTitle className="text-uradi-text-primary flex items-center gap-2">
                    <Activity className="h-5 w-5 text-uradi-gold animate-pulse" />
                    Live Activity Feed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      time: '14:32',
                      monitor: 'Ibrahim Musa',
                      lga: 'Dutse',
                      action: 'Submitted report',
                      details: 'Voting proceeding smoothly. 120 votes cast so far.',
                      type: 'info',
                    },
                    {
                      time: '14:28',
                      monitor: 'Amina Hassan',
                      lga: 'Dutse',
                      action: 'Flagged issue',
                      details: 'Long queue reported. Estimated wait time 45 minutes.',
                      type: 'warning',
                    },
                    {
                      time: '14:25',
                      monitor: 'Yusuf Abubakar',
                      lga: 'Hadejia',
                      action: 'Submitted report',
                      details: 'Materials arrived. Voting started at 14:20.',
                      type: 'info',
                    },
                    {
                      time: '14:20',
                      monitor: 'Fatima Danladi',
                      lga: 'Gumel',
                      action: 'Resolved issue',
                      details: 'Ballot paper shortage resolved. Voting resumed.',
                      type: 'success',
                    },
                    {
                      time: '14:15',
                      monitor: 'System',
                      lga: '-',
                      action: 'Alert',
                      details: '3 monitors inactive for >1 hour in Kazaure LGA',
                      type: 'critical',
                    },
                  ].map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-3 border border-uradi-border rounded-lg"
                    >
                      <div className="text-sm font-mono text-uradi-text-tertiary w-12">
                        {activity.time}
                      </div>
                      <div
                        className={`h-2 w-2 rounded-full mt-2 ${
                          activity.type === 'info'
                            ? 'bg-uradi-status-info'
                            : activity.type === 'warning'
                              ? 'bg-uradi-status-warning'
                              : activity.type === 'success'
                                ? 'bg-uradi-status-positive'
                                : 'bg-uradi-status-critical'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-uradi-text-primary">
                            {activity.monitor}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {activity.lga}
                          </Badge>
                          <span className="text-sm text-uradi-gold">{activity.action}</span>
                        </div>
                        <p className="text-sm text-uradi-text-secondary mt-1">
                          {activity.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="bg-uradi-bg-secondary border-uradi-border">
                <CardHeader>
                  <CardTitle className="text-uradi-text-primary">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-uradi-bg-tertiary rounded-lg">
                    <span className="text-sm text-uradi-text-secondary">Polling Units Open</span>
                    <span className="text-lg font-bold text-uradi-status-positive font-mono">
                      198/220
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-uradi-bg-tertiary rounded-lg">
                    <span className="text-sm text-uradi-text-secondary">Voter Turnout (Est.)</span>
                    <span className="text-lg font-bold text-uradi-gold font-mono">34.2%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-uradi-bg-tertiary rounded-lg">
                    <span className="text-sm text-uradi-text-secondary">Reports/Hour</span>
                    <span className="text-lg font-bold text-uradi-text-primary font-mono">
                      156
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-uradi-bg-tertiary rounded-lg">
                    <span className="text-sm text-uradi-text-secondary">Avg Response Time</span>
                    <span className="text-lg font-bold text-uradi-status-info font-mono">
                      4.2m
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-uradi-bg-secondary border-uradi-border">
                <CardHeader>
                  <CardTitle className="text-uradi-text-primary">Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { level: 'critical', message: 'Security incident in Ward 5, Hadejia' },
                    { level: 'warning', message: 'Materials delay in 3 polling units' },
                    { level: 'info', message: 'High voter turnout in Dutse Central' },
                  ].map((alert, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border ${
                        alert.level === 'critical'
                          ? 'bg-uradi-status-critical/10 border-uradi-status-critical/30'
                          : alert.level === 'warning'
                            ? 'bg-uradi-status-warning/10 border-uradi-status-warning/30'
                            : 'bg-uradi-status-info/10 border-uradi-status-info/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle
                          className={`h-4 w-4 ${
                            alert.level === 'critical'
                              ? 'text-uradi-status-critical'
                              : alert.level === 'warning'
                                ? 'text-uradi-status-warning'
                                : 'text-uradi-status-info'
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            alert.level === 'critical'
                              ? 'text-uradi-status-critical'
                              : alert.level === 'warning'
                                ? 'text-uradi-status-warning'
                                : 'text-uradi-text-primary'
                          }`}
                        >
                          {alert.message}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="monitors" className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 p-4 bg-uradi-bg-secondary border border-uradi-border rounded-xl">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Filter className="h-4 w-4 text-uradi-text-tertiary" />
              <Input placeholder="Search monitors..." className="flex-1" />
            </div>

            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="LGA" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All LGAs</SelectItem>
                <SelectItem value="dutse">Dutse</SelectItem>
                <SelectItem value="hadejia">Hadejia</SelectItem>
                <SelectItem value="gumel">Gumel</SelectItem>
                <SelectItem value="kazaure">Kazaure</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="issue">Issue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-uradi-border hover:bg-transparent">
                  <TableHead>Monitor</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Report</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead>Issues</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockMonitors.map((monitor) => (
                  <TableRow key={monitor.id} className="border-uradi-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-uradi-bg-tertiary flex items-center justify-center text-uradi-text-secondary font-medium text-sm">
                          {monitor.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <p className="font-medium text-uradi-text-primary">{monitor.name}</p>
                          <p className="text-xs text-uradi-text-tertiary">{monitor.phone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-uradi-text-primary">{monitor.lga}</span>
                        <span className="text-xs text-uradi-text-tertiary">
                          {monitor.ward} • {monitor.polling_unit}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(monitor.status)}</TableCell>
                    <TableCell className="text-uradi-text-secondary">
                      {monitor.last_report}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-uradi-text-primary">
                        {monitor.reports_count}
                      </span>
                    </TableCell>
                    <TableCell>
                      {monitor.issues_count > 0 ? (
                        <Badge variant="destructive">{monitor.issues_count}</Badge>
                      ) : (
                        <span className="text-uradi-text-tertiary">-</span>
                      )}
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

        <TabsContent value="issues">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Active Issues</CardTitle>
                <CardDescription>Issues requiring attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    id: 'ISS-001',
                    title: 'Materials Shortage',
                    location: 'Hadejia, Ward 2',
                    severity: 'high',
                    reported: '30 min ago',
                    status: 'in_progress',
                  },
                  {
                    id: 'ISS-002',
                    title: 'Security Concern',
                    location: 'Dutse, Ward 5',
                    severity: 'critical',
                    reported: '15 min ago',
                    status: 'escalated',
                  },
                  {
                    id: 'ISS-003',
                    title: 'Long Queues',
                    location: 'Gumel, Ward 1',
                    severity: 'medium',
                    reported: '1 hour ago',
                    status: 'monitoring',
                  },
                  {
                    id: 'ISS-004',
                    title: 'Power Outage',
                    location: 'Kazaure, Ward 4',
                    severity: 'low',
                    reported: '2 hours ago',
                    status: 'resolved',
                  },
                ].map((issue) => (
                  <div
                    key={issue.id}
                    className="p-4 border border-uradi-border rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-uradi-text-tertiary">{issue.id}</span>
                          <h3 className="font-medium text-uradi-text-primary">{issue.title}</h3>
                        </div>
                        <p className="text-sm text-uradi-text-secondary mt-1">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {issue.location}
                        </p>
                      </div>
                      <Badge
                        variant={
                          issue.severity === 'critical'
                            ? 'destructive'
                            : issue.severity === 'high'
                              ? 'warning'
                              : 'secondary'
                        }
                      >
                        {issue.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-uradi-text-tertiary">Reported {issue.reported}</span>
                      <Badge variant="outline">{issue.status}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Issue Categories</CardTitle>
                <CardDescription>Breakdown by type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { category: 'Materials', count: 8, percentage: 35 },
                  { category: 'Security', count: 5, percentage: 22 },
                  { category: 'Logistics', count: 4, percentage: 17 },
                  { category: 'Staffing', count: 3, percentage: 13 },
                  { category: 'Technical', count: 3, percentage: 13 },
                ].map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-uradi-text-primary">{item.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-uradi-text-secondary">
                          {item.count}
                        </span>
                        <span className="text-sm font-mono text-uradi-gold">{item.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-uradi-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-uradi-gold"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="map">
          <ElectionMapView />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ElectionMapView() {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<{ id: string; name: string } | null>(null);

  // Mock polling unit data
  const pollingUnits = [
    { id: 'PU001', name: 'Dutse Central PU', coordinates: [9.35, 12.5] as [number, number], status: 'open' as const, voters: 1200 },
    { id: 'PU002', name: 'Government School PU', coordinates: [9.4, 12.45] as [number, number], status: 'open' as const, voters: 850 },
    { id: 'PU003', name: 'Market Square PU', coordinates: [9.3, 12.55] as [number, number], status: 'issue' as const, voters: 950 },
    { id: 'PU004', name: 'Hadejia Town Hall', coordinates: [10.2, 12.8] as [number, number], status: 'open' as const, voters: 1100 },
    { id: 'PU005', name: 'Gumel Primary', coordinates: [9.8, 12.7] as [number, number], status: 'closed' as const, voters: 780 },
    { id: 'PU006', name: 'Kazaure Center', coordinates: [8.8, 12.8] as [number, number], status: 'open' as const, voters: 920 },
  ];

  const handleMapLoad = useCallback((mapInstance: mapboxgl.Map) => {
    setMap(mapInstance);
  }, []);

  const handleUnitClick = useCallback((unit: { id: string; name: string }) => {
    setSelectedUnit(unit);
  }, []);

  const openCount = pollingUnits.filter((u) => u.status === 'open').length;
  const issueCount = pollingUnits.filter((u) => u.status === 'issue').length;
  const closedCount = pollingUnits.filter((u) => u.status === 'closed').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl overflow-hidden">
          <Map center={[9.5, 12.5]} zoom={9} className="h-[500px]" onLoad={handleMapLoad}>
            {map && (
              <PollingUnitMarkers
                map={map}
                units={pollingUnits}
                onUnitClick={handleUnitClick}
              />
            )}
          </Map>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="bg-uradi-bg-secondary border-uradi-border">
          <CardHeader>
            <CardTitle className="text-uradi-text-primary">Polling Unit Status</CardTitle>
            <CardDescription>Real-time monitoring coverage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-uradi-bg-tertiary rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-uradi-status-positive" />
                <span className="text-sm text-uradi-text-secondary">Open</span>
              </div>
              <span className="font-mono text-uradi-text-primary">{openCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-uradi-bg-tertiary rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-uradi-status-critical" />
                <span className="text-sm text-uradi-text-secondary">Issues</span>
              </div>
              <span className="font-mono text-uradi-text-primary">{issueCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-uradi-bg-tertiary rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-uradi-text-tertiary" />
                <span className="text-sm text-uradi-text-secondary">Closed</span>
              </div>
              <span className="font-mono text-uradi-text-primary">{closedCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-uradi-bg-secondary border-uradi-border">
          <CardHeader>
            <CardTitle className="text-uradi-text-primary">Selected Unit</CardTitle>
            <CardDescription>
              {selectedUnit ? selectedUnit.name : 'Click a marker to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedUnit ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-uradi-bg-tertiary rounded-lg">
                  <span className="text-sm text-uradi-text-secondary">Status</span>
                  <Badge variant="success">Open</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-uradi-bg-tertiary rounded-lg">
                  <span className="text-sm text-uradi-text-secondary">Registered Voters</span>
                  <span className="font-mono text-uradi-text-primary">1,200</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-uradi-bg-tertiary rounded-lg">
                  <span className="text-sm text-uradi-text-secondary">Monitor</span>
                  <span className="text-uradi-text-primary">Ibrahim Musa</span>
                </div>
                <Button className="w-full">Contact Monitor</Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <MapPin className="h-10 w-10 text-uradi-text-tertiary mx-auto mb-2" />
                <p className="text-sm text-uradi-text-secondary">Select a polling unit</p>
              </div>
            )}
          </CardContent>
        </Card>
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
