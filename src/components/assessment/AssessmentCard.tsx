'use client';

import { useRouter } from 'next/navigation';
import { Assessment } from '@/lib/types/assessment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Trophy,
  CheckCircle,
  Lock,
  Play,
  Calendar,
  Target,
  Shield,
  HelpCircle,
  FileText,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface AssessmentCardProps {
  assessment: Assessment & {
    attemptCount?: number;
    attemptsLeft?: number;
    isAvailable?: boolean;
    canTakeNow?: boolean;
  };
  className?: string;
  compact?: boolean;
}

export function AssessmentCard({ 
  assessment, 
  className,
  compact = false 
}: AssessmentCardProps) {
  const router = useRouter();

  const getAssessmentTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return <HelpCircle className="h-4 w-4" />;
      case 'exam':
      case 'final_exam':
      case 'midterm':
        return <FileText className="h-4 w-4" />;
      case 'assignment':
      case 'project':
        return <Target className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getStatusInfo = () => {
    if (!assessment.isAvailable) {
      return {
        status: 'unavailable',
        label: 'Không khả dụng',
        color: 'text-gray-600 bg-gray-50 border-gray-200',
        icon: <Lock className="h-4 w-4" />,
      };
    }

    if (assessment.attemptCount && assessment.attemptCount >= assessment.maxAttempts) {
      return {
        status: 'completed',
        label: 'Đã hoàn thành',
        color: 'text-green-600 bg-green-50 border-green-200',
        icon: <CheckCircle className="h-4 w-4" />,
      };
    }

    if (assessment.canTakeNow) {
      return {
        status: 'available',
        label: 'Sẵn sàng',
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        icon: <Play className="h-4 w-4" />,
      };
    }

    return {
      status: 'pending',
      label: 'Chờ',
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      icon: <AlertCircle className="h-4 w-4" />,
    };
  };

  const statusInfo = getStatusInfo();

  const handleStartAssessment = () => {
    router.push(`/student/assessments/${assessment.id}/take`);
  };

  const handleViewResults = () => {
    router.push(`/student/assessments/${assessment.id}/results`);
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      quiz: 'Quiz',
      exam: 'Exam',
      final_exam: 'Final',
      midterm: 'Midterm',
      assignment: 'Assignment',
      project: 'Project',
      practice: 'Practice',
    };
    return types[type] || 'Quiz';
  };

  if (compact) {
    return (
      <div className={cn(
        'flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50',
        className
      )}>
        <div className={cn('rounded p-2', statusInfo.color)}>
          {statusInfo.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="truncate text-sm font-medium">{assessment.title}</h4>
            <Badge variant="outline" className="text-xs">
              {getTypeLabel(assessment.assessmentType)}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {assessment.timeLimit && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {assessment.timeLimit}m
              </span>
            )}
            <span className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              {assessment.totalPoints}pts
            </span>
          </div>
        </div>
        {assessment.canTakeNow && (
          <Button size="sm" onClick={handleStartAssessment}>
            <Play className="mr-1 h-3 w-3" />
            Bắt đầu
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={cn('overflow-hidden transition-shadow hover:shadow-md', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-2 text-lg mb-1">
              {getAssessmentTypeIcon(assessment.assessmentType)}
              <span className="truncate">{assessment.title}</span>
            </CardTitle>
            {assessment.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {assessment.description}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant="outline">
              {getTypeLabel(assessment.assessmentType)}
            </Badge>
            {assessment.isMandatory && (
              <Badge variant="destructive" className="text-xs">
                Bắt buộc
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status */}
        <div className={cn('flex items-center gap-2 rounded-lg border p-3', statusInfo.color)}>
          {statusInfo.icon}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">{statusInfo.label}</div>
            <div className="text-xs opacity-90">
              {assessment.attemptCount !== undefined 
                ? `${assessment.attemptCount}/${assessment.maxAttempts} lần thử`
                : `${assessment.maxAttempts} lần thử`
              }
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            {assessment.timeLimit && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{assessment.timeLimit} phút</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-gray-400" />
              <span>{assessment.totalPoints} điểm</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-400" />
              <span>{assessment.passingScore}% để đạt</span>
            </div>
            {assessment.isProctored && (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-400" />
                <span>Có giám sát</span>
              </div>
            )}
          </div>
        </div>

        {/* Deadline */}
        {assessment.availableUntil && (
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <Calendar className="h-4 w-4" />
            <span>
              Hạn: {format(new Date(assessment.availableUntil), 'dd/MM/yyyy HH:mm')}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {assessment.attemptCount && assessment.attemptCount > 0 ? (
            // Has attempts - show both View Results and Start/Retake
            <>
              <Button variant="outline" className="flex-1" onClick={handleViewResults}>
                <Eye className="mr-2 h-4 w-4" />
                View Results
              </Button>
              {assessment.attemptCount < assessment.maxAttempts && assessment.canTakeNow && (
                <Button className="flex-1" onClick={handleStartAssessment}>
                  <Play className="mr-2 h-4 w-4" />
                  Retake ({assessment.attemptCount + 1}/{assessment.maxAttempts})
                </Button>
              )}
            </>
          ) : assessment.canTakeNow ? (
            // No attempts yet - show Start button  
            <Button className="flex-1" onClick={handleStartAssessment}>
              <Play className="mr-2 h-4 w-4" />
              Start
            </Button>
          ) : (
            // Assessment not available - show disabled button
            <Button disabled className="flex-1">
              <Lock className="mr-2 h-4 w-4" />
              {statusInfo.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}