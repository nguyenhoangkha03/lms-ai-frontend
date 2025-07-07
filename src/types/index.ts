// Base types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Authentication types
export interface User extends BaseEntity {
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  coverUrl?: string;
  userType: 'student' | 'teacher' | 'admin';
  status:
    | 'pending'
    | 'active'
    | 'inactive'
    | 'suspended'
    | 'banned'
    | 'deleted';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  preferredLanguage: string;
  timezone: string;
  preferences?: Record<string, any>;
  profile?: UserProfile;
  permissions?: string[];
  roles?: string[];
}

export interface UserProfile extends BaseEntity {
  userId: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  organization?: string;
  jobTitle?: string;
  website?: string;
  isPublic: boolean;
  isVerified: boolean;
  interests?: string[];
  skills?: string[];
  socials?: UserSocial[];
}

export interface UserSocial extends BaseEntity {
  userId: string;
  platform: string;
  url: string;
  handle?: string;
  displayName?: string;
  isPublic: boolean;
  isVerified: boolean;
  displayOrder: number;
}

export interface StudentProfile extends BaseEntity {
  userId: string;
  studentCode: string;
  educationLevel?: string;
  fieldOfStudy?: string;
  institution?: string;
  graduationYear?: number;
  gpa?: number;
  learningGoals?: string;
  preferredLearningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  studyTimePreference?: string;
  difficultyPreference: 'beginner' | 'intermediate' | 'advanced';
  motivationFactors?: string;
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalCertificates: number;
  totalStudyHours: number;
  averageGrade: number;
  achievementPoints: number;
  achievementLevel: string;
  enableAIRecommendations: boolean;
  enableProgressTracking: boolean;
  enrollmentDate: string;
  lastActivityAt?: string;
  badges?: Badge[];
  learningPreferences?: Record<string, any>;
  studySchedule?: Record<string, any>;
}

export interface TeacherProfile extends BaseEntity {
  userId: string;
  teacherCode: string;
  specializations?: string;
  qualifications?: string;
  yearsExperience: number;
  teachingStyle?: string;
  officeHours?: string;
  rating: number;
  totalRatings: number;
  totalStudents: number;
  totalCourses: number;
  totalLessons: number;
  totalTeachingHours: number;
  totalEarnings: number;
  isApproved: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  approvedBy?: string;
  approvedAt?: string;
  approvalNotes?: string;
  licenseNumber?: string;
  affiliations?: string;
  hourlyRate?: number;
  currency: string;
  professionalSummary?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  acceptingStudents: boolean;
  maxStudentsPerClass?: number;
  allowReviews: boolean;
  applicationDate: string;
  lastTeachingAt?: string;
  subjects?: string[];
  teachingLanguages?: string[];
  availability?: Record<string, any>;
  awards?: Award[];
  publications?: Publication[];
}

export interface LoginFormData extends BaseEntity {}

export interface ForgotPasswordFormData extends BaseEntity {}

export interface RegisterFormData extends BaseEntity {}

export interface ResetPasswordFormData extends BaseEntity {}

export interface UpdateProfileFormData extends BaseEntity {}

export interface ChangePasswordFormData extends BaseEntity {}

// Course related types
export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  iconUrl?: string;
  coverUrl?: string;
  color?: string;
  orderIndex: number;
  level: number;
  isActive: boolean;
  showInMenu: boolean;
  isFeatured: boolean;
  courseCount: number;
  mpath?: string;
  children?: Category[];
  parent?: Category;
}

export interface Course extends BaseEntity {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  trailerVideoUrl?: string;
  teacherId: string;
  categoryId: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'all_levels';
  language: string;
  durationHours: number;
  durationMinutes: number;
  price: number;
  currency: string;
  originalPrice?: number;
  isFree: boolean;
  pricingModel: 'free' | 'paid' | 'subscription' | 'freemium';
  status: 'draft' | 'under_review' | 'published' | 'archived' | 'suspended';
  enrollmentLimit?: number;
  rating: number;
  totalRatings: number;
  totalEnrollments: number;
  totalCompletions: number;
  totalReviews: number;
  totalSections: number;
  totalLessons: number;
  totalVideoDuration: number;
  featured: boolean;
  bestseller: boolean;
  isNew: boolean;
  allowReviews: boolean;
  allowDiscussions: boolean;
  hasCertificate: boolean;
  lifetimeAccess: boolean;
  accessDuration?: number;
  publishedAt?: string;
  lastUpdatedAt?: string;
  tags?: string[];
  requirements?: string[];
  whatYouWillLearn?: string[];
  targetAudience?: string[];
  teacher?: User;
  category?: Category;
  sections?: CourseSection[];
  reviews?: CourseReview[];
  enrollment?: Enrollment;
}

