'use client';

import React, { useState, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  Shield,
  User,
  AlertTriangle,
} from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useSuspendUserMutation,
  useVerifyUserEmailMutation,
  useExportUsersMutation,
  useImportUsersMutation,
  useBulkDeleteUsersMutation,
  useBulkUpdateUserStatusMutation,
  useBulkAssignRolesMutation,
  useGetRolesQuery,
  useGetUserStatsQuery,
} from '@/lib/redux/api/user-management-api';
import { User as UserType, UsersQueryParams } from '@/types/user-management';
import { useRBAC } from '@/hooks/use-rbac';
import { useToast } from '@/hooks/use-toast';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DataTable } from '@/components/ui/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import UserDetailsModal from '@/components/admin/user-management/UserDetailsModal';
import { UserImportDialog } from '@/components/admin/user-management/UserImportDialog';
import { BulkOperationsPanel } from '@/components/admin/user-management/BulkOperationsPanel';
import { UserFiltersPanel } from '@/components/admin/user-management/UserFiltersPanel';
import { UserAnalyticsWidget } from '@/components/admin/user-management/UserAnalyticsWidget';
import { SecurityEventsWidget } from '@/components/admin/user-management/SecurityEventsWidget';

interface UserManagementPageProps {}

const UserManagementPage: React.FC<UserManagementPageProps> = () => {
  const { hasPermission, canManageUsers } = useRBAC();
  const { toast } = useToast();

  // State management
  const [queryParams, setQueryParams] = useState<UsersQueryParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserDetails, setShowUserDetails] = useState<string | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkPanel, setShowBulkPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // API queries
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useGetUsersQuery(queryParams);

  const { data: userStats } = useGetUserStatsQuery();
  const { data: roles } = useGetRolesQuery();

  // API mutations
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [activateUser] = useActivateUserMutation();
  const [deactivateUser] = useDeactivateUserMutation();
  const [suspendUser] = useSuspendUserMutation();
  const [verifyUserEmail] = useVerifyUserEmailMutation();
  const [exportUsers] = useExportUsersMutation();
  const [importUsers] = useImportUsersMutation();
  const [bulkDeleteUsers] = useBulkDeleteUsersMutation();
  const [bulkUpdateUserStatus] = useBulkUpdateUserStatusMutation();
  const [bulkAssignRoles] = useBulkAssignRolesMutation();

  // Permission check
  if (!canManageUsers) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access user management.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setQueryParams(prev => ({
      ...prev,
      search: value || undefined,
      page: 1,
    }));
  }, []);

  const handleFilterChange = useCallback(
    (filters: Partial<UsersQueryParams>) => {
      setQueryParams(prev => ({
        ...prev,
        ...filters,
        page: 1,
      }));
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    setQueryParams(prev => ({ ...prev, page: page + 1 }));
  }, []);

  const handleUserAction = async (
    userId: string,
    action: string,
    data?: any
  ) => {
    try {
      switch (action) {
        case 'activate':
          await activateUser(userId).unwrap();
          toast({ title: 'User activated successfully' });
          break;
        case 'deactivate':
          await deactivateUser(userId).unwrap();
          toast({ title: 'User deactivated successfully' });
          break;
        case 'suspend':
          await suspendUser({ id: userId, ...data }).unwrap();
          toast({ title: 'User suspended successfully' });
          break;
        case 'verify':
          await verifyUserEmail(userId).unwrap();
          toast({ title: 'Email verified successfully' });
          break;
        case 'delete':
          await deleteUser(userId).unwrap();
          toast({ title: 'User deleted successfully' });
          break;
        default:
          break;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Operation failed',
        variant: 'destructive',
      });
    }
  };

  const handleBulkAction = async (action: string, data?: any) => {
    if (selectedUsers.length === 0) {
      toast({
        title: 'No users selected',
        description: 'Please select users to perform bulk operations',
        variant: 'destructive',
      });
      return;
    }

    try {
      switch (action) {
        case 'delete':
          await bulkDeleteUsers({ userIds: selectedUsers }).unwrap();
          toast({ title: 'Bulk delete operation started' });
          break;
        case 'updateStatus':
          await bulkUpdateUserStatus({
            userIds: selectedUsers,
            status: data.status,
          }).unwrap();
          toast({ title: 'Bulk status update operation started' });
          break;
        case 'assignRoles':
          await bulkAssignRoles({
            userIds: selectedUsers,
            roleIds: data.roleIds,
          }).unwrap();
          toast({ title: 'Bulk role assignment operation started' });
          break;
        default:
          break;
      }
      setSelectedUsers([]);
      setShowBulkPanel(false);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Bulk operation failed',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async () => {
    try {
      const result = await exportUsers(queryParams).unwrap();
      // Handle download
      window.open(result.downloadUrl, '_blank');
      toast({ title: 'Export started successfully' });
    } catch (error) {
      toast({
        title: 'Export failed',
        description:
          error instanceof Error ? error.message : 'Failed to export users',
        variant: 'destructive',
      });
    }
  };

  const getUserStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, text: 'Active' },
      pending: { variant: 'secondary' as const, text: 'Pending' },
      inactive: { variant: 'outline' as const, text: 'Inactive' },
      suspended: { variant: 'destructive' as const, text: 'Suspended' },
      banned: { variant: 'destructive' as const, text: 'Banned' },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getUserTypeBadge = (userType: string) => {
    const typeConfig = {
      student: { icon: User, color: 'text-blue-600' },
      teacher: { icon: User, color: 'text-green-600' },
      admin: { icon: Shield, color: 'text-red-600' },
    };

    const config =
      typeConfig[userType as keyof typeof typeConfig] || typeConfig.student;
    const IconComponent = config.icon;

    return (
      <div className={`flex items-center gap-1 ${config.color}`}>
        <IconComponent className="h-3 w-3" />
        <span className="capitalize">{userType}</span>
      </div>
    );
  };

  // Define columns using TanStack Table ColumnDef
  const columns: ColumnDef<UserType>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'user',
      header: 'User',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatarUrl} alt={user.displayName} />
              <AvatarFallback>
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.displayName}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'userType',
      header: 'Type',
      cell: ({ row }) => getUserTypeBadge(row.original.userType),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getUserStatusBadge(row.original.status),
    },
    {
      accessorKey: 'emailVerified',
      header: 'Email',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.emailVerified ? (
            <Badge variant="outline" className="text-green-600">
              Verified
            </Badge>
          ) : (
            <Badge variant="outline" className="text-orange-600">
              Unverified
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'lastLoginAt',
      header: 'Last Login',
      cell: ({ row }) => {
        const lastLogin = row.original.lastLoginAt;
        return (
          <div className="text-sm">
            {lastLogin ? new Date(lastLogin).toLocaleDateString() : 'Never'}
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setShowUserDetails(user.id)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              {hasPermission('user.edit') && (
                <>
                  {user.status === 'active' ? (
                    <DropdownMenuItem
                      onClick={() => handleUserAction(user.id, 'deactivate')}
                    >
                      Deactivate
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => handleUserAction(user.id, 'activate')}
                    >
                      Activate
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onClick={() => handleUserAction(user.id, 'suspend')}
                  >
                    Suspend
                  </DropdownMenuItem>

                  {!user.emailVerified && (
                    <DropdownMenuItem
                      onClick={() => handleUserAction(user.id, 'verify')}
                    >
                      Verify Email
                    </DropdownMenuItem>
                  )}
                </>
              )}

              {hasPermission('user.delete') && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleUserAction(user.id, 'delete')}
                    className="text-red-600"
                  >
                    Delete User
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleImport = async (formData: FormData) => {
    try {
      const result = await importUsers(formData).unwrap();
      return result;
    } catch (err) {
      return {
        imported: 0,
        failed: 0,
        errors: ['Import failed unexpectedly.'],
      };
    }
  };

  if (usersLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="mt-1 h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
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
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions across your platform
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('user.export') && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}

          {hasPermission('user.import') && (
            <Button variant="outline" onClick={() => setShowImportDialog(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          )}

          {selectedUsers.length > 0 && (
            <Button onClick={() => setShowBulkPanel(true)}>
              Bulk Actions ({selectedUsers.length})
            </Button>
          )}
        </div>
      </div>

      {/* Analytics Overview */}
      {userStats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userStats.totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +{userStats.userGrowth.monthly}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <User className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userStats.activeUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(
                  (userStats.activeUsers / userStats.totalUsers) * 100
                )}
                % of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Users</CardTitle>
              <Plus className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userStats.newUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +{userStats.userGrowth.weekly}% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Security Events
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userStats.securityMetrics.suspiciousActivities}
              </div>
              <p className="text-xs text-muted-foreground">
                {userStats.securityMetrics.failedLoginAttempts} failed logins
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={e => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {showFilters && (
            <UserFiltersPanel
              onFilterChange={handleFilterChange}
              currentFilters={queryParams}
              roles={roles || []}
            />
          )}

          <DataTable
            columns={columns}
            data={usersData?.users || []}
            onRowSelectionChange={setSelectedUsers}
            pagination={{
              pageIndex: queryParams.page! - 1,
              pageSize: queryParams.limit!,
              pageCount: usersData?.totalPages || 0,
              onPageChange: handlePageChange,
            }}
            loading={usersLoading}
          />
        </CardContent>
      </Card>

      {/* Additional Analytics Widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UserAnalyticsWidget />
        <SecurityEventsWidget />
      </div>

      {/* Modals and Dialogs */}
      {showUserDetails && (
        <UserDetailsModal
          userId={showUserDetails}
          onClose={() => setShowUserDetails(null)}
        />
      )}

      {showImportDialog && (
        <UserImportDialog
          onClose={() => setShowImportDialog(false)}
          onImport={handleImport}
        />
      )}

      {showBulkPanel && (
        <BulkOperationsPanel
          selectedUsers={selectedUsers}
          onClose={() => setShowBulkPanel(false)}
          onExecute={handleBulkAction}
          roles={roles || []}
        />
      )}
    </div>
  );
};

export default UserManagementPage;
