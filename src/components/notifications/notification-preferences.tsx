'use client';

import React from 'react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FormSection } from '@/components/forms/form-section';
import { FormFieldWrapper } from '@/components/forms/form-field-wrapper';
import { FormSwitch } from '@/components/ui/form-fields/form-switch';
import { FormSelect } from '@/components/ui/form-fields/form-select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useFormWithSchema } from '@/hooks/use-form-with-schema';
import { useNotifications } from '@/contexts/notification-context';
import { useToast } from './toast-provider';
import { Mail, Smartphone, Monitor } from 'lucide-react';
import { z } from 'zod';

const notificationPreferencesSchema = z.object({
  email: z.object({
    courseUpdates: z.boolean(),
    assignments: z.boolean(),
    messages: z.boolean(),
    achievements: z.boolean(),
    systemAlerts: z.boolean(),
    marketing: z.boolean(),
    weeklyDigest: z.boolean(),
  }),
  push: z.object({
    courseUpdates: z.boolean(),
    assignments: z.boolean(),
    messages: z.boolean(),
    achievements: z.boolean(),
    systemAlerts: z.boolean(),
  }),
  inApp: z.object({
    courseUpdates: z.boolean(),
    assignments: z.boolean(),
    messages: z.boolean(),
    achievements: z.boolean(),
    systemAlerts: z.boolean(),
    socialActivity: z.boolean(),
  }),
  general: z.object({
    soundEnabled: z.boolean(),
    quietHours: z.boolean(),
    quietStart: z.string(),
    quietEnd: z.string(),
    frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']),
  }),
});

type NotificationPreferencesData = z.infer<
  typeof notificationPreferencesSchema
>;

