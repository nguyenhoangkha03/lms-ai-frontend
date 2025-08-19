'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import {
  BookOpen,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Archive,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Star,
  DollarSign,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  Download,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useGetAdminCoursesQuery, 
  useGetCourseStatsQuery,
  useUpdateCourseStatusMutation,
  useBulkCourseActionsMutation,
  useDeleteAdminCourseMutation 
} from '@/lib/redux/api/admin-api';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface CourseQueryState {
  status?: string;
  category?: string;
  search?: string;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export default function AdminCoursesPage() {
  const [queryState, setQueryState] = useState<CourseQueryState>({
    page: 1,
    limit: 20,
  });
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const { data: coursesData, isLoading, refetch } = useGetAdminCoursesQuery(queryState);
  const { data: statsData } = useGetCourseStatsQuery();
  const [updateCourseStatus] = useUpdateCourseStatusMutation();
  const [bulkCourseActions] = useBulkCourseActionsMutation();
  const [deleteAdminCourse] = useDeleteAdminCourseMutation();

  const courses = coursesData?.courses || [];
  const stats = statsData?.stats;

  const handleStatusChange = async (courseId: string, status: string, notes?: string) => {
    try {
      await updateCourseStatus({ courseId, status, notes }).unwrap();
      toast.success('Course status updated successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to update course status');
    }
  };

  const handleBulkAction = async (action: string, data?: any) => {
    if (selectedCourses.length === 0) {
      toast.error('Please select courses first');
      return;
    }

    try {
      await bulkCourseActions({
        courseIds: selectedCourses,
        action: action as any,
        data,
      }).unwrap();
      toast.success('Bulk action completed successfully');
      setSelectedCourses([]);
      refetch();
    } catch (error) {
      toast.error('Bulk action failed');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteAdminCourse(courseId).unwrap();
      toast.success('Course deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  const handleSelectAll = () => {
    if (selectedCourses.length === courses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(courses.map(course => course.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-600 bg-green-100';
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      case 'pending_review':
        return 'text-yellow-600 bg-yellow-100';
      case 'archived':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return CheckCircle;
      case 'draft':
        return Edit;
      case 'pending_review':
        return Clock;
      case 'archived':
        return Archive;
      default:
        return AlertTriangle;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Management</h1>
          <p className="text-muted-foreground">
            Manage all courses, review submissions, and monitor performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold">{stats.published}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold">{stats.pendingReview}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Enrollments</p>
                  <p className="text-2xl font-bold">{stats.totalEnrollments?.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold">{stats.averageRating?.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={queryState.search || ''}
                  onChange={(e) => setQueryState(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="pl-10"
                />
              </div>

              <Select
                value={queryState.status || 'all'}
                onValueChange={(value) => setQueryState(prev => ({ 
                  ...prev, 
                  status: value === 'all' ? undefined : value, 
                  page: 1 
                }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={queryState.category || 'all'}
                onValueChange={(value) => setQueryState(prev => ({ 
                  ...prev, 
                  category: value === 'all' ? undefined : value, 
                  page: 1 
                }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedCourses.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {selectedCourses.length} selected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('publish')}
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Publish
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('archive')}
                >
                  <Archive className="mr-1 h-4 w-4" />
                  Archive
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedCourses.length === courses.length && courses.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrollments</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><div className="h-4 w-4 animate-pulse bg-gray-200 rounded"></div></TableCell>
                      <TableCell><div className="h-4 w-40 animate-pulse bg-gray-200 rounded"></div></TableCell>
                      <TableCell><div className="h-4 w-32 animate-pulse bg-gray-200 rounded"></div></TableCell>
                      <TableCell><div className="h-4 w-20 animate-pulse bg-gray-200 rounded"></div></TableCell>
                      <TableCell><div className="h-4 w-16 animate-pulse bg-gray-200 rounded"></div></TableCell>
                      <TableCell><div className="h-4 w-16 animate-pulse bg-gray-200 rounded"></div></TableCell>
                      <TableCell><div className="h-4 w-20 animate-pulse bg-gray-200 rounded"></div></TableCell>
                      <TableCell><div className="h-4 w-24 animate-pulse bg-gray-200 rounded"></div></TableCell>
                      <TableCell><div className="h-4 w-4 animate-pulse bg-gray-200 rounded"></div></TableCell>
                    </TableRow>
                  ))
                ) : courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No courses found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((course) => {
                    const StatusIcon = getStatusIcon(course.status);
                    return (
                      <TableRow key={course.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedCourses.includes(course.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCourses(prev => [...prev, course.id]);
                              } else {
                                setSelectedCourses(prev => prev.filter(id => id !== course.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="h-12 w-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                              {course.thumbnail ? (
                                <img 
                                  src={course.thumbnail} 
                                  alt={course.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <BookOpen className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium line-clamp-1">{course.title}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {course.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={course.instructor.avatar} />
                              <AvatarFallback className="text-xs">
                                {course.instructor.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{course.instructor.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('text-xs', getStatusColor(course.status))}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {course.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{course.enrollments}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span>{course.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {course.price === 0 ? 'Free' : `$${course.price}`}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(course.createdAt), 'MMM d, yyyy')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => window.location.href = `/admin/courses/${course.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {course.status === 'pending_review' && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(course.id, 'published')}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve & Publish
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(course.id, 'draft', 'Needs revision')}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Request Changes
                                  </DropdownMenuItem>
                                </>
                              )}
                              {course.status === 'published' && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(course.id, 'archived')}
                                >
                                  <Archive className="mr-2 h-4 w-4" />
                                  Archive
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteCourse(course.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {coursesData && coursesData.totalPages > 1 && (
            <div className="flex items-center justify-between py-4">
              <div className="text-sm text-muted-foreground">
                Showing {((queryState.page - 1) * queryState.limit) + 1} to{' '}
                {Math.min(queryState.page * queryState.limit, coursesData.total)} of{' '}
                {coursesData.total} courses
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={queryState.page <= 1}
                  onClick={() => setQueryState(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={queryState.page >= coursesData.totalPages}
                  onClick={() => setQueryState(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}