'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  SelectValue 
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  roomType: 'direct' | 'group' | 'course' | 'public';
  status: 'active' | 'archived';
  lastMessage?: {
    content: string;
    senderId: string;
    senderName: string;
    timestamp: string;
  };
  unreadCount: number;
  participants: number;
  isOnline?: boolean;
  avatar?: string;
  courseId?: string;
  courseName?: string;
  createdAt: string;
}

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

export default function StudentMessagesPage() {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roomFilter, setRoomFilter] = useState('all');
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState<'group' | 'public'>('group');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: rooms = [],
    isLoading: roomsLoading,
    refetch: refetchRooms,
  } = useGetUserChatRoomsQuery({
    roomType: roomFilter === 'all' ? undefined : roomFilter as any,
  });

  const {
    data: messagesData,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useGetRoomMessagesQuery(
    { roomId: selectedRoom!, limit: 50 },
    { skip: !selectedRoom }
  );

  const {
    data: participants = [],
  } = useGetRoomParticipantsQuery(
    { roomId: selectedRoom! },
    { skip: !selectedRoom }
  );

  const [sendMessage] = useSendChatMessageMutation();
  const [createRoom] = useCreateChatRoomMutation();
  const [markAsRead] = useMarkMessagesAsReadMutation();

  // Mock data for demonstration
  const mockRooms: ChatRoom[] = [
    {
      id: '1',
      name: 'Lập trình JavaScript',
      description: 'Thảo luận về khóa học JavaScript',
      roomType: 'course',
      status: 'active',
      lastMessage: {
        content: 'Ai có thể giải thích về closure không?',
        senderId: 'user2',
        senderName: 'Nguyễn Văn B',
        timestamp: '2024-01-15T10:30:00Z',
      },
      unreadCount: 3,
      participants: 45,
      courseId: 'course-1',
      courseName: 'Lập trình JavaScript từ cơ bản đến nâng cao',
      createdAt: '2024-01-10T00:00:00Z',
    },
    {
      id: '2',
      name: 'Nguyễn Thị C',
      roomType: 'direct',
      status: 'active',
      lastMessage: {
        content: 'Cảm ơn bạn về bài giải!',
        senderId: 'user3',
        senderName: 'Nguyễn Thị C',
        timestamp: '2024-01-15T09:15:00Z',
      },
      unreadCount: 0,
      participants: 2,
      isOnline: true,
      avatar: '/avatars/user3.jpg',
      createdAt: '2024-01-12T00:00:00Z',
    },
    {
      id: '3',
      name: 'Nhóm học React',
      description: 'Nhóm tự học React.js',
      roomType: 'group',
      status: 'active',
      lastMessage: {
        content: 'Meeting vào 8h tối nhé!',
        senderId: 'user4',
        senderName: 'Lê Văn D',
        timestamp: '2024-01-14T20:00:00Z',
      },
      unreadCount: 1,
      participants: 8,
      createdAt: '2024-01-08T00:00:00Z',
    },
  ];

  const mockMessages: ChatMessage[] = [
    {
      id: '1',
      roomId: '1',
      senderId: 'user2',
      senderName: 'Nguyễn Văn B',
      content: 'Chào mọi người! Mình có câu hỏi về JavaScript closure.',
      messageType: 'text',
      status: 'read',
      isEdited: false,
      createdAt: '2024-01-15T10:25:00Z',
      updatedAt: '2024-01-15T10:25:00Z',
    },
    {
      id: '2',
      roomId: '1',
      senderId: 'user1',
      senderName: 'Tôi',
      content: 'Closure là gì vậy bạn?',
      messageType: 'text',
      status: 'read',
      isEdited: false,
      createdAt: '2024-01-15T10:26:00Z',
      updatedAt: '2024-01-15T10:26:00Z',
    },
    {
      id: '3',
      roomId: '1',
      senderId: 'user2',
      senderName: 'Nguyễn Văn B',
      content: 'Closure cho phép function truy cập vào biến từ scope bên ngoài, ngay cả sau khi function đó đã thực thi xong.',
      messageType: 'text',
      status: 'delivered',
      isEdited: false,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
    },
  ];

  const currentRoom = mockRooms.find(room => room.id === selectedRoom);
  const currentMessages = selectedRoom === '1' ? mockMessages : [];

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  useEffect(() => {
    if (selectedRoom && currentRoom?.unreadCount > 0) {
      markAsRead({ roomId: selectedRoom });
    }
  }, [selectedRoom, currentRoom?.unreadCount, markAsRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedRoom) return;

    try {
      await sendMessage({
        roomId: selectedRoom,
        content: messageText.trim(),
        messageType: 'text',
      }).unwrap();

      setMessageText('');
      scrollToBottom();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Không thể gửi tin nhắn');
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      toast.error('Vui lòng nhập tên phòng chat');
      return;
    }

    try {
      await createRoom({
        name: newRoomName.trim(),
        description: newRoomDescription.trim(),
        roomType: newRoomType,
        isPrivate: newRoomType === 'group',
      }).unwrap();

      toast.success('Đã tạo phòng chat thành công');
      setNewRoomName('');
      setNewRoomDescription('');
      setIsCreateRoomOpen(false);
      refetchRooms();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Không thể tạo phòng chat');
    }
  };

  const filteredRooms = mockRooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      roomFilter === 'all' ||
      room.roomType === roomFilter;

    return matchesSearch && matchesFilter;
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Hôm qua';
    } else if (days < 7) {
      return `${days} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
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
        return <Clock className="h-3 w-3 text-gray-400" />;
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.32))] bg-background">
      {/* Sidebar - Chat Rooms */}
      <div className="w-80 border-r bg-card flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Tin nhắn</h2>
            <Dialog open={isCreateRoomOpen} onOpenChange={setIsCreateRoomOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo phòng
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tạo phòng chat mới</DialogTitle>
                  <DialogDescription>
                    Tạo phòng chat để thảo luận với các thành viên khác
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tên phòng
                    </label>
                    <Input
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="Nhập tên phòng chat..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Loại phòng
                    </label>
                    <Select value={newRoomType} onValueChange={(value: any) => setNewRoomType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="group">Nhóm riêng tư</SelectItem>
                        <SelectItem value="public">Phòng công khai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Mô tả (tuỳ chọn)
                    </label>
                    <Textarea
                      value={newRoomDescription}
                      onChange={(e) => setNewRoomDescription(e.target.value)}
                      placeholder="Mô tả về phòng chat..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateRoomOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleCreateRoom}>
                    Tạo phòng
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm kiếm cuộc trò chuyện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Tabs */}
          <Tabs value={roomFilter} onValueChange={setRoomFilter}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="text-xs">Tất cả</TabsTrigger>
              <TabsTrigger value="direct" className="text-xs">Cá nhân</TabsTrigger>
              <TabsTrigger value="group" className="text-xs">Nhóm</TabsTrigger>
              <TabsTrigger value="course" className="text-xs">Khóa học</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto">
          {roomsLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageSquare className="mx-auto mb-2 h-8 w-8" />
              <p>Không có cuộc trò chuyện nào</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                    selectedRoom === room.id 
                      ? "bg-primary/10 border border-primary/20" 
                      : "hover:bg-accent"
                  )}
                  onClick={() => setSelectedRoom(room.id)}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={room.avatar} />
                      <AvatarFallback>
                        {getRoomIcon(room)}
                      </AvatarFallback>
                    </Avatar>
                    {room.roomType === 'direct' && room.isOnline && (
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm truncate">{room.name}</h3>
                      <div className="flex items-center gap-1">
                        {room.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatTime(room.lastMessage.timestamp)}
                          </span>
                        )}
                        {room.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs min-w-[1.25rem] h-5">
                            {room.unreadCount > 99 ? '99+' : room.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-600 truncate">
                        {room.lastMessage?.content || 'Chưa có tin nhắn nào'}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        {getRoomIcon(room)}
                        <span>{room.participants}</span>
                      </div>
                    </div>

                    {room.roomType === 'course' && room.courseName && (
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs">
                          {room.courseName}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom && currentRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentRoom.avatar} />
                    <AvatarFallback>
                      {getRoomIcon(currentRoom)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{currentRoom.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {currentRoom.roomType === 'direct' ? (
                        <span className="flex items-center gap-1">
                          <Circle className={cn("h-2 w-2", currentRoom.isOnline ? "fill-green-500 text-green-500" : "fill-gray-400 text-gray-400")} />
                          {currentRoom.isOnline ? 'Đang online' : 'Offline'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {currentRoom.participants} thành viên
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {currentRoom.roomType === 'direct' && (
                    <>
                      <Button variant="ghost" size="icon">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Video className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem thông tin
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Pin className="mr-2 h-4 w-4" />
                        Ghim cuộc trò chuyện
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <VolumeX className="mr-2 h-4 w-4" />
                        Tắt thông báo
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Cài đặt
                      </DropdownMenuItem>
                      {currentRoom.roomType !== 'direct' && (
                        <DropdownMenuItem>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Mời thành viên
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-red-600">
                        <Archive className="mr-2 h-4 w-4" />
                        Lưu trữ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-16 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : currentMessages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="mx-auto mb-4 h-16 w-16" />
                    <h3 className="text-lg font-semibold mb-2">Bắt đầu cuộc trò chuyện</h3>
                    <p>Gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện</p>
                  </div>
                </div>
              ) : (
                <>
                  {currentMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-3",
                        message.senderId === user?.id ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.senderId !== user?.id && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.senderAvatar} />
                          <AvatarFallback>
                            {message.senderName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className={cn(
                        "max-w-[70%] space-y-1",
                        message.senderId === user?.id && "items-end"
                      )}>
                        {message.senderId !== user?.id && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                              {message.senderName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(message.createdAt)}
                            </span>
                          </div>
                        )}

                        <div className={cn(
                          "rounded-lg px-3 py-2 text-sm",
                          message.senderId === user?.id 
                            ? "bg-primary text-primary-foreground ml-auto" 
                            : "bg-accent"
                        )}>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          {message.isEdited && (
                            <span className="text-xs opacity-70">
                              (đã chỉnh sửa)
                            </span>
                          )}
                        </div>

                        {message.senderId === user?.id && (
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-xs text-gray-500">
                              {formatTime(message.createdAt)}
                            </span>
                            {getStatusIcon(message.status)}
                          </div>
                        )}
                      </div>

                      {message.senderId === user?.id && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.avatar} />
                          <AvatarFallback>
                            {user?.fullName?.charAt(0)}
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
            <div className="p-4 border-t bg-card">
              <div className="flex items-end gap-3">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      // Handle file upload
                      console.log('Files:', e.target.files);
                    }}
                  />
                </div>

                <div className="flex-1 relative">
                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="resize-none min-h-[2.5rem] pr-12"
                    rows={1}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 bottom-2"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>

                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          // No room selected
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="mx-auto mb-4 h-24 w-24" />
              <h3 className="text-xl font-semibold mb-2">Chọn cuộc trò chuyện</h3>
              <p className="text-gray-600">
                Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}