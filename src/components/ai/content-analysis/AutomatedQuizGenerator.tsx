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
import { Separator } from '@/components/ui/separator';
import {
  Brain,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Plus,
  Download,
  Upload,
  Settings,
  BookOpen,
  Target,
  MessageSquare,
  FileText,
} from 'lucide-react';
import {
  useGetGeneratedQuizzesQuery,
  useGenerateQuizMutation,
  useUpdateGeneratedQuizMutation,
  useDeleteGeneratedQuizMutation,
  useReviewGeneratedQuizMutation,
  useApproveGeneratedQuizMutation,
  useRejectGeneratedQuizMutation,
  useGetQuizzesForLessonQuery,
} from '@/lib/redux/api/content-analysis-api';
import { GeneratedQuiz } from '@/lib/types/content-analysis';

const DIFFICULTY_COLORS = {
  beginner: '#22c55e',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
};

const STATUS_COLORS = {
  generated: '#6b7280',
  reviewed: '#3b82f6',
  approved: '#22c55e',
  rejected: '#ef4444',
  published: '#8b5cf6',
};

const QUESTION_TYPE_ICONS = {
  multiple_choice: MessageSquare,
  true_false: CheckCircle,
  short_answer: FileText,
  essay: BookOpen,
};

const BLOOM_TAXONOMY_LEVELS = {
  remember: { label: 'Nhớ', color: '#dc2626' },
  understand: { label: 'Hiểu', color: '#ea580c' },
  apply: { label: 'Áp dụng', color: '#d97706' },
  analyze: { label: 'Phân tích', color: '#65a30d' },
  evaluate: { label: 'Đánh giá', color: '#0891b2' },
  create: { label: 'Sáng tạo', color: '#7c3aed' },
};

interface AutomatedQuizGeneratorProps {
  selectedLessonId?: string;
}

