'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Grid,
  List,
  SortAsc,
  Clock,
  Star,
  Users,
  BookOpen,
  Play,
  Award,
  Eye,
  Heart,
  Share2,
  MoreHorizontal,
  AlertCircle,
  Sparkles,
  TrendingUp,
  ExternalLink,
  User,
  MessageSquare,
  FileText,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

import {
  useUniversalSearchQuery,
  useGetSmartDiscoveryQuery,
  useTrackSearchInteractionMutation,
} from '@/lib/redux/api/search-api';
import {
  SearchFilters,
  SearchResult,
  SmartDiscovery,
} from '@/lib/types/search';
import { cn, formatDate, formatDuration, formatPrice } from '@/lib/utils';

interface SearchResultsProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
  showSmartDiscovery?: boolean;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export function SearchResults({
  filters,
  onFiltersChange,
  className,
  showSmartDiscovery = true,
  viewMode = 'grid',
  onViewModeChange,
}: SearchResultsProps) {
  const [selectedResults, setSelectedResults] = useState<string[]>([]);

  // API queries
  const {
    data: searchResponse,
    isLoading: searchLoading,
    isFetching,
    error: searchError,
  } = useUniversalSearchQuery(filters, {
    skip:
      !filters.query &&
      !Object.keys(filters).some(
        key => key !== 'query' && filters[key as keyof SearchFilters]
      ),
  });

  const { data: smartDiscovery = [] } = useGetSmartDiscoveryQuery(
    {
      types: ['trending', 'recommended', 'similar'],
      limit: 3,
    },
    { skip: !showSmartDiscovery || !!filters.query }
  );

  // Mutations
  const [trackInteraction] = useTrackSearchInteractionMutation();

  // Track result interactions
  const handleResultClick = (result: SearchResult) => {
    trackInteraction({
      query: filters.query || '',
      interactionType: 'click',
      target: result.id,
      metadata: {
        result_type: result.type,
        result_position: searchResponse?.results.findIndex(
          r => r.id === result.id
        ),
      },
    });
  };

  const handleResultView = (result: SearchResult) => {
    trackInteraction({
      query: filters.query || '',
      interactionType: 'view',
      target: result.id,
      metadata: {
        result_type: result.type,
        view_mode: viewMode,
      },
    });
  };

  // Sort options
  const sortOptions = [
    { value: 'relevance', label: 'Liên quan nhất' },
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'rating', label: 'Đánh giá cao nhất' },
    { value: 'popularity', label: 'Phổ biến nhất' },
    { value: 'price_low', label: 'Giá thấp đến cao' },
    { value: 'price_high', label: 'Giá cao đến thấp' },
    { value: 'duration', label: 'Thời lượng' },
  ];

  // Handle sort change
  const handleSortChange = (sortBy: string) => {
    const [field, order] = sortBy.includes('_')
      ? sortBy.split('_')
      : [sortBy, 'desc'];

    onFiltersChange({
      ...filters,
      sortBy: field as any,
      sortOrder: order as 'asc' | 'desc',
      page: 1,
    });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    onFiltersChange({
      ...filters,
      page,
    });
  };

  // Render loading state
  if (searchLoading && !isFetching) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div
          className={cn(
            'grid gap-4',
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          )}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
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
    );
  }

  // Render error state
  if (searchError) {
    return (
      <div className={cn('space-y-6', className)}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Có lỗi khi tìm kiếm. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render empty state for no query
  if (!filters.query && !searchResponse && smartDiscovery.length === 0) {
    return (
      <div className={cn('space-y-8', className)}>
        <div className="py-12 text-center">
          <Search className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-xl font-semibold">Khám phá nội dung</h3>
          <p className="mb-6 text-muted-foreground">
            Nhập từ khóa để tìm kiếm khóa học, giảng viên và nội dung
          </p>
        </div>
      </div>
    );
  }

  // Render no results
  if (searchResponse?.results.length === 0) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              Kết quả tìm kiếm cho "{filters.query}"
            </h2>
            <Badge variant="outline">0 kết quả</Badge>
          </div>
        </div>

        <div className="py-12 text-center">
          <Search className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-xl font-semibold">Không tìm thấy kết quả</h3>
          <p className="mb-6 text-muted-foreground">
            Thử điều chỉnh từ khóa hoặc bộ lọc tìm kiếm
          </p>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>Gợi ý:</strong>
            </p>
            <ul className="space-y-1">
              <li>• Kiểm tra chính tả của từ khóa</li>
              <li>• Thử sử dụng từ khóa khác hoặc tổng quát hơn</li>
              <li>• Giảm bớt số lượng bộ lọc</li>
              <li>• Tìm kiếm theo danh mục hoặc giảng viên</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search Header */}
      {searchResponse && (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {filters.query
                ? `Kết quả cho "${filters.query}"`
                : 'Tất cả kết quả'}
            </h2>
            <Badge variant="outline">
              {searchResponse.total.toLocaleString()} kết quả
            </Badge>
            {isFetching && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600" />
                Đang cập nhật...
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <Select
              value={`${filters.sortBy || 'relevance'}${filters.sortOrder === 'asc' ? '_asc' : ''}`}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-[180px]">
                <SortAsc className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            {onViewModeChange && (
              <div className="flex items-center rounded-md border">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Smart Discovery (when no search query) */}
      {!filters.query && showSmartDiscovery && smartDiscovery.length > 0 && (
        <div className="space-y-6">
          {smartDiscovery.map(discovery => (
            <SmartDiscoverySection
              key={discovery.id}
              discovery={discovery}
              viewMode={viewMode}
              onResultClick={handleResultClick}
              onResultView={handleResultView}
            />
          ))}
        </div>
      )}

      {/* Search Results */}
      {searchResponse && searchResponse.results.length > 0 && (
        <>
          <div
            className={cn(
              'grid gap-4',
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            )}
          >
            {searchResponse.results.map(result => (
              <SearchResultCard
                key={result.id}
                result={result}
                viewMode={viewMode}
                query={filters.query || ''}
                onClick={() => handleResultClick(result)}
                onView={() => handleResultView(result)}
              />
            ))}
          </div>

          {/* Pagination */}
          {searchResponse.totalPages > 1 && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={!searchResponse.hasPrevious}
                  onClick={() => handlePageChange((filters.page || 1) - 1)}
                >
                  Trước
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({
                    length: Math.min(5, searchResponse.totalPages),
                  }).map((_, index) => {
                    const page = index + 1;
                    const currentPage = filters.page || 1;
                    const isActive = page === currentPage;

                    return (
                      <Button
                        key={page}
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  disabled={!searchResponse.hasNext}
                  onClick={() => handlePageChange((filters.page || 1) + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Search Analytics Info */}
      {searchResponse && (
        <div className="text-center text-sm text-muted-foreground">
          Tìm kiếm trong {searchResponse.searchTime}ms
        </div>
      )}
    </div>
  );
}

// Smart Discovery Section Component
interface SmartDiscoverySectionProps {
  discovery: SmartDiscovery;
  viewMode: 'grid' | 'list';
  onResultClick: (result: SearchResult) => void;
  onResultView: (result: SearchResult) => void;
}

function SmartDiscoverySection({
  discovery,
  viewMode,
  onResultClick,
  onResultView,
}: SmartDiscoverySectionProps) {
  const getDiscoveryIcon = (type: string) => {
    switch (type) {
      case 'trending':
        return <TrendingUp className="h-5 w-5 text-orange-500" />;
      case 'recommended':
        return <Sparkles className="h-5 w-5 text-purple-500" />;
      case 'featured':
        return <Star className="h-5 w-5 text-yellow-500" />;
      default:
        return <BookOpen className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {getDiscoveryIcon(discovery.type)}
        <h3 className="text-lg font-semibold">{discovery.title}</h3>
        {discovery.description && (
          <p className="text-sm text-muted-foreground">
            {discovery.description}
          </p>
        )}
      </div>

      <div
        className={cn(
          'grid gap-4',
          viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
        )}
      >
        {discovery.items.slice(0, 6).map(result => (
          <SearchResultCard
            key={result.id}
            result={result}
            viewMode={viewMode}
            onClick={() => onResultClick(result)}
            onView={() => onResultView(result)}
          />
        ))}
      </div>
    </div>
  );
}

// Search Result Card Component
interface SearchResultCardProps {
  result: SearchResult;
  viewMode: 'grid' | 'list';
  query?: string;
  onClick: () => void;
  onView: () => void;
}

function SearchResultCard({
  result,
  viewMode,
  query,
  onClick,
  onView,
}: SearchResultCardProps) {
  useEffect(() => {
    // Track view when component mounts
    onView();
  }, [onView]);

  const getResultTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="h-4 w-4" />;
      case 'instructor':
        return <User className="h-4 w-4" />;
      case 'lesson':
        return <Play className="h-4 w-4" />;
      case 'forum_post':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const highlightText = (text: string, highlight?: string) => {
    if (!highlight) return text;

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark
          key={index}
          className="rounded bg-yellow-200 px-1 text-yellow-900"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <CardContent className="p-0">
          <Link href={result.url} onClick={onClick}>
            <div className="flex gap-4 p-4">
              {/* Thumbnail */}
              {result.image && (
                <div className="flex-shrink-0">
                  <img
                    src={result.image}
                    alt={result.title}
                    className="h-18 w-24 rounded-lg object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {getResultTypeIcon(result.type)}
                    <Badge variant="outline" className="text-xs">
                      {result.type === 'course'
                        ? 'Khóa học'
                        : result.type === 'instructor'
                          ? 'Giảng viên'
                          : result.type === 'lesson'
                            ? 'Bài học'
                            : result.type === 'forum_post'
                              ? 'Diễn đàn'
                              : 'Tài liệu'}
                    </Badge>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Heart className="mr-2 h-4 w-4" />
                        Yêu thích
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="mr-2 h-4 w-4" />
                        Chia sẻ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h3 className="text-lg font-semibold leading-tight">
                  {query ? highlightText(result.title, query) : result.title}
                </h3>

                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {result.highlighted.description || result.description}
                </p>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {result.metadata.author && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={result.metadata.author.avatar} />
                        <AvatarFallback>
                          {result.metadata.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{result.metadata.author.name}</span>
                    </div>
                  )}

                  {result.metadata.stats?.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{result.metadata.stats.rating}</span>
                      {result.metadata.stats.reviewCount && (
                        <span>({result.metadata.stats.reviewCount})</span>
                      )}
                    </div>
                  )}

                  {result.metadata.stats?.enrollmentCount && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>
                        {result.metadata.stats.enrollmentCount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {result.metadata.stats?.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formatDuration(result.metadata.stats.duration)}
                      </span>
                    </div>
                  )}

                  {result.metadata.stats?.updatedAt && (
                    <span>{formatDate(result.metadata.stats.updatedAt)}</span>
                  )}
                </div>

                {/* Tags */}
                {result.metadata.tags && result.metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {result.metadata.tags.slice(0, 3).map(tag => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                    {result.metadata.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{result.metadata.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Price and Level */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.metadata.level && (
                      <Badge variant="outline">{result.metadata.level}</Badge>
                    )}
                    {result.metadata.certification && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Award className="h-3 w-3" />
                        Chứng chỉ
                      </Badge>
                    )}
                  </div>

                  {result.metadata.price && (
                    <div className="text-right">
                      {result.metadata.price.isFree ? (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          Miễn phí
                        </Badge>
                      ) : (
                        <div className="space-x-2">
                          {result.metadata.price.originalAmount &&
                            result.metadata.price.originalAmount >
                              result.metadata.price.amount && (
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(
                                  result.metadata.price.originalAmount,
                                  result.metadata.price.currency
                                )}
                              </span>
                            )}
                          <span className="text-lg font-semibold">
                            {formatPrice(
                              result.metadata.price.amount,
                              result.metadata.price.currency
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <CardContent className="p-0">
        <Link href={result.url} onClick={onClick}>
          {/* Thumbnail */}
          <div className="relative">
            {result.image ? (
              <img
                src={result.image}
                alt={result.title}
                className="h-48 w-full object-cover"
              />
            ) : (
              <div className="flex h-48 w-full items-center justify-center bg-muted">
                {getResultTypeIcon(result.type)}
              </div>
            )}

            {/* Overlay with type badge */}
            <div className="absolute left-3 top-3">
              <Badge variant="secondary" className="text-xs">
                {result.type === 'course'
                  ? 'Khóa học'
                  : result.type === 'instructor'
                    ? 'Giảng viên'
                    : result.type === 'lesson'
                      ? 'Bài học'
                      : result.type === 'forum_post'
                        ? 'Diễn đàn'
                        : 'Tài liệu'}
              </Badge>
            </div>

            {/* Play button for video content */}
            {result.type === 'lesson' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="rounded-full bg-white/90 p-3">
                  <Play className="h-6 w-6 text-black" />
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    Xem chi tiết
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Heart className="mr-2 h-4 w-4" />
                    Yêu thích
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="mr-2 h-4 w-4" />
                    Chia sẻ
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Mở trong tab mới
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3 p-4">
            <h3 className="line-clamp-2 font-semibold leading-tight">
              {query ? highlightText(result.title, query) : result.title}
            </h3>

            <p className="line-clamp-2 text-sm text-muted-foreground">
              {result.highlighted.description || result.description}
            </p>

            {/* Author */}
            {result.metadata.author && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={result.metadata.author.avatar} />
                  <AvatarFallback>
                    {result.metadata.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {result.metadata.author.name}
                </span>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {result.metadata.stats?.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{result.metadata.stats.rating}</span>
                </div>
              )}

              {result.metadata.stats?.enrollmentCount && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>
                    {result.metadata.stats.enrollmentCount.toLocaleString()}
                  </span>
                </div>
              )}

              {result.metadata.stats?.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(result.metadata.stats.duration)}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {result.metadata.tags && result.metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {result.metadata.tags.slice(0, 2).map(tag => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
                {result.metadata.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{result.metadata.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}

            {/* Footer with price and level */}
            <div className="flex items-center justify-between border-t pt-2">
              <div className="flex items-center gap-2">
                {result.metadata.level && (
                  <Badge variant="outline" className="text-xs">
                    {result.metadata.level}
                  </Badge>
                )}
                {result.metadata.certification && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 text-xs"
                  >
                    <Award className="h-3 w-3" />
                    Chứng chỉ
                  </Badge>
                )}
              </div>

              {result.metadata.price && (
                <div className="text-right">
                  {result.metadata.price.isFree ? (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      Miễn phí
                    </Badge>
                  ) : (
                    <div className="space-y-1">
                      {result.metadata.price.originalAmount &&
                        result.metadata.price.originalAmount >
                          result.metadata.price.amount && (
                          <div className="text-xs text-muted-foreground line-through">
                            {formatPrice(
                              result.metadata.price.originalAmount,
                              result.metadata.price.currency
                            )}
                          </div>
                        )}
                      <div className="font-semibold">
                        {formatPrice(
                          result.metadata.price.amount,
                          result.metadata.price.currency
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
