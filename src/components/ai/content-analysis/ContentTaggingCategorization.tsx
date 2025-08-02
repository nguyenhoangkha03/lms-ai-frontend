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
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Tags,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  RefreshCw,
  Plus,
  Target,
  BookOpen,
  GraduationCap,
  Globe,
  Hash,
  Lightbulb,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
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
  useGetContentTagsQuery,
  useCreateContentTagMutation,
  useUpdateContentTagMutation,
  useDeleteContentTagMutation,
  useVerifyContentTagMutation,
  useBulkVerifyContentTagsMutation,
  useGetTagsForContentQuery,
  useGenerateTagsMutation,
} from '@/lib/redux/api/content-analysis-api';
import { ContentTag } from '@/lib/types/content-analysis';

const CATEGORY_COLORS = {
  topic: '#3b82f6',
  difficulty: '#f59e0b',
  skill: '#10b981',
  subject: '#8b5cf6',
  learning_objective: '#ef4444',
  content_type: '#6b7280',
  language: '#ec4899',
};

const CATEGORY_ICONS = {
  topic: BookOpen,
  difficulty: Target,
  skill: GraduationCap,
  subject: Globe,
  learning_objective: Lightbulb,
  content_type: Hash,
  language: Globe,
};

const TYPE_COLORS = {
  auto_generated: '#6b7280',
  manual: '#3b82f6',
  ai_suggested: '#f59e0b',
  system: '#10b981',
};

interface ContentTaggingCategorizationProps {
  selectedContentType?: 'course' | 'lesson';
  selectedContentId?: string;
}

export const ContentTaggingCategorization: React.FC<
  ContentTaggingCategorizationProps