export interface CourseSection extends BaseEntity {
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  isActive: boolean;
  isRequired: boolean;
  totalLessons: number;
  totalDuration: number;
  availableFrom?: string;
  availableUntil?: string;
  objectives?: string[];
  lessons?: Lesson[];
}

export interface Lesson extends BaseEntity {
  courseId: string;
  sectionId: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  videoDuration?: number;
  audioUrl?: string;
  lessonType:
    | 'video'
    | 'text'
    | 'audio'
    | 'interactive'
    | 'quiz'
    | 'assignment'
    | 'live_session'
    | 'download';
  orderIndex: number;
  isPreview: boolean;
  isMandatory: boolean;
  isActive: boolean;
  estimatedDuration: number;
  points: number;
  availableFrom?: string;
  availableUntil?: string;
  thumbnailUrl?: string;
  attachments?: FileAttachment[];
  objectives?: string[];
  prerequisites?: string[];
  interactiveElements?: Record<string, any>;
  transcript?: string;
  progress?: LessonProgress;
}

export interface Enrollment extends BaseEntity {
  studentId: string;
  courseId: string;
  enrollmentDate: string;
  completionDate?: string;
  status:
    | 'enrolled'
    | 'in_progress'
    | 'completed'
    | 'dropped'
    | 'paused'
    | 'suspended'
    | 'expired';
  progressPercentage: number;
  lastAccessedAt?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  paymentAmount: number;
  paymentCurrency: string;
  paymentTransactionId?: string;
  paymentDate?: string;
  certificateUrl?: string;
  certificateIssuedAt?: string;
  rating?: number;
  review?: string;
  reviewDate?: string;
  totalTimeSpent: number;
  lessonsCompleted: number;
  totalLessons: number;
  accessExpiresAt?: string;
  course?: Course;
  student?: User;
}

export interface LessonProgress extends BaseEntity {
  studentId: string;
  lessonId: string;
  enrollmentId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  completionDate?: string;
  timeSpent: number;
  lastPosition: number;
  attempts: number;
  score?: number;
  maxScore?: number;
  progressPercentage: number;
  firstAccessedAt?: string;
  lastAccessedAt?: string;
  notes?: string;
  isSkipped: boolean;
  feedback?: string;
  answers?: Record<string, any>;
  bookmarks?: number[];
  interactionData?: Record<string, any>;
}

// Assessment types
export interface Assessment extends BaseEntity {
  courseId?: string;
  lessonId?: string;
  teacherId: string;
  title: string;
  description?: string;
  instructions?: string;
  assessmentType:
    | 'quiz'
    | 'exam'
    | 'assignment'
    | 'survey'
    | 'practice'
    | 'final_exam'
    | 'midterm'
    | 'project';
  status: 'draft' | 'published' | 'archived' | 'suspended';
  timeLimit?: number;
  maxAttempts: number;
  passingScore: number;
  totalPoints: number;
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  showResults: boolean;
  showCorrectAnswers: boolean;
  isMandatory: boolean;
  isProctored: boolean;
  availableFrom?: string;
  availableUntil?: string;
  gradingMethod: 'automatic' | 'manual' | 'hybrid' | 'peer_review';
  weight: number;
  questions?: Question[];
  attempts?: AssessmentAttempt[];
}

export interface Question extends BaseEntity {
  assessmentId: string;
  questionText: string;
  questionType:
    | 'multiple_choice'
    | 'true_false'
    | 'essay'
    | 'short_answer'
    | 'code'
    | 'fill_blank'
    | 'matching'
    | 'ordering';
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  orderIndex: number;
  timeLimit?: number;
  hint?: string;
  options?: QuestionOption[];
  correctAnswer?: Record<string, any>;
  tags?: string[];
  attachments?: FileAttachment[];
  validationRules?: Record<string, any>;
  analytics?: Record<string, any>;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
  orderIndex: number;
}

export interface AssessmentAttempt extends BaseEntity {
  studentId: string;
  assessmentId: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt?: string;
  status: 'in_progress' | 'submitted' | 'abandoned' | 'timed_out';
  gradingStatus: 'pending' | 'graded' | 'reviewing';
  score: number;
  maxScore: number;
  percentage: number;
  timeTaken: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
  isFlagged: boolean;
  flagReason?: string;
  answers?: Record<string, any>;
  proctoringData?: Record<string, any>;
  sessionData?: Record<string, any>;
  analyticsData?: Record<string, any>;
}

