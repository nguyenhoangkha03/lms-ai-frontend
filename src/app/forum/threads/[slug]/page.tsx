'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Share2,
  Flag,
  Award,
  Lock,
  Pin,
  Eye,
  Calendar,
  CheckCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Reply,
  Heart,
  Bookmark,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { forumApi } from '@/lib/redux/api/forum-api';
import { ForumPost } from '@/lib/types/forum';

interface ThreadDetail {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  contentHtml: string;
  authorId: string;
  categoryId: string;
  type: 'question' | 'discussion' | 'announcement';
  status: 'active' | 'closed' | 'locked';
  isPinned: boolean;
  isFeatured: boolean;
  isLocked: boolean;
  isResolved: boolean;
  acceptedAnswerId?: string;
  viewCount: number;
  replyCount: number;
  upvoteCount: number;
  downvoteCount: number;
  score: number;
  lastActivityAt: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    reputation: number;
    badges: Array<{
      name: string;
      color: string;
      icon: string;
    }>;
  };
  category: {
    id: string;
    name: string;
    color: string;
  };
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  userVote?: 'up' | 'down' | null;
  isBookmarked: boolean;
}

interface Post {
  id: string;
  threadId: string;
  authorId: string;
  parentId?: string;
  content: string;
  contentHtml: string;
  type: 'answer' | 'comment';
  status: 'active' | 'hidden' | 'deleted';
  isAccepted: boolean;
  isEdited: boolean;
  editedAt?: string;
  editReason?: string;
  upvoteCount: number;
  downvoteCount: number;
  score: number;
  helpfulCount: number;
  replyCount: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    reputation: number;
    badges: Array<{
      name: string;
      color: string;
      icon: string;
    }>;
  };
  userVote?: 'up' | 'down' | null;
  isHelpful?: boolean;
  replies?: Post[];
}

