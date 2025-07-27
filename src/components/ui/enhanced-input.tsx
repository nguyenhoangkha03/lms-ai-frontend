import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Eye, EyeOff, Search, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200',
  {
    variants: {
      variant: {
        default: '',
        filled: 'bg-muted border-0 focus-visible:bg-background',
        underlined:
          'border-0 border-b border-input rounded-none bg-transparent focus-visible:border-primary',
      },
      inputSize: {
        sm: 'h-9 px-2 text-xs',
        default: 'h-10 px-3',
        lg: 'h-11 px-4 text-base',
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
      inputSize: 'default',
      state: 'default',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  success?: string;
  helper?: string;
  label?: string;
  clearable?: boolean;
  onClear?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      variant,
      inputSize,
      state,
      leftIcon,
      rightIcon,
      error,
      success,
      helper,
      label,
      clearable = false,
      onClear,
      value,
      ...props
    },
    ref
  ) => {
    const currentState = error ? 'error' : success ? 'success' : state;
    const hasValue = value && value.toString().length > 0;

    const inputElement = (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}

        <input
          type={type}
          className={cn(
            inputVariants({ variant, inputSize, state: currentState }),
            leftIcon && 'pl-10',
            (rightIcon || clearable) && 'pr-10',
            className
          )}
          ref={ref}
          value={value}
          {...props}
        />

        {(rightIcon || (clearable && hasValue)) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {clearable && hasValue ? (
              <button
                type="button"
                onClick={onClear}
                className="transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              rightIcon
            )}
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
          {inputElement}
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

    return inputElement;
  }
);

Input.displayName = 'Input';

// Password Input Component
interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  showPasswordToggle?: boolean;
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ showPasswordToggle = true, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <Input
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      rightIcon={
        showPasswordToggle ? (
          <button
            type="button"
            onClick={togglePassword}
            className="transition-colors hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        ) : undefined
      }
      {...props}
    />
  );
});

PasswordInput.displayName = 'PasswordInput';

// Search Input Component
interface SearchInputProps extends Omit<InputProps, 'type' | 'leftIcon'> {
  onSearch?: (value: string) => void;
  searchIcon?: boolean;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, searchIcon = true, onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch(e.currentTarget.value);
      }
      onKeyDown?.(e);
    };

    return (
      <Input
        ref={ref}
        type="search"
        leftIcon={searchIcon ? <Search className="h-4 w-4" /> : undefined}
        onKeyDown={handleKeyDown}
        clearable
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

// Textarea Component
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

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
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

    // Auto-resize functionality
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
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
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

// Input Group Component
interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  label?: string;
  error?: string;
  helper?: string;
}

export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, children, label, error, helper, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {label && (
          <label className="text-sm font-medium leading-none">{label}</label>
        )}
        <div className="flex gap-2">{children}</div>
        {(error || helper) && (
          <div className="flex items-center gap-2 text-xs">
            {error && (
              <>
                <AlertCircle className="h-3 w-3 text-destructive" />
                <span className="text-destructive">{error}</span>
              </>
            )}
            {helper && !error && (
              <span className="text-muted-foreground">{helper}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

InputGroup.displayName = 'InputGroup';

export { Input, inputVariants };
