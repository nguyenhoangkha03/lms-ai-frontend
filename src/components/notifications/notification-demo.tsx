'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationCenter } from './notification-center';
import { NotificationBell } from './notification-bell';
import { NotificationPermissionPrompt } from './notification-permission-prompt';
import { NotificationStatus } from './notification-status';
import { ToastExamples } from './toast-examples';
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';
import type { Notification } from '@/lib/types';

export function NotificationDemo() {
  const { handleNotification } = useRealtimeNotifications();

  const createMockNotification = (
    type: Notification['type'],
    overrides: Partial<Notification> = {}
  ): Notification => ({
    id: Date.now().toString() + Math.random(),
    userId: '1',
    priority: 'normal',
    type,
    title: 'Sample Notification',
    message: 'This is a sample notification message',
    createdAt: new Date().toISOString(),
    isRead: false,
    ...overrides,
  });

  const addAcademicNotification = () => {
    const notification = createMockNotification('academic', {
      title: 'New Course Material Available',
      message: 'Week 5 materials for Advanced React have been uploaded',
      description:
        'Includes video lectures, assignments, and reading materials',
      category: 'Course Update',
      actionUrl: '/courses/advanced-react/week-5',
      actions: [
        {
          label: 'View Materials',
          id: 'view-materials',
          handler: () => console.log('View materials clicked'),
        },
        {
          label: 'Remind Later',
          id: 'remind-later',
          handler: () => console.log('Remind later clicked'),
        },
      ],
    });
    handleNotification(notification);
  };

  const addSocialNotification = () => {
    const notification = createMockNotification('social', {
      title: 'New Discussion Reply',
      message: 'Sarah commented on your post in "React Best Practices"',
      description: '"Great point about hooks! I have a follow-up question..."',
      category: 'Discussion',
      avatar: 'https://github.com/shadcn.png',
      actionUrl: '/discussions/react-best-practices',
    });
    handleNotification(notification);
  };

  const addSystemNotification = () => {
    const notification = createMockNotification('system', {
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight from 2-4 AM EST',
      description:
        'Some features may be temporarily unavailable during this time',
      category: 'System Alert',
      priority: 'high',
    });
    handleNotification(notification);
  };

  const addAchievementNotification = () => {
    const notification = createMockNotification('success', {
      title: 'Achievement Unlocked!',
      message: 'You earned the "Quick Learner" badge',
      description: 'Completed 5 lessons in a single day',
      category: 'Achievement',
      iconUrl: '🏆',
      actionUrl: '/profile/achievements',
    });
    handleNotification(notification);
  };

  return (
    <div className="container mx-auto space-y-8 py-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Notification System Demo</h1>
        <p className="text-muted-foreground">
          Complete notification system with real-time updates, toast messages,
          and preference management.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="center">Notification Center</TabsTrigger>
          <TabsTrigger value="toasts">Toast System</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="realtime">Real-time Demo</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Notification Bell</CardTitle>
                <CardDescription>
                  Click to open the notification center
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <NotificationBell />
                  <NotificationBell variant="compact" />
                  <NotificationBell variant="sidebar" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>
                  Current notification settings and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationStatus />
              </CardContent>
            </Card>
          </div>

          <NotificationPermissionPrompt />
        </TabsContent>

        <TabsContent value="center" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Center</CardTitle>
              <CardDescription>
                Centralized view of all notifications with filtering and actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <NotificationCenter
                  trigger={<Button>Open Notification Center</Button>}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="toasts" className="space-y-6">
          <ToastExamples />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Browser Permissions</CardTitle>
              <CardDescription>
                Manage browser notification permissions and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationStatus />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Notification Demo</CardTitle>
              <CardDescription>
                Simulate different types of notifications that would come from
                the server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={addAcademicNotification}>Course Update</Button>
                <Button onClick={addSocialNotification}>
                  Discussion Reply
                </Button>
                <Button onClick={addSystemNotification}>System Alert</Button>
                <Button onClick={addAchievementNotification}>
                  Achievement
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                These notifications will appear in the notification center and
                as toast messages (if enabled in settings). Browser
                notifications will also show if permission is granted.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
