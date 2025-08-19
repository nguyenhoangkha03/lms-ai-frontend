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
  lastLoginIp?: string;
  failedLoginAttempts: number;
  lockedUntil?: string;
  preferredLanguage: string;
  passwordChangedAt?: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: string;
  countryCode?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  organization?: string;
  jobTitle?: string;
  department?: string;
  website?: string;
  interests?: string[];
  skills?: string[];
  hobbies?: string[];
  isPublic: boolean;
  isSearchable: boolean;
  isVerified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  metadata?: Record<string, any>;
}

export interface TeacherApplication {
  id: string;
  userId: string;
  applicationStatus:
    | 'pending'
    | 'under_review'
    | 'approved'
    | 'rejected'
    | 'resubmission_required';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  requiredDocuments: {
    resume: boolean;
    degree: boolean;
    certification: boolean;
    identification: boolean;
  };
  submittedDocuments: {
    resumeUrl?: string;
    degreeUrl?: string;
    certificationUrl?: string;
    idUrl?: string;
  };
  teachingExperience: {
    years: number;
    description: string;
    previousInstitutions: string[];
  };
  specializations: string[];
  expectedSalaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  availableSchedule: {
    fullTime: boolean;
    partTime: boolean;
    weekends: boolean;
    evenings: boolean;
  };
  interviewSchedule?: {
    preferredDates: string[];
    preferredTimes: string[];
    timezone: string;
  };
  backgroundCheckStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
  backgroundCheckResults?: Record<string, any>;
  user: User;
  userProfile: UserProfile;
}
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSecurityEvent {
  id: string;
  userId: string;
  eventType:
    | 'login'
    | 'logout'
    | 'failed_login'
    | 'password_change'
    | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress: string;
  userAgent: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  suspendedUsers: number;
  userGrowth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  userTypeDistribution: {
    students: number;
    teachers: number;
    admins: number;
  };
  engagementMetrics: {
    averageSessionDuration: number;
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
  };
  securityMetrics: {
    failedLoginAttempts: number;
    suspiciousActivities: number;
    blockedIPs: number;
    twoFactorAdoption: number;
  };
  geographicDistribution: {
    country: string;
    userCount: number;
  }[];
  deviceAnalytics: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
}

export interface BulkOperation {
  id: string;
  operationType:
    | 'activate'
    | 'deactivate'
    | 'suspend'
    | 'delete'
    | 'assign_role'
    | 'remove_role'
    | 'update_status';
  targetUserIds: string[];
  parameters?: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  errors: string[];
  startedAt?: string;
  completedAt?: string;
  startedBy: string;
  results?: Record<string, any>;
}

// Query parameters interfaces
export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  userType?: string;
  status?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
  country?: string;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
}

export interface TeacherApplicationsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  submittedAfter?: string;
  submittedBefore?: string;
  reviewedBy?: string;
}

export interface SecurityEventsQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  eventType?: string;
  severity?: string;
  resolved?: boolean;
  ipAddress?: string;
  dateFrom?: string;
  dateTo?: string;
}
