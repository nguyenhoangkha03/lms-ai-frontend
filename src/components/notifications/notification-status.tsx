'use client';

import React from 'react';
import { Bell, BellOff, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNotificationPermissions } from '@/hooks/use-notification-permissions';
import { useNotifications } from '@/contexts/notification-context';

export function NotificationStatus() {
  const { permission, isSupported, requestPermission } =
    useNotificationPermissions();
  const { settings } = useNotifications();

  const getStatusInfo = () => {
    if (!isSupported) {
      return {
        status: 'unsupported',
        title: 'Not Supported',
        description: 'Your browser does not support notifications',
        variant: 'secondary' as const,
        icon: BellOff,
      };
    }

    switch (permission) {
      case 'granted':
        return {
          status: 'enabled',
          title: 'Notifications Enabled',
          description: 'You will receive browser notifications',
          variant: 'secondary' as const,
          icon: Bell,
        };
      case 'denied':
        return {
          status: 'denied',
          title: 'Notifications Blocked',
          description: 'Enable in browser settings to receive notifications',
          variant: 'destructive' as const,
          icon: BellOff,
        };
      default:
        return {
          status: 'default',
          title: 'Notifications Disabled',
          description: 'Click to enable browser notifications',
          variant: 'outline' as const,
          icon: Bell,
        };
    }
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  const enabledChannels = Object.entries(settings).filter(
    ([_, enabled]) => enabled
  ).length;
  const totalChannels = Object.keys(settings).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{statusInfo.title}</CardTitle>
              <CardDescription>{statusInfo.description}</CardDescription>
            </div>
          </div>
          <Badge variant={statusInfo.variant}>{statusInfo.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {enabledChannels}/{totalChannels} notification types enabled
          </div>
          <div className="flex gap-2">
            {permission === 'default' && (
              <Button size="sm" onClick={requestPermission}>
                Enable
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Settings className="mr-1 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
