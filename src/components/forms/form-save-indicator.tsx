'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FormSaveIndicatorProps {
  isSaving?: boolean;
  lastSaved?: Date | null;
  saveError?: string | null;
  className?: string;
}

export function FormSaveIndicator({
  isSaving = false,
  lastSaved = null,
  saveError = null,
  className,
}: FormSaveIndicatorProps) {
  if (saveError) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-sm text-destructive',
          className
        )}
      >
        <AlertCircle className="h-4 w-4" />
        <span>Save failed: {saveError}</span>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-sm text-muted-foreground',
          className
        )}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-sm text-muted-foreground',
          className
        )}
      >
        <Check className="h-4 w-4 text-green-500" />
        <span>Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm text-muted-foreground',
        className
      )}
    >
      <Clock className="h-4 w-4" />
      <span>Changes not saved</span>
    </div>
  );
}
