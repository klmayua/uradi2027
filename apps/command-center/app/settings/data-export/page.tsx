'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
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
  Download,
  FileText,
  Database,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
  Shield,
  Users,
  Radio,
  TrendingUp,
  Archive,
  Calendar,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ExportJob {
  id: string;
  exportType: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  fileUrl?: string;
  fileSize?: string;
  recordCount?: number;
  errorMessage?: string;
  createdAt: string;
  expiresAt: string;
}

const mockExports: ExportJob[] = [
  {
    id: '1',
    exportType: 'voters',
    format: 'csv',
    status: 'completed',
    progress: 100,
    fileUrl: '/api/exports/download/1',
    fileSize: '2.4 MB',
    recordCount: 15420,
    createdAt: '2026-03-19T10:30:00Z',
    expiresAt: '2026-03-26T10:30:00Z',
  },
  {
    id: '2',
    exportType: 'full',
    format: 'csv',
    status: 'processing',
    progress: 65,
    createdAt: '2026-03-20T08:00:00Z',
    expiresAt: '2026-03-27T08:00:00Z',
  },
  {
    id: '3',
    exportType: 'mentions',
    format: 'json',
    status: 'failed',
    progress: 0,
    errorMessage: 'Database timeout',
    createdAt: '2026-03-18T14:00:00Z',
    expiresAt: '2026-03-25T14:00:00Z',
  },
];

const exportTypes = [
  { value: 'voters', label: 'Voter Database', icon: Users, description: 'All voter records with contact info' },
  { value: 'mentions', label: 'OSINT Mentions', icon: Radio, description: 'Social media and news mentions' },
  { value: 'sentiment', label: 'Sentiment Analysis', icon: TrendingUp, description: 'Sentiment trends and scores' },
  { value: 'narratives', label: 'Narrative Trends', icon: FileText, description: 'Emerging narrative analysis' },
  { value: 'full', label: 'Full Data Export', icon: Archive, description: 'Complete campaign dataset' },
];

const formatOptions = [
  { value: 'csv', label: 'CSV (Excel)' },
  { value: 'json', label: 'JSON' },
];

const scheduledFrequency = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly (Sundays)' },
  { value: 'monthly', label: 'Monthly (1st)' },
];

