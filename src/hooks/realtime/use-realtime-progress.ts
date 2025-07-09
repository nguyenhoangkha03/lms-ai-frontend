import { useAppDispatch } from '..';
import { updateProgress } from '@/store/slices/lesson';
import { useWebSocket } from './use-websocket';

export const useRealtimeProgress = (lessonId?: string) => {
  const dispatch = useAppDispatch();
  const { emit } = useWebSocket();

  const updateLessonProgress = (progress: any) => {
    if (lessonId) {
      dispatch(updateProgress({ lessonId, updates: progress }));

      // Emit progress update to server
      emit('progress_update', {
        lessonId,
        progress,
      });
    }
  };

  const trackVideoProgress = (position: number, duration: number) => {
    const progressPercentage = (position / duration) * 100;

    updateLessonProgress({
      lastPosition: position,
      progressPercentage,
      timeSpent: position,
    });
  };

  const markComplete = () => {
    updateLessonProgress({
      status: 'completed',
      progressPercentage: 100,
      completionDate: new Date().toISOString(),
    });
  };

  return {
    updateLessonProgress,
    trackVideoProgress,
    markComplete,
  };
};
