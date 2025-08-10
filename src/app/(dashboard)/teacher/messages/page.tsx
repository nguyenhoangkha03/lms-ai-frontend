'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Search,
  Plus,
  Archive,
  Send,
  Paperclip,
  MoreVertical,
  Star,
  Trash2,
  Edit2,
  Reply,
  Forward,
  Users,
  Filter,
  Download,
  Image,
  File,
  Clock,
  Check,
  CheckCheck,
  Volume2,
  VolumeX,
  Settings,
  User,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useCreateConversationMutation,
  useSendMessageMutation,
  useMarkConversationAsReadMutation,
  useArchiveConversationMutation,
  useSendBulkMessageMutation,
  useGetUnreadCountQuery,
  useSearchMessagesQuery,
  useUploadMessageAttachmentMutation,
  useDeleteMessageMutation,
  useEditMessageMutation,
  useGetMessageStatisticsQuery,
  type Conversation,
  type Message,
} from '@/lib/redux/api/teacher-messages-api';

interface CreateConversationData {
  participantIds: string[];
  subject: string;
  initialMessage: string;
}

interface BulkMessageData {
  recipientIds: string[];
  subject: string;
  content: string;
  courseId?: string;
}

export default function TeacherMessagesPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showBulkMessage, setShowBulkMessage] = useState(false);
  const [newConversationData, setNewConversationData] = useState<CreateConversationData>({
    participantIds: [],
    subject: '',
    initialMessage: '',
  });
  const [bulkMessageData, setBulkMessageData] = useState<BulkMessageData>({
    recipientIds: [],
    subject: '',
    content: '',
  });

  // API queries
  const {
    data: conversationsData,
    isLoading: isLoadingConversations,
    error: conversationsError,
    refetch: refetchConversations,
  } = useGetConversationsQuery({ limit: 50, offset: 0 });

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useGetMessagesQuery(
    { conversationId: selectedConversation!, limit: 100 },
    { skip: !selectedConversation }
  );

  const { data: unreadData } = useGetUnreadCountQuery();
  const { data: statisticsData } = useGetMessageStatisticsQuery();

  // Mutations
  const [createConversation] = useCreateConversationMutation();
  const [sendMessage] = useSendMessageMutation();
  const [markAsRead] = useMarkConversationAsReadMutation();
  const [archiveConversation] = useArchiveConversationMutation();
  const [sendBulkMessage] = useSendBulkMessageMutation();
  const [uploadAttachment] = useUploadMessageAttachmentMutation();
  const [deleteMessage] = useDeleteMessageMutation();
  const [editMessage] = useEditMessageMutation();

  const conversations = conversationsData?.conversations || [];
  const messages = messagesData?.messages || [];

  // Handle conversation selection
  const handleSelectConversation = async (conversationId: string) => {
    setSelectedConversation(conversationId);
    
    // Mark as read
    try {
      await markAsRead(conversationId).unwrap();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await sendMessage({
        conversationId: selectedConversation,
        messageData: {
          content: newMessage,
          messageType: 'text',
        },
      }).unwrap();

      setNewMessage('');
      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to send message',
        description: error?.message || 'An error occurred while sending the message.',
        variant: 'destructive',
      });
    }
  };

  // Handle create conversation
  const handleCreateConversation = async () => {
    if (!newConversationData.initialMessage.trim() || newConversationData.participantIds.length === 0) {
      toast({
        title: 'Invalid data',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await createConversation(newConversationData).unwrap();
      setSelectedConversation(result.id);
      setShowNewConversation(false);
      setNewConversationData({
        participantIds: [],
        subject: '',
        initialMessage: '',
      });
      toast({
        title: 'Conversation created',
        description: 'New conversation has been started successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to create conversation',
        description: error?.message || 'An error occurred while creating the conversation.',
        variant: 'destructive',
      });
    }
  };

  // Handle bulk message
  const handleSendBulkMessage = async () => {
    if (!bulkMessageData.content.trim() || bulkMessageData.recipientIds.length === 0) {
      toast({
        title: 'Invalid data',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await sendBulkMessage(bulkMessageData).unwrap();
      setShowBulkMessage(false);
      setBulkMessageData({
        recipientIds: [],
        subject: '',
        content: '',
      });
      toast({
        title: 'Bulk message sent',
        description: `Message sent to ${result.sentCount} recipients.`,
      });
    } catch (error: any) {
      toast({
        title: 'Failed to send bulk message',
        description: error?.message || 'An error occurred while sending bulk message.',
        variant: 'destructive',
      });
    }
  };

  // Handle archive conversation
  const handleArchiveConversation = async (conversationId: string) => {
    try {
      await archiveConversation(conversationId).unwrap();
      if (selectedConversation === conversationId) {
        setSelectedConversation(null);
      }
      toast({
        title: 'Conversation archived',
        description: 'The conversation has been archived.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to archive',
        description: error?.message || 'An error occurred while archiving.',
        variant: 'destructive',
      });
    }
  };

  // Handle edit message
  const handleEditMessage = async (messageId: string, content: string) => {
    if (!selectedConversation) return;

    try {
      await editMessage({
        conversationId: selectedConversation,
        messageId,
        content,
      }).unwrap();
      setEditingMessageId(null);
      setEditingContent('');
      toast({
        title: 'Message updated',
        description: 'Your message has been updated.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to update message',
        description: error?.message || 'An error occurred while updating the message.',
        variant: 'destructive',
      });
    }
  };

  // Handle delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedConversation) return;

    try {
      await deleteMessage({
        conversationId: selectedConversation,
        messageId,
      }).unwrap();
      toast({
        title: 'Message deleted',
        description: 'The message has been deleted.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to delete message',
        description: error?.message || 'An error occurred while deleting the message.',
        variant: 'destructive',
      });
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Messages</h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Communicate with students • {unreadData?.unreadCount || 0} unread
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-indigo-600">
                    <Plus className="mr-2 h-4 w-4" />
                    New Message
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Start New Conversation</DialogTitle>
                    <DialogDescription>
                      Create a new conversation with students.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Subject</label>
                      <Input
                        placeholder="Enter subject..."
                        value={newConversationData.subject}
                        onChange={(e) =>
                          setNewConversationData(prev => ({
                            ...prev,
                            subject: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Message</label>
                      <Textarea
                        placeholder="Type your message..."
                        value={newConversationData.initialMessage}
                        onChange={(e) =>
                          setNewConversationData(prev => ({
                            ...prev,
                            initialMessage: e.target.value,
                          }))
                        }
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewConversation(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateConversation}>
                      Create Conversation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showBulkMessage} onOpenChange={setShowBulkMessage}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Bulk Message
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Send Bulk Message</DialogTitle>
                    <DialogDescription>
                      Send a message to multiple students at once.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Subject</label>
                      <Input
                        placeholder="Enter subject..."
                        value={bulkMessageData.subject}
                        onChange={(e) =>
                          setBulkMessageData(prev => ({
                            ...prev,
                            subject: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Message</label>
                      <Textarea
                        placeholder="Type your message..."
                        value={bulkMessageData.content}
                        onChange={(e) =>
                          setBulkMessageData(prev => ({
                            ...prev,
                            content: e.target.value,
                          }))
                        }
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowBulkMessage(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSendBulkMessage}>
                      Send to All
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Conversations List */}
          <Card className="lg:col-span-4 border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Conversations</span>
                </CardTitle>
                <Badge variant="secondary">{conversations.length}</Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                {isLoadingConversations ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center space-x-3 p-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No conversations yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start a conversation with your students.
                    </p>
                    <Button onClick={() => setShowNewConversation(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Message
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations
                      .filter(
                        (conversation) =>
                          !searchQuery ||
                          conversation.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          conversation.participants.some((p) =>
                            p.name.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                      )
                      .map((conversation) => (
                        <motion.div
                          key={conversation.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`group cursor-pointer rounded-lg p-3 transition-all duration-200 hover:bg-muted/50 ${
                            selectedConversation === conversation.id
                              ? 'bg-primary/10 border border-primary/20'
                              : ''
                          }`}
                          onClick={() => handleSelectConversation(conversation.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1 min-w-0">
                              <div className="relative">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={conversation.participants[0]?.avatar} />
                                  <AvatarFallback>
                                    {conversation.participants[0]?.name
                                      ?.split(' ')
                                      .map(n => n[0])
                                      .join('') || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                {conversation.unreadCount > 0 && (
                                  <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                                    <span className="text-xs text-white font-medium">
                                      {conversation.unreadCount}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="text-sm font-semibold truncate">
                                    {conversation.subject || 
                                     conversation.participants
                                       .filter(p => p.role === 'student')
                                       .map(p => p.name)
                                       .join(', ') || 'Conversation'}
                                  </h4>
                                  <span className="text-xs text-muted-foreground">
                                    {formatTime(conversation.lastActivityAt)}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                  {conversation.lastMessage?.content || 'No messages yet'}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {conversation.participants.length} participants
                                  </Badge>
                                  {conversation.courseName && (
                                    <Badge variant="secondary" className="text-xs">
                                      {conversation.courseName}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Star className="mr-2 h-4 w-4" />
                                  Star
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleArchiveConversation(conversation.id)}>
                                  <Archive className="mr-2 h-4 w-4" />
                                  Archive
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="lg:col-span-8 border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
            {selectedConversation ? (
              <>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={selectedConversationData?.participants[0]?.avatar} />
                        <AvatarFallback>
                          {selectedConversationData?.participants[0]?.name
                            ?.split(' ')
                            .map(n => n[0])
                            .join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {selectedConversationData?.subject ||
                           selectedConversationData?.participants
                             .filter(p => p.role === 'student')
                             .map(p => p.name)
                             .join(', ') || 'Conversation'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedConversationData?.participants.length} participants
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4 mb-4">
                    {isLoadingMessages ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-start space-x-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-16 w-3/4 rounded-lg" />
                          </div>
                        ))}
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No messages in this conversation</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group"
                          >
                            <div className="flex items-start space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {message.senderName
                                    ?.split(' ')
                                    .map(n => n[0])
                                    .join('') || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium">{message.senderName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatTime(message.sentAt)}
                                  </span>
                                  {message.isRead && (
                                    <CheckCheck className="h-3 w-3 text-blue-500" />
                                  )}
                                </div>
                                <div className="bg-muted/50 rounded-lg p-3">
                                  {editingMessageId === message.id ? (
                                    <div className="space-y-2">
                                      <Textarea
                                        value={editingContent}
                                        onChange={(e) => setEditingContent(e.target.value)}
                                        rows={2}
                                      />
                                      <div className="flex space-x-2">
                                        <Button
                                          size="sm"
                                          onClick={() => handleEditMessage(message.id, editingContent)}
                                        >
                                          Save
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setEditingMessageId(null);
                                            setEditingContent('');
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm">{message.content}</p>
                                  )}
                                </div>
                                {message.attachments && message.attachments.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {message.attachments.map((attachment) => (
                                      <div
                                        key={attachment.id}
                                        className="flex items-center space-x-2 text-sm text-blue-600 hover:underline cursor-pointer"
                                      >
                                        <File className="h-4 w-4" />
                                        <span>{attachment.fileName}</span>
                                        <Download className="h-3 w-3" />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100"
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Reply className="mr-2 h-4 w-4" />
                                    Reply
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Forward className="mr-2 h-4 w-4" />
                                    Forward
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingMessageId(message.id);
                                      setEditingContent(message.content);
                                    }}
                                  >
                                    <Edit2 className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteMessage(message.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t pt-4">
                    <div className="flex items-end space-x-2">
                      <div className="flex-1">
                        <Textarea
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          rows={3}
                          className="resize-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose a conversation from the list to start messaging
                  </p>
                  <Button onClick={() => setShowNewConversation(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Start New Conversation
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            // Handle file uploads here
            console.log('Files selected:', e.target.files);
          }}
        />
      </div>
    </div>
  );
}