export default function DataExportPage() {
  const [selectedType, setSelectedType] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [includePii, setIncludePii] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState('weekly');
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [retentionDays, setRetentionDays] = useState(90);

  const handleRequestExport = async () => {
    setIsRequesting(true);
    // API call would go here
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRequesting(false);
    // Reset form
    setSelectedType('');
    setDateFrom('');
    setDateTo('');
  };

  const handleDownload = (exportId: string) => {
    window.open(`/api/exports/download/${exportId}`, '_blank');
  };

  const handleDeleteExport = (exportId: string) => {
    // API call to delete export
    console.log('Deleting export', exportId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-slate-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-emerald-500 text-emerald-400';
      case 'processing':
        return 'border-amber-500 text-amber-400';
      case 'pending':
        return 'border-slate-500 text-slate-400';
      case 'failed':
        return 'border-rose-500 text-rose-400';
      default:
        return 'border-slate-600 text-slate-400';
    }
  };

  const selectedTypeInfo = exportTypes.find((t) => t.value === selectedType);
  const TypeIcon = selectedTypeInfo?.icon || Database;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Data Export</h1>
          <p className="text-slate-400 mt-1">
            Export campaign data and configure automated backups
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowScheduleDialog(true)}
          className="border-slate-700 hover:bg-slate-800"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Backup
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Exports"
          value={24}
          icon={<Database className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Exports This Month"
          value={8}
          icon={<Download className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Storage Used"
          value="156 MB"
          icon={<Archive className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Scheduled Backups"
          value="Off"
          icon={<Calendar className="w-5 h-5" />}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Request Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Download className="w-5 h-5" />
                New Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Export Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Export Type
                </label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="bg-slate-900 border-slate-700">
                    <SelectValue placeholder="Select data to export" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {exportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-slate-500">
                              {type.description}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Format */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Format
                </label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger className="bg-slate-900 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {formatOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Date Range (Optional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="bg-slate-900 border-slate-700"
                    placeholder="From"
                  />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="bg-slate-900 border-slate-700"
                    placeholder="To"
                  />
                </div>
              </div>

              {/* PII Checkbox */}
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <Checkbox
                  id="includePii"
                  checked={includePii}
                  onCheckedChange={(checked) => setIncludePii(checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="includePii"
                    className="text-sm font-medium text-amber-400 cursor-pointer"
                  >
                    Include Personal Data
                  </label>
                  <p className="text-xs text-amber-400/70">
                    Includes names, phone numbers, and addresses. Requires admin approval.
                  </p>
                </div>
              </div>

              {/* Export Preview */}
              {selectedType && (
                <div className="p-4 bg-slate-900 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-slate-300">
                    <TypeIcon className="w-4 h-4" />
                    <span className="font-medium">{selectedTypeInfo?.label}</span>
                  </div>
                  <div className="text-sm text-slate-500">
                    Format: {selectedFormat.toUpperCase()}
                  </div>
                  {includePii && (
                    <div className="flex items-center gap-1 text-xs text-amber-400">
                      <Shield className="w-3 h-3" />
                      <span>PII included - handle with care</span>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={handleRequestExport}
                disabled={!selectedType || isRequesting}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950"
              >
                {isRequesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Request Export
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* GDPR Notice */}
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-400">
                <p className="font-medium text-slate-300 mb-1">Data Protection</p>
                <p>
                  All exports are encrypted and expire after 7 days. Downloads are logged
                  for audit purposes. Ensure compliance with local data protection regulations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Export History */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Export History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Type</TableHead>
                    <TableHead className="text-slate-300">Records</TableHead>
                    <TableHead className="text-slate-300">Size</TableHead>
                    <TableHead className="text-slate-300">Created</TableHead>
                    <TableHead className="text-slate-300">Expires</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockExports.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-slate-500"
                      >
                        No exports found
                      </TableCell>
                    </TableRow>
                  ) : (
                    mockExports.map((export_) => (
                      <TableRow
                        key={export_.id}
                        className="border-slate-700 hover:bg-slate-700/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(export_.status)}
                            <Badge
                              variant="outline"
                              className={`capitalize ${getStatusColor(export_.status)}`}
                            >
                              {export_.status}
                            </Badge>
                          </div>
                          {export_.status === 'processing' && (
                            <Progress
                              value={export_.progress}
                              className="w-20 h-1 mt-2"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-200">
                            {exportTypes.find((t) => t.value === export_.exportType)?.label || export_.exportType}
                          </div>
                          <div className="text-xs text-slate-500 uppercase">
                            {export_.format}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-300">
                            {export_.recordCount?.toLocaleString() || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-300">
                            {export_.fileSize || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-400">
                            {new Date(export_.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-400">
                            {new Date(export_.expiresAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {export_.status === 'completed' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(export_.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteExport(export_.id)}
                              className="h-8 w-8 p-0 text-rose-400 hover:text-rose-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Schedule Backup Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Schedule Automated Backups</DialogTitle>
            <DialogDescription className="text-slate-400">
              Configure regular automated exports of your campaign data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
              <div>
                <div className="font-medium">Enable Scheduled Backups</div>
                <div className="text-sm text-slate-500">
                  Automatically export data on a schedule
                </div>
              </div>
              <Checkbox
                checked={scheduleEnabled}
                onCheckedChange={(checked) => setScheduleEnabled(checked as boolean)}
              />
            </div>

            {scheduleEnabled && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Backup Frequency
                  </label>
                  <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
                    <SelectTrigger className="bg-slate-900 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {scheduledFrequency.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Retention (Days)
                  </label>
                  <Input
                    type="number"
                    value={retentionDays}
                    onChange={(e) => setRetentionDays(parseInt(e.target.value))}
                    min={1}
                    max={365}
                    className="bg-slate-900 border-slate-700"
                  />
                  <p className="text-xs text-slate-500">
                    Backups older than this will be automatically deleted
                  </p>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-400">
                      <p className="font-medium mb-1">Storage Usage</p>
                      <p>
                        With daily backups and 90-day retention, expect approximately
                        10-50 GB of storage usage depending on your data volume.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowScheduleDialog(false)}
              className="border-slate-700 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowScheduleDialog(false)}
              disabled={!scheduleEnabled}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Save Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
  value: string | number;
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
