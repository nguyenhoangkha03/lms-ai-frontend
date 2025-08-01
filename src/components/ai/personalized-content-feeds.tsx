'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Play,
  FileText,
  Headphones,
  ExternalLink,
  Star,
  Clock,
  Users,
  TrendingUp,
  Sparkles,
  Heart,
  Bookmark,
  Share2,
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  RefreshCw,
  Award,
  Zap,
  Target,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  useGetPersonalizedContentFeedsQuery,
  useGenerateContentRecommendationsMutation,
} from '@/lib/redux/api/ai-recommendation-api';
import {
  PersonalizedContentFeed,
  ContentFeedItem,
} from '@/lib/types/ai-recommendation';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const contentTypeIcons = {
  course: BookOpen,
  lesson: Play,
  assessment: FileText,
  article: FileText,
  video: Play,
  podcast: Headphones,
  book: BookOpen,
};

const contentTypeColors = {
  course: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  lesson: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  assessment: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
  article: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
  video: 'text-red-600 bg-red-100 dark:bg-red-900/20',
  podcast: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20',
  book: 'text-teal-600 bg-teal-100 dark:bg-teal-900/20',
};

const difficultyColors = {
  beginner: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  intermediate: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
  advanced: 'text-red-600 bg-red-100 dark:bg-red-900/20',
};

interface PersonalizedContentFeedsProps {
  className?: string;
  feedTypes?: string[];
  maxItems?: number;
  showFilters?: boolean;
  layout?: 'grid' | 'list';
  autoRefresh?: boolean;
}

export const PersonalizedContentFeeds: React.FC<
  PersonalizedContentFeedsProps
