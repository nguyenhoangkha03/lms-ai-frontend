'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Zap,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Settings,
  Monitor,
  RefreshCw,
  Download,
  Eye,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

import {
  useGetFilesQuery,
  useGetProcessingStatusQuery,
  useProcessImageMutation,
  useProcessVideoMutation,
} from '@/lib/redux/api/file-management-api';
import {
  FileUpload,
  FileProcessingStatus as ProcessingStatusType,
} from '@/lib/types/file-management';
import { cn, formatFileSize, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface FileProcessingStatusProps {
  className?: string;
}

export function FileProcessingStatus({ className }: FileProcessingStatusProps) {
  const [selectedStatus, setSelectedStatus] = useState<
    ProcessingStatusType | 'all'
  >('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Fetch files with processing status
  const {
    data: filesData,
    isLoading: filesLoading,
    error: filesError,
    refetch: refetchFiles,
  } = useGetFilesQuery({
    processingStatus: selectedStatus === 'all' ? undefined : selectedStatus,
    limit: 50,
    sortBy: 'processingStartedAt',
    sortOrder: 'desc',
  });

  // Mutations for reprocessing
  const [processImage] = useProcessImageMutation();
  const [processVideo] = useProcessVideoMutation();

  const files = filesData?.files || [];
  const processingFiles = files.filter(
    f => f.processingStatus === 'processing'
  );
  const pendingFiles = files.filter(f => f.processingStatus === 'pending');
  const completedFiles = files.filter(f => f.processingStatus === 'completed');
  const failedFiles = files.filter(f => f.processingStatus === 'failed');

  // Auto refresh for processing files
  useEffect(() => {
    if (autoRefresh && processingFiles.length > 0) {
      const interval = setInterval(() => {
        refetchFiles();
      }, 3000);
      setRefreshInterval(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [autoRefresh, processingFiles.length, refetchFiles]);

  // Handle reprocessing
  const handleReprocess = async (file: FileUpload) => {
    try {
      if (file.fileType === 'image') {
        await processImage({
          id: file.id,
          operations: {
            optimize: true,
            thumbnails: [
              { width: 150, height: 150, suffix: 'thumb' },
              { width: 300, height: 300, suffix: 'medium' },
            ],
            format: 'webp',
          },
        }).unwrap();
      } else if (file.fileType === 'video') {
        await processVideo({
          id: file.id,
          operations: {
            transcode: {
              quality: 'medium',
              format: 'mp4',
            },
            thumbnails: {
              count: 3,
              size: { width: 320, height: 180 },
            },
            streaming: {
              enabled: true,
              adaptive: true,
            },
          },
        }).unwrap();
      }

      toast.success('File reprocessing started');
      refetchFiles();
    } catch (error) {
      toast.error('Failed to start reprocessing');
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return ImageIcon;
      case 'video':
        return Video;
      case 'audio':
        return Music;
      case 'document':
        return FileText;
      default:
        return FileText;
    }
  };

  const getStatusColor = (status: ProcessingStatusType) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'processing':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Processing Status
          </h2>
          <p className="text-muted-foreground">
            Monitor file processing, transcoding, and optimization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={selectedStatus}
            onValueChange={value =>
              setSelectedStatus(value as ProcessingStatusType | 'all')
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Files</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(autoRefresh && 'bg-blue-50 text-blue-600')}
          >
            <RefreshCw
              className={cn('mr-2 h-4 w-4', autoRefresh && 'animate-spin')}
            />
            Auto Refresh
          </Button>

          <Button variant="outline" size="sm" onClick={() => refetchFiles()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingFiles.length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Processing
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {processingFiles.length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {completedFiles.length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Failed
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {failedFiles.length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processing Queue */}
      <Tabs defaultValue="processing" className="space-y-4">
        <TabsList>
          <TabsTrigger value="processing">
            Processing ({processingFiles.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingFiles.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedFiles.length})
          </TabsTrigger>
          <TabsTrigger value="failed">
            Failed ({failedFiles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="processing" className="space-y-4">
          {processingFiles.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Zap className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">
                  No files processing
                </h3>
                <p className="text-muted-foreground">
                  All processing tasks are completed
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {processingFiles.map(file => (
                <ProcessingFileCard
                  key={file.id}
                  file={file}
                  onReprocess={() => handleReprocess(file)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingFiles.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No pending files</h3>
                <p className="text-muted-foreground">
                  No files waiting for processing
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingFiles.map(file => (
                <FileStatusCard
                  key={file.id}
                  file={file}
                  onReprocess={() => handleReprocess(file)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedFiles.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">
                  No completed files
                </h3>
                <p className="text-muted-foreground">
                  Completed processing tasks will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedFiles.map(file => (
                <FileStatusCard
                  key={file.id}
                  file={file}
                  onReprocess={() => handleReprocess(file)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="failed" className="space-y-4">
          {failedFiles.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
                <h3 className="mb-2 text-lg font-semibold">
                  No failed processing
                </h3>
                <p className="text-muted-foreground">
                  Great! All processing tasks completed successfully
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {failedFiles.map(file => (
                <FileStatusCard
                  key={file.id}
                  file={file}
                  onReprocess={() => handleReprocess(file)}
                  showError
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Processing File Card with Live Progress
interface ProcessingFileCardProps {
  file: FileUpload;
  onReprocess: () => void;
}

function ProcessingFileCard({ file, onReprocess }: ProcessingFileCardProps) {
  const [progress, setProgress] = useState(65); // Simulated progress
  const FileIcon = getFileIcon(file.fileType);

  // Simulate progress updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 5;
        return newProgress > 95 ? 95 : newProgress;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const { data: processingStatus, isLoading: statusLoading } =
    useGetProcessingStatusQuery(file.id);

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* File Icon/Thumbnail */}
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border bg-white">
            {file.thumbnailPath ? (
              <img
                src={file.thumbnailPath}
                alt={file.originalName}
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              <FileIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          {/* File Info */}
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h4
                  className="truncate font-semibold"
                  title={file.originalName}
                >
                  {file.originalName}
                </h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{formatFileSize(file.fileSize)}</span>
                  <span>Started {formatDate(file.processingStartedAt!)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(file.processingStatus)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onReprocess}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restart Processing
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Monitor className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Processing Steps */}
            <div className="space-y-3">
              {/* Current Step */}
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
                <span className="text-sm font-medium">
                  {file.fileType === 'video'
                    ? 'Transcoding video...'
                    : file.fileType === 'image'
                      ? 'Optimizing image...'
                      : 'Processing file...'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>
                    {Math.round(processingStatus?.progress || progress)}%
                  </span>
                </div>
                <Progress
                  value={processingStatus?.progress || progress}
                  className="h-2"
                />
              </div>

              {/* Processing Steps */}
              <div className="space-y-2">
                {file.fileType === 'video' && (
                  <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>Upload verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      <span>Transcoding</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span>Generating thumbnails</span>
                    </div>
                  </div>
                )}

                {file.fileType === 'image' && (
                  <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>Upload verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      <span>Optimizing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span>Creating thumbnails</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ETA */}
              {processingStatus?.progress &&
                processingStatus.progress < 100 && (
                  <div className="text-xs text-muted-foreground">
                    Estimated time remaining:{' '}
                    {Math.ceil((100 - processingStatus.progress) / 10)} minutes
                  </div>
                )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// General File Status Card
interface FileStatusCardProps {
  file: FileUpload;
  onReprocess: () => void;
  showError?: boolean;
}

function FileStatusCard({
  file,
  onReprocess,
  showError = false,
}: FileStatusCardProps) {
  const FileIcon = getFileIcon(file.fileType);

  return (
    <Card
      className={cn(
        file.processingStatus === 'failed' && 'border-red-200 bg-red-50/50',
        file.processingStatus === 'completed' &&
          'border-green-200 bg-green-50/50'
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {/* File Icon/Thumbnail */}
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border bg-white">
            {file.thumbnailPath ? (
              <img
                src={file.thumbnailPath}
                alt={file.originalName}
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              <FileIcon className="h-6 w-6 text-muted-foreground" />
            )}
          </div>

          {/* File Info */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between">
              <h4 className="truncate font-medium" title={file.originalName}>
                {file.originalName}
              </h4>
              {getStatusBadge(file.processingStatus)}
            </div>

            <div className="mb-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span>{formatFileSize(file.fileSize)}</span>
              <span>
                {file.processingCompletedAt
                  ? `Completed ${formatDate(file.processingCompletedAt)}`
                  : file.processingStartedAt
                    ? `Started ${formatDate(file.processingStartedAt)}`
                    : `Created ${formatDate(file.createdAt)}`}
              </span>
            </div>

            {/* Processed Versions */}
            {file.processedVersions && file.processedVersions.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {file.processedVersions.map((version: any, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {version.type} ({version.format})
                  </Badge>
                ))}
              </div>
            )}

            {/* Error Message */}
            {showError && file.processingError && (
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {file.processingError}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {file.processingStatus === 'completed' && (
              <>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </>
            )}

            {(file.processingStatus === 'failed' ||
              file.processingStatus === 'pending') && (
              <Button variant="outline" size="sm" onClick={onReprocess}>
                <RotateCcw className="mr-2 h-4 w-4" />
                {file.processingStatus === 'failed' ? 'Retry' : 'Process'}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Monitor className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Download Original
                </DropdownMenuItem>
                {file.processingStatus === 'completed' && (
                  <DropdownMenuItem onClick={onReprocess}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reprocess
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Report Issue
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get file icon
function getFileIcon(fileType: string) {
  switch (fileType) {
    case 'image':
      return ImageIcon;
    case 'video':
      return Video;
    case 'audio':
      return Music;
    case 'document':
      return FileText;
    default:
      return FileText;
  }
}

const getStatusBadge = (status: ProcessingStatusType) => {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="text-yellow-600">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
    case 'processing':
      return (
        <Badge variant="outline" className="text-blue-600">
          <Zap className="mr-1 h-3 w-3" />
          Processing
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant="outline" className="text-green-600">
          <CheckCircle className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="destructive">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Failed
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};
