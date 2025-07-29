'use client';

import { useState } from 'react';
import { CourseDetail } from '@/types/course';
import { useGetCourseProgressQuery } from '@/lib/redux/api/learning-api';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronRight,
  Play,
  CheckCircle,
  Clock,
  Lock,
  BookOpen,
  FileText,
  HelpCircle,
  Menu,
  X,
  Video,
  Music,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseNavigationProps {
  course: CourseDetail;
  currentLessonId: string;
  onLessonSelect: (lessonId: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function CourseNavigation({
  course,
  currentLessonId,
  onLessonSelect,
  collapsed = false,
  onToggleCollapse,
}: CourseNavigationProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(() => {
    // Initially expand the section containing current lesson
    const currentSection = course.sections.find(section =>
      section.lessons.some(lesson => lesson.id === currentLessonId)
    );
    return currentSection ? [currentSection.id] : [];
  });

  const { data: courseProgress } = useGetCourseProgressQuery(course.id);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getLessonIcon = (lessonType: string) => {
    switch (lessonType) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'audio':
        return <Music className="h-4 w-4" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4" />;
      case 'assignment':
        return <FileText className="h-4 w-4" />;
      case 'interactive':
        return <Play className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getLessonStatus = (lessonId: string) => {
    const progress = courseProgress?.lessonProgresses?.find(
      p => p.lessonId === lessonId
    );
    return {
      isCompleted: progress?.isCompleted || false,
      progress: progress?.progressPercentage || 0,
      isActive: lessonId === currentLessonId,
    };
  };

  const formatDuration = (minutes: number) => {
    if (!minutes || minutes < 1) return '< 1m';
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const getSectionProgress = (sectionId: string) => {
    const section = course.sections.find(s => s.id === sectionId);
    if (!section) return { completed: 0, total: 0 };

    const completed = section.lessons.filter(
      lesson => getLessonStatus(lesson.id).isCompleted
    ).length;

    return { completed, total: section.lessons.length };
  };

  // Collapsed view
  if (collapsed) {
    return (
      <div className="flex h-full w-16 flex-col border-r bg-white">
        <div className="border-b p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="w-full"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-2">
          {course.sections.map(section => (
            <div key={section.id} className="space-y-1">
              {section.lessons.map(lesson => {
                const status = getLessonStatus(lesson.id);
                return (
                  <Button
                    key={lesson.id}
                    variant={status.isActive ? 'default' : 'ghost'}
                    size="sm"
                    className={cn(
                      'h-8 w-full p-1',
                      status.isCompleted &&
                        !status.isActive &&
                        'text-green-600 hover:text-green-700',
                      status.isActive &&
                        'bg-blue-600 text-white hover:bg-blue-700'
                    )}
                    onClick={() => onLessonSelect(lesson.id)}
                    title={lesson.title}
                  >
                    {status.isCompleted ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <div className="flex h-3 w-3 items-center justify-center">
                        {getLessonIcon(lesson.lessonType)}
                      </div>
                    )}
                  </Button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className="flex h-full w-80 flex-col border-r bg-white">
      {/* Header */}
      <div className="border-b p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="truncate text-lg font-semibold" title={course.title}>
            {course.title}
          </h2>
          {onToggleCollapse && (
            <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Course Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Tiến độ khóa học</span>
            <span className="font-medium">
              {Math.round(courseProgress?.overallProgress || 0)}%
            </span>
          </div>
          <Progress
            value={courseProgress?.overallProgress || 0}
            className="h-2"
          />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {courseProgress?.completedLessons?.length || 0} /{' '}
              {course.totalLessons} bài học
            </span>
            <span>
              {courseProgress?.totalTimeSpent
                ? formatDuration(Math.floor(courseProgress.totalTimeSpent / 60))
                : '0m'}{' '}
              đã học
            </span>
          </div>
        </div>
      </div>

      {/* Course Sections */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {course.sections.map((section, sectionIndex) => {
            const isExpanded = expandedSections.includes(section.id);
            const sectionProgress = getSectionProgress(section.id);
            const isAllCompleted =
              sectionProgress.completed === sectionProgress.total;

            return (
              <div key={section.id}>
                <Collapsible
                  open={isExpanded}
                  onOpenChange={() => toggleSection(section.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-auto w-full justify-start p-3 hover:bg-gray-50"
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          )}
                          <div className="min-w-0 flex-1 text-left">
                            <div className="truncate text-sm font-medium">
                              Phần {sectionIndex + 1}: {section.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {sectionProgress.completed} /{' '}
                              {sectionProgress.total} bài học
                              {section.totalDuration > 0 && (
                                <> • {formatDuration(section.totalDuration)}</>
                              )}
                            </div>
                          </div>
                        </div>

                        {isAllCompleted && sectionProgress.total > 0 && (
                          <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />
                        )}
                      </div>
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="ml-7 space-y-1 py-1">
                      {section.lessons.map((lesson, lessonIndex) => {
                        const status = getLessonStatus(lesson.id);
                        const isLocked = false; // TODO: Implement lesson locking logic

                        return (
                          <Button
                            key={lesson.id}
                            variant={status.isActive ? 'secondary' : 'ghost'}
                            className={cn(
                              'h-auto w-full justify-start p-3 text-left',
                              status.isActive &&
                                'border border-blue-200 bg-blue-50',
                              isLocked && 'cursor-not-allowed opacity-50'
                            )}
                            onClick={() =>
                              !isLocked && onLessonSelect(lesson.id)
                            }
                            disabled={isLocked}
                          >
                            <div className="flex w-full items-center gap-3">
                              <div className="flex-shrink-0">
                                {isLocked ? (
                                  <Lock className="h-4 w-4 text-gray-400" />
                                ) : status.isCompleted ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : status.isActive ? (
                                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600">
                                    <div className="h-2 w-2 rounded-full bg-white"></div>
                                  </div>
                                ) : (
                                  <div className="h-4 w-4 text-gray-400">
                                    {getLessonIcon(lesson.lessonType)}
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-center gap-2">
                                  <span className="truncate text-sm font-medium">
                                    {lessonIndex + 1}. {lesson.title}
                                  </span>
                                  {lesson.isPreview && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Xem trước
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {lesson.estimatedDuration || 0}m
                                  </div>

                                  <span className="capitalize">
                                    {lesson.lessonType === 'video' && 'Video'}
                                    {lesson.lessonType === 'quiz' && 'Bài tập'}
                                    {lesson.lessonType === 'text' && 'Đọc'}
                                    {lesson.lessonType === 'audio' && 'Audio'}
                                    {lesson.lessonType === 'interactive' &&
                                      'Tương tác'}
                                    {lesson.lessonType === 'assignment' &&
                                      'Bài tập lớn'}
                                  </span>
                                </div>

                                {/* Progress bar for partially completed lessons */}
                                {!status.isCompleted && status.progress > 0 && (
                                  <div className="mt-2">
                                    <Progress
                                      value={status.progress}
                                      className="h-1"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="border-t bg-gray-50 p-4">
        <div className="grid grid-cols-2 gap-4 text-center text-sm">
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {courseProgress?.completedLessons?.length || 0}
            </div>
            <div className="text-gray-600">Đã hoàn thành</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {course.totalLessons -
                (courseProgress?.completedLessons?.length || 0)}
            </div>
            <div className="text-gray-600">Còn lại</div>
          </div>
        </div>
      </div>
    </div>
  );
}