export const AutomatedQuizGenerator: React.FC<AutomatedQuizGeneratorProps> = ({
  selectedLessonId,
}) => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    lesson_id: selectedLessonId || '',
    status: '',
    difficulty_level: '',
    search: '',
  });

  const [selectedQuiz, setSelectedQuiz] = useState<GeneratedQuiz | null>(null);
  const [showGeneratorDialog, setShowGeneratorDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  const [generatorConfig, setGeneratorConfig] = useState({
    lesson_id: selectedLessonId || '',
    config: {
      question_count: 10,
      difficulty_level: 'intermediate' as
        | 'beginner'
        | 'intermediate'
        | 'advanced',
      question_types: ['multiple_choice', 'true_false'],
      focus_areas: [] as string[],
      estimated_duration: 15,
    },
  });

  const [reviewData, setReviewData] = useState({
    feedback: '',
    decision: 'approve' as 'approve' | 'reject' | 'needs_revision',
  });

  // API Queries
  const {
    data: quizzes,
    isLoading: loadingQuizzes,
    refetch: refetchQuizzes,
  } = useGetGeneratedQuizzesQuery(filters);

  const { data: lessonQuizzes } = useGetQuizzesForLessonQuery(
    selectedLessonId || '',
    { skip: !selectedLessonId }
  );

  // Mutations
  const [generateQuiz, { isLoading: generatingQuiz }] =
    useGenerateQuizMutation();
  const [updateQuiz, { isLoading: updatingQuiz }] =
    useUpdateGeneratedQuizMutation();
  const [deleteQuiz, { isLoading: deletingQuiz }] =
    useDeleteGeneratedQuizMutation();
  const [reviewQuiz, { isLoading: reviewingQuiz }] =
    useReviewGeneratedQuizMutation();
  const [approveQuiz, { isLoading: approvingQuiz }] =
    useApproveGeneratedQuizMutation();
  const [rejectQuiz, { isLoading: rejectingQuiz }] =
    useRejectGeneratedQuizMutation();

  const handleGenerateQuiz = async () => {
    try {
      await generateQuiz(generatorConfig).unwrap();
      setShowGeneratorDialog(false);
      refetchQuizzes();
    } catch (error) {
      console.error('Failed to generate quiz:', error);
    }
  };

  const handleReviewQuiz = async () => {
    if (!selectedQuiz) return;

    try {
      await reviewQuiz({
        id: selectedQuiz.id,
        ...reviewData,
      }).unwrap();
      setShowReviewDialog(false);
      setSelectedQuiz(null);
      refetchQuizzes();
    } catch (error) {
      console.error('Failed to review quiz:', error);
    }
  };

  const handleQuickAction = async (
    quizId: string,
    action: 'approve' | 'reject'
  ) => {
    try {
      if (action === 'approve') {
        await approveQuiz(quizId).unwrap();
      } else {
        await rejectQuiz({ id: quizId, reason: 'Quick rejection' }).unwrap();
      }
      refetchQuizzes();
    } catch (error) {
      console.error(`Failed to ${action} quiz:`, error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      generated: 'outline',
      reviewed: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      published: 'default',
    } as const;

    const labels = {
      generated: 'Đã tạo',
      reviewed: 'Đã xem xét',
      approved: 'Đã duyệt',
      rejected: 'Bị từ chối',
      published: 'Đã xuất bản',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getDifficultyBadge = (level: string) => {
    const labels = {
      beginner: 'Cơ bản',
      intermediate: 'Trung bình',
      advanced: 'Nâng cao',
    };

    return (
      <Badge
        variant="outline"
        style={{
          borderColor:
            DIFFICULTY_COLORS[level as keyof typeof DIFFICULTY_COLORS],
          color: DIFFICULTY_COLORS[level as keyof typeof DIFFICULTY_COLORS],
        }}
      >
        {labels[level as keyof typeof labels]}
      </Badge>
    );
  };

  const renderQuizStatistics = () => {
    if (!quizzes?.data) return null;

    const statusStats = quizzes.data.reduce(
      (acc, quiz) => {
        acc[quiz.status] = (acc[quiz.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const difficultyStats = quizzes.data.reduce(
      (acc, quiz) => {
        acc[quiz.difficulty_level] = (acc[quiz.difficulty_level] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const avgConfidence =
      quizzes.data.reduce((sum, quiz) => sum + quiz.ai_confidence, 0) /
      quizzes.data.length;

    return (
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số quiz</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizzes.data.length}</div>
            <p className="text-xs text-muted-foreground">Đã tạo bởi AI</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statusStats.approved || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {(
                ((statusStats.approved || 0) / quizzes.data.length) *
                100
              ).toFixed(1)}
              % tổng số
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tin cậy AI</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgConfidence.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Trung bình</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ xem xét</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statusStats.generated || 0}
            </div>
            <p className="text-xs text-muted-foreground">Cần được duyệt</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderQuizzesList = () => {
    if (loadingQuizzes) {
      return <LoadingSpinner />;
    }

    if (!quizzes?.data.length) {
      return (
        <div className="py-8 text-center">
          <Brain className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Chưa có quiz nào được tạo</p>
          <Button className="mt-4" onClick={() => setShowGeneratorDialog(true)}>
            Tạo quiz đầu tiên
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {quizzes.data.map(quiz => (
          <Card key={quiz.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="font-medium">{quiz.title}</h3>
                    {getStatusBadge(quiz.status)}
                    {getDifficultyBadge(quiz.difficulty_level)}
                    <Badge variant="outline">
                      {quiz.questions.length} câu hỏi
                    </Badge>
                  </div>

                  {quiz.description && (
                    <p className="mb-3 text-sm text-muted-foreground">
                      {quiz.description}
                    </p>
                  )}

                  <div className="mb-3 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                    <div>
                      <span className="text-muted-foreground">Thời gian:</span>
                      <span className="ml-1 font-medium">
                        {quiz.estimated_duration} phút
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tin cậy AI:</span>
                      <span className="ml-1 font-medium">
                        {quiz.ai_confidence.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Bài học:</span>
                      <span className="ml-1 font-medium">{quiz.lesson_id}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ngày tạo:</span>
                      <span className="ml-1 font-medium">
                        {new Date(
                          quiz.metadata?.createdAt || Date.now()
                        ).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  {/* Question Types Distribution */}
                  <div className="mb-3 flex flex-wrap gap-1">
                    {Object.entries(
                      quiz.questions.reduce(
                        (acc, q) => {
                          acc[q.type] = (acc[q.type] || 0) + 1;
                          return acc;
                        },
                        {} as Record<string, number>
                      )
                    ).map(([type, count]) => {
                      const Icon =
                        QUESTION_TYPE_ICONS[
                          type as keyof typeof QUESTION_TYPE_ICONS
                        ];
                      return (
                        <Badge key={type} variant="outline" className="text-xs">
                          <Icon className="mr-1 h-3 w-3" />
                          {type === 'multiple_choice'
                            ? 'Trắc nghiệm'
                            : type === 'true_false'
                              ? 'Đúng/Sai'
                              : type === 'short_answer'
                                ? 'Trả lời ngắn'
                                : 'Tự luận'}{' '}
                          ({count})
                        </Badge>
                      );
                    })}
                  </div>

                  {/* Bloom Taxonomy Distribution */}
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(
                      quiz.questions.reduce(
                        (acc, q) => {
                          acc[q.bloom_taxonomy] =
                            (acc[q.bloom_taxonomy] || 0) + 1;
                          return acc;
                        },
                        {} as Record<string, number>
                      )
                    ).map(([level, count]) => {
                      const bloomInfo =
                        BLOOM_TAXONOMY_LEVELS[
                          level as keyof typeof BLOOM_TAXONOMY_LEVELS
                        ];
                      return (
                        <Badge
                          key={level}
                          variant="outline"
                          className="text-xs"
                          style={{
                            borderColor: bloomInfo.color,
                            color: bloomInfo.color,
                          }}
                        >
                          {bloomInfo.label} ({count})
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowPreviewDialog(true);
                      setSelectedQuiz(quiz);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  {quiz.status === 'generated' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowReviewDialog(true);
                          setSelectedQuiz(quiz);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickAction(quiz.id, 'approve')}
                        disabled={approvingQuiz}
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickAction(quiz.id, 'reject')}
                        disabled={rejectingQuiz}
                      >
                        <XCircle className="h-4 w-4 text-red-600" />
                      </Button>
                    </>
                  )}

                  {quiz.status === 'rejected' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteQuiz(quiz.id)}
                      disabled={deletingQuiz}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderQuizPreview = () => {
    if (!selectedQuiz) return null;

    return (
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedQuiz.title}</DialogTitle>
            <DialogDescription>
              {selectedQuiz.description} • {selectedQuiz.questions.length} câu
              hỏi •{selectedQuiz.estimated_duration} phút
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Quiz Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông tin quiz</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Độ khó:</span>
                    <span className="ml-2">
                      {getDifficultyBadge(selectedQuiz.difficulty_level)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trạng thái:</span>
                    <span className="ml-2">
                      {getStatusBadge(selectedQuiz.status)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tin cậy AI:</span>
                    <span className="ml-2 font-medium">
                      {selectedQuiz.ai_confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bài học:</span>
                    <span className="ml-2">{selectedQuiz.lesson_id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Danh sách câu hỏi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedQuiz.questions.map((question, index) => (
                  <div key={question.id} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Badge variant="outline">Câu {index + 1}</Badge>
                      <Badge variant="outline">
                        {question.type === 'multiple_choice'
                          ? 'Trắc nghiệm'
                          : question.type === 'true_false'
                            ? 'Đúng/Sai'
                            : question.type === 'short_answer'
                              ? 'Trả lời ngắn'
                              : 'Tự luận'}
                      </Badge>
                      <Badge variant="outline">
                        {question.difficulty === 'easy'
                          ? 'Dễ'
                          : question.difficulty === 'medium'
                            ? 'TB'
                            : 'Khó'}
                      </Badge>
                      <Badge
                        variant="outline"
                        style={{
                          borderColor:
                            BLOOM_TAXONOMY_LEVELS[question.bloom_taxonomy]
                              .color,
                          color:
                            BLOOM_TAXONOMY_LEVELS[question.bloom_taxonomy]
                              .color,
                        }}
                      >
                        {BLOOM_TAXONOMY_LEVELS[question.bloom_taxonomy].label}
                      </Badge>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {question.estimated_time} phút
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="font-medium">{question.question}</p>
                    </div>

                    {question.options && (
                      <div className="mb-3">
                        <p className="mb-2 text-sm text-muted-foreground">
                          Các lựa chọn:
                        </p>
                        <div className="space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`rounded p-2 text-sm ${
                                question.correct_answer === option
                                  ? 'border border-green-200 bg-green-50 text-green-700'
                                  : 'bg-gray-50'
                              }`}
                            >
                              {String.fromCharCode(65 + optIndex)}. {option}
                              {question.correct_answer === option && (
                                <CheckCircle className="ml-2 inline h-4 w-4 text-green-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {question.type === 'true_false' && (
                      <div className="mb-3">
                        <p className="mb-1 text-sm text-muted-foreground">
                          Đáp án:
                        </p>
                        <Badge
                          variant={
                            question.correct_answer === 'true'
                              ? 'default'
                              : 'destructive'
                          }
                        >
                          {question.correct_answer === 'true' ? 'Đúng' : 'Sai'}
                        </Badge>
                      </div>
                    )}

                    {(question.type === 'short_answer' ||
                      question.type === 'essay') && (
                      <div className="mb-3">
                        <p className="mb-1 text-sm text-muted-foreground">
                          Đáp án mẫu:
                        </p>
                        <p className="rounded bg-gray-50 p-2 text-sm">
                          {question.correct_answer}
                        </p>
                      </div>
                    )}

                    {question.explanation && (
                      <div>
                        <p className="mb-1 text-sm text-muted-foreground">
                          Giải thích:
                        </p>
                        <p className="rounded bg-blue-50 p-2 text-sm text-blue-800">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Generation Config */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cấu hình tạo quiz</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Số câu hỏi:</span>
                    <span className="ml-2">
                      {selectedQuiz.generation_config.question_count}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Loại câu hỏi:</span>
                    <span className="ml-2">
                      {selectedQuiz.generation_config.question_types.join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Phân bố độ khó:
                    </span>
                    <div className="ml-2">
                      {Object.entries(
                        selectedQuiz.generation_config.difficulty_distribution
                      ).map(([level, count]) => (
                        <Badge
                          key={level}
                          variant="outline"
                          className="mr-1 text-xs"
                        >
                          {level}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Lĩnh vực tập trung:
                    </span>
                    <div className="ml-2">
                      {selectedQuiz.generation_config.focus_areas.map(area => (
                        <Badge
                          key={area}
                          variant="outline"
                          className="mr-1 text-xs"
                        >
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Review Info */}
            {selectedQuiz.reviewed_by && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thông tin xem xét</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Người xem xét:
                      </span>
                      <span className="ml-2">{selectedQuiz.reviewed_by}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Ngày xem xét:
                      </span>
                      <span className="ml-2">
                        {selectedQuiz.reviewed_at
                          ? new Date(selectedQuiz.reviewed_at).toLocaleString(
                              'vi-VN'
                            )
                          : 'Chưa xem xét'}
                      </span>
                    </div>
                    {selectedQuiz.feedback && (
                      <div>
                        <span className="text-muted-foreground">Phản hồi:</span>
                        <p className="mt-1 rounded bg-gray-50 p-2 text-sm">
                          {selectedQuiz.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderGeneratorDialog = () => (
    <Dialog open={showGeneratorDialog} onOpenChange={setShowGeneratorDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tạo quiz tự động bằng AI</DialogTitle>
          <DialogDescription>
            Cấu hình để AI tạo quiz từ nội dung bài học
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Bài học</Label>
            <Input
              value={generatorConfig.lesson_id}
              onChange={e =>
                setGeneratorConfig(prev => ({
                  ...prev,
                  lesson_id: e.target.value,
                }))
              }
              placeholder="ID của bài học cần tạo quiz"
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Cấu hình quiz</h4>

            <div>
              <Label>
                Số lượng câu hỏi: {generatorConfig.config.question_count}
              </Label>
              <Slider
                value={[generatorConfig.config.question_count]}
                onValueChange={([value]) =>
                  setGeneratorConfig(prev => ({
                    ...prev,
                    config: { ...prev.config, question_count: value },
                  }))
                }
                max={50}
                min={5}
                step={5}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Độ khó</Label>
              <Select
                value={generatorConfig.config.difficulty_level}
                onValueChange={(value: any) =>
                  setGeneratorConfig(prev => ({
                    ...prev,
                    config: { ...prev.config, difficulty_level: value },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Cơ bản</SelectItem>
                  <SelectItem value="intermediate">Trung bình</SelectItem>
                  <SelectItem value="advanced">Nâng cao</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>
                Thời gian ước tính (phút):{' '}
                {generatorConfig.config.estimated_duration}
              </Label>
              <Slider
                value={[generatorConfig.config.estimated_duration]}
                onValueChange={([value]) =>
                  setGeneratorConfig(prev => ({
                    ...prev,
                    config: { ...prev.config, estimated_duration: value },
                  }))
                }
                max={120}
                min={5}
                step={5}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Loại câu hỏi</Label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                {[
                  { value: 'multiple_choice', label: 'Trắc nghiệm' },
                  { value: 'true_false', label: 'Đúng/Sai' },
                  { value: 'short_answer', label: 'Trả lời ngắn' },
                  { value: 'essay', label: 'Tự luận' },
                ].map(type => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Switch
                      checked={generatorConfig.config.question_types.includes(
                        type.value
                      )}
                      onCheckedChange={checked => {
                        setGeneratorConfig(prev => ({
                          ...prev,
                          config: {
                            ...prev.config,
                            question_types: checked
                              ? [...prev.config.question_types, type.value]
                              : prev.config.question_types.filter(
                                  t => t !== type.value
                                ),
                          },
                        }));
                      }}
                    />
                    <Label className="text-sm">{type.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Lĩnh vực tập trung (tùy chọn)</Label>
              <Textarea
                value={generatorConfig.config.focus_areas.join('\n')}
                onChange={e =>
                  setGeneratorConfig(prev => ({
                    ...prev,
                    config: {
                      ...prev.config,
                      focus_areas: e.target.value
                        .split('\n')
                        .filter(area => area.trim()),
                    },
                  }))
                }
                placeholder="Nhập từng lĩnh vực một dòng (VD: Ngữ pháp, Từ vựng, Đọc hiểu)"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowGeneratorDialog(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleGenerateQuiz}
              disabled={
                !generatorConfig.lesson_id ||
                generatorConfig.config.question_types.length === 0 ||
                generatingQuiz
              }
            >
              {generatingQuiz && <LoadingSpinner className="mr-2 h-4 w-4" />}
              <Brain className="mr-2 h-4 w-4" />
              Tạo quiz
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderReviewDialog = () => (
    <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xem xét quiz</DialogTitle>
          <DialogDescription>
            Đưa ra quyết định về quiz được tạo bởi AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Quyết định</Label>
            <Select
              value={reviewData.decision}
              onValueChange={(value: any) =>
                setReviewData(prev => ({ ...prev, decision: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approve">Phê duyệt</SelectItem>
                <SelectItem value="needs_revision">Cần chỉnh sửa</SelectItem>
                <SelectItem value="reject">Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Phản hồi</Label>
            <Textarea
              value={reviewData.feedback}
              onChange={e =>
                setReviewData(prev => ({ ...prev, feedback: e.target.value }))
              }
              placeholder="Nhập phản hồi về quiz..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowReviewDialog(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleReviewQuiz} disabled={reviewingQuiz}>
              {reviewingQuiz && <LoadingSpinner className="mr-2 h-4 w-4" />}
              Gửi phản hồi
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
          <h1 className="text-3xl font-bold">Tạo quiz tự động</h1>
          <p className="text-muted-foreground">
            Sử dụng AI để tạo quiz từ nội dung bài học
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetchQuizzes()}
            disabled={loadingQuizzes}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Tải lại
          </Button>
          <Button onClick={() => setShowGeneratorDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo quiz mới
          </Button>
        </div>
      </div>

      {renderQuizStatistics()}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tất cả quiz</TabsTrigger>
          <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
          <TabsTrigger value="approved">Đã duyệt</TabsTrigger>
          {selectedLessonId && (
            <TabsTrigger value="lesson">Quiz của bài học</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
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
                <Input
                  placeholder="ID bài học..."
                  value={filters.lesson_id}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, lesson_id: e.target.value }))
                  }
                />
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
                    <SelectItem value="generated">Đã tạo</SelectItem>
                    <SelectItem value="reviewed">Đã xem xét</SelectItem>
                    <SelectItem value="approved">Đã duyệt</SelectItem>
                    <SelectItem value="rejected">Bị từ chối</SelectItem>
                    <SelectItem value="published">Đã xuất bản</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.difficulty_level}
                  onValueChange={value =>
                    setFilters(prev => ({ ...prev, difficulty_level: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Độ khó" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    <SelectItem value="beginner">Cơ bản</SelectItem>
                    <SelectItem value="intermediate">Trung bình</SelectItem>
                    <SelectItem value="advanced">Nâng cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {renderQuizzesList()}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quiz chờ duyệt</CardTitle>
              <CardDescription>
                Các quiz cần được xem xét và phê duyệt
              </CardDescription>
            </CardHeader>
            <CardContent>{renderQuizzesList()}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quiz đã duyệt</CardTitle>
              <CardDescription>
                Các quiz đã được phê duyệt và có thể sử dụng
              </CardDescription>
            </CardHeader>
            <CardContent>{renderQuizzesList()}</CardContent>
          </Card>
        </TabsContent>

        {selectedLessonId && (
          <TabsContent value="lesson" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quiz cho bài học {selectedLessonId}</CardTitle>
                <CardDescription>
                  Tất cả quiz được tạo cho bài học này
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lessonQuizzes ? (
                  <div className="space-y-4">
                    {lessonQuizzes.map(quiz => (
                      <Card key={quiz.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{quiz.title}</h3>
                              <div className="mt-2 flex gap-2">
                                {getStatusBadge(quiz.status)}
                                {getDifficultyBadge(quiz.difficulty_level)}
                                <Badge variant="outline">
                                  {quiz.questions.length} câu hỏi
                                </Badge>
                                <Badge variant="outline">
                                  {quiz.estimated_duration} phút
                                </Badge>
                              </div>
                              {quiz.description && (
                                <p className="mt-2 text-sm text-muted-foreground">
                                  {quiz.description}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedQuiz(quiz);
                                  setShowPreviewDialog(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {quiz.status === 'generated' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedQuiz(quiz);
                                      setShowReviewDialog(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleQuickAction(quiz.id, 'approve')
                                    }
                                    disabled={approvingQuiz}
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Brain className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="mb-4 text-muted-foreground">
                      Chưa có quiz nào cho bài học này
                    </p>
                    <Button
                      onClick={() => {
                        setGeneratorConfig(prev => ({
                          ...prev,
                          lesson_id: selectedLessonId,
                        }));
                        setShowGeneratorDialog(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Tạo quiz cho bài học này
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {renderGeneratorDialog()}
      {renderReviewDialog()}
      {renderQuizPreview()}
    </div>
  );
};
