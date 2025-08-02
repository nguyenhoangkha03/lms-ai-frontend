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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Brain,
  Shield,
  GitCompare,
  Tags,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Eye,
  Settings,
  Lightbulb,
} from 'lucide-react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useGetContentAnalysisDashboardQuery } from '@/lib/redux/api/content-analysis-api';
import { ContentQualityDashboard } from './ContentQualityDashboard';
import { PlagiarismDetectionInterface } from './PlagiarismDetectionInterface';
import { SimilarityAnalysisVisualization } from './SimilarityAnalysisVisualization';
import { AutomatedQuizGenerator } from './AutomatedQuizGenerator';
import { ContentTaggingCategorization } from './ContentTaggingCategorization';

const FEATURE_COLORS = {
  quality: '#3b82f6',
  plagiarism: '#ef4444',
  similarity: '#10b981',
  tagging: '#f59e0b',
  quiz_generation: '#8b5cf6',
};

export const ContentAnalysisMainDashboard: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<string>('overview');
  const [selectedContentType, setSelectedContentType] = useState<
    'course' | 'lesson'
  >('lesson');
  const [selectedContentId, setSelectedContentId] = useState<string>('');

  const {
    data: dashboardData,
    isLoading: loadingDashboard,
    refetch: refetchDashboard,
  } = useGetContentAnalysisDashboardQuery();

  const renderOverviewStats = () => {
    if (!dashboardData) return null;

    return (
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Đánh giá chất lượng
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {dashboardData.quality.total_assessments}
            </div>
            <p className="text-xs text-muted-foreground">
              Điểm TB: {dashboardData.quality.average_score.toFixed(1)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Kiểm tra đạo văn
            </CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dashboardData.plagiarism.total_checks}
            </div>
            <p className="text-xs text-muted-foreground">
              Phát hiện: {dashboardData.plagiarism.flagged_content}
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Phân tích tương đồng
            </CardTitle>
            <GitCompare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dashboardData.similarity.total_analyses}
            </div>
            <p className="text-xs text-muted-foreground">
              Tương đồng cao: {dashboardData.similarity.high_similarity_pairs}
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tag và phân loại
            </CardTitle>
            <Tags className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {dashboardData.tagging.total_tags}
            </div>
            <p className="text-xs text-muted-foreground">
              Đã xác minh: {dashboardData.tagging.verified_tags}
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tạo quiz tự động
            </CardTitle>
            <Brain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {dashboardData.quiz_generation.total_quizzes}
            </div>
            <p className="text-xs text-muted-foreground">
              Đã duyệt: {dashboardData.quiz_generation.approved_quizzes}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderFeatureCards = () => {
    if (!dashboardData) return null;

    const features = [
      {
        id: 'quality',
        title: 'Đánh giá chất lượng nội dung',
        description: 'AI phân tích và đánh giá chất lượng nội dung học tập',
        icon: CheckCircle,
        color: 'blue',
        stats: {
          total: dashboardData.quality.total_assessments,
          recent: dashboardData.quality.recent_assessments.length,
          avgScore: dashboardData.quality.average_score,
        },
        recentItems: dashboardData.quality.recent_assessments.slice(0, 3),
      },
      {
        id: 'plagiarism',
        title: 'Kiểm tra đạo văn',
        description: 'Phát hiện và phân tích nội dung có khả năng đạo văn',
        icon: Shield,
        color: 'red',
        stats: {
          total: dashboardData.plagiarism.total_checks,
          recent: dashboardData.plagiarism.recent_checks.length,
          flagged: dashboardData.plagiarism.flagged_content,
        },
        recentItems: dashboardData.plagiarism.recent_checks.slice(0, 3),
      },
      {
        id: 'similarity',
        title: 'Phân tích độ tương đồng',
        description: 'Trực quan hóa và phân tích độ tương đồng giữa nội dung',
        icon: GitCompare,
        color: 'green',
        stats: {
          total: dashboardData.similarity.total_analyses,
          recent: dashboardData.similarity.recent_analyses.length,
          high: dashboardData.similarity.high_similarity_pairs,
        },
        recentItems: dashboardData.similarity.recent_analyses.slice(0, 3),
      },
      {
        id: 'tagging',
        title: 'Tag và phân loại',
        description: 'Quản lý và tạo tag cho nội dung học tập',
        icon: Tags,
        color: 'yellow',
        stats: {
          total: dashboardData.tagging.total_tags,
          recent: dashboardData.tagging.recent_tags.length,
          verified: dashboardData.tagging.verified_tags,
        },
        recentItems: dashboardData.tagging.recent_tags.slice(0, 3),
      },
      {
        id: 'quiz_generation',
        title: 'Tạo quiz tự động',
        description: 'Sử dụng AI để tạo quiz từ nội dung bài học',
        icon: Brain,
        color: 'purple',
        stats: {
          total: dashboardData.quiz_generation.total_quizzes,
          recent: dashboardData.quiz_generation.recent_quizzes.length,
          approved: dashboardData.quiz_generation.approved_quizzes,
        },
        recentItems: dashboardData.quiz_generation.recent_quizzes.slice(0, 3),
      },
    ];

    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {features.map(feature => {
          const Icon = feature.icon;
          const colorClasses = {
            blue: 'border-blue-200 hover:border-blue-300',
            red: 'border-red-200 hover:border-red-300',
            green: 'border-green-200 hover:border-green-300',
            yellow: 'border-yellow-200 hover:border-yellow-300',
            purple: 'border-purple-200 hover:border-purple-300',
          };

          return (
            <Card
              key={feature.id}
              className={`cursor-pointer transition-all hover:shadow-md ${colorClasses[feature.color as keyof typeof colorClasses]}`}
              onClick={() => setSelectedFeature(feature.id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 bg-${feature.color}-100`}>
                    <Icon className={`h-5 w-5 text-${feature.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {feature.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold">
                      {feature.stats.total}
                    </div>
                    <div className="text-muted-foreground">Tổng số</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">
                      {feature.stats.recent}
                    </div>
                    <div className="text-muted-foreground">Gần đây</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">
                      {feature.id === 'quality'
                        ? feature.stats.avgScore?.toFixed(1)
                        : feature.id === 'plagiarism'
                          ? feature.stats.flagged
                          : feature.id === 'similarity'
                            ? feature.stats.high
                            : feature.id === 'tagging'
                              ? feature.stats.verified
                              : feature.stats.approved}
                    </div>
                    <div className="text-muted-foreground">
                      {feature.id === 'quality'
                        ? 'Điểm TB'
                        : feature.id === 'plagiarism'
                          ? 'Phát hiện'
                          : feature.id === 'similarity'
                            ? 'Tương đồng cao'
                            : feature.id === 'tagging'
                              ? 'Đã xác minh'
                              : 'Đã duyệt'}
                    </div>
                  </div>
                </div>

                {feature.recentItems.length > 0 && (
                  <div>
                    <div className="mb-2 text-sm font-medium">
                      Hoạt động gần đây:
                    </div>
                    <div className="space-y-1">
                      {feature.recentItems.map((item: any, index) => (
                        <div
                          key={index}
                          className="truncate text-xs text-muted-foreground"
                        >
                          •{' '}
                          {item.title ||
                            item.tag ||
                            item.content_id ||
                            `Item ${index + 1}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedFeature(feature.id);
                  }}
                >
                  <Eye className="mr-2 h-3 w-3" />
                  Xem chi tiết
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderContentSelector = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Chọn nội dung để phân tích</CardTitle>
        <CardDescription>
          Chọn loại nội dung và ID để xem phân tích chi tiết
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Select
            value={selectedContentType}
            onValueChange={(value: 'course' | 'lesson') =>
              setSelectedContentType(value)
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

          <input
            type="text"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Nhập ID nội dung..."
            value={selectedContentId}
            onChange={e => setSelectedContentId(e.target.value)}
          />

          <Button onClick={() => refetchDashboard()} variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Phân tích
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderFeatureContent = () => {
    const commonProps = {
      selectedContentType: selectedContentId ? selectedContentType : undefined,
      selectedContentId: selectedContentId || undefined,
    };

    const commonPropsPlagiarism = {
      contentType: selectedContentId ? selectedContentType : undefined,
      contentId: selectedContentId || undefined,
    };

    switch (selectedFeature) {
      case 'quality':
        return <ContentQualityDashboard {...commonProps} />;
      case 'plagiarism':
        return <PlagiarismDetectionInterface {...commonPropsPlagiarism} />;
      case 'similarity':
        return <SimilarityAnalysisVisualization {...commonProps} />;
      case 'tagging':
        return <ContentTaggingCategorization {...commonProps} />;
      case 'quiz_generation':
        return <AutomatedQuizGenerator selectedLessonId={selectedContentId} />;
      default:
        return null;
    }
  };

  if (loadingDashboard) {
    return (
      <div className="p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Content Analysis</h1>
          <p className="text-muted-foreground">
            Hệ thống phân tích nội dung thông minh với AI
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setSelectedFeature('overview')}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Tổng quan
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Cài đặt
          </Button>
        </div>
      </div>

      {selectedFeature === 'overview' ? (
        <>
          {renderOverviewStats()}
          {renderContentSelector()}

          <Tabs defaultValue="features" className="space-y-4">
            <TabsList>
              <TabsTrigger value="features">Tính năng</TabsTrigger>
              <TabsTrigger value="activity">Hoạt động gần đây</TabsTrigger>
              <TabsTrigger value="insights">Thông tin chi tiết</TabsTrigger>
            </TabsList>

            <TabsContent value="features" className="space-y-4">
              {renderFeatureCards()}
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {dashboardData && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Đánh giá chất lượng gần đây</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {dashboardData.quality.recent_assessments
                            .slice(0, 5)
                            .map((assessment: any, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between rounded-lg border p-3"
                              >
                                <div>
                                  <div className="font-medium">
                                    {assessment.content_type} •{' '}
                                    {assessment.content_id}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Điểm: {assessment.overall_score}/100 •
                                    {new Date(
                                      assessment.assessed_at
                                    ).toLocaleDateString('vi-VN')}
                                  </div>
                                </div>
                                <Badge
                                  variant={
                                    assessment.quality_level === 'excellent'
                                      ? 'default'
                                      : assessment.quality_level === 'good'
                                        ? 'secondary'
                                        : assessment.quality_level ===
                                            'satisfactory'
                                          ? 'outline'
                                          : 'destructive'
                                  }
                                >
                                  {assessment.quality_level === 'excellent'
                                    ? 'Xuất sắc'
                                    : assessment.quality_level === 'good'
                                      ? 'Tốt'
                                      : assessment.quality_level ===
                                          'satisfactory'
                                        ? 'Đạt yêu cầu'
                                        : assessment.quality_level ===
                                            'needs_improvement'
                                          ? 'Cần cải thiện'
                                          : 'Kém'}
                                </Badge>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Kiểm tra đạo văn gần đây</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {dashboardData.plagiarism.recent_checks
                            .slice(0, 5)
                            .map((check: any, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between rounded-lg border p-3"
                              >
                                <div>
                                  <div className="font-medium">
                                    {check.content_type} • {check.content_id}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Tương đồng:{' '}
                                    {check.overall_similarity?.toFixed(1)}% •
                                    {new Date(
                                      check.scan_started_at
                                    ).toLocaleDateString('vi-VN')}
                                  </div>
                                </div>
                                <Badge
                                  variant={
                                    check.plagiarism_level === 'none'
                                      ? 'default'
                                      : check.plagiarism_level === 'low'
                                        ? 'secondary'
                                        : check.plagiarism_level === 'moderate'
                                          ? 'outline'
                                          : 'destructive'
                                  }
                                >
                                  {check.plagiarism_level === 'none'
                                    ? 'Sạch'
                                    : check.plagiarism_level === 'low'
                                      ? 'Thấp'
                                      : check.plagiarism_level === 'moderate'
                                        ? 'Trung bình'
                                        : check.plagiarism_level === 'high'
                                          ? 'Cao'
                                          : 'Nghiêm trọng'}
                                </Badge>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              {dashboardData && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {/* Quality Insights */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                        Chất lượng nội dung
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm">Điểm trung bình</span>
                            <span className="font-medium">
                              {dashboardData.quality.average_score.toFixed(1)}
                              /100
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-blue-600"
                              style={{
                                width: `${dashboardData.quality.average_score}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <div className="mb-1 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span>Xu hướng cải thiện trong 30 ngày qua</span>
                          </div>
                          <p>
                            Chất lượng nội dung đang được nâng cao với sự hỗ trợ
                            của AI.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Plagiarism Insights */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-600" />
                        Tình hình đạo văn
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm">Tỷ lệ phát hiện</span>
                            <span className="font-medium">
                              {(
                                (dashboardData.plagiarism.flagged_content /
                                  dashboardData.plagiarism.total_checks) *
                                100
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-red-600"
                              style={{
                                width: `${(dashboardData.plagiarism.flagged_content / dashboardData.plagiarism.total_checks) * 100}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <div className="mb-1 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <span>Cần theo dõi</span>
                          </div>
                          <p>
                            Hệ thống đang giám sát chặt chẽ để đảm bảo tính
                            nguyên bản của nội dung.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Generation Insights */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        Tạo nội dung AI
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm">Tỷ lệ duyệt quiz</span>
                            <span className="font-medium">
                              {dashboardData.quiz_generation.total_quizzes > 0
                                ? (
                                    (dashboardData.quiz_generation
                                      .approved_quizzes /
                                      dashboardData.quiz_generation
                                        .total_quizzes) *
                                    100
                                  ).toFixed(1)
                                : 0}
                              %
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-purple-600"
                              style={{
                                width: `${
                                  dashboardData.quiz_generation.total_quizzes >
                                  0
                                    ? (dashboardData.quiz_generation
                                        .approved_quizzes /
                                        dashboardData.quiz_generation
                                          .total_quizzes) *
                                      100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <div className="mb-1 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-600" />
                            <span>AI đang học hỏi</span>
                          </div>
                          <p>
                            Chất lượng quiz tự động được cải thiện liên tục qua
                            phản hồi.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* System Performance Chart */}
              {dashboardData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Hiệu suất hệ thống phân tích</CardTitle>
                    <CardDescription>
                      Tổng quan về các hoạt động phân tích nội dung
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: 'Đánh giá chất lượng',
                              value: dashboardData.quality.total_assessments,
                              color: FEATURE_COLORS.quality,
                            },
                            {
                              name: 'Kiểm tra đạo văn',
                              value: dashboardData.plagiarism.total_checks,
                              color: FEATURE_COLORS.plagiarism,
                            },
                            {
                              name: 'Phân tích tương đồng',
                              value: dashboardData.similarity.total_analyses,
                              color: FEATURE_COLORS.similarity,
                            },
                            {
                              name: 'Quản lý tag',
                              value: dashboardData.tagging.total_tags,
                              color: FEATURE_COLORS.tagging,
                            },
                            {
                              name: 'Tạo quiz',
                              value:
                                dashboardData.quiz_generation.total_quizzes,
                              color: FEATURE_COLORS.quiz_generation,
                            },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent! * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            {
                              name: 'Đánh giá chất lượng',
                              value: dashboardData.quality.total_assessments,
                              color: FEATURE_COLORS.quality,
                            },
                            {
                              name: 'Kiểm tra đạo văn',
                              value: dashboardData.plagiarism.total_checks,
                              color: FEATURE_COLORS.plagiarism,
                            },
                            {
                              name: 'Phân tích tương đồng',
                              value: dashboardData.similarity.total_analyses,
                              color: FEATURE_COLORS.similarity,
                            },
                            {
                              name: 'Quản lý tag',
                              value: dashboardData.tagging.total_tags,
                              color: FEATURE_COLORS.tagging,
                            },
                            {
                              name: 'Tạo quiz',
                              value:
                                dashboardData.quiz_generation.total_quizzes,
                              color: FEATURE_COLORS.quiz_generation,
                            },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setSelectedFeature('overview')}
            >
              ← Quay lại tổng quan
            </Button>
            <div className="flex-1">{renderContentSelector()}</div>
          </div>
          {renderFeatureContent()}
        </div>
      )}
    </div>
  );
};
