'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  useGetModerationHistoryQuery,
  useTakeModerationActionMutation,
  useReviewModerationAppealMutation,
} from '@/lib/redux/api/enhanced-chat-api';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Shield,
  AlertTriangle,
  Ban,
  Clock,
  MessageSquare,
  UserX,
  VolumeX,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  MoreVertical,
  User,
  Calendar,
  BarChart3,
  Gavel,
  ShieldCheck,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { ChatModeration } from '@/lib/types/chat';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ModerationPanelProps {
  roomId: string;
}

type ActionType = 'warn' | 'mute' | 'kick' | 'ban' | 'delete_message';
type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export function ModerationPanel({ roomId }: ModerationPanelProps) {
  const { user } = useAuth();
  const [selectedAction, setSelectedAction] = useState<ActionType>('warn');
  const [targetUserId, setTargetUserId] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [actionDuration, setActionDuration] = useState(10);
  const [severity, setSeverity] = useState<SeverityLevel>('medium');
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModerationItem, setSelectedModerationItem] =
    useState<ChatModeration | null>(null);

  // API queries and mutations
  const {
    data: moderationHistory = [],
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useGetModerationHistoryQuery({ roomId });

  const [takeModerationAction, { isLoading: isTakingAction }] =
    useTakeModerationActionMutation();
  const [reviewAppeal] = useReviewModerationAppealMutation();

  // Check permissions
  const canModerate = user && ['teacher', 'admin'].includes(user.userType);

  // Filter moderation history
  const filteredHistory = moderationHistory.filter(item => {
    if (!searchTerm) return true;
    return (
      item.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.actionType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Moderation action templates
  const actionTemplates = {
    warn: [
      'Please follow room guidelines',
      'Inappropriate content warning',
      'Off-topic discussion warning',
      'Respectful communication reminder',
    ],
    mute: [
      'Excessive messaging',
      'Disruptive behavior',
      'Spam or flooding',
      'Inappropriate language',
    ],
    kick: [
      'Repeated violations',
      'Disruptive behavior',
      'Ignoring moderator warnings',
      'Inappropriate content sharing',
    ],
    ban: [
      'Severe policy violation',
      'Harassment or bullying',
      'Hate speech',
      'Repeated serious violations',
    ],
    delete_message: [
      'Spam content',
      'Inappropriate content',
      'Off-topic message',
      'Rule violation',
    ],
  };

  // Get action icon and color
  const getActionBadge = (actionType: string, severity: string) => {
    const severityColors = {
      low: 'bg-yellow-100 text-yellow-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800',
      critical: 'bg-purple-100 text-purple-800',
    };

    const actionIcons = {
      warn: AlertTriangle,
      mute: VolumeX,
      kick: UserX,
      ban: Ban,
      delete_message: MessageSquare,
      edit_message: MessageSquare,
    };

    const Icon = actionIcons[actionType as keyof typeof actionIcons] || Shield;
    const colorClass =
      severityColors[severity as keyof typeof severityColors] ||
      'bg-gray-100 text-gray-800';

    return (
      <Badge className={cn('flex items-center space-x-1', colorClass)}>
        <Icon className="h-3 w-3" />
        <span className="capitalize">{actionType.replace('_', ' ')}</span>
      </Badge>
    );
  };

  // Handle taking moderation action
  const handleTakeAction = async () => {
    if (!canModerate || !targetUserId.trim() || !actionReason.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await takeModerationAction({
        roomId,
        userId: targetUserId.trim(),
        actionType: selectedAction,
        reason: actionReason.trim(),
        duration: ['mute', 'ban'].includes(selectedAction)
          ? actionDuration
          : undefined,
        severity,
      }).unwrap();

      toast.success(
        `${selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)} action taken successfully`
      );

      // Reset form
      setTargetUserId('');
      setActionReason('');
      setShowActionDialog(false);
      setShowConfirmDialog(false);

      // Refresh history
      refetchHistory();
    } catch (error) {
      toast.error('Failed to take moderation action');
    }
  };

  // Handle appeal review
  const handleReviewAppeal = async (
    moderationId: string,
    status: 'approved' | 'rejected',
    notes?: string
  ) => {
    try {
      await reviewAppeal({
        moderationId,
        status,
        reviewNotes: notes,
      }).unwrap();

      toast.success(`Appeal ${status} successfully`);
      refetchHistory();
    } catch (error) {
      toast.error('Failed to review appeal');
    }
  };

  // Quick action buttons
  const quickActions = [
    { type: 'warn', label: 'Warn', icon: AlertTriangle, color: 'yellow' },
    { type: 'mute', label: 'Mute', icon: VolumeX, color: 'orange' },
    { type: 'kick', label: 'Kick', icon: UserX, color: 'red' },
    { type: 'ban', label: 'Ban', icon: Ban, color: 'purple' },
  ];

  if (!canModerate) {
    return (
      <div className="flex h-64 items-center justify-center p-4 text-center">
        <div>
          <Shield className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h4 className="mb-2 text-lg font-medium text-gray-900">
            Access Restricted
          </h4>
          <p className="text-gray-600">
            You don't have permission to access moderation tools.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Moderation Panel</h3>
          </div>

          {/* Quick Actions */}
          <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Gavel className="mr-1 h-4 w-4" />
                Take Action
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Take Moderation Action</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Action Type */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Action Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map(action => {
                      const Icon = action.icon;
                      return (
                        <Button
                          key={action.type}
                          variant={
                            selectedAction === action.type
                              ? 'default'
                              : 'outline'
                          }
                          onClick={() =>
                            setSelectedAction(action.type as ActionType)
                          }
                          className="justify-start"
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {action.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Target User */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Target User ID
                  </label>
                  <Input
                    placeholder="Enter user ID or username"
                    value={targetUserId}
                    onChange={e => setTargetUserId(e.target.value)}
                  />
                </div>

                {/* Severity */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Severity Level
                  </label>
                  <Select
                    value={severity}
                    onValueChange={(value: SeverityLevel) => setSeverity(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Minor violation</SelectItem>
                      <SelectItem value="medium">
                        Medium - Moderate violation
                      </SelectItem>
                      <SelectItem value="high">
                        High - Serious violation
                      </SelectItem>
                      <SelectItem value="critical">
                        Critical - Severe violation
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration (for timed actions) */}
                {['mute', 'ban'].includes(selectedAction) && (
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Duration (
                      {selectedAction === 'mute' ? 'minutes' : 'hours'})
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={actionDuration}
                      onChange={e =>
                        setActionDuration(parseInt(e.target.value) || 1)
                      }
                    />
                  </div>
                )}

                {/* Reason */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Reason
                  </label>
                  <Textarea
                    placeholder="Explain the reason for this action..."
                    value={actionReason}
                    onChange={e => setActionReason(e.target.value)}
                    rows={3}
                  />

                  {/* Quick reason templates */}
                  <div className="mt-2">
                    <p className="mb-2 text-xs text-gray-600">
                      Quick templates:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {actionTemplates[selectedAction]?.map(
                        (template, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => setActionReason(template)}
                          >
                            {template}
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowActionDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={!targetUserId.trim() || !actionReason.trim()}
                  >
                    Take Action
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Search moderation history..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="history" className="flex h-full flex-col">
          <TabsList className="mx-4 mt-2 grid w-full grid-cols-3">
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="appeals">Appeals</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          {/* Moderation History */}
          <TabsContent value="history" className="m-0 flex-1">
            <ScrollArea className="h-full">
              {isLoadingHistory ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center p-4 text-center">
                  <Shield className="mb-2 h-8 w-8 text-gray-400" />
                  <p className="text-gray-500">
                    No moderation actions recorded
                  </p>
                </div>
              ) : (
                <div className="space-y-3 p-4">
                  {filteredHistory.map(item => (
                    <Card
                      key={item.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex flex-1 items-start space-x-3">
                            {/* User Avatar */}
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {item.userId.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>

                            {/* Action Details */}
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex items-center space-x-2">
                                {getActionBadge(item.actionType, item.severity)}
                                <span className="text-sm font-medium">
                                  User {item.userId}
                                </span>
                                <span className="text-xs text-gray-500">
                                  by Moderator {item.moderatorId}
                                </span>
                              </div>

                              <p className="mb-2 text-sm text-gray-700">
                                {item.reason}
                              </p>

                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {formatDistanceToNow(
                                      new Date(item.createdAt),
                                      { addSuffix: true }
                                    )}
                                  </span>
                                </span>

                                {item.duration && (
                                  <span className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {item.duration}{' '}
                                      {item.actionType === 'mute'
                                        ? 'minutes'
                                        : 'hours'}
                                    </span>
                                  </span>
                                )}

                                {item.expiresAt &&
                                  new Date(item.expiresAt) > new Date() && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Active
                                    </Badge>
                                  )}

                                {item.appealId && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs text-blue-600"
                                  >
                                    Appeal Submitted
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>

                              <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                View User Profile
                              </DropdownMenuItem>

                              {item.messageId && (
                                <DropdownMenuItem>
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Go to Message
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />

                              {item.isActive && (
                                <DropdownMenuItem className="text-orange-600">
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Revoke Action
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Appeals */}
          <TabsContent value="appeals" className="m-0 flex-1">
            <ScrollArea className="h-full">
              <div className="space-y-3 p-4">
                {/* Mock appeals data */}
                {[1, 2, 3].map(appealId => (
                  <Card
                    key={appealId}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center space-x-2">
                            <Badge className="bg-blue-100 text-blue-800">
                              Appeal #{appealId}
                            </Badge>
                            <Badge variant="outline">Pending Review</Badge>
                          </div>

                          <p className="mb-2 text-sm text-gray-700">
                            User appeals a ban action claiming it was unfair and
                            requests review.
                          </p>

                          <div className="text-xs text-gray-500">
                            Submitted 2 days ago • Original action: Ban (24
                            hours)
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleReviewAppeal(
                                `appeal-${appealId}`,
                                'rejected'
                              )
                            }
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleReviewAppeal(
                                `appeal-${appealId}`,
                                'approved'
                              )
                            }
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Statistics */}
          <TabsContent value="stats" className="m-0 flex-1">
            <ScrollArea className="h-full">
              <div className="space-y-6 p-4">
                {/* Overview Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Moderation Overview (Last 30 Days)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="rounded-lg bg-yellow-50 p-3 text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {
                            moderationHistory.filter(
                              m => m.actionType === 'warn'
                            ).length
                          }
                        </div>
                        <div className="text-sm text-yellow-700">Warnings</div>
                      </div>
                      <div className="rounded-lg bg-orange-50 p-3 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {
                            moderationHistory.filter(
                              m => m.actionType === 'mute'
                            ).length
                          }
                        </div>
                        <div className="text-sm text-orange-700">Mutes</div>
                      </div>
                      <div className="rounded-lg bg-red-50 p-3 text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {
                            moderationHistory.filter(
                              m => m.actionType === 'ban'
                            ).length
                          }
                        </div>
                        <div className="text-sm text-red-700">Bans</div>
                      </div>
                      <div className="rounded-lg bg-blue-50 p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.floor(Math.random() * 10)}
                        </div>
                        <div className="text-sm text-blue-700">Appeals</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Auto-Moderation Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-5 w-5" />
                      <span>Auto-Moderation Performance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Spam Detection Accuracy</span>
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-32 rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-green-600"
                              style={{ width: '94%' }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">94%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Toxicity Detection</span>
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-32 rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-blue-600"
                              style={{ width: '87%' }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">87%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">False Positive Rate</span>
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-32 rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-yellow-600"
                              style={{ width: '8%' }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">8%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5" />
                      <span>Moderation Trends</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between rounded bg-green-50 p-2">
                        <span>Violations decreased by 23% this week</span>
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between rounded bg-blue-50 p-2">
                        <span>Auto-moderation caught 89% of spam</span>
                        <Zap className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex items-center justify-between rounded bg-yellow-50 p-2">
                        <span>3 appeals pending review</span>
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Moderation Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to <strong>{selectedAction}</strong> user{' '}
              <strong>{targetUserId}</strong>?
              <br />
              <br />
              <strong>Reason:</strong> {actionReason}
              <br />
              {['mute', 'ban'].includes(selectedAction) && (
                <>
                  <strong>Duration:</strong> {actionDuration}{' '}
                  {selectedAction === 'mute' ? 'minutes' : 'hours'}
                  <br />
                </>
              )}
              <strong>Severity:</strong> {severity}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleTakeAction}
              disabled={isTakingAction}
            >
              {isTakingAction ? 'Taking Action...' : 'Confirm Action'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
