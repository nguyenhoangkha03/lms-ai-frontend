'use client';

import React, { useState } from 'react';
import {
  Shield,
  Check,
  X,
  Flag,
  AlertTriangle,
  Clock,
  FileText,
  Video,
  MessageSquare,
  User,
  Bot,
  ExternalLink,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { useGetModerationItemByIdQuery } from '@/lib/redux/api/content-management-api';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';

interface ContentModerationDetailsModalProps {
  itemId: string;
  onClose: () => void;
  onModerate: (
    itemId: string,
    action: 'approve' | 'reject' | 'flag' | 'require_changes',
    reason?: string,
    feedback?: string
  ) => Promise<void>;
}

const ContentModerationDetailsModal: React.FC<
  ContentModerationDetailsModalProps
> = ({ itemId, onClose, onModerate }) => {
  const { toast } = useToast();

  // State management
  const [showModerationDialog, setShowModerationDialog] = useState(false);
  const [moderationAction, setModerationAction] = useState<
    'approve' | 'reject' | 'flag' | 'require_changes'
  >('approve');
  const [moderationReason, setModerationReason] = useState('');
  const [moderationFeedback, setModerationFeedback] = useState('');

  // API queries
  const {
    data: moderationItem,
    isLoading,
    error,
  } = useGetModerationItemByIdQuery(itemId);

  // Handlers
  const handleModerate = async () => {
    try {
      await onModerate(
        itemId,
        moderationAction,
        moderationReason,
        moderationFeedback
      );

      toast({
        title: 'Content moderated successfully',
        description: `Content has been ${moderationAction}d`,
      });

      setShowModerationDialog(false);
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Moderation failed',
        variant: 'destructive',
      });
    }
  };

  // Helper functions
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, text: 'Pending', icon: Clock },
      approved: { variant: 'default' as const, text: 'Approved', icon: Check },
      rejected: { variant: 'destructive' as const, text: 'Rejected', icon: X },
      requires_changes: {
        variant: 'outline' as const,
        text: 'Requires Changes',
        icon: AlertCircle,
      },
      flagged: { variant: 'destructive' as const, text: 'Flagged', icon: Flag },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { variant: 'outline' as const, text: 'Low', color: 'text-gray-600' },
      medium: {
        variant: 'secondary' as const,
        text: 'Medium',
        color: 'text-yellow-600',
      },
      high: {
        variant: 'default' as const,
        text: 'High',
        color: 'text-orange-600',
      },
      urgent: {
        variant: 'destructive' as const,
        text: 'Urgent',
        color: 'text-red-600',
      },
    };

    const config =
      priorityConfig[priority as keyof typeof priorityConfig] ||
      priorityConfig.low;
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const getContentTypeIcon = (contentType: string) => {
    const icons = {
      course: FileText,
      lesson: Video,
      forum_post: MessageSquare,
      comment: MessageSquare,
    };
    return icons[contentType as keyof typeof icons] || FileText;
  };

  const getAIQualityBadge = (score?: number) => {
    if (!score) return null;

    let variant: 'default' | 'secondary' | 'destructive' | 'outline' =
      'outline';
    let text = 'Unknown';

    if (score >= 80) {
      variant = 'default';
      text = 'High Quality';
    } else if (score >= 60) {
      variant = 'secondary';
      text = 'Good Quality';
    } else if (score >= 40) {
      variant = 'outline';
      text = 'Fair Quality';
    } else {
      variant = 'destructive';
      text = 'Low Quality';
    }

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Bot className="h-3 w-3" />
        {text} ({score}%)
      </Badge>
    );
  };

  const getPlagiarismBadge = (status?: string, similarity?: number) => {
    if (!status) return null;

    const config = {
      clean: {
        variant: 'default' as const,
        text: 'Clean',
        color: 'text-green-600',
      },
      suspicious: {
        variant: 'outline' as const,
        text: 'Suspicious',
        color: 'text-yellow-600',
      },
      plagiarized: {
        variant: 'destructive' as const,
        text: 'Plagiarized',
        color: 'text-red-600',
      },
    };

    const statusConfig = config[status as keyof typeof config] || config.clean;
    const displayText = similarity
      ? `${statusConfig.text} (${similarity}%)`
      : statusConfig.text;

    return (
      <Badge variant={statusConfig.variant} className={statusConfig.color}>
        {displayText}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] max-w-4xl">
          <DialogHeader>
            <DialogTitle>Loading content details...</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="mb-2 h-4 w-3/4 rounded bg-muted"></div>
                <div className="h-3 w-1/2 rounded bg-muted"></div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !moderationItem) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              Failed to load content details. Please try again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const ContentIcon = getContentTypeIcon(moderationItem.contentType);

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <ContentIcon className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="flex items-center gap-2">
                    {moderationItem.title}
                    {getStatusBadge(moderationItem.status)}
                  </DialogTitle>
                  <DialogDescription>
                    {moderationItem.contentType.replace('_', ' ')} • Submitted{' '}
                    {new Date(moderationItem.submittedAt).toLocaleDateString()}
                  </DialogDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getPriorityBadge(moderationItem.priority)}
                {moderationItem.reportCount > 0 && (
                  <Badge variant="destructive">
                    {moderationItem.reportCount} reports
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="overview" className="flex h-full flex-col">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <div className="mt-4 flex-1 overflow-hidden">
                <TabsContent
                  value="overview"
                  className="h-full space-y-4 overflow-y-auto"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Content Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Content Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Title</Label>
                          <p className="mt-1 text-sm">{moderationItem.title}</p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">
                            Description
                          </Label>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {moderationItem.description ||
                              'No description provided'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Type</Label>
                            <p className="mt-1 text-sm capitalize">
                              {moderationItem.contentType.replace('_', ' ')}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">
                              Priority
                            </Label>
                            <div className="mt-1">
                              {getPriorityBadge(moderationItem.priority)}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">
                              Submitted
                            </Label>
                            <p className="mt-1 text-sm">
                              {new Date(
                                moderationItem.submittedAt
                              ).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">
                              Reports
                            </Label>
                            <p className="mt-1 text-sm font-medium text-red-600">
                              {moderationItem.reportCount} reports
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Author Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Author Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={moderationItem.content?.author.id}
                            />
                            <AvatarFallback>
                              {moderationItem.content?.author.name?.charAt(0) ||
                                'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {moderationItem.content?.author.name ||
                                'Unknown Author'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {moderationItem.content?.author.email || ''}
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Total Content:
                            </span>
                            <span className="font-medium">12 items</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Approved Rate:
                            </span>
                            <span className="font-medium text-green-600">
                              87%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Reports Received:
                            </span>
                            <span className="font-medium">3 total</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Member Since:
                            </span>
                            <span className="font-medium">Jan 2024</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Moderation Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Moderation Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="text-center">
                          <div className="font-medium">Status</div>
                          <div className="mt-1">
                            {getStatusBadge(moderationItem.status)}
                          </div>
                        </div>

                        {moderationItem.moderatedBy && (
                          <div className="text-center">
                            <div className="font-medium">Moderated By</div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              {moderationItem.moderatedBy}
                            </div>
                          </div>
                        )}

                        {moderationItem.moderatedAt && (
                          <div className="text-center">
                            <div className="font-medium">Moderated At</div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              {new Date(
                                moderationItem.moderatedAt
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        )}

                        <div className="text-center">
                          <div className="font-medium">Priority</div>
                          <div className="mt-1">
                            {getPriorityBadge(moderationItem.priority)}
                          </div>
                        </div>
                      </div>

                      {moderationItem.moderationReason && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Moderation Reason:</strong>{' '}
                            {moderationItem.moderationReason}
                          </AlertDescription>
                        </Alert>
                      )}

                      {moderationItem.flaggedReason && (
                        <Alert variant="destructive">
                          <Flag className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Flagged Reason:</strong>{' '}
                            {moderationItem.flaggedReason}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent
                  value="content"
                  className="h-full space-y-4 overflow-y-auto"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Content Preview</CardTitle>
                      <CardDescription>
                        Preview of the content being moderated
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {moderationItem.content?.thumbnailUrl && (
                        <div className="mb-4">
                          <img
                            src={moderationItem.content.thumbnailUrl}
                            alt="Content thumbnail"
                            className="w-full max-w-md rounded-lg"
                          />
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <Label className="font-medium">Title</Label>
                          <p className="mt-1">
                            {moderationItem.content?.title}
                          </p>
                        </div>

                        <div>
                          <Label className="font-medium">Description</Label>
                          <p className="mt-1 text-muted-foreground">
                            {moderationItem.content?.description ||
                              'No description available'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="mr-1 h-3 w-3" />
                          View Original
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="mr-1 h-3 w-3" />
                          Copy Link
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent
                  value="analysis"
                  className="h-full space-y-4 overflow-y-auto"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* AI Quality Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          AI Quality Assessment
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {moderationItem.aiAnalysis ? (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Overall Score:</span>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={moderationItem.aiAnalysis.qualityScore}
                                  className="w-20"
                                />
                                <span className="text-sm font-medium">
                                  {moderationItem.aiAnalysis.qualityScore}%
                                </span>
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-medium">
                                AI Flags
                              </Label>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {moderationItem.aiAnalysis.flags.map(
                                  (flag, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {flag}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-medium">
                                Suggestions
                              </Label>
                              <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                                {moderationItem.aiAnalysis.suggestions.map(
                                  (suggestion, index) => (
                                    <li
                                      key={index}
                                      className="flex items-start gap-2"
                                    >
                                      <span className="text-blue-600">•</span>
                                      {suggestion}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-sm">Confidence:</span>
                              <Badge variant="secondary">
                                {Math.round(
                                  moderationItem.aiAnalysis.confidence * 100
                                )}
                                %
                              </Badge>
                            </div>
                          </>
                        ) : (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              AI analysis not available for this content
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>

                    {/* Plagiarism Check */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Plagiarism Check
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {moderationItem.plagiarismCheck ? (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Status:</span>
                              {getPlagiarismBadge(
                                moderationItem.plagiarismCheck.status,
                                moderationItem.plagiarismCheck.similarityScore
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-sm">Similarity Score:</span>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={
                                    moderationItem.plagiarismCheck
                                      .similarityScore
                                  }
                                  className="w-20"
                                />
                                <span className="text-sm font-medium">
                                  {
                                    moderationItem.plagiarismCheck
                                      .similarityScore
                                  }
                                  %
                                </span>
                              </div>
                            </div>

                            {moderationItem.plagiarismCheck.sources.length >
                              0 && (
                              <div>
                                <Label className="text-sm font-medium">
                                  Similar Sources
                                </Label>
                                <div className="mt-1 space-y-2">
                                  {moderationItem.plagiarismCheck.sources.map(
                                    (source, index) => (
                                      <div
                                        key={index}
                                        className="rounded-lg border p-2 text-sm"
                                      >
                                        <div className="flex items-start justify-between">
                                          <span className="font-medium">
                                            {source.source}
                                          </span>
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {source.similarity}%
                                          </Badge>
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                          "{source.matchedText}"
                                        </p>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Plagiarism check not available for this content
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent
                  value="reports"
                  className="h-full space-y-4 overflow-y-auto"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>User Reports</CardTitle>
                      <CardDescription>
                        Reports submitted by users about this content
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {moderationItem.reportCount > 0 ? (
                        <div className="space-y-4">
                          {/* Mock reports data */}
                          {[1, 2, 3]
                            .slice(0, moderationItem.reportCount)
                            .map((_, index) => (
                              <div
                                key={index}
                                className="rounded-lg border p-4"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback className="text-xs">
                                        U
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="text-sm font-medium">
                                        Anonymous User
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {new Date(
                                          Date.now() -
                                            index * 24 * 60 * 60 * 1000
                                        ).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    Inappropriate Content
                                  </Badge>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                  This content violates community guidelines and
                                  contains inappropriate material.
                                </p>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">
                          No reports have been submitted for this content
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent
                  value="history"
                  className="h-full space-y-4 overflow-y-auto"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Moderation History</CardTitle>
                      <CardDescription>
                        Timeline of moderation actions for this content
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Mock history data */}
                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-blue-100 p-1">
                            <Clock className="h-3 w-3 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              Content submitted for review
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(
                                moderationItem.submittedAt
                              ).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-yellow-100 p-1">
                            <Bot className="h-3 w-3 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              AI analysis completed
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Quality score:{' '}
                              {moderationItem.aiAnalysis?.qualityScore || 'N/A'}
                              %
                            </div>
                          </div>
                        </div>

                        {moderationItem.status !== 'pending' && (
                          <div className="flex items-start gap-3">
                            <div className="rounded-full bg-green-100 p-1">
                              <Check className="h-3 w-3 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                Content {moderationItem.status}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {moderationItem.moderatedAt &&
                                  new Date(
                                    moderationItem.moderatedAt
                                  ).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>

            {moderationItem.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => {
                    setModerationAction('reject');
                    setShowModerationDialog(true);
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setModerationAction('flag');
                    setShowModerationDialog(true);
                  }}
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Flag
                </Button>

                <Button
                  onClick={() => {
                    setModerationAction('approve');
                    setShowModerationDialog(true);
                  }}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Moderation Action Dialog */}
      <Dialog
        open={showModerationDialog}
        onOpenChange={setShowModerationDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {moderationAction === 'approve'
                ? 'Approve Content'
                : moderationAction === 'reject'
                  ? 'Reject Content'
                  : moderationAction === 'flag'
                    ? 'Flag Content'
                    : 'Request Changes'}
            </DialogTitle>
            <DialogDescription>
              {moderationAction === 'approve'
                ? 'This will approve the content and make it visible to users.'
                : moderationAction === 'reject'
                  ? 'This will reject the content and notify the author.'
                  : moderationAction === 'flag'
                    ? 'This will flag the content for further review.'
                    : 'This will request changes from the author.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {(moderationAction === 'reject' || moderationAction === 'flag') && (
              <div>
                <Label className="text-sm font-medium">
                  {moderationAction === 'reject'
                    ? 'Rejection Reason'
                    : 'Flag Reason'}{' '}
                  *
                </Label>
                <Textarea
                  value={moderationReason}
                  onChange={e => setModerationReason(e.target.value)}
                  placeholder={`Please provide a clear reason for ${moderationAction}ing this content...`}
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label className="text-sm font-medium">
                {moderationAction === 'approve' ? 'Approval Notes' : 'Feedback'}
                {moderationAction !== 'approve' && ' *'}
              </Label>
              <Textarea
                value={moderationFeedback}
                onChange={e => setModerationFeedback(e.target.value)}
                placeholder={
                  moderationAction === 'approve'
                    ? 'Optional notes for the author...'
                    : 'Provide detailed feedback for the author...'
                }
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModerationDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleModerate}
              disabled={
                (moderationAction === 'reject' ||
                  moderationAction === 'flag') &&
                !moderationReason.trim()
              }
              variant={
                moderationAction === 'approve' ? 'default' : 'destructive'
              }
            >
              {moderationAction === 'approve'
                ? 'Approve'
                : moderationAction === 'reject'
                  ? 'Reject'
                  : moderationAction === 'flag'
                    ? 'Flag'
                    : 'Request Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContentModerationDetailsModal;
