'use client';

import React, { useState } from 'react';
import {
  Flag,
  AlertTriangle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Pin,
  PinOff,
  Trash2,
  User,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAppSelector } from '@/lib/redux/hooks';
import { forumApi } from '@/lib/redux/api/forum-api';

interface ReportDialogProps {
  targetId: string;
  targetType: 'thread' | 'post';
  targetTitle: string;
  onReport?: () => void;
}

interface ModerationAction {
  id: string;
  type: 'hide' | 'delete' | 'lock' | 'pin' | 'feature' | 'warn' | 'ban';
  reason: string;
  moderatorNotes?: string;
  duration?: number; // for temporary actions
  notifyUser?: boolean;
  escalate?: boolean;
}

interface Report {
  id: string;
  postId: string;
  reporterId: string;
  reason:
    | 'spam'
    | 'inappropriate'
    | 'harassment'
    | 'misinformation'
    | 'copyright'
    | 'other';
  details: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  handledBy?: string;
  handledAt?: string;
  moderatorNotes?: string;
  createdAt: string;
  reporter: {
    id: string;
    name: string;
    avatar?: string;
  };
  post: {
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
      avatar?: string;
    };
    thread: {
      id: string;
      title: string;
    };
  };
}

const REPORT_REASONS = [
  {
    value: 'spam',
    label: 'Spam or Self-promotion',
    description: 'Unwanted promotional content or repetitive posts',
  },
  {
    value: 'inappropriate',
    label: 'Inappropriate Content',
    description: 'Content that violates community guidelines',
  },
  {
    value: 'harassment',
    label: 'Harassment or Abuse',
    description: 'Personal attacks or targeted harassment',
  },
  {
    value: 'misinformation',
    label: 'Misinformation',
    description: 'False or misleading information',
  },
  {
    value: 'copyright',
    label: 'Copyright Violation',
    description: 'Unauthorized use of copyrighted material',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Other violations not listed above',
  },
];

const MODERATION_ACTIONS = [
  {
    value: 'hide',
    label: 'Hide Content',
    description: 'Hide content from public view',
    icon: <EyeOff className="h-4 w-4" />,
    severity: 'low',
  },
  {
    value: 'delete',
    label: 'Delete Content',
    description: 'Permanently remove content',
    icon: <Trash2 className="h-4 w-4" />,
    severity: 'high',
  },
  {
    value: 'lock',
    label: 'Lock Thread',
    description: 'Prevent new replies to thread',
    icon: <Lock className="h-4 w-4" />,
    severity: 'medium',
  },
  {
    value: 'warn',
    label: 'Warn User',
    description: 'Send warning message to user',
    icon: <AlertTriangle className="h-4 w-4" />,
    severity: 'low',
  },
  {
    value: 'ban',
    label: 'Ban User',
    description: 'Temporarily or permanently ban user',
    icon: <Shield className="h-4 w-4" />,
    severity: 'high',
  },
];

