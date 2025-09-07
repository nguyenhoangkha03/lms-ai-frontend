'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Pin, 
  Lock,
  Settings,
  Star,
  Eye,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { forumApi } from '@/lib/redux/api/forum-api';
import ThreadList from '@/components/communication/forum/ThreadList';
import { Skeleton } from '@/components/ui/skeleton';

const CategoryDetailSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-20" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <Skeleton className="h-6 w-12 mx-auto mb-2" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-4">
          <Skeleton className="h-12 w-full" />
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const CategoryDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'popular' | 'pinned'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');

  // API calls
  const { 
    data: category, 
    isLoading: categoryLoading, 
    error: categoryError 
  } = forumApi.useGetCategoryBySlugQuery(slug);
  
  const { 
    data: threads = [], 
    isLoading: threadsLoading 
  } = forumApi.useGetThreadsQuery({
    category: category?.id,
    sort: sortBy,
    filter: activeTab !== 'all' ? activeTab : undefined,
  }, { skip: !category?.id });

  const { 
    data: categoryStats 
  } = forumApi.useGetCategoryStatsQuery(category?.id || '', { skip: !category?.id });

  const handleBack = () => {
    router.push('/forum');
  };

  if (categoryLoading) {
    return <CategoryDetailSkeleton />;
  }

  if (categoryError || !category) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Category Not Found</h3>
            <p className="text-gray-600 mb-6">
              The category you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Forum
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getCategoryIcon = () => {
    if (category.isPrivate) return <Lock className="h-5 w-5 text-amber-600" />;
    return <MessageSquare className="h-5 w-5 text-blue-600" />;
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" onClick={handleBack} className="mt-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${category.color}20` }}
            >
              {getCategoryIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
                {category.isFeatured && <Star className="h-5 w-5 text-amber-500 fill-amber-500" />}
                {category.isPrivate && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    Private
                  </Badge>
                )}
              </div>
              {category.description && (
                <p className="text-gray-600 mt-1">{category.description}</p>
              )}
            </div>
          </div>
        </div>

        <Button asChild>
          <Link href={`/forum/create-thread?categoryId=${category.id}`}>
            <Plus className="mr-2 h-4 w-4" />
            New Thread
          </Link>
        </Button>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                {category.threadCount}
              </span>
            </div>
            <p className="text-sm text-gray-600">Threads</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                {category.postCount}
              </span>
            </div>
            <p className="text-sm text-gray-600">Posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">
                {categoryStats?.activeUsers || 0}
              </span>
            </div>
            <p className="text-sm text-gray-600">Active Users</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">
                {categoryStats?.totalViews || 0}
              </span>
            </div>
            <p className="text-sm text-gray-600">Views</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-3">
          {/* Threads Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Threads</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="pinned">Pinned</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              <ThreadList
                threads={threads}
                isLoading={threadsLoading}
                showCategory={false} // We're already in a category
                showPagination={true}
                sortBy={sortBy}
                onSortChange={(sort) => setSortBy(sort as any)}
                categoryId={category.id}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="h-4 w-4" />
                Category Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">
                    {new Date(category.createdAt || '').toLocaleDateString()}
                  </span>
                </div>
                {category.lastActivityAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Activity</span>
                    <span className="font-medium">
                      {new Date(category.lastActivityAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Access</span>
                  <span className="font-medium">
                    {category.isPrivate ? 'Private' : 'Public'}
                  </span>
                </div>
                {category.requiresApproval && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posts</span>
                    <span className="font-medium">Requires Approval</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Threads */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ThreadList
                threads={threads?.slice(0, 5) || []}
                isLoading={false}
                showCategory={false}
                showPagination={false}
                compact={true}
              />
            </CardContent>
          </Card>

          {/* Popular Tags */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="h-4 w-4" />
                Popular Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {/* Mock tags - replace with real data */}
                {['javascript', 'react', 'help', 'discussion', 'question'].map((tag) => (
                  <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-gray-100">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Moderators */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Moderators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Mock moderators - replace with real data */}
                {['Admin', 'Moderator1', 'Moderator2'].map((mod, index) => (
                  <div key={mod} className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                      {mod[0]}
                    </div>
                    <span>{mod}</span>
                    {index === 0 && (
                      <Badge variant="secondary" className="text-xs">Admin</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailPage;