'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  Settings,
  MessagesSquare,
  ClipboardList,
  TrendingUp,
  Brain,
  X,
  Download,
  User,
  FileCheck,
  BarChart3,
  Trophy,
  Award,
  GraduationCap,
  Bell,
  ShoppingCart,
  Heart,
  Receipt,
  CreditCard,
  Lightbulb,
  Search,
  StickyNote,
  Target,
  Bot,
  Route,
  PieChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton } from '@/components/ui/enhanced-button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { setSidebarCollapsed } from '@/lib/redux/slices/ui-slice';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  badge?: string | number;
}

const studentNavigation: NavItem[] = [
  // Core Navigation
  {
    title: 'Home',
    href: '/student',
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: 'Forum',
    href: '/forum',
    icon: <MessagesSquare className="h-5 w-5" />,
  },

  // Learning Section
  {
    title: 'Courses',
    href: '/student/courses',
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: 'My Courses',
    href: '/student/my-courses',
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    title: 'Learning Path',
    href: '/student/learning-path',
    icon: <Route className="h-5 w-5" />,
  },

  // Assessment & Progress Section
  {
    title: 'Tests',
    href: '/student/assessments',
    icon: <FileCheck className="h-5 w-5" />,
  },
  {
    title: 'AI Chat',
    href: '/student/ai-chat',
    icon: <Brain className="h-5 w-5" />,
  },
  {
    title: 'Progress',
    href: '/student/progress',
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    title: 'Analytics',
    href: '/student/analytics',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: 'Grades',
    href: '/student/grades',
    icon: <Trophy className="h-5 w-5" />,
  },

  // Achievement Section
  {
    title: 'Achievements',
    href: '/student/achievements',
    icon: <Award className="h-5 w-5" />,
  },
  {
    title: 'Certificates',
    href: '/student/certificates',
    icon: <GraduationCap className="h-5 w-5" />,
  },

  // AI Features Section

  //   {
  //     title: 'AI Tutor',
  //     href: '/student/ai-tutor',
  //     icon: <Bot className="h-5 w-5" />,
  //   },

  // Community Section
  //   {
  //     title: 'Recommendations',
  //     href: '/student/recommendations',
  //     icon: <Lightbulb className="h-5 w-5" />,
  //   },
  //   {
  //     title: 'Predictive Analytics',
  //     href: '/student/predictive-analytics',
  //     icon: <PieChart className="h-5 w-5" />,
  //   },

  //   {
  //     title: 'Purchases',
  //     href: '/student/purchase-history',
  //     icon: <Receipt className="h-5 w-5" />,
  //   },
  //   {
  //     title: 'Subscriptions',
  //     href: '/student/subscriptions',
  //     icon: <CreditCard className="h-5 w-5" />,
  //   },

  // Utilities Section
  //   {
  //     title: 'Search',
  //     href: '/student/search',
  //     icon: <Search className="h-5 w-5" />,
  //   },
  {
    title: 'Notes',
    href: '/student/notes',
    icon: <StickyNote className="h-5 w-5" />,
  },
  {
    title: 'Downloads',
    href: '/student/downloads',
    icon: <Download className="h-5 w-5" />,
  },

  // Account Section
  //   {
  //     title: 'Profile',
  //     href: '/student/profile',
  //     icon: <User className="h-5 w-5" />,
  //   },
  //   {
  //     title: 'Settings',
  //     href: '/student/settings',
  //     icon: <Settings className="h-5 w-5" />,
  //   },
];

export const StudentSidebar: React.FC<SidebarProps> = ({ className }) => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { sidebarCollapsed } = useAppSelector(state => state.ui);

  const closeSidebar = () => {
    dispatch(setSidebarCollapsed(true));
  };

  const renderNavItem = (item: NavItem) => {
    const isActive =
      item.href &&
      (pathname === item.href ||
        (item.href !== '/student' && pathname.startsWith(item.href + '/')));

    return (
      <Link key={item.title} href={item.href || '#'}>
        <div className="group relative flex flex-col items-center py-2">
          <div
            className={cn(
              'relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200',
              isActive
                ? 'scale-105 bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:scale-105 hover:bg-gray-200 group-hover:shadow-md'
            )}
          >
            {item.icon}
            {item.badge && (
              <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs">
                <span className="text-xs font-bold text-white">
                  {typeof item.badge === 'number' && item.badge > 9
                    ? '9+'
                    : item.badge}
                </span>
              </div>
            )}
          </div>
          <span
            className={cn(
              'mt-1 w-full px-0.5 text-center text-[9px] font-medium leading-tight',
              isActive ? 'text-blue-600' : 'text-gray-600'
            )}
            style={{
              wordWrap: 'break-word',
              hyphens: 'auto',
              lineHeight: '10px',
            }}
            title={item.title} // Tooltip for full text
          >
            {item.title}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          // Changed from fixed to sticky and adjusted positioning
          'sticky left-4 top-20 z-40 flex w-20 flex-col rounded-2xl border border-gray-200 bg-white shadow-lg',
          'h-[calc(100vh-6rem)]', // Adjusted height calculation
          'float-left', // Make it float to the left
          className
        )}
      >
        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-1">
            {studentNavigation.map(item => renderNavItem(item))}
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
};

export default StudentSidebar;
