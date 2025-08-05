'use client';

import React from 'react';
import Link from 'next/link';
import {
  Bell,
  Search,
  Settings,
  User,
  Menu,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, IconButton } from '@/components/ui/enhanced-button';
import { SearchInput } from '@/components/ui/enhanced-input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/theme-context';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { toggleSidebar } from '@/lib/redux/slices/ui-slice';
import { logout } from '@/lib/redux/slices/auth-slice';

interface HeaderProps {
  className?: string;
  showMenuButton?: boolean;
  onMenuClick?: () => void;
  variant?: 'default' | 'compact' | 'mobile';
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  const { actualTheme, toggleTheme } = useTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { sidebarCollapsed } = useAppSelector(state => state.ui);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <IconButton
            icon={<Menu />}
            variant="ghost"
            size="sm"
            onClick={handleToggleSidebar}
            aria-label="Toggle sidebar"
            className="lg:hidden"
          />

          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-ai-primary">
              <span className="text-sm font-bold text-white">LMS</span>
            </div>
            <span className="hidden text-lg font-semibold md:block">
              LMS AI
            </span>
          </Link>
        </div>

        {/* Center Section - Search */}
        <div className="mx-4 hidden max-w-md flex-1 md:flex">
          <SearchInput
            placeholder="Search courses, lessons..."
            className="w-full"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Search for mobile */}
          <IconButton
            icon={<Search />}
            variant="ghost"
            size="sm"
            className="md:hidden"
            aria-label="Search"
          />

          {/* Theme Toggle */}
          <IconButton
            icon={actualTheme === 'dark' ? <Sun /> : <Moon />}
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="relative">
                <IconButton
                  icon={<Bell />}
                  variant="ghost"
                  size="sm"
                  aria-label="Notifications"
                />
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-xs"
                >
                  3
                </Badge>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="space-y-1">
                <DropdownMenuItem className="flex flex-col items-start p-3">
                  <div className="font-medium">Course completed</div>
                  <div className="text-sm text-muted-foreground">
                    Congratulations! You completed React Basics
                  </div>
                  <div className="text-xs text-muted-foreground">
                    1 hour ago
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start p-3">
                  <div className="font-medium">AI Recommendation</div>
                  <div className="text-sm text-muted-foreground">
                    Try Advanced React Patterns next
                  </div>
                  <div className="text-xs text-muted-foreground">
                    3 hours ago
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/notifications" className="w-full text-center">
                  View all notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl} alt={user?.displayName} />
                  <AvatarFallback>
                    {user?.displayName
                      ?.split(' ')
                      .map(n => n[0])
                      .join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.displayName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
