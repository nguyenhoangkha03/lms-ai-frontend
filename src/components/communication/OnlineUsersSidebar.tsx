'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  Search,
  MessageCircle,
  UserPlus,
  Filter,
  MoreVertical,
  Circle,
  Crown,
  GraduationCap,
  BookOpen,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnlinePresence } from './UserPresenceIndicator';

interface OnlineUser extends OnlinePresence {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'student' | 'teacher' | 'admin';
  avatarUrl?: string;
  currentRoom?: string;
  joinedAt?: string;
}

interface OnlineUsersSidebarProps {
  className?: string;
  showRoomFilter?: boolean;
  currentRoomId?: string;
  onUserSelect?: (user: OnlineUser) => void;
  onStartChat?: (user: OnlineUser) => void;
}

const STATUS_COLORS = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
  offline: 'bg-gray-400',
};

const USER_TYPE_ICONS = {
  admin: Shield,
  teacher: GraduationCap,
  student: BookOpen,
};

const USER_TYPE_COLORS = {
  admin: 'text-purple-600',
  teacher: 'text-blue-600',
  student: 'text-green-600',
};

export const OnlineUsersSidebar: React.FC<OnlineUsersSidebarProps> = ({
  className,
  showRoomFilter = true,
  currentRoomId,
  onUserSelect,
  onStartChat,
}) => {
  const { user: currentUser } = useAuth();
  const { socket, connected } = useSocket();

  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | OnlinePresence['status']
  >('all');
  const [filterUserType, setFilterUserType] = useState<
    'all' | OnlineUser['userType']
  >('all');
  const [isLoading, setIsLoading] = useState(true);

  // Listen for presence updates
  useEffect(() => {
    if (!socket || !connected) return;

    const handlePresenceUpdate = (data: OnlinePresence) => {
      setOnlineUsers(prev => {
        const userIndex = prev.findIndex(u => u.userId === data.userId);
        if (userIndex >= 0) {
          const updated = [...prev];
          updated[userIndex] = { ...updated[userIndex], ...data };
          return updated;
        }
        return prev;
      });
    };

    const handleUserOnline = (userData: OnlineUser) => {
      setOnlineUsers(prev => {
        const exists = prev.find(u => u.userId === userData.id);
        if (exists) {
          return prev.map(u =>
            u.userId === userData.id ? { ...u, ...userData } : u
          );
        }
        return [...prev, { ...userData, userId: userData.id }];
      });
    };

    const handleUserOffline = (data: { userId: string }) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
    };

    const handleBulkPresence = (users: OnlineUser[]) => {
      setOnlineUsers(users.map(u => ({ ...u, userId: u.id })));
      setIsLoading(false);
    };

    // Socket event listeners
    socket.on('presence:update', handlePresenceUpdate);
    socket.on('user:online', handleUserOnline);
    socket.on('user:offline', handleUserOffline);
    socket.on('presence:bulk', handleBulkPresence);
    socket.on('room:users', handleBulkPresence);

    // Request initial data
    socket.emit('presence:get_all');
    if (currentRoomId) {
      socket.emit('room:get_users', { roomId: currentRoomId });
    }

    return () => {
      socket.off('presence:update', handlePresenceUpdate);
      socket.off('user:online', handleUserOnline);
      socket.off('user:offline', handleUserOffline);
      socket.off('presence:bulk', handleBulkPresence);
      socket.off('room:users', handleBulkPresence);
    };
  }, [socket, connected, currentRoomId]);

  // Filter users based on search and filters
  const filteredUsers = onlineUsers.filter(user => {
    // Search filter
    const matchesSearch =
      searchQuery === '' ||
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      filterStatus === 'all' || user.status === filterStatus;

    // User type filter
    const matchesUserType =
      filterUserType === 'all' || user.userType === filterUserType;

    // Room filter (if enabled)
    const matchesRoom =
      !showRoomFilter || !currentRoomId || user.currentRoom === currentRoomId;

    return matchesSearch && matchesStatus && matchesUserType && matchesRoom;
  });

  // Group users by status
  const groupedUsers = filteredUsers.reduce(
    (acc, user) => {
      if (!acc[user.status]) acc[user.status] = [];
      acc[user.status].push(user);
      return acc;
    },
    {} as Record<string, OnlineUser[]>
  );

  const handleUserClick = (user: OnlineUser) => {
    onUserSelect?.(user);
  };

  const handleStartChat = (user: OnlineUser) => {
    onStartChat?.(user);
  };

  const getStatusText = (status: OnlinePresence['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const renderUser = (user: OnlineUser) => {
    const IconComponent = USER_TYPE_ICONS[user.userType];
    const isCurrentUser = user.userId === currentUser?.id;

    return (
      <TooltipProvider key={user.userId}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'flex cursor-pointer items-center space-x-3 rounded-lg p-2 transition-colors hover:bg-muted/50',
                isCurrentUser && 'bg-muted/30'
              )}
              onClick={() => handleUserClick(user)}
            >
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="text-xs">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white',
                    STATUS_COLORS[user.status]
                  )}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1">
                  <span className="truncate text-sm font-medium">
                    {user.firstName} {user.lastName}
                    {isCurrentUser && (
                      <span className="text-muted-foreground"> (You)</span>
                    )}
                  </span>
                  <IconComponent
                    className={cn('h-3 w-3', USER_TYPE_COLORS[user.userType])}
                  />
                </div>

                {user.currentRoom && showRoomFilter && (
                  <div className="truncate text-xs text-muted-foreground">
                    In: {user.currentRoom}
                  </div>
                )}
              </div>

              {!isCurrentUser && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      onClick={e => e.stopPropagation()}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStartChat(user)}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Start Chat
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserPlus className="mr-2 h-4 w-4" />
                      View Profile
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="left">
            <div className="text-center">
              <div className="font-medium">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
              <div className="text-xs capitalize text-muted-foreground">
                {user.userType}
              </div>
              <div className="mt-1 flex items-center text-xs text-muted-foreground">
                <Circle
                  className={cn(
                    'mr-1 h-2 w-2 fill-current',
                    STATUS_COLORS[user.status]
                  )}
                />
                {getStatusText(user.status)}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Card className={cn('flex h-full flex-col', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <CardTitle className="text-lg">Online Users</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {filteredUsers.length}
          </Badge>
        </div>
        <CardDescription>
          {connected ? 'Currently active users' : 'Connecting...'}
        </CardDescription>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Filter className="mr-2 h-4 w-4" />
                Status:{' '}
                {filterStatus === 'all' ? 'All' : getStatusText(filterStatus)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {Object.keys(STATUS_COLORS).map(status => (
                <DropdownMenuItem
                  key={status}
                  onClick={() =>
                    setFilterStatus(status as OnlinePresence['status'])
                  }
                >
                  <Circle
                    className={cn(
                      'mr-2 h-3 w-3 fill-current',
                      STATUS_COLORS[status as keyof typeof STATUS_COLORS]
                    )}
                  />
                  {getStatusText(status as OnlinePresence['status'])}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Crown className="mr-2 h-4 w-4" />
                {filterUserType === 'all' ? 'All' : filterUserType}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterUserType('all')}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {Object.entries(USER_TYPE_ICONS).map(([type, Icon]) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() =>
                    setFilterUserType(type as OnlineUser['userType'])
                  }
                >
                  <Icon
                    className={cn(
                      'mr-2 h-4 w-4',
                      USER_TYPE_COLORS[type as keyof typeof USER_TYPE_COLORS]
                    )}
                  />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-3">
        <ScrollArea className="h-full">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  No users found
                </div>
                {searchQuery && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Try adjusting your search or filters
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Online Users First */}
              {groupedUsers.online && groupedUsers.online.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 px-2">
                    <Circle className="h-3 w-3 fill-current text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      Online ({groupedUsers.online.length})
                    </span>
                  </div>
                  <div className="group space-y-1">
                    {groupedUsers.online.map(renderUser)}
                  </div>
                </div>
              )}

              {/* Away Users */}
              {groupedUsers.away && groupedUsers.away.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 px-2">
                    <Circle className="h-3 w-3 fill-current text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-600">
                      Away ({groupedUsers.away.length})
                    </span>
                  </div>
                  <div className="group space-y-1">
                    {groupedUsers.away.map(renderUser)}
                  </div>
                </div>
              )}

              {/* Busy Users */}
              {groupedUsers.busy && groupedUsers.busy.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 px-2">
                    <Circle className="h-3 w-3 fill-current text-red-500" />
                    <span className="text-sm font-medium text-red-600">
                      Busy ({groupedUsers.busy.length})
                    </span>
                  </div>
                  <div className="group space-y-1">
                    {groupedUsers.busy.map(renderUser)}
                  </div>
                </div>
              )}

              {/* Offline Users */}
              {groupedUsers.offline && groupedUsers.offline.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 px-2">
                    <Circle className="h-3 w-3 fill-current text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      Offline ({groupedUsers.offline.length})
                    </span>
                  </div>
                  <div className="group space-y-1">
                    {groupedUsers.offline.map(renderUser)}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default OnlineUsersSidebar;
