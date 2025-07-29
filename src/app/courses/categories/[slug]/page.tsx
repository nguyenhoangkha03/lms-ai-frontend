'use client';

import { useState, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
  useGetPublicCoursesQuery,
  useGetCategoriesQuery,
} from '@/lib/redux/api/course-api';
import { CourseFilters } from '@/types/course';
import { CourseCard } from '@/components/course/CourseCard';
import { CourseFilters as CourseFiltersComponent } from '@/components/course/CourseFilters';
import { CourseSorting } from '@/components/course/CourseSorting';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Grid3X3,
  List,
  Filter,
  BookOpen,
  TrendingUp,
  Users,
  Star,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function CourseCategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const categorySlug = params.slug as string;

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Parse URL parameters to filters
  const filters = useMemo<CourseFilters>(
    () => ({
      category: categorySlug,
      search: searchParams.get('search') || undefined,
      level: searchParams.get('level')
        ? [searchParams.get('level')!]
        : undefined,
      price: (searchParams.get('price') as 'free' | 'paid' | 'all') || 'all',
      rating: searchParams.get('rating')
        ? parseInt(searchParams.get('rating')!)
        : undefined,
      duration:
        (searchParams.get('duration') as 'short' | 'medium' | 'long') ||
        undefined,
      language: searchParams.get('language')
        ? [searchParams.get('language')!]
        : undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'popularity',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: 12,
    }),
    [searchParams, categorySlug]
  );

  const {
    data: coursesResponse,
    isLoading: coursesLoading,
    error: coursesError,
  } = useGetPublicCoursesQuery(filters as any);

  const { data: categories } = useGetCategoriesQuery();

  // Find current category
  const currentCategory = categories?.find(cat => cat.slug === categorySlug);

  const updateFilters = (newFilters: Partial<CourseFilters>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });

    // Reset page when filters change (except when changing page itself)
    if (!newFilters.page) {
      params.delete('page');
    }

    router.push(`/courses/categories/${categorySlug}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(`/courses/categories/${categorySlug}`);
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(
      ([key, value]) =>
        value !== undefined &&
        value !== null &&
        value !== '' &&
        key !== 'page' &&
        key !== 'limit' &&
        key !== 'sortBy' &&
        key !== 'category'
    ).length;
  };

  if (!currentCategory && categories) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-red-600">
            Không tìm thấy danh mục
          </h2>
          <p className="mb-4 text-gray-600">
            Danh mục bạn đang tìm kiếm không tồn tại.
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
      {/* Category Hero */}
      {currentCategory && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              {/* Breadcrumb */}
              <nav className="mb-6 text-sm">
                <Link
                  href="/courses"
                  className="text-blue-100 hover:text-white"
                >
                  Tất cả khóa học
                </Link>
                <span className="mx-2 text-blue-200">/</span>
                <span className="text-blue-100">{currentCategory.name}</span>
              </nav>

              <div className="flex items-start gap-6">
                {/* Category Icon */}
                {currentCategory.iconUrl && (
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                    <img
                      src={currentCategory.iconUrl}
                      alt={currentCategory.name}
                      className="h-12 w-12"
                    />
                  </div>
                )}

                <div className="flex-1">
                  <h1 className="mb-4 text-4xl font-bold">
                    {currentCategory.name}
                  </h1>
                  {currentCategory.description && (
                    <p className="mb-6 max-w-3xl text-xl opacity-90">
                      {currentCategory.description}
                    </p>
                  )}

                  {/* Category Stats */}
                  <div className="grid max-w-2xl grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <div className="mb-2 flex items-center justify-center">
                        <BookOpen className="mr-2 h-5 w-5" />
                        <span className="text-2xl font-bold">
                          {currentCategory.courseCount}
                        </span>
                      </div>
                      <p className="text-sm opacity-80">Khóa học</p>
                    </div>
                    <div className="text-center">
                      <div className="mb-2 flex items-center justify-center">
                        <Users className="mr-2 h-5 w-5" />
                        <span className="text-2xl font-bold">50K+</span>
                      </div>
                      <p className="text-sm opacity-80">Học viên</p>
                    </div>
                    <div className="text-center">
                      <div className="mb-2 flex items-center justify-center">
                        <Star className="mr-2 h-5 w-5" />
                        <span className="text-2xl font-bold">4.8</span>
                      </div>
                      <p className="text-sm opacity-80">Đánh giá TB</p>
                    </div>
                    <div className="text-center">
                      <div className="mb-2 flex items-center justify-center">
                        <TrendingUp className="mr-2 h-5 w-5" />
                        <span className="text-2xl font-bold">95%</span>
                      </div>
                      <p className="text-sm opacity-80">Hoàn thành</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filters Sidebar */}
          <div
            className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}
          >
            <div className="sticky top-4 rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Bộ lọc</h3>
                <div className="flex items-center gap-2">
                  {getActiveFiltersCount() > 0 && (
                    <Badge variant="secondary">{getActiveFiltersCount()}</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Xóa tất cả
                  </Button>
                </div>
              </div>

              <CourseFiltersComponent
                filters={filters}
                categories={categories || []}
                onFiltersChange={updateFilters}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Toolbar */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden"
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      Bộ lọc
                      {getActiveFiltersCount() > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {getActiveFiltersCount()}
                        </Badge>
                      )}
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {coursesResponse?.total || 0} khóa học
                    </span>
                    <CourseSorting
                      value={filters.sortBy || 'popularity'}
                      onChange={sortBy =>
                        updateFilters({ sortBy: sortBy as any })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {coursesLoading ? (
              <div
                className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1'
                }`}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-lg bg-white shadow-sm"
                  >
                    <Skeleton className="h-48 w-full" />
                    <div className="space-y-3 p-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : coursesError ? (
              <div className="py-12 text-center">
                <h3 className="mb-2 text-xl font-semibold text-red-600">
                  Không thể tải khóa học
                </h3>
                <p className="mb-4 text-gray-600">
                  Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.
                </p>
                <Button onClick={() => window.location.reload()}>
                  Thử lại
                </Button>
              </div>
            ) : coursesResponse?.courses.length === 0 ? (
              <div className="py-12 text-center">
                <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-xl font-semibold text-gray-600">
                  Không tìm thấy khóa học
                </h3>
                <p className="mb-4 text-gray-500">
                  Không có khóa học nào trong danh mục này với bộ lọc hiện tại.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Xóa tất cả bộ lọc
                </Button>
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-6 ${
                    viewMode === 'grid'
                      ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                      : 'grid-cols-1'
                  }`}
                >
                  {coursesResponse?.courses.map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {coursesResponse && coursesResponse.totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={coursesResponse.page}
                      totalPages={coursesResponse.totalPages}
                      onPageChange={page => updateFilters({ page })}
                      showInfo={{
                        total: coursesResponse.total,
                        start: (coursesResponse.page - 1) * 12 + 1,
                        end: Math.min(
                          coursesResponse.page * 12,
                          coursesResponse.total
                        ),
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
