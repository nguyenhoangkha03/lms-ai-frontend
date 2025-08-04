'use client';

import React, { useState } from 'react';
import {
  Check,
  X,
  Flag,
  AlertTriangle,
  FileText,
  Video,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BulkModerationPanelProps {
  selectedItems: string[];
  onClose: () => void;
  onExecute: (
    action: 'approve' | 'reject' | 'flag',
    reason?: string
  ) => Promise<void>;
}

interface BulkOperationConfig {
  id: 'approve' | 'reject' | 'flag';
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'default' | 'destructive' | 'outline';
  requiresReason: boolean;
  dangerLevel: 'low' | 'medium' | 'high';
}

const BulkModerationPanel: React.FC<BulkModerationPanelProps> = ({
  selectedItems,
  onClose,
  onExecute,
}) => {
  const { toast } = useToast();

  // State management
  const [selectedAction, setSelectedAction] = useState<
    'approve' | 'reject' | 'flag' | ''
  >('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [reason, setReason] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [operationProgress, setOperationProgress] = useState(0);

  // Available bulk operations
  const bulkOperations: BulkOperationConfig[] = [
    {
      id: 'approve',
      name: 'Approve All',
      description: 'Approve selected content items and make them visible',
      icon: Check,
      variant: 'default',
      requiresReason: false,
      dangerLevel: 'low',
    },
    {
      id: 'reject',
      name: 'Reject All',
      description: 'Reject selected content items and notify authors',
      icon: X,
      variant: 'destructive',
      requiresReason: true,
      dangerLevel: 'high',
    },
    {
      id: 'flag',
      name: 'Flag All',
      description: 'Flag selected content items for further review',
      icon: Flag,
      variant: 'outline',
      requiresReason: true,
      dangerLevel: 'medium',
    },
  ];

  // Handlers
  const handleActionSelect = (actionId: 'approve' | 'reject' | 'flag') => {
    setSelectedAction(actionId);
    setReason('');
  };

  const handleExecuteAction = () => {
    if (!selectedAction) return;

    const operation = bulkOperations.find(op => op.id === selectedAction);
    if (!operation) return;

    if (operation.requiresReason && !reason.trim()) {
      toast({
        title: 'Reason required',
        description: `Please provide a reason for ${operation.name.toLowerCase()}`,
        variant: 'destructive',
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmExecution = async () => {
    if (!selectedAction) return;

    setIsExecuting(true);
    setShowConfirmDialog(false);
    setOperationProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setOperationProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      await onExecute(selectedAction, reason.trim() || undefined);

      clearInterval(progressInterval);
      setOperationProgress(100);

      toast({
        title: 'Bulk operation completed',
        description: `Successfully ${selectedAction}d ${selectedItems.length} items`,
      });

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      toast({
        title: 'Bulk operation failed',
        description:
          error instanceof Error ? error.message : 'Operation failed',
        variant: 'destructive',
      });
      setIsExecuting(false);
      setOperationProgress(0);
    }
  };

  const getOperationIcon = (operation: BulkOperationConfig) => {
    const IconComponent = operation.icon;
    return <IconComponent className="h-4 w-4" />;
  };

  const getDangerBadge = (dangerLevel: string) => {
    const config = {
      low: {
        variant: 'default' as const,
        text: 'Safe',
        color: 'text-green-600',
      },
      medium: {
        variant: 'secondary' as const,
        text: 'Caution',
        color: 'text-yellow-600',
      },
      high: {
        variant: 'destructive' as const,
        text: 'Dangerous',
        color: 'text-red-600',
      },
    };

    const { variant, text, color } = config[dangerLevel as keyof typeof config];
    return (
      <Badge variant={variant} className={color}>
        {text}
      </Badge>
    );
  };

  const selectedOperationConfig = bulkOperations.find(
    op => op.id === selectedAction
  );

  // Mock data for selected items preview
  const getContentTypeIcon = (type: string) => {
    const icons = {
      course: FileText,
      lesson: Video,
      forum_post: MessageSquare,
      comment: MessageSquare,
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const mockSelectedItems = selectedItems.map((id, index) => ({
    id,
    title: `Content Item ${index + 1}`,
    type: ['course', 'lesson', 'forum_post'][index % 3],
    author: `Author ${index + 1}`,
    submittedAt: new Date(
      Date.now() - index * 24 * 60 * 60 * 1000
    ).toISOString(),
  }));

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>Bulk Moderation Actions</DialogTitle>
            <DialogDescription>
              Perform bulk moderation actions on {selectedItems.length} selected
              items
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-6 overflow-hidden">
            {/* Progress indicator when executing */}
            {isExecuting && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium text-blue-800">
                        Processing bulk operation...
                      </div>
                      <Progress value={operationProgress} className="mt-2" />
                      <div className="mt-1 text-sm text-blue-700">
                        {operationProgress}% complete
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Selection */}
            {!isExecuting && (
              <div>
                <Label className="mb-3 block text-sm font-medium">
                  Select Action
                </Label>
                <div className="grid grid-cols-1 gap-3">
                  {bulkOperations.map(operation => (
                    <Card
                      key={operation.id}
                      className={`cursor-pointer transition-colors ${
                        selectedAction === operation.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleActionSelect(operation.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`rounded-lg p-2 ${
                                operation.variant === 'destructive'
                                  ? 'bg-red-100'
                                  : operation.variant === 'default'
                                    ? 'bg-green-100'
                                    : 'bg-yellow-100'
                              }`}
                            >
                              {getOperationIcon(operation)}
                            </div>
                            <div>
                              <div className="font-medium">
                                {operation.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {operation.description}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getDangerBadge(operation.dangerLevel)}
                            {operation.requiresReason && (
                              <Badge variant="outline" className="text-xs">
                                Requires Reason
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Reason Input */}
            {!isExecuting && selectedOperationConfig?.requiresReason && (
              <div>
                <Label htmlFor="reason" className="text-sm font-medium">
                  Reason for {selectedOperationConfig.name} *
                </Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder={`Please provide a clear reason for ${selectedOperationConfig.name.toLowerCase()}...`}
                  className="mt-1"
                  rows={3}
                />
              </div>
            )}

            {/* Selected Items Preview */}
            {!isExecuting && (
              <div>
                <Label className="mb-3 block text-sm font-medium">
                  Selected Items ({selectedItems.length})
                </Label>
                <Card>
                  <CardContent className="p-4">
                    <div className="max-h-48 space-y-3 overflow-y-auto">
                      {mockSelectedItems.slice(0, 10).map((item, index) => {
                        const ContentIcon = getContentTypeIcon(item.type);
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 rounded-lg bg-muted/30 p-2"
                          >
                            <div className="rounded bg-muted p-1">
                              <ContentIcon className="h-3 w-3" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium">
                                {item.title}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {item.type} • by {item.author}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {item.type}
                            </Badge>
                          </div>
                        );
                      })}

                      {selectedItems.length > 10 && (
                        <div className="py-2 text-center text-sm text-muted-foreground">
                          ... and {selectedItems.length - 10} more items
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Warning for dangerous operations */}
            {!isExecuting &&
              selectedOperationConfig?.dangerLevel === 'high' && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Warning:</strong> This is a destructive operation
                    that will affect {selectedItems.length} items. Make sure you
                    have selected the correct items and provided a clear reason.
                  </AlertDescription>
                </Alert>
              )}
          </div>

          {!isExecuting && (
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleExecuteAction}
                disabled={
                  !selectedAction ||
                  (selectedOperationConfig?.requiresReason && !reason.trim())
                }
                variant={selectedOperationConfig?.variant || 'default'}
              >
                {selectedOperationConfig &&
                  getOperationIcon(selectedOperationConfig)}
                <span className="ml-2">
                  {selectedOperationConfig?.name || 'Execute Action'}
                </span>
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Bulk Operation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to{' '}
              {selectedOperationConfig?.name.toLowerCase()}{' '}
              {selectedItems.length} items?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This action will be applied to all {selectedItems.length}{' '}
                selected items and cannot be undone.
              </AlertDescription>
            </Alert>

            {reason && (
              <div>
                <Label className="text-sm font-medium">Reason:</Label>
                <p className="mt-1 rounded bg-muted p-2 text-sm text-muted-foreground">
                  {reason}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmExecution}
              variant={selectedOperationConfig?.variant || 'default'}
            >
              Confirm {selectedOperationConfig?.name}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BulkModerationPanel;
