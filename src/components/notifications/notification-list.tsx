import { Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { EmptyState } from '../ui/empty-state';
import { ScrollArea } from '../ui/scroll-area';
import { NotificationItem } from './notification-item';

export interface NotificationListProps {
  notifications: any[];
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
  compact?: boolean;
}

export function NotificationList({
  notifications,
  onMarkAsRead,
  onRemove,
  compact = false,
}: NotificationListProps) {
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
      <div className="space-y-1 p-1">
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onRemove={onRemove}
            compact={compact}
          />
        ))}
      </div>

      {compact && notifications.length >= 5 && (
        <div className="border-t p-3">
          <Button variant="ghost" className="w-full text-sm">
            View all notifications
          </Button>
        </div>
      )}
    </ScrollArea>
  );
}
