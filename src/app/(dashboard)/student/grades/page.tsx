'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useGetGradesQuery } from '@/lib/redux/api/gradebook-api';
import { useAuth } from '@/hooks/use-auth';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Award,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  MessageSquare,
  MoreVertical,
  FileText,
  Target,
  Trophy,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function StudentGradesPage() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedGrade, setSelectedGrade] = useState<any>(null);

  const {
    data: gradesResponse,
    isLoading,
    error,
    refetch,
  } = useGetGradesQuery({
    filters: {
      studentId: user?.id,
      status: selectedTab === 'all' ? undefined : selectedTab,
    },
    pagination: { page: 1, limit: 50 },
  });

  const grades = gradesResponse?.grades || [];

  const filteredGrades = grades.filter(
    grade =>
      grade.assessment.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      grade.assessment.course?.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const sortedGrades = filteredGrades.sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return (
          new Date(b.gradedAt || b.createdAt).getTime() -
          new Date(a.gradedAt || a.createdAt).getTime()
        );
      case 'score_high':
        return b.percentage - a.percentage;
      case 'score_low':
        return a.percentage - b.percentage;
      case 'title':
        return a.assessment.title.localeCompare(b.assessment.title);
      default:
        return 0;
    }
  });

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-emerald-600 dark:text-emerald-400';
    if (percentage >= 80) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 70) return 'text-amber-600 dark:text-amber-400';
    if (percentage >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGradeBadgeColor = (percentage: number) => {
    if (percentage >= 90)
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800';
    if (percentage >= 80)
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
    if (percentage >= 70)
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800';
    if (percentage >= 60)
      return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800';
    return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800';
  };

  const getGradeBadge = (grade: any) => {
    switch (grade.status) {
      case 'finalized':
        return (
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case 'graded':
        return (
          <Badge className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <Award className="mr-1 h-3 w-3" />
            Graded
          </Badge>
        );
      case 'under_review':
        return (
          <Badge className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <Clock className="mr-1 h-3 w-3" />
            Under Review
          </Badge>
        );
      default:
        return (
          <Badge className="border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            <AlertCircle className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };

  const calculateStats = () => {
    const publishedGrades = grades.filter(g => g.isPublished);
    if (publishedGrades.length === 0)
      return { average: 0, total: 0, passing: 0, highest: 0 };

    const scores = publishedGrades.map(g => g.percentage);
    const average =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const passing = publishedGrades.filter(g => g.isPassing).length;
    const highest = Math.max(...scores);

    return {
      average: Math.round(average * 10) / 10,
      total: publishedGrades.length,
      passing,
      highest: Math.round(highest * 10) / 10,
    };
  };

  const stats = calculateStats();

  const getTabCounts = () => {
    return {
      all: grades.length,
      finalized: grades.filter(g => g.status === 'finalized').length,
      graded: grades.filter(g => g.status === 'graded').length,
      pending: grades.filter(g => g.status === 'pending').length,
    };
  };

  const tabCounts = getTabCounts();

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <div className="rounded-full bg-red-50 p-3 dark:bg-red-950/50">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-red-600">
            Unable to Load Grades
          </h2>
          <p className="mt-2 max-w-md text-gray-600 dark:text-gray-400">
            An error occurred while loading your grades. Please try again or
            contact support if the problem persists.
          </p>
          <Button onClick={() => refetch()} className="mt-6">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto space-y-8 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-3">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-4xl font-bold text-transparent dark:from-white dark:to-slate-300">
                  My Grades
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Track your academic progress and achievements
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-slate-200/60 bg-white/70 backdrop-blur-sm hover:bg-white/90 dark:border-slate-700/60 dark:bg-slate-800/70"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button
              asChild
              className="border-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
            >
              <Link href="/student/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                Detailed Analytics
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <Card className="border-0 bg-white/70 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:bg-slate-800/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Average Score
                  </p>
                  <p
                    className={cn(
                      'text-3xl font-bold',
                      getGradeColor(stats.average)
                    )}
                  >
                    {stats.average}%
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        'text-xs',
                        getGradeBadgeColor(stats.average)
                      )}
                    >
                      Grade:{' '}
                      {stats.average >= 90
                        ? 'A'
                        : stats.average >= 80
                          ? 'B'
                          : stats.average >= 70
                            ? 'C'
                            : stats.average >= 60
                              ? 'D'
                              : 'F'}
                    </Badge>
                  </div>
                </div>
                <div className="rounded-full bg-gradient-to-br from-blue-400 to-blue-600 p-3">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:bg-slate-800/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Assessments
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stats.total}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    {stats.passing}/{stats.total} passed
                  </p>
                </div>
                <div className="rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 p-3">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:bg-slate-800/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Highest Score
                  </p>
                  <p
                    className={cn(
                      'text-3xl font-bold',
                      getGradeColor(stats.highest)
                    )}
                  >
                    {stats.highest}%
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Personal best
                  </p>
                </div>
                <div className="rounded-full bg-gradient-to-br from-purple-400 to-purple-600 p-3">
                  <Star className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:bg-slate-800/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Pass Rate
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stats.total > 0
                      ? Math.round((stats.passing / stats.total) * 100)
                      : 0}
                    %
                  </p>
                  <Progress
                    value={
                      stats.total > 0 ? (stats.passing / stats.total) * 100 : 0
                    }
                    className="h-2"
                  />
                </div>
                <div className="rounded-full bg-gradient-to-br from-orange-400 to-orange-600 p-3">
                  <Target className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 bg-white/70 shadow-lg backdrop-blur-sm dark:bg-slate-800/50">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-4">
                  <div className="relative max-w-lg flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Search assessments, courses..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="border-slate-200/60 bg-slate-50/50 pl-12 transition-all duration-200 focus:border-blue-300 focus:bg-white dark:border-slate-600/60 dark:bg-slate-700/50"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48 border-slate-200/60 bg-slate-50/50 focus:border-blue-300 focus:bg-white dark:border-slate-600/60 dark:bg-slate-700/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="score_high">Highest Score</SelectItem>
                      <SelectItem value="score_low">Lowest Score</SelectItem>
                      <SelectItem value="title">Name A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4 border-0 bg-white/70 p-1 shadow-lg backdrop-blur-sm dark:bg-slate-800/70">
              <TabsTrigger
                value="all"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
              >
                All Grades
                {tabCounts.all > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 text-xs data-[state=active]:bg-white/20"
                  >
                    {tabCounts.all}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="finalized"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
              >
                Completed
                {tabCounts.finalized > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {tabCounts.finalized}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="graded"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
              >
                Graded
                {tabCounts.graded > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {tabCounts.graded}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-amber-600 data-[state=active]:text-white"
              >
                Pending
                {tabCounts.pending > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {tabCounts.pending}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Grades List */}
            <TabsContent value={selectedTab} className="mt-8">
              {isLoading ? (
                <div className="space-y-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Card
                      key={i}
                      className="border-0 bg-white/70 shadow-lg backdrop-blur-sm dark:bg-slate-800/50"
                    >
                      <CardContent className="p-8">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 space-y-3">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-3 w-1/3" />
                          </div>
                          <div className="space-y-3">
                            <Skeleton className="h-10 w-20" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : sortedGrades?.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mx-auto w-fit rounded-full bg-gradient-to-br from-slate-100 to-slate-200 p-6 dark:from-slate-800 dark:to-slate-700">
                    <FileText className="h-16 w-16 text-slate-400" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-slate-600 dark:text-slate-300">
                    No grades yet
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-slate-500 dark:text-slate-400">
                    Complete assignments and assessments to see your grades
                    here. Keep learning and your grades will appear!
                  </p>
                  <Button
                    asChild
                    className="mt-8 border-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                  >
                    <Link href="/student/my-courses">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Continue Learning
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedGrades?.map((grade, index) => (
                    <motion.div
                      key={grade.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="group border-0 bg-white/70 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:bg-slate-800/50">
                        <CardContent className="p-8">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="mb-4 flex items-center gap-4">
                                <h3 className="text-xl font-semibold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                                  {grade.assessment.title}
                                </h3>
                                {getGradeBadge(grade)}
                                {grade.isAiGraded && (
                                  <Badge
                                    variant="outline"
                                    className="border-purple-200 bg-purple-50 text-xs text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300"
                                  >
                                    <Star className="mr-1 h-3 w-3" />
                                    AI Graded
                                  </Badge>
                                )}
                              </div>

                              <div className="mb-4 flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                                <span className="flex items-center gap-2">
                                  <BookOpen className="h-4 w-4" />
                                  {grade.assessment.course?.title || 'Course'}
                                </span>
                                <span className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(
                                    grade.gradedAt || grade.createdAt
                                  ).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                                {grade.assessment.type && (
                                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs capitalize text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                    {grade.assessment.type === 'quiz'
                                      ? 'Quiz'
                                      : grade.assessment.type === 'assignment'
                                        ? 'Assignment'
                                        : grade.assessment.type}
                                  </span>
                                )}
                              </div>

                              {grade.overallFeedback && (
                                <div className="mt-4 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-slate-600 dark:from-slate-700 dark:to-slate-600">
                                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                    <MessageSquare className="mr-2 inline h-4 w-4 text-blue-500" />
                                    {grade.overallFeedback}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-6">
                              {/* Score Display */}
                              <div className="text-right">
                                <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-6 dark:from-slate-700 dark:to-slate-600">
                                  <div
                                    className={cn(
                                      'mb-1 text-2xl font-bold',
                                      getGradeColor(grade.percentage)
                                    )}
                                  >
                                    {grade.score}/{grade.maxScore}
                                  </div>
                                  <div
                                    className={cn(
                                      'mb-2 text-3xl font-bold',
                                      getGradeColor(grade.percentage)
                                    )}
                                  >
                                    {grade.percentage}%
                                  </div>
                                  <Badge
                                    className={cn(
                                      'text-sm font-medium',
                                      getGradeBadgeColor(grade.percentage)
                                    )}
                                  >
                                    {grade.letterGrade}
                                  </Badge>
                                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                    {grade.isPassing ? '✓ Passed' : '✗ Failed'}
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:bg-slate-100 dark:hover:bg-slate-700"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="bg-white/95 backdrop-blur-sm dark:bg-slate-800/95"
                                >
                                  <DropdownMenuItem
                                    onClick={() => setSelectedGrade(grade)}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/student/assessments/${grade.assessment.id}/results`}
                                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                    >
                                      <FileText className="mr-2 h-4 w-4" />
                                      View Submission
                                    </Link>
                                  </DropdownMenuItem>
                                  {grade.assessment.course && (
                                    <DropdownMenuItem asChild>
                                      <Link
                                        href={`/student/courses/${grade.assessment.course.id}`}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                      >
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        Go to Course
                                      </Link>
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Grade Detail Modal */}
        <AlertDialog
          open={!!selectedGrade}
          onOpenChange={() => setSelectedGrade(null)}
        >
          <AlertDialogContent className="max-w-3xl bg-white/95 backdrop-blur-sm dark:bg-slate-800/95">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                Grade Details
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-6">
                  {selectedGrade && (
                    <>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                            Assessment:
                          </label>
                          <p className="text-lg font-medium text-slate-900 dark:text-white">
                            {selectedGrade.assessment.title}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                            Score:
                          </label>
                          <div className="flex items-center gap-3">
                            <p
                              className={cn(
                                'text-2xl font-bold',
                                getGradeColor(selectedGrade.percentage)
                              )}
                            >
                              {selectedGrade.score}/{selectedGrade.maxScore}
                            </p>
                            <Badge
                              className={cn(
                                'text-sm',
                                getGradeBadgeColor(selectedGrade.percentage)
                              )}
                            >
                              {selectedGrade.percentage}%
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                            Letter Grade:
                          </label>
                          <Badge
                            className={cn(
                              'w-fit px-3 py-1 text-lg',
                              getGradeBadgeColor(selectedGrade.percentage)
                            )}
                          >
                            {selectedGrade.letterGrade}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                            Status:
                          </label>
                          <div>{getGradeBadge(selectedGrade)}</div>
                        </div>
                      </div>

                      {selectedGrade.overallFeedback && (
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                            Overall Feedback:
                          </label>
                          <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-slate-600 dark:from-slate-700 dark:to-slate-600">
                            <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                              {selectedGrade.overallFeedback}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedGrade.comments && (
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                            Additional Comments:
                          </label>
                          <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-4 dark:border-slate-600 dark:from-slate-700 dark:to-slate-600">
                            <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                              {selectedGrade.comments}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-6 border-t border-slate-200 pt-4 dark:border-slate-700 md:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Graded Date:
                          </label>
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {selectedGrade.gradedAt
                              ? new Date(selectedGrade.gradedAt).toLocaleString(
                                  'en-US',
                                  {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )
                              : 'Not graded yet'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Graded By:
                          </label>
                          <div className="flex items-center gap-2">
                            {selectedGrade.isAiGraded ? (
                              <Badge className="border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                <Star className="mr-1 h-3 w-3" />
                                AI System
                              </Badge>
                            ) : (
                              <Badge className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                <Award className="mr-1 h-3 w-3" />
                                Instructor
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
