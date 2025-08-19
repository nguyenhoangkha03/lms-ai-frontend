'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { useAuth } from '@/hooks/use-auth';
import {
  useGetRoomMessagesQuery,
  useSendChatMessageMutation,
  useGetChatRoomDetailsQuery,
  useAddMessageReactionMutation,
  useRemoveMessageReactionMutation,
  usePinMessageMutation,
  useDeleteChatMessageMutation,
  useEditChatMessageMutation,
} from '@/lib/redux/api/enhanced-chat-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Pin,
  Reply,
  Edit,
  Trash2,
  Flag,
  Users,
  Search,
  Settings,
  MessageSquare,
  Hash,
  Volume2,
  VolumeX,
  UserPlus,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ChatMessage, ChatRoom, TypingIndicator } from '@/lib/types/chat';
import { MessageItem } from './MessageItem';
import { ParticipantsList } from './ParticipantsList';
import { FileUploadDialog } from './FileUploadDialog';
import { EmojiPicker } from './EmojiPicker';
import { MessageSearchDialog } from './MessageSearchDialog';
import { ThreadView } from './ThreadView';
import { PinnedMessagesView } from './PinnedMessagesView';
import { RoomFilesView } from './RoomFilesView';
import { RoomSettingsDialog } from './RoomSettingsDialog';
import { ModerationPanel } from './ModerationPanel';
import { cn } from '@/lib/utils';

interface ChatRoomInterfaceProps {
  roomId: string;
  onClose?: () => void;
  className?: string;
}

