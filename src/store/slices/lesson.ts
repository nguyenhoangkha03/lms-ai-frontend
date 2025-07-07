import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Lesson, LessonProgress } from '@/types';

interface LessonState {
  lessons: Lesson[];
  currentLesson: Lesson | null;
  progress: Record<string, LessonProgress>;
  isLoading: boolean;
  error: string | null;
  playbackPosition: number;
  playbackSpeed: number;
  isPlaying: boolean;
  volume: number;
  subtitlesEnabled: boolean;
  qualityLevel: string;
}

const initialState: LessonState = {
  lessons: [],
  currentLesson: null,
  progress: {},
  isLoading: false,
  error: null,
  playbackPosition: 0,
  playbackSpeed: 1,
  isPlaying: false,
  volume: 1,
  subtitlesEnabled: false,
  qualityLevel: 'auto',
};

const lessonSlice = createSlice({
  name: 'lesson',
  initialState,
  reducers: {
    setLessons: (state, action: PayloadAction<Lesson[]>) => {
      state.lessons = action.payload;
      state.error = null;
    },

    setCurrentLesson: (state, action: PayloadAction<Lesson | null>) => {
      state.currentLesson = action.payload;
      state.playbackPosition = 0;
      state.isPlaying = false;
    },

    updateLesson: (state, action: PayloadAction<Lesson>) => {
      const index = state.lessons.findIndex(l => l.id === action.payload.id);
      if (index !== -1) {
        state.lessons[index] = action.payload;
      }
      if (state.currentLesson?.id === action.payload.id) {
        state.currentLesson = action.payload;
      }
    },

    setProgress: (
      state,
      action: PayloadAction<{ lessonId: string; progress: LessonProgress }>
    ) => {
      const { lessonId, progress } = action.payload;
      state.progress[lessonId] = progress;
    },

    updateProgress: (
      state,
      action: PayloadAction<{
        lessonId: string;
        updates: Partial<LessonProgress>;
      }>
    ) => {
      const { lessonId, updates } = action.payload;
      if (state.progress[lessonId]) {
        state.progress[lessonId] = { ...state.progress[lessonId], ...updates };
      }
    },

    setPlaybackPosition: (state, action: PayloadAction<number>) => {
      state.playbackPosition = action.payload;
    },

    setPlaybackSpeed: (state, action: PayloadAction<number>) => {
      state.playbackSpeed = action.payload;
    },

    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },

    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = Math.max(0, Math.min(1, action.payload));
    },

    toggleSubtitles: state => {
      state.subtitlesEnabled = !state.subtitlesEnabled;
    },

    setQualityLevel: (state, action: PayloadAction<string>) => {
      state.qualityLevel = action.payload;
    },

    setLessonLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setLessonError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    resetPlayerState: state => {
      state.playbackPosition = 0;
      state.isPlaying = false;
      state.playbackSpeed = 1;
    },
  },
});

export const {
  setLessons,
  setCurrentLesson,
  updateLesson,
  setProgress,
  updateProgress,
  setPlaybackPosition,
  setPlaybackSpeed,
  setIsPlaying,
  setVolume,
  toggleSubtitles,
  setQualityLevel,
  setLessonLoading,
  setLessonError,
  resetPlayerState,
} = lessonSlice.actions;

export default lessonSlice.reducer;