export function NotificationPreferences() {
  const { settings, updateNotificationSettings } = useNotifications();
  const { success } = useToast();

  const form = useFormWithSchema({
    schema: notificationPreferencesSchema,
    defaultValues: {
      email: {
        courseUpdates: true,
        assignments: true,
        messages: true,
        achievements: true,
        systemAlerts: true,
        marketing: false,
        weeklyDigest: true,
      },
      push: {
        courseUpdates: true,
        assignments: true,
        messages: true,
        achievements: false,
        systemAlerts: true,
      },
      inApp: {
        courseUpdates: true,
        assignments: true,
        messages: true,
        achievements: true,
        systemAlerts: true,
        socialActivity: true,
      },
      general: {
        soundEnabled: true,
        quietHours: false,
        quietStart: '22:00',
        quietEnd: '08:00',
        frequency: 'immediate',
      },
    },
  });

  const frequencyOptions = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'hourly', label: 'Hourly digest' },
    { value: 'daily', label: 'Daily digest' },
    { value: 'weekly', label: 'Weekly digest' },
  ];

  const handleSubmit = async (data: NotificationPreferencesData) => {
    // Update notification settings
    updateNotificationSettings({
      email: data.email.courseUpdates,
      push: data.push.courseUpdates,
      inApp: data.inApp.courseUpdates,
    });

    success('Notification preferences updated successfully!');
  };

  const notificationChannels = [
    {
      id: 'email',
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: Mail,
      settings: form.watch('email'),
    },
    {
      id: 'push',
      title: 'Push Notifications',
      description: 'Browser and mobile push notifications',
      icon: Smartphone,
      settings: form.watch('push'),
    },
    {
      id: 'inApp',
      title: 'In-App Notifications',
      description: 'Notifications within the application',
      icon: Monitor,
      settings: form.watch('inApp'),
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Notification Preferences</h1>
        <p className="text-muted-foreground">
          Customize how and when you receive notifications to stay informed
          without being overwhelmed.
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(handleSubmit as any)}
        className="space-y-6"
      >
        {/* Notification Channels */}
        <div className="grid gap-6 md:grid-cols-3">
          {notificationChannels.map(channel => {
            const Icon = channel.icon;
            const enabledCount = Object.values(channel.settings || {}).filter(
              Boolean
            ).length;
            const totalCount = Object.keys(channel.settings || {}).length;

            return (
              <Card key={channel.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {channel.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {channel.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {enabledCount}/{totalCount} enabled
                  </Badge>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Email Notifications */}
        <FormSection title="Email Notifications" variant="card">
          <div className="space-y-4">
            <FormFieldWrapper form={form} name="email.courseUpdates">
              {field => (
                <FormSwitch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  description="Course announcements, updates, and new content"
                >
                  Course Updates
                </FormSwitch>
              )}
            </FormFieldWrapper>

            <FormFieldWrapper form={form} name="email.assignments">
              {field => (
                <FormSwitch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  description="Assignment deadlines and grading updates"
                >
                  Assignments & Grades
                </FormSwitch>
              )}
            </FormFieldWrapper>

            <FormFieldWrapper form={form} name="email.messages">
              {field => (
                <FormSwitch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  description="Direct messages and discussion replies"
                >
                  Messages
                </FormSwitch>
              )}
            </FormFieldWrapper>

            <FormFieldWrapper form={form} name="email.achievements">
              {field => (
                <FormSwitch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  description="Certificates, badges, and milestone achievements"
                >
                  Achievements
                </FormSwitch>
              )}
            </FormFieldWrapper>

            <FormFieldWrapper form={form} name="email.systemAlerts">
              {field => (
                <FormSwitch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  description="System maintenance and security alerts"
                >
                  System Alerts
                </FormSwitch>
              )}
            </FormFieldWrapper>

            <Separator />

            <FormFieldWrapper form={form} name="email.weeklyDigest">
              {field => (
                <FormSwitch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  description="Weekly summary of your learning progress"
                >
                  Weekly Digest
                </FormSwitch>
              )}
            </FormFieldWrapper>

            <FormFieldWrapper form={form} name="email.marketing">
              {field => (
                <FormSwitch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  description="New features, course recommendations, and promotional content"
                >
                  Marketing & Promotions
                </FormSwitch>
              )}
            </FormFieldWrapper>
          </div>
        </FormSection>

        {/* Push Notifications */}
        <FormSection title="Push Notifications" variant="card">
          <div className="space-y-4">
            <FormFieldWrapper form={form} name="push.courseUpdates">
              {field => (
                <FormSwitch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  description="Immediate notifications for course updates"
                >
                  Course Updates
                </FormSwitch>
              )}
            </FormFieldWrapper>

            <FormFieldWrapper form={form} name="push.assignments">
              {field => (
                <FormSwitch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  description="Assignment reminders and due dates"
                >
                  Assignment Reminders
                </FormSwitch>
              )}
            </FormFieldWrapper>

            <FormFieldWrapper form={form} name="push.messages">
              {field => (
                <FormSwitch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  description="New messages and discussion activity"
                >
                  Messages
                </FormSwitch>
              )}
            </FormFieldWrapper>

            <FormFieldWrapper form={form} name="push.systemAlerts">
              {field => (
                <FormSwitch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  description="Critical system notifications"
                >
                  System Alerts
                </FormSwitch>
              )}
            </FormFieldWrapper>
          </div>
        </FormSection>

        {/* General Settings */}
        <FormSection title="General Settings" variant="card">
          <div className="space-y-4">
            <FormFieldWrapper form={form} name="general.soundEnabled">
              {field => (
                <FormSwitch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  description="Play sound for notifications"
                >
                  Sound Notifications
                </FormSwitch>
              )}
            </FormFieldWrapper>

            <FormFieldWrapper
              form={form}
              name="general.frequency"
              label="Notification Frequency"
              description="How often you want to receive notifications"
            >
              {field => (
                <FormSelect
                  {...field}
                  placeholder="Select frequency"
                  options={frequencyOptions}
                />
              )}
            </FormFieldWrapper>

            <div className="space-y-3">
              <FormFieldWrapper form={form} name="general.quietHours">
                {field => (
                  <FormSwitch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    description="Disable notifications during specified hours"
                  >
                    Quiet Hours
                  </FormSwitch>
                )}
              </FormFieldWrapper>

              {form.watch('general.quietHours') && (
                <div className="ml-6 grid grid-cols-2 gap-4">
                  <FormFieldWrapper
                    form={form}
                    name="general.quietStart"
                    label="Start Time"
                  >
                    {field => (
                      <input
                        type="time"
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    )}
                  </FormFieldWrapper>

                  <FormFieldWrapper
                    form={form}
                    name="general.quietEnd"
                    label="End Time"
                  >
                    {field => (
                      <input
                        type="time"
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    )}
                  </FormFieldWrapper>
                </div>
              )}
            </div>
          </div>
        </FormSection>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" className="w-32">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