> = ({ selectedContentType, selectedContentId }) => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    content_type: selectedContentType || '',
    category: '',
    type: '',
    is_verified: undefined as boolean | undefined,
    search: '',
  });

  const [selectedTag, setSelectedTag] = useState<ContentTag | null>(null);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showBulkActionsDialog, setShowBulkActionsDialog] = useState(false);

  const [tagData, setTagData] = useState({
    content_type: 'lesson' as 'course' | 'lesson',
    content_id: '',
    tag: '',
    category: 'topic' as
      | 'topic'
      | 'difficulty'
      | 'skill'
      | 'subject'
      | 'learning_objective'
      | 'content_type'
      | 'language',
    type: 'manual' as 'auto_generated' | 'manual' | 'ai_suggested' | 'system',
    confidence: 1,
    description: '',
    is_active: true,
  });

  const [generateConfig, setGenerateConfig] = useState({
    content_type: 'lesson' as 'course' | 'lesson',
    content_id: '',
    categories: [] as string[],
    max_tags: 10,
    confidence_threshold: 0.7,
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // API Queries
  const {
    data: tags,
    isLoading: loadingTags,
    refetch: refetchTags,
  } = useGetContentTagsQuery(filters);

  const { data: contentTags } = useGetTagsForContentQuery(
    selectedContentType && selectedContentId
      ? { content_type: selectedContentType, content_id: selectedContentId }
      : { content_type: 'lesson', content_id: 'default' },
    { skip: !selectedContentType || !selectedContentId }
  );

  // Mutations
  const [createTag, { isLoading: creatingTag }] = useCreateContentTagMutation();
  const [updateTag, { isLoading: updatingTag }] = useUpdateContentTagMutation();
  const [deleteTag, { isLoading: deletingTag }] = useDeleteContentTagMutation();
  const [verifyTag, { isLoading: verifyingTag }] =
    useVerifyContentTagMutation();
  const [bulkVerifyTags, { isLoading: bulkVerifying }] =
    useBulkVerifyContentTagsMutation();
  const [generateTags, { isLoading: generatingTags }] =
    useGenerateTagsMutation();

  const handleCreateTag = async () => {
    try {
      await createTag(tagData as ContentTag).unwrap();
      setShowTagDialog(false);
      refetchTags();
      resetTagData();
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const handleUpdateTag = async () => {
    if (!selectedTag) return;

    try {
      await updateTag({
        id: selectedTag.id,
        data: tagData,
      }).unwrap();
      setShowTagDialog(false);
      setSelectedTag(null);
      refetchTags();
    } catch (error) {
      console.error('Failed to update tag:', error);
    }
  };

  const handleGenerateTags = async () => {
    try {
      const result = await generateTags(generateConfig).unwrap();
      setShowGenerateDialog(false);
      refetchTags();
    } catch (error) {
      console.error('Failed to generate tags:', error);
    }
  };

  const handleBulkVerify = async () => {
    try {
      await bulkVerifyTags({ tag_ids: selectedTags }).unwrap();
      setShowBulkActionsDialog(false);
      setSelectedTags([]);
      refetchTags();
    } catch (error) {
      console.error('Failed to bulk verify tags:', error);
    }
  };

  const resetTagData = () => {
    setTagData({
      content_type: 'lesson',
      content_id: '',
      tag: '',
      category: 'topic',
      type: 'manual',
      confidence: 1,
      description: '',
      is_active: true,
    });
  };

  const getCategoryBadge = (category: string) => {
    const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
    const color = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS];

    const labels = {
      topic: 'Chủ đề',
      difficulty: 'Độ khó',
      skill: 'Kỹ năng',
      subject: 'Môn học',
      learning_objective: 'Mục tiêu học',
      content_type: 'Loại nội dung',
      language: 'Ngôn ngữ',
    };

    return (
      <Badge variant="outline" style={{ borderColor: color, color }}>
        <Icon className="mr-1 h-3 w-3" />
        {labels[category as keyof typeof labels]}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const color = TYPE_COLORS[type as keyof typeof TYPE_COLORS];

    const labels = {
      auto_generated: 'Tự động',
      manual: 'Thủ công',
      ai_suggested: 'AI gợi ý',
      system: 'Hệ thống',
    };

    return (
      <Badge variant="outline" style={{ borderColor: color, color }}>
        {labels[type as keyof typeof labels]}
      </Badge>
    );
  };

  const renderTagStatistics = () => {
    if (!tags?.data) return null;

    const categoryStats = tags.data.reduce(
      (acc, tag) => {
        acc[tag.category] = (acc[tag.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const typeStats = tags.data.reduce(
      (acc, tag) => {
        acc[tag.type] = (acc[tag.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const verifiedCount = tags.data.filter(tag => tag.is_verified).length;
    const avgConfidence =
      tags.data.reduce((sum, tag) => sum + tag.confidence, 0) /
      tags.data.length;

    return (
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số tag</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tags.data.length}</div>
            <p className="text-xs text-muted-foreground">
              Trên tất cả nội dung
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã xác minh</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedCount}</div>
            <p className="text-xs text-muted-foreground">
              {((verifiedCount / tags.data.length) * 100).toFixed(1)}% tổng số
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Độ tin cậy TB</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(avgConfidence * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Trung bình toàn hệ thống
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI gợi ý</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeStats.ai_suggested || 0}
            </div>
            <p className="text-xs text-muted-foreground">Chờ xem xét</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCategoryDistribution = () => {
    if (!tags?.data) return null;

    const data = Object.entries(
      tags.data.reduce(
        (acc, tag) => {
          acc[tag.category] = (acc[tag.category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      )
    ).map(([category, count]) => ({
      name:
        category === 'topic'
          ? 'Chủ đề'
          : category === 'difficulty'
            ? 'Độ khó'
            : category === 'skill'
              ? 'Kỹ năng'
              : category === 'subject'
                ? 'Môn học'
                : category === 'learning_objective'
                  ? 'Mục tiêu học'
                  : category === 'content_type'
                    ? 'Loại nội dung'
                    : 'Ngôn ngữ',
      value: count,
      color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
    }));

    return (
      <Card>
        <CardHeader>
          <CardTitle>Phân bố theo danh mục</CardTitle>
          <CardDescription>Số lượng tag theo từng danh mục</CardDescription>
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

  const renderTypeDistribution = () => {
    if (!tags?.data) return null;

    const data = Object.entries(
      tags.data.reduce(
        (acc, tag) => {
          acc[tag.type] = (acc[tag.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      )
    ).map(([type, count]) => ({
      type:
        type === 'auto_generated'
          ? 'Tự động'
          : type === 'manual'
            ? 'Thủ công'
            : type === 'ai_suggested'
              ? 'AI gợi ý'
              : 'Hệ thống',
      count,
      color: TYPE_COLORS[type as keyof typeof TYPE_COLORS],
    }));

    return (
      <Card>
        <CardHeader>
          <CardTitle>Phân bố theo nguồn</CardTitle>
          <CardDescription>Số lượng tag theo cách tạo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderTagsList = () => {
    if (loadingTags) {
      return <LoadingSpinner />;
    }

    if (!tags?.data.length) {
      return (
        <div className="py-8 text-center">
          <Tags className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Chưa có tag nào</p>
          <Button className="mt-4" onClick={() => setShowTagDialog(true)}>
            Tạo tag đầu tiên
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {selectedTags.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  Đã chọn {selectedTags.length} tag
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setShowBulkActionsDialog(true)}
                  >
                    Thao tác hàng loạt
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTags([])}
                  >
                    Bỏ chọn
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {tags.data.map(tag => (
          <Card key={tag.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-1 items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedTags(prev => [...prev, tag.id]);
                      } else {
                        setSelectedTags(prev =>
                          prev.filter(id => id !== tag.id)
                        );
                      }
                    }}
                    className="mt-1"
                  />

                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="default" className="text-sm font-medium">
                        {tag.tag}
                      </Badge>
                      {getCategoryBadge(tag.category)}
                      {getTypeBadge(tag.type)}
                      {tag.is_verified ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Đã xác minh
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Clock className="mr-1 h-3 w-3" />
                          Chờ xác minh
                        </Badge>
                      )}
                      {!tag.is_active && (
                        <Badge variant="destructive">Không hoạt động</Badge>
                      )}
                    </div>

                    <div className="mb-2 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                      <div>
                        <span className="text-muted-foreground">Nội dung:</span>
                        <span className="ml-1">
                          {tag.content_type} • {tag.content_id}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tin cậy:</span>
                        <span className="ml-1 font-medium">
                          {(tag.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      {tag.verified_by && (
                        <div>
                          <span className="text-muted-foreground">
                            Xác minh bởi:
                          </span>
                          <span className="ml-1">{tag.verified_by}</span>
                        </div>
                      )}
                      {tag.ai_model_version && (
                        <div>
                          <span className="text-muted-foreground">
                            AI Model:
                          </span>
                          <span className="ml-1">{tag.ai_model_version}</span>
                        </div>
                      )}
                    </div>

                    {tag.description && (
                      <p className="mb-2 text-sm text-muted-foreground">
                        {tag.description}
                      </p>
                    )}

                    <div className="flex items-center gap-1">
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{ width: `${tag.confidence * 100}%` }}
                        />
                      </div>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {(tag.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedTag(tag);
                      setTagData({
                        content_type: tag.content_type,
                        content_id: tag.content_id,
                        tag: tag.tag,
                        category: tag.category,
                        type: tag.type,
                        confidence: tag.confidence,
                        description: tag.description || '',
                        is_active: tag.is_active,
                      });
                      setShowTagDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  {!tag.is_verified && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => verifyTag(tag.id)}
                      disabled={verifyingTag}
                    >
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTag(tag.id)}
                    disabled={deletingTag}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderContentTags = () => {
    if (!selectedContentType || !selectedContentId || !contentTags) {
      return (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Chọn một nội dung cụ thể để xem các tag
            </p>
          </CardContent>
        </Card>
      );
    }

    const tagsByCategory = contentTags.reduce(
      (acc, tag) => {
        if (!acc[tag.category]) acc[tag.category] = [];
        acc[tag.category].push(tag);
        return acc;
      },
      {} as Record<string, ContentTag[]>
    );

    return (
      <div className="space-y-6">
        {Object.entries(tagsByCategory).map(([category, categoryTags]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {getCategoryBadge(category)}
                <span>({categoryTags.length} tag)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categoryTags.map(tag => (
                  <Badge
                    key={tag.id}
                    variant={tag.is_verified ? 'default' : 'outline'}
                    className={`${!tag.is_active ? 'opacity-50' : ''}`}
                  >
                    {tag.tag}
                    {tag.is_verified && (
                      <CheckCircle className="ml-1 h-3 w-3" />
                    )}
                    <span className="ml-1 text-xs">
                      ({(tag.confidence * 100).toFixed(0)}%)
                    </span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderTagDialog = () => (
    <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selectedTag ? 'Chỉnh sửa tag' : 'Tạo tag mới'}
          </DialogTitle>
          <DialogDescription>
            {selectedTag
              ? 'Cập nhật thông tin tag'
              : 'Thêm tag mới cho nội dung'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Loại nội dung</Label>
              <Select
                value={tagData.content_type}
                onValueChange={(value: 'course' | 'lesson') =>
                  setTagData(prev => ({ ...prev, content_type: value }))
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
              <Label>ID nội dung</Label>
              <Input
                value={tagData.content_id}
                onChange={e =>
                  setTagData(prev => ({ ...prev, content_id: e.target.value }))
                }
                placeholder="ID của nội dung"
              />
            </div>
          </div>

          <div>
            <Label>Tag</Label>
            <Input
              value={tagData.tag}
              onChange={e =>
                setTagData(prev => ({ ...prev, tag: e.target.value }))
              }
              placeholder="Nhập tên tag"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Danh mục</Label>
              <Select
                value={tagData.category}
                onValueChange={(value: any) =>
                  setTagData(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="topic">Chủ đề</SelectItem>
                  <SelectItem value="difficulty">Độ khó</SelectItem>
                  <SelectItem value="skill">Kỹ năng</SelectItem>
                  <SelectItem value="subject">Môn học</SelectItem>
                  <SelectItem value="learning_objective">
                    Mục tiêu học
                  </SelectItem>
                  <SelectItem value="content_type">Loại nội dung</SelectItem>
                  <SelectItem value="language">Ngôn ngữ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Nguồn</Label>
              <Select
                value={tagData.type}
                onValueChange={(value: any) =>
                  setTagData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Thủ công</SelectItem>
                  <SelectItem value="ai_suggested">AI gợi ý</SelectItem>
                  <SelectItem value="auto_generated">Tự động</SelectItem>
                  <SelectItem value="system">Hệ thống</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Độ tin cậy: {(tagData.confidence * 100).toFixed(0)}%</Label>
            <Slider
              value={[tagData.confidence * 100]}
              onValueChange={([value]) =>
                setTagData(prev => ({ ...prev, confidence: value / 100 }))
              }
              max={100}
              min={0}
              step={5}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Mô tả (tùy chọn)</Label>
            <Textarea
              value={tagData.description}
              onChange={e =>
                setTagData(prev => ({ ...prev, description: e.target.value }))
              }
              placeholder="Mô tả về tag này..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={tagData.is_active}
              onCheckedChange={checked =>
                setTagData(prev => ({ ...prev, is_active: checked }))
              }
            />
            <Label>Tag hoạt động</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowTagDialog(false);
                setSelectedTag(null);
                resetTagData();
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={selectedTag ? handleUpdateTag : handleCreateTag}
              disabled={
                !tagData.content_id ||
                !tagData.tag ||
                (selectedTag ? updatingTag : creatingTag)
              }
            >
              {(selectedTag ? updatingTag : creatingTag) && (
                <LoadingSpinner className="mr-2 h-4 w-4" />
              )}
              {selectedTag ? 'Cập nhật' : 'Tạo tag'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderGenerateDialog = () => (
    <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo tag tự động bằng AI</DialogTitle>
          <DialogDescription>
            Sử dụng AI để tạo tag cho nội dung
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Loại nội dung</Label>
              <Select
                value={generateConfig.content_type}
                onValueChange={(value: 'course' | 'lesson') =>
                  setGenerateConfig(prev => ({ ...prev, content_type: value }))
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
              <Label>ID nội dung</Label>
              <Input
                value={generateConfig.content_id}
                onChange={e =>
                  setGenerateConfig(prev => ({
                    ...prev,
                    content_id: e.target.value,
                  }))
                }
                placeholder="ID của nội dung"
              />
            </div>
          </div>

          <div>
            <Label>Danh mục cần tạo</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { value: 'topic', label: 'Chủ đề' },
                { value: 'difficulty', label: 'Độ khó' },
                { value: 'skill', label: 'Kỹ năng' },
                { value: 'subject', label: 'Môn học' },
                { value: 'learning_objective', label: 'Mục tiêu học' },
                { value: 'content_type', label: 'Loại nội dung' },
                { value: 'language', label: 'Ngôn ngữ' },
              ].map(category => (
                <div
                  key={category.value}
                  className="flex items-center space-x-2"
                >
                  <Switch
                    checked={generateConfig.categories.includes(category.value)}
                    onCheckedChange={checked => {
                      setGenerateConfig(prev => ({
                        ...prev,
                        categories: checked
                          ? [...prev.categories, category.value]
                          : prev.categories.filter(c => c !== category.value),
                      }));
                    }}
                  />
                  <Label className="text-sm">{category.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Số tag tối đa: {generateConfig.max_tags}</Label>
            <Slider
              value={[generateConfig.max_tags]}
              onValueChange={([value]) =>
                setGenerateConfig(prev => ({ ...prev, max_tags: value }))
              }
              max={50}
              min={5}
              step={5}
              className="mt-2"
            />
          </div>

          <div>
            <Label>
              Ngưỡng tin cậy:{' '}
              {(generateConfig.confidence_threshold * 100).toFixed(0)}%
            </Label>
            <Slider
              value={[generateConfig.confidence_threshold * 100]}
              onValueChange={([value]) =>
                setGenerateConfig(prev => ({
                  ...prev,
                  confidence_threshold: value / 100,
                }))
              }
              max={100}
              min={30}
              step={5}
              className="mt-2"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowGenerateDialog(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleGenerateTags}
              disabled={
                !generateConfig.content_id ||
                generateConfig.categories.length === 0 ||
                generatingTags
              }
            >
              {generatingTags && <LoadingSpinner className="mr-2 h-4 w-4" />}
              <Zap className="mr-2 h-4 w-4" />
              Tạo tag
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderBulkActionsDialog = () => (
    <Dialog
      open={showBulkActionsDialog}
      onOpenChange={setShowBulkActionsDialog}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thao tác hàng loạt</DialogTitle>
          <DialogDescription>
            Thực hiện thao tác trên {selectedTags.length} tag đã chọn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button onClick={handleBulkVerify} disabled={bulkVerifying}>
              {bulkVerifying && <LoadingSpinner className="mr-2 h-4 w-4" />}
              <CheckCircle className="mr-2 h-4 w-4" />
              Xác minh tất cả
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                selectedTags.forEach(tagId => deleteTag(tagId));
                setShowBulkActionsDialog(false);
                setSelectedTags([]);
              }}
              disabled={deletingTag}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa tất cả
            </Button>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBulkActionsDialog(false)}
            >
              Hủy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý tag và phân loại</h1>
          <p className="text-muted-foreground">
            Tạo, quản lý và phân loại tag cho nội dung học tập
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetchTags()}
            disabled={loadingTags}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Tải lại
          </Button>
          <Button variant="outline" onClick={() => setShowGenerateDialog(true)}>
            <Zap className="mr-2 h-4 w-4" />
            Tạo bằng AI
          </Button>
          <Button onClick={() => setShowTagDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo tag mới
          </Button>
        </div>
      </div>

      {renderTagStatistics()}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tất cả tag</TabsTrigger>
          <TabsTrigger value="unverified">Chưa xác minh</TabsTrigger>
          <TabsTrigger value="content">Tag theo nội dung</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bộ lọc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                <Input
                  placeholder="Tìm kiếm tag..."
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
                  value={filters.category}
                  onValueChange={value =>
                    setFilters(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    <SelectItem value="topic">Chủ đề</SelectItem>
                    <SelectItem value="difficulty">Độ khó</SelectItem>
                    <SelectItem value="skill">Kỹ năng</SelectItem>
                    <SelectItem value="subject">Môn học</SelectItem>
                    <SelectItem value="learning_objective">
                      Mục tiêu học
                    </SelectItem>
                    <SelectItem value="content_type">Loại nội dung</SelectItem>
                    <SelectItem value="language">Ngôn ngữ</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.type}
                  onValueChange={value =>
                    setFilters(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nguồn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    <SelectItem value="manual">Thủ công</SelectItem>
                    <SelectItem value="ai_suggested">AI gợi ý</SelectItem>
                    <SelectItem value="auto_generated">Tự động</SelectItem>
                    <SelectItem value="system">Hệ thống</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.is_verified?.toString() || ''}
                  onValueChange={value =>
                    setFilters(prev => ({
                      ...prev,
                      is_verified: value === '' ? undefined : value === 'true',
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    <SelectItem value="true">Đã xác minh</SelectItem>
                    <SelectItem value="false">Chưa xác minh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {renderTagsList()}
        </TabsContent>

        <TabsContent value="unverified">{renderTagsList()}</TabsContent>

        <TabsContent value="content">{renderContentTags()}</TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {renderCategoryDistribution()}
            {renderTypeDistribution()}
          </div>

          {/* Top Tags */}
          {tags?.data && (
            <Card>
              <CardHeader>
                <CardTitle>Tag phổ biến nhất</CardTitle>
                <CardDescription>
                  Các tag được sử dụng nhiều nhất
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    tags.data.reduce(
                      (acc, tag) => {
                        acc[tag.tag] = (acc[tag.tag] || 0) + 1;
                        return acc;
                      },
                      {} as Record<string, number>
                    )
                  )
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                    .map(([tagName, count], index) => (
                      <div
                        key={tagName}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs text-blue-800">
                            {index + 1}
                          </span>
                          <Badge variant="outline">{tagName}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-blue-600"
                              style={{
                                width: `${
                                  (count /
                                    Math.max(
                                      ...Object.values(
                                        tags.data.reduce(
                                          (acc, tag) => {
                                            acc[tag.tag] =
                                              (acc[tag.tag] || 0) + 1;
                                            return acc;
                                          },
                                          {} as Record<string, number>
                                        )
                                      )
                                    )) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tag Cloud Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Tag Cloud</CardTitle>
              <CardDescription>
                Hiển thị trực quan các tag theo tần suất sử dụng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 rounded-lg bg-gray-50 p-4">
                {tags?.data &&
                  Object.entries(
                    tags.data.reduce(
                      (acc, tag) => {
                        acc[tag.tag] = (acc[tag.tag] || 0) + 1;
                        return acc;
                      },
                      {} as Record<string, number>
                    )
                  )
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 30)
                    .map(([tagName, count]) => {
                      const maxCount = Math.max(
                        ...Object.values(
                          tags.data.reduce(
                            (acc, tag) => {
                              acc[tag.tag] = (acc[tag.tag] || 0) + 1;
                              return acc;
                            },
                            {} as Record<string, number>
                          )
                        )
                      );
                      const size = Math.max(0.8, (count / maxCount) * 2);

                      return (
                        <Badge
                          key={tagName}
                          variant="outline"
                          className="cursor-pointer hover:bg-blue-50"
                          style={{
                            fontSize: `${size}rem`,
                            padding: `${size * 0.25}rem ${size * 0.5}rem`,
                          }}
                        >
                          {tagName}
                        </Badge>
                      );
                    })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {renderTagDialog()}
      {renderGenerateDialog()}
      {renderBulkActionsDialog()}
    </div>
  );
};
