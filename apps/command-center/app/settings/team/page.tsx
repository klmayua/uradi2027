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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Users,
  Plus,
  Mail,
  RefreshCw,
  Trash2,
  User,
  Shield,
  AlertTriangle,
} from 'lucide-react';

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: string;
  assigned_lga?: string;
  status: 'active' | 'pending' | 'inactive';
  last_login?: string;
  created_at: string;
}

const mockTeam: TeamMember[] = [
  {
    id: '1',
    full_name: 'Admin User',
    email: 'admin@uradi360.com',
    role: 'admin',
    status: 'active',
    last_login: '2026-03-20T10:00:00Z',
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: '2',
    full_name: 'Coordinator A',
    email: 'coordinator@uradi360.com',
    role: 'coordinator',
    assigned_lga: 'Dutse',
    status: 'active',
    last_login: '2026-03-19T15:30:00Z',
    created_at: '2026-03-05T00:00:00Z',
  },
  {
    id: '3',
    full_name: 'Field Agent 1',
    email: 'agent1@uradi360.com',
    role: 'field_agent',
    assigned_lga: 'Hadejia',
    status: 'pending',
    created_at: '2026-03-20T00:00:00Z',
  },
];

const roles = [
  { value: 'admin', label: 'Admin', description: 'Full access to all features' },
  { value: 'strategist', label: 'Strategist', description: 'Analytics and planning' },
  { value: 'coordinator', label: 'Coordinator', description: 'Manage field operations' },
  { value: 'analyst', label: 'Analyst', description: 'Data analysis and reports' },
  { value: 'field_agent', label: 'Field Agent', description: 'Data collection and canvassing' },
  { value: 'monitor', label: 'Monitor', description: 'Election day monitoring' },
];

export default function TeamPage() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [inviteLga, setInviteLga] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleInvite = async () => {
    setIsSending(true);
    // API call to send invite
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSending(false);
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteRole('');
  };

  const handleResendInvite = (memberId: string) => {
    // Resend invite
    console.log('Resending invite to', memberId);
  };

  const handleRevokeAccess = (memberId: string) => {
    // Revoke access
    console.log('Revoking access for', memberId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Management</h1>
          <p className="text-slate-400 mt-1">
            Invite and manage campaign team members
          </p>
        </div>
        <Button
          onClick={() => setShowInviteModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950"
        >
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Members"
          value={mockTeam.length}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Active"
          value={mockTeam.filter((m) => m.status === 'active').length}
          icon={<User className="w-5 h-5" />}
        />
        <StatCard
          title="Pending"
          value={mockTeam.filter((m) => m.status === 'pending').length}
          icon={<Mail className="w-5 h-5" />}
        />
        <StatCard
          title="Admins"
          value={mockTeam.filter((m) => m.role === 'admin').length}
          icon={<Shield className="w-5 h-5" />}
        />
      </div>

      {/* Team Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="text-slate-300">Name</TableHead>
                <TableHead className="text-slate-300">Role</TableHead>
                <TableHead className="text-slate-300">Assigned LGA</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Last Login</TableHead>
                <TableHead className="text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTeam.map((member) => (
                <TableRow
                  key={member.id}
                  className="border-slate-700 hover:bg-slate-700/50"
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-200">
                        {member.full_name}
                      </p>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="capitalize border-slate-600 text-slate-400"
                    >
                      {member.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-300">
                      {member.assigned_lga || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        member.status === 'active'
                          ? 'border-emerald-500 text-emerald-400'
                          : member.status === 'pending'
                          ? 'border-amber-500 text-amber-400'
                          : 'border-slate-600 text-slate-400'
                      }
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-400 text-sm">
                      {member.last_login
                        ? new Date(member.last_login).toLocaleDateString()
                        : 'Never'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {member.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResendInvite(member.id)}
                          className="h-8 w-8 p-0"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeAccess(member.id)}
                        className="h-8 w-8 p-0 text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription className="text-slate-400">
              Send an invitation email to join your campaign team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-slate-900 border-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Role</label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="bg-slate-900 border-slate-700">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div>
                        <div className="font-medium">{role.label}</div>
                        <div className="text-xs text-slate-500">
                          {role.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {inviteRole === 'field_agent' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Assigned LGA
                </label>
                <Select value={inviteLga} onValueChange={setInviteLga}>
                  <SelectTrigger className="bg-slate-900 border-slate-700">
                    <SelectValue placeholder="Select LGA" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="dutse">Dutse</SelectItem>
                    <SelectItem value="hadejia">Hadejia</SelectItem>
                    <SelectItem value="gumel">Gumel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-400">
                The invited user will receive an email with a link to set up
                their account. The link expires in 7 days.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInviteModal(false)}
              className="border-slate-700 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!inviteEmail || !inviteRole || isSending}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invite
                </>
              )}
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
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
          </div>
          <div className="p-2 rounded-lg bg-slate-700 text-slate-400">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
