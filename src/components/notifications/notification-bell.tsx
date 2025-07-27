'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/contexts/notification-context';
import { NotificationCenter } from './notification-center';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  variant?: 'default' | 'compact' | 'sidebar';
  className?: string;
  showBadge?: boolean;
  maxBadgeCount?: number;
}

export function NotificationBell({
  variant = 'default',
  className,
  showBadge = true,
  maxBadgeCount = 99,
}: NotificationBellProps) {
  const { unreadCount } = useNotifications();

  const trigger = (
    <Button
      variant="ghost"
      size={variant === 'compact' ? 'sm' : 'icon'}
      className={cn(
        'relative',
        variant === 'sidebar' && 'w-full justify-start',
        className
      )}
    >
      <Bell
        className={cn(
          'h-5 w-5',
          variant === 'compact' && 'h-4 w-4',
          variant === 'sidebar' && 'mr-2'
        )}
      />

      {variant === 'sidebar' && <span>Notifications</span>}

      {showBadge && unreadCount > 0 && (
        <Badge
          variant="destructive"
          className={cn(
            'absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center p-0 text-xs',
            variant === 'compact' && 'h-4 w-4 text-[10px]',
            variant === 'sidebar' && 'relative right-0 top-0 ml-auto'
          )}
        >
          {unreadCount > maxBadgeCount ? `${maxBadgeCount}+` : unreadCount}
        </Badge>
      )}
    </Button>
  );

  return (
    <NotificationCenter trigger={trigger} compact={variant === 'compact'} />
  );
}
