// src/components/offline/OfflineManager.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  Trash2,
  Play,
  FileText,
  Image,
  Video,
  Music,
  WifiOff,
  CheckCircle,
  Clock,
  AlertCircle,
  Pause,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

interface OfflineContent {
  id: string;
  type: 'course' | 'lesson' | 'video' | 'document' | 'quiz';
  title: string;
  description?: string;
  thumbnail?: string;
  size: number;
  duration?: number;
  downloadedAt: string;
  lastAccessed?: string;
  status: 'downloading' | 'completed' | 'error' | 'paused';
  progress: number;
  courseId?: string;
  metadata?: Record<string, any>;
}

interface DownloadJob {
  id: string;
  contentId: string;
  title: string;
  type: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'error' | 'paused';
  bytesDownloaded: number;
  totalBytes: number;
  error?: string;
}

interface OfflineManagerProps {
  className?: string;
  autoDownload?: boolean;
  maxStorageSize?: number; // in MB
}

export function OfflineManager({
  className,
  autoDownload = false,
  maxStorageSize = 1024, // 1GB default
}: OfflineManagerProps) {
  const { isOnline, connection } = useMobile();

  const [offlineContent, setOfflineContent] = useState<OfflineContent[]>([]);
  const [downloadJobs, setDownloadJobs] = useState<DownloadJob[]>([]);
  const [totalStorageUsed, setTotalStorageUsed] = useState(0);
  const [autoDownloadEnabled, setAutoDownloadEnabled] = useState(autoDownload);
  const [selectedTab, setSelectedTab] = useState('downloaded');

  // Initialize offline manager
  useEffect(() => {
    loadOfflineContent();
    setupOfflineHandlers();
  }, []);

  const loadOfflineContent = async () => {
    try {
      // Load from IndexedDB or localStorage
      const stored = localStorage.getItem('offline-content');
      if (stored) {
        const content = JSON.parse(stored);
        setOfflineContent(content);

        const totalSize = content.reduce(
          (sum: number, item: OfflineContent) => sum + item.size,
          0
        );
        setTotalStorageUsed(totalSize);
      }
    } catch (error) {
      console.error('Failed to load offline content:', error);
    }
  };

  const saveOfflineContent = (content: OfflineContent[]) => {
    try {
      localStorage.setItem('offline-content', JSON.stringify(content));
      const totalSize = content.reduce((sum, item) => sum + item.size, 0);
      setTotalStorageUsed(totalSize);
    } catch (error) {
      console.error('Failed to save offline content:', error);
    }
  };

  const setupOfflineHandlers = () => {
    // Handle online/offline events
    const handleOnline = () => {
      toast.success('Connection restored! Resuming downloads...');
      resumeDownloads();
    };

    const handleOffline = () => {
      toast.info("You're offline. Cached content is still available.");
      pauseDownloads();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'audio':
        return <Music className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'downloading':
        return <Clock className="h-4 w-4 animate-spin text-blue-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const downloadContent = async (
    contentId: string,
    title: string,
    type: string
  ) => {
    if (!isOnline) {
      toast.error('Cannot download while offline');
      return;
    }

    const newJob: DownloadJob = {
      id: `${contentId}-${Date.now()}`,
      contentId,
      title,
      type,
      progress: 0,
      status: 'downloading',
      bytesDownloaded: 0,
      totalBytes: 0,
    };

    setDownloadJobs(prev => [...prev, newJob]);

    try {
      // Simulate download process
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));

        setDownloadJobs(prev =>
          prev.map(job =>
            job.id === newJob.id
              ? {
                  ...job,
                  progress,
                  bytesDownloaded: (progress / 100) * 10485760,
                } // 10MB simulation
              : job
          )
        );
      }

      // Complete download
      const completedContent: OfflineContent = {
        id: contentId,
        type: type as any,
        title,
        size: 10485760, // 10MB simulation
        downloadedAt: new Date().toISOString(),
        status: 'completed',
        progress: 100,
        metadata: { downloadJobId: newJob.id },
      };

      setOfflineContent(prev => {
        const updated = [...prev, completedContent];
        saveOfflineContent(updated);
        return updated;
      });

      setDownloadJobs(prev => prev.filter(job => job.id !== newJob.id));
      toast.success(`${title} downloaded successfully!`);
    } catch (error) {
      setDownloadJobs(prev =>
        prev.map(job =>
          job.id === newJob.id
            ? { ...job, status: 'error', error: 'Download failed' }
            : job
        )
      );
      toast.error(`Failed to download ${title}`);
    }
  };

  const pauseDownload = (jobId: string) => {
    setDownloadJobs(prev =>
      prev.map(job => (job.id === jobId ? { ...job, status: 'paused' } : job))
    );
  };

  const resumeDownload = (jobId: string) => {
    setDownloadJobs(prev =>
      prev.map(job =>
        job.id === jobId ? { ...job, status: 'downloading' } : job
      )
    );
  };

  const cancelDownload = (jobId: string) => {
    setDownloadJobs(prev => prev.filter(job => job.id !== jobId));
    toast.info('Download cancelled');
  };

  const pauseDownloads = () => {
    setDownloadJobs(prev =>
      prev.map(job =>
        job.status === 'downloading' ? { ...job, status: 'paused' } : job
      )
    );
  };

  const resumeDownloads = () => {
    setDownloadJobs(prev =>
      prev.map(job =>
        job.status === 'paused' ? { ...job, status: 'downloading' } : job
      )
    );
  };

  const deleteOfflineContent = (contentId: string) => {
    setOfflineContent(prev => {
      const updated = prev.filter(content => content.id !== contentId);
      saveOfflineContent(updated);
      return updated;
    });
    toast.success('Content removed from offline storage');
  };

  const clearAllOfflineContent = () => {
    setOfflineContent([]);
    saveOfflineContent([]);
    toast.success('All offline content cleared');
  };

  const getStoragePercentage = () => {
    return (totalStorageUsed / (maxStorageSize * 1024 * 1024)) * 100;
  };

  const shouldAutoDownload = () => {
    return (
      autoDownloadEnabled &&
      isOnline &&
      connection?.effectiveType !== '2g' &&
      !connection?.saveData
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <WifiOff className="h-5 w-5" />
            Offline Content
          </CardTitle>

          <div className="flex items-center gap-2">
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </div>

        {/* Storage Usage */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Storage Used</span>
            <span>
              {formatFileSize(totalStorageUsed)} / {maxStorageSize}MB
            </span>
          </div>
          <Progress value={getStoragePercentage()} className="h-2" />
        </div>
      </CardHeader>

      <CardContent>
        {/* Settings */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto Download</p>
              <p className="text-sm text-muted-foreground">
                Automatically download new content when on WiFi
              </p>
            </div>
            <Switch
              checked={autoDownloadEnabled}
              onCheckedChange={setAutoDownloadEnabled}
            />
          </div>

          {connection?.saveData && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Data Saver is enabled. Downloads may be limited.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="downloaded">
              Downloaded ({offlineContent.length})
            </TabsTrigger>
            <TabsTrigger value="downloading">
              Downloading ({downloadJobs.length})
            </TabsTrigger>
          </TabsList>

          {/* Downloaded Content */}
          <TabsContent value="downloaded" className="space-y-4">
            {offlineContent.length === 0 ? (
              <div className="py-8 text-center">
                <WifiOff className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No offline content available
                </p>
                <p className="text-sm text-muted-foreground">
                  Download content to access it when offline
                </p>
              </div>
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {offlineContent.map(content => (
                    <div
                      key={content.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-2">
                        {getContentIcon(content.type)}
                        {getStatusIcon(content.status)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{content.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{formatFileSize(content.size)}</span>
                          {content.duration && (
                            <>
                              <span>•</span>
                              <span>{formatDuration(content.duration)}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>
                            Downloaded{' '}
                            {new Date(
                              content.downloadedAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Open/play content
                            toast.info(`Opening ${content.title}`);
                          }}
                        >
                          <Play className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteOfflineContent(content.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {offlineContent.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={clearAllOfflineContent}
                className="w-full"
              >
                Clear All Offline Content
              </Button>
            )}
          </TabsContent>

          {/* Active Downloads */}
          <TabsContent value="downloading" className="space-y-4">
            {downloadJobs.length === 0 ? (
              <div className="py-8 text-center">
                <Download className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No active downloads</p>
              </div>
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {downloadJobs.map(job => (
                    <div
                      key={job.id}
                      className="space-y-2 rounded-lg border p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getContentIcon(job.type)}
                          <span className="font-medium">{job.title}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {job.status === 'downloading' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => pauseDownload(job.id)}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          )}

                          {job.status === 'paused' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resumeDownload(job.id)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelDownload(job.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{job.status}</span>
                          <span>{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} className="h-1" />
                      </div>

                      {job.error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{job.error}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() =>
              downloadContent('sample-video', 'Sample Video', 'video')
            }
            disabled={!isOnline}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Sample
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              if (downloadJobs.some(job => job.status === 'downloading')) {
                pauseDownloads();
                toast.info('All downloads paused');
              } else {
                resumeDownloads();
                toast.info('Downloads resumed');
              }
            }}
            disabled={downloadJobs.length === 0}
          >
            {downloadJobs.some(job => job.status === 'downloading') ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause All
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Resume All
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
