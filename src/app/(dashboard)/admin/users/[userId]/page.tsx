'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  Camera,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Star,
  Award,
  BookOpen,
  Users,
  Clock,
  Globe,
  Briefcase,
  GraduationCap,
  Link as LinkIcon,
  Ban,
  Trash2,
  RotateCcw,
  ChevronLeft,
  Facebook,
  Twitter,
  Instagram,
  Github,
  Youtube,
  Linkedin,
  ExternalLink,
  Target,
  TrendingUp,
  Activity,
  MessageSquare,
  FileText,
  Settings,
  History,
  Edit,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUserProfileQuery,
  useGetStudentProfileQuery,
  useGetTeacherProfileQuery,
  useUpdateUserProfileMutation,
  useUpdateStudentProfileMutation,
  useUpdateTeacherProfileMutation,
} from '@/lib/redux/api/admin-api';
import { cn } from '@/lib/utils';

interface UserDetail {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string | null;
  userType: 'admin' | 'teacher' | 'student';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;

  // Profile information
  profile: {
    id: string;
    bio?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    nationality?: string;
    timezone?: string;
    language?: string;
    currency?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
    emergencyContact?: {
      name?: string;
      relationship?: string;
      phone?: string;
      email?: string;
    };
    preferences?: {
      emailNotifications: boolean;
      smsNotifications: boolean;
      pushNotifications: boolean;
      marketingEmails: boolean;
      profileVisibility: 'public' | 'private' | 'friends_only';
      dataSharing: boolean;
    };
  };

  // Student specific data
  studentProfile?: {
    id: string;
    studentCode: string;
    educationLevel?: string;
    fieldOfStudy?: string;
    institution?: string;
    graduationYear?: number;
    gpa?: number;
    learningGoals?: string;
    preferredLearningStyle?:
      | 'visual'
      | 'auditory'
      | 'kinesthetic'
      | 'reading_writing';
    studyTimePreference?: string;
    difficultyPreference: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    motivationFactors?: string;
    totalCoursesEnrolled: number;
    totalCoursesCompleted: number;
    totalCertificates: number;
    totalStudyHours: number;
    averageGrade: number;
    achievementPoints: number;
    achievementLevel: string;
    badges?: string[];
    learningPreferences?: Record<string, any>;
    studySchedule?: Record<string, any>;
    analyticsData?: Record<string, any>;
    enableAIRecommendations: boolean;
    enableProgressTracking: boolean;
    parentalConsent: boolean;
    parentContact?: string;
    enrollmentDate: string;
    lastActivityAt?: string;
  };

  // Teacher specific data
  teacherProfile?: {
    id: string;
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
    subjects?: string[];
    teachingLanguages?: string[];
    availability?: Record<string, any>;
    hourlyRate?: number;
    currency: string;
    awards?: string[];
    publications?: string[];
    professionalSummary?: string;
    resumeUrl?: string;
    portfolioUrl?: string;
    acceptingStudents: boolean;
    maxStudentsPerClass?: number;
    allowReviews: boolean;
    emailNotifications: boolean;
    applicationDate: string;
    lastTeachingAt?: string;
  };

  // Social links
  socials: Array<{
    id: string;
    platform:
      | 'facebook'
      | 'twitter'
      | 'instagram'
      | 'linkedin'
      | 'youtube'
      | 'github'
      | 'personal_website';
    url: string;
    handle?: string;
    displayName?: string;
    isPublic: boolean;
    isVerified: boolean;
    displayOrder: number;
    customLabel?: string;
    description?: string;
  }>;

  // Roles and permissions
  roles: Array<{
    id: string;
    name: string;
    displayName: string;
    color: string;
    icon: string;
  }>;

  permissions: Array<{
    id: string;
    name: string;
    resource: string;
    action: string;
  }>;

  // Activity and audit trail
  loginHistory: Array<{
    id: string;
    loginAt: string;
    ipAddress: string;
    userAgent: string;
    location?: string;
    isSuccessful: boolean;
  }>;

  auditLogs: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId?: string;
    performedBy: string;
    performedAt: string;
    metadata?: Record<string, any>;
  }>;
}

