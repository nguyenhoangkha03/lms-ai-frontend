'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  BookOpen,
  Users,
  BarChart3,
  MessageSquare,
  Bell,
  Search,
  Plus,
  Settings,
  User,
  LogOut,
  GraduationCap,
  Heart,
  Sparkles,
  Calendar,
  Award,
  Zap,
  Video,
  FileText,
  Target,
  Globe,
  Sun,
  Moon,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  gradient: string;
}

const teacherNavigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/teacher',
    icon: <Home className="h-5 w-5" />,
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    title: 'My Courses',
    href: '/teacher/courses',
    icon: <BookOpen className="h-5 w-5" />,
    gradient: 'from-emerald-500 to-green-600',
  },
  {
    title: 'Browse Courses',
    href: '/courses',
    icon: <Globe className="h-5 w-5" />,
    gradient: 'from-teal-500 to-cyan-600',
  },
  {
    title: 'Students',
    href: '/teacher/students',
    icon: <Users className="h-5 w-5" />,
    gradient: 'from-purple-500 to-violet-600',
  },
  {
    title: 'Analytics',
    href: '/teacher/analytics',
    icon: <BarChart3 className="h-5 w-5" />,
    gradient: 'from-amber-500 to-orange-600',
  },
];

export function ModernTeacherNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentTime = new Date().getHours();
  const greeting = currentTime < 12 ? 'Good morning' : currentTime < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      {/* Top Navigation Bar */}
      <motion.header 
        className="fixed top-0 z-50 w-full border-b border-white/10 bg-white/80 backdrop-blur-xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Logo & Greeting */}
            <div className="flex items-center space-x-4">
              <motion.div
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div className="hidden md:block">
                  <h1 className="text-lg font-bold text-slate-800">Teaching Hub</h1>
                  <p className="text-sm text-slate-600">
                    {greeting}, {user?.firstName}! ✨
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Center: Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search courses, students, assignments..."
                  className="w-full rounded-full border-slate-200 bg-white/60 pl-10 pr-4 backdrop-blur-sm transition-all focus:border-blue-300 focus:bg-white focus:shadow-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center space-x-3">
              {/* Live Session Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  className="hidden sm:flex bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => router.push('/teacher/live-sessions')}
                >
                  <Video className="mr-2 h-4 w-4" />
                  Live Session
                </Button>
              </motion.div>

              {/* Quick Create Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="sm"
                  className="hidden sm:flex bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => router.push('/teacher/courses/create')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </Button>
              </motion.div>

              {/* Notifications */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="sm" className="relative rounded-full p-2">
                  <Bell className="h-5 w-5 text-slate-600" />
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-red-500 p-0 text-xs text-white">
                    3
                  </Badge>
                </Button>
              </motion.div>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer"
                  >
                    <Avatar className="h-9 w-9 border-2 border-white shadow-lg">
                      <AvatarImage src={user?.avatarUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white font-medium">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2">
                  <div className="flex items-center space-x-3 p-2">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user?.avatarUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-800">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-slate-600">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.header>

    </>
  );
}