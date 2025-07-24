export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone?: string;
  userType: 'student' | 'teacher' | 'admin';
  status:
    | 'pending'
    | 'active'
    | 'inactive'
    | 'suspended'
    | 'banned'
    | 'deleted';
  avatarUrl?: string;
  coverUrl?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  organization?: string;
  jobTitle?: string;
  website?: string;
  interests?: string[];
  skills?: string[];
  isPublic: boolean;
  isVerified: boolean;
}

export interface StudentProfile {
  id: string;
  userId: string;
  studentCode: string;
  educationLevel?: string;
  fieldOfStudy?: string;
  institution?: string;
  graduationYear?: number;
  gpa?: number;
  learningGoals?: string;
  preferredLearningStyle?: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  studyTimePreference?: string;
  difficultyPreference?: 'beginner' | 'intermediate' | 'advanced';
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalCertificates: number;
  totalStudyHours: number;
  averageGrade: number;
  achievementPoints: number;
  achievementLevel: string;
  badges?: string[];
  enableAIRecommendations: boolean;
  enableProgressTracking: boolean;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  teacherCode: string;
  specializations?: string[];
  qualifications?: string[];
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
  hourlyRate?: number;
  currency: string;
  acceptingStudents: boolean;
  maxStudentsPerClass?: number;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnailUrl?: string;
  trailerVideoUrl?: string;
  teacherId: string;
  teacher?: User & { teacherProfile?: TeacherProfile };
  categoryId: string;
  category?: Category;
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
  tags: string[];
  requirements: string[];
  whatYouWillLearn: string[];
  targetAudience: string[];
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
  availableFrom?: string;
  availableUntil?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  coverUrl?: string;
  color?: string;
  orderIndex: number;
  level: number;
  isActive: boolean;
  showInMenu: boolean;
  isFeatured: boolean;
  courseCount: number;
  parentId?: string;
  children?: Category[];
}

export interface Lesson {
  id: string;
  courseId: string;
  sectionId: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  videoDuration?: number;
  audioUrl?: string;
  attachments?: FileAttachment[];
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
  status: 'draft' | 'under_review' | 'published' | 'archived' | 'suspended';
  estimatedDuration: number;
  points: number;
  availableFrom?: string;
  availableUntil?: string;
  publishedAt?: string;
  objectives?: string[];
  prerequisites?: string[];
  thumbnailUrl?: string;
  transcript?: string;
  viewCount: number;
  completionCount: number;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

export interface Assessment {
  id: string;
  courseId: string;
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
  maxAttempts?: number;
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
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  assessmentId: string;
  questionText: string;
  questionType:
    | 'multiple_choice'
    | 'true_false'
    | 'short_answer'
    | 'essay'
    | 'fill_in_the_blank'
    | 'matching'
    | 'ordering'
    | 'numeric'
    | 'code';
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  orderIndex: number;
  timeLimit?: number;
  hint?: string;
  options?: QuestionOption[];
  correctAnswer?: any;
  tags?: string[];
  attachments?: FileAttachment[];
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
  orderIndex: number;
}

export interface FileAttachment {
  id: string;
  originalName: string;
  storedName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileType: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';
  fileUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  uploadedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AIRecommendation {
  id: string;
  studentId: string;
  recommendationType: string;
  contentId?: string;
  contentType?: string;
  title: string;
  description: string;
  reason: string;
  confidenceScore: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status:
    | 'pending'
    | 'active'
    | 'accepted'
    | 'dismissed'
    | 'expired'
    | 'completed';
  expiresAt?: string;
  interactedAt?: string;
  interactionType?: string;
  userRating?: number;
  userFeedback?: string;
  wasEffective?: boolean;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  roomType:
    | 'general'
    | 'course'
    | 'lesson'
    | 'study_group'
    | 'office_hours'
    | 'help_desk'
    | 'announcements'
    | 'private'
    | 'public';
  status: 'active' | 'inactive' | 'archived' | 'locked' | 'maintenance';
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
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  sender?: User;
  content: string;
  messageType:
    | 'text'
    | 'image'
    | 'video'
    | 'audio'
    | 'file'
    | 'link'
    | 'code'
    | 'system'
    | 'announcement'
    | 'poll'
    | 'quiz';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'deleted';
  replyToId?: string;
  replyTo?: ChatMessage;
  attachments?: FileAttachment[];
  mentions?: string[];
  reactions?: Record<string, string[]>;
  isEdited: boolean;
  editedAt?: string;
  originalContent?: string;
  isDeleted: boolean;
  isPinned: boolean;
  pinnedAt?: string;
  pinnedBy?: string;
  isFlagged: boolean;
  createdAt: string;
}

export interface VideoSession {
  id: string;
  title: string;
  description?: string;
  hostId: string;
  host?: User;
  courseId?: string;
  lessonId?: string;
  sessionType:
    | 'meeting'
    | 'webinar'
    | 'lecture'
    | 'tutorial'
    | 'office_hours'
    | 'study_group'
    | 'exam'
    | 'workshop';
  status:
    | 'scheduled'
    | 'live'
    | 'completed'
    | 'cancelled'
    | 'postponed'
    | 'failed';
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  maxParticipants?: number;
  currentParticipants: number;
  totalParticipants: number;
  provider:
    | 'webrtc'
    | 'zoom'
    | 'teams'
    | 'meet'
    | 'jitsi'
    | 'bigbluebutton'
    | 'custom';
  meetingUrl?: string;
  meetingId?: string;
  passcode?: string;
  isRecording: boolean;
  recordingUrl?: string;
  recordingDuration?: number;
  requiresRegistration: boolean;
  waitingRoomEnabled: boolean;
  agenda?: string;
  notes?: string;
  summary?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category:
    | 'academic'
    | 'social'
    | 'system'
    | 'security'
    | 'marketing'
    | 'administrative';
  relatedId?: string;
  relatedType?: string;
  isRead: boolean;
  readAt?: string;
  iconUrl?: string;
  imageUrl?: string;
  actionUrl?: string;
  actions?: NotificationAction[];
  expiresAt?: string;
  createdAt: string;
}

export interface NotificationAction {
  id: string;
  label: string;
  url?: string;
  action?: string;
  variant?: 'primary' | 'secondary' | 'destructive';
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userType: 'student' | 'teacher';
  agreedToTerms: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  password: string;
  confirmPassword: string;
}
