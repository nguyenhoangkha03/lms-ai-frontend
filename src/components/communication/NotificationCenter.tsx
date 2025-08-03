'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  Settings,
  Search,
  Filter,
  Check,
  CheckCheck,
  Trash2,
  MoreVertical,
  MessageSquare,
  GraduationCap,
  Trophy,
  AlertTriangle,
  Info,
  FileText,
  Users,
  BookOpen,
  Video,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type:
    | 'course_enrollment'
    | 'lesson_available'
    | 'assignment_due'
    | 'quiz_available'
    | 'grade_posted'
    | 'message_received'
    | 'video_session_starting'
    | 'certificate_earned'
    | 'course_completed'
    | 'reminder_study'
    | 'system_maintenance'
    | 'security_alert'
    | 'announcement'
    | 'friend_request'
    | 'forum_reply';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category:
    | 'academic'
    | 'social'
    | 'system'
    | 'security'
    | 'marketing'
    | 'administrative';
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  actionUrl?: string;
  iconUrl?: string;
  imageUrl?: string;
  metadata?: any;
  actions?: NotificationAction[];
}

interface NotificationAction {
  id: string;
  label: string;
  url?: string;
  action?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

interface NotificationPreferences {
  email: {
    courses: boolean;
    assignments: boolean;
    messages: boolean;
    achievements: boolean;
    systemAlerts: boolean;
    weeklyDigest: boolean;
  };
  push: {
    courses: boolean;
    assignments: boolean;
    messages: boolean;
    achievements: boolean;
    systemAlerts: boolean;
    immediateOnly: boolean;
  };
  inApp: {
    courses: boolean;
    assignments: boolean;
    messages: boolean;
    achievements: boolean;
    systemAlerts: boolean;
    showPreviews: boolean;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const NOTIFICATION_ICONS = {
  course_enrollment: BookOpen,
  lesson_available: Video,
  assignment_due: FileText,
  quiz_available: FileText,
  grade_posted: Trophy,
  message_received: MessageSquare,
  video_session_starting: Video,
  certificate_earned: Trophy,
  course_completed: GraduationCap,
  reminder_study: Clock,
  system_maintenance: Settings,
  security_alert: AlertTriangle,
  announcement: Info,
  friend_request: Users,
  forum_reply: MessageSquare,
};

const PRIORITY_COLORS = {
  low: 'text-gray-500',
  normal: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
};

const CATEGORY_COLORS = {
  academic: 'bg-blue-100 text-blue-800',
  social: 'bg-green-100 text-green-800',
  system: 'bg-gray-100 text-gray-800',
  security: 'bg-red-100 text-red-800',
  marketing: 'bg-purple-100 text-purple-800',
  administrative: 'bg-yellow-100 text-yellow-800',
};

interface NotificationCenterProps {
  className?: string;
  variant?: 'sidebar' | 'modal' | 'embedded';
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  className,
  variant = 'modal',
}) => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      courses: true,
      assignments: true,
      messages: true,
      achievements: true,
      systemAlerts: true,
      weeklyDigest: true,
    },
    push: {
      courses: true,
      assignments: true,
      messages: true,
      achievements: false,
      systemAlerts: true,
      immediateOnly: false,
    },
    inApp: {
      courses: true,
      assignments: true,
      messages: true,
      achievements: true,
      systemAlerts: true,
      showPreviews: true,
    },
    frequency: 'immediate',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | Notification['type']>(
    'all'
  );
  const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>(
    'all'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );

