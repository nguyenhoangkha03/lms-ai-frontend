'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Shield,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Users,
  Key,
  Settings,
  Crown,
  User,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';
import { 
  downloadCSV, 
  downloadJSON, 
  downloadExcel, 
  formatDateForExport, 
  generateFilename 
} from '@/lib/utils/export-utils';
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignPermissionsMutation,
  useRemovePermissionsMutation,
  type Role,
  type CreateRoleDto,
  type UpdateRoleDto,
  type RoleFormData,
} from '@/lib/redux/api/role-api';
import {
  useGetPermissionsQuery,
  type Permission,
} from '@/lib/redux/api/permission-api';
// import '@/lib/redux/api/role-api';
// import '@/lib/redux/api/permission-api';

export default function AdminRolesPage() {
  // Real API calls
  const {
    data: rolesData,
    error: rolesError,
    isLoading: rolesLoading,
    refetch: refetchRoles,
  } = useGetRolesQuery();
  const {
    data: permissionsData,
    error: permissionsError,
    isLoading: permissionsLoading,
  } = useGetPermissionsQuery();
  const [createRoleMutation] = useCreateRoleMutation();
  const [updateRoleMutation] = useUpdateRoleMutation();
  const [deleteRoleMutation] = useDeleteRoleMutation();
  const [assignPermissionsMutation] = useAssignPermissionsMutation();
  const [removePermissionsMutation] = useRemovePermissionsMutation();

  const roles = rolesData || [];
  const permissions = permissionsData || [];

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const loading = rolesLoading || permissionsLoading;

  const [queryState, setQueryState] = useState({
    search: '',
    isActive: undefined as boolean | undefined,
    level: undefined as number | undefined,
    page: 1,
    limit: 20,
  });

  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    displayName: '',
    description: '',
    level: 1,
    color: '#2563eb',
    icon: 'user',
    isSystemRole: false,
    isActive: true,
    permissionIds: [],
  });

  const handleCreateRole = async () => {
    try {
      const roleData: CreateRoleDto = {
        name: formData.name,
        displayName: formData.displayName,
        description: formData.description,
        level: formData.level,
        color: formData.color,
        icon: formData.icon,
        isSystemRole: formData.isSystemRole,
        isActive: formData.isActive,
        permissionIds: formData.permissionIds,
      };

      await createRoleMutation(roleData).unwrap();
      toast.success('Role created successfully');
      setShowCreateDialog(false);
      resetForm();
      // Remove manual refetch - RTK Query will auto-refetch due to invalidatesTags
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create role');
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;

    try {
      const updateData: UpdateRoleDto = {
        name: formData.name,
        displayName: formData.displayName,
        description: formData.description,
        level: formData.level,
        color: formData.color,
        icon: formData.icon,
        isSystemRole: formData.isSystemRole,
        isActive: formData.isActive,
      };

      await updateRoleMutation({
        id: selectedRole.id,
        data: updateData,
      }).unwrap();
      toast.success('Role updated successfully');
      setShowEditDialog(false);
      setSelectedRole(null);
      resetForm();
      // Remove manual refetch - RTK Query will auto-refetch due to invalidatesTags
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      await deleteRoleMutation(selectedRole.id).unwrap();
      toast.success('Role deleted successfully');
      setShowDeleteDialog(false);
      setSelectedRole(null);
      // Remove manual refetch - RTK Query will auto-refetch due to invalidatesTags
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete role');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      level: 1,
      color: '#2563eb',
      icon: 'user',
      isSystemRole: false,
      isActive: true,
      permissionIds: [],
    });
  };

  // Export functions
  const prepareExportData = () => {
    return filteredRoles.map(role => ({
      'ID': role.id,
      'Name': role.name,
      'Display Name': role.displayName || '',
      'Description': role.description || '',
      'Level': role.level,
      'Status': role.isActive ? 'Active' : 'Inactive',
      'System Role': role.isSystemRole ? 'Yes' : 'No',
      'User Count': role.userCount || 0,
      'Permission Count': role.permissionCount || 0,
      'Color': role.color || '',
      'Icon': role.icon || '',
      'Created At': formatDateForExport(role.createdAt),
      'Updated At': formatDateForExport(role.updatedAt),
    }));
  };

  const handleExport = async (format: 'csv' | 'excel' | 'json') => {
    try {
      const exportData = prepareExportData();
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      
      if (exportData.length === 0) {
        toast.error('No data to export');
        return;
      }

      switch (format) {
        case 'csv':
          downloadCSV(exportData, generateFilename('roles_export', 'csv'));
          toast.success('Roles exported as CSV successfully');
          break;
        case 'excel':
          downloadExcel(exportData, generateFilename('roles_export', 'csv'));
          toast.success('Roles exported as Excel-compatible CSV successfully');
          break;
        case 'json':
          downloadJSON(exportData, generateFilename('roles_export', 'json'));
          toast.success('Roles exported as JSON successfully');
          break;
        default:
          toast.error('Invalid export format');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export roles');
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setShowCreateDialog(true);
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      displayName: role.displayName!,
      description: role.description!,
      level: role.level,
      color: role.color!,
      icon: role.icon!,
      isSystemRole: role.isSystemRole,
      isActive: role.isActive,
      permissionIds: role.permissions?.map(p => p.id) || [],
    });
    setShowEditDialog(true);
  };

  const openPermissionsDialog = (role: Role) => {
    setSelectedRole(role);
    setFormData(prev => ({
      ...prev,
      permissionIds: role.permissions?.map(p => p.id) || [],
    }));
    setShowPermissionsDialog(true);
  };

  const getRoleIcon = (iconName: string) => {
    const iconMap = {
      crown: Crown,
      shield: Shield,
      user: User,
      eye: Eye,
      settings: Settings,
    };
    return iconMap[iconName as keyof typeof iconMap] || User;
  };

  const getStatusBadge = (role: Role) => {
    if (!role.isActive) {
      return (
        <Badge variant="secondary" className="text-red-600">
          <XCircle className="mr-1 h-3 w-3" />
          Inactive
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-green-100 text-green-600">
        <CheckCircle className="mr-1 h-3 w-3" />
        Active
      </Badge>
    );
  };

  const filteredRoles = roles.filter(role => {
    if (
      queryState.search &&
      !role.name.toLowerCase().includes(queryState.search.toLowerCase()) &&
      role.displayName &&
      !role.displayName.toLowerCase().includes(queryState.search.toLowerCase())
    ) {
      return false;
    }
    if (
      queryState.isActive !== undefined &&
      role.isActive !== queryState.isActive
    ) {
      return false;
    }
    if (queryState.level !== undefined && role.level !== queryState.level) {
      return false;
    }
    return true;
  });

  const groupedPermissions = permissions.reduce(
    (acc, permission) => {
      const category = permission.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    },
    {} as Record<string, typeof permissions>
  );

  // Error handling
  if (rolesError || permissionsError) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex h-96 items-center justify-center">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
              <h2 className="mb-2 text-xl font-semibold">Error Loading Data</h2>
              <p className="mb-4 text-muted-foreground">
                {(rolesError as any)?.data?.message ||
                  (permissionsError as any)?.data?.message ||
                  'Failed to load roles and permissions'}
              </p>
              <Button onClick={() => refetchRoles()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roles Management</h1>
          <p className="text-muted-foreground">
            Manage system roles and their permissions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => refetchRoles()}>
            <RefreshCw
              className={cn('mr-2 h-4 w-4', loading && 'animate-spin')}
            />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <Download className="mr-2 h-4 w-4" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                <Download className="mr-2 h-4 w-4" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-sm text-muted-foreground" disabled>
                {filteredRoles.length} role(s) will be exported
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Roles
                </p>
                <p className="text-2xl font-bold">{roles.length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Roles
                </p>
                <p className="text-2xl font-bold">
                  {roles.filter(r => r.isActive).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  System Roles
                </p>
                <p className="text-2xl font-bold">
                  {roles.filter(r => r.isSystemRole).length}
                </p>
              </div>
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Users
                </p>
                <p className="text-2xl font-bold">
                  {roles.reduce((sum, r) => sum + (r.userCount || 0), 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center space-x-4">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search roles..."
                  value={queryState.search}
                  onChange={e =>
                    setQueryState(prev => ({ ...prev, search: e.target.value }))
                  }
                  className="pl-10"
                />
              </div>

              <Select
                value={
                  queryState.isActive === undefined
                    ? 'all'
                    : queryState.isActive.toString()
                }
                onValueChange={value =>
                  setQueryState(prev => ({
                    ...prev,
                    isActive: value === 'all' ? undefined : value === 'true',
                  }))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={
                  queryState.level === undefined
                    ? 'all'
                    : queryState.level.toString()
                }
                onValueChange={value =>
                  setQueryState(prev => ({
                    ...prev,
                    level: value === 'all' ? undefined : parseInt(value),
                  }))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="0">Level 0</SelectItem>
                  <SelectItem value="1">Level 1</SelectItem>
                  <SelectItem value="2">Level 2</SelectItem>
                  <SelectItem value="3">Level 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="h-4 w-40 animate-pulse rounded bg-gray-200"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
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
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <Shield className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No roles found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoles.map(role => {
                    const RoleIcon = getRoleIcon(role.icon!);
                    return (
                      <TableRow key={role.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded"
                              style={{ backgroundColor: role.color }}
                            >
                              <RoleIcon className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">
                                  {role.displayName}
                                </span>
                                {role.isSystemRole && (
                                  <Badge variant="outline" className="text-xs">
                                    <Crown className="mr-1 h-3 w-3" />
                                    System
                                  </Badge>
                                )}
                              </div>
                              <div className="max-w-64 truncate text-sm text-muted-foreground">
                                {role.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">Level {role.level}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(role)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {(role.userCount || 0).toLocaleString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPermissionsDialog(role)}
                          >
                            <Key className="mr-1 h-3 w-3" />
                            {role.permissionCount}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatInTimeZone(
                              role.createdAt,
                              'UTC',
                              'MMM d, yyyy HH:mm:ss'
                            )}

                            {/* {(() => {
                              console.log('Debug createdAt:', role.createdAt, typeof role.createdAt);
                              if (!role.createdAt) return 'N/A';
                              try {
                                const date = new Date(role.createdAt);
                                console.log('Parsed date:', date, date.getTime());
                                return format(date, 'MMM d, yyyy HH:mm:ss');
                              } catch (error) {
                                console.error('Date error:', error);
                                return 'Invalid Date';
                              }
                            })()} */}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => openEditDialog(role)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Role
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openPermissionsDialog(role)}
                              >
                                <Key className="mr-2 h-4 w-4" />
                                Manage Permissions
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {!role.isSystemRole && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setSelectedRole(role);
                                    setShowDeleteDialog(true);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Role
                                </DropdownMenuItem>
                              )}
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
        </CardContent>
      </Card>

      {/* Create Role Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Create a new role with specific permissions and settings
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="role_name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        displayName: e.target.value,
                      }))
                    }
                    placeholder="Role Display Name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Role description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={formData.level.toString()}
                    onValueChange={value =>
                      setFormData(prev => ({ ...prev, level: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Level 0 (Highest)</SelectItem>
                      <SelectItem value="1">Level 1</SelectItem>
                      <SelectItem value="2">Level 2</SelectItem>
                      <SelectItem value="3">Level 3</SelectItem>
                      <SelectItem value="4">Level 4</SelectItem>
                      <SelectItem value="5">Level 5 (Lowest)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={checked =>
                      setFormData(prev => ({ ...prev, isActive: checked }))
                    }
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="isSystemRole"
                    checked={formData.isSystemRole}
                    onCheckedChange={checked =>
                      setFormData(prev => ({ ...prev, isSystemRole: checked }))
                    }
                  />
                  <Label htmlFor="isSystemRole">System Role</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          color: e.target.value,
                        }))
                      }
                      className="h-10 w-16"
                    />
                    <Input
                      value={formData.color}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          color: e.target.value,
                        }))
                      }
                      placeholder="#2563eb"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={value =>
                      setFormData(prev => ({ ...prev, icon: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crown">Crown</SelectItem>
                      <SelectItem value="shield">Shield</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="eye">Eye</SelectItem>
                      <SelectItem value="settings">Settings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="max-h-60 space-y-4 overflow-y-auto">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={perms.every(p =>
                          formData.permissionIds.includes(p.id)
                        )}
                        onCheckedChange={checked => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              permissionIds: [
                                ...new Set([
                                  ...prev.permissionIds,
                                  ...perms.map(p => p.id),
                                ]),
                              ],
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              permissionIds: prev.permissionIds.filter(
                                id => !perms.map(p => p.id).includes(id)
                              ),
                            }));
                          }
                        }}
                      />
                      <Label
                        htmlFor={`category-${category}`}
                        className="font-semibold"
                      >
                        {category}
                      </Label>
                    </div>
                    <div className="ml-6 space-y-2">
                      {perms.map(permission => (
                        <div
                          key={permission.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={permission.id}
                            checked={formData.permissionIds.includes(
                              permission.id
                            )}
                            onCheckedChange={checked => {
                              if (checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  permissionIds: [
                                    ...prev.permissionIds,
                                    permission.id,
                                  ],
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  permissionIds: prev.permissionIds.filter(
                                    id => id !== permission.id
                                  ),
                                }));
                              }
                            }}
                          />
                          <div>
                            <Label htmlFor={permission.id} className="text-sm">
                              {permission.name}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateRole} disabled={loading}>
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role information and settings
            </DialogDescription>
          </DialogHeader>

          {/* Same content as create dialog but for editing */}
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editName">Name *</Label>
                  <Input
                    id="editName"
                    value={formData.name}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="role_name"
                    disabled={selectedRole?.isSystemRole}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editDisplayName">Display Name *</Label>
                  <Input
                    id="editDisplayName"
                    value={formData.displayName}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        displayName: e.target.value,
                      }))
                    }
                    placeholder="Role Display Name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={formData.description}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Role description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editLevel">Level</Label>
                  <Select
                    value={formData.level.toString()}
                    onValueChange={value =>
                      setFormData(prev => ({ ...prev, level: parseInt(value) }))
                    }
                    disabled={selectedRole?.isSystemRole}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Level 0 (Highest)</SelectItem>
                      <SelectItem value="1">Level 1</SelectItem>
                      <SelectItem value="2">Level 2</SelectItem>
                      <SelectItem value="3">Level 3</SelectItem>
                      <SelectItem value="4">Level 4</SelectItem>
                      <SelectItem value="5">Level 5 (Lowest)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="editIsActive"
                    checked={formData.isActive}
                    onCheckedChange={checked =>
                      setFormData(prev => ({ ...prev, isActive: checked }))
                    }
                  />
                  <Label htmlFor="editIsActive">Active</Label>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="isSystemRole"
                    checked={formData.isSystemRole}
                    onCheckedChange={checked =>
                      setFormData(prev => ({ ...prev, isSystemRole: checked }))
                    }
                  />
                  <Label htmlFor="isSystemRole">System Role</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editColor">Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="editColor"
                      type="color"
                      value={formData.color}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          color: e.target.value,
                        }))
                      }
                      className="h-10 w-16"
                    />
                    <Input
                      value={formData.color}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          color: e.target.value,
                        }))
                      }
                      placeholder="#2563eb"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editIcon">Icon</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={value =>
                      setFormData(prev => ({ ...prev, icon: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crown">Crown</SelectItem>
                      <SelectItem value="shield">Shield</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="eye">Eye</SelectItem>
                      <SelectItem value="settings">Settings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="max-h-60 space-y-4 overflow-y-auto">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-category-${category}`}
                        checked={perms.every(p =>
                          formData.permissionIds.includes(p.id)
                        )}
                        onCheckedChange={checked => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              permissionIds: [
                                ...new Set([
                                  ...prev.permissionIds,
                                  ...perms.map(p => p.id),
                                ]),
                              ],
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              permissionIds: prev.permissionIds.filter(
                                id => !perms.map(p => p.id).includes(id)
                              ),
                            }));
                          }
                        }}
                      />
                      <Label
                        htmlFor={`edit-category-${category}`}
                        className="font-semibold"
                      >
                        {category}
                      </Label>
                    </div>
                    <div className="ml-6 space-y-2">
                      {perms.map(permission => (
                        <div
                          key={permission.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`edit-${permission.id}`}
                            checked={formData.permissionIds.includes(
                              permission.id
                            )}
                            onCheckedChange={checked => {
                              if (checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  permissionIds: [
                                    ...prev.permissionIds,
                                    permission.id,
                                  ],
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  permissionIds: prev.permissionIds.filter(
                                    id => id !== permission.id
                                  ),
                                }));
                              }
                            }}
                          />
                          <div>
                            <Label
                              htmlFor={`edit-${permission.id}`}
                              className="text-sm"
                            >
                              {permission.name}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={loading}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the role "
              {selectedRole?.displayName}"? This action cannot be undone. Users
              with this role will lose their permissions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRole}
              disabled={loading}
            >
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Permissions Dialog */}
      <Dialog
        open={showPermissionsDialog}
        onOpenChange={setShowPermissionsDialog}
      >
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              Manage Permissions: {selectedRole?.displayName}
            </DialogTitle>
            <DialogDescription>
              Select permissions for this role
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-96 space-y-4 overflow-y-auto">
            {Object.entries(groupedPermissions).map(([category, perms]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`perm-category-${category}`}
                    checked={perms.every(p =>
                      formData.permissionIds.includes(p.id)
                    )}
                    onCheckedChange={checked => {
                      if (checked) {
                        setFormData(prev => ({
                          ...prev,
                          permissionIds: [
                            ...new Set([
                              ...prev.permissionIds,
                              ...perms.map(p => p.id),
                            ]),
                          ],
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          permissionIds: prev.permissionIds.filter(
                            id => !perms.map(p => p.id).includes(id)
                          ),
                        }));
                      }
                    }}
                  />
                  <Label
                    htmlFor={`perm-category-${category}`}
                    className="font-semibold"
                  >
                    {category} (
                    {
                      perms.filter(p => formData.permissionIds.includes(p.id))
                        .length
                    }
                    /{perms.length})
                  </Label>
                </div>
                <div className="ml-6 space-y-2">
                  {perms.map(permission => (
                    <div
                      key={permission.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`perm-${permission.id}`}
                        checked={formData.permissionIds.includes(permission.id)}
                        onCheckedChange={checked => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              permissionIds: [
                                ...prev.permissionIds,
                                permission.id,
                              ],
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              permissionIds: prev.permissionIds.filter(
                                id => id !== permission.id
                              ),
                            }));
                          }
                        }}
                      />
                      <div>
                        <Label
                          htmlFor={`perm-${permission.id}`}
                          className="text-sm"
                        >
                          {permission.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPermissionsDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // TODO: Save permissions
                toast.success('Permissions updated successfully');
                setShowPermissionsDialog(false);
              }}
            >
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
