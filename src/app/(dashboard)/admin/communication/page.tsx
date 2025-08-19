'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MessageSquare,
  Users,
  Bell,
  Eye,
  Settings,
  MoreHorizontal,
  RefreshCw,
  Send,
  MessageCircle,
  Hash,
  UserPlus,
  Volume2,
  VolumeX,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AdminCommunicationPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock communication data
  const communicationData = {
    overview: {
      totalMessages: 15420,
      activeChats: 234,
      onlineUsers: 1456,
      notifications: 89,
    },
    chatRooms: [
      {
        id: '1',
        name: 'General Discussion',
        type: 'public',
        members: 1250,
        messages: 5420,
        lastActivity: new Date(Date.now() - 5 * 60 * 1000),
        status: 'active',
      },
      {
        id: '2',
        name: 'JavaScript Course Q&A',
        type: 'course',
        members: 456,
        messages: 1890,
        lastActivity: new Date(Date.now() - 15 * 60 * 1000),
        status: 'active',
      },
      {
        id: '3',
        name: 'Teachers Lounge',
        type: 'private',
        members: 78,
        messages: 892,
        lastActivity: new Date(Date.now() - 45 * 60 * 1000),
        status: 'active',
      },
      {
        id: '4',
        name: 'Support Help',
        type: 'support',
        members: 234,
        messages: 456,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'moderated',
      },
    ],
    recentMessages: [
      {
        id: '1',
        user: 'John Doe',
        avatar: null,
        message: 'Great explanation on React hooks! Thanks for the detailed examples.',
        room: 'React Development Q&A',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        status: 'approved',
      },
      {
        id: '2',
        user: 'Sarah Wilson',
        avatar: null,
        message: 'When will the new Node.js course be available?',
        room: 'General Discussion',
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        status: 'pending',
      },
      {
        id: '3',
        user: 'Mike Johnson',
        avatar: null,
        message: 'I need help with deployment configuration...',
        room: 'Support Help',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        status: 'flagged',
      },
    ],
    notifications: [
      {
        id: '1',
        type: 'announcement',
        title: 'System Maintenance Scheduled',
        content: 'Platform will be down for maintenance on Sunday 2-4 AM EST',
        sent: 1250,
        read: 890,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        status: 'sent',
      },
      {
        id: '2',
        type: 'course_update',
        title: 'New Course Available: Advanced React Patterns',
        content: 'Check out our latest course on advanced React development patterns',
        sent: 2340,
        read: 1450,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'sent',
      },
      {
        id: '3',
        type: 'promotion',
        title: 'Limited Time Offer - 50% Off Premium',
        content: 'Upgrade to premium and get access to all courses',
        sent: 0,
        read: 0,
        timestamp: new Date(),
        status: 'draft',
      },
    ],
  };

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'public':
        return 'text-blue-600 bg-blue-100';
      case 'private':
        return 'text-purple-600 bg-purple-100';
      case 'course':
        return 'text-green-600 bg-green-100';
      case 'support':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'moderated':
        return 'text-yellow-600 bg-yellow-100';
      case 'archived':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getMessageStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'flagged':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getNotificationStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'text-green-600 bg-green-100';
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      case 'scheduled':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!user || user.userType !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don't have permission to access communication management.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communication Center</h1>
          <p className="text-muted-foreground">
            Manage chat rooms, messages, and notifications
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button>
            <Send className="mr-2 h-4 w-4" />
            Send Notification
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                <p className="text-2xl font-bold">{communicationData.overview.totalMessages.toLocaleString()}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Chats</p>
                <p className="text-2xl font-bold">{communicationData.overview.activeChats}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Online Users</p>
                <p className="text-2xl font-bold">{communicationData.overview.onlineUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notifications</p>
                <p className="text-2xl font-bold">{communicationData.overview.notifications}</p>
              </div>
              <Bell className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Communication Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chatrooms">Chat Rooms</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Messages sent today</span>
                  <span className="font-medium">1,234</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>New chat rooms created</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Users joined discussions</span>
                  <span className="font-medium">89</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Messages moderated</span>
                  <span className="font-medium">12</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Notification Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Notifications sent today</span>
                  <span className="font-medium">567</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Average open rate</span>
                  <span className="font-medium">68%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Draft notifications</span>
                  <span className="font-medium">5</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Scheduled notifications</span>
                  <span className="font-medium">2</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="chatrooms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Hash className="mr-2 h-5 w-5" />
                  Chat Rooms
                </div>
                <Button size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Room
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Messages</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communicationData.chatRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span>{room.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('text-xs', getRoomTypeColor(room.type))}>
                          {room.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{room.members}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4 text-muted-foreground" />
                          <span>{room.messages}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(room.lastActivity, { addSuffix: true })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('text-xs', getRoomStatusColor(room.status))}>
                          {room.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Messages
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              Room Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <VolumeX className="mr-2 h-4 w-4" />
                              Mute Room
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="mr-2 h-5 w-5" />
                Recent Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {communicationData.recentMessages.map((message) => (
                  <div key={message.id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {message.user.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{message.user}</span>
                            <span className="text-sm text-muted-foreground">in {message.room}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Badge className={cn('text-xs', getMessageStatusColor(message.status))}>
                        {message.status}
                      </Badge>
                    </div>
                    <p className="text-sm">{message.message}</p>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Flag
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Notifications
                </div>
                <Button size="sm">
                  <Send className="mr-2 h-4 w-4" />
                  New Notification
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {communicationData.notifications.map((notification) => (
                  <div key={notification.id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{notification.content}</p>
                      </div>
                      <Badge className={cn('text-xs', getNotificationStatusColor(notification.status))}>
                        {notification.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Sent:</span>
                        <span className="ml-1 font-medium">{notification.sent}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Read:</span>
                        <span className="ml-1 font-medium">{notification.read}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rate:</span>
                        <span className="ml-1 font-medium">
                          {notification.sent > 0 ? Math.round((notification.read / notification.sent) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        <Clock className="inline mr-1 h-3 w-3" />
                        {format(notification.timestamp, 'MMM d, yyyy HH:mm')}
                      </span>
                      <div className="flex items-center space-x-2">
                        {notification.status === 'draft' && (
                          <Button size="sm" variant="outline">
                            <Send className="mr-2 h-4 w-4" />
                            Send Now
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}