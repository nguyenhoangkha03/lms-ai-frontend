'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Notification } from '@/lib/types';

interface NotificationFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  notifications: Notification[];
  className?: string;
}

export function NotificationFilters({
  activeFilter,
  onFilterChange,
  notifications,
  className,
}: NotificationFiltersProps) {
  const filters = React.useMemo(() => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const academicCount = notifications.filter(
      n => n.type === 'academic'
    ).length;
    const socialCount = notifications.filter(n => n.type === 'social').length;
    const systemCount = notifications.filter(n => n.type === 'system').length;

    return [
      {
        id: 'all',
        label: 'All',
        count: notifications.length,
      },
      {
        id: 'unread',
        label: 'Unread',
        count: unreadCount,
      },
      {
        id: 'academic',
        label: 'Academic',
        count: academicCount,
      },
      {
        id: 'social',
        label: 'Social',
        count: socialCount,
      },
      {
        id: 'system',
        label: 'System',
        count: systemCount,
      },
    ];
  }, [notifications]);

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {filters.map(filter => (
        <Button
          key={filter.id}
          variant={activeFilter === filter.id ? 'default' : 'outline'}
          size="sm"
          className="h-8 gap-2"
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.label}
          {filter.count > 0 && (
            <Badge
              variant={activeFilter === filter.id ? 'secondary' : 'outline'}
              className="flex h-5 w-5 items-center justify-center p-0 text-xs"
            >
              {filter.count}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
}
