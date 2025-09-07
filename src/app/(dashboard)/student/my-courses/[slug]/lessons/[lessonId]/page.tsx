'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useGetLessonQuery,
  useStartLearningSessionMutation,
  useEndLearningSessionMutation,
  useGetLessonProgressQuery,
  useUpdateLessonProgressMutation,
  useTrackLearningActivityMutation,
} from '@/lib/redux/api/learning-api';
import { VideoPlayer } from '@/components/learning/VideoPlayer';
import { NotesPanel } from '@/components/learning/NotesPanel';
import { LessonContent } from '@/components/learning/LessonContent';
import { InteractiveElements } from '@/components/learning/InteractiveElements';
import { AssessmentPlayer } from '@/components/learning/AssessmentPlayer';
import { LessonResources } from '@/components/learning/LessonResources';
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
  Clock,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  
  const [sessionId, setSessionId] = useState<string>('');
  const [isLearningStarted, setIsLearningStarted] = useState(false);

  // Fetch lesson data
  const {
    data: lesson,
    isLoading: lessonLoading,
    error: lessonError
  } = useGetLessonQuery(lessonId);

  const { data: progress } = useGetLessonProgressQuery(lessonId);

  const [startSession] = useStartLearningSessionMutation();
  const [endSession] = useEndLearningSessionMutation();
  const [updateProgress] = useUpdateLessonProgressMutation();
  const [trackActivity] = useTrackLearningActivityMutation();

  // Start learning session when component mounts
  useEffect(() => {
    if (courseId && lessonId && !isLearningStarted) {
      handleStartSession();
    }
  }, [courseId, lessonId, isLearningStarted]);

  // Track window/tab events for analytics
  useEffect(() => {
    if (!lessonId) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackActivity({
          lessonId,
          activityType: 'window_blur',
          metadata: { timestamp: Date.now() }
        }).catch(console.error);
      } else {
        trackActivity({
          lessonId,
          activityType: 'window_focus',
          metadata: { timestamp: Date.now() }
        }).catch(console.error);
      }
    };

    const handleWindowBlur = () => {
      trackActivity({
        lessonId,
        activityType: 'tab_switch',
        metadata: { timestamp: Date.now(), action: 'blur' }
      }).catch(console.error);
    };

    const handleWindowFocus = () => {
      trackActivity({
        lessonId,
        activityType: 'window_focus',
        metadata: { timestamp: Date.now(), action: 'focus' }
      }).catch(console.error);
    };

    // Track lesson start
    trackActivity({
      lessonId,
      activityType: 'lesson_start',
      metadata: { timestamp: Date.now() }
    }).catch(console.error);

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      // Remove event listeners
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [lessonId, trackActivity]);

  const handleStartSession = async () => {
    try {
      const result = await startSession({
        courseId,
        lessonId,
      }).unwrap();
      
      setSessionId(result.sessionId);
      setIsLearningStarted(true);
      console.log('📚 Learning session started:', result.sessionId);
    } catch (error) {
      console.error('Failed to start learning session:', error);
      toast.error('Failed to start learning session');
    }
  };

  const handleEndSession = async () => {
    if (!sessionId) return;

    try {
      await endSession({ 
        sessionId,
        totalTimeSpent: 0, // Will be calculated by backend
      }).unwrap();
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

  const markLessonComplete = async () => {
    try {
      await updateProgress({
        lessonId,
        progressPercentage: 100,
        timeSpent: 0, // Will be calculated by backend
        completed: true,
      }).unwrap();

      // Track lesson completion
      await trackActivity({
        lessonId,
        activityType: 'lesson_complete',
        metadata: { timestamp: Date.now() }
      });

      toast.success('Lesson marked as complete!');
    } catch (error) {
      console.error('Failed to mark lesson as complete:', error);
      toast.error('Failed to update progress');
    }
  };

  const handleProgress = (progress: number) => {
    // Update progress periodically
    if (progress > 0 && progress % 25 === 0) { // Update every 25%
      updateProgress({
        lessonId,
        progressPercentage: progress,
        timeSpent: 0,
        completed: progress >= 100,
      }).catch(console.error);
    }
  };

  if (lessonLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p>Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (lessonError || !lesson) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold">Lesson not found</h2>
          <Button onClick={() => router.push(`/student/courses/${courseId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course
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
              onClick={() => router.push(`/student/courses/${courseId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Course
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="font-semibold">{lesson.title}</h1>
              <p className="text-sm text-muted-foreground">
                {lesson.section?.title} • Lesson {lesson.orderIndex + 1}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="mr-1 h-3 w-3" />
              {lesson.estimatedDuration} min
            </Badge>
            <Badge variant="outline">
              <Play className="mr-1 h-3 w-3" />
              {lesson.lessonType}
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
        {/* Content Area */}
        <div className="flex flex-1 flex-col">
          {/* Main Lesson Content */}
          <div className="flex-1 p-6">
            <Card className="h-full">
              <CardContent className="h-full p-0">
                {lesson.lessonType === 'video' ? (
                  <VideoPlayer
                    lessonId={lesson.id}
                    videoUrl={lesson.videoUrl || ''}
                    thumbnailUrl={lesson.thumbnailUrl}
                    onProgress={handleProgress}
                    onComplete={markLessonComplete}
                  />
                ) : lesson.lessonType === 'quiz' || lesson.lessonType === 'assignment' ? (
                  <AssessmentPlayer
                    lesson={lesson}
                    onComplete={markLessonComplete}
                  />
                ) : lesson.lessonType === 'interactive' ? (
                  <InteractiveElements
                    lesson={lesson}
                    onComplete={markLessonComplete}
                  />
                ) : (
                  <LessonContent
                    lesson={lesson}
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
                    const prevLesson = lesson.previousLessonId;
                    if (prevLesson) {
                      router.push(`/student/courses/${courseId}/lessons/${prevLesson}`);
                    }
                  }}
                  disabled={!lesson.previousLessonId}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                
                {progress?.completed ? (
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
                  const nextLesson = lesson.nextLessonId;
                  if (nextLesson) {
                    router.push(`/student/courses/${courseId}/lessons/${nextLesson}`);
                  } else {
                    // If no next lesson, go back to course
                    router.push(`/student/courses/${courseId}`);
                  }
                }}
                disabled={!lesson.nextLessonId && !progress?.completed}
              >
                {lesson.nextLessonId ? 'Next Lesson' : 'Back to Course'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l bg-white">
          <Tabs defaultValue="notes" className="h-full flex flex-col">
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
              <TabsContent value="notes" className="h-full m-0 p-4">
                <NotesPanel lessonId={lessonId} />
              </TabsContent>
              
              <TabsContent value="resources" className="h-full m-0 p-4">
                <LessonResources lesson={lesson} />
              </TabsContent>
              
              <TabsContent value="qa" className="h-full m-0 p-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Ask questions about this lesson
                  </p>
                  {/* Q&A Component will be implemented later */}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}