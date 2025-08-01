'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Save,
  Bot,
  User,
  Calendar,
  FileText,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

import {
  useGetGradeQuery,
  useUpdateGradeMutation,
  useGetFeedbackQuery,
} from '@/lib/redux/api/gradebook-api';

const gradeSchema = z.object({
  score: z.number().min(0),
  maxScore: z.number().min(1),
  overallFeedback: z.string().optional(),
  comments: z.string().optional(),
  isPublished: z.boolean(),
});

type GradeFormData = z.infer<typeof gradeSchema>;

interface GradeEditDialogProps {
  gradeId: string | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function GradeEditDialog({
  gradeId,
  open,
  onClose,
  onSuccess,
}: GradeEditDialogProps) {
  const { toast } = useToast();
  const [updateGrade, { isLoading: isUpdating }] = useUpdateGradeMutation();

  const { data: grade, isLoading } = useGetGradeQuery(gradeId || '', {
    skip: !gradeId,
  });

  const { data: feedbackData } = useGetFeedbackQuery(gradeId || '', {
    skip: !gradeId,
  });

  const form = useForm<GradeFormData>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      score: 0,
      maxScore: 100,
      overallFeedback: '',
      comments: '',
      isPublished: false,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (grade) {
      reset({
        score: grade.score,
        maxScore: grade.maxScore,
        overallFeedback: grade.overallFeedback || '',
        comments: grade.comments || '',
        isPublished: grade.isPublished,
      });
    }
  }, [grade, reset]);

  const onSubmit = async (data: GradeFormData) => {
    if (!gradeId) return;

    try {
      await updateGrade({
        id: gradeId,
        data: {
          ...data,
          percentage: (data.score / data.maxScore) * 100,
        },
      }).unwrap();

      toast({
        title: 'Grade Updated',
        description: 'Grade has been successfully updated.',
      });

      onSuccess();
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update grade. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const currentScore = watch('score');
  const maxScore = watch('maxScore');
  const percentage = maxScore ? (currentScore || 0 / maxScore) * 100 : 0;

  if (!open || !gradeId) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Grade</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : grade ? (
          <Tabs defaultValue="grade" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="grade">Grade</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* Grade Tab */}
            <TabsContent value="grade">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Student Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="h-4 w-4" />
                      Student Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Student ID
                        </Label>
                        <div className="font-medium">{grade.studentId}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Assessment ID
                        </Label>
                        <div className="font-medium">{grade.assessmentId}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Graded By
                        </Label>
                        <div className="font-medium">
                          {grade.graderId || 'Not assigned'}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">
                          Graded At
                        </Label>
                        <div className="font-medium">
                          {grade.gradedAt
                            ? new Date(grade.gradedAt).toLocaleString()
                            : 'Not graded'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Score Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Score</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label htmlFor="score">Points Earned</Label>
                        <Input
                          id="score"
                          type="number"
                          min="0"
                          step="0.1"
                          {...register('score', { valueAsNumber: true })}
                        />
                        {errors.score && (
                          <p className="text-sm text-red-500">
                            {errors.score.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="maxScore">Total Points</Label>
                        <Input
                          id="maxScore"
                          type="number"
                          min="1"
                          step="0.1"
                          {...register('maxScore', { valueAsNumber: true })}
                        />
                        {errors.maxScore && (
                          <p className="text-sm text-red-500">
                            {errors.maxScore.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>Percentage</Label>
                        <div className="flex h-10 items-center rounded-md border bg-muted px-3">
                          <span className="font-medium">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AI Grading Info */}
                    {grade.isAiGraded && (
                      <Card className="bg-blue-50 dark:bg-blue-900/20">
                        <CardContent className="pt-4">
                          <div className="mb-2 flex items-center gap-2">
                            <Bot className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">
                              AI Graded
                            </span>
                            {grade.aiConfidence && (
                              <Badge variant="outline">
                                {(grade.aiConfidence * 100).toFixed(1)}%
                                confidence
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            This grade was initially assigned by AI and may have
                            been manually reviewed.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>

                {/* Feedback Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Feedback</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="overallFeedback">
                        Overall Feedback (Visible to Student)
                      </Label>
                      <Textarea
                        id="overallFeedback"
                        {...register('overallFeedback')}
                        placeholder="Provide feedback for the student..."
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="comments">
                        Private Comments (Internal Only)
                      </Label>
                      <Textarea
                        id="comments"
                        {...register('comments')}
                        placeholder="Add internal notes or comments..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Publishing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Publishing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="isPublished">
                          Publish Grade to Student
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Students will be able to see this grade and feedback
                        </p>
                      </div>
                      <Switch
                        id="isPublished"
                        checked={watch('isPublished')}
                        onCheckedChange={checked =>
                          setValue('isPublished', checked)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUpdating}>
                    <Save className="mr-2 h-4 w-4" />
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Feedback Tab */}
            <TabsContent value="feedback">
              <div className="space-y-4">
                {feedbackData && feedbackData.length > 0 ? (
                  feedbackData.map(feedback => (
                    <Card key={feedback.id}>
                      <CardContent className="pt-4">
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{feedback.category}</Badge>
                            <Badge
                              variant={
                                feedback.severity === 'error'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {feedback.severity}
                            </Badge>
                            {feedback.isAiGenerated && (
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700"
                              >
                                <Bot className="mr-1 h-3 w-3" />
                                AI Generated
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(feedback.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <p className="mb-2 text-sm">{feedback.content}</p>

                        {feedback.suggestion && (
                          <div className="mt-3 rounded-lg bg-muted p-3">
                            <Label className="text-xs font-medium text-muted-foreground">
                              Suggestion:
                            </Label>
                            <p className="mt-1 text-sm">
                              {feedback.suggestion}
                            </p>
                          </div>
                        )}

                        {feedback.isMarkedHelpful && (
                          <div className="mt-2 flex items-center gap-1 text-green-600">
                            <MessageSquare className="h-3 w-3" />
                            <span className="text-xs">Marked as helpful</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">
                      No Feedback Available
                    </h3>
                    <p className="text-muted-foreground">
                      No detailed feedback has been provided for this grade yet.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Grade History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 rounded-lg border p-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="font-medium">Grade Created</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(grade.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {grade.updatedAt !== grade.createdAt && (
                        <div className="flex items-center gap-3 rounded-lg border p-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium">Last Updated</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(grade.updatedAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}

                      {grade.publishedAt && (
                        <div className="flex items-center gap-3 rounded-lg border p-3">
                          <MessageSquare className="h-4 w-4 text-green-500" />
                          <div className="flex-1">
                            <div className="font-medium">
                              Published to Student
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(grade.publishedAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}

                      {grade.reviewedAt && (
                        <div className="flex items-center gap-3 rounded-lg border p-3">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <div className="flex-1">
                            <div className="font-medium">Manually Reviewed</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(grade.reviewedAt).toLocaleString()}
                              {grade.reviewedBy && ` by ${grade.reviewedBy}`}
                            </div>
                            {grade.reviewComments && (
                              <div className="mt-1 text-sm">
                                {grade.reviewComments}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Grade not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
