'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Home,
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  Shield,
  Settings,
  MessageSquare,
  FileText,
  DollarSign,
  Brain,
  Database,
  Activity,
  Bell,
  Eye,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  LogOut,
  Crown,
  Zap,
  Globe,
  HardDrive,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  useGetApprovalStatsQuery,
  useGetDashboardOverviewQuery,
} from '@/lib/redux/api/admin-api';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  description?: string;
  children?: SidebarItem[];
}

interface AdminSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function AdminSidebar({
  collapsed = false,
  onCollapsedChange,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [openSections, setOpenSections] = useState<string[]>([
    'Dashboard',
    'User Management',
  ]);

  // Get dynamic data for badges
  const { data: teacherStats, error: teacherStatsError } =
    useGetApprovalStatsQuery(undefined, {
      pollingInterval: 60000, // Poll every 60 seconds
    });
  const { data: dashboardData, error: dashboardError } =
    useGetDashboardOverviewQuery(undefined, {
      pollingInterval: 60000, // Poll every 60 seconds
    });

  // Debug errors
  if (teacherStatsError) {
    console.error('🔥 Teacher stats error:', teacherStatsError);
  }
  if (dashboardError) {
    console.error('🔥 Dashboard overview error:', dashboardError);
  }

  const sidebarItems: SidebarItem[] = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: Home,
      description: 'System overview and metrics',
    },
    {
      title: 'User Management',
      href: '/admin/users',
      icon: Users,
      description: 'Manage users and permissions',
      children: [
        {
          title: 'All Users',
          href: '/admin/users',
          icon: Users,
        },
        {
          title: 'Teacher Applications',
          href: '/admin/teacher-applications',
          icon: UserCheck,
          badge: teacherStats?.stats?.pending || 0,
        },
        {
          title: 'User Analytics',
          href: '/admin/users/analytics',
          icon: BarChart3,
        },
        {
          title: 'Roles Management',
          href: '/admin/roles',
          icon: Crown,
        },
        {
          title: 'Permissions Management',
          href: '/admin/permissions',
          icon: Shield,
        },
      ],
    },
    {
      title: 'Course Management',
      href: '/admin/courses',
      icon: BookOpen,
      description: 'Manage courses and content',
      children: [
        {
          title: 'All Courses',
          href: '/admin/courses',
          icon: BookOpen,
        },
        {
          title: 'Course Reviews',
          href: '/admin/courses/reviews',
          icon: CheckCircle,
          badge: 12,
        },
        {
          title: 'Categories',
          href: '/admin/categories',
          icon: FileText,
        },
        {
          title: 'Pricing Management',
          href: '/admin/courses/pricing',
          icon: DollarSign,
        },
      ],
    },
    {
      title: 'Assessment Center',
      href: '/admin/assessments',
      icon: GraduationCap,
      description: 'Manage assessments and testing',
      children: [
        {
          title: 'All Assessments',
          href: '/admin/assessments',
          icon: GraduationCap,
        },
        {
          title: 'Question Bank',
          href: '/admin/assessments/question-bank',
          icon: FileText,
        },
        {
          title: 'Anti-Cheat System',
          href: '/admin/assessments/anti-cheat',
          icon: Shield,
        },
        {
          title: 'Results & Analytics',
          href: '/admin/assessments/results',
          icon: BarChart3,
        },
      ],
    },
    {
      title: 'AI Management',
      href: '/admin/ai-management',
      icon: Brain,
      description: 'AI models and ML systems',
      children: [
        {
          title: 'AI Dashboard',
          href: '/admin/ai-management',
          icon: Brain,
        },
        {
          title: 'ML Models',
          href: '/admin/ml-management',
          icon: Activity,
        },
        {
          title: 'Content Analysis',
          href: '/admin/content/moderation',
          icon: Eye,
        },
      ],
    },
    {
      title: 'Analytics & Reports',
      href: '/admin/analytics',
      icon: BarChart3,
      description: 'Business intelligence and reports',
      children: [
        {
          title: 'Overview',
          href: '/admin/analytics',
          icon: BarChart3,
        },
        {
          title: 'User Engagement',
          href: '/admin/analytics/user-engagement',
          icon: Users,
        },
        {
          title: 'Course Performance',
          href: '/admin/analytics/course-performance',
          icon: BookOpen,
        },
        {
          title: 'Revenue Analytics',
          href: '/admin/analytics/revenue',
          icon: DollarSign,
        },
      ],
    },
    {
      title: 'Financial Management',
      href: '/admin/financial',
      icon: DollarSign,
      description: 'Revenue, payments, and billing',
      children: [
        {
          title: 'Revenue Dashboard',
          href: '/admin/financial/revenue',
          icon: DollarSign,
        },
        {
          title: 'Financial Reports',
          href: '/admin/financial/reports',
          icon: FileText,
        },
        {
          title: 'Coupons & Discounts',
          href: '/admin/financial/coupons',
          icon: FileText,
        },
        {
          title: 'Refund Management',
          href: '/admin/financial/refunds',
          icon: AlertTriangle,
        },
      ],
    },
    {
      title: 'Communication',
      href: '/admin/communication',
      icon: MessageSquare,
      description: 'Chat, forums, and messaging',
      children: [
        {
          title: 'Overview',
          href: '/admin/communication',
          icon: MessageSquare,
        },
        {
          title: 'Chat Rooms',
          href: '/admin/communication/chat-rooms',
          icon: MessageSquare,
        },
        {
          title: 'Forums',
          href: '/admin/communication/forums',
          icon: FileText,
        },
        {
          title: 'Notifications',
          href: '/admin/notification-management',
          icon: Bell,
        },
      ],
    },
    {
      title: 'Security & Monitoring',
      href: '/admin/security',
      icon: Shield,
      description: 'System security and monitoring',
      children: [
        {
          title: 'Security Overview',
          href: '/admin/security',
          icon: Shield,
        },
        {
          title: 'Audit Logs',
          href: '/admin/security/audit-logs',
          icon: FileText,
        },
        {
          title: 'Performance Monitor',
          href: '/admin/monitoring/performance',
          icon: Activity,
        },
        {
          title: 'Suspicious Activities',
          href: '/admin/security/suspicious-activities',
          icon: AlertTriangle,
        },
      ],
    },
    {
      title: 'System Management',
      href: '/admin/system',
      icon: Database,
      description: 'System configuration and maintenance',
      children: [
        {
          title: 'System Configuration',
          href: '/admin/system-configuration',
          icon: Settings,
        },
        {
          title: 'File Management',
          href: '/admin/file-management',
          icon: FileText,
        },
        {
          title: 'Cache & Database',
          href: '/admin/cache-database-management',
          icon: Database,
        },
        {
          title: 'Backup & Maintenance',
          href: '/admin/backup-maintenance',
          icon: Shield,
        },
      ],
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      description: 'System settings and configuration',
      children: [
        {
          title: 'General Settings',
          href: '/admin/settings',
          icon: Settings,
        },
        {
          title: 'Email Templates',
          href: '/admin/settings/email-templates',
          icon: FileText,
        },
        {
          title: 'Integrations',
          href: '/admin/settings/integrations',
          icon: Activity,
        },
        {
          title: 'API Keys',
          href: '/admin/settings/api-keys',
          icon: Shield,
        },
        {
          title: 'Privacy Compliance',
          href: '/admin/privacy-compliance',
          icon: Shield,
        },
      ],
    },
  ];

  const toggleSection = (title: string) => {
    setOpenSections(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const hasActiveChild = (children?: SidebarItem[]) => {
    return children?.some(child => isActive(child.href)) || false;
  };

  return (
    <motion.div
      className={cn(
        'flex h-screen flex-col border-r bg-card/50 backdrop-blur-sm',
        collapsed ? 'w-16' : 'w-80'
      )}
      animate={{ width: collapsed ? 64 : 320 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60">
                <Crown className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-lg font-bold text-transparent">
                  Admin Panel
                </h2>
                <p className="text-xs text-muted-foreground">
                  System Management
                </p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60">
              <Crown className="h-6 w-6 text-primary-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      {!collapsed && user && (
        <div className="border-b p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="bg-primary/10">
                {user.firstName?.charAt(0)}
                {user.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {user.firstName} {user.lastName}
              </p>
              <div className="flex items-center space-x-1">
                <Badge
                  variant="outline"
                  className="border-primary/20 text-xs text-primary"
                >
                  <Crown className="mr-1 h-3 w-3" />
                  Administrator
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-2 py-4">
          {sidebarItems.map(item => (
            <div key={item.title}>
              {item.children ? (
                <Collapsible
                  open={openSections.includes(item.title)}
                  onOpenChange={() => toggleSection(item.title)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant={
                        hasActiveChild(item.children) ? 'secondary' : 'ghost'
                      }
                      className={cn(
                        'group h-auto w-full justify-start p-3 hover:bg-primary/5',
                        collapsed && 'justify-center px-2',
                        hasActiveChild(item.children) &&
                          'border-primary/20 bg-primary/10'
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon
                        className={cn(
                          'h-5 w-5 text-muted-foreground group-hover:text-primary',
                          !collapsed && 'mr-3'
                        )}
                      />
                      {!collapsed && (
                        <>
                          <div className="flex-1 text-left">
                            <div className="font-medium">{item.title}</div>
                            {item.description && (
                              <div className="text-xs text-muted-foreground">
                                {item.description}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {item.badge && (
                              <Badge
                                variant={
                                  typeof item.badge === 'number' &&
                                  item.badge > 0
                                    ? 'destructive'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {item.badge}
                              </Badge>
                            )}
                            {openSections.includes(item.title) ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1">
                    {!collapsed && (
                      <div className="ml-8 space-y-1">
                        {item.children?.map(child => (
                          <Button
                            key={child.href}
                            variant={
                              isActive(child.href) ? 'secondary' : 'ghost'
                            }
                            className={cn(
                              'h-auto w-full justify-start p-2 hover:bg-primary/5',
                              isActive(child.href) &&
                                'border-primary/20 bg-primary/10 text-primary'
                            )}
                            onClick={() => handleNavigation(child.href)}
                          >
                            <child.icon className="mr-2 h-4 w-4" />
                            <span className="flex-1 text-left">
                              {child.title}
                            </span>
                            {child.badge && (
                              <Badge
                                variant={
                                  typeof child.badge === 'number' &&
                                  child.badge > 0
                                    ? 'destructive'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {child.badge}
                              </Badge>
                            )}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Button
                  variant={isActive(item.href) ? 'secondary' : 'ghost'}
                  className={cn(
                    'group h-auto w-full justify-start p-3 hover:bg-primary/5',
                    collapsed && 'justify-center px-2',
                    isActive(item.href) &&
                      'border-primary/20 bg-primary/10 text-primary'
                  )}
                  onClick={() => handleNavigation(item.href)}
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 text-muted-foreground group-hover:text-primary',
                      !collapsed && 'mr-3'
                    )}
                  />
                  {!collapsed && (
                    <div className="flex-1 text-left">
                      <div className="font-medium">{item.title}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      )}
                    </div>
                  )}
                  {!collapsed && item.badge && (
                    <Badge
                      variant={
                        typeof item.badge === 'number' && item.badge > 0
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-2">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-muted-foreground hover:text-destructive',
            collapsed && 'justify-center'
          )}
          onClick={() => logout()}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className={cn('h-5 w-5', !collapsed && 'mr-3')} />
          {!collapsed && 'Logout'}
        </Button>
      </div>
    </motion.div>
  );
}
