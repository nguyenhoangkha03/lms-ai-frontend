// src/components/pwa/PWAManager.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  Wifi,
  WifiOff,
  RefreshCw,
  X,
  Smartphone,
  Monitor,
  Chrome,
  Share,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useMobile } from '@/hooks/use-mobile';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAManagerProps {
  className?: string;
}

export function PWAManager({ className }: PWAManagerProps) {
  const { isMobile, isOnline, canShare } = useMobile();

  // PWA Installation
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Service Worker
  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Offline mode
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [offlineCache, setOfflineCache] = useState<{
    courses: number;
    lessons: number;
    resources: number;
  }>({ courses: 0, lessons: 0, resources: 0 });

  // Initialize PWA features
  useEffect(() => {
    initializePWA();
  }, []);

  const initializePWA = async () => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);

      // Show install banner for mobile users after some delay
      if (isMobile) {
        setTimeout(() => {
          setShowInstallBanner(true);
        }, 30000); // Show after 30 seconds
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        setSwRegistration(registration);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                setUpdateAvailable(true);
                toast.info('App update available! Click to refresh.');
              }
            });
          }
        });

        // Check offline readiness
        checkOfflineCapabilities();
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  };

  const checkOfflineCapabilities = async () => {
    if (!('caches' in window)) return;

    try {
      const cacheNames = await caches.keys();
      let totalCached = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        totalCached += requests.length;
      }

      if (totalCached > 0) {
        setIsOfflineReady(true);
        // Mock cache stats - in real app, would track specific content types
        setOfflineCache({
          courses: Math.floor(totalCached * 0.3),
          lessons: Math.floor(totalCached * 0.5),
          resources: Math.floor(totalCached * 0.2),
        });
      }
    } catch (error) {
      console.error('Error checking offline capabilities:', error);
    }
  };

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallBanner(false);
        toast.success('App installed successfully!');
      }

      setInstallPrompt(null);
    } catch (error) {
      console.error('Installation failed:', error);
      toast.error('Installation failed. Please try again.');
    }
  };

  const handleUpdateClick = async () => {
    if (!swRegistration?.waiting) return;

    setIsUpdating(true);

    try {
      // Skip waiting and activate new service worker
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // Listen for controlling service worker change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Update failed. Please refresh manually.');
      setIsUpdating(false);
    }
  };

  const shareApp = async () => {
    if (!canShare) return;

    try {
      await navigator.share({
        title: 'LMS AI - Smart Learning Platform',
        text: 'Check out this amazing AI-powered learning platform!',
        url: window.location.origin,
      });
    } catch (error) {
      // Fallback to copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.origin);
        toast.success('Link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Share failed:', error);
      }
    }
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const clearOfflineCache = async () => {
    if (!('caches' in window)) return;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));

      setIsOfflineReady(false);
      setOfflineCache({ courses: 0, lessons: 0, resources: 0 });
      toast.success('Offline cache cleared successfully!');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast.error('Failed to clear offline cache.');
    }
  };

  return (
    <div className={className}>
      {/* Install Banner */}
      {showInstallBanner && installPrompt && !isInstalled && (
        <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-1 items-center gap-2">
                <Smartphone className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Install LMS AI</p>
                  <p className="text-xs text-muted-foreground">
                    Get the full app experience with offline access
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleInstallClick}>
                  Install
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissInstallBanner}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update Available Banner */}
      {updateAvailable && !isUpdating && (
        <Alert className="fixed left-4 right-4 top-4 z-50 shadow-lg">
          <RefreshCw className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              New version available! Update now for the latest features.
            </span>
            <Button size="sm" onClick={handleUpdateClick}>
              Update
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Offline Status */}
      <div className="fixed right-4 top-4 z-40">
        <Badge
          variant={isOnline ? 'default' : 'destructive'}
          className="flex items-center gap-1"
        >
          {isOnline ? (
            <Wifi className="h-3 w-3" />
          ) : (
            <WifiOff className="h-3 w-3" />
          )}
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
      </div>

      {/* PWA Management Panel (for settings/debug) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              PWA Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Installation Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Installation Status</span>
              <Badge variant={isInstalled ? 'default' : 'secondary'}>
                {isInstalled ? 'Installed' : 'Not Installed'}
              </Badge>
            </div>

            {/* Install Button */}
            {!isInstalled && installPrompt && (
              <Button
                onClick={handleInstallClick}
                className="w-full"
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Install App
              </Button>
            )}

            {/* Share Button */}
            {canShare && (
              <Button onClick={shareApp} className="w-full" variant="outline">
                <Share className="mr-2 h-4 w-4" />
                Share App
              </Button>
            )}

            {/* Offline Capabilities */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Offline Ready</span>
                <Badge variant={isOfflineReady ? 'default' : 'secondary'}>
                  {isOfflineReady ? 'Yes' : 'No'}
                </Badge>
              </div>

              {isOfflineReady && (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded bg-muted p-2 text-center">
                    <div className="font-medium">{offlineCache.courses}</div>
                    <div className="text-muted-foreground">Courses</div>
                  </div>
                  <div className="rounded bg-muted p-2 text-center">
                    <div className="font-medium">{offlineCache.lessons}</div>
                    <div className="text-muted-foreground">Lessons</div>
                  </div>
                  <div className="rounded bg-muted p-2 text-center">
                    <div className="font-medium">{offlineCache.resources}</div>
                    <div className="text-muted-foreground">Resources</div>
                  </div>
                </div>
              )}
            </div>

            {/* Service Worker Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Service Worker</span>
              <Badge variant={swRegistration ? 'default' : 'destructive'}>
                {swRegistration ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            {/* Update Available */}
            {updateAvailable && (
              <Button
                onClick={handleUpdateClick}
                disabled={isUpdating}
                className="w-full"
                variant="default"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Update Available
                  </>
                )}
              </Button>
            )}

            {/* Clear Cache */}
            {isOfflineReady && (
              <Button
                onClick={clearOfflineCache}
                className="w-full"
                variant="destructive"
                size="sm"
              >
                Clear Offline Cache
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Hook for PWA features
export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check installation status
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Network status
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const requestInstall = useCallback(() => {
    // This would typically be handled by the PWAManager component
    // But can be used to trigger install from other components
    window.dispatchEvent(new CustomEvent('pwa-install-request'));
  }, []);

  const checkForUpdates = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.update();
      }
    }
  }, []);

  return {
    isInstalled,
    updateAvailable,
    isOnline,
    requestInstall,
    checkForUpdates,
  };
}
