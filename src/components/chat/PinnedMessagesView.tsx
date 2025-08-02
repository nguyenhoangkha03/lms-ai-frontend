'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  useGetPinnedMessagesQuery,
  usePinMessageMutation,
} from '@/lib/redux/api/enhanced-chat-api';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Pin,
  PinOff,
  Search,
  MoreVertical,
  ExternalLink,
  Copy,
  MessageSquare,
  Clock,
  User,
  Filter,
  SortAsc,
  SortDesc,
  Download,
  Share,
  Image,
  Paperclip,
  Hash,
  Calendar,
} from 'lucide-react';
import { ChatMessage } from '@/lib/types/chat';
import { toast } from 'sonner';

interface PinnedMessagesViewProps {
  roomId: string;
  onMessageSelect?: (messageId: string) => void;
}

type SortOption = 'newest' | 'oldest' | 'sender' | 'type';

export function PinnedMessagesView({
  roomId,
  onMessageSelect,
}: PinnedMessagesViewProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showUnpinDialog, setShowUnpinDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(
    null
  );

  // API queries and mutations
  const {
    data: pinnedMessages = [],
    isLoading,
    refetch,
  } = useGetPinnedMessagesQuery(roomId);

  const [pinMessage] = usePinMessageMutation();

  // Check permissions
  const canModerate = user && ['teacher', 'admin'].includes(user.userType);

  // Filter and sort messages
  const filteredAndSortedMessages = React.useMemo(() => {
    let filtered = pinnedMessages.filter(message => {
      const matchesSearch =
        !searchTerm ||
        message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.sender?.firstName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        message.sender?.lastName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesType =
        selectedType === 'all' || message.messageType === selectedType;

      return matchesSearch && matchesType;
    });

    // Sort messages
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.pinnedAt || b.createdAt).getTime() -
            new Date(a.pinnedAt || a.createdAt).getTime()
          );
        case 'oldest':
          return (
            new Date(a.pinnedAt || a.createdAt).getTime() -
            new Date(b.pinnedAt || b.createdAt).getTime()
          );
        case 'sender':
          const aName =
            `${a.sender?.firstName} ${a.sender?.lastName}`.toLowerCase();
          const bName =
            `${b.sender?.firstName} ${b.sender?.lastName}`.toLowerCase();
          return aName.localeCompare(bName);
        case 'type':
          return a.messageType.localeCompare(b.messageType);
        default:
          return 0;
      }
    });

    return filtered;
  }, [pinnedMessages, searchTerm, selectedType, sortBy]);

  // Handle unpin message
  const handleUnpinMessage = async () => {
    if (!selectedMessage) return;

    try {
      await pinMessage({
        roomId,
        messageId: selectedMessage.id,
        pin: false,
      }).unwrap();

      toast.success('Message unpinned');
      setShowUnpinDialog(false);
      setSelectedMessage(null);
      refetch();
    } catch (error) {
      toast.error('Failed to unpin message');
    }
  };

  // Handle message actions
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard');
  };

  const handleGoToMessage = (messageId: string) => {
    if (onMessageSelect) {
      onMessageSelect(messageId);
    }
  };

  // Get message type icon
  const getMessageTypeIcon = (messageType: string) => {
    switch (messageType) {
      case 'image':
        return <Image className="h-4 w-4 text-green-600" />;
      case 'file':
        return <Paperclip className="h-4 w-4 text-blue-600" />;
      case 'system':
        return <Hash className="h-4 w-4 text-gray-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  // Get message type label
  const getMessageTypeLabel = (messageType: string) => {
    switch (messageType) {
      case 'image':
        return 'Image';
      case 'file':
        return 'File';
      case 'system':
        return 'System';
      default:
        return 'Text';
    }
  };

  const messageTypes = [...new Set(pinnedMessages.map(m => m.messageType))];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Pin className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold">Pinned Messages</h3>
            <Badge variant="secondary" className="text-xs">
              {pinnedMessages.length}
            </Badge>
          </div>

          {/* Export/Share actions */}
          <div className="flex items-center space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export pinned messages</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Share className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share pinned messages</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Search and filters */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search pinned messages..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters and sorting */}
          <div className="flex items-center space-x-2">
            {/* Message type filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="mr-1 h-3 w-3" />
                  {selectedType === 'all'
                    ? 'All Types'
                    : getMessageTypeLabel(selectedType)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedType('all')}>
                  All Types
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {messageTypes.map(type => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className="flex items-center space-x-2"
                  >
                    {getMessageTypeIcon(type)}
                    <span>{getMessageTypeLabel(type)}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {sortBy === 'newest' ? (
                    <SortDesc className="mr-1 h-3 w-3" />
                  ) : (
                    <SortAsc className="mr-1 h-3 w-3" />
                  )}
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('newest')}>
                  <Clock className="mr-2 h-3 w-3" />
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                  <Clock className="mr-2 h-3 w-3" />
                  Oldest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('sender')}>
                  <User className="mr-2 h-3 w-3" />
                  By Sender
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('type')}>
                  <MessageSquare className="mr-2 h-3 w-3" />
                  By Type
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <ScrollArea className="flex-1">
        {filteredAndSortedMessages.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center p-4 text-center">
            {pinnedMessages.length === 0 ? (
              <>
                <Pin className="mb-4 h-12 w-12 text-gray-300" />
                <h4 className="mb-2 text-lg font-medium text-gray-900">
                  No pinned messages
                </h4>
                <p className="mb-4 text-gray-600">
                  Pin important messages to keep them easily accessible for
                  everyone.
                </p>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>• Right-click on any message to pin it</p>
                  <p>• Pinned messages stay at the top for easy reference</p>
                  <p>• Only moderators can pin/unpin messages</p>
                </div>
              </>
            ) : (
              <>
                <Search className="mb-2 h-8 w-8 text-gray-400" />
                <p className="text-gray-500">
                  No pinned messages match your search criteria
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('all');
                  }}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {filteredAndSortedMessages.map(message => (
              <Card
                key={message.id}
                className="group cursor-pointer transition-colors hover:bg-gray-50"
                onClick={() => handleGoToMessage(message.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={message.sender?.avatarUrl} />
                      <AvatarFallback>
                        {message.sender?.firstName?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Message Content */}
                    <div className="min-w-0 flex-1">
                      {/* Header */}
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {message.sender?.firstName}{' '}
                            {message.sender?.lastName}
                          </span>

                          {getMessageTypeIcon(message.messageType)}

                          <Badge variant="outline" className="text-xs">
                            {getMessageTypeLabel(message.messageType)}
                          </Badge>
                        </div>

                        {/* Pin indicator and timestamp */}
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Pin className="h-3 w-3 text-yellow-600" />
                          <span>
                            Pinned{' '}
                            {message.pinnedAt
                              ? formatDistanceToNow(
                                  new Date(message.pinnedAt),
                                  { addSuffix: true }
                                )
                              : formatDistanceToNow(
                                  new Date(message.createdAt),
                                  { addSuffix: true }
                                )}
                          </span>
                        </div>
                      </div>

                      {/* Message Content */}
                      <div className="mb-2 text-sm text-gray-700">
                        {message.messageType === 'text' ? (
                          <div className="break-words">
                            {message.content.split('\n').map((line, index) => (
                              <p key={index} className="mb-1 last:mb-0">
                                {line || <br />}
                              </p>
                            ))}
                          </div>
                        ) : message.messageType === 'image' ? (
                          <div className="flex items-center space-x-2">
                            <Image className="h-4 w-4 text-green-600" />
                            <span>
                              Image: {message.content || 'Shared an image'}
                            </span>
                          </div>
                        ) : message.messageType === 'file' ? (
                          <div className="flex items-center space-x-2">
                            <Paperclip className="h-4 w-4 text-blue-600" />
                            <span>
                              File: {message.content || 'Shared a file'}
                            </span>
                          </div>
                        ) : (
                          <div className="italic text-gray-600">
                            {message.content}
                          </div>
                        )}
                      </div>

                      {/* Attachments Preview */}
                      {message.attachments &&
                        message.attachments.length > 0 && (
                          <div className="mb-2 flex items-center space-x-2 text-xs text-gray-600">
                            <Paperclip className="h-3 w-3" />
                            <span>
                              {message.attachments.length} attachment(s)
                            </span>
                          </div>
                        )}

                      {/* Pinned by info */}
                      {message.pinnedBy && (
                        <div className="text-xs text-gray-500">
                          Pinned by {message.pinnedBy}
                          {message.pinnedAt && (
                            <span>
                              {' '}
                              on{' '}
                              {new Date(message.pinnedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Original message timestamp */}
                      <div className="mt-1 text-xs text-gray-400">
                        <Calendar className="mr-1 inline h-3 w-3" />
                        Original message:{' '}
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="opacity-0 transition-opacity group-hover:opacity-100">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={e => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation();
                              handleGoToMessage(message.id);
                            }}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Go to Message
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation();
                              handleCopyMessage(message.content);
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Content
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {canModerate && (
                            <DropdownMenuItem
                              className="text-orange-600"
                              onClick={e => {
                                e.stopPropagation();
                                setSelectedMessage(message);
                                setShowUnpinDialog(true);
                              }}
                            >
                              <PinOff className="mr-2 h-4 w-4" />
                              Unpin Message
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer with stats */}
      {pinnedMessages.length > 0 && (
        <div className="border-t bg-gray-50 p-3">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              {filteredAndSortedMessages.length} of {pinnedMessages.length}{' '}
              pinned messages
            </span>
            <div className="flex items-center space-x-4">
              <span>
                {pinnedMessages.filter(m => m.messageType === 'text').length}{' '}
                text
              </span>
              <span>
                {pinnedMessages.filter(m => m.messageType === 'image').length}{' '}
                images
              </span>
              <span>
                {pinnedMessages.filter(m => m.messageType === 'file').length}{' '}
                files
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Unpin confirmation dialog */}
      <AlertDialog open={showUnpinDialog} onOpenChange={setShowUnpinDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unpin Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unpin this message? It will no longer be
              easily accessible to room members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-orange-600 hover:bg-orange-700"
              onClick={handleUnpinMessage}
            >
              Unpin Message
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