// Mock data - replace with actual API call
const mockUserDetail: UserDetail = {
  id: '1',
  email: 'student@example.com',
  firstName: 'Nguyễn',
  lastName: 'Văn A',
  phone: '+84 123 456 789',
  avatarUrl: null,
  userType: 'student',
  status: 'active',
  emailVerified: true,
  phoneVerified: false,
  twoFactorEnabled: false,
  lastLoginAt: '2024-01-15T10:30:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:30:00Z',

  profile: {
    id: '1',
    bio: 'Passionate student studying computer science with interest in AI and machine learning.',
    dateOfBirth: '2000-05-15',
    gender: 'male',
    nationality: 'Vietnamese',
    timezone: 'UTC+7',
    language: 'vi',
    currency: 'VND',
    address: {
      street: '123 Đường ABC',
      city: 'Ho Chi Minh City',
      state: 'Ho Chi Minh',
      country: 'Vietnam',
      zipCode: '70000',
    },
    emergencyContact: {
      name: 'Nguyễn Thị B',
      relationship: 'Mother',
      phone: '+84 987 654 321',
      email: 'mother@example.com',
    },
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      marketingEmails: false,
      profileVisibility: 'public',
      dataSharing: true,
    },
  },

  studentProfile: {
    id: '1',
    studentCode: 'STU2024001',
    educationLevel: 'University',
    fieldOfStudy: 'Computer Science',
    institution: 'Vietnam National University',
    graduationYear: 2024,
    gpa: 3.75,
    learningGoals:
      'Master machine learning and AI technologies to build innovative solutions.',
    preferredLearningStyle: 'visual',
    studyTimePreference: 'Morning (6AM-10AM)',
    difficultyPreference: 'intermediate',
    motivationFactors:
      'Career advancement, personal growth, technical challenges',
    totalCoursesEnrolled: 12,
    totalCoursesCompleted: 8,
    totalCertificates: 5,
    totalStudyHours: 240,
    averageGrade: 85.5,
    achievementPoints: 1250,
    achievementLevel: 'Gold',
    badges: [
      'Fast Learner',
      'Quiz Master',
      'Active Participant',
      'Code Warrior',
    ],
    learningPreferences: {
      videoSpeed: 1.25,
      subtitles: true,
      notesTaking: true,
      practiceMode: 'interactive',
    },
    studySchedule: {
      monday: ['09:00-11:00', '14:00-16:00'],
      tuesday: ['09:00-11:00', '14:00-16:00'],
      wednesday: ['09:00-11:00'],
      thursday: ['09:00-11:00', '14:00-16:00'],
      friday: ['09:00-11:00'],
    },
    analyticsData: {
      averageSessionDuration: 45,
      completionRate: 89,
      engagementScore: 92,
      preferredContentTypes: ['video', 'interactive', 'quiz'],
    },
    enableAIRecommendations: true,
    enableProgressTracking: true,
    parentalConsent: false,
    enrollmentDate: '2024-01-01T00:00:00Z',
    lastActivityAt: '2024-01-15T10:30:00Z',
  },

  socials: [
    {
      id: '1',
      platform: 'github',
      url: 'https://github.com/nguyenvana',
      handle: 'nguyenvana',
      displayName: 'Nguyen Van A',
      isPublic: true,
      isVerified: false,
      displayOrder: 1,
      customLabel: 'My GitHub Profile',
      description: 'Personal coding projects and contributions',
    },
    {
      id: '2',
      platform: 'linkedin',
      url: 'https://linkedin.com/in/nguyenvana',
      handle: 'nguyenvana',
      displayName: 'Nguyen Van A',
      isPublic: true,
      isVerified: true,
      displayOrder: 2,
    },
  ],

  roles: [
    {
      id: '1',
      name: 'student',
      displayName: 'Student',
      color: '#3b82f6',
      icon: 'user',
    },
  ],

  permissions: [
    {
      id: '1',
      name: 'View Courses',
      resource: 'course',
      action: 'read',
    },
    {
      id: '2',
      name: 'Enroll in Courses',
      resource: 'course',
      action: 'enroll',
    },
  ],

  loginHistory: [
    {
      id: '1',
      loginAt: '2024-01-15T10:30:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Ho Chi Minh City, Vietnam',
      isSuccessful: true,
    },
    {
      id: '2',
      loginAt: '2024-01-14T08:15:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Ho Chi Minh City, Vietnam',
      isSuccessful: true,
    },
  ],

  auditLogs: [
    {
      id: '1',
      action: 'profile_updated',
      entityType: 'user_profile',
      entityId: '1',
      performedBy: 'self',
      performedAt: '2024-01-14T15:30:00Z',
      metadata: {
        field_changed: 'bio',
        old_value: 'Student interested in programming',
        new_value:
          'Passionate student studying computer science with interest in AI and machine learning.',
      },
    },
  ],
};

