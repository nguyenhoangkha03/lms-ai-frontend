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
import { CourseSorting } from '@/components/course/CourseSorting';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  Grid3X3,
  List,
  Filter,
  X,
  BookOpen,
  Search,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';

export default function StudentBrowseCoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load categories first before using in filters
  const { data: categories } = useGetCategoriesQuery();

  const filters = useMemo<CourseFilters>(() => {
    const priceParam = searchParams.get('price');
    const categorySlug = searchParams.get('category');

    // Find categoryId from slug
    const selectedCategory = categories?.find(cat => cat.slug === categorySlug);

    return {
      search: searchParams.get('search') || undefined,
      categoryId: selectedCategory?.id || undefined, // Use categoryId instead of category
      isFree:
        priceParam === 'free'
          ? true
          : priceParam === 'paid'
            ? false
            : undefined,
      minRating: searchParams.get('rating')
        ? parseInt(searchParams.get('rating')!)
        : undefined,
      level: (searchParams.get('level') as any) || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'totalEnrollments',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: 12,
      publishedOnly: true, // Only show published courses for students
    };
  }, [searchParams, categories, user?.id]);

  const {
    data: coursesResponse,
    isLoading: coursesLoading,
    error: coursesError,
  } = useGetPublicCoursesQuery(filters as any);

  // Helper to get current price filter value for UI
  const getCurrentPriceFilter = () => {
    const priceParam = searchParams.get('price');
    return priceParam || 'all';
  };

  console.log('📂 Categories Data:', categories);
  console.log('🔍 Filters:', filters);
  console.log('📚 Courses Response:', coursesResponse);

  const updateFilters = (newFilters: Partial<CourseFilters>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });

    if (!newFilters.page) {
      params.delete('page');
    }

    router.push(`/student/courses?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/student/courses');
  };

  const getActiveFiltersCount = () => {
    let count = 0;

    // Count each filter type
    if (filters.search) count++;
    if (filters.categoryId) count++;
    if (getCurrentPriceFilter() !== 'all') count++;
    if (filters.minRating) count++;
    if (filters.level) count++;

    return count;
  };

  if (coursesError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <CardContent>
            <h2 className="mb-4 text-2xl font-bold text-red-600">
              Unable to Load Courses
            </h2>
            <p className="mb-6 text-gray-600">
              An error occurred while loading data. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Compact Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100 p-8 text-slate-800 shadow-xl"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

        {/* Animated background blobs */}
        <motion.div
          className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-100/30 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-purple-100/30 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />

        <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 },
              }}
              className="flex cursor-pointer items-center gap-2 text-blue-600"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Sparkles className="h-5 w-5" />
              </motion.div>
              <span className="text-sm font-medium">
                Discover Your Next Skill
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
              className="text-4xl font-bold leading-tight lg:text-5xl"
            >
              Browse <br />
              <motion.span
                className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Courses
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
              className="text-lg text-slate-700"
            >
              Explore thousands of courses and advance your career with expert
              guidance.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              className="relative mt-6 max-w-lg"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
            >
              <motion.div
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <Search className="h-4 w-4" />
              </motion.div>
              <motion.div
                whileFocus={{ scale: 1.02 }}
                whileHover={{
                  boxShadow:
                    '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                }}
                transition={{ duration: 0.3 }}
              >
                <Input
                  placeholder="What do you want to learn?"
                  value={filters.search || ''}
                  onChange={e => updateFilters({ search: e.target.value })}
                  className="h-12 rounded-full border-0 bg-white/80 pl-11 pr-4 text-slate-800 shadow-lg backdrop-blur-sm transition-all duration-300 placeholder:text-slate-500"
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Right side with stats and CTA */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
            className="flex items-center gap-4"
          >
            <motion.div
              className="rounded-2xl bg-white/60 p-6 shadow-md backdrop-blur-xl"
              whileHover={{
                scale: 1.05,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center">
                <motion.div
                  className="text-3xl font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    delay: 0.8,
                  }}
                >
                  500+
                </motion.div>
                <motion.div
                  className="text-sm text-gray-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  Available Courses
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                size="lg"
                className="rounded-full bg-blue-500 px-8 text-white shadow-md transition-all hover:bg-blue-600"
              >
                <motion.div
                  className="flex items-center"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Start Learning
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </motion.div>
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Top Bar */}
        <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex h-10 items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>

            {/* Results Count */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BookOpen className="h-4 w-4" />
              <span className="font-medium">
                {coursesResponse?.total || 0} courses found
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg bg-gray-100 p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 px-3"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 px-3"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Sort Dropdown */}
            <CourseSorting
              value={filters.sortBy || 'popularity'}
              onChange={sortBy => updateFilters({ sortBy: sortBy as any })}
            />
          </div>
        </div>

        {/* Active Filters */}
        {getActiveFiltersCount() > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {filters.search && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {filters.search}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilters({ search: undefined })}
                />
              </Badge>
            )}
            {filters.categoryId && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category:{' '}
                {categories?.find(c => c.id === filters.categoryId)?.name}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilters({ category: undefined })}
                />
              </Badge>
            )}
            {getCurrentPriceFilter() !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Price: {getCurrentPriceFilter() === 'free' ? 'Free' : 'Paid'}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilters({ price: 'all' })}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear all
            </Button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Collapsible Sidebar */}
          {showFilters && (
            <div className="w-80 flex-shrink-0">
              <div className="sticky top-24">
                <Card className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <CourseFiltersComponent
                    filters={{
                      ...filters,
                      price: getCurrentPriceFilter() as any,
                    }}
                    categories={categories || []}
                    onFiltersChange={updateFilters}
                  />
                </Card>
              </div>
            </div>
          )}

          {/* Course Grid */}
          <div className="flex-1">
            {coursesLoading ? (
              <div
                className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                }`}
              >
                {Array.from({ length: 9 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="space-y-3 p-6">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : coursesResponse?.total === 0 ? (
              <Card className="p-12 text-center">
                <div className="mx-auto max-w-md">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    No courses found
                  </h3>
                  <p className="mb-6 text-gray-600">
                    We couldn't find any courses matching your criteria. Try
                    adjusting your filters or search terms.
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear all filters
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                <div
                  className={`grid gap-6 ${
                    viewMode === 'grid'
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                      : 'grid-cols-1'
                  }`}
                >
                  {coursesResponse?.courses.map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      viewMode={viewMode}
                      href={`/student/courses/${course.slug}`}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {coursesResponse && coursesResponse.totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
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
