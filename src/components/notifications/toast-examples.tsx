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
import { useToast } from './toast-provider';

export function ToastExamples() {
  const { success, error, warning, info, loading, promise, dismiss } =
    useToast();

  const handlePromiseExample = () => {
    const fakeApiCall = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5
          ? resolve('Success!')
          : reject(new Error('Failed!'));
      }, 2000);
    });

    promise(fakeApiCall, {
      loading: 'Processing your request...',
      success: data => `Request completed: ${data}`,
      error: error => `Request failed: ${error.message}`,
    });
  };

  const handleActionToast = () => {
    success('File uploaded successfully!', {
      description: 'Your document has been processed and is ready to use.',
      actions: [
        {
          label: 'View File',
          onClick: () => console.log('View file clicked'),
          variant: 'default',
        },
        {
          label: 'Share',
          onClick: () => console.log('Share clicked'),
          variant: 'outline',
        },
      ],
    });
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Toast Examples</CardTitle>
        <CardDescription>
          Various toast notifications demonstrating different types and
          features.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={() => success('Operation completed successfully!')}>
            Success Toast
          </Button>

          <Button onClick={() => error('Something went wrong!')}>
            Error Toast
          </Button>

          <Button onClick={() => warning('Please review your settings')}>
            Warning Toast
          </Button>

          <Button onClick={() => info('New feature available!')}>
            Info Toast
          </Button>

          <Button onClick={() => loading('Processing...')}>
            Loading Toast
          </Button>

          <Button onClick={handlePromiseExample}>Promise Toast</Button>

          <Button onClick={handleActionToast}>Toast with Actions</Button>

          <Button onClick={() => dismiss()} variant="outline">
            Dismiss All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
