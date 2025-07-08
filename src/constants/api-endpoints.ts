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
    CHANGE_PASSWORD: '/auth/change-password',
    ENABLE_2FA: '/auth/2fa/enable',
    DISABLE_2FA: '/auth/2fa/disable',
    VERIFY_2FA: '/auth/2fa/verify',
  },

  // Users
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPLOAD_AVATAR: '/users/avatar',
    UPLOAD_COVER: '/users/cover',
    PREFERENCES: '/users/preferences',
    NOTIFICATIONS_SETTINGS: '/users/notifications',
    PRIVACY_SETTINGS: '/users/privacy',
    SECURITY_SETTINGS: '/users/security',
    DELETE_ACCOUNT: '/users/delete',
    EXPORT_DATA: '/users/export',
  },

  // Courses
  COURSES: {
    LIST: '/courses',
    FEATURED: '/courses/featured',
    TRENDING: '/courses/trending',
    RECENT: '/courses/recent',
    DETAIL: (id: string) => `/courses/${id}`,
    CREATE: '/courses',
    UPDATE: (id: string) => `/courses/${id}`,
    DELETE: (id: string) => `/courses/${id}`,
    PUBLISH: (id: string) => `/courses/${id}/publish`,
    UNPUBLISH: (id: string) => `/courses/${id}/unpublish`,
    DUPLICATE: (id: string) => `/courses/${id}/duplicate`,

    // Course enrollment
    ENROLL: (id: string) => `/courses/${id}/enroll`,
    UNENROLL: (id: string) => `/courses/${id}/unenroll`,
    ENROLLMENTS: '/courses/enrollments',
    MY_COURSES: '/courses/my-courses',

    // Course content
    SECTIONS: (id: string) => `/courses/${id}/sections`,
    LESSONS: (id: string) => `/courses/${id}/lessons`,
    PROGRESS: (id: string) => `/courses/${id}/progress`,
    CERTIFICATE: (id: string) => `/courses/${id}/certificate`,

    // Course interaction
    REVIEWS: (id: string) => `/courses/${id}/reviews`,
    RATING: (id: string) => `/courses/${id}/rating`,
    FAVORITES: (id: string) => `/courses/${id}/favorites`,
    SHARE: (id: string) => `/courses/${id}/share`,
    REPORT: (id: string) => `/courses/${id}/report`,
  },

  // Categories
  CATEGORIES: {
    LIST: '/categories',
    TREE: '/categories/tree',
    DETAIL: (id: string) => `/categories/${id}`,
    COURSES: (id: string) => `/categories/${id}/courses`,
  },

  // Lessons
  LESSONS: {
    DETAIL: (id: string) => `/lessons/${id}`,
    UPDATE: (id: string) => `/lessons/${id}`,
    DELETE: (id: string) => `/lessons/${id}`,
    PROGRESS: (id: string) => `/lessons/${id}/progress`,
    COMPLETE: (id: string) => `/lessons/${id}/complete`,
    NOTES: (id: string) => `/lessons/${id}/notes`,
    BOOKMARKS: (id: string) => `/lessons/${id}/bookmarks`,
    ATTACHMENTS: (id: string) => `/lessons/${id}/attachments`,
    COMMENTS: (id: string) => `/lessons/${id}/comments`,
  },

  // Assessments
  ASSESSMENTS: {
    LIST: '/assessments',
    DETAIL: (id: string) => `/assessments/${id}`,
    CREATE: '/assessments',
    UPDATE: (id: string) => `/assessments/${id}`,
    DELETE: (id: string) => `/assessments/${id}`,

    // Assessment attempts
    START: (id: string) => `/assessments/${id}/start`,
    SUBMIT: (id: string) => `/assessments/${id}/submit`,
    RESULTS: (id: string) => `/assessments/${id}/results`,
    ATTEMPTS: (id: string) => `/assessments/${id}/attempts`,
    REVIEW: (id: string, attemptId: string) =>
      `/assessments/${id}/attempts/${attemptId}/review`,

    // Questions
    QUESTIONS: (id: string) => `/assessments/${id}/questions`,
    ADD_QUESTION: (id: string) => `/assessments/${id}/questions`,
    UPDATE_QUESTION: (id: string, questionId: string) =>
      `/assessments/${id}/questions/${questionId}`,
    DELETE_QUESTION: (id: string, questionId: string) =>
      `/assessments/${id}/questions/${questionId}`,
  },

  // Chat
  CHAT: {
    ROOMS: '/chat/rooms',
    ROOM_DETAIL: (id: string) => `/chat/rooms/${id}`,
    MESSAGES: (roomId: string) => `/chat/rooms/${roomId}/messages`,
    SEND_MESSAGE: (roomId: string) => `/chat/rooms/${roomId}/messages`,
    PARTICIPANTS: (roomId: string) => `/chat/rooms/${roomId}/participants`,
    JOIN: (roomId: string) => `/chat/rooms/${roomId}/join`,
    LEAVE: (roomId: string) => `/chat/rooms/${roomId}/leave`,
    MUTE: (roomId: string) => `/chat/rooms/${roomId}/mute`,
    UNMUTE: (roomId: string) => `/chat/rooms/${roomId}/unmute`,
  },

  // Video sessions
  VIDEO: {
    SESSIONS: '/video/sessions',
    CREATE_SESSION: '/video/sessions',
    SESSION_DETAIL: (id: string) => `/video/sessions/${id}`,
    JOIN: (id: string) => `/video/sessions/${id}/join`,
    LEAVE: (id: string) => `/video/sessions/${id}/leave`,
    RECORDING: (id: string) => `/video/sessions/${id}/recording`,
    PARTICIPANTS: (id: string) => `/video/sessions/${id}/participants`,
    SCREEN_SHARE: (id: string) => `/video/sessions/${id}/screen-share`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id: string) => `/notifications/${id}`,
    PREFERENCES: '/notifications/preferences',
    SUBSCRIBE: '/notifications/subscribe',
    UNSUBSCRIBE: '/notifications/unsubscribe',
  },

  // AI Features
  AI: {
    RECOMMENDATIONS: '/ai/recommendations',
    CHATBOT: '/ai/chatbot',
    CHAT_HISTORY: '/ai/chat-history',
    ANALYZE_PROGRESS: '/ai/analyze-progress',
    GENERATE_QUIZ: '/ai/generate-quiz',
    CONTENT_SUGGESTIONS: '/ai/content-suggestions',
    STUDY_PLAN: '/ai/study-plan',
    FEEDBACK: (id: string) => `/ai/recommendations/${id}/feedback`,
  },

  // Analytics
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    COURSE_ANALYTICS: (id: string) => `/analytics/courses/${id}`,
    USER_PROGRESS: '/analytics/progress',
    PERFORMANCE: '/analytics/performance',
    ENGAGEMENT: '/analytics/engagement',
    REVENUE: '/analytics/revenue',
    EXPORTS: '/analytics/exports',
  },

  // File uploads
  UPLOADS: {
    IMAGE: '/uploads/images',
    VIDEO: '/uploads/videos',
    DOCUMENT: '/uploads/documents',
    AVATAR: '/uploads/avatar',
    COURSE_THUMBNAIL: '/uploads/course-thumbnail',
    LESSON_VIDEO: '/uploads/lesson-video',
    ASSIGNMENT_FILE: '/uploads/assignment',
  },

  // Search
  SEARCH: {
    GLOBAL: '/search',
    COURSES: '/search/courses',
    USERS: '/search/users',
    CONTENT: '/search/content',
    SUGGESTIONS: '/search/suggestions',
    FILTERS: '/search/filters',
  },

  // Teacher specific
  TEACHER: {
    DASHBOARD: '/teacher/dashboard',
    STUDENTS: '/teacher/students',
    EARNINGS: '/teacher/earnings',
    PAYOUT: '/teacher/payout',
    ANALYTICS: '/teacher/analytics',
    PROFILE: '/teacher/profile',
    VERIFICATION: '/teacher/verification',
    COURSES: '/teacher/courses',
    ASSIGNMENTS: '/teacher/assignments',
  },

  // Admin specific
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    USER_DETAIL: (id: string) => `/admin/users/${id}`,
    COURSES: '/admin/courses',
    COURSE_APPROVAL: '/admin/courses/approval',
    TEACHER_APPLICATIONS: '/admin/teacher-applications',
    APPROVE_TEACHER: (id: string) => `/admin/teachers/${id}/approve`,
    SYSTEM_SETTINGS: '/admin/settings',
    AUDIT_LOGS: '/admin/audit-logs',
    REVENUE: '/admin/revenue',
    REPORTS: '/admin/reports',
    MAINTENANCE: '/admin/maintenance',
    HEALTH_CHECK: '/admin/health',
  },

  // Payment
  PAYMENT: {
    METHODS: '/payment/methods',
    ADD_METHOD: '/payment/methods',
    REMOVE_METHOD: (id: string) => `/payment/methods/${id}`,
    PROCESS: '/payment/process',
    HISTORY: '/payment/history',
    REFUND: (id: string) => `/payment/${id}/refund`,
    INVOICE: (id: string) => `/payment/${id}/invoice`,
  },

  // System
  SYSTEM: {
    HEALTH: '/system/health',
    VERSION: '/system/version',
    MAINTENANCE: '/system/maintenance',
    BACKUP: '/system/backup',
    CACHE_CLEAR: '/system/cache/clear',
  },
} as const;