export function ChatRoomInterface({
  roomId,
  onClose,
  className,
}: ChatRoomInterfaceProps) {
  const { user } = useAuth();
  const { socket, joinRoom, leaveRoom, sendMessage, on } = useSocket();

  // UI State
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(
    null
  );
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showPinned, setShowPinned] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showModeration, setShowModeration] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // API queries and mutations
  const { data: roomData, isLoading: isRoomLoading } =
    useGetChatRoomDetailsQuery(roomId);

  const {
    data: messagesData,
    isLoading: isMessagesLoading,
    refetch: refetchMessages,
  } = useGetRoomMessagesQuery({ roomId, limit: 50 });

  const [sendChatMessage] = useSendChatMessageMutation();
  const [editChatMessage] = useEditChatMessageMutation();
  const [deleteChatMessage] = useDeleteChatMessageMutation();
  const [addReaction] = useAddMessageReactionMutation();
  const [removeReaction] = useRemoveMessageReactionMutation();
  const [pinMessage] = usePinMessageMutation();

  // Socket event handlers
  useEffect(() => {
    if (!socket || !roomId) return;

    // Join room on mount
    joinRoom(roomId);

    // Set up event listeners
    const unsubscribeNewMessage = on(
      'message:new',
      (newMessage: ChatMessage) => {
        if (newMessage.roomId === roomId) {
          refetchMessages();
          scrollToBottom();
        }
      }
    );

    const unsubscribeTyping = on('typing:start', (data: TypingIndicator) => {
      if (data.roomId === roomId && data.userId !== user?.id) {
        setTypingUsers(prev => {
          const existing = prev.find(t => t.userId === data.userId);
          if (!existing) {
            return [...prev, data];
          }
          return prev;
        });
      }
    });

    const unsubscribeStopTyping = on('typing:stop', (data: TypingIndicator) => {
      if (data.roomId === roomId) {
        setTypingUsers(prev => prev.filter(t => t.userId !== data.userId));
      }
    });

    const unsubscribeReaction = on(
      'message:react',
      (data: { messageId: string; emoji: string; userId: string }) => {
        refetchMessages();
      }
    );

    // Cleanup
    return () => {
      leaveRoom(roomId);
      unsubscribeNewMessage();
      unsubscribeTyping();
      unsubscribeStopTyping();
      unsubscribeReaction();
    };
  }, [socket, roomId, joinRoom, leaveRoom, on, refetchMessages, user?.id]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messagesData?.messages, scrollToBottom]);

  // Handle typing indicators
  const handleTypingStart = useCallback(() => {
    if (!socket || isTyping) return;

    setIsTyping(true);
    socket.emit('typing:start', {
      roomId,
      userId: user?.id,
      userName: `${user?.firstName} ${user?.lastName}`,
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit('typing:stop', {
        roomId,
        userId: user?.id,
      });
    }, 3000);
  }, [socket, isTyping, roomId, user]);

  // Handle message input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    handleTypingStart();
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !user) return;

    try {
      const messageData = {
        content: message.trim(),
        messageType: 'text' as const,
        replyToId: replyingTo?.id,
      };

      if (editingMessage) {
        // Edit existing message
        await editChatMessage({
          roomId,
          messageId: editingMessage.id,
          content: message.trim(),
        }).unwrap();
        setEditingMessage(null);
      } else {
        // Send new message
        await sendChatMessage({
          roomId,
          ...messageData,
        }).unwrap();
      }

      // Clear input and reset state
      setMessage('');
      setReplyingTo(null);
      setIsTyping(false);

      // Stop typing indicator
      if (socket) {
        socket.emit('typing:stop', {
          roomId,
          userId: user.id,
        });
      }

      // Focus input
      messageInputRef.current?.focus();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  // Handle message actions
  const handleReaction = async (
    messageId: string,
    emoji: string,
    isRemoving = false
  ) => {
    try {
      if (isRemoving) {
        await removeReaction({ roomId, messageId, emoji }).unwrap();
      } else {
        await addReaction({ roomId, messageId, emoji }).unwrap();
      }
    } catch (error) {
      toast.error('Failed to update reaction');
    }
  };

  const handlePinMessage = async (messageId: string, isPinned: boolean) => {
    try {
      await pinMessage({ roomId, messageId, pin: !isPinned }).unwrap();
      toast.success(isPinned ? 'Message unpinned' : 'Message pinned');
    } catch (error) {
      toast.error('Failed to update pin status');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteChatMessage({ roomId, messageId }).unwrap();
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const handleEditMessage = (message: ChatMessage) => {
    setEditingMessage(message);
    setMessage(message.content);
    messageInputRef.current?.focus();
  };

  const handleReplyToMessage = (message: ChatMessage) => {
    setReplyingTo(message);
    messageInputRef.current?.focus();
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setMessage('');
  };

  // Room type badge
  const getRoomTypeBadge = (roomType: ChatRoom['roomType']) => {
    const badges = {
      general: { label: 'General', className: 'bg-blue-100 text-blue-800' },
      course: { label: 'Course', className: 'bg-green-100 text-green-800' },
      lesson: { label: 'Lesson', className: 'bg-purple-100 text-purple-800' },
      study_group: {
        label: 'Study Group',
        className: 'bg-orange-100 text-orange-800',
      },
      office_hours: {
        label: 'Office Hours',
        className: 'bg-red-100 text-red-800',
      },
      help_desk: {
        label: 'Help Desk',
        className: 'bg-yellow-100 text-yellow-800',
      },
      announcements: {
        label: 'Announcements',
        className: 'bg-indigo-100 text-indigo-800',
      },
      private: { label: 'Private', className: 'bg-gray-100 text-gray-800' },
      public: { label: 'Public', className: 'bg-emerald-100 text-emerald-800' },
    };

    const badge = badges[roomType] || badges.general;
    return <Badge className={badge.className}>{badge.label}</Badge>;
  };

  if (isRoomLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Room not found
          </h3>
          <p className="text-gray-600">
            This chat room may have been deleted or you don't have access.
          </p>
        </div>
      </div>
    );
  }

  const room = roomData;
  const messages = messagesData?.messages || [];
  const currentUserParticipant = room.participants?.find(
    p => p.userId === user?.id
  );
  const canModerate =
    currentUserParticipant?.role &&
    ['owner', 'admin', 'moderator'].includes(currentUserParticipant.role);

  return (
    <div className={cn('flex h-full flex-col bg-white', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-gray-50 p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={room.avatarUrl} />
            <AvatarFallback>
              {room.roomType === 'general' && <Hash className="h-5 w-5" />}
              {room.roomType === 'course' && (
                <MessageSquare className="h-5 w-5" />
              )}
              {room.roomType === 'lesson' && (
                <MessageSquare className="h-5 w-5" />
              )}
              {room.roomType === 'study_group' && <Users className="h-5 w-5" />}
              {room.roomType === 'office_hours' && (
                <Users className="h-5 w-5" />
              )}
              {room.roomType === 'help_desk' && <Shield className="h-5 w-5" />}
              {room.roomType === 'announcements' && (
                <Volume2 className="h-5 w-5" />
              )}
              {room.roomType === 'private' && <Eye className="h-5 w-5" />}
              {room.roomType === 'public' && <EyeOff className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-semibold text-gray-900">{room.name}</h2>
              {getRoomTypeBadge(room.roomType)}
              {!room.isActive && <Badge variant="secondary">Inactive</Badge>}
            </div>
            {room.description && (
              <p className="max-w-md truncate text-sm text-gray-600">
                {room.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Participants count */}
          <Sheet open={showParticipants} onOpenChange={setShowParticipants}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1"
              >
                <Users className="h-4 w-4" />
                <span className="text-sm">{room.participantCount}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Participants ({room.participantCount})</SheetTitle>
              </SheetHeader>
              <ParticipantsList
                roomId={roomId}
                participants={room.participants || []}
                currentUserRole={currentUserParticipant?.role}
              />
            </SheetContent>
          </Sheet>

          {/* Action buttons */}
          <div className="flex items-center space-x-1">
            {/* Search */}
            <Dialog open={showSearch} onOpenChange={setShowSearch}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Search Messages</DialogTitle>
                </DialogHeader>
                <MessageSearchDialog roomId={roomId} />
              </DialogContent>
            </Dialog>

            {/* Pinned messages */}
            <Sheet open={showPinned} onOpenChange={setShowPinned}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Pin className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Pinned Messages</SheetTitle>
                </SheetHeader>
                <PinnedMessagesView roomId={roomId} />
              </SheetContent>
            </Sheet>

            {/* Files */}
            <Sheet open={showFiles} onOpenChange={setShowFiles}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Shared Files</SheetTitle>
                </SheetHeader>
                <RoomFilesView roomId={roomId} />
              </SheetContent>
            </Sheet>

            {/* Settings */}
            {canModerate && (
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Room Settings</DialogTitle>
                  </DialogHeader>
                  <RoomSettingsDialog
                    room={room}
                    onClose={() => setShowSettings(false)}
                  />
                </DialogContent>
              </Dialog>
            )}

            {/* Moderation */}
            {canModerate && (
              <Sheet open={showModeration} onOpenChange={setShowModeration}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Shield className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-96">
                  <SheetHeader>
                    <SheetTitle>Moderation</SheetTitle>
                  </SheetHeader>
                  <ModerationPanel roomId={roomId} />
                </SheetContent>
              </Sheet>
            )}

            {/* More options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowParticipants(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Members
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <VolumeX className="mr-2 h-4 w-4" />
                  Mute Notifications
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Flag className="mr-2 h-4 w-4" />
                  Report Room
                </DropdownMenuItem>
                {onClose && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onClose}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Close Chat
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex flex-1">
        {/* Main chat area */}
        <div className="flex flex-1 flex-col">
          {/* Reply indicator */}
          {replyingTo && (
            <div className="border-b border-blue-200 bg-blue-50 px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Reply className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    Replying to <strong>{replyingTo.sender?.firstName}</strong>
                  </span>
                  <span className="max-w-xs truncate rounded bg-blue-100 px-2 py-1 text-xs text-blue-600">
                    {replyingTo.content}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelReply}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
          )}

          {/* Edit indicator */}
          {editingMessage && (
            <div className="border-b border-orange-200 bg-orange-50 px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Edit className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-800">
                    Editing message
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
          )}

          {/* Messages list */}
          <ScrollArea className="flex-1 px-4">
            {isMessagesLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-32 items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                  <p className="text-gray-500">No messages yet</p>
                  <p className="text-sm text-gray-400">
                    Be the first to start the conversation!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {messages.map((message, index) => {
                  const prevMessage = index > 0 ? messages[index - 1] : null;
                  const isGrouped =
                    prevMessage &&
                    prevMessage.senderId === message.senderId &&
                    new Date(message.createdAt).getTime() -
                      new Date(prevMessage.createdAt).getTime() <
                      300000; // 5 minutes

                  return (
                    <MessageItem
                      key={message.id}
                      message={message}
                      isGrouped={isGrouped!}
                      currentUserId={user?.id}
                      canModerate={canModerate}
                      onReaction={handleReaction}
                      onReply={handleReplyToMessage}
                      onEdit={handleEditMessage}
                      onDelete={handleDeleteMessage}
                      onPin={handlePinMessage}
                      onThreadCreate={messageId => {
                        // Handle thread creation
                        setSelectedThread(messageId);
                      }}
                    />
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
                        ? `${typingUsers[0].userName} is typing...`
                        : `${typingUsers.length} people are typing...`}
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Message input */}
          <div className="border-t bg-gray-50 p-4">
            <form
              onSubmit={handleSendMessage}
              className="flex items-end space-x-2"
            >
              <div className="flex-1">
                <div className="mb-2 flex items-center space-x-2">
                  {/* File upload */}
                  <Dialog
                    open={isFileDialogOpen}
                    onOpenChange={setIsFileDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload File</DialogTitle>
                      </DialogHeader>
                      <FileUploadDialog
                        roomId={roomId}
                        onUploadComplete={() => {
                          setIsFileDialogOpen(false);
                          refetchMessages();
                        }}
                      />
                    </DialogContent>
                  </Dialog>

                  {/* Emoji picker */}
                  <DropdownMenu
                    open={isEmojiPickerOpen}
                    onOpenChange={setIsEmojiPickerOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-80 p-0">
                      <EmojiPicker
                        onEmojiSelect={emoji => {
                          setMessage(prev => prev + emoji);
                          setIsEmojiPickerOpen(false);
                          messageInputRef.current?.focus();
                        }}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center space-x-2">
                  <Input
                    ref={messageInputRef}
                    value={message}
                    onChange={handleInputChange}
                    placeholder={
                      editingMessage
                        ? 'Edit your message...'
                        : `Message ${room.name}...`
                    }
                    className="flex-1"
                    disabled={!room.isActive}
                    maxLength={room.moderationSettings?.maxMessageLength}
                  />
                  <Button
                    type="submit"
                    disabled={!message.trim() || !room.isActive}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {/* Character count for long messages */}
                {room.moderationSettings?.maxMessageLength &&
                  message.length >
                    room.moderationSettings.maxMessageLength * 0.8 && (
                    <div className="mt-1 flex justify-end">
                      <span
                        className={cn(
                          'text-xs',
                          message.length >
                            room.moderationSettings.maxMessageLength
                            ? 'text-red-500'
                            : 'text-gray-500'
                        )}
                      >
                        {message.length}/
                        {room.moderationSettings.maxMessageLength}
                      </span>
                    </div>
                  )}
              </div>
            </form>
          </div>
        </div>

        {/* Thread sidebar */}
        {selectedThread && (
          <div className="w-96 border-l">
            <ThreadView
              threadId={selectedThread}
              onClose={() => setSelectedThread(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
