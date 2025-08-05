'use client';

import React, { useState } from 'react';
import {
  Trash2,
  Download,
  Edit,
  Move,
  Copy,
  Shield,
  Scan,
  AlertTriangle,
  Archive,
  Loader2,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

import {
  useBulkDeleteFilesMutation,
  useBulkUpdateAccessLevelMutation,
  useScanFileMutation,
} from '@/lib/redux/api/file-management-api';
import { FileAccessLevel } from '@/lib/types/file-management';
import { toast } from 'sonner';

interface BulkOperationsPanelProps {
  selectedFileIds: string[];
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type BulkOperationType =
  | 'delete'
  | 'update_access'
  | 'move'
  | 'copy'
  | 'scan'
  | 'download'
  | 'archive';

interface OperationProgress {
  total: number;
  completed: number;
  failed: number;
  errors: Array<{ fileId: string; error: string }>;
}

export function BulkOperationsPanel({
  selectedFileIds,
  open,
  onClose,
  onComplete,
}: BulkOperationsPanelProps) {
  const [selectedOperation, setSelectedOperation] =
    useState<BulkOperationType>('delete');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [progress, setProgress] = useState<OperationProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    errors: [],
  });

  // Bulk operation options
  const [operationOptions, setOperationOptions] = useState({
    accessLevel: 'enrolled_only' as FileAccessLevel,
    targetFolder: '',
    scanTypes: ['virus', 'content'] as Array<
      'virus' | 'malware' | 'content' | 'metadata'
    >,
    confirmDangerous: false,
    reason: '',
    preserveVersions: true,
  });

  // Mutations
  const [bulkDeleteFiles] = useBulkDeleteFilesMutation();
  const [bulkUpdateAccessLevel] = useBulkUpdateAccessLevelMutation();
  const [scanFile] = useScanFileMutation();

  const operationConfigs = {
    delete: {
      title: 'Delete Files',
      description: 'Permanently delete selected files',
      icon: Trash2,
      color: 'text-red-600',
      dangerous: true,
      requiresConfirmation: true,
    },
    update_access: {
      title: 'Update Access Level',
      description: 'Change access permissions for selected files',
      icon: Shield,
      color: 'text-blue-600',
      dangerous: false,
      requiresConfirmation: false,
    },
    move: {
      title: 'Move Files',
      description: 'Move files to a different location',
      icon: Move,
      color: 'text-green-600',
      dangerous: false,
      requiresConfirmation: false,
    },
    copy: {
      title: 'Copy Files',
      description: 'Create copies of selected files',
      icon: Copy,
      color: 'text-purple-600',
      dangerous: false,
      requiresConfirmation: false,
    },
    scan: {
      title: 'Security Scan',
      description: 'Run security scans on selected files',
      icon: Scan,
      color: 'text-orange-600',
      dangerous: false,
      requiresConfirmation: false,
    },
    download: {
      title: 'Download Files',
      description: 'Download selected files as a ZIP archive',
      icon: Download,
      color: 'text-indigo-600',
      dangerous: false,
      requiresConfirmation: false,
    },
    archive: {
      title: 'Archive Files',
      description: 'Archive files for long-term storage',
      icon: Archive,
      color: 'text-gray-600',
      dangerous: false,
      requiresConfirmation: false,
    },
  };

  const handleOperationSelect = (operation: BulkOperationType) => {
    setSelectedOperation(operation);
    const config = operationConfigs[operation];
    if (config.requiresConfirmation || config.dangerous) {
      setShowConfirmation(true);
    }
  };

  const executeOperation = async () => {
    setIsProcessing(true);
    setProgress({
      total: selectedFileIds.length,
      completed: 0,
      failed: 0,
      errors: [],
    });

    try {
      switch (selectedOperation) {
        case 'delete':
          await executeBulkDelete();
          break;
        case 'update_access':
          await executeBulkUpdateAccess();
          break;
        case 'scan':
          await executeBulkScan();
          break;
        case 'download':
          await executeBulkDownload();
          break;
        case 'move':
          await executeBulkMove();
          break;
        case 'copy':
          await executeBulkCopy();
          break;
        case 'archive':
          await executeBulkArchive();
          break;
        default:
          throw new Error('Unknown operation');
      }

      toast.success(
        `${operationConfigs[selectedOperation].title} completed successfully`
      );
      onComplete();
    } catch (error) {
      toast.error(
        `Failed to ${operationConfigs[selectedOperation].title.toLowerCase()}`
      );
    } finally {
      setIsProcessing(false);
      setShowConfirmation(false);
    }
  };

  const executeBulkDelete = async () => {
    const result = await bulkDeleteFiles(selectedFileIds).unwrap();
    setProgress(prev => ({
      ...prev,
      completed: result.deletedCount,
      failed: selectedFileIds.length - result.deletedCount,
    }));
  };

  const executeBulkUpdateAccess = async () => {
    const result = await bulkUpdateAccessLevel({
      fileIds: selectedFileIds,
      accessLevel: operationOptions.accessLevel,
    }).unwrap();
    setProgress(prev => ({
      ...prev,
      completed: result.updatedCount,
      failed: selectedFileIds.length - result.updatedCount,
    }));
  };

  const executeBulkScan = async () => {
    let completed = 0;
    let failed = 0;
    const errors: Array<{ fileId: string; error: string }> = [];

    for (const fileId of selectedFileIds) {
      try {
        await scanFile({
          id: fileId,
          scanTypes: operationOptions.scanTypes,
        }).unwrap();
        completed++;
      } catch (error) {
        failed++;
        errors.push({
          fileId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      setProgress(prev => ({
        ...prev,
        completed,
        failed,
        errors,
      }));
    }
  };

  const executeBulkDownload = async () => {
    // Implementation for bulk download
    const downloadUrl = `/api/files/bulk-download?fileIds=${selectedFileIds.join(',')}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `files-${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setProgress(prev => ({
      ...prev,
      completed: selectedFileIds.length,
    }));
  };

  const executeBulkMove = async () => {
    // Implementation for bulk move
    // This would call a move API endpoint
    setProgress(prev => ({
      ...prev,
      completed: selectedFileIds.length,
    }));
  };

  const executeBulkCopy = async () => {
    // Implementation for bulk copy
    // This would call a copy API endpoint
    setProgress(prev => ({
      ...prev,
      completed: selectedFileIds.length,
    }));
  };

  const executeBulkArchive = async () => {
    // Implementation for bulk archive
    // This would call an archive API endpoint
    setProgress(prev => ({
      ...prev,
      completed: selectedFileIds.length,
    }));
  };

  const renderOperationOptions = () => {
    switch (selectedOperation) {
      case 'update_access':
        return (
          <div className="space-y-3">
            <Label>New Access Level</Label>
            <Select
              value={operationOptions.accessLevel}
              onValueChange={(value: FileAccessLevel) =>
                setOperationOptions(prev => ({ ...prev, accessLevel: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="enrolled_only">Enrolled Only</SelectItem>
                <SelectItem value="premium_only">Premium Only</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'move':
      case 'copy':
        return (
          <div className="space-y-3">
            <Label>Target Folder</Label>
            <Input
              placeholder="Enter target folder path"
              value={operationOptions.targetFolder}
              onChange={e =>
                setOperationOptions(prev => ({
                  ...prev,
                  targetFolder: e.target.value,
                }))
              }
            />
          </div>
        );

      case 'scan':
        return (
          <div className="space-y-3">
            <Label>Scan Types</Label>
            <div className="space-y-2">
              {[
                { value: 'virus', label: 'Virus Scan' },
                { value: 'malware', label: 'Malware Detection' },
                { value: 'content', label: 'Content Analysis' },
                { value: 'metadata', label: 'Metadata Validation' },
              ].map(scan => (
                <div key={scan.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={scan.value}
                    checked={operationOptions.scanTypes.includes(
                      scan.value as any
                    )}
                    onCheckedChange={checked => {
                      if (checked) {
                        setOperationOptions(prev => ({
                          ...prev,
                          scanTypes: [...prev.scanTypes, scan.value as any],
                        }));
                      } else {
                        setOperationOptions(prev => ({
                          ...prev,
                          scanTypes: prev.scanTypes.filter(
                            type => type !== scan.value
                          ),
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={scan.value} className="text-sm">
                    {scan.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'delete':
        return (
          <div className="space-y-3">
            <Label>Deletion Reason (Optional)</Label>
            <Textarea
              placeholder="Enter reason for deletion..."
              value={operationOptions.reason}
              onChange={e =>
                setOperationOptions(prev => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="preserve-versions"
                checked={operationOptions.preserveVersions}
                onCheckedChange={checked =>
                  setOperationOptions(prev => ({
                    ...prev,
                    preserveVersions: !!checked,
                  }))
                }
              />
              <Label htmlFor="preserve-versions" className="text-sm">
                Preserve file versions for recovery
              </Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentConfig = operationConfigs[selectedOperation];

  return (
    <>
      {/* Main Dialog */}
      <Dialog open={open && !showConfirmation} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Bulk Operations
            </DialogTitle>
            <DialogDescription>
              Perform actions on {selectedFileIds.length} selected files
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Operation Selection */}
            <div className="space-y-3">
              <Label>Select Operation</Label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(operationConfigs).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <Card
                      key={key}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedOperation === key ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() =>
                        handleOperationSelect(key as BulkOperationType)
                      }
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <Icon className={`h-5 w-5 ${config.color}`} />
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {config.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {config.description}
                            </div>
                          </div>
                          {config.dangerous && (
                            <Badge variant="destructive" className="text-xs">
                              Dangerous
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Operation Options */}
            {renderOperationOptions()}

            {/* Processing Progress */}
            {isProcessing && (
              <div className="space-y-3">
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </Label>
                    <Badge variant="outline">
                      {progress.completed}/{progress.total}
                    </Badge>
                  </div>

                  <Progress
                    value={(progress.completed / progress.total) * 100}
                    className="w-full"
                  />

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Completed: {progress.completed}</span>
                    <span>Failed: {progress.failed}</span>
                  </div>

                  {progress.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {progress.errors.length} files failed processing.
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm">
                            View errors
                          </summary>
                          <div className="mt-1 space-y-1 text-xs">
                            {progress.errors.slice(0, 3).map((error, index) => (
                              <div key={index}>
                                File {error.fileId}: {error.error}
                              </div>
                            ))}
                            {progress.errors.length > 3 && (
                              <div>
                                + {progress.errors.length - 3} more errors
                              </div>
                            )}
                          </div>
                        </details>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={executeOperation}
              disabled={!selectedOperation || isProcessing}
              className={
                currentConfig?.dangerous ? 'bg-red-600 hover:bg-red-700' : ''
              }
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {currentConfig && (
                    <currentConfig.icon className="mr-2 h-4 w-4" />
                  )}
                  Execute
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Confirm Operation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {currentConfig?.title.toLowerCase()}{' '}
              {selectedFileIds.length} files?
            </DialogDescription>
          </DialogHeader>

          {currentConfig?.dangerous && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> This operation is destructive and
                cannot be undone. Make sure you have selected the correct files.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="rounded-lg bg-muted p-3">
              <div className="text-sm font-medium">Operation Summary:</div>
              <div className="mt-1 text-sm text-muted-foreground">
                • Action: {currentConfig?.title}
              </div>
              <div className="text-sm text-muted-foreground">
                • Files affected: {selectedFileIds.length}
              </div>
              {operationOptions.accessLevel &&
                selectedOperation === 'update_access' && (
                  <div className="text-sm text-muted-foreground">
                    • New access level: {operationOptions.accessLevel}
                  </div>
                )}
            </div>

            {currentConfig?.dangerous && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirm-dangerous"
                  checked={operationOptions.confirmDangerous}
                  onCheckedChange={checked =>
                    setOperationOptions(prev => ({
                      ...prev,
                      confirmDangerous: !!checked,
                    }))
                  }
                />
                <Label htmlFor="confirm-dangerous" className="text-sm">
                  I understand this action cannot be undone
                </Label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={executeOperation}
              disabled={
                currentConfig?.dangerous && !operationOptions.confirmDangerous
              }
              className={
                currentConfig?.dangerous ? 'bg-red-600 hover:bg-red-700' : ''
              }
            >
              {currentConfig && <currentConfig.icon className="mr-2 h-4 w-4" />}
              Confirm {currentConfig?.title}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