  // Load notifications
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);

      // Mock API call - replace with actual API
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'New Assignment Available',
          message: 'React Advanced Patterns assignment has been posted',
          type: 'assignment_due',
          priority: 'high',
          category: 'academic',
          isRead: false,
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          actionUrl: '/assignments/react-patterns',
          actions: [
            {
              id: 'view',
              label: 'View Assignment',
              url: '/assignments/react-patterns',
            },
            { id: 'remind', label: 'Remind Later', action: 'remind' },
          ],
        },
        {
          id: '2',
          title: 'Course Completed!',
          message:
            'Congratulations! You have completed JavaScript Fundamentals',
          type: 'course_completed',
          priority: 'normal',
          category: 'academic',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          actionUrl: '/certificates/js-fundamentals',
          actions: [
            {
              id: 'certificate',
              label: 'View Certificate',
              url: '/certificates/js-fundamentals',
            },
            { id: 'share', label: 'Share Achievement', action: 'share' },
          ],
        },
        {
          id: '3',
          title: 'New Message from John Doe',
          message: 'Hey, can you help me with the React hooks assignment?',
          type: 'message_received',
          priority: 'normal',
          category: 'social',
          isRead: true,
          readAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          actionUrl: '/messages/john-doe',
          actions: [{ id: 'reply', label: 'Reply', url: '/messages/john-doe' }],
        },
        {
          id: '4',
          title: 'System Maintenance',
          message: 'Scheduled maintenance will occur tonight from 2-4 AM EST',
          type: 'system_maintenance',
          priority: 'normal',
          category: 'system',
          isRead: true,
          readAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch =
      searchQuery === '' ||
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      filterType === 'all' || notification.type === filterType;
    const matchesRead =
      filterRead === 'all' ||
      (filterRead === 'read' && notification.isRead) ||
      (filterRead === 'unread' && !notification.isRead);

    return matchesSearch && matchesType && matchesRead;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      );

      // API call to mark as read
      // await api.notifications.markAsRead(notificationId);
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev =>
        prev.map(n => ({
          ...n,
          isRead: true,
          readAt: new Date().toISOString(),
        }))
      );

      // API call
      // await api.notifications.markAllAsRead();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      // API call
      // await api.notifications.delete(notificationId);
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationAction = async (
    notification: Notification,
    action: NotificationAction
  ) => {
    if (action.url) {
      window.location.href = action.url;
    } else if (action.action) {
      // Handle custom actions
      switch (action.action) {
        case 'remind':
          toast.success('Reminder set for later');
          break;
        case 'share':
          // Handle sharing
          toast.success('Achievement shared!');
          break;
        default:
          break;
      }
    }

    // Mark as read when action is taken
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  const updatePreferences = async (
    newPreferences: Partial<NotificationPreferences>
  ) => {
    try {
      setPreferences(prev => ({ ...prev, ...newPreferences }));

      // API call
      // await api.notifications.updatePreferences(newPreferences);
      toast.success('Preferences updated');
    } catch (error) {
      toast.error('Failed to update preferences');
    }
  };

  const renderNotification = (notification: Notification) => {
    const IconComponent = NOTIFICATION_ICONS[notification.type] || Bell;

    return (
      <Card
        key={notification.id}
        className={cn(
          'cursor-pointer transition-colors hover:bg-muted/50',
          !notification.isRead && 'border-l-4 border-l-blue-500 bg-blue-50/50'
        )}
        onClick={() => {
          if (!notification.isRead) markAsRead(notification.id);
          if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
          }
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div
              className={cn(
                'mt-1 rounded-full p-2',
                notification.isRead
                  ? 'bg-muted'
                  : 'bg-primary text-primary-foreground'
              )}
            >
              <IconComponent className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <h4
                      className={cn(
                        'truncate text-sm font-medium',
                        !notification.isRead && 'font-semibold'
                      )}
                    >
                      {notification.title}
                    </h4>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-xs',
                        CATEGORY_COLORS[notification.category]
                      )}
                    >
                      {notification.category}
                    </Badge>
                  </div>

                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {notification.message}
                  </p>

                  <div className="mt-2 flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    <span
                      className={cn(
                        'font-medium',
                        PRIORITY_COLORS[notification.priority]
                      )}
                    >
                      {notification.priority}
                    </span>
                    {notification.isRead && (
                      <span className="flex items-center space-x-1">
                        <Check className="h-3 w-3" />
                        <span>Read</span>
                      </span>
                    )}
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
                    {!notification.isRead && (
                      <DropdownMenuItem
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Mark as Read
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Actions */}
              {notification.actions && notification.actions.length > 0 && (
                <div className="flex gap-2 pt-2">
                  {notification.actions.map(action => (
                    <Button
                      key={action.id}
                      variant={action.variant || 'outline'}
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        handleNotificationAction(notification, action);
                      }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPreferences = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-medium">Email Notifications</h3>
        <div className="space-y-4">
          {Object.entries(preferences.email).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <div className="font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Receive email notifications for {key.toLowerCase()}
                </div>
              </div>
              <Switch
                checked={value}
                onCheckedChange={checked => {
                  updatePreferences({
                    email: { ...preferences.email, [key]: checked },
                  });
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-4 text-lg font-medium">Push Notifications</h3>
        <div className="space-y-4">
          {Object.entries(preferences.push).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <div className="font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Receive push notifications for {key.toLowerCase()}
                </div>
              </div>
              <Switch
                checked={value}
                onCheckedChange={checked => {
                  updatePreferences({
                    push: { ...preferences.push, [key]: checked },
                  });
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-4 text-lg font-medium">In-App Notifications</h3>
        <div className="space-y-4">
          {Object.entries(preferences.inApp).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <div className="font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Show in-app notifications for {key.toLowerCase()}
                </div>
              </div>
              <Switch
                checked={value}
                onCheckedChange={checked => {
                  updatePreferences({
                    inApp: { ...preferences.inApp, [key]: checked },
                  });
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const notificationContent = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>

          <div className="flex space-x-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Type:{' '}
                  {filterType === 'all' ? 'All' : filterType.replace('_', ' ')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterType('all')}>
                  All Types
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {Object.keys(NOTIFICATION_ICONS).map(type => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => setFilterType(type as Notification['type'])}
                  >
                    {type.replace('_', ' ')}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Status: {filterRead === 'all' ? 'All' : filterRead}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterRead('all')}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRead('unread')}>
                  Unread
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRead('read')}>
                  Read
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content */}
      <Tabs defaultValue="notifications" className="flex flex-1 flex-col">
        <TabsList className="mx-4 mt-4">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="m-0 flex-1">
          <ScrollArea className="h-full p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">
                  Loading notifications...
                </div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Bell className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    {searchQuery || filterType !== 'all' || filterRead !== 'all'
                      ? 'No notifications match your filters'
                      : 'No notifications yet'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map(renderNotification)}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="preferences" className="m-0 flex-1">
          <ScrollArea className="h-full p-4">{renderPreferences()}</ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (variant === 'embedded') {
    return (
      <Card className={cn('h-full', className)}>{notificationContent}</Card>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className={cn('h-full border-r bg-background', className)}>
        {notificationContent}
      </div>
    );
  }

  // Modal variant (default)
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full p-0 sm:w-[600px]">
        <SheetHeader className="sr-only">
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            Manage your notifications and preferences
          </SheetDescription>
        </SheetHeader>
        {notificationContent}
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenter;
