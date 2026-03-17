'use client';

import { useState } from 'react';
import {
  FileText,
  Image,
  Video,
  Mic,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  MoreHorizontal,
  Send,
  Edit3,
  Eye,
  MessageSquare,
  ThumbsUp,
  Share2,
  Filter,
  Download,
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

interface ContentItem {
  id: string;
  title: string;
  type: 'post' | 'video' | 'audio' | 'graphic';
  platform: string;
  status: 'draft' | 'review' | 'scheduled' | 'published';
  author: string;
  scheduled_for?: string;
  published_at?: string;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
  performance: 'high' | 'medium' | 'low';
}

const mockContent: ContentItem[] = [
  {
    id: '1',
    title: 'Infrastructure Development Update',
    type: 'post',
    platform: 'Facebook',
    status: 'published',
    author: 'Communications Team',
    published_at: '2026-03-15 14:30',
    engagement: { likes: 2450, shares: 890, comments: 320 },
    performance: 'high',
  },
  {
    id: '2',
    title: 'Youth Empowerment Initiative',
    type: 'video',
    platform: 'TikTok',
    status: 'scheduled',
    author: 'Digital Team',
    scheduled_for: '2026-03-17 18:00',
    engagement: { likes: 0, shares: 0, comments: 0 },
    performance: 'medium',
  },
  {
    id: '3',
    title: 'Healthcare Access Campaign',
    type: 'graphic',
    platform: 'Instagram',
    status: 'review',
    author: 'Design Team',
    engagement: { likes: 0, shares: 0, comments: 0 },
    performance: 'medium',
  },
  {
    id: '4',
    title: 'Radio Address - Security Matters',
    type: 'audio',
    platform: 'Radio',
    status: 'draft',
    author: 'Speech Writer',
    engagement: { likes: 0, shares: 0, comments: 0 },
    performance: 'low',
  },
  {
    id: '5',
    title: 'Education Reform Announcement',
    type: 'post',
    platform: 'Twitter',
    status: 'published',
    author: 'Communications Team',
    published_at: '2026-03-14 09:00',
    engagement: { likes: 1200, shares: 450, comments: 180 },
    performance: 'high',
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'post': return FileText;
    case 'video': return Video;
    case 'audio': return Mic;
    case 'graphic': return Image;
    default: return FileText;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'published': return <Badge variant="success">Published</Badge>;
    case 'scheduled': return <Badge className="bg-uradi-status-info/20 text-uradi-status-info">Scheduled</Badge>;
    case 'review': return <Badge variant="warning">In Review</Badge>;
    case 'draft': return <Badge variant="secondary">Draft</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
};

const getPerformanceColor = (performance: string) => {
  switch (performance) {
    case 'high': return 'text-uradi-status-positive';
    case 'medium': return 'text-uradi-gold';
    case 'low': return 'text-uradi-status-warning';
    default: return 'text-uradi-text-secondary';
  }
};

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState('pipeline');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-uradi-text-primary">Content Pipeline</h1>
          <p className="text-uradi-text-secondary mt-1">
            Plan, create, and publish campaign content across all channels
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Content Calendar
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Content
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-uradi-bg-secondary border-uradi-border">
              <DialogHeader>
                <DialogTitle className="text-uradi-text-primary">Create New Content</DialogTitle>
              </DialogHeader>
              <ContentCreator />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard title="Total Content" value="156" change="+12" icon={FileText} color="uradi-status-info" />
        <StatCard title="Published" value="89" change="This month" icon={CheckCircle} color="uradi-status-positive" />
        <StatCard title="Scheduled" value="23" change="Upcoming" icon={Clock} color="uradi-gold" />
        <StatCard title="In Review" value="8" change="Pending" icon={Eye} color="uradi-status-warning" />
        <StatCard title="Avg Engagement" value="4.2%" change="+0.8%" icon={ThumbsUp} color="uradi-status-neutral" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-uradi-bg-secondary border border-uradi-border">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 p-4 bg-uradi-bg-secondary border border-uradi-border rounded-xl">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Filter className="h-4 w-4 text-uradi-text-tertiary" />
              <Input placeholder="Search content..." className="flex-1" />
            </div>

            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="review">In Review</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="radio">Radio</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="post">Post</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="graphic">Graphic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-uradi-border hover:bg-transparent">
                  <TableHead>Content</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockContent.map((item) => {
                  const TypeIcon = getTypeIcon(item.type);
                  return (
                    <TableRow key={item.id} className="border-uradi-border">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-uradi-gold/10 flex items-center justify-center">
                            <TypeIcon className="h-4 w-4 text-uradi-gold" />
                          </div>
                          <div>
                            <p className="font-medium text-uradi-text-primary">{item.title}</p>
                            <p className="text-xs text-uradi-text-tertiary">by {item.author}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.platform}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-uradi-text-secondary">
                        {item.scheduled_for || item.published_at || '-'}
                      </TableCell>
                      <TableCell>
                        {item.status === 'published' ? (
                          <div className="flex items-center gap-3 text-sm">
                            <span className="flex items-center gap-1 text-uradi-status-positive">
                              <ThumbsUp className="h-3 w-3" />
                              {item.engagement.likes.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1 text-uradi-status-info">
                              <Share2 className="h-3 w-3" />
                              {item.engagement.shares.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1 text-uradi-gold">
                              <MessageSquare className="h-3 w-3" />
                              {item.engagement.comments.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-uradi-text-tertiary text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.status === 'published' && (
                          <span className={`text-sm font-medium ${getPerformanceColor(item.performance)}`}>
                            {item.performance.charAt(0).toUpperCase() + item.performance.slice(1)}
                          </span>
                        )}
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

        <TabsContent value="calendar">
          <Card className="bg-uradi-bg-secondary border-uradi-border">
            <CardHeader>
              <CardTitle className="text-uradi-text-primary">Content Calendar</CardTitle>
              <CardDescription>View and manage scheduled content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-uradi-text-secondary py-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                  <div
                    key={date}
                    className={`aspect-square border border-uradi-border rounded-lg p-2 ${
                      date === 16 ? 'bg-uradi-gold/10 border-uradi-gold' : ''
                    }`}
                  >
                    <span className={`text-sm ${date === 16 ? 'text-uradi-gold font-medium' : 'text-uradi-text-primary'}`}>
                      {date}
                    </span>
                    {date === 17 && (
                      <div className="mt-1 text-xs bg-uradi-status-info/20 text-uradi-status-info px-1 rounded">
                        Video
                      </div>
                    )}
                    {date === 20 && (
                      <div className="mt-1 text-xs bg-uradi-status-warning/20 text-uradi-status-warning px-1 rounded">
                        2 items
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Top Performing Content</CardTitle>
                <CardDescription>Best engagement rates this month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockContent
                  .filter((c) => c.status === 'published')
                  .sort((a, b) => b.engagement.likes - a.engagement.likes)
                  .slice(0, 3)
                  .map((item, index) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 border border-uradi-border rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-uradi-gold/20 flex items-center justify-center text-uradi-gold font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-uradi-text-primary">{item.title}</p>
                        <p className="text-xs text-uradi-text-secondary">{item.platform}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-uradi-status-positive font-mono">
                          {item.engagement.likes.toLocaleString()}
                        </p>
                        <p className="text-xs text-uradi-text-tertiary">likes</p>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card className="bg-uradi-bg-secondary border-uradi-border">
              <CardHeader>
                <CardTitle className="text-uradi-text-primary">Platform Performance</CardTitle>
                <CardDescription>Engagement by platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { platform: 'Facebook', engagement: 5.2, posts: 45 },
                  { platform: 'TikTok', engagement: 8.7, posts: 23 },
                  { platform: 'Twitter', engagement: 3.4, posts: 67 },
                  { platform: 'Instagram', engagement: 6.1, posts: 21 },
                ].map((platform) => (
                  <div key={platform.platform} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-uradi-text-primary">{platform.platform}</span>
                      <span className="text-sm font-mono text-uradi-gold">{platform.engagement}%</span>
                    </div>
                    <div className="h-2 bg-uradi-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-uradi-gold"
                        style={{ width: `${(platform.engagement / 10) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-uradi-text-tertiary">{platform.posts} posts</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Campaign Announcement', type: 'post', usage: 23 },
              { name: 'Policy Highlight', type: 'graphic', usage: 45 },
              { name: 'Event Promotion', type: 'video', usage: 12 },
              { name: 'Success Story', type: 'post', usage: 34 },
              { name: 'Call to Action', type: 'graphic', usage: 56 },
              { name: 'Radio Spot', type: 'audio', usage: 18 },
            ].map((template) => {
              const TypeIcon = getTypeIcon(template.type);
              return (
                <Card key={template.name} className="bg-uradi-bg-secondary border-uradi-border cursor-pointer hover:border-uradi-gold/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="h-10 w-10 rounded-lg bg-uradi-bg-tertiary flex items-center justify-center">
                        <TypeIcon className="h-5 w-5 text-uradi-gold" />
                      </div>
                      <Badge variant="secondary">{template.usage} uses</Badge>
                    </div>
                    <h3 className="font-medium text-uradi-text-primary mt-3">{template.name}</h3>
                    <p className="text-xs text-uradi-text-secondary capitalize">{template.type}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ContentCreator() {
  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">Title</label>
          <Input placeholder="Enter content title..." />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">Content Type</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
              <SelectItem value="post">Social Post</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="audio">Audio/Radio</SelectItem>
              <SelectItem value="graphic">Graphic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">Platform</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent className="bg-uradi-bg-secondary border-uradi-border">
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="radio">Radio</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-uradi-text-secondary">Schedule</label>
          <Input type="datetime-local" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-uradi-text-secondary">Content</label>
        <textarea
          className="w-full min-h-[150px] rounded-lg border border-uradi-border bg-uradi-bg-primary px-3 py-2 text-sm text-uradi-text-primary placeholder:text-uradi-text-tertiary focus:outline-none focus:ring-2 focus:ring-uradi-gold/50 focus:border-uradi-gold"
          placeholder="Write your content here..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-uradi-text-secondary">Media Upload</label>
        <div className="border-2 border-dashed border-uradi-border rounded-lg p-8 text-center hover:border-uradi-gold/50 transition-colors cursor-pointer">
          <Image className="h-8 w-8 text-uradi-text-tertiary mx-auto mb-2" />
          <p className="text-sm text-uradi-text-secondary">Drag & drop or click to upload</p>
          <p className="text-xs text-uradi-text-tertiary mt-1">Supports images, videos, and audio</p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Save Draft</Button>
        <Button className="gap-2">
          <Send className="h-4 w-4" />
          Schedule Content
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
