'use client';

import React, { useState, useCallback } from 'react';
import {
  Shield,
  Key,
  Plus,
  Minus,
  Save,
  X,
  AlertTriangle,
  Search,
} from 'lucide-react';
import {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useGetUserPermissionsQuery,
  useAssignRolesMutation,
  useRemoveRolesMutation,
  useAssignPermissionsMutation,
} from '@/lib/redux/api/user-management-api';
import { User } from '@/types/user-management';
import { useRBAC } from '@/hooks/use-rbac';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DataTable } from '@/components/ui/data-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ColumnDef } from '@tanstack/react-table';

interface RBACPermissionControlsProps {
  userId?: string;
  user?: User;
  onPermissionsUpdated?: () => void;
}

interface RoleAssignment {
  roleId: string;
  roleName: string;
  assigned: boolean;
  hierarchy: number;
  permissions: string[];
}

interface PermissionAssignment {
  permissionId: string;
  permissionName: string;
  assigned: boolean;
  resource: string;
  action: string;
  inherited: boolean;
  inheritedFrom?: string;
}

const RBACPermissionControls: React.FC<RBACPermissionControlsProps> = ({
  userId,
  user,
  onPermissionsUpdated,
}) => {
  const { hasPermission, canManageUsers } = useRBAC();
  const { toast } = useToast();

  // State management
  const [activeTab, setActiveTab] = useState('roles');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResource, setFilterResource] = useState<string>('all');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{
    roles: { add: string[]; remove: string[] };
    permissions: { add: string[]; remove: string[] };
  }>({
    roles: { add: [], remove: [] },
    permissions: { add: [], remove: [] },
  });

  // API queries
  const { data: roles = [] } = useGetRolesQuery();
  const { data: permissions = [] } = useGetPermissionsQuery();
  const { data: userPermissions = [] } = useGetUserPermissionsQuery(userId!, {
    skip: !userId,
  });

  // API mutations
  const [assignRoles] = useAssignRolesMutation();
  const [removeRoles] = useRemoveRolesMutation();
  const [assignPermissions] = useAssignPermissionsMutation();

  // Permission check
  if (!canManageUsers) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to manage user roles and permissions.
        </AlertDescription>
      </Alert>
    );
  }

  // Helper functions
  const getUserRoles = useCallback((): string[] => {
    if (!user) return [];
    // This would come from user data in a real implementation
    return user.metadata?.roles || [];
  }, [user]);

  const getUserDirectPermissions = useCallback((): string[] => {
    return userPermissions.map(p => p.id);
  }, [userPermissions]);

  const getInheritedPermissions = useCallback((): string[] => {
    const userRoleIds = getUserRoles();
    const inheritedPerms = new Set<string>();

    userRoleIds.forEach(roleId => {
      const role = roles.find(r => r.id === roleId);
      if (role) {
        role.permissions.forEach(permId => inheritedPerms.add(permId));
      }
    });

    return Array.from(inheritedPerms);
  }, [getUserRoles, roles]);

  const getRoleAssignments = useCallback((): RoleAssignment[] => {
    const userRoleIds = getUserRoles();

    return roles.map(role => ({
      roleId: role.id,
      roleName: role.name,
      assigned: userRoleIds.includes(role.id),
      hierarchy: role.hierarchy,
      permissions: role.permissions,
    }));
  }, [roles, getUserRoles]);

  const getPermissionAssignments = useCallback((): PermissionAssignment[] => {
    const userDirectPerms = getUserDirectPermissions();
    const inheritedPerms = getInheritedPermissions();
    const userRoleIds = getUserRoles();

    return permissions.map(permission => {
      const directlyAssigned = userDirectPerms.includes(permission.id);
      const inherited =
        inheritedPerms.includes(permission.id) && !directlyAssigned;

      let inheritedFrom: string | undefined;
      if (inherited) {
        const inheritingRole = roles.find(
          role =>
            userRoleIds.includes(role.id) &&
            role.permissions.includes(permission.id)
        );
        inheritedFrom = inheritingRole?.name;
      }

      return {
        permissionId: permission.id,
        permissionName: permission.name,
        assigned: directlyAssigned || inherited,
        resource: permission.resource,
        action: permission.action,
        inherited,
        inheritedFrom,
      };
    });
  }, [
    permissions,
    getUserDirectPermissions,
    getInheritedPermissions,
    getUserRoles,
    roles,
  ]);

  // Handlers
  const handleRoleToggle = useCallback((roleId: string, assigned: boolean) => {
    setPendingChanges(prev => {
      const newChanges = { ...prev };

      if (assigned) {
        // Add role
        newChanges.roles.add = [
          ...prev.roles.add.filter(id => id !== roleId),
          roleId,
        ];
        newChanges.roles.remove = prev.roles.remove.filter(id => id !== roleId);
      } else {
        // Remove role
        newChanges.roles.remove = [
          ...prev.roles.remove.filter(id => id !== roleId),
          roleId,
        ];
        newChanges.roles.add = prev.roles.add.filter(id => id !== roleId);
      }

      return newChanges;
    });
  }, []);

  const handlePermissionToggle = useCallback(
    (permissionId: string, assigned: boolean) => {
      setPendingChanges(prev => {
        const newChanges = { ...prev };

        if (assigned) {
          // Add permission
          newChanges.permissions.add = [
            ...prev.permissions.add.filter(id => id !== permissionId),
            permissionId,
          ];
          newChanges.permissions.remove = prev.permissions.remove.filter(
            id => id !== permissionId
          );
        } else {
          // Remove permission
          newChanges.permissions.remove = [
            ...prev.permissions.remove.filter(id => id !== permissionId),
            permissionId,
          ];
          newChanges.permissions.add = prev.permissions.add.filter(
            id => id !== permissionId
          );
        }

        return newChanges;
      });
    },
    []
  );

  const handleSaveChanges = async () => {
    if (!userId) return;

    try {
      // Apply role changes
      if (pendingChanges.roles.add.length > 0) {
        await assignRoles({
          id: userId,
          roleIds: pendingChanges.roles.add,
        }).unwrap();
      }
      if (pendingChanges.roles.remove.length > 0) {
        await removeRoles({
          id: userId,
          roleIds: pendingChanges.roles.remove,
        }).unwrap();
      }

      // Apply permission changes
      if (pendingChanges.permissions.add.length > 0) {
        await assignPermissions({
          id: userId,
          permissionIds: pendingChanges.permissions.add,
        }).unwrap();
      }

      setPendingChanges({
        roles: { add: [], remove: [] },
        permissions: { add: [], remove: [] },
      });

      toast({
        title: 'Permissions updated successfully',
        description: 'User roles and permissions have been updated.',
      });

      onPermissionsUpdated?.();
    } catch (error) {
      toast({
        title: 'Error updating permissions',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update permissions',
        variant: 'destructive',
      });
    }
  };

  const handleDiscardChanges = () => {
    setPendingChanges({
      roles: { add: [], remove: [] },
      permissions: { add: [], remove: [] },
    });
  };

  const hasPendingChanges = () => {
    return (
      pendingChanges.roles.add.length > 0 ||
      pendingChanges.roles.remove.length > 0 ||
      pendingChanges.permissions.add.length > 0 ||
      pendingChanges.permissions.remove.length > 0
    );
  };

  const filteredPermissions = getPermissionAssignments().filter(perm => {
    const matchesSearch =
      perm.permissionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesResource =
      filterResource === 'all' || perm.resource === filterResource;
    return matchesSearch && matchesResource;
  });

  const uniqueResources = Array.from(new Set(permissions.map(p => p.resource)));

  const roleColumns: ColumnDef<RoleAssignment>[] = [
    {
      accessorKey: 'assigned',
      header: 'Assigned',
      cell: ({ row }) => {
        const roleAssignment = row.original;
        const isAssigned = roleAssignment.assigned;
        const isPending =
          pendingChanges.roles.add.includes(roleAssignment.roleId) ||
          pendingChanges.roles.remove.includes(roleAssignment.roleId);

        return (
          <Checkbox
            checked={isAssigned}
            onCheckedChange={checked =>
              handleRoleToggle(roleAssignment.roleId, !!checked)
            }
            className={isPending ? 'border-orange-500' : ''}
          />
        );
      },
    },
    {
      accessorKey: 'roleName',
      header: 'Role',
      cell: ({ row }) => {
        const roleAssignment = row.original;
        return (
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{roleAssignment.roleName}</div>
              <div className="text-xs text-muted-foreground">
                Hierarchy: {roleAssignment.hierarchy}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'permissions',
      header: 'Permissions',
      cell: ({ row }) => {
        const roleAssignment = row.original;
        return (
          <div className="text-sm">
            {roleAssignment.permissions.length} permissions
          </div>
        );
      },
    },
  ];

  const permissionColumns: ColumnDef<PermissionAssignment>[] = [
    {
      accessorKey: 'assigned',
      header: 'Assigned',
      cell: ({ row }) => {
        const permAssignment = row.original;
        const isAssigned = permAssignment.assigned && !permAssignment.inherited;
        const isPending =
          pendingChanges.permissions.add.includes(
            permAssignment.permissionId
          ) ||
          pendingChanges.permissions.remove.includes(
            permAssignment.permissionId
          );

        return (
          <Checkbox
            checked={isAssigned}
            onCheckedChange={checked =>
              handlePermissionToggle(permAssignment.permissionId, !!checked)
            }
            disabled={permAssignment.inherited}
            className={isPending ? 'border-orange-500' : ''}
          />
        );
      },
    },
    {
      accessorKey: 'permissionName',
      header: 'Permission',
      cell: ({ row }) => {
        const permAssignment = row.original;
        return (
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{permAssignment.permissionName}</div>
              <div className="text-xs text-muted-foreground">
                {permAssignment.resource}.{permAssignment.action}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const permAssignment = row.original;

        if (permAssignment.inherited) {
          return (
            <Badge variant="outline" className="text-blue-600">
              Inherited from {permAssignment.inheritedFrom}
            </Badge>
          );
        }

        if (permAssignment.assigned) {
          return <Badge variant="default">Direct Assignment</Badge>;
        }

        return <Badge variant="outline">Not Assigned</Badge>;
      },
    },
  ];

  if (!userId || !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select a User</CardTitle>
          <CardDescription>
            Select a user to manage their roles and permissions
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                <AvatarFallback>
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{user.displayName}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>

            {hasPendingChanges() && (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleDiscardChanges}>
                  <X className="mr-2 h-4 w-4" />
                  Discard
                </Button>
                <Button onClick={handleSaveChanges}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role Assignments
              </CardTitle>
              <CardDescription>
                Manage user roles. Roles automatically grant their associated
                permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={roleColumns} data={getRoleAssignments()} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Permission Assignments
              </CardTitle>
              <CardDescription>
                Manage direct permission assignments. Inherited permissions from
                roles cannot be modified here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search permissions..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <Select
                  value={filterResource}
                  onValueChange={setFilterResource}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by resource" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Resources</SelectItem>
                    {uniqueResources.map(resource => (
                      <SelectItem key={resource} value={resource}>
                        {resource}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DataTable
                columns={permissionColumns}
                data={filteredPermissions}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pending Changes Summary */}
      {hasPendingChanges() && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">Pending Changes</CardTitle>
            <CardDescription className="text-orange-700">
              Review your changes before saving
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(pendingChanges.roles.add.length > 0 ||
              pendingChanges.roles.remove.length > 0) && (
              <div>
                <h4 className="mb-2 font-medium text-orange-800">
                  Role Changes
                </h4>
                <div className="space-y-2">
                  {pendingChanges.roles.add.map(roleId => {
                    const role = roles.find(r => r.id === roleId);
                    return (
                      <div key={roleId} className="flex items-center gap-2">
                        <Plus className="h-3 w-3 text-green-600" />
                        <span className="text-sm">Add role: {role?.name}</span>
                      </div>
                    );
                  })}
                  {pendingChanges.roles.remove.map(roleId => {
                    const role = roles.find(r => r.id === roleId);
                    return (
                      <div key={roleId} className="flex items-center gap-2">
                        <Minus className="h-3 w-3 text-red-600" />
                        <span className="text-sm">
                          Remove role: {role?.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {(pendingChanges.permissions.add.length > 0 ||
              pendingChanges.permissions.remove.length > 0) && (
              <div>
                <h4 className="mb-2 font-medium text-orange-800">
                  Permission Changes
                </h4>
                <div className="space-y-2">
                  {pendingChanges.permissions.add.map(permissionId => {
                    const permission = permissions.find(
                      p => p.id === permissionId
                    );
                    return (
                      <div
                        key={permissionId}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-3 w-3 text-green-600" />
                        <span className="text-sm">
                          Add permission: {permission?.name}
                        </span>
                      </div>
                    );
                  })}
                  {pendingChanges.permissions.remove.map(permissionId => {
                    const permission = permissions.find(
                      p => p.id === permissionId
                    );
                    return (
                      <div
                        key={permissionId}
                        className="flex items-center gap-2"
                      >
                        <Minus className="h-3 w-3 text-red-600" />
                        <span className="text-sm">
                          Remove permission: {permission?.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RBACPermissionControls;
