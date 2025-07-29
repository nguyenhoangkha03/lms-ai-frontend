'use client';

import { useState, useEffect } from 'react';
import { useGetSessionAnalyticsQuery } from '@/lib/redux/api/assessment-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  MousePointer,
  Keyboard,
  Monitor,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityMonitorProps {
  sessionId: string;
  tabSwitchCount: number;
  windowBlurCount: number;
  securityWarnings: string[];
  className?: string;
}

export function SecurityMonitor({
  sessionId,
  tabSwitchCount,
  windowBlurCount,
  securityWarnings,
  className,
}: SecurityMonitorProps) {
  const [securityScore, setSecurityScore] = useState(100);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');

  const { data: analytics } = useGetSessionAnalyticsQuery(sessionId, {
    pollingInterval: 10000, // Poll every 10 seconds
  });

  useEffect(() => {
    // Calculate security score based on violations
    let score = 100;
    let risk: 'low' | 'medium' | 'high' = 'low';

    // Deduct points for various violations
    score -= tabSwitchCount * 5;
    score -= windowBlurCount * 3;
    score -= securityWarnings.length * 10;
    score -= (analytics?.securityEvents.length || 0) * 8;

    // Focus loss penalty
    score -= (analytics?.focusLossCount || 0) * 2;

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    // Determine risk level
    if (score < 30) risk = 'high';
    else if (score < 70) risk = 'medium';
    else risk = 'low';

    setSecurityScore(score);
    setRiskLevel(risk);
  }, [tabSwitchCount, windowBlurCount, securityWarnings.length, analytics]);

  const getScoreColor = () => {
    if (securityScore >= 80) return 'text-green-400';
    if (securityScore >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskBadgeColor = () => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-red-500';
    }
  };

  const getSecurityIcon = () => {
    switch (riskLevel) {
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'high':
        return <XCircle className="h-4 w-4 text-red-400" />;
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main Security Status */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            {getSecurityIcon()}
            Security Monitor
            <Badge className={cn('text-xs text-white', getRiskBadgeColor())}>
              {riskLevel.toUpperCase()} RISK
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Security Score */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-400">Integrity Score</span>
              <span className={cn('text-lg font-bold', getScoreColor())}>
                {securityScore}/100
              </span>
            </div>
            <Progress value={securityScore} className="h-2" />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded bg-gray-700 p-2">
              <div className="text-gray-400">Tab Switches</div>
              <div
                className={cn(
                  'font-bold',
                  tabSwitchCount > 3 ? 'text-red-400' : 'text-green-400'
                )}
              >
                {tabSwitchCount}
              </div>
            </div>
            <div className="rounded bg-gray-700 p-2">
              <div className="text-gray-400">Focus Loss</div>
              <div
                className={cn(
                  'font-bold',
                  windowBlurCount > 5 ? 'text-red-400' : 'text-green-400'
                )}
              >
                {windowBlurCount}
              </div>
            </div>
          </div>

          {/* Real-time Activity */}
          {analytics && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Activity className="h-3 w-3 text-blue-400" />
                <span className="text-gray-400">Activity Monitoring</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <MousePointer className="mx-auto mb-1 h-4 w-4 text-blue-400" />
                  <div className="text-gray-400">Mouse</div>
                  <div className="font-mono text-white">
                    {analytics.suspiciousActivityScore < 30
                      ? 'Normal'
                      : 'Irregular'}
                  </div>
                </div>
                <div className="text-center">
                  <Keyboard className="mx-auto mb-1 h-4 w-4 text-green-400" />
                  <div className="text-gray-400">Typing</div>
                  <div className="font-mono text-white">Active</div>
                </div>
                <div className="text-center">
                  <Monitor className="mx-auto mb-1 h-4 w-4 text-purple-400" />
                  <div className="text-gray-400">Screen</div>
                  <div className="font-mono text-white">Focused</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Warnings */}
      {securityWarnings.length > 0 && (
        <Alert className="border-yellow-500 bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertDescription>
            <div className="text-yellow-300">
              <div className="mb-1 font-medium">Security Events Detected:</div>
              <ul className="space-y-1 text-xs">
                {securityWarnings.slice(-3).map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
              {securityWarnings.length > 3 && (
                <div className="mt-1 text-xs opacity-75">
                  +{securityWarnings.length - 3} more events
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* High Risk Alert */}
      {riskLevel === 'high' && (
        <Alert className="animate-pulse border-red-500 bg-red-900/20">
          <XCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            <div className="font-medium">High Risk Detected!</div>
            <div className="mt-1 text-xs">
              Multiple security violations detected. This session may be flagged
              for manual review.
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Analytics Summary */}
      {analytics && (
        <Card className="border-gray-700 bg-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-gray-400">
              Session Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Questions Answered:</span>
              <span className="text-white">
                {analytics.questionsAnswered}/{analytics.totalQuestions}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg. Time/Question:</span>
              <span className="text-white">
                {Math.round(analytics.averageTimePerQuestion)}s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Security Events:</span>
              <span
                className={cn(
                  'font-medium',
                  analytics.securityEvents.length > 5
                    ? 'text-red-400'
                    : 'text-green-400'
                )}
              >
                {analytics.securityEvents.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Suspicion Score:</span>
              <span
                className={cn(
                  'font-medium',
                  analytics.suspiciousActivityScore > 70
                    ? 'text-red-400'
                    : analytics.suspiciousActivityScore > 40
                      ? 'text-yellow-400'
                      : 'text-green-400'
                )}
              >
                {analytics.suspiciousActivityScore}/100
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Status Indicators */}
      <div className="flex gap-2">
        <div className="flex items-center gap-1 text-xs">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
          <span className="text-gray-400">Monitoring Active</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Eye className="h-3 w-3 text-blue-400" />
          <span className="text-gray-400">AI Oversight</span>
        </div>
      </div>
    </div>
  );
}
