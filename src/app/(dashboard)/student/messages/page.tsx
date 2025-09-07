'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  useGetUserChatRoomsQuery,
  useGetRoomMessagesQuery,
  useSendChatMessageMutation,
  useCreateChatRoomMutation,
  useJoinChatRoomMutation,
  useMarkMessagesAsReadMutation,
  useGetRoomParticipantsQuery,
} from '@/lib/redux/api/enhanced-chat-api';
import { useAuth } from '@/hooks/use-auth';
import { useChatSocketContext } from '@/contexts/chat-socket-context';
import { AdvancedTokenManager } from '@/lib/auth/token-manager';
import { ContactSuggestions } from '@/components/chat/contact-suggestions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MessageSquare,
  Send,
  Plus,
  Search,
  Users,
  Clock,
  Check,
  CheckCheck,
  MoreVertical,
  Phone,
  Video,
  Settings,
  UserPlus,
  Star,
  Pin,
  Paperclip,
  Smile,
  Image as ImageIcon,
  File,
  Archive,
  Trash2,
  Eye,
  Filter,
  Hash,
  Lock,
  Globe,
  School,
  User,
  Zap,
  Circle,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ChatRoom } from '@/lib/types/chat';

// interface ChatRoom {
//   id: string;
//   name: string;
//   description?: string;
//   roomType: 'direct' | 'group' | 'course' | 'public';
//   status: 'active' | 'archived';
//   lastMessage?: {
//     content: string;
//     senderId: string;
//     senderName: string;
//     timestamp: string;
//   };
//   unreadCount: number;
//   participants: number;
//   isOnline?: boolean;
//   avatar?: string;
//   courseId?: string;
//   courseName?: string;
//   createdAt: string;
// }

interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isEdited: boolean;
  replyToId?: string;
  createdAt: string;
  updatedAt: string;
}

