'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  User,
  Clock,
  FileText,
  Star,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  Eye,
  Calendar,
  BookOpen,
  Award,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  useGetManualGradingSubmissionQuery,
  useSubmitManualGradeMutation,
  useGetManualGradingQueueQuery,
} from '@/lib/redux/api/gradebook-api';

// Mock data - replace with actual API
const mockSubmission = {
  attemptId: '1',
  assignment: {
    id: '1',
    title: 'Calculus Problem Set',
    description: 'Solve the advanced calculus problems with detailed explanations',
    maxScore: 100,
    dueDate: '2024-03-15T23:59:59Z',
    course: 'Advanced Mathematics',
    instructor: 'Dr. John Smith',
  },
  student: {
    id: 'student-1',
    name: 'Alice Johnson',
    email: 'alice.johnson@university.edu',
    avatar: '',
    studentId: 'S2024001',
  },
  submission: {
    submittedAt: '2024-03-14T18:30:00Z',
    answers: [
      {
        questionId: '1',
        question: 'Find the derivative of f(x) = x³ + 2x² - 5x + 3',
        answer: "f'(x) = 3x² + 4x - 5",
        type: 'text',
        points: 25,
      },
      {
        questionId: '2',
        question: 'Calculate the integral of ∫(2x + 1)dx from 0 to 3',
        answer: 'The integral is [x² + x] from 0 to 3 = (9 + 3) - (0) = 12',
        type: 'text',
        points: 25,
      },
      {
        questionId: '3',
        question: 'Solve the limit: lim(x→0) (sin(x)/x)',
        answer: 'Using L\'Hôpital\'s rule: lim(x→0) (cos(x)/1) = cos(0) = 1',
        type: 'text',
        points: 25,
      },
      {
        questionId: '4',
        question: 'Find the area under the curve y = x² from x = 0 to x = 2',
        answer: '∫₀² x² dx = [x³/3]₀² = 8/3 - 0 = 8/3 square units',
        type: 'text',
        points: 25,
      },
    ],
    attachments: [
      { name: 'work_shown.pdf', url: '/work_shown.pdf', size: '2.1 MB' },
    ],
  },
  rubric: {
    criteria: [
      { name: 'Correctness', weight: 40, maxPoints: 40 },
      { name: 'Process/Method', weight: 30, maxPoints: 30 },
      { name: 'Clarity', weight: 20, maxPoints: 20 },
      { name: 'Completeness', weight: 10, maxPoints: 10 },
    ],
  },
  existingGrade: null,
};

