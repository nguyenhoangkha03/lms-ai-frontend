// Application constants
export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Smart LMS',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  description: 'AI-Powered Learning Management System',
} as const;

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api',
  version: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
} as const;

// Authentication Configuration
export const AUTH_CONFIG = {
  tokenKey: 'lms_auth_token',
  refreshTokenKey: 'lms_refresh_token',
  userKey: 'lms_user_data',
  sessionTimeout: parseInt(
    process.env.NEXT_PUBLIC_SESSION_TIMEOUT || '3600000'
  ),
  cookieMaxAge: 7 * 24 * 60 * 60, // 7 days in seconds
} as const;

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
} as const;

// User Status
export const USER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
  DELETED: 'deleted',
} as const;

// Course Levels
export const COURSE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
  ALL_LEVELS: 'all_levels',
} as const;

// File Upload Configuration
export const UPLOAD_CONFIG = {
  maxSize: parseInt(process.env.NEXT_PUBLIC_UPLOAD_MAX_SIZE || '10485760'), // 10MB
  allowedTypes: process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES?.split(',') || [
    'image/*',
    'video/*',
    'application/pdf',
  ],
  imageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  videoTypes: ['video/mp4', 'video/webm', 'video/ogg'],
  documentTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
} as const;

// Pagination
export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
  pageSizeOptions: [10, 20, 50, 100],
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  email: {
    minLength: 5,
    maxLength: 100,
  },
  password: {
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
  },
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  enableChat: process.env.NEXT_PUBLIC_ENABLE_CHAT === 'true',
  enableVideoCalls: process.env.NEXT_PUBLIC_ENABLE_VIDEO_CALLS === 'true',
  enableAiFeatures: process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES === 'true',
  enableOfflineMode: process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
  debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
  mockApi: process.env.NEXT_PUBLIC_MOCK_API === 'true',
} as const;

// Theme Configuration
export const THEME_CONFIG = {
  defaultTheme: 'light',
  storageKey: 'lms_theme',
  themes: ['light', 'dark'] as const,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  theme: 'lms_theme',
  language: 'lms_language',
  sidebarState: 'lms_sidebar_state',
  recentCourses: 'lms_recent_courses',
  preferences: 'lms_user_preferences',
} as const;

// Default Values
export const DEFAULTS = {
  language: 'en',
  timezone: 'UTC',
  currency: 'USD',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  INVALID_FILE_TYPE: 'Invalid file type.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  REGISTER_SUCCESS: 'Account created successfully!',
  PASSWORD_RESET_SUCCESS: 'Password reset email sent!',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully!',
  COURSE_ENROLLMENT_SUCCESS: 'Successfully enrolled in course!',
  ASSIGNMENT_SUBMIT_SUCCESS: 'Assignment submitted successfully!',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
  },
  // Users
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    UPLOAD_AVATAR: '/users/avatar',
    PREFERENCES: '/users/preferences',
  },
  // Courses
  COURSES: {
    LIST: '/courses',
    DETAIL: (id: string) => `/courses/${id}`,
    ENROLL: (id: string) => `/courses/${id}/enroll`,
    LESSONS: (id: string) => `/courses/${id}/lessons`,
    PROGRESS: (id: string) => `/courses/${id}/progress`,
    REVIEWS: (id: string) => `/courses/${id}/reviews`,
  },
  // Lessons
  LESSONS: {
    DETAIL: (id: string) => `/lessons/${id}`,
    PROGRESS: (id: string) => `/lessons/${id}/progress`,
    COMPLETE: (id: string) => `/lessons/${id}/complete`,
  },
  // Assessments
  ASSESSMENTS: {
    LIST: '/assessments',
    DETAIL: (id: string) => `/assessments/${id}`,
    SUBMIT: (id: string) => `/assessments/${id}/submit`,
    RESULTS: (id: string) => `/assessments/${id}/results`,
  },
  // AI Features
  AI: {
    RECOMMENDATIONS: '/ai/recommendations',
    CHATBOT: '/ai/chatbot',
    ANALYZE_PROGRESS: '/ai/analyze-progress',
    GENERATE_QUIZ: '/ai/generate-quiz',
  },
  // Communication
  CHAT: {
    ROOMS: '/chat/rooms',
    MESSAGES: (roomId: string) => `/chat/rooms/${roomId}/messages`,
    PARTICIPANTS: (roomId: string) => `/chat/rooms/${roomId}/participants`,
  },
  // Video Calls
  VIDEO: {
    SESSIONS: '/video/sessions',
    JOIN: (sessionId: string) => `/video/sessions/${sessionId}/join`,
    RECORDING: (sessionId: string) => `/video/sessions/${sessionId}/recording`,
  },
  // Analytics
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    PROGRESS: '/analytics/progress',
    PERFORMANCE: '/analytics/performance',
  },
  // Admin
  ADMIN: {
    USERS: '/admin/users',
    COURSES: '/admin/courses',
    SYSTEM_SETTINGS: '/admin/settings',
    ANALYTICS: '/admin/analytics',
  },
} as const;

