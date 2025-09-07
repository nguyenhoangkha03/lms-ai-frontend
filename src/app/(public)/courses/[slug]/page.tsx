'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  useGetCourseDetailQuery,
  useEnrollInCourseMutation,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useIsInWishlistQuery,
  useGetCourseRecommendationsQuery,
} from '@/lib/redux/api/course-api';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CourseCard } from '@/components/course/CourseCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import {
  Play,
  Clock,
  Users,
  Star,
  BookOpen,
  Award,
  Heart,
  Share2,
  Download,
  PlayCircle,
  CheckCircle,
  Lock,
  Globe,
  Calendar,
  TrendingUp,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function PublicCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = params.slug as string;

  const [selectedTab, setSelectedTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useGetCourseDetailQuery(slug);

  // Temporarily disable enrollment status check due to missing backend endpoint
  // const { data: enrollmentStatus } = useGetEnrollmentStatusQuery(
  //   course?.id || '',
  //   {
  //     skip: !course?.id || !user,
  //   }
  // );

  // Temporarily disable enrollment check due to missing backend endpoints
  // TODO: Implement proper enrollment status check when backend endpoints are available
  const enrollmentStatus = {
    isEnrolled: false, // Default to not enrolled
    enrollment: undefined,
  };

  const { data: wishlistStatus } = useIsInWishlistQuery(course?.id || '', {
    skip: !course?.id || !user,
  });

  const { data: recommendations } = useGetCourseRecommendationsQuery(
    {
      courseId: course?.id,
      limit: 4,
    },
    {
      skip: !course?.id,
    }
  );

  const [enrollInCourse, { isLoading: enrolling }] =
    useEnrollInCourseMutation();
  const [addToWishlist, { isLoading: addingToWishlist }] =
    useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: removingFromWishlist }] =
    useRemoveFromWishlistMutation();

  const isEnrolled = enrollmentStatus?.isEnrolled || false;
  const isInWishlist = wishlistStatus?.isInWishlist || false;

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please sign in to enroll in courses');
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!course) return;

    if (course.isFree) {
      // Free courses - direct enrollment
      try {
        await enrollInCourse({ courseId: course.id }).unwrap();
        toast.success('Successfully enrolled in course!');
        // Redirect to student dashboard after enrollment
        router.push('/dashboard');
      } catch (error) {
        toast.error('Failed to enroll in course');
      }
    } else {
      // Paid courses - redirect to get started with course in context
      router.push(`/get-started?course=${course.id}`);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error('Please sign in to add courses to wishlist');
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!course) return;

    try {
      if (isInWishlist) {
        await removeFromWishlist(course.id).unwrap();
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist({ courseId: course.id }).unwrap();
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Something went wrong, please try again');
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const formatDuration = () => {
    if (!course) return '';
    const totalMinutes = course.durationHours * 60 + course.durationMinutes;
    if (totalMinutes < 60) {
      return `${totalMinutes} min`;
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  const formatPrice = () => {
    if (!course) return '';
    if (course.isFree) return 'Free';

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: course.currency || 'USD',
    });

    return formatter.format(course.price);
  };

  const getLevelText = () => {
    if (!course) return '';
    switch (course.level) {
      case 'beginner':
        return 'Beginner';
      case 'intermediate':
        return 'Intermediate';
      case 'advanced':
        return 'Advanced';
      case 'expert':
        return 'Expert';
      case 'all_levels':
        return 'All Levels';
      default:
        return course.level;
    }
  };

  if (courseLoading) {
    return (
      <>
        <PublicHeader />
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <LoadingSpinner size="lg" />
        </div>
        <PublicFooter />
      </>
    );
  }

  if (courseError || !course) {
    return (
      <>
        <PublicHeader />
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-bold text-red-600">
              Course Not Found
            </h2>
            <p className="mb-4 text-gray-600">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push('/courses')}>
              Browse Courses
            </Button>
          </div>
        </div>
        <PublicFooter />
      </>
    );
  }

  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Course Info */}
              <div className="lg:col-span-2">
                {/* Breadcrumb */}
                <nav className="mb-6 text-sm">
                  <Link
                    href="/courses"
                    className="text-gray-300 hover:text-white"
                  >
                    Courses
                  </Link>
                  <span className="mx-2 text-gray-400">/</span>
                  <Link
                    href={`/courses?category=${course.category.slug}`}
                    className="text-gray-300 hover:text-white"
                  >
                    {course.category.name}
                  </Link>
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-400">{course.title}</span>
                </nav>

                {/* Course Title and Badges */}
                <div className="mb-4">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge className="bg-blue-600 text-white">
                      {getLevelText()}
                    </Badge>
                    {course.featured && (
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="mr-1 h-3 w-3" />
                        Featured
                      </Badge>
                    )}
                    {course.bestseller && (
                      <Badge className="bg-orange-500 text-white">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        Bestseller
                      </Badge>
                    )}
                    {course.isNew && (
                      <Badge className="bg-green-500 text-white">New</Badge>
                    )}
                  </div>
                  <h1 className="mb-4 text-3xl font-bold lg:text-4xl">
                    {course.title}
                  </h1>
                  <p className="mb-6 text-xl text-gray-300">
                    {course.shortDescription}
                  </p>
                </div>

                {/* Course Stats */}
                <div className="mb-6 flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{course.rating}</span>
                    <span className="text-gray-300">
                      ({course.totalRatings.toLocaleString()} ratings)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>
                      {course.totalEnrollments.toLocaleString()} students
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{formatDuration()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    <span>English</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>
                      Updated{' '}
                      {new Date(course.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Instructor Info */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={course.instructor.avatar} />
                    <AvatarFallback>
                      {course.instructor.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-gray-300">Created by</p>
                    <Link
                      href={`/instructor/${course.instructor.id}`}
                      className="text-xl font-semibold transition-colors hover:text-blue-400"
                    >
                      {course.instructor.name}
                    </Link>
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <span>
                        {course.instructor.totalStudents.toLocaleString()}{' '}
                        students
                      </span>
                      <span>{course.instructor.totalCourses} courses</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{course.instructor.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Preview Card */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardContent className="p-0">
                    {/* Video Preview */}
                    <div className="relative h-48">
                      <Image
                        src={course.thumbnailUrl}
                        alt={course.title}
                        fill
                        className="rounded-t-lg object-cover"
                      />
                      {course.trailerVideoUrl && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                          <Button
                            variant="ghost"
                            size="lg"
                            className="text-white"
                          >
                            <PlayCircle className="h-16 w-16" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      {/* Price */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2">
                          {course.originalPrice &&
                            course.originalPrice > course.price && (
                              <span className="text-lg text-gray-500 line-through">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: course.currency || 'USD',
                                }).format(course.originalPrice)}
                              </span>
                            )}
                          <span
                            className={cn(
                              'text-3xl font-bold',
                              course.isFree ? 'text-green-600' : 'text-blue-600'
                            )}
                          >
                            {formatPrice()}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mb-6 space-y-3">
                        {isEnrolled ? (
                          <Button
                            className="w-full"
                            size="lg"
                            onClick={() => router.push('/dashboard')}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Go to Course
                          </Button>
                        ) : (
                          <Button
                            className="w-full"
                            size="lg"
                            onClick={handleEnroll}
                            disabled={enrolling}
                          >
                            {enrolling ? (
                              <LoadingSpinner size="sm" className="mr-2" />
                            ) : course.isFree ? (
                              <UserCheck className="mr-2 h-4 w-4" />
                            ) : (
                              <ShoppingCart className="mr-2 h-4 w-4" />
                            )}
                            {course.isFree ? 'Enroll for Free' : 'Get Started'}
                          </Button>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleWishlistToggle}
                            disabled={addingToWishlist || removingFromWishlist}
                          >
                            <Heart
                              className={cn(
                                'mr-2 h-4 w-4',
                                isInWishlist ? 'fill-red-500 text-red-500' : ''
                              )}
                            />
                            {isInWishlist ? 'Saved' : 'Save'}
                          </Button>
                          <Button variant="outline" size="icon">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Course Includes */}
                      <div className="space-y-3 text-sm">
                        <h4 className="font-semibold">This course includes:</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <PlayCircle className="h-4 w-4 text-green-600" />
                            <span>{course.totalVideoDuration} minutes of video</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-green-600" />
                            <span>{course.totalLessons} lessons</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Download className="h-4 w-4 text-green-600" />
                            <span>Downloadable resources</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-green-600" />
                            <span>Full lifetime access</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-green-600" />
                            <span>Q&A support</span>
                          </div>
                          {course.hasCertificate && (
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-green-600" />
                              <span>Certificate of completion</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Content */}
            <div className="lg:col-span-2">
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="mb-8 grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                  <TabsTrigger value="instructor">Instructor</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-8">
                  {/* What you'll learn */}
                  <Card>
                    <CardHeader>
                      <CardTitle>What you'll learn</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {course.whatYouWillLearn.map((item, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Description */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Course description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: course.description }}
                      />
                    </CardContent>
                  </Card>

                  {/* Requirements */}
                  {course.requirements.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Requirements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {course.requirements.map((requirement, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-gray-400" />
                              <span className="text-sm">{requirement}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Target Audience */}
                  {course.targetAudience.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Who this course is for</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {course.targetAudience.map((audience, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-400" />
                              <span className="text-sm">{audience}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Curriculum Tab */}
                <TabsContent value="curriculum" className="space-y-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-semibold">
                      {course.totalSections} sections • {course.totalLessons} lessons
                      • {Math.floor(course.totalVideoDuration / 60)}h{' '}
                      {course.totalVideoDuration % 60}m total length
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (expandedSections.length === course.sections.length) {
                          setExpandedSections([]);
                        } else {
                          setExpandedSections(course.sections.map(s => s.id));
                        }
                      }}
                    >
                      {expandedSections.length === course.sections.length
                        ? 'Collapse all'
                        : 'Expand all'}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {course.sections.map(section => (
                      <Card key={section.id}>
                        <CardHeader
                          className="cursor-pointer transition-colors hover:bg-gray-50"
                          onClick={() => toggleSection(section.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {section.title}
                              </CardTitle>
                              <p className="mt-1 text-sm text-gray-600">
                                {section.totalLessons} lectures •{' '}
                                {Math.floor(section.totalDuration / 60)}h{' '}
                                {section.totalDuration % 60}m
                              </p>
                            </div>
                            {expandedSections.includes(section.id) ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </div>
                          {section.description && (
                            <p className="mt-2 text-sm text-gray-600">
                              {section.description}
                            </p>
                          )}
                        </CardHeader>

                        {expandedSections.includes(section.id) && (
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              {section.lessons.map(lesson => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center justify-between rounded p-3 hover:bg-gray-50"
                                >
                                  <div className="flex items-center gap-3">
                                    {lesson.lessonType === 'video' ? (
                                      <PlayCircle className="h-4 w-4 text-blue-600" />
                                    ) : lesson.lessonType === 'quiz' ? (
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <BookOpen className="h-4 w-4 text-gray-600" />
                                    )}
                                    <div>
                                      <p className="text-sm font-medium">
                                        {lesson.title}
                                      </p>
                                      {lesson.description && (
                                        <p className="mt-1 text-xs text-gray-600">
                                          {lesson.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 text-sm text-gray-500">
                                    {lesson.isPreview && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        Preview
                                      </Badge>
                                    )}
                                    {!lesson.isPreview && !isEnrolled && (
                                      <Lock className="h-4 w-4" />
                                    )}
                                    <span>{lesson.estimatedDuration} min</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Instructor Tab */}
                <TabsContent value="instructor">
                  <Card>
                    <CardContent className="p-6">
                      <div className="mb-6 flex items-start gap-6">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={course.instructor.avatar} />
                          <AvatarFallback className="text-2xl">
                            {course.instructor.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="mb-2 text-2xl font-bold">
                            {course.instructor.name}
                          </h3>
                          <p className="mb-4 text-gray-600">
                            {course.instructor.experience}
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                            <div className="text-center">
                              <div className="mb-1 flex items-center justify-center">
                                <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-bold">
                                  {course.instructor.rating}
                                </span>
                              </div>
                              <p className="text-gray-600">Instructor Rating</p>
                            </div>
                            <div className="text-center">
                              <div className="mb-1 font-bold">
                                {course.instructor.totalStudents.toLocaleString()}
                              </div>
                              <p className="text-gray-600">Students</p>
                            </div>
                            <div className="text-center">
                              <div className="mb-1 font-bold">
                                {course.instructor.totalCourses}
                              </div>
                              <p className="text-gray-600">Courses</p>
                            </div>
                            <div className="text-center">
                              <div className="mb-1 font-bold">5+</div>
                              <p className="text-gray-600">Years Experience</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      <div>
                        <h4 className="mb-3 font-semibold">About</h4>
                        <p className="leading-relaxed text-gray-700">
                          {course.instructor.bio}
                        </p>
                      </div>

                      {course.instructor.expertise &&
                        course.instructor.expertise.length > 0 && (
                          <>
                            <Separator className="my-6" />
                            <div>
                              <h4 className="mb-3 font-semibold">Expertise</h4>
                              <div className="flex flex-wrap gap-2">
                                {course.instructor.expertise.map(
                                  (skill, index) => (
                                    <Badge key={index} variant="secondary">
                                      {skill}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          </>
                        )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews">
                  <div className="space-y-6">
                    {/* Rating Overview */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                          <div className="text-center">
                            <div className="mb-2 text-4xl font-bold">
                              {course.rating}
                            </div>
                            <div className="mb-2 flex items-center justify-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    'h-5 w-5',
                                    i < Math.floor(course.rating)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  )}
                                />
                              ))}
                            </div>
                            <p className="text-gray-600">
                              {course.totalRatings.toLocaleString()} ratings
                            </p>
                          </div>

                          <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map(rating => {
                              const percentage =
                                course.reviews.ratingDistribution[
                                  rating as 1 | 2 | 3 | 4 | 5
                                ] || 0;
                              return (
                                <div
                                  key={rating}
                                  className="flex items-center gap-3"
                                >
                                  <div className="flex w-12 items-center gap-1">
                                    <span className="text-sm">{rating}</span>
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  </div>
                                  <Progress
                                    value={percentage}
                                    className="flex-1"
                                  />
                                  <span className="w-12 text-sm text-gray-600">
                                    {percentage}%
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Reviews */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Recent Reviews</h3>
                      {course.reviews.recentReviews.map(review => (
                        <Card key={review.id}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <Avatar>
                                <AvatarImage src={review.student.avatar} />
                                <AvatarFallback>
                                  {review.student.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                  <span className="font-medium">
                                    {review.student.name}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={cn(
                                          'h-4 w-4',
                                          i < review.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        )}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {new Date(
                                      review.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                                {review.isVerifiedPurchase && (
                                  <Badge
                                    variant="outline"
                                    className="mt-2 text-xs"
                                  >
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Verified Purchase
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              {/* Related Courses */}
              {recommendations && recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Related Courses</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recommendations.map(relatedCourse => (
                      <div
                        key={relatedCourse.id}
                        className="border-b pb-4 last:border-b-0"
                      >
                        <CourseCard
                          course={relatedCourse}
                          viewMode="grid"
                          showWishlist={false}
                          className="border-0 shadow-none"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to Start Learning?</h2>
            <p className="mb-8 text-xl opacity-90">
              Join thousands of students already learning on our platform
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" onClick={() => router.push('/get-started')}>
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" onClick={() => router.push('/courses?price=free')}>
                Browse Free Courses
              </Button>
            </div>
          </div>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}