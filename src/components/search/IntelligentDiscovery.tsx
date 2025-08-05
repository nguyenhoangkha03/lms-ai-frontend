'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  TrendingUp,
  Star,
  Clock,
  Users,
  BookOpen,
  Play,
  ChevronRight,
  RefreshCw,
  Target,
  Zap,
  Eye,
  Filter,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

import {
  useGetSmartDiscoveryQuery,
  useGetContentRecommendationsQuery,
  useGetTrendingSearchesQuery,
  useTrackSearchInteractionMutation,
} from '@/lib/redux/api/search-api';
import { SearchResult } from '@/lib/types/search';
import { cn, formatDuration, formatPrice } from '@/lib/utils';

interface IntelligentDiscoveryProps {
  userId?: string;
  currentContent?: {
    id: string;
    type: string;
  };
  className?: string;
  limit?: number;
  showTabs?: boolean;
  autoRefresh?: boolean;
}

export function IntelligentDiscovery({
  userId,
  currentContent,
  className,
  limit = 12,
  showTabs = true,
  autoRefresh = false,
}: IntelligentDiscoveryProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // API queries
  const {
    data: smartDiscovery = [],
    isLoading: discoveryLoading,
    refetch: refetchDiscovery,
  } = useGetSmartDiscoveryQuery({
    types: ['trending', 'recommended', 'similar', 'new_arrivals', 'featured'],
    limit: 6,
    refreshCache: refreshKey > 0,
  });

  const {
    data: personalizedRecommendations,
    isLoading: recommendationsLoading,
  } = useGetContentRecommendationsQuery(
    {
      userId,
      contentId: currentContent?.id,
      contentType: currentContent?.type,
      algorithm: 'hybrid',
      limit: 8,
    },
    {
      skip: !userId,
    }
  );

  const { data: trendingSearches = [] } = useGetTrendingSearchesQuery({
    timeframe: '24h',
    limit: 10,
  });

  // Mutations
  const [trackInteraction] = useTrackSearchInteractionMutation();

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(
      () => {
        setRefreshKey(prev => prev + 1);
      },
      5 * 60 * 1000
    ); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Handle content interaction
  const handleContentClick = (content: SearchResult, source: string) => {
    trackInteraction({
      query: '',
      interactionType: 'click',
      target: content.id,
      metadata: {
        source,
        content_type: content.type,
        discovery_algorithm: source,
      },
    });
  };

  // Manual refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetchDiscovery();
  };

  // Get discovery by type
  const getDiscoveryByType = (type: string) => {
    return smartDiscovery.find(d => d.type === type);
  };

  // Filter content by category
  const filterContentByCategory = (items: SearchResult[]) => {
    if (selectedCategory === 'all') return items;
    return items.filter(
      item =>
        item.metadata.category?.name.toLowerCase() ===
        selectedCategory.toLowerCase()
    );
  };

  const categories = [
    { id: 'all', name: 'Tất cả', icon: Filter },
    { id: 'programming', name: 'Lập trình', icon: BookOpen },
    { id: 'design', name: 'Thiết kế', icon: Sparkles },
    { id: 'business', name: 'Kinh doanh', icon: Target },
    { id: 'marketing', name: 'Marketing', icon: TrendingUp },
  ];

  if (discoveryLoading && !smartDiscovery.length) {
    return <IntelligentDiscoverySkeleton className={className} />;
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Khám phá thông minh
          </h2>
          <p className="text-muted-foreground">
            Nội dung được cá nhân hóa dựa trên AI và machine learning
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={discoveryLoading}
        >
          <RefreshCw
            className={cn('mr-2 h-4 w-4', discoveryLoading && 'animate-spin')}
          />
          Làm mới
        </Button>
      </div>

      {/* Category Filter */}
      {showTabs && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex-shrink-0"
              >
                <Icon className="mr-2 h-4 w-4" />
                {category.name}
              </Button>
            );
          })}
        </div>
      )}

      {/* Personalized Recommendations */}
      {userId && personalizedRecommendations && (
        <DiscoverySection
          title="Đề xuất cho bạn"
          description="Dựa trên lịch sử học tập và sở thích của bạn"
          icon={Target}
          iconColor="text-blue-600"
          items={filterContentByCategory(personalizedRecommendations.results)}
          loading={recommendationsLoading}
          onItemClick={item => handleContentClick(item, 'personalized')}
          showViewAll
          viewAllHref="/recommendations"
        />
      )}

      {/* Trending Content */}
      {getDiscoveryByType('trending') && (
        <DiscoverySection
          title="Đang thịnh hành"
          description="Nội dung được quan tâm nhiều nhất trong tuần"
          icon={TrendingUp}
          iconColor="text-orange-600"
          items={filterContentByCategory(getDiscoveryByType('trending')!.items)}
          onItemClick={item => handleContentClick(item, 'trending')}
          showViewAll
          viewAllHref="/trending"
        />
      )}

      {/* Featured Content */}
      {getDiscoveryByType('featured') && (
        <DiscoverySection
          title="Nổi bật"
          description="Những khóa học được biên tập viên lựa chọn"
          icon={Star}
          iconColor="text-yellow-600"
          items={filterContentByCategory(getDiscoveryByType('featured')!.items)}
          onItemClick={item => handleContentClick(item, 'featured')}
          showViewAll
          viewAllHref="/featured"
        />
      )}

      {/* New Arrivals */}
      {getDiscoveryByType('new_arrivals') && (
        <DiscoverySection
          title="Mới ra mắt"
          description="Những khóa học mới nhất được thêm vào hệ thống"
          icon={Zap}
          iconColor="text-green-600"
          items={filterContentByCategory(
            getDiscoveryByType('new_arrivals')!.items
          )}
          onItemClick={item => handleContentClick(item, 'new_arrivals')}
          showViewAll
          viewAllHref="/new"
        />
      )}

      {/* Similar Content */}
      {currentContent && getDiscoveryByType('similar') && (
        <DiscoverySection
          title="Nội dung tương tự"
          description="Dựa trên nội dung bạn đang xem"
          icon={Eye}
          iconColor="text-purple-600"
          items={filterContentByCategory(getDiscoveryByType('similar')!.items)}
          onItemClick={item => handleContentClick(item, 'similar')}
          showViewAll
          viewAllHref={`/similar?content=${currentContent.id}`}
        />
      )}

      {/* Trending Searches */}
      {trendingSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Tìm kiếm thịnh hành
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              {trendingSearches.slice(0, 10).map((search, index) => (
                <Link
                  key={search.id}
                  href={`/search?q=${encodeURIComponent(search.text)}`}
                  className="group"
                >
                  <div className="flex items-center gap-2 rounded-lg border p-3 transition-colors hover:border-orange-300 hover:bg-orange-50">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600 group-hover:bg-orange-200">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {search.text}
                      </p>
                      {search.count && (
                        <p className="text-xs text-muted-foreground">
                          {search.count.toLocaleString()} lượt
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discovery Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Thông tin khám phá
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-1 text-2xl font-bold text-blue-600">
                {smartDiscovery.reduce((sum, d) => sum + d.items.length, 0)}
              </div>
              <p className="text-sm text-muted-foreground">
                Nội dung được đề xuất
              </p>
            </div>

            <div className="text-center">
              <div className="mb-1 text-2xl font-bold text-green-600">
                {
                  smartDiscovery.filter(
                    d => d.metadata.confidence && d.metadata.confidence > 0.8
                  ).length
                }
              </div>
              <p className="text-sm text-muted-foreground">
                Đề xuất độ tin cậy cao
              </p>
            </div>

            <div className="text-center">
              <div className="mb-1 text-2xl font-bold text-purple-600">
                {smartDiscovery.length}
              </div>
              <p className="text-sm text-muted-foreground">
                Thuật toán khác nhau
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <h4 className="mb-1 font-semibold text-blue-900">
                  Cách AI hoạt động
                </h4>
                <p className="text-sm text-blue-800">
                  Hệ thống sử dụng machine learning để phân tích hành vi học
                  tập, sở thích và mục tiêu của bạn. Kết hợp với collaborative
                  filtering và content-based filtering để đưa ra những đề xuất
                  phù hợp nhất.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Discovery Section Component
interface DiscoverySectionProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  items: SearchResult[];
  loading?: boolean;
  onItemClick: (item: SearchResult) => void;
  showViewAll?: boolean;
  viewAllHref?: string;
}

function DiscoverySection({
  title,
  description,
  icon: Icon,
  iconColor,
  items,
  loading = false,
  onItemClick,
  showViewAll = false,
  viewAllHref = '#',
}: DiscoverySectionProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon className={cn('h-5 w-5', iconColor)} />
              {title}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>

          {showViewAll && (
            <Link href={viewAllHref}>
              <Button variant="outline" size="sm">
                Xem tất cả
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Carousel className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {items.slice(0, 8).map(item => (
              <CarouselItem
                key={item.id}
                className="basis-full pl-2 sm:basis-1/2 md:basis-1/3 md:pl-4 lg:basis-1/4"
              >
                <DiscoveryItemCard
                  item={item}
                  onClick={() => onItemClick(item)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </CardContent>
    </Card>
  );
}

// Discovery Item Card Component
interface DiscoveryItemCardProps {
  item: SearchResult;
  onClick: () => void;
}

function DiscoveryItemCard({ item, onClick }: DiscoveryItemCardProps) {
  return (
    <Link href={item.url} onClick={onClick}>
      <Card className="group h-full transition-shadow hover:shadow-lg">
        <CardContent className="p-0">
          {/* Thumbnail */}
          <div className="relative">
            {item.image ? (
              <img
                src={item.image}
                alt={item.title}
                className="h-32 w-full rounded-t-lg object-cover"
              />
            ) : (
              <div className="flex h-32 w-full items-center justify-center rounded-t-lg bg-muted">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
            )}

            {/* Type badge */}
            <div className="absolute left-2 top-2">
              <Badge variant="secondary" className="text-xs">
                {item.type === 'course'
                  ? 'Khóa học'
                  : item.type === 'lesson'
                    ? 'Bài học'
                    : item.type === 'instructor'
                      ? 'Gi강사'
                      : 'Nội dung'}
              </Badge>
            </div>

            {/* Play button for video content */}
            {item.type === 'lesson' && (
              <div className="absolute inset-0 flex items-center justify-center rounded-t-lg bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="rounded-full bg-white/90 p-2">
                  <Play className="h-4 w-4 text-black" />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2 p-3">
            <h4 className="line-clamp-2 text-sm font-semibold leading-tight">
              {item.title}
            </h4>

            {/* Author */}
            {item.metadata.author && (
              <div className="flex items-center gap-2">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={item.metadata.author.avatar} />
                  <AvatarFallback className="text-xs">
                    {item.metadata.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-xs text-muted-foreground">
                  {item.metadata.author.name}
                </span>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                {item.metadata.stats?.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{item.metadata.stats.rating}</span>
                  </div>
                )}

                {item.metadata.stats?.enrollmentCount && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>
                      {item.metadata.stats.enrollmentCount.toLocaleString()}
                    </span>
                  </div>
                )}

                {item.metadata.stats?.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDuration(item.metadata.stats.duration)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price */}
            {item.metadata.price && (
              <div className="flex items-center justify-between">
                {item.metadata.level && (
                  <Badge variant="outline" className="text-xs">
                    {item.metadata.level}
                  </Badge>
                )}

                <div>
                  {item.metadata.price.isFree ? (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-xs text-green-800"
                    >
                      Miễn phí
                    </Badge>
                  ) : (
                    <span className="text-sm font-semibold">
                      {formatPrice(
                        item.metadata.price.amount,
                        item.metadata.price.currency
                      )}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Loading skeleton
function IntelligentDiscoverySkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-3">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
