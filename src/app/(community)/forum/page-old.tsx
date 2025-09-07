'use client';

import React, { useState } from 'react';
import { Search, TrendingUp, MessageSquare, Users, Pin, Star, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { useAppDispatch } from '@/lib/redux/hooks';
import { forumApi } from '@/lib/redux/api/forum-api';
import { ForumCategory } from '@/lib/types/forum';

// Import new components
import ThreadList from '@/components/communication/forum/ThreadList';
import ForumCategoryList from '@/components/communication/forum/ForumCategoryList';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  threadCount: number;
  postCount: number;
  lastActivityAt: string;
  lastPostId: string;
  lastPostUserId: string;
  isPrivate: boolean;
  isFeatured: boolean;
}

interface Thread {
  id: string;
  title: string;
  slug: string;
  summary: string;
  authorId: string;
  categoryId: string;
  type: 'question' | 'discussion' | 'announcement';
  status: 'active' | 'closed' | 'locked';
  isPinned: boolean;
  isFeatured: boolean;
  isResolved: boolean;
  acceptedAnswerId?: string;
  viewCount: number;
  replyCount: number;
  upvoteCount: number;
  downvoteCount: number;
  score: number;
  lastActivityAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    reputation: number;
  };
  category: {
    name: string;
    color: string;
  };
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

interface ForumStats {
  totalThreads: number;
  totalPosts: number;
  totalUsers: number;
  todayPosts: number;
  activeUsers: number;
  topContributors: Array<{
    id: string;
    name: string;
    avatar?: string;
    postCount: number;
    reputation: number;
  }>;
}

export default function ForumMainPage() {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>(
    'recent'
  );
  const [activeTab, setActiveTab] = useState<
    'all' | 'question' | 'discussion' | 'announcement'
  >('all');

  // RTK Query hooks
  const { data: categories, isLoading: categoriesLoading } =
    forumApi.useGetCategoriesQuery();
  const { data: threads, isLoading: threadsLoading } =
    forumApi.useGetThreadsQuery({
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      type: activeTab !== 'all' ? activeTab : undefined,
      sort: sortBy,
      search: searchQuery,
    });
  const { data: stats, isLoading: statsLoading } = forumApi.useGetStatsQuery();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search logic handled by RTK Query refetch
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getThreadTypeColor = (type: string) => {
    switch (type) {
      case 'question':
        return 'bg-blue-100 text-blue-800';
      case 'discussion':
        return 'bg-green-100 text-green-800';
      case 'announcement':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
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
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-4 lg:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search threads, posts, or users..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                <option value="all">All Categories</option>
                {categories?.map((category: ForumCategory) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
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
          <Tabs
            value={activeTab}
            onValueChange={value => setActiveTab(value as any)}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Threads</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
              <TabsTrigger value="announcements">Announcements</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {threadsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                        <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                threads?.map((thread: Thread) => (
                  <Card
                    key={thread.id}
                    className="transition-shadow hover:shadow-md"
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Thread Info */}
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            {thread.isPinned && (
                              <Pin className="h-4 w-4 text-blue-600" />
                            )}
                            <Badge
                              variant="secondary"
                              className={getThreadTypeColor(thread.type)}
                            >
                              {thread.type}
                            </Badge>
                            {thread.isResolved && (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700"
                              >
                                Resolved
                              </Badge>
                            )}
                            <span
                              style={{ backgroundColor: thread.category.color }}
                              className="rounded px-2 py-1 text-xs text-white"
                            >
                              {thread.category.name}
                            </span>
                          </div>

                          <Link
                            href={`/forum/threads/${thread.slug}`}
                            className="transition-colors hover:text-blue-600"
                          >
                            <h3 className="mb-1 text-lg font-semibold">
                              {thread.title}
                            </h3>
                          </Link>

                          <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                            {thread.summary}
                          </p>

                          {/* Tags */}
                          {thread.tags.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-1">
                              {thread.tags.map(tag => (
                                <Badge
                                  key={tag.id}
                                  variant="outline"
                                  style={{
                                    borderColor: tag.color,
                                    color: tag.color,
                                  }}
                                  className="text-xs"
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Thread Stats */}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              <span>{thread.score} score</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              <span>{thread.replyCount} replies</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{thread.viewCount} views</span>
                            </div>
                          </div>
                        </div>

                        {/* Author Info */}
                        <div className="flex min-w-[120px] flex-col items-center text-center">
                          <Avatar className="mb-2 h-10 w-10">
                            <AvatarImage src={thread.author.avatar} />
                            <AvatarFallback>
                              {thread.author.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <Link
                            href={`/forum/users/${thread.author.id}`}
                            className="text-sm font-medium hover:text-blue-600"
                          >
                            {thread.author.name}
                          </Link>
                          <div className="mt-1 text-xs text-gray-500">
                            {thread.author.reputation} rep
                          </div>
                          <div className="mt-1 text-xs text-gray-400">
                            {formatTimeAgo(thread.lastActivityAt)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Forum Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Forum Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {statsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="h-4 animate-pulse rounded bg-gray-200"
                    ></div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Threads</span>
                    <span className="font-medium">
                      {stats?.totalThreads || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Posts</span>
                    <span className="font-medium">
                      {stats?.totalPosts || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Users</span>
                    <span className="font-medium">
                      {stats?.activeUsers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Today's Posts</span>
                    <span className="font-medium text-green-600">
                      {stats?.todayPosts || 0}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categoriesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="h-8 animate-pulse rounded bg-gray-200"
                    ></div>
                  ))}
                </div>
              ) : (
                categories?.map((category: ForumCategory) => (
                  <Link
                    key={category.id}
                    href={`/forum/categories/${category.slug}`}
                    className="flex items-center justify-between rounded p-2 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="text-sm font-medium">
                        {category.name}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {category.threadCount} threads
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Top Contributors */}
          <Card>
            <CardHeader>
              <CardTitle>Top Contributors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats?.topContributors?.map((contributor, index) => (
                <div key={contributor.id} className="flex items-center gap-3">
                  <div className="w-4 text-sm font-medium text-gray-500">
                    #{index + 1}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={contributor.avatar} />
                    <AvatarFallback>
                      {contributor.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Link
                      href={`/forum/users/${contributor.id}`}
                      className="text-sm font-medium hover:text-blue-600"
                    >
                      {contributor.name}
                    </Link>
                    <div className="text-xs text-gray-500">
                      {contributor.postCount} posts • {contributor.reputation}{' '}
                      rep
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
