'use client';

/**
 * User Management Page
 * Comprehensive user management with role-based permissions
 */

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  RefreshCw,
  Trash2,
  Edit,
  Shield,
  UserCheck,
  UserX,
  Download,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  useUsers,
  useUserStats,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useResendInvite,
  useBulkUserAction,
  ROLE_DISPLAY_NAMES,
  ROLE_DESCRIPTIONS,
  ROLE_COLORS,
  STATUS_DISPLAY_NAMES,
  STATUS_COLORS,
  type User,
  type UserRole,
  type UserStatus,
} from '@/hooks/useUsers';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// Role options for select
const ROLE_OPTIONS: UserRole[] = [
  'admin',
  'strategist',
  'coordinator',
  'analyst',
  'field_agent',
  'monitor',
  'content_manager',
  'finance_manager',
];

export default function UserManagementPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form state for invite
  const [inviteForm, setInviteForm] = useState({
    email: '',
    full_name: '',
    role: '' as UserRole | '',
    assigned_lga: '',
    phone: '',
  });

  // Fetch data
  const { data: users, isLoading: usersLoading } = useUsers({
    search: search || undefined,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
    limit: 50,
  });

  const { data: stats } = useUserStats();

  // Mutations
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const resendInvite = useResendInvite();
  const bulkAction = useBulkUserAction();

  // Handlers
  const handleInvite = async () => {
    if (!inviteForm.email || !inviteForm.full_name || !inviteForm.role) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createUser.mutateAsync({
        email: inviteForm.email,
        full_name: inviteForm.full_name,
        role: inviteForm.role,
        assigned_lga: inviteForm.assigned_lga || undefined,
        phone: inviteForm.phone || undefined,
        send_invite: true,
      });

      toast({
        title: 'Success',
        description: 'Invitation sent successfully',
      });

      setShowInviteModal(false);
      setInviteForm({ email: '', full_name: '', role: '', assigned_lga: '', phone: '' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    try {
      await updateUser.mutateAsync({
        id: selectedUser.id,
        data: {
          full_name: selectedUser.full_name,
          phone: selectedUser.phone,
          role: selectedUser.role,
          assigned_lga: selectedUser.assigned_lga,
          status: selectedUser.status,
        },
      });

      toast({
        title: 'Success',
        description: 'User updated successfully',
      });

      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser.mutateAsync(selectedUser.id);

      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });

      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleResend = async (userId: string) => {
    try {
      await resendInvite.mutateAsync(userId);
      toast({
        title: 'Success',
        description: 'Invitation resent successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend invitation',
        variant: 'destructive',
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.size === 0) return;

    try {
      await bulkAction.mutateAsync({
        userIds: Array.from(selectedUsers),
        action,
      });

      toast({
        title: 'Success',
        description: `Bulk action completed for ${selectedUsers.size} users`,
      });

      setSelectedUsers(new Set());
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to perform bulk action',
        variant: 'destructive',
      });
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSet = new Set(selectedUsers);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setSelectedUsers(newSet);
  };

  const toggleAllSelection = () => {
    if (selectedUsers.size === (users?.items.length || 0)) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users?.items.map((u) => u.id) || []));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 mt-1">
            Manage team members, roles, and permissions
          </p>
        </div>
        <Button
          onClick={() => setShowInviteModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950"
        >
          <Plus className="w-4 h-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.total_users || 0}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Active Today"
          value={stats?.active_today || 0}
          icon={<UserCheck className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Pending Invites"
          value={stats?.pending_invites || 0}
          icon={<Mail className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Admins"
          value={stats?.by_role?.admin || 0}
          icon={<Shield className="w-5 h-5" />}
          color="violet"
        />
      </div>

      {/* Role Distribution */}
      {stats && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.by_role).map(([role, count]) => (
                <div key={role} className="flex items-center gap-4">
                  <span className="text-slate-300 text-sm w-32 capitalize">
                    {ROLE_DISPLAY_NAMES[role as UserRole]}
                  </span>
                  <div className="flex-1">
                    <Progress
                      value={(count / stats.total_users) * 100}
                      className="h-2"
                    />
                  </div>
                  <span className="text-slate-400 text-sm w-12 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-slate-900 border-slate-700"
                />
              </div>
            </div>

            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole)}>
              <SelectTrigger className="w-40 bg-slate-900 border-slate-700">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="">All Roles</SelectItem>
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_DISPLAY_NAMES[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as UserStatus)}>
              <SelectTrigger className="w-40 bg-slate-900 border-slate-700">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {selectedUsers.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">
                  {selectedUsers.size} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                  className="border-slate-700"
                >
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('deactivate')}
                  className="border-slate-700"
                >
                  Deactivate
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-transparent">
                <TableHead className="w-10">
                  <Checkbox
                    checked={
                      selectedUsers.size === (users?.items.length || 0) &&
                      (users?.items.length || 0) > 0
                    }
                    onCheckedChange={toggleAllSelection}
                  />
                </TableHead>
                <TableHead className="text-slate-300">User</TableHead>
                <TableHead className="text-slate-300">Role</TableHead>
                <TableHead className="text-slate-300">Location</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Last Login</TableHead>
                <TableHead className="text-slate-300 w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-500" />
                  </TableCell>
                </TableRow>
              ) : users?.items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-slate-500"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users?.items.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-slate-700 hover:bg-slate-700/50"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.has(user.id)}
                        onCheckedChange={() => toggleUserSelection(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium',
                            ROLE_COLORS[user.role]
                          )}
                        >
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">
                            {user.full_name}
                          </p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'capitalize',
                          STATUS_COLORS[user.status]
                        )}
                      >
                        {ROLE_DISPLAY_NAMES[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-300">
                        {user.assigned_lga || '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'capitalize',
                          user.status === 'active'
                            ? 'border-emerald-500 text-emerald-400'
                            : user.status === 'pending'
                            ? 'border-amber-500 text-amber-400'
                            : 'border-slate-600 text-slate-400'
                        )}
                      >
                        {STATUS_DISPLAY_NAMES[user.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-400 text-sm">
                        {user.last_login
                          ? new Date(user.last_login).toLocaleDateString()
                          : 'Never'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-slate-800 border-slate-700">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditModal(true);
                            }}
                            className="text-slate-300"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {user.status === 'pending' && (
                            <DropdownMenuItem
                              onClick={() => handleResend(user.id)}
                              className="text-slate-300"
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Resend Invite
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteModal(true);
                            }}
                            className="text-rose-400"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription className="text-slate-400">
              Send an invitation email to join your campaign team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Full Name *
              </label>
              <Input
                value={inviteForm.full_name}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, full_name: e.target.value })
                }
                placeholder="John Doe"
                className="bg-slate-900 border-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Email Address *
              </label>
              <Input
                type="email"
                value={inviteForm.email}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, email: e.target.value })
                }
                placeholder="john@example.com"
                className="bg-slate-900 border-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Phone Number
              </label>
              <Input
                value={inviteForm.phone}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, phone: e.target.value })
                }
                placeholder="+234 800 000 0000"
                className="bg-slate-900 border-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Role *
              </label>
              <Select
                value={inviteForm.role}
                onValueChange={(v) =>
                  setInviteForm({ ...inviteForm, role: v as UserRole })
                }
              >
                <SelectTrigger className="bg-slate-900 border-slate-700">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role} value={role}>
                      <div>
                        <div className="font-medium">
                          {ROLE_DISPLAY_NAMES[role]}
                        </div>
                        <div className="text-xs text-slate-500">
                          {ROLE_DESCRIPTIONS[role]}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {inviteForm.role === 'field_agent' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Assigned LGA
                </label>
                <Select
                  value={inviteForm.assigned_lga}
                  onValueChange={(v) =>
                    setInviteForm({ ...inviteForm, assigned_lga: v })
                  }
                >
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
              disabled={createUser.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950"
            >
              {createUser.isPending ? (
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

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Full Name
                </label>
                <Input
                  value={selectedUser.full_name}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      full_name: e.target.value,
                    })
                  }
                  className="bg-slate-900 border-slate-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Role
                </label>
                <Select
                  value={selectedUser.role}
                  onValueChange={(v) =>
                    setSelectedUser({
                      ...selectedUser,
                      role: v as UserRole,
                    })
                  }
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {ROLE_OPTIONS.map((role) => (
                      <SelectItem key={role} value={role}>
                        {ROLE_DISPLAY_NAMES[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Status
                </label>
                <Select
                  value={selectedUser.status}
                  onValueChange={(v) =>
                    setSelectedUser({
                      ...selectedUser,
                      status: v as UserStatus,
                    })
                  }
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
              className="border-slate-700 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateUser.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950"
            >
              {updateUser.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Edit className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-rose-400">Delete User</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete {selectedUser?.full_name}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              className="border-slate-700 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteUser.isPending}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              {deleteUser.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete User
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
  color: 'blue' | 'emerald' | 'amber' | 'violet';
}) {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/20 text-amber-400',
    violet: 'bg-violet-500/20 text-violet-400',
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
