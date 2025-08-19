'use client';

import React, { useState, useEffect } from 'react';
import { useSearchMessagesQuery } from '@/lib/redux/api/enhanced-chat-api';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  User,
  FileText,
  Image,
  Paperclip,
  Pin,
  MessageSquare,
  ExternalLink,
  Download,
  Copy,
  ArrowRight,
  Hash,
  X,
} from 'lucide-react';
import { ChatSearchParams, ChatSearchResult } from '@/lib/types/chat';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface MessageSearchDialogProps {
  roomId: string;
  onMessageSelect?: (messageId: string) => void;
}

export function MessageSearchDialog({
  roomId,
  onMessageSelect,
}: MessageSearchDialogProps) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState<ChatSearchParams>({
    query: '',
    roomId,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchParams.query);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchParams.query]);

  // API query
  const {
    data: searchData,
    isLoading,
    error,
  } = useSearchMessagesQuery(
    {
      ...searchParams,
      query: debouncedQuery,
      dateFrom: dateFrom?.toISOString(),
      dateTo: dateTo?.toISOString(),
      page: 1,
      pageSize: 50,
    },
    {
      skip: !debouncedQuery || debouncedQuery.length < 2,
    }
  );

  const results = searchData?.results || [];
  const total = searchData?.total || 0;

  const handleSearchChange = (field: keyof ChatSearchParams, value: any) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearFilters = () => {
    setSearchParams({ query: searchParams.query, roomId });
    setDateFrom(undefined);
    setDateTo(undefined);
    setShowAdvanced(false);
  };

  const handleMessageClick = (result: ChatSearchResult) => {
    if (onMessageSelect) {
      onMessageSelect(result.message.id);
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard');
  };

  const getMessageTypeIcon = (messageType: string) => {
    switch (messageType) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'file':
        return <Paperclip className="h-4 w-4" />;
      case 'system':
        return <Hash className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const highlightText = (text: string, highlights: string[]) => {
    if (!highlights.length) return text;

    let highlightedText = text;
    highlights.forEach(highlight => {
      const regex = new RegExp(`(${highlight})`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
      );
    });

    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  const activeFiltersCount = [
    searchParams.senderId,
    searchParams.messageType,
    searchParams.hasAttachments,
    searchParams.isPinned,
    searchParams.mentionsMe,
    dateFrom,
    dateTo,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
        <Input
          placeholder="Search messages..."
          value={searchParams.query}
          onChange={e => handleSearchChange('query', e.target.value)}
          className="pl-9 pr-20"
        />

        {/* Advanced Filters Toggle */}
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 transform items-center space-x-1">
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="h-5 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={cn(
              'h-7 px-2',
              showAdvanced && 'bg-blue-100 text-blue-700'
            )}
          >
            <Filter className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Advanced Filters</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-6 text-xs"
              >
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Message Type */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Message Type
                </label>
                <Select
                  value={searchParams.messageType || ''}
                  onValueChange={value =>
                    handleSearchChange('messageType', value || undefined)
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Any type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any type</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="file">File</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sender */}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  From User
                </label>
                <Input
                  placeholder="User ID or name"
                  value={searchParams.senderId || ''}
                  onChange={e =>
                    handleSearchChange('senderId', e.target.value || undefined)
                  }
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">
                Date Range
              </label>
              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-8 flex-1 justify-start text-xs"
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {dateFrom ? dateFrom.toLocaleDateString() : 'From date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-8 flex-1 justify-start text-xs"
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {dateTo ? dateTo.toLocaleDateString() : 'To date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center space-x-2 text-xs">
                <input
                  type="checkbox"
                  checked={searchParams.hasAttachments || false}
                  onChange={e =>
                    handleSearchChange(
                      'hasAttachments',
                      e.target.checked || undefined
                    )
                  }
                  className="rounded"
                />
                <span>Has attachments</span>
              </label>

              <label className="flex items-center space-x-2 text-xs">
                <input
                  type="checkbox"
                  checked={searchParams.isPinned || false}
                  onChange={e =>
                    handleSearchChange(
                      'isPinned',
                      e.target.checked || undefined
                    )
                  }
                  className="rounded"
                />
                <span>Pinned messages</span>
              </label>

              <label className="flex items-center space-x-2 text-xs">
                <input
                  type="checkbox"
                  checked={searchParams.mentionsMe || false}
                  onChange={e =>
                    handleSearchChange(
                      'mentionsMe',
                      e.target.checked || undefined
                    )
                  }
                  className="rounded"
                />
                <span>Mentions me</span>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      <div className="space-y-2">
        {/* Results Header */}
        {debouncedQuery && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {isLoading
                ? 'Searching...'
                : error
                  ? 'Search failed'
                  : `${total} result${total !== 1 ? 's' : ''} found`}
            </span>

            {total > 0 && (
              <Button variant="ghost" size="sm" className="h-6 text-xs">
                Export Results
                <Download className="ml-1 h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {/* Results List */}
        <ScrollArea className="h-96">
          {!debouncedQuery ? (
            <div className="flex h-32 flex-col items-center justify-center text-gray-500">
              <Search className="mb-2 h-8 w-8" />
              <p className="text-sm">Enter search terms to find messages</p>
              <p className="text-xs text-gray-400">
                Search by content, user, or use advanced filters
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="flex h-32 flex-col items-center justify-center text-red-500">
              <X className="mb-2 h-8 w-8" />
              <p className="text-sm">Search failed</p>
              <p className="text-xs">Please try again</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-gray-500">
              <Search className="mb-2 h-8 w-8" />
              <p className="text-sm">No messages found</p>
              <p className="text-xs text-gray-400">
                Try different search terms or adjust filters
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map(result => (
                <Card
                  key={result.message.id}
                  className="cursor-pointer transition-colors hover:bg-gray-50"
                  onClick={() => handleMessageClick(result)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      {/* Avatar */}
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={result.message.sender?.avatarUrl} />
                        <AvatarFallback>
                          {result.message.sender?.firstName?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>

                      {/* Message Content */}
                      <div className="min-w-0 flex-1">
                        {/* Header */}
                        <div className="mb-1 flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {result.message.sender?.firstName}{' '}
                            {result.message.sender?.lastName}
                          </span>

                          {getMessageTypeIcon(result.message.messageType)}

                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(
                              new Date(result.message.createdAt),
                              {
                                addSuffix: true,
                              }
                            )}
                          </span>

                          {/* Message indicators */}
                          <div className="flex items-center space-x-1">
                            {result.message.isPinned && (
                              <Pin className="h-3 w-3 text-yellow-600" />
                            )}
                            {result.message.attachments &&
                              result.message.attachments.length > 0 && (
                                <Paperclip className="h-3 w-3 text-gray-500" />
                              )}
                            {result.message.mentions?.includes(
                              user?.id || ''
                            ) && (
                              <Badge
                                variant="secondary"
                                className="h-4 px-1 text-xs"
                              >
                                @
                              </Badge>
                            )}
                          </div>

                          {/* Relevance Score */}
                          <div className="ml-auto">
                            <Badge
                              variant="outline"
                              className={cn(
                                'h-4 px-1 text-xs',
                                result.relevanceScore > 0.8
                                  ? 'border-green-300 text-green-700'
                                  : result.relevanceScore > 0.6
                                    ? 'border-yellow-300 text-yellow-700'
                                    : 'border-gray-300 text-gray-600'
                              )}
                            >
                              {Math.round(result.relevanceScore * 100)}%
                            </Badge>
                          </div>
                        </div>

                        {/* Message Content with Highlights */}
                        <div className="mb-2 text-sm text-gray-700">
                          {highlightText(
                            result.message.content,
                            result.highlights
                          )}

                          {/* Show if message is truncated */}
                          {result.message.content.length > 150 && (
                            <span className="ml-1 text-gray-400">...</span>
                          )}
                        </div>

                        {/* Context Preview */}
                        {result.context &&
                          (result.context.before.length > 0 ||
                            result.context.after.length > 0) && (
                            <div className="rounded bg-gray-50 p-2 text-xs">
                              <div className="mb-1 flex items-center space-x-1 text-gray-500">
                                <MessageSquare className="h-3 w-3" />
                                <span>Message context</span>
                              </div>

                              {/* Before context */}
                              {result.context.before.length > 0 && (
                                <div className="mb-2 space-y-1">
                                  {result.context.before.slice(-2).map(msg => (
                                    <div key={msg.id} className="text-gray-600">
                                      <span className="font-medium">
                                        {msg.sender?.firstName}:
                                      </span>{' '}
                                      <span className="truncate">
                                        {msg.content.slice(0, 60)}
                                        {msg.content.length > 60 && '...'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Current message indicator */}
                              <div className="my-1 flex items-center space-x-2">
                                <ArrowRight className="h-3 w-3 text-blue-500" />
                                <span className="text-xs font-medium text-blue-700">
                                  Matched message
                                </span>
                              </div>

                              {/* After context */}
                              {result.context.after.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {result.context.after.slice(0, 2).map(msg => (
                                    <div key={msg.id} className="text-gray-600">
                                      <span className="font-medium">
                                        {msg.sender?.firstName}:
                                      </span>{' '}
                                      <span className="truncate">
                                        {msg.content.slice(0, 60)}
                                        {msg.content.length > 60 && '...'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                        {/* Attachments Preview */}
                        {result.message.attachments &&
                          result.message.attachments.length > 0 && (
                            <div className="mt-2 flex items-center space-x-2">
                              <Paperclip className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-600">
                                {result.message.attachments.length}{' '}
                                attachment(s)
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 px-1 text-xs"
                                onClick={e => {
                                  e.stopPropagation();
                                  // Handle attachment preview
                                }}
                              >
                                View
                              </Button>
                            </div>
                          )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={e => {
                            e.stopPropagation();
                            handleCopyMessage(result.message.content);
                          }}
                          title="Copy message"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={e => {
                            e.stopPropagation();
                            handleMessageClick(result);
                          }}
                          title="Go to message"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Load More */}
              {total > results.length && (
                <div className="flex justify-center pt-4">
                  <Button variant="outline" size="sm">
                    Load More Results
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Search Tips */}
      {!debouncedQuery && (
        <Card>
          <CardContent className="p-4">
            <h4 className="mb-2 text-sm font-medium">Search Tips</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="h-4 px-1 text-xs">
                  "exact phrase"
                </Badge>
                <span>Search for exact phrases</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="h-4 px-1 text-xs">
                  from:username
                </Badge>
                <span>Messages from specific user</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="h-4 px-1 text-xs">
                  has:image
                </Badge>
                <span>Messages with attachments</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="h-4 px-1 text-xs">
                  before:2024-01-01
                </Badge>
                <span>Messages before date</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="h-4 px-1 text-xs">
                  is:pinned
                </Badge>
                <span>Pinned messages only</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
