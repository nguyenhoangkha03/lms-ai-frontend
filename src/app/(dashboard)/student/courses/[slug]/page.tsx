'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import {
  useGetCourseDetailQuery,
  useEnrollInCourseMutation,
  useGetEnrollmentStatusQuery,
  useGetCourseReviewsQuery,
  useAddCourseReviewMutation,
} from '@/lib/redux/api/course-api';
import {
  useAddToCartMutation,
  useCheckInCartQuery,
} from '@/lib/redux/api/ecommerce-api';
import { useAuth } from '@/contexts/auth-context';
// import { CourseHeader } from '@/components/course/CourseHeader';
// import { CourseContent } from '@/components/course/CourseContent';
// import { CourseSidebar } from '@/components/course/CourseSidebar';
// import { EnrollmentButton } from '@/components/course/EnrollmentButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Play,
  Clock,
  Users,
  Award,
  BookOpen,
  ArrowLeft,
  Star,
  Heart,
  Share,
  Globe,
  Calendar,
  CheckCircle,
  MessageSquare,
  Bookmark,
  Download,
  Shield,
  Infinity,
  Target,
  GraduationCap,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Loader,
  TrendingUp,
  Languages,
  Camera,
  User,
  Tag,
  Zap,
  ShoppingCart as ShoppingCartIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion } from 'framer-motion';
import '@/styles/video-player.css';

// Enhanced Video Player Component
interface EnhancedVideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
  title: string;
}

const EnhancedVideoPlayer = ({ videoUrl, posterUrl, title }: EnhancedVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      setIsLoading(true);
      videoRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    setIsLoading(false);
  };

  const handleProgress = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = (parseFloat(e.target.value) / 100) * duration;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      if (isPlaying) {
        timeout = setTimeout(() => setShowControls(false), 3000);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', () => setShowControls(false));
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', () => setShowControls(false));
      }
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  return (
    <Card className="overflow-hidden shadow-xl">
      <div 
        ref={containerRef}
        className="group relative aspect-video bg-black cursor-pointer"
        onDoubleClick={toggleFullscreen}
      >
        <video
          ref={videoRef}
          poster={posterUrl}
          className="h-full w-full"
          onPlay={() => {
            setIsPlaying(true);
            setIsLoading(false);
          }}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onWaiting={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Play Button Overlay */}
        {!isPlaying && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/20"
            onClick={togglePlayPause}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 text-black shadow-lg backdrop-blur-sm transition-all hover:bg-white"
            >
              <Play className="h-8 w-8 ml-1" fill="currentColor" />
            </motion.button>
          </motion.div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-white"
            >
              <Loader className="h-8 w-8" />
            </motion.div>
          </div>
        )}

        {/* Custom Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: showControls || !isPlaying ? 1 : 0,
            y: showControls || !isPlaying ? 0 : 20
          }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
        >
          {/* Progress Bar */}
          <div className="mb-3">
            <input
              type="range"
              min={0}
              max={100}
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={handleProgress}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between text-white">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePlayPause}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all hover:bg-white/30"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" fill="currentColor" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
                )}
              </motion.button>

              <button
                onClick={() => skipTime(-10)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all hover:bg-white/30"
              >
                <SkipBack className="h-4 w-4" />
              </button>

              <button
                onClick={() => skipTime(10)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all hover:bg-white/30"
              >
                <SkipForward className="h-4 w-4" />
              </button>

              {/* Volume Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all hover:bg-white/30"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={isMuted ? 0 : volume * 100}
                  onChange={handleVolumeChange}
                  className="w-20 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer volume-slider"
                  style={{
                    background: `linear-gradient(to right, #ffffff 0%, #ffffff ${isMuted ? 0 : volume * 100}%, rgba(255,255,255,0.2) ${isMuted ? 0 : volume * 100}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />
              </div>

              {/* Time Display */}
              <div className="text-sm font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all hover:bg-white/30"
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Title Overlay */}
        <div className="absolute top-4 left-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: showControls || !isPlaying ? 1 : 0, x: showControls || !isPlaying ? 0 : -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg bg-black/60 px-3 py-2 text-white backdrop-blur-sm"
          >
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-gray-200">Course Preview</p>
          </motion.div>
        </div>
      </div>
    </Card>
  );
};

