'use client';

import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { USER_ROLES } from '@/constants';
import { Shield, GraduationCap, Users } from 'lucide-react';

interface RoleBadgeProps {
  userId?: string;
  userRole?: string;
  showIcon?: boolean;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export function RoleBadge({
  userId,
  userRole,
  showIcon = true,
  variant = 'default',
}: RoleBadgeProps) {
  const { user } = useAuth();

  // Use current user's role if no specific user provided
  const role = userRole || (userId === user?.id ? user?.userType : undefined);

  if (!role) return null;

  const getRoleConfig = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return {
          label: 'Admin',
          icon: Shield,
          className:
            'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
        };
      case USER_ROLES.TEACHER:
        return {
          label: 'Teacher',
          icon: GraduationCap,
          className:
            'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
        };
      case USER_ROLES.STUDENT:
        return {
          label: 'Student',
          icon: Users,
          className:
            'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
        };
      default:
        return {
          label: 'User',
          icon: Users,
          className:
            'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800',
        };
    }
  };

  const { label, icon: Icon, className } = getRoleConfig(role);

  return (
    <Badge
      variant={variant}
      className={variant === 'default' ? className : undefined}
    >
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {label}
    </Badge>
  );
}
