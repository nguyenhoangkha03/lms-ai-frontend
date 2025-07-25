import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Course, Lesson } from '@/lib/types';

interface CourseState {
  currentCourse: Course | null;
  currentLesson: Lesson | null;
  enrolledCourses: Course[];
  recentCourses: Course[];
  courseCatalog: Course[];
  isPlaying: boolean;
  playbackPosition: number;
  playbackSpeed: number;
  volume: number;
  autoplay: boolean;
  subtitlesEnabled: boolean;
  subtitleLanguage: string;
  videoQuality: string;
  notesPanelOpen: boolean;
  transcriptPanelOpen: boolean;
  chatPanelOpen: boolean;
  currentNotes: string;
  bookmarks: Array<{
    lessonId: string;
    timestamp: number;
    note: string;
  }>;
}

const initialState: CourseState = {
  currentCourse: null,
  currentLesson: null,
  enrolledCourses: [],
  recentCourses: [],
  courseCatalog: [],
  isPlaying: false,
  playbackPosition: 0,
  playbackSpeed: 1,
  volume: 1,
  autoplay: false,
  subtitlesEnabled: true,
  subtitleLanguage: 'en',
  videoQuality: 'auto',
  notesPanelOpen: false,
  transcriptPanelOpen: false,
  chatPanelOpen: false,
  currentNotes: '',
  bookmarks: [],
};

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    setCurrentCourse: (state, action: PayloadAction<Course | null>) => {
      state.currentCourse = action.payload;
    },

    setCurrentLesson: (state, action: PayloadAction<Lesson | null>) => {
      state.currentLesson = action.payload;
      if (action.payload) {
        state.playbackPosition = 0;
        state.isPlaying = false;
      }
    },

    setEnrolledCourses: (state, action: PayloadAction<Course[]>) => {
      state.enrolledCourses = action.payload;
    },

    addEnrolledCourse: (state, action: PayloadAction<Course>) => {
      state.enrolledCourses.push(action.payload);
    },

    removeEnrolledCourse: (state, action: PayloadAction<string>) => {
      state.enrolledCourses = state.enrolledCourses.filter(
        course => course.id !== action.payload
      );
    },

    addRecentCourse: (state, action: PayloadAction<Course>) => {
      const existing = state.recentCourses.findIndex(
        c => c.id === action.payload.id
      );
      if (existing >= 0) {
        state.recentCourses.splice(existing, 1);
      }
      state.recentCourses.unshift(action.payload);
      state.recentCourses = state.recentCourses.slice(0, 10);
    },

    setCourseCatalog: (state, action: PayloadAction<Course[]>) => {
      state.courseCatalog = action.payload;
    },

    setPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },

    setPlaybackPosition: (state, action: PayloadAction<number>) => {
      state.playbackPosition = action.payload;
    },

    setPlaybackSpeed: (state, action: PayloadAction<number>) => {
      state.playbackSpeed = action.payload;
    },

    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },

    toggleAutoplay: state => {
      state.autoplay = !state.autoplay;
    },

    toggleSubtitles: state => {
      state.subtitlesEnabled = !state.subtitlesEnabled;
    },

    setSubtitleLanguage: (state, action: PayloadAction<string>) => {
      state.subtitleLanguage = action.payload;
    },

    setVideoQuality: (state, action: PayloadAction<string>) => {
      state.videoQuality = action.payload;
    },

    toggleNotesPanel: state => {
      state.notesPanelOpen = !state.notesPanelOpen;
    },

    toggleTranscriptPanel: state => {
      state.transcriptPanelOpen = !state.transcriptPanelOpen;
    },

    toggleChatPanel: state => {
      state.chatPanelOpen = !state.chatPanelOpen;
    },

    setCurrentNotes: (state, action: PayloadAction<string>) => {
      state.currentNotes = action.payload;
    },

    addBookmark: (
      state,
      action: PayloadAction<{
        lessonId: string;
        timestamp: number;
        note: string;
      }>
    ) => {
      state.bookmarks.push(action.payload);
    },

    removeBookmark: (state, action: PayloadAction<number>) => {
      state.bookmarks.splice(action.payload, 1);
    },

    resetCourseState: () => initialState,
  },
});

export const {
  setCurrentCourse,
  setCurrentLesson,
  setEnrolledCourses,
  addEnrolledCourse,
  removeEnrolledCourse,
  addRecentCourse,
  setCourseCatalog,
  setPlaying,
  setPlaybackPosition,
  setPlaybackSpeed,
  setVolume,
  toggleAutoplay,
  toggleSubtitles,
  setSubtitleLanguage,
  setVideoQuality,
  toggleNotesPanel,
  toggleTranscriptPanel,
  toggleChatPanel,
  setCurrentNotes,
  addBookmark,
  removeBookmark,
  resetCourseState,
} = courseSlice.actions;

export default courseSlice.reducer;
