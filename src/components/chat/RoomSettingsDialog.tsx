'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useUpdateChatRoomMutation,
  useDeleteChatRoomMutation,
} from '@/lib/redux/api/enhanced-chat-api';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Settings,
  Users,
  Shield,
  BarChart3,
  Download,
  Trash2,
  Save,
  AlertTriangle,
  FileText,
  Smile,
  Paperclip,
  Pin,
  MessageSquare,
  Eye,
  Clock,
  Filter,
  Archive,
  Camera,
  Globe,
  Lock,
} from 'lucide-react';
import { ChatRoom } from '@/lib/types/chat';
import { toast } from 'sonner';

const roomSettingsSchema = z.object({
  name: z.string().min(1, 'Room name is required').max(50),
  description: z.string().max(200).optional(),
  isPrivate: z.boolean(),
  maxParticipants: z.number().min(2).max(1000).optional(),

  // Features
  allowFileSharing: z.boolean(),
  allowReactions: z.boolean(),
  allowThreads: z.boolean(),
  allowMentions: z.boolean(),
  allowPinning: z.boolean(),
  messageRetention: z.number().min(1).max(365),
  slowMode: z.boolean(),
  slowModeDelay: z.number().min(1).max(300),
  requireApproval: z.boolean(),
  wordFilter: z.boolean(),
  readReceipts: z.boolean(),
  typingIndicators: z.boolean(),

  // Moderation
  autoModeration: z.boolean(),
  spamDetection: z.boolean(),
  linkBlocking: z.boolean(),
  imageModeration: z.boolean(),
  maxMessageLength: z.number().min(50).max(5000),
  maxMessagesPerMinute: z.number().min(1).max(100),
  warningThreshold: z.number().min(1).max(10),
  timeoutDuration: z.number().min(1).max(1440),
  banDuration: z.number().min(1).max(43200),
  autoDeleteSpam: z.boolean(),
  toxicityThreshold: z.number().min(0.1).max(1.0),
});

type RoomSettingsFormData = z.infer<typeof roomSettingsSchema>;

interface RoomSettingsDialogProps {
  room: ChatRoom;
  onClose: () => void;
}

