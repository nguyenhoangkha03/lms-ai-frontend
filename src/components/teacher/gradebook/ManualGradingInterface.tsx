'use client';

import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Bot,
  FileText,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

import { AIGradingInterface } from '@/components/teacher/gradebook/AIGradingInterface';
import { useSubmitManualGradeMutation } from '@/lib/redux/api/gradebook-api';
import { ManualGradingSubmission } from '@/lib/types/gradebook';
import { useToast } from '@/hooks/use-toast';

interface ManualGradingInterfaceProps {
  submission: ManualGradingSubmission;
  onComplete: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  currentIndex: number;
  totalCount: number;
  onClose: () => void;
}

export function ManualGradingInterface({
  submission,
  onComplete,
  onNext,
  onPrevious,
  currentIndex,
  totalCount,
  onClose,
}: ManualGradingInterfaceProps) {
  const { toast } = useToast();
  const [submitManualGrade, { isLoading: isSubmitting }] =
    useSubmitManualGradeMutation();

  // Grading state
  const [activeTab, setActiveTab] = useState('grading');
  const [score, setScore] = useState<number>(submission.aiPreGrade?.score || 0);
  const [feedback, setFeedback] = useState('');
  const [useAIGrading, setUseAIGrading] = useState(!!submission.aiPreGrade);
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState('');

  // Auto-save timer
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [score, feedback, comments, rubricScores]);

  const handleSubmitGrade = async () => {
    try {
      const gradeData = {
        score,
        maxScore: 100, // This should come from assessment data
        percentage: (score / 100) * 100,
        overallFeedback: feedback,
        comments,
        rubricScores:
          Object.keys(rubricScores).length > 0 ? rubricScores : undefined,
        isAiGraded: useAIGrading,
        aiConfidence: submission.aiPreGrade?.confidence,
      };

      await submitManualGrade({
        attemptId: submission.id,
        grade: gradeData,
      }).unwrap();

      toast({
        title: 'Grade Submitted',
        description: 'Grade has been successfully submitted and saved.',
      });

      setHasUnsavedChanges(false);
      onComplete();
    } catch (error) {
      toast({
        title: 'Submit Failed',
        description: 'Failed to submit grade. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAIGradeAccept = (
    aiScore: number,
    aiFeedback: string,
    aiData: any
  ) => {
    setScore(aiScore);
    setFeedback(aiFeedback);
    setUseAIGrading(true);
    setActiveTab('grading');
  };

  const renderSubmissionContent = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Student Submission
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submission.attachments.length > 0 ? (
            <div className="space-y-4">
              <div>
                <Label>Submitted Files</Label>
                <div className="mt-2 grid gap-2">
                  {submission.attachments.map((file: any) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {file.type} • {(file.size / 1024 / 1024).toFixed(2)}{' '}
                          MB
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                No files submitted for this assignment
              </p>
            </div>
          )}

          {/* Previous Grades (if any) */}
          {submission.previousGrades &&
            submission.previousGrades.length > 0 && (
              <div className="mt-6">
                <Label>Previous Grading History</Label>
                <div className="mt-2 space-y-2">
                  {submission.previousGrades.map(
                    (prevGrade: any, index: any) => (
                      <div key={index} className="rounded-lg border p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-medium">
                            Grade: {prevGrade.score}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(prevGrade.gradedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{prevGrade.feedback}</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
        </CardContent>
      </Card>
    );
  };

  const renderGradingForm = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Grade Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Input */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="score">Score</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="100"
                  value={score}
                  onChange={e => setScore(parseFloat(e.target.value) || 0)}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">/ 100</span>
              </div>
            </div>
            <div>
              <Label>Percentage</Label>
              <div className="flex items-center gap-2">
                <Progress value={score} className="flex-1" />
                <span className="w-12 text-sm font-medium">
                  {score.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* AI Pre-grade Info */}
          {submission.aiPreGrade && (
            <Card className="bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="pt-4">
                <div className="mb-2 flex items-center gap-2">
                  <Bot className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">
                    AI Pre-grade Available
                  </span>
                  <Badge variant="outline">
                    {(submission.aiPreGrade.confidence * 100).toFixed(1)}%
                    confidence
                  </Badge>
                </div>
                <div className="mb-3 text-sm text-muted-foreground">
                  Suggested score: {submission.aiPreGrade.score.toFixed(1)}
                </div>
                <div className="space-y-2">
                  {submission.aiPreGrade.suggestions.map(
                    (suggestion: any, index: any) => (
                      <div key={index} className="text-sm">
                        • {suggestion}
                      </div>
                    )
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    setScore(submission.aiPreGrade!.score);
                    setUseAIGrading(true);
                  }}
                >
                  Use AI Score
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Feedback */}
          <div>
            <Label htmlFor="feedback">Overall Feedback</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Provide detailed feedback for the student..."
              rows={6}
              className="mt-2"
            />
          </div>

          {/* Comments */}
          <div>
            <Label htmlFor="comments">Private Comments (Internal Only)</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={e => setComments(e.target.value)}
              placeholder="Add any internal notes or comments..."
              rows={3}
              className="mt-2"
            />
          </div>

          {/* Save Status */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
            </span>
            {lastSaved && (
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Manual Grading</h1>
                <p className="text-sm text-muted-foreground">
                  {currentIndex} of {totalCount} submissions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevious}
                disabled={!onPrevious}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onNext}
                disabled={!onNext}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button onClick={handleSubmitGrade} disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Submitting...' : 'Submit Grade'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Student Info Bar */}
      <div className="border-b bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">{submission.studentName}</h2>
                <p className="text-sm text-muted-foreground">
                  {submission.queueInfo?.assessmentTitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Submitted:{' '}
                {new Date(submission.submittedAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Est. time: {submission.estimatedGradingTime}m
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList>
            <TabsTrigger value="submission">Submission</TabsTrigger>
            <TabsTrigger value="grading">Manual Grading</TabsTrigger>
            {submission.aiPreGrade && (
              <TabsTrigger value="ai-grading">AI Grading</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="submission">
            {renderSubmissionContent()}
          </TabsContent>

          <TabsContent value="grading">{renderGradingForm()}</TabsContent>

          {submission.aiPreGrade && (
            <TabsContent value="ai-grading">
              <AIGradingInterface
                submissionText="Sample submission content" // This should come from actual submission
                assessmentType="essay"
                maxScore={100}
                onGradeAccept={handleAIGradeAccept}
                onCancel={() => setActiveTab('grading')}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
