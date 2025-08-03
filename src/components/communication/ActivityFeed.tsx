'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSocket } from '@/hooks/use-socket';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Plus,
  Image as ImageIcon,
  Video,
  FileText,
  Trophy,
  BookOpen,
  GraduationCap,
  Users,
  Star,
  Filter,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userType: 'student' | 'teacher' | 'admin';
  activityType:
    | 'course_enrollment'
    | 'course_completion'
    | 'assignment_submission'
    | 'quiz_completion'
    | 'achievement_earned'
    | 'lesson_completed'
    | 'forum_post'
    | 'study_group_join'
    | 'project_submission'
    | 'certificate_earned'
    | 'milestone_reached'
    | 'collaboration'
    | 'announcement'
    | 'social_post';
  title: string;
  description: string;
  visibility: 'public' | 'friends' | 'course_members' | 'private';
  courseId?: string;
  courseName?: string;
  lessonId?: string;
  lessonName?: string;
  relatedId?: string;
  relatedType?: string;
  metadata?: {
    score?: number;
    grade?: string;
    duration?: number;
    achievement?: string;
    milestone?: string;
    tags?: string[];
    images?: string[];
    files?: string[];
  };
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isFollowing?: boolean;
  importance: number; // 1-5 scale for feed prioritization
  actionUrl?: string;
  imageUrl?: string;
}

interface ActivityComment {
  id: string;
  activityId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
}

interface CreateActivityData {
  title: string;
  description: string;
  visibility: ActivityItem['visibility'];
  activityType: ActivityItem['activityType'];
  courseId?: string;
  tags?: string[];
  images?: File[];
}

const ACTIVITY_ICONS = {
  course_enrollment: BookOpen,
  course_completion: GraduationCap,
  assignment_submission: FileText,
  quiz_completion: FileText,
  achievement_earned: Trophy,
  lesson_completed: Video,
  forum_post: MessageCircle,
  study_group_join: Users,
  project_submission: FileText,
  certificate_earned: Trophy,
  milestone_reached: Star,
  collaboration: Users,
  announcement: MessageCircle,
  social_post: MessageCircle,
};

const ACTIVITY_COLORS = {
  course_enrollment: 'text-blue-600 bg-blue-100',
  course_completion: 'text-green-600 bg-green-100',
  assignment_submission: 'text-orange-600 bg-orange-100',
  quiz_completion: 'text-purple-600 bg-purple-100',
  achievement_earned: 'text-yellow-600 bg-yellow-100',
  lesson_completed: 'text-blue-600 bg-blue-100',
  forum_post: 'text-indigo-600 bg-indigo-100',
  study_group_join: 'text-pink-600 bg-pink-100',
  project_submission: 'text-red-600 bg-red-100',
  certificate_earned: 'text-yellow-600 bg-yellow-100',
  milestone_reached: 'text-purple-600 bg-purple-100',
  collaboration: 'text-green-600 bg-green-100',
  announcement: 'text-blue-600 bg-blue-100',
  social_post: 'text-gray-600 bg-gray-100',
};

const USER_TYPE_BADGES = {
  student: { label: 'Student', color: 'bg-green-100 text-green-800' },
  teacher: { label: 'Teacher', color: 'bg-blue-100 text-blue-800' },
  admin: { label: 'Admin', color: 'bg-purple-100 text-purple-800' },
};

