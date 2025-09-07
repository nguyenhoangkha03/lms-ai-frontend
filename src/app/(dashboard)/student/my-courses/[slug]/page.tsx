'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetCourseDetailQuery } from '@/lib/redux/api/course-api';
import { useAppSelector } from '@/lib/redux/hooks';
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

export default function LearningPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params.slug as string;

  // Get current user from Redux store
  const { user } = useAppSelector(state => state.auth) || {};

  // Get current lesson from URL params or default to first lesson
  const [currentLessonId, setCurrentLessonId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [isLearningStarted, setIsLearningStarted] = useState(false);

  const { data: course, isLoading: courseLoading } =
    useGetCourseDetailQuery(courseSlug);
  const { data: progress } = useGetLessonProgressQuery(currentLessonId, {
    skip: !currentLessonId,
  });

  const [startSession] = useStartLearningSessionMutation();
  const [endSession] = useEndLearningSessionMutation();
  const [updateProgress] = useUpdateLessonProgressMutation();

  // Initialize with first lesson when course loads
  useEffect(() => {
    if (course?.sections?.[0]?.lessons?.[0] && !currentLessonId) {
      setCurrentLessonId(course.sections[0].lessons[0].id);
    }
  }, [course, currentLessonId]);

  // Start learning session when component mounts
  useEffect(() => {
    if (course?.id && currentLessonId && user?.id && !isLearningStarted) {
      handleStartSession();
    }
  }, [course?.id, currentLessonId, user?.id, isLearningStarted]);

  const handleStartSession = async () => {
    console.log('🔍 Session start check:', {
      courseId: course?.id,
      lessonId: currentLessonId,
      userId: user?.id,
      userObject: user,
    });

    if (!course?.id || !currentLessonId || !user?.id) {
      console.log(
        '⚠️ Missing course ID, lesson ID, or user ID, skipping session start'
      );
      return;
    }

    try {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const result = await startSession({
        studentId: user.id,
        sessionId: newSessionId,
        courseId: course.id,
        lessonId: currentLessonId,
      }).unwrap();

      setSessionId(newSessionId);
      setIsLearningStarted(true);
      console.log('📚 Learning session started:', newSessionId);
    } catch (error) {
      console.error('Failed to start learning session:', error);
      toast.error('Failed to start learning session');
    }
  };

  const handleEndSession = async () => {
    if (!sessionId) return;

    try {
      await endSession({ sessionId }).unwrap();
      console.log('📚 Learning session ended');
    } catch (error) {
      console.error('Failed to end learning session:', error);
    }
  };

  // Clean up session when leaving
  useEffect(() => {
    return () => {
      if (sessionId) {
        handleEndSession();
      }
    };
  }, [sessionId]);

  const handleLessonChange = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    // Update URL without full navigation
    window.history.replaceState(
      null,
      '',
      `/my-courses/${course?.slug}/lessons/${lessonId}`
    );
  };

  const markLessonComplete = async () => {
    if (!currentLessonId) return;

    try {
      await updateProgress({
        courseId,
        lessonId: currentLessonId,
        progressData: {
          isCompleted: true,
          timeSpent: 0, // Will be calculated by backend
          lastPosition: 0,
        },
      }).unwrap();

      toast.success('Lesson marked as complete!');
    } catch (error) {
      console.error('Failed to mark lesson as complete:', error);
      toast.error('Failed to update progress');
    }
  };

  const currentLesson = course?.sections
    ?.flatMap(section => section.lessons)
    .find(lesson => lesson.id === currentLessonId);

  if (courseLoading || !course) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p>Loading course...</p>
        </div>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold">Lesson not found</h2>
          <Button onClick={() => router.push('/student/my-courses')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/student/my-courses')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              My Courses
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="font-semibold">{course.title}</h1>
              <p className="text-sm text-muted-foreground">
                {currentLesson.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline">
              <Play className="mr-1 h-3 w-3" />
              {currentLesson.lessonType}
            </Badge>
            <Button variant="outline" size="sm">
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-80 border-r bg-white">
          <CourseNavigation
            course={course}
            currentLessonId={currentLessonId}
            onLessonSelect={handleLessonChange}
          />
        </div>

        {/* Content Area */}
        <div className="flex flex-1 flex-col">
          {/* Main Lesson Content */}
          <div className="flex-1 p-6">
            <Card className="h-full">
              <CardContent className="h-full p-0">
                {currentLesson.lessonType === 'video' ? (
                  <VideoPlayer
                    lessonId={currentLesson.id}
                    videoUrl={currentLesson.videoUrl || ''}
                    sessionId={sessionId}
                    thumbnailUrl={currentLesson.thumbnailUrl}
                    onProgress={progress => {
                      // Update progress periodically
                    }}
                    onComplete={markLessonComplete}
                  />
                ) : (
                  <LessonContent
                    lesson={currentLesson}
                    onComplete={markLessonComplete}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bottom Actions */}
          <div className="border-t bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Go to previous lesson logic
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                {progress?.isCompleted ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Completed
                  </Badge>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={markLessonComplete}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark Complete
                  </Button>
                )}
              </div>

              <Button
                variant="default"
                onClick={() => {
                  // Go to next lesson logic
                }}
              >
                Next Lesson
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Optional */}
        <div className="w-80 border-l bg-white">
          <Tabs defaultValue="notes" className="flex h-full flex-col">
            <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
              <TabsTrigger value="notes">
                <FileText className="mr-1 h-4 w-4" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="resources">
                <Download className="mr-1 h-4 w-4" />
                Resources
              </TabsTrigger>
              <TabsTrigger value="qa">
                <MessageSquare className="mr-1 h-4 w-4" />
                Q&A
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto">
              <TabsContent value="notes" className="m-0 h-full p-4">
                <NotesPanel lessonId={currentLessonId} />
              </TabsContent>

              <TabsContent value="resources" className="m-0 h-full p-4">
                <LessonResources lessonId={currentLessonId} />
              </TabsContent>

              <TabsContent value="qa" className="m-0 h-full p-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Ask questions about this lesson
                  </p>
                  {/* Q&A Component */}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
