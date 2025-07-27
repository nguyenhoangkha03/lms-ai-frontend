'use client';

import React from 'react';
import { useFormField } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormSwitchProps {
  children?: React.ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  description?: string;
}

export const FormSwitch = React.forwardRef<
  React.ElementRef<typeof Switch>,
  FormSwitchProps
>(({ className, children, description, ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="space-y-0.5">
        {children && (
          <Label
            htmlFor={formItemId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {children}
          </Label>
        )}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        ref={ref}
        id={formItemId}
        className={cn(className)}
        aria-describedby={
          !error
            ? `${formDescriptionId}`
            : `${formDescriptionId} ${formMessageId}`
        }
        aria-invalid={!!error}
        {...props}
      />
    </div>
  );
});

FormSwitch.displayName = 'FormSwitch';
