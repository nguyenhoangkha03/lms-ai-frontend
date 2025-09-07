'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { useSearchCoursesQuery } from '@/lib/redux/api/course-api';
import { Badge } from '@/components/ui/badge';

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
  };
}

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  className,
  placeholder = "Search courses, lessons, or ask AI...",
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  const debouncedQuery = useDebounce(query, 300);

  // Use real API for course search
  const { data: searchResponse, isLoading: apiLoading } = useSearchCoursesQuery(
    {
      search: debouncedQuery,
      limit: 8,
    },
    {
      skip: !debouncedQuery.trim(),
    }
  );

  // Transform API results to our SearchResult format
  useEffect(() => {
    if (searchResponse?.courses) {
      const transformedResults: SearchResult[] = searchResponse.courses.map(course => ({
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
        }
      }));

      // Add some mock results for other types (lessons, instructors, etc.)
      // In a real implementation, you would have separate API calls for these
      const additionalResults: SearchResult[] = [];
      
      if (debouncedQuery.toLowerCase().includes('lesson')) {
        additionalResults.push({
          id: 'lesson-1',
          title: `${debouncedQuery} - Introduction`,
          type: 'lesson',
          description: `Learn the fundamentals of ${debouncedQuery}`,
          url: '/student/lessons/intro',
          metadata: {
            duration: '15m',
            category: 'Fundamentals'
          }
        });
      }

      if (debouncedQuery.toLowerCase().includes('instructor') || debouncedQuery.toLowerCase().includes('teacher')) {
        additionalResults.push({
          id: 'instructor-1',
          title: `${debouncedQuery} Expert`,
          type: 'user',
          description: `Professional instructor specializing in ${debouncedQuery}`,
          url: '/instructors/expert',
          metadata: {
            category: 'Instructor'
          }
        });
      }

      setResults([...transformedResults, ...additionalResults].slice(0, 8));
    } else if (!debouncedQuery.trim()) {
      setResults([]);
    }
  }, [searchResponse, debouncedQuery]);

  // Update loading state
  useEffect(() => {
    setIsLoading(apiLoading);
  }, [apiLoading]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        } else if (query.trim()) {
          // Navigate to search results page
          router.push(`/student/search?q=${encodeURIComponent(query)}`);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(-1);
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'course': return <BookOpen className="h-4 w-4 text-blue-600" />;
      case 'lesson': return <PlayCircle className="h-4 w-4 text-green-600" />;
      case 'user': return <User className="h-4 w-4 text-purple-600" />;
      case 'forum': return <MessageCircle className="h-4 w-4 text-orange-600" />;
      case 'document': return <FileText className="h-4 w-4 text-gray-600" />;
      default: return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  const getResultTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'course': return 'Course';
      case 'lesson': return 'Lesson';
      case 'user': return 'Instructor';
      case 'forum': return 'Discussion';
      case 'document': return 'Resource';
      default: return 'Result';
    }
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

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 z-10 -translate-y-1/2 transform">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-12 w-full rounded-full border-2 border-blue-200 bg-white pl-10 pr-12 text-sm shadow-sm transition-all hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 transform">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 shadow-md">
            <span className="text-xs font-bold text-white">AI</span>
          </div>
        </div>
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (query.trim() || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-50 mt-2 max-h-96 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
          >
            {/* Header */}
            <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {query.trim() ? `Search results for "${query}"` : 'Recent searches'}
                  </span>
                </div>
                {query.trim() && (
                  <button
                    onClick={() => router.push(`/student/search?q=${encodeURIComponent(query)}`)}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    See all results
                  </button>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <span className="text-sm">Searching...</span>
                  </div>
                </div>
              ) : results.length > 0 ? (
                <div className="py-2">
                  {results.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50",
                        selectedIndex === index && "bg-blue-50"
                      )}
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getResultIcon(result.type)}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="truncate text-sm font-medium text-gray-900">
                            {result.title}
                          </h4>
                          <Badge 
                            variant="secondary"
                            className={cn("text-xs", getResultTypeBadge(result.type))}
                          >
                            {getResultTypeLabel(result.type)}
                          </Badge>
                        </div>
                        
                        {result.description && (
                          <p className="mb-2 text-xs text-gray-600 line-clamp-2">
                            {result.description}
                          </p>
                        )}
                        
                        {result.metadata && (
                          <div className="flex items-center gap-3 text-xs text-gray-500">
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
                    </motion.div>
                  ))}
                </div>
              ) : query.trim() ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Search className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm font-medium">No results found</p>
                  <p className="text-xs">Try different keywords or browse categories</p>
                </div>
              ) : (
                <div className="py-4 px-4">
                  <div className="text-xs font-medium text-gray-600 mb-2">Quick actions</div>
                  <div className="space-y-2">
                    <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 w-full text-left">
                      <Zap className="h-4 w-4" />
                      Ask AI Assistant
                    </button>
                    <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 w-full text-left">
                      <BookOpen className="h-4 w-4" />
                      Browse All Courses
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {query.trim() && results.length > 0 && (
              <div className="border-t border-gray-100 bg-gray-50 px-4 py-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Press Enter to search, ↑↓ to navigate</span>
                  <span>ESC to close</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};