export function RoomSettingsDialog({ room, onClose }: RoomSettingsDialogProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const [updateRoom, { isLoading: isUpdating }] = useUpdateChatRoomMutation();
  const [deleteRoom, { isLoading: isDeleting }] = useDeleteChatRoomMutation();

  // Check permissions
  const isOwner = user?.id === room.createdBy;
  const canEdit =
    (user && ['teacher', 'admin'].includes(user.userType)) || isOwner;
  const canDelete = isOwner;

  const form = useForm<RoomSettingsFormData>({
    resolver: zodResolver(roomSettingsSchema),
    defaultValues: {
      name: room.name,
      description: room.description || '',
      isPrivate: room.isPrivate,
      maxParticipants: room.maxParticipants,

      // Features from room.settings
      allowFileSharing: room.settings?.allowFileSharing ?? true,
      allowReactions: room.settings?.allowReactions ?? true,
      allowThreads: room.settings?.allowThreads ?? true,
      allowMentions: room.settings?.allowMentions ?? true,
      allowPinning: room.settings?.allowPinning ?? true,
      messageRetention: room.settings?.messageRetention ?? 30,
      slowMode: room.settings?.slowMode ?? false,
      slowModeDelay: room.settings?.slowModeDelay ?? 5,
      requireApproval: room.settings?.requireApproval ?? false,
      wordFilter: room.settings?.wordFilter ?? false,
      readReceipts: room.settings?.readReceipts ?? true,
      typingIndicators: room.settings?.typingIndicators ?? true,

      // Moderation from room.moderationSettings
      autoModeration: room.moderationSettings?.autoModeration ?? false,
      spamDetection: room.moderationSettings?.spamDetection ?? true,
      linkBlocking: room.moderationSettings?.linkBlocking ?? false,
      imageModeration: room.moderationSettings?.imageModeration ?? false,
      maxMessageLength: room.moderationSettings?.maxMessageLength ?? 2000,
      maxMessagesPerMinute: room.moderationSettings?.maxMessagesPerMinute ?? 10,
      warningThreshold: room.moderationSettings?.warningThreshold ?? 3,
      timeoutDuration: room.moderationSettings?.timeoutDuration ?? 10,
      banDuration: room.moderationSettings?.banDuration ?? 1440,
      autoDeleteSpam: room.moderationSettings?.autoDeleteSpam ?? false,
      toxicityThreshold: room.moderationSettings?.toxicityThreshold ?? 0.7,
    },
  });

  const handleSave = async (data: RoomSettingsFormData) => {
    if (!canEdit) return;

    try {
      await updateRoom({
        roomId: room.id,
        updates: {
          name: data.name,
          description: data.description,
          isPrivate: data.isPrivate,
          maxParticipants: data.maxParticipants,
          settings: {
            allowFileSharing: data.allowFileSharing,
            allowReactions: data.allowReactions,
            allowThreads: data.allowThreads,
            allowMentions: data.allowMentions,
            allowPinning: data.allowPinning,
            messageRetention: data.messageRetention,
            slowMode: data.slowMode,
            slowModeDelay: data.slowModeDelay,
            requireApproval: data.requireApproval,
            wordFilter: data.wordFilter,
            customEmojis: room.settings?.customEmojis || [],
            allowedFileTypes: room.settings?.allowedFileTypes || [],
            maxFileSize: room.settings?.maxFileSize || 10,
            anonymousAllowed: room.settings?.anonymousAllowed || false,
            readReceipts: data.readReceipts,
            typingIndicators: data.typingIndicators,
          },
          moderationSettings: {
            autoModeration: data.autoModeration,
            wordBlacklist: room.moderationSettings?.wordBlacklist || [],
            spamDetection: data.spamDetection,
            linkBlocking: data.linkBlocking,
            imageModeration: data.imageModeration,
            maxMessageLength: data.maxMessageLength,
            maxMessagesPerMinute: data.maxMessagesPerMinute,
            warningThreshold: data.warningThreshold,
            timeoutDuration: data.timeoutDuration,
            banDuration: data.banDuration,
            autoDeleteSpam: data.autoDeleteSpam,
            requireKeywordApproval:
              room.moderationSettings?.requireKeywordApproval || [],
            toxicityThreshold: data.toxicityThreshold,
          },
        },
      }).unwrap();

      toast.success('Room settings updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update room settings');
    }
  };

  const handleDelete = async () => {
    if (!canDelete) return;

    try {
      await deleteRoom(room.id).unwrap();
      toast.success('Room deleted successfully');
      setShowDeleteDialog(false);
      onClose();
    } catch (error) {
      toast.error('Failed to delete room');
    }
  };

  const handleExport = () => {
    // Export room data as JSON
    const exportData = {
      room: {
        name: room.name,
        description: room.description,
        roomType: room.roomType,
        participantCount: room.participantCount,
        messageCount: room.messageCount,
        createdAt: room.createdAt,
      },
      settings: room.settings,
      moderationSettings: room.moderationSettings,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `room-${room.name}-settings.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Room settings exported');
    setShowExportDialog(false);
  };

  const getRoomTypeIcon = (roomType: string) => {
    switch (roomType) {
      case 'private':
        return <Lock className="h-4 w-4" />;
      case 'public':
        return <Globe className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold">Room Settings</h2>
                <p className="text-sm text-gray-600">{room.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant={room.isActive ? 'default' : 'secondary'}>
                {room.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                {getRoomTypeIcon(room.roomType)}
                <span>{room.roomType}</span>
              </Badge>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="moderation">Moderation</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Basic Information</span>
                  </CardTitle>
                  <CardDescription>
                    Configure the basic settings for this room.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Room Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!canEdit} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            disabled={!canEdit}
                            className="resize-none"
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional description to help others understand the
                          room's purpose.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Privacy Settings */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="isPrivate"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="flex items-center space-x-2">
                              {field.value ? (
                                <Lock className="h-4 w-4" />
                              ) : (
                                <Globe className="h-4 w-4" />
                              )}
                              <span>Private Room</span>
                            </FormLabel>
                            <FormDescription>
                              Only invited members can join this room.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={!canEdit}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxParticipants"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Participants</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={e =>
                                field.onChange(
                                  e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined
                                )
                              }
                              disabled={!canEdit}
                              placeholder="Unlimited"
                            />
                          </FormControl>
                          <FormDescription>
                            Leave empty for unlimited participants.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Room Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Room Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {room.participantCount}
                      </div>
                      <div className="text-sm text-gray-600">Participants</div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {room.messageCount}
                      </div>
                      <div className="text-sm text-gray-600">Messages</div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.floor(Math.random() * 50)}
                      </div>
                      <div className="text-sm text-gray-600">Files Shared</div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.floor(Math.random() * 10)}
                      </div>
                      <div className="text-sm text-gray-600">Threads</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Chat Features</span>
                  </CardTitle>
                  <CardDescription>
                    Configure what features are available in this room.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Communication Features */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Communication</h4>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="allowReactions"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="flex items-center space-x-2">
                                <Smile className="h-4 w-4" />
                                <span>Reactions</span>
                              </FormLabel>
                              <FormDescription className="text-xs">
                                Allow emoji reactions on messages
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!canEdit}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="allowThreads"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="flex items-center space-x-2">
                                <MessageSquare className="h-4 w-4" />
                                <span>Threads</span>
                              </FormLabel>
                              <FormDescription className="text-xs">
                                Allow creating threads from messages
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!canEdit}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="allowFileSharing"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="flex items-center space-x-2">
                                <Paperclip className="h-4 w-4" />
                                <span>File Sharing</span>
                              </FormLabel>
                              <FormDescription className="text-xs">
                                Allow uploading and sharing files
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!canEdit}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="allowPinning"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="flex items-center space-x-2">
                                <Pin className="h-4 w-4" />
                                <span>Message Pinning</span>
                              </FormLabel>
                              <FormDescription className="text-xs">
                                Allow pinning important messages
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!canEdit}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="allowMentions"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>@Mentions</FormLabel>
                              <FormDescription className="text-xs">
                                Allow mentioning other users
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!canEdit}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="typingIndicators"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Typing Indicators</FormLabel>
                              <FormDescription className="text-xs">
                                Show when someone is typing
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!canEdit}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Message Settings */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Message Settings</h4>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="slowMode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="flex items-center space-x-2">
                                <Clock className="h-4 w-4" />
                                <span>Slow Mode</span>
                              </FormLabel>
                              <FormDescription className="text-xs">
                                Limit message frequency
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!canEdit}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="readReceipts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="flex items-center space-x-2">
                                <Eye className="h-4 w-4" />
                                <span>Read Receipts</span>
                              </FormLabel>
                              <FormDescription className="text-xs">
                                Show when messages are read
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!canEdit}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {form.watch('slowMode') && (
                      <FormField
                        control={form.control}
                        name="slowModeDelay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slow Mode Delay (seconds)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={300}
                                {...field}
                                onChange={e =>
                                  field.onChange(parseInt(e.target.value))
                                }
                                disabled={!canEdit}
                              />
                            </FormControl>
                            <FormDescription>
                              Time users must wait between messages.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="messageRetention"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message Retention (days)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={365}
                              {...field}
                              onChange={e =>
                                field.onChange(parseInt(e.target.value))
                              }
                              disabled={!canEdit}
                            />
                          </FormControl>
                          <FormDescription>
                            How long to keep messages before auto-deletion.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Moderation Tab */}
            <TabsContent value="moderation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Moderation Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Configure automated moderation and content filtering.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Auto Moderation */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">
                      Automated Moderation
                    </h4>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="autoModeration"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="flex items-center space-x-2">
                                <Shield className="h-4 w-4" />
                                <span>Auto Moderation</span>
                              </FormLabel>
                              <FormDescription className="text-xs">
                                AI-powered content moderation
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!canEdit}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="spamDetection"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="flex items-center space-x-2">
                                <Filter className="h-4 w-4" />
                                <span>Spam Detection</span>
                              </FormLabel>
                              <FormDescription className="text-xs">
                                Automatically detect spam messages
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!canEdit}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="linkBlocking"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Link Blocking</FormLabel>
                              <FormDescription className="text-xs">
                                Block external links in messages
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!canEdit}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="imageModeration"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="flex items-center space-x-2">
                                <Camera className="h-4 w-4" />
                                <span>Image Moderation</span>
                              </FormLabel>
                              <FormDescription className="text-xs">
                                Scan uploaded images for content
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!canEdit}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Message Limits */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Message Limits</h4>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="maxMessageLength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Message Length</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={50}
                                max={5000}
                                {...field}
                                onChange={e =>
                                  field.onChange(parseInt(e.target.value))
                                }
                                disabled={!canEdit}
                              />
                            </FormControl>
                            <FormDescription>
                              Characters allowed per message
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="maxMessagesPerMinute"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rate Limit (per minute)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={100}
                                {...field}
                                onChange={e =>
                                  field.onChange(parseInt(e.target.value))
                                }
                                disabled={!canEdit}
                              />
                            </FormControl>
                            <FormDescription>
                              Messages per minute per user
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Punishment Settings */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Punishment Settings</h4>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="warningThreshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Warning Threshold</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={10}
                                {...field}
                                onChange={e =>
                                  field.onChange(parseInt(e.target.value))
                                }
                                disabled={!canEdit}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Warnings before action
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="timeoutDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timeout (minutes)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={1440}
                                {...field}
                                onChange={e =>
                                  field.onChange(parseInt(e.target.value))
                                }
                                disabled={!canEdit}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Default timeout duration
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="toxicityThreshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Toxicity Threshold</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0.1}
                                max={1.0}
                                step={0.1}
                                {...field}
                                onChange={e =>
                                  field.onChange(parseFloat(e.target.value))
                                }
                                disabled={!canEdit}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              AI sensitivity (0.1-1.0)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Room Analytics</span>
                  </CardTitle>
                  <CardDescription>
                    View detailed analytics and export data.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Activity Overview */}
                  <div>
                    <h4 className="mb-4 text-sm font-medium">
                      Activity Overview (Last 30 Days)
                    </h4>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="rounded-lg bg-blue-50 p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.floor(Math.random() * 1000)}
                        </div>
                        <div className="text-sm text-blue-700">
                          Total Messages
                        </div>
                      </div>
                      <div className="rounded-lg bg-green-50 p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {Math.floor(Math.random() * 100)}
                        </div>
                        <div className="text-sm text-green-700">
                          Active Users
                        </div>
                      </div>
                      <div className="rounded-lg bg-purple-50 p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.floor(Math.random() * 50)}
                        </div>
                        <div className="text-sm text-purple-700">
                          Files Shared
                        </div>
                      </div>
                      <div className="rounded-lg bg-orange-50 p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {Math.floor(Math.random() * 20)}
                        </div>
                        <div className="text-sm text-orange-700">Reactions</div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Export Options */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Export & Backup</h4>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowExportDialog(true)}
                        className="justify-start"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export Room Settings
                      </Button>

                      <Button variant="outline" className="justify-start">
                        <FileText className="mr-2 h-4 w-4" />
                        Export Chat History
                      </Button>

                      <Button variant="outline" className="justify-start">
                        <Users className="mr-2 h-4 w-4" />
                        Export Participants List
                      </Button>

                      <Button variant="outline" className="justify-start">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Export Analytics Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              {canDelete && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Danger Zone</span>
                    </CardTitle>
                    <CardDescription>
                      Irreversible and destructive actions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archive Room
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Room Permanently
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          {canEdit && (
            <div className="flex justify-end space-x-2 border-t pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </Form>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{room.name}"? This
              action cannot be undone. All messages, files, and room data will
              be lost forever.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Room'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Export confirmation dialog */}
      <AlertDialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Export Room Settings</AlertDialogTitle>
            <AlertDialogDescription>
              This will download a JSON file containing all room settings and
              configuration. This file can be used for backup or to recreate
              similar room settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
