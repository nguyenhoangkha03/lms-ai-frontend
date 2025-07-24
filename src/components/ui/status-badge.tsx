import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status:
    | 'active'
    | 'inactive'
    | 'pending'
    | 'suspended'
    | 'completed'
    | 'failed'
    | 'draft'
    | 'published';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    active: 'bg-green-100 text-green-800 hover:bg-green-100',
    inactive: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    suspended: 'bg-red-100 text-red-800 hover:bg-red-100',
    completed: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    failed: 'bg-red-100 text-red-800 hover:bg-red-100',
    draft: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    published: 'bg-green-100 text-green-800 hover:bg-green-100',
  };

  const labels = {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    suspended: 'Suspended',
    completed: 'Completed',
    failed: 'Failed',
    draft: 'Draft',
    published: 'Published',
  };

  return (
    <Badge variant="secondary" className={cn(variants[status], className)}>
      {labels[status]}
    </Badge>
  );
}
