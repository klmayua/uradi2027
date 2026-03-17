'use client';

import { useState } from 'react';
import {
  MessageSquare,
  Send,
  Users,
  Smartphone,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  MoreHorizontal,
  Filter,
  Download,
  TrendingUp,
  Target,
  Zap,
  FileText,
  Mic,
  Play,
  Pause,
  Copy,
  Trash2,
  Edit3,
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

interface Broadcast {
  id: string;
  title: string;
  channel: 'sms' | 'whatsapp' | 'voice' | 'email';
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  audience: string;
  recipients: number;
  delivered: number;
  scheduled_for?: string;
  sent_at?: string;
  content: string;
}

const mockBroadcasts: Broadcast[] = [
  {
    id: '1',
    title: 'Rally Reminder - Dutse',
    channel: 'sms',
    status: 'completed',
    audience: 'Dutse LGA Supporters',
    recipients: 15420,
    delivered: 15289,
    sent_at: '2026-03-15 08:00',
    content: 'Join us today at 2PM in Dutse Central Stadium for our campaign rally! Your support matters.',
  },
  {
    id: '2',
    title: 'Policy Announcement',
    channel: 'whatsapp',
    status: 'sending',
    audience: 'All Contacts',
    recipients: 45200,
    delivered: 28940,
    scheduled_for: '2026-03-16 14:00',
    content: 'We are excited to announce our new education policy...',
  },
  {
    id: '3',
    title: 'Voice Message - Security Update',
    channel: 'voice',
    status: 'scheduled',
    audience: 'Northern LGAs',
    recipients: 8500,
    delivered: 0,
    scheduled_for: '2026-03-17 10:00',
    content: 'Pre-recorded voice message about security initiatives',
  },
  {
    id: '4',
    title: 'Volunteer Recruitment',
    channel: 'sms',
    status: 'draft',
    audience: 'Youth Contacts',
    recipients: 12000,
    delivered: 0,
    content: 'Become a campaign volunteer! Text JOIN to participate...',
  },
  {
    id: '5',
    title: 'Fundraising Appeal',
    channel: 'email',
    status: 'completed',
    audience: 'Donor List',
    recipients: 3200,
    delivered: 3156,
    sent_at: '2026-03-14 18:00',
    content: 'Support our campaign with a donation today...',
  },
];

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case 'sms': return MessageSquare;
    case 'whatsapp': return Smartphone;
    case 'voice': return Mic;
    case 'email': return Mail;
    default: return MessageSquare;
  }
};

