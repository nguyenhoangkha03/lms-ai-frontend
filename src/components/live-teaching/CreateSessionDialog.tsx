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

import type { CreateVideoSessionDto } from '@/lib/types/live-teaching';
import { useCreateVideoSessionMutation } from '@/lib/redux/api/live-teaching-api';

const sessionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  sessionType: z.enum([
    'meeting',
    'webinar',
    'lecture',
    'tutorial',
    'office_hours',
    'study_group',
    'exam',
    'workshop',
  ]),
  scheduledStart: z.date(),
  scheduledEnd: z.date(),
  maxParticipants: z.number().min(1).max(1000),
  provider: z.enum([
    'webrtc',
    'zoom',
    'teams',
    'meet',
    'jitsi',
    'bigbluebutton',
    'custom',
  ]),
  requiresRegistration: z.boolean(),
  waitingRoomEnabled: z.boolean(),
  courseId: z.string().optional(),
  lessonId: z.string().optional(),
  agenda: z.string().optional(),
  settings: z.object({
    allowChat: z.boolean(),
    allowScreenShare: z.boolean(),
    allowRecording: z.boolean(),
    muteOnEntry: z.boolean(),
    videoOnEntry: z.boolean(),
    allowBreakoutRooms: z.boolean(),
    allowPolls: z.boolean(),
    allowWhiteboard: z.boolean(),
    allowFileSharing: z.boolean(),
    maxParticipants: z.number(),
  }),
  securitySettings: z.object({
    requirePassword: z.boolean(),
    password: z.string().optional(),
    onlyAuthenticatedUsers: z.boolean(),
    enableLobby: z.boolean(),
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
  const [createSession, { isLoading }] = useCreateVideoSessionMutation();
  const [activeTab, setActiveTab] = useState('basic');

  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: '',
      description: '',
      sessionType: 'lecture',
      scheduledStart: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      scheduledEnd: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      maxParticipants: 50,
      provider: 'webrtc',
      requiresRegistration: false,
      waitingRoomEnabled: true,
      settings: {
        allowChat: true,
        allowScreenShare: true,
        allowRecording: true,
        muteOnEntry: true,
        videoOnEntry: false,
        allowBreakoutRooms: true,
        allowPolls: true,
        allowWhiteboard: true,
        allowFileSharing: true,
        maxParticipants: 50,
      },
      securitySettings: {
        requirePassword: false,
        onlyAuthenticatedUsers: true,
        enableLobby: true,
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

      const sessionData: CreateVideoSessionDto = {
        title: data.title,
        description: data.description,
        sessionType: data.sessionType,
        scheduledStart: data.scheduledStart.toISOString(),
        scheduledEnd: data.scheduledEnd.toISOString(),
        maxParticipants: data.maxParticipants,
        provider: data.provider,
        requiresRegistration: data.requiresRegistration,
        waitingRoomEnabled: data.waitingRoomEnabled,
        courseId: data.courseId,
        lessonId: data.lessonId,
        agenda: data.agenda,
        settings: data.settings,
        securitySettings: data.securitySettings,
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="sessionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Session Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="lecture">Lecture</SelectItem>
                              <SelectItem value="tutorial">Tutorial</SelectItem>
                              <SelectItem value="office_hours">
                                Office Hours
                              </SelectItem>
                              <SelectItem value="study_group">
                                Study Group
                              </SelectItem>
                              <SelectItem value="workshop">Workshop</SelectItem>
                              <SelectItem value="exam">Exam</SelectItem>
                              <SelectItem value="meeting">Meeting</SelectItem>
                              <SelectItem value="webinar">Webinar</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="provider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video Provider</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select provider" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="webrtc">
                                WebRTC (Built-in)
                              </SelectItem>
                              <SelectItem value="zoom">Zoom</SelectItem>
                              <SelectItem value="teams">
                                Microsoft Teams
                              </SelectItem>
                              <SelectItem value="meet">Google Meet</SelectItem>
                              <SelectItem value="jitsi">Jitsi Meet</SelectItem>
                              <SelectItem value="bigbluebutton">
                                BigBlueButton
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="agenda"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agenda</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Session agenda or outline..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Detailed agenda that will be shared with participants.
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
                              value={field.value.toDateString()}
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
                              value={field.value.toDateString()}
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

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="requiresRegistration"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Require Registration</FormLabel>
                            <FormDescription>
                              Participants must register before joining.
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
                      name="waitingRoomEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Enable Waiting Room</FormLabel>
                            <FormDescription>
                              Hold participants in a waiting room before
                              admission.
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
                        name="settings.muteOnEntry"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel className="text-sm">
                              Mute on Entry
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
                        name="settings.videoOnEntry"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel className="text-sm">
                              Video on Entry
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
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Interactive Features</h4>

                      <FormField
                        control={form.control}
                        name="settings.allowBreakoutRooms"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel className="text-sm">
                              Breakout Rooms
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
                        name="settings.allowPolls"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel className="text-sm">Polls</FormLabel>
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
                        name="settings.allowWhiteboard"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel className="text-sm">
                              Whiteboard
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
                        name="settings.allowFileSharing"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel className="text-sm">
                              File Sharing
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

                  <div className="border-t pt-4">
                    <FormField
                      control={form.control}
                      name="settings.allowRecording"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel>Allow Recording</FormLabel>
                            <FormDescription>
                              Enable session recording functionality.
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

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="mr-2 h-5 w-5" />
                    Security & Access Control
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="securitySettings.onlyAuthenticatedUsers"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Authenticated Users Only</FormLabel>
                          <FormDescription>
                            Only logged-in users can join this session.
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
                    name="securitySettings.enableLobby"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Enable Lobby</FormLabel>
                          <FormDescription>
                            Participants wait for host approval before joining.
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
                    name="securitySettings.requirePassword"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Require Password</FormLabel>
                          <FormDescription>
                            Participants need a password to join.
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

                  {form.watch('securitySettings.requirePassword') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <FormField
                        control={form.control}
                        name="securitySettings.password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Session Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter session password"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Password that participants will need to enter.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}

                  <div className="mt-6 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 text-amber-500" />
                      <div>
                        <h4 className="font-medium text-amber-800 dark:text-amber-200">
                          Security Recommendations
                        </h4>
                        <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-300">
                          <li>
                            • Enable waiting room for better control over
                            participants
                          </li>
                          <li>• Use passwords for sensitive sessions</li>
                          <li>
                            • Restrict to authenticated users for internal
                            sessions
                          </li>
                          <li>• Enable lobby for additional screening</li>
                        </ul>
                      </div>
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
                    const tabs = ['basic', 'schedule', 'settings', 'security'];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1]);
                    }
                  }}
                >
                  Previous
                </Button>
              )}

              {activeTab !== 'security' ? (
                <Button
                  type="button"
                  onClick={() => {
                    const tabs = ['basic', 'schedule', 'settings', 'security'];
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
