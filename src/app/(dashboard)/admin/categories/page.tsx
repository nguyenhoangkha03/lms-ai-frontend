'use client';

import React, { useState } from 'react';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FolderTree,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Settings,
  Tag,
  Bookmark,
  Archive,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  DragHandleDots2Icon,
  Hash,
  Palette,
  Image,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  useGetCategoriesQuery,
  useGetCategoryTreeQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useReorderCategoryMutation,
  useGetCategoryStatsQuery,
} from '@/lib/redux/api/admin-api';

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  parentId: string;
  iconUrl: string;
  coverUrl: string;
  color: string;
  orderIndex: number;
  level: number;
  isActive: boolean;
  showInMenu: boolean;
  isFeatured: boolean;
  seoMeta: {
    title: string;
    description: string;
    keywords: string[];
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  iconUrl?: string;
  coverUrl?: string;
  color?: string;
  orderIndex: number;
  level: number;
  isActive: boolean;
  showInMenu: boolean;
  isFeatured: boolean;
  courseCount: number;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminCategoriesPage() {
  const [view, setView] = useState<'tree' | 'table'>('tree');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  
  const [queryState, setQueryState] = useState({
    search: '',
    isActive: undefined as boolean | undefined,
    showInMenu: undefined as boolean | undefined,
    isFeatured: undefined as boolean | undefined,
    page: 1,
    limit: 50,
    sortBy: 'orderIndex',
    sortOrder: 'ASC' as 'ASC' | 'DESC',
  });

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    parentId: 'root',
    iconUrl: '',
    coverUrl: '',
    color: '#3b82f6',
    orderIndex: 0,
    level: 0,
    isActive: true,
    showInMenu: true,
    isFeatured: false,
    seoMeta: {
      title: '',
      description: '',
      keywords: [],
    },
  });

  const { data: categoriesData, isLoading, refetch } = useGetCategoriesQuery(queryState);
  const { data: treeData, refetch: refetchTree } = useGetCategoryTreeQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [reorderCategory] = useReorderCategoryMutation();

  const categories = categoriesData?.data || categoriesData?.categories || [];
  const tree = treeData?.tree || [];

  const handleCreate = async () => {
    try {
      const createData = { ...formData };
      if (!createData.parentId || createData.parentId === 'null') {
        createData.parentId = null;
      }
      
      await createCategory(createData).unwrap();
      toast.success('Category created successfully');
      setShowCreateDialog(false);
      resetForm();
      refetch();
      refetchTree();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create category');
    }
  };

  const handleUpdate = async () => {
    if (!selectedCategory) return;

    try {
      const updateData = { ...formData };
      if (!updateData.parentId || updateData.parentId === 'null') {
        updateData.parentId = null;
      }

      await updateCategory({
        id: selectedCategory.id,
        data: updateData,
      }).unwrap();
      
      toast.success('Category updated successfully');
      setShowEditDialog(false);
      setSelectedCategory(null);
      resetForm();
      refetch();
      refetchTree();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update category');
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      await deleteCategory(selectedCategory.id).unwrap();
      toast.success('Category deleted successfully');
      setShowDeleteDialog(false);
      setSelectedCategory(null);
      refetch();
      refetchTree();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete category');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      parentId: 'null',
      iconUrl: '',
      coverUrl: '',
      color: '#3b82f6',
      orderIndex: 0,
      level: 0,
      isActive: true,
      showInMenu: true,
      isFeatured: false,
      seoMeta: {
        title: '',
        description: '',
        keywords: [],
      },
    });
  };

  const openCreateDialog = (parentId?: string) => {
    resetForm();
    if (parentId) {
      setFormData(prev => ({ ...prev, parentId }));
    }
    setShowCreateDialog(true);
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parentId: category.parentId || 'null',
      iconUrl: category.iconUrl || '',
      coverUrl: category.coverUrl || '',
      color: category.color || '#3b82f6',
      orderIndex: category.orderIndex,
      level: category.level,
      isActive: category.isActive,
      showInMenu: category.showInMenu,
      isFeatured: category.isFeatured,
      seoMeta: {
        title: category.name,
        description: category.description || '',
        keywords: [],
      },
    });
    setShowEditDialog(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const toggleExpanded = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const renderTreeNode = (node: Category, depth = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="select-none">
        <div
          className="group flex items-center py-2 px-3 hover:bg-gray-50 rounded-lg cursor-pointer"
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
        >
          <div className="flex items-center flex-1 min-w-0">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 mr-1"
                onClick={() => toggleExpanded(node.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="w-7" />
            )}

            {node.iconUrl ? (
              <img src={node.iconUrl} alt="" className="h-5 w-5 mr-2 rounded" />
            ) : (
              <div
                className="h-5 w-5 mr-2 rounded flex items-center justify-center"
                style={{ backgroundColor: node.color }}
              >
                <Tag className="h-3 w-3 text-white" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 truncate">
                  {node.name}
                </span>
                {node.isFeatured && (
                  <Bookmark className="h-4 w-4 text-yellow-500" />
                )}
                {!node.isActive && (
                  <Archive className="h-4 w-4 text-gray-400" />
                )}
                {!node.showInMenu && (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>{node.courseCount} courses</span>
                <span>Level {node.level}</span>
                <span className="truncate">{node.slug}</span>
              </div>
            </div>
          </div>

          <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => openCreateDialog(node.id)}
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => openEditDialog(node)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  setSelectedCategory(node);
                  setShowStatsDialog(true);
                }}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Stats
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => {
                    setSelectedCategory(node);
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div>
            {node.children!.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const getStatusBadge = (category: Category) => {
    if (!category.isActive) {
      return (
        <Badge variant="secondary" className="text-gray-600">
          <Archive className="mr-1 h-3 w-3" />
          Inactive
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="text-green-600 bg-green-100">
        <CheckCircle className="mr-1 h-3 w-3" />
        Active
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="text-muted-foreground">
            Organize courses with hierarchical categories
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => { refetch(); refetchTree(); }}>
            <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => openCreateDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={queryState.search}
                  onChange={(e) => setQueryState(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="pl-10"
                />
              </div>

              <Select
                value={queryState.isActive === undefined ? 'all' : queryState.isActive.toString()}
                onValueChange={(value) => setQueryState(prev => ({ 
                  ...prev, 
                  isActive: value === 'all' ? undefined : value === 'true',
                  page: 1 
                }))}
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
                value={view}
                onValueChange={(value: 'tree' | 'table') => setView(value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tree">Tree</SelectItem>
                  <SelectItem value="table">Table</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FolderTree className="mr-2 h-5 w-5" />
              Categories
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedNodes(new Set(tree.map(node => node.id)))}
            >
              Expand All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {view === 'tree' ? (
            <div className="space-y-1">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : tree.length === 0 ? (
                <div className="text-center py-8">
                  <FolderTree className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No categories found</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => openCreateDialog()}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Category
                  </Button>
                </div>
              ) : (
                tree.map(node => renderTreeNode(node))
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><div className="h-4 w-40 animate-pulse bg-gray-200 rounded"></div></TableCell>
                        <TableCell><div className="h-4 w-32 animate-pulse bg-gray-200 rounded"></div></TableCell>
                        <TableCell><div className="h-4 w-20 animate-pulse bg-gray-200 rounded"></div></TableCell>
                        <TableCell><div className="h-4 w-16 animate-pulse bg-gray-200 rounded"></div></TableCell>
                        <TableCell><div className="h-4 w-12 animate-pulse bg-gray-200 rounded"></div></TableCell>
                        <TableCell><div className="h-4 w-24 animate-pulse bg-gray-200 rounded"></div></TableCell>
                        <TableCell><div className="h-4 w-4 animate-pulse bg-gray-200 rounded"></div></TableCell>
                      </TableRow>
                    ))
                  ) : categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <FolderTree className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No categories found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category: Category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {category.iconUrl ? (
                              <img src={category.iconUrl} alt="" className="h-6 w-6 rounded" />
                            ) : (
                              <div
                                className="h-6 w-6 rounded flex items-center justify-center"
                                style={{ backgroundColor: category.color }}
                              >
                                <Tag className="h-3 w-3 text-white" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{category.name}</span>
                                {category.isFeatured && (
                                  <Bookmark className="h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {category.slug}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {category.parentId ? 'Subcategory' : 'Root'}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(category)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{category.courseCount}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">Level {category.level}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(category.createdAt), 'MMM d, yyyy')}
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
                              <DropdownMenuItem onClick={() => openEditDialog(category)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedCategory(category);
                                setShowStatsDialog(true);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Stats
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedCategory(category);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Category Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category to organize your courses
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Category name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="category-slug"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Category description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parentId">Parent Category</Label>
                  <Select
                    value={formData.parentId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">No Parent (Root Category)</SelectItem>
                      {categories.filter(cat => cat.level < 3).map((category: Category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {'  '.repeat(category.level)}
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderIndex">Order Index</Label>
                  <Input
                    id="orderIndex"
                    type="number"
                    value={formData.orderIndex}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderIndex: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Level (Optional)</Label>
                <Input
                  id="level"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) || 0 }))}
                  placeholder="Auto-calculated from parent"
                />
                <p className="text-xs text-muted-foreground">
                  Leave as 0 for auto-calculation based on parent category
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showInMenu"
                    checked={formData.showInMenu}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showInMenu: checked }))}
                  />
                  <Label htmlFor="showInMenu">Show in Menu</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                  />
                  <Label htmlFor="isFeatured">Featured</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="iconUrl">Icon URL</Label>
                  <Input
                    id="iconUrl"
                    value={formData.iconUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, iconUrl: e.target.value }))}
                    placeholder="https://example.com/icon.png"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coverUrl">Cover Image URL</Label>
                  <Input
                    id="coverUrl"
                    value={formData.coverUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, coverUrl: e.target.value }))}
                    placeholder="https://example.com/cover.jpg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Preview Section */}
              <div className="rounded-lg border p-4 space-y-3">
                <Label>Preview</Label>
                <div className="space-y-3">
                  {/* Icon + Name Preview */}
                  <div className="flex items-center gap-3">
                    {formData.iconUrl ? (
                      <img
                        src={formData.iconUrl}
                        alt="Icon preview"
                        className="h-8 w-8 rounded object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        className="h-8 w-8 rounded flex items-center justify-center"
                        style={{ backgroundColor: formData.color }}
                      >
                        <Tag className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <span className="font-medium">
                      {formData.name || 'Category Name'}
                    </span>
                  </div>

                  {/* Cover Image Preview */}
                  {formData.coverUrl && (
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">Cover Image:</span>
                      <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={formData.coverUrl}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.parentElement!.innerHTML = 
                              '<div class="flex items-center justify-center h-full text-sm text-muted-foreground">Invalid image URL</div>';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoMeta.title}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    seoMeta: { ...prev.seoMeta, title: e.target.value }
                  }))}
                  placeholder="SEO title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoMeta.description}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    seoMeta: { ...prev.seoMeta, description: e.target.value }
                  }))}
                  placeholder="SEO description"
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update category information
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editName">Name *</Label>
                  <Input
                    id="editName"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Category name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editSlug">Slug *</Label>
                  <Input
                    id="editSlug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="category-slug"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Category description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editParentId">Parent Category</Label>
                  <Select
                    value={formData.parentId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">No Parent (Root Category)</SelectItem>
                      {categories.filter((cat: Category) => cat.level < 3 && cat.id !== selectedCategory?.id).map((category: Category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {'  '.repeat(category.level)}
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editOrderIndex">Order Index</Label>
                  <Input
                    id="editOrderIndex"
                    type="number"
                    value={formData.orderIndex}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderIndex: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editLevel">Level (Optional)</Label>
                <Input
                  id="editLevel"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) || 0 }))}
                  placeholder="Auto-calculated from parent"
                />
                <p className="text-xs text-muted-foreground">
                  Leave as 0 for auto-calculation based on parent category
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="editIsActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="editIsActive">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="editShowInMenu"
                    checked={formData.showInMenu}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showInMenu: checked }))}
                  />
                  <Label htmlFor="editShowInMenu">Show in Menu</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="editIsFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                  />
                  <Label htmlFor="editIsFeatured">Featured</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editIconUrl">Icon URL</Label>
                  <Input
                    id="editIconUrl"
                    value={formData.iconUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, iconUrl: e.target.value }))}
                    placeholder="https://example.com/icon.png"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editCoverUrl">Cover Image URL</Label>
                  <Input
                    id="editCoverUrl"
                    value={formData.coverUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, coverUrl: e.target.value }))}
                    placeholder="https://example.com/cover.jpg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editColor">Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="editColor"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Preview Section */}
              <div className="rounded-lg border p-4 space-y-3">
                <Label>Preview</Label>
                <div className="space-y-3">
                  {/* Icon + Name Preview */}
                  <div className="flex items-center gap-3">
                    {formData.iconUrl ? (
                      <img
                        src={formData.iconUrl}
                        alt="Icon preview"
                        className="h-8 w-8 rounded object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        className="h-8 w-8 rounded flex items-center justify-center"
                        style={{ backgroundColor: formData.color }}
                      >
                        <Tag className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <span className="font-medium">
                      {formData.name || 'Category Name'}
                    </span>
                  </div>

                  {/* Cover Image Preview */}
                  {formData.coverUrl && (
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">Cover Image:</span>
                      <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={formData.coverUrl}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.parentElement!.innerHTML = 
                              '<div class="flex items-center justify-center h-full text-sm text-muted-foreground">Invalid image URL</div>';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editSeoTitle">SEO Title</Label>
                <Input
                  id="editSeoTitle"
                  value={formData.seoMeta.title}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    seoMeta: { ...prev.seoMeta, title: e.target.value }
                  }))}
                  placeholder="SEO title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSeoDescription">SEO Description</Label>
                <Textarea
                  id="editSeoDescription"
                  value={formData.seoMeta.description}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    seoMeta: { ...prev.seoMeta, description: e.target.value }
                  }))}
                  placeholder="SEO description"
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCategory?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Stats Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Category Statistics</DialogTitle>
            <DialogDescription>
              Statistics for "{selectedCategory?.name}"
            </DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <CategoryStatsContent categoryId={selectedCategory.id} />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CategoryStatsContent({ categoryId }: { categoryId: string }) {
  const { data: statsData, isLoading } = useGetCategoryStatsQuery(categoryId);
  const stats = statsData?.stats;

  if (isLoading) {
    return <div className="text-center py-4">Loading stats...</div>;
  }

  if (!stats) {
    return <div className="text-center py-4">No statistics available</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{stats.totalCourses}</div>
        <div className="text-sm text-muted-foreground">Total Courses</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{stats.activeCourses}</div>
        <div className="text-sm text-muted-foreground">Active Courses</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">{stats.totalEnrollments}</div>
        <div className="text-sm text-muted-foreground">Total Enrollments</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-600">{stats.subcategories}</div>
        <div className="text-sm text-muted-foreground">Subcategories</div>
      </div>
    </div>
  );
}