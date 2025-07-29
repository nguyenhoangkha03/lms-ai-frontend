'use client';

import { useState } from 'react';
import {
  useGetInteractiveElementsQuery,
  useSubmitInteractiveResponseMutation,
} from '@/lib/redux/api/learning-api';
import { InteractiveElement } from '@/types/learning';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  Lightbulb,
  Target,
  Clock,
  Star,
  Code,
  Puzzle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface InteractiveElementsProps {
  lessonId: string;
  className?: string;
}

export function InteractiveElements({
  lessonId,
  className,
}: InteractiveElementsProps) {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [completedElements, setCompletedElements] = useState<Set<string>>(
    new Set()
  );
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});

  const {
    data: elements = [],
    isLoading,
    error,
  } = useGetInteractiveElementsQuery(lessonId);

  const [submitResponse, { isLoading: submitting }] =
    useSubmitInteractiveResponseMutation();

  const handleResponse = (elementId: string, response: any) => {
    setResponses(prev => ({
      ...prev,
      [elementId]: response,
    }));
  };

  const handleSubmit = async (element: InteractiveElement) => {
    const response = responses[element.id];
    if (!response) {
      toast.error('Vui lòng chọn câu trả lời');
      return;
    }

    try {
      const startTime = Date.now();
      const result = await submitResponse({
        elementId: element.id,
        response,
        isCorrect: false, // Will be determined by backend
        timeSpent: 0, // Will be calculated
      }).unwrap();

      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      setCompletedElements(prev => new Set([...prev, element.id]));
      setShowFeedback(prev => ({ ...prev, [element.id]: true }));

      if (result.isCorrect) {
        toast.success('Chính xác! ' + (result.feedback || ''));
      } else {
        toast.error('Chưa chính xác. ' + (result.feedback || ''));
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi gửi câu trả lời');
    }
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return <HelpCircle className="h-5 w-5" />;
      case 'poll':
        return <Target className="h-5 w-5" />;
      case 'code_exercise':
        return <Code className="h-5 w-5" />;
      case 'simulation':
        return <Puzzle className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  const getElementTypeLabel = (type: string) => {
    switch (type) {
      case 'quiz':
        return 'Câu hỏi';
      case 'poll':
        return 'Khảo sát';
      case 'hotspot':
        return 'Điểm tương tác';
      case 'drag_drop':
        return 'Kéo thả';
      case 'code_exercise':
        return 'Bài tập code';
      case 'simulation':
        return 'Mô phỏng';
      default:
        return 'Tương tác';
    }
  };

  const renderQuizElement = (element: InteractiveElement) => {
    const userResponse = responses[element.id];
    const isCompleted = completedElements.has(element.id);
    const showElementFeedback = showFeedback[element.id];

    return (
      <div className="space-y-4">
        <div className="space-y-3">
          {element.content.options?.map(option => (
            <label
              key={option.id}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                userResponse === option.id && 'border-blue-500 bg-blue-50',
                isCompleted &&
                  option.isCorrect &&
                  'border-green-500 bg-green-50',
                isCompleted &&
                  userResponse === option.id &&
                  !option.isCorrect &&
                  'border-red-500 bg-red-50',
                isCompleted && 'cursor-not-allowed'
              )}
            >
              <input
                type="radio"
                name={`element-${element.id}`}
                value={option.id}
                checked={userResponse === option.id}
                onChange={e =>
                  !isCompleted && handleResponse(element.id, e.target.value)
                }
                disabled={isCompleted}
                className="text-blue-600"
              />
              <span className="flex-1">{option.text}</span>

              {isCompleted && (
                <div className="flex-shrink-0">
                  {option.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : userResponse === option.id ? (
                    <XCircle className="h-5 w-5 text-red-600" />
                  ) : null}
                </div>
              )}
            </label>
          ))}
        </div>

        {!isCompleted && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {element.content.hints && element.content.hints.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info(element.content.hints![0])}
                >
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Gợi ý
                </Button>
              )}
            </div>

            <Button
              onClick={() => handleSubmit(element)}
              disabled={!userResponse || submitting}
            >
              {submitting ? 'Đang gửi...' : 'Gửi câu trả lời'}
            </Button>
          </div>
        )}

        {showElementFeedback && element.content.explanation && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
              <div>
                <h4 className="mb-2 font-medium">Giải thích</h4>
                <p className="text-sm text-gray-700">
                  {element.content.explanation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCodeExercise = (element: InteractiveElement) => {
    const userCode =
      responses[element.id] || element.content.code?.initialCode || '';
    const isCompleted = completedElements.has(element.id);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Code Editor */}
          <div>
            <h4 className="mb-2 font-medium">Code Editor</h4>
            <textarea
              value={userCode}
              onChange={e =>
                !isCompleted && handleResponse(element.id, e.target.value)
              }
              disabled={isCompleted}
              className={cn(
                'h-64 w-full resize-none rounded-lg border p-3 font-mono text-sm',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                isCompleted && 'bg-gray-50'
              )}
              placeholder="Nhập code của bạn..."
            />
          </div>

          {/* Test Cases */}
          <div>
            <h4 className="mb-2 font-medium">Test Cases</h4>
            <div className="space-y-2">
              {element.content.code?.testCases?.map((testCase, index) => (
                <div
                  key={index}
                  className="rounded border bg-gray-50 p-3 text-sm"
                >
                  <div className="font-medium">Test {index + 1}:</div>
                  <div className="mt-1 text-gray-600">
                    Input:{' '}
                    <code className="rounded bg-white px-1">
                      {testCase.input}
                    </code>
                  </div>
                  <div className="text-gray-600">
                    Expected:{' '}
                    <code className="rounded bg-white px-1">
                      {testCase.expectedOutput}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {!isCompleted && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {element.content.code?.language || 'JavaScript'}
              </Badge>
              {element.content.hints && element.content.hints.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info(element.content.hints![0])}
                >
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Gợi ý
                </Button>
              )}
            </div>

            <Button
              onClick={() => handleSubmit(element)}
              disabled={!userCode.trim() || submitting}
            >
              <Code className="mr-2 h-4 w-4" />
              {submitting ? 'Đang chạy...' : 'Chạy code'}
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderPollElement = (element: InteractiveElement) => {
    const userResponse = responses[element.id];
    const isCompleted = completedElements.has(element.id);

    return (
      <div className="space-y-4">
        <div className="space-y-3">
          {element.content.options?.map(option => (
            <label
              key={option.id}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                userResponse === option.id && 'border-blue-500 bg-blue-50',
                isCompleted && 'cursor-not-allowed opacity-75'
              )}
            >
              <input
                type="radio"
                name={`poll-${element.id}`}
                value={option.id}
                checked={userResponse === option.id}
                onChange={e =>
                  !isCompleted && handleResponse(element.id, e.target.value)
                }
                disabled={isCompleted}
                className="text-blue-600"
              />
              <span className="flex-1">{option.text}</span>
            </label>
          ))}
        </div>

        {!isCompleted && (
          <Button
            onClick={() => handleSubmit(element)}
            disabled={!userResponse || submitting}
            className="w-full"
          >
            {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
          </Button>
        )}

        {isCompleted && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">
                Cảm ơn bạn đã tham gia khảo sát!
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div className={cn('py-8 text-center', className)}>
        <p className="mb-2 text-red-600">Không thể tải nội dung tương tác</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 w-3/4 rounded bg-gray-200"></div>
                <div className="space-y-2">
                  <div className="h-4 rounded bg-gray-200"></div>
                  <div className="h-4 w-5/6 rounded bg-gray-200"></div>
                </div>
                <div className="h-10 w-32 rounded bg-gray-200"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (elements.length === 0) {
    return null; // Don't show anything if no interactive elements
  }

  const completedCount = completedElements.size;
  const totalCount = elements.length;
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5" />
              Nội dung tương tác
            </CardTitle>
            <Badge variant="outline">
              {completedCount} / {totalCount} hoàn thành
            </Badge>
          </div>
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-sm text-gray-600">
              Hoàn thành các hoạt động tương tác để hiểu sâu hơn về bài học
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Interactive Elements */}
      {elements.map((element, index) => {
        const isCompleted = completedElements.has(element.id);
        const isRequired = element.settings.isRequired;

        return (
          <Card
            key={element.id}
            className={cn(
              'transition-all duration-200',
              isCompleted && 'ring-2 ring-green-200'
            )}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'rounded-lg p-2',
                      isCompleted
                        ? 'bg-green-100 text-green-600'
                        : 'bg-blue-100 text-blue-600'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      getElementIcon(element.type)
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      Hoạt động {index + 1}: {element.title}
                    </CardTitle>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getElementTypeLabel(element.type)}
                      </Badge>
                      {isRequired && (
                        <Badge variant="destructive" className="text-xs">
                          Bắt buộc
                        </Badge>
                      )}
                      {element.settings.points && (
                        <Badge variant="secondary" className="text-xs">
                          {element.settings.points} điểm
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {isCompleted && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Hoàn thành</span>
                  </div>
                )}
              </div>

              {element.description && (
                <p className="mt-3 text-gray-600">{element.description}</p>
              )}
            </CardHeader>

            <CardContent>
              {element.content.question && (
                <div className="mb-4">
                  <h4 className="mb-2 font-medium">
                    {element.content.question}
                  </h4>
                </div>
              )}

              {element.type === 'quiz' && renderQuizElement(element)}
              {element.type === 'poll' && renderPollElement(element)}
              {element.type === 'code_exercise' && renderCodeExercise(element)}

              {/* Default fallback for other types */}
              {!['quiz', 'poll', 'code_exercise'].includes(element.type) && (
                <div className="py-8 text-center text-gray-500">
                  <Puzzle className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                  <p>
                    Loại hoạt động "{element.type}" sẽ có trong phiên bản tới
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Completion Summary */}
      {completedCount === totalCount && totalCount > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-600" />
            <h3 className="mb-2 font-semibold text-green-800">
              Xuất sắc! Bạn đã hoàn thành tất cả hoạt động tương tác
            </h3>
            <p className="text-green-700">
              Bạn đã thể hiện sự hiểu biết tốt về nội dung bài học này.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
