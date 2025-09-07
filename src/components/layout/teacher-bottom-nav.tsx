'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import {
  Home,
  BookOpen,
  Users,
  BarChart3,
  Globe,
  Video,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

export function TeacherBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const navContent = (
    <motion.div
      className="flex items-center gap-4"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.5 }}
    >
      {/* Left spacer for balance */}
      <div className="w-12 h-12" />
      
      {/* Main Navigation */}
      <div className="relative flex items-center space-x-2 rounded-full border border-white/30 bg-gradient-to-r from-white/95 via-blue-50/90 to-white/95 px-6 py-3 shadow-2xl backdrop-blur-xl">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/30 via-indigo-400/30 to-purple-400/30 blur-xl -z-10" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/40 via-blue-100/30 to-white/40" />
        {/* Shine effect */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/40 to-transparent" />
        {teacherNavigation.map((item, index) => {
          const isActive = pathname === item.href || 
            (item.href !== '/teacher' && pathname.startsWith(item.href));
          
          return (
            <motion.div
              key={item.href}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={item.href}>
                <div className="group relative flex flex-col items-center">
                  <div
                    className={cn(
                      "relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300",
                      isActive
                        ? `bg-gradient-to-br ${item.gradient} shadow-lg scale-110`
                        : "bg-white/60 hover:bg-white/80 hover:scale-105 shadow-md"
                    )}
                  >
                    <div
                      className={cn(
                        "transition-colors duration-200",
                        isActive ? "text-white" : "text-slate-600 group-hover:text-slate-800"
                      )}
                    >
                      {item.icon}
                    </div>
                    
                    {/* Badge */}
                    {item.badge && (
                      <motion.div
                        className="absolute -right-1 -top-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                      >
                        <Badge className="h-5 w-5 rounded-full bg-red-500 p-0 text-xs text-white">
                          {item.badge}
                        </Badge>
                      </motion.div>
                    )}

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        className="absolute -bottom-1 h-1 w-6 rounded-full bg-white/50"
                        layoutId="activeIndicator"
                      />
                    )}
                  </div>
                  
                  {/* Tooltip */}
                  <AnimatePresence>
                    <motion.span
                      className={cn(
                        "absolute -top-10 whitespace-nowrap rounded-lg bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg px-2 py-1 text-xs text-slate-700 opacity-0 transition-opacity group-hover:opacity-100",
                        "pointer-events-none"
                      )}
                      initial={{ opacity: 0, y: 5 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.title}
                      <div className="absolute left-1/2 top-full h-1 w-1 -translate-x-1/2 rotate-45 bg-white border-r border-b border-white/30" />
                    </motion.span>
                  </AnimatePresence>
                </div>
              </Link>
            </motion.div>
          );
        })}

        {/* Live Session Button - Inside navbar */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: teacherNavigation.length * 0.1 }}
        >
          <div className="group relative flex flex-col items-center">
            <div
              className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => router.push('/teacher/live-sessions/create')}
            >
              <Video className="h-5 w-5 text-white" />
            </div>
            
            {/* Tooltip */}
            <AnimatePresence>
              <motion.span
                className={cn(
                  "absolute -top-10 whitespace-nowrap rounded-lg bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg px-2 py-1 text-xs text-slate-700 opacity-0 transition-opacity group-hover:opacity-100",
                  "pointer-events-none"
                )}
                initial={{ opacity: 0, y: 5 }}
                whileHover={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                Start Live
                <div className="absolute left-1/2 top-full h-1 w-1 -translate-x-1/2 rotate-45 bg-white border-r border-b border-white/30" />
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  return navContent;
}