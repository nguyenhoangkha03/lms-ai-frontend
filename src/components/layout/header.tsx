'use client';

import React from 'react';
import Link from 'next/link';
import {
  Bell,
  Search,
  Settings,
  User,
  Menu,
  LogOut,
  Moon,
  Sun,
  ShoppingCart,
  MessageCircle,
  Eye,
  Plus,
  Users,
  School,
  Zap,
  FileText,
  Award,
  Target,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button, IconButton } from '@/components/ui/enhanced-button';
import { GlobalSearch } from '@/components/search/global-search';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { toggleSidebar } from '@/lib/redux/slices/ui-slice';
import { logout } from '@/lib/redux/slices/auth-slice';
import { useGetCartCountQuery } from '@/lib/redux/api/ecommerce-api';
import { useLogoutMutation } from '@/lib/redux/api/auth-api';
import { useRouter } from 'next/navigation';
import { AdvancedTokenManager } from '@/lib/auth/token-manager';
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
} from '@/lib/redux/api/notification-api';
import { useGetUserChatRoomsQuery } from '@/lib/redux/api/enhanced-chat-api';
import { useAuth } from '@/contexts/auth-context';
import Image from 'next/image';

interface HeaderProps {
  className?: string;
  showMenuButton?: boolean;
  onMenuClick?: () => void;
  variant?: 'default' | 'compact' | 'mobile';
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  const dispatch = useAppDispatch();
  const [logoutMutation] = useLogoutMutation();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);
  const { user } = useAppSelector(state => state.auth);
  const { sidebarCollapsed } = useAppSelector(state => state.ui);
  const { user: authUser } = useAuth();

  const { data: cartCount } = useGetCartCountQuery(undefined, {
    skip: !authUser || !user,
  });

  const { data: unreadCount } = useGetUnreadCountQuery(undefined, {
    skip: !authUser || !user,
    pollingInterval: 30000, // Poll every 30 seconds
  });

  const { data: recentNotifications } = useGetNotificationsQuery(
    {
      page: 1,
      limit: 5,
      sortBy: 'newest',
    },
    {
      skip: !authUser || !user,
      pollingInterval: 60000, // Poll every minute
    }
  );

  const { data: chatRooms = [] } = useGetUserChatRoomsQuery(
    {},
    {
      skip: !authUser || !user,
      pollingInterval: 30000, // Poll every 30 seconds for new messages
    }
  );

  const handleLogout = async () => {
    try {
      // Call logout API to clear session on backend
      await logoutMutation().unwrap();

      // Clear tokens from localStorage
      AdvancedTokenManager.clearTokens();

      // Clear all cookies
      document.cookie.split(';').forEach(c => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });

      // Dispatch logout action to clear Redux state
      dispatch(logout());

      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, clear local data and redirect
      AdvancedTokenManager.clearTokens();
      dispatch(logout());
      router.push('/login');
    }
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-lg',
        className
      )}
    >
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Section */}
        <div className="ml-[-85px] flex items-center gap-4">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative flex items-center justify-center">
              {/* Static elegant glow ring */}
              <div
                className="absolute inset-0 rounded-full opacity-60"
                style={{
                  background:
                    'conic-gradient(from 0deg, #3B82F6, #8B5CF6, #EC4899, #3B82F6)',
                  filter: 'blur(6px)',
                  padding: '3px',
                }}
              />

              {/* Logo container with subtle hover effect */}
              <motion.div
                className="relative z-10 rounded-full border border-gray-100 bg-white p-1.5 shadow-lg"
                whileHover={{
                  scale: 1.05,
                  shadow:
                    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Image
                  src="/logo-no-background.png"
                  alt="Learnary Logo"
                  width={42}
                  height={42}
                  className="rounded-full"
                />

                {/* Subtle inner glow */}
                <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-blue-50/50 to-purple-50/50" />
              </motion.div>
            </div>

            <div className="flex flex-col items-start">
              <motion.span
                className="text-2xl font-extrabold"
                style={{
                  background:
                    'linear-gradient(135deg, #1E293B 0%, #3B82F6 50%, #8B5CF6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 2px 4px rgb(0 0 0 / 0.1))',
                }}
                whileHover={{
                  scale: 1.05,
                  filter: 'drop-shadow(0 4px 8px rgb(0 0 0 / 0.15))',
                }}
              >
                Learnary
              </motion.span>
              <motion.span
                className="text-xs font-medium uppercase tracking-widest text-gray-500"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Learn • Grow • Achieve
              </motion.span>
            </div>
          </motion.div>
        </div>

        {/* Center Section - Search */}
        <div className="mx-4 hidden max-w-lg flex-1 md:flex">
          <GlobalSearch
            className="w-full"
            placeholder="Search courses, lessons, or ask AI..."
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Search for mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 md:hidden"
            aria-label="Search"
          >
            <Search className="h-4 w-4 text-gray-600" />
          </Button>

          {/* Messages */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative h-10 w-10 rounded-lg border border-gray-200 bg-gray-50 transition-all duration-200 hover:bg-gray-100"
                aria-label="Messages"
              >
                <MessageCircle className="h-4 w-4 text-gray-600" />
                {chatRooms.reduce(
                  (total, room) => total + (room.unreadCount || 0),
                  0
                ) > 0 && (
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-blue-500">
                    <span className="text-xs font-bold text-white">
                      {chatRooms.reduce(
                        (total, room) => total + (room.unreadCount || 0),
                        0
                      ) > 99
                        ? '99+'
                        : chatRooms.reduce(
                            (total, room) => total + (room.unreadCount || 0),
                            0
                          )}
                    </span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-96 rounded-xl border bg-white p-0 shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Messages</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/student/messages')}
                  className="text-blue-600 hover:bg-blue-100"
                >
                  <Eye className="mr-1 h-4 w-4" />
                  View All
                </Button>
              </div>

              {/* Messages List */}
              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-1 p-2">
                  {chatRooms.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <MessageCircle className="mx-auto mb-2 h-8 w-8" />
                      <p>No conversations yet</p>
                    </div>
                  ) : (
                    chatRooms.slice(0, 4).map(room => {
                      const getRoomIcon = () => {
                        switch (room.roomType) {
                          case 'direct':
                            return <User className="h-4 w-4" />;
                          case 'group':
                            return <Users className="h-4 w-4" />;
                          case 'course':
                            return <School className="h-4 w-4" />;
                          default:
                            return <MessageCircle className="h-4 w-4" />;
                        }
                      };

                      const getBorderColor = () => {
                        switch (room.roomType) {
                          case 'direct':
                            return 'border-green-200';
                          case 'group':
                            return 'border-purple-200';
                          case 'course':
                            return 'border-orange-200';
                          default:
                            return 'border-gray-200';
                        }
                      };

                      const getBgColor = () => {
                        switch (room.roomType) {
                          case 'direct':
                            return 'bg-green-100 text-green-700';
                          case 'group':
                            return 'bg-purple-100 text-purple-700';
                          case 'course':
                            return 'bg-orange-100 text-orange-700';
                          default:
                            return 'bg-gray-100 text-gray-700';
                        }
                      };

                      const getRoomTypeName = () => {
                        switch (room.roomType) {
                          case 'direct':
                            return 'Direct Message';
                          case 'group':
                            return 'Group';
                          case 'course':
                            return 'Course';
                          default:
                            return 'Chat';
                        }
                      };

                      const formatTime = (timestamp: string) => {
                        const localTimestamp = timestamp.replace('Z', '');
                        const date = new Date(localTimestamp);
                        const now = new Date();

                        const diff = now.getTime() - date.getTime();
                        const minutes = Math.floor(diff / (1000 * 60));
                        const hours = Math.floor(minutes / 60);
                        const days = Math.floor(hours / 24);

                        if (minutes < 1) {
                          return 'Just now';
                        } else if (minutes < 60) {
                          return `${minutes}m ago`;
                        } else if (hours < 24) {
                          return `${hours}h ago`;
                        } else if (days === 1) {
                          return 'Yesterday';
                        } else if (days < 7) {
                          return `${days}d ago`;
                        } else {
                          return date.toLocaleDateString('en-US');
                        }
                      };

                      return (
                        <div
                          key={room.id}
                          className="group flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
                          onClick={() => router.push('/student/messages')}
                        >
                          <Avatar
                            className={`h-10 w-10 border-2 ${getBorderColor()}`}
                          >
                            <AvatarImage src={room.avatarUrl} />
                            <AvatarFallback
                              className={`${getBgColor()} text-sm font-medium`}
                            >
                              {getRoomIcon()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center justify-between">
                              <h4 className="truncate text-sm font-medium text-gray-800">
                                {room.name}
                              </h4>
                              <div className="flex items-center gap-1">
                                {room.unreadCount! > 0 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {room.unreadCount! > 99
                                      ? '99+'
                                      : room.unreadCount}
                                  </Badge>
                                )}
                                <span className="text-xs text-gray-500">
                                  {room.lastMessage &&
                                    formatTime(room.lastMessageAt!)}
                                </span>
                              </div>
                            </div>
                            <p className="truncate text-sm text-gray-600">
                              {room.lastMessage || 'No messages yet'}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="px-2 py-0 text-xs"
                              >
                                {getRoomTypeName()}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {room.participantCount} members
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between rounded-b-xl border-t bg-gray-50 p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-blue-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Group
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-blue-600"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative h-10 w-10 rounded-lg border border-gray-200 bg-gray-50 transition-all duration-200 hover:border-blue-300 hover:bg-gray-100 hover:shadow-sm"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4 text-gray-600" />
                {(unreadCount?.count || 0) > 0 && (
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-red-500">
                    <span className="text-xs font-bold text-white">
                      {(unreadCount?.count || 0) > 99
                        ? '99+'
                        : unreadCount?.count || 0}
                    </span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-96 rounded-xl border bg-white p-0 shadow-xl"
              sideOffset={8}
            >
              {/* Header */}
              <div className="flex items-center justify-between rounded-t-xl border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  {(unreadCount?.count || 0) > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700"
                    >
                      {unreadCount?.count} new
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/student/notifications')}
                  className="text-blue-600 hover:bg-blue-100"
                >
                  <Eye className="mr-1 h-4 w-4" />
                  View All
                </Button>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-1 p-2">
                  {recentNotifications?.notifications?.length ? (
                    recentNotifications.notifications.map(
                      (notification, index) => {
                        const getNotificationIcon = () => {
                          switch (notification.type) {
                            case 'course_enrollment':
                              return (
                                <School className="h-4 w-4 text-green-500" />
                              );
                            case 'lesson_available':
                              return (
                                <School className="h-4 w-4 text-blue-500" />
                              );
                            case 'assignment_due':
                              return (
                                <FileText className="h-4 w-4 text-orange-500" />
                              );
                            case 'grade_posted':
                              return (
                                <Award className="h-4 w-4 text-green-500" />
                              );
                            case 'video_session_starting':
                              return (
                                <Users className="h-4 w-4 text-purple-500" />
                              );
                            case 'message_received':
                              return (
                                <MessageCircle className="h-4 w-4 text-blue-500" />
                              );
                            case 'course_completed':
                              return (
                                <Target className="h-4 w-4 text-green-500" />
                              );
                            case 'study_group_invitation':
                              return (
                                <Users className="h-4 w-4 text-indigo-500" />
                              );
                            case 'reminder_study':
                              return (
                                <Clock className="h-4 w-4 text-amber-500" />
                              );
                            case 'system_maintenance':
                              return (
                                <Settings className="h-4 w-4 text-gray-500" />
                              );
                            case 'announcement':
                              return <Bell className="h-4 w-4 text-blue-500" />;
                            default:
                              return <Bell className="h-4 w-4 text-gray-500" />;
                          }
                        };

                        const getPriorityColor = () => {
                          switch (notification.priority) {
                            case 'urgent':
                              return 'border-l-red-500 bg-red-50/30';
                            case 'high':
                              return 'border-l-orange-500 bg-orange-50/30';
                            case 'medium':
                              return 'border-l-yellow-500 bg-yellow-50/30';
                            default:
                              return !notification.isRead
                                ? 'border-l-blue-500 bg-blue-50/30'
                                : 'border-l-gray-200';
                          }
                        };

                        const formatTime = (timestamp: string) => {
                          const date = new Date(timestamp);
                          const now = new Date();
                          const diff = now.getTime() - date.getTime();
                          const minutes = Math.floor(diff / (1000 * 60));
                          const hours = Math.floor(minutes / 60);
                          const days = Math.floor(hours / 24);

                          if (minutes < 1) return 'Just now';
                          if (minutes < 60) return `${minutes}m ago`;
                          if (hours < 24) return `${hours}h ago`;
                          return `${days}d ago`;
                        };

                        return (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`group cursor-pointer rounded-lg border-l-4 p-3 transition-all hover:shadow-sm ${getPriorityColor()}`}
                            onClick={() => {
                              if (notification.actionUrl) {
                                router.push(notification.actionUrl);
                              }
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 flex-shrink-0">
                                {getNotificationIcon()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-start justify-between">
                                  <h4
                                    className={`text-sm font-medium leading-tight ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}
                                  >
                                    {notification.title}
                                  </h4>
                                  <div className="ml-2 flex items-center gap-1">
                                    <span className="whitespace-nowrap text-xs text-gray-500">
                                      {formatTime(notification.createdAt)}
                                    </span>
                                    {!notification.isRead && (
                                      <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
                                    )}
                                  </div>
                                </div>
                                <p className="line-clamp-2 text-sm leading-snug text-gray-600">
                                  {notification.message}
                                </p>
                                {(notification.category ||
                                  notification.priority === 'urgent') && (
                                  <div className="mt-2 flex items-center gap-2">
                                    {notification.category && (
                                      <Badge
                                        variant="outline"
                                        className="px-2 py-0 text-xs"
                                      >
                                        {notification.category === 'academic'
                                          ? '📚 Academic'
                                          : notification.category === 'social'
                                            ? '👥 Social'
                                            : notification.category === 'system'
                                              ? '⚙️ System'
                                              : notification.category ===
                                                  'video_session'
                                                ? '📹 Live'
                                                : '📢 Other'}
                                      </Badge>
                                    )}
                                    {notification.priority === 'urgent' && (
                                      <Badge className="border-red-200 bg-red-100 px-2 py-0 text-xs text-red-700">
                                        🚨 Urgent
                                      </Badge>
                                    )}
                                    {notification.priority === 'high' && (
                                      <Badge className="border-orange-200 bg-orange-100 px-2 py-0 text-xs text-orange-700">
                                        ⚡ Important
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      }
                    )
                  ) : (
                    <div className="p-8 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        <Bell className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="mb-1 font-medium text-gray-900">
                        No notifications
                      </h3>
                      <p className="text-sm text-gray-500">
                        New notifications will appear here
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              {recentNotifications?.notifications?.length > 0 && (
                <div className="rounded-b-xl border-t bg-gray-50 p-3">
                  <Button
                    variant="ghost"
                    className="w-full font-medium text-blue-600 hover:bg-blue-100"
                    onClick={() => router.push('/student/notifications')}
                  >
                    View all {recentNotifications.total || 0} notifications
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cart */}
          <Button
            variant="ghost"
            size="sm"
            className="relative h-10 w-10 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100"
            aria-label="Shopping Cart"
            onClick={() => router.push('/student/cart')}
            data-cart-icon
          >
            <ShoppingCart className="h-4 w-4 text-gray-600" />
            {(cartCount?.count || 0) > 0 && (
              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500">
                <span className="text-xs font-bold text-white">
                  {(cartCount?.count || 0) > 99 ? '99+' : cartCount?.count || 0}
                </span>
              </div>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative rounded-lg border border-gray-200 bg-gray-50 p-1 hover:bg-gray-100"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl} alt={user?.displayName} />
                  <AvatarFallback className="bg-blue-500 font-semibold text-white">
                    {isClient
                      ? user?.displayName
                          ?.split(' ')
                          .map(n => n[0])
                          .join('') ||
                        `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}` ||
                        'U'
                      : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.displayName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/student/me" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleTheme}>
                <div className="flex items-center">
                  {theme === 'dark' ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}
                  <span>Toggle theme</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
