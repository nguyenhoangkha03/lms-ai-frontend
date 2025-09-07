export interface User {
  id: string;
  teacherProfile?: TeacherProfile;
  studentProfile?: StudentProfile;
  userProfile?: UserProfile;
  courses?: Course[];
  profile?: TeacherProfile | StudentProfile | UserProfile;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone?: string;
  organizationId?: string;
  departmentId?: string;
  metadata?: Record<string, any>;
  sessionId?: string;
  userType: 'student' | 'teacher' | 'admin';
  roles: string[];
  status:
    | 'pending'
    | 'active'
    | 'inactive'
    | 'suspended'
    | 'banned'
    | 'deleted';
  avatarUrl?: string;
  avatar?: string;
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
  user?: User;
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
  onboardingCompleted: boolean;
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
  approvedBy?: string;
  isActive: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  applicationData?: Record<string, any>;
  hourlyRate?: number;
  currency: string;
  acceptingStudents: boolean;
  maxStudentsPerClass?: number;
  createdAt: string;
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
  bloomsTaxonomy?:
    | 'remember'
    | 'understand'
    | 'apply'
    | 'analyze'
    | 'evaluate'
    | 'create';
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
  type:
    | 'academic'
    | 'social'
    | 'system'
    | 'success'
    | 'error'
    | 'warning'
    | 'info';
  description?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category?: string;
  relatedId?: string;
  relatedType?: string;
  isRead: boolean;
  readAt?: string;
  iconUrl?: string;
  imageUrl?: string;
  actionUrl?: string;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
  avatar?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface NotificationAction {
  id: string;
  label: string;
  url?: string;
  handler?: () => void;
  action?: string;
  variant?:
    | 'primary'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'default'
    | 'ghost'
    | 'link'
    | 'ai'
    | 'gradient';
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  marketing: boolean;
  academicUpdates: boolean;
  socialActivity: boolean;
  systemAlerts: boolean;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userType: 'student' | 'teacher' | 'admin';
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

// Teacher Registration Types
export enum DegreeLevel {
  BACHELOR = 'bachelor',
  MASTER = 'master',
  PHD = 'phd',
  ASSOCIATE = 'associate',
  DIPLOMA = 'diploma',
  OTHER = 'other',
}

export enum ExperienceLevel {
  ENTRY = 'entry',
  INTERMEDIATE = 'intermediate',
  EXPERIENCED = 'experienced',
  EXPERT = 'expert',
}

export interface PersonalInfoFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  timezone?: string;
}

export interface EducationFormData {
  highestDegree: DegreeLevel;
  fieldOfStudy: string;
  institution: string;
  graduationYear: number;
  additionalCertifications?: string;
}

export interface ExperienceFormData {
  teachingExperience: number;
  subjectAreas: string[];
  previousInstitutions?: string;
  onlineTeachingExperience: boolean;
  totalStudentsTaught?: string;
}

export interface MotivationFormData {
  whyTeach: string;
  teachingPhilosophy: string;
  specialSkills?: string;
  courseIdeas?: string;
}

export interface AvailabilityFormData {
  hoursPerWeek?: string;
  preferredSchedule?: string[];
  startDate?: string;
}

export interface DocumentsFormData {
  resumeUploaded: boolean;
  degreeUploaded: boolean;
  certificationUploaded?: boolean;
  idUploaded: boolean;
}

export interface AgreementsFormData {
  termsAccepted: boolean;
  backgroundCheckConsent: boolean;
  communicationConsent: boolean;
}

export interface TeacherRegistrationFormData {
  personalInfo: PersonalInfoFormData;
  education: EducationFormData;
  experience: ExperienceFormData;
  motivation: MotivationFormData;
  availability?: AvailabilityFormData;
  documents: DocumentsFormData;
  agreements: AgreementsFormData;
  password: string;
}

export interface TeacherApplicationResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userType: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;

  sessionId?: string;
  message: string;
  applicationId: string;
}

// Document Upload Types
export enum DocumentType {
  RESUME = 'resume',
  DEGREE_CERTIFICATE = 'degree_certificate',
  CERTIFICATION = 'certification',
  IDENTITY_DOCUMENT = 'identity_document',
  TEACHING_PORTFOLIO = 'teaching_portfolio',
  REFERENCE_LETTER = 'reference_letter',
  OTHER = 'other',
}

export interface UploadedDocument {
  id: string;
  originalName: string;
  documentType: DocumentType;
  size: number;
  uploadedAt: string;
  isVerified: boolean;
  verifiedAt?: string;
}

export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  document: UploadedDocument;
}

// Admin Types
export interface TeacherApplication {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    createdAt: string;
  };
  teacherProfile: {
    id: string;
    teacherCode: string;
    specializations: string;
    qualifications: string;
    yearsExperience: number;
    teachingStyle: string;
    subjects: string[];
    isApproved: boolean;
    isActive: boolean;
    applicationData: any;
    submittedAt: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface ApprovalDecision {
  isApproved: boolean;
  notes?: string;
  conditions?: string[];
  nextReviewDate?: Date;
}

export interface TeacherApplicationQuery {
  status?: 'pending' | 'approved' | 'rejected' | 'under_review';
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'submittedAt' | 'reviewedAt' | 'email' | 'firstName';
  sortOrder?: 'ASC' | 'DESC';
}
