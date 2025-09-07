'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  PlayCircle,
  User,
  MessageCircle,
  FileText,
  Clock,
  Star,
  TrendingUp,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Grid3x3,
  List,
  ChevronDown,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/enhanced-button';
import { SearchInput } from '@/components/ui/enhanced-input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useDebounce } from '@/hooks/use-debounce';
import { useSearchCoursesQuery } from '@/lib/redux/api/course-api';

interface SearchResult {
  id: string;
  title: string;
  type: 'course' | 'lesson' | 'user' | 'forum' | 'document';
  description?: string;
  thumbnail?: string;
  url: string;
  metadata?: {
    instructor?: string;
    duration?: string;
    rating?: number;
    enrollments?: number;
    category?: string;
    tags?: string[];
  };
}

interface SearchFilters {
  type: string[];
  category: string;
  rating: string;
  duration: string;
}

const searchTypes = [
  { value: 'course', label: 'Courses', icon: BookOpen },
  { value: 'lesson', label: 'Lessons', icon: PlayCircle },
  { value: 'user', label: 'Instructors', icon: User },
  { value: 'forum', label: 'Discussions', icon: MessageCircle },
  { value: 'document', label: 'Resources', icon: FileText },
];

const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState<SearchFilters>({
    type: [],
    category: '',
    rating: '',
    duration: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);

  // Use real API for course search
  const { data: searchResponse, isLoading: apiLoading } = useSearchCoursesQuery(
    {
      search: debouncedQuery,
      category: filters.category || undefined,
      level: filters.rating ? 'intermediate' : undefined, // Map rating to level for now
      limit: 20,
      page: 1,
    },
    {
      skip: !debouncedQuery.trim(),
    }
  );

  // Transform API results and add mock results for other types
  useEffect(() => {
    if (searchResponse?.courses) {
      const transformedResults: SearchResult[] = [];

      // Add real course results
      const courseResults = searchResponse.courses
        .filter(course => {
          const matchesTypeFilter = 
            filters.type.length === 0 || 
            filters.type.includes('course');
          return matchesTypeFilter;
        })
        .map(course => ({
          id: course.id,
          title: course.title,
          type: 'course' as const,
          description: course.description,
          thumbnail: course.thumbnail,
          url: `/student/courses/${course.slug}`,
          metadata: {
            instructor: course.instructor?.name,
            duration: course.duration ? `${Math.floor(course.duration / 60)}h ${course.duration % 60}m` : undefined,
            rating: course.rating,
            enrollments: course.enrollmentCount,
            category: course.category?.name,
            tags: course.tags || []
          }
        }));

      transformedResults.push(...courseResults);

      // Add mock results for other content types based on search query
      if (!filters.type.length || filters.type.includes('lesson')) {
        if (debouncedQuery.toLowerCase().includes('javascript') || debouncedQuery.toLowerCase().includes('js')) {
          transformedResults.push({
            id: 'lesson-js-1',
            title: `JavaScript Variables and Data Types`,
            type: 'lesson',
            description: 'Understanding primitive and reference types in JavaScript',
            url: '/student/lessons/js-variables',
            metadata: {
              duration: '25m',
              category: 'JavaScript Fundamentals',
              tags: ['Variables', 'Data Types', 'Fundamentals']
            }
          });
        }
      }

      if (!filters.type.length || filters.type.includes('user')) {
        transformedResults.push({
          id: 'instructor-1',
          title: `Expert Instructor in ${debouncedQuery}`,
          type: 'user',
          description: `Professional instructor specializing in ${debouncedQuery} with years of industry experience`,
          thumbnail: '/api/placeholder/100/100',
          url: '/instructors/expert',
          metadata: {
            category: 'Instructor',
            tags: [debouncedQuery, 'Expert', 'Professional']
          }
        });
      }

      if (!filters.type.length || filters.type.includes('forum')) {
        transformedResults.push({
          id: 'forum-1',
          title: `${debouncedQuery} Discussion & Best Practices`,
          type: 'forum',
          description: `Community discussion about ${debouncedQuery} best practices and tips`,
          url: `/student/forum/${debouncedQuery.toLowerCase().replace(/\s+/g, '-')}-discussion`,
          metadata: {
            category: 'Community',
            tags: [debouncedQuery, 'Discussion', 'Best Practices']
          }
        });
      }

      if (!filters.type.length || filters.type.includes('document')) {
        transformedResults.push({
          id: 'document-1',
          title: `${debouncedQuery} Reference Guide`,
          type: 'document',
          description: `Comprehensive reference guide and cheat sheet for ${debouncedQuery}`,
          url: `/resources/${debouncedQuery.toLowerCase().replace(/\s+/g, '-')}-guide.pdf`,
          metadata: {
            category: 'Reference',
            tags: [debouncedQuery, 'Guide', 'Reference']
          }
        });
      }

      setResults(transformedResults.slice(0, 20));
      setIsLoading(false);
    } else if (!debouncedQuery.trim()) {
      setResults([]);
      setIsLoading(false);
    } else {
      setIsLoading(apiLoading);
    }
  }, [searchResponse, debouncedQuery, filters, apiLoading]);

  // Update URL when query changes
  useEffect(() => {
    if (query !== initialQuery) {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set('q', query);
      } else {
        params.delete('q');
      }
      router.replace(`/student/search?${params.toString()}`, { scroll: false });
    }
  }, [query, initialQuery, searchParams, router]);

  const handleFilterChange = (filterType: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: [],
      category: '',
      rating: '',
      duration: '',
    });
  };

  const getResultIcon = (type: SearchResult['type']) => {
    const typeConfig = searchTypes.find(t => t.value === type);
    if (!typeConfig) return <Search className="h-5 w-5 text-gray-400" />;
    
    const Icon = typeConfig.icon;
    const colors = {
      course: 'text-blue-600',
      lesson: 'text-green-600',
      user: 'text-purple-600',
      forum: 'text-orange-600',
      document: 'text-gray-600'
    };
    
    return <Icon className={cn('h-5 w-5', colors[type])} />;
  };

  const getResultTypeBadge = (type: SearchResult['type']) => {
    const colors = {
      course: 'bg-blue-100 text-blue-700',
      lesson: 'bg-green-100 text-green-700',
      user: 'bg-purple-100 text-purple-700',
      forum: 'bg-orange-100 text-orange-700',
      document: 'bg-gray-100 text-gray-700'
    };
    return colors[type] || colors.document;
  };

  const activeFiltersCount = 
    filters.type.length + 
    (filters.category ? 1 : 0) + 
    (filters.rating ? 1 : 0) + 
    (filters.duration ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Search Results
              </h1>
              {query && (
                <p className="text-gray-600">
                  Results for "{query}" • {results.length} found
                </p>
              )}
            </div>
            
            {/* Search Input */}
            <div className="w-full max-w-md">
              <SearchInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for anything..."
                className="w-full"
              />
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              'w-full lg:w-80',
              !showFilters && 'hidden lg:block'
            )}
          >
            <Card className="sticky top-6">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-auto p-1 text-xs"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Content Type */}
                <div>
                  <h4 className="mb-3 text-sm font-medium">Content Type</h4>
                  <div className="space-y-2">
                    {searchTypes.map(({ value, label, icon: Icon }) => (
                      <label key={value} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.type.includes(value)}
                          onChange={(e) => {
                            const newTypes = e.target.checked
                              ? [...filters.type, value]
                              : filters.type.filter(t => t !== value);
                            handleFilterChange('type', newTypes);
                          }}
                          className="rounded border-gray-300"
                        />
                        <Icon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <h4 className="mb-3 text-sm font-medium">Rating</h4>
                  <div className="space-y-2">
                    {[4.5, 4.0, 3.5, 3.0].map(rating => (
                      <label key={rating} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="rating"
                          value={rating}
                          checked={filters.rating === rating.toString()}
                          onChange={(e) => handleFilterChange('rating', e.target.value)}
                          className="border-gray-300"
                        />
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{rating}+ stars</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <div className="flex-1">
            {/* Controls */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Mobile filter toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>

                {/* Active filters */}
                {activeFiltersCount > 0 && (
                  <div className="hidden gap-2 sm:flex">
                    {filters.type.map(type => (
                      <Badge key={type} variant="secondary" className="gap-1">
                        {searchTypes.find(t => t.value === type)?.label}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => {
                            handleFilterChange('type', filters.type.filter(t => t !== type));
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Sort */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      {sortOptions.find(opt => opt.value === sortBy)?.label}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {sortOptions.map(option => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View Mode */}
                <div className="flex rounded-lg border">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results */}
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-12"
                >
                  <div className="flex items-center gap-3 text-gray-500">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <span>Searching...</span>
                  </div>
                </motion.div>
              ) : results.length > 0 ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    viewMode === 'grid'
                      ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
                      : 'space-y-4'
                  )}
                >
                  {results.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        'cursor-pointer transition-transform hover:scale-[1.02]',
                        viewMode === 'list' && 'w-full'
                      )}
                      onClick={() => router.push(result.url)}
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        <CardContent className={cn(
                          'p-6',
                          viewMode === 'list' && 'flex gap-4'
                        )}>
                          {result.thumbnail && (
                            <div className={cn(
                              viewMode === 'grid' ? 'mb-4 aspect-video' : 'w-24 h-24 flex-shrink-0',
                              'overflow-hidden rounded-lg bg-gray-100'
                            )}>
                              {/* Placeholder for thumbnail */}
                              <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-300" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="mb-3 flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {getResultIcon(result.type)}
                                <Badge 
                                  variant="secondary"
                                  className={cn('text-xs', getResultTypeBadge(result.type))}
                                >
                                  {searchTypes.find(t => t.value === result.type)?.label}
                                </Badge>
                              </div>
                            </div>
                            
                            <h3 className="mb-2 font-semibold text-gray-900 line-clamp-2">
                              {result.title}
                            </h3>
                            
                            {result.description && (
                              <p className="mb-3 text-sm text-gray-600 line-clamp-3">
                                {result.description}
                              </p>
                            )}
                            
                            {result.metadata && (
                              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                {result.metadata.instructor && (
                                  <span>👨‍🏫 {result.metadata.instructor}</span>
                                )}
                                {result.metadata.duration && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {result.metadata.duration}
                                  </span>
                                )}
                                {result.metadata.rating && (
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    {result.metadata.rating}
                                  </span>
                                )}
                                {result.metadata.enrollments && (
                                  <span className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    {result.metadata.enrollments.toLocaleString()} students
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              ) : query.trim() ? (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <Search className="h-12 w-12 mb-4 text-gray-400" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    No results found
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    We couldn't find anything matching "{query}". Try different keywords or browse our categories.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <Search className="h-12 w-12 mb-4 text-gray-400" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Start searching
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    Enter a search term to find courses, lessons, instructors, and more.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}