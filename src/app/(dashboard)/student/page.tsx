'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BookOpen,
  Clock,
  TrendingUp,
  Award,
  PlayCircle,
  Calendar,
  MessageCircle,
  Target,
  Bell,
  Settings,
  BarChart3,
  CheckCircle,
  Star,
  Trophy,
  Flame,
  Zap,
  BookmarkPlus,
  Users,
  Heart,
  ArrowRight,
  Play,
  ChevronRight,
  Download,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import {
  useGetStudentStatsQuery,
  useGetStudentCoursesQuery,
  useGetStudentActivityQuery,
  useGetStudentAchievementsQuery,
} from '@/lib/redux/api/student-api';
import AIPerformanceWidget from '@/components/ai/ai-performance-widget';

export default function StudentDashboardPage() {
  console.log('📱 Student Dashboard Page Loaded');

  const searchParams = useSearchParams();
  const { toast } = useToast();
  const verified = searchParams.get('verified');
  const message = searchParams.get('message');
  const { user } = useAuth();
  console.log('user', user);

  // API queries for real data
  const { data: statsData, isLoading: statsLoading } =
    useGetStudentStatsQuery();
  const { data: coursesData, isLoading: coursesLoading } =
    useGetStudentCoursesQuery({ limit: 5 });
  const { data: activityData, isLoading: activityLoading } =
    useGetStudentActivityQuery({ limit: 10 });
  const { data: achievementsData, isLoading: achievementsLoading } =
    useGetStudentAchievementsQuery();

  // Extract real data or use defaults
  const stats = statsData?.stats || {
    activeCourses: 0,
    completedCourses: 0,
    totalStudyTime: 0,
    averageProgress: 0,
    achievements: 0,
    currentStreak: 0,
    level: 1,
    xp: 0,
    nextLevelXp: 100,
  };

  const courses = coursesData?.courses || [];
  const activities = activityData?.activities || [];
  const achievements = achievementsData?.achievements || [];
  const levelProgress = achievementsData?.progress || {
    currentLevel: 1,
    currentXp: 0,
    nextLevelXp: 100,
    progressPercentage: 0,
  };

  useEffect(() => {
    if (verified === 'true' && message) {
      toast({
        title: 'Welcome to LMS!',
        description: decodeURIComponent(message),
      });

      // Clean up URL after showing toast
      if (window.history.replaceState) {
        const url = new URL(window.location.href);
        url.searchParams.delete('verified');
        url.searchParams.delete('message');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [verified, message, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br">
      {/* Success Alert for Email Verification */}
      {verified === 'true' && message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong>Welcome to LMS!</strong> {decodeURIComponent(message)}.
              You can now access all features of your dashboard.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="mb-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-8 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

          {/* Animated background blobs */}
          <motion.div
            className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-white/10 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />

          <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="flex items-center gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.3,
                  type: 'spring',
                  stiffness: 200,
                }}
                whileHover={{ scale: 1.05 }}
              >
                <Avatar className="h-20 w-20 border-4 border-white/20 shadow-xl">
                  <AvatarImage src={user?.avatarUrl} alt="Student" />
                  <AvatarFallback className="bg-white/10 text-2xl font-bold backdrop-blur-sm">
                    JS
                  </AvatarFallback>
                </Avatar>
              </motion.div>

              <div>
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
                  whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.2 },
                  }}
                  className="mb-2 flex cursor-pointer items-center gap-2 text-violet-200"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                  <span className="text-sm font-medium">
                    Your Learning Journey
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
                  className="text-4xl font-bold leading-tight"
                >
                  Hello, <br />
                  <motion.span
                    className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                  >
                    {user?.firstName}! 👋
                  </motion.span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
                  className="mt-2 text-lg text-violet-100"
                >
                  Ready to continue your learning adventure?
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8, ease: 'easeOut' }}
                  className="mt-4 flex items-center gap-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Badge className="border-white/30 bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        <Flame className="mr-1 h-3 w-3" />
                      </motion.div>
                      {stats.currentStreak} day streak
                    </Badge>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Badge className="border-white/30 bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30">
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      >
                        <Star className="mr-1 h-3 w-3" />
                      </motion.div>
                      Level {stats.level}
                    </Badge>
                  </motion.div>
                </motion.div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.9, ease: 'easeOut' }}
              className="flex items-center gap-3"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-full border-white/30 bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30"
                >
                  <motion.div
                    className="flex items-center"
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Today's Plan
                    <motion.div
                      animate={{ x: [0, 3, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </motion.div>
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Floating particles effect */}
          <motion.div
            className="absolute right-4 top-4 h-2 w-2 rounded-full bg-white/40"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: 1,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-6 right-1/4 h-1.5 w-1.5 rounded-full bg-white/30"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: 1.5,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      </motion.div>

      {/* Learning Progress Cards - Modern Student Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {/* Active Courses - Friendly Design */}
        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="group relative overflow-hidden border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="absolute right-0 top-0 h-20 w-20 -translate-y-6 translate-x-6 rounded-full bg-gradient-to-br from-blue-400/20 to-blue-500/30" />
              <div className="absolute right-4 top-4 text-blue-500/30 transition-colors duration-300 group-hover:text-blue-500/50">
                <BookOpen className="h-8 w-8" />
              </div>

              <div className="relative">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                  <p className="font-medium text-gray-600">My Courses</p>
                </div>

                <div className="mb-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {statsLoading ? '...' : stats.activeCourses}
                  </span>
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-sm font-semibold text-blue-600">
                    active
                  </span>
                </div>

                <p className="flex items-center gap-1 text-sm text-gray-500">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  {stats.completedCourses} completed
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Study Time - Gamified Design */}
        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="group relative overflow-hidden border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="absolute right-0 top-0 h-20 w-20 -translate-y-6 translate-x-6 rounded-full bg-gradient-to-br from-emerald-400/20 to-green-500/30" />
              <div className="absolute right-4 top-4 text-green-500/30 transition-colors duration-300 group-hover:text-green-500/50">
                <Clock className="h-8 w-8" />
              </div>

              <div className="relative">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  <p className="font-medium text-gray-600">Study Time</p>
                </div>

                <div className="mb-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {statsLoading ? '...' : Math.round(stats.totalStudyTime)}
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    hours
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min((stats.totalStudyTime / 30) * 100, 100)}%`,
                      }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {Math.round(
                      Math.min((stats.totalStudyTime / 30) * 100, 100)
                    )}
                    % of goal
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Learning Progress - Visual Progress */}
        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="group relative overflow-hidden border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="absolute right-0 top-0 h-20 w-20 -translate-y-6 translate-x-6 rounded-full bg-gradient-to-br from-purple-400/20 to-violet-500/30" />
              <div className="absolute right-4 top-4 text-purple-500/30 transition-colors duration-300 group-hover:text-purple-500/50">
                <TrendingUp className="h-8 w-8" />
              </div>

              <div className="relative">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-purple-500" />
                  <p className="font-medium text-gray-600">Overall Progress</p>
                </div>

                <div className="mb-3 flex items-center gap-3">
                  <div className="relative">
                    <svg
                      className="h-16 w-16 -rotate-90 transform"
                      viewBox="0 0 36 36"
                    >
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="2"
                      />
                      <motion.path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="url(#purpleGradient)"
                        strokeWidth="2"
                        strokeDasharray="78, 100"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: '0, 100' }}
                        animate={{
                          strokeDasharray: `${stats.averageProgress}, 100`,
                        }}
                        transition={{ duration: 2, delay: 0.3 }}
                      />
                      <defs>
                        <linearGradient
                          id="purpleGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-900">
                        {statsLoading ? '...' : `${stats.averageProgress}%`}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Great progress!</p>
                    <p className="text-xs font-medium text-purple-600">
                      Keep it up! 🚀
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements - Celebration Design */}
        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="group relative overflow-hidden border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="absolute right-0 top-0 h-20 w-20 -translate-y-6 translate-x-6 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/30" />
              <div className="absolute right-4 top-4 text-amber-500/30 transition-colors duration-300 group-hover:text-amber-500/50">
                <Trophy className="h-8 w-8" />
              </div>

              <div className="relative">
                <div className="mb-3 flex items-center gap-2">
                  <motion.div
                    className="h-2 w-2 rounded-full bg-amber-500"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <p className="font-medium text-gray-600">Achievements</p>
                </div>

                <div className="mb-2 flex items-center gap-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {statsLoading ? '...' : stats.achievements}
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [1, 1.3, 1],
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 2,
                          delay: i * 0.2,
                          repeat: Infinity,
                          repeatDelay: 3,
                        }}
                      >
                        <Star className="h-4 w-4 fill-current text-amber-400" />
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm">
                  <span className="text-gray-500">
                    Streak: {stats.currentStreak} days
                  </span>
                  <div className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-600">
                    Level {stats.level}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Continue Learning - Takes 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                    <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-2">
                      <Play className="h-5 w-5 text-white" />
                    </div>
                    Continue Learning
                  </CardTitle>
                  <CardDescription className="mt-1 text-base">
                    Pick up where you left off and keep your momentum going! 🚀
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {coursesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="animate-pulse rounded-2xl bg-gray-100 p-6"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-2xl bg-gray-300" />
                        <div className="flex-1 space-y-2">
                          <div className="h-6 w-3/4 rounded bg-gray-300" />
                          <div className="h-4 w-1/2 rounded bg-gray-300" />
                          <div className="h-3 w-full rounded bg-gray-300" />
                        </div>
                        <div className="h-10 w-24 rounded bg-gray-300" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : courses.length > 0 ? (
                courses.map((course, index) => {
                  const colors = [
                    {
                      gradient: 'from-blue-500/10 to-purple-500/10',
                      border: 'border-blue-200/50 hover:border-blue-300/50',
                      bg: 'from-blue-500 to-blue-600',
                      button:
                        'from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600',
                      badge: 'bg-blue-100 text-blue-700',
                    },
                    {
                      gradient: 'from-green-500/10 to-emerald-500/10',
                      border: 'border-green-200/50 hover:border-green-300/50',
                      bg: 'from-green-500 to-emerald-600',
                      button:
                        'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
                      badge: 'bg-green-100 text-green-700',
                    },
                    {
                      gradient: 'from-purple-500/10 to-pink-500/10',
                      border: 'border-purple-200/50 hover:border-purple-300/50',
                      bg: 'from-purple-500 to-pink-600',
                      button:
                        'from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
                      badge: 'bg-purple-100 text-purple-700',
                    },
                  ];
                  const colorScheme = colors[index % colors.length];

                  return (
                    <div
                      key={course.id}
                      className={`group relative overflow-hidden rounded-2xl border ${colorScheme.border} bg-gradient-to-r ${colorScheme.gradient} p-6 transition-all duration-300`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="h-16 w-16 rounded-2xl object-cover shadow-lg"
                            />
                          ) : (
                            <div
                              className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${colorScheme.bg} shadow-lg`}
                            >
                              <BookOpen className="h-8 w-8 text-white" />
                            </div>
                          )}
                          <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="mb-1 text-lg font-bold">
                            {course.title}
                          </h4>
                          <p className="mb-3 line-clamp-2 text-muted-foreground">
                            {course.description}
                          </p>
                          <div className="flex items-center space-x-3">
                            <Progress
                              value={course.progress}
                              className="h-3 flex-1 bg-gray-200"
                            />
                            <Badge
                              variant="secondary"
                              className={colorScheme.badge}
                            >
                              {course.progress}%
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="lg"
                          className={`bg-gradient-to-r ${colorScheme.button} text-white shadow-lg`}
                        >
                          Continue
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center">
                  <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-600">
                    No Active Courses
                  </h3>
                  <p className="mb-4 text-gray-500">
                    Start learning by enrolling in a course!
                  </p>
                  <Link href="/courses">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                      Browse Courses
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Quick Actions */}
          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <Zap className="h-5 w-5 text-orange-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/student/courses">
                <Button
                  variant="outline"
                  className="h-12 w-full justify-start border-2 transition-all hover:border-blue-300 hover:bg-blue-50"
                >
                  <div className="mr-3 rounded-full bg-blue-500 p-1">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  Browse Courses
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Button>
              </Link>
              <Link href="/student/ai-tutor">
                <Button
                  variant="outline"
                  className="h-12 w-full justify-start border-2 transition-all hover:border-purple-300 hover:bg-purple-50"
                >
                  <div className="mr-3 rounded-full bg-purple-500 p-1">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  AI Tutor Chat
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Button>
              </Link>
              <Link href="/student/analytics">
                <Button
                  variant="outline"
                  className="h-12 w-full justify-start border-2 transition-all hover:border-green-300 hover:bg-green-50"
                >
                  <div className="mr-3 rounded-full bg-green-500 p-1">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  View Analytics
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Button>
              </Link>
              <Link href="/student/achievements">
                <Button
                  variant="outline"
                  className="h-12 w-full justify-start border-2 transition-all hover:border-orange-300 hover:bg-orange-50"
                >
                  <div className="mr-3 rounded-full bg-orange-500 p-1">
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                  Achievements
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Button>
              </Link>
              <Link href="/student/cart">
                <Button
                  variant="outline"
                  className="h-12 w-full justify-start border-2 transition-all hover:border-yellow-300 hover:bg-yellow-50"
                >
                  <div className="mr-3 rounded-full bg-yellow-500 p-1">
                    <Download className="h-4 w-4 text-white" />
                  </div>
                  Shopping Cart
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Today's Goals */}
          <Card className="border-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 shadow-xl backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <Target className="h-5 w-5 text-orange-500" />
                Today's Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {courses.length > 0 ? (
                courses.slice(0, 3).map((course, index) => {
                  const isCompleted = course.progress >= 100;
                  const isInProgress =
                    course.progress > 0 && course.progress < 100;

                  return (
                    <div
                      key={course.id}
                      className="flex items-center gap-3 rounded-xl bg-white/60 p-3"
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${
                          isCompleted
                            ? 'bg-green-500'
                            : isInProgress
                              ? 'animate-pulse bg-orange-500'
                              : 'bg-gray-400'
                        }`}
                      ></div>
                      <span className="text-sm">Continue {course.title}</span>
                      <Badge
                        className={`ml-auto ${
                          isCompleted
                            ? 'bg-green-100 text-green-700'
                            : isInProgress
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {isCompleted
                          ? 'Done'
                          : isInProgress
                            ? `${Math.round(course.progress)}%`
                            : 'Start'}
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <div className="py-4 text-center">
                  <Target className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-600">No active courses yet</p>
                  <p className="text-xs text-gray-500">
                    Enroll in courses to set daily goals
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Performance Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <AIPerformanceWidget courseId={courses[0]?.id} showFullDetails={true} />
      </motion.div>

      {/* Recent Activity & Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <div className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-2">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                Recent Activity
              </CardTitle>
              <CardDescription className="text-base">
                Your latest learning journey milestones 📚
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {activities.length > 0 ? (
                  activities.slice(0, 5).map((activity, index) => {
                    const getActivityIcon = type => {
                      switch (type) {
                        case 'lesson_completed':
                          return PlayCircle;
                        case 'achievement_earned':
                          return Trophy;
                        case 'assessment_submitted':
                          return CheckCircle;
                        case 'course_enrolled':
                          return BookOpen;
                        default:
                          return Star;
                      }
                    };

                    const getActivityColor = type => {
                      switch (type) {
                        case 'lesson_completed':
                          return {
                            border: 'border-blue-200/50',
                            bg: 'from-blue-500/10 to-blue-600/10',
                            icon: 'from-blue-500 to-blue-600',
                            badge: 'bg-blue-100 text-blue-700',
                          };
                        case 'achievement_earned':
                          return {
                            border: 'border-green-200/50',
                            bg: 'from-green-500/10 to-emerald-500/10',
                            icon: 'from-green-500 to-emerald-600',
                            badge: 'bg-yellow-100 text-yellow-700',
                          };
                        case 'assessment_submitted':
                          return {
                            border: 'border-purple-200/50',
                            bg: 'from-purple-500/10 to-pink-500/10',
                            icon: 'from-purple-500 to-pink-600',
                            badge: 'bg-purple-100 text-purple-700',
                          };
                        case 'course_enrolled':
                          return {
                            border: 'border-orange-200/50',
                            bg: 'from-orange-500/10 to-red-500/10',
                            icon: 'from-orange-500 to-red-600',
                            badge: 'bg-orange-100 text-orange-700',
                          };
                        default:
                          return {
                            border: 'border-gray-200/50',
                            bg: 'from-gray-500/10 to-gray-600/10',
                            icon: 'from-gray-500 to-gray-600',
                            badge: 'bg-gray-100 text-gray-700',
                          };
                      }
                    };

                    const IconComponent = getActivityIcon(activity.type);
                    const colors = getActivityColor(activity.type);

                    return (
                      <div
                        key={activity.id}
                        className={`flex items-center space-x-4 rounded-2xl border ${colors.border} bg-gradient-to-r ${colors.bg} p-4`}
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${colors.icon} shadow-lg`}
                        >
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-semibold">
                            {activity.description}
                          </p>
                          <p className="text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </p>
                        </div>
                        <Badge className={`border-0 ${colors.badge}`}>
                          {activity.type
                            .replace('_', ' ')
                            .replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center">
                    <Clock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-semibold text-gray-600">
                      No Recent Activity
                    </h3>
                    <p className="mb-4 text-gray-500">
                      Start learning to see your activity here!
                    </p>
                    <Link href="/student/courses">
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                        Browse Courses
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Latest Achievements */}
          <Card className="border-0 bg-gradient-to-br from-orange-400/20 to-red-400/20 shadow-xl backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <div className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 p-2">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                Latest Achievements
              </CardTitle>
              <CardDescription className="text-base">
                Your recent accomplishments and badges 🏆
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.length > 0 ? (
                  achievements.slice(0, 3).map((achievement, index) => {
                    const getAchievementEmoji = type => {
                      switch (type) {
                        case 'course_completed':
                          return '🎓';
                        case 'streak_milestone':
                          return '🔥';
                        case 'assessment_perfect':
                          return '⭐';
                        case 'lesson_completed':
                          return '📚';
                        case 'time_milestone':
                          return '⏰';
                        case 'skill_mastery':
                          return '🏆';
                        default:
                          return '🎯';
                      }
                    };

                    const getAchievementGradient = index => {
                      const gradients = [
                        'from-yellow-400 to-orange-500',
                        'from-blue-400 to-purple-500',
                        'from-green-400 to-emerald-500',
                        'from-pink-400 to-red-500',
                        'from-indigo-400 to-purple-500',
                      ];
                      return gradients[index % gradients.length];
                    };

                    return (
                      <div
                        key={achievement.id}
                        className="flex items-center gap-4 rounded-2xl bg-white/60 p-4"
                      >
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${getAchievementGradient(index)} shadow-lg`}
                        >
                          <span className="text-2xl">
                            {getAchievementEmoji(achievement.type)}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold">
                            {achievement.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Earned{' '}
                            {new Date(
                              achievement.earnedAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-6 text-center">
                    <Trophy className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-semibold text-gray-600">
                      No Achievements Yet
                    </h3>
                    <p className="mb-4 text-gray-500">
                      Complete lessons and courses to earn badges!
                    </p>
                    <Link href="/student/courses">
                      <Button className="bg-gradient-to-r from-orange-500 to-red-500">
                        Start Learning
                        <Trophy className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-2xl bg-white/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Progress to next level:</span>
                  <span className="font-bold text-orange-600">
                    Level {levelProgress.currentLevel}
                  </span>
                </div>
                <Progress
                  value={levelProgress.progressPercentage}
                  className="mt-2 h-3"
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  {levelProgress.currentXp}/{levelProgress.nextLevelXp} XP -
                  Keep going! 💪
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Explore More Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Card className="border-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20">
                  <BookmarkPlus className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Discover New Courses</h3>
                  <p className="text-lg text-indigo-100">
                    Expand your knowledge with thousands of courses
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/courses">
                  <Button
                    size="lg"
                    className="border border-white/30 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                  >
                    <BookOpen className="mr-2 h-5 w-5" />
                    Browse All Courses
                  </Button>
                </Link>
                <Link href="/student/courses">
                  <Button
                    size="lg"
                    className="border border-white/30 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                  >
                    <Users className="mr-2 h-5 w-5" />
                    My Course Library
                  </Button>
                </Link>
                <Link href="/student/cart">
                  <Button
                    size="lg"
                    className="border border-white/30 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Shopping Cart
                  </Button>
                </Link>
              </div>

              <div className="mt-6 grid w-full grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="mb-2 text-2xl">🚀</div>
                  <h4 className="mb-1 font-semibold">New Courses</h4>
                  <p className="text-sm text-indigo-100">
                    Fresh content added weekly
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="mb-2 text-2xl">🎯</div>
                  <h4 className="mb-1 font-semibold">Personalized</h4>
                  <p className="text-sm text-indigo-100">
                    AI-recommended just for you
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="mb-2 text-2xl">💎</div>
                  <h4 className="mb-1 font-semibold">Premium</h4>
                  <p className="text-sm text-indigo-100">
                    High-quality expert content
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
