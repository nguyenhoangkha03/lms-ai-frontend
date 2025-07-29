'use client';

import { LessonContent as LessonContentType } from '@/types/learning';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, CheckCircle, Clock, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonContentProps {
  lesson: LessonContentType;
  className?: string;
}

export function LessonContent({ lesson, className }: LessonContentProps) {
  return (
    <div className={cn('space-y-6', className)}>
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
    </div>
  );
}
