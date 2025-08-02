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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  AlertTriangle,
  Shield,
  Search,
  ExternalLink,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
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
} from 'recharts';
import {
  useGetPlagiarismChecksQuery,
  useCheckPlagiarismMutation,
  useBulkCheckPlagiarismMutation,
  useGetPlagiarismStatisticsQuery,
} from '@/lib/redux/api/content-analysis-api';
import { PlagiarismCheck } from '@/lib/types/content-analysis';

const PLAGIARISM_COLORS = {
  none: '#22c55e',
  low: '#84cc16',
  moderate: '#eab308',
  high: '#f97316',
  severe: '#ef4444',
};

const STATUS_COLORS = {
  pending: '#6b7280',
  scanning: '#3b82f6',
  completed: '#22c55e',
  failed: '#ef4444',
};

interface PlagiarismDetectionInterfaceProps {
  contentType?: 'course' | 'lesson' | 'assignment' | 'forum_post';
  contentId?: string;
}

export const PlagiarismDetectionInterface: React.FC<
  PlagiarismDetectionInterfaceProps
> = ({ contentType, contentId }) => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    content_type: contentType || '',
    status: '',
    plagiarism_level: '',
    search: '',
  });

  const [selectedCheck, setSelectedCheck] = useState<PlagiarismCheck | null>(
    null
  );
  const [showCheckDialog, setShowCheckDialog] = useState(false);
  const [checkConfig, setCheckConfig] = useState({
    content_type: 'lesson' as 'course' | 'lesson' | 'assignment' | 'forum_post',
    content_id: '',
    content: '',
    configuration: {
      sensitivity: 'medium' as 'low' | 'medium' | 'high',
      excludeQuotes: true,
      excludeReferences: true,
      minimumMatchLength: 20,
    },
  });

  // API Queries
  const {
    data: checks,
    isLoading: loadingChecks,
    refetch: refetchChecks,
  } = useGetPlagiarismChecksQuery(filters);

  const { data: statistics, isLoading: loadingStats } =
    useGetPlagiarismStatisticsQuery({ period: '30d' });

  // Mutations
  const [checkPlagiarism, { isLoading: checkingPlagiarism }] =
    useCheckPlagiarismMutation();
  const [bulkCheckPlagiarism, { isLoading: bulkChecking }] =
    useBulkCheckPlagiarismMutation();

  const handleCheckPlagiarism = async () => {
    try {
      await checkPlagiarism(checkConfig).unwrap();
      setShowCheckDialog(false);
      refetchChecks();
    } catch (error) {
      console.error('Failed to check plagiarism:', error);
    }
  };

  const getPlagiarismBadge = (level: string) => {
    const variants = {
      none: 'default',
      low: 'secondary',
      moderate: 'outline',
      high: 'destructive',
      severe: 'destructive',
    } as const;

    const labels = {
      none: 'Sạch',
      low: 'Thấp',
      moderate: 'Trung bình',
      high: 'Cao',
      severe: 'Nghiêm trọng',
    };

    return (
      <Badge variant={variants[level as keyof typeof variants]}>
        {labels[level as keyof typeof labels]}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const icons = {
      pending: <Clock className="h-3 w-3" />,
      scanning: <Loader className="h-3 w-3 animate-spin" />,
      completed: <CheckCircle className="h-3 w-3" />,
      failed: <XCircle className="h-3 w-3" />,
    };

    const labels = {
      pending: 'Chờ xử lý',
      scanning: 'Đang quét',
      completed: 'Hoàn thành',
      failed: 'Thất bại',
    };

    return (
      <Badge variant="outline" className="flex items-center gap-1">
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels]}
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
              Tổng số kiểm tra
            </CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.overview.total_checks}
            </div>
            <p className="text-xs text-muted-foreground">Trong 30 ngày qua</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nội dung bị cảnh báo
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.overview.flagged_content}
            </div>
            <p className="text-xs text-muted-foreground">
              {(
                (statistics.overview.flagged_content /
                  statistics.overview.total_checks) *
                100
              ).toFixed(1)}
              % tổng số
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Độ tương đồng TB
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.overview.average_similarity.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Trung bình toàn hệ thống
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nguồn hàng đầu
            </CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.top_sources.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Nguồn được phát hiện
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPlagiarismDistribution = () => {
    if (!statistics) return null;

    const data = Object.entries(statistics.overview.by_level).map(
      ([level, count]) => ({
        name:
          level === 'none'
            ? 'Sạch'
            : level === 'low'
              ? 'Thấp'
              : level === 'moderate'
                ? 'Trung bình'
                : level === 'high'
                  ? 'Cao'
                  : 'Nghiêm trọng',
        value: count,
        color: PLAGIARISM_COLORS[level as keyof typeof PLAGIARISM_COLORS],
      })
    );

    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Phân bố mức độ</CardTitle>
          <CardDescription>Tỷ lệ nội dung theo mức độ đạo văn</CardDescription>
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
                  `${name} ${(percent! * 100).toFixed(0)}%`
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
          <CardTitle>Xu hướng kiểm tra</CardTitle>
          <CardDescription>
            Số lượng kiểm tra và phát hiện theo thời gian
          </CardDescription>
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
              <YAxis />
              <Tooltip
                labelFormatter={value =>
                  new Date(value).toLocaleDateString('vi-VN')
                }
              />
              <Line
                type="monotone"
                dataKey="checks_count"
                stroke="#8884d8"
                strokeWidth={2}
                name="Số kiểm tra"
              />
              <Line
                type="monotone"
                dataKey="flagged_count"
                stroke="#ef4444"
                strokeWidth={2}
                name="Phát hiện"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderTopSources = () => {
    if (!statistics?.top_sources) return null;

    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Nguồn phổ biến</CardTitle>
          <CardDescription>Các nguồn thường bị phát hiện</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statistics.top_sources.slice(0, 5).map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {source.source}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {source.matches} lần •{' '}
                    {source.average_similarity.toFixed(1)}% TB
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{source.matches}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderChecksList = () => {
    if (loadingChecks) {
      return <LoadingSpinner />;
    }

    if (!checks?.data.length) {
      return (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Chưa có kiểm tra nào</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {checks.data.map(check => (
          <Card
            key={check.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <Badge variant="outline">
                      {check.content_type === 'course'
                        ? 'Khóa học'
                        : check.content_type === 'lesson'
                          ? 'Bài học'
                          : check.content_type === 'assignment'
                            ? 'Bài tập'
                            : 'Bài đăng'}
                    </Badge>
                    {getStatusBadge(check.status)}
                    {check.status === 'completed' &&
                      getPlagiarismBadge(check.plagiarism_level)}
                    <span className="text-sm text-muted-foreground">
                      {new Date(check.scan_started_at).toLocaleDateString(
                        'vi-VN'
                      )}
                    </span>
                  </div>

                  {check.status === 'completed' && (
                    <>
                      <div className="mb-3">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-medium">
                            Độ tương đồng: {check.overall_similarity.toFixed(1)}
                            %
                          </span>
                          <span className="text-sm text-muted-foreground">
                            • {check.matches_found} kết quả từ{' '}
                            {check.sources_checked} nguồn
                          </span>
                        </div>
                        <Progress
                          value={check.overall_similarity}
                          className="h-2"
                          style={
                            {
                              '--progress-background':
                                PLAGIARISM_COLORS[
                                  check.plagiarism_level as keyof typeof PLAGIARISM_COLORS
                                ],
                            } as React.CSSProperties
                          }
                        />
                      </div>

                      {check.matches.length > 0 && (
                        <div className="text-sm">
                          <p className="mb-1 text-muted-foreground">
                            Nguồn phát hiện:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {check.matches.slice(0, 3).map((match, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {match.source} ({match.similarity.toFixed(1)}%)
                              </Badge>
                            ))}
                            {check.matches.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{check.matches.length - 3} khác
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {check.status === 'scanning' && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader className="h-4 w-4 animate-spin" />
                      Đang quét {check.sources_checked} nguồn...
                    </div>
                  )}

                  {check.status === 'failed' && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <XCircle className="h-4 w-4" />
                      Kiểm tra thất bại
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCheck(check)}
                  disabled={check.status !== 'completed'}
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderCheckDetail = () => {
    if (!selectedCheck) return null;

    return (
      <Dialog
        open={!!selectedCheck}
        onOpenChange={() => setSelectedCheck(null)}
      >
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết kiểm tra đạo văn</DialogTitle>
            <DialogDescription>
              Kiểm tra cho{' '}
              {selectedCheck.content_type === 'course'
                ? 'khóa học'
                : selectedCheck.content_type === 'lesson'
                  ? 'bài học'
                  : selectedCheck.content_type === 'assignment'
                    ? 'bài tập'
                    : 'bài đăng'}{' '}
              •
              {new Date(selectedCheck.scan_started_at).toLocaleDateString(
                'vi-VN'
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Tổng quan */}
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold">
                {selectedCheck.overall_similarity.toFixed(1)}%
              </div>
              {getPlagiarismBadge(selectedCheck.plagiarism_level)}
              <p className="mt-2 text-sm text-muted-foreground">
                {selectedCheck.matches_found} kết quả từ{' '}
                {selectedCheck.sources_checked} nguồn
              </p>
            </div>

            {/* Thông tin quét */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin quét</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Bắt đầu:</span>
                    <span className="ml-2">
                      {new Date(selectedCheck.scan_started_at).toLocaleString(
                        'vi-VN'
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hoàn thành:</span>
                    <span className="ml-2">
                      {selectedCheck.scan_completed_at
                        ? new Date(
                            selectedCheck.scan_completed_at
                          ).toLocaleString('vi-VN')
                        : 'Chưa hoàn thành'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Độ nhạy:</span>
                    <span className="ml-2 capitalize">
                      {selectedCheck.scanConfiguration.sensitivity}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Độ dài tối thiểu:
                    </span>
                    <span className="ml-2">
                      {selectedCheck.scanConfiguration.minimumMatchLength} ký tự
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kết quả phát hiện */}
            {selectedCheck.matches.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Kết quả phát hiện ({selectedCheck.matches.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedCheck.matches.map((match, index) => (
                      <div key={index} className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {match.similarity.toFixed(1)}%
                            </Badge>
                            <span className="font-medium">{match.source}</span>
                            {match.sourceUrl && (
                              <Button variant="ghost" size="sm" asChild>
                                <a
                                  href={match.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </Button>
                            )}
                          </div>
                          <Badge variant="secondary">
                            Tin cậy: {(match.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <div className="rounded bg-muted p-3 text-sm">
                          <p className="mb-1 text-muted-foreground">
                            Đoạn văn phát hiện:
                          </p>
                          <p className="italic">"{match.matchedText}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Phân tích */}
            <Card>
              <CardHeader>
                <CardTitle>Phân tích kết quả</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-medium">Tóm tắt</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedCheck.analysis.summary}
                    </p>
                  </div>

                  {selectedCheck.analysis.details.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-medium">Chi tiết</h4>
                      <ul className="space-y-1">
                        {selectedCheck.analysis.details.map((detail, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedCheck.analysis.recommendations.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-medium">Khuyến nghị</h4>
                      <ul className="space-y-1">
                        {selectedCheck.analysis.recommendations.map(
                          (recommendation, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-600" />
                              {recommendation}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
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
          <h1 className="text-3xl font-bold">Kiểm tra đạo văn</h1>
          <p className="text-muted-foreground">
            Phát hiện và phân tích nội dung có khả năng đạo văn
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetchChecks()}
            disabled={loadingChecks}
          >
            <Search className="mr-2 h-4 w-4" />
            Tải lại
          </Button>
          <Button onClick={() => setShowCheckDialog(true)}>
            <Shield className="mr-2 h-4 w-4" />
            Kiểm tra mới
          </Button>
        </div>
      </div>

      {renderStatisticsCards()}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="checks">Danh sách kiểm tra</TabsTrigger>
          <TabsTrigger value="sources">Nguồn phát hiện</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {renderPlagiarismDistribution()}
            {renderTrendsChart()}
            {renderTopSources()}
          </div>
        </TabsContent>

        <TabsContent value="checks" className="space-y-4">
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
                    setFilters(prev => ({ ...prev, content_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Loại nội dung" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    <SelectItem value="course">Khóa học</SelectItem>
                    <SelectItem value="lesson">Bài học</SelectItem>
                    <SelectItem value="assignment">Bài tập</SelectItem>
                    <SelectItem value="forum_post">Bài đăng</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.status}
                  onValueChange={value =>
                    setFilters(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                    <SelectItem value="scanning">Đang quét</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="failed">Thất bại</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.plagiarism_level}
                  onValueChange={value =>
                    setFilters(prev => ({ ...prev, plagiarism_level: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mức độ đạo văn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    <SelectItem value="none">Sạch</SelectItem>
                    <SelectItem value="low">Thấp</SelectItem>
                    <SelectItem value="moderate">Trung bình</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                    <SelectItem value="severe">Nghiêm trọng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {renderChecksList()}
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          {statistics?.top_sources && (
            <Card>
              <CardHeader>
                <CardTitle>Top nguồn phát hiện</CardTitle>
                <CardDescription>
                  Các nguồn thường xuyên bị phát hiện đạo văn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statistics.top_sources.map((source, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex-1">
                        <div className="mb-1 font-medium">{source.source}</div>
                        <div className="text-sm text-muted-foreground">
                          Phát hiện {source.matches} lần với độ tương đồng trung
                          bình {source.average_similarity.toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {source.matches}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          lần phát hiện
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog kiểm tra mới */}
      <Dialog open={showCheckDialog} onOpenChange={setShowCheckDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo kiểm tra đạo văn mới</DialogTitle>
            <DialogDescription>
              Kiểm tra nội dung có khả năng đạo văn bằng AI
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Loại nội dung</Label>
              <Select
                value={checkConfig.content_type}
                onValueChange={(value: any) =>
                  setCheckConfig(prev => ({ ...prev, content_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="course">Khóa học</SelectItem>
                  <SelectItem value="lesson">Bài học</SelectItem>
                  <SelectItem value="assignment">Bài tập</SelectItem>
                  <SelectItem value="forum_post">Bài đăng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>ID nội dung</Label>
              <Input
                value={checkConfig.content_id}
                onChange={e =>
                  setCheckConfig(prev => ({
                    ...prev,
                    content_id: e.target.value,
                  }))
                }
                placeholder="Nhập ID của nội dung cần kiểm tra"
              />
            </div>

            <div>
              <Label>Nội dung (tùy chọn)</Label>
              <Textarea
                value={checkConfig.content}
                onChange={e =>
                  setCheckConfig(prev => ({ ...prev, content: e.target.value }))
                }
                placeholder="Nhập nội dung cần kiểm tra hoặc để trống để lấy từ ID"
                rows={4}
              />
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <h4 className="font-medium">Cấu hình kiểm tra</h4>

              <div>
                <Label>Độ nhạy</Label>
                <Select
                  value={checkConfig.configuration.sensitivity}
                  onValueChange={(value: any) =>
                    setCheckConfig(prev => ({
                      ...prev,
                      configuration: {
                        ...prev.configuration,
                        sensitivity: value,
                      },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Thấp</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Loại trừ trích dẫn</Label>
                <Switch
                  checked={checkConfig.configuration.excludeQuotes}
                  onCheckedChange={checked =>
                    setCheckConfig(prev => ({
                      ...prev,
                      configuration: {
                        ...prev.configuration,
                        excludeQuotes: checked,
                      },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Loại trừ tham khảo</Label>
                <Switch
                  checked={checkConfig.configuration.excludeReferences}
                  onCheckedChange={checked =>
                    setCheckConfig(prev => ({
                      ...prev,
                      configuration: {
                        ...prev.configuration,
                        excludeReferences: checked,
                      },
                    }))
                  }
                />
              </div>

              <div>
                <Label>Độ dài khớp tối thiểu (ký tự)</Label>
                <Input
                  type="number"
                  value={checkConfig.configuration.minimumMatchLength}
                  onChange={e =>
                    setCheckConfig(prev => ({
                      ...prev,
                      configuration: {
                        ...prev.configuration,
                        minimumMatchLength: parseInt(e.target.value) || 20,
                      },
                    }))
                  }
                  min={10}
                  max={100}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCheckDialog(false)}
              >
                Hủy
              </Button>
              <Button
                onClick={handleCheckPlagiarism}
                disabled={!checkConfig.content_id || checkingPlagiarism}
              >
                {checkingPlagiarism && (
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                )}
                Bắt đầu kiểm tra
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {renderCheckDetail()}
    </div>
  );
};
