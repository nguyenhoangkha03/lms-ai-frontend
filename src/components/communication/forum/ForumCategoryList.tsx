'use client';

import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageSquare,
  Users,
  Lock,
  Star,
  ChevronRight,
  Folder,
  FolderOpen,
  TrendingUp,
  Pin
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { ForumCategory } from '@/lib/types/forum';

interface ForumCategoryListProps {
  categories?: ForumCategory[];
  isLoading?: boolean;
  showHierarchy?: boolean;
  showStats?: boolean;
  compact?: boolean;
  onCategorySelect?: (category: ForumCategory) => void;
}

interface CategoryItemProps {
  category: ForumCategory;
  showStats?: boolean;
  compact?: boolean;
  level?: number;
  onCategorySelect?: (category: ForumCategory) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  showStats = true,
  compact = false,
  level = 0,
  onCategorySelect,
}) => {
  const handleClick = () => {
    onCategorySelect?.(category);
  };

  const CategoryIcon = ({ isOpen = false }: { isOpen?: boolean }) => {
    if (category.isPrivate) return <Lock className="h-4 w-4 text-amber-600" />;
    if (isOpen) return <FolderOpen className="h-4 w-4 text-blue-600" />;
    return <Folder className="h-4 w-4 text-blue-600" />;
  };

  const getCategoryColor = () => {
    if (category.color && category.color !== '#3B82F6') {
      return {
        borderColor: category.color,
        backgroundColor: `${category.color}10`,
      };
    }
    return {};
  };

  if (compact) {
    return (
      <div 
        className={`flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
          level > 0 ? `ml-${level * 4}` : ''
        }`}
        onClick={handleClick}
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
      >
        <CategoryIcon />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {category.isFeatured && <Star className="h-3 w-3 text-amber-500" />}
            <span className="font-medium text-sm truncate">{category.name}</span>
            {category.isPrivate && (
              <Badge variant="outline" className="text-xs">Private</Badge>
            )}
          </div>
          {category.description && (
            <p className="text-xs text-gray-500 truncate">{category.description}</p>
          )}
        </div>
        <div className="text-xs text-gray-400 flex-shrink-0">
          {category.threadCount}
        </div>
      </div>
    );
  }

  return (
    <Link href={`/forum/categories/${category.slug}`} onClick={handleClick}>
      <Card 
        className="hover:shadow-md transition-all duration-200 hover:scale-[1.02]" 
        style={getCategoryColor()}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex-shrink-0 mt-1">
                <CategoryIcon />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    {category.name}
                  </CardTitle>
                  
                  {category.isFeatured && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        </TooltipTrigger>
                        <TooltipContent>Featured Category</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {category.isPrivate && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Private
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>Requires permission to access</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>

                {category.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {category.description}
                  </p>
                )}

                {/* Last Activity */}
                {category.lastActivityAt && showStats && (
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>Last activity {formatDistanceToNow(new Date(category.lastActivityAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Category Stats */}
            {showStats && (
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                    <MessageSquare className="h-3 w-3" />
                    <span>{category.threadCount}</span>
                  </div>
                  <div className="text-xs text-gray-500">threads</div>
                </div>

                <div className="text-center">
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                    <TrendingUp className="h-3 w-3" />
                    <span>{category.postCount}</span>
                  </div>
                  <div className="text-xs text-gray-500">posts</div>
                </div>

                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            )}
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
};

const CategoryListSkeleton: React.FC<{ count?: number; compact?: boolean }> = ({ 
  count = 6, 
  compact = false 
}) => {
  if (compact) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 py-2 px-3">
            <Skeleton className="h-4 w-4" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Skeleton className="h-4 w-4 mt-1" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

// Hierarchy helper function
const buildCategoryHierarchy = (categories: ForumCategory[]): ForumCategory[] => {
  const categoryMap = new Map<string, ForumCategory & { children: ForumCategory[] }>();
  const rootCategories: (ForumCategory & { children: ForumCategory[] })[] = [];

  // Create enhanced categories with children array
  categories.forEach(category => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  // Build hierarchy
  categories.forEach(category => {
    const enhancedCategory = categoryMap.get(category.id)!;
    if (category.parentId && categoryMap.has(category.parentId)) {
      categoryMap.get(category.parentId)!.children.push(enhancedCategory);
    } else {
      rootCategories.push(enhancedCategory);
    }
  });

  // Sort by displayOrder
  const sortCategories = (cats: (ForumCategory & { children: ForumCategory[] })[]) => {
    cats.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    cats.forEach(cat => sortCategories(cat.children));
  };

  sortCategories(rootCategories);
  
  // Flatten for rendering
  const flattenCategories = (
    cats: (ForumCategory & { children: ForumCategory[] })[], 
    level = 0
  ): ForumCategory[] => {
    const result: ForumCategory[] = [];
    cats.forEach(cat => {
      result.push({ ...cat, level } as ForumCategory);
      result.push(...flattenCategories(cat.children, level + 1));
    });
    return result;
  };

  return flattenCategories(rootCategories);
};

export const ForumCategoryList: React.FC<ForumCategoryListProps> = ({
  categories = [],
  isLoading = false,
  showHierarchy = false,
  showStats = true,
  compact = false,
  onCategorySelect,
}) => {
  if (isLoading) {
    return <CategoryListSkeleton count={compact ? 8 : 6} compact={compact} />;
  }

  if (!categories.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-600">
            Categories will appear here once they are created.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Process categories for hierarchy if needed
  const processedCategories = showHierarchy 
    ? buildCategoryHierarchy(categories)
    : [...categories].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  // Separate featured and regular categories
  const featuredCategories = processedCategories.filter(cat => cat.isFeatured);
  const regularCategories = processedCategories.filter(cat => !cat.isFeatured);

  if (compact) {
    return (
      <div className="space-y-1">
        {featuredCategories.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Star className="h-3 w-3 text-amber-500" />
              Featured
            </h4>
            {featuredCategories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                showStats={showStats}
                compact={compact}
                level={category.level || 0}
                onCategorySelect={onCategorySelect}
              />
            ))}
          </div>
        )}
        
        {regularCategories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            showStats={showStats}
            compact={compact}
            level={category.level || 0}
            onCategorySelect={onCategorySelect}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Featured Categories */}
      {featuredCategories.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Featured Categories
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredCategories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                showStats={showStats}
                compact={compact}
                onCategorySelect={onCategorySelect}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Categories */}
      {regularCategories.length > 0 && (
        <div>
          {featuredCategories.length > 0 && (
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              All Categories
            </h3>
          )}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {regularCategories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                showStats={showStats}
                compact={compact}
                level={category.level || 0}
                onCategorySelect={onCategorySelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumCategoryList;