export interface LearningSession {
  id: string;
  studentId: string;
  courseId: string;
  lessonId?: string;
  startedAt: string;
  endedAt?: string;
  totalTimeSpent: number;
  isActive: boolean;
  device: string;
  metadata?: Record<string, any>;
}

export interface LessonProgress {
  id: string;
  studentId: string;
  lessonId: string;
  courseId: string;
  progressPercentage: number;
  timeSpent: number;
  lastPosition?: number;
  isCompleted: boolean;
  completedAt?: string;
  lastAccessedAt: string;
  watchedDuration: number;
  totalDuration: number;
  interactions: number;
  notesCount: number;
  bookmarksCount: number;
}

export interface Note {
  id: string;
  studentId: string;
  lessonId: string;
  courseId: string;
  content: string;
  timestamp?: number; // Video timestamp if applicable
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface InteractiveElement {
  id: string;
  lessonId: string;
  type:
    | 'quiz'
    | 'poll'
    | 'hotspot'
    | 'drag_drop'
    | 'code_exercise'
    | 'simulation';
  title: string;
  description?: string;
  timestamp?: number; // When to show in video
  position?: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  content: {
    question?: string;
    options?: Array<{
      id: string;
      text: string;
      isCorrect?: boolean;
    }>;
    correctAnswer?: string;
    explanation?: string;
    hints?: string[];
    code?: {
      language: string;
      initialCode: string;
      solution: string;
      testCases?: Array<{
        input: string;
        expectedOutput: string;
      }>;
    };
  };
  settings: {
    isRequired: boolean;
    allowMultipleAttempts: boolean;
    showFeedback: boolean;
    pauseVideo: boolean;
    points?: number;
  };
  responses?: Array<{
    studentId: string;
    response: any;
    isCorrect: boolean;
    submittedAt: string;
    timeSpent: number;
  }>;
}

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  quality: string;
  isFullscreen: boolean;
  isLoading: boolean;
  error?: string;
}

export interface VideoControls {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  setQuality: (quality: string) => void;
  toggleFullscreen: () => void;
  toggleMute: () => void;
}

export interface LessonContent {
  id: string;
  title: string;
  slug: string;
  description?: string;
  lessonType:
    | 'video'
    | 'text'
    | 'audio'
    | 'interactive'
    | 'quiz'
    | 'assignment';
  content?: string; // HTML content for text lessons
  videoUrl?: string;
  videoDuration?: number;
  audioUrl?: string;
  thumbnailUrl?: string;
  transcript?: string;
  subtitles?: Array<{
    language: string;
    url: string;
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
    downloadable: boolean;
  }>;
  objectives?: string[];
  prerequisites?: string[];
  estimatedDuration: number;
  isPreview: boolean;
  isMandatory: boolean;
  orderIndex: number;
  interactiveElements?: InteractiveElement[];
  nextLesson?: {
    id: string;
    title: string;
    slug: string;
  };
  previousLesson?: {
    id: string;
    title: string;
    slug: string;
  };
}

export interface LearningPath {
  currentLesson: LessonContent;
  course: {
    id: string;
    title: string;
    slug: string;
    totalLessons: number;
    completedLessons: number;
    progress: number;
  };
  navigation: {
    previousLesson?: {
      id: string;
      title: string;
      slug: string;
    };
    nextLesson?: {
      id: string;
      title: string;
      slug: string;
    };
    hasNext: boolean;
    hasPrevious: boolean;
  };
  sections: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      title: string;
      slug: string;
      isCompleted: boolean;
      isCurrent: boolean;
      isLocked: boolean;
      lessonType: string;
      duration: number;
    }>;
  }>;
}

export interface Bookmark {
  id: string;
  lessonId: string;
  courseId: string;
  timestamp: number;
  note?: string;
  createdAt: string;
  lesson?: {
    title: string;
    thumbnailUrl?: string;
  };
}

// Player Settings
export interface PlayerSettings {
  autoplay: boolean;
  playbackRate: number;
  quality: 'auto' | '1080p' | '720p' | '480p' | '360p';
  volume: number;
  subtitles: {
    enabled: boolean;
    language: string;
    fontSize: number;
    backgroundColor: string;
    fontColor: string;
  };
  shortcuts: {
    enabled: boolean;
    skipForward: number; // seconds
    skipBackward: number; // seconds
  };
  resumePosition: boolean;
}

// Learning Analytics
export interface LearningAnalytics {
  totalTimeSpent: number;
  sessionsCount: number;
  averageSessionDuration: number;
  completionRate: number;
  interactionRate: number;
  notesTaken: number;
  bookmarksCreated: number;
  weakAreas: string[];
  strongAreas: string[];
  recommendedActions: Array<{
    type: 'review' | 'practice' | 'advance';
    description: string;
    lessonId?: string;
  }>;
}
