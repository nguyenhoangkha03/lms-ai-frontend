'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, Video, Settings, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { useToast } from '@/hooks/use-toast';

import { useCreateLiveSessionMutation, CreateLiveSessionRequest } from '@/lib/redux/api/teacher-live-sessions-api';

const sessionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  courseId: z.string().optional(),
  scheduledStart: z.date(),
  scheduledEnd: z.date(),
  maxParticipants: z.number().min(1).max(1000),
  isRecorded: z.boolean(),
  settings: z.object({
    allowChat: z.boolean(),
    allowMicrophone: z.boolean(),
    allowCamera: z.boolean(),
    allowScreenShare: z.boolean(),
    recordSession: z.boolean(),
    requireApproval: z.boolean(),
  }),
});

type SessionFormData = z.infer<typeof sessionSchema>;

interface CreateSessionDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateSessionDialog({
  onClose,
  onSuccess,
}: CreateSessionDialogProps) {
  const { toast } = useToast();
  const [createSession, { isLoading }] = useCreateLiveSessionMutation();
  const [activeTab, setActiveTab] = useState('basic');

  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: '',
      description: '',
      courseId: undefined,
      scheduledStart: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      scheduledEnd: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      maxParticipants: 50,
      isRecorded: false,
      settings: {
        allowChat: true,
        allowMicrophone: false,
        allowCamera: false,
        allowScreenShare: true,
        recordSession: false,
        requireApproval: false,
      },
    },
  });

  const onSubmit = async (data: SessionFormData) => {
    try {
      // Validate dates
      if (data.scheduledEnd <= data.scheduledStart) {
        toast({
          title: 'Invalid Schedule',
          description: 'End time must be after start time.',
          variant: 'destructive',
        });
        return;
      }

      const duration = Math.round((data.scheduledEnd.getTime() - data.scheduledStart.getTime()) / (1000 * 60)); // duration in minutes
      
      const sessionData: CreateLiveSessionRequest = {
        title: data.title,
        description: data.description || '',
        courseId: data.courseId && data.courseId.trim() !== '' ? data.courseId : undefined,
        scheduledAt: data.scheduledStart.toISOString(),
        duration: duration,
        maxParticipants: data.maxParticipants,
        isRecorded: data.isRecorded,
        settings: data.settings,
      };

      await createSession(sessionData).unwrap();
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create session. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Schedule Live Session</h2>
        <p className="text-muted-foreground">
          Create a new live teaching session with custom settings.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Basic Information */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Video className="mr-2 h-5 w-5" />
                    Session Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter session title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what this session will cover..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional description that participants will see.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="courseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course ID (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter course ID" {...field} />
                        </FormControl>
                        <FormDescription>
                          Link this session to a specific course.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedule & Capacity */}
            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule & Capacity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="scheduledStart"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time *</FormLabel>
                          <FormControl>
                            <DateTimePicker
                              value={field.value instanceof Date ? field.value : new Date(field.value)}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="scheduledEnd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time *</FormLabel>
                          <FormControl>
                            <DateTimePicker
                              value={field.value instanceof Date ? field.value : new Date(field.value)}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="maxParticipants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Participants</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={1000}
                            {...field}
                            onChange={e =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum number of participants allowed in this
                          session.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isRecorded"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Record Session</FormLabel>
                          <FormDescription>
                            Enable recording for this session.
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Session Settings */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Session Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Participant Controls</h4>

                      <FormField
                        control={form.control}
                        name="settings.allowChat"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel className="text-sm">
                              Allow Chat
                            </FormLabel>
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
                        name="settings.allowMicrophone"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel className="text-sm">
                              Allow Microphone
                            </FormLabel>
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
                        name="settings.allowCamera"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel className="text-sm">
                              Allow Camera
                            </FormLabel>
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

                    <div className="space-y-4">
                      <h4 className="font-medium">Session Features</h4>

                      <FormField
                        control={form.control}
                        name="settings.allowScreenShare"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel className="text-sm">
                              Allow Screen Share
                            </FormLabel>
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
                        name="settings.recordSession"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel className="text-sm">
                              Record Session
                            </FormLabel>
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
                        name="settings.requireApproval"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel className="text-sm">
                              Require Approval
                            </FormLabel>
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-between border-t pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <div className="flex space-x-2">
              {activeTab !== 'basic' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const tabs = ['basic', 'schedule', 'settings'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1]);
                    }
                  }}
                >
                  Previous
                </Button>
              )}

              {activeTab !== 'settings' ? (
                <Button
                  type="button"
                  onClick={() => {
                    const tabs = ['basic', 'schedule', 'settings'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1]);
                    }
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Session'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
