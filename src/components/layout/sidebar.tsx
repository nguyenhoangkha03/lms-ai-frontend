'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  MessageSquare,
  Calendar,
  FileText,
  Award,
  Brain,
  ChevronDown,
  ChevronRight,
  X,
  Download,
  GraduationCap,
  ClipboardList,
  Video,
  UserCircle,
  FolderOpen,
  TrendingUp,
  Trophy,
  Heart,
  CreditCard,
  Receipt,
  Lightbulb,
  Bell,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, IconButton } from '@/components/ui/enhanced-button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { setSidebarCollapsed } from '@/lib/redux/slices/ui-slice';

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  variant?: 'default' | 'compact';
}

interface NavItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  badge?: string | number;
  children?: NavItem[];
  roles?: string[];
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/student',
    icon: <Home className="h-4 w-4" />,
  },
  // Student Navigation
  {
    title: 'My Courses',
    href: '/my-courses',
    icon: <BookOpen className="h-4 w-4" />,
    badge: '3',
    roles: ['student'],
  },
  {
    title: 'Browse Courses',
    href: '/student/courses',
    icon: <BookOpen className="h-4 w-4" />,
    roles: ['student'],
  },
  {
    title: 'Cart',
    href: '/student/cart',
    icon: <Download className="h-4 w-4" />,
    roles: ['student'],
  },
  {
    title: 'Learning Path',
    href: '/student/learning-path',
    icon: <Brain className="h-4 w-4" />,
    roles: ['student'],
  },
  {
    title: 'AI Tutor',
    href: '/student/ai-tutor',
    icon: <MessageSquare className="h-4 w-4" />,
    roles: ['student'],
  },
  {
    title: 'Analytics',
    href: '/student/analytics',
    icon: <BarChart3 className="h-4 w-4" />,
    roles: ['student'],
  },
  {
    title: 'Schedule',
    href: '/student/schedule',
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    title: 'Messages',
    href: '/student/messages',
    icon: <MessageSquare className="h-4 w-4" />,
    badge: '2',
    roles: ['student'],
  },
  {
    title: 'Assignments',
    href: '/student/assignments',
    icon: <ClipboardList className="h-4 w-4" />,
    roles: ['student'],
  },
  {
    title: 'Assessments',
    href: '/student/assessments',
    icon: <FileText className="h-4 w-4" />,
    roles: ['student'],
  },
  {
    title: 'Progress',
    href: '/student/progress',
    icon: <TrendingUp className="h-4 w-4" />,
    roles: ['student'],
  },
  {
    title: 'Grades',
    href: '/student/grades',
    icon: <Trophy className="h-4 w-4" />,
    roles: ['student'],
  },
  {
    title: 'Achievements',
    href: '/student/achievements',
    icon: <Award className="h-4 w-4" />,
    roles: ['student'],
  },
  {
    title: 'Certificates',
    href: '/student/certificates',
    icon: <Award className="h-4 w-4" />,
    roles: ['student'],
  },
  {
    title: 'Notes',
    href: '/student/notes',
    icon: <BookOpen className="h-4 w-4" />,
    roles: ['student'],
  },
  {
    title: 'Downloads',
    href: '/student/downloads',
    icon: <Download className="h-4 w-4" />,
    roles: ['student'],
  },
  {
    title: 'Wishlist',
    href: '/student/wishlist',
    icon: <Heart className="h-4 w-4" />,
    roles: ['student'],
  },
  {
    title: 'Subscriptions',
    href: '/student/subscriptions',
    icon: <CreditCard className="h-4 w-4" />,
    roles: ['student'],
  },
  {
    title: 'Purchase History',
    href: '/student/purchase-history',
    icon: <Receipt className="h-4 w-4" />,
    roles: ['student'],
  },
  {
    title: 'Recommendations',
    href: '/student/recommendations',
    icon: <Lightbulb className="h-4 w-4" />,
    roles: ['student'],
  },
  {
    title: 'Notifications',
    href: '/student/notifications',
    icon: <Bell className="h-4 w-4" />,
    roles: ['student'],
  },
  {
    title: 'Profile',
    href: '/student/profile',
    icon: <User className="h-4 w-4" />,
    roles: ['student'],
  },
  {
    title: 'Settings',
    href: '/student/settings',
    icon: <Settings className="h-4 w-4" />,
    roles: ['student'],
  },
  // Teacher Navigation
  {
    title: 'Teaching Hub',
    href: '/teacher',
    icon: <GraduationCap className="h-4 w-4" />,
    roles: ['teacher'],
  },
  {
    title: 'Courses',
    icon: <BookOpen className="h-4 w-4" />,
    roles: ['teacher'],
    children: [
      {
        title: 'Course Management',
        href: '/teacher/courses',
        icon: <BookOpen className="h-4 w-4" />,
      },
      {
        title: 'Assignments',
        href: '/teacher/assignments',
        icon: <ClipboardList className="h-4 w-4" />,
      },
      {
        title: 'Assessments',
        href: '/teacher/assessments',
        icon: <FileText className="h-4 w-4" />,
      },
    ],
  },
  {
    title: 'Students',
    icon: <Users className="h-4 w-4" />,
    roles: ['teacher'],
    children: [
      {
        title: 'Student Management',
        href: '/teacher/students',
        icon: <Users className="h-4 w-4" />,
      },
      {
        title: 'Gradebook',
        href: '/teacher/gradebook',
        icon: <Award className="h-4 w-4" />,
      },
    ],
  },
  {
    title: 'Analytics & Reports',
    icon: <BarChart3 className="h-4 w-4" />,
    roles: ['teacher'],
    children: [
      {
        title: 'Analytics Dashboard',
        href: '/teacher/analytics',
        icon: <BarChart3 className="h-4 w-4" />,
      },
      {
        title: 'Generate Reports',
        href: '/teacher/reports',
        icon: <Download className="h-4 w-4" />,
      },
      {
        title: 'Predictive Analytics',
        href: '/teacher/predictive-analytics',
        icon: <TrendingUp className="h-4 w-4" />,
      },
    ],
  },
  {
    title: 'Teaching Tools',
    icon: <Video className="h-4 w-4" />,
    roles: ['teacher'],
    children: [
      {
        title: 'Live Sessions',
        href: '/teacher/live-sessions',
        icon: <Video className="h-4 w-4" />,
      },
      {
        title: 'File Manager',
        href: '/teacher/files',
        icon: <FolderOpen className="h-4 w-4" />,
      },
    ],
  },
  {
    title: 'Teacher Profile',
    href: '/teacher/profile',
    icon: <UserCircle className="h-4 w-4" />,
    roles: ['teacher'],
  },
  {
    title: 'Teacher Settings',
    href: '/teacher/settings',
    icon: <Settings className="h-4 w-4" />,
    roles: ['teacher'],
  },
  // Student-only sections
  {
    title: 'Assessments',
    icon: <FileText className="h-4 w-4" />,
    roles: ['student'],
    children: [
      {
        title: 'Take Quiz',
        href: '/student/assessments/quiz',
        icon: <FileText className="h-4 w-4" />,
        badge: 'New',
      },
      {
        title: 'Results',
        href: '/student/assessments/results',
        icon: <BarChart3 className="h-4 w-4" />,
      },
    ],
  },
  {
    title: 'Achievements',
    href: '/student/achievements',
    icon: <Award className="h-4 w-4" />,
    roles: ['student'],
  },
  {
    title: 'Wishlist',
    href: '/student/wishlist',
    icon: <Award className="h-4 w-4" />,
    roles: ['student'],
  },
  {
    title: 'Purchase History',
    href: '/student/purchase-history',
    icon: <FileText className="h-4 w-4" />,
    roles: ['student'],
  },
  {
    title: 'Community',
    icon: <Users className="h-4 w-4" />,
    children: [
      {
        title: 'Forums',
        href: '/community/forums',
        icon: <MessageSquare className="h-4 w-4" />,
      },
      {
        title: 'Study Groups',
        href: '/community/groups',
        icon: <Users className="h-4 w-4" />,
      },
    ],
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: <UserCircle className="h-4 w-4" />,
    roles: ['student'],
  },
  {
    title: 'Settings',
    href: '/student/settings',
    icon: <Settings className="h-4 w-4" />,
    roles: ['student'],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { sidebarCollapsed } = useAppSelector(state => state.ui);
  const { user } = useAppSelector(state => state.auth);
  const [openItems, setOpenItems] = React.useState<string[]>([]);

  const toggleItem = (title: string) => {
    setOpenItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const closeSidebar = () => {
    dispatch(setSidebarCollapsed(true));
  };

  const filteredNavigation = navigation;

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openItems.includes(item.title);
    const isActive = item.href && pathname === item.href;

    if (hasChildren) {
      return (
        <Collapsible
          key={item.title}
          open={isOpen}
          onOpenChange={() => toggleItem(item.title)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'h-9 w-full justify-start gap-2',
                level > 0 && 'pl-8',
                sidebarCollapsed && 'justify-center px-2'
              )}
            >
              {item.icon}
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Link key={item.title} href={item.href || '#'}>
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          className={cn(
            'h-9 w-full justify-start gap-2',
            level > 0 && 'pl-8',
            sidebarCollapsed && 'justify-center px-2',
            isActive && 'bg-accent text-accent-foreground'
          )}
        >
          {item.icon}
          {!sidebarCollapsed && (
            <>
              <span className="flex-1 text-left">{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </Button>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-30 flex h-full flex-col border-r bg-background transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64',
          'lg:relative lg:translate-x-0',
          !sidebarCollapsed
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0',
          className
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center border-b px-4">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-ai-primary">
                <span className="text-sm font-bold text-white">LMS</span>
              </div>
              <span className="text-lg font-semibold">LMS AI</span>
            </div>
          ) : (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-ai-primary">
              <span className="text-sm font-bold text-white">LMS</span>
            </div>
          )}

          {/* Close button for mobile */}
          <IconButton
            icon={<X />}
            variant="ghost"
            size="sm"
            onClick={closeSidebar}
            className="ml-auto lg:hidden"
            aria-label="Close sidebar"
          />
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {filteredNavigation.map(item => renderNavItem(item))}
          </nav>
        </ScrollArea>

        {/* User info (collapsed state) */}
        {sidebarCollapsed && (
          <div className="border-t p-4">
            <div className="flex justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                {user?.displayName
                  ?.split(' ')
                  .map(n => n[0])
                  .join('') || 'U'}
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
