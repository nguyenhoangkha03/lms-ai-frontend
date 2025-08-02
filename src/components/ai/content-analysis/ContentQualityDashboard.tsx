'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Eye,
  Plus,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  useGetQualityAssessmentsQuery,
  useAssessContentQualityMutation,
  useGetQualityStatisticsQuery,
  useGetQualityTrendsQuery,
} from '@/lib/redux/api/content-analysis-api';
import { ContentQualityAssessment } from '@/lib/types/content-analysis';

const QUALITY_COLORS = {
  excellent: '#22c55e',
  good: '#84cc16',
  satisfactory: '#eab308',
  needs_improvement: '#f97316',
  poor: '#ef4444',
};

const DIMENSION_LABELS = {
  clarity: 'Rõ ràng',
  engagement: 'Hấp dẫn',
  accuracy: 'Chính xác',
  completeness: 'Đầy đủ',
  structure: 'Cấu trúc',
};

interface ContentQualityDashboardProps {
  selectedContentType?: 'course' | 'lesson';
  selectedContentId?: string;
}

export const ContentQualityDashboard: React.FC<
  ContentQualityDashboardProps
> = ({ selectedContentType, selectedContentId }) => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    content_type: (selectedContentType as 'course' | 'lesson') || '',
    quality_level: '',
    search: '',
  });

  const [selectedAssessment, setSelectedAssessment] =
    useState<ContentQualityAssessment | null>(null);
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);
  const [assessmentConfig, setAssessmentConfig] = useState({
    content_type: 'lesson' as 'course' | 'lesson',
    content_id: '',
    analysis_type: 'full' as 'full' | 'quick' | 'detailed',
  });

  // API Queries
  const {
    data: assessments,
    isLoading: loadingAssessments,
    refetch: refetchAssessments,
  } = useGetQualityAssessmentsQuery(filters);

  const { data: statistics, isLoading: loadingStats } =
    useGetQualityStatisticsQuery({ period: '30d' });

  const { data: trends } = useGetQualityTrendsQuery(
    selectedContentType && selectedContentId
      ? {
          content_type: selectedContentType,
          content_id: selectedContentId,
          period: '30d',
        }
      : { content_type: 'lesson', content_id: 'default' },
    { skip: !selectedContentType || !selectedContentId }
  );

  // Mutations
  const [assessContentQuality, { isLoading: assessingContent }] =
    useAssessContentQualityMutation();

  const handleAssessContent = async () => {
    try {
      await assessContentQuality(assessmentConfig).unwrap();
      setShowAssessmentDialog(false);
      refetchAssessments();
    } catch (error) {
      console.error('Failed to assess content:', error);
    }
  };

  const getQualityBadge = (level: string) => {
    const variants = {
      excellent: 'default',
      good: 'secondary',
      satisfactory: 'outline',
      needs_improvement: 'destructive',
      poor: 'destructive',
    } as const;

    const labels = {
      excellent: 'Xuất sắc',
      good: 'Tốt',
      satisfactory: 'Đạt yêu cầu',
      needs_improvement: 'Cần cải thiện',
      poor: 'Kém',
    };

    return (
      <Badge variant={variants[level as keyof typeof variants]}>
        {labels[level as keyof typeof labels]}
      </Badge>
    );
  };

  const renderStatisticsCards = () => {
    if (loadingStats || !statistics) {
      return <LoadingSpinner />;
    }

    return (
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng số đánh giá
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.overview.total_assessments}
            </div>
            <p className="text-xs text-muted-foreground">Trong 30 ngày qua</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Điểm trung bình
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.overview.average_score.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Trên thang điểm 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nội dung chất lượng cao
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.overview.quality_distribution.excellent +
                statistics.overview.quality_distribution.good}
            </div>
            <p className="text-xs text-muted-foreground">Đạt mức tốt trở lên</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cần cải thiện</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.overview.quality_distribution.needs_improvement +
                statistics.overview.quality_distribution.poor}
            </div>
            <p className="text-xs text-muted-foreground">Yêu cầu xem xét</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderQualityDistribution = () => {
    if (!statistics) return null;

    const data = Object.entries(statistics.overview.quality_distribution).map(
      ([level, count]) => ({
        name: DIMENSION_LABELS[level as keyof typeof DIMENSION_LABELS] || level,
        value: count,
        color: QUALITY_COLORS[level as keyof typeof QUALITY_COLORS],
      })
    );

    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Phân bố chất lượng</CardTitle>
          <CardDescription>
            Tỷ lệ nội dung theo mức độ chất lượng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderTrendsChart = () => {
    if (!statistics?.trends) return null;

    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Xu hướng chất lượng</CardTitle>
          <CardDescription>Điểm trung bình theo thời gian</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={statistics.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={value =>
                  new Date(value).toLocaleDateString('vi-VN')
                }
              />
              <YAxis domain={[0, 100]} />
              <Tooltip
                labelFormatter={value =>
                  new Date(value).toLocaleDateString('vi-VN')
                }
                formatter={(value: number) => [value.toFixed(1), 'Điểm']}
              />
              <Line
                type="monotone"
                dataKey="average_score"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ fill: '#8884d8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderContentTypeStats = () => {
    if (!statistics?.by_content_type) return null;

    const data = Object.entries(statistics.by_content_type).map(
      ([type, stats]) => ({
        type: type === 'course' ? 'Khóa học' : 'Bài học',
        count: stats.count,
        average_score: stats.average_score,
      })
    );

    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Thống kê theo loại</CardTitle>
          <CardDescription>Chất lượng theo loại nội dung</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === 'average_score' ? value.toFixed(1) : value,
                  name === 'average_score' ? 'Điểm TB' : 'Số lượng',
                ]}
              />
              <Bar dataKey="count" fill="#8884d8" name="count" />
              <Bar
                dataKey="average_score"
                fill="#82ca9d"
                name="average_score"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderAssessmentsList = () => {
    if (loadingAssessments) {
      return <LoadingSpinner />;
    }

    if (!assessments?.data.length) {
      return (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Chưa có đánh giá nào</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {assessments.data.map(assessment => (
          <Card
            key={assessment.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <Badge variant="outline">
                      {assessment.content_type === 'course'
                        ? 'Khóa học'
                        : 'Bài học'}
                    </Badge>
                    {getQualityBadge(assessment.quality_level)}
                    <span className="text-sm text-muted-foreground">
                      {new Date(assessment.assessed_at).toLocaleDateString(
                        'vi-VN'
                      )}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-medium">
                        Điểm tổng: {assessment.overall_score}/100
                      </span>
                    </div>
                    <Progress
                      value={assessment.overall_score}
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-5 gap-2 text-sm">
                    {Object.entries(assessment.dimensionScores).map(
                      ([dimension, score]) => (
                        <div key={dimension} className="text-center">
                          <div className="text-xs text-muted-foreground">
                            {
                              DIMENSION_LABELS[
                                dimension as keyof typeof DIMENSION_LABELS
                              ]
                            }
                          </div>
                          <div className="font-medium">{score}</div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAssessment(assessment)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderAssessmentDetail = () => {
    if (!selectedAssessment) return null;

    return (
      <Dialog
        open={!!selectedAssessment}
        onOpenChange={() => setSelectedAssessment(null)}
      >
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đánh giá chất lượng</DialogTitle>
            <DialogDescription>
              Đánh giá cho{' '}
              {selectedAssessment.content_type === 'course'
                ? 'khóa học'
                : 'bài học'}{' '}
              •
              {new Date(selectedAssessment.assessed_at).toLocaleDateString(
                'vi-VN'
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Điểm tổng quan */}
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold">
                {selectedAssessment.overall_score}/100
              </div>
              {getQualityBadge(selectedAssessment.quality_level)}
            </div>

            {/* Điểm chi tiết */}
            <Card>
              <CardHeader>
                <CardTitle>Điểm chi tiết theo tiêu chí</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(selectedAssessment.dimensionScores).map(
                    ([dimension, score]) => (
                      <div key={dimension}>
                        <div className="mb-1 flex justify-between">
                          <span>
                            {
                              DIMENSION_LABELS[
                                dimension as keyof typeof DIMENSION_LABELS
                              ]
                            }
                          </span>
                          <span className="font-medium">{score}/100</span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Phân tích */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Điểm mạnh</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedAssessment.analysis.strengths.map(
                      (strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                          <span className="text-sm">{strength}</span>
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-600">
                    Điểm cần cải thiện
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedAssessment.analysis.weaknesses.map(
                      (weakness, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                          <span className="text-sm">{weakness}</span>
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Gợi ý cải thiện */}
            <Card>
              <CardHeader>
                <CardTitle>Gợi ý cải thiện</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {selectedAssessment.analysis.suggestions.map(
                    (suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                        <span className="text-sm">{suggestion}</span>
                      </li>
                    )
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Thông tin kỹ thuật */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin đánh giá</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Phiên bản AI:</span>
                    <span className="ml-2">
                      {selectedAssessment.ai_model_version}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Đánh giá mới nhất:
                    </span>
                    <span className="ml-2">
                      {selectedAssessment.is_latest ? 'Có' : 'Không'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Đánh giá chất lượng nội dung</h1>
          <p className="text-muted-foreground">
            Phân tích và đánh giá chất lượng nội dung khóa học bằng AI
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetchAssessments()}
            disabled={loadingAssessments}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Tải lại
          </Button>
          <Button onClick={() => setShowAssessmentDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Đánh giá mới
          </Button>
        </div>
      </div>

      {renderStatisticsCards()}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="assessments">Danh sách đánh giá</TabsTrigger>
          <TabsTrigger value="trends">Xu hướng</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {renderQualityDistribution()}
            {renderTrendsChart()}
            {renderContentTypeStats()}
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bộ lọc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Input
                  placeholder="Tìm kiếm..."
                  value={filters.search}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, search: e.target.value }))
                  }
                />
                <Select
                  value={filters.content_type}
                  onValueChange={value =>
                    setFilters(prev => ({
                      ...prev,
                      content_type: value as 'course' | 'lesson',
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Loại nội dung" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    <SelectItem value="course">Khóa học</SelectItem>
                    <SelectItem value="lesson">Bài học</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.quality_level}
                  onValueChange={value =>
                    setFilters(prev => ({ ...prev, quality_level: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mức chất lượng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    <SelectItem value="excellent">Xuất sắc</SelectItem>
                    <SelectItem value="good">Tốt</SelectItem>
                    <SelectItem value="satisfactory">Đạt yêu cầu</SelectItem>
                    <SelectItem value="needs_improvement">
                      Cần cải thiện
                    </SelectItem>
                    <SelectItem value="poor">Kém</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {renderAssessmentsList()}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {selectedContentType && selectedContentId && trends ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Xu hướng điểm số</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trends.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cải thiện theo chiều hướng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trends.improvements.map((improvement, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span>
                          {
                            DIMENSION_LABELS[
                              improvement.dimension as keyof typeof DIMENSION_LABELS
                            ]
                          }
                        </span>
                        <div className="flex items-center gap-2">
                          {improvement.change > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span
                            className={
                              improvement.change > 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }
                          >
                            {improvement.change > 0 ? '+' : ''}
                            {improvement.change.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  Chọn một nội dung cụ thể để xem xu hướng chi tiết
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog đánh giá mới */}
      <Dialog
        open={showAssessmentDialog}
        onOpenChange={setShowAssessmentDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo đánh giá chất lượng mới</DialogTitle>
            <DialogDescription>
              Sử dụng AI để đánh giá chất lượng nội dung
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Loại nội dung</label>
              <Select
                value={assessmentConfig.content_type}
                onValueChange={(value: 'course' | 'lesson') =>
                  setAssessmentConfig(prev => ({
                    ...prev,
                    content_type: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="course">Khóa học</SelectItem>
                  <SelectItem value="lesson">Bài học</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">ID nội dung</label>
              <Input
                value={assessmentConfig.content_id}
                onChange={e =>
                  setAssessmentConfig(prev => ({
                    ...prev,
                    content_id: e.target.value,
                  }))
                }
                placeholder="Nhập ID của nội dung cần đánh giá"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Loại phân tích</label>
              <Select
                value={assessmentConfig.analysis_type}
                onValueChange={(value: 'full' | 'quick' | 'detailed') =>
                  setAssessmentConfig(prev => ({
                    ...prev,
                    analysis_type: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">Nhanh</SelectItem>
                  <SelectItem value="full">Đầy đủ</SelectItem>
                  <SelectItem value="detailed">Chi tiết</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAssessmentDialog(false)}
              >
                Hủy
              </Button>
              <Button
                onClick={handleAssessContent}
                disabled={!assessmentConfig.content_id || assessingContent}
              >
                {assessingContent && (
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                )}
                Bắt đầu đánh giá
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {renderAssessmentDetail()}
    </div>
  );
};
