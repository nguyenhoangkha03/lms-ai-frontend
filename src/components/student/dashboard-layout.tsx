'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  Settings,
  Search,
  Filter,
  Grid3X3,
  List,
  LayoutGrid,
  Calendar,
  User,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  setViewMode,
  toggleAutoRefresh,
  setRefreshing,
  updateLastVisited,
  dismissWelcomeMessage,
} from '@/lib/redux/slices/dashboard-slice';
import { useRefreshDashboardMutation } from '@/lib/redux/api/student-dashboard-api';
import { NotificationBell } from '@/components/notifications/notification-bell';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const {
    viewMode,
    isRefreshing,
    autoRefreshEnabled,
    lastRefresh,
    showWelcomeMessage,
  } = useAppSelector(state => state.dashboard);

  const [refreshDashboard] = useRefreshDashboardMutation();

  // Update last visited on mount
  useEffect(() => {
    dispatch(updateLastVisited());
  }, [dispatch]);

  // Auto refresh logic
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [autoRefreshEnabled]);

  const handleRefresh = async () => {
    dispatch(setRefreshing(true));
    try {
      await refreshDashboard().unwrap();
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    } finally {
      dispatch(setRefreshing(false));
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatLastRefresh = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                {getGreeting()}, {user?.firstName}! 👋
              </p>
            </div>
          </div>

          {/* Center section - Search */}
          <div className="mx-8 hidden max-w-md flex-1 md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search courses, lessons, or content..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3">
            {/* View mode toggle */}
            <div className="hidden rounded-lg border p-1 sm:flex">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => dispatch(setViewMode('grid'))}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => dispatch(setViewMode('list'))}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'compact' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => dispatch(setViewMode('compact'))}
                className="h-8 w-8 p-0"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>

            {/* Refresh button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="relative"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              {autoRefreshEnabled && (
                <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-green-500" />
              )}
            </Button>

            {/* Notifications */}
            <NotificationBell />

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatarUrl} alt={user?.firstName} />
                    <AvatarFallback>
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => dispatch(toggleAutoRefresh())}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Auto-refresh {autoRefreshEnabled ? 'On' : 'Off'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Welcome message */}
      {showWelcomeMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="container mx-auto px-4 py-4"
        >
          <div className="relative rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-primary">Welcome back! 🎉</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  You have new recommendations and your study streak is looking
                  great!
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(dismissWelcomeMessage())}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Status bar */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>Last updated: {formatLastRefresh(lastRefresh)}</span>
              {autoRefreshEnabled && (
                <Badge variant="outline" className="text-xs">
                  Auto-refresh enabled
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Personalized for you</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
};
