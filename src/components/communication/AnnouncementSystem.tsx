'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  Calendar,
  Edit,
  Eye,
  Filter,
  Megaphone,
  MoreVertical,
  Pin,
  PinOff,
  Plus,
  Search,
  Send,
  Star,
  Trash2,
  Users,
  X,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'maintenance' | 'feature' | 'course' | 'event';
  priority: 'low' | 'normal' | 'high' | 'critical';
  category: 'system' | 'academic' | 'social' | 'administrative';
  targetAudience:
    | 'all'
    | 'students'
    | 'teachers'
    | 'admins'
    | 'course_specific';
  courseId?: string;
  courseName?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: 'admin' | 'teacher' | 'system';
  isActive: boolean;
  isPinned: boolean;
  isPublished: boolean;
  scheduledAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  viewsCount: number;
  reactionsCount: number;
  commentsCount: number;
  readBy: string[];
  metadata?: {
    tags?: string[];
    attachments?: string[];
    relatedLinks?: string[];
    emailSent?: boolean;
    pushSent?: boolean;
  };
}

interface AnnouncementReaction {
  id: string;
  announcementId: string;
  userId: string;
  type: 'like' | 'helpful' | 'important' | 'thanks';
  createdAt: string;
}

interface CreateAnnouncementData {
  title: string;
  content: string;
  type: Announcement['type'];
  priority: Announcement['priority'];
  category: Announcement['category'];
  targetAudience: Announcement['targetAudience'];
  courseId?: string;
  isPinned: boolean;
  scheduledAt?: string;
  expiresAt?: string;
  tags: string[];
  sendEmail: boolean;
  sendPush: boolean;
}

const ANNOUNCEMENT_ICONS = {
  general: MessageSquare,
  urgent: AlertTriangle,
  maintenance: AlertCircle,
  feature: Star,
  course: Users,
  event: Calendar,
};

const PRIORITY_COLORS = {
  low: 'text-gray-500 bg-gray-100',
  normal: 'text-blue-500 bg-blue-100',
  high: 'text-orange-500 bg-orange-100',
  critical: 'text-red-500 bg-red-100',
};

const TYPE_COLORS = {
  general: 'bg-blue-100 text-blue-800',
  urgent: 'bg-red-100 text-red-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  feature: 'bg-purple-100 text-purple-800',
  course: 'bg-green-100 text-green-800',
  event: 'bg-indigo-100 text-indigo-800',
};

interface AnnouncementSystemProps {
  className?: string;
  variant?: 'full' | 'compact' | 'banner';
  courseId?: string;
  showCreateButton?: boolean;
  maxAnnouncements?: number;
}

