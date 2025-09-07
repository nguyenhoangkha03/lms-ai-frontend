'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useAppSelector } from '@/lib/redux/hooks';
import {
  useGetUserProfileQuery,
  useGetStudentProfileQuery,
  useUpdateUserProfileMutation,
  useUpdateStudentProfileMutation,
  useUploadAvatarMutation,
} from '@/lib/redux/api/user-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  User,
  Camera,
  Save,
  Edit,
  MapPin,
  Calendar,
  Globe,
  Phone,
  Mail,
  BookOpen,
  Award,
  Target,
  TrendingUp,
  Clock,
  Star,
  Settings,
  Shield,
  Eye,
  EyeOff,
  ExternalLink,
  Share2,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function StudentProfilePage() {
  const { user } = useAuth();
  // const { user: reduxUser } = useAppSelector(state => state.auth);

  console.log('Profile page - user:', user);
  console.log('Profile page - userProfile:', user?.userProfile);
  console.log('Profile page - studentProfile:', user?.studentProfile);

  const [isClient, setIsClient] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>({});
  const [studentData, setStudentData] = useState<any>({});

  // Initialize form data when user data is available
  React.useEffect(() => {
    if (user?.userProfile) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        displayName: user.displayName || '',
        bio: user.userProfile?.bio || '',
        gender: user.userProfile?.gender || '',
        address: user.userProfile?.address || '',
        city: user.userProfile?.city || '',
        state: user.userProfile?.state || '',
        postalCode: user.userProfile?.postalCode || '',
        country: user.userProfile?.country || '',
        jobTitle: user.userProfile?.jobTitle || '',
        organization: user.userProfile?.organization || '',
        department: user.userProfile?.department || '',
        website: user.userProfile?.website || '',
        skills: user.userProfile?.skills || [],
        hobbies: user.userProfile?.hobbies || [],
        timezone: 'temp', // Not available in backend
        preferredLanguage: 'temp', // Not available in backend
        isSearchable: user.userProfile?.isSearchable || false,
      });
    }

    if (user?.studentProfile) {
      setStudentData({
        dateOfBirth: user.userProfile?.dateOfBirth || '',
        phoneNumber: user.phone || '',
        learningGoals: user.studentProfile?.learningGoals || '',
        preferredLearningStyle:
          user.studentProfile?.preferredLearningStyle || '',
        preferredStudyTime: user.studentProfile?.studyTimePreference || '',
        weeklyLearningGoalHours: 'temp', // Not available in backend
        preferredDifficulty: user.studentProfile?.difficultyPreference || '',
        interests: user.userProfile?.interests || [],
        currentStreak: 'temp', // Not available in backend
        longestStreak: 'temp', // Not available in backend
        completionRate: 'temp', // Not available in backend  
        isPublicProfile: user.userProfile?.isPublic || false,
        showProgress: user.studentProfile?.enableProgressTracking || false,
        emailNotifications: 'temp', // Not available in backend
      });
    }
  }, [user]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fix hydration mismatch
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  //   const {
  //     data: userProfile,
  //     isLoading: profileLoading,
  //     error: profileError,
  //     refetch: refetchProfile,
  //   } = useGetUserProfileQuery(user?.id || '', {
  //     skip: !user?.id,
  //   });

  //   const {
  //     data: studentProfile,
  //     isLoading: studentLoading,
  //     error: studentError,
  //     refetch: refetchStudent,
  //   } = useGetStudentProfileQuery(user?.id || '', {
  //     skip: !user?.id,
  //   });

  const [updateProfile, { isLoading: updatingProfile }] =
    useUpdateUserProfileMutation();
  const [updateStudentProfile, { isLoading: updatingStudent }] =
    useUpdateStudentProfileMutation();
  const [uploadAvatar, { isLoading: uploadingAvatar }] =
    useUploadAvatarMutation();

  const handleSave = useCallback(async () => {
    try {
      if (user?.id) {
        await updateProfile({
          userId: user.id,
          data: profileData,
        }).unwrap();

        await updateStudentProfile({
          userId: user.id,
          data: studentData,
        }).unwrap();

        toast.success('Profile updated successfully!');
        setIsEditing(false);
        // refetchProfile();
        // refetchStudent();
      }
    } catch (error) {
      toast.error('An error occurred while updating profile');
    }
  }, [user?.id, updateProfile, updateStudentProfile, profileData, studentData]);

  const handleAvatarChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const handleAvatarUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadAvatar({ file: selectedFile }).unwrap();
      toast.success('Avatar updated successfully!');
      setSelectedFile(null);
      // refetchProfile();
    } catch (error) {
      toast.error('An error occurred while uploading image');
    }
  }, [selectedFile, uploadAvatar]);

  const getLearningStyleDisplay = useCallback((style: string) => {
    const styles = {
      visual: 'Visual',
      auditory: 'Auditory',
      kinesthetic: 'Kinesthetic',
      reading_writing: 'Reading/Writing',
    };
    return styles[style as keyof typeof styles] || style;
  }, []);

  const getProfileCompleteness = useMemo(() => {
    if (!user?.userProfile || !user?.studentProfile) return 0;

    const fields = [
      user?.firstName,
      user?.lastName,
      user?.userProfile?.bio,
      user?.avatarUrl,
      user?.phone,
      user?.userProfile?.dateOfBirth,
      user?.userProfile?.address,
      user?.studentProfile?.learningGoals,
    ];

    const completedFields = fields.filter(
      field => field && field.toString().trim()
    ).length;
    return Math.round((completedFields / fields.length) * 100);
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!user?.userProfile || !user?.studentProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-red-600">
            Unable to load profile information
          </h2>
          <p className="mb-4 text-gray-600">
            An error occurred while loading data. Please try again later.
          </p>
          <Button
            onClick={() => {
              //   refetchProfile();
              //   refetchStudent();
            }}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const handleShareProfile = async () => {
    if (!user?.username) return;

    const profileUrl = `${window.location.origin}/profile/${user.username}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user?.displayName || user?.firstName + ' ' + user?.lastName} - Profile`,
          text: `Check out my learning profile!`,
          url: profileUrl,
        });
      } catch (error) {
        // User cancelled sharing or error occurred
      }
    } else {
      // Fallback to copying to clipboard
      await navigator.clipboard.writeText(profileUrl);
      toast.success('Profile link copied to clipboard!');
    }
  };

  const completeness = getProfileCompleteness;

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Personal Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and learning preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data to original user data
                  if (user?.userProfile) {
                    setProfileData({
                      firstName: user.firstName || '',
                      lastName: user.lastName || '',
                      username: user.username || '',
                      displayName: user.displayName || '',
                      bio: user.userProfile?.bio || '',
                      gender: user.userProfile?.gender || '',
                      address: user.userProfile?.address || '',
                      city: user.userProfile?.city || '',
                      state: user.userProfile?.state || '',
                      postalCode: user.userProfile?.postalCode || '',
                      country: user.userProfile?.country || '',
                      jobTitle: user.userProfile?.jobTitle || '',
                      organization: user.userProfile?.organization || '',
                      department: user.userProfile?.department || '',
                      website: user.userProfile?.website || '',
                      skills: user.userProfile?.skills || [],
                      hobbies: user.userProfile?.hobbies || [],
                      timezone: 'temp', // Not available in backend
                      preferredLanguage: 'temp', // Not available in backend
                      isSearchable: user.userProfile?.isSearchable || false,
                    });
                  }
                  if (user?.studentProfile) {
                    setStudentData({
                      dateOfBirth: user.userProfile?.dateOfBirth || '',
                      phoneNumber: user.phone || '',
                      learningGoals: user.studentProfile?.learningGoals || '',
                      preferredLearningStyle:
                        user.studentProfile?.preferredLearningStyle || '',
                      preferredStudyTime:
                        user.studentProfile?.studyTimePreference || '',
                      weeklyLearningGoalHours: 'temp', // Not available in backend
                      preferredDifficulty:
                        user.studentProfile?.difficultyPreference || '',
                      interests: user.userProfile?.interests || [],
                      currentStreak: 'temp', // Not available in backend
                      longestStreak: 'temp', // Not available in backend
                      completionRate: 'temp', // Not available in backend
                      isPublicProfile:
                        user.userProfile?.isPublic || false,
                      showProgress: user.studentProfile?.enableProgressTracking || false,
                      emailNotifications: 'temp', // Not available in backend
                    });
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updatingProfile || updatingStudent}
              >
                <Save className="mr-2 h-4 w-4" />
                {updatingProfile || updatingStudent
                  ? 'Saving...'
                  : 'Save changes'}
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleShareProfile}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" asChild>
                <a
                  href={`/profile/${user?.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Public
                </a>
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Profile Completeness Alert */}
      {completeness < 80 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-yellow-800">
                    Complete your profile
                  </h3>
                  <p className="text-sm text-yellow-700">
                    Profile is {completeness}% complete. Add more information to
                    receive better learning recommendations.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-800">
                    {completeness}%
                  </div>
                  <Progress value={completeness} className="mt-1 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative mx-auto mb-4 h-32 w-32">
                  <Avatar className="h-32 w-32">
                    <AvatarImage
                      src={
                        selectedFile
                          ? URL.createObjectURL(selectedFile)
                          : user?.avatarUrl
                      }
                      alt={`${user?.firstName} ${user?.lastName}`}
                    />
                    <AvatarFallback className="text-2xl">
                      {isClient ? (
                        <>
                          {user?.firstName?.charAt(0) || 'U'}
                          {user?.lastName?.charAt(0) || ''}
                        </>
                      ) : (
                        'U'
                      )}
                    </AvatarFallback>
                  </Avatar>

                  {isEditing && (
                    <div className="absolute -bottom-2 -right-2">
                      <label className="cursor-pointer">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700">
                          <Camera className="h-5 w-5" />
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {selectedFile && (
                  <div className="mb-4 space-y-2">
                    <p className="text-sm text-gray-600">New image selected</p>
                    <Button
                      size="sm"
                      onClick={handleAvatarUpload}
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? 'Uploading...' : 'Update image'}
                    </Button>
                  </div>
                )}

                <h2 className="text-xl font-bold">
                  {isClient
                    ? `${user?.firstName || 'User'} ${user?.lastName || ''}`
                    : 'User'}
                </h2>
                <p className="text-gray-600">{user?.email}</p>

                {user?.userProfile?.bio && (
                  <p className="mt-2 text-sm text-gray-500">
                    {user.userProfile?.bio}
                  </p>
                )}

                <div className="mt-4 flex justify-center gap-2">
                  <Badge variant="secondary">Student</Badge>
                  {/* {studentProfile.isActive && (
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  )} */}
                </div>

                {/* Quick Stats */}
                <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {user?.studentProfile?.totalCoursesEnrolled || 0}
                    </div>
                    <div className="text-sm text-gray-600">Courses</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {user?.studentProfile?.totalCoursesCompleted || 0}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">
                      {user?.studentProfile?.totalCertificates || 0}
                    </div>
                    <div className="text-sm text-gray-600">Certificates</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">
                      {Math.round(
                        (user?.studentProfile?.totalStudyHours || 0) / 60
                      )}
                      h
                    </div>
                    <div className="text-sm text-gray-600">Learning</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="learning">Learning</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName || user?.firstName || ''}
                        onChange={e =>
                          setProfileData({
                            ...profileData,
                            firstName: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName || user?.lastName || ''}
                        onChange={e =>
                          setProfileData({
                            ...profileData,
                            lastName: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={profileData.username || user?.username || ''}
                        onChange={e =>
                          setProfileData({
                            ...profileData,
                            username: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        placeholder="your_username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={
                          profileData.displayName || user?.displayName || ''
                        }
                        onChange={e =>
                          setProfileData({
                            ...profileData,
                            displayName: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        placeholder="How others see your name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio || user?.userProfile?.bio || ''}
                      onChange={e =>
                        setProfileData({ ...profileData, bio: e.target.value })
                      }
                      disabled={!isEditing}
                      placeholder="Tell us a bit about yourself..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={
                          (
                            studentData.dateOfBirth ||
                            user?.userProfile?.dateOfBirth
                          )?.split('T')[0] || ''
                        }
                        onChange={e =>
                          setStudentData({
                            ...studentData,
                            dateOfBirth: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={studentData.phoneNumber || user?.phone || ''}
                        onChange={e =>
                          setStudentData({
                            ...studentData,
                            phoneNumber: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        placeholder="+84 123 456 789"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={
                          profileData.gender || user?.userProfile?.gender || ''
                        }
                        onValueChange={value =>
                          setProfileData({
                            ...profileData,
                            gender: value,
                          })
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer_not_to_say">
                            Prefer not to say
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={
                        profileData.address || user?.userProfile?.address || ''
                      }
                      onChange={e =>
                        setProfileData({
                          ...profileData,
                          address: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="Your street address"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={
                          profileData.city || user?.userProfile?.city || ''
                        }
                        onChange={e =>
                          setProfileData({
                            ...profileData,
                            city: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={
                          profileData.state || user?.userProfile?.state || ''
                        }
                        onChange={e =>
                          setProfileData({
                            ...profileData,
                            state: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        placeholder="State or Province"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={
                          profileData.postalCode ||
                          user?.userProfile?.postalCode ||
                          ''
                        }
                        onChange={e =>
                          setProfileData({
                            ...profileData,
                            postalCode: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        placeholder="ZIP/Postal Code"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={
                        profileData.country || user?.userProfile?.country || ''
                      }
                      onChange={e =>
                        setProfileData({
                          ...profileData,
                          country: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="Country"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={
                          profileData.jobTitle ||
                          user?.userProfile?.jobTitle ||
                          ''
                        }
                        onChange={e =>
                          setProfileData({
                            ...profileData,
                            jobTitle: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        placeholder="Software Engineer, Teacher, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="organization">Organization</Label>
                      <Input
                        id="organization"
                        value={
                          profileData.organization ||
                          user?.userProfile?.organization ||
                          ''
                        }
                        onChange={e =>
                          setProfileData({
                            ...profileData,
                            organization: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        placeholder="Company or Organization"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={
                          profileData.department ||
                          user?.userProfile?.department ||
                          ''
                        }
                        onChange={e =>
                          setProfileData({
                            ...profileData,
                            department: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        placeholder="IT, Marketing, HR, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={
                          profileData.website ||
                          user?.userProfile?.website ||
                          ''
                        }
                        onChange={e =>
                          setProfileData({
                            ...profileData,
                            website: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="skills">Skills</Label>
                    <Input
                      id="skills"
                      value={
                        (profileData.skills || user?.userProfile?.skills)?.join(
                          ', '
                        ) || ''
                      }
                      onChange={e =>
                        setProfileData({
                          ...profileData,
                          skills: e.target.value
                            .split(',')
                            .map(i => i.trim())
                            .filter(i => i),
                        })
                      }
                      disabled={!isEditing}
                      placeholder="JavaScript, Python, Design, Photography..."
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Separate with commas
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="hobbies">Hobbies</Label>
                    <Input
                      id="hobbies"
                      value={
                        (
                          profileData.hobbies || user?.userProfile?.hobbies
                        )?.join(', ') || ''
                      }
                      onChange={e =>
                        setProfileData({
                          ...profileData,
                          hobbies: e.target.value
                            .split(',')
                            .map(i => i.trim())
                            .filter(i => i),
                        })
                      }
                      disabled={!isEditing}
                      placeholder="Reading, Gaming, Cooking, Travel..."
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Separate with commas
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Learning Preferences Tab */}
            <TabsContent value="learning" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="learningGoals">Learning Goals</Label>
                    <Textarea
                      id="learningGoals"
                      value={
                        studentData.learningGoals ||
                        user?.studentProfile?.learningGoals ||
                        ''
                      }
                      onChange={e =>
                        setStudentData({
                          ...studentData,
                          learningGoals: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder="Describe your learning goals..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="learningStyle">Learning Style</Label>
                      <Select
                        value={
                          studentData.preferredLearningStyle ||
                          user?.studentProfile?.preferredLearningStyle ||
                          ''
                        }
                        onValueChange={value =>
                          setStudentData({
                            ...studentData,
                            preferredLearningStyle: value,
                          })
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visual">Visual</SelectItem>
                          <SelectItem value="auditory">Auditory</SelectItem>
                          <SelectItem value="kinesthetic">
                            Kinesthetic
                          </SelectItem>
                          <SelectItem value="reading_writing">
                            Reading/Writing
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="studyTime">Preferred Study Time</Label>
                      <Select
                        value={
                          studentData.preferredStudyTime ||
                          user?.studentProfile?.studyTimePreference ||
                          ''
                        }
                        onValueChange={value =>
                          setStudentData({
                            ...studentData,
                            preferredStudyTime: value,
                          })
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning</SelectItem>
                          <SelectItem value="afternoon">Afternoon</SelectItem>
                          <SelectItem value="evening">Evening</SelectItem>
                          <SelectItem value="night">Night</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="weeklyGoal">Weekly Goal (hours)</Label>
                      <Input
                        id="weeklyGoal"
                        type="number"
                        value={
                          studentData.weeklyLearningGoalHours ||
                          'temp'
                        }
                        onChange={e =>
                          setStudentData({
                            ...studentData,
                            weeklyLearningGoalHours: parseInt(e.target.value),
                          })
                        }
                        disabled={!isEditing}
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="difficulty">Difficulty Level</Label>
                      <Select
                        value={
                          studentData.preferredDifficulty ||
                          user?.studentProfile?.difficultyPreference ||
                          ''
                        }
                        onValueChange={value =>
                          setStudentData({
                            ...studentData,
                            preferredDifficulty: value,
                          })
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="interests">Interests</Label>
                    <Input
                      id="interests"
                      value={
                        (
                          studentData.interests ||
                          user?.userProfile?.interests
                        )?.join(', ') || ''
                      }
                      onChange={e =>
                        setStudentData({
                          ...studentData,
                          interests: e.target.value
                            .split(',')
                            .map(i => i.trim())
                            .filter(i => i),
                        })
                      }
                      disabled={!isEditing}
                      placeholder="Programming, Design, Marketing..."
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Separate with commas
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Learning Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {studentData.currentStreak ?? 'temp'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Current Streak
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {studentData.longestStreak ?? 'temp'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Longest Streak
                      </div>
                    </div>
                    {/* <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {studentProfile.averageSessionDuration || 0}min
                      </div>
                      <div className="text-sm text-gray-600">Avg Session</div>
                    </div> */}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {studentData.completionRate ?? 'temp'}
                        %
                      </div>
                      <div className="text-sm text-gray-600">
                        Completion Rate
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Settings Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Localization Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={
                          profileData.timezone ||
                          'temp'
                        }
                        onValueChange={value =>
                          setProfileData({
                            ...profileData,
                            timezone: value,
                          })
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Ho_Chi_Minh">
                            Ho Chi Minh (UTC+7)
                          </SelectItem>
                          <SelectItem value="Asia/Tokyo">
                            Tokyo (UTC+9)
                          </SelectItem>
                          <SelectItem value="America/New_York">
                            New York (UTC-5)
                          </SelectItem>
                          <SelectItem value="Europe/London">
                            London (UTC+0)
                          </SelectItem>
                          <SelectItem value="Asia/Singapore">
                            Singapore (UTC+8)
                          </SelectItem>
                          <SelectItem value="America/Los_Angeles">
                            Los Angeles (UTC-8)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="preferredLanguage">
                        Preferred Language
                      </Label>
                      <Select
                        value={
                          profileData.preferredLanguage ||
                          'temp'
                        }
                        onValueChange={value =>
                          setProfileData({
                            ...profileData,
                            preferredLanguage: value,
                          })
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="vi">Tiếng Việt</SelectItem>
                          <SelectItem value="ja">日本語</SelectItem>
                          <SelectItem value="ko">한국어</SelectItem>
                          <SelectItem value="zh">中文</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Profile Searchable</h4>
                      <p className="text-sm text-gray-600">
                        Allow your profile to appear in search results
                      </p>
                    </div>
                    <Button
                      variant={
                        (profileData.isSearchable ??
                        user?.userProfile?.isSearchable)
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() =>
                        setProfileData({
                          ...profileData,
                          isSearchable: !(
                            profileData.isSearchable ??
                            user?.userProfile?.isSearchable
                          ),
                        })
                      }
                      disabled={!isEditing}
                    >
                      {(profileData.isSearchable ??
                      user?.userProfile?.isSearchable)
                        ? 'Searchable'
                        : 'Not Searchable'}
                    </Button>
                  </div>

                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Public Profile</h4>
                      <p className="text-sm text-gray-600">
                        Allow others to view your basic profile
                      </p>
                    </div>
                    <Button
                      variant={
                        (studentData.isPublicProfile ??
                        user?.userProfile?.isPublic)
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() =>
                        setStudentData({
                          ...studentData,
                          isPublicProfile: !(
                            studentData.isPublicProfile ??
                            user?.userProfile?.isPublic
                          ),
                        })
                      }
                      disabled={!isEditing}
                    >
                      {(studentData.isPublicProfile ??
                      user?.userProfile?.isPublic) ? (
                        <>
                          <Eye className="mr-2 h-4 w-4" /> Public
                        </>
                      ) : (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" /> Private
                        </>
                      )}
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Show Learning Progress</h4>
                      <p className="text-sm text-gray-600">
                        Allow displaying your learning progress and achievements
                      </p>
                    </div>
                    <Button
                      variant={
                        (studentData.showProgress ??
                        user?.studentProfile?.enableProgressTracking)
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() =>
                        setStudentData({
                          ...studentData,
                          showProgress: !(
                            studentData.showProgress ??
                            user?.studentProfile?.enableProgressTracking
                          ),
                        })
                      }
                      disabled={!isEditing}
                    >
                      {(studentData.showProgress ??
                      user?.studentProfile?.enableProgressTracking)
                        ? 'Show'
                        : 'Hide'}
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-600">
                        Receive notifications about courses and learning
                        progress
                      </p>
                    </div>
                    <Button
                      variant={
                        (studentData.emailNotifications ?? 'temp')
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() =>
                        setStudentData({
                          ...studentData,
                          emailNotifications: !(
                            studentData.emailNotifications ?? 'temp'
                          ),
                        })
                      }
                      disabled={!isEditing}
                    >
                      {(studentData.emailNotifications ?? 'temp')
                        ? 'On'
                        : 'Off'}
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600">Danger Zone</h4>
                    <p className="text-sm text-gray-600">
                      These actions will permanently affect your account
                    </p>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Shield className="mr-2 h-4 w-4" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will permanently delete your account and
                            all related data. You cannot recover after deletion.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
