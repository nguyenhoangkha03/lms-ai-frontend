'use client';

import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface QualityMetrics {
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor';
  audioQuality: {
    bitrate: number;
    packetLoss: number;
    jitter: number;
  };
  videoQuality: {
    resolution: string;
    frameRate: number;
    bitrate: number;
    packetLoss: number;
  };
  connection: {
    rtt: number; // Round-trip time
    bandwidth: number;
    connectionType: string;
  };
  cpu: number;
  memory: number;
}

interface QualityIndicatorProps {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  metrics?: QualityMetrics;
  className?: string;
  showDetails?: boolean;
}

export function QualityIndicator({
  quality,
  metrics,
  className,
  showDetails = false,
}: QualityIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [recentIssues, setRecentIssues] = useState<string[]>([]);

  // Mock real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate quality issues
      if (quality === 'poor' || quality === 'fair') {
        const issues = [];
        if (metrics!.audioQuality!.packetLoss > 5) {
          issues.push('High audio packet loss detected');
        }
        if (metrics!.videoQuality!.packetLoss! > 3) {
          issues.push('Video quality degraded');
        }
        if (metrics!.connection!.rtt! > 200) {
          issues.push('High network latency');
        }
        if (metrics!.cpu! > 80) {
          issues.push('High CPU usage');
        }
        setRecentIssues(issues);
      } else {
        setRecentIssues([]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [quality, metrics]);

  // Get quality color
  const getQualityColor = (q: typeof quality) => {
    switch (q) {
      case 'excellent':
        return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'good':
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'fair':
        return 'text-orange-400 bg-orange-400/20 border-orange-400/30';
      case 'poor':
        return 'text-red-400 bg-red-400/20 border-red-400/30';
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  // Get quality icon
  const getQualityIcon = (q: typeof quality) => {
    switch (q) {
      case 'excellent':
        return Signal;
      case 'good':
        return SignalHigh;
      case 'fair':
        return SignalMedium;
      case 'poor':
        return SignalLow;
      default:
        return WifiOff;
    }
  };

  // Get status icon
  const getStatusIcon = (q: typeof quality) => {
    switch (q) {
      case 'excellent':
      case 'good':
        return CheckCircle;
      case 'fair':
        return AlertTriangle;
      case 'poor':
        return XCircle;
      default:
        return AlertTriangle;
    }
  };

  const QualityIcon = getQualityIcon(quality);
  const StatusIcon = getStatusIcon(quality);

  // Format bandwidth
  const formatBandwidth = (bps: number) => {
    if (bps >= 1000000) {
      return `${(bps / 1000000).toFixed(1)} Mbps`;
    } else if (bps >= 1000) {
      return `${(bps / 1000).toFixed(0)} Kbps`;
    }
    return `${bps} bps`;
  };

  if (!showDetails) {
    // Compact indicator
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center space-x-1', className)}>
            <QualityIcon
              className={cn('h-4 w-4', getQualityColor(quality).split(' ')[0])}
            />
            {recentIssues.length > 0 && (
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">Connection: {quality}</p>
            {metrics && (
              <>
                <p className="text-xs">RTT: {metrics.connection.rtt}ms</p>
                <p className="text-xs">
                  Bandwidth: {formatBandwidth(metrics.connection.bandwidth)}
                </p>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Detailed quality panel
  return (
    <Card className={cn('w-80', className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <QualityIcon
              className={cn('h-5 w-5', getQualityColor(quality).split(' ')[0])}
            />
            <h3 className="font-semibold">Connection Quality</h3>
          </div>
          <Badge className={getQualityColor(quality)}>
            {quality.toUpperCase()}
          </Badge>
        </div>

        {/* Overall Status */}
        <div className="mb-4 flex items-center space-x-2">
          <StatusIcon
            className={cn('h-4 w-4', getQualityColor(quality).split(' ')[0])}
          />
          <span className="text-sm font-medium">
            {quality === 'excellent' && 'Excellent connection quality'}
            {quality === 'good' && 'Good connection quality'}
            {quality === 'fair' &&
              'Fair connection quality - some issues detected'}
            {quality === 'poor' &&
              'Poor connection quality - significant issues'}
          </span>
        </div>

        {/* Recent Issues */}
        {recentIssues.length > 0 && (
          <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
            <div className="mb-2 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-500">
                Recent Issues
              </span>
            </div>
            <ul className="space-y-1 text-xs text-amber-600 dark:text-amber-400">
              {recentIssues.map((issue, index) => (
                <li key={index}>• {issue}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Detailed Metrics */}
        {metrics && (
          <div className="space-y-4">
            {/* Network */}
            <div>
              <h4 className="mb-2 flex items-center text-sm font-medium">
                <Wifi className="mr-2 h-4 w-4" />
                Network
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Round-trip time:
                  </span>
                  <span
                    className={cn(
                      metrics.connection.rtt > 200
                        ? 'text-red-400'
                        : metrics.connection.rtt > 100
                          ? 'text-yellow-400'
                          : 'text-green-400'
                    )}
                  >
                    {metrics.connection.rtt}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bandwidth:</span>
                  <span>{formatBandwidth(metrics.connection.bandwidth)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Connection type:
                  </span>
                  <span>{metrics.connection.connectionType}</span>
                </div>
              </div>
            </div>

            {/* Audio Quality */}
            <div>
              <h4 className="mb-2 flex items-center text-sm font-medium">
                <Activity className="mr-2 h-4 w-4" />
                Audio
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bitrate:</span>
                  <span>
                    {(metrics.audioQuality.bitrate / 1000).toFixed(0)} kbps
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Packet loss:</span>
                  <span
                    className={cn(
                      metrics.audioQuality.packetLoss > 5
                        ? 'text-red-400'
                        : metrics.audioQuality.packetLoss > 2
                          ? 'text-yellow-400'
                          : 'text-green-400'
                    )}
                  >
                    {metrics.audioQuality.packetLoss.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jitter:</span>
                  <span
                    className={cn(
                      metrics.audioQuality.jitter > 30
                        ? 'text-red-400'
                        : metrics.audioQuality.jitter > 20
                          ? 'text-yellow-400'
                          : 'text-green-400'
                    )}
                  >
                    {metrics.audioQuality.jitter.toFixed(0)}ms
                  </span>
                </div>
              </div>
            </div>

            {/* Video Quality */}
            <div>
              <h4 className="mb-2 flex items-center text-sm font-medium">
                <Signal className="mr-2 h-4 w-4" />
                Video
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resolution:</span>
                  <span>{metrics.videoQuality.resolution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frame rate:</span>
                  <span>{metrics.videoQuality.frameRate} fps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bitrate:</span>
                  <span>
                    {(metrics.videoQuality.bitrate / 1000000).toFixed(1)} Mbps
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Packet loss:</span>
                  <span
                    className={cn(
                      metrics.videoQuality.packetLoss > 3
                        ? 'text-red-400'
                        : metrics.videoQuality.packetLoss > 1
                          ? 'text-yellow-400'
                          : 'text-green-400'
                    )}
                  >
                    {metrics.videoQuality.packetLoss.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* System Performance */}
            <div>
              <h4 className="mb-2 flex items-center text-sm font-medium">
                <Clock className="mr-2 h-4 w-4" />
                System
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">CPU Usage:</span>
                    <span
                      className={cn(
                        metrics.cpu > 80
                          ? 'text-red-400'
                          : metrics.cpu > 60
                            ? 'text-yellow-400'
                            : 'text-green-400'
                      )}
                    >
                      {metrics.cpu.toFixed(0)}%
                    </span>
                  </div>
                  <Progress
                    value={metrics.cpu}
                    className={cn(
                      'h-2',
                      metrics.cpu > 80 && '[&>div]:bg-red-400',
                      metrics.cpu > 60 &&
                        metrics.cpu <= 80 &&
                        '[&>div]:bg-yellow-400',
                      metrics.cpu <= 60 && '[&>div]:bg-green-400'
                    )}
                  />
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">Memory Usage:</span>
                    <span
                      className={cn(
                        metrics.memory > 85
                          ? 'text-red-400'
                          : metrics.memory > 70
                            ? 'text-yellow-400'
                            : 'text-green-400'
                      )}
                    >
                      {metrics.memory.toFixed(0)}%
                    </span>
                  </div>
                  <Progress
                    value={metrics.memory}
                    className={cn(
                      'h-2',
                      metrics.memory > 85 && '[&>div]:bg-red-400',
                      metrics.memory > 70 &&
                        metrics.memory <= 85 &&
                        '[&>div]:bg-yellow-400',
                      metrics.memory <= 70 && '[&>div]:bg-green-400'
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {(quality === 'poor' || quality === 'fair') && (
          <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
            <div className="mb-2 flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-500">
                Recommendations
              </span>
            </div>
            <ul className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
              {metrics!.connection!.rtt > 200 && (
                <li>• Move closer to your router or use ethernet connection</li>
              )}
              {metrics!.audioQuality!.packetLoss > 5 && (
                <li>
                  • Consider reducing audio quality or closing other
                  applications
                </li>
              )}
              {metrics!.videoQuality!.packetLoss > 3 && (
                <li>• Try lowering video resolution or frame rate</li>
              )}
              {metrics!.cpu! > 80 && (
                <li>• Close unnecessary applications to reduce CPU usage</li>
              )}
              {metrics!.memory! > 85 && (
                <li>• Close browser tabs and applications to free up memory</li>
              )}
              <li>• Refresh the page if issues persist</li>
            </ul>
          </div>
        )}

        {/* Last Updated */}
        <div className="mt-4 border-t border-gray-700 pt-3">
          <p className="text-center text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for use in navigation bars
export function CompactQualityIndicator({
  quality,
  metrics,
  className,
}: QualityIndicatorProps) {
  const QualityIcon = getQualityIcon(quality);

  const getQualityColor = (q: typeof quality) => {
    switch (q) {
      case 'excellent':
        return 'text-green-400';
      case 'good':
        return 'text-yellow-400';
      case 'fair':
        return 'text-orange-400';
      case 'poor':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={cn(
            'flex cursor-pointer items-center space-x-1',
            className
          )}
        >
          <QualityIcon className={cn('h-4 w-4', getQualityColor(quality))} />
          <span className="text-xs font-medium">{quality}</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <QualityIndicator
          quality={quality}
          metrics={metrics}
          showDetails={true}
        />
      </PopoverContent>
    </Popover>
  );
}

// Helper function to get quality icon (moved outside component for reuse)
function getQualityIcon(quality: 'excellent' | 'good' | 'fair' | 'poor') {
  switch (quality) {
    case 'excellent':
      return Signal;
    case 'good':
      return SignalHigh;
    case 'fair':
      return SignalMedium;
    case 'poor':
      return SignalLow;
    default:
      return WifiOff;
  }
}
