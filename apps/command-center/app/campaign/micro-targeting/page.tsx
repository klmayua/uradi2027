'use client';

import { useState } from 'react';
import {
  Target,
  Users,
  MapPin,
  Filter,
  Zap,
  Send,
  Plus,
  MoreHorizontal,
  TrendingUp,
  PieChart,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Download,
  Copy,
  Trash2,
  Edit3,
  Eye,
  Smartphone,
  MessageSquare,
  ChevronRight,
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
import { Checkbox } from '@/components/ui/checkbox';

interface Segment {
  id: string;
  name: string;
  description: string;
  criteria: {
    lgas: string[];
    ageRange: string;
    party: string[];
    sentiment: string;
    issues: string[];
  };
  size: number;
  conversionRate: number;
  status: 'active' | 'draft' | 'archived';
  lastUpdated: string;
}

const mockSegments: Segment[] = [
  {
    id: '1',
    name: 'Youth Swing Voters - Dutse',
    description: 'Young voters aged 18-30 in Dutse LGA with neutral sentiment',
    criteria: {
      lgas: ['Dutse'],
      ageRange: '18-30',
      party: ['Undecided', 'NNPP'],
      sentiment: 'neutral',
      issues: ['Employment', 'Education'],
    },
    size: 12450,
    conversionRate: 12.5,
    status: 'active',
    lastUpdated: '2 days ago',
  },
  {
    id: '2',
    name: 'Women Entrepreneurs',
    description: 'Female business owners across all LGAs concerned with economic policy',
    criteria: {
      lgas: ['All'],
      ageRange: '25-50',
      party: ['PDP', 'APC', 'Undecided'],
      sentiment: 'positive',
      issues: ['Economy', 'Healthcare'],
    },
    size: 8930,
    conversionRate: 18.2,
    status: 'active',
    lastUpdated: '1 week ago',
  },
  {
    id: '3',
    name: 'Rural Farmers - Hadejia',
    description: 'Agricultural workers in Hadejia LGA focused on rural development',
    criteria: {
      lgas: ['Hadejia'],
      ageRange: '30-60',
      party: ['PDP', 'Undecided'],
      sentiment: 'neutral',
      issues: ['Agriculture', 'Infrastructure'],
    },
    size: 5670,
    conversionRate: 8.7,
    status: 'draft',
    lastUpdated: '3 days ago',
  },
  {
    id: '4',
    name: 'First-Time Voters',
    description: 'Newly registered voters across all LGAs, high mobilization priority',
    criteria: {
      lgas: ['All'],
      ageRange: '18-25',
      party: ['All'],
      sentiment: 'positive',
      issues: ['Education', 'Employment'],
    },
    size: 22100,
    conversionRate: 22.4,
    status: 'active',
    lastUpdated: '1 day ago',
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active': return <Badge variant="success">Active</Badge>;
    case 'draft': return <Badge variant="warning">Draft</Badge>;
    case 'archived': return <Badge variant="secondary">Archived</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function MicroTargetingPage() {
  const [activeTab, setActiveTab] = useState('segments');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-uradi-text-primary">Micro-Targeting</h1>
          <p className="text-uradi-text-secondary mt-1">
            Create precise voter segments and deliver targeted messaging
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Segment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl bg-uradi-bg-secondary border-uradi-border">
              <DialogHeader>
                <DialogTitle className="text-uradi-text-primary">Create Target Segment</DialogTitle>
              </DialogHeader>
              <SegmentBuilder />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard title="Total Segments" value="24" change="+4" icon={Target} color="uradi-status-info" />
        <StatCard title="Active Targets" value="89.4K" change="voters" icon={Users} color="uradi-status-positive" />
        <StatCard title="Avg Conversion" value="14.2%" change="+2.1%" icon={TrendingUp} color="uradi-gold" />
        <StatCard title="Messages Sent" value="45.2K" change="this week" icon={Send} color="uradi-status-neutral" />
        <StatCard title="Top Segment" value="Youth" change="22.4% conv." icon={Zap} color="uradi-status-warning" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-uradi-bg-secondary border border-uradi-border">
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="builder">Segment Builder</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="segments" className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 p-4 bg-uradi-bg-secondary border border-uradi-border rounded-xl">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Filter className="h-4 w-4 text-uradi-text-tertiary" />
              <Input placeholder="Search segments..." className="flex-1" />
            </div>

            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="LGA" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All LGAs</SelectItem>
                <SelectItem value="dutse">Dutse</SelectItem>
                <SelectItem value="hadejia">Hadejia</SelectItem>
                <SelectItem value="gumel">Gumel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-uradi-border hover:bg-transparent">
                  <TableHead>Segment</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Conversion</TableHead>
                  <TableHead>Criteria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSegments.map((segment) => (
                  <TableRow key={segment.id} className="border-uradi-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-uradi-gold/10 flex items-center justify-center">
                          <Target className="h-4 w-4 text-uradi-gold" />
                        </div>
                        <div>
                          <p className="font-medium text-uradi-text-primary">{segment.name}</p>
                          <p className="text-xs text-uradi-text-tertiary">{segment.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-uradi-text-primary">
                        {segment.size.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-uradi-bg-tertiary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-uradi-status-positive"
                            style={{ width: `${segment.conversionRate * 5}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono text-uradi-status-positive">
                          {segment.conversionRate}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {segment.criteria.issues.slice(0, 2).map((issue) => (
                          <Badge key={issue} variant="secondary" className="text-xs">
                            {issue}
                          </Badge>
                        ))}
                        {segment.criteria.issues.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{segment.criteria.issues.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(segment.status)}</TableCell>
                    <TableCell className="text-uradi-text-secondary">{segment.lastUpdated}</TableCell>
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
          <SegmentBuilder />
        </TabsContent>

        <TabsContent value="campaigns">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Youth Employment Drive', segment: 'Youth Swing Voters - Dutse', sent: 12450, opened: 8932, clicked: 3241, status: 'running' },
              { name: 'Women in Business', segment: 'Women Entrepreneurs', sent: 8930, opened: 7124, clicked: 2890, status: 'completed' },
              { name: 'Rural Development', segment: 'Rural Farmers - Hadejia', sent: 5670, opened: 3402, clicked: 890, status: 'scheduled' },
              { name: 'First-Time Voter Drive', segment: 'First-Time Voters', sent: 22100, opened: 18942, clicked: 8542, status: 'running' },
            ].map((campaign) => (
              <Card key={campaign.name} className="bg-uradi-bg-secondary border-uradi-border">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-uradi-text-primary">{campaign.name}</h3>
                      <p className="text-sm text-uradi-text-secondary">{campaign.segment}</p>
                    </div>
                    <Badge
                      variant={campaign.status === 'running' ? 'success' : campaign.status === 'completed' ? 'secondary' : 'warning'}
                    >
                      {campaign.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-uradi-text-primary font-mono">
                        {((campaign.opened / campaign.sent) * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-uradi-text-tertiary">Open Rate</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-uradi-gold font-mono">
                        {((campaign.clicked / campaign.sent) * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-uradi-text-tertiary">Click Rate</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-uradi-status-positive font-mono">
                        {campaign.sent.toLocaleString()}
                      </p>
                      <p className="text-xs text-uradi-text-tertiary">Sent</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 gap-1">
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-1">
                      <Copy className="h-3 w-3" />
                      Clone
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Segment Performance</CardTitle>
                <CardDescription>Conversion rates by segment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockSegments
                  .sort((a, b) => b.conversionRate - a.conversionRate)
                  .map((segment) => (
                    <div key={segment.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-uradi-text-primary">{segment.name}</span>
                        <span className="text-sm font-mono text-uradi-gold">{segment.conversionRate}%</span>
                      </div>
                      <div className="h-2 bg-uradi-bg-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-uradi-gold"
                          style={{ width: `${(segment.conversionRate / 25) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-uradi-text-tertiary">
                        {segment.size.toLocaleString()} voters
                      </p>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Targeting Insights</CardTitle>
                <CardDescription>Key metrics and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: 'Top Performing Issue', value: 'Employment', change: '22.4% conversion', icon: TrendingUp },
                  { title: 'Best Channel', value: 'WhatsApp', change: '18.7% engagement', icon: MessageSquare },
                  { title: 'Highest LGA', value: 'Dutse', change: '15.2% of targets', icon: MapPin },
                  { title: 'Optimal Age Group', value: '18-25', change: '22.4% conversion', icon: Users },
                ].map((insight) => {
                  const Icon = insight.icon;
                  return (
                    <div key={insight.title} className="flex items-center gap-4 p-3 border border-uradi-border rounded-lg">
                      <div className="h-10 w-10 rounded-lg bg-uradi-gold/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-uradi-gold" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-uradi-text-tertiary">{insight.title}</p>
                        <p className="font-medium text-uradi-text-primary">{insight.value}</p>
                      </div>
                      <Badge variant="secondary">{insight.change}</Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SegmentBuilder() {
  return (
    <div className="space-y-6 mt-4">
      <div className="space-y-2">
        <label className="text-sm text-uradi-text-secondary">Segment Name</label>
        <Input placeholder="e.g., Youth Swing Voters - Dutse" />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-uradi-text-secondary">Description</label>
        <Input placeholder="Brief description of this segment..." />
      </div>

      <div className="border border-uradi-border rounded-lg p-4 space-y-4">
        <h3 className="font-medium text-uradi-text-primary flex items-center gap-2">
          <Filter className="h-4 w-4 text-uradi-gold" />
          Targeting Criteria
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-uradi-text-secondary">LGAs</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select LGAs" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All LGAs</SelectItem>
                <SelectItem value="dutse">Dutse</SelectItem>
                <SelectItem value="hadejia">Hadejia</SelectItem>
                <SelectItem value="gumel">Gumel</SelectItem>
                <SelectItem value="kazaure">Kazaure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-uradi-text-secondary">Age Range</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select age range" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All Ages</SelectItem>
                <SelectItem value="18-25">18-25</SelectItem>
                <SelectItem value="26-35">26-35</SelectItem>
                <SelectItem value="36-50">36-50</SelectItem>
                <SelectItem value="50+">50+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-uradi-text-secondary">Party Affiliation</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select party" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All Parties</SelectItem>
                <SelectItem value="pdp">PDP</SelectItem>
                <SelectItem value="apc">APC</SelectItem>
                <SelectItem value="nnpp">NNPP</SelectItem>
                <SelectItem value="undecided">Undecided</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-uradi-text-secondary">Sentiment</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select sentiment" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">Key Issues</label>
          <div className="flex flex-wrap gap-2">
            {['Employment', 'Education', 'Healthcare', 'Security', 'Infrastructure', 'Agriculture'].map((issue) => (
              <Badge
                key={issue}
                variant="secondary"
                className="cursor-pointer hover:bg-uradi-gold/20 hover:text-uradi-gold"
              >
                {issue}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-uradi-bg-tertiary rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-uradi-text-secondary">Estimated Reach</span>
          <span className="text-2xl font-bold text-uradi-gold font-mono">12,450</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-uradi-text-primary">8,932</p>
            <p className="text-xs text-uradi-text-tertiary">With Phone</p>
          </div>
          <div>
            <p className="text-lg font-bold text-uradi-text-primary">7,234</p>
            <p className="text-xs text-uradi-text-tertiary">With WhatsApp</p>
          </div>
          <div>
            <p className="text-lg font-bold text-uradi-text-primary">12,450</p>
            <p className="text-xs text-uradi-text-tertiary">Total</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Save as Draft</Button>
        <Button className="gap-2">
          <Target className="h-4 w-4" />
          Create Segment
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
