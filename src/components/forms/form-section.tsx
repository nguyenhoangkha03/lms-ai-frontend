'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'card' | 'plain';
  required?: boolean;
}

export function FormSection({
  title,
  description,
  children,
  className,
  variant = 'default',
  required = false,
}: FormSectionProps) {
  const content = <div className="space-y-4">{children}</div>;

  if (variant === 'card') {
    return (
      <Card className={className}>
        {(title || description) && (
          <CardHeader>
            {title && (
              <CardTitle className="flex items-center gap-2">
                {title}
                {required && <span className="text-destructive">*</span>}
              </CardTitle>
            )}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  if (variant === 'plain') {
    return <div className={cn('space-y-4', className)}>{content}</div>;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h3 className="flex items-center gap-2 text-lg font-medium">
              {title}
              {required && <span className="text-destructive">*</span>}
            </h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {content}
    </div>
  );
}
