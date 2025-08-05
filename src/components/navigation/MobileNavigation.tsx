'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Home,
  Search,
  BookOpen,
  User,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  Heart,
  MessageCircle,
  Calendar,
  FileText,
  HelpCircle,
  CheckCircle,
  Download,
  TrendingUp,
  Plus,
  Users,
  BarChart3,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import { useMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface NavigationItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  badge?: string | number;
  children?: NavigationItem[];
  roles?: string[];
  action?: () => void;
}

interface MobileNavigationProps {
  className?: string;
}

// Navigation configuration based on user role
const getNavigationItems = (userRole: string | undefined): NavigationItem[] => {
  const commonItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <Home className="h-5 w-5" />,
    },
    {
      label: 'Search',
      href: '/search',
      icon: <Search className="h-5 w-5" />,
    },
    {
      label: 'My Courses',
      href: '/courses',
      icon: <BookOpen className="h-5 w-5" />,
      badge: '3',
    },
  ];

  const studentItems: NavigationItem[] = [
    ...commonItems,
    {
      label: 'Learning',
      icon: <BookOpen className="h-5 w-5" />,
      children: [
        {
          label: 'Current Courses',
          href: '/learning/current',
          icon: <BookOpen className="h-4 w-4" />,
        },
        {
          label: 'Completed',
          href: '/learning/completed',
          icon: <CheckCircle className="h-4 w-4" />,
        },
        {
          label: 'Wishlist',
          href: '/learning/wishlist',
          icon: <Heart className="h-4 w-4" />,
          badge: '5',
        },
        {
          label: 'Downloads',
          href: '/learning/downloads',
          icon: <Download className="h-4 w-4" />,
        },
      ],
    },
    {
      label: 'Progress',
      href: '/progress',
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      label: 'Discussions',
      href: '/discussions',
      icon: <MessageCircle className="h-5 w-5" />,
      badge: '2',
    },
  ];

  const teacherItems: NavigationItem[] = [
    ...commonItems,
    {
      label: 'Teaching',
      icon: <BookOpen className="h-5 w-5" />,
      children: [
        {
          label: 'My Courses',
          href: '/teaching/courses',
          icon: <BookOpen className="h-4 w-4" />,
        },
        {
          label: 'Create Course',
          href: '/teaching/create',
          icon: <Plus className="h-4 w-4" />,
        },
        {
          label: 'Students',
          href: '/teaching/students',
          icon: <Users className="h-4 w-4" />,
        },
        {
          label: 'Analytics',
          href: '/teaching/analytics',
          icon: <BarChart3 className="h-4 w-4" />,
        },
      ],
    },
    {
      label: 'Grading',
      href: '/grading',
      icon: <FileText className="h-5 w-5" />,
      badge: '12',
    },
    {
      label: 'Schedule',
      href: '/schedule',
      icon: <Calendar className="h-5 w-5" />,
    },
  ];

  const adminItems: NavigationItem[] = [
    ...commonItems,
    {
      label: 'Administration',
      icon: <Settings className="h-5 w-5" />,
      children: [
        {
          label: 'Users',
          href: '/admin/users',
          icon: <Users className="h-4 w-4" />,
        },
        {
          label: 'Courses',
          href: '/admin/courses',
          icon: <BookOpen className="h-4 w-4" />,
        },
        {
          label: 'Content',
          href: '/admin/content',
          icon: <FileText className="h-4 w-4" />,
        },
        {
          label: 'Analytics',
          href: '/admin/analytics',
          icon: <BarChart3 className="h-4 w-4" />,
        },
        {
          label: 'Settings',
          href: '/admin/settings',
          icon: <Settings className="h-4 w-4" />,
        },
      ],
    },
  ];

  switch (userRole) {
    case 'student':
      return studentItems;
    case 'teacher':
      return teacherItems;
    case 'admin':
      return adminItems;
    default:
      return commonItems;
  }
};

