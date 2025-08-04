'use client';

import React, { useState, useCallback } from 'react';
import {
  Trash2,
  UserX,
  UserCheck,
  Shield,
  AlertTriangle,
  Clock,
  Loader2,
} from 'lucide-react';
import { useGetBulkOperationStatusQuery } from '@/lib/redux/api/user-management-api';
import { Role } from '@/types/user-management';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

interface BulkOperationsPanelProps {
  selectedUsers: string[];
  onClose: () => void;
  onExecute: (action: string, data?: any) => Promise<void>;
  roles: Role[];
}

interface BulkOperationConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'default' | 'destructive' | 'outline';
  requiresConfirmation: boolean;
  requiresInput?: boolean;
  dangerLevel: 'low' | 'medium' | 'high';
}

const BulkOperationsPanel: React.FC<BulkOperationsPanelProps> = ({
  selectedUsers,
  onClose,
  onExecute,
  roles,
}) => {
  const { toast } = useToast();

  // State management
  const [selectedOperation, setSelectedOperation] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [operationData, setOperationData] = useState<any>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentOperationId, setCurrentOperationId] = useState<string | null>(
    null
  );

  // Query for operation status when executing
  const { data: operationStatus, isLoading: statusLoading } =
    useGetBulkOperationStatusQuery(currentOperationId!, {
      skip: !currentOperationId,
      pollingInterval: currentOperationId ? 2000 : 0, // Poll every 2 seconds when tracking
    });

  // Available bulk operations
  const bulkOperations: BulkOperationConfig[] = [
    {
      id: 'activate',
      name: 'Activate Users',
      description: 'Activate selected user accounts',
      icon: UserCheck,
      variant: 'default',
      requiresConfirmation: true,
      dangerLevel: 'low',
    },
    {
      id: 'deactivate',
      name: 'Deactivate Users',
      description: 'Deactivate selected user accounts',
      icon: UserX,
      variant: 'outline',
      requiresConfirmation: true,
      dangerLevel: 'medium',
    },
    {
      id: 'suspend',
      name: 'Suspend Users',
      description: 'Suspend selected user accounts',
      icon: Clock,
      variant: 'destructive',
      requiresConfirmation: true,
      requiresInput: true,
      dangerLevel: 'high',
    },
    {
      id: 'assignRoles',
      name: 'Assign Roles',
      description: 'Assign roles to selected users',
      icon: Shield,
      variant: 'default',
      requiresConfirmation: true,
      requiresInput: true,
      dangerLevel: 'medium',
    },
    {
      id: 'removeRoles',
      name: 'Remove Roles',
      description: 'Remove roles from selected users',
      icon: Shield,
      variant: 'outline',
      requiresConfirmation: true,
      requiresInput: true,
      dangerLevel: 'medium',
    },
    {
      id: 'delete',
      name: 'Delete Users',
      description: 'Permanently delete selected user accounts',
      icon: Trash2,
      variant: 'destructive',
      requiresConfirmation: true,
      dangerLevel: 'high',
    },
  ];

  // Handlers
  const handleOperationSelect = useCallback((operationId: string) => {
    setSelectedOperation(operationId);
    setOperationData({});
  }, []);

  const handleExecuteOperation = useCallback(async () => {
    if (!selectedOperation) return;

    const operation = bulkOperations.find(op => op.id === selectedOperation);
    if (!operation) return;

    if (operation.requiresConfirmation) {
      setShowConfirmDialog(true);
      return;
    }

    await executeOperation();
  }, [selectedOperation, operationData]);

  const executeOperation = async () => {
    if (!selectedOperation) return;

    setIsExecuting(true);
    setShowConfirmDialog(false);

    try {
      let executionData: any = {};

      switch (selectedOperation) {
        case 'activate':
          executionData = { status: 'active' };
          await onExecute('updateStatus', executionData);
          break;
        case 'deactivate':
          executionData = { status: 'inactive' };
          await onExecute('updateStatus', executionData);
          break;
        case 'suspend':
          executionData = {
            status: 'suspended',
            reason: operationData.reason,
            duration: operationData.duration,
          };
          await onExecute('updateStatus', executionData);
          break;
        case 'assignRoles':
          executionData = { roleIds: operationData.roleIds };
          await onExecute('assignRoles', executionData);
          break;
        case 'removeRoles':
          executionData = { roleIds: operationData.roleIds };
          await onExecute('removeRoles', executionData);
          break;
        case 'delete':
          await onExecute('delete');
          break;
        default:
          break;
      }

      toast({
        title: 'Bulk operation completed',
        description: `Successfully executed ${selectedOperation} on ${selectedUsers.length} users`,
      });

      onClose();
    } catch (error) {
      toast({
        title: 'Bulk operation failed',
        description:
          error instanceof Error ? error.message : 'Operation failed',
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const renderOperationInputs = () => {
    const operation = bulkOperations.find(op => op.id === selectedOperation);
    if (!operation?.requiresInput) return null;

    switch (selectedOperation) {
      case 'suspend':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Suspension Reason</label>
              <Textarea
                value={operationData.reason || ''}
                onChange={e =>
                  setOperationData((prev: any) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
                placeholder="Enter reason for suspension..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Duration (days)</label>
              <Select
                value={operationData.duration?.toString() || ''}
                onValueChange={value =>
                  setOperationData((prev: any) => ({
                    ...prev,
                    duration: parseInt(value),
                  }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="0">Indefinite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'assignRoles':
      case 'removeRoles':
        return (
          <div>
            <label className="text-sm font-medium">Select Roles</label>
            <div className="mt-2 max-h-48 space-y-2 overflow-y-auto">
              {roles.map(role => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={role.id}
                    checked={(operationData.roleIds || []).includes(role.id)}
                    onCheckedChange={checked => {
                      const currentRoles = operationData.roleIds || [];
                      const newRoles = checked
                        ? [...currentRoles, role.id]
                        : currentRoles.filter((id: string) => id !== role.id);
                      setOperationData((prev: any) => ({
                        ...prev,
                        roleIds: newRoles,
                      }));
                    }}
                  />
                  <label
                    htmlFor={role.id}
                    className="cursor-pointer text-sm font-medium"
                  >
                    {role.name}
                  </label>
                  <Badge variant="outline" className="text-xs">
                    Level {role.hierarchy}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getOperationIcon = (operation: BulkOperationConfig) => {
    const IconComponent = operation.icon;
    return <IconComponent className="h-4 w-4" />;
  };

  const getDangerBadge = (dangerLevel: string) => {
    const config = {
      low: { variant: 'default' as const, text: 'Safe' },
      medium: { variant: 'secondary' as const, text: 'Caution' },
      high: { variant: 'destructive' as const, text: 'Dangerous' },
    };

    const { variant, text } = config[dangerLevel as keyof typeof config];
    return <Badge variant={variant}>{text}</Badge>;
  };

  const selectedOperationConfig = bulkOperations.find(
    op => op.id === selectedOperation
  );

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Operations</DialogTitle>
            <DialogDescription>
              Perform bulk actions on {selectedUsers.length} selected users
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Operation Selection */}
            <div>
              <label className="mb-3 block text-sm font-medium">
                Select Operation
              </label>
              <div className="grid grid-cols-2 gap-3">
                {bulkOperations.map(operation => (
                  <Card
                    key={operation.id}
                    className={`cursor-pointer transition-colors ${
                      selectedOperation === operation.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleOperationSelect(operation.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getOperationIcon(operation)}
                          <div>
                            <div className="text-sm font-medium">
                              {operation.name}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {operation.description}
                            </div>
                          </div>
                        </div>
                        {getDangerBadge(operation.dangerLevel)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Operation Inputs */}
            {selectedOperationConfig?.requiresInput && (
              <>
                <Separator />
                <div>
                  <h4 className="mb-3 font-medium">Operation Configuration</h4>
                  {renderOperationInputs()}
                </div>
              </>
            )}

            {/* Selected Users Summary */}
            <Separator />
            <div>
              <h4 className="mb-3 font-medium">
                Selected Users ({selectedUsers.length})
              </h4>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This operation will affect {selectedUsers.length} user
                  accounts.
                  {selectedOperationConfig?.dangerLevel === 'high' && (
                    <strong className="text-destructive">
                      {' '}
                      This action cannot be undone.
                    </strong>
                  )}
                </AlertDescription>
              </Alert>
            </div>

            {/* Operation Status */}
            {isExecuting && operationStatus && (
              <>
                <Separator />
                <div>
                  <h4 className="mb-3 font-medium">Operation Progress</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge
                        variant={
                          operationStatus.status === 'completed'
                            ? 'default'
                            : operationStatus.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {operationStatus.status}
                      </Badge>
                    </div>

                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>Progress:</span>
                        <span>
                          {operationStatus.processedItems}/
                          {operationStatus.totalItems}
                        </span>
                      </div>
                      <Progress value={operationStatus.progress} />
                    </div>

                    {operationStatus.failedItems > 0 && (
                      <div className="text-sm text-destructive">
                        {operationStatus.failedItems} items failed
                      </div>
                    )}

                    {operationStatus.errors.length > 0 && (
                      <div className="space-y-1 text-xs">
                        <span className="font-medium">Errors:</span>
                        {operationStatus.errors
                          .slice(0, 3)
                          .map((error, index) => (
                            <div key={index} className="text-destructive">
                              {error}
                            </div>
                          ))}
                        {operationStatus.errors.length > 3 && (
                          <div className="text-muted-foreground">
                            +{operationStatus.errors.length - 3} more errors
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isExecuting}>
              Cancel
            </Button>
            <Button
              onClick={handleExecuteOperation}
              disabled={!selectedOperation || isExecuting}
              variant={selectedOperationConfig?.variant || 'default'}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  {selectedOperationConfig &&
                    getOperationIcon(selectedOperationConfig)}
                  <span className="ml-2">Execute Operation</span>
                </>
              )}
            </Button>
          </DialogFooter>
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
              {selectedUsers.length} users?
            </DialogDescription>
          </DialogHeader>

          {selectedOperationConfig?.dangerLevel === 'high' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> This is a destructive operation that
                cannot be undone. Please make sure you have selected the correct
                users.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={executeOperation}
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

export { BulkOperationsPanel };
