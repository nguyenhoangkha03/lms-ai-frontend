'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit3,
  Trash2,
  Eye,
  Users,
  Lock,
  Key,
  Database,
  Settings,
  BookOpen,
  FileText,
  BarChart3,
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Tag,
  Grid3x3,
  List,
  ChevronDown,
  ChevronRight,
  Copy,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  downloadCSV,
  downloadJSON,
  downloadExcel,
  formatDateForExport,
  generateFilename,
} from '@/lib/utils/export-utils';
import {
  useGetPermissionsQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  useGetPermissionCategoriesQuery,
  useGetPermissionResourcesQuery,
  useGetPermissionActionsQuery,
  type Permission,
  type CreatePermissionDto,
  type UpdatePermissionDto,
} from '@/lib/redux/api/permission-api';
// Import để register endpoints
import '@/lib/redux/api/role-api';
import '@/lib/redux/api/permission-api';
import { Role } from '@/lib/redux/api/role-api';

const resources = [
  'USER',
  'COURSE',
  'ROLE',
  'PERMISSION',
  'ANALYTICS',
  'SYSTEM',
  'CONTENT',
];
const actions = [
  'CREATE',
  'READ',
  'UPDATE',
  'DELETE',
  'MANAGE',
  'EXPORT',
  'IMPORT',
];
const categories = [
  'User Management',
  'Course Management',
  'Security',
  'Analytics',
  'System',
  'Content Management',
];

