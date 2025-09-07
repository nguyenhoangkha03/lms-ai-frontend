'use client';

import React from 'react';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useGetUserByUsernameQuery } from '@/lib/redux/api/user-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
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
  ExternalLink,
  Users,
  Briefcase,
  GraduationCap,
  Heart,
  Zap,
  Trophy,
  MessageCircle,
  UserPlus,
  Share2,
  Activity,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  BarChart3,
  Shield,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PublicProfilePageProps {
  params: {
    username: string;
  };
}

export default function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = params;

  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useGetUserByUsernameQuery(username);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (userError || !userData) {
    return notFound();
  }

  // Check if profile is public
  if (!userData.userProfile?.isPublic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <Card className="border-0 shadow-2xl">
              <CardContent className="p-12 text-center">
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                  <Shield className="h-10 w-10 text-gray-400" />
                </div>
                <h2 className="mb-3 text-3xl font-bold">Private Profile</h2>
                <p className="mb-8 text-gray-600">
                  This profile is set to private and cannot be viewed publicly.
                </p>
                <Button size="lg" className="w-full" asChild>
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Return Home
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userData.displayName}'s Profile`,
          text: `Check out ${userData.displayName}'s learning journey!`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Profile link copied to clipboard!');
    }
  };

  const joinDate = new Date(userData.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const lastActive = userData.lastLoginAt
    ? new Date(userData.lastLoginAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Never';

  const studentProfile = userData.studentProfile || {};
  const completedCourses = studentProfile.totalCoursesCompleted || 0;
  const totalCourses = userData.enrollments?.length || 0;
  const activeEnrollments =
    userData.enrollments?.filter(e => e.status === 'active').length || 0;
  const completionRate =
    totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

  // Calculate average progress
  const averageProgress =
    userData.enrollments?.length > 0
      ? Math.round(
          userData.enrollments.reduce(
            (sum, e) => sum + parseFloat(e.progressPercentage || '0'),
            0
          ) / userData.enrollments.length
        )
      : 0;

  // Achievement level colors
  const achievementLevelColor =
    {
      Bronze: 'from-orange-400 to-orange-600',
      Silver: 'from-gray-400 to-gray-600',
      Gold: 'from-yellow-400 to-yellow-600',
      Platinum: 'from-purple-400 to-purple-600',
      Diamond: 'from-blue-400 to-blue-600',
    }[studentProfile.achievementLevel || 'Bronze'] ||
    'from-orange-400 to-orange-600';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 pb-32 pt-20">
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-30">
          <div className="animate-blob absolute -left-4 top-0 h-72 w-72 rounded-full bg-purple-300 mix-blend-multiply blur-xl filter"></div>
          <div className="animation-delay-2000 animate-blob absolute -right-4 top-0 h-72 w-72 rounded-full bg-yellow-300 mix-blend-multiply blur-xl filter"></div>
          <div className="animation-delay-4000 animate-blob absolute -bottom-8 left-20 h-72 w-72 rounded-full bg-pink-300 mix-blend-multiply blur-xl filter"></div>
        </div>

        <div className="container relative mx-auto px-4">
          {/* Header Controls */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 flex items-center justify-between"
          >
            <Button
              variant="ghost"
              className="text-white backdrop-blur-sm hover:bg-white/20"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="text-white backdrop-blur-sm hover:bg-white/20"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Profile
            </Button>
          </motion.div>

          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center text-white"
          >
            <div className="relative mx-auto mb-8 h-36 w-36">
              <div className="absolute inset-0 animate-pulse rounded-full bg-white/20 blur-xl"></div>
              <Avatar className="relative h-36 w-36 border-4 border-white/30 shadow-2xl">
                <AvatarImage
                  src={userData.avatarUrl}
                  alt={userData.displayName}
                />
                <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-3xl text-white">
                  {userData.firstName?.charAt(0)}
                  {userData.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {userData.userProfile?.isVerified && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-500 shadow-lg"
                >
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </motion.div>
              )}
            </div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-3 text-5xl font-bold"
            >
              {userData.displayName}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mb-2 text-xl opacity-90"
            >
              @{userData.username}
            </motion.p>

            {userData.userProfile?.bio && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mx-auto mb-8 max-w-2xl text-lg opacity-85"
              >
                {userData.userProfile.bio}
              </motion.p>
            )}

            {/* Enhanced Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4"
            >
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold">{totalCourses}</div>
                <div className="text-sm opacity-90">Courses Enrolled</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold">{completedCourses}</div>
                <div className="text-sm opacity-90">Completed</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold">
                  {studentProfile.totalCertificates || 0}
                </div>
                <div className="text-sm opacity-90">Certificates</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold">
                  {Math.round((studentProfile.totalStudyHours || 0) / 3600)}h
                </div>
                <div className="text-sm opacity-90">Study Time</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="container mx-auto -mt-20 px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-8 grid w-full grid-cols-3 bg-white shadow-lg">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Profile Info */}
                <div className="space-y-6">
                  <Card className="border-0 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{userData.email}</span>
                      </div>

                      {userData.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{userData.phone}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">Joined {joinDate}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          Last active: {lastActive}
                        </span>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">User Type</span>
                          <Badge variant="secondary" className="capitalize">
                            {userData.userType}
                          </Badge>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Status</span>
                          <Badge
                            variant={
                              userData.status === 'active'
                                ? 'default'
                                : 'secondary'
                            }
                            className="capitalize"
                          >
                            {userData.status}
                          </Badge>
                        </div>

                        {userData.emailVerified && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Email</span>
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Learning Preferences */}
                  <Card className="border-0 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Learning Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Difficulty
                        </span>
                        <Badge variant="outline" className="capitalize">
                          {studentProfile.difficultyPreference || 'Not Set'}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Level</span>
                        <div
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white',
                            `bg-gradient-to-r ${achievementLevelColor}`
                          )}
                        >
                          <Trophy className="h-3 w-3" />
                          {studentProfile.achievementLevel || 'Bronze'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Points</span>
                        <span className="font-semibold">
                          {studentProfile.achievementPoints || 0}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Stats and Progress */}
                <div className="space-y-6 lg:col-span-2">
                  {/* Progress Stats */}
                  <Card className="border-0 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Learning Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                        <div className="text-center">
                          <div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                            <span className="text-2xl font-bold text-indigo-600">
                              {activeEnrollments}
                            </span>
                          </div>
                          <div className="text-sm font-medium">Active</div>
                          <div className="text-xs text-gray-500">Courses</div>
                        </div>

                        <div className="text-center">
                          <div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <span className="text-2xl font-bold text-green-600">
                              {completedCourses}
                            </span>
                          </div>
                          <div className="text-sm font-medium">Completed</div>
                          <div className="text-xs text-gray-500">Courses</div>
                        </div>

                        <div className="text-center">
                          <div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                            <span className="text-2xl font-bold text-purple-600">
                              {averageProgress}%
                            </span>
                          </div>
                          <div className="text-sm font-medium">Average</div>
                          <div className="text-xs text-gray-500">Progress</div>
                        </div>

                        <div className="text-center">
                          <div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                            <span className="text-2xl font-bold text-orange-600">
                              {parseFloat(
                                studentProfile.averageGrade || '0'
                              ).toFixed(0)}
                            </span>
                          </div>
                          <div className="text-sm font-medium">Average</div>
                          <div className="text-xs text-gray-500">Grade</div>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      <div className="space-y-4">
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Overall Completion Rate
                            </span>
                            <span className="text-sm text-gray-600">
                              {completionRate}%
                            </span>
                          </div>
                          <Progress value={completionRate} className="h-2" />
                        </div>

                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Average Course Progress
                            </span>
                            <span className="text-sm text-gray-600">
                              {averageProgress}%
                            </span>
                          </div>
                          <Progress
                            value={averageProgress}
                            className="h-2 bg-purple-100"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  {userData.enrollments && userData.enrollments.length > 0 && (
                    <Card className="border-0 shadow-xl">
                      <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                        <CardTitle className="flex items-center gap-2">
                          <Flame className="h-5 w-5" />
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {userData.enrollments.slice(0, 3).map(enrollment => (
                            <div
                              key={enrollment.id}
                              className="flex items-center gap-4 rounded-lg border p-3"
                            >
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold">
                                  {enrollment.course.title}
                                </h4>
                                <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                                  <span>{enrollment.course.level}</span>
                                  <span>•</span>
                                  <span>
                                    {Math.round(
                                      enrollment.course.durationHours
                                    )}
                                    h {enrollment.course.durationMinutes}m
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold">
                                  {parseFloat(
                                    enrollment.progressPercentage
                                  ).toFixed(0)}
                                  %
                                </div>
                                <Badge
                                  variant={
                                    enrollment.status === 'completed'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                  className="mt-1 text-xs capitalize"
                                >
                                  {enrollment.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="courses" className="space-y-6">
              {userData.enrollments && userData.enrollments.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {userData.enrollments.map(enrollment => (
                    <motion.div
                      key={enrollment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="h-full border-0 shadow-lg transition-shadow hover:shadow-xl">
                        <div className="relative h-48 overflow-hidden rounded-t-lg">
                          {enrollment.course.thumbnailUrl ? (
                            <img
                              src={enrollment.course.thumbnailUrl}
                              alt={enrollment.course.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-indigo-400 to-purple-400"></div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="line-clamp-2 font-bold text-white">
                              {enrollment.course.title}
                            </h3>
                          </div>
                          {enrollment.status === 'completed' && (
                            <div className="absolute right-4 top-4">
                              <Badge className="bg-green-500 text-white">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Completed
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="mb-3 flex items-center gap-2 text-xs text-gray-600">
                            <Badge variant="outline" className="capitalize">
                              {enrollment.course.level}
                            </Badge>
                            <span>•</span>
                            <span>
                              {enrollment.course.language.toUpperCase()}
                            </span>
                            <span>•</span>
                            <span>
                              {Math.round(enrollment.course.durationHours)}h
                            </span>
                          </div>

                          <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                            {enrollment.course.shortDescription}
                          </p>

                          <div className="space-y-3">
                            <div>
                              <div className="mb-1 flex justify-between text-xs">
                                <span>Progress</span>
                                <span className="font-semibold">
                                  {parseFloat(
                                    enrollment.progressPercentage
                                  ).toFixed(0)}
                                  %
                                </span>
                              </div>
                              <Progress
                                value={parseFloat(
                                  enrollment.progressPercentage
                                )}
                                className="h-2"
                              />
                            </div>

                            {enrollment.rating && (
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      'h-4 w-4',
                                      i <
                                        Math.floor(
                                          parseFloat(enrollment.rating)
                                        )
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    )}
                                  />
                                ))}
                                <span className="ml-1 text-xs text-gray-600">
                                  {parseFloat(enrollment.rating).toFixed(1)}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>
                                Enrolled:{' '}
                                {new Date(
                                  enrollment.enrollmentDate
                                ).toLocaleDateString()}
                              </span>
                              {enrollment.course.isFree ? (
                                <Badge
                                  variant="outline"
                                  className="text-green-600"
                                >
                                  Free
                                </Badge>
                              ) : (
                                <span className="font-semibold">
                                  ${enrollment.course.price}
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="border-0 shadow-xl">
                  <CardContent className="py-16 text-center">
                    <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-xl font-semibold">
                      No Courses Yet
                    </h3>
                    <p className="text-gray-600">
                      This user hasn't enrolled in any courses yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Achievement Level Card */}
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div
                        className={cn(
                          'mx-auto mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br',
                          achievementLevelColor
                        )}
                      >
                        <Trophy className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="mb-2 text-xl font-bold">Current Level</h3>
                      <div
                        className={cn(
                          'mb-2 inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-white',
                          `bg-gradient-to-r ${achievementLevelColor}`
                        )}
                      >
                        {studentProfile.achievementLevel || 'Bronze'}
                      </div>
                      <p className="text-2xl font-bold text-gray-800">
                        {studentProfile.achievementPoints || 0}
                      </p>
                      <p className="text-sm text-gray-600">
                        Achievement Points
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Certificates Card */}
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="mx-auto mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600">
                        <Award className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="mb-2 text-xl font-bold">Certificates</h3>
                      <p className="text-3xl font-bold text-gray-800">
                        {studentProfile.totalCertificates || 0}
                      </p>
                      <p className="text-sm text-gray-600">Earned</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Study Stats Card */}
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="mx-auto mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-600">
                        <BarChart3 className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="mb-2 text-xl font-bold">Study Stats</h3>
                      <p className="text-3xl font-bold text-gray-800">
                        {Math.round(
                          (studentProfile.totalStudyHours || 0) / 3600
                        )}
                      </p>
                      <p className="text-sm text-gray-600">Total Hours</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Achievement Info */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Learning Journey Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-indigo-600" />
                        <span className="font-semibold">
                          Education Progress
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Courses Started</span>
                          <span className="font-semibold">{totalCourses}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Courses Completed</span>
                          <span className="font-semibold">
                            {completedCourses}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Completion Rate</span>
                          <span className="font-semibold">
                            {completionRate}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-600" />
                        <span className="font-semibold">Learning Goals</span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Active Courses</span>
                          <span className="font-semibold">
                            {activeEnrollments}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average Progress</span>
                          <span className="font-semibold">
                            {averageProgress}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average Grade</span>
                          <span className="font-semibold">
                            {parseFloat(
                              studentProfile.averageGrade || '0'
                            ).toFixed(0)}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Timeline */}
                  <div className="mt-6">
                    <h4 className="mb-4 font-semibold">Achievement Timeline</h4>
                    <div className="relative space-y-4">
                      <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>

                      {userData.enrollments
                        ?.slice(0, 4)
                        .map((enrollment, index) => (
                          <div
                            key={enrollment.id}
                            className="relative flex items-center gap-4"
                          >
                            <div
                              className={cn(
                                'relative z-10 flex h-8 w-8 items-center justify-center rounded-full',
                                enrollment.status === 'completed'
                                  ? 'bg-green-500'
                                  : 'bg-gray-300'
                              )}
                            >
                              {enrollment.status === 'completed' ? (
                                <CheckCircle2 className="h-4 w-4 text-white" />
                              ) : (
                                <div className="h-2 w-2 rounded-full bg-white"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {enrollment.course.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {enrollment.status === 'completed'
                                  ? `Completed on ${new Date(enrollment.completionDate || enrollment.updatedAt).toLocaleDateString()}`
                                  : `${parseFloat(enrollment.progressPercentage).toFixed(0)}% complete`}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Contact Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Card className="border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" className="flex-1">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  <Button size="lg" variant="outline" className="flex-1">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Follow User
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
