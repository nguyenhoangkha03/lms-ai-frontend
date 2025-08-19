'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Download,
  MoreHorizontal,
  Shield,
  User,
  AlertTriangle,
  Edit,
  Trash2,
  UserPlus,
  RefreshCw,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Users,
  Activity,
  Upload,
  Settings,
  Lock,
  Unlock,
  Globe,
  Camera,
  FileText,
  Star,
  Plus,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Wifi,
  WifiOff,
  Calendar,
  MapPin,
  Phone,
  Link,
  Copy,
} from 'lucide-react';
import {
  useGetUsersQuery,
  useGetUserStatsQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useCreateAdminUserMutation,
  useResetUserPasswordMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useSuspendUserMutation,
  useVerifyUserEmailMutation,
  useAssignUserRolesMutation,
  useRemoveUserRolesMutation,
  useGetUserPermissionsQuery,
  useUploadUserAvatarMutation,
  useUploadUserCoverMutation,
  useBulkUpdateUserStatusMutation,
  useBulkDeleteUsersMutation,
  useExportUsersQuery,
} from '@/lib/redux/api/admin-api';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { format, isValid, parseISO } from 'date-fns';

interface UserQueryState {
  userType?: string;
  status?: string;
  search?: string;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [queryState, setQueryState] = useState<UserQueryState>({
    page: 1,
    limit: 20,
  });

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<
    'activate' | 'suspend' | 'delete'
  >('activate');

