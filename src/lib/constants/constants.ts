export const APP_CONFIG = {
  name: 'Learnary',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  description: 'AI-Powered Learning Management System',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;

export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  socketURL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
  timeout: 30000,
} as const;

export const OAUTH_CONFIG = {
  googleLoginUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/google`,
  facebookLoginUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/facebook`,
  successRedirect: '/oauth-success',
  errorRedirect: '/oauth-error',
} as const;

export const ROUTES = {
  // Public routes
  HOME: '/',
  ABOUT: '/about',
  FEATURES: '/features',
  PRICING: '/pricing',
  CONTACT: '/contact',

  // Auth routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  TEACHER_REGISTER: '/teacher-register',

  // Course discovery routes
  COURSES: '/courses',
  COURSE_DETAIL: (slug: string) => `/courses/${slug}`,
  COURSE_CATEGORY: (slug: string) => `/courses/categories/${slug}`,
  COURSE_SEARCH: '/courses/search',

  // Student routes
  STUDENT_DASHBOARD: '/student',
  STUDENT_COURSES: '/student/courses',
  STUDENT_MY_COURSES: '/student/my-courses',
  STUDENT_WISHLIST: '/student/wishlist',
  STUDENT_ASSIGNMENTS: '/student/assignments',
  STUDENT_GRADES: '/student/grades',
  STUDENT_PROGRESS: '/student/progress',
  STUDENT_AI_TUTOR: '/student/ai-tutor',
  STUDENT_RECOMMENDATIONS: '/student/recommendations',
  STUDENT_ANALYTICS: '/student/analytics',

  // Learning experience routes
  STUDENT_COURSE_LEARN: (courseId: string, lessonId?: string) =>
    `/student/courses/${courseId}${lessonId ? `/lessons/${lessonId}` : ''}`,
  STUDENT_LESSON_PLAYER: (courseId: string, lessonId: string) =>
    `/student/courses/${courseId}/lessons/${lessonId}`,
  STUDENT_COURSE_OVERVIEW: (courseId: string) => `/student/courses/${courseId}`,

  // Teacher routes
  TEACHER_DASHBOARD: '/teacher',
  TEACHER_COURSES: '/teacher/courses',
  TEACHER_STUDENTS: '/teacher/students',
  TEACHER_ASSESSMENTS: '/teacher/assessments',
  TEACHER_GRADING: '/teacher/grading',
  TEACHER_ANALYTICS: '/teacher/analytics',

  // Admin routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_COURSES: '/admin/courses',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',

  // Communication routes
  CHAT: '/chat/[roomId]',
  VIDEO: '/video/[sessionId]',
} as const;

export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
} as const;

export const COURSE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
  ALL_LEVELS: 'all_levels',
} as const;

export const ASSESSMENT_TYPES = {
  QUIZ: 'quiz',
  EXAM: 'exam',
  ASSIGNMENT: 'assignment',
  SURVEY: 'survey',
  PRACTICE: 'practice',
  FINAL_EXAM: 'final_exam',
  MIDTERM: 'midterm',
  PROJECT: 'project',
} as const;

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  SHORT_ANSWER: 'short_answer',
  ESSAY: 'essay',
  FILL_IN_THE_BLANK: 'fill_in_the_blank',
  MATCHING: 'matching',
  ORDERING: 'ordering',
  NUMERIC: 'numeric',
  CODE: 'code',
} as const;

export const NOTIFICATION_TYPES = {
  COURSE_ENROLLMENT: 'course_enrollment',
  LESSON_AVAILABLE: 'lesson_available',
  ASSIGNMENT_DUE: 'assignment_due',
  QUIZ_AVAILABLE: 'quiz_available',
  GRADE_POSTED: 'grade_posted',
  MESSAGE_RECEIVED: 'message_received',
  VIDEO_SESSION_STARTING: 'video_session_starting',
  CERTIFICATE_EARNED: 'certificate_earned',
  COURSE_COMPLETED: 'course_completed',
  REMINDER_STUDY: 'reminder_study',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  SECURITY_ALERT: 'security_alert',
  ANNOUNCEMENT: 'announcement',
} as const;

export const FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  VIDEO: ['video/mp4', 'video/webm', 'video/avi', 'video/mov'],
  AUDIO: ['audio/mp3', 'audio/wav', 'audio/ogg'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  PRESENTATION: [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
} as const;

export const MAX_FILE_SIZE = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  VIDEO: 100 * 1024 * 1024, // 100MB
  AUDIO: 20 * 1024 * 1024, // 20MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  PRESENTATION: 20 * 1024 * 1024, // 20MB
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5,
} as const;

