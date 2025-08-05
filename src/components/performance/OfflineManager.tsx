'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Download,
  Wifi,
  WifiOff,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface OfflineContent {
  id: string;
  title: string;
  type: 'course' | 'lesson' | 'assessment';
  size: number;
  downloadedAt: Date;
  lastAccessed: Date;
  status: 'downloaded' | 'downloading' | 'failed';
  progress?: number;
}

export const OfflineManager: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [offlineContent, setOfflineContent] = useState<OfflineContent[]>([]);
  const [downloadQueue, setDownloadQueue] = useState<string[]>([]);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageQuota, setStorageQuota] = useState(0);

  useEffect(() => {
    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    // Get storage quota
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        setStorageUsed(estimate.usage || 0);
        setStorageQuota(estimate.quota || 0);
      });
    }

    // Load offline content from IndexedDB
    loadOfflineContent();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineContent = async () => {
    try {
      const db = await openOfflineDB();
      const tx = db.transaction('offlineContent', 'readonly');
      const store = tx.objectStore('offlineContent');

      const content = await new Promise<any[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      setOfflineContent(
        content.map(item => ({
          ...item,
          downloadedAt: new Date(item.downloadedAt),
          lastAccessed: new Date(item.lastAccessed),
        }))
      );
    } catch (error) {
      console.error('Failed to load offline content:', error);
    }
  };

  const downloadContent = async (contentId: string, contentType: string) => {
    if (downloadQueue.includes(contentId)) return;

    setDownloadQueue(prev => [...prev, contentId]);

    try {
      // Simulate download process
      const response = await fetch(`/api/v1/offline/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, contentType }),
      });

      if (!response.ok) throw new Error('Download failed');

      const data = await response.json();

      // Store in IndexedDB
      const db = await openOfflineDB();
      const tx = db.transaction('offlineContent', 'readwrite');
      const store = tx.objectStore('offlineContent');

      await store.put({
        id: contentId,
        title: data.title,
        type: contentType,
        size: data.size,
        downloadedAt: new Date(),
        lastAccessed: new Date(),
        status: 'downloaded',
        data: data.content,
      });

      toast.success(`${data.title} downloaded for offline use`);
      loadOfflineContent();
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download content');
    } finally {
      setDownloadQueue(prev => prev.filter(id => id !== contentId));
    }
  };

  const deleteOfflineContent = async (contentId: string) => {
    try {
      const db = await openOfflineDB();
      const tx = db.transaction('offlineContent', 'readwrite');
      const store = tx.objectStore('offlineContent');

      await store.delete(contentId);

      setOfflineContent(prev => prev.filter(item => item.id !== contentId));
      toast.success('Offline content deleted');
    } catch (error) {
      console.error('Failed to delete content:', error);
      toast.error('Failed to delete content');
    }
  };

  const syncOfflineData = async () => {
    if (!isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;

        const syncManager = (
          registration as ServiceWorkerRegistration & {
            sync?: {
              register: (tag: string) => Promise<void>;
            };
          }
        ).sync;

        if (syncManager) {
          await syncManager.register('sync-offline-actions');
          await syncManager.register('sync-progress');

          toast.success('Sync started in background');
        } else {
          toast.error('Background sync not supported');
        }
      } else {
        toast.error('Service workers not supported');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Failed to start sync');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const storagePercentage =
    storageQuota > 0 ? (storageUsed / storageQuota) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-500" />
                )}
                Offline Manager
              </CardTitle>
              <CardDescription>
                {isOnline ? 'Connected to internet' : 'Working offline'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isOnline ? 'default' : 'destructive'}>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
              {isOnline && (
                <Button onClick={syncOfflineData} variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Usage</CardTitle>
          <CardDescription>
            Local storage used for offline content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used: {formatBytes(storageUsed)}</span>
              <span>Available: {formatBytes(storageQuota - storageUsed)}</span>
            </div>
            <Progress value={storagePercentage} />
            <div className="text-xs text-muted-foreground">
              {storagePercentage.toFixed(1)}% of {formatBytes(storageQuota)}{' '}
              used
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offline Content */}
      <Card>
        <CardHeader>
          <CardTitle>Downloaded Content</CardTitle>
          <CardDescription>
            Content available for offline access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {offlineContent.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Download className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No offline content downloaded</p>
              <p className="text-sm">
                Download courses and lessons to access them offline
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {offlineContent.map(content => (
                <div
                  key={content.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {content.status === 'downloaded' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : content.status === 'downloading' ? (
                        <Clock className="h-5 w-5 text-blue-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{content.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="capitalize">{content.type}</span>
                        <span>{formatBytes(content.size)}</span>
                        <span>
                          Downloaded {content.downloadedAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {content.status === 'downloading' && content.progress && (
                      <div className="w-20">
                        <Progress value={content.progress} />
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteOfflineContent(content.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Download Queue */}
      {downloadQueue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Download Queue</CardTitle>
            <CardDescription>
              Content currently being downloaded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {downloadQueue.map(contentId => (
                <div key={contentId} className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">
                    Downloading content {contentId}...
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Helper function to open IndexedDB
async function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('lms-ai-offline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = event => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('offlineContent')) {
        const store = db.createObjectStore('offlineContent', { keyPath: 'id' });
        store.createIndex('type', 'type');
        store.createIndex('downloadedAt', 'downloadedAt');
      }
    };
  });
}
