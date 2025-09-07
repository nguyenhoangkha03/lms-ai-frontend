'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useGetUserEnrollmentsQuery } from '@/lib/redux/api/course-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BookOpen,
  Play,
  Clock,
  Award,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  CheckCircle,
  Pause,
  MoreVertical,
  Star,
  Download,
  MessageSquare,
  Share2,
  Bookmark,
  Heart,
  Users,
  Target,
  Zap,
  ArrowRight,
  Trophy,
  PlayCircle,
  Grid3X3,
  List,
  SortDesc,
  Eye,
  ChevronRight,
  Sparkles,
  // Fire,
  Flame,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function MyCoursesPage() {
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');

  const {
    data: enrollments,
    isLoading,
    error,
    refetch,
  } = useGetUserEnrollmentsQuery({
    status: selectedTab === 'all' ? undefined : (selectedTab as any),
    limit: 50,
  });

  const filteredEnrollments = enrollments?.filter(
    enrollment =>
      enrollment.course.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      enrollment.course.teacher.displayName
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const sortedEnrollments = filteredEnrollments?.sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return (
          new Date(
            b.lastAccessedAt || b.enrollmentDate || b.enrolledAt
          ).getTime() -
          new Date(
            a.lastAccessedAt || a.enrollmentDate || a.enrolledAt
          ).getTime()
        );
      case 'progress':
        return (
          (b.progressPercentage || b.progress) -
          (a.progressPercentage || a.progress)
        );
      case 'title':
        return a.course.title.localeCompare(b.course.title);
      case 'date_enrolled':
        return (
          new Date(b.enrollmentDate || b.enrolledAt).getTime() -
          new Date(a.enrollmentDate || a.enrolledAt).getTime()
        );
      default:
        return 0;
    }
  });

  const getStatusBadge = (enrollment: any) => {
    switch (enrollment.status) {
      case 'completed':
        return (
          <Badge className="border-0 bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md backdrop-blur-sm">
            <Trophy className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case 'in_progress':
      case 'active':
      case 'enrolled':
        return (
          <Badge className="border-0 bg-gradient-to-r from-violet-400 to-purple-500 text-white shadow-md backdrop-blur-sm">
            <Sparkles className="mr-1 h-3 w-3" />
            Learning
          </Badge>
        );
      case 'paused':
        return (
          <Badge className="border-0 bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-md backdrop-blur-sm">
            <Pause className="mr-1 h-3 w-3" />
            Paused
          </Badge>
        );
      default:
        return (
          <Badge className="border-0 bg-gradient-to-r from-slate-400 to-gray-500 text-white shadow-md backdrop-blur-sm">
            <BookOpen className="mr-1 h-3 w-3" />
            Enrolled
          </Badge>
        );
    }
  };

  const getTabCounts = () => {
    if (!enrollments) return { all: 0, active: 0, completed: 0, paused: 0 };

    return {
      all: enrollments.length,
      active: enrollments.filter(
        e =>
          e.status === 'in_progress' ||
          e.status === 'enrolled' ||
          e.status === 'active'
      ).length,
      completed: enrollments.filter(e => e.status === 'completed').length,
      paused: enrollments.filter(e => e.status === 'paused').length,
    };
  };

  const tabCounts = getTabCounts();

  // Get featured/recently accessed courses
  const featuredCourses = sortedEnrollments?.slice(0, 3) || [];
  const inProgressCourses =
    sortedEnrollments
      ?.filter(
        e =>
          e.status === 'in_progress' ||
          e.status === 'active' ||
          e.status === 'enrolled'
      )
      .slice(0, 6) || [];

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto max-w-lg text-center"
        >
          <div className="rounded-3xl bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-pink-500">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900">
              Oops! Something went wrong
            </h2>
            <p className="mb-8 text-gray-600">
              We couldn't load your courses right now. Let's try again!
            </p>
            <Button
              onClick={() => refetch()}
              className="rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-8 py-3 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              Try Again
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <div className="space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl"
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

          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
                className="flex cursor-pointer items-center gap-2 text-violet-200"
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
                  <Sparkles className="h-5 w-5" />
                </motion.div>
                <span className="text-sm font-medium">
                  Your Learning Journey
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                className="text-4xl font-bold leading-tight lg:text-5xl"
              >
                Welcome back! <br />
                <motion.span
                  className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  Keep learning
                </motion.span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
                className="text-lg text-violet-100"
              >
                You're making amazing progress! Continue where you left off.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
              className="flex items-center gap-4"
            >
              <motion.div
                className="rounded-2xl bg-white/10 p-6 backdrop-blur-xl"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center">
                  <motion.div
                    className="text-3xl font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 200,
                      delay: 0.8,
                    }}
                  >
                    {tabCounts.all}
                  </motion.div>
                  <motion.div
                    className="text-sm text-violet-200"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    Total Courses
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  size="lg"
                  className="rounded-full bg-white/20 px-8 text-white backdrop-blur-sm transition-all hover:bg-white/30"
                  asChild
                >
                  <Link href="/courses">
                    <motion.div
                      className="flex items-center"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <BookOpen className="mr-2 h-5 w-5" />
                      Explore More
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </motion.div>
                    </motion.div>
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Stats - Modern Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div className="flex min-w-fit items-center gap-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3 text-white shadow-lg">
            <Trophy className="h-5 w-5" />
            <div>
              <div className="text-sm font-medium">Completed</div>
              <div className="text-lg font-bold">{tabCounts.completed}</div>
            </div>
          </div>
          <div className="flex min-w-fit items-center gap-3 rounded-full bg-gradient-to-r from-violet-400 to-purple-500 px-6 py-3 text-white shadow-lg">
            <Flame className="h-5 w-5" />
            <div>
              <div className="text-sm font-medium">In Progress</div>
              <div className="text-lg font-bold">{tabCounts.active}</div>
            </div>
          </div>
          <div className="flex min-w-fit items-center gap-3 rounded-full bg-gradient-to-r from-orange-400 to-red-500 px-6 py-3 text-white shadow-lg">
            <Clock className="h-5 w-5" />
            <div>
              <div className="text-sm font-medium">Hours Learned</div>
              <div className="text-lg font-bold">
                {enrollments
                  ? Math.round(
                      enrollments.reduce(
                        (sum, e) =>
                          sum + (e.totalTimeSpent || e.timeSpent || 0),
                        0
                      ) / 3600
                    )
                  : 0}
                h
              </div>
            </div>
          </div>
        </motion.div>

        {/* Continue Learning Section */}
        {inProgressCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Continue Learning
              </h2>
              <Button
                variant="ghost"
                className="text-violet-600 hover:text-violet-700"
              >
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {inProgressCourses.slice(0, 3).map((enrollment, index) => (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  className="group"
                >
                  <div className="overflow-hidden rounded-2xl bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        src={enrollment.course.thumbnailUrl}
                        alt={enrollment.course.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="mb-2">{getStatusBadge(enrollment)}</div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-white/80">
                            <span>Progress</span>
                            <span>
                              {Math.round(
                                enrollment.progressPercentage ||
                                  enrollment.progress ||
                                  0
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              enrollment.progressPercentage ||
                              enrollment.progress ||
                              0
                            }
                            className="h-1.5 bg-white/20"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900 group-hover:text-violet-600">
                        {enrollment.course.title}
                      </h3>
                      <p className="mb-3 text-sm text-gray-500">
                        by {enrollment.course.teacher.displayName}
                      </p>

                      <Button
                        className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white transition-all hover:from-violet-600 hover:to-purple-700"
                        asChild
                      >
                        <Link
                          href={`/student/my-courses/${enrollment.course.slug}`}
                        >
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Continue Learning
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="sticky top-20 z-40 rounded-2xl bg-white/80 p-4 shadow-lg backdrop-blur-xl"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search your courses..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="rounded-full border-0 bg-gray-50 py-3 pl-12 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-violet-200"
              />
            </div>

            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 rounded-full border-0 bg-gray-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="title">A-Z</SelectItem>
                  <SelectItem value="date_enrolled">Date Enrolled</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex rounded-full bg-gray-50 p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 rounded-full p-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 rounded-full p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-8 grid w-full grid-cols-4 rounded-2xl bg-gray-50 p-1">
              <TabsTrigger
                value="all"
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                All ({tabCounts.all})
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                Learning ({tabCounts.active})
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                Completed ({tabCounts.completed})
              </TabsTrigger>
              <TabsTrigger
                value="paused"
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                Paused ({tabCounts.paused})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab}>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      'grid gap-6',
                      viewMode === 'grid'
                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                        : 'grid-cols-1'
                    )}
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-2xl bg-white p-4 shadow-lg"
                      >
                        <Skeleton className="mb-4 h-40 w-full rounded-xl" />
                        <Skeleton className="mb-2 h-4 w-3/4" />
                        <Skeleton className="mb-3 h-3 w-1/2" />
                        <Skeleton className="h-8 w-full rounded-xl" />
                      </div>
                    ))}
                  </motion.div>
                ) : sortedEnrollments?.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="py-16 text-center"
                  >
                    <div className="mx-auto max-w-md rounded-3xl bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
                      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500">
                        <BookOpen className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="mb-3 text-2xl font-bold text-gray-800">
                        {selectedTab === 'all'
                          ? 'No courses yet'
                          : `No ${selectedTab} courses`}
                      </h3>
                      <p className="mb-8 text-gray-600">
                        {selectedTab === 'all'
                          ? 'Ready to start your learning journey?'
                          : 'Try adjusting your filters to see more courses'}
                      </p>
                      {selectedTab === 'all' && (
                        <Button
                          className="rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-8 py-3 text-white shadow-lg transition-all hover:scale-105"
                          asChild
                        >
                          <Link href="/courses">
                            <BookOpen className="mr-2 h-5 w-5" />
                            Explore Courses
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      'grid gap-6',
                      viewMode === 'grid'
                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                        : 'mx-auto max-w-4xl grid-cols-1'
                    )}
                  >
                    {sortedEnrollments?.map((enrollment, index) => (
                      <motion.div
                        key={enrollment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group"
                      >
                        <div
                          className={cn(
                            'overflow-hidden rounded-2xl bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl',
                            viewMode === 'list' && 'flex gap-6 p-4'
                          )}
                        >
                          <div
                            className={cn(
                              'relative overflow-hidden',
                              viewMode === 'grid'
                                ? 'h-48'
                                : 'h-32 w-48 flex-shrink-0 rounded-xl'
                            )}
                          >
                            <Image
                              src={enrollment.course.thumbnailUrl}
                              alt={enrollment.course.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                            <div className="absolute left-3 top-3">
                              {getStatusBadge(enrollment)}
                            </div>

                            {viewMode === 'grid' && (
                              <div className="absolute bottom-3 left-3 right-3">
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs text-white/80">
                                    <span>Progress</span>
                                    <span>
                                      {Math.round(
                                        enrollment.progressPercentage ||
                                          enrollment.progress ||
                                          0
                                      )}
                                      %
                                    </span>
                                  </div>
                                  <Progress
                                    value={
                                      enrollment.progressPercentage ||
                                      enrollment.progress ||
                                      0
                                    }
                                    className="h-1.5 bg-white/20"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <div
                            className={cn(
                              'space-y-4',
                              viewMode === 'grid' ? 'p-6' : 'flex-1 py-2'
                            )}
                          >
                            <div>
                              <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 group-hover:text-violet-600">
                                <Link
                                  href={`/student/courses/${enrollment.course.slug}`}
                                >
                                  {enrollment.course.title}
                                </Link>
                              </h3>
                              <p className="text-sm text-gray-500">
                                by {enrollment.course.teacher.displayName}
                              </p>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {enrollment.course.category.name}
                              </Badge>
                            </div>

                            {viewMode === 'list' && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">
                                    Progress
                                  </span>
                                  <span className="font-semibold text-violet-600">
                                    {Math.round(
                                      enrollment.progressPercentage ||
                                        enrollment.progress ||
                                        0
                                    )}
                                    %
                                  </span>
                                </div>
                                <Progress
                                  value={
                                    enrollment.progressPercentage ||
                                    enrollment.progress ||
                                    0
                                  }
                                  className="h-2"
                                />
                              </div>
                            )}

                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {enrollment.formattedTimeSpent ||
                                    `${Math.round((enrollment.totalTimeSpent || enrollment.timeSpent || 0) / 60)}m`}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                <span>
                                  {enrollment.lessonsCompleted || 0}/
                                  {enrollment.totalLessons ||
                                    enrollment.course.totalLessons ||
                                    0}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                className="flex-1 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white transition-all hover:from-violet-600 hover:to-purple-700"
                                asChild
                              >
                                <Link
                                  href={`/student/my-courses/${enrollment.course.slug}`}
                                >
                                  <PlayCircle className="mr-2 h-4 w-4" />
                                  {enrollment.status === 'completed'
                                    ? 'Review'
                                    : 'Continue'}
                                </Link>
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-xl"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Bookmark className="mr-2 h-4 w-4" />
                                    Bookmark
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Resources
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {enrollment.lastAccessedAt && (
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Eye className="h-3 w-3" />
                                Last accessed:{' '}
                                {new Date(
                                  enrollment.lastAccessedAt
                                ).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Achievement Celebration */}
        {tabCounts.completed > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 p-8 text-white shadow-2xl">
              <div className="absolute inset-0 bg-[url('/confetti.svg')] opacity-20" />
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

              <div className="relative flex items-center justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Trophy className="h-6 w-6" />
                    <span className="text-sm font-medium">
                      Achievement Unlocked!
                    </span>
                  </div>
                  <h3 className="mb-2 text-2xl font-bold">
                    Incredible Progress!
                  </h3>
                  <p className="text-emerald-100">
                    You've completed {tabCounts.completed} course
                    {tabCounts.completed > 1 ? 's' : ''}. Keep up the amazing
                    work and unlock new opportunities!
                  </p>
                </div>
                <div className="hidden items-center gap-4 md:flex">
                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {tabCounts.completed}
                      </div>
                      <div className="text-sm text-emerald-100">
                        Certificates
                      </div>
                    </div>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                    <Sparkles className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Learning Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid gap-6 md:grid-cols-3"
        >
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-700">Learning Streak</h4>
                <p className="text-2xl font-bold text-indigo-600">7 days</p>
                <p className="text-sm text-gray-500">Keep it going!</p>
              </div>
              <div className="rounded-full bg-indigo-200 p-3">
                <Flame className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-100 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-700">Avg. Session</h4>
                <p className="text-2xl font-bold text-purple-600">45min</p>
                <p className="text-sm text-gray-500">Great focus!</p>
              </div>
              <div className="rounded-full bg-purple-200 p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-700">Skills Gained</h4>
                <p className="text-2xl font-bold text-emerald-600">12</p>
                <p className="text-sm text-gray-500">This month</p>
              </div>
              <div className="rounded-full bg-emerald-200 p-3">
                <Target className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
