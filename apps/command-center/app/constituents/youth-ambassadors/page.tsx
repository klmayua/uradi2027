'use client';

import { useState } from 'react';
import {
  Users,
  MapPin,
  Video,
  Instagram,
  Calendar,
  TrendingUp,
  Search,
  Plus,
  MoreHorizontal,
  GraduationCap,
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

interface YouthAmbassador {
  id: string;
  full_name: string;
  lga: string;
  campus: string;
  tiktok_handle: string;
  instagram_handle: string;
  content_pieces: number;
  events_coordinated: number;
  training_completed: boolean;
  stipend_status: 'active' | 'paused' | 'ended';
  active: boolean;
}

const mockAmbassadors: YouthAmbassador[] = [
  { id: '1', full_name: 'Amina Yusuf', lga: 'Dutse', campus: 'FUD', tiktok_handle: '@amina_fud', instagram_handle: '@amina.yusuf', content_pieces: 24, events_coordinated: 5, training_completed: true, stipend_status: 'active', active: true },
  { id: '2', full_name: 'Ibrahim Hassan', lga: 'Hadejia', campus: 'HUK', tiktok_handle: '@ibrahim_huk', instagram_handle: '@ibrahim.hassan', content_pieces: 18, events_coordinated: 3, training_completed: true, stipend_status: 'active', active: true },
  { id: '3', full_name: 'Fatima Abubakar', lga: 'Birnin Kudu', campus: 'FUD', tiktok_handle: '@fatima_content', instagram_handle: '@fatima.abubakar', content_pieces: 32, events_coordinated: 8, training_completed: true, stipend_status: 'active', active: true },
  { id: '4', full_name: 'Usman Mohammed', lga: 'Kazaure', campus: 'HUK', tiktok_handle: '@usman_kazaure', instagram_handle: '@usman.mohammed', content_pieces: 12, events_coordinated: 2, training_completed: false, stipend_status: 'paused', active: true },
];

export default function YouthAmbassadorsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-uradi-text-primary">Youth Ambassadors</h1>
          <p className="text-uradi-text-secondary mt-1">
            Manage {mockAmbassadors.length} campus ambassadors and content creators
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Ambassador
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Ambassadors" value="89" change="+8" icon={Users} color="uradi-status-info" />
        <StatCard title="Content Pieces" value="1,456" change="+124" icon={Video} color="uradi-gold" />
        <StatCard title="Events Coordinated" value="156" change="+23" icon={Calendar} color="uradi-status-positive" />
        <StatCard title="Trained" value="72" change="81%" icon={GraduationCap} color="uradi-status-neutral" />
      </div>

      <div className="flex flex-wrap items-center gap-4 p-4 bg-uradi-bg-secondary border border-uradi-border rounded-xl">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-uradi-text-tertiary" />
          <Input
            placeholder="Search by name or campus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        <Select>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Campus" />
          </SelectTrigger>
          <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
            <SelectItem value="all">All Campuses</SelectItem>
            <SelectItem value="fud">FUD</SelectItem>
            <SelectItem value="huk">HUK</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Training Status" />
          </SelectTrigger>
          <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-uradi-border hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Social Media</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Events</TableHead>
              <TableHead>Training</TableHead>
              <TableHead>Stipend</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAmbassadors.map((ambassador) => (
              <TableRow key={ambassador.id} className="border-uradi-border">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-uradi-bg-tertiary flex items-center justify-center text-uradi-text-secondary font-medium text-sm">
                      {ambassador.full_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="font-medium text-uradi-text-primary">{ambassador.full_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-uradi-text-secondary">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{ambassador.lga} • {ambassador.campus}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-xs text-uradi-text-secondary">
                      <Video className="h-3 w-3" />
                      <span>{ambassador.tiktok_handle}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-uradi-text-secondary">
                      <Instagram className="h-3 w-3" />
                      <span>{ambassador.instagram_handle}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-uradi-text-primary">{ambassador.content_pieces}</TableCell>
                <TableCell className="font-mono text-uradi-text-primary">{ambassador.events_coordinated}</TableCell>
                <TableCell>
                  {ambassador.training_completed ? (
                    <Badge variant="success">Completed</Badge>
                  ) : (
                    <Badge variant="warning">Pending</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={ambassador.stipend_status === 'active' ? 'success' : 'secondary'}>
                    {ambassador.stipend_status}
                  </Badge>
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