export function ReportDialog({
  targetId,
  targetType,
  targetTitle,
  onReport,
}: ReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [reportPost] = forumApi.useReportPostMutation();

  const handleSubmitReport = async () => {
    if (!reason) {
      toast(
        <div>
          <strong className="text-red-600">Error</strong>
          <p>Please select a reason for reporting.</p>
        </div>,
        {
          duration: 4000,
        }
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await reportPost({
        postId: targetId,
        reason: reason as any,
        details,
      }).unwrap();

      toast(
        <div>
          <strong className="text-green-600">Report submitted</strong>
          <p>
            Thank you for reporting. Our moderation team will review this
            content.
          </p>
        </div>,
        {
          duration: 4000,
        }
      );

      setIsOpen(false);
      setReason('');
      setDetails('');
      onReport?.();
    } catch (error: any) {
      toast(
        <div>
          <strong className="text-red-600">Error</strong>
          <p>
            {error.data?.message ||
              'Failed to submit report. Please try again.'}
          </p>
        </div>,
        {
          duration: 4000,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Flag className="mr-2 h-4 w-4" />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block text-sm font-medium">
              Why are you reporting this {targetType}?
            </Label>
            <div className="space-y-2">
              {REPORT_REASONS.map(reasonOption => (
                <div
                  key={reasonOption.value}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                    reason === reasonOption.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setReason(reasonOption.value)}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`h-4 w-4 rounded-full border-2 ${
                        reason === reasonOption.value
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {reason === reasonOption.value && (
                        <div className="h-full w-full scale-50 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {reasonOption.label}
                      </div>
                      <div className="text-xs text-gray-600">
                        {reasonOption.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium">
              Additional details (optional)
            </Label>
            <Textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Provide any additional context that might help our moderation team..."
              rows={3}
            />
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 text-yellow-600" />
              <div className="text-sm">
                <div className="mb-1 font-medium text-yellow-800">
                  Before reporting:
                </div>
                <div className="text-yellow-700">
                  Consider if this content actually violates our community
                  guidelines. False reports may affect your ability to report in
                  the future.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReport}
            disabled={!reason || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ModerationQueue() {
  const [activeTab, setActiveTab] = useState<'reports' | 'flagged' | 'history'>(
    'reports'
  );
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'reviewed'
  >('pending');

  const { data: reports, isLoading: reportsLoading } =
    forumApi.useGetModerationReportsQuery({
      status: statusFilter !== 'all' ? statusFilter : undefined,
    });
  const { data: moderationHistory } = forumApi.useGetModerationHistoryQuery({
    limit: 10,
  });

  const [handleReport] = forumApi.useHandleReportMutation();

  const handleReportAction = async (
    reportId: string,
    action: 'approve' | 'dismiss',
    notes?: string
  ) => {
    try {
      await handleReport({
        reportId,
        action,
        moderatorNotes: notes,
      }).unwrap();

      toast(
        <div>
          <strong className="text-green-600">Report handled</strong>
          <p>
            Report has been {action === 'approve' ? 'approved' : 'dismissed'}
          </p>
        </div>,
        {
          duration: 4000,
        }
      );
    } catch (error: any) {
      toast(
        <div>
          <strong className="text-red-600">Error</strong>
          <p>{error.data?.message || 'Failed to handle report.'}</p>
        </div>,
        {
          duration: 4000,
        }
      );
    }
  };

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Moderation Queue</h2>
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={value => setStatusFilter(value as any)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={value => setActiveTab(value as any)}
      >
        <TabsList>
          <TabsTrigger value="reports">
            Reports ({reports?.filter(r => r.status === 'pending').length || 0})
          </TabsTrigger>
          <TabsTrigger value="flagged">Flagged Content</TabsTrigger>
          <TabsTrigger value="history">Moderation History</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {reportsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 rounded bg-gray-200"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : reports?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
                <h3 className="mb-2 text-lg font-medium">
                  No reports to review
                </h3>
                <p className="text-gray-600">
                  All reports have been handled. Great job!
                </p>
              </CardContent>
            </Card>
          ) : (
            reports?.map((report: Report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="mb-3 flex items-center gap-2">
                        <Badge className={getReportStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                        <Badge variant="outline">
                          {REPORT_REASONS.find(r => r.value === report.reason)
                            ?.label || report.reason}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(report.createdAt)}
                        </span>
                      </div>

                      <div className="mb-4">
                        <h4 className="mb-2 font-medium">Reported Content:</h4>
                        <div className="rounded border bg-gray-50 p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={report.post.author.avatar} />
                              <AvatarFallback>
                                {report.post.author.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {report.post.author.name}
                            </span>
                            <span className="text-sm text-gray-500">in</span>
                            <span className="text-sm text-blue-600">
                              {report.post.thread.title}
                            </span>
                          </div>
                          <div className="line-clamp-3 text-sm text-gray-700">
                            {report.post.content}
                          </div>
                        </div>
                      </div>

                      {report.details && (
                        <div className="mb-4">
                          <h4 className="mb-1 font-medium">
                            Reporter's Details:
                          </h4>
                          <p className="text-sm text-gray-600">
                            {report.details}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>Reported by {report.reporter.name}</span>
                        </div>
                      </div>
                    </div>

                    {report.status === 'pending' && (
                      <div className="flex min-w-[120px] flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleReportAction(report.id, 'approve')
                          }
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Take Action
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleReportAction(report.id, 'dismiss')
                          }
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Dismiss
                        </Button>
                        <Button size="sm" variant="ghost" asChild>
                          <a
                            href={`/forum/threads/${report.post.thread.id}#post-${report.post.id}`}
                            target="_blank"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>

                  {report.moderatorNotes && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="mb-1 font-medium">Moderator Notes:</h4>
                      <p className="text-sm text-gray-600">
                        {report.moderatorNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="flagged" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <Flag className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium">Auto-flagged Content</h3>
              <p className="text-gray-600">
                Content automatically flagged by our AI systems will appear
                here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {moderationHistory?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium">
                  No moderation history
                </h3>
                <p className="text-gray-600">
                  Moderation actions will appear here once taken.
                </p>
              </CardContent>
            </Card>
          ) : (
            moderationHistory?.map((action: any) => (
              <Card key={action.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`rounded p-2 ${
                        action.severity === 'high'
                          ? 'bg-red-100 text-red-600'
                          : action.severity === 'medium'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {action.type === 'delete' && (
                        <Trash2 className="h-4 w-4" />
                      )}
                      {action.type === 'hide' && <EyeOff className="h-4 w-4" />}
                      {action.type === 'lock' && <Lock className="h-4 w-4" />}
                      {action.type === 'warn' && (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                      {action.type === 'ban' && <Shield className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-medium">
                          {action.type.charAt(0).toUpperCase() +
                            action.type.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          by {action.moderator.name}
                        </span>
                        <span className="text-sm text-gray-400">
                          {formatTimeAgo(action.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{action.reason}</p>
                      {action.targetContent && (
                        <div className="mt-1 line-clamp-1 text-xs text-gray-500">
                          Target: {action.targetContent}
                        </div>
                      )}
                    </div>
                    {action.duration && (
                      <Badge variant="outline" className="text-xs">
                        {action.duration} days
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function QuickModerationActions({
  targetId,
  targetType,
  currentStatus,
  userPermissions,
}: {
  targetId: string;
  targetType: 'thread' | 'post';
  currentStatus: string;
  userPermissions: string[];
}) {
  const [lockThread] = forumApi.useLockThreadMutation();
  const [pinThread] = forumApi.usePinThreadMutation();
  const [hidePost] = forumApi.useHidePostMutation();

  const canModerate = userPermissions.includes('moderate_content');
  const canLock = userPermissions.includes('lock_threads');
  const canPin = userPermissions.includes('pin_threads');

  if (!canModerate) return null;

  const handleQuickAction = async (action: string) => {
    try {
      switch (action) {
        case 'lock':
          await lockThread({ threadId: targetId }).unwrap();
          toast(
            <div>
              <strong className="text-green-600">Thread locked</strong>
              <p>Thread has been locked.</p>
            </div>,
            {
              duration: 4000,
            }
          );
          break;
        case 'unlock':
          await lockThread({ threadId: targetId, unlock: true }).unwrap();
          toast(
            <div>
              <strong className="text-green-600">Thread unlocked</strong>
              <p>Thread has been unlocked.</p>
            </div>,
            {
              duration: 4000,
            }
          );
          break;
        case 'pin':
          await pinThread({ threadId: targetId }).unwrap();
          toast(
            <div>
              <strong className="text-green-600">Thread pinned</strong>
              <p>Thread has been pinned.</p>
            </div>,
            {
              duration: 4000,
            }
          );
          break;
        case 'unpin':
          await pinThread({ threadId: targetId, unpin: true }).unwrap();
          toast(
            <div>
              <strong className="text-green-600">Thread unpinned</strong>
              <p>Thread has been unpinned.</p>
            </div>,
            {
              duration: 4000,
            }
          );
          break;
        case 'hide':
          await hidePost({ postId: targetId }).unwrap();
          toast(
            <div>
              <strong className="text-green-600">Content hidden</strong>
              <p>Content has been hidden from public view.</p>
            </div>,
            {
              duration: 4000,
            }
          );
          break;
      }
    } catch (error: any) {
      toast(
        <div>
          <strong className="text-red-600">Error</strong>
          <p>{error.data?.message || 'Failed to perform action.'}</p>
        </div>,
        {
          duration: 4000,
        }
      );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {targetType === 'thread' && canLock && (
          <>
            <DropdownMenuItem
              onClick={() =>
                handleQuickAction(
                  currentStatus === 'locked' ? 'unlock' : 'lock'
                )
              }
            >
              {currentStatus === 'locked' ? (
                <>
                  <Unlock className="mr-2 h-4 w-4" />
                  Unlock Thread
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Lock Thread
                </>
              )}
            </DropdownMenuItem>
            {canPin && (
              <DropdownMenuItem
                onClick={() =>
                  handleQuickAction(
                    currentStatus === 'pinned' ? 'unpin' : 'pin'
                  )
                }
              >
                {currentStatus === 'pinned' ? (
                  <>
                    <PinOff className="mr-2 h-4 w-4" />
                    Unpin Thread
                  </>
                ) : (
                  <>
                    <Pin className="mr-2 h-4 w-4" />
                    Pin Thread
                  </>
                )}
              </DropdownMenuItem>
            )}
          </>
        )}

        {targetType === 'post' && (
          <DropdownMenuItem onClick={() => handleQuickAction('hide')}>
            <EyeOff className="mr-2 h-4 w-4" />
            Hide Post
          </DropdownMenuItem>
        )}

        <Separator />
        <DropdownMenuItem>
          <Flag className="mr-2 h-4 w-4" />
          View Reports
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ModerationActionDialog({
  targetId,
  targetType,
  targetTitle,
  currentStatus,
  onAction,
}: {
  targetId: string;
  targetType: 'thread' | 'post';
  targetTitle: string;
  currentStatus: string;
  onAction?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [reason, setReason] = useState('');
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [duration, setDuration] = useState<number>();
  const [notifyUser, setNotifyUser] = useState(true);
  const [escalate, setEscalate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAppSelector(state => state.auth);
  const [takeModerationAction] = forumApi.useTakeModerationActionMutation();

  const handleTakeAction = async () => {
    if (!selectedAction || !reason) {
      toast(
        <div>
          <strong className="text-red-600">Error</strong>
          <p>Please select an action and provide a reason.</p>
        </div>,
        {
          duration: 4000,
        }
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await takeModerationAction({
        targetId,
        targetType,
        action: selectedAction as any,
        reason,
        moderatorNotes,
        duration,
        notifyUser,
        escalate,
      }).unwrap();

      toast(
        <div>
          <strong className="text-green-600">Action taken</strong>
          <p>Moderation action has been applied successfully.</p>
        </div>,
        {
          duration: 4000,
        }
      );

      setIsOpen(false);
      onAction?.();
    } catch (error: any) {
      toast(
        <div>
          <strong className="text-red-600">Error</strong>
          <p>
            {error.data?.message || 'Failed to take action. Please try again.'}
          </p>
        </div>,
        {
          duration: 4000,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedActionData = MODERATION_ACTIONS.find(
    a => a.value === selectedAction
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Shield className="mr-2 h-4 w-4" />
          Moderate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Take Moderation Action</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block text-sm font-medium">
              Select Action
            </Label>
            <div className="space-y-2">
              {MODERATION_ACTIONS.map(action => (
                <div
                  key={action.value}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                    selectedAction === action.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedAction(action.value)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded p-2 ${
                        action.severity === 'high'
                          ? 'bg-red-100 text-red-600'
                          : action.severity === 'medium'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{action.label}</div>
                      <div className="text-xs text-gray-600">
                        {action.description}
                      </div>
                    </div>
                    <div
                      className={`h-4 w-4 rounded-full border-2 ${
                        selectedAction === action.value
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedAction === action.value && (
                        <div className="h-full w-full scale-50 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedAction && (
            <>
              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Reason *
                </Label>
                <Textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Explain why you're taking this action..."
                  rows={3}
                />
              </div>

              <div>
                <Label className="mb-2 block text-sm font-medium">
                  Internal Notes (optional)
                </Label>
                <Textarea
                  value={moderatorNotes}
                  onChange={e => setModeratorNotes(e.target.value)}
                  placeholder="Notes for other moderators..."
                  rows={2}
                />
              </div>

              {(selectedAction === 'ban' || selectedAction === 'lock') && (
                <div>
                  <Label className="mb-2 block text-sm font-medium">
                    Duration (days)
                  </Label>
                  <Input
                    type="number"
                    value={duration || ''}
                    onChange={e =>
                      setDuration(
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    placeholder="Leave empty for permanent"
                  />
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notify-user"
                    checked={notifyUser}
                    onCheckedChange={setNotifyUser as any}
                  />
                  <Label htmlFor="notify-user" className="text-sm">
                    Notify user about this action
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="escalate"
                    checked={escalate}
                    onCheckedChange={setEscalate as any}
                  />
                  <Label htmlFor="escalate" className="text-sm">
                    Escalate to senior moderators
                  </Label>
                </div>
              </div>

              {selectedActionData?.severity === 'high' && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" />
                    <div className="text-sm">
                      <div className="mb-1 font-medium text-red-800">
                        High severity action
                      </div>
                      <div className="text-red-700">
                        This action cannot be easily undone. Please ensure you
                        have sufficient evidence and have followed proper
                        procedures.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleTakeAction}
            disabled={!selectedAction || !reason || isSubmitting}
            variant={
              selectedActionData?.severity === 'high'
                ? 'destructive'
                : 'default'
            }
          >
            {isSubmitting ? 'Processing...' : 'Take Action'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