export const SOCKET_EVENTS = {
  // Auth events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',

  // Notification events
  NOTIFICATION: 'notification',
  MARK_NOTIFICATION_READ: 'mark_notification_read',

  // Course events
  COURSE_UPDATE: 'course_update',
  LESSON_COMPLETE: 'lesson_complete',

  // Assignment events
  ASSIGNMENT_DUE: 'assignment_due',
  ASSIGNMENT_GRADED: 'assignment_graded',

  // Message events
  MESSAGE_RECEIVED: 'message_received',
  MESSAGE_TYPING: 'message_typing',

  // Achievement events
  ACHIEVEMENT_EARNED: 'achievement_earned',
  BADGE_UNLOCKED: 'badge_unlocked',

  // Live session events
  SESSION_STARTED: 'session_started',
  SESSION_ENDED: 'session_ended',
  PARTICIPANT_JOINED: 'participant_joined',
  PARTICIPANT_LEFT: 'participant_left',

  // Chat events
  NEW_MESSAGE: 'new_message',
  MESSAGE_READ: 'message_read',

  // Video session events
  JOIN_VIDEO_SESSION: 'join_video_session',
  LEAVE_VIDEO_SESSION: 'leave_video_session',
  VIDEO_SESSION_STARTED: 'video_session_started',
  VIDEO_SESSION_ENDED: 'video_session_ended',

  // Real-time updates
  PROGRESS_UPDATE: 'progress_update',
  ASSIGNMENT_UPDATE: 'assignment_update',
  GRADE_UPDATE: 'grade_update',

  // AI events
  AI_RECOMMENDATION: 'ai_recommendation',
  AI_RESPONSE: 'ai_response',
} as const;

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  RECENT_COURSES: 'recent_courses',
  DRAFT_MESSAGES: 'draft_messages',
} as const;

export const THEME_CONFIG = {
  DEFAULT_THEME: 'light',
  THEMES: ['light', 'dark', 'system'] as const,
} as const;

export const AI_CONFIG = {
  RECOMMENDATION_TYPES: {
    NEXT_LESSON: 'next_lesson',
    REVIEW_CONTENT: 'review_content',
    PRACTICE_QUIZ: 'practice_quiz',
    SUPPLEMENTARY_MATERIAL: 'supplementary_material',
    COURSE_RECOMMENDATION: 'course_recommendation',
    STUDY_SCHEDULE: 'study_schedule',
    LEARNING_PATH: 'learning_path',
    SKILL_IMPROVEMENT: 'skill_improvement',
    PEER_STUDY_GROUP: 'peer_study_group',
    TUTOR_SESSION: 'tutor_session',
    BREAK_SUGGESTION: 'break_suggestion',
    DIFFICULTY_ADJUSTMENT: 'difficulty_adjustment',
  },
  TUTORING_MODES: {
    ADAPTIVE: 'adaptive',
    GUIDED: 'guided',
    EXPLORATORY: 'exploratory',
    ASSESSMENT: 'assessment',
  },
} as const;

export const COURSE_SORT_OPTIONS = {
  POPULARITY: 'popularity',
  RATING: 'rating',
  NEWEST: 'newest',
  PRICE_LOW: 'price_low',
  PRICE_HIGH: 'price_high',
  DURATION: 'duration',
} as const;

export const COURSE_FILTERS = {
  PRICE: {
    ALL: 'all',
    FREE: 'free',
    PAID: 'paid',
  },
  DURATION: {
    SHORT: 'short', // < 3 hours
    MEDIUM: 'medium', // 3-10 hours
    LONG: 'long', // > 10 hours
  },
  LEVEL: {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
    EXPERT: 'expert',
    ALL_LEVELS: 'all_levels',
  },
} as const;

export const ENROLLMENT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
} as const;

export const LESSON_TYPES = {
  VIDEO: 'video',
  TEXT: 'text',
  AUDIO: 'audio',
  INTERACTIVE: 'interactive',
  QUIZ: 'quiz',
  ASSIGNMENT: 'assignment',
  LIVE_SESSION: 'live_session',
  DOWNLOAD: 'download',
} as const;

export const INTERACTIVE_ELEMENT_TYPES = {
  QUIZ: 'quiz',
  POLL: 'poll',
  HOTSPOT: 'hotspot',
  DRAG_DROP: 'drag_drop',
  CODE_EXERCISE: 'code_exercise',
  SIMULATION: 'simulation',
} as const;

export const LEARNING_ACTIVITY_TYPES = {
  VIDEO_START: 'video_start',
  VIDEO_PAUSE: 'video_pause',
  VIDEO_COMPLETE: 'video_complete',
  NOTE_CREATED: 'note_created',
  INTERACTIVE_COMPLETED: 'interactive_completed',
  LESSON_COMPLETED: 'lesson_completed',
  BOOKMARK_CREATED: 'bookmark_created',
} as const;

export const VIDEO_QUALITY_OPTIONS = {
  AUTO: 'auto',
  HD_1080: '1080p',
  HD_720: '720p',
  SD_480: '480p',
  SD_360: '360p',
} as const;

export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

export const VIDEO_SHORTCUTS = {
  PLAY_PAUSE: 'Space',
  SKIP_FORWARD: 'ArrowRight',
  SKIP_BACKWARD: 'ArrowLeft',
  VOLUME_UP: 'ArrowUp',
  VOLUME_DOWN: 'ArrowDown',
  FULLSCREEN: 'KeyF',
  MUTE: 'KeyM',
} as const;

export const LEARNING_PREFERENCES = {
  AUTO_PLAY: 'autoPlay',
  RESUME_POSITION: 'resumePosition',
  SUBTITLES_ENABLED: 'subtitlesEnabled',
  SHORTCUTS_ENABLED: 'shortcutsEnabled',
  SKIP_DURATION: 'skipDuration',
} as const;
