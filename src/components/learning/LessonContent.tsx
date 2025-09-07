'use client';

import { useEffect, useRef } from 'react';
import { LessonContent as LessonContentType } from '@/types/learning';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTrackLearningActivityMutation } from '@/lib/redux/api/learning-api';
import { useGetLessonAssessmentsQuery } from '@/lib/redux/api/assessment-api';
import { AssessmentCard } from '@/components/assessment/AssessmentCard';
import { BookOpen, Target, CheckCircle, Clock, FileText, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonContentProps {
  lesson: LessonContentType;
  onComplete?: () => void;
  className?: string;
}

export function LessonContent({ lesson, onComplete, className }: LessonContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [trackActivity] = useTrackLearningActivityMutation();
  let scrollTimeout: NodeJS.Timeout;

  // Get lesson assessments
  const { data: lessonAssessments = [] } = useGetLessonAssessmentsQuery(lesson.id);

  // Track scrolling activity
  useEffect(() => {
    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        if (contentRef.current) {
          const element = contentRef.current;
          const scrollPercentage = Math.round(
            (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100
          );
          
          trackActivity({
            lessonId: lesson.id,
            activityType: 'content_scroll',
            metadata: { 
              scrollPercentage,
              timestamp: Date.now()
            }
          }).catch(console.error);
        }
      }, 500); // Throttle scroll events
    };

    const element = contentRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => {
        element.removeEventListener('scroll', handleScroll);
        if (scrollTimeout) clearTimeout(scrollTimeout);
      };
    }
  }, [lesson.id, trackActivity]);

  return (
    <div ref={contentRef} className={cn('space-y-6 max-h-screen overflow-y-auto', className)}>
      {/* Lesson Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Tổng quan bài học
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {lesson.description && (
            <p className="leading-relaxed text-gray-700">
              {lesson.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lesson.estimatedDuration} phút
            </Badge>
            <Badge variant="outline">
              {lesson.lessonType === 'video' && 'Video'}
              {lesson.lessonType === 'text' && 'Đọc hiểu'}
              {lesson.lessonType === 'quiz' && 'Bài tập'}
              {lesson.lessonType === 'assignment' && 'Bài tập lớn'}
              {lesson.lessonType === 'interactive' && 'Tương tác'}
            </Badge>
            {lesson.isMandatory && (
              <Badge variant="destructive">Bắt buộc</Badge>
            )}
            {lesson.isPreview && <Badge variant="secondary">Xem trước</Badge>}
          </div>
        </CardContent>
      </Card>

      {/* Learning Objectives */}
      {lesson.objectives && lesson.objectives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Mục tiêu học tập
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {lesson.objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                  <span className="text-gray-700">{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Prerequisites */}
      {lesson.prerequisites && lesson.prerequisites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Kiến thức cần có
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {lesson.prerequisites.map((prerequisite, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                  <span className="text-gray-700">{prerequisite}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Text Content */}
      {lesson.content && lesson.lessonType === 'text' && (
        <Card>
          <CardHeader>
            <CardTitle>Nội dung bài học</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none leading-relaxed text-gray-700"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </CardContent>
        </Card>
      )}

      {/* Transcript for Video Lessons */}
      {lesson.transcript && lesson.lessonType === 'video' && (
        <Card>
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed text-gray-700">
              {lesson.transcript}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lesson Assessments */}
      {lessonAssessments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Bài kiểm tra liên quan ({lessonAssessments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Hoàn thành các bài kiểm tra này để củng cố kiến thức vừa học
            </p>
            <div className="space-y-3">
              {lessonAssessments.map((assessment) => (
                <AssessmentCard 
                  key={assessment.id} 
                  assessment={assessment} 
                  compact={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Lesson Button */}
      {onComplete && (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="mb-2 text-lg font-semibold">Lesson Complete!</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Mark this lesson as complete to track your progress
            </p>
            <Button onClick={onComplete} className="w-full">
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Complete
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
