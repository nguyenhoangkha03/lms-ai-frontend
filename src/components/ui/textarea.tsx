import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-colors duration-200',
  {
    variants: {
      variant: {
        default: '',
        filled: 'bg-muted border-0 focus-visible:bg-background',
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      },
      state: {
        default: '',
        error: 'border-destructive focus-visible:ring-destructive',
        success: 'border-success focus-visible:ring-success',
        warning: 'border-warning focus-visible:ring-warning',
      },
    },
    defaultVariants: {
      variant: 'default',
      resize: 'vertical',
      state: 'default',
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: string;
  success?: string;
  helper?: string;
  label?: string;
  maxLength?: number;
  showCount?: boolean;
  autoResize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      resize,
      state,
      error,
      success,
      helper,
      label,
      maxLength,
      showCount = false,
      autoResize = false,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const currentState = error ? 'error' : success ? 'success' : state;
    const currentLength = value?.toString().length || 0;

    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [value, autoResize]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (maxLength && e.target.value.length > maxLength) {
        return;
      }
      onChange?.(e);
    };

    const textareaElement = (
      <div className="relative">
        <textarea
          className={cn(
            textareaVariants({
              variant,
              resize: autoResize ? 'none' : resize,
              state: currentState,
            }),
            className
          )}
          ref={ref || textareaRef}
          value={value}
          onChange={handleChange}
          {...props}
        />
        {(showCount || maxLength) && (
          <div className="absolute bottom-2 right-2 rounded bg-background/80 px-1 text-xs text-muted-foreground">
            {maxLength ? `${currentLength}/${maxLength}` : currentLength}
          </div>
        )}
      </div>
    );

    if (label || error || success || helper) {
      return (
        <div className="space-y-2">
          {label && (
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {label}
            </label>
          )}
          {textareaElement}
          {(error || success || helper) && (
            <div className="flex items-center gap-2 text-xs">
              {error && (
                <>
                  <AlertCircle className="h-3 w-3 text-destructive" />
                  <span className="text-destructive">{error}</span>
                </>
              )}
              {success && !error && (
                <>
                  <div className="h-3 w-3 rounded-full bg-success" />
                  <span className="text-success">{success}</span>
                </>
              )}
              {helper && !error && !success && (
                <span className="text-muted-foreground">{helper}</span>
              )}
            </div>
          )}
        </div>
      );
    }

    return textareaElement;
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