export default function AdminPermissionsPage() {
  const { toast } = useToast();

  // Real API calls
  const {
    data: permissionsData,
    error: permissionsError,
    isLoading: permissionsLoading,
    refetch: refetchPermissions,
  } = useGetPermissionsQuery();
  //   const { data: categoriesData } = useGetPermissionCategoriesQuery();
  //   const { data: resourcesData } = useGetPermissionResourcesQuery();
  //   const { data: actionsData } = useGetPermissionActionsQuery();
  const [createPermissionMutation] = useCreatePermissionMutation();
  const [updatePermissionMutation] = useUpdatePermissionMutation();
  const [deletePermissionMutation] = useDeletePermissionMutation();

  const permissions = permissionsData || [];
  const loading = permissionsLoading;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedResource, setSelectedResource] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'tree'>('grid');
  const [showDialog, setShowDialog] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'User Management',
  ]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    resource: '',
    action: '',
    category: '',
    priority: 50,
    conditions: '',
    isSystemPermission: false,
    isActive: true,
    settings: '',
    metadata: '',
  });

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch =
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      permission.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || permission.category === selectedCategory;
    const matchesResource =
      selectedResource === 'all' || permission.resource === selectedResource;

    return matchesSearch && matchesCategory && matchesResource;
  });

  const groupedPermissions = filteredPermissions.reduce(
    (acc, permission) => {
      const category = permission.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  const stats = {
    total: permissions.length,
    system: permissions.filter(p => p.isSystemPermission).length,
    custom: permissions.filter(p => !p.isSystemPermission).length,
    unused: permissions.filter(p => (p.roles?.length || 0) === 0).length,
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'User Management':
        return <Users className="h-5 w-5" />;
      case 'Course Management':
        return <BookOpen className="h-5 w-5" />;
      case 'Security':
        return <Shield className="h-5 w-5" />;
      case 'Analytics':
        return <BarChart3 className="h-5 w-5" />;
      case 'System':
        return <Settings className="h-5 w-5" />;
      case 'Content Management':
        return <FileText className="h-5 w-5" />;
      default:
        return <Key className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'User Management':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Course Management':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Security':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Analytics':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'System':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Content Management':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleCreatePermission = () => {
    setEditingPermission(null);
    setFormData({
      name: '',
      displayName: '',
      description: '',
      resource: '',
      action: '',
      category: '',
      priority: 50,
      conditions: '',
      isSystemPermission: false,
      isActive: true,
      settings: '',
      metadata: '',
    });
    setShowDialog(true);
  };

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission);
    setFormData({
      name: permission.name,
      displayName: permission.displayName || '',
      description: permission.description || '',
      resource: permission.resource,
      action: permission.action,
      category: permission.category || '',
      priority: permission.priority || 50,
      conditions: permission.conditions || '',
      isSystemPermission: permission.isSystemPermission || false,
      isActive: permission.isActive !== false,
      settings: permission.settings
        ? JSON.stringify(permission.settings, null, 2)
        : '',
      metadata: permission.metadata
        ? JSON.stringify(permission.metadata, null, 2)
        : '',
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      // Parse JSON fields
      let settings = undefined;
      let metadata = undefined;

      try {
        if (formData.settings.trim()) {
          settings = JSON.parse(formData.settings);
        }
      } catch (e) {
        toast({
          title: 'Invalid JSON',
          description: 'Settings field contains invalid JSON format.',
          variant: 'destructive',
        });
        return;
      }

      try {
        if (formData.metadata.trim()) {
          metadata = JSON.parse(formData.metadata);
        }
      } catch (e) {
        toast({
          title: 'Invalid JSON',
          description: 'Metadata field contains invalid JSON format.',
          variant: 'destructive',
        });
        return;
      }

      const formDataWithDefaults = {
        name: formData.name,
        displayName: formData.displayName,
        description: formData.description,
        resource: formData.resource,
        action: formData.action,
        category: formData.category,
        priority: formData.priority || 50,
        conditions: formData.conditions,
        isSystemPermission: formData.isSystemPermission,
        isActive: formData.isActive,
        settings,
        metadata,
      };

      if (editingPermission) {
        await updatePermissionMutation({
          id: editingPermission.id,
          data: formDataWithDefaults,
        }).unwrap();
        toast({
          title: 'Permission Updated',
          description: 'The permission has been updated successfully.',
        });
      } else {
        await createPermissionMutation(
          formDataWithDefaults as CreatePermissionDto
        ).unwrap();
        toast({
          title: 'Permission Created',
          description: 'The new permission has been created successfully.',
        });
      }
      setShowDialog(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.data?.message ||
          'An error occurred while saving the permission.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = (permission: Permission) => {
    setEditingPermission(permission);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (editingPermission) {
      try {
        await deletePermissionMutation(editingPermission.id).unwrap();
        toast({
          title: 'Permission Deleted',
          description: 'The permission has been deleted successfully.',
        });
        setShowDeleteDialog(false);
        setEditingPermission(null);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error?.data?.message || 'Failed to delete permission.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDuplicatePermission = async (permission: Permission) => {
    try {
      const duplicatedData: CreatePermissionDto = {
        name: `${permission.name} (Copy)`,
        displayName: permission.displayName,
        description: permission.description,
        resource: permission.resource,
        action: permission.action,
        category: permission.category,
        priority: permission.priority,
        conditions: permission.conditions,
        isActive: true,
        isSystemPermission: false,
      };
      await createPermissionMutation(duplicatedData).unwrap();
      toast({
        title: 'Permission Duplicated',
        description: 'The permission has been duplicated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to duplicate permission.',
        variant: 'destructive',
      });
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Export functions
  const prepareExportData = () => {
    return filteredPermissions.map(permission => ({
      ID: permission.id,
      Name: permission.name,
      DisplayName: permission.displayName || '',
      Description: permission.description || '',
      Resource: permission.resource,
      Action: permission.action,
      'Full Name':
        permission.displayName ||
        `${permission.resource?.toLowerCase()}:${permission.action?.toLowerCase()}`,
      Category: permission.category || 'Uncategorized',
      Priority: permission.priority || 0,
      'System Permission': permission.isSystemPermission ? 'Yes' : 'No',
      Active: permission.isActive !== false ? 'Yes' : 'No',
      'Role Count': permission.roles?.length || 0,
      Conditions: permission.conditions || '',
      'Created At': formatDateForExport(permission.createdAt),
      'Updated At': formatDateForExport(permission.updatedAt),
    }));
  };

  const handleExport = async (format: 'csv' | 'excel' | 'json') => {
    try {
      const exportData = prepareExportData();

      if (exportData.length === 0) {
        toast({
          title: 'No data to export',
          description: 'There are no permissions to export.',
          variant: 'destructive',
        });
        return;
      }

      switch (format) {
        case 'csv':
          downloadCSV(
            exportData,
            generateFilename('permissions_export', 'csv')
          );
          toast({
            title: 'Export Successful',
            description: 'Permissions exported as CSV successfully.',
          });
          break;
        case 'excel':
          downloadExcel(
            exportData,
            generateFilename('permissions_export', 'csv')
          );
          toast({
            title: 'Export Successful',
            description:
              'Permissions exported as Excel-compatible CSV successfully.',
          });
          break;
        case 'json':
          downloadJSON(
            exportData,
            generateFilename('permissions_export', 'json')
          );
          toast({
            title: 'Export Successful',
            description: 'Permissions exported as JSON successfully.',
          });
          break;
        default:
          toast({
            title: 'Error',
            description: 'Invalid export format.',
            variant: 'destructive',
          });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export permissions.',
        variant: 'destructive',
      });
    }
  };

  const renderPermissionCard = (permission: Permission) => (
    <Card
      key={permission.id}
      className="group border-white/50 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:shadow-lg"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg transition-colors group-hover:text-indigo-600">
                {permission.name}
              </CardTitle>
              <div className="mt-1 flex items-center space-x-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {permission.displayName}
                </Badge>
                {permission.isSystemPermission && (
                  <Badge className="border-red-200 bg-red-100 text-red-800">
                    <Lock className="mr-1 h-3 w-3" />
                    System
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleEditPermission(permission)}
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDuplicatePermission(permission)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {!permission.isSystemPermission && (
                <DropdownMenuItem
                  onClick={() => handleDelete(permission)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-slate-600">
          {permission.description || 'No description provided'}
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Category:</span>
            <Badge
              className={getCategoryColor(
                permission.category || 'Uncategorized'
              )}
            >
              {getCategoryIcon(permission.category || 'Uncategorized')}
              <span className="ml-2">
                {permission.category || 'Uncategorized'}
              </span>
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Resource:</span>
            <Badge variant="outline">{permission.resource}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Action:</span>
            <Badge variant="outline">{permission.action}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Usage:</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold">
                {permission.roles?.length || 0}
              </span>
              <span className="text-xs text-slate-500">roles</span>
            </div>
          </div>

          {permission.roles && permission.roles.length > 0 && (
            <div>
              <span className="mb-2 block text-sm text-slate-500">
                Assigned Roles:
              </span>
              <div className="flex flex-wrap gap-1">
                {permission.roles.slice(0, 3).map(role => (
                  <Badge key={role.id} variant="secondary" className="text-xs">
                    {role.displayName}
                  </Badge>
                ))}
                {permission.roles.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{permission.roles.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderTreeView = () => (
    <div className="space-y-4">
      {Object.entries(groupedPermissions).map(
        ([category, categoryPermissions]) => (
          <Card
            key={category}
            className="border-white/50 bg-white/80 backdrop-blur-sm"
          >
            <CardHeader
              className="cursor-pointer transition-colors hover:bg-white/50"
              onClick={() => toggleCategory(category)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {expandedCategories.includes(category) ? (
                    <ChevronDown className="h-5 w-5 text-slate-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-500" />
                  )}
                  {getCategoryIcon(category)}
                  <CardTitle className="text-lg">{category}</CardTitle>
                  <Badge variant="outline">{categoryPermissions.length}</Badge>
                </div>
              </div>
            </CardHeader>
            {expandedCategories.includes(category) && (
              <CardContent>
                <div className="space-y-3">
                  {categoryPermissions.map(permission => (
                    <div
                      key={permission.id}
                      className="group flex items-center justify-between rounded-lg bg-white/40 p-3 transition-colors hover:bg-white/60"
                    >
                      <div className="flex items-center space-x-3">
                        <Key className="h-4 w-4 text-slate-500" />
                        <div>
                          <div className="font-medium transition-colors group-hover:text-indigo-600">
                            {permission.name}
                          </div>
                          <div className="text-sm text-slate-500">
                            {permission.displayName ||
                              `${permission.resource?.toLowerCase()}:${permission.action?.toLowerCase()}`}{' '}
                            • {permission.roles?.length || 0} roles
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {permission.isSystemPermission && (
                          <Badge className="border-red-200 bg-red-100 text-red-800">
                            <Lock className="mr-1 h-3 w-3" />
                            System
                          </Badge>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditPermission(permission)}
                            >
                              <Edit3 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleDuplicatePermission(permission)
                              }
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            {!permission.isSystemPermission && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(permission)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                <Key className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Permissions Management
                </h1>
                <p className="text-slate-600">
                  Manage system permissions and access control
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="bg-white/60 backdrop-blur-sm"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-white/60 backdrop-blur-sm"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <FileText className="mr-2 h-4 w-4" />
                    CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('excel')}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('json')}>
                    <Database className="mr-2 h-4 w-4" />
                    JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={handleCreatePermission}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg hover:from-indigo-600 hover:to-purple-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Permission
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Permissions</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {stats.total}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  <Key className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">System Permissions</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {stats.system}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-pink-600 text-white">
                  <Lock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Custom Permissions</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {stats.custom}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                  <Settings className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Unused Permissions</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {stats.unused}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                  <AlertCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card className="mb-8 border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="min-w-64 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    placeholder="Search permissions..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-white/80 pl-10"
                  />
                </div>
              </div>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-48 bg-white/80">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedResource}
                onValueChange={setSelectedResource}
              >
                <SelectTrigger className="w-48 bg-white/80">
                  <SelectValue placeholder="Resource" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  {resources.map(resource => (
                    <SelectItem key={resource} value={resource}>
                      {resource}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2 rounded-lg border bg-white/60 p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'tree' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('tree')}
                  className="h-8 w-8 p-0"
                >
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions Display */}
        {viewMode === 'tree' ? (
          renderTreeView()
        ) : viewMode === 'list' ? (
          <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
            <CardHeader>
              <CardTitle>Permissions List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredPermissions.map(permission => (
                  <div
                    key={permission.id}
                    className="group flex items-center justify-between rounded-lg bg-white/40 p-4 transition-colors hover:bg-white/60"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        <Key className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium transition-colors group-hover:text-indigo-600">
                          {permission.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {permission.displayName ||
                            `${permission.resource?.toLowerCase()}:${permission.action?.toLowerCase()}`}{' '}
                          • {permission.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge
                        className={getCategoryColor(
                          permission.category || 'Uncategorized'
                        )}
                      >
                        {permission.category || 'Uncategorized'}
                      </Badge>
                      <div className="text-sm text-slate-500">
                        {permission.roles?.length || 0} roles
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditPermission(permission)}
                          >
                            <Edit3 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleDuplicatePermission(permission)
                            }
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          {!permission.isSystemPermission && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(permission)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredPermissions.map(renderPermissionCard)}
          </div>
        )}

        {filteredPermissions.length === 0 && (
          <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
            <CardContent className="p-12 text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-slate-400" />
              <h3 className="mb-2 text-lg font-semibold text-slate-600">
                No permissions found
              </h3>
              <p className="mb-6 text-slate-500">
                {searchTerm ||
                selectedCategory !== 'all' ||
                selectedResource !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'Get started by creating your first permission'}
              </p>
              {!searchTerm &&
                selectedCategory === 'all' &&
                selectedResource === 'all' && (
                  <Button onClick={handleCreatePermission}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Permission
                  </Button>
                )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Permission Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPermission ? 'Edit Permission' : 'Create New Permission'}
            </DialogTitle>
            <DialogDescription>
              {editingPermission
                ? 'Update the permission details below'
                : 'Fill in the details to create a new permission'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Permission Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Create Users"
                    className="bg-white/80"
                  />
                </div>
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={e =>
                      setFormData({ ...formData, displayName: e.target.value })
                    }
                    placeholder="Human-readable name"
                    className="bg-white/80"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={value =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger className="bg-white/80">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <div className="space-y-2">
                    <Input
                      id="priority"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.priority}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          priority: parseInt(e.target.value) || 0,
                        })
                      }
                      className="bg-white/80"
                    />
                    <p className="text-sm text-slate-500">
                      Priority level (0-100). Higher values take precedence.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe what this permission allows..."
                  rows={3}
                  className="bg-white/80"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="resource">Resource</Label>
                  <Select
                    value={formData.resource}
                    onValueChange={value =>
                      setFormData({ ...formData, resource: value })
                    }
                  >
                    <SelectTrigger className="bg-white/80">
                      <SelectValue placeholder="Select resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {resources.map(resource => (
                        <SelectItem key={resource} value={resource}>
                          {resource}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="action">Action</Label>
                  <Select
                    value={formData.action}
                    onValueChange={value =>
                      setFormData({ ...formData, action: value })
                    }
                  >
                    <SelectTrigger className="bg-white/80">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      {actions.map(action => (
                        <SelectItem key={action} value={action}>
                          {action}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.resource && formData.action && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Permission Code:</strong>{' '}
                    <code className="rounded bg-blue-100 px-2 py-1 text-blue-900">
                      {formData.resource.toLowerCase()}:
                      {formData.action.toLowerCase()}
                    </code>
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={checked =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                  <Label htmlFor="isActive" className="text-sm font-medium">
                    Active Permission
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isSystemPermission"
                    checked={formData.isSystemPermission}
                    onCheckedChange={checked =>
                      setFormData({ ...formData, isSystemPermission: checked })
                    }
                    disabled={editingPermission?.isSystemPermission}
                  />
                  <Label
                    htmlFor="isSystemPermission"
                    className="text-sm font-medium"
                  >
                    System Permission
                  </Label>
                  {editingPermission?.isSystemPermission && (
                    <p className="text-xs text-amber-600">
                      Cannot modify system permission flag
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="conditions">Access Conditions</Label>
                <Textarea
                  id="conditions"
                  value={formData.conditions}
                  onChange={e =>
                    setFormData({ ...formData, conditions: e.target.value })
                  }
                  placeholder="Optional conditions for advanced access control"
                  rows={3}
                  className="bg-white/80 font-mono text-sm"
                />
                <p className="mt-1 text-sm text-slate-500">
                  Optional conditions for fine-grained access control
                </p>
              </div>

              <div>
                <Label htmlFor="settings">Settings (JSON)</Label>
                <Textarea
                  id="settings"
                  value={formData.settings}
                  onChange={e =>
                    setFormData({ ...formData, settings: e.target.value })
                  }
                  placeholder='{"key": "value"}'
                  rows={4}
                  className="bg-white/80 font-mono text-sm"
                />
                <p className="mt-1 text-sm text-slate-500">
                  Optional JSON settings for permission-specific configuration
                </p>
              </div>

              <div>
                <Label htmlFor="metadata">Metadata (JSON)</Label>
                <Textarea
                  id="metadata"
                  value={formData.metadata}
                  onChange={e =>
                    setFormData({ ...formData, metadata: e.target.value })
                  }
                  placeholder='{"key": "value"}'
                  rows={4}
                  className="bg-white/80 font-mono text-sm"
                />
                <p className="mt-1 text-sm text-slate-500">
                  Optional JSON metadata for additional information
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingPermission ? 'Update Permission' : 'Create Permission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Delete Permission</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the permission "
              {editingPermission?.name}"? This action cannot be undone and will
              remove the permission from all associated roles.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
