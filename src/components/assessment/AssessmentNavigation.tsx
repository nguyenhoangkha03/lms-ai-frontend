'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssessmentNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  allowBackNavigation: boolean;
  isLastQuestion: boolean;
  hasAnsweredCurrent: boolean;
  className?: string;
}

export function AssessmentNavigation({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  onSubmit,
  allowBackNavigation,
  isLastQuestion,
  hasAnsweredCurrent,
  className,
}: AssessmentNavigationProps) {
  const canGoPrevious = allowBackNavigation && currentQuestion > 0;
  const canGoNext = currentQuestion < totalQuestions - 1;
  const showSubmitWarning = isLastQuestion && !hasAnsweredCurrent;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        <Badge variant="outline" className="border-blue-400 text-blue-400">
          Question {currentQuestion + 1} of {totalQuestions}
        </Badge>
        <div className="text-sm text-gray-400">
          Progress: {Math.round(((currentQuestion + 1) / totalQuestions) * 100)}
          %
        </div>
      </div>

      {/* Warning for unanswered last question */}
      {showSubmitWarning && (
        <Alert className="border-yellow-500 bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-300">
            You haven't answered this question yet. Are you sure you want to
            submit the assessment?
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {!allowBackNavigation && currentQuestion > 0 && (
            <div className="text-xs text-gray-500">
              Back navigation disabled
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isLastQuestion ? (
            <Button
              onClick={onNext}
              disabled={!canGoNext}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={onSubmit}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <Send className="mr-2 h-4 w-4" />
              Submit Assessment
            </Button>
          )}
        </div>
      </div>

      {/* Answer Status */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm">
          {hasAnsweredCurrent ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-green-400">Question answered</span>
            </>
          ) : (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-gray-600"></div>
              <span className="text-gray-400">Question not answered</span>
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
        <div>Use arrow keys to navigate</div>
        <div>•</div>
        <div>Ctrl+Enter to submit answer</div>
      </div>
    </div>
  );
}
