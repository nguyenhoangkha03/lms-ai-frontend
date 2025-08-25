'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Users,
  PlayCircle,
  Star,
  TrendingUp,
  Edit3,
  Eye,
  Copy,
  Archive,
  Trash2,
  BarChart3,
  FileText,
  Settings,
  AlertCircle,
  RefreshCw,
  ClipboardList,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import {
  useGetTeacherCoursesQuery,
  useDeleteTeacherCourseMutation,
  usePublishCourseMutation,
  useSubmitCourseForReviewMutation,
} from '@/lib/redux/api/teacher-courses-api';
import { CourseStatus } from '@/lib/types/course-enums';
import { toast } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Remove mock data - now using real API

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function TeacherCoursesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [page, setPage] = useState(1);
  const limit = 12;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Prepare query parameters
  const queryParams = useMemo(() => {
    const params: any = {
      page,
      limit,
      sortBy: sortBy === 'updated' ? 'updatedAt' : sortBy,
      sortOrder: 'DESC' as const,
      includeTeacher: true,
      includeCategory: true,
      includeSections: true,
      includeStats: true,
    };

    if (searchTerm) {
      params.search = searchTerm;
    }

    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }

    if (activeTab !== 'all') {
      params.status =
        activeTab === 'published'
          ? CourseStatus.PUBLISHED
          : activeTab === 'draft'
            ? CourseStatus.DRAFT
            : activeTab === 'archived'
              ? CourseStatus.ARCHIVED
              : activeTab === 'suspended'
                ? CourseStatus.SUSPENDED
                : activeTab === 'under_review'
                  ? CourseStatus.UNDER_REVIEW
                  : undefined;
    }

    return params;
  }, [activeTab, searchTerm, statusFilter, sortBy, page]);

  // API queries and mutations
  const {
    data: coursesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetTeacherCoursesQuery(queryParams);

  const [deleteCourse, { isLoading: isDeleting }] =
    useDeleteTeacherCourseMutation();
  const [publishCourse, { isLoading: isPublishing }] =
    usePublishCourseMutation();
  const [submitForReview, { isLoading: isSubmitting }] =
    useSubmitCourseForReviewMutation();

  const courses = coursesResponse?.data || [];
  const meta = coursesResponse?.meta;

  // Handle course actions
  const handleDeleteCourse = (courseId: string, courseTitle: string) => {
    setCourseToDelete({ id: courseId, title: courseTitle });
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;

    try {
      await deleteCourse(courseToDelete.id).unwrap();
      toast.success('Course deleted successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete course');
    } finally {
      setShowDeleteDialog(false);
      setCourseToDelete(null);
    }
  };

  const handlePublishCourse = async (courseId: string) => {
    try {
      await publishCourse(courseId).unwrap();
      toast.success('Course published successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to publish course');
    }
  };

  const handleSubmitForReview = async (courseId: string) => {
    try {
      await submitForReview(courseId).unwrap();
      toast.success('Course submitted for review successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to submit course for review');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case CourseStatus.PUBLISHED:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case CourseStatus.DRAFT:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case CourseStatus.UNDER_REVIEW:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case CourseStatus.ARCHIVED:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
      case CourseStatus.SUSPENDED:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header */}
        <div className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
          <div className="container mx-auto px-6 py-4">
            <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                    Course Management
                  </h1>
                  <p className="text-slate-600 dark:text-slate-300">
                    Create, manage, and analyze your courses
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => router.push('/teacher/courses/create')}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg hover:from-emerald-600 hover:to-green-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 bg-white/80 backdrop-blur-sm"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          className="container mx-auto space-y-8 px-6 py-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Course Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 gap-6 md:grid-cols-4"
          >
            <Card className="border-white/30 bg-gradient-to-br from-white/90 to-white/60 shadow-xl backdrop-blur-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Total Courses
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-2xl font-bold text-slate-800">
                        {meta?.total || 0}
                      </p>
                    )}
                  </div>
                  <BookOpen className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/30 bg-gradient-to-br from-white/90 to-white/60 shadow-xl backdrop-blur-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Total Students
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-2xl font-bold text-slate-800">
                        {courses.reduce(
                          (sum, course) => sum + course.totalEnrollments,
                          0
                        )}
                      </p>
                    )}
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/30 bg-gradient-to-br from-white/90 to-white/60 shadow-xl backdrop-blur-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Total Revenue
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <p className="text-2xl font-bold text-slate-800">
                        {formatCurrency(
                          courses.reduce(
                            (sum, course) =>
                              sum + course.price * course.totalEnrollments,
                            0
                          )
                        )}
                      </p>
                    )}
                  </div>
                  <TrendingUp className="h-8 w-8 text-violet-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/30 bg-gradient-to-br from-white/90 to-white/60 shadow-xl backdrop-blur-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Avg. Rating
                    </p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <p className="text-2xl font-bold text-slate-800">
                        {courses.length > 0 ? (
                          (
                            courses.reduce(
                              (sum, course) => sum + course.rating,
                              0
                            ) / courses.length
                          ).toFixed(1)
                        ) : (
                          '0.0'
                        )}
                      </p>
                    )}
                  </div>
                  <Star className="h-8 w-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters and Search */}
          <motion.div variants={itemVariants}>
            <Card className="border-white/30 bg-white/80 shadow-xl backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-1 items-center space-x-4">
                    <div className="relative max-w-md flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-white/80 pl-10 backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32 bg-white/80">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value={CourseStatus.PUBLISHED}>
                          Published
                        </SelectItem>
                        <SelectItem value={CourseStatus.DRAFT}>Draft</SelectItem>
                        <SelectItem value={CourseStatus.UNDER_REVIEW}>
                          Under Review
                        </SelectItem>
                        <SelectItem value={CourseStatus.ARCHIVED}>
                          Archived
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-36 bg-white/80">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="updatedAt">Last Updated</SelectItem>
                        <SelectItem value="createdAt">Created Date</SelectItem>
                        <SelectItem value="totalEnrollments">
                          Students
                        </SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Course Tabs */}
          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="rounded-2xl border border-white/30 bg-white/80 p-2 shadow-lg backdrop-blur-xl">
                <TabsList className="grid w-full grid-cols-6 gap-1 bg-transparent">
                  <TabsTrigger value="all" className="rounded-xl">
                    All Courses
                  </TabsTrigger>
                  <TabsTrigger value="suspended" className="rounded-xl">
                    Suspended
                  </TabsTrigger>
                  <TabsTrigger value="archived" className="rounded-xl">
                    Archived
                  </TabsTrigger>
                  <TabsTrigger value="published" className="rounded-xl">
                    Published
                  </TabsTrigger>
                  <TabsTrigger value="under_review" className="rounded-xl">
                    Under Review
                  </TabsTrigger>
                  <TabsTrigger value="draft" className="rounded-xl">
                    Draft
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="mt-6">
                <TabsContent value={activeTab} className="mt-0 space-y-6">
                  {/* Loading State */}
                  {isLoading && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <Card
                          key={index}
                          className="border-white/30 bg-gradient-to-br from-white/90 to-white/60 shadow-xl backdrop-blur-lg"
                        >
                          <CardHeader className="pb-3">
                            <Skeleton className="mb-2 h-6 w-20" />
                            <Skeleton className="mb-2 h-6 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-8 w-full" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Error State */}
                  {isError && (
                    <div className="py-12 text-center">
                      <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-400" />
                      <h3 className="mb-2 text-lg font-semibold text-slate-600">
                        Failed to load courses
                      </h3>
                      <p className="mb-6 text-slate-500">
                        {error && 'data' in error
                          ? (error.data as any)?.message
                          : 'Something went wrong while loading your courses.'}
                      </p>
                      <Button onClick={() => refetch()} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                      </Button>
                    </div>
                  )}

                  {/* Course Cards */}
                  {!isLoading && !isError && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                      {courses.map((course, index) => (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="group border-white/30 bg-gradient-to-br from-white/90 to-white/60 shadow-xl backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <Badge
                                  className={getStatusColor(course.status)}
                                >
                                  {course.status}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="opacity-0 group-hover:opacity-100"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        router.push(
                                          `/teacher/courses/${course.id}/edit`
                                        )
                                      }
                                    >
                                      <Edit3 className="mr-2 h-4 w-4" />
                                      Edit Course
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        router.push(`/courses/${course.slug}`)
                                      }
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      Preview
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        router.push(
                                          `/teacher/courses/${course.id}/analytics`
                                        )
                                      }
                                    >
                                      <BarChart3 className="mr-2 h-4 w-4" />
                                      Analytics
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        router.push(
                                          `/teacher/courses/${course.id}/lessons`
                                        )
                                      }
                                    >
                                      <BookOpen className="mr-2 h-4 w-4" />
                                      Manage Lessons
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        router.push(
                                          `/teacher/courses/${course.id}/assessments`
                                        )
                                      }
                                    >
                                      <ClipboardList className="mr-2 h-4 w-4" />
                                      Manage Assessments
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Copy className="mr-2 h-4 w-4" />
                                      Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {course.status === CourseStatus.DRAFT && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleSubmitForReview(course.id)
                                        }
                                        disabled={isSubmitting}
                                      >
                                        <FileText className="mr-2 h-4 w-4" />
                                        Submit for Review
                                      </DropdownMenuItem>
                                    )}
                                    {course.status === CourseStatus.DRAFT && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handlePublishCourse(course.id)
                                        }
                                        disabled={isPublishing}
                                      >
                                        <Settings className="mr-2 h-4 w-4" />
                                        Publish Course
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem>
                                      <Archive className="mr-2 h-4 w-4" />
                                      Archive
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() =>
                                        handleDeleteCourse(
                                          course.id,
                                          course.title
                                        )
                                      }
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <CardTitle className="line-clamp-2 text-lg text-slate-800">
                                {course.title}
                              </CardTitle>
                              <p className="line-clamp-2 text-sm text-slate-600">
                                {course.description}
                              </p>
                            </CardHeader>

                            <CardContent className="space-y-4">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-1">
                                  <Users className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium">
                                    {course.totalEnrollments}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <PlayCircle className="h-4 w-4 text-emerald-500" />
                                  <span className="font-medium">
                                    {course.sections?.reduce(
                                      (total, section) => total + (section.lessons?.length || 0), 
                                      0
                                    ) || course.totalLessons || 0} lessons
                                  </span>
                                </div>
                              </div>

                              {course.status === CourseStatus.PUBLISHED && (
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-4 w-4 text-amber-500" />
                                    <span className="font-medium">
                                      {course.rating}
                                    </span>
                                    <span className="text-slate-500">
                                      ({course.totalRatings})
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-emerald-600">
                                      {formatCurrency(
                                        course.price *
                                          course.totalEnrollments
                                      )}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      Revenue
                                    </p>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between border-t border-white/20 pt-2">
                                <span className="text-xs text-slate-500">
                                  Updated{' '}
                                  {new Date(
                                    course.updatedAt
                                  ).toLocaleDateString()}
                                </span>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    router.push(
                                      `/teacher/courses/${course.id}/edit`
                                    )
                                  }
                                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                                >
                                  Manage
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Empty State */}
                  {!isLoading && !isError && courses.length === 0 && (
                    <div className="py-12 text-center">
                      <BookOpen className="mx-auto mb-4 h-16 w-16 text-slate-400" />
                      <h3 className="mb-2 text-lg font-semibold text-slate-600">
                        No courses found
                      </h3>
                      <p className="mb-6 text-slate-500">
                        {searchTerm || statusFilter !== 'all'
                          ? 'Try adjusting your search or filter criteria.'
                          : 'Create your first course to get started.'}
                      </p>
                      <Button
                        onClick={() => router.push('/teacher/courses/create')}
                        className="bg-gradient-to-r from-emerald-500 to-green-600"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Course
                      </Button>
                    </div>
                  )}

                  {/* Pagination */}
                  {!isLoading && !isError && meta && meta.totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2 pt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={!meta.hasPrev}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-slate-600">
                        Page {meta.page} of {meta.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={!meta.hasNext}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              course "{courseToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
