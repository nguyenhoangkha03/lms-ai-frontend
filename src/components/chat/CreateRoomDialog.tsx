'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Hash,
  MessageSquare,
  Users,
  Volume2,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Settings,
  Paperclip,
} from 'lucide-react';
import { CreateRoomRequest } from '@/lib/types/chat';

// Cách 1: Sử dụng transform để đảm bảo kiểu dữ liệu chính xác
const createRoomSchema = z.object({
  name: z
    .string()
    .min(1, 'Room name is required')
    .max(50, 'Room name must be less than 50 characters'),
  description: z
    .string()
    .max(200, 'Description must be less than 200 characters')
    .optional(),
  roomType: z.enum([
    'general',
    'course',
    'lesson',
    'study_group',
    'office_hours',
    'help_desk',
    'announcements',
    'private',
    'public',
  ]),
  courseId: z.string().optional(),
  lessonId: z.string().optional(),
  isPrivate: z.boolean().transform(val => val ?? false),
  maxParticipants: z
    .number()
    .min(2, 'Minimum 2 participants')
    .max(1000, 'Maximum 1000 participants')
    .optional(),

  // Room Settings
  allowFileSharing: z.boolean().transform(val => val ?? true),
  allowReactions: z.boolean().transform(val => val ?? true),
  allowThreads: z.boolean().transform(val => val ?? true),
  allowMentions: z.boolean().transform(val => val ?? true),
  allowPinning: z.boolean().transform(val => val ?? true),
  messageRetention: z
    .number()
    .min(1)
    .max(365)
    .transform(val => val ?? 30),
  slowMode: z.boolean().transform(val => val ?? false),
  slowModeDelay: z
    .number()
    .min(1)
    .max(300)
    .transform(val => val ?? 5),
  requireApproval: z.boolean().transform(val => val ?? false),
  wordFilter: z.boolean().transform(val => val ?? false),
  anonymousAllowed: z.boolean().transform(val => val ?? false),
  readReceipts: z.boolean().transform(val => val ?? true),
  typingIndicators: z.boolean().transform(val => val ?? true),

  // Moderation Settings
  autoModeration: z.boolean().transform(val => val ?? false),
  spamDetection: z.boolean().transform(val => val ?? true),
  linkBlocking: z.boolean().transform(val => val ?? false),
  imageModeration: z.boolean().transform(val => val ?? false),
  maxMessageLength: z
    .number()
    .min(50)
    .max(5000)
    .transform(val => val ?? 2000),
  maxMessagesPerMinute: z
    .number()
    .min(1)
    .max(100)
    .transform(val => val ?? 10),
  warningThreshold: z
    .number()
    .min(1)
    .max(10)
    .transform(val => val ?? 3),
  timeoutDuration: z
    .number()
    .min(1)
    .max(1440)
    .transform(val => val ?? 10),
  banDuration: z
    .number()
    .min(1)
    .max(43200)
    .transform(val => val ?? 1440),
  autoDeleteSpam: z.boolean().transform(val => val ?? false),
  toxicityThreshold: z
    .number()
    .min(0.1)
    .max(1.0)
    .transform(val => val ?? 0.7),
});

type CreateRoomFormData = z.infer<typeof createRoomSchema>;

interface CreateRoomDialogProps {
  onSubmit: (data: CreateRoomRequest) => void;
  onCancel: () => void;
  courseId?: string;
  lessonId?: string;
}