export default function StudentCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState<
    'overview' | 'curriculum' | 'instructor' | 'reviews'
  >('overview');

  const [isAnimatingToCart, setIsAnimatingToCart] = useState(false);
  const [hasJustAddedToCart, setHasJustAddedToCart] = useState(false);
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
  });

  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useGetCourseDetailQuery(slug);

  console.log('course detail', course);

  // Check enrollment status
  const { data: enrollmentStatus, isLoading: enrollmentLoading } =
    useGetEnrollmentStatusQuery(course?.id || '', {
      skip: !course?.id || !user,
    });

  console.log('enrollment status', {
    enrollmentStatus,
    enrollmentLoading,
    courseId: course?.id,
    user: !!user,
  });

  const [enrollInCourse, { isLoading: enrolling }] =
    useEnrollInCourseMutation();

  const [addToCart, { isLoading: addingToCart }] = useAddToCartMutation();

  const { data: cartStatus } = useCheckInCartQuery(course?.id || '', {
    skip: !course?.id || !user,
  });

  // Reviews hooks
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useGetCourseReviewsQuery(
    { courseId: course?.id || '', page: 1, limit: 10 },
    { skip: !course?.id }
  );

  const [addCourseReview, { isLoading: addingReview }] = useAddCourseReviewMutation();

  const handleEnroll = async () => {
    if (!course || !user) {
      toast.error('Please login to enroll in this course');
      router.push('/login');
      return;
    }

    // For free courses, enroll directly
    if (course.isFree) {
      try {
        await enrollInCourse({
          courseId: course.id,
        }).unwrap();

        toast.success('Successfully enrolled in course!');
        // router.push(`/student/learning/${course.id}`);
      } catch (error) {
        console.error('Enrollment error:', error);
        toast.error('Failed to enroll in course. Please try again.');
      }
    } else {
      // For paid courses, add to cart
      handleAddToCart();
    }
  };

  const handleAddToCart = async () => {
    if (!course || !user) {
      toast.error('Please login to add course to cart');
      router.push('/login');
      return;
    }

    try {
      // Start animation
      setIsAnimatingToCart(true);

      // Trigger flying animation
      triggerFlyToCartAnimation();

      // Add to cart API call
      await addToCart({
        courseId: course.id,
        metadata: { source: 'course_detail' },
      }).unwrap();

      // Wait for animation to complete
      setTimeout(() => {
        setIsAnimatingToCart(false);
        setHasJustAddedToCart(true);
        toast.success('Course added to cart!');
      }, 1200);
    } catch (error: any) {
      console.error('Add to cart error:', error);
      setIsAnimatingToCart(false);
      toast.error(
        error.data?.message || 'Failed to add course to cart. Please try again.'
      );
    }
  };

  const triggerFlyToCartAnimation = () => {
    // Get the course image element
    const courseImage = document.querySelector('.course-thumbnail');
    // Get the cart icon in header
    const cartIcon = document.querySelector('[data-cart-icon]');

    if (!courseImage || !cartIcon) return;

    // Create a clone of the course image
    const flyingImage = courseImage.cloneNode(true) as HTMLElement;
    flyingImage.className = 'flying-course-image';

    // Get positions
    const imageRect = courseImage.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    // Set initial position and styles
    Object.assign(flyingImage.style, {
      position: 'fixed',
      top: imageRect.top + 'px',
      left: imageRect.left + 'px',
      width: imageRect.width + 'px',
      height: imageRect.height + 'px',
      zIndex: '9999',
      borderRadius: '12px',
      transition: 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      pointerEvents: 'none',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    });

    document.body.appendChild(flyingImage);

    // Trigger animation after a small delay
    requestAnimationFrame(() => {
      Object.assign(flyingImage.style, {
        top: cartRect.top + 'px',
        left: cartRect.left + 'px',
        width: '40px',
        height: '40px',
        opacity: '0.8',
        transform: 'scale(0.3)',
      });
    });

    // Clean up after animation
    setTimeout(() => {
      document.body.removeChild(flyingImage);

      // Add bounce effect to cart icon
      if (cartIcon) {
        cartIcon.classList.add('cart-bounce-animation');
        setTimeout(() => {
          cartIcon.classList.remove('cart-bounce-animation');
        }, 600);
      }
    }, 1200);
  };

  const handleGoToCart = () => {
    router.push('/student/cart');
  };

  const handleStartLearning = () => {
    if (!course) return;
    router.push(`/student/learning/${course.id}`);
  };

  const handleSubmitReview = async () => {
    if (!course || !user) {
      toast.error('Please login to add a review');
      return;
    }

    if (newReview.comment.trim().length < 10) {
      toast.error('Please write a review with at least 10 characters');
      return;
    }

    try {
      await addCourseReview({
        courseId: course.id,
        rating: newReview.rating,
        comment: newReview.comment.trim(),
      }).unwrap();

      toast.success('Review added successfully!');
      setShowReviewForm(false);
      setNewReview({ rating: 5, comment: '' });
    } catch (error: any) {
      console.error('Add review error:', error);
      toast.error(error.data?.message || 'Failed to add review. Please try again.');
    }
  };

  const formatDuration = (hours: number = 0, minutes: number = 0) => {
    if (hours === 0 && minutes === 0) return 'Not specified';
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatPrice = (
    price: number,
    currency: string = 'USD',
    originalPrice?: number
  ) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    });

    return {
      current: formatter.format(price),
      original: originalPrice ? formatter.format(originalPrice) : null,
    };
  };

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLanguageFlag = (language: string) => {
    switch (language?.toLowerCase()) {
      case 'en':
      case 'english':
        return '🇺🇸';
      case 'vi':
      case 'vietnamese':
        return '🇻🇳';
      default:
        return '🌐';
    }
  };

  // Add custom CSS for animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .flying-course-image {
        transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
      }
      
      @keyframes cartBounce {
        0%, 20%, 53%, 80%, 100% {
          transform: scale(1);
        }
        40%, 43% {
          transform: scale(1.2);
        }
        70% {
          transform: scale(1.1);
        }
        90% {
          transform: scale(1.05);
        }
      }
      
      .cart-bounce-animation {
        animation: cartBounce 0.6s ease-in-out;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Compute values before any return statements
  const isEnrolled = enrollmentStatus?.isEnrolled || false;
  const isInCart = cartStatus?.inCart || false;
  const canEnroll = !isEnrolled && course && course.status === 'published';
  const priceInfo = course
    ? formatPrice(course.price, course.currency, course.originalPrice)
    : null;

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="mb-4 h-8 w-32" />
            <Skeleton className="mb-4 h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Skeleton className="mb-8 h-80 w-full rounded-xl" />
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <Skeleton className="mb-4 h-64 w-full" />
                  <Skeleton className="mb-2 h-12 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Card className="mx-4 w-full max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <BookOpen className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Course Not Found
            </h2>
            <p className="mb-6 text-gray-600">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.back()} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Enhanced Header */}
      <div className="border-b bg-white/80 shadow-sm backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-blue-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>

          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              {/* Course Badges */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-medium">
                  {course.category.name}
                </Badge>
                <Badge className={getLevelColor(course.level)}>
                  {course.level}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  {getLanguageFlag(course.language)}
                  {course.language}
                </Badge>
                {course.featured && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    <Star className="mr-1 h-3 w-3" />
                    Featured
                  </Badge>
                )}
                {course.bestseller && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Bestseller
                  </Badge>
                )}
                {course.isNew && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    <Zap className="mr-1 h-3 w-3" />
                    New
                  </Badge>
                )}
              </div>

              <h1 className="mb-4 text-4xl font-bold leading-tight text-gray-900">
                {course.title}
              </h1>

              <p className="mb-6 text-xl leading-relaxed text-gray-600">
                {course.shortDescription}
              </p>

              {/* Enhanced Course Stats */}
              <div className="mb-6 flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(course.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{course.rating}</span>
                  <span>({course.totalRatings.toLocaleString()} ratings)</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>
                    {course.totalEnrollments.toLocaleString()} students
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span>
                    {formatDuration(
                      course.durationHours,
                      course.durationMinutes
                    )}
                  </span>
                </div>

                {course.hasCertificate && (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-purple-500" />
                    <span>Certificate included</span>
                  </div>
                )}

                {course.lifetimeAccess && (
                  <div className="flex items-center gap-2">
                    <Infinity className="h-4 w-4 text-indigo-500" />
                    <span>Lifetime access</span>
                  </div>
                )}
              </div>

              {/* Enhanced Instructor Info */}
              <div className="flex items-center gap-3 rounded-xl border bg-white/60 p-4">
                <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                  <AvatarImage
                    className="h-full w-full object-cover"
                    src={
                      course.teacher?.avatarUrl || '/images/default-avatar.png'
                    }
                  />
                  <AvatarFallback className="bg-blue-500 font-semibold text-white">
                    {course.teacher?.displayName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-gray-500">Created by</p>
                  <p className="font-semibold text-gray-900">
                    {course.teacher?.displayName}
                  </p>
                </div>
                {course.publishedAt && (
                  <div className="ml-auto text-right">
                    <p className="text-sm text-gray-500">Published</p>
                    <p className="text-sm font-medium">
                      {new Date(course.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="ml-8 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="hover:border-red-200 hover:bg-red-50"
              >
                <Heart className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hover:border-blue-200 hover:bg-blue-50"
              >
                <Share className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hover:border-green-200 hover:bg-green-50"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Enhanced Course Preview */}
            {course.trailerVideoUrl ? (
              <EnhancedVideoPlayer
                videoUrl={course.trailerVideoUrl}
                posterUrl={course.thumbnailUrl}
                title={course.title}
              />
            ) : (
              <Card className="overflow-hidden shadow-xl">
                <div
                  className="course-thumbnail group relative flex aspect-video cursor-pointer items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900"
                  style={{
                    backgroundImage: course.thumbnailUrl
                      ? `url(${course.thumbnailUrl})`
                      : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="absolute inset-0 bg-black/40 transition-all duration-300 group-hover:bg-black/30" />
                  <div className="relative z-10 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform duration-300 group-hover:scale-110">
                      <Play className="ml-1 h-8 w-8 text-gray-800" />
                    </div>
                    <p className="text-lg font-medium text-white">
                      Course Preview
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Navigation Tabs */}
            <Card>
              <div className="flex border-b">
                {[
                  { key: 'overview', label: 'Overview', icon: BookOpen },
                  {
                    key: 'curriculum',
                    label: 'Curriculum',
                    icon: GraduationCap,
                  },
                  { key: 'instructor', label: 'Instructor', icon: User },
                  { key: 'reviews', label: 'Reviews', icon: MessageSquare },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex flex-1 items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                      activeTab === key
                        ? 'border-b-2 border-blue-500 bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>

              <CardContent className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Course Description */}
                    <div>
                      <h2 className="mb-4 text-2xl font-bold">
                        About this course
                      </h2>
                      <div className="prose prose-gray max-w-none">
                        {course.description
                          .split('\n')
                          .map((paragraph, index) => (
                            <p
                              key={index}
                              className="mb-4 leading-relaxed text-gray-700"
                            >
                              {paragraph}
                            </p>
                          ))}
                      </div>
                    </div>

                    {/* What you'll learn */}
                    {course.whatYouWillLearn &&
                      course.whatYouWillLearn.length > 0 && (
                        <div>
                          <h2 className="mb-6 text-2xl font-bold">
                            What you'll learn
                          </h2>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {course.whatYouWillLearn.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-3 rounded-lg bg-green-50 p-3"
                              >
                                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                                  <CheckCircle className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-800">
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Requirements */}
                    {course.requirements && course.requirements.length > 0 && (
                      <div>
                        <h2 className="mb-6 text-2xl font-bold">
                          Requirements
                        </h2>
                        <ul className="space-y-3">
                          {course.requirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                              <span className="text-gray-700">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Target Audience */}
                    {course.targetAudience &&
                      course.targetAudience.length > 0 && (
                        <div>
                          <h2 className="mb-6 text-2xl font-bold">
                            Who this course is for
                          </h2>
                          <div className="space-y-3">
                            {course.targetAudience.map((audience, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-3 rounded-lg bg-blue-50 p-3"
                              >
                                <Target className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
                                <span className="text-gray-700">
                                  {audience}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {activeTab === 'curriculum' && (
                  <div>
                    <h2 className="mb-6 text-2xl font-bold">Course content</h2>
                    <div className="mb-6 flex items-center gap-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {course.totalSections} sections
                      </span>
                      <span className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        {course.totalLessons} lessons
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {Math.floor(course.totalVideoDuration / 3600)}h{' '}
                        {Math.floor((course.totalVideoDuration % 3600) / 60)}m
                        total
                      </span>
                    </div>

                    {course.sections && course.sections.length > 0 && (
                      <div className="space-y-4">
                        {course.sections.map((section, index) => (
                          <Card
                            key={section.id}
                            className="border-l-4 border-l-blue-500"
                          >
                            <div className="bg-gradient-to-r from-blue-50 to-transparent p-4">
                              <h3 className="text-lg font-bold">
                                Section {index + 1}: {section.title}
                              </h3>
                              <p className="mt-1 text-sm text-gray-600">
                                {section.lessons?.length || 0} lessons
                              </p>
                            </div>

                            {section.lessons && section.lessons.length > 0 && (
                              <div className="p-4 pt-0">
                                <div className="space-y-3">
                                  {section.lessons.map(
                                    (lesson, lessonIndex) => (
                                      <div
                                        key={lesson.id}
                                        className="flex items-center gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50"
                                      >
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                                          {lesson.lessonType === 'video' ? (
                                            <Play className="h-4 w-4 text-blue-500" />
                                          ) : (
                                            <BookOpen className="h-4 w-4 text-gray-500" />
                                          )}
                                        </div>
                                        <span className="flex-1 font-medium">
                                          {lesson.title}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm text-gray-500">
                                            {Math.floor(
                                              lesson.estimatedDuration / 60
                                            )}
                                            :
                                            {String(
                                              lesson.estimatedDuration % 60
                                            ).padStart(2, '0')}
                                          </span>
                                          {lesson.isPreview && (
                                            <Badge
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              Preview
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'instructor' && (
                  <div>
                    <h2 className="mb-6 text-2xl font-bold">Your instructor</h2>
                    <div className="flex items-start gap-6">
                      <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                        <AvatarImage
                          className="h-full w-full object-cover"
                          src={
                            course.teacher?.avatarUrl ||
                            '/images/default-avatar.png'
                          }
                        />
                        <AvatarFallback className="bg-blue-500 text-xl font-bold text-white">
                          {course.teacher?.displayName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="mb-2 text-2xl font-bold text-gray-900">
                          {course.teacher?.displayName}
                        </h3>
                        <p className="mb-4 text-gray-600">Course Instructor</p>
                        {/* Add more instructor details here when available */}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">Student feedback</h2>
                      {user && enrollmentStatus?.isEnrolled && (
                        <Button
                          onClick={() => setShowReviewForm(!showReviewForm)}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                          <Star className="mr-2 h-4 w-4" />
                          Write a Review
                        </Button>
                      )}
                    </div>

                    {/* Add Review Form */}
                    {showReviewForm && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg border bg-gray-50 p-6"
                      >
                        <h3 className="mb-4 text-lg font-semibold">Write your review</h3>
                        
                        {/* Rating Stars */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Rating
                          </label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewReview({ ...newReview, rating: star })}
                                className="transition-colors"
                              >
                                <Star
                                  className={`h-6 w-6 ${
                                    star <= newReview.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'fill-gray-200 text-gray-200'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Comment */}
                        <div className="mb-4">
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            Comment
                          </label>
                          <textarea
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            placeholder="Share your experience with this course..."
                            className="w-full rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:ring-blue-500"
                            rows={4}
                            minLength={10}
                          />
                          <p className="mt-1 text-sm text-gray-500">
                            Minimum 10 characters ({newReview.comment.length}/10)
                          </p>
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-3">
                          <Button
                            onClick={handleSubmitReview}
                            disabled={addingReview || newReview.comment.trim().length < 10}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {addingReview ? (
                              <>
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              'Submit Review'
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowReviewForm(false);
                              setNewReview({ rating: 5, comment: '' });
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Reviews Summary */}
                    {reviewsData?.summary && (
                      <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          {/* Overall Rating */}
                          <div className="text-center">
                            <div className="text-4xl font-bold text-gray-800">
                              {reviewsData.summary.averageRating.toFixed(1)}
                            </div>
                            <div className="mb-2 flex justify-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-5 w-5 ${
                                    star <= Math.round(reviewsData.summary.averageRating)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'fill-gray-200 text-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-gray-600">
                              Based on {reviewsData.summary.totalReviews} reviews
                            </p>
                          </div>

                          {/* Rating Distribution */}
                          <div>
                            <h4 className="mb-3 font-semibold">Rating Distribution</h4>
                            {[5, 4, 3, 2, 1].map((rating) => {
                              const count = reviewsData.summary.ratingDistribution[rating] || 0;
                              const percentage = reviewsData.summary.totalReviews 
                                ? (count / reviewsData.summary.totalReviews) * 100 
                                : 0;
                              
                              return (
                                <div key={rating} className="mb-2 flex items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm">{rating}</span>
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="h-2 rounded-full bg-gray-200">
                                      <div
                                        className="h-2 rounded-full bg-yellow-400"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                  <span className="text-sm text-gray-600">{count}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reviews List */}
                    {reviewsLoading ? (
                      <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="rounded-lg border p-6">
                            <div className="flex items-start gap-4">
                              <Skeleton className="h-12 w-12 rounded-full" />
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-16 w-full" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : reviewsError ? (
                      <div className="py-12 text-center text-red-500">
                        <MessageSquare className="mx-auto mb-4 h-12 w-12 opacity-50" />
                        <p>Failed to load reviews. Please try again later.</p>
                      </div>
                    ) : reviewsData?.reviews?.length === 0 ? (
                      <div className="py-12 text-center text-gray-500">
                        <MessageSquare className="mx-auto mb-4 h-12 w-12 opacity-50" />
                        <p className="mb-2 text-lg font-medium">No reviews yet</p>
                        <p>Be the first to share your experience with this course!</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {reviewsData?.reviews.map((review: any) => (
                          <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-lg border bg-white p-6 shadow-sm"
                          >
                            <div className="flex items-start gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={review.user?.avatarUrl} />
                                <AvatarFallback>
                                  {review.user?.fullName?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1">
                                <div className="mb-2 flex items-center justify-between">
                                  <div>
                                    <h4 className="font-semibold text-gray-900">
                                      {review.user?.fullName || 'Anonymous User'}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Star
                                            key={star}
                                            className={`h-4 w-4 ${
                                              star <= review.rating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'fill-gray-200 text-gray-200'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-sm text-gray-500">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <p className="text-gray-700 leading-relaxed">
                                  {review.comment}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Right Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-0 bg-white/80 shadow-xl backdrop-blur-sm">
              <CardContent className="p-8">
                {/* Price Section */}
                <div className="mb-8">
                  {course.isFree ? (
                    <div className="mb-2 text-4xl font-bold text-green-600">
                      Free
                    </div>
                  ) : (
                    <div>
                      {priceInfo.original && (
                        <div className="mb-1 text-lg text-gray-500 line-through">
                          {priceInfo.original}
                        </div>
                      )}
                      <div className="mb-2 text-4xl font-bold text-blue-600">
                        {priceInfo.current}
                      </div>
                      {priceInfo.original && (
                        <div className="inline-flex items-center rounded bg-red-100 px-2 py-1 text-sm font-medium text-red-800">
                          {Math.round(
                            ((course.originalPrice! - course.price) /
                              course.originalPrice!) *
                              100
                          )}
                          % off
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Enrollment Action */}
                <div className="mb-8">
                  {isEnrolled ? (
                    <Button
                      className="h-14 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-lg font-semibold shadow-lg hover:from-green-600 hover:to-emerald-600"
                      onClick={handleStartLearning}
                    >
                      <Play className="mr-2 h-6 w-6" />
                      Continue Learning
                    </Button>
                  ) : canEnroll ? (
                    <>
                      {course.isFree ? (
                        <Button
                          className="h-14 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-lg font-semibold shadow-lg hover:from-green-600 hover:to-emerald-600"
                          onClick={handleEnroll}
                          disabled={enrolling}
                        >
                          {enrolling ? (
                            <>
                              <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Enrolling...
                            </>
                          ) : (
                            'Enroll For Free'
                          )}
                        </Button>
                      ) : isInCart ? (
                        <div className="space-y-3">
                          <Button
                            className="h-14 w-full bg-gradient-to-r from-orange-500 to-red-500 text-lg font-semibold shadow-lg hover:from-orange-600 hover:to-red-600"
                            onClick={() => router.push('/student/cart')}
                          >
                            <ShoppingCartIcon className="mr-2 h-5 w-5" />
                            Go to Cart
                          </Button>
                          <Button
                            variant="outline"
                            className="h-12 w-full text-base font-medium"
                            onClick={handleAddToCart}
                            disabled={addingToCart}
                          >
                            {addingToCart ? 'Adding...' : 'Add Another'}
                          </Button>
                        </div>
                      ) : hasJustAddedToCart || cartStatus?.inCart ? (
                        <div className="space-y-3">
                          <Button
                            className="h-14 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-lg font-semibold shadow-lg hover:from-green-600 hover:to-emerald-600"
                            onClick={handleGoToCart}
                          >
                            <ShoppingCartIcon className="mr-2 h-5 w-5" />
                            Go to Cart
                          </Button>
                          <Button
                            variant="outline"
                            className="h-12 w-full border-2 text-base font-medium"
                            onClick={() => {
                              setHasJustAddedToCart(false);
                            }}
                          >
                            Continue Shopping
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="relative h-14 w-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 text-lg font-semibold shadow-lg hover:from-blue-600 hover:to-purple-600"
                          onClick={handleEnroll}
                          disabled={
                            enrolling || addingToCart || isAnimatingToCart
                          }
                        >
                          {isAnimatingToCart ? (
                            <>
                              <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Flying to Cart...
                              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-orange-500/20 to-red-500/20" />
                            </>
                          ) : addingToCart ? (
                            <>
                              <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Adding to Cart...
                            </>
                          ) : enrolling ? (
                            <>
                              <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Processing...
                            </>
                          ) : (
                            'Add to Cart'
                          )}
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      className="h-14 w-full text-lg font-semibold"
                      disabled
                    >
                      Not Available
                    </Button>
                  )}

                  {course.lifetimeAccess && (
                    <p className="mt-3 flex items-center justify-center gap-1 text-center text-sm text-gray-500">
                      <Infinity className="h-4 w-4" />
                      Full lifetime access
                    </p>
                  )}

                  {/* Money back guarantee */}
                  <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    30-day money-back guarantee
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Enhanced Course Features */}
                <div className="space-y-4">
                  <h3 className="mb-4 font-semibold text-gray-900">
                    This course includes:
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <span>
                        {formatDuration(
                          course.durationHours,
                          course.durationMinutes
                        )}{' '}
                        on-demand video
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                        <BookOpen className="h-4 w-4 text-green-600" />
                      </div>
                      <span>{course.totalLessons} lessons</span>
                    </div>

                    {course.hasCertificate && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                          <Award className="h-4 w-4 text-purple-600" />
                        </div>
                        <span>Certificate of completion</span>
                      </div>
                    )}

                    {course.lifetimeAccess && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                          <Infinity className="h-4 w-4 text-indigo-600" />
                        </div>
                        <span>Full lifetime access</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                        <Download className="h-4 w-4 text-orange-600" />
                      </div>
                      <span>Downloadable resources</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100">
                        <Globe className="h-4 w-4 text-pink-600" />
                      </div>
                      <span>Access on mobile and TV</span>
                    </div>

                    {course.allowDiscussions && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                          <MessageSquare className="h-4 w-4 text-yellow-600" />
                        </div>
                        <span>Q&A with instructor</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Course Stats */}
                <div className="space-y-4">
                  <h3 className="mb-4 font-semibold text-gray-900">
                    Course stats
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Skill level</span>
                      <Badge className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Students enrolled
                      </span>
                      <span className="text-sm font-semibold">
                        {course.totalEnrollments.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Languages</span>
                      <span className="text-sm font-semibold">
                        {getLanguageFlag(course.language)} {course.language}
                      </span>
                    </div>

                    {course.totalCompletions > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Completion rate
                          </span>
                          <span className="text-sm font-semibold">
                            {Math.round(
                              (course.totalCompletions /
                                course.totalEnrollments) *
                                100
                            )}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            (course.totalCompletions /
                              course.totalEnrollments) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    )}

                    {course.availableFrom && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Available from
                        </span>
                        <span className="text-sm font-semibold">
                          {new Date(course.availableFrom).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {course.availableUntil && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Available until
                        </span>
                        <span className="text-sm font-semibold text-orange-600">
                          {new Date(course.availableUntil).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {course.enrollmentLimit && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Enrollment limit
                          </span>
                          <span className="text-sm font-semibold">
                            {course.totalEnrollments} / {course.enrollmentLimit}
                          </span>
                        </div>
                        <Progress
                          value={
                            (course.totalEnrollments / course.enrollmentLimit) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {course.tags && course.tags.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="mb-4 font-semibold text-gray-900">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {course.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            <Tag className="mr-1 h-3 w-3" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Share Course */}
                <Separator className="my-6" />
                <div className="text-center">
                  <h3 className="mb-4 font-semibold text-gray-900">
                    Share this course
                  </h3>
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" size="sm">
                      <Share className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Course Recommendations */}
            <Card className="mt-6 shadow-lg">
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold text-gray-900">
                  More courses by this instructor
                </h3>
                <div className="py-8 text-center text-gray-500">
                  <User className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p className="text-sm">More courses coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Course Information */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-bold">Learn with Community</h3>
            <p className="text-sm text-gray-600">
              Join {course.totalEnrollments.toLocaleString()}+ students in this
              course
            </p>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-bold">Get Certified</h3>
            <p className="text-sm text-gray-600">
              {course.hasCertificate
                ? 'Earn a certificate upon completion'
                : 'Build your skills and knowledge'}
            </p>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500">
              <Infinity className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 text-lg font-bold">Lifetime Access</h3>
            <p className="text-sm text-gray-600">
              {course.lifetimeAccess
                ? 'Learn at your own pace, forever'
                : `Access for ${course.accessDuration || 365} days`}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
