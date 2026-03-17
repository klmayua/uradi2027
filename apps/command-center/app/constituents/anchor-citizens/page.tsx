'use client';

import { useState } from 'react';
import {
  Users,
  MapPin,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Activity,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AnchorCitizen {
  id: string;
  full_name: string;
  lga: string;
  ward: string;
  influence_level: 'high' | 'medium' | 'low';
  community_role: string;
  reports_submitted: number;
  last_report: string;
  stipend_status: 'active' | 'paused' | 'ended';
  active: boolean;
}

const mockAnchorCitizens: AnchorCitizen[] = [
  { id: '1', full_name: 'Alhaji Musa Danladi', lga: 'Dutse', ward: 'Sabuwar', influence_level: 'high', community_role: 'Village Head', reports_submitted: 47, last_report: '2 days ago', stipend_status: 'active', active: true },
  { id: '2', full_name: 'Hajiya Amina Hassan', lga: 'Hadejia', ward: 'Central', influence_level: 'high', community_role: 'Women Leader', reports_submitted: 38, last_report: '1 week ago', stipend_status: 'active', active: true },
  { id: '3', full_name: 'Malam Ibrahim Sule', lga: 'Birnin Kudu', ward: 'North', influence_level: 'medium', community_role: 'Imam', reports_submitted: 23, last_report: '3 days ago', stipend_status: 'active', active: true },
  { id: '4', full_name: 'Alhaji Abubakar Umar', lga: 'Gumel', ward: 'East', influence_level: 'high', community_role: 'Business Leader', reports_submitted: 52, last_report: '1 day ago', stipend_status: 'active', active: true },
  { id: '5', full_name: 'Hajiya Fatima Abdullahi', lga: 'Kazaure', ward: 'West', influence_level: 'medium', community_role: 'Teacher', reports_submitted: 19, last_report: '5 days ago', stipend_status: 'paused', active: true },
];

const getInfluenceColor = (level: string) => {
  switch (level) {
    case 'high': return 'bg-uradi-status-positive';
    case 'medium': return 'bg-uradi-status-warning';
    case 'low': return 'bg-uradi-text-tertiary';
    default: return 'bg-uradi-text-tertiary';
  }
};

const getStipendBadge = (status: string) => {
  switch (status) {
    case 'active': return <Badge variant="success">Active</Badge>;
    case 'paused': return <Badge variant="warning">Paused</Badge>;
    case 'ended': return <Badge variant="destructive">Ended</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function AnchorCitizensPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-uradi-text-primary">Anchor Citizens</h1>
          <p className="text-uradi-text-secondary mt-1">
            Manage {mockAnchorCitizens.length} community influencers and their reports
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Anchor Citizen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Anchors"
          value="156"
          change="+12"
          icon={Users}
          color="uradi-status-info"
        />
        <StatCard
          title="High Influence"
          value="48"
          change="31%"
          icon={TrendingUp}
          color="uradi-status-positive"
        />
        <StatCard
          title="Reports This Month"
          value="1,247"
          change="+89"
          icon={FileText}
          color="uradi-gold"
        />
        <StatCard
          title="Active Stipends"
          value="142"
          change="$28,400/mo"
          icon={DollarSign}
          color="uradi-status-neutral"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-uradi-bg-secondary border border-uradi-border rounded-xl">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-uradi-text-tertiary" />
          <Input
            placeholder="Search by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        <Select>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Influence Level" />
          </SelectTrigger>
          <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Stipend Status" />
          </SelectTrigger>
          <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="ended">Ended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-uradi-border hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Influence</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Reports</TableHead>
              <TableHead>Last Report</TableHead>
              <TableHead>Stipend</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAnchorCitizens.map((citizen) => (
              <TableRow key={citizen.id} className="border-uradi-border">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-uradi-bg-tertiary flex items-center justify-center text-uradi-text-secondary font-medium text-sm">
                      {citizen.full_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="font-medium text-uradi-text-primary">{citizen.full_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-uradi-text-secondary">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{citizen.lga}, {citizen.ward}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getInfluenceColor(citizen.influence_level)}`} />
                    <span className="capitalize text-uradi-text-primary">{citizen.influence_level}</span>
                  </div>
                </TableCell>
                <TableCell className="text-uradi-text-secondary">{citizen.community_role}</TableCell>
                <TableCell className="font-mono text-uradi-text-primary">{citizen.reports_submitted}</TableCell>
                <TableCell className="text-uradi-text-secondary">{citizen.last_report}</TableCell>
                <TableCell>{getStipendBadge(citizen.stipend_status)}</TableCell>
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
