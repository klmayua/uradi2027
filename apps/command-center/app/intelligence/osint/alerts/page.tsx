'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  AlertOctagon,
  TrendingDown,
  TrendingUp,
  MessageSquare,
  Shield,
  RefreshCw,
  Filter,
} from 'lucide-react';
import {
  useOSINTAlerts,
  useOSINTAlert,
  useAcknowledgeAlert,
  useResolveAlert,
} from '@/hooks/useData';
import type { AlertStatus, AlertSeverity, AlertType } from '@/types';
import { formatDistanceToNow } from '@/lib/utils';
import Link from 'next/link';

export default function AlertsPage() {
  const [filters, setFilters] = useState<{
    status: AlertStatus | '';
    severity: AlertSeverity | '';
    alert_type: AlertType | '';
  }>({
    status: 'open',
    severity: '',
    alert_type: '',
  });

  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [showResolveDialog, setShowResolveDialog] = useState(false);

  const { data: alerts, isLoading, refetch } = useOSINTAlerts(filters);
  const acknowledgeMutation = useAcknowledgeAlert();
  const resolveMutation = useResolveAlert();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'sentiment_crash':
        return <TrendingDown className="w-5 h-5" />;
      case 'volume_spike':
        return <TrendingUp className="w-5 h-5" />;
      case 'crisis_detected':
        return <AlertOctagon className="w-5 h-5" />;
      case 'narrative_shift':
        return <MessageSquare className="w-5 h-5" />;
      case 'security_incident':
        return <Shield className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-500 text-white';
      case 'high':
        return 'bg-amber-500 text-white';
      case 'medium':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'acknowledged':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      default:
        return null;
    }
  };

  const handleAcknowledge = (id: string) => {
    acknowledgeMutation.mutate(id);
  };

  const handleResolve = (id: string) => {
    setSelectedAlert(id);
    setShowResolveDialog(true);
  };

  const confirmResolve = () => {
    if (selectedAlert) {
      resolveMutation.mutate(
        { id: selectedAlert, notes: resolveNotes },
        {
          onSuccess: () => {
            setShowResolveDialog(false);
            setResolveNotes('');
            setSelectedAlert(null);
          },
        }
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            OSINT Alerts
          </h1>
          <p className="text-slate-400 mt-1">
            Monitor and respond to automated intelligence alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="border-slate-700 hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link href="/intelligence/osint">
            <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Open Alerts"
          value={alerts?.items?.filter((a) => a.status === 'open').length || 0}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="rose"
        />
        <StatCard
          title="Acknowledged"
          value={alerts?.items?.filter((a) => a.status === 'acknowledged').length || 0}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Resolved Today"
          value={alerts?.items?.filter(
            (a) =>
              a.status === 'resolved' &&
              a.resolved_at &&
              new Date(a.resolved_at).toDateString() === new Date().toDateString()
          ).length || 0}
          icon={<CheckCircle className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Critical"
          value={alerts?.items?.filter((a) => a.severity === 'critical').length || 0}
          icon={<AlertOctagon className="w-5 h-5" />}
          color="rose"
        />
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="w-40 bg-slate-900 border-slate-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="">All Statuses</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.severity}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, severity: value }))}
            >
              <SelectTrigger className="w-40 bg-slate-900 border-slate-700">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.alert_type}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, alert_type: value }))}
            >
              <SelectTrigger className="w-48 bg-slate-900 border-slate-700">
                <SelectValue placeholder="Alert Type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="sentiment_crash">Sentiment Crash</SelectItem>
                <SelectItem value="volume_spike">Volume Spike</SelectItem>
                <SelectItem value="crisis_detected">Crisis Detected</SelectItem>
                <SelectItem value="narrative_shift">Narrative Shift</SelectItem>
                <SelectItem value="security_incident">Security Incident</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center text-slate-500">
              Loading alerts...
            </CardContent>
          </Card>
        ) : alerts?.items?.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center text-slate-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
              <p className="text-lg font-medium text-slate-300">No alerts found</p>
              <p className="text-sm">All systems are operating normally</p>
            </CardContent>
          </Card>
        ) : (
          alerts?.items?.map((alert) => (
            <Card
              key={alert.id}
              className={`bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors ${
                alert.status === 'open' && alert.severity === 'critical'
                  ? 'border-rose-500/50'
                  : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-lg ${
                      alert.severity === 'critical'
                        ? 'bg-rose-500/20 text-rose-400'
                        : alert.severity === 'high'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {getAlertIcon(alert.alert_type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <Badge variant="outline" className="border-slate-600 capitalize">
                        {alert.alert_type.replace('_', ' ')}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        {getStatusIcon(alert.status)}
                        <span className="capitalize">{alert.status}</span>
                      </div>
                    </div>

                    <p className="text-slate-300 mb-3">{alert.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
                      <span>
                        Created: {formatDistanceToNow(new Date(alert.created_at))}
                      </span>
                      {alert.affected_lgas?.length > 0 && (
                        <span>LGAs: {alert.affected_lgas.join(', ')}</span>
                      )}
                      {alert.triggered_by_mention_ids?.length > 0 && (
                        <span>{alert.triggered_by_mention_ids.length} mentions</span>
                      )}
                    </div>

                    {alert.recommended_actions?.length > 0 && (
                      <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-medium text-slate-300 mb-2">
                          Recommended Actions
                        </h4>
                        <ul className="text-sm text-slate-400 space-y-1">
                          {alert.recommended_actions.map((action, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-amber-400 mt-0.5">•</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      {alert.status === 'open' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={acknowledgeMutation.isPending}
                          className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Acknowledge
                        </Button>
                      )}

                      {(alert.status === 'open' || alert.status === 'acknowledged') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolve(alert.id)}
                          disabled={resolveMutation.isPending}
                          className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Resolve Alert</DialogTitle>
            <DialogDescription className="text-slate-400">
              Add resolution notes before marking this alert as resolved.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={resolveNotes}
            onChange={(e) => setResolveNotes(e.target.value)}
            placeholder="Describe how this alert was resolved..."
            className="bg-slate-900 border-slate-700 min-h-[100px]"
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResolveDialog(false)}
              className="border-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmResolve}
              disabled={!resolveNotes.trim() || resolveMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {resolveMutation.isPending ? 'Resolving...' : 'Resolve Alert'}
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
  value: number;
  icon: React.ReactNode;
  color: 'rose' | 'amber' | 'emerald' | 'blue';
}) {
  const colorClasses = {
    rose: 'bg-rose-500/20 text-rose-400',
    amber: 'bg-amber-500/20 text-amber-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    blue: 'bg-blue-500/20 text-blue-400',
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
