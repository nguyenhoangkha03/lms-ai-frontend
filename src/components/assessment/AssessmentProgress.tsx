'use client';

import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssessmentProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  answered: number;
  showProgress: boolean;
  className?: string;
}

export function AssessmentProgress({
  currentQuestion,
  totalQuestions,
  answered,
  showProgress,
  className,
}: AssessmentProgressProps) {
  if (!showProgress) return null;

  const progressPercentage = (currentQuestion / totalQuestions) * 100;
  const answeredPercentage = (answered / totalQuestions) * 100;
  const remainingQuestions = totalQuestions - answered;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Assessment Progress</span>
          <span className="font-medium text-gray-900">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        <Progress value={progressPercentage} className="h-3 bg-gray-200" />
      </div>

      {/* Question Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="rounded-lg bg-white border border-gray-300 p-3">
          <div className="text-2xl font-bold text-blue-400">
            {currentQuestion}
          </div>
          <div className="text-xs text-gray-600">Current</div>
        </div>

        <div className="rounded-lg bg-white border border-gray-300 p-3">
          <div className="text-2xl font-bold text-green-400">{answered}</div>
          <div className="text-xs text-gray-600">Answered</div>
        </div>

        <div className="rounded-lg bg-white border border-gray-300 p-3">
          <div className="text-2xl font-bold text-yellow-400">
            {remainingQuestions}
          </div>
          <div className="text-xs text-gray-600">Remaining</div>
        </div>
      </div>

      {/* Answered Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Questions Answered</span>
          <span className="font-medium text-gray-900">
            {answered}/{totalQuestions}
          </span>
        </div>
        <Progress value={answeredPercentage} className="h-2 bg-gray-200" />
      </div>

      {/* Quick Overview */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-400" />
            <span className="text-gray-600">Answered</span>
          </div>
          <div className="flex items-center gap-1">
            <Circle className="h-3 w-3 text-gray-500" />
            <span className="text-gray-600">Not answered</span>
          </div>
        </div>

        {remainingQuestions > 0 && (
          <Badge
            variant="outline"
            className="border-yellow-400 text-yellow-400"
          >
            {remainingQuestions} left
          </Badge>
        )}
      </div>
    </div>
  );
}
