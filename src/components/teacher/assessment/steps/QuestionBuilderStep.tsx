'use client';

import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Trash2,
  Edit,
  Copy,
  Brain,
  Database,
  Search,
  Upload,
  Shuffle,
  Target,
  Clock,
} from 'lucide-react';

import { QuestionEditor } from '../QuestionEditor';
import { QuestionBankSelector } from '../QuestionBankSelector';
import { AIQuestionGenerator } from '../AIQuestionGenerator';
import { BulkQuestionImporter } from '../BulkQuestionImporter';

import {
  useGenerateQuestionsWithAIMutation,
  useImportQuestionsToAssessmentMutation,
} from '@/lib/redux/api/assessment-creation-api';

import { Question, QuestionFormData } from '@/types/assessment';

interface QuestionBuilderStepProps {
  questions: Question[];
  assessmentType: string;
  courseId: string;
  lessonId?: string;
  onUpdate: (questions: Question[]) => void;
  errors: Record<string, string>;
}

const QUESTION_TYPE_OPTIONS = [
  { value: 'multiple_choice', label: 'Multiple Choice', icon: '📝' },
  { value: 'true_false', label: 'True/False', icon: '✓' },
  { value: 'short_answer', label: 'Short Answer', icon: '💬' },
  { value: 'essay', label: 'Essay', icon: '📄' },
  { value: 'fill_in_the_blank', label: 'Fill in the Blank', icon: '___' },
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

export const QuestionBuilderStep: React.FC<QuestionBuilderStepProps> = ({
  questions,
  assessmentType,
  courseId,
  lessonId,
  onUpdate,
  errors,
}) => {
  const { toast } = useToast();

  // State management
  const [activeTab, setActiveTab] = useState<'create' | 'bank' | 'ai' | 'bulk'>(
    'create'
  );
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null);
  const [draggedQuestionIndex, setDraggedQuestionIndex] = useState<
    number | null
  >(null);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [filterQuestionType, setFilterQuestionType] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Question form state
  const [questionForm, setQuestionForm] = useState<QuestionFormData>({
    questionText: '',
    questionType: 'multiple_choice',
    points: 1,
    difficulty: 'medium',
    hint: '',
    explanation: '',
    options: [
      { id: '1', text: '', isCorrect: false, feedback: '', orderIndex: 0 },
      { id: '2', text: '', isCorrect: false, feedback: '', orderIndex: 1 },
    ],
    correctAnswer: '',
    tags: [],
    validationRules: {
      required: true,
    },
  });

  // API hooks
  //   const { data: questionBankData, isLoading: isLoadingBank } =
  //     useGetQuestionBankQuery({
  //       questionType:
  //         filterQuestionType !== 'all' ? filterQuestionType : undefined,
  //       difficulty: filterDifficulty !== 'all' ? filterDifficulty : undefined,
  //       searchQuery: searchQuery || undefined,
  //       page: 1,
  //       limit: 50,
  //     });

  const [generateQuestionsWithAI, { isLoading: isGeneratingAI }] =
    useGenerateQuestionsWithAIMutation();
  const [importQuestionsToAssessment, { isLoading: isImporting }] =
    useImportQuestionsToAssessmentMutation();

  // Question management functions
  const addNewQuestion = useCallback(() => {
    const newQuestion: Question = {
      id: `temp-${Date.now()}`,
      assessmentId: '',
      questionText: questionForm.questionText,
      questionType: questionForm.questionType as any,
      explanation: questionForm.explanation,
      points: questionForm.points,
      difficulty: questionForm.difficulty as any,
      orderIndex: questions.length,
      timeLimit: undefined,
      hint: questionForm.hint,
      options: questionForm.options,
      correctAnswer: questionForm.correctAnswer,
      validationRules: questionForm.validationRules,
      tags: questionForm.tags,
      attachments: [],
      analytics: {
        attempts: 0,
        correctAnswers: 0,
        averageScore: 0,
        averageTimeSpent: 0,
        difficultyIndex: 0,
        discriminationIndex: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user',
      updatedBy: 'current-user',
    };

    onUpdate([...questions, newQuestion]);

    // Reset form
    setQuestionForm({
      questionText: '',
      questionType: 'multiple_choice',
      points: 1,
      difficulty: 'medium',
      hint: '',
      explanation: '',
      options: [
        { id: '1', text: '', isCorrect: false, feedback: '', orderIndex: 0 },
        { id: '2', text: '', isCorrect: false, feedback: '', orderIndex: 1 },
      ],
      correctAnswer: '',
      tags: [],
      validationRules: { required: true },
    });

    toast({
      title: 'Question Added',
      description: 'New question has been added to the assessment.',
    });
  }, [questionForm, questions, onUpdate, toast]);

  const updateQuestion = useCallback(
    (index: number, updatedQuestion: Partial<Question>) => {
      const newQuestions = [...questions];
      newQuestions[index] = { ...newQuestions[index], ...updatedQuestion };
      onUpdate(newQuestions);
    },
    [questions, onUpdate]
  );

  const deleteQuestion = useCallback(
    (index: number) => {
      const newQuestions = questions.filter((_, i) => i !== index);
      onUpdate(newQuestions);
      toast({
        title: 'Question Deleted',
        description: 'Question has been removed from the assessment.',
      });
    },
    [questions, onUpdate, toast]
  );

  const duplicateQuestion = useCallback(
    (index: number) => {
      const questionToDuplicate = questions[index];
      const duplicatedQuestion: Question = {
        ...questionToDuplicate,
        id: `temp-${Date.now()}`,
        questionText: `${questionToDuplicate.questionText} (Copy)`,
        orderIndex: questions.length,
      };
      onUpdate([...questions, duplicatedQuestion]);
      toast({
        title: 'Question Duplicated',
        description: 'Question has been duplicated successfully.',
      });
    },
    [questions, onUpdate, toast]
  );

  const reorderQuestions = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newQuestions = [...questions];
      const [movedQuestion] = newQuestions.splice(fromIndex, 1);
      newQuestions.splice(toIndex, 0, movedQuestion);

      // Update order indices
      newQuestions.forEach((question, index) => {
        question.orderIndex = index;
      });

      onUpdate(newQuestions);
    },
    [questions, onUpdate]
  );

  // Bulk operations
  const shuffleQuestions = useCallback(() => {
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    shuffledQuestions.forEach((question, index) => {
      question.orderIndex = index;
    });
    onUpdate(shuffledQuestions);
    toast({
      title: 'Questions Shuffled',
      description: 'Question order has been randomized.',
    });
  }, [questions, onUpdate, toast]);

  const deleteSelectedQuestions = useCallback(() => {
    const newQuestions = questions.filter(
      (_, index) => !selectedQuestions.includes(index.toString())
    );
    onUpdate(newQuestions);
    setSelectedQuestions([]);
    toast({
      title: 'Questions Deleted',
      description: `${selectedQuestions.length} questions have been deleted.`,
    });
  }, [questions, selectedQuestions, onUpdate, toast]);

  // AI Generation
  const handleAIGeneration = async (params: {
    topic: string;
    questionType: string;
    difficulty: string;
    count: number;
    context?: string;
  }) => {
    try {
      const result = await generateQuestionsWithAI({
        lessonId,
        courseId,
        topic: params.topic,
        questionType: params.questionType,
        difficulty: params.difficulty,
        count: params.count,
        context: params.context,
      }).unwrap();

      // Convert generated questions to our format
      const generatedQuestions: Question[] = result.questions.map(
        (q, index) => ({
          id: `ai-${Date.now()}-${index}`,
          assessmentId: '',
          questionText: q.questionText,
          questionType: q.questionType as any,
          explanation: q.explanation,
          points: q.points,
          difficulty: q.difficulty,
          orderIndex: questions.length + index,
          hint: q.hint,
          options: q.options
            ? q.options.map((opt, optIndex) => ({
                id: `opt-${optIndex}`,
                text: opt,
                isCorrect: Array.isArray(q.correctAnswer)
                  ? q.correctAnswer.includes(opt)
                  : q.correctAnswer === opt,
                feedback: '',
                orderIndex: optIndex,
              }))
            : undefined,
          correctAnswer: q.correctAnswer,
          tags: q.tags,
          attachments: [],
          analytics: {
            attempts: 0,
            correctAnswers: 0,
            averageScore: 0,
            averageTimeSpent: 0,
            difficultyIndex: 0,
            discriminationIndex: 0,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'ai-generator',
          updatedBy: 'ai-generator',
        })
      );

      onUpdate([...questions, ...generatedQuestions]);
      toast({
        title: 'Questions Generated',
        description: `${generatedQuestions.length} questions have been generated using AI.`,
      });
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description:
          error.message || 'Failed to generate questions. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Import from Question Bank
  const handleBankImport = async (questionIds: string[]) => {
    try {
      await importQuestionsToAssessment({
        assessmentId: 'temp', // Will be updated when assessment is saved
        questionIds,
      }).unwrap();

      toast({
        title: 'Questions Imported',
        description: `${questionIds.length} questions have been imported from the question bank.`,
      });
    } catch (error: any) {
      toast({
        title: 'Import Failed',
        description:
          error.message || 'Failed to import questions. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Filtering
  const filteredQuestions = questions.filter(question => {
    const matchesType =
      filterQuestionType === 'all' ||
      question.questionType === filterQuestionType;
    const matchesDifficulty =
      filterDifficulty === 'all' || question.difficulty === filterDifficulty;
    const matchesSearch =
      !searchQuery ||
      question.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.tags.some(tag =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesType && matchesDifficulty && matchesSearch;
  });

  // Calculate statistics
  const questionStats = {
    total: questions.length,
    byType: QUESTION_TYPE_OPTIONS.reduce(
      (acc, type) => {
        acc[type.value] = questions.filter(
          q => q.questionType === type.value
        ).length;
        return acc;
      },
      {} as Record<string, number>
    ),
    byDifficulty: DIFFICULTY_OPTIONS.reduce(
      (acc, diff) => {
        acc[diff.value] = questions.filter(
          q => q.difficulty === diff.value
        ).length;
        return acc;
      },
      {} as Record<string, number>
    ),
    totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Questions</h3>
          <p className="text-sm text-muted-foreground">
            Add and manage questions for your assessment
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Question Statistics */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span className="font-medium">{questionStats.total}</span>
              <span className="text-muted-foreground">questions</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">{questionStats.totalPoints}</span>
              <span className="text-muted-foreground">points</span>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedQuestions.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={deleteSelectedQuestions}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selectedQuestions.length})
              </Button>
            </div>
          )}

          {/* Question Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={shuffleQuestions}
              disabled={questions.length < 2}
            >
              <Shuffle className="mr-2 h-4 w-4" />
              Shuffle
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={filterQuestionType}
              onValueChange={setFilterQuestionType}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Question Type" />
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

            <Select
              value={filterDifficulty}
              onValueChange={setFilterDifficulty}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {DIFFICULTY_OPTIONS.map(diff => (
                  <SelectItem key={diff.value} value={diff.value}>
                    {diff.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={value => setActiveTab(value as any)}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New
          </TabsTrigger>
          <TabsTrigger value="bank" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Question Bank
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Generate
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Bulk Import
          </TabsTrigger>
        </TabsList>

        {/* Create New Question Tab */}
        <TabsContent value="create" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Question
              </CardTitle>
              <CardDescription>
                Build a new question from scratch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuestionEditor
                question={questionForm}
                onUpdate={setQuestionForm}
                onSave={addNewQuestion}
                errors={errors}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Question Bank Tab */}
        <TabsContent value="bank" className="mt-6">
          <QuestionBankSelector
            onImport={handleBankImport}
            courseId={courseId}
            lessonId={lessonId}
            filters={{
              questionType:
                filterQuestionType !== 'all' ? filterQuestionType : undefined,
              difficulty:
                filterDifficulty !== 'all' ? filterDifficulty : undefined,
              searchQuery: searchQuery || undefined,
            }}
          />
        </TabsContent>

        {/* AI Generation Tab */}
        <TabsContent value="ai" className="mt-6">
          <AIQuestionGenerator
            onGenerate={handleAIGeneration}
            courseId={courseId}
            lessonId={lessonId}
            assessmentType={assessmentType}
            isLoading={isGeneratingAI}
          />
        </TabsContent>

        {/* Bulk Import Tab */}
        <TabsContent value="bulk" className="mt-6">
          <BulkQuestionImporter
            onImport={(questions: Question[]) =>
              onUpdate([...questions, ...questions])
            }
            assessmentType={assessmentType}
          />
        </TabsContent>
      </Tabs>

      {/* Questions List */}
      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
                <CardDescription>
                  Manage and organize your assessment questions
                </CardDescription>
              </div>

              {/* Question Type Distribution */}
              <div className="flex items-center gap-2">
                {Object.entries(questionStats.byType).map(([type, count]) => {
                  if (count === 0) return null;
                  const typeOption = QUESTION_TYPE_OPTIONS.find(
                    opt => opt.value === type
                  );
                  return (
                    <Badge key={type} variant="outline" className="text-xs">
                      {typeOption?.icon} {count}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredQuestions.map((question, index) => (
                <Card key={question.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Question Number & Selection */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(index.toString())}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedQuestions([
                                ...selectedQuestions,
                                index.toString(),
                              ]);
                            } else {
                              setSelectedQuestions(
                                selectedQuestions.filter(
                                  id => id !== index.toString()
                                )
                              );
                            }
                          }}
                          className="rounded"
                        />
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                          {index + 1}
                        </div>
                      </div>

                      {/* Question Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="mb-2 line-clamp-2 text-sm font-medium">
                              {question.questionText}
                            </p>

                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {
                                  QUESTION_TYPE_OPTIONS.find(
                                    opt => opt.value === question.questionType
                                  )?.label
                                }
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  question.difficulty === 'easy'
                                    ? 'text-green-600'
                                    : question.difficulty === 'medium'
                                      ? 'text-yellow-600'
                                      : question.difficulty === 'hard'
                                        ? 'text-orange-600'
                                        : 'text-red-600'
                                }`}
                              >
                                {question.difficulty}
                              </Badge>
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {question.points} pts
                              </span>
                              {question.timeLimit && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {question.timeLimit}min
                                </span>
                              )}
                            </div>

                            {question.tags.length > 0 && (
                              <div className="mt-2 flex items-center gap-1">
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
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    +{question.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Question Actions */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingQuestionIndex(index)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => duplicateQuestion(index)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteQuestion(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {questions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
              <Plus className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium">No Questions Yet</h3>
            <p className="mb-4 text-muted-foreground">
              Start building your assessment by adding questions
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button onClick={() => setActiveTab('create')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Question
              </Button>
              <Button variant="outline" onClick={() => setActiveTab('bank')}>
                <Database className="mr-2 h-4 w-4" />
                From Bank
              </Button>
              <Button variant="outline" onClick={() => setActiveTab('ai')}>
                <Brain className="mr-2 h-4 w-4" />
                AI Generate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {errors.questions && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {errors.questions}
        </div>
      )}
    </div>
  );
};
