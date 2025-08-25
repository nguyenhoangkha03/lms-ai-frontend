'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Database,
  Search,
  Filter,
  Import,
  Eye,
  Star,
  TrendingUp,
  Clock,
  Target,
  Plus,
  RotateCcw,
  BarChart3,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

import {
  useGetQuestionBankQuestionsQuery,
  useGetQuestionBankStatisticsQuery,
} from '@/lib/redux/api/teacher-assessment-api';
import { QuestionType, QuestionBankItem } from '@/lib/types/assessment';

interface QuestionBankSelectorProps {
  onImport: (questionIds: string[]) => Promise<void>;
  courseId: string;
  lessonId?: string;
  filters?: {
    questionType?: QuestionType;
    difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
    searchQuery?: string;
  };
}

const QUESTION_TYPE_OPTIONS = [
  { value: 'multiple_choice', label: 'Multiple Choice', icon: '📝' },
  { value: 'true_false', label: 'True/False', icon: '✓' },
  { value: 'short_answer', label: 'Short Answer', icon: '💬' },
  { value: 'essay', label: 'Essay', icon: '📄' },
  { value: 'fill_in_the_blank', label: 'Fill in Blank', icon: '___' },
  { value: 'matching', label: 'Matching', icon: '🔗' },
  { value: 'ordering', label: 'Ordering', icon: '📊' },
  { value: 'numeric', label: 'Numeric', icon: '🔢' },
  { value: 'code', label: 'Code', icon: '💻' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy', color: 'green' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'hard', label: 'Hard', color: 'orange' },
  { value: 'expert', label: 'Expert', color: 'red' },
];

const SORT_OPTIONS = [
  { value: 'created', label: 'Date Created' },
  { value: 'usage', label: 'Usage Count' },
  { value: 'difficulty', label: 'Difficulty' },
  { value: 'score', label: 'Average Score' },
];

export const QuestionBankSelector: React.FC<QuestionBankSelectorProps> = ({
  onImport,
  courseId,
  lessonId,
  filters: initialFilters,
}) => {
  const { toast } = useToast();

  // Filter state
  const [filters, setFilters] = useState({
    searchQuery: initialFilters?.searchQuery || '',
    questionType: initialFilters?.questionType ?? undefined,
    difficulty: initialFilters?.difficulty ?? undefined,
    tags: [] as string[],
    sortBy: 'createdAt' as 'createdAt' | 'updatedAt' | 'difficulty' | 'points',
    sortOrder: 'desc' as 'asc' | 'desc',
    page: 1,
    limit: 20,
    // courseId removed - question bank questions are generic
  });

  // Selection state
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<string | null>(null);

  // API queries - Remove courseId from filters since question bank questions are generic
  const {
    data: questionBankData,
    isLoading: isLoadingQuestions,
    error: questionsError,
  } = useGetQuestionBankQuestionsQuery({
    searchQuery: filters.searchQuery,
    questionType: filters.questionType,
    difficulty: filters.difficulty,
    tags: filters.tags,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page: filters.page,
    limit: filters.limit,
    // courseId: filters.courseId, // ❌ Remove courseId for question bank
  });

  const { data: statisticsData, isLoading: isLoadingStats } =
    useGetQuestionBankStatisticsQuery(courseId);

  // Debug logging
  console.log('QuestionBank Filters:', filters);
  console.log('QuestionBank Data:', questionBankData);
  console.log('QuestionBank Error:', questionsError);

  // Update filters
  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value, // Reset page when other filters change
    }));
  };

  // Handle selection
  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const selectAllQuestions = () => {
    if (!questionBankData?.data) return;
    const questions = asQuestionBankItems(questionBankData.data);
    const allIds = questions.map(q => q.id);
    setSelectedQuestions(allIds);
  };

  const clearSelection = () => {
    setSelectedQuestions([]);
  };

  // Helper to safely convert Question to QuestionBankItem
  const asQuestionBankItems = (questions: any[]): QuestionBankItem[] => {
    return questions.map(q => ({
      ...q,
      usageCount: q.usageCount || 0,
      isTemplate: q.isTemplate || false,
      averageRating: q.averageRating,
      categoryId: q.categoryId,
      lastUsedAt: q.lastUsedAt,
    }));
  };

  // Handle bulk operations
  const handleImport = async () => {
    if (selectedQuestions.length === 0) {
      toast({
        title: 'No Questions Selected',
        description: 'Please select at least one question to import.',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    try {
      await onImport(selectedQuestions);
      toast({
        title: 'Questions Imported',
        description: `${selectedQuestions.length} questions have been imported successfully.`,
      });
      setSelectedQuestions([]);
    } catch (error: any) {
      toast({
        title: 'Import Failed',
        description:
          error.message || 'Failed to import questions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      questionType: undefined,
      difficulty: undefined,
      tags: [],
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 20,
      courseId,
    });
  };

  // Get question stats
  const getQuestionStats = () => {
    if (!questionBankData?.data) return null;

    const total = questionBankData.meta.total;
    const selected = selectedQuestions.length;
    const questions = asQuestionBankItems(questionBankData.data);
    const avgScore =
      questions.reduce((sum, q) => sum + (q.analytics?.averageScore || 0), 0) /
      (questions.length || 1);
    const usageTotal = questions.reduce(
      (sum, q) => sum + q.usageCount,
      0
    );

    return { total, selected, avgScore, usageTotal };
  };

  const stats = getQuestionStats();

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Question Bank</CardTitle>
                <CardDescription>
                  Import questions from your existing question bank
                </CardDescription>
              </div>
            </div>

            {/* Quick Stats */}
            {statisticsData && (
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {statisticsData?.totalQuestions || 0}
                  </div>
                  <div className="text-muted-foreground">Total Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {Object.keys(statisticsData?.questionsByType || {}).length}
                  </div>
                  <div className="text-muted-foreground">Question Types</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {statisticsData?.mostUsedTags?.length || 0}
                  </div>
                  <div className="text-muted-foreground">Tags Available</div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filters</span>
            </div>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>Search Questions</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search by text or tags..."
                  value={filters.searchQuery}
                  onChange={e => updateFilter('searchQuery', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Question Type */}
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select
                value={filters.questionType}
                onValueChange={value => updateFilter('questionType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {QUESTION_TYPE_OPTIONS.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={filters.difficulty}
                onValueChange={value => updateFilter('difficulty', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {DIFFICULTY_OPTIONS.map(diff => (
                    <SelectItem key={diff.value} value={diff.value}>
                      <div
                        className={`h-3 w-3 rounded-full bg-${diff.color}-500 mr-2 inline-block`}
                      />
                      {diff.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <Label>Sort By</Label>
              <div className="flex gap-2">
                <Select
                  value={filters.sortBy}
                  onValueChange={value => updateFilter('sortBy', value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map(sort => (
                      <SelectItem key={sort.value} value={sort.value}>
                        {sort.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateFilter(
                      'sortOrder',
                      filters.sortOrder === 'asc' ? 'desc' : 'asc'
                    )
                  }
                >
                  {filters.sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>
          </div>

          {/* Popular Tags */}
          {statisticsData?.mostUsedTags &&
            statisticsData.mostUsedTags?.length > 0 && (
              <div className="mt-4">
                <Label className="mb-2 block text-sm font-medium">
                  Popular Tags
                </Label>
                <div className="flex flex-wrap gap-2">
                  {statisticsData?.mostUsedTags?.slice(0, 10).map(tag => (
                    <Badge
                      key={tag.tag}
                      variant={
                        filters.tags.includes(tag.tag) ? 'default' : 'outline'
                      }
                      className="cursor-pointer"
                      onClick={() => {
                        const newTags = filters.tags.includes(tag.tag)
                          ? filters.tags.filter(t => t !== tag.tag)
                          : [...filters.tags, tag.tag];
                        updateFilter('tags', newTags);
                      }}
                    >
                      {tag.tag} ({tag.count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Selection Summary */}
      {stats && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>
                    <strong>{stats.selected}</strong> of{' '}
                    <strong>{stats.total}</strong> selected
                  </span>
                </div>
                {stats.selected > 0 && (
                  <>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>
                        Avg Score: <strong>{stats.avgScore.toFixed(1)}%</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>
                        Total Usage: <strong>{stats.usageTotal}</strong>
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedQuestions.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                    >
                      Clear Selection
                    </Button>
                    <Button
                      onClick={handleImport}
                      disabled={isImporting}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isImporting ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Import className="mr-2 h-4 w-4" />
                          Import Selected ({selectedQuestions.length})
                        </>
                      )}
                    </Button>
                  </>
                )}

                {questionBankData?.data && questionBankData.data.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllQuestions}
                  >
                    Select All ({questionBankData.data.length})
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      {isLoadingQuestions ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading questions...</p>
          </CardContent>
        </Card>
      ) : questionsError ? (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-8 w-8 text-red-500" />
            <p className="text-red-600">Failed to load questions</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : !questionBankData?.data || questionBankData.data.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="mx-auto mb-4 h-8 w-8 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium">No Questions Found</h3>
            <p className="mb-4 text-muted-foreground">
              {filters.searchQuery ||
              filters.questionType !== undefined ||
              filters.difficulty !== undefined
                ? 'No questions match your current filters. Try adjusting your search criteria.'
                : 'Your question bank is empty. Create some questions first to import them into assessments.'}
            </p>
            {(filters.searchQuery ||
              filters.questionType !== undefined ||
              filters.difficulty !== undefined) && (
              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {asQuestionBankItems(questionBankData.data).map((question, index) => {
            const isSelected = selectedQuestions.includes(question.id);
            const typeOption = QUESTION_TYPE_OPTIONS.find(
              opt => opt.value === question.questionType
            );
            const difficultyOption = DIFFICULTY_OPTIONS.find(
              opt => opt.value === question.difficulty
            );

            return (
              <Card
                key={question.id}
                className={`transition-all hover:shadow-md ${
                  isSelected ? 'bg-primary/5 ring-2 ring-primary' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Selection Checkbox */}
                    <div className="flex items-center pt-1">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() =>
                          toggleQuestionSelection(question.id)
                        }
                      />
                    </div>

                    {/* Question Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Question Text */}
                          <p className="mb-2 line-clamp-2 text-sm font-medium">
                            {question.questionText}
                          </p>

                          {/* Question Metadata */}
                          <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">
                              {typeOption?.icon} {typeOption?.label}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                difficultyOption?.color === 'green'
                                  ? 'border-green-200 text-green-600'
                                  : difficultyOption?.color === 'yellow'
                                    ? 'border-yellow-200 text-yellow-600'
                                    : difficultyOption?.color === 'orange'
                                      ? 'border-orange-200 text-orange-600'
                                      : 'border-red-200 text-red-600'
                              }`}
                            >
                              {difficultyOption?.label}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {question.points} pts
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Used {question.usageCount} times
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {(question.analytics?.averageScore || 0).toFixed(1)}% avg
                            </span>
                          </div>

                          {/* Question Tags */}
                          {question.tags.length > 0 && (
                            <div className="mb-2 flex items-center gap-1">
                              {question.tags.slice(0, 3).map(tag => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {question.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{question.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Question Analytics */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <BarChart3 className="h-3 w-3" />
                              Difficulty Index:{' '}
                              {(
                                (question.analytics?.difficultyIndex || 0) * 100
                              ).toFixed(0)}
                              %
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Avg Time:{' '}
                              {Math.round(question.analytics?.averageTimeSpent || 0)}s
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              {question.analytics?.attempts || 0} attempts
                            </span>
                          </div>
                        </div>

                        {/* Question Actions */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setPreviewQuestion(
                                previewQuestion === question.id
                                  ? null
                                  : question.id
                              )
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Question Preview */}
                      {previewQuestion === question.id && (
                        <div className="mt-4 rounded-lg border bg-gray-50 p-3">
                          <div className="space-y-3">
                            {/* Question Options for Multiple Choice */}
                            {question.questionType === 'multiple_choice' &&
                              question.options && (
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium text-muted-foreground">
                                    Options:
                                  </Label>
                                  {question.options.map((option, optIndex) => (
                                    <div
                                      key={optIndex}
                                      className="flex items-center gap-2 text-sm"
                                    >
                                      <div
                                        className={`h-2 w-2 rounded-full ${
                                          Array.isArray(question.correctAnswer)
                                            ? question.correctAnswer.includes(
                                                option.text
                                              )
                                            : String(question.correctAnswer) === option.text
                                              ? 'bg-green-500'
                                              : 'bg-gray-300'
                                        }`}
                                      />
                                      <span
                                        className={
                                          (
                                            Array.isArray(
                                              question.correctAnswer
                                            )
                                              ? question.correctAnswer.includes(
                                                  option.text
                                                )
                                              : String(question.correctAnswer) ===
                                                option.text
                                          )
                                            ? 'font-medium text-green-700'
                                            : ''
                                        }
                                      >
                                        {option.text}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                            {/* Correct Answer for other types */}
                            {question.questionType !== 'multiple_choice' && (
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">
                                  Correct Answer:
                                </Label>
                                <p className="mt-1 rounded border border-green-200 bg-green-50 p-2 text-sm">
                                  {Array.isArray(question.correctAnswer)
                                    ? question.correctAnswer.join(', ')
                                    : String(question.correctAnswer)}
                                </p>
                              </div>
                            )}

                            {/* Explanation */}
                            {question.explanation && (
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">
                                  Explanation:
                                </Label>
                                <p className="mt-1 text-sm text-gray-700">
                                  {question.explanation}
                                </p>
                              </div>
                            )}

                            {/* Hint */}
                            {question.hint && (
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">
                                  Hint:
                                </Label>
                                <p className="mt-1 text-sm italic text-blue-700">
                                  {question.hint}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Pagination */}
          {questionBankData.meta.total > filters.limit && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {(filters.page - 1) * filters.limit + 1} to{' '}
                    {Math.min(
                      filters.page * filters.limit,
                      questionBankData.meta.total
                    )}{' '}
                    of {questionBankData.meta.total} questions
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateFilter('page', Math.max(1, filters.page - 1))
                      }
                      disabled={filters.page === 1}
                    >
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        {
                          length: Math.min(
                            5,
                            Math.ceil(
                              questionBankData.meta.total / filters.limit
                            )
                          ),
                        },
                        (_, i) => {
                          const totalPages = Math.ceil(
                            questionBankData.meta.total / filters.limit
                          );
                          let pageNum;

                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (filters.page <= 3) {
                            pageNum = i + 1;
                          } else if (filters.page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = filters.page - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                filters.page === pageNum ? 'default' : 'outline'
                              }
                              size="sm"
                              onClick={() => updateFilter('page', pageNum)}
                              className="h-8 w-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateFilter(
                          'page',
                          Math.min(
                            Math.ceil(
                              questionBankData.meta.total / filters.limit
                            ),
                            filters.page + 1
                          )
                        )
                      }
                      disabled={
                        filters.page >=
                        Math.ceil(questionBankData.meta.total / filters.limit)
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Quick Import Actions */}
      {questionBankData?.data &&
        questionBankData.data.length > 0 &&
        selectedQuestions.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <Database className="mx-auto mb-4 h-8 w-8 text-gray-400" />
              <h3 className="mb-2 font-medium">Quick Import Options</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Select questions above or use these quick import options
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Select random 5 questions
                    const questions = asQuestionBankItems(questionBankData.data);
                    const randomQuestions = questions
                      .sort(() => Math.random() - 0.5)
                      .slice(0, 5)
                      .map(q => q.id);
                    setSelectedQuestions(randomQuestions);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Random 5
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Select top performing questions
                    const questions = asQuestionBankItems(questionBankData.data);
                    const topQuestions = questions
                      .sort(
                        (a, b) => (b.analytics?.averageScore || 0) - (a.analytics?.averageScore || 0)
                      )
                      .slice(0, 10)
                      .map(q => q.id);
                    setSelectedQuestions(topQuestions);
                  }}
                >
                  <Star className="mr-2 h-4 w-4" />
                  Top 10
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Select most used questions
                    const questions = asQuestionBankItems(questionBankData.data);
                    const popularQuestions = questions
                      .sort(
                        (a, b) => b.usageCount - a.usageCount
                      )
                      .slice(0, 8)
                      .map(q => q.id);
                    setSelectedQuestions(popularQuestions);
                  }}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Most Used
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
};
