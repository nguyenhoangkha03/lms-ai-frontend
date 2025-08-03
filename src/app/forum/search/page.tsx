'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  User,
  Tag,
  MessageSquare,
  TrendingUp,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { forumApi } from '@/lib/redux/api/forum-api';

interface SearchFilters {
  query: string;
  categories: string[];
  tags: string[];
  authors: string[];
  dateFrom?: Date;
  dateTo?: Date;
  sortBy: 'relevance' | 'date' | 'score' | 'replies';
  contentType: 'all' | 'threads' | 'posts';
  threadTypes: string[];
  status: string[];
  hasAcceptedAnswer?: boolean;
  minScore?: number;
  minReplies?: number;
}

interface SearchResult {
  id: string;
  type: 'thread' | 'post';
  title: string;
  content: string;
  excerpt: string;
  url: string;
  score: number;
  relevanceScore: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    reputation: number;
  };
  thread?: {
    id: string;
    title: string;
    category: {
      name: string;
      color: string;
    };
    isResolved: boolean;
    replyCount: number;
  };
  highlightedContent: string;
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'query' | 'tag' | 'user' | 'category';
  count?: number;
}

export default function ForumSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    categories: [],
    tags: [],
    authors: [],
    dateFrom: undefined,
    dateTo: undefined,
    sortBy: 'relevance',
    contentType: 'all',
    threadTypes: [],
    status: [],
    hasAcceptedAnswer: undefined,
    minScore: undefined,
    minReplies: undefined,
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<
    SearchSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // RTK Query hooks
  const {
    data: searchResults,
    isLoading: searchLoading,
    isFetching,
  } = forumApi.useSearchForumQuery(filters, {
    skip: !filters.query,
  });
  const { data: categories } = forumApi.useGetCategoriesQuery();
  const { data: popularTags } = forumApi.useGetPopularTagsQuery({
    limit: 10,
  });
  const { data: suggestions } = forumApi.useGetSearchSuggestionsQuery(
    filters.query,
    {
      skip: filters.query.length < 2,
    }
  );

  useEffect(() => {
    if (suggestions) {
      setSearchSuggestions(suggestions);
      setShowSuggestions(filters.query.length >= 2);
    }
  }, [suggestions, filters.query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filters.query.trim()) return;

    // Update URL with search parameters
    const params = new URLSearchParams();
    params.set('q', filters.query);
    if (filters.categories.length > 0)
      params.set('categories', filters.categories.join(','));
    if (filters.tags.length > 0) params.set('tags', filters.tags.join(','));
    if (filters.sortBy !== 'relevance') params.set('sort', filters.sortBy);
    if (filters.contentType !== 'all') params.set('type', filters.contentType);

    router.push(`/forum/search?${params.toString()}`);
    setShowSuggestions(false);
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const addTag = (tagId: string) => {
    if (!filters.tags.includes(tagId)) {
      updateFilter('tags', [...filters.tags, tagId]);
    }
  };

  const removeTag = (tagId: string) => {
    updateFilter(
      'tags',
      filters.tags.filter(id => id !== tagId)
    );
  };

  const addCategory = (categoryId: string) => {
    if (!filters.categories.includes(categoryId)) {
      updateFilter('categories', [...filters.categories, categoryId]);
    }
  };

  const removeCategory = (categoryId: string) => {
    updateFilter(
      'categories',
      filters.categories.filter(id => id !== categoryId)
    );
  };

  const clearFilters = () => {
    setFilters({
      query: filters.query,
      categories: [],
      tags: [],
      authors: [],
      dateFrom: undefined,
      dateTo: undefined,
      sortBy: 'relevance',
      contentType: 'all',
      threadTypes: [],
      status: [],
      hasAcceptedAnswer: undefined,
      minScore: undefined,
      minReplies: undefined,
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Search Forum</h1>
        <p className="text-gray-600">
          Find threads, posts, and discussions across our community
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search for threads, posts, users, or topics..."
                value={filters.query}
                onChange={e => updateFilter('query', e.target.value)}
                className="pl-10 pr-4"
              />

              {/* Search Suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border bg-white shadow-lg">
                  {searchSuggestions.map(suggestion => (
                    <button
                      key={suggestion.id}
                      type="button"
                      className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-gray-50"
                      onClick={() => {
                        updateFilter('query', suggestion.text);
                        setShowSuggestions(false);
                      }}
                    >
                      {suggestion.type === 'tag' && (
                        <Tag className="h-4 w-4 text-blue-500" />
                      )}
                      {suggestion.type === 'user' && (
                        <User className="h-4 w-4 text-green-500" />
                      )}
                      {suggestion.type === 'category' && (
                        <MessageSquare className="h-4 w-4 text-purple-500" />
                      )}
                      <span>{suggestion.text}</span>
                      {suggestion.count && (
                        <span className="ml-auto text-sm text-gray-500">
                          {suggestion.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex flex-1 gap-2">
                <Select
                  value={filters.contentType}
                  onValueChange={value => updateFilter('contentType', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Content</SelectItem>
                    <SelectItem value="threads">Threads Only</SelectItem>
                    <SelectItem value="posts">Posts Only</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.sortBy}
                  onValueChange={value => updateFilter('sortBy', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="date">Newest</SelectItem>
                    <SelectItem value="score">Score</SelectItem>
                    <SelectItem value="replies">Most Replies</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={!filters.query.trim()}>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>
          </form>

          {/* Advanced Filters */}
          <Collapsible
            open={showAdvancedFilters}
            onOpenChange={setShowAdvancedFilters}
          >
            <CollapsibleContent className="mt-4 space-y-4 border-t pt-4">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Categories */}
                <div>
                  <Label className="mb-2 block text-sm font-medium">
                    Categories
                  </Label>
                  <div className="max-h-40 space-y-2 overflow-y-auto">
                    {categories?.map((category: any) => (
                      <div
                        key={category.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={filters.categories.includes(category.id)}
                          onCheckedChange={checked => {
                            if (checked) {
                              addCategory(category.id);
                            } else {
                              removeCategory(category.id);
                            }
                          }}
                        />
                        <label
                          htmlFor={`category-${category.id}`}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div
                            className="h-3 w-3 rounded"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Tags */}
                <div>
                  <Label className="mb-2 block text-sm font-medium">
                    Popular Tags
                  </Label>
                  <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
                    {popularTags?.map((tag: any) => (
                      <Badge
                        key={tag.id}
                        variant={
                          filters.tags.includes(tag.id) ? 'default' : 'outline'
                        }
                        className="cursor-pointer"
                        onClick={() => {
                          if (filters.tags.includes(tag.id)) {
                            removeTag(tag.id);
                          } else {
                            addTag(tag.id);
                          }
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <Label className="mb-2 block text-sm font-medium">
                    Date Range
                  </Label>
                  <div className="flex gap-2">
                    <DatePicker
                      date={filters.dateFrom}
                      onDateChange={(date: Date | undefined) =>
                        updateFilter('dateFrom', date)
                      }
                      placeholder="From date"
                    />
                    <DatePicker
                      date={filters.dateTo}
                      onDateChange={(date: Date | undefined) =>
                        updateFilter('dateTo', date)
                      }
                      placeholder="To date"
                    />
                  </div>
                </div>

                {/* Thread Types */}
                <div>
                  <Label className="mb-2 block text-sm font-medium">
                    Thread Types
                  </Label>
                  <div className="space-y-2">
                    {['question', 'discussion', 'announcement'].map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={filters.threadTypes.includes(type)}
                          onCheckedChange={checked => {
                            if (checked) {
                              updateFilter('threadTypes', [
                                ...filters.threadTypes,
                                type,
                              ]);
                            } else {
                              updateFilter(
                                'threadTypes',
                                filters.threadTypes.filter(t => t !== type)
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={`type-${type}`}
                          className="text-sm capitalize"
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Filters */}
              <div className="grid gap-4 lg:grid-cols-3">
                <div>
                  <Label className="mb-2 block text-sm font-medium">
                    Minimum Score
                  </Label>
                  <Input
                    type="number"
                    value={filters.minScore || ''}
                    onChange={e =>
                      updateFilter(
                        'minScore',
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-sm font-medium">
                    Minimum Replies
                  </Label>
                  <Input
                    type="number"
                    value={filters.minReplies || ''}
                    onChange={e =>
                      updateFilter(
                        'minReplies',
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-sm font-medium">
                    Status
                  </Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has-answer"
                        checked={filters.hasAcceptedAnswer === true}
                        onCheckedChange={checked =>
                          updateFilter(
                            'hasAcceptedAnswer',
                            checked ? true : undefined
                          )
                        }
                      />
                      <label htmlFor="has-answer" className="text-sm">
                        Has accepted answer
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Active Filters */}
          {(filters.categories.length > 0 || filters.tags.length > 0) && (
            <div className="mt-4 border-t pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">Active filters:</span>
                {filters.categories.map(categoryId => {
                  const category = categories?.find(
                    (c: any) => c.id === categoryId
                  );
                  return category ? (
                    <Badge
                      key={categoryId}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <div
                        className="h-2 w-2 rounded"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      {category.name}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeCategory(categoryId)}
                      />
                    </Badge>
                  ) : null;
                })}
                {filters.tags.map(tagId => {
                  const tag = popularTags?.find((t: any) => t.id === tagId);
                  return tag ? (
                    <Badge
                      key={tagId}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      #{tag.name}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tagId)}
                      />
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {filters.query && (
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Search Results for "{filters.query}"
              </h2>
              {searchResults && (
                <p className="mt-1 text-sm text-gray-600">
                  Found {searchResults.totalCount} results in{' '}
                  {searchResults.searchTime}ms
                </p>
              )}
            </div>
          </div>

          {/* Loading State */}
          {(searchLoading || isFetching) && (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                    <div className="mb-3 h-3 w-1/2 rounded bg-gray-200"></div>
                    <div className="h-3 w-full rounded bg-gray-200"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Results Tabs */}
          {searchResults && !searchLoading && (
            <Tabs
              value={filters.contentType}
              onValueChange={value => updateFilter('contentType', value)}
            >
              <TabsList>
                <TabsTrigger value="all">
                  All ({searchResults.counts?.total || 0})
                </TabsTrigger>
                <TabsTrigger value="threads">
                  Threads ({searchResults.counts?.threads || 0})
                </TabsTrigger>
                <TabsTrigger value="posts">
                  Posts ({searchResults.counts?.posts || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={filters.contentType} className="space-y-4">
                {searchResults.results?.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      <h3 className="mb-2 text-lg font-medium">
                        No results found
                      </h3>
                      <p className="mb-4 text-gray-600">
                        Try adjusting your search terms or filters
                      </p>
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  searchResults.results?.map((result: SearchResult) => (
                    <Card
                      key={result.id}
                      className="transition-shadow hover:shadow-md"
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            {/* Result Type Badge */}
                            <div className="mb-2 flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {result.type}
                              </Badge>
                              {result.type === 'post' && result.thread && (
                                <>
                                  <span className="text-gray-400">in</span>
                                  <Link
                                    href={`/forum/threads/${result.thread.id}`}
                                    className="text-sm text-blue-600 hover:underline"
                                  >
                                    {result.thread.title}
                                  </Link>
                                </>
                              )}
                              {result.thread?.category && (
                                <span
                                  style={{
                                    backgroundColor:
                                      result.thread.category.color,
                                  }}
                                  className="rounded px-2 py-1 text-xs text-white"
                                >
                                  {result.thread.category.name}
                                </span>
                              )}
                              {result.thread?.isResolved && (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-xs text-green-700"
                                >
                                  Resolved
                                </Badge>
                              )}
                            </div>

                            {/* Title */}
                            <Link
                              href={result.url}
                              className="transition-colors hover:text-blue-600"
                            >
                              <h3
                                className="mb-2 text-lg font-semibold"
                                dangerouslySetInnerHTML={{
                                  __html: highlightText(
                                    result.title,
                                    filters.query
                                  ),
                                }}
                              />
                            </Link>

                            {/* Excerpt */}
                            <div
                              className="mb-3 line-clamp-3 text-sm text-gray-600"
                              dangerouslySetInnerHTML={{
                                __html:
                                  result.highlightedContent ||
                                  highlightText(result.excerpt, filters.query),
                              }}
                            />

                            {/* Tags */}
                            {result.tags.length > 0 && (
                              <div className="mb-3 flex flex-wrap gap-1">
                                {result.tags.map(tag => (
                                  <Badge
                                    key={tag.id}
                                    variant="outline"
                                    style={{
                                      borderColor: tag.color,
                                      color: tag.color,
                                    }}
                                    className="text-xs"
                                  >
                                    #{tag.name}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4" />
                                <span>{result.score} score</span>
                              </div>
                              {result.thread && (
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="h-4 w-4" />
                                  <span>
                                    {result.thread.replyCount} replies
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-blue-600">
                                  {Math.round(result.relevanceScore * 100)}%
                                  relevance
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Author Info */}
                          <div className="flex min-w-[120px] flex-col items-center text-center">
                            <Avatar className="mb-2 h-10 w-10">
                              <AvatarImage src={result.author.avatar} />
                              <AvatarFallback>
                                {result.author.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <Link
                              href={`/forum/users/${result.author.id}`}
                              className="text-sm font-medium hover:text-blue-600"
                            >
                              {result.author.name}
                            </Link>
                            <div className="mt-1 text-xs text-gray-500">
                              {result.author.reputation} rep
                            </div>
                            <div className="mt-1 text-xs text-gray-400">
                              {formatTimeAgo(result.createdAt)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}

      {/* No Search Query State */}
      {!filters.query && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h2 className="mb-2 text-xl font-bold">Search our Community</h2>
            <p className="mb-4 text-gray-600">
              Enter your search terms above to find relevant threads, posts, and
              discussions
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="bg-blue-50 p-4">
                <MessageSquare className="mb-2 h-8 w-8 text-blue-600" />
                <h3 className="mb-1 font-medium">Search Threads</h3>
                <p className="text-sm text-gray-600">
                  Find discussions and questions
                </p>
              </Card>
              <Card className="bg-green-50 p-4">
                <User className="mb-2 h-8 w-8 text-green-600" />
                <h3 className="mb-1 font-medium">Find Users</h3>
                <p className="text-sm text-gray-600">
                  Search for community members
                </p>
              </Card>
              <Card className="bg-purple-50 p-4">
                <Tag className="mb-2 h-8 w-8 text-purple-600" />
                <h3 className="mb-1 font-medium">Browse Tags</h3>
                <p className="text-sm text-gray-600">
                  Explore topics and categories
                </p>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