// AI and Analytics types
export interface AIRecommendation extends BaseEntity {
  studentId: string;
  recommendationType:
    | 'next_lesson'
    | 'review_content'
    | 'course_recommendation'
    | 'difficulty_adjustment'
    | 'study_schedule';
  contentId?: string;
  contentType?: 'course' | 'lesson' | 'assessment' | 'topic';
  title: string;
  description: string;
  reason: string;
  confidenceScore: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'active' | 'accepted' | 'dismissed';
  expiresAt?: string;
  interactedAt?: string;
  interactionType?: 'viewed' | 'clicked' | 'accepted' | 'dismissed';
  userRating?: number;
  userFeedback?: string;
  wasEffective?: boolean;
  modelInfo?: Record<string, any>;
  userContext?: Record<string, any>;
  expectedOutcomes?: Record<string, any>;
}

export interface LearningAnalytics extends BaseEntity {
  studentId: string;
  courseId?: string;
  date: string;
  totalTimeSpent: number;
  lessonsCompleted: number;
  quizzesAttempted: number;
  quizzesPassed: number;
  averageQuizScore: number;
  loginCount: number;
  videoWatchTime: number;
  readingTime: number;
  discussionPosts: number;
  chatMessages: number;
  mostActiveHour: number;
  engagementScore: number;
  progressPercentage: number;
  performanceLevel: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
  learningPattern:
    | 'consistent'
    | 'binge_learner'
    | 'procrastinator'
    | 'irregular';
  struggleIndicators?: Record<string, any>;
  engagementMetrics?: Record<string, any>;
  learningVelocity?: Record<string, any>;
  predictiveIndicators?: Record<string, any>;
  skillsGained?: string[];
  behavioralPatterns?: Record<string, any>;
}

// Communication types
export interface ChatRoom extends BaseEntity {
  name: string;
  description?: string;
  roomType: 'course' | 'study_group' | 'private' | 'announcement' | 'general';
  status: 'active' | 'locked' | 'archived';
  courseId?: string;
  lessonId?: string;
  isActive: boolean;
  isPrivate: boolean;
  maxParticipants?: number;
  participantCount: number;
  messageCount: number;
  lastMessageAt?: string;
  lastMessageBy?: string;
  avatarUrl?: string;
  expiresAt?: string;
  settings?: Record<string, any>;
  moderationSettings?: Record<string, any>;
  participants?: ChatParticipant[];
  messages?: ChatMessage[];
}

export interface ChatParticipant extends BaseEntity {
  roomId: string;
  userId: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  status: 'active' | 'banned' | 'muted';
  joinedAt: string;
  leftAt?: string;
  lastRead?: string;
  lastReadMessageId?: string;
  unreadCount: number;
  isMuted: boolean;
  isPinned: boolean;
  isTyping: boolean;
  lastActiveAt?: string;
  lastSeenAt?: string;
  nickname?: string;
  customColor?: string;
  bannedAt?: string;
  bannedBy?: string;
  banReason?: string;
  banExpiresAt?: string;
  permissions?: Record<string, any>;
  notificationSettings?: Record<string, any>;
  user?: User;
}

