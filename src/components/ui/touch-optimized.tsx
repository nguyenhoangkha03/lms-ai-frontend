'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ChevronDown, X } from 'lucide-react';

interface TouchButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'touch';
  enableHaptic?: boolean;
  ripple?: boolean;
  children: React.ReactNode;
}

export function TouchButton({
  variant = 'default',
  size = 'touch',
  enableHaptic = true,
  ripple = true,
  className,
  onClick,
  children,
  ...props
}: TouchButtonProps) {
  const { vibrate, shouldOptimizeForTouch } = useMobile();
  const [ripples, setRipples] = useState<
    Array<{ x: number; y: number; id: number }>
  >([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      // Haptic feedback
      if (enableHaptic && shouldOptimizeForTouch) {
        vibrate(10); // Short haptic feedback
      }

      // Ripple effect
      if (ripple && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const newRipple = { x, y, id: Date.now() };
        setRipples(prev => [...prev, newRipple]);

        // Remove ripple after animation
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 600);
      }

      onClick?.(event);
    },
    [onClick, enableHaptic, ripple, shouldOptimizeForTouch, vibrate]
  );

  const touchSizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
    touch: 'h-12 min-w-12 px-6 py-3', // Minimum 44px touch target
  };

  return (
    <Button
      ref={buttonRef}
      variant={variant}
      className={cn(
        'relative overflow-hidden',
        'touch-manipulation', // Improve touch response
        'select-none', // Prevent text selection on touch
        shouldOptimizeForTouch && touchSizeClasses.touch,
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}

      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="pointer-events-none absolute animate-ping rounded-full bg-white/30"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
    </Button>
  );
}

// Touch-optimized input with better mobile UX
interface TouchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

export function TouchInput({
  label,
  error,
  icon,
  clearable = false,
  onClear,
  className,
  ...props
}: TouchInputProps) {
  const { shouldOptimizeForTouch } = useMobile();

  const inputClasses = cn(
    'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'touch-manipulation', // Better touch response
    shouldOptimizeForTouch && 'h-12 text-base', // Larger for touch
    icon && 'pl-10',
    clearable && props.value && 'pr-10',
    error && 'border-destructive',
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}

        <input className={inputClasses} {...props} />

        {clearable && props.value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

// Touch-optimized select dropdown
interface TouchSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface TouchSelectProps {
  options: TouchSelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function TouchSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  className,
}: TouchSelectProps) {
  const { shouldOptimizeForTouch } = useMobile();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  const selectClasses = cn(
    'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
    'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'touch-manipulation cursor-pointer',
    shouldOptimizeForTouch && 'h-12 text-base',
    error && 'border-destructive',
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none">{label}</label>
      )}

      <div className="relative">
        <button
          type="button"
          className={selectClasses}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <span className={cn(!selectedOption && 'text-muted-foreground')}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-transparent"
              onClick={() => setIsOpen(false)}
            />

            {/* Options */}
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
              {options.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground',
                    'touch-manipulation',
                    shouldOptimizeForTouch && 'py-3',
                    option.disabled && 'cursor-not-allowed opacity-50',
                    option.value === value && 'bg-accent text-accent-foreground'
                  )}
                  onClick={() => {
                    if (!option.disabled) {
                      onValueChange(option.value);
                      setIsOpen(false);
                    }
                  }}
                  disabled={option.disabled}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

// Touch-optimized tabs
interface TouchTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    badge?: string | number;
    disabled?: boolean;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

export function TouchTabs({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  className,
}: TouchTabsProps) {
  const { shouldOptimizeForTouch, vibrate } = useMobile();

  const handleTabClick = (tabId: string, disabled?: boolean) => {
    if (disabled) return;

    if (shouldOptimizeForTouch) {
      vibrate(5); // Light haptic feedback
    }
    onTabChange(tabId);
  };

  const getTabClasses = (tab: any) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'touch-manipulation select-none',
      shouldOptimizeForTouch && 'px-4 py-3 text-base min-h-12',
      tab.disabled && 'cursor-not-allowed opacity-50'
    );

    if (variant === 'pills') {
      return cn(
        baseClasses,
        'rounded-full border',
        tab.id === activeTab
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
      );
    }

    if (variant === 'underline') {
      return cn(
        baseClasses,
        'rounded-none border-b-2 border-transparent bg-transparent',
        tab.id === activeTab
          ? 'border-primary text-foreground'
          : 'text-muted-foreground hover:text-foreground'
      );
    }

    // Default variant
    return cn(
      baseClasses,
      tab.id === activeTab
        ? 'bg-background text-foreground shadow-sm'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    );
  };

  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        className
      )}
    >
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          className={getTabClasses(tab)}
          onClick={() => handleTabClick(tab.id, tab.disabled)}
          disabled={tab.disabled}
        >
          {tab.icon}
          <span>{tab.label}</span>
          {tab.badge && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {tab.badge}
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
}
