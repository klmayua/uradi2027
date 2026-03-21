'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Download,
  Filter,
  Calendar,
  User,
  Shield,
  FileText,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  severity: 'info' | 'warning' | 'critical';
}

// Mock data - replace with API call
const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    user_id: 'user1',
    user_name: 'Admin User',
    user_email: 'admin@uradi360.com',
    action: 'LOGIN',
    entity_type: 'auth',
    entity_id: 'user1',
    description: 'User logged in successfully',
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0...',
    created_at: '2026-03-20T10:30:00Z',
    severity: 'info',
  },
  {
    id: '2',
    user_id: 'user1',
    user_name: 'Admin User',
    user_email: 'admin@uradi360.com',
    action: 'VOTER_CREATE',
    entity_type: 'voter',
    entity_id: 'voter123',
    description: 'Created voter: Ahmad Abdullahi',
    ip_address: '192.168.1.1',
    user_agent: 'Mozilla/5.0...',
    created_at: '2026-03-20T10:35:00Z',
    severity: 'info',
  },
  {
    id: '3',
    user_id: 'user2',
    user_name: 'Coordinator',
    user_email: 'coordinator@uradi360.com',
    action: 'EXPORT_DATA',
    entity_type: 'voters',
    entity_id: 'bulk',
    description: 'Exported 500 voter records',
    ip_address: '192.168.1.2',
    user_agent: 'Mozilla/5.0...',
    created_at: '2026-03-20T11:00:00Z',
    severity: 'warning',
  },
  {
    id: '4',
    user_id: 'user1',
    user_name: 'Admin User',
    user_email: 'admin@uradi360.com',
    action: 'FAILED_LOGIN',
    entity_type: 'auth',
    entity_id: 'user1',
    description: 'Failed login attempt',
    ip_address: '10.0.0.1',
    user_agent: 'Mozilla/5.0...',
    created_at: '2026-03-20T11:15:00Z',
    severity: 'critical',
  },
];

const actionIcons: Record<string, typeof User> = {
  LOGIN: User,
  LOGOUT: User,
  VOTER_CREATE: FileText,
  VOTER_UPDATE: FileText,
  VOTER_DELETE: Trash2,
  EXPORT_DATA: Download,
  SETTINGS_CHANGE: Shield,
  FAILED_LOGIN: AlertTriangle,
};

const severityColors = {
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Filter logs
  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch =
      search === '' ||
      log.user_name.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.description.toLowerCase().includes(search.toLowerCase());

    const matchesAction = actionFilter === '' || log.action === actionFilter;
    const matchesSeverity = severityFilter === '' || log.severity === severityFilter;

    return matchesSearch && matchesAction && matchesSeverity;
  });

  const handleExport = () => {
    // Convert to CSV and download
    const csv = [
      ['Timestamp', 'User', 'Email', 'Action', 'Entity', 'Description', 'IP Address', 'Severity'],
      ...filteredLogs.map((log) => [
        log.created_at,
        log.user_name,
        log.user_email,
        log.action,
        log.entity_type,
        log.description,
        log.ip_address,
        log.severity,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-slate-400 mt-1">
            Track all system activities and changes
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          className="border-slate-700 hover:bg-slate-800"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-slate-900 border-slate-700"
                />
              </div>
            </div>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-40 bg-slate-900 border-slate-700">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="">All Actions</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGOUT">Logout</SelectItem>
                <SelectItem value="VOTER_CREATE">Voter Create</SelectItem>
                <SelectItem value="VOTER_UPDATE">Voter Update</SelectItem>
                <SelectItem value="VOTER_DELETE">Voter Delete</SelectItem>
                <SelectItem value="EXPORT_DATA">Export Data</SelectItem>
                <SelectItem value="SETTINGS_CHANGE">Settings Change</SelectItem>
                <SelectItem value="FAILED_LOGIN">Failed Login</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40 bg-slate-900 border-slate-700">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="">All Severities</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-32 bg-slate-900 border-slate-700"
                placeholder="From"
              />
              <span className="text-slate-500">-</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-32 bg-slate-900 border-slate-700"
                placeholder="To"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Events"
          value={filteredLogs.length}
          icon={<FileText className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Info"
          value={filteredLogs.filter((l) => l.severity === 'info').length}
          icon={<FileText className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Warnings"
          value={filteredLogs.filter((l) => l.severity === 'warning').length}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Critical"
          value={filteredLogs.filter((l) => l.severity === 'critical').length}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="rose"
        />
      </div>

      {/* Logs Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="text-slate-300">Severity</TableHead>
                <TableHead className="text-slate-300">Time</TableHead>
                <TableHead className="text-slate-300">User</TableHead>
                <TableHead className="text-slate-300">Action</TableHead>
                <TableHead className="text-slate-300">Description</TableHead>
                <TableHead className="text-slate-300">IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-slate-500"
                  >
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => {
                  const Icon = actionIcons[log.action] || FileText;
                  return (
                    <TableRow
                      key={log.id}
                      className="border-slate-700 hover:bg-slate-700/50"
                    >
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize ${severityColors[log.severity]}`}
                        >
                          {log.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-300">
                          {new Date(log.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-200">
                          {log.user_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {log.user_email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-300">
                            {log.action}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-300">
                          {log.description}
                        </span>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">
                          {log.ip_address}
                        </code>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Retention Notice */}
      <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <Calendar className="w-4 h-4" />
        <span>
          Audit logs are retained for 90 days. Export important logs for
          long-term storage.
        </span>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'amber' | 'rose';
}) {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/20 text-amber-400',
    rose: 'bg-rose-500/20 text-rose-400',
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
          </div>
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
