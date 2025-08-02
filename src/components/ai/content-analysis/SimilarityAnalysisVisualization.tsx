'use client';

import React, { useState, useMemo } from 'react';
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
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  GitCompare,
  TrendingUp,
  Network,
  BarChart3,
  Target,
  Layers,
  RefreshCw,
  Plus,
  Eye,
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  useGetSimilarityAnalysesQuery,
  useAnalyzeSimilarityMutation,
  useBulkAnalyzeSimilarityMutation,
  useGetSimilarContentQuery,
} from '@/lib/redux/api/content-analysis-api';
import { SimilarityAnalysis } from '@/lib/types/content-analysis';

const SIMILARITY_COLORS = {
  semantic: '#3b82f6',
  structural: '#10b981',
  topical: '#f59e0b',
  stylistic: '#ef4444',
};

const SIMILARITY_TYPE_COLORS = {
  semantic: '#3b82f6',
  structural: '#10b981',
  topic: '#f59e0b',
  difficulty: '#8b5cf6',
  comprehensive: '#ef4444',
};

interface SimilarityAnalysisVisualizationProps {
  selectedContentType?: 'course' | 'lesson';
  selectedContentId?: string;
}

export const SimilarityAnalysisVisualization: React.FC<
  SimilarityAnalysisVisualizationProps
