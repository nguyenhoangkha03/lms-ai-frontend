'use client';

import { useState } from 'react';
import {
  Edit,
  Calculator,
  AlertTriangle,
  Users,
  TrendingUp,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface BulkGradingDialogProps {
  open: boolean;
  onClose: () => void;
  selectedGrades: string[];
  onSuccess: () => void;
}

export function BulkGradingDialog({
  open,
  onClose,
  selectedGrades,
  onSuccess,
}: BulkGradingDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('grade');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Form states
  const [bulkScore, setBulkScore] = useState<number>(0);
  const [bulkFeedback, setBulkFeedback] = useState('');
  const [adjustment, setAdjustment] = useState<number>(0);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'multiply'>(
    'add'
  );

  const handleBulkGrade = async () => {
    setIsProcessing(true);

    try {
      // Simulate processing with progress updates
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      toast({
        title: 'Bulk Grading Complete',
        description: `Successfully updated ${selectedGrades.length} grades.`,
      });

      setProgress(0);
      setIsProcessing(false);
      onSuccess();
    } catch (error) {
      toast({
        title: 'Bulk Grading Failed',
        description: 'Failed to update grades. Please try again.',
        variant: 'destructive',
      });
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleBulkAdjustment = async () => {
    setIsProcessing(true);

    try {
      // Simulate processing
      for (let i = 0; i <= 100; i += 20) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      toast({
        title: 'Grade Adjustment Complete',
        description: `Applied ${adjustmentType === 'add' ? '+' : '×'}${adjustment} to ${selectedGrades.length} grades.`,
      });

      setProgress(0);
      setIsProcessing(false);
      onSuccess();
    } catch (error) {
      toast({
        title: 'Adjustment Failed',
        description: 'Failed to adjust grades. Please try again.',
        variant: 'destructive',
      });
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleCurveGrades = async () => {
    setIsProcessing(true);

    try {
      // Simulate curve calculation
      for (let i = 0; i <= 100; i += 15) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast({
        title: 'Grade Curve Applied',
        description: `Applied curve to ${selectedGrades.length} grades.`,
      });

      setProgress(0);
      setIsProcessing(false);
      onSuccess();
    } catch (error) {
      toast({
        title: 'Curve Failed',
        description: 'Failed to apply curve. Please try again.',
        variant: 'destructive',
      });
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Grade Operations
          </DialogTitle>
          <DialogDescription>
            Perform bulk operations on {selectedGrades.length} selected grades.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="grade">Set Grade</TabsTrigger>
            <TabsTrigger value="adjust">Adjust Grades</TabsTrigger>
            <TabsTrigger value="curve">Apply Curve</TabsTrigger>
          </TabsList>

          {/* Set Grade Tab */}
          <TabsContent value="grade" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Set Same Grade for All
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bulk-score">Score (out of 100)</Label>
                  <Input
                    id="bulk-score"
                    type="number"
                    min="0"
                    max="100"
                    value={bulkScore}
                    onChange={e =>
                      setBulkScore(parseFloat(e.target.value) || 0)
                    }
                    placeholder="Enter score..."
                  />
                </div>

                <div>
                  <Label htmlFor="bulk-feedback">Feedback (Optional)</Label>
                  <Textarea
                    id="bulk-feedback"
                    value={bulkFeedback}
                    onChange={e => setBulkFeedback(e.target.value)}
                    placeholder="Enter feedback that will be applied to all selected grades..."
                    rows={4}
                  />
                </div>

                <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-300">
                        Warning
                      </h4>
                      <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                        This will overwrite the current scores for all{' '}
                        {selectedGrades.length} selected grades. This action
                        cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                {progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Processing grades...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleBulkGrade}
                    disabled={isProcessing || bulkScore === 0}
                    className="flex-1"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {isProcessing
                      ? 'Processing...'
                      : `Set Grade for ${selectedGrades.length} Students`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Adjust Grades Tab */}
          <TabsContent value="adjust" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Adjust Existing Grades
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Adjustment Type</Label>
                    <div className="mt-2 flex gap-2">
                      <Button
                        variant={
                          adjustmentType === 'add' ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => setAdjustmentType('add')}
                      >
                        Add Points
                      </Button>
                      <Button
                        variant={
                          adjustmentType === 'multiply' ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => setAdjustmentType('multiply')}
                      >
                        Multiply by Factor
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="adjustment">
                      {adjustmentType === 'add'
                        ? 'Points to Add'
                        : 'Multiplication Factor'}
                    </Label>
                    <Input
                      id="adjustment"
                      type="number"
                      step="0.1"
                      value={adjustment}
                      onChange={e =>
                        setAdjustment(parseFloat(e.target.value) || 0)
                      }
                      placeholder={
                        adjustmentType === 'add' ? 'e.g., 5' : 'e.g., 1.05'
                      }
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <h4 className="mb-2 font-medium text-blue-800 dark:text-blue-300">
                    Preview
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    {adjustmentType === 'add'
                      ? `All selected grades will have ${adjustment} points added to them.`
                      : `All selected grades will be multiplied by ${adjustment}.`}
                  </p>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                    Example: 85 →{' '}
                    {adjustmentType === 'add'
                      ? Math.min(100, 85 + adjustment)
                      : Math.min(100, 85 * adjustment)}
                  </p>
                </div>

                {progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Adjusting grades...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                <Button
                  onClick={handleBulkAdjustment}
                  disabled={isProcessing || adjustment === 0}
                  className="w-full"
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  {isProcessing
                    ? 'Processing...'
                    : `Apply Adjustment to ${selectedGrades.length} Grades`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Curve Tab */}
          <TabsContent value="curve" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Apply Grade Curve</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                  <h4 className="mb-2 font-medium text-green-800 dark:text-green-300">
                    Automatic Curve
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    The system will automatically calculate and apply an
                    appropriate curve based on the distribution of selected
                    grades.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Current Average:</span>
                    <Badge variant="outline">76.5%</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Target Average:</span>
                    <Badge variant="outline">82.0%</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Suggested Adjustment:</span>
                    <Badge>+5.5 points</Badge>
                  </div>
                </div>

                {progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Calculating curve...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                <Button
                  onClick={handleCurveGrades}
                  disabled={isProcessing}
                  className="w-full"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  {isProcessing
                    ? 'Applying Curve...'
                    : `Apply Curve to ${selectedGrades.length} Grades`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