export default function ThreadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  const [newReply, setNewReply] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [sortBy, setSortBy] = useState<'oldest' | 'newest' | 'score'>('oldest');

  // RTK Query hooks
  const {
    data: thread,
    isLoading: threadLoading,
    error,
  } = forumApi.useGetThreadBySlugQuery(params.slug as string);
  const { data: posts, isLoading: postsLoading } =
    forumApi.useGetThreadPostsQuery(
      {
        threadId: thread?.id,
        sort: sortBy,
      },
      { skip: !thread?.id }
    );

  const [voteOnThread] = forumApi.useVoteOnThreadMutation();
  const [voteOnPost] = forumApi.useVoteOnPostMutation();
  const [createPost] = forumApi.useCreatePostMutation();
  const [acceptAnswer] = forumApi.useAcceptAnswerMutation();
  const [reportPost] = forumApi.useReportPostMutation();
  const [bookmarkThread] = forumApi.useBookmarkThreadMutation();

  const handleVote = async (
    type: 'up' | 'down',
    targetId: string,
    targetType: 'thread' | 'post'
  ) => {
    try {
      if (targetType === 'thread') {
        await voteOnThread({ threadId: targetId, voteType: type }).unwrap();
      } else {
        await voteOnPost({ postId: targetId, voteType: type }).unwrap();
      }
      toast(
        <div>
          <strong className="font-semibold">Vote recorded</strong>
          <div>Your {type}vote has been recorded.</div>
        </div>
      );
    } catch (error) {
      toast(
        <div>
          <strong className="font-semibold">Error</strong>
          <div>Failed to record vote. Please try again.</div>
        </div>
      );
    }
  };

  const handleCreateReply = async () => {
    if (!newReply.trim()) return;

    try {
      await createPost({
        threadId: thread!.id,
        content: newReply,
        type: 'answer',
        parentId: replyingTo!,
      }).unwrap();

      setNewReply('');
      setReplyingTo(null);
      toast(
        <div>
          <strong className="font-semibold">Reply posted</strong>
          <div>Your reply has been posted successfully.</div>
        </div>
      );
    } catch (error) {
      toast(
        <div>
          <strong className="font-semibold">Error</strong>
          <div>Failed to post reply. Please try again.</div>
        </div>
      );
    }
  };

  const handleAcceptAnswer = async (postId: string) => {
    try {
      await acceptAnswer({ threadId: thread!.id, postId }).unwrap();
      toast(
        <div>
          <strong className="font-semibold">Answer accepted</strong>
          <div>This answer has been marked as the best answer.</div>
        </div>
      );
    } catch (error) {
      toast(
        <div>
          <strong className="font-semibold">Error</strong>
          <div>Failed to accept answer. Please try again.</div>
        </div>
      );
    }
  };

  const handleReport = async () => {
    if (!reportReason) return;

    try {
      await reportPost({
        postId: thread!.id,
        reason: reportReason as any,
        details: reportDetails,
      }).unwrap();

      setShowReportDialog(false);
      setReportReason('');
      setReportDetails('');
      toast(
        <div>
          <strong className="font-semibold">Report submitted</strong>
          <div>Thank you for reporting. We'll review this content.</div>
        </div>
      );
    } catch (error) {
      toast(
        <div>
          <strong className="font-semibold">Error</strong>
          <div>Failed to submit report. Please try again.</div>
        </div>
      );
    }
  };

  const handleBookmark = async () => {
    try {
      await bookmarkThread({ threadId: thread!.id }).unwrap();
      toast(
        <div>
          <strong className="font-semibold">
            {thread!.isBookmarked ? 'Bookmark removed' : 'Thread bookmarked'}
          </strong>
          <div>
            {thread!.isBookmarked
              ? 'Thread removed from bookmarks.'
              : 'Thread added to bookmarks.'}
          </div>
        </div>
      );
    } catch (error) {
      toast(
        <div>
          <strong className="font-semibold">Error</strong>
          <div>Failed to update bookmark. Please try again.</div>
        </div>
      );
    }
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

  if (threadLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-3/4 rounded bg-gray-200"></div>
          <div className="h-32 rounded bg-gray-200"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="mb-2 text-2xl font-bold">Thread Not Found</h2>
            <p className="mb-4 text-gray-600">
              The thread you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/forum">Back to Forum</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link href="/forum" className="hover:text-blue-600">
          Forum
        </Link>
        <span>/</span>
        <Link
          href={`/forum/categories/${thread.category.id}`}
          className="hover:text-blue-600"
        >
          {thread.category.name}
        </Link>
        <span>/</span>
        <span className="text-gray-900">{thread.title}</span>
      </nav>

      {/* Thread Header */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2">
                {thread.isPinned && <Pin className="h-4 w-4 text-blue-600" />}
                {thread.isLocked && <Lock className="h-4 w-4 text-red-600" />}
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
                    <CheckCircle className="mr-1 h-3 w-3" />
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

              <h1 className="mb-2 text-2xl font-bold text-gray-900 lg:text-3xl">
                {thread.title}
              </h1>
              <p className="mb-4 text-gray-600">{thread.summary}</p>

              {/* Tags */}
              {thread.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {thread.tags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      style={{ borderColor: tag.color, color: tag.color }}
                      className="text-xs"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Thread Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{thread.viewCount} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{thread.replyCount} replies</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Asked {formatTimeAgo(thread.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleBookmark}>
                <Bookmark
                  className={`h-4 w-4 ${thread.isBookmarked ? 'fill-current' : ''}`}
                />
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {user?.id === thread.authorId && (
                    <>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Thread
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Thread
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                    <Flag className="mr-2 h-4 w-4" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Thread Content */}
          <div className="border-t pt-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-2">
                {/* Voting */}
                <Button
                  variant={thread.userVote === 'up' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleVote('up', thread.id, 'thread')}
                  className="p-2"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <span className="text-lg font-medium">{thread.score}</span>
                <Button
                  variant={thread.userVote === 'down' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleVote('down', thread.id, 'thread')}
                  className="p-2"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1">
                <div
                  className="prose mb-6 max-w-none"
                  dangerouslySetInnerHTML={{ __html: thread.contentHtml! }}
                />

                {/* Author Info */}
                <div className="flex items-start justify-between">
                  <div></div>
                  <Card className="w-64">
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={thread.author.avatar} />
                          <AvatarFallback>
                            {thread.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            href={`/forum/users/${thread.author.id}`}
                            className="font-medium hover:text-blue-600"
                          >
                            {thread.author.name}
                          </Link>
                          <div className="text-sm text-gray-500">
                            {thread.author.reputation} reputation
                          </div>
                        </div>
                      </div>
                      {thread.author?.badges?.length ??
                        (0 > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {thread.author?.badges?.map((badge, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                style={{
                                  borderColor: badge.color,
                                  color: badge.color,
                                }}
                                className="text-xs"
                              >
                                {badge.name}
                              </Badge>
                            ))}
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts/Answers Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {thread.replyCount}{' '}
            {thread.type === 'question' ? 'Answers' : 'Replies'}
          </h2>
          <Select
            value={sortBy}
            onValueChange={value => setSortBy(value as any)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="score">Highest Score</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {postsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-24 rounded bg-gray-200"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          posts?.map((post: ForumPost) => (
            <Card
              key={post.id}
              className={`${post.isAccepted ? 'ring-2 ring-green-500' : ''}`}
            >
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-2">
                    {/* Voting */}
                    <Button
                      variant={post.userVote === 'up' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleVote('up', post.id, 'post')}
                      className="p-2"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <span className="font-medium">{post.score}</span>
                    <Button
                      variant={post.userVote === 'down' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleVote('down', post.id, 'post')}
                      className="p-2"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>

                    {/* Accept Answer (only for thread author and questions) */}
                    {thread.type === 'question' &&
                      user?.id === thread.authorId &&
                      !thread.isResolved && (
                        <Button
                          variant={post.isAccepted ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleAcceptAnswer(post.id)}
                          className="mt-2 p-2"
                          title="Accept as best answer"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                  </div>

                  <div className="flex-1">
                    {post.isAccepted && (
                      <div className="mb-4 flex items-center gap-2 text-green-700">
                        <Award className="h-5 w-5" />
                        <span className="font-medium">Accepted Answer</span>
                      </div>
                    )}

                    <div
                      className="prose mb-4 max-w-none"
                      dangerouslySetInnerHTML={{ __html: post.contentHtml }}
                    />

                    {post.isEdited && (
                      <div className="mb-4 text-sm text-gray-500">
                        Edited {formatTimeAgo(post.editedAt!)}
                        {post.editReason && (
                          <span className="ml-2">• {post.editReason}</span>
                        )}
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="mb-4 flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(post.id)}
                      >
                        <Reply className="mr-2 h-4 w-4" />
                        Reply
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Heart
                          className={`mr-2 h-4 w-4 ${post.isHelpful ? 'fill-current text-red-500' : ''}`}
                        />
                        Helpful ({post.helpfulCount})
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>

                    {/* Author Info and Timestamp */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {formatTimeAgo(post.createdAt)}
                      </div>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback>
                            {post.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            href={`/forum/users/${post.author.id}`}
                            className="text-sm font-medium hover:text-blue-600"
                          >
                            {post.author.name}
                          </Link>
                          <div className="text-xs text-gray-500">
                            {post.author.reputation} rep
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Replies */}
                    {post.replies && post.replies.length > 0 && (
                      <div className="mt-4 space-y-3 border-l-2 border-gray-200 pl-4">
                        {post.replies.map(reply => (
                          <div
                            key={reply.id}
                            className="rounded bg-gray-50 p-3"
                          >
                            <div
                              className="prose prose-sm mb-2 max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: reply.contentHtml,
                              }}
                            />
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>{formatTimeAgo(reply.createdAt)}</span>
                              <Link
                                href={`/forum/users/${reply.author.id}`}
                                className="font-medium hover:text-blue-600"
                              >
                                {reply.author.name}
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    {replyingTo === post.id && (
                      <div className="mt-4 rounded bg-gray-50 p-4">
                        <Label className="mb-2 block text-sm font-medium">
                          Reply to {post.author.name}
                        </Label>
                        <Textarea
                          value={newReply}
                          onChange={e => setNewReply(e.target.value)}
                          placeholder="Write your reply..."
                          className="mb-3"
                          rows={4}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handleCreateReply}
                            disabled={!newReply.trim()}
                          >
                            Post Reply
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setReplyingTo(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* New Answer/Reply Form */}
      {!thread.isLocked && (
        <Card>
          <CardHeader>
            <CardTitle>
              Your {thread.type === 'question' ? 'Answer' : 'Reply'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={newReply}
              onChange={e => setNewReply(e.target.value)}
              placeholder={`Write your ${thread.type === 'question' ? 'answer' : 'reply'}...`}
              className="mb-4"
              rows={6}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateReply} disabled={!newReply.trim()}>
                Post {thread.type === 'question' ? 'Answer' : 'Reply'}
              </Button>
              <Button variant="outline" onClick={() => setNewReply('')}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block text-sm font-medium">
                Reason for reporting
              </Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="inappropriate">
                    Inappropriate Content
                  </SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="misinformation">Misinformation</SelectItem>
                  <SelectItem value="copyright">Copyright Violation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block text-sm font-medium">
                Additional details (optional)
              </Label>
              <Textarea
                value={reportDetails}
                onChange={e => setReportDetails(e.target.value)}
                placeholder="Provide additional context..."
                rows={3}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowReportDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleReport} disabled={!reportReason}>
              Submit Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