  // Form state
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    username: '',
    phone: '',
    userType: 'student',
    status: 'active',
    preferredLanguage: 'en',
    timezone: 'UTC',
    avatarUrl: '',
    coverUrl: '',
    metadata: '',
  });

  const [createFormData, setCreateFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    displayName: '',
    phone: '',
    avatarUrl: '',
    coverUrl: '',
    avatarFile: undefined as File | undefined,
    coverFile: undefined as File | undefined,
    userType: 'student' as 'student' | 'teacher' | 'admin',
    status: 'active' as 'pending' | 'active' | 'inactive' | 'suspended',
    preferredLanguage: 'en',
    timezone: 'UTC',
    metadata: '',
    sendWelcomeEmail: true,
    generatePassword: true,
    temporaryPassword: '',
  });

  const { data: usersData, isLoading, refetch } = useGetUsersQuery(queryState);
  const { data: statsData } = useGetUserStatsQuery();
  const { data: selectedUserData } = useGetUserByIdQuery(selectedUserId || '', {
    skip: !selectedUserId,
  });

  // Mutations
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [createAdminUser] = useCreateAdminUserMutation();
  const [resetUserPassword] = useResetUserPasswordMutation();
  const [activateUser] = useActivateUserMutation();
  const [deactivateUser] = useDeactivateUserMutation();
  const [suspendUser] = useSuspendUserMutation();
  const [verifyUserEmail] = useVerifyUserEmailMutation();
  const [uploadUserAvatar] = useUploadUserAvatarMutation();
  const [uploadUserCover] = useUploadUserCoverMutation();
  const [bulkUpdateStatus] = useBulkUpdateUserStatusMutation();
  const [bulkDeleteUsers] = useBulkDeleteUsersMutation();

  const users = usersData?.users || [];
  const stats = statsData?.stats;

  // Handlers
  const handleUserAction = async (
    userId: string,
    action: string,
    data?: any
  ) => {
    try {
      switch (action) {
        case 'update':
          await updateUser({ userId, userData: data }).unwrap();
          toast.success('User updated successfully');
          break;
        case 'activate':
          await activateUser(userId).unwrap();
          toast.success('User activated successfully');
          break;
        case 'deactivate':
          await deactivateUser(userId).unwrap();
          toast.success('User deactivated successfully');
          break;
        case 'suspend':
          await suspendUser({ userId, reason: data?.reason }).unwrap();
          toast.success('User suspended successfully');
          break;
        case 'delete':
          await deleteUser(userId).unwrap();
          toast.success('User deleted successfully');
          break;
        case 'resetPassword':
          await resetUserPassword({ userId, sendEmail: true }).unwrap();
          toast.success('Password reset email sent');
          break;
        case 'verifyEmail':
          await verifyUserEmail(userId).unwrap();
          toast.success('Email verified successfully');
          break;
        default:
          break;
      }
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Operation failed');
    }
  };

  const handleAvatarUpload = async (userId: string, file: File) => {
    try {
      const result = await uploadUserAvatar({ userId, file }).unwrap();
      toast.success('Avatar uploaded successfully!');
      setEditFormData(prev => ({ ...prev, avatarUrl: result.avatarUrl }));
      refetch();
      return result;
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to upload avatar');
      throw error;
    }
  };

  const handleCoverUpload = async (userId: string, file: File) => {
    try {
      const result = await uploadUserCover({ userId, file }).unwrap();
      toast.success('Cover uploaded successfully!');
      setEditFormData(prev => ({ ...prev, coverUrl: result.coverUrl }));
      refetch();
      return result;
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to upload cover');
      throw error;
    }
  };

  const handleBulkAction = async () => {
    if (selectedUsers.length === 0) {
      toast.error('No users selected');
      return;
    }

    try {
      switch (bulkAction) {
        case 'activate':
          await bulkUpdateStatus({
            userIds: selectedUsers,
            status: 'active',
          }).unwrap();
          toast.success(`${selectedUsers.length} users activated`);
          break;
        case 'suspend':
          await bulkUpdateStatus({
            userIds: selectedUsers,
            status: 'suspended',
          }).unwrap();
          toast.success(`${selectedUsers.length} users suspended`);
          break;
        case 'delete':
          await bulkDeleteUsers({ userIds: selectedUsers }).unwrap();
          toast.success(`${selectedUsers.length} users deleted`);
          break;
      }
      setSelectedUsers([]);
      setShowBulkDialog(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Bulk operation failed');
    }
  };

  const handleExport = async () => {
    try {
      // Create a temporary link to trigger the export
      const params = new URLSearchParams(queryState as any).toString();
      const exportUrl = `/api/v1/admin/users/export?${params}`;
      const a = document.createElement('a');
      a.href = exportUrl;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Users export started');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleEditUser = (userData: any) => {
    setSelectedUserId(userData.id);
    setEditFormData({
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      displayName: userData.displayName || '',
      email: userData.email || '',
      username: userData.username || '',
      phone: userData.phone || '',
      avatarUrl: userData.avatarUrl || '',
      coverUrl: userData.coverUrl || '',
      userType: userData.userType || 'student',
      status: userData.status || 'active',
      preferredLanguage: userData.preferredLanguage || 'en',
      timezone: userData.timezone || 'UTC',
      metadata: userData.metadata || '',
    });
    setShowEditDialog(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUserId) return;

    try {
      await updateUser({
        userId: selectedUserId,
        userData: editFormData,
      }).unwrap();
      toast.success('User updated successfully');
      setShowEditDialog(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Update failed');
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleCreateUser = async () => {
    try {
      // Remove file objects from the payload
      const { avatarFile, coverFile, ...userPayload } = createFormData;

      const payload = {
        ...userPayload,
        ...(createFormData.generatePassword
          ? {}
          : { temporaryPassword: createFormData.temporaryPassword }),
      };

      let createdUser;
      if (createFormData.userType === 'admin') {
        const result = await createAdminUser(payload).unwrap();
        createdUser = result.user;
      } else {
        // For non-admin users, we would need a separate endpoint
        // For now, let's use createAdminUser as a fallback
        const result = await createAdminUser(payload).unwrap();
        createdUser = result.user;
      }

      // Upload avatar if provided
      if (avatarFile && createdUser?.id) {
        try {
          await handleAvatarUpload(createdUser.id, avatarFile);
        } catch (error) {
          console.error('Avatar upload failed:', error);
          toast.error('User created but avatar upload failed');
        }
      }

      // Upload cover if provided
      if (coverFile && createdUser?.id) {
        try {
          await handleCoverUpload(createdUser.id, coverFile);
        } catch (error) {
          console.error('Cover upload failed:', error);
          toast.error('User created but cover upload failed');
        }
      }

      toast.success('User created successfully');
      setShowCreateDialog(false);

      // Cleanup object URLs to prevent memory leaks
      if (
        createFormData.avatarUrl &&
        createFormData.avatarUrl.startsWith('blob:')
      ) {
        URL.revokeObjectURL(createFormData.avatarUrl);
      }
      if (
        createFormData.coverUrl &&
        createFormData.coverUrl.startsWith('blob:')
      ) {
        URL.revokeObjectURL(createFormData.coverUrl);
      }

      setCreateFormData({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        displayName: '',
        phone: '',
        avatarUrl: '',
        coverUrl: '',
        avatarFile: undefined,
        coverFile: undefined,
        userType: 'student',
        status: 'active',
        preferredLanguage: 'en',
        timezone: 'UTC',
        metadata: '',
        sendWelcomeEmail: true,
        generatePassword: true,
        temporaryPassword: '',
      });
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create user');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'suspended':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return CheckCircle;
      case 'inactive':
        return XCircle;
      case 'suspended':
        return Ban;
      default:
        return Clock;
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'admin':
        return Shield;
      case 'teacher':
        return User;
      case 'student':
        return User;
      default:
        return User;
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'admin':
        return 'text-red-600';
      case 'teacher':
        return 'text-green-600';
      case 'student':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';

    try {
      // Try to parse as ISO string first
      let date = parseISO(dateString);

      // If that fails, try regular Date constructor
      if (!isValid(date)) {
        date = new Date(dateString);
      }

      // Check if the final date is valid
      if (!isValid(date)) {
        return 'Invalid Date';
      }

      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  };

  if (!user || user.userType !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don't have permission to access user management.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions across your platform
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedUsers.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowBulkDialog(true)}
                className="text-orange-600"
              >
                <Settings className="mr-2 h-4 w-4" />
                Bulk Actions ({selectedUsers.length})
              </Button>
              <Separator orientation="vertical" className="h-6" />
            </>
          )}
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw
              className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')}
            />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold">{stats.total.all}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Users
                  </p>
                  <p className="text-2xl font-bold">{stats.active.all}</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Teachers
                  </p>
                  <p className="text-2xl font-bold">{stats.total.teachers}</p>
                </div>
                <User className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    New This Month
                  </p>
                  <p className="text-2xl font-bold">{stats.newThisMonth}</p>
                </div>
                <UserPlus className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center space-x-4">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={queryState.search || ''}
                  onChange={e =>
                    setQueryState(prev => ({
                      ...prev,
                      search: e.target.value,
                      page: 1,
                    }))
                  }
                  className="pl-10"
                />
              </div>

              <Select
                value={queryState.userType || 'all'}
                onValueChange={value =>
                  setQueryState(prev => ({
                    ...prev,
                    userType: value === 'all' ? undefined : value,
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="User Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="teacher">Teachers</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={queryState.status || 'all'}
                onValueChange={value =>
                  setQueryState(prev => ({
                    ...prev,
                    status: value === 'all' ? undefined : value,
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedUsers.length === users.length &&
                        users.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email Verified</TableHead>
                  <TableHead>2FA</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-40 animate-pulse rounded bg-gray-200"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-8 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No users found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map(user => {
                    const StatusIcon = getStatusIcon(user.status);
                    const UserTypeIcon = getUserTypeIcon(user.userType);
                    const isSelected = selectedUsers.includes(user.id);
                    return (
                      <TableRow
                        key={user.id}
                        className={cn(
                          isSelected && 'bg-muted/50',
                          'cursor-pointer hover:bg-muted/30'
                        )}
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={checked =>
                              handleSelectUser(user.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatarUrl} />
                              <AvatarFallback>
                                {user.firstName?.charAt(0) ||
                                  user.username?.charAt(0) ||
                                  'U'}
                                {user.lastName?.charAt(0) || ''}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {user.displayName ||
                                  user.fullName ||
                                  `${user.firstName} ${user.lastName}`.trim() ||
                                  user.username}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {user.email}
                              </p>
                              {user.phone && (
                                <p className="flex items-center text-xs text-muted-foreground">
                                  <Phone className="mr-1 h-3 w-3" />
                                  {user.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className={cn(
                              'flex items-center space-x-1',
                              getUserTypeColor(user.userType)
                            )}
                          >
                            <UserTypeIcon className="h-4 w-4" />
                            <span className="capitalize">{user.userType}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              'text-xs',
                              getStatusColor(user.status)
                            )}
                          >
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.emailVerified ? (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-orange-600"
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Unverified
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.twoFactorEnabled ? (
                            <Badge variant="outline" className="text-green-600">
                              <Lock className="mr-1 h-3 w-3" />
                              Enabled
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-600">
                              <Unlock className="mr-1 h-3 w-3" />
                              Disabled
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(user.lastLoginAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(user.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>
                                User Actions
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => router.push(`/admin/users/${user.id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />

                              {/* Email Actions */}
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUserAction(user.id, 'resetPassword')
                                }
                              >
                                <Mail className="mr-2 h-4 w-4" />
                                Reset Password
                              </DropdownMenuItem>
                              {!user.emailVerified && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUserAction(user.id, 'verifyEmail')
                                  }
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Verify Email
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />

                              {/* Status Actions */}
                              {user.status === 'active' ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUserAction(user.id, 'deactivate')
                                    }
                                  >
                                    <UserX className="mr-2 h-4 w-4" />
                                    Deactivate User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUserAction(user.id, 'suspend', {
                                        reason: 'Administrative action',
                                      })
                                    }
                                  >
                                    <Ban className="mr-2 h-4 w-4" />
                                    Suspend User
                                  </DropdownMenuItem>
                                </>
                              ) : user.status === 'suspended' ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUserAction(user.id, 'activate')
                                  }
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activate User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUserAction(user.id, 'activate')
                                  }
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activate User
                                </DropdownMenuItem>
                              )}

                              {/* Lock Status */}
                              {user.isLocked ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUserAction(user.id, 'update', {
                                      lockedUntil: null,
                                    })
                                  }
                                >
                                  <Unlock className="mr-2 h-4 w-4" />
                                  Unlock Account
                                </DropdownMenuItem>
                              ) : null}

                              <DropdownMenuSeparator />

                              {/* Advanced Actions */}
                              <DropdownMenuItem
                                onClick={() => {
                                  navigator.clipboard.writeText(user.id);
                                  toast.success('User ID copied to clipboard');
                                }}
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Copy User ID
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Are you sure you want to delete ${user.fullName || user.email}?`
                                    )
                                  ) {
                                    handleUserAction(user.id, 'delete');
                                  }
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {usersData && usersData.totalPages > 1 && (
            <div className="flex items-center justify-between py-4">
              <div className="text-sm text-muted-foreground">
                Showing {(queryState.page - 1) * queryState.limit + 1} to{' '}
                {Math.min(queryState.page * queryState.limit, usersData.total)}{' '}
                of {usersData.total} users
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={queryState.page <= 1}
                  onClick={() =>
                    setQueryState(prev => ({ ...prev, page: prev.page - 1 }))
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={queryState.page >= usersData.totalPages}
                  onClick={() =>
                    setQueryState(prev => ({ ...prev, page: prev.page + 1 }))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog
        open={showCreateDialog}
        onOpenChange={open => {
          if (!open) {
            // Cleanup object URLs when closing dialog
            if (
              createFormData.avatarUrl &&
              createFormData.avatarUrl.startsWith('blob:')
            ) {
              URL.revokeObjectURL(createFormData.avatarUrl);
            }
            if (
              createFormData.coverUrl &&
              createFormData.coverUrl.startsWith('blob:')
            ) {
              URL.revokeObjectURL(createFormData.coverUrl);
            }
          }
          setShowCreateDialog(open);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system with complete profile information
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-firstName">First Name *</Label>
                  <Input
                    id="create-firstName"
                    value={createFormData.firstName}
                    onChange={e =>
                      setCreateFormData(prev => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="create-lastName">Last Name *</Label>
                  <Input
                    id="create-lastName"
                    value={createFormData.lastName}
                    onChange={e =>
                      setCreateFormData(prev => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="create-displayName">Display Name</Label>
                <Input
                  id="create-displayName"
                  value={createFormData.displayName}
                  onChange={e =>
                    setCreateFormData(prev => ({
                      ...prev,
                      displayName: e.target.value,
                    }))
                  }
                  placeholder="Public display name (optional)"
                />
              </div>

              <div>
                <Label htmlFor="create-phone">Phone Number</Label>
                <Input
                  id="create-phone"
                  value={createFormData.phone}
                  onChange={e =>
                    setCreateFormData(prev => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Avatar & Cover Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={createFormData.avatarUrl} />
                    <AvatarFallback>
                      {createFormData.firstName?.[0]}
                      {createFormData.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Avatar</Label>
                    <div className="mt-1 flex space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Check file size (limit to 5MB for better performance)
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error(
                                'Avatar file size must be less than 5MB'
                              );
                              return;
                            }

                            // Store the file and create preview URL
                            const previewUrl = URL.createObjectURL(file);
                            setCreateFormData(prev => ({
                              ...prev,
                              avatarUrl: previewUrl,
                              avatarFile: file,
                            }));
                          }
                        }}
                        className="hidden"
                        id="create-avatar-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document
                            .getElementById('create-avatar-upload')
                            ?.click()
                        }
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Upload Avatar
                      </Button>
                      {createFormData.avatarUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Cleanup object URL to prevent memory leak
                            if (
                              createFormData.avatarUrl &&
                              createFormData.avatarUrl.startsWith('blob:')
                            ) {
                              URL.revokeObjectURL(createFormData.avatarUrl);
                            }
                            setCreateFormData(prev => ({
                              ...prev,
                              avatarUrl: '',
                              avatarFile: undefined,
                            }));
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="mt-1">
                      <Label
                        htmlFor="create-avatarUrl"
                        className="text-xs text-muted-foreground"
                      >
                        Or enter URL:
                      </Label>
                      <Input
                        id="create-avatarUrl"
                        value={createFormData.avatarUrl}
                        onChange={e =>
                          setCreateFormData(prev => ({
                            ...prev,
                            avatarUrl: e.target.value,
                            avatarFile: undefined,
                          }))
                        }
                        placeholder="https://example.com/avatar.jpg"
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex h-20 w-32 items-center justify-center overflow-hidden rounded-md bg-gray-100">
                    {createFormData.coverUrl ? (
                      <img
                        src={createFormData.coverUrl}
                        alt="Cover preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Camera className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Cover Image</Label>
                    <div className="mt-1 flex space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Check file size (limit to 5MB for better performance)
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error(
                                'Cover file size must be less than 5MB'
                              );
                              return;
                            }

                            // Store the file and create preview URL
                            const previewUrl = URL.createObjectURL(file);
                            setCreateFormData(prev => ({
                              ...prev,
                              coverUrl: previewUrl,
                              coverFile: file,
                            }));
                          }
                        }}
                        className="hidden"
                        id="create-cover-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document
                            .getElementById('create-cover-upload')
                            ?.click()
                        }
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Cover
                      </Button>
                      {createFormData.coverUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Cleanup object URL to prevent memory leak
                            if (
                              createFormData.coverUrl &&
                              createFormData.coverUrl.startsWith('blob:')
                            ) {
                              URL.revokeObjectURL(createFormData.coverUrl);
                            }
                            setCreateFormData(prev => ({
                              ...prev,
                              coverUrl: '',
                              coverFile: undefined,
                            }));
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="mt-1">
                      <Label
                        htmlFor="create-coverUrl"
                        className="text-xs text-muted-foreground"
                      >
                        Or enter URL:
                      </Label>
                      <Input
                        id="create-coverUrl"
                        value={createFormData.coverUrl}
                        onChange={e =>
                          setCreateFormData(prev => ({
                            ...prev,
                            coverUrl: e.target.value,
                            coverFile: undefined,
                          }))
                        }
                        placeholder="https://example.com/cover.jpg"
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="account" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-email">Email Address *</Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={createFormData.email}
                    onChange={e =>
                      setCreateFormData(prev => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="create-username">Username *</Label>
                  <Input
                    id="create-username"
                    value={createFormData.username}
                    onChange={e =>
                      setCreateFormData(prev => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    placeholder="unique_username"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>User Type</Label>
                  <Select
                    value={createFormData.userType}
                    onValueChange={(value: 'student' | 'teacher' | 'admin') =>
                      setCreateFormData(prev => ({ ...prev, userType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Student
                        </div>
                      </SelectItem>
                      <SelectItem value="teacher">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Teacher
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center">
                          <Shield className="mr-2 h-4 w-4" />
                          Administrator
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Initial Status</Label>
                  <Select
                    value={createFormData.status}
                    onValueChange={(
                      value: 'pending' | 'active' | 'inactive' | 'suspended'
                    ) =>
                      setCreateFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Password Settings</h4>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="generatePassword"
                    checked={createFormData.generatePassword}
                    onCheckedChange={checked =>
                      setCreateFormData(prev => ({
                        ...prev,
                        generatePassword: checked,
                      }))
                    }
                  />
                  <Label htmlFor="generatePassword">
                    Generate temporary password automatically
                  </Label>
                </div>

                {!createFormData.generatePassword && (
                  <div>
                    <Label htmlFor="create-password">Temporary Password</Label>
                    <Input
                      id="create-password"
                      type="password"
                      value={createFormData.temporaryPassword}
                      onChange={e =>
                        setCreateFormData(prev => ({
                          ...prev,
                          temporaryPassword: e.target.value,
                        }))
                      }
                      placeholder="Enter temporary password"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="sendWelcomeEmail"
                    checked={createFormData.sendWelcomeEmail}
                    onCheckedChange={checked =>
                      setCreateFormData(prev => ({
                        ...prev,
                        sendWelcomeEmail: checked,
                      }))
                    }
                  />
                  <Label htmlFor="sendWelcomeEmail">
                    Send welcome email with login instructions
                  </Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Preferred Language</Label>
                  <Select
                    value={createFormData.preferredLanguage}
                    onValueChange={value =>
                      setCreateFormData(prev => ({
                        ...prev,
                        preferredLanguage: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Timezone</Label>
                  <Select
                    value={createFormData.timezone}
                    onValueChange={value =>
                      setCreateFormData(prev => ({ ...prev, timezone: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="Asia/Ho_Chi_Minh">
                        Ho Chi Minh City (+7)
                      </SelectItem>
                      <SelectItem value="America/New_York">
                        New York (-5/-4)
                      </SelectItem>
                      <SelectItem value="Europe/London">
                        London (+0/+1)
                      </SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (+9)</SelectItem>
                      <SelectItem value="Australia/Sydney">
                        Sydney (+10/+11)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="create-metadata">
                  Additional Metadata (JSON)
                </Label>
                <textarea
                  id="create-metadata"
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={createFormData.metadata}
                  onChange={e =>
                    setCreateFormData(prev => ({
                      ...prev,
                      metadata: e.target.value,
                    }))
                  }
                  placeholder='{"department": "Engineering", "level": "junior"}'
                  rows={3}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Optional JSON data for additional user information
                </p>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-800">
                      User Creation Notes
                    </p>
                    <ul className="space-y-1 text-xs text-blue-700">
                      <li>
                        • User will receive email verification link
                        automatically
                      </li>
                      <li>
                        •{' '}
                        {createFormData.userType === 'admin'
                          ? 'Admin users require manual activation'
                          : 'Regular users can activate immediately'}
                      </li>
                      <li>• Profile can be completed after first login</li>
                      <li>
                        • 2FA can be enabled by user after email verification
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                // Cleanup object URLs when canceling
                if (
                  createFormData.avatarUrl &&
                  createFormData.avatarUrl.startsWith('blob:')
                ) {
                  URL.revokeObjectURL(createFormData.avatarUrl);
                }
                if (
                  createFormData.coverUrl &&
                  createFormData.coverUrl.startsWith('blob:')
                ) {
                  URL.revokeObjectURL(createFormData.coverUrl);
                }
                setShowCreateDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={
                !createFormData.email ||
                !createFormData.username ||
                !createFormData.firstName ||
                !createFormData.lastName
              }
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              Apply actions to {selectedUsers.length} selected user
              {selectedUsers.length !== 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Action</Label>
              <Select
                value={bulkAction}
                onValueChange={(value: 'activate' | 'suspend' | 'delete') =>
                  setBulkAction(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">
                    <div className="flex items-center">
                      <UserCheck className="mr-2 h-4 w-4" />
                      Activate Users
                    </div>
                  </SelectItem>
                  <SelectItem value="suspend">
                    <div className="flex items-center">
                      <Ban className="mr-2 h-4 w-4" />
                      Suspend Users
                    </div>
                  </SelectItem>
                  <SelectItem value="delete">
                    <div className="flex items-center text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Users
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {bulkAction === 'delete' && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
                <p className="text-sm font-medium text-destructive">
                  Warning: This action cannot be undone
                </p>
                <p className="text-sm text-destructive/80">
                  {selectedUsers.length} user
                  {selectedUsers.length !== 1 ? 's' : ''} will be permanently
                  deleted.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkAction}
              variant={bulkAction === 'delete' ? 'destructive' : 'default'}
            >
              Apply to {selectedUsers.length} User
              {selectedUsers.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and settings
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-firstName">First Name</Label>
                  <Input
                    id="edit-firstName"
                    value={editFormData.firstName}
                    onChange={e =>
                      setEditFormData(prev => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-lastName">Last Name</Label>
                  <Input
                    id="edit-lastName"
                    value={editFormData.lastName}
                    onChange={e =>
                      setEditFormData(prev => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-displayName">Display Name</Label>
                <Input
                  id="edit-displayName"
                  value={editFormData.displayName}
                  onChange={e =>
                    setEditFormData(prev => ({
                      ...prev,
                      displayName: e.target.value,
                    }))
                  }
                  placeholder="Public display name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-email">Email Address</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editFormData.email}
                    onChange={e =>
                      setEditFormData(prev => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    disabled // Email usually shouldn't be changed
                    className="bg-muted"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Email cannot be changed directly
                  </p>
                </div>
                <div>
                  <Label htmlFor="edit-username">Username</Label>
                  <Input
                    id="edit-username"
                    value={editFormData.username}
                    onChange={e =>
                      setEditFormData(prev => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    placeholder="Unique username"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone}
                  onChange={e =>
                    setEditFormData(prev => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Avatar & Cover Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={editFormData.avatarUrl} />
                    <AvatarFallback>
                      {editFormData.firstName?.[0]}
                      {editFormData.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Avatar</Label>
                    <div className="mt-1 flex space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async e => {
                          const file = e.target.files?.[0];
                          if (file && selectedUserId) {
                            await handleAvatarUpload(selectedUserId, file);
                          }
                        }}
                        className="hidden"
                        id={`avatar-upload-${selectedUserId}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document
                            .getElementById(`avatar-upload-${selectedUserId}`)
                            ?.click()
                        }
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Upload Avatar
                      </Button>
                      {editFormData.avatarUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setEditFormData(prev => ({
                              ...prev,
                              avatarUrl: '',
                            }))
                          }
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex h-20 w-32 items-center justify-center overflow-hidden rounded-md bg-gray-100">
                    {editFormData.coverUrl ? (
                      <img
                        src={editFormData.coverUrl}
                        alt="Cover"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Camera className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Cover Image</Label>
                    <div className="mt-1 flex space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async e => {
                          const file = e.target.files?.[0];
                          if (file && selectedUserId) {
                            await handleCoverUpload(selectedUserId, file);
                          }
                        }}
                        className="hidden"
                        id={`cover-upload-${selectedUserId}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document
                            .getElementById(`cover-upload-${selectedUserId}`)
                            ?.click()
                        }
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Cover
                      </Button>
                      {editFormData.coverUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setEditFormData(prev => ({ ...prev, coverUrl: '' }))
                          }
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>User Type</Label>
                  <Select
                    value={editFormData.userType}
                    onValueChange={value =>
                      setEditFormData(prev => ({ ...prev, userType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Student
                        </div>
                      </SelectItem>
                      <SelectItem value="teacher">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Teacher
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center">
                          <Shield className="mr-2 h-4 w-4" />
                          Administrator
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={editFormData.status}
                    onValueChange={value =>
                      setEditFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Preferred Language</Label>
                  <Select
                    value={editFormData.preferredLanguage}
                    onValueChange={value =>
                      setEditFormData(prev => ({
                        ...prev,
                        preferredLanguage: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Timezone</Label>
                  <Select
                    value={editFormData.timezone}
                    onValueChange={value =>
                      setEditFormData(prev => ({ ...prev, timezone: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="Asia/Ho_Chi_Minh">
                        Ho Chi Minh City
                      </SelectItem>
                      <SelectItem value="America/New_York">New York</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-metadata">
                  Additional Metadata (JSON)
                </Label>
                <textarea
                  id="edit-metadata"
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editFormData.metadata}
                  onChange={e =>
                    setEditFormData(prev => ({
                      ...prev,
                      metadata: e.target.value,
                    }))
                  }
                  placeholder='{"department": "Engineering", "level": "junior"}'
                  rows={3}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Optional JSON data for additional user information
                </p>
              </div>
            </TabsContent>
            <TabsContent value="security" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Security settings require separate API calls and are managed
                through dedicated endpoints.
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    selectedUserId &&
                    handleUserAction(selectedUserId, 'resetPassword')
                  }
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Password Reset Email
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    selectedUserId &&
                    handleUserAction(selectedUserId, 'verifyEmail')
                  }
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Manually Verify Email
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete user information and activity
            </DialogDescription>
          </DialogHeader>
          {selectedUserData && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedUserData.user?.avatarUrl} />
                    <AvatarFallback className="text-lg">
                      {selectedUserData.user?.firstName?.charAt(0) || 'U'}
                      {selectedUserData.user?.lastName?.charAt(0) || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedUserData.user?.fullName ||
                        selectedUserData.user?.displayName ||
                        'No Name'}
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedUserData.user?.email}
                    </p>
                    <div className="mt-1 flex items-center space-x-2">
                      <Badge variant="outline">
                        {selectedUserData.user?.userType}
                      </Badge>
                      <Badge
                        className={getStatusColor(
                          selectedUserData.user?.status || ''
                        )}
                      >
                        {selectedUserData.user?.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Username</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedUserData.user?.username || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedUserData.user?.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedUserData.user?.createdAt)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Updated</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedUserData.user?.updatedAt)}
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="security" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Email Verification
                    </Label>
                    <div className="flex items-center space-x-2">
                      {selectedUserData.user?.emailVerified ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">
                        {selectedUserData.user?.emailVerified
                          ? 'Verified'
                          : 'Not Verified'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Two-Factor Authentication
                    </Label>
                    <div className="flex items-center space-x-2">
                      {selectedUserData.user?.twoFactorEnabled ? (
                        <Lock className="h-4 w-4 text-green-600" />
                      ) : (
                        <Unlock className="h-4 w-4 text-gray-600" />
                      )}
                      <span className="text-sm">
                        {selectedUserData.user?.twoFactorEnabled
                          ? 'Enabled'
                          : 'Disabled'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Failed Login Attempts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedUserData.user?.failedLoginAttempts || 0}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Account Status
                    </Label>
                    <div className="flex items-center space-x-2">
                      {selectedUserData.user?.isLocked ? (
                        <Lock className="h-4 w-4 text-red-600" />
                      ) : (
                        <Unlock className="h-4 w-4 text-green-600" />
                      )}
                      <span className="text-sm">
                        {selectedUserData.user?.isLocked
                          ? 'Locked'
                          : 'Unlocked'}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="activity" className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Last Login</Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedUserData.user?.lastLoginAt) ||
                        'Never'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Login IP</Label>
                    <p className="font-mono text-sm text-muted-foreground">
                      {selectedUserData.user?.lastLoginIp || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Password Changed
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedUserData.user?.passwordChangedAt) ||
                        'Never'}
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="preferences" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">
                      Preferred Language
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedUserData.user?.preferredLanguage || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Timezone</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedUserData.user?.timezone || 'UTC'}
                    </p>
                  </div>
                </div>
                {selectedUserData.user?.metadata && (
                  <div>
                    <Label className="text-sm font-medium">
                      Additional Metadata
                    </Label>
                    <div className="mt-1 rounded-md bg-muted p-3">
                      <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
                        {selectedUserData.user.metadata}
                      </pre>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetailsDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
