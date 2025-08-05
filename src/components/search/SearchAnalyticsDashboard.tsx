'use client';

import React, { useState } from 'react';
import {
  Search,
  TrendingUp,
  BarChart3,
  MousePointer,
  AlertTriangle,
  Clock,
  Target,
  Zap,
  Calendar,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import {
  useGetSearchAnalyticsQuery,
  useGetSearchOptimizationQuery,
  useGetTrendingSearchesQuery,
} from '@/lib/redux/api/search-api';
import { cn, formatNumber, formatPercentage } from '@/lib/utils';

interface SearchAnalyticsDashboardProps {
  className?: string;
  timeRange?: '24h' | '7d' | '30d' | '90d';
  onTimeRangeChange?: (range: '24h' | '7d' | '30d' | '90d') => void;
}

export function SearchAnalyticsDashboard({
  className,
  timeRange = '7d',
  onTimeRangeChange,
}: SearchAnalyticsDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>('searches');

  // API queries
  const { data: analytics, isLoading: analyticsLoading } =
    useGetSearchAnalyticsQuery({
      timeRange,
      granularity: timeRange === '24h' ? 'hour' : 'day',
    });

  const { data: optimization } = useGetSearchOptimizationQuery({
    timeRange,
    minVolume: 10,
  });

  const { data: trendingSearches } = useGetTrendingSearchesQuery({
    timeframe: timeRange,
    limit: 10,
  });

  // Chart colors
  const chartColors = {
    primary: '#3b82f6',
    secondary: '#10b981',
    tertiary: '#f59e0b',
    quaternary: '#ef4444',
  };

  const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Metrics cards data
  const metricsCards = [
    {
      title: 'Tổng tìm kiếm',
      value: analytics?.overview.totalSearches || 0,
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Search,
    },
    {
      title: 'Truy vấn duy nhất',
      value: analytics?.overview.uniqueQueries || 0,
      change: '+8.3%',
      changeType: 'positive' as const,
      icon: Target,
    },
    {
      title: 'Tỷ lệ click',
      value: `${formatPercentage(analytics?.overview.averageCTR || 0)}%`,
      change: '-2.1%',
      changeType: 'negative' as const,
      icon: MousePointer,
    },
    {
      title: 'Không có kết quả',
      value: `${formatPercentage(analytics?.overview.zeroResultsRate || 0)}%`,
      change: '-5.7%',
      changeType: 'positive' as const,
      icon: AlertTriangle,
    },
  ];

  // Prepare chart data
  const chartData =
    analytics?.trends.map(trend => ({
      date: new Date(trend.date).toLocaleDateString(),
      searches: trend.searches,
      clicks: trend.clicks,
      conversions: trend.conversions,
      ctr: (trend.clicks / trend.searches) * 100,
    })) || [];

  // Top queries data for pie chart
  const topQueriesData =
    analytics?.topQueries.slice(0, 5).map((query, index) => ({
      name: query.query,
      value: query.count,
      color: pieColors[index],
    })) || [];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Search Analytics
          </h1>
          <p className="text-muted-foreground">
            Phân tích hiệu suất tìm kiếm và tối ưu hóa trải nghiệm người dùng
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={timeRange}
            onValueChange={(value: '24h' | '7d' | '30d' | '90d') =>
              onTimeRangeChange?.(value)
            }
          >
            <SelectTrigger className="w-32">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 giờ</SelectItem>
              <SelectItem value="7d">7 ngày</SelectItem>
              <SelectItem value="30d">30 ngày</SelectItem>
              <SelectItem value="90d">90 ngày</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">Xuất báo cáo</Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricsCards.map((card, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold">
                    {typeof card.value === 'number'
                      ? formatNumber(card.value)
                      : card.value}
                  </p>
                </div>
                <div className="rounded-full bg-blue-100 p-3">
                  <card.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                {card.changeType === 'positive' ? (
                  <ArrowUp className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={cn(
                    'text-sm font-medium',
                    card.changeType === 'positive'
                      ? 'text-green-600'
                      : 'text-red-600'
                  )}
                >
                  {card.change}
                </span>
                <span className="text-sm text-muted-foreground">
                  so với kỳ trước
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="queries">Truy vấn</TabsTrigger>
          <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
          <TabsTrigger value="optimization">Tối ưu hóa</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Search Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Xu hướng tìm kiếm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Select
                    value={selectedMetric}
                    onValueChange={setSelectedMetric}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="searches">Lượt tìm kiếm</SelectItem>
                      <SelectItem value="clicks">Lượt click</SelectItem>
                      <SelectItem value="conversions">Chuyển đổi</SelectItem>
                      <SelectItem value="ctr">Tỷ lệ CTR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke={chartColors.primary}
                      strokeWidth={2}
                      dot={{ fill: chartColors.primary }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Queries Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Phân bố truy vấn hàng đầu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={topQueriesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {topQueriesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [
                        formatNumber(value),
                        'Lượt tìm',
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="mt-4 space-y-2">
                  {topQueriesData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trending Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Tìm kiếm thịnh hành
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {trendingSearches?.slice(0, 9).map((search, index) => (
                  <div
                    key={search.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{search.text}</p>
                        {search.count && (
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(search.count)} lượt
                          </p>
                        )}
                      </div>
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Queries Tab */}
        <TabsContent value="queries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết truy vấn</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Truy vấn</TableHead>
                    <TableHead className="text-right">Lượt tìm</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead className="text-right">Chuyển đổi</TableHead>
                    <TableHead className="text-right">
                      Tỷ lệ chuyển đổi
                    </TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics?.topQueries.map((query, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {query.query}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(query.count)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPercentage(query.ctr)}%
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(query.conversionRate * query.count)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            query.conversionRate > 0.05
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {formatPercentage(query.conversionRate)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                            <DropdownMenuItem>Tạo boost rule</DropdownMenuItem>
                            <DropdownMenuItem>Phân tích sâu</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Response Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Thời gian phản hồi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Trung bình
                    </span>
                    <span className="font-semibold">245ms</span>
                  </div>
                  <Progress value={75} className="h-2" />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">P95</p>
                      <p className="font-semibold">450ms</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">P99</p>
                      <p className="font-semibold">820ms</p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={200} className="mt-4">
                  <BarChart data={chartData.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="searches" fill={chartColors.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Search Success Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Tỷ lệ thành công
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {formatPercentage(
                        100 - (analytics?.overview.zeroResultsRate || 0)
                      )}
                      %
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tìm kiếm có kết quả
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Có kết quả</span>
                      <span className="font-semibold text-green-600">
                        {formatPercentage(
                          100 - (analytics?.overview.zeroResultsRate || 0)
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={100 - (analytics?.overview.zeroResultsRate || 0)}
                      className="h-2"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Không có kết quả</span>
                      <span className="font-semibold text-red-600">
                        {formatPercentage(
                          analytics?.overview.zeroResultsRate || 0
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={analytics?.overview.zeroResultsRate || 0}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết hiệu suất</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Tốc độ index
                  </p>
                  <p className="text-2xl font-bold">98.5%</p>
                  <p className="text-sm text-green-600">
                    +2.3% so với tháng trước
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Cache hit rate
                  </p>
                  <p className="text-2xl font-bold">87.2%</p>
                  <p className="text-sm text-green-600">
                    +5.1% so với tháng trước
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Search accuracy
                  </p>
                  <p className="text-2xl font-bold">94.8%</p>
                  <p className="text-sm text-red-600">
                    -1.2% so với tháng trước
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Gợi ý tối ưu hóa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimization?.slice(0, 5).map((item, index) => (
                  <div key={index} className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{item.query}</h4>
                        <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            Volume: {formatNumber(item.metrics.searchVolume)}
                          </span>
                          <span>
                            CTR:{' '}
                            {formatPercentage(item.metrics.clickThroughRate)}%
                          </span>
                          <span>
                            Conversion:{' '}
                            {formatPercentage(item.metrics.conversionRate)}%
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant={
                          item.metrics.clickThroughRate <
                          item.metrics.conversionRate
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        {item.metrics.clickThroughRate < 0.1
                          ? 'Cần cải thiện'
                          : 'Ổn định'}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Gợi ý cải thiện:</p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {item.suggestions.queryImprovements
                          .slice(0, 2)
                          .map((suggestion, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-blue-600">•</span>
                              {suggestion}
                            </li>
                          ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Khoảng trống nội dung:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.suggestions.contentGaps
                          .slice(0, 3)
                          .map((gap, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs"
                            >
                              {gap}
                            </Badge>
                          ))}
                      </div>
                    </div>

                    <div className="border-t pt-2">
                      <ResponsiveContainer width="100%" height={60}>
                        <LineChart data={item.trends.slice(-7)}>
                          <Line
                            type="monotone"
                            dataKey="volume"
                            stroke={chartColors.primary}
                            strokeWidth={2}
                            dot={false}
                          />
                          <Tooltip />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Hành động nhanh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Button variant="outline" className="h-auto justify-start p-4">
                  <div className="text-left">
                    <div className="font-semibold">Rebuild Search Index</div>
                    <div className="text-sm text-muted-foreground">
                      Cập nhật index để cải thiện độ chính xác
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto justify-start p-4">
                  <div className="text-left">
                    <div className="font-semibold">Optimize Cache</div>
                    <div className="text-sm text-muted-foreground">
                      Tối ưu cache để tăng tốc độ tìm kiếm
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto justify-start p-4">
                  <div className="text-left">
                    <div className="font-semibold">Update Synonyms</div>
                    <div className="text-sm text-muted-foreground">
                      Cập nhật từ đồng nghĩa và từ liên quan
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto justify-start p-4">
                  <div className="text-left">
                    <div className="font-semibold">Configure Boost Rules</div>
                    <div className="text-sm text-muted-foreground">
                      Thiết lập quy tắc boost cho nội dung
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto justify-start p-4">
                  <div className="text-left">
                    <div className="font-semibold">A/B Test Search</div>
                    <div className="text-sm text-muted-foreground">
                      Chạy A/B test cho thuật toán tìm kiếm
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto justify-start p-4">
                  <div className="text-left">
                    <div className="font-semibold">Export Analytics</div>
                    <div className="text-sm text-muted-foreground">
                      Xuất báo cáo chi tiết cho team
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