> = ({ selectedContentType, selectedContentId }) => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    content_type: selectedContentType || '',
    similarity_type: '',
    min_score: 0,
    search: '',
  });

  const [selectedAnalysis, setSelectedAnalysis] =
    useState<SimilarityAnalysis | null>(null);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [analysisConfig, setAnalysisConfig] = useState({
    source_content_type: 'lesson' as 'course' | 'lesson',
    source_content_id: '',
    target_content_type: 'lesson' as 'course' | 'lesson',
    target_content_id: '',
    similarity_type: 'comprehensive' as
      | 'semantic'
      | 'structural'
      | 'topic'
      | 'difficulty'
      | 'comprehensive',
  });

  const [similarityThreshold, setSimilarityThreshold] = useState([70]);
  const [visualizationType, setVisualizationType] = useState<
    'scatter' | 'radar' | 'heatmap' | 'network'
  >('scatter');

  // API Queries
  const {
    data: analyses,
    isLoading: loadingAnalyses,
    refetch: refetchAnalyses,
  } = useGetSimilarityAnalysesQuery(filters);

  const { data: similarContent } = useGetSimilarContentQuery(
    selectedContentType && selectedContentId
      ? {
          content_type: selectedContentType,
          content_id: selectedContentId,
          limit: 10,
          min_score: 0.5,
        }
      : { content_type: 'lesson', content_id: 'default' },
    { skip: !selectedContentType || !selectedContentId }
  );

  // Mutations
  const [analyzeSimilarity, { isLoading: analyzingContent }] =
    useAnalyzeSimilarityMutation();
  const [bulkAnalyzeSimilarity, { isLoading: bulkAnalyzing }] =
    useBulkAnalyzeSimilarityMutation();

  const handleAnalyzeSimilarity = async () => {
    try {
      await analyzeSimilarity(analysisConfig).unwrap();
      setShowAnalysisDialog(false);
      refetchAnalyses();
    } catch (error) {
      console.error('Failed to analyze similarity:', error);
    }
  };

  const getSimilarityBadge = (score: number) => {
    if (score >= 0.9)
      return <Badge className="bg-red-500">Rất cao (≥90%)</Badge>;
    if (score >= 0.7)
      return <Badge className="bg-orange-500">Cao (70-89%)</Badge>;
    if (score >= 0.5)
      return <Badge className="bg-yellow-500">Trung bình (50-69%)</Badge>;
    if (score >= 0.3)
      return <Badge className="bg-blue-500">Thấp (30-49%)</Badge>;
    return <Badge variant="outline">Rất thấp (&lt; 30%)</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      calculated: 'default',
      processing: 'secondary',
      failed: 'destructive',
      outdated: 'outline',
    } as const;

    const labels = {
      calculated: 'Đã tính',
      processing: 'Đang xử lý',
      failed: 'Thất bại',
      outdated: 'Hết hạn',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  // Chuẩn bị dữ liệu cho visualization
  const scatterData = useMemo(() => {
    if (!analyses?.data) return [];

    return analyses.data
      .filter(analysis => analysis.status === 'calculated')
      .map(analysis => ({
        x: analysis.analysis.dimensions.semantic * 100,
        y: analysis.analysis.dimensions.structural * 100,
        z: analysis.similarity_score * 100,
        type: analysis.similarity_type,
        id: analysis.id,
        source: analysis.source_content_id,
        target: analysis.target_content_id,
      }));
  }, [analyses]);

  const radarData = useMemo(() => {
    if (!selectedAnalysis?.analysis.dimensions) return [];

    return Object.entries(selectedAnalysis.analysis.dimensions).map(
      ([dimension, score]) => ({
        dimension:
          dimension === 'semantic'
            ? 'Ngữ nghĩa'
            : dimension === 'structural'
              ? 'Cấu trúc'
              : dimension === 'topical'
                ? 'Chủ đề'
                : 'Phong cách',
        score: score * 100,
        fullMark: 100,
      })
    );
  }, [selectedAnalysis]);

  const heatmapData = useMemo(() => {
    if (!analyses?.data) return [];

    const contentMap = new Map();

    analyses.data.forEach(analysis => {
      if (analysis.status === 'calculated') {
        const key = `${analysis.source_content_id}-${analysis.target_content_id}`;
        contentMap.set(key, {
          source: analysis.source_content_id,
          target: analysis.target_content_id,
          similarity: analysis.similarity_score * 100,
          type: analysis.similarity_type,
        });
      }
    });

    return Array.from(contentMap.values());
  }, [analyses]);

  const renderScatterPlot = () => (
    <Card>
      <CardHeader>
        <CardTitle>Phân tích tương quan 2D</CardTitle>
        <CardDescription>
          Trục X: Tương đồng ngữ nghĩa • Trục Y: Tương đồng cấu trúc • Kích
          thước: Điểm tổng
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              type="number"
              domain={[0, 100]}
              label={{
                value: 'Tương đồng ngữ nghĩa (%)',
                position: 'insideBottom',
                offset: -5,
              }}
            />
            <YAxis
              dataKey="y"
              type="number"
              domain={[0, 100]}
              label={{
                value: 'Tương đồng cấu trúc (%)',
                angle: -90,
                position: 'insideLeft',
              }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)}%`,
                name === 'x' ? 'Ngữ nghĩa' : name === 'y' ? 'Cấu trúc' : 'Tổng',
              ]}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  const data = payload[0].payload;
                  return `${data.source} → ${data.target}`;
                }
                return '';
              }}
            />
            {Object.entries(SIMILARITY_TYPE_COLORS).map(([type, color]) => (
              <Scatter
                key={type}
                name={type}
                data={scatterData.filter(d => d.type === type)}
                fill={color}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderRadarChart = () => {
    if (!selectedAnalysis) {
      return (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Chọn một phân tích để xem biểu đồ radar
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Phân tích đa chiều</CardTitle>
          <CardDescription>
            Điểm số theo các chiều khác nhau của tương đồng nội dung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="dimension" />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
              />
              <Radar
                name="Điểm tương đồng"
                dataKey="score"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Điểm']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderHeatmap = () => {
    const uniqueContents = Array.from(
      new Set([
        ...heatmapData.map(d => d.source),
        ...heatmapData.map(d => d.target),
      ])
    ).slice(0, 10); // Giới hạn để tránh quá tải

    const heatmapMatrix = uniqueContents
      .map(source =>
        uniqueContents.map(target => {
          const match = heatmapData.find(
            d => d.source === source && d.target === target
          );
          return {
            x: target,
            y: source,
            value: match?.similarity || 0,
          };
        })
      )
      .flat();

    return (
      <Card>
        <CardHeader>
          <CardTitle>Ma trận tương đồng</CardTitle>
          <CardDescription>
            Độ tương đồng giữa các nội dung (màu đậm = tương đồng cao)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-1 text-xs">
            {heatmapMatrix.map((cell, index) => (
              <div
                key={index}
                className="flex aspect-square items-center justify-center rounded border"
                style={{
                  backgroundColor: `rgba(59, 130, 246, ${cell.value / 100})`,
                  color: cell.value > 50 ? 'white' : 'black',
                }}
                title={`${cell.y} → ${cell.x}: ${cell.value.toFixed(1)}%`}
              >
                {cell.value > 0 ? cell.value.toFixed(0) : ''}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>Độ tương đồng</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderNetworkView = () => {
    const networkData = useMemo(() => {
      if (!analyses?.data) return { nodes: [], links: [] };

      const nodes = new Map();
      const links: any[] = [];

      analyses.data
        .filter(
          analysis =>
            analysis.status === 'calculated' &&
            analysis.similarity_score >= similarityThreshold[0] / 100
        )
        .forEach(analysis => {
          // Thêm nodes
          if (!nodes.has(analysis.source_content_id)) {
            nodes.set(analysis.source_content_id, {
              id: analysis.source_content_id,
              type: analysis.source_content_type,
              connections: 0,
            });
          }
          if (!nodes.has(analysis.target_content_id)) {
            nodes.set(analysis.target_content_id, {
              id: analysis.target_content_id,
              type: analysis.target_content_type,
              connections: 0,
            });
          }

          // Thêm links
          links.push({
            source: analysis.source_content_id,
            target: analysis.target_content_id,
            value: analysis.similarity_score * 100,
            type: analysis.similarity_type,
          });

          // Tăng số kết nối
          nodes.get(analysis.source_content_id).connections++;
          nodes.get(analysis.target_content_id).connections++;
        });

      return {
        nodes: Array.from(nodes.values()).slice(0, 20),
        links: links.slice(0, 50),
      };
    }, [analyses, similarityThreshold]);

    return (
      <Card>
        <CardHeader>
          <CardTitle>Mạng lưới tương đồng</CardTitle>
          <CardDescription>
            Mối quan hệ tương đồng giữa các nội dung (ngưỡng:{' '}
            {similarityThreshold[0]}%)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Ngưỡng tương đồng: {similarityThreshold[0]}%</Label>
            <Slider
              value={similarityThreshold}
              onValueChange={setSimilarityThreshold}
              max={100}
              min={0}
              step={5}
              className="mt-2"
            />
          </div>

          <div className="rounded-lg border-2 border-dashed border-muted py-8 text-center">
            <Network className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              Hiển thị {networkData.nodes.length} nội dung với{' '}
              {networkData.links.length} kết nối
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Biểu đồ mạng lưới sẽ được render với D3.js hoặc thư viện chuyên
              dụng
            </p>
          </div>

          {/* Danh sách kết nối mạnh nhất */}
          <div className="space-y-2">
            <h4 className="font-medium">Kết nối mạnh nhất:</h4>
            {networkData.links
              .sort((a, b) => b.value - a.value)
              .slice(0, 5)
              .map((link, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    {link.source} ↔ {link.target}
                  </span>
                  <Badge variant="outline">{link.value.toFixed(1)}%</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAnalysesList = () => {
    if (loadingAnalyses) {
      return <LoadingSpinner />;
    }

    if (!analyses?.data.length) {
      return (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Chưa có phân tích nào</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {analyses.data.map(analysis => (
          <Card
            key={analysis.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <Badge variant="outline">
                      {analysis.similarity_type === 'semantic'
                        ? 'Ngữ nghĩa'
                        : analysis.similarity_type === 'structural'
                          ? 'Cấu trúc'
                          : analysis.similarity_type === 'topic'
                            ? 'Chủ đề'
                            : analysis.similarity_type === 'difficulty'
                              ? 'Độ khó'
                              : 'Tổng hợp'}
                    </Badge>
                    {getStatusBadge(analysis.status)}
                    <span className="text-sm text-muted-foreground">
                      {new Date(analysis.calculated_at).toLocaleDateString(
                        'vi-VN'
                      )}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-medium">
                        {analysis.source_content_id} →{' '}
                        {analysis.target_content_id}
                      </span>
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-sm">
                        Điểm tương đồng:{' '}
                        {(analysis.similarity_score * 100).toFixed(1)}%
                      </span>
                      {getSimilarityBadge(analysis.similarity_score)}
                    </div>
                    <Progress
                      value={analysis.similarity_score * 100}
                      className="h-2"
                    />
                  </div>

                  {analysis.status === 'calculated' &&
                    analysis.analysis.dimensions && (
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        {Object.entries(analysis.analysis.dimensions).map(
                          ([dimension, score]) => (
                            <div key={dimension} className="text-center">
                              <div className="text-xs text-muted-foreground">
                                {dimension === 'semantic'
                                  ? 'Ngữ nghĩa'
                                  : dimension === 'structural'
                                    ? 'Cấu trúc'
                                    : dimension === 'topical'
                                      ? 'Chủ đề'
                                      : 'Phong cách'}
                              </div>
                              <div className="font-medium">
                                {(score * 100).toFixed(0)}%
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAnalysis(analysis)}
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

  const renderAnalysisDetail = () => {
    if (!selectedAnalysis) return null;

    return (
      <Dialog
        open={!!selectedAnalysis}
        onOpenChange={() => setSelectedAnalysis(null)}
      >
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết phân tích tương đồng</DialogTitle>
            <DialogDescription>
              {selectedAnalysis.source_content_id} →{' '}
              {selectedAnalysis.target_content_id} •
              {new Date(selectedAnalysis.calculated_at).toLocaleDateString(
                'vi-VN'
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Điểm tổng quan */}
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold">
                {(selectedAnalysis.similarity_score * 100).toFixed(1)}%
              </div>
              {getSimilarityBadge(selectedAnalysis.similarity_score)}
            </div>

            {/* Biểu đồ radar */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Phân tích đa chiều</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="dimension" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar
                        dataKey="score"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.3}
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          `${value.toFixed(1)}%`,
                          'Điểm',
                        ]}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Điểm chi tiết</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(selectedAnalysis.analysis.dimensions).map(
                      ([dimension, score]) => (
                        <div key={dimension}>
                          <div className="mb-1 flex justify-between">
                            <span>
                              {dimension === 'semantic'
                                ? 'Tương đồng ngữ nghĩa'
                                : dimension === 'structural'
                                  ? 'Tương đồng cấu trúc'
                                  : dimension === 'topical'
                                    ? 'Tương đồng chủ đề'
                                    : 'Tương đồng phong cách'}
                            </span>
                            <span className="font-medium">
                              {(score * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={score * 100} className="h-2" />
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Phân tích chi tiết */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Điểm chung</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedAnalysis.analysis.commonElements.map(
                      (element, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                          <span className="text-sm">{element}</span>
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-600">
                    Điểm khác biệt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedAnalysis.analysis.differences.map(
                      (difference, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <GitCompare className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                          <span className="text-sm">{difference}</span>
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Khuyến nghị */}
            <Card>
              <CardHeader>
                <CardTitle>Khuyến nghị</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {selectedAnalysis.analysis.recommendations.map(
                    (recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                        <span className="text-sm">{recommendation}</span>
                      </li>
                    )
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Thông tin kỹ thuật */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin phân tích</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Thuật toán:</span>
                    <span className="ml-2">
                      {selectedAnalysis.algorithm_version}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Loại phân tích:
                    </span>
                    <span className="ml-2">
                      {selectedAnalysis.similarity_type}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trạng thái:</span>
                    <span className="ml-2">{selectedAnalysis.status}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ngày tính:</span>
                    <span className="ml-2">
                      {new Date(selectedAnalysis.calculated_at).toLocaleString(
                        'vi-VN'
                      )}
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
          <h1 className="text-3xl font-bold">Phân tích độ tương đồng</h1>
          <p className="text-muted-foreground">
            Trực quan hóa và phân tích độ tương đồng giữa các nội dung
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetchAnalyses()}
            disabled={loadingAnalyses}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Tải lại
          </Button>
          <Button onClick={() => setShowAnalysisDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Phân tích mới
          </Button>
        </div>
      </div>

      <Tabs defaultValue="visualization" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visualization">Trực quan hóa</TabsTrigger>
          <TabsTrigger value="analyses">Danh sách phân tích</TabsTrigger>
          <TabsTrigger value="similar">Nội dung tương tự</TabsTrigger>
        </TabsList>

        <TabsContent value="visualization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chọn kiểu hiển thị</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant={
                    visualizationType === 'scatter' ? 'default' : 'outline'
                  }
                  onClick={() => setVisualizationType('scatter')}
                  size="sm"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Scatter Plot
                </Button>
                <Button
                  variant={
                    visualizationType === 'radar' ? 'default' : 'outline'
                  }
                  onClick={() => setVisualizationType('radar')}
                  size="sm"
                >
                  <Target className="mr-2 h-4 w-4" />
                  Radar Chart
                </Button>
                <Button
                  variant={
                    visualizationType === 'heatmap' ? 'default' : 'outline'
                  }
                  onClick={() => setVisualizationType('heatmap')}
                  size="sm"
                >
                  <Layers className="mr-2 h-4 w-4" />
                  Heatmap
                </Button>
                <Button
                  variant={
                    visualizationType === 'network' ? 'default' : 'outline'
                  }
                  onClick={() => setVisualizationType('network')}
                  size="sm"
                >
                  <Network className="mr-2 h-4 w-4" />
                  Network
                </Button>
              </div>
            </CardContent>
          </Card>

          {visualizationType === 'scatter' && renderScatterPlot()}
          {visualizationType === 'radar' && renderRadarChart()}
          {visualizationType === 'heatmap' && renderHeatmap()}
          {visualizationType === 'network' && renderNetworkView()}
        </TabsContent>

        <TabsContent value="analyses" className="space-y-4">
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
                  </SelectContent>
                </Select>
                <Select
                  value={filters.similarity_type}
                  onValueChange={value =>
                    setFilters(prev => ({ ...prev, similarity_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Loại tương đồng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    <SelectItem value="semantic">Ngữ nghĩa</SelectItem>
                    <SelectItem value="structural">Cấu trúc</SelectItem>
                    <SelectItem value="topic">Chủ đề</SelectItem>
                    <SelectItem value="difficulty">Độ khó</SelectItem>
                    <SelectItem value="comprehensive">Tổng hợp</SelectItem>
                  </SelectContent>
                </Select>
                <div>
                  <Label className="text-sm">
                    Điểm tối thiểu: {filters.min_score}%
                  </Label>
                  <Slider
                    value={[filters.min_score]}
                    onValueChange={([value]) =>
                      setFilters(prev => ({ ...prev, min_score: value }))
                    }
                    max={100}
                    min={0}
                    step={5}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {renderAnalysesList()}
        </TabsContent>

        <TabsContent value="similar" className="space-y-4">
          {selectedContentType && selectedContentId && similarContent ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {similarContent.map(analysis => (
                <Card key={analysis.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {analysis.target_content_id}
                    </CardTitle>
                    <CardDescription>
                      {analysis.similarity_type === 'semantic'
                        ? 'Tương đồng ngữ nghĩa'
                        : analysis.similarity_type === 'structural'
                          ? 'Tương đồng cấu trúc'
                          : analysis.similarity_type === 'topic'
                            ? 'Tương đồng chủ đề'
                            : analysis.similarity_type === 'difficulty'
                              ? 'Tương đồng độ khó'
                              : 'Tương đồng tổng hợp'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm">Điểm tương đồng</span>
                          <span className="font-medium">
                            {(analysis.similarity_score * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={analysis.similarity_score * 100}
                          className="h-2"
                        />
                      </div>

                      {analysis.analysis.dimensions && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(analysis.analysis.dimensions).map(
                            ([dimension, score]) => (
                              <div key={dimension} className="text-center">
                                <div className="text-muted-foreground">
                                  {dimension === 'semantic'
                                    ? 'Ngữ nghĩa'
                                    : dimension === 'structural'
                                      ? 'Cấu trúc'
                                      : dimension === 'topical'
                                        ? 'Chủ đề'
                                        : 'Phong cách'}
                                </div>
                                <div className="font-medium">
                                  {(score * 100).toFixed(0)}%
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setSelectedAnalysis(analysis)}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  Chọn một nội dung cụ thể để xem các nội dung tương tự
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog phân tích mới */}
      <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo phân tích tương đồng mới</DialogTitle>
            <DialogDescription>
              So sánh độ tương đồng giữa hai nội dung
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nội dung nguồn</Label>
                <Select
                  value={analysisConfig.source_content_type}
                  onValueChange={(value: 'course' | 'lesson') =>
                    setAnalysisConfig(prev => ({
                      ...prev,
                      source_content_type: value,
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
                <Input
                  className="mt-2"
                  value={analysisConfig.source_content_id}
                  onChange={e =>
                    setAnalysisConfig(prev => ({
                      ...prev,
                      source_content_id: e.target.value,
                    }))
                  }
                  placeholder="ID nội dung nguồn"
                />
              </div>

              <div>
                <Label>Nội dung đích</Label>
                <Select
                  value={analysisConfig.target_content_type}
                  onValueChange={(value: 'course' | 'lesson') =>
                    setAnalysisConfig(prev => ({
                      ...prev,
                      target_content_type: value,
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
                <Input
                  className="mt-2"
                  value={analysisConfig.target_content_id}
                  onChange={e =>
                    setAnalysisConfig(prev => ({
                      ...prev,
                      target_content_id: e.target.value,
                    }))
                  }
                  placeholder="ID nội dung đích"
                />
              </div>
            </div>

            <div>
              <Label>Loại phân tích</Label>
              <Select
                value={analysisConfig.similarity_type}
                onValueChange={(value: any) =>
                  setAnalysisConfig(prev => ({
                    ...prev,
                    similarity_type: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semantic">Tương đồng ngữ nghĩa</SelectItem>
                  <SelectItem value="structural">
                    Tương đồng cấu trúc
                  </SelectItem>
                  <SelectItem value="topic">Tương đồng chủ đề</SelectItem>
                  <SelectItem value="difficulty">Tương đồng độ khó</SelectItem>
                  <SelectItem value="comprehensive">
                    Phân tích tổng hợp
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAnalysisDialog(false)}
              >
                Hủy
              </Button>
              <Button
                onClick={handleAnalyzeSimilarity}
                disabled={
                  !analysisConfig.source_content_id ||
                  !analysisConfig.target_content_id ||
                  analyzingContent
                }
              >
                {analyzingContent && (
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                )}
                Bắt đầu phân tích
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {renderAnalysisDetail()}
    </div>
  );
};
