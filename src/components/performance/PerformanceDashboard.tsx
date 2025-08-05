'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { usePerformance } from './PerformanceProvider';
import { PerformanceMetrics } from '@/lib/performance/code-splitting';
import { RefreshCw, Zap, Clock, Eye, TrendingUp } from 'lucide-react';

export const PerformanceDashboard: React.FC = () => {
  const { monitor, cache, serviceWorker } = usePerformance();
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
  const [cacheStats, setCacheStats] = useState({
    hitRate: 0,
    totalKeys: 0,
    memoryUsage: 0,
  });
  const [swStatus, setSWStatus] = useState<'installing' | 'active' | 'none'>(
    'none'
  );

  useEffect(() => {
    // Get performance metrics
    const currentMetrics = monitor.getMetrics();
    setMetrics(currentMetrics);

    // Check service worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(() => {
          setSWStatus('active');
        })
        .catch(() => {
          setSWStatus('none');
        });
    }

    // Simulate cache stats (in real app, get from cache instance)
    setCacheStats({
      hitRate: 85,
      totalKeys: 247,
      memoryUsage: 12.5,
    });
  }, [monitor]);

  const getMetricStatus = (
    value: number,
    thresholds: { good: number; needs: number }
  ) => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.needs) return 'needs-improvement';
    return 'poor';
  };

  const refreshMetrics = () => {
    const currentMetrics = monitor.getMetrics();
    setMetrics(currentMetrics);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time performance metrics and optimization status
          </p>
        </div>
        <Button onClick={refreshMetrics} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Core Web Vitals */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LCP</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'N/A'}
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant={
                  metrics.lcp
                    ? getMetricStatus(metrics.lcp, {
                        good: 2500,
                        needs: 4000,
                      }) === 'good'
                      ? 'default'
                      : getMetricStatus(metrics.lcp, {
                            good: 2500,
                            needs: 4000,
                          }) === 'needs-improvement'
                        ? 'secondary'
                        : 'destructive'
                    : 'outline'
                }
              >
                {metrics.lcp
                  ? getMetricStatus(metrics.lcp, { good: 2500, needs: 4000 })
                  : 'measuring'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Largest Contentful Paint
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FID</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.fid ? `${Math.round(metrics.fid)}ms` : 'N/A'}
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant={
                  metrics.fid
                    ? getMetricStatus(metrics.fid, {
                        good: 100,
                        needs: 300,
                      }) === 'good'
                      ? 'default'
                      : getMetricStatus(metrics.fid, {
                            good: 100,
                            needs: 300,
                          }) === 'needs-improvement'
                        ? 'secondary'
                        : 'destructive'
                    : 'outline'
                }
              >
                {metrics.fid
                  ? getMetricStatus(metrics.fid, { good: 100, needs: 300 })
                  : 'measuring'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">First Input Delay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CLS</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant={
                  metrics.cls
                    ? getMetricStatus(metrics.cls, {
                        good: 0.1,
                        needs: 0.25,
                      }) === 'good'
                      ? 'default'
                      : getMetricStatus(metrics.cls, {
                            good: 0.1,
                            needs: 0.25,
                          }) === 'needs-improvement'
                        ? 'secondary'
                        : 'destructive'
                    : 'outline'
                }
              >
                {metrics.cls
                  ? getMetricStatus(metrics.cls, { good: 0.1, needs: 0.25 })
                  : 'measuring'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Cumulative Layout Shift
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TTFB</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : 'N/A'}
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant={
                  metrics.ttfb
                    ? getMetricStatus(metrics.ttfb, {
                        good: 800,
                        needs: 1800,
                      }) === 'good'
                      ? 'default'
                      : getMetricStatus(metrics.ttfb, {
                            good: 800,
                            needs: 1800,
                          }) === 'needs-improvement'
                        ? 'secondary'
                        : 'destructive'
                    : 'outline'
                }
              >
                {metrics.ttfb
                  ? getMetricStatus(metrics.ttfb, { good: 800, needs: 1800 })
                  : 'measuring'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Time to First Byte</p>
          </CardContent>
        </Card>
      </div>

      {/* Cache Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Performance</CardTitle>
          <CardDescription>
            Application caching statistics and efficiency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-2xl font-bold">{cacheStats.hitRate}%</div>
              <p className="text-xs text-muted-foreground">Cache Hit Rate</p>
              <Progress value={cacheStats.hitRate} className="mt-2" />
            </div>
            <div>
              <div className="text-2xl font-bold">{cacheStats.totalKeys}</div>
              <p className="text-xs text-muted-foreground">Cached Keys</p>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {cacheStats.memoryUsage}MB
              </div>
              <p className="text-xs text-muted-foreground">Memory Usage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Worker Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Worker Status</CardTitle>
          <CardDescription>
            Offline capabilities and background sync
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge
                variant={
                  swStatus === 'active'
                    ? 'default'
                    : swStatus === 'installing'
                      ? 'secondary'
                      : 'destructive'
                }
              >
                {swStatus === 'active'
                  ? 'Active'
                  : swStatus === 'installing'
                    ? 'Installing'
                    : 'Not Available'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {swStatus === 'active' && 'Offline support enabled'}
                {swStatus === 'installing' && 'Setting up offline support'}
                {swStatus === 'none' && 'No offline support'}
              </span>
            </div>
            {swStatus === 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => serviceWorker.update()}
              >
                Check for Updates
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
