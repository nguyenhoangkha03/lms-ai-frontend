'use client';

import React from 'react';
import { useFormField } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface FormSelectProps {
  placeholder?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  onValueChange?: (value: string) => void;
  value?: string;
  disabled?: boolean;
  className?: string;
}

export const FormSelect = React.forwardRef<HTMLButtonElement, FormSelectProps>(
  ({ className, placeholder, options, ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } =
      useFormField();

    return (
      <Select {...props}>
        <SelectTrigger
          ref={ref}
          id={formItemId}
          className={cn(
            error && 'border-destructive focus:ring-destructive',
            className
          )}
          aria-describedby={
            !error
              ? `${formDescriptionId}`
              : `${formDescriptionId} ${formMessageId}`
          }
          aria-invalid={!!error}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
);

FormSelect.displayName = 'FormSelect';
