'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  overlay?: boolean;
}

export function Loading({
  size = 'md',
  text,
  className,
  overlay = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-2',
        className
      )}
    >
      <Loader2 className={cn('text-primary animate-spin', sizeClasses[size])} />
      {text && <p className="text-muted-foreground text-sm">{text}</p>}
    </div>
  );

  if (overlay) {
    return (
      <div className="bg-background/80 absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}
