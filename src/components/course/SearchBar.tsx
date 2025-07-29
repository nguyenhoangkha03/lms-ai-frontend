'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  BookOpen,
  User,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchSuggestion } from '@/types/course';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Tìm kiếm khóa học...',
  className,
  showSuggestions = true,
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Mock data for suggestions - in real app, this would come from API
  const mockSuggestions: SearchSuggestion[] = [
    {
      type: 'course',
      id: '1',
      title: 'React từ cơ bản đến nâng cao',
      subtitle: 'Phát triển web',
      image: '/images/react-course.jpg',
      url: '/courses/react-co-ban-den-nang-cao',
    },
    {
      type: 'course',
      id: '2',
      title: 'Python cho người mới bắt đầu',
      subtitle: 'Lập trình',
      image: '/images/python-course.jpg',
      url: '/courses/python-cho-nguoi-moi-bat-dau',
    },
    {
      type: 'instructor',
      id: '3',
      title: 'Nguyễn Văn A',
      subtitle: 'Giảng viên Frontend',
      image: '/images/instructor-1.jpg',
      url: '/instructor/nguyen-van-a',
    },
    {
      type: 'category',
      id: '4',
      title: 'Phát triển web',
      subtitle: '120 khóa học',
      url: '/courses?category=web-development',
    },
  ];

  const trendingSearches = [
    'React',
    'Python',
    'Machine Learning',
    'JavaScript',
    'UI/UX Design',
    'Node.js',
    'Data Science',
    'Mobile App',
  ];

  useEffect(() => {
    // Load search history from localStorage
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  useEffect(() => {
    if (value && value.length > 2 && showSuggestions) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const filtered = mockSuggestions.filter(item =>
          item.title.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered);
        setIsLoading(false);
      }, 300);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  }, [value, showSuggestions]);

  const handleSearch = (searchTerm?: string) => {
    const term = searchTerm || value;
    if (term.trim()) {
      // Add to search history
      const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(
        0,
        10
      );
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));

      onChange(term);
      setIsFocused(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'course' || suggestion.type === 'instructor') {
      router.push(suggestion.url);
    } else {
      onChange(suggestion.title);
      handleSearch(suggestion.title);
    }
    setIsFocused(false);
  };

  const clearSearch = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="h-4 w-4" />;
      case 'instructor':
        return <User className="h-4 w-4" />;
      case 'category':
        return <Tag className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          className="border-2 py-3 pl-10 pr-20 text-lg focus:border-blue-500"
          autoFocus={autoFocus}
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 transform items-center gap-2">
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={() => handleSearch()}
            className="px-4"
            disabled={!value.trim()}
          >
            Tìm kiếm
          </Button>
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      {isFocused && showSuggestions && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="mt-2">Đang tìm kiếm...</p>
            </div>
          ) : (
            <>
              {/* Search History */}
              {!value && searchHistory.length > 0 && (
                <div className="border-b p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      Tìm kiếm gần đây
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.slice(0, 5).map((term, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSearch(term)}
                      >
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              {!value && (
                <div className="border-b p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      Tìm kiếm phổ biến
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((term, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:border-blue-300 hover:bg-blue-50"
                        onClick={() => handleSearch(term)}
                      >
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Suggestions */}
              {value && suggestions.length > 0 && (
                <div className="py-2">
                  {suggestions.map(suggestion => (
                    <div
                      key={`${suggestion.type}-${suggestion.id}`}
                      className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.image ? (
                        <img
                          src={suggestion.image}
                          alt={suggestion.title}
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100">
                          {getSuggestionIcon(suggestion.type)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900">
                          {suggestion.title}
                        </p>
                        {suggestion.subtitle && (
                          <p className="truncate text-sm text-gray-500">
                            {suggestion.subtitle}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.type === 'course' && 'Khóa học'}
                        {suggestion.type === 'instructor' && 'Giảng viên'}
                        {suggestion.type === 'category' && 'Danh mục'}
                        {suggestion.type === 'topic' && 'Chủ đề'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* No Results */}
              {value && !isLoading && suggestions.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  <Search className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  <p>Không tìm thấy kết quả cho "{value}"</p>
                  <p className="mt-1 text-sm">Thử tìm kiếm với từ khóa khác</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isFocused && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsFocused(false)}
        />
      )}
    </div>
  );
}
