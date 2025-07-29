'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, AlertTriangle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssessmentTimerProps {
  timeLimit?: number; // in minutes
  timeSpent: number; // in seconds
  onTimeUp: () => void;
  onWarning?: (minutesLeft: number) => void;
  className?: string;
}

export function AssessmentTimer({
  timeLimit,
  timeSpent,
  onTimeUp,
  onWarning,
  className,
}: AssessmentTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showWarning, setShowWarning] = useState(false);
  const [showCritical, setShowCritical] = useState(false);
  const warningTriggered = useRef(false);
  const criticalTriggered = useRef(false);

  useEffect(() => {
    if (!timeLimit) return;

    const totalSeconds = timeLimit * 60;
    const remaining = Math.max(0, totalSeconds - timeSpent);
    setTimeRemaining(remaining);

    // Time warnings
    const minutesLeft = Math.floor(remaining / 60);

    // 10 minute warning
    if (minutesLeft <= 10 && minutesLeft > 5 && !warningTriggered.current) {
      setShowWarning(true);
      warningTriggered.current = true;
      onWarning?.(minutesLeft);
    }

    // 5 minute critical warning
    if (minutesLeft <= 5 && !criticalTriggered.current) {
      setShowCritical(true);
      criticalTriggered.current = true;
      onWarning?.(minutesLeft);
    }

    // Time up
    if (remaining <= 0) {
      onTimeUp();
    }
  }, [timeLimit, timeSpent, onTimeUp, onWarning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeStatus = () => {
    if (!timeLimit) return 'unlimited';

    const percentage = (timeRemaining / (timeLimit * 60)) * 100;

    if (percentage <= 10) return 'critical';
    if (percentage <= 25) return 'warning';
    return 'normal';
  };

  const getStatusColor = () => {
    switch (getTimeStatus()) {
      case 'critical':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-green-400';
    }
  };

  const getProgressColor = () => {
    switch (getTimeStatus()) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  if (!timeLimit) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Clock className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-400">
          No time limit • {formatTime(timeSpent)} elapsed
        </span>
      </div>
    );
  }

  const progressPercentage = Math.max(
    0,
    (timeRemaining / (timeLimit * 60)) * 100
  );
  const isBlinking = getTimeStatus() === 'critical';

  return (
    <div className={cn('space-y-2', className)}>
      {/* Timer Display */}
      <Card className="border-gray-700 bg-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className={cn('h-4 w-4', getStatusColor())} />
              <span className="text-sm text-gray-400">Time Remaining</span>
            </div>

            <div
              className={cn(
                'font-mono text-xl font-bold',
                getStatusColor(),
                isBlinking && 'animate-pulse'
              )}
            >
              {formatTime(timeRemaining)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <Progress value={progressPercentage} className="h-2" />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>0:00</span>
              <span>{formatTime(timeLimit * 60)}</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-3 flex justify-center">
            <Badge
              variant={
                getTimeStatus() === 'critical'
                  ? 'destructive'
                  : getTimeStatus() === 'warning'
                    ? 'default'
                    : 'secondary'
              }
              className={cn('text-xs', isBlinking && 'animate-pulse')}
            >
              {getTimeStatus() === 'critical' && (
                <>
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Critical
                </>
              )}
              {getTimeStatus() === 'warning' && (
                <>
                  <Zap className="mr-1 h-3 w-3" />
                  Low Time
                </>
              )}
              {getTimeStatus() === 'normal' && (
                <>
                  <Clock className="mr-1 h-3 w-3" />
                  On Track
                </>
              )}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Warning Alerts */}
      {showCritical && (
        <Alert className="animate-pulse border-red-500 bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            <strong>Critical:</strong> Only 5 minutes remaining! Consider
            reviewing and submitting your answers.
          </AlertDescription>
        </Alert>
      )}

      {showWarning && !showCritical && (
        <Alert className="border-yellow-500 bg-yellow-900/20">
          <Zap className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-300">
            <strong>Warning:</strong> 10 minutes remaining. Please manage your
            time wisely.
          </AlertDescription>
        </Alert>
      )}

      {/* Time Statistics */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded bg-gray-800 p-2 text-center">
          <div className="text-gray-400">Elapsed</div>
          <div className="font-mono text-white">{formatTime(timeSpent)}</div>
        </div>
        <div className="rounded bg-gray-800 p-2 text-center">
          <div className="text-gray-400">Progress</div>
          <div className="font-mono text-white">
            {Math.round(100 - progressPercentage)}%
          </div>
        </div>
      </div>
    </div>
  );
}