export interface ChatMessage extends BaseEntity {
  roomId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system' | 'video' | 'audio';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyToId?: string;
  isEdited: boolean;
  editedAt?: string;
  originalContent?: string;
  isDeleted: boolean;
  deletedBy?: string;
  isPinned: boolean;
  pinnedAt?: string;
  pinnedBy?: string;
  isFlagged: boolean;
  flaggedBy?: string;
  flagReason?: string;
  attachments?: FileAttachment[];
  mentions?: string[];
  reactions?: MessageReaction[];
  formatting?: Record<string, any>;
  linkPreview?: Record<string, any>;
  translations?: Record<string, any>;
  moderationResult?: Record<string, any>;
  sender?: User;
  replyTo?: ChatMessage;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

// Video Session types
export interface VideoSession extends BaseEntity {
  title: string;
  description?: string;
  hostId: string;
  courseId?: string;
  lessonId?: string;
  sessionType: 'lecture' | 'office_hours' | 'workshop' | 'webinar' | 'meeting';
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  maxParticipants?: number;
  currentParticipants: number;
  totalParticipants: number;
  provider: 'webrtc' | 'zoom' | 'teams' | 'jitsi';
  meetingUrl: string;
  meetingId?: string;
  passcode?: string;
  dialInInfo?: string;
  isRecording: boolean;
  recordingUrl?: string;
  recordingDuration?: number;
  recordingSize?: number;
  requiresRegistration: boolean;
  waitingRoomEnabled: boolean;
  agenda?: string;
  notes?: string;
  summary?: string;
  settings?: Record<string, any>;
  securitySettings?: Record<string, any>;
  breakoutRooms?: Record<string, any>;
  polls?: Record<string, any>;
  analytics?: Record<string, any>;
  qualityMetrics?: Record<string, any>;
  host?: User;
  participants?: VideoParticipant[];
}

export interface VideoParticipant extends BaseEntity {
  sessionId: string;
  userId: string;
  role: 'host' | 'presenter' | 'attendee' | 'observer';
  connectionStatus:
    | 'connected'
    | 'disconnected'
    | 'connecting'
    | 'reconnecting';
  joinedAt: string;
  leftAt?: string;
  duration: number;
  isMuted: boolean;
  videoDisabled: boolean;
  isScreenSharing: boolean;
  handRaised: boolean;
  handRaisedAt?: string;
  inWaitingRoom: boolean;
  breakoutRoomId?: string;
  displayName?: string;
  avatarUrl?: string;
  feedback?: string;
  rating?: number;
  deviceInfo?: Record<string, any>;
  connectionQuality?: Record<string, any>;
  permissions?: Record<string, any>;
  engagementMetrics?: Record<string, any>;
  activitiesLog?: Record<string, any>;
  technicalIssues?: Record<string, any>;
  exitSurvey?: Record<string, any>;
  user?: User;
}

// Notification types
export interface Notification extends BaseEntity {
  userId: string;
  title: string;
  message: string;
  type:
    | 'assignment_due'
    | 'message_received'
    | 'course_update'
    | 'system_maintenance'
    | 'achievement_earned'
    | 'payment_reminder';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'academic' | 'social' | 'system' | 'financial' | 'achievement';
  relatedId?: string;
  relatedType?: 'course' | 'lesson' | 'assessment' | 'message' | 'user';
  isRead: boolean;
  readAt?: string;
  iconUrl?: string;
  imageUrl?: string;
  actionUrl?: string;
  expiresAt?: string;
  actions?: NotificationAction[];
  deliveryStatus?: Record<string, any>;
  personalization?: Record<string, any>;
  tracking?: Record<string, any>;
  richContent?: Record<string, any>;
  scheduling?: Record<string, any>;
  grouping?: Record<string, any>;
}

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  url?: string;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface NotificationPreference extends BaseEntity {
  userId: string;
  notificationType: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  slackEnabled: boolean;
  discordEnabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  quietHours?: Record<string, any>;
  filters?: Record<string, any>;
  digestSettings?: Record<string, any>;
  deliveryPreferences?: Record<string, any>;
  integrations?: Record<string, any>;
}

// Chatbot types
export interface ChatbotConversation extends BaseEntity {
  userId: string;
  courseId?: string;
  title: string;
  status: 'active' | 'completed' | 'escalated';
  conversationType:
    | 'academic_help'
    | 'technical_support'
    | 'course_guidance'
    | 'general_inquiry';
  startedAt: string;
  endedAt?: string;
  isActive: boolean;
  messageCount: number;
  userMessageCount: number;
  botMessageCount: number;
  lastMessageAt?: string;
  lastMessageBy: 'user' | 'bot';
  rating?: number;
  feedback?: string;
  context?: Record<string, any>;
  userProfile?: Record<string, any>;
  summary?: string;
  aiConfig?: Record<string, any>;
  learningAnalytics?: Record<string, any>;
  qualityMetrics?: Record<string, any>;
  escalation?: Record<string, any>;
  messages?: ChatbotMessage[];
}

export interface ChatbotMessage extends BaseEntity {
  conversationId: string;
  sender: 'user' | 'bot' | 'system';
  content: string;
  messageType: 'text' | 'image' | 'interactive' | 'file';
  status: 'sending' | 'sent' | 'failed' | 'processing';
  timestamp: string;
  isImportant: boolean;
  needsFollowUp: boolean;
  isFlagged: boolean;
  flagReason?: string;
  userRating?: number;
  userFeedback?: string;
  attachments?: FileAttachment[];
  aiMetadata?: Record<string, any>;
  inputAnalysis?: Record<string, any>;
  interactiveElements?: Record<string, any>;
  personalization?: Record<string, any>;
  educationalContent?: Record<string, any>;
  errorInfo?: Record<string, any>;
  analytics?: Record<string, any>;
}

// File and media types
export interface FileAttachment {
  id: string;
  originalName: string;
  storedName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  fileType: 'image' | 'video' | 'document' | 'audio' | 'archive' | 'other';
  uploaderId: string;
  relatedType?:
    | 'course_thumbnail'
    | 'user_avatar'
    | 'lesson_video'
    | 'assignment_submission';
  isPublic: boolean;
  isTemporary: boolean;
  extension: string;
  fileHash?: string;
  downloadCount: number;
  lastAccessedAt?: string;
  expiresAt?: string;
  altText?: string;
  description?: string;
  uploadedAt: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

// System types
export interface SystemSetting extends BaseEntity {
  key: string;
  name: string;
  description?: string;
  category: 'general' | 'security' | 'email' | 'payment' | 'ai' | 'storage';
  type: 'string' | 'number' | 'boolean' | 'json' | 'color' | 'url';
  value: string;
  defaultValue: string;
  isActive: boolean;
  isPublic: boolean;
  isReadOnly: boolean;
  isEncrypted: boolean;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  validationRules?: Record<string, any>;
  uiConfig?: Record<string, any>;
  dependencies?: Record<string, any>;
  valueHistory?: Record<string, any>;
  environmentOverrides?: Record<string, any>;
}

export interface AuditLog extends BaseEntity {
  userId: string;
  sessionId?: string;
  action:
    | 'create'
    | 'read'
    | 'update'
    | 'delete'
    | 'login'
    | 'logout'
    | 'approve'
    | 'reject';
  entityType: 'User' | 'Course' | 'Assessment' | 'SystemSetting' | 'Payment';
  entityId?: string;
  description: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  status: 'success' | 'failed';
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  requestUrl?: string;
  httpMethod?: string;
  responseCode?: number;
  processingTime?: number;
  errorDetails?: string;
  errorCode?: string;
  stackTrace?: string;
  isSensitive: boolean;
  requiresReview: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  requestData?: Record<string, any>;
  responseData?: Record<string, any>;
  changes?: Record<string, any>;
  context?: Record<string, any>;
  securityInfo?: Record<string, any>;
  relatedEntities?: Record<string, any>;
  tags?: string[];
  user?: User;
}

// Common UI types
export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  color: string;
  earnedAt: string;
  criteria?: string;
}

export interface Award {
  id: string;
  title: string;
  description: string;
  issuer: string;
  issuedDate: string;
  certificateUrl?: string;
}

export interface Publication {
  id: string;
  title: string;
  description?: string;
  publisher: string;
  publishedDate: string;
  url?: string;
  type: 'article' | 'book' | 'paper' | 'blog' | 'other';
}

export interface CourseReview extends BaseEntity {
  courseId: string;
  studentId: string;
  enrollmentId: string;
  rating: number;
  title?: string;
  content: string;
  isPublic: boolean;
  isVerified: boolean;
  helpfulCount: number;
  reportCount: number;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  moderatedBy?: string;
  moderatedAt?: string;
  moderationNotes?: string;
  student?: User;
}

// Form and UI state types
export interface FormState {
  isLoading: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isDirty: boolean;
  isValid: boolean;
}

export interface TableState {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  filters: Record<string, any>;
  search?: string;
}

export interface ModalState {
  isOpen: boolean;
  type?: string;
  data?: any;
  options?: Record<string, any>;
}

export interface ToastState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  actions?: ToastAction[];
}

