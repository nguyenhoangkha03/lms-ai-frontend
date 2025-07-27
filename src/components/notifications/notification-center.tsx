'use client';

import React, { useState } from 'react';
import { Bell, Check, MoreHorizontal, Settings, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useNotifications } from '@/contexts/notification-context';
import { NotificationFilters } from './notification-filters';
import { cn } from '@/lib/utils';
import { NotificationList } from './notification-list';
import { GroupedNotificationList } from './grouped-notification-list';

interface NotificationCenterProps {
  trigger?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function NotificationCenter({
  trigger,
  className,
  compact = false,
}: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getNotificationsByType,
    getUnreadNotifications,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [open, setOpen] = useState(false);

  const filteredNotifications = React.useMemo(() => {
    switch (activeFilter) {
      case 'unread':
        return getUnreadNotifications();
      case 'academic':
        return getNotificationsByType('academic');
      case 'social':
        return getNotificationsByType('social');
      case 'system':
        return getNotificationsByType('system');
      default:
        return notifications;
    }
  }, [
    notifications,
    activeFilter,
    getUnreadNotifications,
    getNotificationsByType,
  ]);

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => setOpen(true)}
    >
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
  );

  const content = (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} new</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-sm"
            >
              <Check className="mr-1 h-4 w-4" />
              Mark all read
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={markAllAsRead}>
                <Check className="mr-2 h-4 w-4" />
                Mark all as read
              </DropdownMenuItem>
              <DropdownMenuItem onClick={clearAll} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear all
              </DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {!compact && (
        <>
          {/* Filters */}
          <div className="border-b p-4">
            <NotificationFilters
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              notifications={notifications}
            />
          </div>

          {/* Tabs for different views */}
          <Tabs defaultValue="list" className="flex flex-1 flex-col">
            <TabsList className="mx-4 mt-2">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="grouped">Grouped</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="m-0 flex-1">
              <NotificationList
                notifications={filteredNotifications}
                onMarkAsRead={markAsRead}
                onRemove={removeNotification}
              />
            </TabsContent>

            <TabsContent value="grouped" className="m-0 flex-1">
              <GroupedNotificationList
                notifications={filteredNotifications}
                onMarkAsRead={markAsRead}
                onRemove={removeNotification}
              />
            </TabsContent>
          </Tabs>
        </>
      )}

      {compact && (
        <NotificationList
          notifications={filteredNotifications.slice(0, 5)}
          onMarkAsRead={markAsRead}
          onRemove={removeNotification}
          compact
        />
      )}
    </div>
  );

  if (compact) {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          {trigger || defaultTrigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-0" sideOffset={8}>
          {content}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger || defaultTrigger}</SheetTrigger>
      <SheetContent side="right" className="w-96 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}
