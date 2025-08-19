'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  SelectValue 
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function MyCoursesPage() {
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const {
    data: enrollments,
    isLoading,
    error,
    refetch,
  } = useGetUserEnrollmentsQuery({
    status: selectedTab === 'all' ? undefined : selectedTab as any,
    limit: 50,
  });

  const filteredEnrollments = enrollments?.filter(enrollment =>
    enrollment.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    enrollment.course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedEnrollments = filteredEnrollments?.sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.lastAccessedAt || b.enrollmentDate).getTime() - 
               new Date(a.lastAccessedAt || a.enrollmentDate).getTime();
      case 'progress':
        return b.progressPercentage - a.progressPercentage;
      case 'title':
        return a.course.title.localeCompare(b.course.title);
      case 'date_enrolled':
        return new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime();
      default:
        return 0;
    }
  });

  const getStatusBadge = (enrollment: any) => {
    switch (enrollment.status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Hoàn thành
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Play className="mr-1 h-3 w-3" />
            Đang học
          </Badge>
        );
      case 'paused':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Pause className="mr-1 h-3 w-3" />
            Tạm dừng
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <BookOpen className="mr-1 h-3 w-3" />
            Đã đăng ký
          </Badge>
        );
    }
  };

  const getTabCounts = () => {
    if (!enrollments) return { all: 0, active: 0, completed: 0, paused: 0 };
    
    return {
      all: enrollments.length,
      active: enrollments.filter(e => e.status === 'in_progress' || e.status === 'enrolled').length,
      completed: enrollments.filter(e => e.status === 'completed').length,
      paused: enrollments.filter(e => e.status === 'paused').length,
    };
  };

  const tabCounts = getTabCounts();

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-red-600">
            Không thể tải danh sách khóa học
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
          <h1 className="text-3xl font-bold">Khóa học của tôi</h1>
          <p className="text-muted-foreground">
            Quản lý và tiếp tục học các khóa học đã đăng ký
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/courses">
              <BookOpen className="mr-2 h-4 w-4" />
              Khám phá khóa học
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-4 md:grid-cols-4"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tổng khóa học</p>
                <p className="text-2xl font-bold">{tabCounts.all}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Đang học</p>
                <p className="text-2xl font-bold">{tabCounts.active}</p>
              </div>
              <Play className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hoàn thành</p>
                <p className="text-2xl font-bold">{tabCounts.completed}</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Thời gian học</p>
                <p className="text-2xl font-bold">
                  {enrollments ? Math.round(enrollments.reduce((sum, e) => sum + e.totalTimeSpent, 0) / 3600) : 0}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
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
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm khóa học, giảng viên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Gần đây nhất</SelectItem>
                    <SelectItem value="progress">Tiến độ</SelectItem>
                    <SelectItem value="title">Tên A-Z</SelectItem>
                    <SelectItem value="date_enrolled">Ngày đăng ký</SelectItem>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              Tất cả
              {tabCounts.all > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.all}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              Đang học
              {tabCounts.active > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.active}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              Hoàn thành
              {tabCounts.completed > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.completed}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="paused" className="flex items-center gap-2">
              Tạm dừng
              {tabCounts.paused > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.paused}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Course List */}
          <TabsContent value={selectedTab} className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-0">
                      <Skeleton className="h-48 w-full rounded-t-lg" />
                      <div className="space-y-3 p-4">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedEnrollments?.length === 0 ? (
              <div className="py-12 text-center">
                <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-xl font-semibold text-gray-600">
                  {selectedTab === 'all' ? 'Chưa có khóa học nào' : `Không có khóa học ${selectedTab}`}
                </h3>
                <p className="mb-4 text-gray-500">
                  {selectedTab === 'all' 
                    ? 'Hãy khám phá và đăng ký các khóa học mới'
                    : 'Thử thay đổi bộ lọc để xem các khóa học khác'
                  }
                </p>
                {selectedTab === 'all' && (
                  <Button asChild>
                    <Link href="/courses">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Khám phá khóa học
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sortedEnrollments?.map((enrollment, index) => (
                  <motion.div
                    key={enrollment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                      <CardContent className="p-0">
                        {/* Course Image */}
                        <div className="relative h-48">
                          <Image
                            src={enrollment.course.thumbnailUrl}
                            alt={enrollment.course.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-3 left-3">
                            {getStatusBadge(enrollment)}
                          </div>
                          <div className="absolute top-3 right-3">
                            <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/20 text-white hover:bg-black/40">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Course Info */}
                        <div className="p-4">
                          <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
                            <span>{enrollment.course.instructor.name}</span>
                            <span>•</span>
                            <span>{enrollment.course.category.name}</span>
                          </div>

                          <h3 className="mb-2 font-semibold leading-tight line-clamp-2">
                            <Link 
                              href={`/student/courses/${enrollment.course.id}`}
                              className="hover:text-blue-600 transition-colors"
                            >
                              {enrollment.course.title}
                            </Link>
                          </h3>

                          {/* Progress */}
                          <div className="mb-3">
                            <div className="mb-1 flex justify-between text-sm">
                              <span>Tiến độ</span>
                              <span>{Math.round(enrollment.progressPercentage)}%</span>
                            </div>
                            <Progress value={enrollment.progressPercentage} className="h-2" />
                          </div>

                          {/* Stats */}
                          <div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{enrollment.formattedTimeSpent}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              <span>{enrollment.lessonsCompleted}/{enrollment.totalLessons}</span>
                            </div>
                            {enrollment.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{enrollment.rating}</span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button 
                              className="flex-1" 
                              size="sm"
                              asChild
                            >
                              <Link href={`/student/courses/${enrollment.course.id}`}>
                                <Play className="mr-2 h-4 w-4" />
                                {enrollment.status === 'completed' ? 'Xem lại' : 'Tiếp tục'}
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Last accessed */}
                          {enrollment.lastAccessedAt && (
                            <div className="mt-3 text-xs text-gray-500">
                              Lần cuối: {new Date(enrollment.lastAccessedAt).toLocaleDateString('vi-VN')}
                            </div>
                          )}
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