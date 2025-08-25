'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Plus,
  Search,
  Wand2,
  Save,
  Play,
  Download,
  Copy,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  BarChart3,
  FileText,
  BookOpen,
  Eye,
  Star,
  ClipboardList,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  useGetGeneratedQuizzesQuery,
  useGenerateQuizMutation,
  useCreateManualQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
  useGetQuizStatisticsQuery,
  type QuizQuestion,
  type GeneratedQuiz,
} from '@/lib/redux/api/teacher-quiz-builder-api';

// Import Assessment API
import {
  useCreateAssessmentTeacherMutation,
  useGetAssessmentsQuery,
  useCreateQuestionBankQuestionMutation,
  useGetQuestionBankQuestionsQuery,
  useAddQuestionsToAssessmentMutation,
  type CreateAssessmentDto,
  type CreateQuestionBankDto,
  type QuestionBankQuestion,
} from '@/lib/redux/api/teacher-assessment-api';

const questionTypes = [
  {
    value: 'multiple_choice',
    label: 'Multiple Choice',
    icon: <CheckCircle className="h-4 w-4" />,
  },
  {
    value: 'true_false',
    label: 'True/False',
    icon: <XCircle className="h-4 w-4" />,
  },
  {
    value: 'short_answer',
    label: 'Short Answer',
    icon: <FileText className="h-4 w-4" />,
  },
  { value: 'essay', label: 'Essay', icon: <BookOpen className="h-4 w-4" /> },
];

