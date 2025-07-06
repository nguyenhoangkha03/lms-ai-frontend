'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4 text-center">
        <AlertTriangle className="text-destructive h-8 w-8" />
        <h2 className="text-lg font-semibold">Something went wrong!</h2>
        <p className="text-muted-foreground max-w-md text-sm">
          An unexpected error occurred. Please try again or contact support if
          the problem persists.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