// Route Paths
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

  // Student routes
  STUDENT: {
    DASHBOARD: '/student',
    ONBOARDING: '/student/onboarding',
    MY_COURSES: '/student/my-courses',
    PROGRESS: '/student/progress',
    ANALYTICS: '/student/analytics',
    ACHIEVEMENTS: '/student/achievements',
    CERTIFICATES: '/student/certificates',
    RECOMMENDATIONS: '/student/recommendations',
    LEARNING_PATH: '/student/learning-path',
    AI_TUTOR: '/student/ai-tutor',
    MESSAGES: '/student/messages',
    NOTIFICATIONS: '/student/notifications',
    PROFILE: '/student/profile',
    SETTINGS: '/student/settings',
    BILLING: '/student/billing',
    WISHLIST: '/student/wishlist',
    NOTES: '/student/notes',
    DOWNLOADS: '/student/downloads',
    ASSIGNMENTS: '/student/assignments',
    ASSIGNMENT_DETAIL: (id: string) => `/student/assignments/${id}`,
    QUIZZES: '/student/quizzes',
    QUIZ_DETAIL: (id: string) => `/student/quizzes/${id}`,
    QUIZ_RESULTS: (id: string) => `/student/quizzes/${id}/results`,
    GRADES: '/student/grades',
  },

  // Teacher routes
  TEACHER: {
    DASHBOARD: '/teacher',
    ANALYTICS: '/teacher/analytics',
    COURSES: '/teacher/courses',
    CREATE_COURSE: '/teacher/courses/create',
    EDIT_COURSE: (id: string) => `/teacher/courses/${id}/edit`,
    COURSE_ANALYTICS: (id: string) => `/teacher/courses/${id}/analytics`,
    LESSON_EDITOR: (id: string) => `/teacher/lessons/${id}/edit`,
    FILES: '/teacher/files',
    QUIZ_BUILDER: '/teacher/quiz-builder',
    STUDENTS: '/teacher/students',
    STUDENT_DETAIL: (id: string) => `/teacher/students/${id}`,
    GRADEBOOK: '/teacher/gradebook',
    GRADE_ASSIGNMENT: (id: string) => `/teacher/assignments/${id}/grade`,
    ASSIGNMENTS: '/teacher/assignments',
    QUIZZES: '/teacher/quizzes',
    SUBMISSIONS: '/teacher/submissions',
    LIVE_SESSIONS: '/teacher/live-sessions',
    CREATE_SESSION: '/teacher/live-sessions/create',
    LIVE_CLASSROOM: (id: string) => `/teacher/live/${id}`,
    MESSAGES: '/teacher/messages',
    ANNOUNCEMENTS: '/teacher/announcements',
    PROFILE: '/teacher/profile',
    SETTINGS: '/teacher/settings',
  },

  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin',
    ANALYTICS: '/admin/analytics',
    HEALTH: '/admin/health',
    USERS: '/admin/users',
    USER_DETAIL: (id: string) => `/admin/users/${id}`,
    TEACHER_APPLICATIONS: '/admin/teacher-applications',
    ROLES: '/admin/roles',
    COURSES: '/admin/courses',
    COURSE_APPROVAL: '/admin/courses/approval',
    CATEGORIES: '/admin/categories',
    CONTENT_MODERATION: '/admin/content/moderation',
    REVENUE: '/admin/revenue',
    PAYMENTS: '/admin/payments',
    REFUNDS: '/admin/refunds',
    COUPONS: '/admin/coupons',
    SUPPORT: '/admin/support',
    ANNOUNCEMENTS: '/admin/announcements',
    NOTIFICATIONS: '/admin/notifications',
    SETTINGS: '/admin/settings',
    AI_MANAGEMENT: '/admin/ai',
    CHATBOT: '/admin/chatbot',
    REPORTS: '/admin/reports',
    AUDIT_LOGS: '/admin/audit-logs',
  },

  // Course routes
  COURSES: {
    LIST: '/courses',
    CATEGORIES: (slug: string) => `/courses/categories/${slug}`,
    DETAIL: (slug: string) => `/courses/${slug}`,
    LESSON: (courseSlug: string, lessonId: string) =>
      `/student/courses/${courseSlug}/lessons/${lessonId}`,
  },

  // Shared routes
  CHAT: '/chat',
  VIDEO_CALL: (roomId: string) => `/video/${roomId}`,
  AI_CHAT: '/ai-chat',
  SEARCH: '/search',
  CALENDAR: '/calendar',
  HELP: '/help',
  CART: '/cart',
  CHECKOUT: '/checkout',
  PAYMENT_SUCCESS: '/payment/success',
  PAYMENT_FAILED: '/payment/failed',

  // Error pages
  NOT_FOUND: '/404',
  FORBIDDEN: '/403',
  SERVER_ERROR: '/500',
  MAINTENANCE: '/maintenance',
} as const;

// WebSocket Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // Authentication
  AUTHENTICATE: 'authenticate',
  AUTHENTICATED: 'authenticated',

  // Chat
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  SEND_MESSAGE: 'send_message',
  RECEIVE_MESSAGE: 'receive_message',
  USER_TYPING: 'user_typing',
  USER_STOPPED_TYPING: 'user_stopped_typing',

  // Video Calls
  JOIN_VIDEO_CALL: 'join_video_call',
  LEAVE_VIDEO_CALL: 'leave_video_call',
  VIDEO_CALL_SIGNAL: 'video_call_signal',

  // Notifications
  NEW_NOTIFICATION: 'new_notification',
  MARK_NOTIFICATION_READ: 'mark_notification_read',

  // Live Learning
  LESSON_UPDATE: 'lesson_update',
  QUIZ_UPDATE: 'quiz_update',
  PROGRESS_UPDATE: 'progress_update',
} as const;
