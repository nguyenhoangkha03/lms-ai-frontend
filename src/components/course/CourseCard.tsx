'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Course } from '@/types/course';
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useIsInWishlistQuery,
} from '@/lib/redux/api/course-api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Heart,
  Star,
  Clock,
  Users,
  PlayCircle,
  BookOpen,
  Award,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

interface CourseCardProps {
  course: Course;
  viewMode?: 'grid' | 'list';
  showWishlist?: boolean;
  className?: string;
}

export function CourseCard({
  course,
  viewMode = 'grid',
  showWishlist = true,
  className,
}: CourseCardProps) {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const { data: wishlistStatus } = useIsInWishlistQuery(course.id, {
    skip: !user,
  });

  const [addToWishlist, { isLoading: addingToWishlist }] =
    useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: removingFromWishlist }] =
    useRemoveFromWishlistMutation();

  const isInWishlist = wishlistStatus?.isInWishlist || false;
  const isWishlistLoading = addingToWishlist || removingFromWishlist;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
      return;
    }

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

  const formatDuration = () => {
    const totalMinutes = course.durationHours * 60 + course.durationMinutes;
    if (totalMinutes < 60) {
      return `${totalMinutes}m`;
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  const formatPrice = () => {
    if (course.isFree) return 'Miễn phí';

    const formatter = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: course.currency || 'VND',
    });

    return formatter.format(course.price);
  };

  const getLevelBadgeColor = () => {
    switch (course.level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-orange-100 text-orange-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = () => {
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

  if (viewMode === 'list') {
    return (
      <Card
        className={cn(
          'overflow-hidden transition-shadow hover:shadow-lg',
          className
        )}
      >
        <div className="flex flex-col md:flex-row">
          <div className="relative h-48 md:h-auto md:w-80">
            <Link href={`/courses/${course.slug}`}>
              <Image
                src={course.thumbnailUrl}
                alt={course.title}
                fill
                className="object-cover"
              />
              {course.trailerVideoUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 transition-opacity hover:opacity-100">
                  <PlayCircle className="h-12 w-12 text-white" />
                </div>
              )}
            </Link>

            {/* Badges */}
            <div className="absolute left-3 top-3 flex flex-col gap-2">
              {course.featured && (
                <Badge className="bg-yellow-500 text-white">
                  <Star className="mr-1 h-3 w-3" />
                  Nổi bật
                </Badge>
              )}
              {course.bestseller && (
                <Badge className="bg-orange-500 text-white">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  Bán chạy
                </Badge>
              )}
              {course.isNew && (
                <Badge className="bg-green-500 text-white">Mới</Badge>
              )}
            </div>

            {/* Wishlist */}
            {showWishlist && user && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-3 top-3 bg-white/80 hover:bg-white"
                onClick={handleWishlistToggle}
                disabled={isWishlistLoading}
              >
                <Heart
                  className={cn(
                    'h-4 w-4',
                    isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'
                  )}
                />
              </Button>
            )}
          </div>

          <CardContent className="flex-1 p-6">
            <div className="mb-3 flex items-start justify-between">
              <Badge className={cn('text-xs', getLevelBadgeColor())}>
                {getLevelText()}
              </Badge>
              <div className="text-right">
                {course.originalPrice &&
                  course.originalPrice > course.price && (
                    <p className="text-sm text-gray-500 line-through">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: course.currency || 'VND',
                      }).format(course.originalPrice)}
                    </p>
                  )}
                <p
                  className={cn(
                    'font-bold',
                    course.isFree ? 'text-green-600' : 'text-blue-600'
                  )}
                >
                  {formatPrice()}
                </p>
              </div>
            </div>

            <Link href={`/courses/${course.slug}`}>
              <h3 className="mb-2 line-clamp-2 text-lg font-semibold transition-colors hover:text-blue-600">
                {course.title}
              </h3>
            </Link>

            <p className="mb-3 line-clamp-2 text-sm text-gray-600">
              {course.shortDescription}
            </p>

            <div className="mb-3 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {course.totalEnrollments.toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration()}
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {course.totalLessons} bài học
              </div>
              {course.hasCertificate && (
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  Chứng chỉ
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src={course.teacher.avatar || '/images/default-avatar.png'}
                  alt={course.teacher.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div>
                  <p className="text-sm font-medium">{course.teacher.name}</p>
                  {course.teacher.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">
                        {course.teacher.rating} ({course.teacher.totalStudents}{' '}
                        học viên)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{course.rating}</span>
                <span className="text-sm text-gray-500">
                  ({course.totalRatings})
                </span>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  // Grid view
  return (
    <Card
      className={cn(
        'cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg',
        isHovered && '-translate-y-1 transform',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48">
        <Link href={`/courses/${course.slug}`}>
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
          {course.trailerVideoUrl && (
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 transition-opacity',
                isHovered ? 'opacity-100' : 'opacity-0'
              )}
            >
              <PlayCircle className="h-12 w-12 text-white" />
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {course.featured && (
            <Badge className="bg-yellow-500 text-white">
              <Star className="mr-1 h-3 w-3" />
              Nổi bật
            </Badge>
          )}
          {course.bestseller && (
            <Badge className="bg-orange-500 text-white">
              <TrendingUp className="mr-1 h-3 w-3" />
              Bán chạy
            </Badge>
          )}
          {course.isNew && (
            <Badge className="bg-green-500 text-white">Mới</Badge>
          )}
        </div>

        {/* Wishlist */}
        {showWishlist && user && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-3 top-3 bg-white/80 hover:bg-white"
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
          >
            <Heart
              className={cn(
                'h-4 w-4',
                isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'
              )}
            />
          </Button>
        )}

        {/* Level badge */}
        <div className="absolute bottom-3 left-3">
          <Badge className={cn('text-xs', getLevelBadgeColor())}>
            {getLevelText()}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/courses/${course.slug}`}>
              <h3 className="mb-1 line-clamp-2 text-lg font-semibold transition-colors hover:text-blue-600">
                {course.title}
              </h3>
            </Link>
            <p className="mb-3 line-clamp-2 text-sm text-gray-600">
              {course.shortDescription}
            </p>
          </div>
        </div>

        <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDuration()}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {course.totalEnrollments.toLocaleString()}
          </div>
          {course.hasCertificate && (
            <div className="flex items-center gap-1">
              <Award className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src={course.teacher.avatar || '/images/default-avatar.png'}
              alt={course.teacher.name}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="truncate text-sm text-gray-600">
              {course.teacher.name}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{course.rating}</span>
            <span className="text-xs text-gray-500">
              ({course.totalRatings})
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            {course.originalPrice && course.originalPrice > course.price && (
              <p className="text-sm text-gray-500 line-through">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: course.currency || 'VND',
                }).format(course.originalPrice)}
              </p>
            )}
            <p
              className={cn(
                'text-lg font-bold',
                course.isFree ? 'text-green-600' : 'text-blue-600'
              )}
            >
              {formatPrice()}
            </p>
          </div>

          <Button size="sm" asChild>
            <Link href={`/courses/${course.slug}`}>Xem chi tiết</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
