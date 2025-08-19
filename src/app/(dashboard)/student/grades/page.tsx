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
  SelectValue 
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

  const filteredGrades = grades.filter(grade =>
    grade.assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    grade.assessment.course?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedGrades = filteredGrades.sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.gradedAt || b.createdAt).getTime() - 
               new Date(a.gradedAt || a.createdAt).getTime();
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
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBadge = (grade: any) => {
    switch (grade.status) {
      case 'finalized':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Hoàn thành
          </Badge>
        );
      case 'graded':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Award className="mr-1 h-3 w-3" />
            Đã chấm
          </Badge>
        );
      case 'under_review':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Đang xem xét
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <AlertCircle className="mr-1 h-3 w-3" />
            Đang chờ
          </Badge>
        );
    }
  };

  const calculateStats = () => {
    const publishedGrades = grades.filter(g => g.isPublished);
    if (publishedGrades.length === 0) return { average: 0, total: 0, passing: 0, highest: 0 };

    const scores = publishedGrades.map(g => g.percentage);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
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
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-red-600">
            Không thể tải danh sách điểm
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
          <h1 className="text-3xl font-bold">Sổ điểm</h1>
          <p className="text-muted-foreground">
            Xem điểm số và nhận xét cho các bài tập, kiểm tra
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
          <Button variant="outline" asChild>
            <Link href="/student/analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Phân tích chi tiết
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
                <p className="text-sm font-medium text-muted-foreground">Điểm trung bình</p>
                <p className={cn("text-2xl font-bold", getGradeColor(stats.average))}>
                  {stats.average}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Xếp loại: {stats.average >= 90 ? 'A' : stats.average >= 80 ? 'B' : stats.average >= 70 ? 'C' : stats.average >= 60 ? 'D' : 'F'}
                </p>
              </div>
              <Award className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tổng số bài</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-green-600">
                  {stats.passing}/{stats.total} đạt
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Điểm cao nhất</p>
                <p className={cn("text-2xl font-bold", getGradeColor(stats.highest))}>
                  {stats.highest}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Thành tích tốt nhất
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tỷ lệ đậu</p>
                <p className="text-2xl font-bold">
                  {stats.total > 0 ? Math.round((stats.passing / stats.total) * 100) : 0}%
                </p>
                <Progress 
                  value={stats.total > 0 ? (stats.passing / stats.total) * 100 : 0} 
                  className="mt-1 h-1" 
                />
              </div>
              <CheckCircle className="h-8 w-8 text-orange-500" />
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
                    placeholder="Tìm kiếm bài tập, khóa học..."
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
                    <SelectItem value="recent">Mới nhất</SelectItem>
                    <SelectItem value="score_high">Điểm cao nhất</SelectItem>
                    <SelectItem value="score_low">Điểm thấp nhất</SelectItem>
                    <SelectItem value="title">Tên A-Z</SelectItem>
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
            <TabsTrigger value="finalized" className="flex items-center gap-2">
              Hoàn thành
              {tabCounts.finalized > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.finalized}
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
            <TabsTrigger value="pending" className="flex items-center gap-2">
              Đang chờ
              {tabCounts.pending > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tabCounts.pending}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Grades List */}
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
                          <Skeleton className="h-3 w-1/3" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedGrades?.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-xl font-semibold text-gray-600">
                  Chưa có điểm số nào
                </h3>
                <p className="mb-4 text-gray-500">
                  Hoàn thành các bài tập và kiểm tra để xem điểm ở đây
                </p>
                <Button asChild>
                  <Link href="/student/my-courses">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Tiếp tục học
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedGrades?.map((grade, index) => (
                  <motion.div
                    key={grade.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="transition-shadow hover:shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">
                                {grade.assessment.title}
                              </h3>
                              {getGradeBadge(grade)}
                              {grade.isAiGraded && (
                                <Badge variant="outline" className="text-xs">
                                  AI Graded
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                {grade.assessment.course?.title || 'Khóa học'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(grade.gradedAt || grade.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                              {grade.assessment.type && (
                                <span className="capitalize">
                                  {grade.assessment.type === 'quiz' ? 'Bài kiểm tra' : 
                                   grade.assessment.type === 'assignment' ? 'Bài tập' : 
                                   grade.assessment.type}
                                </span>
                              )}
                            </div>

                            {grade.overallFeedback && (
                              <div className="bg-gray-50 rounded-lg p-3 mt-3">
                                <p className="text-sm text-gray-700">
                                  <MessageSquare className="inline h-4 w-4 mr-1" />
                                  {grade.overallFeedback}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            {/* Score Display */}
                            <div className="text-right">
                              <div className={cn("text-3xl font-bold", getGradeColor(grade.percentage))}>
                                {grade.score}/{grade.maxScore}
                              </div>
                              <div className={cn("text-lg font-semibold", getGradeColor(grade.percentage))}>
                                {grade.percentage}% ({grade.letterGrade})
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {grade.isPassing ? 'Đạt' : 'Không đạt'}
                              </div>
                            </div>

                            {/* Actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => setSelectedGrade(grade)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Xem chi tiết
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/student/assessments/${grade.assessment.id}/results`}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Xem bài làm
                                  </Link>
                                </DropdownMenuItem>
                                {grade.assessment.course && (
                                  <DropdownMenuItem asChild>
                                    <Link href={`/student/courses/${grade.assessment.course.id}`}>
                                      <BookOpen className="mr-2 h-4 w-4" />
                                      Đến khóa học
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
      <AlertDialog open={!!selectedGrade} onOpenChange={() => setSelectedGrade(null)}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Chi tiết điểm số</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                {selectedGrade && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Bài tập:</label>
                        <p>{selectedGrade.assessment.title}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Điểm số:</label>
                        <p className={cn("text-lg font-bold", getGradeColor(selectedGrade.percentage))}>
                          {selectedGrade.score}/{selectedGrade.maxScore} ({selectedGrade.percentage}%)
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Xếp loại:</label>
                        <p>{selectedGrade.letterGrade}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Trạng thái:</label>
                        <div>{getGradeBadge(selectedGrade)}</div>
                      </div>
                    </div>

                    {selectedGrade.overallFeedback && (
                      <div>
                        <label className="text-sm font-medium">Nhận xét chung:</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded">
                          {selectedGrade.overallFeedback}
                        </div>
                      </div>
                    )}

                    {selectedGrade.comments && (
                      <div>
                        <label className="text-sm font-medium">Ghi chú thêm:</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded">
                          {selectedGrade.comments}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                      <div>
                        <label>Ngày chấm:</label>
                        <p>{selectedGrade.gradedAt ? new Date(selectedGrade.gradedAt).toLocaleString('vi-VN') : 'Chưa chấm'}</p>
                      </div>
                      <div>
                        <label>Người chấm:</label>
                        <p>{selectedGrade.isAiGraded ? 'Hệ thống AI' : 'Giảng viên'}</p>
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
  );
}