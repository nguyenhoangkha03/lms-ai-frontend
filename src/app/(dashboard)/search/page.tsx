'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  BookOpen,
  Clock,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

import { AdvancedSearchBar } from '@/components/search/AdvancedSearchBar';
import { FacetedSearch } from '@/components/search/FacetedSearch';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchAnalyticsDashboard } from '@/components/search/SearchAnalyticsDashboard';

import { SearchFilters } from '@/lib/types/search';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SearchPageProps {}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // State management
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    categories:
      searchParams.get('categories')?.split(',').filter(Boolean) || [],
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
    authors: searchParams.get('authors')?.split(',').filter(Boolean) || [],
    instructors:
      searchParams.get('instructors')?.split(',').filter(Boolean) || [],
    levels: searchParams.get('levels')?.split(',').filter(Boolean) || [],
    languages: searchParams.get('languages')?.split(',').filter(Boolean) || [],
    sortBy: (searchParams.get('sortBy') as any) || 'relevance',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
  });

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters: SearchFilters = {
      query: searchParams.get('q') || '',
      categories:
        searchParams.get('categories')?.split(',').filter(Boolean) || [],
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
      authors: searchParams.get('authors')?.split(',').filter(Boolean) || [],
      instructors:
        searchParams.get('instructors')?.split(',').filter(Boolean) || [],
      levels: searchParams.get('levels')?.split(',').filter(Boolean) || [],
      languages:
        searchParams.get('languages')?.split(',').filter(Boolean) || [],
      sortBy: (searchParams.get('sortBy') as any) || 'relevance',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    };

    // Parse price range
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const priceIsFree = searchParams.get('priceIsFree') === 'true';
    if (priceMin || priceMax || priceIsFree) {
      urlFilters.price = {
        min: priceMin ? parseInt(priceMin) : undefined,
        max: priceMax ? parseInt(priceMax) : undefined,
        isFree: priceIsFree,
        isPaid: !priceIsFree,
      };
    }

    // Parse rating range
    const ratingMin = searchParams.get('ratingMin');
    if (ratingMin) {
      urlFilters.rating = {
        min: parseFloat(ratingMin),
      };
    }

    // Parse duration range
    const durationMin = searchParams.get('durationMin');
    const durationMax = searchParams.get('durationMax');
    if (durationMin || durationMax) {
      urlFilters.duration = {
        min: durationMin ? parseInt(durationMin) : undefined,
        max: durationMax ? parseInt(durationMax) : undefined,
      };
    }

    // Parse date range
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    if (dateFrom || dateTo) {
      urlFilters.dateRange = {
        from: dateFrom || undefined,
        to: dateTo || undefined,
      };
    }

    setFilters(urlFilters);
  }, [searchParams]);

  // Update URL when filters change
  const updateURL = (newFilters: SearchFilters) => {
    const params = new URLSearchParams();

    if (newFilters.query) params.set('q', newFilters.query);
    if (newFilters.categories?.length)
      params.set('categories', newFilters.categories.join(','));
    if (newFilters.tags?.length) params.set('tags', newFilters.tags.join(','));
    if (newFilters.authors?.length)
      params.set('authors', newFilters.authors.join(','));
    if (newFilters.instructors?.length)
      params.set('instructors', newFilters.instructors.join(','));
    if (newFilters.levels?.length)
      params.set('levels', newFilters.levels.join(','));
    if (newFilters.languages?.length)
      params.set('languages', newFilters.languages.join(','));

    if (newFilters.sortBy && newFilters.sortBy !== 'relevance') {
      params.set('sortBy', newFilters.sortBy);
    }
    if (newFilters.sortOrder && newFilters.sortOrder !== 'desc') {
      params.set('sortOrder', newFilters.sortOrder);
    }
    if (newFilters.page && newFilters.page !== 1) {
      params.set('page', newFilters.page.toString());
    }
    if (newFilters.limit && newFilters.limit !== 20) {
      params.set('limit', newFilters.limit.toString());
    }

    // Price filters
    if (newFilters.price?.min)
      params.set('priceMin', newFilters.price.min.toString());
    if (newFilters.price?.max)
      params.set('priceMax', newFilters.price.max.toString());
    if (newFilters.price?.isFree) params.set('priceIsFree', 'true');

    // Rating filters
    if (newFilters.rating?.min)
      params.set('ratingMin', newFilters.rating.min.toString());

    // Duration filters
    if (newFilters.duration?.min)
      params.set('durationMin', newFilters.duration.min.toString());
    if (newFilters.duration?.max)
      params.set('durationMax', newFilters.duration.max.toString());

    // Date range filters
    if (newFilters.dateRange?.from)
      params.set('dateFrom', newFilters.dateRange.from);
    if (newFilters.dateRange?.to) params.set('dateTo', newFilters.dateRange.to);

    const newURL = params.toString()
      ? `/search?${params.toString()}`
      : '/search';
    router.push(newURL, { scroll: false });
  };

  // Handle filters change
  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    updateURL(newFilters);
  };

  // Handle search
  const handleSearch = (query: string) => {
    const newFilters = { ...filters, query, page: 1 };
    handleFiltersChange(newFilters);

    // Show success toast for search
    if (query.trim()) {
      toast({
        title: 'Đang tìm kiếm...',
        description: `Tìm kiếm cho "${query}"`,
      });
    }
  };

  // Handle query change
  const handleQueryChange = (query: string) => {
    setFilters(prev => ({ ...prev, query }));
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      filters.categories?.length ||
      filters.tags?.length ||
      filters.authors?.length ||
      filters.instructors?.length ||
      filters.levels?.length ||
      filters.languages?.length ||
      filters.price?.min ||
      filters.price?.max ||
      filters.rating?.min ||
      filters.duration?.min ||
      filters.duration?.max ||
      filters.dateRange?.from ||
      filters.dateRange?.to
    );
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
              <Search className="h-8 w-8" />
              Tìm kiếm & Khám phá
            </h1>
            <p className="text-muted-foreground">
              Tìm kiếm khóa học, giảng viên và nội dung với công nghệ AI
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showAnalytics ? 'default' : 'outline'}
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="hidden lg:flex"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Analytics
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && 'bg-muted')}
            >
              <Filter className="mr-2 h-4 w-4" />
              Bộ lọc
              {hasActiveFilters() && (
                <Badge variant="secondary" className="ml-2">
                  {[
                    filters.categories?.length || 0,
                    filters.tags?.length || 0,
                    filters.authors?.length || 0,
                    filters.instructors?.length || 0,
                    filters.levels?.length || 0,
                    filters.languages?.length || 0,
                    filters.price ? 1 : 0,
                    filters.rating ? 1 : 0,
                    filters.duration ? 1 : 0,
                    filters.dateRange ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mx-auto w-full max-w-4xl">
          <AdvancedSearchBar
            value={filters.query || ''}
            onChange={handleQueryChange}
            onSearch={handleSearch}
            placeholder="Tìm kiếm khóa học, giảng viên, nội dung..."
            enableIntelligentSearch
            enableVoiceSearch
            context={{
              page: 'search',
              filters: filters,
            }}
          />
        </div>

        {/* Quick Search Suggestions */}
        {!filters.query && (
          <div className="mx-auto w-full max-w-4xl">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    Gợi ý tìm kiếm phổ biến:
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      'React',
                      'Python',
                      'Machine Learning',
                      'JavaScript',
                      'UI/UX Design',
                      'Node.js',
                      'Data Science',
                      'Mobile Development',
                    ].map(suggestion => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSearch(suggestion)}
                        className="text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      <span>12,000+ khóa học</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-500" />
                      <span>Cập nhật hàng ngày</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      <span>Tìm kiếm thông minh</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <SearchAnalyticsDashboard timeRange="7d" className="mb-6" />
      )}

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-6">
              <FacetedSearch
                filters={filters}
                onFiltersChange={handleFiltersChange}
                query={filters.query}
                contentType="all"
                collapsible
                showActiveCount
              />
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="min-w-0 flex-1">
          <SearchResults
            filters={filters}
            onFiltersChange={handleFiltersChange}
            showSmartDiscovery
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      </div>

      {/* Search Tips */}
      {!filters.query && !hasActiveFilters() && (
        <Card className="mx-auto max-w-4xl">
          <CardContent className="p-6">
            <h3 className="mb-3 font-semibold">Mẹo tìm kiếm hiệu quả:</h3>
            <div className="grid grid-cols-1 gap-4 text-sm text-muted-foreground md:grid-cols-2">
              <div className="space-y-2">
                <p>
                  <strong>Từ khóa cụ thể:</strong> Sử dụng từ khóa chính xác để
                  có kết quả tốt hơn
                </p>
                <p>
                  <strong>Tìm theo giảng viên:</strong> Nhập tên giảng viên để
                  xem tất cả khóa học
                </p>
                <p>
                  <strong>Lọc theo cấp độ:</strong> Chọn cấp độ phù hợp với
                  trình độ của bạn
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <strong>Sử dụng bộ lọc:</strong> Kết hợp nhiều bộ lọc để thu
                  hẹp kết quả
                </p>
                <p>
                  <strong>Tìm kiếm thông minh:</strong> AI sẽ hiểu ý định và gợi
                  ý từ khóa
                </p>
                <p>
                  <strong>Lưu tìm kiếm:</strong> Lưu các bộ lọc thường dùng để
                  tái sử dụng
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function SearchPage(props: SearchPageProps) {
  return (
    <Suspense fallback={<SearchPageLoading />}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageLoading() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Search Bar Skeleton */}
        <div className="mx-auto w-full max-w-4xl">
          <Skeleton className="h-12 w-full" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="flex gap-6">
        {/* Filters Skeleton */}
        <div className="w-80 flex-shrink-0">
          <Card>
            <CardContent className="space-y-4 p-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Skeleton */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <Skeleton className="h-48 w-full" />
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Search Tips Skeleton */}
      <Card className="mx-auto max-w-4xl">
        <CardContent className="p-6">
          <Skeleton className="mb-3 h-6 w-48" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