interface ActivityFeedProps {
  className?: string;
  variant?: 'full' | 'compact' | 'timeline';
  courseId?: string;
  userId?: string;
  showCreatePost?: boolean;
  maxItems?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  className,
  variant = 'full',
  courseId,
  userId,
  showCreatePost = true,
  maxItems,
}) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [comments, setComments] = useState<Record<string, ActivityComment[]>>(
    {}
  );
  const [activeTab, setActiveTab] = useState<'all' | 'following' | 'trending'>(
    'all'
  );
  const [filterType, setFilterType] = useState<
    'all' | ActivityItem['activityType']
  >('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {}
  );

  // Create post state
  const [createPostData, setCreatePostData] = useState<CreateActivityData>({
    title: '',
    description: '',
    visibility: 'public',
    activityType: 'social_post',
    tags: [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load activities
  useEffect(() => {
    loadActivities();
  }, [activeTab, filterType, courseId, userId]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewActivity = (activity: ActivityItem) => {
      setActivities(prev => [activity, ...prev]);
    };

    const handleActivityUpdate = (
      activityId: string,
      updates: Partial<ActivityItem>
    ) => {
      setActivities(prev =>
        prev.map(activity =>
          activity.id === activityId ? { ...activity, ...updates } : activity
        )
      );
    };

    const handleNewComment = (comment: ActivityComment) => {
      setComments(prev => ({
        ...prev,
        [comment.activityId]: [...(prev[comment.activityId] || []), comment],
      }));

      // Update comments count
      setActivities(prev =>
        prev.map(activity =>
          activity.id === comment.activityId
            ? { ...activity, commentsCount: activity.commentsCount + 1 }
            : activity
        )
      );
    };

    socket.on('activity:new', handleNewActivity);
    socket.on('activity:updated', handleActivityUpdate);
    socket.on('activity:comment', handleNewComment);

    return () => {
      socket.off('activity:new', handleNewActivity);
      socket.off('activity:updated', handleActivityUpdate);
      socket.off('activity:comment', handleNewComment);
    };
  }, [socket]);

  const loadActivities = async () => {
    try {
      setIsLoading(true);

      // Mock API call - replace with actual API
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'Alice Johnson',
          userAvatar: 'https://github.com/shadcn.png',
          userType: 'student',
          activityType: 'course_completion',
          title: 'Course Completed!',
          description:
            'Just finished "Advanced React Patterns" with a score of 95%!',
          visibility: 'public',
          courseId: 'react-advanced',
          courseName: 'Advanced React Patterns',
          metadata: {
            score: 95,
            grade: 'A',
            achievement: 'React Master',
          },
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          likesCount: 12,
          commentsCount: 3,
          sharesCount: 2,
          isLiked: false,
          importance: 4,
          actionUrl: '/courses/react-advanced',
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Bob Smith',
          userAvatar: 'https://github.com/shadcn.png',
          userType: 'teacher',
          activityType: 'announcement',
          title: 'New Assignment Posted',
          description:
            "I've just posted a new assignment on React Hooks. Due date is next Friday!",
          visibility: 'course_members',
          courseId: 'react-fundamentals',
          courseName: 'React Fundamentals',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likesCount: 8,
          commentsCount: 5,
          sharesCount: 0,
          isLiked: true,
          importance: 5,
          actionUrl: '/assignments/react-hooks',
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'Carol Davis',
          userAvatar: 'https://github.com/shadcn.png',
          userType: 'student',
          activityType: 'achievement_earned',
          title: 'Achievement Unlocked!',
          description:
            'Earned the "Quick Learner" badge for completing 5 lessons in one day',
          visibility: 'public',
          metadata: {
            achievement: 'Quick Learner',
            milestone: '5 lessons in one day',
          },
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          likesCount: 15,
          commentsCount: 4,
          sharesCount: 1,
          isLiked: false,
          importance: 3,
          imageUrl: '/achievements/quick-learner.png',
        },
        {
          id: '4',
          userId: 'user4',
          userName: 'David Wilson',
          userAvatar: 'https://github.com/shadcn.png',
          userType: 'student',
          activityType: 'study_group_join',
          title: 'Joined Study Group',
          description:
            'Just joined the "JavaScript Advanced Concepts" study group. Looking forward to collaborative learning!',
          visibility: 'public',
          metadata: {
            tags: ['javascript', 'study-group', 'collaboration'],
          },
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          likesCount: 6,
          commentsCount: 2,
          sharesCount: 0,
          isLiked: false,
          importance: 2,
          actionUrl: '/study-groups/js-advanced',
        },
      ];

      let filteredActivities = mockActivities;

      // Apply filters
      if (courseId) {
        filteredActivities = filteredActivities.filter(
          a => a.courseId === courseId
        );
      }

      if (userId) {
        filteredActivities = filteredActivities.filter(
          a => a.userId === userId
        );
      }

      if (filterType !== 'all') {
        filteredActivities = filteredActivities.filter(
          a => a.activityType === filterType
        );
      }

      // Apply tab filters
      if (activeTab === 'trending') {
        filteredActivities = filteredActivities.sort(
          (a, b) =>
            b.likesCount +
            b.commentsCount +
            b.sharesCount -
            (a.likesCount + a.commentsCount + a.sharesCount)
        );
      } else if (activeTab === 'following') {
        // Filter for followed users (mock logic)
        filteredActivities = filteredActivities.filter(
          a => a.isFollowing !== false
        );
      }

      // Sort by importance and time
      filteredActivities = filteredActivities.sort((a, b) => {
        if (a.importance !== b.importance) {
          return b.importance - a.importance;
        }
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      if (maxItems) {
        filteredActivities = filteredActivities.slice(0, maxItems);
      }

      setActivities(filteredActivities);
    } catch (error) {
      toast.error('Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeActivity = async (activityId: string) => {
    try {
      const activity = activities.find(a => a.id === activityId);
      if (!activity) return;

      const newIsLiked = !activity.isLiked;
      const newLikesCount = activity.likesCount + (newIsLiked ? 1 : -1);

      setActivities(prev =>
        prev.map(a =>
          a.id === activityId
            ? { ...a, isLiked: newIsLiked, likesCount: newLikesCount }
            : a
        )
      );

      // API call
      if (socket) {
        socket.emit('activity:like', { activityId, isLiked: newIsLiked });
      }
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const handleAddComment = async (activityId: string) => {
    const content = commentInputs[activityId]?.trim();
    if (!content || !user) return;

    try {
      const newComment: ActivityComment = {
        id: Date.now().toString(),
        activityId,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userAvatar: user.avatarUrl,
        content,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        isLiked: false,
      };

      setComments(prev => ({
        ...prev,
        [activityId]: [...(prev[activityId] || []), newComment],
      }));

      setCommentInputs(prev => ({ ...prev, [activityId]: '' }));

      // Update comments count
      setActivities(prev =>
        prev.map(a =>
          a.id === activityId ? { ...a, commentsCount: a.commentsCount + 1 } : a
        )
      );

      // API call
      if (socket) {
        socket.emit('activity:comment', newComment);
      }

      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleShareActivity = async (activityId: string) => {
    try {
      // Update shares count
      setActivities(prev =>
        prev.map(a =>
          a.id === activityId ? { ...a, sharesCount: a.sharesCount + 1 } : a
        )
      );

      // API call
      if (socket) {
        socket.emit('activity:share', { activityId });
      }

      toast.success('Activity shared');
    } catch (error) {
      toast.error('Failed to share activity');
    }
  };

  const handleCreatePost = async () => {
    if (!createPostData.title || !createPostData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsCreatingPost(true);

      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        userId: user?.id || '',
        userName: `${user?.firstName} ${user?.lastName}`,
        userAvatar: user?.avatarUrl,
        userType: user?.userType || 'student',
        ...createPostData,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: false,
        importance: 2,
      };

      setActivities(prev => [newActivity, ...prev]);

      // API call
      if (socket) {
        socket.emit('activity:create', newActivity);
      }

      // Reset form
      setCreatePostData({
        title: '',
        description: '',
        visibility: 'public',
        activityType: 'social_post',
        tags: [],
      });

      toast.success('Post created successfully');
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setIsCreatingPost(false);
    }
  };

  const toggleComments = (activityId: string) => {
    setShowComments(prev => ({
      ...prev,
      [activityId]: !prev[activityId],
    }));

    // Load comments if not loaded yet
    if (!comments[activityId]) {
      loadComments(activityId);
    }
  };

  const loadComments = async (activityId: string) => {
    try {
      // Mock API call
      const mockComments: ActivityComment[] = [
        {
          id: '1',
          activityId,
          userId: 'user5',
          userName: 'Emma Brown',
          userAvatar: 'https://github.com/shadcn.png',
          content: "Congratulations! That's amazing progress!",
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          likesCount: 2,
          isLiked: false,
        },
        {
          id: '2',
          activityId,
          userId: 'user6',
          userName: 'Frank Miller',
          userAvatar: 'https://github.com/shadcn.png',
          content: 'Keep up the great work! 🎉',
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          likesCount: 1,
          isLiked: true,
        },
      ];

      setComments(prev => ({
        ...prev,
        [activityId]: mockComments,
      }));
    } catch (error) {
      toast.error('Failed to load comments');
    }
  };

  const renderActivityItem = (activity: ActivityItem) => {
    const IconComponent =
      ACTIVITY_ICONS[activity.activityType] || MessageCircle;
    const colorClasses =
      ACTIVITY_COLORS[activity.activityType] || ACTIVITY_COLORS.social_post;
    const userBadge = USER_TYPE_BADGES[activity.userType];

    return (
      <Card key={activity.id} className="overflow-hidden">
        <CardContent className="p-4">
          {/* Header */}
          <div className="mb-3 flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={activity.userAvatar} />
              <AvatarFallback>
                {activity.userName
                  .split(' ')
                  .map(n => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{activity.userName}</span>
                <Badge
                  variant="secondary"
                  className={cn('text-xs', userBadge.color)}
                >
                  {userBadge.label}
                </Badge>
                <div className={cn('rounded-full p-1', colorClasses)}>
                  <IconComponent className="h-3 w-3" />
                </div>
              </div>

              <div className="mt-1 flex items-center space-x-2 text-xs text-muted-foreground">
                <span>
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                {activity.courseName && (
                  <>
                    <span>•</span>
                    <span>{activity.courseName}</span>
                  </>
                )}
                <span>•</span>
                <span className="capitalize">{activity.visibility}</span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Report Activity</DropdownMenuItem>
                {activity.userId === user?.id && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Edit Post</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      Delete Post
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <div>
              <h3 className="mb-1 text-sm font-medium">{activity.title}</h3>
              <p className="text-sm text-muted-foreground">
                {activity.description}
              </p>
            </div>

            {/* Metadata */}
            {activity.metadata && (
              <div className="flex flex-wrap gap-2">
                {activity.metadata.score && (
                  <Badge variant="outline" className="text-xs">
                    Score: {activity.metadata.score}%
                  </Badge>
                )}
                {activity.metadata.grade && (
                  <Badge variant="outline" className="text-xs">
                    Grade: {activity.metadata.grade}
                  </Badge>
                )}
                {activity.metadata.achievement && (
                  <Badge variant="secondary" className="text-xs">
                    🏆 {activity.metadata.achievement}
                  </Badge>
                )}
                {activity.metadata.tags?.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Image */}
            {activity.imageUrl && (
              <div className="overflow-hidden rounded-lg">
                <img
                  src={activity.imageUrl}
                  alt={activity.title}
                  className="h-48 w-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-3 flex items-center justify-between border-t pt-3">
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLikeActivity(activity.id)}
                className={cn('text-xs', activity.isLiked && 'text-red-500')}
              >
                <Heart
                  className={cn(
                    'mr-1 h-4 w-4',
                    activity.isLiked && 'fill-current'
                  )}
                />
                {activity.likesCount}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleComments(activity.id)}
                className="text-xs"
              >
                <MessageCircle className="mr-1 h-4 w-4" />
                {activity.commentsCount}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleShareActivity(activity.id)}
                className="text-xs"
              >
                <Share2 className="mr-1 h-4 w-4" />
                {activity.sharesCount}
              </Button>
            </div>

            {activity.actionUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={activity.actionUrl}>View Details</a>
              </Button>
            )}
          </div>

          {/* Comments */}
          {showComments[activity.id] && (
            <div className="mt-4 space-y-3 border-t pt-4">
              {/* Comment Input */}
              <div className="flex space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="text-xs">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 space-x-2">
                  <Input
                    placeholder="Write a comment..."
                    value={commentInputs[activity.id] || ''}
                    onChange={e =>
                      setCommentInputs(prev => ({
                        ...prev,
                        [activity.id]: e.target.value,
                      }))
                    }
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        handleAddComment(activity.id);
                      }
                    }}
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAddComment(activity.id)}
                    disabled={!commentInputs[activity.id]?.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              {comments[activity.id]?.map(comment => (
                <div key={comment.id} className="flex space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={comment.userAvatar} />
                    <AvatarFallback className="text-xs">
                      {comment.userName
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 rounded-lg bg-muted p-2">
                    <div className="mb-1 flex items-center space-x-2">
                      <span className="text-xs font-medium">
                        {comment.userName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-xs">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderCreatePost = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Share an Update</CardTitle>
        <CardDescription>
          Share your learning progress, achievements, or thoughts with the
          community
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="What's on your mind?"
          value={createPostData.title}
          onChange={e =>
            setCreatePostData(prev => ({ ...prev, title: e.target.value }))
          }
        />

        <Textarea
          placeholder="Share more details..."
          value={createPostData.description}
          onChange={e =>
            setCreatePostData(prev => ({
              ...prev,
              description: e.target.value,
            }))
          }
          rows={3}
        />

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  {createPostData.visibility}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() =>
                    setCreatePostData(prev => ({
                      ...prev,
                      visibility: 'public',
                    }))
                  }
                >
                  Public
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setCreatePostData(prev => ({
                      ...prev,
                      visibility: 'friends',
                    }))
                  }
                >
                  Friends
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setCreatePostData(prev => ({
                      ...prev,
                      visibility: 'course_members',
                    }))
                  }
                >
                  Course Members
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Add Image
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => {
                // Handle file upload
                console.log('Files selected:', e.target.files);
              }}
            />
          </div>

          <Button
            onClick={handleCreatePost}
            disabled={
              isCreatingPost ||
              !createPostData.title ||
              !createPostData.description
            }
          >
            {isCreatingPost ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-3', className)}>
        {isLoading ? (
          <div className="py-4 text-center">
            <div className="text-sm text-muted-foreground">
              Loading activities...
            </div>
          </div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center">
            <MessageCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              No activities yet
            </div>
          </div>
        ) : (
          activities.slice(0, 5).map(activity => (
            <div
              key={activity.id}
              className="flex items-center space-x-3 rounded-lg p-3 hover:bg-muted/50"
            >
              <div
                className={cn(
                  'rounded-full p-2',
                  ACTIVITY_COLORS[activity.activityType]
                )}
              >
                {React.createElement(ACTIVITY_ICONS[activity.activityType], {
                  className: 'h-4 w-4',
                })}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{activity.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {activity.userName}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                })}
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  if (variant === 'timeline') {
    return (
      <div className={cn('space-y-6', className)}>
        {activities.map((activity, index) => (
          <div key={activity.id} className="relative">
            {/* Timeline line */}
            {index < activities.length - 1 && (
              <div className="absolute left-6 top-12 h-16 w-0.5 bg-border" />
            )}

            <div className="flex space-x-4">
              <div
                className={cn(
                  'rounded-full p-3 ring-4 ring-background',
                  ACTIVITY_COLORS[activity.activityType]
                )}
              >
                {React.createElement(ACTIVITY_ICONS[activity.activityType], {
                  className: 'h-5 w-5',
                })}
              </div>

              <div className="min-w-0 flex-1">
                <Card>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {activity.userName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <h3 className="mb-1 text-sm font-medium">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Full variant
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Activity Feed</h2>
          <p className="text-muted-foreground">
            Stay updated with learning activities and achievements
          </p>
        </div>

        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                {filterType === 'all'
                  ? 'All Types'
                  : filterType.replace('_', ' ')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterType('all')}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {Object.keys(ACTIVITY_ICONS).map(type => (
                <DropdownMenuItem
                  key={type}
                  onClick={() =>
                    setFilterType(type as ActivityItem['activityType'])
                  }
                >
                  {React.createElement(
                    ACTIVITY_ICONS[type as keyof typeof ACTIVITY_ICONS],
                    { className: 'h-4 w-4 mr-2' }
                  )}
                  {type.replace('_', ' ')}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={value => setActiveTab(value as typeof activeTab)}
      >
        <TabsList>
          <TabsTrigger value="all">All Activities</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Create Post */}
          {showCreatePost && user && renderCreatePost()}

          {/* Activities */}
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="text-sm text-muted-foreground">
                Loading activities...
              </div>
            </div>
          ) : activities.length === 0 ? (
            <div className="py-12 text-center">
              <MessageCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">No activities yet</h3>
              <p className="mb-4 text-muted-foreground">
                Be the first to share your learning journey!
              </p>
              {showCreatePost && (
                <Button
                  onClick={() =>
                    setCreatePostData(prev => ({
                      ...prev,
                      title: '',
                      description: '',
                    }))
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Post
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map(renderActivityItem)}

              {/* Load More */}
              {activities.length >= 10 && (
                <div className="pt-4 text-center">
                  <Button variant="outline" onClick={loadActivities}>
                    Load More Activities
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ActivityFeed;
