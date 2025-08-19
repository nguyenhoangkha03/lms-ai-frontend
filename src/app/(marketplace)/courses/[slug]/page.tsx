'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  useGetCourseDetailQuery,
  useGetEnrollmentStatusQuery,
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function CourseDetailPage() {
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

  const { data: enrollmentStatus } = useGetEnrollmentStatusQuery(
    course?.id || '',
    {
      skip: !course?.id || !user,
    }
  );

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
      toast.error('Vui lòng đăng nhập để đăng ký khóa học');
      router.push('/login');
      return;
    }

    if (!course) return;

    try {
      await enrollInCourse({ courseId: course.id }).unwrap();
      toast.success('Đăng ký khóa học thành công!');
      router.push(`/student/courses/${course.id}`);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đăng ký khóa học');
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
      return;
    }

    if (!course) return;

    try {
      if (isInWishlist) {
        await removeFromWishlist(course.id).unwrap();
        toast.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        await addToWishlist({ courseId: course.id }).unwrap();
        toast.success('Đã thêm vào danh sách yêu thích');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
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
      return `${totalMinutes} phút`;
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours} giờ ${minutes} phút` : `${hours} giờ`;
  };

  const formatPrice = () => {
    if (!course) return '';
    if (course.isFree) return 'Miễn phí';

    const formatter = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: course.currency || 'VND',
    });

    return formatter.format(course.price);
  };

  const getLevelText = () => {
    if (!course) return '';
    switch (course.level) {
      case 'beginner':
        return 'Cơ bản';
      case 'intermediate':
        return 'Trung cấp';
      case 'advanced':
        return 'Nâng cao';
      case 'expert':
        return 'Chuyên gia';
      case 'all_levels':
        return 'Mọi cấp độ';
      default:
        return course.level;
    }
  };

  if (courseLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-red-600">
            Không tìm thấy khóa học
          </h2>
          <p className="mb-4 text-gray-600">
            Khóa học bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Button onClick={() => router.push('/courses')}>
            Về trang khóa học
          </Button>
        </div>
      </div>
    );
  }

  return (
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
                  Khóa học
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
                      Nổi bật
                    </Badge>
                  )}
                  {course.bestseller && (
                    <Badge className="bg-orange-500 text-white">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      Bán chạy nhất
                    </Badge>
                  )}
                  {course.isNew && (
                    <Badge className="bg-green-500 text-white">Mới</Badge>
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
                    ({course.totalRatings.toLocaleString()} đánh giá)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>
                    {course.totalEnrollments.toLocaleString()} học viên
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{formatDuration()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <span>Tiếng Việt</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>
                    Cập nhật{' '}
                    {new Date(course.updatedAt).toLocaleDateString('vi-VN')}
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
                  <p className="text-gray-300">Giảng viên</p>
                  <Link
                    href={`/instructor/${course.instructor.id}`}
                    className="text-xl font-semibold transition-colors hover:text-blue-400"
                  >
                    {course.instructor.name}
                  </Link>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <span>
                      {course.instructor.totalStudents.toLocaleString()} học
                      viên
                    </span>
                    <span>{course.instructor.totalCourses} khóa học</span>
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
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: course.currency || 'VND',
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
                          onClick={() =>
                            router.push(`/student/courses/${course.id}`)
                          }
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Tiếp tục học
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
                            <Download className="mr-2 h-4 w-4" />
                          ) : (
                            <Play className="mr-2 h-4 w-4" />
                          )}
                          {course.isFree ? 'Đăng ký miễn phí' : 'Mua ngay'}
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
                          {isInWishlist ? 'Đã yêu thích' : 'Yêu thích'}
                        </Button>
                        <Button variant="outline" size="icon">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Course Includes */}
                    <div className="space-y-3 text-sm">
                      <h4 className="font-semibold">Khóa học này bao gồm:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <PlayCircle className="h-4 w-4 text-green-600" />
                          <span>{course.totalVideoDuration} phút video</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-green-600" />
                          <span>{course.totalLessons} bài học</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Download className="h-4 w-4 text-green-600" />
                          <span>Tài liệu tải về</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-green-600" />
                          <span>Truy cập trọn đời</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-green-600" />
                          <span>Hỗ trợ Q&A</span>
                        </div>
                        {course.hasCertificate && (
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-green-600" />
                            <span>Chứng chỉ hoàn thành</span>
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
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="curriculum">Chương trình</TabsTrigger>
                <TabsTrigger value="instructor">Giảng viên</TabsTrigger>
                <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-8">
                {/* What you'll learn */}
                <Card>
                  <CardHeader>
                    <CardTitle>Bạn sẽ học được gì</CardTitle>
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
                    <CardTitle>Mô tả khóa học</CardTitle>
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
                      <CardTitle>Yêu cầu</CardTitle>
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
                      <CardTitle>Khóa học này dành cho ai</CardTitle>
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
                    {course.totalSections} phần • {course.totalLessons} bài học
                    •{Math.floor(course.totalVideoDuration / 60)}h{' '}
                    {course.totalVideoDuration % 60}m
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
                      ? 'Thu gọn tất cả'
                      : 'Mở rộng tất cả'}
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
                              {section.totalLessons} bài học •{' '}
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
                                      Xem trước
                                    </Badge>
                                  )}
                                  {!lesson.isPreview && !isEnrolled && (
                                    <Lock className="h-4 w-4" />
                                  )}
                                  <span>{lesson.estimatedDuration} phút</span>
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
                            <p className="text-gray-600">Đánh giá</p>
                          </div>
                          <div className="text-center">
                            <div className="mb-1 font-bold">
                              {course.instructor.totalStudents.toLocaleString()}
                            </div>
                            <p className="text-gray-600">Học viên</p>
                          </div>
                          <div className="text-center">
                            <div className="mb-1 font-bold">
                              {course.instructor.totalCourses}
                            </div>
                            <p className="text-gray-600">Khóa học</p>
                          </div>
                          <div className="text-center">
                            <div className="mb-1 font-bold">5+</div>
                            <p className="text-gray-600">Năm kinh nghiệm</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div>
                      <h4 className="mb-3 font-semibold">Giới thiệu</h4>
                      <p className="leading-relaxed text-gray-700">
                        {course.instructor.bio}
                      </p>
                    </div>

                    {course.instructor.expertise &&
                      course.instructor.expertise.length > 0 && (
                        <>
                          <Separator className="my-6" />
                          <div>
                            <h4 className="mb-3 font-semibold">Chuyên môn</h4>
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
                            {course.totalRatings.toLocaleString()} đánh giá
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
                    <h3 className="text-xl font-semibold">Đánh giá gần đây</h3>
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
                                  ).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                              <p className="text-gray-700">{review.comment}</p>
                              {review.isVerifiedPurchase && (
                                <Badge
                                  variant="outline"
                                  className="mt-2 text-xs"
                                >
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Đã mua khóa học
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
                  <CardTitle>Khóa học liên quan</CardTitle>
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
    </div>
  );
}
