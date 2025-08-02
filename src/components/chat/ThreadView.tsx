'use client';

import React, { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  useGetThreadMessagesQuery,
  useReplyToThreadMutation,
  useResolveThreadMutation,
} from '@/lib/redux/api/enhanced-chat-api';
import { useAuth } from '@/hooks/use-auth';
import { useSocket } from '@/hooks/use-socket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  X,
  MessageSquare,
  Send,
  MoreVertical,
  Check,
  CheckCheck,
  Users,
  Reply,
  Pin,
  Archive,
  Share,
  Settings,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { ChatMessage, MessageThread } from '@/lib/types/chat';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ThreadViewProps {
  threadId: string;
  onClose: () => void;
}

export function ThreadView({ threadId, onClose }: ThreadViewProps) {
  const { user } = useAuth();
  const { socket, on } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [replyMessage, setReplyMessage] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // API queries and mutations
  const {
    data: threadData,
    isLoading,
    refetch,
  } = useGetThreadMessagesQuery({ threadId });

  const [replyToThread] = useReplyToThreadMutation();
  const [resolveThread] = useResolveThreadMutation();

  const thread = threadData?.thread;
  const messages = threadData?.messages || [];

  // Check permissions
  const canModerate = user && ['teacher', 'admin'].includes(user.userType);
  const canResolve = canModerate || (thread && thread.createdBy === user?.id);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: ChatMessage) => {
      if (message.threadId === threadId) {
        refetch();
        scrollToBottom();
      }
    };

    const handleThreadUpdate = (updatedThread: MessageThread) => {
      if (updatedThread.id === threadId) {
        refetch();
      }
    };

    const handleTyping = (data: {
      threadId: string;
      userId: string;
      userName: string;
      isTyping: boolean;
    }) => {
      if (data.threadId === threadId && data.userId !== user?.id) {
        setTypingUsers(prev => {
          if (data.isTyping) {
            return prev.includes(data.userName)
              ? prev
              : [...prev, data.userName];
          } else {
            return prev.filter(name => name !== data.userName);
          }
        });
      }
    };

    const unsubscribe1 = on('thread:new_message', handleNewMessage);
    const unsubscribe2 = on('thread:updated', handleThreadUpdate);
    const unsubscribe3 = on('thread:typing', handleTyping);

    return () => {
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
    };
  }, [socket, threadId, on, refetch, user?.id]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing indicator
  const handleTypingStart = () => {
    if (!socket || isTyping) return;

    setIsTyping(true);
    socket.emit('thread:typing', {
      threadId,
      userId: user?.id,
      userName: `${user?.firstName} ${user?.lastName}`,
      isTyping: true,
    });

    // Auto-stop typing after 3 seconds
    setTimeout(() => {
      setIsTyping(false);
      socket?.emit('thread:typing', {
        threadId,
        userId: user?.id,
        isTyping: false,
      });
    }, 3000);
  };

  // Send reply
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyMessage.trim()) return;

    try {
      await replyToThread({
        threadId,
        content: replyMessage.trim(),
        messageType: 'text',
      }).unwrap();

      setReplyMessage('');
      setIsTyping(false);

      // Stop typing indicator
      if (socket) {
        socket.emit('thread:typing', {
          threadId,
          userId: user?.id,
          isTyping: false,
        });
      }
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  // Toggle thread resolution
  const handleToggleResolve = async () => {
    if (!thread) return;

    try {
      await resolveThread({
        threadId,
        resolved: !thread.isResolved,
      }).unwrap();

      toast.success(thread.isResolved ? 'Thread reopened' : 'Thread resolved');
    } catch (error) {
      toast.error('Failed to update thread status');
    }
  };

  // Handle input change with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReplyMessage(e.target.value);
    handleTypingStart();
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">
            Thread not found
          </h3>
          <p className="text-gray-600">This thread may have been deleted.</p>
        </div>
      </div>
    );
  }

  const parentMessage = messages.find(m => m.id === thread.parentMessageId);

  return (
    <div className="flex h-full flex-col border-l bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-gray-50 p-4">
        <div className="flex flex-1 items-center space-x-3">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="truncate font-semibold text-gray-900">
                {thread.title || 'Thread'}
              </h3>

              {/* Thread status badges */}
              <div className="flex items-center space-x-1">
                {thread.isResolved && (
                  <Badge className="border-green-200 bg-green-100 text-green-800">
                    <Check className="mr-1 h-3 w-3" />
                    Resolved
                  </Badge>
                )}

                {thread.isPinned && <Pin className="h-4 w-4 text-yellow-600" />}
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{thread.replyCount} replies</span>
              <span>•</span>
              <span>{thread.participants.length} participants</span>
              {thread.lastReplyAt && (
                <>
                  <span>•</span>
                  <span>
                    Last reply{' '}
                    {formatDistanceToNow(new Date(thread.lastReplyAt), {
                      addSuffix: true,
                    })}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Participants toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowParticipants(!showParticipants)}
                  className={cn(
                    'h-8 w-8 p-0',
                    showParticipants && 'bg-blue-100 text-blue-700'
                  )}
                >
                  <Users className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Show participants</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Thread actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canResolve && (
                <DropdownMenuItem onClick={handleToggleResolve}>
                  {thread.isResolved ? (
                    <>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Reopen Thread
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Mark Resolved
                    </>
                  )}
                </DropdownMenuItem>
              )}

              <DropdownMenuItem>
                <Pin className="mr-2 h-4 w-4" />
                {thread.isPinned ? 'Unpin Thread' : 'Pin Thread'}
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Share className="mr-2 h-4 w-4" />
                Share Thread
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Thread Settings
              </DropdownMenuItem>

              {canModerate && (
                <DropdownMenuItem className="text-red-600">
                  <Archive className="mr-2 h-4 w-4" />
                  Archive Thread
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Participants list (collapsible) */}
      {showParticipants && (
        <div className="border-b bg-gray-50">
          <div className="p-3">
            <div className="mb-2 flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Participants ({thread.participants.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {thread.participants.slice(0, 8).map(participantId => (
                <div
                  key={participantId}
                  className="flex items-center space-x-1"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {participantId.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-600">User</span>
                </div>
              ))}
              {thread.participants.length > 8 && (
                <span className="text-xs text-gray-500">
                  +{thread.participants.length - 8} more
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Parent message reference */}
      {parentMessage && (
        <div className="border-b bg-blue-50">
          <div className="p-3">
            <div className="flex items-start space-x-2">
              <Reply className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-900">
                    Thread started from message by{' '}
                    {parentMessage.sender?.firstName}
                  </span>
                  <span className="text-xs text-blue-600">
                    {formatDistanceToNow(new Date(parentMessage.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="truncate rounded bg-white/50 px-2 py-1 text-sm text-blue-800">
                  {parentMessage.content}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-blue-700 hover:text-blue-900"
              >
                <ChevronRight className="mr-1 h-3 w-3" />
                Go to message
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Thread messages */}
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {messages
            .filter(m => m.threadId === threadId)
            .map((message, index) => {
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const isGrouped =
                prevMessage &&
                prevMessage.senderId === message.senderId &&
                new Date(message.createdAt).getTime() -
                  new Date(prevMessage.createdAt).getTime() <
                  300000;

              return (
                <div
                  key={message.id}
                  className={cn('flex space-x-3', isGrouped && 'mt-1')}
                >
                  {/* Avatar (only show if not grouped) */}
                  {!isGrouped && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={message.sender?.avatarUrl} />
                      <AvatarFallback>
                        {message.sender?.firstName?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  {/* Message content */}
                  <div className={cn('min-w-0 flex-1', isGrouped && 'ml-11')}>
                    {/* Header (only show if not grouped) */}
                    {!isGrouped && (
                      <div className="mb-1 flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {message.sender?.firstName} {message.sender?.lastName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(message.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    )}

                    {/* Message content */}
                    <div className="break-words text-sm text-gray-700">
                      {message.content.split('\n').map((line, lineIndex) => (
                        <p key={lineIndex} className="mb-1 last:mb-0">
                          {line || <br />}
                        </p>
                      ))}
                    </div>

                    {/* Message status */}
                    {message.senderId === user?.id && (
                      <div className="mt-1 flex items-center space-x-1">
                        {message.status === 'sent' && (
                          <Check className="h-3 w-3 text-gray-400" />
                        )}
                        {message.status === 'delivered' && (
                          <CheckCheck className="h-3 w-3 text-gray-400" />
                        )}
                        {message.status === 'read' && (
                          <CheckCheck className="h-3 w-3 text-blue-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          {/* Typing indicators */}
          {typingUsers.length > 0 && (
            <div className="flex items-center space-x-2 px-3 py-2">
              <div className="flex space-x-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
              <span className="text-sm text-gray-500">
                {typingUsers.length === 1
                  ? `${typingUsers[0]} is typing...`
                  : `${typingUsers.length} people are typing...`}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Reply input */}
      {!thread.isResolved && (
        <div className="border-t bg-gray-50 p-4">
          <form
            onSubmit={handleSendReply}
            className="flex items-center space-x-2"
          >
            <Input
              value={replyMessage}
              onChange={handleInputChange}
              placeholder="Reply to thread..."
              className="flex-1"
              disabled={thread.isResolved}
            />
            <Button
              type="submit"
              disabled={!replyMessage.trim() || thread.isResolved}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      {/* Resolved state message */}
      {thread.isResolved && (
        <div className="border-t border-green-200 bg-green-50 p-4">
          <div className="flex items-center space-x-2 text-green-800">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">
              This thread has been resolved
            </span>
            {canResolve && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleResolve}
                className="ml-auto h-6 text-xs text-green-700 hover:text-green-900"
              >
                Reopen
              </Button>
            )}
          </div>
          {thread.resolvedAt && thread.resolvedBy && (
            <p className="mt-1 text-xs text-green-600">
              Resolved by {thread.resolvedBy}{' '}
              {formatDistanceToNow(new Date(thread.resolvedAt), {
                addSuffix: true,
              })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