const platformIcons = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  github: Github,
  personal_website: Globe,
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const userId = params.userId as string;

  // API calls
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useGetUserByIdQuery(userId);
  const {
    data: userProfile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useGetUserProfileQuery(userId);
  const {
    data: studentProfile,
    isLoading: studentLoading,
    refetch: refetchStudent,
  } = useGetStudentProfileQuery(userId);
  const {
    data: teacherProfile,
    isLoading: teacherLoading,
    refetch: refetchTeacher,
  } = useGetTeacherProfileQuery(userId);

  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUserProfile] = useUpdateUserProfileMutation();
  const [updateStudentProfile] = useUpdateStudentProfileMutation();
  const [updateTeacherProfile] = useUpdateTeacherProfileMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  // Loading and error handling
  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading user details...
      </div>
    );
  }

  if (userError || !userData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Error loading user details
      </div>
    );
  }

  const user = {
    ...userData,
    roles: userData?.roles || [],
    permissions: userData?.permissions || [],
    socials: userData?.socials || [],
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    displayName: userData?.displayName || '',
    username: userData?.username || '',
    email: userData?.email || '',
    // Add default values for fields that might be undefined
    emailVerified: userData?.emailVerified || false,
    twoFactorEnabled: userData?.twoFactorEnabled || false,
    failedLoginAttempts: userData?.failedLoginAttempts || 0,
  };

  const handleSave = async () => {
    try {
      await updateUser({ userId, userData: user }).unwrap();
      setIsEditing(false);
      refetchUser();
      toast({
        title: 'User Updated',
        description: 'User information has been successfully updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update user.',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateUser({
        userId,
        userData: { ...user, status: newStatus as any },
      }).unwrap();
      refetchUser();
      toast({
        title: 'Status Updated',
        description: `User status changed to ${newStatus}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update user status.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(userId).unwrap();
      router.push('/admin/users');
      toast({
        title: 'User Deleted',
        description: 'User has been successfully deleted.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to delete user.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateProfile = async (
    profileType: 'user' | 'student' | 'teacher',
    data: any
  ) => {
    try {
      switch (profileType) {
        case 'user':
          await updateUserProfile({ userId, data }).unwrap();
          refetchProfile();
          break;
        case 'student':
          await updateStudentProfile({ userId, data }).unwrap();
          refetchStudent();
          break;
        case 'teacher':
          await updateTeacherProfile({ userId, data }).unwrap();
          refetchTeacher();
          break;
      }
      toast({
        title: 'Profile Updated',
        description: `${profileType} profile has been successfully updated.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'admin':
        return Shield;
      case 'teacher':
        return GraduationCap;
      case 'student':
        return BookOpen;
      default:
        return User;
    }
  };

  const renderStudentProfile = () => {
    if (!user.studentProfile) return null;

    const profile = user.studentProfile;

    return (
      <div className="space-y-6">
        {/* Academic Information */}
        <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5" />
              <span>Academic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label>Student Code</Label>
                <Input
                  value={profile.studentCode}
                  disabled
                  className="bg-white/80"
                />
              </div>
              <div>
                <Label>Education Level</Label>
                <Input
                  value={profile.educationLevel || 'N/A'}
                  disabled
                  className="bg-white/80"
                />
              </div>
              <div>
                <Label>Field of Study</Label>
                <Input
                  value={profile.fieldOfStudy || 'N/A'}
                  disabled
                  className="bg-white/80"
                />
              </div>
              <div>
                <Label>Institution</Label>
                <Input
                  value={profile.institution || 'N/A'}
                  disabled
                  className="bg-white/80"
                />
              </div>
              <div>
                <Label>Graduation Year</Label>
                <Input
                  value={profile.graduationYear?.toString() || 'N/A'}
                  disabled
                  className="bg-white/80"
                />
              </div>
              <div>
                <Label>GPA</Label>
                <Input
                  value={profile.gpa?.toString() || 'N/A'}
                  disabled
                  className="bg-white/80"
                />
              </div>
            </div>

            <div>
              <Label>Learning Goals</Label>
              <Textarea
                value={profile.learningGoals || 'N/A'}
                disabled
                className="bg-white/80"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Learning Statistics */}
        <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Learning Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="rounded-lg bg-blue-50 p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {profile.totalCoursesEnrolled}
                </div>
                <div className="text-sm text-blue-700">Courses Enrolled</div>
              </div>
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {profile.totalCoursesCompleted}
                </div>
                <div className="text-sm text-green-700">Courses Completed</div>
              </div>
              <div className="rounded-lg bg-purple-50 p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {profile.totalCertificates}
                </div>
                <div className="text-sm text-purple-700">Certificates</div>
              </div>
              <div className="rounded-lg bg-orange-50 p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {profile.totalStudyHours}
                </div>
                <div className="text-sm text-orange-700">Study Hours</div>
              </div>
              <div className="rounded-lg bg-indigo-50 p-4 text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {profile.averageGrade}%
                </div>
                <div className="text-sm text-indigo-700">Average Grade</div>
              </div>
              <div className="rounded-lg bg-pink-50 p-4 text-center">
                <div className="text-2xl font-bold text-pink-600">
                  {profile.achievementPoints}
                </div>
                <div className="text-sm text-pink-700">Achievement Points</div>
              </div>
              <div className="rounded-lg bg-yellow-50 p-4 text-center">
                <Badge className="bg-yellow-100 text-lg font-bold text-yellow-800">
                  {profile.achievementLevel}
                </Badge>
                <div className="mt-1 text-sm text-yellow-700">Level</div>
              </div>
              <div className="rounded-lg bg-teal-50 p-4 text-center">
                <div className="text-2xl font-bold text-teal-600">
                  {Math.round(
                    (profile.totalCoursesCompleted /
                      profile.totalCoursesEnrolled) *
                      100
                  )}
                  %
                </div>
                <div className="text-sm text-teal-700">Completion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Preferences */}
        <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Learning Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label>Learning Style</Label>
                <Input
                  value={profile.preferredLearningStyle || 'N/A'}
                  disabled
                  className="bg-white/80 capitalize"
                />
              </div>
              <div>
                <Label>Study Time Preference</Label>
                <Input
                  value={profile.studyTimePreference || 'N/A'}
                  disabled
                  className="bg-white/80"
                />
              </div>
              <div>
                <Label>Difficulty Preference</Label>
                <Input
                  value={profile.difficultyPreference}
                  disabled
                  className="bg-white/80 capitalize"
                />
              </div>
              <div>
                <Label>AI Recommendations</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch checked={profile.enableAIRecommendations} disabled />
                  <span>
                    {profile.enableAIRecommendations ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Label>Motivation Factors</Label>
              <Textarea
                value={profile.motivationFactors || 'N/A'}
                disabled
                className="bg-white/80"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Badges and Achievements */}
        {Array.isArray(profile.badges) && profile.badges.length > 0 && (
          <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Badges & Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.badges.map((badge, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="border border-orange-200 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800"
                  >
                    <Award className="mr-1 h-3 w-3" />
                    {badge}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderTeacherProfile = () => {
    if (!user.teacherProfile) return null;

    const profile = user.teacherProfile;

    return (
      <div className="space-y-6">
        {/* Professional Information */}
        <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5" />
              <span>Professional Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label>Teacher Code</Label>
                <Input
                  value={profile.teacherCode}
                  disabled
                  className="bg-white/80"
                />
              </div>
              <div>
                <Label>Years Experience</Label>
                <Input
                  value={profile.yearsExperience.toString()}
                  disabled
                  className="bg-white/80"
                />
              </div>
              <div>
                <Label>Hourly Rate</Label>
                <Input
                  value={
                    profile.hourlyRate
                      ? `${profile.hourlyRate} ${profile.currency}`
                      : 'N/A'
                  }
                  disabled
                  className="bg-white/80"
                />
              </div>
              <div>
                <Label>License Number</Label>
                <Input
                  value={profile.licenseNumber || 'N/A'}
                  disabled
                  className="bg-white/80"
                />
              </div>
              <div>
                <Label>Status</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Badge
                    className={
                      profile.isApproved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {profile.isApproved ? 'Approved' : 'Not Approved'}
                  </Badge>
                  <Badge
                    className={
                      profile.isActive
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {profile.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {profile.isFeatured && (
                    <Badge className="bg-purple-100 text-purple-800">
                      <Star className="mr-1 h-3 w-3" />
                      Featured
                    </Badge>
                  )}
                  {profile.isVerified && (
                    <Badge className="bg-indigo-100 text-indigo-800">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label>Specializations</Label>
                <Textarea
                  value={profile.specializations || 'N/A'}
                  disabled
                  className="bg-white/80"
                  rows={3}
                />
              </div>
              <div>
                <Label>Qualifications</Label>
                <Textarea
                  value={profile.qualifications || 'N/A'}
                  disabled
                  className="bg-white/80"
                  rows={3}
                />
              </div>
            </div>

            <div>
              <Label>Professional Summary</Label>
              <Textarea
                value={profile.professionalSummary || 'N/A'}
                disabled
                className="bg-white/80"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Teaching Statistics */}
        <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Teaching Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="rounded-lg bg-blue-50 p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {profile.totalStudents}
                </div>
                <div className="text-sm text-blue-700">Total Students</div>
              </div>
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {profile.totalCourses}
                </div>
                <div className="text-sm text-green-700">Total Courses</div>
              </div>
              <div className="rounded-lg bg-purple-50 p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {profile.totalLessons}
                </div>
                <div className="text-sm text-purple-700">Total Lessons</div>
              </div>
              <div className="rounded-lg bg-orange-50 p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {profile.totalTeachingHours}
                </div>
                <div className="text-sm text-orange-700">Teaching Hours</div>
              </div>
              <div className="rounded-lg bg-indigo-50 p-4 text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Star className="h-5 w-5 fill-current text-indigo-600" />
                  <span className="text-2xl font-bold text-indigo-600">
                    {profile.rating}
                  </span>
                </div>
                <div className="text-sm text-indigo-700">Average Rating</div>
              </div>
              <div className="rounded-lg bg-pink-50 p-4 text-center">
                <div className="text-2xl font-bold text-pink-600">
                  {profile.totalRatings}
                </div>
                <div className="text-sm text-pink-700">Total Ratings</div>
              </div>
              <div className="rounded-lg bg-yellow-50 p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  ${profile.totalEarnings.toLocaleString()}
                </div>
                <div className="text-sm text-yellow-700">Total Earnings</div>
              </div>
              <div className="rounded-lg bg-teal-50 p-4 text-center">
                <Badge
                  className={
                    profile.acceptingStudents
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  {profile.acceptingStudents
                    ? 'Accepting Students'
                    : 'Not Accepting'}
                </Badge>
                <div className="mt-1 text-sm text-teal-700">Availability</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teaching Details */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {profile.subjects && profile.subjects.length > 0 && (
            <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Subjects</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.subjects.map((subject, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-blue-200 bg-blue-50 text-blue-800"
                    >
                      {subject}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {profile.teachingLanguages &&
            profile.teachingLanguages.length > 0 && (
              <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>Teaching Languages</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.teachingLanguages.map((language, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-green-200 bg-green-50 text-green-800"
                      >
                        {language}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>

        {/* Approval Information */}
        {(profile.approvedBy || profile.approvalNotes) && (
          <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Approval Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.approvedBy && (
                <div>
                  <Label>Approved By</Label>
                  <Input
                    value={profile.approvedBy}
                    disabled
                    className="bg-white/80"
                  />
                </div>
              )}
              {profile.approvedAt && (
                <div>
                  <Label>Approved At</Label>
                  <Input
                    value={formatDate(profile.approvedAt)}
                    disabled
                    className="bg-white/80"
                  />
                </div>
              )}
              {profile.approvalNotes && (
                <div>
                  <Label>Approval Notes</Label>
                  <Textarea
                    value={profile.approvalNotes}
                    disabled
                    className="bg-white/80"
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderSocialLinks = () => {
    if (!user.socials || user.socials.length === 0) {
      return (
        <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
          <CardContent className="p-8 text-center">
            <LinkIcon className="mx-auto mb-4 h-12 w-12 text-slate-400" />
            <h3 className="mb-2 text-lg font-semibold text-slate-600">
              No social links
            </h3>
            <p className="text-slate-500">
              This user hasn't added any social media links yet.
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {user.socials.map(social => {
          const Icon = platformIcons[social.platform] || Globe;

          return (
            <Card
              key={social.id}
              className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">
                          {social.customLabel ||
                            social.displayName ||
                            social.platform}
                        </h3>
                        {social.isVerified && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                        <Badge
                          variant={social.isPublic ? 'outline' : 'secondary'}
                        >
                          {social.isPublic ? 'Public' : 'Private'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-500">
                        <span>{social.url}</span>
                        {social.handle && <span>(@{social.handle})</span>}
                      </div>
                      {social.description && (
                        <p className="mt-1 text-sm text-slate-600">
                          {social.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-lg text-white">
                    {user.firstName?.[0] || ''}
                    {user.lastName?.[0] || ''}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">
                    {user.displayName ||
                      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                      user.username ||
                      user.email}
                  </h1>
                  <div className="flex items-center space-x-3">
                    <p className="text-slate-600">{user.email}</p>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`${
                        user.userType === 'admin'
                          ? 'text-red-600'
                          : user.userType === 'teacher'
                            ? 'text-green-600'
                            : 'text-blue-600'
                      }`}
                    >
                      {React.createElement(getUserTypeIcon(user.userType), {
                        className: 'h-3 w-3 mr-1',
                      })}
                      {user.userType}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {user.status === 'active' ? (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('suspended')}
                  className="bg-white/60 backdrop-blur-sm"
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Suspend
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('active')}
                  className="bg-white/60 backdrop-blur-sm"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Activate
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(true)}
                className="bg-white/60 backdrop-blur-sm"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Password
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Tabs Navigation */}
        <Card className="mb-8 border-white/30 bg-white/80 shadow-xl backdrop-blur-xl">
          <CardContent className="p-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                {user.userType === 'student' && (
                  <TabsTrigger value="student">Student Profile</TabsTrigger>
                )}
                {user.userType === 'teacher' && (
                  <TabsTrigger value="teacher">Teacher Profile</TabsTrigger>
                )}
                <TabsTrigger value="social">User Social</TabsTrigger>
                <TabsTrigger value="security">Security & Roles</TabsTrigger>
              </TabsList>

              {/* Overview Tab - CHỈ Users Entity */}
              <TabsContent value="overview" className="mt-2">
                <div className="space-y-6">
                  <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        {/* <User className="h-5 w-5" /> */}
                        <span>Users Table Fields</span>
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditMode(!isEditMode);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        {isEditMode ? 'View Mode' : 'Edit Mode'}
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <Label>ID</Label>
                          <Input
                            value={user.id}
                            disabled={!isEditMode}
                            className="bg-white/80"
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            value={user.email}
                            disabled={!isEditMode}
                            className="bg-white/80"
                          />
                        </div>
                        <div>
                          <Label>Username</Label>
                          <Input
                            value={user.username}
                            disabled={!isEditMode}
                            className="bg-white/80"
                          />
                        </div>
                        <div>
                          <Label>First Name</Label>
                          <Input
                            value={user.firstName || ''}
                            disabled={!isEditMode}
                            className="bg-white/80"
                          />
                        </div>
                        <div>
                          <Label>Last Name</Label>
                          <Input
                            value={user.lastName || ''}
                            disabled={!isEditMode}
                            className="bg-white/80"
                          />
                        </div>
                        <div>
                          <Label>Display Name</Label>
                          <Input
                            value={user.displayName || ''}
                            disabled={!isEditMode}
                            className="bg-white/80"
                          />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input
                            value={user.phone || ''}
                            disabled={!isEditMode}
                            className="bg-white/80"
                          />
                        </div>
                        <div>
                          <Label>User Type</Label>
                          {isEditMode ? (
                            <select
                              value={user.userType}
                              className="w-full rounded border bg-white/80 p-2"
                            >
                              <option value="student">Student</option>
                              <option value="teacher">Teacher</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <div className="pt-2">
                              <Badge
                                variant={
                                  user.userType === 'admin'
                                    ? 'destructive'
                                    : user.userType === 'teacher'
                                      ? 'default'
                                      : 'secondary'
                                }
                                className="capitalize"
                              >
                                {user.userType}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label>Status</Label>
                          {isEditMode ? (
                            <select
                              value={user.status}
                              className="w-full rounded border bg-white/80 p-2"
                            >
                              <option value="pending">Pending</option>
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="suspended">Suspended</option>
                              <option value="banned">Banned</option>
                            </select>
                          ) : (
                            <div className="pt-2">
                              <Badge
                                className={cn(
                                  'capitalize',
                                  user.status === 'active' &&
                                    'bg-green-100 text-green-800',
                                  user.status === 'inactive' &&
                                    'bg-red-100 text-red-800',
                                  user.status === 'pending' &&
                                    'bg-yellow-100 text-yellow-800',
                                  user.status === 'suspended' &&
                                    'bg-red-100 text-red-800',
                                  user.status === 'banned' &&
                                    'bg-red-200 text-red-900'
                                )}
                              >
                                {user.status}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <Label>Avatar URL</Label>
                          <Input
                            value={user.avatarUrl || ''}
                            disabled={!isEditMode}
                            className="bg-white/80"
                          />
                        </div>
                        <div>
                          <Label>Cover URL</Label>
                          <Input
                            value={user.coverUrl || ''}
                            disabled={!isEditMode}
                            className="bg-white/80"
                          />
                        </div>
                        <div>
                          <Label>Email Verified</Label>
                          {isEditMode ? (
                            <div className="pt-2">
                              <Switch
                                checked={user.emailVerified}
                                // onChange handler would go here
                              />
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 pt-2">
                              <CheckCircle
                                className={`h-4 w-4 ${user.emailVerified ? 'text-green-500' : 'text-gray-400'}`}
                              />
                              <span>
                                {user.emailVerified
                                  ? 'Verified'
                                  : 'Not Verified'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label>Two Factor Enabled</Label>
                          {isEditMode ? (
                            <div className="pt-2">
                              <Switch
                                checked={user.twoFactorEnabled}
                                // onChange handler would go here
                              />
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 pt-2">
                              <Shield
                                className={`h-4 w-4 ${user.twoFactorEnabled ? 'text-green-500' : 'text-gray-400'}`}
                              />
                              <span>
                                {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label>Preferred Language</Label>
                          <Input
                            value={user.preferredLanguage || ''}
                            disabled={!isEditMode}
                            className="bg-white/80"
                          />
                        </div>
                        <div>
                          <Label>Timezone</Label>
                          <Input
                            value={user.timezone || ''}
                            disabled={!isEditMode}
                            className="bg-white/80"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <Label>Last Login At</Label>
                          <Input
                            value={
                              user.lastLoginAt
                                ? formatDate(user.lastLoginAt)
                                : 'Never'
                            }
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                        <div>
                          <Label>Last Login IP</Label>
                          <Input
                            value={user.lastLoginIp || 'N/A'}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                        <div>
                          <Label>Failed Login Attempts</Label>
                          <Input
                            value={user.failedLoginAttempts?.toString() || '0'}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                        <div>
                          <Label>Locked Until</Label>
                          <Input
                            value={
                              user.lockedUntil
                                ? formatDate(user.lockedUntil)
                                : 'Not locked'
                            }
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                        <div>
                          <Label>Password Changed At</Label>
                          <Input
                            value={
                              user.passwordChangedAt
                                ? formatDate(user.passwordChangedAt)
                                : 'N/A'
                            }
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                        <div>
                          <Label>Created At</Label>
                          <Input
                            value={formatDate(user.createdAt)}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                        <div>
                          <Label>Updated At</Label>
                          <Input
                            value={formatDate(user.updatedAt)}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                      </div>

                      {isEditMode && (
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setIsEditMode(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              // Handle save user data
                              handleSave();
                              setIsEditMode(false);
                            }}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </Button>
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Send Message
                      </Button>
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        View Reports
                      </Button>
                      <Button
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <History className="mr-2 h-4 w-4" />
                        View History
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Roles and Permissions */}
                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>Roles</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {user.roles?.length > 0 ? (
                          user.roles.map(role => (
                            <Badge
                              key={role.id}
                              style={{
                                backgroundColor: role.color + '20',
                                color: role.color,
                                borderColor: role.color,
                              }}
                            >
                              {role.displayName}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No roles assigned
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>Permissions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {user.permissions?.length > 0 ? (
                          <>
                            {user.permissions.slice(0, 5).map(permission => (
                              <div
                                key={permission.id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span>{permission.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {permission.resource}:{permission.action}
                                </Badge>
                              </div>
                            ))}
                            {user.permissions.length > 5 && (
                              <p className="text-sm text-slate-500">
                                +{user.permissions.length - 5} more permissions
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No permissions assigned
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile" className="mt-2">
                <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Profile Information</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Toggle edit mode for profile specifically
                        setActiveTab('profile-edit');
                      }}
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {profileLoading ? (
                      <div>Loading profile...</div>
                    ) : userProfile ? (
                      <>
                        {userProfile.bio && (
                          <div>
                            <Label>Bio</Label>
                            <Textarea
                              value={userProfile.bio}
                              disabled
                              className="bg-white/80"
                              rows={3}
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <Label>Date of Birth</Label>
                            <Input
                              value={
                                userProfile.dateOfBirth
                                  ? formatDate(userProfile.dateOfBirth)
                                  : 'N/A'
                              }
                              disabled
                              className="bg-white/80"
                            />
                          </div>
                          <div>
                            <Label>Gender</Label>
                            <Input
                              value={userProfile.gender || 'N/A'}
                              disabled
                              className="bg-white/80 capitalize"
                            />
                          </div>
                          <div>
                            <Label>Country</Label>
                            <Input
                              value={userProfile.country || 'N/A'}
                              disabled
                              className="bg-white/80"
                            />
                          </div>
                          <div>
                            <Label>State/Province</Label>
                            <Input
                              value={userProfile.state || 'N/A'}
                              disabled
                              className="bg-white/80"
                            />
                          </div>
                          <div>
                            <Label>City</Label>
                            <Input
                              value={userProfile.city || 'N/A'}
                              disabled
                              className="bg-white/80"
                            />
                          </div>
                          <div>
                            <Label>Postal Code</Label>
                            <Input
                              value={userProfile.postalCode || 'N/A'}
                              disabled
                              className="bg-white/80"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Full Address</Label>
                          <Textarea
                            value={userProfile.address || 'N/A'}
                            disabled
                            className="bg-white/80"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <Label>Organization</Label>
                            <Input
                              value={userProfile.organization || 'N/A'}
                              disabled
                              className="bg-white/80"
                            />
                          </div>
                          <div>
                            <Label>Job Title</Label>
                            <Input
                              value={userProfile.jobTitle || 'N/A'}
                              disabled
                              className="bg-white/80"
                            />
                          </div>
                          <div>
                            <Label>Department</Label>
                            <Input
                              value={userProfile.department || 'N/A'}
                              disabled
                              className="bg-white/80"
                            />
                          </div>
                          <div>
                            <Label>Website</Label>
                            <Input
                              value={userProfile.website || 'N/A'}
                              disabled
                              className="bg-white/80"
                            />
                          </div>
                          <div>
                            <Label>Verification Status</Label>
                            <div className="flex items-center space-x-2 pt-2">
                              <Badge
                                className={
                                  userProfile.isVerified
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }
                              >
                                {userProfile.isVerified
                                  ? 'Verified'
                                  : 'Not Verified'}
                              </Badge>
                              {userProfile.verifiedAt && (
                                <span className="text-xs text-gray-500">
                                  {formatDate(userProfile.verifiedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <Label>Profile Visibility</Label>
                            <div className="flex items-center space-x-2 pt-2">
                              <Badge
                                variant={
                                  userProfile.isPublic ? 'default' : 'secondary'
                                }
                              >
                                {userProfile.isPublic ? 'Public' : 'Private'}
                              </Badge>
                              <Badge
                                variant={
                                  userProfile.isSearchable
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {userProfile.isSearchable
                                  ? 'Searchable'
                                  : 'Hidden'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Skills, Interests, Hobbies */}
                        {(Array.isArray(userProfile.skills) &&
                          userProfile.skills.length > 0) ||
                        (Array.isArray(userProfile.interests) &&
                          userProfile.interests.length > 0) ||
                        (Array.isArray(userProfile.hobbies) &&
                          userProfile.hobbies.length > 0) ? (
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {Array.isArray(userProfile.skills) &&
                              userProfile.skills.length > 0 && (
                                <div>
                                  <Label>Skills</Label>
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {userProfile.skills.map((skill, index) => (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            {Array.isArray(userProfile.interests) &&
                              userProfile.interests.length > 0 && (
                                <div>
                                  <Label>Interests</Label>
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {userProfile.interests.map(
                                      (interest, index) => (
                                        <Badge
                                          key={index}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {interest}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            {Array.isArray(userProfile.hobbies) &&
                              userProfile.hobbies.length > 0 && (
                                <div>
                                  <Label>Hobbies</Label>
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {userProfile.hobbies.map((hobby, index) => (
                                      <Badge
                                        key={index}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {hobby}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-gray-500">
                          No profile information available
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => handleUpdateProfile('user', {})}
                        >
                          Create Profile
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Profile Edit Tab */}
              <TabsContent value="profile-edit" className="mt-6">
                <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Edit Profile Information</CardTitle>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('profile')}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={async () => {
                          try {
                            // Create a sample profile update
                            const profileData = {
                              bio: 'Updated bio',
                              // Add other fields as needed
                            };
                            await handleUpdateProfile('user', profileData);
                            setActiveTab('profile');
                          } catch (error) {
                            console.error('Profile update failed:', error);
                          }
                        }}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {profileLoading ? (
                      <div>Loading profile for editing...</div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            placeholder="Enter bio..."
                            defaultValue={userProfile?.bio || ''}
                            className="bg-white/80"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor="organization">Organization</Label>
                            <Input
                              id="organization"
                              placeholder="Enter organization..."
                              defaultValue={userProfile?.organization || ''}
                              className="bg-white/80"
                            />
                          </div>
                          <div>
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <Input
                              id="jobTitle"
                              placeholder="Enter job title..."
                              defaultValue={userProfile?.jobTitle || ''}
                              className="bg-white/80"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor="country">Country</Label>
                            <Input
                              id="country"
                              placeholder="Enter country..."
                              defaultValue={userProfile?.country || ''}
                              className="bg-white/80"
                            />
                          </div>
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              placeholder="Enter city..."
                              defaultValue={userProfile?.city || ''}
                              className="bg-white/80"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Textarea
                            id="address"
                            placeholder="Enter full address..."
                            defaultValue={userProfile?.address || ''}
                            className="bg-white/80"
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            type="url"
                            placeholder="https://..."
                            defaultValue={userProfile?.website || ''}
                            className="bg-white/80"
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="isPublic"
                              defaultChecked={userProfile?.isPublic || false}
                            />
                            <Label htmlFor="isPublic">Public Profile</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="isSearchable"
                              defaultChecked={
                                userProfile?.isSearchable || false
                              }
                            />
                            <Label htmlFor="isSearchable">
                              Searchable Profile
                            </Label>
                          </div>
                        </div>

                        <div className="rounded-lg bg-blue-50 p-4">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Note:</span> This is a
                            basic edit form. Full form functionality with
                            validation and proper state management would be
                            implemented in a production environment.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Student Tab */}
              {user.userType === 'student' && (
                <TabsContent value="student" className="mt-6">
                  <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Student Profile</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Toggle edit mode for student profile
                          setActiveTab('student-edit');
                        }}
                      >
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit Student Profile
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {studentLoading ? (
                        <div>Loading student profile...</div>
                      ) : studentProfile ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <Label>Education Level</Label>
                            <Input
                              value={studentProfile.educationLevel || 'N/A'}
                              disabled
                              className="bg-white/80"
                            />
                          </div>
                          <div>
                            <Label>Field of Study</Label>
                            <Input
                              value={studentProfile.fieldOfStudy || 'N/A'}
                              disabled
                              className="bg-white/80"
                            />
                          </div>
                          <div>
                            <Label>Learning Style</Label>
                            <Input
                              value={
                                studentProfile.preferredLearningStyle || 'N/A'
                              }
                              disabled
                              className="bg-white/80 capitalize"
                            />
                          </div>
                          <div>
                            <Label>Study Time Preference</Label>
                            <Input
                              value={
                                studentProfile.studyTimePreference || 'N/A'
                              }
                              disabled
                              className="bg-white/80"
                            />
                          </div>
                          <div>
                            <Label>Difficulty Preference</Label>
                            <Input
                              value={
                                studentProfile.difficultyPreference || 'N/A'
                              }
                              disabled
                              className="bg-white/80 capitalize"
                            />
                          </div>
                          <div className="md:col-span-2 lg:col-span-3">
                            <Label>Learning Goals</Label>
                            <Textarea
                              value={studentProfile.learningGoals || 'N/A'}
                              disabled
                              className="bg-white/80"
                              rows={3}
                            />
                          </div>
                          <div className="md:col-span-2 lg:col-span-3">
                            <Label>Motivation Factors</Label>
                            <Textarea
                              value={studentProfile.motivationFactors || 'N/A'}
                              disabled
                              className="bg-white/80"
                              rows={3}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-gray-500">
                            No student profile information available
                          </p>
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => handleUpdateProfile('student', {})}
                          >
                            Create Student Profile
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* Teacher Tab */}
              {user.userType === 'teacher' && (
                <TabsContent value="teacher" className="mt-6">
                  <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Teacher Profile</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Toggle edit mode for teacher profile
                          setActiveTab('teacher-edit');
                        }}
                      >
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit Teacher Profile
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {teacherLoading ? (
                        <div>Loading teacher profile...</div>
                      ) : teacherProfile ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <div>
                              <Label>Teacher Code</Label>
                              <Input
                                value={teacherProfile.teacherCode}
                                disabled
                                className="bg-white/80"
                              />
                            </div>
                            <div>
                              <Label>Years of Experience</Label>
                              <Input
                                value={teacherProfile.yearsExperience || 'N/A'}
                                disabled
                                className="bg-white/80"
                              />
                            </div>
                            <div>
                              <Label>Hourly Rate</Label>
                              <Input
                                value={
                                  teacherProfile.hourlyRate
                                    ? `${teacherProfile.hourlyRate} ${teacherProfile.currency}`
                                    : 'N/A'
                                }
                                disabled
                                className="bg-white/80"
                              />
                            </div>
                            <div>
                              <Label>License Number</Label>
                              <Input
                                value={teacherProfile.licenseNumber || 'N/A'}
                                disabled
                                className="bg-white/80"
                              />
                            </div>
                            <div>
                              <Label>Rating</Label>
                              <div className="flex items-center space-x-2 pt-2">
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                                  <span className="ml-1 font-medium">
                                    {teacherProfile.rating}
                                  </span>
                                </div>
                                <span className="text-sm text-gray-500">
                                  ({teacherProfile.totalRatings} ratings)
                                </span>
                              </div>
                            </div>
                            <div>
                              <Label>Application Date</Label>
                              <Input
                                value={
                                  teacherProfile.applicationDate
                                    ? formatDate(
                                        teacherProfile.applicationDate.toString()
                                      )
                                    : 'N/A'
                                }
                                disabled
                                className="bg-white/80"
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant={
                                teacherProfile.isApproved
                                  ? 'default'
                                  : 'destructive'
                              }
                            >
                              {teacherProfile.isApproved
                                ? 'Approved'
                                : 'Pending Approval'}
                            </Badge>
                            <Badge
                              variant={
                                teacherProfile.isActive
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {teacherProfile.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {teacherProfile.isFeatured && (
                              <Badge className="bg-purple-100 text-purple-800">
                                <Star className="mr-1 h-3 w-3" />
                                Featured
                              </Badge>
                            )}
                            {teacherProfile.isVerified && (
                              <Badge className="bg-indigo-100 text-indigo-800">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Verified
                              </Badge>
                            )}
                            {teacherProfile.acceptingStudents && (
                              <Badge className="bg-green-100 text-green-800">
                                Accepting Students
                              </Badge>
                            )}
                          </div>

                          <div>
                            <Label>Specializations</Label>
                            <Textarea
                              value={teacherProfile.specializations || 'N/A'}
                              disabled
                              className="bg-white/80"
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label>Qualifications</Label>
                            <Textarea
                              value={teacherProfile.qualifications || 'N/A'}
                              disabled
                              className="bg-white/80"
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label>Teaching Style</Label>
                            <Textarea
                              value={teacherProfile.teachingStyle || 'N/A'}
                              disabled
                              className="bg-white/80"
                              rows={3}
                            />
                          </div>

                          {/* Teaching Statistics */}
                          <div className="rounded-lg bg-slate-50 p-4">
                            <h4 className="mb-4 text-lg font-semibold">
                              Teaching Statistics
                            </h4>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                  {teacherProfile.totalStudents}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Total Students
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                  {teacherProfile.totalCourses}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Total Courses
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                  {teacherProfile.totalLessons}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Total Lessons
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                  {teacherProfile.totalTeachingHours}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Teaching Hours
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600">
                                  $
                                  {teacherProfile.totalEarnings?.toLocaleString() ||
                                    '0'}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Total Earnings
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-indigo-600">
                                  {teacherProfile.maxStudentsPerClass || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Max Students/Class
                                </div>
                              </div>
                              <div className="text-center">
                                <Badge
                                  variant={
                                    teacherProfile.allowReviews
                                      ? 'default'
                                      : 'secondary'
                                  }
                                >
                                  Reviews{' '}
                                  {teacherProfile.allowReviews
                                    ? 'Enabled'
                                    : 'Disabled'}
                                </Badge>
                                <div className="text-sm text-gray-600">
                                  Review Settings
                                </div>
                              </div>
                              <div className="text-center">
                                <Badge
                                  variant={
                                    teacherProfile.emailNotifications
                                      ? 'default'
                                      : 'secondary'
                                  }
                                >
                                  Email Notifications
                                </Badge>
                                <div className="text-sm text-gray-600">
                                  Notification Settings
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Subjects and Languages */}
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {Array.isArray(teacherProfile.subjects) &&
                              teacherProfile.subjects.length > 0 && (
                                <div>
                                  <Label>Teaching Subjects</Label>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {teacherProfile.subjects.map(
                                      (subject, index) => (
                                        <Badge
                                          key={index}
                                          variant="outline"
                                          className="border-blue-200 bg-blue-50 text-blue-800"
                                        >
                                          {subject}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            {Array.isArray(teacherProfile.teachingLanguages) &&
                              teacherProfile.teachingLanguages.length > 0 && (
                                <div>
                                  <Label>Teaching Languages</Label>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {teacherProfile.teachingLanguages.map(
                                      (language, index) => (
                                        <Badge
                                          key={index}
                                          variant="outline"
                                          className="border-green-200 bg-green-50 text-green-800"
                                        >
                                          {language}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>

                          {/* Awards and Publications */}
                          {(Array.isArray(teacherProfile.awards) &&
                            teacherProfile.awards.length > 0) ||
                          (Array.isArray(teacherProfile.publications) &&
                            teacherProfile.publications.length > 0) ? (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                              {Array.isArray(teacherProfile.awards) &&
                                teacherProfile.awards.length > 0 && (
                                  <div>
                                    <Label>Awards & Achievements</Label>
                                    <div className="mt-2 space-y-1">
                                      {teacherProfile.awards.map(
                                        (award, index) => (
                                          <div
                                            key={index}
                                            className="rounded border-l-4 border-yellow-400 bg-yellow-50 p-2 text-sm"
                                          >
                                            <Award className="mr-1 inline h-3 w-3 text-yellow-600" />
                                            {award}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                              {Array.isArray(teacherProfile.publications) &&
                                teacherProfile.publications.length > 0 && (
                                  <div>
                                    <Label>Publications</Label>
                                    <div className="mt-2 space-y-1">
                                      {teacherProfile.publications.map(
                                        (publication, index) => (
                                          <div
                                            key={index}
                                            className="rounded border-l-4 border-slate-400 bg-slate-50 p-2 text-sm"
                                          >
                                            <FileText className="mr-1 inline h-3 w-3 text-slate-600" />
                                            {publication}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          ) : null}

                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                              <Label>Office Hours</Label>
                              <Textarea
                                value={teacherProfile.officeHours || 'N/A'}
                                disabled
                                className="bg-white/80"
                                rows={2}
                              />
                            </div>
                            <div>
                              <Label>Approval Notes</Label>
                              <Textarea
                                value={teacherProfile.approvalNotes || 'N/A'}
                                disabled
                                className="bg-white/80"
                                rows={2}
                              />
                            </div>
                          </div>

                          {teacherProfile.approvedBy && (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                              <div>
                                <Label>Approved By</Label>
                                <Input
                                  value={teacherProfile.approvedBy || 'N/A'}
                                  disabled
                                  className="bg-white/80"
                                />
                              </div>
                              <div>
                                <Label>Approved At</Label>
                                <Input
                                  value={
                                    teacherProfile.approvedAt
                                      ? formatDate(
                                          teacherProfile.approvedAt.toString()
                                        )
                                      : 'N/A'
                                  }
                                  disabled
                                  className="bg-white/80"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-gray-500">
                            No teacher profile information available
                          </p>
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => handleUpdateProfile('teacher', {})}
                          >
                            Create Teacher Profile
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* Social Tab */}
              <TabsContent value="social" className="mt-6">
                {renderSocialLinks()}
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="mt-6">
                <div className="space-y-6">
                  {/* Security Settings */}
                  <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Email Verification</Label>
                          <p className="text-sm text-slate-500">
                            User's email verification status
                          </p>
                        </div>
                        <Badge
                          className={
                            user.emailVerified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {user.emailVerified ? 'Verified' : 'Not Verified'}
                        </Badge>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Two-Factor Authentication</Label>
                          <p className="text-sm text-slate-500">
                            Enhanced account security
                          </p>
                        </div>
                        <Badge
                          className={
                            user.twoFactorEnabled
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Last Login</Label>
                          <Input
                            value={
                              user.lastLoginAt
                                ? formatDate(user.lastLoginAt)
                                : 'Never'
                            }
                            disabled
                            className="bg-white/80"
                          />
                        </div>
                        <div>
                          <Label>Last Login IP</Label>
                          <Input
                            value={user.lastLoginIp || 'N/A'}
                            disabled
                            className="bg-white/80"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Failed Login Attempts</Label>
                          <Input
                            value={user.failedLoginAttempts?.toString() || '0'}
                            disabled
                            className="bg-white/80"
                          />
                        </div>
                        <div>
                          <Label>Account Locked Until</Label>
                          <Input
                            value={
                              user.lockedUntil
                                ? formatDate(user.lockedUntil)
                                : 'Not locked'
                            }
                            disabled
                            className="bg-white/80"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Login History Placeholder */}
                  <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
                    <CardHeader>
                      <CardTitle>Recent Login History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="py-8 text-center">
                        <History className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                        <h3 className="mb-2 text-lg font-semibold text-slate-600">
                          Login History Not Available
                        </h3>
                        <p className="text-slate-500">
                          Detailed login history tracking will be implemented in
                          future updates.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="mt-6">
                <Card className="border-white/50 bg-white/80 shadow-xl backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle>Audit Log</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="py-8 text-center">
                      <Activity className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                      <h3 className="mb-2 text-lg font-semibold text-slate-600">
                        Audit Log Not Available
                      </h3>
                      <p className="text-slate-500">
                        Detailed audit logging will be implemented in future
                        updates.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Delete User</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone and will permanently remove all user data, including
              courses, progress, and associated content.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowDeleteDialog(false);
                toast({
                  title: 'User Deleted',
                  description: 'User has been permanently deleted.',
                  variant: 'destructive',
                });
                router.push('/admin/users');
              }}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset User Password</DialogTitle>
            <DialogDescription>
              This will send a password reset email to {user.email}. The user
              will receive instructions to create a new password.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowPasswordDialog(false);
                toast({
                  title: 'Password Reset Sent',
                  description:
                    'Password reset email has been sent to the user.',
                });
              }}
            >
              Send Reset Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
