'use client';

import { useState } from 'react';
import {
  Users,
  Users2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Phone,
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

const coalitionPartners = [
  {
    id: 1,
    name: 'Youth Progressive Forum',
    type: 'Youth Organization',
    commitment: 'Strong',
    resources_pledged: 5000000,
    resources_delivered: 3500000,
    health: 'strong',
    last_contact: '2 days ago',
    contact_person: 'Ibrahim Yusuf',
    phone: '+234 801 234 5678',
  },
  {
    id: 2,
    name: 'Market Traders Association',
    type: 'Economic Group',
    commitment: 'Stable',
    resources_pledged: 3000000,
    resources_delivered: 1200000,
    health: 'stable',
    last_contact: '1 week ago',
    contact_person: 'Alhaji Musa Danladi',
    phone: '+234 802 345 6789',
  },
  {
    id: 3,
    name: 'Religious Leaders Council',
    type: 'Faith Organization',
    commitment: 'Fragile',
    resources_pledged: 2000000,
    resources_delivered: 500000,
    health: 'fragile',
    last_contact: '2 weeks ago',
    contact_person: 'Imam Abubakar',
    phone: '+234 803 456 7890',
  },
  {
    id: 4,
    name: 'Women Empowerment Network',
    type: 'Women Group',
    commitment: 'Strong',
    resources_pledged: 2500000,
    resources_delivered: 2500000,
    health: 'strong',
    last_contact: '1 day ago',
    contact_person: 'Hajiya Amina Hassan',
    phone: '+234 804 567 8901',
  },
];

const getHealthBadge = (health: string) => {
  switch (health) {
    case 'strong': return <Badge variant="success">Strong</Badge>;
    case 'stable': return <Badge className="bg-uradi-status-info/20 text-uradi-status-info">Stable</Badge>;
    case 'fragile': return <Badge variant="warning">Fragile</Badge>;
    case 'at_risk': return <Badge variant="destructive">At Risk</Badge>;
    default: return <Badge variant="secondary">{health}</Badge>;
  }
};

const getCommitmentColor = (commitment: string) => {
  switch (commitment) {
    case 'Strong': return 'text-uradi-status-positive';
    case 'Stable': return 'text-uradi-status-info';
    case 'Fragile': return 'text-uradi-status-warning';
    case 'At Risk': return 'text-uradi-status-critical';
    default: return 'text-uradi-text-secondary';
  }
};

export default function CoalitionPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const totalPledged = coalitionPartners.reduce((sum, p) => sum + p.resources_pledged, 0);
  const totalDelivered = coalitionPartners.reduce((sum, p) => sum + p.resources_delivered, 0);
  const deliveryRate = Math.round((totalDelivered / totalPledged) * 100);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-uradi-text-primary">Coalition Management</h1>
          <p className="text-uradi-text-secondary mt-1">
            Track coalition partners, resources, and alliance health
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Partner
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Partners" value="12" change="+2" icon={Users2} color="uradi-status-info" />
        <StatCard title="Strong Alliances" value="7" change="58%" icon={CheckCircle} color="uradi-status-positive" />
        <StatCard title="Resources Pledged" value={`₦${(totalPledged / 1000000).toFixed(1)}M`} change="+₦2.5M" icon={DollarSign} color="uradi-gold" />
        <StatCard title="Delivery Rate" value={`${deliveryRate}%`} change="On track" icon={TrendingUp} color="uradi-status-neutral" />
      </div>

      <Tabs defaultValue="partners" className="space-y-6">
        <TabsList className="bg-uradi-bg-secondary border border-uradi-border">
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="partners">
          <div className="flex flex-wrap items-center gap-4 p-4 bg-uradi-bg-secondary border border-uradi-border rounded-xl mb-4">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Users className="h-4 w-4 text-uradi-text-tertiary" />
              <Input
                placeholder="Search partners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>

            <Select>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Health Status" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="strong">Strong</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="fragile">Fragile</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-uradi-border hover:bg-transparent">
                  <TableHead>Partner</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Commitment</TableHead>
                  <TableHead>Resources</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coalitionPartners.map((partner) => (
                  <TableRow key={partner.id} className="border-uradi-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-uradi-bg-tertiary flex items-center justify-center text-uradi-text-secondary font-medium text-sm">
                          {partner.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-uradi-text-primary">{partner.name}</p>
                          <p className="text-xs text-uradi-text-tertiary">{partner.contact_person}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-uradi-text-secondary">{partner.type}</TableCell>
                    <TableCell className={getCommitmentColor(partner.commitment)}>
                      {partner.commitment}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-uradi-text-primary font-mono">
                          ₦{(partner.resources_delivered / 1000000).toFixed(1)}M / ₦{(partner.resources_pledged / 1000000).toFixed(1)}M
                        </span>
                        <div className="w-24 h-1.5 bg-uradi-bg-tertiary rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-uradi-gold"
                            style={{ width: `${(partner.resources_delivered / partner.resources_pledged) * 100}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getHealthBadge(partner.health)}</TableCell>
                    <TableCell className="text-uradi-text-secondary">{partner.last_contact}</TableCell>
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

        <TabsContent value="resources">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Resource Allocation</CardTitle>
                <CardDescription>Breakdown of pledged vs delivered resources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {coalitionPartners.map((partner) => (
                  <div key={partner.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-uradi-text-primary">{partner.name}</span>
                      <span className="text-sm text-uradi-text-secondary font-mono">
                        {Math.round((partner.resources_delivered / partner.resources_pledged) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-uradi-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          partner.resources_delivered / partner.resources_pledged >= 0.8
                            ? 'bg-uradi-status-positive'
                            : partner.resources_delivered / partner.resources_pledged >= 0.5
                            ? 'bg-uradi-gold'
                            : 'bg-uradi-status-warning'
                        }`}
                        style={{ width: `${(partner.resources_delivered / partner.resources_pledged) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Delivery Alerts</CardTitle>
                <CardDescription>Partners with low delivery rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {coalitionPartners
                    .filter((p) => p.resources_delivered / p.resources_pledged < 0.5)
                    .map((partner) => (
                      <div
                        key={partner.id}
                        className="flex items-center gap-3 p-3 bg-uradi-status-warning/10 border border-uradi-status-warning/20 rounded-lg"
                      >
                        <AlertCircle className="h-5 w-5 text-uradi-status-warning" />
                        <div className="flex-1">
                          <p className="text-sm text-uradi-text-primary">{partner.name}</p>
                          <p className="text-xs text-uradi-text-secondary">
                            Only {Math.round((partner.resources_delivered / partner.resources_pledged) * 100)}% delivered
                          </p>
                        </div>
                        <Button size="sm" variant="outline">Contact</Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="bg-uradi-bg-secondary border-uradi-border">
            <CardHeader>
              <CardTitle className="text-uradi-text-primary">Alliance Health Timeline</CardTitle>
              <CardDescription>Track relationship strength over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coalitionPartners.map((partner) => (
                  <div key={partner.id} className="flex items-center gap-4 p-3 border border-uradi-border rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-uradi-bg-tertiary flex items-center justify-center text-uradi-text-secondary font-medium">
                      {partner.name.substring(0, 2)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-uradi-text-primary">{partner.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-uradi-text-tertiary" />
                        <span className="text-xs text-uradi-text-secondary">Last contact: {partner.last_contact}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="gap-1">
                        <Phone className="h-3 w-3" />
                        Call
                      </Button>
                      {getHealthBadge(partner.health)}
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
