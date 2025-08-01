'use client';

import { useState } from 'react';
import {
  MessageSquare,
  Bot,
  User,
  ThumbsUp,
  ThumbsDown,
  Plus,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

import {
  useGetFeedbackQuery,
  useAddFeedbackMutation,
  useRateFeedbackMutation,
} from '@/lib/redux/api/gradebook-api';

interface GradeFeedbackDialogProps {
  gradeId: string | null;
  open: boolean;
  onClose: () => void;
}

export function GradeFeedbackDialog({
  gradeId,
  open,
  onClose,
}: GradeFeedbackDialogProps) {
  const { toast } = useToast();
  const [addFeedback, { isLoading: isAdding }] = useAddFeedbackMutation();
  const [rateFeedback] = useRateFeedbackMutation();

  const { data: feedbackData, isLoading } = useGetFeedbackQuery(gradeId || '', {
    skip: !gradeId,
  });

  const [newFeedback, setNewFeedback] = useState('');
  const [newCategory, setNewCategory] = useState('content');
  const [newSeverity, setNewSeverity] = useState('info');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddFeedback = async () => {
    if (!gradeId || !newFeedback.trim()) return;

    try {
      await addFeedback({
        gradeId,
        category: newCategory as
          | 'content'
          | 'structure'
          | 'grammar'
          | 'logic'
          | 'creativity'
          | 'technical',
        severity: newSeverity as 'info' | 'suggestion' | 'warning' | 'error',
        content: newFeedback,
        isAiGenerated: false,
      }).unwrap();

      toast({
        title: 'Feedback Added',
        description: 'New feedback has been added successfully.',
      });

      setNewFeedback('');
      setShowAddForm(false);
    } catch (error) {
      toast({
        title: 'Failed to Add Feedback',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRateFeedback = async (feedbackId: string, helpful: boolean) => {
    try {
      await rateFeedback({
        id: feedbackId,
        rating: helpful ? 5 : 1,
      }).unwrap();

      toast({
        title: 'Feedback Rated',
        description: 'Thank you for rating this feedback.',
      });
    } catch (error) {
      toast({
        title: 'Rating Failed',
        description: 'Failed to rate feedback.',
        variant: 'destructive',
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'content':
        return 'bg-blue-100 text-blue-800';
      case 'structure':
        return 'bg-green-100 text-green-800';
      case 'grammar':
        return 'bg-yellow-100 text-yellow-800';
      case 'logic':
        return 'bg-purple-100 text-purple-800';
      case 'creativity':
        return 'bg-pink-100 text-pink-800';
      case 'technical':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'suggestion':
        return 'outline';
      case 'info':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (!open || !gradeId) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Grade Feedback
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Feedback</TabsTrigger>
              <TabsTrigger value="ai">AI Generated</TabsTrigger>
              <TabsTrigger value="manual">Manual</TabsTrigger>
            </TabsList>

            <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Feedback
            </Button>
          </div>

          {/* Add Feedback Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add New Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Category</Label>
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="content">Content</SelectItem>
                        <SelectItem value="structure">Structure</SelectItem>
                        <SelectItem value="grammar">Grammar</SelectItem>
                        <SelectItem value="logic">Logic</SelectItem>
                        <SelectItem value="creativity">Creativity</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Severity</Label>
                    <Select value={newSeverity} onValueChange={setNewSeverity}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="suggestion">Suggestion</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Feedback Content</Label>
                  <Textarea
                    value={newFeedback}
                    onChange={e => setNewFeedback(e.target.value)}
                    placeholder="Enter detailed feedback..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleAddFeedback}
                    disabled={isAdding || !newFeedback.trim()}
                  >
                    {isAdding ? 'Adding...' : 'Add Feedback'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Feedback */}
          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            ) : feedbackData && feedbackData.length > 0 ? (
              feedbackData.map(feedback => (
                <Card key={feedback.id}>
                  <CardContent className="pt-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(feedback.category)}>
                          {feedback.category}
                        </Badge>
                        <Badge variant={getSeverityColor(feedback.severity)}>
                          {feedback.severity}
                        </Badge>
                        {feedback.isAiGenerated && (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700"
                          >
                            <Bot className="mr-1 h-3 w-3" />
                            AI
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(feedback.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="mb-3">{feedback.content}</p>

                    {feedback.suggestion && (
                      <div className="mb-3 rounded-lg bg-muted p-3">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Suggestion:
                        </Label>
                        <p className="mt-1 text-sm">{feedback.suggestion}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRateFeedback(feedback.id, true)}
                        >
                          <ThumbsUp className="mr-1 h-4 w-4" />
                          Helpful
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRateFeedback(feedback.id, false)}
                        >
                          <ThumbsDown className="mr-1 h-4 w-4" />
                          Not helpful
                        </Button>
                      </div>

                      {feedback.helpfulnessRating && (
                        <Badge variant="outline">
                          Rating: {feedback.helpfulnessRating}/5
                        </Badge>
                      )}
                    </div>
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
                  No feedback has been provided for this grade yet.
                </p>
              </div>
            )}
          </TabsContent>

          {/* AI Generated Feedback */}
          <TabsContent value="ai" className="space-y-4">
            {feedbackData
              ?.filter(f => f.isAiGenerated)
              .map(feedback => (
                <Card key={feedback.id}>
                  <CardContent className="pt-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-blue-500" />
                        <Badge className={getCategoryColor(feedback.category)}>
                          {feedback.category}
                        </Badge>
                        {feedback.aiConfidence && (
                          <Badge variant="outline">
                            {(feedback.aiConfidence * 100).toFixed(1)}%
                            confidence
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(feedback.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="mb-3">{feedback.content}</p>

                    {feedback.suggestion && (
                      <div className="mb-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                        <Label className="text-xs font-medium text-blue-700 dark:text-blue-300">
                          AI Suggestion:
                        </Label>
                        <p className="mt-1 text-sm">{feedback.suggestion}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )) || (
              <div className="py-8 text-center">
                <Bot className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No AI Feedback</h3>
                <p className="text-muted-foreground">
                  No AI-generated feedback is available for this grade.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Manual Feedback */}
          <TabsContent value="manual" className="space-y-4">
            {feedbackData
              ?.filter(f => !f.isAiGenerated)
              .map(feedback => (
                <Card key={feedback.id}>
                  <CardContent className="pt-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-green-500" />
                        <Badge className={getCategoryColor(feedback.category)}>
                          {feedback.category}
                        </Badge>
                        <Badge variant={getSeverityColor(feedback.severity)}>
                          {feedback.severity}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(feedback.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="mb-3">{feedback.content}</p>

                    {feedback.suggestion && (
                      <div className="mb-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                        <Label className="text-xs font-medium text-green-700 dark:text-green-300">
                          Instructor Suggestion:
                        </Label>
                        <p className="mt-1 text-sm">{feedback.suggestion}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )) || (
              <div className="py-8 text-center">
                <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">
                  No Manual Feedback
                </h3>
                <p className="text-muted-foreground">
                  No manually added feedback is available for this grade.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