> = ({
  className,
  feedTypes = ['discovery', 'continue_learning', 'recommended', 'trending'],
  maxItems = 12,
  showFilters = true,
  layout: initialLayout = 'grid',
  autoRefresh = true,
}) => {
  const router = useRouter();
  const { toast } = useToast();

  // Local state
  const [activeFeed, setActiveFeed] = useState(feedTypes[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [layout, setLayout] = useState<'grid' | 'list'>(initialLayout);
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(
    new Set()
  );
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  // API hooks
  const {
    data: contentFeeds = [],
    isLoading,
    isError,
    refetch,
  } = useGetPersonalizedContentFeedsQuery({
    feedType: activeFeed,
    limit: maxItems,
  });

  const [generateContent] = useGenerateContentRecommendationsMutation();

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refetch();
      }, 300000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refetch]);

  // Get current feed
  const currentFeed = contentFeeds.find(feed => feed.feedType === activeFeed);
  const feedItems = currentFeed?.items || [];

  // Filter items
  const filteredItems = feedItems
    .filter(item => {
      if (
        selectedDifficulty !== 'all' &&
        item.difficulty !== selectedDifficulty
      ) {
        return false;
      }
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false;
      }
      return true;
    })
    .slice(0, maxItems);

  // Handle item click
  const handleItemClick = (item: ContentFeedItem) => {
    const { metadata } = item;

    switch (item.type) {
      case 'course':
        if (metadata.courseId) {
          router.push(`/courses/${metadata.courseId}`);
        }
        break;
      case 'lesson':
        if (metadata.courseId && metadata.lessonId) {
          router.push(
            `/student/courses/${metadata.courseId}/lessons/${metadata.lessonId}`
          );
        }
        break;
      case 'assessment':
        if (metadata.assessmentId) {
          router.push(`/student/assessments/${metadata.assessmentId}/take`);
        }
        break;
      default:
        if (metadata.url) {
          if (metadata.url.startsWith('http')) {
            window.open(metadata.url, '_blank');
          } else {
            router.push(metadata.url);
          }
        }
    }
  };

  // Handle bookmark
  const handleBookmark = (itemId: string) => {
    const newBookmarked = new Set(bookmarkedItems);
    if (newBookmarked.has(itemId)) {
      newBookmarked.delete(itemId);
      toast({
        title: 'Removed from bookmarks',
        description: 'Content removed from your saved items',
      });
    } else {
      newBookmarked.add(itemId);
      toast({
        title: 'Added to bookmarks',
        description: 'Content saved to your bookmarks',
      });
    }
    setBookmarkedItems(newBookmarked);
  };

  // Handle like
  const handleLike = (itemId: string) => {
    const newLiked = new Set(likedItems);
    if (newLiked.has(itemId)) {
      newLiked.delete(itemId);
    } else {
      newLiked.add(itemId);
      toast({
        title: 'Thanks for your feedback!',
        description: 'This helps us improve recommendations',
      });
    }
    setLikedItems(newLiked);
  };

  // Get feed display info
  const getFeedDisplayInfo = (feedType: string) => {
    switch (feedType) {
      case 'discovery':
        return {
          title: 'Discover New Content',
          description: 'Explore new topics and expand your knowledge',
          icon: Target,
          color: 'text-blue-600 bg-blue-100',
        };
      case 'continue_learning':
        return {
          title: 'Continue Learning',
          description: 'Pick up where you left off',
          icon: Play,
          color: 'text-green-600 bg-green-100',
        };
      case 'recommended':
        return {
          title: 'Recommended for You',
          description: 'Personalized content based on your interests',
          icon: Sparkles,
          color: 'text-purple-600 bg-purple-100',
        };
      case 'trending':
        return {
          title: 'Trending Now',
          description: 'Popular content among learners like you',
          icon: TrendingUp,
          color: 'text-orange-600 bg-orange-100',
        };
      default:
        return {
          title: 'Content Feed',
          description: 'Curated content for you',
          icon: BookOpen,
          color: 'text-gray-600 bg-gray-100',
        };
    }
  };

  // Render content item
  const renderContentItem = (item: ContentFeedItem, index: number) => {
    const IconComponent = contentTypeIcons[item.type] || BookOpen;
    const isBookmarked = bookmarkedItems.has(item.id);
    const isLiked = likedItems.has(item.id);

    const cardContent = (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={cn(
          'group relative overflow-hidden rounded-xl border transition-all duration-300',
          'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10',
          'cursor-pointer bg-card'
        )}
        onClick={() => handleItemClick(item)}
      >
        {/* Thumbnail/Icon */}
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          {item.thumbnailUrl ? (
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div
                className={cn(
                  'rounded-full p-4',
                  contentTypeColors[item.type] || 'bg-gray-100 text-gray-600'
                )}
              >
                <IconComponent className="h-8 w-8" />
              </div>
            </div>
          )}

          {/* Overlay actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="absolute right-2 top-2 flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 w-8 p-0 text-white hover:bg-white/20',
                  isBookmarked && 'text-yellow-400'
                )}
                onClick={e => {
                  e.stopPropagation();
                  handleBookmark(item.id);
                }}
              >
                <Bookmark
                  className={cn('h-4 w-4', isBookmarked && 'fill-current')}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 w-8 p-0 text-white hover:bg-white/20',
                  isLiked && 'text-red-400'
                )}
                onClick={e => {
                  e.stopPropagation();
                  handleLike(item.id);
                }}
              >
                <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
              </Button>
            </div>

            {/* Play/View button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                size="sm"
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
              >
                <Play className="mr-2 h-4 w-4" />
                {item.type === 'video' || item.type === 'podcast'
                  ? 'Play'
                  : 'View'}
              </Button>
            </div>
          </div>

          {/* Content type badge */}
          <div className="absolute left-2 top-2">
            <Badge
              variant="secondary"
              className={cn(
                'text-xs backdrop-blur-sm',
                contentTypeColors[item.type] || 'bg-gray-100 text-gray-600'
              )}
            >
              {item.type}
            </Badge>
          </div>

          {/* Premium indicator */}
          {item.metadata.isPremium && (
            <div className="absolute bottom-2 right-2">
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
              >
                <Award className="mr-1 h-3 w-3" />
                Premium
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Header */}
          <div className="mb-3">
            <h3 className="mb-1 line-clamp-2 font-semibold transition-colors group-hover:text-primary">
              {item.title}
            </h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {item.description}
            </p>
          </div>

          {/* Author */}
          {item.author && (
            <div className="mb-3 flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="" />
                <AvatarFallback className="text-xs">
                  {item.author
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {item.author}
              </span>
            </div>
          )}

          {/* Metadata */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn('text-xs', difficultyColors[item.difficulty])}
            >
              {item.difficulty}
            </Badge>

            {item.duration && (
              <Badge variant="outline" className="text-xs">
                <Clock className="mr-1 h-3 w-3" />
                {item.duration} min
              </Badge>
            )}

            {item.rating && (
              <Badge variant="outline" className="text-xs">
                <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                {item.rating.toFixed(1)}
              </Badge>
            )}

            {item.enrollmentCount && (
              <Badge variant="outline" className="text-xs">
                <Users className="mr-1 h-3 w-3" />
                {item.enrollmentCount.toLocaleString()}
              </Badge>
            )}
          </div>

          {/* AI Reasoning */}
          <div className="mb-3 rounded-lg bg-muted/50 p-3">
            <div className="flex items-start space-x-2">
              <Sparkles className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Why recommended:
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {item.personalizedReason}
                </p>
              </div>
            </div>
          </div>

          {/* Relevance Score */}
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Relevance Score
              </span>
              <span className="text-xs font-medium text-primary">
                {Math.round(item.relevanceScore * 100)}%
              </span>
            </div>
            <Progress value={item.relevanceScore * 100} className="h-1" />
          </div>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-muted text-xs hover:bg-muted/80"
                >
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="secondary" className="bg-muted text-xs">
                  +{item.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Price */}
          {item.metadata.price !== undefined && (
            <div className="mb-3">
              {item.metadata.price === 0 ? (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Free
                </Badge>
              ) : (
                <span className="text-lg font-bold text-primary">
                  ${item.metadata.price}
                </span>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <Button
              size="sm"
              className="mr-2 flex-1"
              onClick={e => {
                e.stopPropagation();
                handleItemClick(item);
              }}
            >
              <IconComponent className="mr-2 h-4 w-4" />
              {item.type === 'course' ? 'Enroll' : 'Start'}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                  <Share2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in new tab
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBookmark(item.id)}>
                  <Bookmark className="mr-2 h-4 w-4" />
                  {isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Hover effect */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </motion.div>
    );

    return layout === 'grid' ? (
      <div key={item.id} className="w-full">
        {cardContent}
      </div>
    ) : (
      <div key={item.id} className="w-full">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            'group flex cursor-pointer items-center space-x-4 rounded-lg border p-4 transition-all duration-200',
            'bg-card hover:border-primary/30 hover:shadow-md'
          )}
          onClick={() => handleItemClick(item)}
        >
          {/* Thumbnail */}
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
            {item.thumbnailUrl ? (
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className={cn(
                  'flex h-full items-center justify-center',
                  contentTypeColors[item.type] || 'bg-gray-100 text-gray-600'
                )}
              >
                <IconComponent className="h-6 w-6" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-start justify-between">
              <h3 className="line-clamp-1 font-semibold transition-colors group-hover:text-primary">
                {item.title}
              </h3>
              <div className="ml-2 flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-6 w-6 p-0',
                    isBookmarked && 'text-yellow-500'
                  )}
                  onClick={e => {
                    e.stopPropagation();
                    handleBookmark(item.id);
                  }}
                >
                  <Bookmark
                    className={cn('h-3 w-3', isBookmarked && 'fill-current')}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn('h-6 w-6 p-0', isLiked && 'text-red-500')}
                  onClick={e => {
                    e.stopPropagation();
                    handleLike(item.id);
                  }}
                >
                  <Heart className={cn('h-3 w-3', isLiked && 'fill-current')} />
                </Button>
              </div>
            </div>

            <p className="mb-2 line-clamp-1 text-sm text-muted-foreground">
              {item.description}
            </p>

            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className={cn('text-xs', difficultyColors[item.difficulty])}
              >
                {item.difficulty}
              </Badge>

              {item.duration && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="mr-1 h-3 w-3" />
                  {item.duration}m
                </Badge>
              )}

              {item.rating && (
                <Badge variant="outline" className="text-xs">
                  <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {item.rating.toFixed(1)}
                </Badge>
              )}

              <div className="flex-1" />

              <span className="text-xs font-medium text-primary">
                {Math.round(item.relevanceScore * 100)}% match
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 animate-pulse text-primary" />
            </div>
            <div>
              <CardTitle>Personalized Content</CardTitle>
              <CardDescription>Loading your content feeds...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              'grid gap-4',
              layout === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            )}
          >
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="mb-4 aspect-video rounded-lg bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !currentFeed) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                <Sparkles className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <CardTitle>Personalized Content</CardTitle>
                <CardDescription>Failed to load content feeds</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  const feedInfo = getFeedDisplayInfo(activeFeed);
  const FeedIcon = feedInfo.icon;

  return (
    <TooltipProvider>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn('rounded-lg p-2', feedInfo.color)}>
                <FeedIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">{feedInfo.title}</CardTitle>
                <CardDescription>{feedInfo.description}</CardDescription>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Layout toggle */}
              <div className="flex rounded-lg border p-1">
                <Button
                  variant={layout === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setLayout('grid')}
                >
                  <Grid3X3 className="h-3 w-3" />
                </Button>
                <Button
                  variant={layout === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setLayout('list')}
                >
                  <List className="h-3 w-3" />
                </Button>
              </div>

              {/* Filters */}
              {showFilters && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="p-2">
                      <p className="mb-2 text-sm font-medium">Difficulty</p>
                      <div className="space-y-1">
                        {['all', 'beginner', 'intermediate', 'advanced'].map(
                          level => (
                            <Button
                              key={level}
                              variant={
                                selectedDifficulty === level
                                  ? 'default'
                                  : 'ghost'
                              }
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => setSelectedDifficulty(level)}
                            >
                              {level === 'all'
                                ? 'All Levels'
                                : level.charAt(0).toUpperCase() +
                                  level.slice(1)}
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <p className="mb-2 text-sm font-medium">Content Type</p>
                      <div className="space-y-1">
                        {[
                          'all',
                          'course',
                          'lesson',
                          'video',
                          'article',
                          'assessment',
                        ].map(type => (
                          <Button
                            key={type}
                            variant={
                              selectedType === type ? 'default' : 'ghost'
                            }
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => setSelectedType(type)}
                          >
                            {type === 'all'
                              ? 'All Types'
                              : type.charAt(0).toUpperCase() + type.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Feed tabs */}
          <Tabs
            value={activeFeed}
            onValueChange={setActiveFeed}
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-4">
              {feedTypes.map(feedType => {
                const info = getFeedDisplayInfo(feedType);
                const feedData = contentFeeds.find(
                  f => f.feedType === feedType
                );
                return (
                  <TabsTrigger
                    key={feedType}
                    value={feedType}
                    className="relative"
                  >
                    <info.icon className="mr-2 h-4 w-4" />
                    {info.title.split(' ')[0]}
                    {feedData && feedData.items.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-1 h-4 px-1 text-xs"
                      >
                        {feedData.items.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* Feed metadata */}
          {currentFeed && (
            <div className="mb-6 rounded-lg bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className="font-medium text-muted-foreground">
                      Algorithm:
                    </span>
                    <span className="ml-2 text-foreground">
                      {currentFeed.metadata.algorithm}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-muted-foreground">
                      Confidence:
                    </span>
                    <span className="ml-2 text-foreground">
                      {Math.round(currentFeed.metadata.confidence * 100)}%
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-muted-foreground">
                      Last Updated:
                    </span>
                    <span className="ml-2 text-foreground">
                      {new Date(
                        currentFeed.metadata.lastUpdated
                      ).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateContent({ feedType: activeFeed })}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Refresh Feed
                </Button>
              </div>
            </div>
          )}

          {/* Content grid */}
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <FeedIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-medium">No content available</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Try adjusting your filters or explore other content types
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDifficulty('all');
                  setSelectedType('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  'grid gap-6',
                  layout === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1'
                )}
              >
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item, index) =>
                    renderContentItem(item, index)
                  )}
                </AnimatePresence>
              </div>

              {/* Load more */}
              {filteredItems.length < feedItems.length && (
                <div className="mt-8 text-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Implement load more functionality
                    }}
                  >
                    Load More Content
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
