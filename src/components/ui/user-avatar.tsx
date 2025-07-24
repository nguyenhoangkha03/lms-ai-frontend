import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, stringToColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user: {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    email?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

export function UserAvatar({
  user,
  size = 'md',
  className,
  showOnlineStatus = false,
  isOnline = false,
}: UserAvatarProps) {
  const displayName =
    user.displayName ||
    `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
    user.email ||
    'User';
  const initials = getInitials(displayName);
  const backgroundColor = stringToColor(displayName);

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
    xl: 'w-12 h-12 text-lg',
  };

  return (
    <div className={cn('relative', className)}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={user.avatarUrl} alt={displayName} />
        <AvatarFallback
          style={{ backgroundColor }}
          className="font-medium text-white"
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      {showOnlineStatus && (
        <div
          className={cn(
            'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background',
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
      )}
    </div>
  );
}
