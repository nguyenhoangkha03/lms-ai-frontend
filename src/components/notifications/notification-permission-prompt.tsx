'use client';

import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useNotificationPermissions } from '@/hooks/use-notification-permissions';
import { useLocalStorage } from '@/hooks/use-local-storage';

export function NotificationPermissionPrompt() {
  const { permission, isSupported, requestPermission } =
    useNotificationPermissions();
  const [dismissed, setDismissed] = useLocalStorage(
    'notification-prompt-dismissed',
    false
  );
  const [isRequesting, setIsRequesting] = useState(false);

  if (!isSupported || permission === 'granted' || dismissed) {
    return null;
  }

  const handleRequest = async () => {
    setIsRequesting(true);
    const granted = await requestPermission();
    setIsRequesting(false);

    if (granted || permission === 'denied') {
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Enable Notifications</CardTitle>
              <CardDescription>
                Stay updated with course announcements, assignment deadlines,
                and messages.
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-1 -mt-1 h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-3">
          <Button onClick={handleRequest} disabled={isRequesting} size="sm">
            {isRequesting ? 'Requesting...' : 'Enable Notifications'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            Maybe Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