const difficultyLevels = [
  { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-800' },
];

export default function QuizBuilderPage() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('builder');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Quiz builder state
  const [currentQuiz, setCurrentQuiz] = useState<Partial<GeneratedQuiz>>({
    title: '',
    description: '',
    questions: [],
    timeLimit: 30,
    passingScore: 70,
    allowMultipleAttempts: true,
    shuffleQuestions: false,
    shuffleOptions: false,
    showCorrectAnswers: true,
    showScoreImmediately: true,
  });

  // AI generation state
  const [aiSettings, setAiSettings] = useState({
    lessonId: '',
    difficulty: 'medium',
    questionCount: 5,
    questionTypes: ['multiple_choice', 'true_false'],
    includeExplanations: true,
    timePerQuestion: 120,
  });

  // API hooks
  const {
    data: quizzesData,
    isLoading: isLoadingQuizzes,
    refetch: refetchQuizzes,
  } = useGetGeneratedQuizzesQuery({
    status: filterStatus === 'all' ? undefined : (filterStatus as any),
    limit: 50,
  });

  const { data: statisticsData } = useGetQuizStatisticsQuery({});

  const [generateQuiz] = useGenerateQuizMutation();
  const [createManualQuiz] = useCreateManualQuizMutation();
  const [updateQuiz] = useUpdateQuizMutation();
  const [deleteQuiz] = useDeleteQuizMutation();

  // Assessment API hooks
  const [createAssessment] = useCreateAssessmentTeacherMutation();
  const [createQuestionBankQuestion] = useCreateQuestionBankQuestionMutation();
  const [addQuestionsToAssessment] = useAddQuestionsToAssessmentMutation();

  const { data: questionBankData } = useGetQuestionBankQuestionsQuery({
    limit: 100,
  });
  const { data: assessmentsData } = useGetAssessmentsQuery({ limit: 20 });

  const questionBankQuestions = questionBankData?.data || [];
  const assessments = assessmentsData?.assessments || [];

  const quizzes = quizzesData?.quizzes || [];

  // Add question to current quiz
  const addQuestion = (type: string) => {
    const newQuestion: QuizQuestion = {
      type: type as any,
      question: '',
      options: type === 'multiple_choice' ? ['', '', '', ''] : undefined,
      correctAnswer: '',
      points: 1,
      explanation: '',
      difficulty: 'medium',
      tags: [],
      timeLimit: 60,
    };

    setCurrentQuiz(prev => ({
      ...prev,
      questions: [...(prev.questions || []), newQuestion],
    }));
  };

  // Update question
  const updateQuestion = (index: number, field: string, value: any) => {
    setCurrentQuiz(prev => ({
      ...prev,
      questions:
        prev.questions?.map((q, i) =>
          i === index ? { ...q, [field]: value } : q
        ) || [],
    }));
  };

  // Remove question
  const removeQuestion = (index: number) => {
    setCurrentQuiz(prev => ({
      ...prev,
      questions: prev.questions?.filter((_, i) => i !== index) || [],
    }));
  };

  // Handle AI quiz generation
  const handleAIGenerate = async () => {
    try {
      const result = await generateQuiz({
        lessonId: aiSettings.lessonId,
        difficulty: aiSettings.difficulty as any,
        questionCount: aiSettings.questionCount,
        questionTypes: aiSettings.questionTypes as any,
        includeExplanations: aiSettings.includeExplanations,
        timePerQuestion: aiSettings.timePerQuestion,
      }).unwrap();

      setCurrentQuiz(result);
      setShowAIDialog(false);
      setActiveTab('builder');

      toast({
        title: 'Quiz Generated!',
        description: `AI generated ${result.questions.length} questions successfully.`,
      });
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error?.message || 'Failed to generate quiz with AI.',
        variant: 'destructive',
      });
    }
  };

  // Handle save quiz
  const handleSaveQuiz = async () => {
    if (!currentQuiz.title || !currentQuiz.questions?.length) {
      toast({
        title: 'Validation Error',
        description: 'Please add a title and at least one question.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (currentQuiz.id) {
        await updateQuiz({
          id: currentQuiz.id,
          updateData: currentQuiz,
        }).unwrap();
      } else {
        await createManualQuiz(currentQuiz as any).unwrap();
      }

      toast({
        title: 'Quiz Saved!',
        description: 'Your quiz has been saved successfully.',
      });

      setCurrentQuiz({
        title: '',
        description: '',
        questions: [],
        timeLimit: 30,
        passingScore: 70,
        allowMultipleAttempts: true,
        shuffleQuestions: false,
        shuffleOptions: false,
        showCorrectAnswers: true,
        showScoreImmediately: true,
      });

      refetchQuizzes();
    } catch (error: any) {
      toast({
        title: 'Save Failed',
        description: error?.message || 'Failed to save quiz.',
        variant: 'destructive',
      });
    }
  };

  // Save question to Question Bank
  const saveQuestionToBank = async (question: QuizQuestion) => {
    try {
      const questionData: CreateQuestionBankDto = {
        questionText: question.question,
        questionType: question.type as any,
        difficulty: question.difficulty,
        points: question.points,
        options: question.options ? { choices: question.options } : undefined,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        hint: '',
        timeLimit: question.timeLimit,
        tags: question.tags || [],
      };

      await createQuestionBankQuestion(questionData).unwrap();

      toast({
        title: 'Question Saved',
        description: 'Question has been added to Question Bank.',
      });
    } catch (error: any) {
      toast({
        title: 'Save Failed',
        description: error?.message || 'Failed to save question to bank.',
        variant: 'destructive',
      });
    }
  };

  // Create Assessment from current quiz
  const createAssessmentFromQuiz = async () => {
    if (!currentQuiz.title || !currentQuiz.questions?.length) {
      toast({
        title: 'Invalid Quiz',
        description: 'Please add a title and at least one question.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // First, save all questions to Question Bank
      const savedQuestionIds: string[] = [];
      for (const question of currentQuiz.questions) {
        const questionData: CreateQuestionBankDto = {
          questionText: question.question,
          questionType: question.type as any,
          difficulty: question.difficulty,
          points: question.points,
          options: question.options ? { choices: question.options } : undefined,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          timeLimit: question.timeLimit,
          tags: question.tags || [],
        };

        const savedQuestion =
          await createQuestionBankQuestion(questionData).unwrap();
        savedQuestionIds.push(savedQuestion.id!);
      }

      // Create Assessment
      const assessmentData: CreateAssessmentDto = {
        title: currentQuiz.title,
        description: currentQuiz.description || '',
        assessmentType: 'quiz',
        timeLimit: currentQuiz.timeLimit,
        maxAttempts: currentQuiz.allowMultipleAttempts ? 3 : 1,
        passingScore: currentQuiz.passingScore || 70,
        randomizeQuestions: currentQuiz.shuffleQuestions || false,
        randomizeAnswers: currentQuiz.shuffleOptions || false,
        showResults: currentQuiz.showScoreImmediately || true,
        showCorrectAnswers: currentQuiz.showCorrectAnswers || false,
        isMandatory: false,
        isProctored: false,
        gradingMethod: 'automatic',
        weight: 1.0,
      };

      const assessment = await createAssessment(assessmentData).unwrap();

      // Add questions to assessment
      await addQuestionsToAssessment({
        assessmentId: assessment.id!,
        questionIds: savedQuestionIds,
      }).unwrap();

      toast({
        title: 'Assessment Created',
        description: `Assessment "${assessment.title}" has been created successfully.`,
      });

      // Reset current quiz
      setCurrentQuiz({
        title: '',
        description: '',
        questions: [],
        timeLimit: 30,
        passingScore: 70,
        allowMultipleAttempts: true,
        shuffleQuestions: false,
        shuffleOptions: false,
        showCorrectAnswers: true,
        showScoreImmediately: true,
      });
    } catch (error: any) {
      toast({
        title: 'Creation Failed',
        description: error?.message || 'Failed to create assessment.',
        variant: 'destructive',
      });
    }
  };

  // Handle delete quiz
  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    try {
      await deleteQuiz(quizId).unwrap();
      toast({
        title: 'Quiz Deleted',
        description: 'The quiz has been deleted successfully.',
      });
      refetchQuizzes();
    } catch (error: any) {
      toast({
        title: 'Delete Failed',
        description: error?.message || 'Failed to delete quiz.',
        variant: 'destructive',
      });
    }
  };

  // Filter quizzes by search
  const filteredQuizzes = quizzes.filter(
    quiz =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  Quiz Builder
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Create and manage quizzes with AI assistance
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-gradient-to-r from-purple-50 to-blue-50"
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    AI Generate
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Generate Quiz with AI</DialogTitle>
                    <DialogDescription>
                      Let AI create quiz questions based on your lesson content.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="lessonId">Select Lesson</Label>
                      <Select
                        value={aiSettings.lessonId}
                        onValueChange={value =>
                          setAiSettings(prev => ({ ...prev, lessonId: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose lesson..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lesson-1">
                            Introduction to Calculus
                          </SelectItem>
                          <SelectItem value="lesson-2">
                            Limits and Continuity
                          </SelectItem>
                          <SelectItem value="lesson-3">
                            Derivatives Basics
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select
                          value={aiSettings.difficulty}
                          onValueChange={value =>
                            setAiSettings(prev => ({
                              ...prev,
                              difficulty: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                            <SelectItem value="mixed">Mixed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="questionCount">Questions</Label>
                        <Select
                          value={aiSettings.questionCount.toString()}
                          onValueChange={value =>
                            setAiSettings(prev => ({
                              ...prev,
                              questionCount: parseInt(value),
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 Questions</SelectItem>
                            <SelectItem value="10">10 Questions</SelectItem>
                            <SelectItem value="15">15 Questions</SelectItem>
                            <SelectItem value="20">20 Questions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Question Types</Label>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {questionTypes.map(type => (
                          <div
                            key={type.value}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              id={type.value}
                              checked={aiSettings.questionTypes.includes(
                                type.value
                              )}
                              onChange={e => {
                                if (e.target.checked) {
                                  setAiSettings(prev => ({
                                    ...prev,
                                    questionTypes: [
                                      ...prev.questionTypes,
                                      type.value,
                                    ],
                                  }));
                                } else {
                                  setAiSettings(prev => ({
                                    ...prev,
                                    questionTypes: prev.questionTypes.filter(
                                      t => t !== type.value
                                    ),
                                  }));
                                }
                              }}
                            />
                            <Label htmlFor={type.value} className="text-sm">
                              {type.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="includeExplanations">
                        Include Explanations
                      </Label>
                      <Switch
                        id="includeExplanations"
                        checked={aiSettings.includeExplanations}
                        onCheckedChange={checked =>
                          setAiSettings(prev => ({
                            ...prev,
                            includeExplanations: checked,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowAIDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAIGenerate}>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Quiz
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                onClick={() => {
                  setCurrentQuiz({
                    title: '',
                    description: '',
                    questions: [],
                    timeLimit: 30,
                    passingScore: 70,
                    allowMultipleAttempts: true,
                    shuffleQuestions: false,
                    shuffleOptions: false,
                    showCorrectAnswers: true,
                    showScoreImmediately: true,
                  });
                  setActiveTab('builder');
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        {/* Statistics Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-white/30 bg-white/80 shadow-xl backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Quizzes</p>
                  <p className="text-2xl font-bold">
                    {statisticsData?.totalQuizzes || 0}
                  </p>
                </div>
                <Brain className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/30 bg-white/80 shadow-xl backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold">
                    {statisticsData?.publishedQuizzes || 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/30 bg-white/80 shadow-xl backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className="text-2xl font-bold">
                    {statisticsData?.averageScore || 0}%
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/30 bg-white/80 shadow-xl backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Completion Rate
                  </p>
                  <p className="text-2xl font-bold">
                    {statisticsData?.completionRate || 0}%
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="rounded-2xl border border-white/30 bg-white/80 p-2 shadow-lg backdrop-blur-xl">
            <TabsList className="grid w-full grid-cols-5 gap-1 bg-transparent">
              <TabsTrigger value="builder" className="rounded-xl">
                Quiz Builder
              </TabsTrigger>
              <TabsTrigger value="question-bank" className="rounded-xl">
                Question Bank
              </TabsTrigger>
              <TabsTrigger value="assessments" className="rounded-xl">
                Assessments
              </TabsTrigger>
              <TabsTrigger value="library" className="rounded-xl">
                Quiz Library
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-xl">
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Quiz Builder Tab */}
          <TabsContent value="builder">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                {/* Quiz Settings */}
                <Card className="border-white/30 bg-white/80 shadow-xl backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>Quiz Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="quizTitle">Quiz Title</Label>
                      <Input
                        id="quizTitle"
                        value={currentQuiz.title}
                        onChange={e =>
                          setCurrentQuiz(prev => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="Enter quiz title..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="quizDescription">Description</Label>
                      <Textarea
                        id="quizDescription"
                        value={currentQuiz.description}
                        onChange={e =>
                          setCurrentQuiz(prev => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Enter quiz description..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                        <Input
                          id="timeLimit"
                          type="number"
                          value={currentQuiz.timeLimit}
                          onChange={e =>
                            setCurrentQuiz(prev => ({
                              ...prev,
                              timeLimit: parseInt(e.target.value),
                            }))
                          }
                          placeholder="30"
                        />
                      </div>
                      <div>
                        <Label htmlFor="passingScore">Passing Score (%)</Label>
                        <Input
                          id="passingScore"
                          type="number"
                          value={currentQuiz.passingScore}
                          onChange={e =>
                            setCurrentQuiz(prev => ({
                              ...prev,
                              passingScore: parseInt(e.target.value),
                            }))
                          }
                          placeholder="70"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Questions */}
                <Card className="border-white/30 bg-white/80 shadow-xl backdrop-blur-xl">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>
                      Questions ({currentQuiz.questions?.length || 0})
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {questionTypes.map(type => (
                        <Button
                          key={type.value}
                          variant="outline"
                          size="sm"
                          onClick={() => addQuestion(type.value)}
                        >
                          {type.icon}
                          <span className="ml-1 hidden sm:inline">
                            {type.label}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px]">
                      {currentQuiz.questions?.length === 0 ? (
                        <div className="py-12 text-center">
                          <Brain className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                          <p className="mb-4 text-muted-foreground">
                            No questions added yet
                          </p>
                          <div className="flex justify-center space-x-2">
                            <Button
                              onClick={() => addQuestion('multiple_choice')}
                            >
                              Add Question
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowAIDialog(true)}
                            >
                              <Wand2 className="mr-2 h-4 w-4" />
                              AI Generate
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <AnimatePresence>
                            {currentQuiz.questions?.map((question, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-4 rounded-lg border bg-white p-4"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline">
                                      Q{index + 1}
                                    </Badge>
                                    <Badge
                                      className={
                                        question.difficulty === 'easy'
                                          ? 'bg-green-100 text-green-800'
                                          : question.difficulty === 'medium'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                      }
                                    >
                                      {question.difficulty}
                                    </Badge>
                                    <Badge variant="secondary">
                                      {
                                        questionTypes.find(
                                          t => t.value === question.type
                                        )?.label
                                      }
                                    </Badge>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        saveQuestionToBank(question)
                                      }
                                      className="text-emerald-600 hover:text-emerald-700"
                                    >
                                      <Save className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeQuestion(index)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                <div>
                                  <Label>Question</Label>
                                  <Textarea
                                    value={question.question}
                                    onChange={e =>
                                      updateQuestion(
                                        index,
                                        'question',
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter your question..."
                                    rows={2}
                                  />
                                </div>

                                {question.type === 'multiple_choice' && (
                                  <div>
                                    <Label>Options</Label>
                                    <div className="space-y-2">
                                      {question.options?.map(
                                        (option, optionIndex) => (
                                          <div
                                            key={optionIndex}
                                            className="flex items-center space-x-2"
                                          >
                                            <Input
                                              value={option}
                                              onChange={e => {
                                                const newOptions = [
                                                  ...(question.options || []),
                                                ];
                                                newOptions[optionIndex] =
                                                  e.target.value;
                                                updateQuestion(
                                                  index,
                                                  'options',
                                                  newOptions
                                                );
                                              }}
                                              placeholder={`Option ${optionIndex + 1}`}
                                            />
                                            <input
                                              type="radio"
                                              name={`correct-${index}`}
                                              checked={
                                                question.correctAnswer ===
                                                optionIndex.toString()
                                              }
                                              onChange={() =>
                                                updateQuestion(
                                                  index,
                                                  'correctAnswer',
                                                  optionIndex.toString()
                                                )
                                              }
                                            />
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                                {question.type === 'true_false' && (
                                  <div>
                                    <Label>Correct Answer</Label>
                                    <Select
                                      value={question.correctAnswer as string}
                                      onValueChange={value =>
                                        updateQuestion(
                                          index,
                                          'correctAnswer',
                                          value
                                        )
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select correct answer..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="true">
                                          True
                                        </SelectItem>
                                        <SelectItem value="false">
                                          False
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Points</Label>
                                    <Input
                                      type="number"
                                      value={question.points}
                                      onChange={e =>
                                        updateQuestion(
                                          index,
                                          'points',
                                          parseInt(e.target.value)
                                        )
                                      }
                                      placeholder="1"
                                    />
                                  </div>
                                  <div>
                                    <Label>Time Limit (seconds)</Label>
                                    <Input
                                      type="number"
                                      value={question.timeLimit}
                                      onChange={e =>
                                        updateQuestion(
                                          index,
                                          'timeLimit',
                                          parseInt(e.target.value)
                                        )
                                      }
                                      placeholder="60"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label>Explanation (Optional)</Label>
                                  <Textarea
                                    value={question.explanation}
                                    onChange={e =>
                                      updateQuestion(
                                        index,
                                        'explanation',
                                        e.target.value
                                      )
                                    }
                                    placeholder="Explain why this is the correct answer..."
                                    rows={2}
                                  />
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Quiz Settings */}
                <Card className="border-white/30 bg-white/80 shadow-xl backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>Quiz Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="allowMultiple">Multiple Attempts</Label>
                      <Switch
                        id="allowMultiple"
                        checked={currentQuiz.allowMultipleAttempts}
                        onCheckedChange={checked =>
                          setCurrentQuiz(prev => ({
                            ...prev,
                            allowMultipleAttempts: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="shuffleQuestions">
                        Shuffle Questions
                      </Label>
                      <Switch
                        id="shuffleQuestions"
                        checked={currentQuiz.shuffleQuestions}
                        onCheckedChange={checked =>
                          setCurrentQuiz(prev => ({
                            ...prev,
                            shuffleQuestions: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="shuffleOptions">Shuffle Options</Label>
                      <Switch
                        id="shuffleOptions"
                        checked={currentQuiz.shuffleOptions}
                        onCheckedChange={checked =>
                          setCurrentQuiz(prev => ({
                            ...prev,
                            shuffleOptions: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="showCorrect">Show Correct Answers</Label>
                      <Switch
                        id="showCorrect"
                        checked={currentQuiz.showCorrectAnswers}
                        onCheckedChange={checked =>
                          setCurrentQuiz(prev => ({
                            ...prev,
                            showCorrectAnswers: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="showScore">Show Score Immediately</Label>
                      <Switch
                        id="showScore"
                        checked={currentQuiz.showScoreImmediately}
                        onCheckedChange={checked =>
                          setCurrentQuiz(prev => ({
                            ...prev,
                            showScoreImmediately: checked,
                          }))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card className="border-white/30 bg-white/80 shadow-xl backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-3">
                      <Button onClick={handleSaveQuiz} className="w-full">
                        <Save className="mr-2 h-4 w-4" />
                        Save Quiz
                      </Button>
                      <Button
                        onClick={createAssessmentFromQuiz}
                        variant="outline"
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Create Assessment
                      </Button>
                    </div>

                    <Button variant="outline" className="w-full">
                      <Play className="mr-2 h-4 w-4" />
                      Preview Quiz
                    </Button>

                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Export Quiz
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Quiz Library Tab */}
          <TabsContent value="library">
            <Card className="border-white/30 bg-white/80 shadow-xl backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Quiz Library</CardTitle>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search quizzes..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-64 pl-9"
                      />
                    </div>
                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  {filteredQuizzes.length === 0 ? (
                    <div className="py-12 text-center">
                      <Brain className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">No quizzes found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {filteredQuizzes.map(quiz => (
                          <motion.div
                            key={quiz.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="mb-2 flex items-center space-x-3">
                                  <h3 className="text-lg font-semibold">
                                    {quiz.title}
                                  </h3>
                                  <Badge
                                    variant={
                                      quiz.status === 'published'
                                        ? 'default'
                                        : quiz.status === 'draft'
                                          ? 'secondary'
                                          : 'outline'
                                    }
                                  >
                                    {quiz.status}
                                  </Badge>
                                  {quiz.generatedBy === 'ai' && (
                                    <Badge
                                      variant="outline"
                                      className="bg-purple-50 text-purple-700"
                                    >
                                      <Wand2 className="mr-1 h-3 w-3" />
                                      AI Generated
                                    </Badge>
                                  )}
                                </div>

                                <p className="mb-3 text-muted-foreground">
                                  {quiz.description}
                                </p>

                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <div className="flex items-center space-x-1">
                                    <BookOpen className="h-4 w-4" />
                                    <span>
                                      {quiz.questions.length} questions
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{quiz.timeLimit}min</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Users className="h-4 w-4" />
                                    <span>{quiz.passingScore}% to pass</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-4 w-4" />
                                    <span>{quiz.totalPoints} points</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setCurrentQuiz(quiz);
                                    setActiveTab('builder');
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteQuiz(quiz.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Question Bank Tab */}
          <TabsContent value="question-bank">
            <Card className="border-white/30 bg-white/80 shadow-xl backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Question Bank</CardTitle>
                  <Badge variant="secondary">
                    {questionBankQuestions.length} Questions
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  {questionBankQuestions.length === 0 ? (
                    <div className="py-12 text-center">
                      <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="mb-4 text-muted-foreground">
                        No questions in bank yet
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Create questions in Quiz Builder and save them to the
                        bank
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {questionBankQuestions.map((question, index) => (
                        <motion.div
                          key={question.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3 rounded-lg border bg-white p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">Q{index + 1}</Badge>
                              <Badge
                                className={
                                  question.difficulty === 'easy'
                                    ? 'bg-green-100 text-green-800'
                                    : question.difficulty === 'medium'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                }
                              >
                                {question.difficulty}
                              </Badge>
                              <Badge variant="secondary">
                                {
                                  questionTypes.find(
                                    t => t.value === question.questionType
                                  )?.label
                                }
                              </Badge>
                              <Badge variant="outline">
                                {question.points} pts
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div>
                            <p className="mb-1 text-sm font-medium text-muted-foreground">
                              Question:
                            </p>
                            <p className="text-sm">{question.questionText}</p>
                          </div>

                          {question.questionType === 'multiple_choice' &&
                            question.options && (
                              <div>
                                <p className="mb-1 text-sm font-medium text-muted-foreground">
                                  Options:
                                </p>
                                <div className="space-y-1">
                                  {question.options.choices?.map(
                                    (option: string, idx: number) => (
                                      <div
                                        key={idx}
                                        className="flex items-center space-x-2 text-sm"
                                      >
                                        <span className="text-muted-foreground">
                                          {String.fromCharCode(65 + idx)}.
                                        </span>
                                        <span>{option}</span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                          {question.tags && question.tags.length > 0 && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">
                                Tags:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {question.tags.map((tag, tagIdx) => (
                                  <Badge
                                    key={tagIdx}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments">
            <Card className="border-white/30 bg-white/80 shadow-xl backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Assessments</CardTitle>
                  <Badge variant="secondary">
                    {assessments.length} Assessments
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  {assessments.length === 0 ? (
                    <div className="py-12 text-center">
                      <ClipboardList className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="mb-4 text-muted-foreground">
                        No assessments created yet
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Create quizzes and convert them to assessments
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {assessments.map((assessment, index) => (
                        <motion.div
                          key={assessment.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3 rounded-lg border bg-white p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">A{index + 1}</Badge>
                              <Badge
                                className={
                                  assessment.status === 'published'
                                    ? 'bg-green-100 text-green-800'
                                    : assessment.status === 'draft'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-800'
                                }
                              >
                                {assessment.status}
                              </Badge>
                              <Badge variant="secondary">
                                {assessment.assessmentType}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold">
                              {assessment.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {assessment.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {assessment.timeLimit || 'No'} minute limit
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {assessment.questionsCount || 0} questions
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-muted-foreground" />
                              <span>{assessment.passingScore}% passing</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <BarChart3 className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {assessment.totalPoints || 0} total points
                              </span>
                            </div>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Created:{' '}
                            {new Date(
                              assessment.createdAt!
                            ).toLocaleDateString()}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="border-white/30 bg-white/80 shadow-xl backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Quiz Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statisticsData?.topPerformingQuizzes?.map(
                      (quiz, index) => (
                        <div
                          key={quiz.id}
                          className="flex items-center space-x-4 rounded-lg bg-muted/30 p-3"
                        >
                          <div className="text-lg font-bold text-muted-foreground">
                            #{index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{quiz.title}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>Avg: {quiz.averageScore}%</span>
                              <span>Completion: {quiz.completionRate}%</span>
                            </div>
                          </div>
                          <Badge>{quiz.averageScore}%</Badge>
                        </div>
                      )
                    ) || (
                      <p className="text-muted-foreground">
                        No performance data available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/30 bg-white/80 shadow-xl backdrop-blur-xl">
                <CardHeader>
                  <CardTitle>Question Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statisticsData?.questionTypeDistribution?.map(
                      (type, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">
                              {type.type.replace('_', ' ')}
                            </span>
                            <span>{type.percentage}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-blue-500"
                              style={{ width: `${type.percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {type.count} questions
                          </p>
                        </div>
                      )
                    ) || (
                      <p className="text-muted-foreground">
                        No distribution data available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