export interface ToastAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary';
}

// Redux state types
export interface RootStateStructure {
  auth: AuthState;
  user: UserState;
  courses: CourseState;
  lessons: LessonState;
  assessments: AssessmentState;
  chat: ChatState;
  notifications: NotificationState;
  ui: UIState;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface UserState {
  profile: UserProfile | null;
  preferences: Record<string, any>;
  isLoading: boolean;
  error: string | null;
}

export interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  enrollments: Enrollment[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: Record<string, any>;
}

export interface LessonState {
  lessons: Lesson[];
  currentLesson: Lesson | null;
  progress: Record<string, LessonProgress>;
  isLoading: boolean;
  error: string | null;
}

export interface AssessmentState {
  assessments: Assessment[];
  currentAssessment: Assessment | null;
  attempts: AssessmentAttempt[];
  currentAttempt: AssessmentAttempt | null;
  isLoading: boolean;
  error: string | null;
}

export interface ChatState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: Record<string, ChatMessage[]>;
  participants: Record<string, ChatParticipant[]>;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreference[];
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  theme: 'light' | 'dark';
  language: string;
  sidebarCollapsed: boolean;
  modals: Record<string, ModalState>;
  toasts: ToastState[];
  loading: Record<string, boolean>;
  errors: Record<string, string>;
}