export function CreateRoomDialog({
  onSubmit,
  onCancel,
  courseId,
  lessonId,
}: CreateRoomDialogProps) {
  const form = useForm<CreateRoomFormData>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: '',
      description: '',
      roomType: 'general',
      courseId,
      lessonId,
      isPrivate: false,
      allowFileSharing: true,
      allowReactions: true,
      allowThreads: true,
      allowMentions: true,
      allowPinning: true,
      messageRetention: 30,
      slowMode: false,
      slowModeDelay: 5,
      requireApproval: false,
      wordFilter: false,
      anonymousAllowed: false,
      readReceipts: true,
      typingIndicators: true,
      autoModeration: false,
      spamDetection: true,
      linkBlocking: false,
      imageModeration: false,
      maxMessageLength: 2000,
      maxMessagesPerMinute: 10,
      warningThreshold: 3,
      timeoutDuration: 10,
      banDuration: 1440,
      autoDeleteSpam: false,
      toxicityThreshold: 0.7,
      maxParticipants: undefined,
    },
  });

  const roomTypeOptions = [
    {
      value: 'general',
      label: 'General',
      description: 'General discussion room',
      icon: Hash,
    },
    {
      value: 'course',
      label: 'Course',
      description: 'Course-specific discussions',
      icon: MessageSquare,
    },
    {
      value: 'lesson',
      label: 'Lesson',
      description: 'Lesson-specific chat',
      icon: MessageSquare,
    },
    {
      value: 'study_group',
      label: 'Study Group',
      description: 'Student study group',
      icon: Users,
    },
    {
      value: 'office_hours',
      label: 'Office Hours',
      description: 'Teacher office hours',
      icon: Users,
    },
    {
      value: 'help_desk',
      label: 'Help Desk',
      description: 'Support and help',
      icon: Shield,
    },
    {
      value: 'announcements',
      label: 'Announcements',
      description: 'Important announcements only',
      icon: Volume2,
    },
    {
      value: 'private',
      label: 'Private',
      description: 'Private conversation',
      icon: Eye,
    },
    {
      value: 'public',
      label: 'Public',
      description: 'Public discussion',
      icon: EyeOff,
    },
  ];

  const handleSubmit = (data: CreateRoomFormData) => {
    const roomData: CreateRoomRequest = {
      name: data.name,
      description: data.description,
      roomType: data.roomType,
      courseId: data.courseId,
      lessonId: data.lessonId,
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
        customEmojis: [],
        allowedFileTypes: ['image/*', 'text/*', 'application/pdf'],
        maxFileSize: 10,
        anonymousAllowed: data.anonymousAllowed,
        readReceipts: data.readReceipts,
        typingIndicators: data.typingIndicators,
      },
      moderationSettings: {
        autoModeration: data.autoModeration,
        wordBlacklist: [],
        spamDetection: data.spamDetection,
        linkBlocking: data.linkBlocking,
        imageModeration: data.imageModeration,
        maxMessageLength: data.maxMessageLength,
        maxMessagesPerMinute: data.maxMessagesPerMinute,
        warningThreshold: data.warningThreshold,
        timeoutDuration: data.timeoutDuration,
        banDuration: data.banDuration,
        autoDeleteSpam: data.autoDeleteSpam,
        requireKeywordApproval: [],
        toxicityThreshold: data.toxicityThreshold,
      },
    };

    onSubmit(roomData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
                <CardDescription>
                  Configure the basic settings for your chat room.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Room Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter room name..." {...field} />
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
                          placeholder="Describe what this room is for..."
                          className="resize-none"
                          {...field}
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

                {/* Room Type */}
                <FormField
                  control={form.control}
                  name="roomType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select room type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roomTypeOptions.map(option => {
                            const Icon = option.icon;
                            return (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                <div className="flex items-center space-x-2">
                                  <Icon className="h-4 w-4" />
                                  <div>
                                    <div className="font-medium">
                                      {option.label}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {option.description}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Privacy Settings */}
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="isPrivate"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
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
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allowThreads"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4" />
                            <span>Allow Threads</span>
                          </FormLabel>
                          <FormDescription>
                            Users can create threads from messages.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allowFileSharing"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center space-x-2">
                            <Paperclip className="h-4 w-4" />
                            <span>Allow File Sharing</span>
                          </FormLabel>
                          <FormDescription>
                            Users can upload and share files.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allowMentions"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Allow @Mentions</FormLabel>
                          <FormDescription>
                            Users can mention others with @username.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allowPinning"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Allow Message Pinning</FormLabel>
                          <FormDescription>
                            Moderators can pin important messages.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* User Experience */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">User Experience</h4>

                  <FormField
                    control={form.control}
                    name="readReceipts"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Read Receipts</FormLabel>
                          <FormDescription>
                            Show when messages have been read.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="typingIndicators"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Typing Indicators</FormLabel>
                          <FormDescription>
                            Show when someone is typing.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slowMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Slow Mode</FormLabel>
                          <FormDescription>
                            Limit how often users can send messages.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

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
                </div>

                <Separator />

                {/* Data Retention */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Data Management</h4>

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
              <CardContent className="space-y-4">
                {/* Auto Moderation */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Automated Moderation</h4>

                  <FormField
                    control={form.control}
                    name="autoModeration"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Enable Auto Moderation</FormLabel>
                          <FormDescription>
                            Automatically moderate content using AI.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="spamDetection"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Spam Detection</FormLabel>
                          <FormDescription>
                            Automatically detect and filter spam.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="linkBlocking"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Block External Links</FormLabel>
                          <FormDescription>
                            Prevent users from posting external links.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageModeration"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Image Moderation</FormLabel>
                          <FormDescription>
                            Automatically scan uploaded images.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Message Limits */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Message Limits</h4>

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
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum characters allowed per message.
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
                        <FormLabel>Max Messages Per Minute</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            {...field}
                            onChange={e =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Rate limit for message sending.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Punishment Settings */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Punishment Settings</h4>

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
                          />
                        </FormControl>
                        <FormDescription>
                          Number of warnings before automatic action.
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
                        <FormLabel>Timeout Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={1440}
                            {...field}
                            onChange={e =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Default timeout duration for violations.
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
                          />
                        </FormControl>
                        <FormDescription>
                          AI toxicity detection sensitivity (0.1 = very
                          sensitive, 1.0 = only extreme).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Advanced Options */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Advanced Options</h4>

                  <FormField
                    control={form.control}
                    name="requireApproval"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Require Message Approval</FormLabel>
                          <FormDescription>
                            All messages must be approved by moderators.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="autoDeleteSpam"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Auto-Delete Spam</FormLabel>
                          <FormDescription>
                            Automatically delete detected spam messages.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="anonymousAllowed"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Allow Anonymous Messages</FormLabel>
                          <FormDescription>
                            Users can send messages anonymously.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Create Room</Button>
        </div>
      </form>
    </Form>
  );
}
