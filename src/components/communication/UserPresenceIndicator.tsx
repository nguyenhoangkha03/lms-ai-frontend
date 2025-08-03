'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Circle, Clock, Minus, X, ChevronDown, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface OnlinePresence {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: string;
  currentRoom?: string;
  device: 'web' | 'mobile' | 'desktop';
  customMessage?: string;
  isVisible?: boolean;
}

interface UserPresenceIndicatorProps {
  userId?: string;
  showStatus?: boolean;
  showStatusText?: boolean;
  showDropdown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'compact' | 'full' | 'badge-only';
  className?: string;
}

const STATUS_CONFIG = {
  online: {
    color: 'bg-green-500',
    text: 'Online',
    icon: Circle,
    description: 'Available for communication',
  },
  away: {
    color: 'bg-yellow-500',
    text: 'Away',
    icon: Clock,
    description: 'Temporarily away',
  },
  busy: {
    color: 'bg-red-500',
    text: 'Busy',
    icon: Minus,
    description: 'Do not disturb',
  },
  offline: {
    color: 'bg-gray-400',
    text: 'Offline',
    icon: X,
    description: 'Not available',
  },
};

const DEVICE_ICONS = {
  web: '🌐',
  mobile: '📱',
  desktop: '🖥️',
};

export const UserPresenceIndicator: React.FC<UserPresenceIndicatorProps> = ({
  userId,
  showStatus = true,
  showStatusText = false,
  showDropdown = false,
  size = 'md',
  variant = 'compact',
  className,
}) => {
  const { user } = useAuth();
  const { socket, connected } = useSocket();

  const [presence, setPresence] = useState<OnlinePresence>({
    userId: userId || user?.id || '',
    status: 'offline',
    lastSeen: new Date().toISOString(),
    device: 'web',
    isVisible: true,
  });

  const [isSettingStatus, setIsSettingStatus] = useState(false);

  const currentUserId = userId || user?.id;
  const isOwnPresence = currentUserId === user?.id;

  // Listen for presence updates
  useEffect(() => {
    if (!socket || !currentUserId) return;

    const handlePresenceUpdate = (data: OnlinePresence) => {
      if (data.userId === currentUserId) {
        setPresence(prev => ({ ...prev, ...data }));
      }
    };

    const handleBulkPresence = (users: OnlinePresence[]) => {
      const userPresence = users.find(u => u.userId === currentUserId);
      if (userPresence) {
        setPresence(prev => ({ ...prev, ...userPresence }));
      }
    };

    socket.on('presence:update', handlePresenceUpdate);
    socket.on('presence:bulk', handleBulkPresence);

    // Request current presence
    if (connected) {
      socket.emit('presence:get', { userId: currentUserId });
    }

    return () => {
      socket.off('presence:update', handlePresenceUpdate);
      socket.off('presence:bulk', handleBulkPresence);
    };
  }, [socket, connected, currentUserId]);

  const updatePresenceStatus = async (
    status: OnlinePresence['status'],
    customMessage?: string
  ) => {
    if (!socket || !isOwnPresence) return;

    setIsSettingStatus(true);

    try {
      const updateData = {
        status,
        customMessage,
        device: getDeviceType(),
        isVisible: status !== 'offline',
      };

      socket.emit('presence:update', updateData);

      setPresence(prev => ({
        ...prev,
        ...updateData,
        lastSeen: new Date().toISOString(),
      }));

      toast.success(`Status updated to ${STATUS_CONFIG[status].text}`);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsSettingStatus(false);
    }
  };

  const getDeviceType = (): OnlinePresence['device'] => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent;
      if (/Mobi|Android/i.test(userAgent)) return 'mobile';
      if (/Electron/i.test(userAgent)) return 'desktop';
    }
    return 'web';
  };

  const getLastSeenText = () => {
    if (presence.status === 'online') return 'Active now';

    const lastSeen = new Date(presence.lastSeen);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - lastSeen.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const statusConfig = STATUS_CONFIG[presence.status];
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  if (variant === 'badge-only') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('relative', className)}>
              <div
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white',
                  statusConfig.color,
                  size === 'sm'
                    ? 'h-3 w-3'
                    : size === 'md'
                      ? 'h-4 w-4'
                      : 'h-5 w-5'
                )}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center space-x-2">
              <div className={cn('h-2 w-2 rounded-full', statusConfig.color)} />
              <span>{statusConfig.text}</span>
              {presence.device && (
                <span className="text-xs opacity-70">
                  {DEVICE_ICONS[presence.device]}
                </span>
              )}
            </div>
            <div className="mt-1 text-xs opacity-70">{getLastSeenText()}</div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div className="relative">
          <Avatar className={sizeClasses[size]}>
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback>
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          {showStatus && (
            <div
              className={cn(
                'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white',
                statusConfig.color,
                size === 'sm'
                  ? 'h-3 w-3'
                  : size === 'md'
                    ? 'h-4 w-4'
                    : 'h-5 w-5'
              )}
            />
          )}
        </div>

        {showStatusText && (
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1">
              <span className="text-sm font-medium">{statusConfig.text}</span>
              {presence.device && (
                <span className="text-xs opacity-70">
                  {DEVICE_ICONS[presence.device]}
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {getLastSeenText()}
            </div>
          </div>
        )}

        {showDropdown && isOwnPresence && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={isSettingStatus}
                className="h-8 w-8 p-0"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Set Status</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() =>
                    updatePresenceStatus(status as OnlinePresence['status'])
                  }
                  className="flex items-center space-x-2"
                >
                  <div className={cn('h-3 w-3 rounded-full', config.color)} />
                  <div className="flex-1">
                    <div className="font-medium">{config.text}</div>
                    <div className="text-xs text-muted-foreground">
                      {config.description}
                    </div>
                  </div>
                  {presence.status === status && (
                    <Circle className="h-3 w-3 fill-current" />
                  )}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Presence Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div
      className={cn(
        'flex items-center space-x-3 rounded-lg border bg-card p-3',
        className
      )}
    >
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={user?.avatarUrl} />
          <AvatarFallback>
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white',
            statusConfig.color,
            'h-4 w-4'
          )}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center space-x-2">
          <span className="font-medium">
            {user?.firstName} {user?.lastName}
          </span>
          <Badge variant="secondary" className="text-xs">
            {statusConfig.text}
          </Badge>
          {presence.device && (
            <span className="text-sm opacity-70">
              {DEVICE_ICONS[presence.device]}
            </span>
          )}
        </div>

        <div className="text-sm text-muted-foreground">{getLastSeenText()}</div>

        {presence.customMessage && (
          <div className="mt-1 text-sm italic text-muted-foreground">
            "{presence.customMessage}"
          </div>
        )}
      </div>

      {isOwnPresence && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isSettingStatus}>
              <Settings className="mr-2 h-4 w-4" />
              Change Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Set Status</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <DropdownMenuItem
                key={status}
                onClick={() =>
                  updatePresenceStatus(status as OnlinePresence['status'])
                }
                className="flex items-center space-x-3 p-3"
              >
                <div className={cn('h-3 w-3 rounded-full', config.color)} />
                <div className="flex-1">
                  <div className="font-medium">{config.text}</div>
                  <div className="text-xs text-muted-foreground">
                    {config.description}
                  </div>
                </div>
                {presence.status === status && (
                  <Circle className="h-3 w-3 fill-current" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default UserPresenceIndicator;
