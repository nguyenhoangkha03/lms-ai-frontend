'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface FormLoadingProps {
  fields?: number;
  showSubmitButton?: boolean;
  className?: string;
}

export function FormLoading({
  fields = 3,
  showSubmitButton = true,
  className,
}: FormLoadingProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      {showSubmitButton && <Skeleton className="h-10 w-full" />}
    </div>
  );
}