export const AnnouncementSystem: React.FC<AnnouncementSystemProps> = ({
  className,
  variant = 'full',
  courseId,
  showCreateButton = true,
  maxAnnouncements,
}) => {
  const { user } = useAuth();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<
    Announcement[]
  >([]);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | Announcement['type']>(
    'all'
  );
  const [filterPriority, setFilterPriority] = useState<
    'all' | Announcement['priority']
  >('all');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Create form
  const [createData, setCreateData] = useState<CreateAnnouncementData>({
    title: '',
    content: '',
    type: 'general',
    priority: 'normal',
    category: 'system',
    targetAudience: 'all',
    isPinned: false,
    tags: [],
    sendEmail: false,
    sendPush: true,
  });

  const canCreateAnnouncements =
    user?.userType === 'admin' || user?.userType === 'teacher';

  // Load announcements
  useEffect(() => {
    loadAnnouncements();
  }, [courseId]);

  // Apply filters
  useEffect(() => {
    let filtered = announcements;

    // Course filter
    if (courseId) {
      filtered = filtered.filter(
        a => a.courseId === courseId || a.targetAudience === 'all'
      );
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        a =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.authorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.type === filterType);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(a => a.priority === filterPriority);
    }

    // Pinned filter
    if (showPinnedOnly) {
      filtered = filtered.filter(a => a.isPinned);
    }

    // Unread filter
    if (showUnreadOnly) {
      filtered = filtered.filter(a => !a.readBy.includes(user?.id || ''));
    }

    // Sort: pinned first, then by priority and date
    filtered = filtered.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }

      const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
      if (a.priority !== b.priority) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    if (maxAnnouncements) {
      filtered = filtered.slice(0, maxAnnouncements);
    }

    setFilteredAnnouncements(filtered);
  }, [
    announcements,
    searchQuery,
    filterType,
    filterPriority,
    showPinnedOnly,
    showUnreadOnly,
    courseId,
    maxAnnouncements,
    user?.id,
  ]);

  const loadAnnouncements = async () => {
    try {
      setIsLoading(true);

      // Mock API call
      const mockAnnouncements: Announcement[] = [
        {
          id: '1',
          title: 'System Maintenance Scheduled',
          content:
            'We will be performing scheduled maintenance on Sunday, January 15th from 2:00 AM to 4:00 AM EST. During this time, the platform may be temporarily unavailable. We apologize for any inconvenience.',
          type: 'maintenance',
          priority: 'high',
          category: 'system',
          targetAudience: 'all',
          authorId: 'admin1',
          authorName: 'System Administrator',
          authorRole: 'admin',
          isActive: true,
          isPinned: true,
          isPublished: true,
          scheduledAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          viewsCount: 156,
          reactionsCount: 12,
          commentsCount: 8,
          readBy: [],
          metadata: {
            tags: ['maintenance', 'system'],
            emailSent: true,
            pushSent: true,
          },
        },
        {
          id: '2',
          title: 'New Course Available: Advanced AI Concepts',
          content:
            'We\'re excited to announce the launch of our new course "Advanced AI Concepts"! This comprehensive course covers machine learning, deep learning, and practical AI applications. Early bird registration is now open with a 20% discount.',
          type: 'course',
          priority: 'normal',
          category: 'academic',
          targetAudience: 'students',
          authorId: 'teacher1',
          authorName: 'Dr. Sarah Johnson',
          authorAvatar: 'https://github.com/shadcn.png',
          authorRole: 'teacher',
          isActive: true,
          isPinned: false,
          isPublished: true,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          viewsCount: 89,
          reactionsCount: 24,
          commentsCount: 15,
          readBy: [user?.id || ''],
          metadata: {
            tags: ['course', 'ai', 'new'],
            relatedLinks: ['/courses/advanced-ai-concepts'],
            emailSent: true,
            pushSent: true,
          },
        },
        {
          id: '3',
          title: 'Weekly Study Group Sessions',
          content:
            "Join our weekly study group sessions every Thursday at 7:00 PM EST. This week we'll be covering React Hooks and State Management. All skill levels welcome!",
          type: 'event',
          priority: 'normal',
          category: 'social',
          targetAudience: 'students',
          courseId: 'react-fundamentals',
          courseName: 'React Fundamentals',
          authorId: 'teacher2',
          authorName: 'Mike Wilson',
          authorAvatar: 'https://github.com/shadcn.png',
          authorRole: 'teacher',
          isActive: true,
          isPinned: false,
          isPublished: true,
          createdAt: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
          viewsCount: 45,
          reactionsCount: 8,
          commentsCount: 3,
          readBy: [],
          metadata: {
            tags: ['study-group', 'react', 'weekly'],
            emailSent: false,
            pushSent: true,
          },
        },
        {
          id: '4',
          title: 'Security Alert: Enable Two-Factor Authentication',
          content:
            'To enhance the security of your account, we strongly recommend enabling two-factor authentication (2FA). This adds an extra layer of protection to your account. You can enable 2FA in your account settings.',
          type: 'urgent',
          priority: 'critical',
          category: 'system',
          targetAudience: 'all',
          authorId: 'admin1',
          authorName: 'Security Team',
          authorRole: 'admin',
          isActive: true,
          isPinned: true,
          isPublished: true,
          createdAt: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updatedAt: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
          viewsCount: 234,
          reactionsCount: 45,
          commentsCount: 12,
          readBy: [],
          metadata: {
            tags: ['security', '2fa', 'important'],
            relatedLinks: ['/settings/security'],
            emailSent: true,
            pushSent: true,
          },
        },
      ];

      setAnnouncements(mockAnnouncements);
    } catch (error) {
      toast.error('Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!createData.title.trim() || !createData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        ...createData,
        authorId: user?.id || '',
        authorName: `${user?.firstName} ${user?.lastName}`,
        authorAvatar: user?.avatarUrl,
        authorRole: user?.userType as 'admin' | 'teacher',
        isActive: true,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewsCount: 0,
        reactionsCount: 0,
        commentsCount: 0,
        readBy: [],
        metadata: {
          tags: createData.tags,
          emailSent: createData.sendEmail,
          pushSent: createData.sendPush,
        },
      };

      setAnnouncements(prev => [newAnnouncement, ...prev]);
      setIsCreateDialogOpen(false);

      // Reset form
      setCreateData({
        title: '',
        content: '',
        type: 'general',
        priority: 'normal',
        category: 'system',
        targetAudience: 'all',
        isPinned: false,
        tags: [],
        sendEmail: false,
        sendPush: true,
      });

      toast.success('Announcement created successfully');
    } catch (error) {
      toast.error('Failed to create announcement');
    }
  };

  const handleMarkAsRead = async (announcementId: string) => {
    if (!user?.id) return;

    try {
      setAnnouncements(prev =>
        prev.map(announcement =>
          announcement.id === announcementId
            ? {
                ...announcement,
                readBy: [...announcement.readBy, user.id],
                viewsCount: announcement.viewsCount + 1,
              }
            : announcement
        )
      );

      // API call to mark as read
      // await api.announcements.markAsRead(announcementId);
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleTogglePin = async (announcementId: string) => {
    if (!canCreateAnnouncements) return;

    try {
      setAnnouncements(prev =>
        prev.map(announcement =>
          announcement.id === announcementId
            ? { ...announcement, isPinned: !announcement.isPinned }
            : announcement
        )
      );

      toast.success('Announcement updated');
    } catch (error) {
      toast.error('Failed to update announcement');
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!canCreateAnnouncements) return;

    try {
      setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
      toast.success('Announcement deleted');
    } catch (error) {
      toast.error('Failed to delete announcement');
    }
  };

  const renderAnnouncementCard = (announcement: Announcement) => {
    const IconComponent = ANNOUNCEMENT_ICONS[announcement.type];
    const isUnread = !announcement.readBy.includes(user?.id || '');

    return (
      <Card
        key={announcement.id}
        className={cn(
          'cursor-pointer transition-colors hover:bg-muted/50',
          isUnread && 'border-l-4 border-l-blue-500 bg-blue-50/30',
          announcement.isPinned && 'ring-2 ring-yellow-200'
        )}
        onClick={() => {
          setSelectedAnnouncement(announcement);
          setIsViewDialogOpen(true);
          if (isUnread) {
            handleMarkAsRead(announcement.id);
          }
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div
              className={cn(
                'mt-1 rounded-full p-2',
                PRIORITY_COLORS[announcement.priority]
              )}
            >
              <IconComponent className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center space-x-2">
                    <h3
                      className={cn(
                        'truncate text-sm font-medium',
                        isUnread && 'font-semibold'
                      )}
                    >
                      {announcement.title}
                    </h3>

                    {announcement.isPinned && (
                      <Pin className="h-4 w-4 text-yellow-600" />
                    )}

                    <Badge
                      variant="secondary"
                      className={cn('text-xs', TYPE_COLORS[announcement.type])}
                    >
                      {announcement.type}
                    </Badge>

                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        PRIORITY_COLORS[announcement.priority]
                      )}
                    >
                      {announcement.priority}
                    </Badge>
                  </div>

                  <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                    {announcement.content}
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={announcement.authorAvatar} />
                        <AvatarFallback className="text-xs">
                          {announcement.authorName
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span>{announcement.authorName}</span>
                    </div>

                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(announcement.createdAt), {
                        addSuffix: true,
                      })}
                    </span>

                    {announcement.courseName && (
                      <>
                        <span>•</span>
                        <span>{announcement.courseName}</span>
                      </>
                    )}

                    <span>•</span>
                    <span>{announcement.viewsCount} views</span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={e => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isUnread && (
                      <DropdownMenuItem
                        onClick={() => handleMarkAsRead(announcement.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Mark as Read
                      </DropdownMenuItem>
                    )}

                    {canCreateAnnouncements && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleTogglePin(announcement.id)}
                        >
                          {announcement.isPinned ? (
                            <>
                              <PinOff className="mr-2 h-4 w-4" />
                              Unpin
                            </>
                          ) : (
                            <>
                              <Pin className="mr-2 h-4 w-4" />
                              Pin
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleDeleteAnnouncement(announcement.id)
                          }
                          className="text-red-600"
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
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCreateDialog = () => (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Announcement</DialogTitle>
          <DialogDescription>
            Share important information with your audience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Type</label>
              <Select
                value={createData.type}
                onValueChange={value =>
                  setCreateData(prev => ({
                    ...prev,
                    type: value as Announcement['type'],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Priority</label>
              <Select
                value={createData.priority}
                onValueChange={value =>
                  setCreateData(prev => ({
                    ...prev,
                    priority: value as Announcement['priority'],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Target Audience
            </label>
            <Select
              value={createData.targetAudience}
              onValueChange={value =>
                setCreateData(prev => ({
                  ...prev,
                  targetAudience: value as Announcement['targetAudience'],
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="students">Students Only</SelectItem>
                <SelectItem value="teachers">Teachers Only</SelectItem>
                <SelectItem value="admins">Admins Only</SelectItem>
                <SelectItem value="course_specific">Course Specific</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Title</label>
            <Input
              placeholder="Enter announcement title..."
              value={createData.title}
              onChange={e =>
                setCreateData(prev => ({ ...prev, title: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Content</label>
            <Textarea
              placeholder="Enter announcement content..."
              value={createData.content}
              onChange={e =>
                setCreateData(prev => ({ ...prev, content: e.target.value }))
              }
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={createData.isPinned}
                onCheckedChange={checked =>
                  setCreateData(prev => ({ ...prev, isPinned: checked }))
                }
              />
              <label className="text-sm font-medium">Pin announcement</label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={createData.sendEmail}
                onCheckedChange={checked =>
                  setCreateData(prev => ({ ...prev, sendEmail: checked }))
                }
              />
              <label className="text-sm font-medium">Send email</label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={createData.sendPush}
                onCheckedChange={checked =>
                  setCreateData(prev => ({ ...prev, sendPush: checked }))
                }
              />
              <label className="text-sm font-medium">
                Send push notification
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsCreateDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateAnnouncement}>
            <Send className="mr-2 h-4 w-4" />
            Create Announcement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderViewDialog = () => (
    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
      <DialogContent className="max-w-3xl">
        {selectedAnnouncement && (
          <>
            <DialogHeader>
              <div className="flex items-center space-x-3">
                <div
                  className={cn(
                    'rounded-full p-2',
                    PRIORITY_COLORS[selectedAnnouncement.priority]
                  )}
                >
                  {React.createElement(
                    ANNOUNCEMENT_ICONS[selectedAnnouncement.type],
                    { className: 'h-5 w-5' }
                  )}
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-xl">
                    {selectedAnnouncement.title}
                  </DialogTitle>
                  <div className="mt-1 flex items-center space-x-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-xs',
                        TYPE_COLORS[selectedAnnouncement.type]
                      )}
                    >
                      {selectedAnnouncement.type}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        PRIORITY_COLORS[selectedAnnouncement.priority]
                      )}
                    >
                      {selectedAnnouncement.priority}
                    </Badge>
                    {selectedAnnouncement.isPinned && (
                      <Badge
                        variant="outline"
                        className="text-xs text-yellow-600"
                      >
                        <Pin className="mr-1 h-3 w-3" />
                        Pinned
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              {/* Author and metadata */}
              <div className="flex items-center space-x-3 rounded-lg bg-muted/50 p-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedAnnouncement.authorAvatar} />
                  <AvatarFallback>
                    {selectedAnnouncement.authorName
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {selectedAnnouncement.authorName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(selectedAnnouncement.createdAt), 'PPP p')}
                    {selectedAnnouncement.courseName && (
                      <span> • {selectedAnnouncement.courseName}</span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedAnnouncement.viewsCount} views
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">
                  {selectedAnnouncement.content}
                </p>
              </div>

              {/* Tags */}
              {selectedAnnouncement.metadata?.tags &&
                selectedAnnouncement.metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedAnnouncement.metadata.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

              {/* Related links */}
              {selectedAnnouncement.metadata?.relatedLinks &&
                selectedAnnouncement.metadata.relatedLinks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Related Links</h4>
                    {selectedAnnouncement.metadata.relatedLinks.map(
                      (link, index) => (
                        <Button key={index} variant="outline" size="sm" asChild>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Details
                          </a>
                        </Button>
                      )
                    )}
                  </div>
                )}

              {/* Actions */}
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Star className="mr-2 h-4 w-4" />
                    Helpful ({selectedAnnouncement.reactionsCount})
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Comments ({selectedAnnouncement.commentsCount})
                  </Button>
                </div>

                {canCreateAnnouncements &&
                  selectedAnnouncement.authorId === user?.id && (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePin(selectedAnnouncement.id)}
                      >
                        {selectedAnnouncement.isPinned ? (
                          <>
                            <PinOff className="mr-2 h-4 w-4" />
                            Unpin
                          </>
                        ) : (
                          <>
                            <Pin className="mr-2 h-4 w-4" />
                            Pin
                          </>
                        )}
                      </Button>
                    </div>
                  )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );

  if (variant === 'banner') {
    const urgentAnnouncements = filteredAnnouncements
      .filter(a => a.priority === 'critical' || a.priority === 'high')
      .slice(0, 1);

    if (urgentAnnouncements.length === 0) return null;

    const announcement = urgentAnnouncements[0];
    const IconComponent = ANNOUNCEMENT_ICONS[announcement.type];

    return (
      <div
        className={cn(
          'mb-4 rounded-lg border-l-4 p-4',
          announcement.priority === 'critical'
            ? 'border-red-500 bg-red-50'
            : 'border-orange-500 bg-orange-50',
          className
        )}
      >
        <div className="flex items-start space-x-3">
          <div
            className={cn(
              'mt-1 rounded-full p-2',
              announcement.priority === 'critical'
                ? 'bg-red-100 text-red-600'
                : 'bg-orange-100 text-orange-600'
            )}
          >
            <IconComponent className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 text-sm font-medium">{announcement.title}</h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {announcement.content}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {announcement.authorName} •{' '}
                {formatDistanceToNow(new Date(announcement.createdAt), {
                  addSuffix: true,
                })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedAnnouncement(announcement);
                  setIsViewDialogOpen(true);
                  handleMarkAsRead(announcement.id);
                }}
              >
                View Details
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => handleMarkAsRead(announcement.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-3', className)}>
        {isLoading ? (
          <div className="py-4 text-center">
            <div className="text-sm text-muted-foreground">
              Loading announcements...
            </div>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="py-8 text-center">
            <Megaphone className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              No announcements
            </div>
          </div>
        ) : (
          filteredAnnouncements.slice(0, 5).map(announcement => {
            const IconComponent = ANNOUNCEMENT_ICONS[announcement.type];
            const isUnread = !announcement.readBy.includes(user?.id || '');

            return (
              <div
                key={announcement.id}
                className={cn(
                  'flex cursor-pointer items-center space-x-3 rounded-lg p-3 hover:bg-muted/50',
                  isUnread && 'bg-blue-50/50'
                )}
                onClick={() => {
                  setSelectedAnnouncement(announcement);
                  setIsViewDialogOpen(true);
                  if (isUnread) handleMarkAsRead(announcement.id);
                }}
              >
                <div
                  className={cn(
                    'rounded-full p-2',
                    PRIORITY_COLORS[announcement.priority]
                  )}
                >
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'truncate text-sm',
                      isUnread && 'font-medium'
                    )}
                  >
                    {announcement.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {announcement.authorName} •{' '}
                    {formatDistanceToNow(new Date(announcement.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {announcement.isPinned && (
                  <Pin className="h-4 w-4 text-yellow-600" />
                )}
                {isUnread && (
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                )}
              </div>
            );
          })
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Announcements</h2>
          <p className="text-muted-foreground">
            Stay updated with important information
          </p>
        </div>

        {canCreateAnnouncements && showCreateButton && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Announcement
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Type: {filterType === 'all' ? 'All' : filterType}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterType('all')}>
              All Types
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {Object.keys(ANNOUNCEMENT_ICONS).map(type => (
              <DropdownMenuItem
                key={type}
                onClick={() => setFilterType(type as Announcement['type'])}
              >
                {React.createElement(
                  ANNOUNCEMENT_ICONS[type as keyof typeof ANNOUNCEMENT_ICONS],
                  { className: 'h-4 w-4 mr-2' }
                )}
                {type}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Priority: {filterPriority === 'all' ? 'All' : filterPriority}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterPriority('all')}>
              All Priorities
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilterPriority('low')}>
              Low
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPriority('normal')}>
              Normal
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPriority('high')}>
              High
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPriority('critical')}>
              Critical
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center space-x-2">
          <Switch
            checked={showPinnedOnly}
            onCheckedChange={setShowPinnedOnly}
          />
          <label className="text-sm font-medium">Pinned only</label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={showUnreadOnly}
            onCheckedChange={setShowUnreadOnly}
          />
          <label className="text-sm font-medium">Unread only</label>
        </div>
      </div>

      {/* Announcements */}
      {isLoading ? (
        <div className="py-8 text-center">
          <div className="text-sm text-muted-foreground">
            Loading announcements...
          </div>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="py-12 text-center">
          <Megaphone className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">No announcements found</h3>
          <p className="mb-4 text-muted-foreground">
            {searchQuery ||
            filterType !== 'all' ||
            filterPriority !== 'all' ||
            showPinnedOnly ||
            showUnreadOnly
              ? 'Try adjusting your filters'
              : 'No announcements have been posted yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map(renderAnnouncementCard)}
        </div>
      )}

      {/* Dialogs */}
      {renderCreateDialog()}
      {renderViewDialog()}
    </div>
  );
};

export default AnnouncementSystem;
