'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  BookOpen,
  Users,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Calendar,
  Trophy,
  MoreHorizontal,
  Trash2,
  Eye,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Notification } from '@/lib/types';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
  compact?: boolean;
  showActions?: boolean;
}

const notificationIcons = {
  academic: BookOpen,
  social: Users,
  system: AlertCircle,
  success: CheckCircle,
  message: MessageSquare,
  event: Calendar,
  achievement: Trophy,
};

const notificationColors = {
  academic: 'text-blue-500',
  social: 'text-green-500',
  system: 'text-orange-500',
  success: 'text-green-500',
  message: 'text-purple-500',
  event: 'text-indigo-500',
  achievement: 'text-yellow-500',
};

export function NotificationItem({
  notification,
  onMarkAsRead,
  onRemove,
  compact = false,
  showActions = true,
}: NotificationItemProps) {
  const Icon =
    notificationIcons[notification.type as keyof typeof notificationIcons] ||
    AlertCircle;
  const iconColor =
    notificationColors[notification.type as keyof typeof notificationColors] ||
    'text-gray-500';

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(notification.id);
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }

    // Handle navigation if actionUrl exists
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <Card
      className={cn(
        'cursor-pointer border-l-4 p-3 transition-all hover:shadow-sm',
        notification.isRead
          ? 'border-l-transparent bg-muted/30'
          : 'border-l-primary bg-background',
        compact && 'p-2'
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon or Avatar */}
        <div className="flex-shrink-0">
          {notification.avatar ? (
            <Avatar className={cn('h-8 w-8', compact && 'h-6 w-6')}>
              <AvatarImage src={notification.avatar} alt={notification.title} />
              <AvatarFallback>
                <Icon className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full bg-muted',
                compact && 'h-6 w-6'
              )}
            >
              <Icon
                className={cn('h-4 w-4', iconColor, compact && 'h-3 w-3')}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h4
                  className={cn(
                    'text-sm font-medium leading-tight',
                    !notification.isRead && 'font-semibold',
                    compact && 'text-xs'
                  )}
                >
                  {notification.title}
                </h4>
                {!notification.isRead && (
                  <div className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                )}
              </div>

              <p
                className={cn(
                  'line-clamp-2 text-sm text-muted-foreground',
                  compact && 'line-clamp-1 text-xs'
                )}
              >
                {notification.message}
              </p>

              {/* Metadata */}
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={cn(
                    'text-xs text-muted-foreground',
                    compact && 'text-[10px]'
                  )}
                >
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                  })}
                </span>

                {notification.category && (
                  <Badge
                    variant="outline"
                    className={cn('text-xs', compact && 'px-1 text-[10px]')}
                  >
                    {notification.category}
                  </Badge>
                )}

                {notification.priority === 'high' && (
                  <Badge
                    variant="destructive"
                    className={cn('text-xs', compact && 'px-1 text-[10px]')}
                  >
                    High Priority
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              {notification.actions &&
                notification.actions.length > 0 &&
                !compact && (
                  <div className="mt-3 flex gap-2">
                    {notification.actions.map((action, index) => (
                      <Button
                        key={index}
                        variant={action.variant || 'default'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={e => {
                          e.stopPropagation();
                          action.handler?.();
                        }}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
            </div>

            {/* Actions Menu */}
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100',
                      compact && 'h-6 w-6'
                    )}
                    onClick={e => e.stopPropagation()}
                  >
                    <MoreHorizontal
                      className={cn('h-4 w-4', compact && 'h-3 w-3')}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!notification.isRead && (
                    <DropdownMenuItem onClick={handleMarkAsRead}>
                      <Eye className="mr-2 h-4 w-4" />
                      Mark as read
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={handleRemove}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