const getChannelBadge = (channel: string) => {
  switch (channel) {
    case 'sms': return <Badge variant="secondary">SMS</Badge>;
    case 'whatsapp': return <Badge className="bg-green-500/20 text-green-400">WhatsApp</Badge>;
    case 'voice': return <Badge className="bg-uradi-status-info/20 text-uradi-status-info">Voice</Badge>;
    case 'email': return <Badge className="bg-uradi-gold/20 text-uradi-gold">Email</Badge>;
    default: return <Badge variant="secondary">{channel}</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed': return <Badge variant="success">Completed</Badge>;
    case 'sending': return <Badge className="bg-uradi-status-info/20 text-uradi-status-info animate-pulse">Sending...</Badge>;
    case 'scheduled': return <Badge variant="warning">Scheduled</Badge>;
    case 'draft': return <Badge variant="secondary">Draft</Badge>;
    case 'failed': return <Badge variant="destructive">Failed</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function MessagingPage() {
  const [activeTab, setActiveTab] = useState('broadcasts');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-uradi-text-primary">Messaging Center</h1>
          <p className="text-uradi-text-secondary mt-1">
            Send broadcasts, manage templates, and track message delivery
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Send className="h-4 w-4" />
                New Broadcast
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-uradi-bg-secondary border-uradi-border">
              <DialogHeader>
                <DialogTitle className="text-uradi-text-primary">Create Broadcast</DialogTitle>
              </DialogHeader>
              <BroadcastComposer />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard title="Total Sent" value="89.2K" change="+12.5%" icon={Send} color="uradi-status-info" />
        <StatCard title="Delivery Rate" value="96.8%" change="+2.1%" icon={CheckCircle} color="uradi-status-positive" />
        <StatCard title="SMS Sent" value="45.3K" change="Today" icon={MessageSquare} color="uradi-gold" />
        <StatCard title="WhatsApp" value="32.1K" change="Today" icon={Smartphone} color="uradi-status-neutral" />
        <StatCard title="Voice Calls" value="11.8K" change="Today" icon={Mic} color="uradi-status-warning" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-uradi-bg-secondary border border-uradi-border">
          <TabsTrigger value="broadcasts">Broadcasts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="audiences">Audiences</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="broadcasts" className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 p-4 bg-uradi-bg-secondary border border-uradi-border rounded-xl">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Filter className="h-4 w-4 text-uradi-text-tertiary" />
              <Input placeholder="Search broadcasts..." className="flex-1" />
            </div>

            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="voice">Voice</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="sending">Sending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-uradi-border hover:bg-transparent">
                  <TableHead>Broadcast</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Delivered</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBroadcasts.map((broadcast) => {
                  const ChannelIcon = getChannelIcon(broadcast.channel);
                  const deliveryRate = broadcast.recipients > 0
                    ? Math.round((broadcast.delivered / broadcast.recipients) * 100)
                    : 0;

                  return (
                    <TableRow key={broadcast.id} className="border-uradi-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-uradi-gold/10 flex items-center justify-center">
                            <ChannelIcon className="h-4 w-4 text-uradi-gold" />
                          </div>
                          <span className="font-medium text-uradi-text-primary">{broadcast.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getChannelBadge(broadcast.channel)}</TableCell>
                      <TableCell className="text-uradi-text-secondary">{broadcast.audience}</TableCell>
                      <TableCell className="font-mono text-uradi-text-primary">
                        {broadcast.recipients.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-uradi-bg-tertiary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-uradi-status-positive"
                              style={{ width: `${deliveryRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-mono text-uradi-text-secondary">{deliveryRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(broadcast.status)}</TableCell>
                      <TableCell className="text-uradi-text-secondary">
                        {broadcast.sent_at || broadcast.scheduled_for || '-'}
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

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Rally Invitation', channel: 'sms', usage: 45, content: 'Join us at {location} on {date} at {time} for our campaign rally!' },
              { name: 'Policy Update', channel: 'whatsapp', usage: 23, content: 'We are excited to share our new policy on {topic}...' },
              { name: 'Volunteer Call', channel: 'voice', usage: 12, content: 'Pre-recorded voice message for volunteer recruitment' },
              { name: 'Thank You Message', channel: 'sms', usage: 67, content: 'Thank you for your support! Together we will win.' },
              { name: 'Event Reminder', channel: 'sms', usage: 34, content: 'Reminder: {event} tomorrow at {time}. See you there!' },
              { name: 'Donation Appeal', channel: 'email', usage: 18, content: 'Support our campaign with a contribution...' },
            ].map((template) => {
              const ChannelIcon = getChannelIcon(template.channel);
              return (
                <Card key={template.name} className="bg-uradi-bg-secondary border-uradi-border">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-uradi-bg-tertiary flex items-center justify-center">
                          <ChannelIcon className="h-4 w-4 text-uradi-gold" />
                        </div>
                        <div>
                          <h3 className="font-medium text-uradi-text-primary">{template.name}</h3>
                          <p className="text-xs text-uradi-text-secondary capitalize">{template.channel}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{template.usage} uses</Badge>
                    </div>
                    <p className="text-sm text-uradi-text-secondary line-clamp-2">{template.content}</p>
                    <div className="flex items-center gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1 gap-1">
                        <Copy className="h-3 w-3" />
                        Use
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="audiences" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'All Supporters', count: 89420, description: 'All registered supporters across all LGAs', segments: ['Voters', 'Volunteers', 'Donors'] },
              { name: 'Dutse LGA', count: 12450, description: 'Supporters in Dutse Local Government', segments: ['Ward 1-10', 'Youth', 'Women'] },
              { name: 'Youth Contacts', count: 34200, description: 'Supporters aged 18-35', segments: ['Students', 'Workers', 'Unemployed'] },
              { name: 'VIP Donors', count: 1250, description: 'High-value donors and supporters', segments: ['Business', 'Politicians', 'Elite'] },
            ].map((audience) => (
              <Card key={audience.name} className="bg-uradi-bg-secondary border-uradi-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-uradi-text-primary">{audience.name}</h3>
                      <p className="text-sm text-uradi-text-secondary mt-1">{audience.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {audience.segments.map((segment) => (
                          <Badge key={segment} variant="secondary" className="text-xs">
                            {segment}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-uradi-gold font-mono">
                        {audience.count.toLocaleString()}
                      </p>
                      <p className="text-xs text-uradi-text-tertiary">contacts</p>
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
                <CardTitle className="text-uradi-text-primary">Channel Performance</CardTitle>
                <CardDescription>Delivery rates by channel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { channel: 'SMS', sent: 45300, delivered: 44141, rate: 97.4 },
                  { channel: 'WhatsApp', sent: 32100, delivered: 31378, rate: 97.8 },
                  { channel: 'Voice', sent: 11800, delivered: 10856, rate: 92.0 },
                  { channel: 'Email', sent: 3200, delivered: 3136, rate: 98.0 },
                ].map((item) => (
                  <div key={item.channel} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-uradi-text-primary">{item.channel}</span>
                      <span className="text-sm font-mono text-uradi-gold">{item.rate}%</span>
                    </div>
                    <div className="h-2 bg-uradi-bg-tertiary rounded-full overflow-hidden">
                      <div className="h-full bg-uradi-gold" style={{ width: `${item.rate}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-uradi-text-tertiary">
                      <span>{item.delivered.toLocaleString()} delivered</span>
                      <span>{item.sent.toLocaleString()} sent</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Recent Activity</CardTitle>
                <CardDescription>Last 7 days message volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                    const volume = [12000, 15000, 18000, 14000, 22000, 25000, 19000][i];
                    return (
                      <div key={day} className="flex items-center gap-3">
                        <span className="text-sm text-uradi-text-secondary w-10">{day}</span>
                        <div className="flex-1">
                          <div className="h-6 bg-uradi-bg-tertiary rounded overflow-hidden">
                            <div
                              className="h-full bg-uradi-gold"
                              style={{ width: `${(volume / 25000) * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-mono text-uradi-text-primary w-16 text-right">
                          {(volume / 1000).toFixed(1)}K
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BroadcastComposer() {
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['sms']);

  const toggleChannel = (channel: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  };

  return (
    <div className="space-y-6 mt-4">
      <div className="space-y-2">
        <label className="text-sm text-uradi-text-secondary">Broadcast Title</label>
        <Input placeholder="e.g., Rally Reminder - Dutse" />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-uradi-text-secondary">Select Channels</label>
        <div className="grid grid-cols-4 gap-3">
          {[
            { id: 'sms', name: 'SMS', icon: MessageSquare },
            { id: 'whatsapp', name: 'WhatsApp', icon: Smartphone },
            { id: 'voice', name: 'Voice', icon: Mic },
            { id: 'email', name: 'Email', icon: Mail },
          ].map((channel) => {
            const Icon = channel.icon;
            const isSelected = selectedChannels.includes(channel.id);
            return (
              <button
                key={channel.id}
                onClick={() => toggleChannel(channel.id)}
                className={`p-3 rounded-lg border transition-colors ${
                  isSelected
                    ? 'border-uradi-gold bg-uradi-gold/10 text-uradi-gold'
                    : 'border-uradi-border text-uradi-text-secondary hover:border-uradi-gold/50'
                }`}
              >
                <Icon className="h-5 w-5 mx-auto mb-1" />
                <span className="text-xs">{channel.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-uradi-text-secondary">Target Audience</label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select audience" />
          </SelectTrigger>
          <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
            <SelectItem value="all">All Supporters</SelectItem>
            <SelectItem value="dutse">Dutse LGA</SelectItem>
            <SelectItem value="hadejia">Hadejia LGA</SelectItem>
            <SelectItem value="youth">Youth Contacts</SelectItem>
            <SelectItem value="women">Women Groups</SelectItem>
            <SelectItem value="vip">VIP Donors</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-uradi-text-secondary">Message Content</label>
        <textarea
          className="w-full min-h-[120px] rounded-lg border border-uradi-border bg-uradi-bg-primary px-3 py-2 text-sm text-uradi-text-primary placeholder:text-uradi-text-tertiary focus:outline-none focus:ring-2 focus:ring-uradi-gold/50 focus:border-uradi-gold"
          placeholder="Type your message here..."
          maxLength={160}
        />
        <p className="text-xs text-uradi-text-tertiary text-right">0/160 characters</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">Schedule</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="When to send" />
            </SelectTrigger>
            <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
              <SelectItem value="now">Send Now</SelectItem>
              <SelectItem value="later">Schedule for Later</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">Date & Time</label>
          <Input type="datetime-local" disabled />
        </div>
      </div>

      <div className="p-4 bg-uradi-bg-tertiary rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-uradi-text-secondary">Estimated Recipients</span>
          <span className="text-uradi-gold font-mono font-bold">89,420</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-uradi-text-secondary">Estimated Cost</span>
          <span className="text-uradi-text-primary font-mono">₦45,200</span>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Save Draft</Button>
        <Button className="gap-2">
          <Send className="h-4 w-4" />
          Send Broadcast
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
