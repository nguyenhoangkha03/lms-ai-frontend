'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useGetStudentAssignmentsQuery } from '@/lib/redux/api/student-assignments-api';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Search,
  Upload,
  Download,
  Eye,
  MoreVertical,
  BookOpen,
  Target,
  TrendingUp,
  AlertCircle,
  XCircle,
  Paperclip,
  Award,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function StudentAssignmentsPage() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');

  const {
    data: assignmentsData,
    isLoading,
    error,
    refetch,
  } = useGetStudentAssignmentsQuery({
    courseId: selectedCourse || undefined,
    status: selectedTab === 'all' ? undefined : selectedTab,
    search: searchQuery || undefined,
    page: 1,
    limit: 50,
  });

  const assignments = assignmentsData?.assignments || [];
  const stats = assignmentsData?.stats || {
    total: 0,
    submitted: 0,
    graded: 0,
    late: 0,
    missing: 0,
    averageScore: 0,
    completionRate: 0,
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const sortedAssignments = filteredAssignments.sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      case 'course':
        return a.courseName.localeCompare(b.courseName);
      case 'points':
        return b.maxPoints - a.maxPoints;
      default:
        return 0;
    }
  });

  const getStatusBadge = (assignment: any, submission?: any) => {
    if (!submission) {
      const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();
      return isOverdue ? (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="mr-1 h-3 w-3" />
          Quá hạn
        </Badge>
      ) : (
        <Badge className="bg-yellow-100 text-yellow-800">
          <AlertCircle className="mr-1 h-3 w-3" />
          Chưa nộp
        </Badge>
      );
    }

    switch (submission.status) {
      case 'submitted':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Upload className="mr-1 h-3 w-3" />
            Đã nộp
          </Badge>
        );
      case 'graded':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Đã chấm
          </Badge>
        );
      case 'late':
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Nộp trễ
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <FileText className="mr-1 h-3 w-3" />
            Chưa rõ
          </Badge>
        );
    }
  };

  const getTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Đã quá hạn';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) return `Còn ${diffDays} ngày`;
    if (diffHours > 0) return `Còn ${diffHours} giờ`;
    return 'Sắp hết hạn';
  };

  const getTabCounts = () => {
    return {
      all: assignments.length,
      published: assignments.filter(a => a.status === 'published').length,
      submitted: stats.submitted,
      graded: stats.graded,
      missing: stats.missing,
    };
  };

  const tabCounts = getTabCounts();

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-red-600">
            Không thể tải danh sách bài tập
          </h2>
          <p className="mb-4 text-gray-600">
            Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.
          </p>
          <Button onClick={() => refetch()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Bài tập</h1>
          <p className="text-muted-foreground">
            Quản lý và nộp bài tập từ các khóa học
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/student/analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Phân tích
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/student/my-courses">
              <BookOpen className="mr-2 h-4 w-4" />
              Khóa học của tôi
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-4 md:grid-cols-5"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tổng bài tập</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Đã nộp</p>
                <p className="text-2xl font-bold">{stats.submitted}</p>
              </div>
              <Upload className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Đã chấm</p>
                <p className="text-2xl font-bold">{stats.graded}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Điểm TB</p>
                <p className="text-2xl font-bold">{Math.round(stats.averageScore)}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tỷ lệ hoàn thành</p>
                <p className="text-2xl font-bold">{Math.round(stats.completionRate)}%</p>
                <Progress value={stats.completionRate} className="mt-1 h-1" />
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm bài tập, khóa học..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tất cả khóa học" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả khóa học</SelectItem>
                    {Array.from(new Set(assignments.map(a => a.courseName))).map(courseName => (
                      <SelectItem key={courseName} value={courseName}>
                        {courseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dueDate">Hạn nộp</SelectItem>
                    <SelectItem value="title">Tên A-Z</SelectItem>
                    <SelectItem value="course">Khóa học</SelectItem>
                    <SelectItem value="points">Điểm số</SelectItem>
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="flex items-center gap-2">
              Tất cả
              {tabCounts.all > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.all}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="published" className="flex items-center gap-2">
              Đang mở
              {tabCounts.published > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.published}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="submitted" className="flex items-center gap-2">
              Đã nộp
              {tabCounts.submitted > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.submitted}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="graded" className="flex items-center gap-2">
              Đã chấm
              {tabCounts.graded > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.graded}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="missing" className="flex items-center gap-2">
              Chưa nộp
              {tabCounts.missing > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.missing}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-8 w-20" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedAssignments?.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-xl font-semibold text-gray-600">
                  Không có bài tập nào
                </h3>
                <p className="mb-4 text-gray-500">
                  {selectedTab === 'all' 
                    ? 'Chưa có bài tập nào được giao'
                    : `Không có bài tập ${selectedTab}`
                  }
                </p>
                <Button asChild>
                  <Link href="/student/my-courses">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Xem khóa học
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedAssignments.map((assignment, index) => (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="transition-shadow hover:shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">
                                <Link 
                                  href={`/student/assignments/${assignment.id}`}
                                  className="hover:text-blue-600 transition-colors"
                                >
                                  {assignment.title}
                                </Link>
                              </h3>
                              {getStatusBadge(assignment)}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                {assignment.courseName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                {assignment.maxPoints} điểm
                              </span>
                              {assignment.dueDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {assignment.dueDate ? getTimeRemaining(assignment.dueDate) : 'Không có hạn'}
                              </span>
                            </div>

                            {assignment.description && (
                              <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                                {assignment.description}
                              </p>
                            )}

                            {/* Requirements/Attachments indicators */}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              {assignment.requirements && JSON.parse(assignment.requirements).length > 0 && (
                                <span className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {JSON.parse(assignment.requirements).length} yêu cầu
                                </span>
                              )}
                              {assignment.attachments && JSON.parse(assignment.attachments).length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Paperclip className="h-3 w-3" />
                                  {JSON.parse(assignment.attachments).length} file đính kèm
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Due date warning */}
                            {assignment.dueDate && (
                              <div className="text-right">
                                <div className={cn(
                                  "text-sm font-medium",
                                  new Date(assignment.dueDate) < new Date() ? "text-red-600" :
                                  new Date(assignment.dueDate).getTime() - new Date().getTime() < 86400000 ? "text-orange-600" :
                                  "text-gray-600"
                                )}>
                                  {getTimeRemaining(assignment.dueDate)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(assignment.dueDate).toLocaleDateString('vi-VN', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/student/assignments/${assignment.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Xem chi tiết
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/student/courses/${assignment.courseId}`}>
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Đến khóa học
                                  </Link>
                                </DropdownMenuItem>
                                {assignment.attachments && JSON.parse(assignment.attachments).length > 0 && (
                                  <DropdownMenuItem>
                                    <Download className="mr-2 h-4 w-4" />
                                    Tải tài liệu
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
    </div>
  );
}