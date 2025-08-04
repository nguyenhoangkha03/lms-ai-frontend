'use client';

import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Grip,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
} from 'lucide-react';
import {
  useGetCategoriesQuery,
  useGetCategoryHierarchyQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '@/lib/redux/api/content-management-api';
import { Category, CategoriesQueryParams } from '@/types/content-management';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CategoryManagementProps {
  onCategorySelected?: (categoryId: string) => void;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  iconUrl: string;
  coverUrl: string;
  color: string;
  orderIndex: number;
  parentId: string;
  isActive: boolean;
  showInMenu: boolean;
  isFeatured: boolean;
  seoMeta: {
    title: string;
    description: string;
    keywords: string[];
  };
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({
  onCategorySelected,
}) => {
  const { toast } = useToast();

  // State management
  const [queryParams, setQueryParams] = useState<CategoriesQueryParams>({
    page: 1,
    limit: 50,
    sortBy: 'orderIndex',
    sortOrder: 'asc',
  });
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<Category | null>(
    null
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('tree');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    iconUrl: '',
    coverUrl: '',
    color: '#3b82f6',
    orderIndex: 0,
    parentId: '',
    isActive: true,
    showInMenu: true,
    isFeatured: false,
    seoMeta: {
      title: '',
      description: '',
      keywords: [],
    },
  });

  // API queries
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategoriesQuery(queryParams);

  const { data: categoryHierarchy, isLoading: hierarchyLoading } =
    useGetCategoryHierarchyQuery();

  // API mutations
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  // Handlers
  const handleCreateCategory = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      iconUrl: '',
      coverUrl: '',
      color: '#3b82f6',
      orderIndex: 0,
      parentId: '',
      isActive: true,
      showInMenu: true,
      isFeatured: false,
      seoMeta: {
        title: '',
        description: '',
        keywords: [],
      },
    });
    setShowCategoryDialog(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      iconUrl: category.iconUrl || '',
      coverUrl: category.coverUrl || '',
      color: category.color || '#3b82f6',
      orderIndex: category.orderIndex,
      parentId: category.parentId || '',
      isActive: category.isActive,
      showInMenu: category.showInMenu,
      isFeatured: category.isFeatured,
      seoMeta: {
        title: category.seoMeta?.title || '',
        description: category.seoMeta?.description || '',
        keywords: category.seoMeta?.keywords || [],
      },
    });
    setShowCategoryDialog(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setShowDeleteDialog(category);
  };

  const handleSubmitCategory = async () => {
    try {
      const categoryData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name),
      };

      if (editingCategory) {
        await updateCategory({
          id: editingCategory.id,
          data: categoryData,
        }).unwrap();

        toast({
          title: 'Category updated successfully',
          description: 'The category has been updated.',
        });
      } else {
        await createCategory(categoryData).unwrap();

        toast({
          title: 'Category created successfully',
          description: 'The new category has been created.',
        });
      }

      setShowCategoryDialog(false);
      setEditingCategory(null);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to save category',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!showDeleteDialog) return;

    try {
      await deleteCategory(showDeleteDialog.id).unwrap();

      toast({
        title: 'Category deleted successfully',
        description: 'The category has been removed.',
      });

      setShowDeleteDialog(null);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to delete category',
        variant: 'destructive',
      });
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategoryTree = (categories: Category[], level = 0) => {
    return categories.map(category => (
      <div key={category.id} className="select-none">
        <div
          className={`flex items-center gap-2 rounded-lg p-2 hover:bg-muted/50 ${
            level > 0 ? `ml-${level * 6}` : ''
          }`}
          style={{ marginLeft: level * 24 }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => toggleCategoryExpansion(category.id)}
            disabled={!category.children || category.children.length === 0}
          >
            {category.children && category.children.length > 0 ? (
              expandedCategories.has(category.id) ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )
            ) : (
              <div className="h-3 w-3" />
            )}
          </Button>

          <div className="flex flex-1 items-center gap-2">
            {category.iconUrl ? (
              <img
                src={category.iconUrl}
                alt={category.name}
                className="h-5 w-5 rounded"
              />
            ) : (
              <div
                className="flex h-5 w-5 items-center justify-center rounded"
                style={{ backgroundColor: category.color || '#3b82f6' }}
              >
                <Folder className="h-3 w-3 text-white" />
              </div>
            )}

            <span className="font-medium">{category.name}</span>

            <div className="flex items-center gap-1">
              {category.isFeatured && (
                <Star className="h-3 w-3 text-yellow-500" />
              )}
              {!category.isActive && (
                <EyeOff className="h-3 w-3 text-muted-foreground" />
              )}
              <Badge variant="secondary" className="text-xs">
                {category.courseCount}
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateCategory()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Subcategory
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteCategory(category)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {category.children &&
          category.children.length > 0 &&
          expandedCategories.has(category.id) && (
            <div className="ml-6">
              {renderCategoryTree(category.children, level + 1)}
            </div>
          )}
      </div>
    ));
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex items-center gap-3">
            {category.iconUrl ? (
              <img
                src={category.iconUrl}
                alt={category.name}
                className="h-8 w-8 rounded"
              />
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded"
                style={{ backgroundColor: category.color || '#3b82f6' }}
              >
                <Folder className="h-4 w-4 text-white" />
              </div>
            )}
            <div>
              <div className="font-medium">{category.name}</div>
              <div className="text-sm text-muted-foreground">
                {category.slug}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'level',
      header: 'Level',
      cell: ({ row }) => (
        <Badge variant="outline">Level {row.original.level}</Badge>
      ),
    },
    {
      accessorKey: 'courseCount',
      header: 'Courses',
      cell: ({ row }) => (
        <div className="text-center">
          <Badge variant="secondary">{row.original.courseCount}</Badge>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex items-center gap-2">
            <Badge variant={category.isActive ? 'default' : 'secondary'}>
              {category.isActive ? 'Active' : 'Inactive'}
            </Badge>
            {category.isFeatured && (
              <Badge variant="outline" className="text-yellow-600">
                <Star className="mr-1 h-3 w-3" />
                Featured
              </Badge>
            )}
            {category.showInMenu && <Badge variant="outline">In Menu</Badge>}
          </div>
        );
      },
    },
    {
      accessorKey: 'orderIndex',
      header: 'Order',
      cell: ({ row }) => (
        <div className="text-center font-mono">{row.original.orderIndex}</div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const category = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onCategorySelected?.(category.id)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Courses
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteCategory(category)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Category Management
          </h2>
          <p className="text-muted-foreground">
            Organize your courses with hierarchical categories
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border">
            <Button
              variant={viewMode === 'tree' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('tree')}
            >
              <FolderOpen className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <Grip className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={handleCreateCategory}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Categories</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
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
            <div className="mb-4 space-y-4 rounded-lg border p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label>Status</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="0">Root</SelectItem>
                      <SelectItem value="1">Level 1</SelectItem>
                      <SelectItem value="2">Level 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Featured</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="featured">Featured Only</SelectItem>
                      <SelectItem value="regular">Regular Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'tree' ? (
            <div className="space-y-2">
              {hierarchyLoading ? (
                <div>Loading categories...</div>
              ) : categoryHierarchy && categoryHierarchy.length > 0 ? (
                renderCategoryTree(categoryHierarchy)
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No categories found. Create your first category to get
                  started.
                </div>
              )}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={categoriesData?.categories || []}
              loading={categoriesLoading}
              pagination={{
                pageIndex: queryParams.page! - 1,
                pageSize: queryParams.limit!,
                pageCount: categoriesData?.totalPages || 0,
                onPageChange: page =>
                  setQueryParams(prev => ({ ...prev, page: page + 1 })),
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Category Form Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Update the category information below.'
                : 'Fill in the details to create a new category.'}
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
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        name: e.target.value,
                        slug: generateSlug(e.target.value),
                      }))
                    }
                    placeholder="Category name"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="category-slug"
                  />
                </div>
              </div>

              <div>
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
                  placeholder="Category description..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parentId">Parent Category</Label>
                  <Select
                    value={formData.parentId}
                    onValueChange={value =>
                      setFormData(prev => ({ ...prev, parentId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Root Category</SelectItem>
                      {categoryHierarchy?.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="orderIndex">Order Index</Label>
                  <Input
                    id="orderIndex"
                    type="number"
                    value={formData.orderIndex}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        orderIndex: parseInt(e.target.value),
                      }))
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Active</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={checked =>
                      setFormData(prev => ({ ...prev, isActive: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="showInMenu">Show in Menu</Label>
                  <Switch
                    id="showInMenu"
                    checked={formData.showInMenu}
                    onCheckedChange={checked =>
                      setFormData(prev => ({ ...prev, showInMenu: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isFeatured">Featured</Label>
                  <Switch
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={checked =>
                      setFormData(prev => ({ ...prev, isFeatured: checked }))
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4">
              <div>
                <Label htmlFor="iconUrl">Icon URL</Label>
                <Input
                  id="iconUrl"
                  value={formData.iconUrl}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, iconUrl: e.target.value }))
                  }
                  placeholder="https://example.com/icon.png"
                />
              </div>

              <div>
                <Label htmlFor="coverUrl">Cover Image URL</Label>
                <Input
                  id="coverUrl"
                  value={formData.coverUrl}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, coverUrl: e.target.value }))
                  }
                  placeholder="https://example.com/cover.jpg"
                />
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, color: e.target.value }))
                    }
                    className="h-10 w-16"
                  />
                  <Input
                    value={formData.color}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, color: e.target.value }))
                    }
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <Label>Preview</Label>
                <div className="mt-2 flex items-center gap-3">
                  {formData.iconUrl ? (
                    <img
                      src={formData.iconUrl}
                      alt="Preview"
                      className="h-8 w-8 rounded"
                    />
                  ) : (
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded"
                      style={{ backgroundColor: formData.color }}
                    >
                      <Folder className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <span className="font-medium">
                    {formData.name || 'Category Name'}
                  </span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <div>
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoMeta.title}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      seoMeta: { ...prev.seoMeta, title: e.target.value },
                    }))
                  }
                  placeholder="SEO optimized title"
                />
              </div>

              <div>
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoMeta.description}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      seoMeta: { ...prev.seoMeta, description: e.target.value },
                    }))
                  }
                  placeholder="SEO meta description..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="seoKeywords">Keywords (comma separated)</Label>
                <Input
                  id="seoKeywords"
                  value={formData.seoMeta.keywords.join(', ')}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      seoMeta: {
                        ...prev.seoMeta,
                        keywords: e.target.value
                          .split(',')
                          .map(k => k.trim())
                          .filter(Boolean),
                      },
                    }))
                  }
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCategoryDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitCategory}
              disabled={!formData.name.trim()}
            >
              {editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!showDeleteDialog}
        onOpenChange={() => setShowDeleteDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{showDeleteDialog?.name}"? This
              action cannot be undone.
              {showDeleteDialog!.courseCount! > 0 && (
                <Alert className="mt-2">
                  <AlertDescription>
                    This category contains {showDeleteDialog!.courseCount!}{' '}
                    courses. They will need to be reassigned to other
                    categories.
                  </AlertDescription>
                </Alert>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManagement;
