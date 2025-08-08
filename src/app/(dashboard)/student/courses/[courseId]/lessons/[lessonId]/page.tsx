'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetCourseDetailQuery } from '@/lib/redux/api/course-api';
import {
  useStartLearningSessionMutation,
  useEndLearningSessionMutation,
  useGetLessonProgressQuery,
  useUpdateLessonProgressMutation,
} from '@/lib/redux/api/learning-api';
import { VideoPlayer } from '@/components/learning/VideoPlayer';
import { NotesPanel } from '@/components/learning/NotesPanel';
import { CourseNavigation } from '@/components/learning/CourseNavigation';
import { LessonContent } from '@/components/learning/LessonContent';
import { InteractiveElements } from '@/components/learning/InteractiveElements';
import { LessonResources } from '@/components/learning/LessonResources';
import { ProgressTracker } from '@/components/learning/ProgressTracker';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  FileText,
  MessageSquare,
  Download,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Play,
  RotateCcw,
  Share,
  Bookmark,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  const [sessionId, setSessionId] = useState<string>();
  const [sessionStartTime, setSessionStartTime] = useState<number>();
  const [activeTab, setActiveTab] = useState('content');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { data: course, isLoading: courseLoading } =
    useGetCourseDetailQuery(courseId);
  const { data: lessonProgress } = useGetLessonProgressQuery(lessonId);

  const [startSession] = useStartLearningSessionMutation();
  const [endSession] = useEndLearningSessionMutation();
  const [updateProgress] = useUpdateLessonProgressMutation();

  // Find current lesson and navigation
  const currentSection = course?.sections.find(section =>
    section.lessons.some(lesson => lesson.id === lessonId)
  );
  const currentLesson = currentSection?.lessons.find(
    lesson => lesson.id === lessonId
  );

  // Get all lessons in order for navigation
  const allLessons = course?.sections.flatMap(section => section.lessons) || [];
  const currentLessonIndex = allLessons.findIndex(
    lesson => lesson.id === lessonId
  );
  const previousLesson =
    currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex < allLessons.length - 1
      ? allLessons[currentLessonIndex + 1]
      : null;

  // Start learning session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const session = await startSession({ courseId, lessonId }).unwrap();
        setSessionId(session.id);
        setSessionStartTime(Date.now());
      } catch (error) {
        console.error('Failed to start learning session:', error);
      }
    };

    initSession();

    // End session on unmount
    return () => {
      if (sessionId && sessionStartTime) {
        const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);
        endSession({
          sessionId,
          totalTimeSpent: timeSpent,
        });
      }
    };
  }, [courseId, lessonId, startSession, endSession]);

  const handleVideoProgress = async (progress: number) => {
    if (progress > (lessonProgress?.progressPercentage || 0)) {
      try {
        await updateProgress({
          lessonId,
          progressPercentage: progress,
          timeSpent: sessionStartTime
            ? Math.floor((Date.now() - sessionStartTime) / 1000)
            : 0,
        }).unwrap();
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    }
  };

  const handleVideoComplete = async () => {
    try {
      await updateProgress({
        lessonId,
        progressPercentage: 100,
        timeSpent: sessionStartTime
          ? Math.floor((Date.now() - sessionStartTime) / 1000)
          : 0,
        completed: true,
      }).unwrap();

      toast.success('Bài học đã hoàn thành!');

      // Auto advance to next lesson after 3 seconds
      if (nextLesson) {
        setTimeout(() => {
          router.push(`/student/courses/${courseId}/lessons/${nextLesson.id}`);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to mark lesson as complete:', error);
    }
  };

  const navigateToLesson = (targetLessonId: string) => {
    // End current session
    if (sessionId && sessionStartTime) {
      const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);
      endSession({
        sessionId,
        totalTimeSpent: timeSpent,
      });
    }

    router.push(`/student/courses/${courseId}/lessons/${targetLessonId}`);
  };

  if (courseLoading || !course || !currentLesson) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Course Navigation Sidebar */}
      <div
        className={cn(
          'border-r bg-white transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-80'
        )}
      >
        <CourseNavigation
          course={course}
          currentLessonId={lessonId}
          onLessonSelect={navigateToLesson}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/student/courses/${courseId}`)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Về khóa học
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-semibold">{currentLesson.title}</h1>
                <p className="text-sm text-gray-600">
                  {currentSection?.title} • Bài {currentLessonIndex + 1} /{' '}
                  {allLessons.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ProgressTracker
                currentLesson={currentLessonIndex + 1}
                totalLessons={allLessons.length}
                progress={lessonProgress?.progressPercentage || 0}
              />

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!previousLesson}
                  onClick={() =>
                    previousLesson && navigateToLesson(previousLesson.id)
                  }
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Trước
                </Button>
                <Button
                  size="sm"
                  disabled={!nextLesson}
                  onClick={() => nextLesson && navigateToLesson(nextLesson.id)}
                >
                  Sau
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Video/Content Player */}
        <div className="flex-1 p-6">
          <div className="grid h-full grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Main Player Area */}
            <div className="space-y-6 xl:col-span-2">
              {/* Video Player */}
              {currentLesson.lessonType === 'video' &&
                currentLesson.videoUrl && (
                  <Card className="overflow-hidden">
                    <VideoPlayer
                      lessonId={lessonId}
                      videoUrl={currentLesson.videoUrl}
                      thumbnailUrl={currentLesson.thumbnailUrl}
                      onProgress={handleVideoProgress}
                      onComplete={handleVideoComplete}
                      className="aspect-video"
                    />
                  </Card>
                )}

              {/* Lesson Content */}
              <Card>
                <CardContent className="p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-6 grid w-full grid-cols-4">
                      <TabsTrigger value="content">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Nội dung
                      </TabsTrigger>
                      <TabsTrigger value="notes">
                        <FileText className="mr-2 h-4 w-4" />
                        Ghi chú
                      </TabsTrigger>
                      <TabsTrigger value="resources">
                        <Download className="mr-2 h-4 w-4" />
                        Tài liệu
                      </TabsTrigger>
                      <TabsTrigger value="discussion">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Thảo luận
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="content" className="mt-0">
                      <LessonContent lesson={currentLesson} />
                    </TabsContent>

                    <TabsContent value="notes" className="mt-0">
                      <NotesPanel lessonId={lessonId} />
                    </TabsContent>

                    <TabsContent value="resources" className="mt-0">
                      <LessonResources lessonId={lessonId} />
                    </TabsContent>

                    <TabsContent value="discussion" className="mt-0">
                      <div className="py-8 text-center text-gray-500">
                        <MessageSquare className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                        <p>Tính năng thảo luận sẽ có trong phiên bản tới</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Interactive Elements */}
              <InteractiveElements lessonId={lessonId} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Lesson Info */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Thông tin bài học</h3>
                      {lessonProgress?.isCompleted && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Hoàn thành
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thời lượng:</span>
                        <span>{currentLesson.estimatedDuration} phút</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Loại bài học:</span>
                        <span className="capitalize">
                          {currentLesson.lessonType === 'video' && 'Video'}
                          {currentLesson.lessonType === 'text' && 'Văn bản'}
                          {currentLesson.lessonType === 'quiz' && 'Bài tập'}
                        </span>
                      </div>
                      {lessonProgress && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tiến độ:</span>
                          <span>
                            {Math.round(lessonProgress.progressPercentage)}%
                          </span>
                        </div>
                      )}
                    </div>

                    {currentLesson.objectives &&
                      currentLesson.objectives.length > 0 && (
                        <div>
                          <h4 className="mb-2 font-medium">
                            Mục tiêu bài học:
                          </h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            {currentLesson.objectives.map(
                              (objective, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                                  {objective}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 font-semibold">Thao tác nhanh</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Bookmark className="mr-2 h-4 w-4" />
                      Đánh dấu
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Share className="mr-2 h-4 w-4" />
                      Chia sẻ
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Học lại
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Next Lesson Preview */}
              {nextLesson && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-3 font-semibold">Bài học tiếp theo</h3>
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">
                        {nextLesson.title}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {nextLesson.estimatedDuration} phút •{' '}
                        {nextLesson.lessonType}
                      </p>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => navigateToLesson(nextLesson.id)}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Bắt đầu
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
