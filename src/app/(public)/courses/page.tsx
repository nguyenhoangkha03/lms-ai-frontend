'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  useGetPublicCoursesQuery,
  useGetCategoriesQuery,
} from '@/lib/redux/api/course-api';
import { CourseFilters } from '@/types/course';
import { CourseCard } from '@/components/course/CourseCard';
import { CourseFilters as CourseFiltersComponent } from '@/components/course/CourseFilters';
import { SearchBar } from '@/components/course/SearchBar';
import { CourseSorting } from '@/components/course/CourseSorting';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Grid3X3,
  List,
  Filter,
  X,
  BookOpen,
  Users,
  Star,
  Clock,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';

export default function PublicCoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filters = useMemo<CourseFilters>(
    () => ({
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      isFree:
        searchParams.get('price') === 'free'
          ? true
          : searchParams.get('price') === 'paid'
            ? false
            : undefined,
      rating: searchParams.get('rating')
        ? parseInt(searchParams.get('rating')!)
        : undefined,
      duration:
        (searchParams.get('duration') as 'short' | 'medium' | 'long') ||
        undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'popularity',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: 12,
    }),
    [searchParams]
  );

  const {
    data: coursesResponse,
    isLoading: coursesLoading,
    error: coursesError,
  } = useGetPublicCoursesQuery(filters as any);

  const { data: categories } = useGetCategoriesQuery();

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

    router.push(`/courses?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/courses');
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(
      ([key, value]) =>
        value !== undefined &&
        value !== null &&
        value !== '' &&
        key !== 'page' &&
        key !== 'limit' &&
        key !== 'sortBy'
    ).length;
  };

  if (coursesError) {
    return (
      <>
        <PublicHeader />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold text-red-600">
                Unable to Load Courses
              </h2>
              <p className="mb-4 text-gray-600">
                There was an error loading the data. Please try again later.
              </p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
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
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 text-white">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center">
              <h1 className="mb-4 text-4xl font-bold">
                Discover Thousands of Courses
              </h1>
              <p className="mx-auto max-w-2xl text-xl opacity-90">
                Learn from industry experts with cutting-edge AI technology
              </p>
            </div>

            {/* Search Bar */}
            <div className="mx-auto max-w-2xl">
              <SearchBar
                value={filters.search || ''}
                onChange={search => updateFilters({ search })}
                placeholder="Search courses, topics, instructors..."
              />
            </div>

            {/* Quick Stats */}
            <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-6 md:grid-cols-4">
              <div className="text-center">
                <div className="mb-3 flex items-center justify-center">
                  <div className="rounded-full bg-white/20 p-3">
                    <BookOpen className="h-6 w-6" />
                  </div>
                </div>
                <div className="text-3xl font-bold">
                  {coursesResponse?.total || 0}
                </div>
                <p className="text-blue-100">Courses</p>
              </div>
              <div className="text-center">
                <div className="mb-3 flex items-center justify-center">
                  <div className="rounded-full bg-white/20 p-3">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
                <div className="text-3xl font-bold">50K+</div>
                <p className="text-blue-100">Students</p>
              </div>
              <div className="text-center">
                <div className="mb-3 flex items-center justify-center">
                  <div className="rounded-full bg-white/20 p-3">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                </div>
                <div className="text-3xl font-bold">500+</div>
                <p className="text-blue-100">Instructors</p>
              </div>
              <div className="text-center">
                <div className="mb-3 flex items-center justify-center">
                  <div className="rounded-full bg-white/20 p-3">
                    <Star className="h-6 w-6" />
                  </div>
                </div>
                <div className="text-3xl font-bold">4.8</div>
                <p className="text-blue-100">Average Rating</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Filters Sidebar */}
            <div
              className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}
            >
              <div className="sticky top-4 rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Filters</h3>
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
                      Clear All
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
              <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden"
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      Filters
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
                      {coursesResponse?.total || 0} courses
                    </span>
                    <CourseSorting
                      value={filters.sortBy || 'popularity'}
                      onChange={sortBy =>
                        updateFilters({ sortBy: sortBy as any })
                      }
                    />
                  </div>
                </div>

                {/* Active Filters */}
                {getActiveFiltersCount() > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                    {filters.search && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        Search: {filters.search}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => updateFilters({ search: undefined })}
                        />
                      </Badge>
                    )}
                    {filters.category && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        Category:{' '}
                        {categories?.find(c => c.slug === filters.category)?.name}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => updateFilters({ category: undefined })}
                        />
                      </Badge>
                    )}
                    {filters.isFree !== undefined && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        {filters.isFree ? 'Free' : 'Paid'}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => updateFilters({ isFree: undefined })}
                        />
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Course Grid/List */}
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
              ) : coursesResponse?.courses?.length === 0 ? (
                <div className="py-12 text-center">
                  <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                  <h3 className="mb-2 text-xl font-semibold text-gray-600">
                    No courses found
                  </h3>
                  <p className="mb-4 text-gray-500">
                    Try changing your filters or search terms
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear all filters
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
                    {coursesResponse?.courses?.map(course => (
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

          {/* CTA Section */}
          <div className="mt-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center text-white">
            <TrendingUp className="mx-auto mb-4 h-12 w-12" />
            <h2 className="mb-4 text-3xl font-bold">Ready to Start Learning?</h2>
            <p className="mb-6 text-xl opacity-90">
              Join thousands of students already learning on our platform
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Sign Up for Free
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
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