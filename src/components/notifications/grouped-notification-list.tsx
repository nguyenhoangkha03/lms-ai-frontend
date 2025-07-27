import React from 'react';
import { NotificationListProps } from './notification-list';
import { EmptyState } from '../ui/empty-state';
import { Bell } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { NotificationItem } from './notification-item';

export function GroupedNotificationList({
  notifications,
  onMarkAsRead,
  onRemove,
}: NotificationListProps) {
  const groupedNotifications = React.useMemo(() => {
    const groups: Record<string, any[]> = {};

    notifications.forEach(notification => {
      const date = new Date(notification.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });

    return groups;
  }, [notifications]);

  const sortedDates = Object.keys(groupedNotifications).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<Bell />}
        title="No notifications"
        description="You're all caught up! No new notifications at this time."
        className="py-8"
      />
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-4 p-4">
        {sortedDates.map(date => (
          <div key={date}>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
            <div className="space-y-1">
              {groupedNotifications[date].map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
