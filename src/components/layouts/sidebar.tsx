'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { ROUTES, USER_ROLES } from '@/constants';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  MessageSquare,
  Video,
  Award,
  Calendar,
  FileText,
  Brain,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function Sidebar({
  collapsed = false,
  onToggle,
  className,
}: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const getNavigationItems = () => {
    switch (user.userType) {
      case USER_ROLES.STUDENT:
        return [
          {
            title: 'Dashboard',
            href: ROUTES.STUDENT.DASHBOARD,
            icon: LayoutDashboard,
            badge: null,
          },
          {
            title: 'My Courses',
            href: ROUTES.STUDENT.MY_COURSES,
            icon: BookOpen,
            badge: null,
          },
          {
            title: 'Progress',
            href: ROUTES.STUDENT.PROGRESS,
            icon: BarChart3,
            badge: null,
          },
          {
            title: 'Assignments',
            href: ROUTES.STUDENT.ASSIGNMENTS,
            icon: FileText,
            badge: 2,
          },
          {
            title: 'Achievements',
            href: ROUTES.STUDENT.ACHIEVEMENTS,
            icon: Award,
            badge: null,
          },
          {
            title: 'AI Tutor',
            href: ROUTES.STUDENT.AI_TUTOR,
            icon: Brain,
            badge: null,
          },
          {
            title: 'Messages',
            href: ROUTES.STUDENT.MESSAGES,
            icon: MessageSquare,
            badge: 5,
          },
          {
            title: 'Calendar',
            href: '/calendar',
            icon: Calendar,
            badge: null,
          },
        ];

      case USER_ROLES.TEACHER:
        return [
          {
            title: 'Dashboard',
            href: ROUTES.TEACHER.DASHBOARD,
            icon: LayoutDashboard,
            badge: null,
          },
          {
            title: 'My Courses',
            href: ROUTES.TEACHER.COURSES,
            icon: BookOpen,
            badge: null,
          },
          {
            title: 'Students',
            href: ROUTES.TEACHER.STUDENTS,
            icon: Users,
            badge: null,
          },
          {
            title: 'Analytics',
            href: ROUTES.TEACHER.ANALYTICS,
            icon: BarChart3,
            badge: null,
          },
          {
            title: 'Live Sessions',
            href: ROUTES.TEACHER.LIVE_SESSIONS,
            icon: Video,
            badge: null,
          },
          {
            title: 'Assignments',
            href: ROUTES.TEACHER.ASSIGNMENTS,
            icon: FileText,
            badge: 3,
          },
          {
            title: 'Messages',
            href: ROUTES.TEACHER.MESSAGES,
            icon: MessageSquare,
            badge: 2,
          },
          {
            title: 'Calendar',
            href: '/calendar',
            icon: Calendar,
            badge: null,
          },
        ];

      case USER_ROLES.ADMIN:
        return [
          {
            title: 'Dashboard',
            href: ROUTES.ADMIN.DASHBOARD,
            icon: LayoutDashboard,
            badge: null,
          },
          {
            title: 'Users',
            href: ROUTES.ADMIN.USERS,
            icon: Users,
            badge: null,
          },
          {
            title: 'Courses',
            href: ROUTES.ADMIN.COURSES,
            icon: BookOpen,
            badge: null,
          },
          {
            title: 'Analytics',
            href: ROUTES.ADMIN.ANALYTICS,
            icon: BarChart3,
            badge: null,
          },
          {
            title: 'Teacher Apps',
            href: ROUTES.ADMIN.TEACHER_APPLICATIONS,
            icon: FileText,
            badge: 7,
          },
          {
            title: 'Revenue',
            href: ROUTES.ADMIN.REVENUE,
            icon: Award,
            badge: null,
          },
          {
            title: 'Support',
            href: ROUTES.ADMIN.SUPPORT,
            icon: HelpCircle,
            badge: 12,
          },
          {
            title: 'Settings',
            href: ROUTES.ADMIN.SETTINGS,
            icon: Settings,
            badge: null,
          },
        ];

      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();
  const bottomItems = [
    {
      title: 'Help & Support',
      href: '/help',
      icon: HelpCircle,
      badge: null,
    },
    {
      title: 'Settings',
      href: `/${user.userType}/settings`,
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <div
      className={cn(
        'bg-background flex h-full flex-col border-r transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Brain className="text-primary h-6 w-6" />
            <span className="font-semibold">Smart LMS</span>
          </div>
        )}

        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link key={index} href={item.href}>
                <div
                  className={cn(
                    'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="ml-3">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom Navigation */}
      <div className="border-t p-3">
        <nav className="space-y-1">
          {bottomItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={index} href={item.href}>
                <div
                  className={cn(
                    'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="ml-3">{item.title}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
