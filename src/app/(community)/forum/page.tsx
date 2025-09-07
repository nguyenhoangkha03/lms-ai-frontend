'use client';

import React, { useState } from 'react';
import { Search, TrendingUp, MessageSquare, Users, Pin, Star, Activity, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forumApi } from '@/lib/redux/api/forum-api';
import { useAuth } from '@/hooks/use-auth';

// Import new components
import ThreadList from '@/components/communication/forum/ThreadList';
import ForumCategoryList from '@/components/communication/forum/ForumCategoryList';

const ForumPage: React.FC = () => {
  const router = useRouter();
  const { user, isStudent, isTeacher, isAdmin } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [activeTab, setActiveTab] = useState<'all' | 'questions' | 'discussions' | 'announcements'>('all');

  // API calls
  const { data: categories = [], isLoading: categoriesLoading } = forumApi.useGetCategoriesQuery();
  const { data: threadsResponse, isLoading: threadsLoading } = forumApi.useGetThreadsQuery({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    type: activeTab !== 'all' ? activeTab.slice(0, -1) : undefined, // Remove 's' from plural
    sort: sortBy,
    search: searchQuery,
  });
  const { data: stats, isLoading: statsLoading } = forumApi.useGetStatsQuery();

  const threads = threadsResponse?.threads || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search logic handled by RTK Query refetch
  };

  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category.id);
  };

  // Function to get back URL based on user type
  const getBackUrl = () => {
    if (isStudent) return '/student';
    if (isTeacher) return '/teacher';
    if (isAdmin) return '/admin';
    return '/'; // fallback
  };

  const handleBackClick = () => {
    router.push(getBackUrl());
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      {/* Back Button */}
      {user && (
        <div className="mb-4">
          <Button 
            variant="ghost" 
            onClick={handleBackClick}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {isStudent ? 'Student' : isTeacher ? 'Teacher' : isAdmin ? 'Admin' : ''} Dashboard
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
          <p className="mt-1 text-gray-600">
            Connect, learn, and share knowledge with our community
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/forum/create-thread">
              <MessageSquare className="mr-2 h-4 w-4" />
              New Thread
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search threads, posts, or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Trending</option>
              </select>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-3">
          {/* Thread Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Threads</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              <ThreadList
                threads={threads}
                isLoading={threadsLoading}
                showCategory={selectedCategory === 'all'}
                showPagination={true}
                sortBy={sortBy}
                onSortChange={(sort) => setSortBy(sort as any)}
                categoryId={selectedCategory !== 'all' ? selectedCategory : undefined}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Forum Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" />
                Forum Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {statsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                      <div className="h-4 w-12 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Threads</span>
                    <span className="font-medium">{stats?.totalThreads || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Posts</span>
                    <span className="font-medium">{stats?.totalPosts || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Users</span>
                    <span className="font-medium">{stats?.activeUsers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Today's Posts</span>
                    <span className="font-medium">{stats?.todayPosts || 0}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="h-4 w-4" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ForumCategoryList
                categories={categories}
                isLoading={categoriesLoading}
                compact={true}
                showStats={false}
                onCategorySelect={handleCategorySelect}
              />
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {threadsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                      <div className="h-3 w-24 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <ThreadList
                  threads={threads?.slice(0, 5) || []}
                  isLoading={false}
                  showCategory={false}
                  showPagination={false}
                  compact={true}
                />
              )}
            </CardContent>
          </Card>

          {/* Online Users */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Online Users
                <Badge variant="secondary" className="ml-auto">
                  {stats?.onlineUsers || 0}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {/* Mock online users - replace with real data */}
                {[1, 2, 3, 4, 5].map((i) => (
                  <Avatar key={i} className="h-8 w-8">
                    <AvatarFallback className="text-xs">U{i}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForumPage;