'use client';

import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Settings,
  LogOut,
  Shield,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { RoleBadge } from './role-badge';
import { getInitials } from '@/lib/utils/cn';

export function AuthStatus() {
  const { user, isAuthenticated, logout, isLocked, loginAttempts } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleProfileClick = () => {
    // Navigate to profile based on user role
    const profileRoutes = {
      student: '/student/profile',
      teacher: '/teacher/profile',
      admin: '/admin/profile',
    };

    window.location.href =
      profileRoutes[user.userType as keyof typeof profileRoutes] || '/profile';
  };

  const handleSettingsClick = () => {
    // Navigate to settings based on user role
    const settingsRoutes = {
      student: '/student/settings',
      teacher: '/teacher/settings',
      admin: '/admin/settings',
    };

    window.location.href =
      settingsRoutes[user.userType as keyof typeof settingsRoutes] ||
      '/settings';
  };

  return (
    <div className="flex items-center gap-2">
      {/* Security indicators */}
      {isLocked && (
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="destructive" className="gap-1">
              <Shield className="h-3 w-3" />
              Locked
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Account is locked due to failed login attempts</p>
          </TooltipContent>
        </Tooltip>
      )}

      {loginAttempts > 0 && !isLocked && (
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {loginAttempts}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{loginAttempts} failed login attempt(s)</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={user.avatarUrl}
                alt={user.displayName || `${user.firstName} ${user.lastName}`}
              />
              <AvatarFallback>
                {getInitials(`${user.firstName} ${user.lastName}`)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-sm leading-none font-medium">
              {user.displayName || `${user.firstName} ${user.lastName}`}
            </p>
            <p className="text-muted-foreground text-xs leading-none">
              {user.email}
            </p>
            <div className="pt-1">
              <RoleBadge userRole={user.userType} />
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleProfileClick}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSettingsClick}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