const StudentMessagesPage: React.FC = () => {
  const { user } = useAuth();
  const chatSocket = useChatSocketContext();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roomFilter, setRoomFilter] = useState('all');
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState<ChatRoom['roomType']>('group');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const {
    data: rooms = [],
    isLoading: roomsLoading,
    refetch: refetchRooms,
  } = useGetUserChatRoomsQuery({
    roomType: roomFilter === 'all' ? undefined : (roomFilter as any),
  });

  const {
    data: messagesData,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useGetRoomMessagesQuery(
    { roomId: selectedRoom!, limit: 50 },
    { skip: !selectedRoom }
  );

  const { data: participants = [] } = useGetRoomParticipantsQuery(
    { roomId: selectedRoom! },
    { skip: !selectedRoom }
  );

  const [sendMessage] = useSendChatMessageMutation();
  const [createRoom] = useCreateChatRoomMutation();
  const [joinRoom] = useJoinChatRoomMutation();
  const [markAsRead] = useMarkMessagesAsReadMutation();

  // Use real API data
  const currentRoom = rooms?.find(room => room.id === selectedRoom);
  const currentMessages = messagesData?.messages || [];

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  useEffect(() => {
    if (selectedRoom && currentRoom!.unreadCount! > 0) {
      markAsRead({ roomId: selectedRoom });
    }
  }, [selectedRoom, currentRoom?.unreadCount, markAsRead]);

  // WebSocket event handlers
  useEffect(() => {
    console.log('🔌 WebSocket connected:', chatSocket.isConnected);
    if (!chatSocket.isConnected) return;

    // Handle new messages
    chatSocket.on('new_message', data => {
      console.log('📨 Received new_message event:', data);
      const message = data.message;
      if (message.roomId === selectedRoom) {
        refetchMessages();
      }
      refetchRooms(); // Update room list with latest message

      // Show notification for messages from other users
      if (message.senderId !== user?.id) {
        toast.success(`New message from ${message.senderName}`, {
          description:
            message.content.substring(0, 50) +
            (message.content.length > 50 ? '...' : ''),
          action: {
            label: 'View',
            onClick: () => handleSelectRoom(message.roomId),
          },
        });
      }
    });

    // Handle room events
    chatSocket.on('room:joined', roomId => {
      if (roomId === selectedRoom) {
        refetchMessages();
      }
    });

    // Handle user status
    chatSocket.on('user:online', userId => {
      // Update user online status in UI
      console.log(`User ${userId} is online`);
    });

    chatSocket.on('user:offline', userId => {
      // Update user offline status in UI
      console.log(`User ${userId} is offline`);
    });

    return () => {
      chatSocket.off('new_message');
      chatSocket.off('room:joined');
      chatSocket.off('user:online');
      chatSocket.off('user:offline');
    };
  }, [chatSocket, selectedRoom, refetchMessages, refetchRooms, user?.id]);

  // Join room when selected
  useEffect(() => {
    if (selectedRoom && chatSocket.isConnected) {
      console.log('🏠 Joining WebSocket room:', selectedRoom);
      chatSocket.joinRoom(selectedRoom);

      // Add listener for room joined confirmation
      chatSocket.on('room_joined', data => {
        console.log('✅ Successfully joined room:', data);
      });

      chatSocket.on('error', error => {
        console.error('❌ WebSocket error:', error);
      });
    }

    return () => {
      if (selectedRoom && chatSocket.isConnected) {
        console.log('🚪 Leaving WebSocket room:', selectedRoom);
        chatSocket.leaveRoom(selectedRoom);
        chatSocket.off('room_joined');
        chatSocket.off('error');
      }
    };
  }, [selectedRoom, chatSocket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectRoom = async (roomId: string) => {
    try {
      // Try to join the room first (will succeed if not already a member)
      console.log('Attempting to join room:', roomId);
      const result = await joinRoom({ roomId }).unwrap();
      console.log('Successfully joined room:', result);

      // Wait a bit for the backend to process
      await new Promise(resolve => setTimeout(resolve, 500));

      setSelectedRoom(roomId);
    } catch (error: any) {
      console.log('Join room error:', error);

      // If already a member, that's okay - continue
      if (error?.data?.message?.includes('already in the room')) {
        setSelectedRoom(roomId);
      } else if (error?.data?.message?.includes('invitation')) {
        // Room requires invitation - show appropriate message
        toast.error('This room requires an invitation to join');
      } else {
        // Try to select room anyway - maybe they already have access
        console.log('Trying to access room without joining...');
        setSelectedRoom(roomId);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedRoom) return;

    try {
      console.log('💬 Sending message:', {
        roomId: selectedRoom,
        content: messageText.trim(),
      });

      // Send via WebSocket for real-time (backend will handle persistence)
      if (chatSocket.isConnected) {
        console.log('📡 Sending via WebSocket only');
        chatSocket.sendMessage(selectedRoom, messageText.trim(), 'text');

        console.log('✅ Message sent successfully via WebSocket');
        setMessageText('');
        scrollToBottom();
        // Don't refetch - real-time event will update the UI
      } else {
        // Fallback to API if WebSocket not connected
        console.log('📡 WebSocket not connected, sending via API');
        await sendMessage({
          roomId: selectedRoom,
          content: messageText.trim(),
          type: 'text',
        }).unwrap();

        console.log('✅ Message sent successfully via API');
        setMessageText('');
        scrollToBottom();
        refetchMessages(); // Refresh messages after API send
      }
    } catch (error: any) {
      console.error('❌ Send message error:', error);
      toast.error(error?.data?.message || 'Failed to send message');
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || !selectedRoom || !files.length) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setIsUploading(true);

    try {
      console.log('📤 Uploading image:', file.name);

      // Upload to backend
      const formData = new FormData();
      formData.append('file', file);
      formData.append('roomId', selectedRoom);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${AdvancedTokenManager.getAccessToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      const chatFile = result.data.file;

      console.log('✅ File uploaded:', chatFile);

      // Send image message via WebSocket with file info
      if (chatSocket.isConnected) {
        console.log('📡 Sending image message via WebSocket');
        // For now, send filename as content - backend will handle file association
        const caption = file.name;
        chatSocket.sendMessage(selectedRoom, caption, 'image');
      }

      toast.success('Image sent successfully');
    } catch (error: any) {
      console.error('❌ Image upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    try {
      await createRoom({
        name: newRoomName.trim(),
        description: newRoomDescription.trim(),
        roomType: newRoomType,
        isPrivate: newRoomType === 'group',
      }).unwrap();

      toast.success('Room created successfully');
      setNewRoomName('');
      setNewRoomDescription('');
      setIsCreateRoomOpen(false);
      refetchRooms();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create room');
    }
  };

  const filteredRooms = (rooms || []).filter(room => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = roomFilter === 'all' || room.roomType === roomFilter;

    return matchesSearch && matchesFilter;
  });

  // Get display info for direct message rooms
  const getDirectMessageDisplayInfo = (
    room: ChatRoom,
    roomParticipants?: any[]
  ) => {
    if (room.roomType === 'direct' && room.participantCount === 2) {
      // If no participants provided, use the general participants for selected room
      const participantsToCheck =
        roomParticipants || (selectedRoom === room.id ? participants : []);

      // Find the other participant (not the current user)
      const otherParticipant = participantsToCheck.find(
        p => p.userId !== user?.id
      );
      if (otherParticipant) {
        return {
          displayName:
            otherParticipant.user?.displayName ||
            otherParticipant.user?.firstName ||
            `${otherParticipant.user?.firstName} ${otherParticipant.user?.lastName}`.trim() ||
            'Unknown User',
          avatarUrl: otherParticipant.user?.avatarUrl,
          isOnline: otherParticipant.status === 'active',
        };
      }
    }
    return null;
  };

  const formatTime = (timestamp: string) => {
    const localTimestamp = timestamp.replace('Z', '');
    const date = new Date(localTimestamp);
    const now = new Date();

    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString('en-US');
    }
  };

  const getRoomIcon = (room: ChatRoom) => {
    switch (room.roomType) {
      case 'direct':
        return <User className="h-4 w-4" />;
      case 'group':
        return <Users className="h-4 w-4" />;
      case 'course':
        return <School className="h-4 w-4" />;
      case 'public':
        return <Globe className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-muted-foreground" />;
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 left-[94px] top-16 flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Sidebar - Chat Rooms */}
      <div className="flex w-80 flex-col border-r border-border/50 bg-card/80 shadow-lg backdrop-blur-sm">
        {/* Header */}
        <div className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-blue-500/5 px-4 py-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <MessageSquare className="h-6 w-6 text-primary" />
                <Sparkles className="absolute -right-1 -top-1 h-3 w-3 text-amber-500" />
              </div>
              <h2 className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-lg font-bold text-transparent">
                Messages
              </h2>
            </div>
            <div className="flex flex-col gap-1.5">
              <ContactSuggestions
                onRoomCreated={roomId => {
                  handleSelectRoom(roomId);
                  refetchRooms();
                }}
              />
              <Dialog
                open={isCreateRoomOpen}
                onOpenChange={setIsCreateRoomOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-w-fit gap-2 whitespace-nowrap shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
                  >
                    <Plus className="h-4 w-4 flex-shrink-0" />
                    New Group
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-border/50 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-xl text-transparent">
                      Create New Chat Room
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Create a chat room to discuss with other members
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Room Name
                      </label>
                      <Input
                        value={newRoomName}
                        onChange={e => setNewRoomName(e.target.value)}
                        placeholder="Enter room name..."
                        className="border-border/50 focus:border-primary/50 focus:ring-primary/25"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Room Type
                      </label>
                      <Select
                        value={newRoomType}
                        onValueChange={(value: any) => setNewRoomType(value)}
                      >
                        <SelectTrigger className="border-border/50 focus:border-primary/50 focus:ring-primary/25">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="group">Private Group</SelectItem>
                          <SelectItem value="public">Public Room</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Description (Optional)
                      </label>
                      <Textarea
                        value={newRoomDescription}
                        onChange={e => setNewRoomDescription(e.target.value)}
                        placeholder="Describe the room purpose..."
                        rows={3}
                        className="resize-none border-border/50 focus:border-primary/50 focus:ring-primary/25"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateRoomOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateRoom}
                      className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                    >
                      Create Room
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="border-border/50 bg-background/50 pl-10 backdrop-blur-sm transition-all duration-200 focus:border-primary/50 focus:ring-primary/25"
            />
          </div>

          {/* Filter Tabs */}
          <Tabs
            value={roomFilter}
            onValueChange={setRoomFilter}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 border border-border/30 bg-muted/50">
              <TabsTrigger
                value="all"
                className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="direct"
                className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Direct
              </TabsTrigger>
              <TabsTrigger
                value="group"
                className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Groups
              </TabsTrigger>
              <TabsTrigger
                value="course"
                className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Courses
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto">
          {roomsLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl bg-background/50 p-3"
                >
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="text-sm">No conversations found</p>
            </div>
          ) : (
            <div className="p-3">
              {filteredRooms.map(room => {
                console.log('room', room);

                return (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'mb-2 flex cursor-pointer items-center gap-3 rounded-xl p-4 transition-all duration-200',
                      'border border-transparent hover:border-border/50 hover:bg-background/70 hover:shadow-md',
                      selectedRoom === room.id
                        ? 'border-primary/30 bg-gradient-to-r from-primary/10 to-blue-500/10 shadow-lg'
                        : 'hover:bg-accent/50'
                    )}
                    onClick={() => handleSelectRoom(room.id)}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-border/20">
                        <AvatarImage
                          src={(() => {
                            return room.maxParticipants === 2
                              ? room.avatarUrl
                              : room.avatarUrl;
                          })()}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary/10 to-blue-500/10">
                          {getRoomIcon(room)}
                        </AvatarFallback>
                      </Avatar>
                      {room.roomType === 'direct' && room.isOnline && (
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background bg-green-500 shadow-sm" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <h3 className="truncate text-sm font-semibold text-foreground">
                          {(() => {
                            const dmInfo = getDirectMessageDisplayInfo(room);
                            return dmInfo ? dmInfo.displayName : room.name;
                          })()}
                        </h3>
                        <div className="flex items-center gap-2">
                          {room.lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {formatTime(room.lastMessageAt!)}
                            </span>
                          )}
                          {room.unreadCount! > 0 && (
                            <Badge
                              variant="destructive"
                              className="h-5 min-w-[1.25rem] text-xs shadow-sm"
                            >
                              {room.unreadCount! > 99
                                ? '99+'
                                : room.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="truncate text-xs text-muted-foreground">
                          {room.lastMessage || 'No messages yet'}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {getRoomIcon(room)}
                          <span>{room.maxParticipants}</span>
                        </div>
                      </div>

                      {room.roomType === 'course' && room.courseName && (
                        <div className="mt-2">
                          <Badge
                            variant="outline"
                            className="border-primary/30 text-xs text-primary"
                          >
                            {room.courseName}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm">
        {selectedRoom && currentRoom ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-border/50 bg-card/80 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-border/20">
                    <AvatarImage
                      src={(() => {
                        const dmInfo = getDirectMessageDisplayInfo(currentRoom);
                        return dmInfo
                          ? dmInfo.avatarUrl
                          : currentRoom.avatarUrl;
                      })()}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary/10 to-blue-500/10">
                      {getRoomIcon(currentRoom)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {(() => {
                        const dmInfo = getDirectMessageDisplayInfo(currentRoom);
                        return dmInfo ? dmInfo.displayName : currentRoom.name;
                      })()}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {currentRoom.roomType === 'direct' ? (
                        <span className="flex items-center gap-2">
                          <Circle
                            className={cn(
                              'h-2 w-2',
                              currentRoom.isOnline
                                ? 'fill-green-500 text-green-500'
                                : 'fill-muted-foreground text-muted-foreground'
                            )}
                          />
                          {currentRoom.isOnline ? 'Online' : 'Offline'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {currentRoom.participantCount} members
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {currentRoom.roomType === 'direct' && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="transition-colors hover:bg-primary/10 hover:text-primary"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="transition-colors hover:bg-primary/10 hover:text-primary"
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="transition-colors hover:bg-primary/10 hover:text-primary"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 border-border/50 bg-card/95 backdrop-blur-sm"
                    >
                      <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary">
                        <Eye className="mr-2 h-4 w-4" />
                        View Info
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary">
                        <Pin className="mr-2 h-4 w-4" />
                        Pin Conversation
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary">
                        <VolumeX className="mr-2 h-4 w-4" />
                        Mute Notifications
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      {currentRoom.roomType !== 'direct' && (
                        <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Invite Members
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-red-600 hover:bg-red-50 hover:text-red-700">
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {messagesLoading ? (
                <div className="space-y-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-20 w-3/4 rounded-2xl" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : currentMessages.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <div className="relative mb-6">
                      <MessageSquare className="mx-auto h-20 w-20 opacity-50" />
                      <Sparkles className="absolute right-0 top-0 h-6 w-6 animate-pulse text-amber-500" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-foreground">
                      Start the conversation
                    </h3>
                    <p className="text-muted-foreground">
                      Send the first message to begin chatting
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {currentMessages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'flex gap-3',
                        message.senderId === user?.id
                          ? 'justify-end'
                          : 'justify-start'
                      )}
                    >
                      {message.senderId !== user?.id && (
                        <Avatar className="h-8 w-8 flex-shrink-0 border border-border/20">
                          <AvatarImage src={message.senderAvatar} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/10 to-blue-500/10 text-xs">
                            {message.senderName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn(
                          'max-w-[70%] space-y-1',
                          message.senderId === user?.id && 'items-end'
                        )}
                      >
                        {message.senderId !== user?.id && (
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {message.senderName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                        )}

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={cn(
                            'rounded-2xl border px-4 py-3 text-sm shadow-sm',
                            message.senderId === user?.id
                              ? 'ml-auto border-primary/20 bg-gradient-to-r from-primary to-blue-600 text-primary-foreground'
                              : 'border-border/50 bg-card/80 backdrop-blur-sm'
                          )}
                        >
                          {message.type === 'image' &&
                          message.files &&
                          message.files.length > 0 ? (
                            <div className="space-y-2">
                              {message.files.map(
                                (file: any, fileIndex: number) => (
                                  <div
                                    key={file.id || fileIndex}
                                    className="relative"
                                  >
                                    <img
                                      src={file.filePath || file.url}
                                      alt={file.originalName || 'Image'}
                                      className="h-auto max-w-full cursor-pointer rounded-lg shadow-sm transition-shadow hover:shadow-md"
                                      style={{ maxHeight: '300px' }}
                                      onClick={() => {
                                        // TODO: Open image in modal/lightbox
                                        window.open(
                                          file.filePath || file.url,
                                          '_blank'
                                        );
                                      }}
                                    />
                                    {message.content && (
                                      <p className="mt-2 text-sm opacity-90">
                                        {message.content}
                                      </p>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap leading-relaxed">
                              {message.content}
                            </p>
                          )}
                          {message.isEdited && (
                            <span className="text-xs italic opacity-70">
                              (edited)
                            </span>
                          )}
                        </motion.div>

                        {message.senderId === user?.id && (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatTime(message.createdAt)}
                            </span>
                            {getStatusIcon(message.status)}
                          </div>
                        )}
                      </div>

                      {message.senderId === user?.id && (
                        <Avatar className="h-8 w-8 border border-border/20">
                          <AvatarImage src={user?.avatarUrl} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/10 to-blue-500/10 text-xs">
                            {user?.displayName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t border-border/30 bg-gradient-to-r from-card/90 to-card/80 p-4 backdrop-blur-md">
              {isUploading && (
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  Uploading image...
                </div>
              )}
              <div className="flex w-full items-center gap-3">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 w-9 rounded-full transition-all duration-200 hover:scale-105 hover:bg-primary/10 hover:text-primary"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isUploading}
                    className="h-9 w-9 rounded-full transition-all duration-200 hover:scale-105 hover:bg-primary/10 hover:text-primary disabled:opacity-50"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={e => {
                      // Handle file upload
                      console.log('Files:', e.target.files);
                    }}
                  />
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleImageUpload(e.target.files)}
                  />
                </div>

                <div className="relative flex w-full items-center gap-2">
                  <div className="w-[95%]">
                    <Textarea
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      placeholder="Type your message..."
                      className="max-h-32 min-h-[2.5rem] w-full resize-none border-0 bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-0"
                      rows={1}
                      onKeyPress={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>

                  <div className="flex w-[5%] items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full transition-all duration-200 hover:scale-105 hover:bg-primary/10 hover:text-primary"
                    >
                      <Smile className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || isUploading}
                    size="icon"
                    className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-blue-600 shadow-lg transition-all duration-200 hover:from-primary/90 hover:to-blue-600/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </>
        ) : (
          // No room selected
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="relative mb-8">
                <MessageSquare className="mx-auto h-32 w-32 opacity-30" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-blue-500/20 blur-3xl" />
                <ArrowRight className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 transform animate-pulse text-primary" />
              </div>
              <h3 className="mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
                Select a conversation
              </h3>
              <p className="mx-auto max-w-md leading-relaxed text-muted-foreground">
                Choose a conversation from the sidebar to start messaging with
                your classmates and instructors
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentMessagesPage;
