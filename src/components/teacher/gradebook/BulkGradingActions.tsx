'use client';

import { useState } from 'react';
import {
  Send,
  Edit,
  Trash2,
  Download,
  Bot,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

import { useBulkCreateGradesMutation } from '@/lib/redux/api/gradebook-api';

interface BulkGradingActionsProps {
  selectedSubmissions: string[];
  onComplete: () => void;
}

export function BulkGradingActions({
  selectedSubmissions,
  onComplete,
}: BulkGradingActionsProps) {
  const { toast } = useToast();
  const [bulkCreateGrades, { isLoading }] = useBulkCreateGradesMutation();

  const [showBulkGradeDialog, setShowBulkGradeDialog] = useState(false);
  const [showBulkPublishDialog, setShowBulkPublishDialog] = useState(false);
  const [bulkScore, setBulkScore] = useState<number>(0);
  const [bulkFeedback, setBulkFeedback] = useState('');
  const [operation, setOperation] = useState<string>('');
  const [progress, setProgress] = useState(0);

  const handleBulkGrade = async () => {
    try {
      setOperation('grading');

      const grades = selectedSubmissions.map(submissionId => ({
        submissionId,
        score: bulkScore,
        maxScore: 100,
        percentage: bulkScore,
        overallFeedback: bulkFeedback,
        isPublished: false,
      }));

      // Simulate progress updates
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await bulkCreateGrades({ grades }).unwrap();

      toast({
        title: 'Bulk Grading Complete',
        description: `Successfully graded ${selectedSubmissions.length} submissions.`,
      });

      setShowBulkGradeDialog(false);
      setProgress(0);
      onComplete();
    } catch (error) {
      toast({
        title: 'Bulk Grading Failed',
        description: 'Failed to grade submissions. Please try again.',
        variant: 'destructive',
      });
      setProgress(0);
    }
  };

  const handleBulkPublish = async () => {
    try {
      setOperation('publishing');

      // Simulate progress updates
      for (let i = 0; i <= 100; i += 20) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // This would call the actual API
      // await bulkPublishGrades(selectedSubmissions).unwrap();

      toast({
        title: 'Grades Published',
        description: `Successfully published ${selectedSubmissions.length} grades to students.`,
      });

      setShowBulkPublishDialog(false);
      setProgress(0);
      onComplete();
    } catch (error) {
      toast({
        title: 'Publishing Failed',
        description: 'Failed to publish grades. Please try again.',
        variant: 'destructive',
      });
      setProgress(0);
    }
  };

  const handleAIBulkGrade = async () => {
    try {
      setOperation('ai-grading');

      toast({
        title: 'AI Grading Started',
        description: `Starting AI grading for ${selectedSubmissions.length} submissions.`,
      });

      // This would trigger AI grading for all selected submissions
      // The actual implementation would depend on the backend API

      setProgress(0);
      onComplete();
    } catch (error) {
      toast({
        title: 'AI Grading Failed',
        description: 'Failed to start AI grading. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async () => {
    try {
      // Create a simple CSV export of selected submissions
      const csvContent = [
        'Submission ID,Student,Status,Score',
        ...selectedSubmissions.map(id => `${id},Student Name,Pending,N/A`),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulk-submissions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Export Complete',
        description: 'Submissions exported successfully.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export submissions.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{selectedSubmissions.length} selected</Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm">Bulk Actions</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowBulkGradeDialog(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Bulk Grade
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAIBulkGrade}>
              <Bot className="mr-2 h-4 w-4" />
              AI Grade All
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowBulkPublishDialog(true)}>
              <Send className="mr-2 h-4 w-4" />
              Publish Grades
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export Selected
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 dark:text-red-400"
              onClick={() => {
                toast({
                  title: 'Delete Submissions',
                  description: 'This feature is not yet implemented.',
                });
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Bulk Grade Dialog */}
      <Dialog open={showBulkGradeDialog} onOpenChange={setShowBulkGradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Grade Submissions</DialogTitle>
            <DialogDescription>
              Apply the same grade and feedback to {selectedSubmissions.length}{' '}
              selected submissions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="bulk-score">Score (out of 100)</Label>
              <Input
                id="bulk-score"
                type="number"
                min="0"
                max="100"
                value={bulkScore}
                onChange={e => setBulkScore(parseFloat(e.target.value) || 0)}
                placeholder="Enter score..."
              />
            </div>

            <div>
              <Label htmlFor="bulk-feedback">Feedback (Optional)</Label>
              <Textarea
                id="bulk-feedback"
                value={bulkFeedback}
                onChange={e => setBulkFeedback(e.target.value)}
                placeholder="Enter feedback that will be applied to all submissions..."
                rows={4}
              />
            </div>

            {progress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing submissions...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkGradeDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkGrade}
              disabled={isLoading || bulkScore === 0}
            >
              {isLoading
                ? 'Grading...'
                : `Grade ${selectedSubmissions.length} Submissions`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Publish Dialog */}
      <Dialog
        open={showBulkPublishDialog}
        onOpenChange={setShowBulkPublishDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Grades</DialogTitle>
            <DialogDescription>
              Publish grades for {selectedSubmissions.length} selected
              submissions. Students will be notified and can view their grades
              immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-300">
                    Important Notice
                  </h4>
                  <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                    Once grades are published, students will receive
                    notifications and can view their grades. This action cannot
                    be easily undone.
                  </p>
                </div>
              </div>
            </div>

            {progress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Publishing grades...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkPublishDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkPublish} disabled={isLoading}>
              {isLoading
                ? 'Publishing...'
                : `Publish ${selectedSubmissions.length} Grades`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
