'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Reply,
  Search,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/contexts/socket-context';

interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole: 'host' | 'moderator' | 'participant';
  content: string;
  type: 'text' | 'file' | 'system';
  timestamp: string;
  reactions?: MessageReaction[];
  replyTo?: string;
  isEdited?: boolean;
  isPinned?: boolean;
}

interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

interface ChatPanelProps {
  sessionId: string;
  onClose: () => void;
}

const EMOJI_LIST = ['👍', '👎', '❤️', '😄', '😮', '😢', '😡', '👏', '🎉', '🔥'];

export function ChatPanel({ sessionId, onClose }: ChatPanelProps) {
  const { toast } = useToast();
  const socket = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Mock current user - in real app this would come from auth context
  const currentUser = {
    id: 'current-user',
    name: 'Current User',
    avatar: '',
    role: 'participant' as const,
  };

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    };

    const handleMessageReaction = (data: {
      messageId: string;
      reaction: MessageReaction;
    }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === data.messageId
            ? { ...msg, reactions: [...(msg.reactions || []), data.reaction] }
            : msg
        )
      );
    };

    const handleTyping = (data: {
      userId: string;
      userName: string;
      isTyping: boolean;
    }) => {
      if (data.userId === currentUser.id) return;

      setTypingUsers(prev => {
        if (data.isTyping) {
          return prev.includes(data.userName) ? prev : [...prev, data.userName];
        } else {
          return prev.filter(name => name !== data.userName);
        }
      });
    };

    socket.on('chat:message', handleNewMessage);
    socket.on('chat:reaction', handleMessageReaction);
    socket.on('chat:typing', handleTyping);

    return () => {
      socket.off('chat:message', handleNewMessage);
      socket.off('chat:reaction', handleMessageReaction);
      socket.off('chat:typing', handleTyping);
    };
  }, [socket, currentUser.id]);

  // Handle typing indicator
  useEffect(() => {
    if (!socket) return;

    const handleTyping = () => {
      if (!isTyping) {
        setIsTyping(true);
        socket.emit('chat:typing', {
          sessionId,
          userId: currentUser.id,
          userName: currentUser.name,
          isTyping: true,
        });
      }

      // Clear typing after 3 seconds of inactivity
      const timeout = setTimeout(() => {
        setIsTyping(false);
        socket.emit('chat:typing', {
          sessionId,
          userId: currentUser.id,
          userName: currentUser.name,
          isTyping: false,
        });
      }, 3000);

      return () => clearTimeout(timeout);
    };

    if (newMessage.trim()) {
      handleTyping();
    }
  }, [newMessage, socket, sessionId, currentUser, isTyping]);

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !socket) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sessionId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: currentUser.role,
      content: newMessage.trim(),
      type: 'text',
      timestamp: new Date().toISOString(),
      replyTo: replyingTo?.id,
    };

    // Emit to socket
    socket.emit('chat:message', message);

    // Add to local state
    setMessages(prev => [...prev, message]);

    // Clear input
    setNewMessage('');
    setReplyingTo(null);

    // Stop typing indicator
    setIsTyping(false);
    socket.emit('chat:typing', {
      sessionId,
      userId: currentUser.id,
      userName: currentUser.name,
      isTyping: false,
    });
  }, [newMessage, socket, sessionId, currentUser, replyingTo]);

  // Handle key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // Add reaction
  const handleAddReaction = useCallback(
    (messageId: string, emoji: string) => {
      if (!socket) return;

      const reaction: MessageReaction = {
        emoji,
        count: 1,
        users: [currentUser.id],
      };

      socket.emit('chat:reaction', { sessionId, messageId, reaction });
    },
    [socket, sessionId, currentUser.id]
  );

  // Reply to message
  const handleReply = useCallback((message: ChatMessage) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  }, []);

  // Filter messages
  const filteredMessages = React.useMemo(() => {
    if (!searchTerm) return messages;

    return messages.filter(
      message =>
        message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.senderName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [messages, searchTerm]);

  // Get role color
  const getRoleColor = useCallback((role: ChatMessage['senderRole']) => {
    switch (role) {
      case 'host':
        return 'text-yellow-400';
      case 'moderator':
        return 'text-blue-400';
      default:
        return 'text-gray-300';
    }
  }, []);

  return (
    <div className="flex h-full flex-col bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-white">Chat</h3>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-gray-700 p-3">
        <Input
          placeholder="Search messages..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="text-sm"
        />
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence>
            {filteredMessages.map(message => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  'group relative',
                  message.senderId === currentUser.id && 'ml-auto'
                )}
              >
                {/* Reply Context */}
                {message.replyTo && (
                  <div className="mb-2 border-l-2 border-gray-600 pl-4">
                    <p className="text-xs text-gray-400">
                      Replying to{' '}
                      {messages.find(m => m.id === message.replyTo)?.senderName}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {messages.find(m => m.id === message.replyTo)?.content}
                    </p>
                  </div>
                )}

                <div
                  className={cn(
                    'flex space-x-3',
                    message.senderId === currentUser.id &&
                      'flex-row-reverse space-x-reverse'
                  )}
                >
                  {/* Avatar */}
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={message.senderAvatar} />
                    <AvatarFallback>
                      {message.senderName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Message Content */}
                  <div
                    className={cn(
                      'max-w-xs flex-1',
                      message.senderId === currentUser.id && 'text-right'
                    )}
                  >
                    {/* Sender Info */}
                    <div className="mb-1 flex items-center space-x-2">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          getRoleColor(message.senderRole)
                        )}
                      >
                        {message.senderName}
                      </span>
                      {message.senderRole !== 'participant' && (
                        <Badge variant="secondary" className="text-xs">
                          {message.senderRole}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(message.timestamp), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={cn(
                        'relative rounded-lg p-3 shadow-sm',
                        message.senderId === currentUser.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-100'
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm">
                        {message.content}
                      </p>

                      {message.isEdited && (
                        <span className="mt-1 block text-xs opacity-70">
                          (edited)
                        </span>
                      )}

                      {/* Actions */}
                      <div className="absolute -top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex items-center space-x-1 rounded-full bg-gray-900 p-1">
                          {/* Emoji Reactions */}
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <Smile className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2">
                              <div className="grid grid-cols-5 gap-1">
                                {EMOJI_LIST.map(emoji => (
                                  <Button
                                    key={emoji}
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-lg hover:bg-gray-100"
                                    onClick={() =>
                                      handleAddReaction(message.id, emoji)
                                    }
                                  >
                                    {emoji}
                                  </Button>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>

                          {/* Reply */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleReply(message)}
                          >
                            <Reply className="h-3 w-3" />
                          </Button>

                          {/* More Options */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleReply(message)}
                              >
                                <Reply className="mr-2 h-4 w-4" />
                                Reply
                              </DropdownMenuItem>
                              {message.senderId === currentUser.id && (
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                              )}
                              <DropdownMenuItem>Copy Text</DropdownMenuItem>
                              {message.senderId === currentUser.id && (
                                <DropdownMenuItem className="text-red-400">
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.reactions.map((reaction, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() =>
                              handleAddReaction(message.id, reaction.emoji)
                            }
                          >
                            {reaction.emoji} {reaction.count}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-sm text-gray-400"
            >
              <div className="flex space-x-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
              <span>
                {typingUsers.length === 1
                  ? `${typingUsers[0]} is typing...`
                  : `${typingUsers.slice(0, -1).join(', ')} and ${typingUsers[typingUsers.length - 1]} are typing...`}
              </span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Reply Context */}
      {replyingTo && (
        <div className="bg-gray-750 border-t border-gray-700 p-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400">
                Replying to {replyingTo.senderName}
              </p>
              <p className="truncate text-sm text-gray-300">
                {replyingTo.content}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(null)}
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex space-x-2">
          <div className="flex-1">
            <Textarea
              ref={inputRef}
              placeholder="Type a message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="max-h-32 min-h-[2.5rem] resize-none"
              rows={1}
            />
          </div>

          <div className="flex flex-col space-y-1">
            <Button variant="ghost" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Message Count */}
      <div className="border-t border-gray-700 px-4 py-2">
        <p className="text-center text-xs text-gray-400">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
          {searchTerm && ` • ${filteredMessages.length} matching`}
        </p>
      </div>
    </div>
  );
}
