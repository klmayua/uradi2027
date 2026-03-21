'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Users, MapPin, TrendingUp, Activity } from 'lucide-react';
import { useElectionDayDashboard, useElectionResults } from '@/hooks/useElectionDay';
import { useIncidents } from '@/hooks/useIncidents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TouchButton } from '@/components/ui/ResponsiveTable';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

function ElectionDayDashboard() {
  const router = useRouter();
  const [selectedLga, setSelectedLga] = useState<string>('');

  const { data: dashboard, isLoading: dashboardLoading } = useElectionDayDashboard();
  const { data: results, isLoading: resultsLoading } = useElectionResults({
    lga_id: selectedLga || undefined,
    limit: 5,
  });
  const { data: incidents, isLoading: incidentsLoading } = useIncidents({
    status: 'reported',
    limit: 5,
  });

  if (dashboardLoading) {
    return <LoadingSkeleton type="dashboard" />;
  }

  const stats = dashboard;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-uradi-text-primary">Election Day Command Center</h1>
          <p className="text-uradi-text-secondary mt-1">
            Real-time monitoring and results tracking
          </p>
        </div>
        <div className="flex gap-2">
          <TouchButton
            variant="secondary"
            onClick={() => router.push('/election-day/incidents')}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Report Incident
          </TouchButton>
          <TouchButton
            onClick={() => router.push('/election-day/results')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Enter Results
          </TouchButton>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-uradi-text-secondary">
              Total Votes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-uradi-text-primary">
              {stats?.total_votes_cast?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-uradi-text-tertiary mt-1">
              Across all polling units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-uradi-text-secondary">
              Polling Units Reporting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-uradi-gold">
              {stats?.polling_units_reporting || 0}
            </div>
            <p className="text-xs text-uradi-text-tertiary mt-1">
              of {stats?.total_polling_units || 0} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-uradi-text-secondary">
              Active Monitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-uradi-status-success">
              {stats?.active_monitors || 0}
            </div>
            <p className="text-xs text-uradi-text-tertiary mt-1">
              Field agents online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-uradi-text-secondary">
              Open Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-uradi-status-critical">
              {stats?.open_incidents || 0}
            </div>
            <p className="text-xs text-uradi-text-tertiary mt-1">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Results */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-uradi-gold" />
              Latest Results
            </CardTitle>
            <TouchButton
              variant="ghost"
              size="sm"
              onClick={() => router.push('/election-day/results')}
            >
              View All
            </TouchButton>
          </CardHeader>
          <CardContent>
            {resultsLoading ? (
              <LoadingSkeleton type="list" count={3} />
            ) : results?.length === 0 ? (
              <div className="text-center py-8 text-uradi-text-tertiary">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No results submitted yet</p>
                <TouchButton
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={() => router.push('/election-day/results/new')}
                >
                  Submit First Result
                </TouchButton>
              </div>
            ) : (
              <div className="space-y-3">
                {results?.items?.map((result: any) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-3 bg-uradi-bg-tertiary rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-uradi-text-primary">
                        {result.polling_unit_name}
                      </p>
                      <p className="text-sm text-uradi-text-secondary">
                        {result.lga_name} • {result.votes_cast?.toLocaleString()} votes
                      </p>
                    </div>
                    <span className="text-xs text-uradi-text-tertiary">
                      {new Date(result.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-uradi-status-critical" />
              Recent Incidents
            </CardTitle>
            <TouchButton
              variant="ghost"
              size="sm"
              onClick={() => router.push('/election-day/incidents')}
            >
              View All
            </TouchButton>
          </CardHeader>
          <CardContent>
            {incidentsLoading ? (
              <LoadingSkeleton type="list" count={3} />
            ) : incidents?.items?.length === 0 ? (
              <div className="text-center py-8 text-uradi-text-tertiary">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No incidents reported</p>
                <p className="text-sm mt-1">Great! Keep monitoring.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {incidents?.items?.map((incident: any) => (
                  <div
                    key={incident.id}
                    className="flex items-start gap-3 p-3 bg-uradi-bg-tertiary rounded-lg"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      incident.severity === 'critical' ? 'bg-red-500' :
                      incident.severity === 'high' ? 'bg-orange-500' :
                      'bg-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-uradi-text-primary">
                        {incident.title}
                      </p>
                      <p className="text-sm text-uradi-text-secondary line-clamp-2">
                        {incident.description}
                      </p>
                      <p className="text-xs text-uradi-text-tertiary mt-1">
                        {incident.lga_name} • {incident.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TouchButton
              variant="secondary"
              onClick={() => router.push('/election-day/monitors')}
            >
              <Users className="w-5 h-5 mb-2" />
              <span className="text-sm">Monitors</span>
            </TouchButton>
            <TouchButton
              variant="secondary"
              onClick={() => router.push('/election-day/polling-units')}
            >
              <MapPin className="w-5 h-5 mb-2" />
              <span className="text-sm">Polling Units</span>
            </TouchButton>
            <TouchButton
              variant="secondary"
              onClick={() => router.push('/election-day/live-map')}
            >
              <Activity className="w-5 h-5 mb-2" />
              <span className="text-sm">Live Map</span>
            </TouchButton>
            <TouchButton
              variant="secondary"
              onClick={() => router.push('/election-day/analytics')}
            >
              <TrendingUp className="w-5 h-5 mb-2" />
              <span className="text-sm">Analytics</span>
            </TouchButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ElectionDayPage() {
  return (
    <ErrorBoundary>
      <ElectionDayDashboard />
    </ErrorBoundary>
  );
}