export function MobileNavigation({ className }: MobileNavigationProps) {
  const { user, logout } = useAuth();
  const { isMobile, shouldShowMobileUI } = useMobile();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navigationItems = getNavigationItems(user?.userType);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const isActive = item.href && pathname === item.href;

    if (hasChildren) {
      return (
        <Collapsible
          key={item.label}
          open={isExpanded}
          onOpenChange={() => toggleExpanded(item.label)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'h-12 w-full justify-start gap-3 px-4',
                level > 0 && 'pl-8',
                'text-left font-normal'
              )}
            >
              <div className="flex flex-1 items-center gap-3">
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </div>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-4">
            <div className="space-y-1">
              {item.children?.map(child =>
                renderNavigationItem(child, level + 1)
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Button
        key={item.label}
        variant={isActive ? 'secondary' : 'ghost'}
        className={cn(
          'h-12 w-full justify-start gap-3 px-4',
          level > 0 && 'pl-8',
          'text-left font-normal',
          isActive && 'bg-accent font-medium text-accent-foreground'
        )}
        asChild={!!item.href}
        onClick={item.action}
      >
        {item.href ? (
          <Link href={item.href} className="flex w-full items-center gap-3">
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </Link>
        ) : (
          <div className="flex w-full items-center gap-3">
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </div>
        )}
      </Button>
    );
  };

  // Don't render on desktop unless specifically mobile UI is needed
  if (!isMobile && !shouldShowMobileUI) {
    return null;
  }

  return (
    <div className={cn('lg:hidden', className)}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
            {/* Notification badge */}
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 p-0 text-xs"
            >
              3
            </Badge>
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-80 p-0">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatarUrl} alt={user?.displayName} />
                  <AvatarFallback>
                    {user?.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {user?.displayName || 'User'}
                  </p>
                  <p className="text-sm capitalize text-muted-foreground">
                    {user?.userType || 'Student'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-2">
              <div className="space-y-1 py-2">
                {navigationItems.map(item => renderNavigationItem(item))}
              </div>

              <Separator className="my-4" />

              {/* Secondary Actions */}
              <div className="space-y-1 py-2">
                <Button
                  variant="ghost"
                  className="h-12 w-full justify-start gap-3 px-4"
                  asChild
                >
                  <Link href="/notifications">
                    <Bell className="h-5 w-5" />
                    <span className="flex-1">Notifications</span>
                    <Badge variant="destructive" className="ml-auto">
                      5
                    </Badge>
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  className="h-12 w-full justify-start gap-3 px-4"
                  asChild
                >
                  <Link href="/help">
                    <HelpCircle className="h-5 w-5" />
                    <span className="flex-1">Help & Support</span>
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  className="h-12 w-full justify-start gap-3 px-4"
                  asChild
                >
                  <Link href="/settings">
                    <Settings className="h-5 w-5" />
                    <span className="flex-1">Settings</span>
                  </Link>
                </Button>
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t p-4">
              <Button
                variant="ghost"
                className="h-12 w-full justify-start gap-3 px-4 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Bottom Tab Bar for mobile
interface BottomTabBarProps {
  className?: string;
}

export function BottomTabBar({ className }: BottomTabBarProps) {
  const { user } = useAuth();
  const { isMobile } = useMobile();
  const pathname = usePathname();

  // Main tabs based on user role
  const getMainTabs = (userRole: string | undefined) => {
    const commonTabs = [
      { label: 'Home', href: '/dashboard', icon: <Home className="h-5 w-5" /> },
      {
        label: 'Search',
        href: '/search',
        icon: <Search className="h-5 w-5" />,
      },
      {
        label: 'Courses',
        href: '/courses',
        icon: <BookOpen className="h-5 w-5" />,
        badge: 3,
      },
      {
        label: 'Profile',
        href: '/profile',
        icon: <User className="h-5 w-5" />,
      },
    ];

    if (userRole === 'teacher') {
      return [
        {
          label: 'Home',
          href: '/dashboard',
          icon: <Home className="h-5 w-5" />,
        },
        {
          label: 'Teaching',
          href: '/teaching',
          icon: <BookOpen className="h-5 w-5" />,
        },
        {
          label: 'Students',
          href: '/students',
          icon: <Users className="h-5 w-5" />,
        },
        {
          label: 'Profile',
          href: '/profile',
          icon: <User className="h-5 w-5" />,
        },
      ];
    }

    return commonTabs;
  };

  const tabs = getMainTabs(user?.userType);

  if (!isMobile) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t bg-background',
        'safe-area-inset-bottom', // iOS safe area
        className
      )}
    >
      <div className="flex items-center justify-around px-1 py-2">
        {tabs.map(tab => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + '/');

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'relative flex min-w-0 flex-1 flex-col items-center justify-center px-1 py-2',
                'touch-manipulation', // Better touch response
                'transition-colors duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-2 -top-2 h-4 w-4 p-0 text-xs"
                  >
                    {tab.badge}
                  </Badge>
                )}
              </div>
              <span
                className={cn(
                  'mt-1 max-w-full truncate text-xs',
                  isActive && 'font-medium'
                )}
              >
                {tab.label}
              </span>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-1/2 top-0 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