export default function GradeAssignmentPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const [grades, setGrades] = useState<any>({});
  const [feedback, setFeedback] = useState<any>({});
  const [rubricScores, setRubricScores] = useState<any>({});
  const [overallFeedback, setOverallFeedback] = useState('');
  const [totalScore, setTotalScore] = useState(0);
  const [isPublished, setIsPublished] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [submitManualGrade] = useSubmitManualGradeMutation();

  const submission = mockSubmission;

  // Calculate total score when individual grades change
  useEffect(() => {
    const total = Object.values(grades).reduce((sum: number, score: any) => sum + (parseFloat(score) || 0), 0);
    setTotalScore(total);
  }, [grades]);

  // Handle individual question grade
  const updateQuestionGrade = (questionId: string, score: number) => {
    setGrades(prev => ({ ...prev, [questionId]: score }));
  };

  // Handle question feedback
  const updateQuestionFeedback = (questionId: string, comment: string) => {
    setFeedback(prev => ({ ...prev, [questionId]: comment }));
  };

  // Handle rubric scoring
  const updateRubricScore = (criterion: string, score: number) => {
    setRubricScores(prev => ({ ...prev, [criterion]: score }));
  };

  // Submit grade
  const handleSubmitGrade = async () => {
    setIsLoading(true);
    try {
      const feedbackArray = Object.entries(feedback).map(([questionId, comment]) => ({
        questionId,
        comment,
        isAiGenerated: false,
      }));

      await submitManualGrade({
        attemptId: submission.attemptId,
        grade: {
          studentId: submission.student.id,
          assessmentId: submission.assignment.id,
          attemptId: submission.attemptId,
          score: totalScore,
          maxScore: submission.assignment.maxScore,
          isPublished,
          overallFeedback,
          questionScores: grades,
          rubricScores,
        },
        feedback: feedbackArray,
      }).unwrap();

      toast({
        title: 'Grade Submitted',
        description: 'The grade has been submitted successfully.',
      });
      
      router.back();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit grade.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentQuestion = submission.submission.answers[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / submission.submission.answers.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                  Grade Assignment
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  {submission.assignment.title} • {submission.student.name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Badge variant={isPublished ? 'default' : 'secondary'}>
                {isPublished ? 'Will Publish' : 'Draft'}
              </Badge>
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button 
                onClick={handleSubmitGrade} 
                disabled={isLoading}
                className="bg-gradient-to-r from-orange-500 to-red-600"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Submitting...' : 'Submit Grade'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="border-b border-white/20 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Question {currentQuestionIndex + 1} of {submission.submission.answers.length}</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-1 mt-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Student Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Student Details */}
            <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Student</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={submission.student.avatar} />
                    <AvatarFallback>
                      {submission.student.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{submission.student.name}</p>
                    <p className="text-sm text-muted-foreground">{submission.student.studentId}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{submission.student.email}</p>
              </CardContent>
            </Card>

            {/* Assignment Info */}
            <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Assignment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold">{submission.assignment.title}</p>
                  <p className="text-sm text-muted-foreground">{submission.assignment.course}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Score:</span>
                    <Badge>{submission.assignment.maxScore} pts</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span>{new Date(submission.assignment.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Submitted:</span>
                    <span>{new Date(submission.submission.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score Summary */}
            <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {totalScore.toFixed(1)}
                  </div>
                  <div className="text-lg text-muted-foreground">
                    / {submission.assignment.maxScore}
                  </div>
                  <div className="mt-2">
                    <Badge variant={totalScore >= submission.assignment.maxScore * 0.9 ? 'default' : 
                                   totalScore >= submission.assignment.maxScore * 0.7 ? 'secondary' : 
                                   'destructive'}>
                      {((totalScore / submission.assignment.maxScore) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Publish Settings */}
            <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle>Publish Grade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="publish">Release to Student</Label>
                    <p className="text-xs text-muted-foreground">
                      Student will see this grade immediately
                    </p>
                  </div>
                  <Switch
                    id="publish"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Grading Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Question Navigation */}
            <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  <div className="flex space-x-2">
                    {submission.submission.answers.map((_, index) => (
                      <Button
                        key={index}
                        variant={index === currentQuestionIndex ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentQuestionIndex(index)}
                        className="w-10 h-10"
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(Math.min(submission.submission.answers.length - 1, currentQuestionIndex + 1))}
                    disabled={currentQuestionIndex === submission.submission.answers.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Current Question */}
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Question {currentQuestionIndex + 1}</span>
                    <Badge variant="outline">
                      {currentQuestion.points} points
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Question */}
                  <div>
                    <Label className="text-base font-semibold">Question</Label>
                    <div className="mt-2 p-4 bg-muted/30 rounded-lg">
                      <p>{currentQuestion.question}</p>
                    </div>
                  </div>

                  {/* Student Answer */}
                  <div>
                    <Label className="text-base font-semibold">Student Answer</Label>
                    <div className="mt-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="whitespace-pre-wrap">{currentQuestion.answer}</p>
                    </div>
                  </div>

                  {/* Scoring */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor={`score-${currentQuestion.questionId}`}>
                        Score (out of {currentQuestion.points})
                      </Label>
                      <Input
                        id={`score-${currentQuestion.questionId}`}
                        type="number"
                        min="0"
                        max={currentQuestion.points}
                        step="0.5"
                        value={grades[currentQuestion.questionId] || ''}
                        onChange={(e) => updateQuestionGrade(currentQuestion.questionId, parseFloat(e.target.value) || 0)}
                        placeholder={`0 - ${currentQuestion.points}`}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Quick Score</Label>
                      <div className="mt-2 flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuestionGrade(currentQuestion.questionId, currentQuestion.points)}
                        >
                          Full
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuestionGrade(currentQuestion.questionId, currentQuestion.points * 0.5)}
                        >
                          Half
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuestionGrade(currentQuestion.questionId, 0)}
                        >
                          Zero
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div>
                    <Label htmlFor={`feedback-${currentQuestion.questionId}`}>
                      Feedback for this question
                    </Label>
                    <Textarea
                      id={`feedback-${currentQuestion.questionId}`}
                      value={feedback[currentQuestion.questionId] || ''}
                      onChange={(e) => updateQuestionFeedback(currentQuestion.questionId, e.target.value)}
                      placeholder="Provide specific feedback for this answer..."
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Overall Feedback */}
            <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Overall Feedback</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={overallFeedback}
                  onChange={(e) => setOverallFeedback(e.target.value)}
                  placeholder="Provide overall feedback on the student's performance..."
                  rows={4}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Rubric Scoring */}
            <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Rubric Assessment</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submission.rubric.criteria.map((criterion) => (
                    <div key={criterion.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="font-medium">{criterion.name}</Label>
                        <span className="text-sm text-muted-foreground">
                          {rubricScores[criterion.name] || 0} / {criterion.maxPoints}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Input
                          type="number"
                          min="0"
                          max={criterion.maxPoints}
                          step="0.5"
                          value={rubricScores[criterion.name] || ''}
                          onChange={(e) => updateRubricScore(criterion.name, parseFloat(e.target.value) || 0)}
                          className="w-20"
                        />
                        <Progress 
                          value={((rubricScores[criterion.name] || 0) / criterion.maxPoints) * 100} 
                          className="flex-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Attachments */}
            {submission.submission.attachments.length > 0 && (
              <Card className="border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Student Attachments</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {submission.submission.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">{attachment.name}</p>
                            <p className="text-sm text-muted-foreground">{attachment.size}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}