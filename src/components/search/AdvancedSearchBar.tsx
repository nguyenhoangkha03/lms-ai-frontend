'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Search,
  X,
  TrendingUp,
  BookOpen,
  User,
  Tag,
  Sparkles,
  Loader2,
  History,
  ArrowRight,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  useGetAutocompleteSuggestionsQuery,
  useGetTrendingSearchesQuery,
  useIntelligentSearchMutation,
  useTrackSearchInteractionMutation,
} from '@/lib/redux/api/search-api';
import { SearchSuggestion } from '@/lib/types/search';
import { cn } from '@/lib/utils';

interface AdvancedSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
  autoFocus?: boolean;
  enableIntelligentSearch?: boolean;
  enableVoiceSearch?: boolean;
  context?: Record<string, any>;
}

export function AdvancedSearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Tìm kiếm khóa học, giảng viên, nội dung...',
  className,
  showFilters = true,
  autoFocus = false,
  enableIntelligentSearch = true,
  enableVoiceSearch = false,
  context,
}: AdvancedSearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // State management
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Debounced query for autocomplete
  const debouncedQuery = useDebounce(value, 300);

  // API queries
  const { data: autocompleteSuggestions = [], isLoading: autocompleteLoading } =
    useGetAutocompleteSuggestionsQuery(
      {
        query: debouncedQuery,
        limit: 8,
        types: ['query', 'course', 'instructor', 'category', 'tag'],
        includeMetadata: true,
        context,
      },
      {
        skip: debouncedQuery.length < 2,
      }
    );

  const { data: trendingSearches = [] } = useGetTrendingSearchesQuery({
    timeframe: '24h',
    limit: 5,
  });

  // Mutations
  const [performIntelligentSearch] = useIntelligentSearchMutation();
  const [trackInteraction] = useTrackSearchInteractionMutation();

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Handle focus/blur events
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const suggestions = getSuggestionsList();

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < suggestions.length - 1 ? prev + 1 : -1
          );
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev > -1 ? prev - 1 : suggestions.length - 1
          );
          break;

        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSuggestionSelect(suggestions[selectedIndex]);
          } else {
            handleSearch(value);
          }
          break;

        case 'Escape':
          setShowSuggestions(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;

        case 'Tab':
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            e.preventDefault();
            handleSuggestionSelect(suggestions[selectedIndex]);
          }
          break;
      }
    },
    [selectedIndex, value]
  );

  // Get combined suggestions list
  const getSuggestionsList = useCallback(() => {
    const suggestions: SearchSuggestion[] = [];

    // Add autocomplete suggestions
    if (debouncedQuery.length >= 2) {
      suggestions.push(...autocompleteSuggestions);
    }

    // Add search history when no query
    if (debouncedQuery.length === 0 && searchHistory.length > 0) {
      suggestions.push(
        ...searchHistory.slice(0, 3).map(
          (query, index): SearchSuggestion => ({
            id: `history-${index}`,
            text: query,
            type: 'query',
            metadata: { isHistory: true },
          })
        )
      );
    }

    // Add trending searches when no query
    if (debouncedQuery.length === 0) {
      suggestions.push(...trendingSearches.slice(0, 5));
    }

    return suggestions;
  }, [
    debouncedQuery,
    autocompleteSuggestions,
    searchHistory,
    trendingSearches,
  ]);

  // Handle search execution
  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) return;

      // Track search interaction
      trackInteraction({
        query,
        interactionType: 'search',
        metadata: { source: 'search_bar', context },
      });

      // Perform intelligent search if enabled
      if (enableIntelligentSearch) {
        try {
          const intelligentResult = await performIntelligentSearch({
            query,
          }).unwrap();

          // Use corrected query if available
          const finalQuery =
            intelligentResult.corrections.length > 0
              ? intelligentResult.corrections[0].suggested
              : query;

          onSearch(finalQuery);
        } catch (error) {
          onSearch(query);
        }
      } else {
        onSearch(query);
      }

      // Add to search history
      const newHistory = [
        query,
        ...searchHistory.filter(h => h !== query),
      ].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));

      // Hide suggestions
      setShowSuggestions(false);
      setSelectedIndex(-1);
    },
    [
      onSearch,
      searchHistory,
      enableIntelligentSearch,
      performIntelligentSearch,
      trackInteraction,
      context,
    ]
  );

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback(
    (suggestion: SearchSuggestion) => {
      trackInteraction({
        query: debouncedQuery,
        interactionType: 'click',
        target: suggestion.id,
        metadata: {
          suggestion_type: suggestion.type,
          suggestion_text: suggestion.text,
        },
      });

      if (suggestion.type === 'course' && suggestion.metadata?.url) {
        router.push(suggestion.metadata.url);
      } else if (suggestion.type === 'instructor' && suggestion.metadata?.url) {
        router.push(suggestion.metadata.url);
      } else {
        onChange(suggestion.text);
        handleSearch(suggestion.text);
      }
    },
    [debouncedQuery, router, onChange, handleSearch, trackInteraction]
  );

  // Voice search functionality
  const handleVoiceSearch = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'vi-VN';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onChange(transcript);
      handleSearch(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.start();
  }, [onChange, handleSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
    setShowSuggestions(true);
  }, [onChange]);

  // Get suggestion icon
  const getSuggestionIcon = (type: string, isHistory = false) => {
    if (isHistory) return <History className="h-4 w-4 text-muted-foreground" />;

    switch (type) {
      case 'course':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'instructor':
        return <User className="h-4 w-4 text-green-500" />;
      case 'category':
        return <Tag className="h-4 w-4 text-purple-500" />;
      case 'query':
        return <Search className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const suggestions = getSuggestionsList();
  const hasResults = suggestions.length > 0;

  return (
    <div className={cn('relative w-full', className)}>
      {/* Main Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 transform">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>

        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          className="h-12 border-2 pl-10 pr-24 text-base focus:border-blue-500"
          autoFocus={autoFocus}
        />

        {/* Right Side Actions */}
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 transform items-center gap-1">
          {/* Voice Search Button */}
          {enableVoiceSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVoiceSearch}
              disabled={isListening}
              className="text-muted-foreground hover:text-foreground"
            >
              {isListening ? (
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  <span className="text-xs">Listening...</span>
                </div>
              ) : (
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              )}
            </Button>
          )}

          {/* Clear Button */}
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {/* AI Search Indicator */}
          {enableIntelligentSearch && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              <span className="hidden sm:inline">AI</span>
            </div>
          )}
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      {(isFocused || showSuggestions) && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[500px] overflow-hidden rounded-lg border border-border bg-background shadow-lg"
        >
          <ScrollArea className="max-h-[500px]">
            <div className="p-2">
              {/* Loading State */}
              {autocompleteLoading && debouncedQuery.length >= 2 && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Đang tìm kiếm...
                  </span>
                </div>
              )}

              {/* No Results */}
              {!autocompleteLoading &&
                debouncedQuery.length >= 2 &&
                suggestions.length === 0 && (
                  <div className="py-8 text-center">
                    <Search className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Không tìm thấy kết quả cho "{debouncedQuery}"
                    </p>
                  </div>
                )}

              {/* Suggestions List */}
              {hasResults && (
                <div className="space-y-1">
                  {/* Recent Searches Section */}
                  {debouncedQuery.length === 0 && searchHistory.length > 0 && (
                    <>
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                        Tìm kiếm gần đây
                      </div>
                      {suggestions
                        .filter(s => s.metadata?.isHistory)
                        .map((suggestion, index) => (
                          <SuggestionItem
                            key={suggestion.id}
                            suggestion={suggestion}
                            isSelected={selectedIndex === index}
                            onClick={() => handleSuggestionSelect(suggestion)}
                            icon={getSuggestionIcon(suggestion.type, true)}
                          />
                        ))}
                      <Separator className="my-2" />
                    </>
                  )}

                  {/* Trending Searches Section */}
                  {debouncedQuery.length === 0 &&
                    trendingSearches.length > 0 && (
                      <>
                        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          Đang thịnh hành
                        </div>
                        {trendingSearches.map((suggestion, index) => (
                          <SuggestionItem
                            key={suggestion.id}
                            suggestion={suggestion}
                            isSelected={
                              selectedIndex ===
                              index +
                                suggestions.filter(s => s.metadata?.isHistory)
                                  .length
                            }
                            onClick={() => handleSuggestionSelect(suggestion)}
                            icon={getSuggestionIcon(suggestion.type)}
                          />
                        ))}
                        {debouncedQuery.length >= 2 && (
                          <Separator className="my-2" />
                        )}
                      </>
                    )}

                  {/* Autocomplete Results */}
                  {debouncedQuery.length >= 2 &&
                    autocompleteSuggestions.length > 0 && (
                      <>
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                          Gợi ý tìm kiếm
                        </div>
                        {autocompleteSuggestions.map((suggestion, index) => (
                          <SuggestionItem
                            key={suggestion.id}
                            suggestion={suggestion}
                            isSelected={
                              selectedIndex ===
                              index +
                                (debouncedQuery.length === 0
                                  ? suggestions.filter(
                                      s => s.metadata?.isHistory
                                    ).length + trendingSearches.length
                                  : 0)
                            }
                            onClick={() => handleSuggestionSelect(suggestion)}
                            icon={getSuggestionIcon(suggestion.type)}
                            query={debouncedQuery}
                          />
                        ))}
                      </>
                    )}
                </div>
              )}

              {/* Search Tips */}
              {debouncedQuery.length === 0 && (
                <div className="mt-4 border-t border-border pt-4">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                    Mẹo tìm kiếm
                  </div>
                  <div className="space-y-1 px-3 py-1 text-xs text-muted-foreground">
                    <p>• Sử dụng từ khóa cụ thể để có kết quả chính xác hơn</p>
                    <p>• Thử tìm kiếm bằng tên giảng viên hoặc chủ đề</p>
                    <p>• Sử dụng bộ lọc để thu hẹp kết quả</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

// Suggestion Item Component
interface SuggestionItemProps {
  suggestion: SearchSuggestion;
  isSelected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  query?: string;
}

function SuggestionItem({
  suggestion,
  isSelected,
  onClick,
  icon,
  query,
}: SuggestionItemProps) {
  // Highlight matching text
  const getHighlightedText = (text: string, highlight?: string) => {
    if (!highlight) return text;

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <button
      className={cn(
        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors',
        isSelected
          ? 'bg-blue-50 text-blue-900'
          : 'text-foreground hover:bg-muted/50'
      )}
      onClick={onClick}
    >
      {/* Icon */}
      <div className="flex-shrink-0">{icon}</div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {suggestion.type === 'course' || suggestion.type === 'instructor' ? (
          <div className="flex items-center gap-3">
            {/* Avatar for instructor/course */}
            {suggestion.metadata?.image && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={suggestion.metadata.image} />
                <AvatarFallback>
                  {suggestion.text.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}

            <div className="min-w-0 flex-1">
              <div className="font-medium">
                {getHighlightedText(suggestion.text, query)}
              </div>
              {suggestion.metadata?.description && (
                <div className="truncate text-xs text-muted-foreground">
                  {suggestion.metadata.description}
                </div>
              )}
              {suggestion.metadata?.category && (
                <Badge variant="outline" className="mt-1 text-xs">
                  {suggestion.metadata.category}
                </Badge>
              )}
            </div>

            {/* Rating for courses */}
            {suggestion.type === 'course' && suggestion.metadata?.rating && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>⭐</span>
                <span>{suggestion.metadata.rating}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="flex-1">
              {getHighlightedText(suggestion.text, query)}
            </span>
            {suggestion.count && (
              <Badge variant="outline" className="text-xs">
                {suggestion.count}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Arrow for navigation suggestions */}
      {(suggestion.type === 'course' || suggestion.type === 'instructor') && (
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );
}
