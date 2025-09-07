'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageSquare,
  Eye,
  ArrowUp,
  ArrowDown,
  Pin,
  Lock,
  CheckCircle,
  TrendingUp,
  Calendar,
  User,
  Tag
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

import { ForumThread } from '@/lib/types/forum';

interface ThreadListProps {
  threads?: ForumThread[];
  isLoading?: boolean;
  showCategory?: boolean;
  showPagination?: boolean;
  onLoadMore?: () => void;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
  categoryId?: string;
  compact?: boolean;
}

interface ThreadItemProps {
  thread: ForumThread;
  showCategory?: boolean;
  compact?: boolean;
}

const ThreadItem: React.FC<ThreadItemProps> = ({ 
  thread, 
  showCategory = true, 
  compact = false 
}) => {
  const getThreadTypeIcon = (type: string) => {
    switch (type) {
      case 'question':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'announcement':
        return <TrendingUp className="h-4 w-4 text-purple-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getThreadTypeBadge = (type: string) => {
    switch (type) {
      case 'question':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Question</Badge>;
      case 'announcement':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Announcement</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Discussion</Badge>;
    }
  };

  const getStatusIcon = () => {
    if (thread.isLocked) return <Lock className="h-3 w-3 text-red-500" />;
    if (thread.isResolved && thread.type === 'question') return <CheckCircle className="h-3 w-3 text-green-500" />;
    return null;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-2 border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <div className="flex-shrink-0">
          {getThreadTypeIcon(thread.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <Link 
            href={`/forum/threads/${thread.slug}`}
            className="block hover:text-blue-600 transition-colors"
          >
            <div className="flex items-center gap-2">
              {thread.isPinned && <Pin className="h-3 w-3 text-amber-500" />}
              <span className={`font-medium truncate ${thread.isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
                {thread.title}
              </span>
              {getStatusIcon()}
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 flex-shrink-0">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            <span>{thread.replyCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowUp className="h-3 w-3" />
            <span>{thread.upvoteCount}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 mt-1">
              {getThreadTypeIcon(thread.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {thread.isPinned && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Pin className="h-4 w-4 text-amber-500" />
                      </TooltipTrigger>
                      <TooltipContent>Pinned Thread</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {getThreadTypeBadge(thread.type)}
                {showCategory && (
                  <Badge variant="secondary" className="text-xs">
                    {/* Category name would come from category data */}
                    Category
                  </Badge>
                )}
                {getStatusIcon()}
              </div>

              <Link 
                href={`/forum/threads/${thread.slug}`}
                className="block group"
              >
                <h3 className={`text-lg font-semibold group-hover:text-blue-600 transition-colors mb-2 ${
                  thread.isLocked ? 'text-gray-500' : 'text-gray-900'
                }`}>
                  {thread.title}
                </h3>
              </Link>

              {thread.summary && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {thread.summary}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>Author</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}</span>
                </div>
                {thread.lastActivityAt !== thread.createdAt && (
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>Last reply {formatDistanceToNow(new Date(thread.lastActivityAt), { addSuffix: true })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Thread Stats */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-center">
              <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                <ArrowUp className="h-3 w-3 text-green-600" />
                <span>{thread.upvoteCount}</span>
                <ArrowDown className="h-3 w-3 text-red-600" />
                <span>{thread.downvoteCount}</span>
              </div>
              <div className="text-xs text-gray-500">votes</div>
            </div>

            <div className="text-center">
              <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                <MessageSquare className="h-3 w-3" />
                <span>{thread.replyCount}</span>
              </div>
              <div className="text-xs text-gray-500">replies</div>
            </div>

            <div className="text-center">
              <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                <Eye className="h-3 w-3" />
                <span>{thread.viewCount}</span>
              </div>
              <div className="text-xs text-gray-500">views</div>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

const ThreadListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <Skeleton className="h-4 w-4 mt-1" />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-8 w-12" />
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

export const ThreadList: React.FC<ThreadListProps> = ({
  threads = [],
  isLoading = false,
  showCategory = true,
  showPagination = true,
  onLoadMore,
  sortBy = 'recent',
  onSortChange,
  categoryId,
  compact = false,
}) => {
  const [currentSort, setCurrentSort] = useState(sortBy);

  const handleSortChange = (newSort: string) => {
    setCurrentSort(newSort);
    onSortChange?.(newSort);
  };

  if (isLoading) {
    return <ThreadListSkeleton count={compact ? 10 : 5} />;
  }

  if (!threads.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No threads found</h3>
          <p className="text-gray-600 mb-6">
            {categoryId 
              ? "There are no threads in this category yet." 
              : "Be the first to start a discussion!"
            }
          </p>
          <Button asChild>
            <Link href="/forum/create-thread">
              <MessageSquare className="mr-2 h-4 w-4" />
              Start New Thread
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      {!compact && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Showing {threads.length} threads</span>
          </div>
          
          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="most-replies">Most Replies</SelectItem>
              <SelectItem value="most-votes">Most Votes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Thread List */}
      <div className={compact ? "space-y-0" : "space-y-4"}>
        {threads.map((thread) => (
          <ThreadItem
            key={thread.id}
            thread={thread}
            showCategory={showCategory}
            compact={compact}
          />
        ))}
      </div>

      {/* Load More */}
      {showPagination && onLoadMore && (
        <div className="flex justify-center pt-6">
          <Button variant="outline" onClick={onLoadMore}>
            Load More Threads
          </Button>
        </div>
      )}
    </div>
  );
};

export default ThreadList;