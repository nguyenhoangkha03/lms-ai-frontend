'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  useGetUserChatRoomsQuery,
  useCreateChatRoomMutation,
} from '@/lib/redux/api/enhanced-chat-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  Hash,
  MessageSquare,
  Users,
  Volume2,
  Shield,
  Eye,
  EyeOff,
  MoreVertical,
  Pin,
  Bell,
  BellOff,
  Settings,
  LogOut,
} from 'lucide-react';
import { ChatRoom } from '@/lib/types/chat';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CreateRoomDialog } from './CreateRoomDialog';

interface ChatRoomListProps {
  selectedRoomId?: string;
  onRoomSelect: (roomId: string) => void;
  className?: string;
}

export function ChatRoomList({
  selectedRoomId,
  onRoomSelect,
  className,
}: ChatRoomListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState<
    ChatRoom['roomType'] | 'all'
  >('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const {
    data: rooms = [],
    isLoading,
    refetch,
  } = useGetUserChatRoomsQuery({
    search: searchTerm || undefined,
    roomType: roomTypeFilter !== 'all' ? roomTypeFilter : undefined,
  });

  const [createRoom] = useCreateChatRoomMutation();

  // Filter rooms based on search and type
  const filteredRooms = rooms.filter(room => {
    const matchesSearch =
      !searchTerm ||
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      roomTypeFilter === 'all' || room.roomType === roomTypeFilter;

    return matchesSearch && matchesType;
  });

  // Group rooms by type
  const groupedRooms = filteredRooms.reduce(
    (acc, room) => {
      if (!acc[room.roomType]) {
        acc[room.roomType] = [];
      }
      acc[room.roomType].push(room);
      return acc;
    },
    {} as Record<ChatRoom['roomType'], ChatRoom[]>
  );

  // Room type configurations
  const roomTypeConfig = {
    general: {
      icon: Hash,
      label: 'General',
      color: 'bg-blue-100 text-blue-800',
      description: 'General discussion channels',
    },
    course: {
      icon: MessageSquare,
      label: 'Courses',
      color: 'bg-green-100 text-green-800',
      description: 'Course-specific discussions',
    },
    lesson: {
      icon: MessageSquare,
      label: 'Lessons',
      color: 'bg-purple-100 text-purple-800',
      description: 'Lesson-specific chats',
    },
    study_group: {
      icon: Users,
      label: 'Study Groups',
      color: 'bg-orange-100 text-orange-800',
      description: 'Student study groups',
    },
    office_hours: {
      icon: Users,
      label: 'Office Hours',
      color: 'bg-red-100 text-red-800',
      description: 'Teacher office hours',
    },
    help_desk: {
      icon: Shield,
      label: 'Help Desk',
      color: 'bg-yellow-100 text-yellow-800',
      description: 'Support and help',
    },
    announcements: {
      icon: Volume2,
      label: 'Announcements',
      color: 'bg-indigo-100 text-indigo-800',
      description: 'Important announcements',
    },
    private: {
      icon: Eye,
      label: 'Private',
      color: 'bg-gray-100 text-gray-800',
      description: 'Private conversations',
    },
    public: {
      icon: EyeOff,
      label: 'Public',
      color: 'bg-emerald-100 text-emerald-800',
      description: 'Public discussions',
    },
  };

  const getRoomIcon = (roomType: ChatRoom['roomType']) => {
    const config = roomTypeConfig[roomType];
    const Icon = config.icon;
    return <Icon className="h-4 w-4" />;
  };

  const getRoomTypeBadge = (roomType: ChatRoom['roomType']) => {
    const config = roomTypeConfig[roomType];
    return (
      <Badge className={cn('text-xs', config.color)}>{config.label}</Badge>
    );
  };

  const handleCreateRoom = async (roomData: any) => {
    try {
      await createRoom(roomData).unwrap();
      setShowCreateDialog(false);
      refetch();
      toast.success('Room created successfully');
    } catch (error) {
      toast.error('Failed to create room');
    }
  };

  const getUnreadCount = (room: ChatRoom) => {
    // This would come from the participant data in a real implementation
    return Math.floor(Math.random() * 10); // Mock unread count
  };

  const isRoomMuted = (room: ChatRoom) => {
    // This would come from user notification settings
    return false; // Mock muted status
  };

  if (isLoading) {
    return (
      <div className={cn('flex h-64 items-center justify-center', className)}>
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={cn('flex h-full flex-col border-r bg-white', className)}>
      {/* Header */}
      <div className="border-b p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chat Rooms</h2>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8">
                <Plus className="mr-1 h-4 w-4" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Room</DialogTitle>
              </DialogHeader>
              <CreateRoomDialog
                onSubmit={handleCreateRoom}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Room type filter */}
        <Select
          value={roomTypeFilter}
          onValueChange={(value: any) => setRoomTypeFilter(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(roomTypeConfig).map(([type, config]) => (
              <SelectItem key={type} value={type}>
                <div className="flex items-center space-x-2">
                  <config.icon className="h-4 w-4" />
                  <span>{config.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Room list */}
      <ScrollArea className="flex-1">
        {filteredRooms.length === 0 ? (
          <div className="flex h-32 items-center justify-center p-4 text-center">
            <div>
              <MessageSquare className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500">
                {searchTerm ? 'No rooms found' : 'No rooms available'}
              </p>
              <p className="text-xs text-gray-400">
                {searchTerm
                  ? 'Try adjusting your search'
                  : 'Create a room to get started'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-2">
            {Object.entries(groupedRooms).map(([roomType, roomsInType]) => (
              <div key={roomType} className="mb-4">
                {/* Room type header */}
                <div className="mb-2 flex items-center space-x-2 px-2 py-1">
                  {getRoomIcon(roomType as ChatRoom['roomType'])}
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-600">
                    {roomTypeConfig[roomType as ChatRoom['roomType']].label}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({roomsInType.length})
                  </span>
                </div>

                {/* Rooms in this type */}
                <div className="space-y-1">
                  {roomsInType.map(room => {
                    const unreadCount = getUnreadCount(room);
                    const isMuted = isRoomMuted(room);
                    const isSelected = selectedRoomId === room.id;

                    return (
                      <div
                        key={room.id}
                        className={cn(
                          'group relative flex cursor-pointer items-center space-x-3 rounded-lg p-2 transition-colors',
                          isSelected
                            ? 'border border-blue-200 bg-blue-100'
                            : 'hover:bg-gray-100'
                        )}
                        onClick={() => onRoomSelect(room.id)}
                      >
                        {/* Room avatar/icon */}
                        <div className="flex-shrink-0">
                          {room.avatarUrl ? (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={room.avatarUrl} />
                              <AvatarFallback>
                                {getRoomIcon(room.roomType)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                              {getRoomIcon(room.roomType)}
                            </div>
                          )}
                        </div>

                        {/* Room info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span
                              className={cn(
                                'truncate text-sm font-medium',
                                unreadCount > 0
                                  ? 'text-gray-900'
                                  : 'text-gray-700'
                              )}
                            >
                              {room.name}
                            </span>

                            {/* Status indicators */}
                            <div className="flex items-center space-x-1">
                              {room.isPrivate && (
                                <Eye className="h-3 w-3 text-gray-400" />
                              )}
                              {isMuted && (
                                <BellOff className="h-3 w-3 text-gray-400" />
                              )}
                              {!room.isActive && (
                                <Badge variant="secondary" className="text-xs">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Last message or description */}
                          <div className="flex items-center justify-between">
                            <p className="max-w-[180px] truncate text-xs text-gray-500">
                              {room.lastMessageBy ? (
                                <>
                                  <span className="font-medium">
                                    {room.lastMessageBy}:
                                  </span>
                                  <span className="ml-1">Last message...</span>
                                </>
                              ) : (
                                room.description || 'No messages yet'
                              )}
                            </p>

                            {room.lastMessageAt && (
                              <span className="ml-2 flex-shrink-0 text-xs text-gray-400">
                                {formatDistanceToNow(
                                  new Date(room.lastMessageAt),
                                  {
                                    addSuffix: false,
                                  }
                                ).replace('about ', '')}
                              </span>
                            )}
                          </div>

                          {/* Participant count */}
                          <div className="mt-1 flex items-center justify-between">
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Users className="h-3 w-3" />
                              <span>{room.participantCount}</span>
                              {room.maxParticipants && (
                                <span>/ {room.maxParticipants}</span>
                              )}
                            </div>

                            {/* Unread count */}
                            {unreadCount > 0 && (
                              <Badge
                                variant="destructive"
                                className="flex h-5 min-w-[20px] items-center justify-center px-1 text-xs"
                              >
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Room actions (show on hover) */}
                        <div className="opacity-0 transition-opacity group-hover:opacity-100">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={e => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Pin className="mr-2 h-4 w-4" />
                                Pin Room
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                {isMuted ? (
                                  <>
                                    <Bell className="mr-2 h-4 w-4" />
                                    Unmute
                                  </>
                                ) : (
                                  <>
                                    <BellOff className="mr-2 h-4 w-4" />
                                    Mute
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                Room Settings
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <LogOut className="mr-2 h-4 w-4" />
                                Leave Room
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer with quick stats */}
      <div className="border-t bg-gray-50 p-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Total: {rooms.length} rooms</span>
          <span>{filteredRooms.filter(r => r.isActive).length} active</span>
        </div>
      </div>
    </div>
  );
}
