import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        gradient:
          'bg-gradient-to-r from-primary to-ai-primary text-primary-foreground hover:from-primary/90 hover:to-ai-primary/90 shadow-md hover:shadow-lg',
        ai: 'bg-ai-primary text-white hover:bg-ai-primary/90 shadow-md hover:shadow-lg',
        success:
          'bg-success text-success-foreground hover:bg-success/90 shadow-sm hover:shadow-md',
        warning:
          'bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm hover:shadow-md',
        info: 'bg-info text-info-foreground hover:bg-info/90 shadow-sm hover:shadow-md',
      },
      size: {
        xs: 'h-7 rounded px-2 text-xs',
        sm: 'h-9 rounded-md px-3',
        default: 'h-10 px-4 py-2',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-12 rounded-md px-10 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-9 w-9',
        'icon-lg': 'h-11 w-11',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
      loading: {
        true: 'pointer-events-none',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
      loading: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    const isDisabled = disabled || loading;

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, fullWidth, loading, className })
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && leftIcon && leftIcon}
        {loading ? loadingText || children : children}
        {!loading && rightIcon && rightIcon}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };

// Button Group Component
interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  size?: VariantProps<typeof buttonVariants>['size'];
  variant?: VariantProps<typeof buttonVariants>['variant'];
  fullWidth?: boolean;
}

// Extend the ButtonProps to include the size prop
type ButtonGroupButtonProps = ButtonProps & {
  size?: VariantProps<typeof buttonVariants>['size'];
};

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    {
      className,
      children,
      orientation = 'horizontal',
      size,
      variant,
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const childrenArray = React.Children.toArray(children);

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex',
          orientation === 'horizontal' ? 'flex-row' : 'flex-col',
          fullWidth && 'w-full',
          className
        )}
        role="group"
        {...props}
      >
        {childrenArray.map((child, index) => {
          if (React.isValidElement<React.HTMLAttributes<HTMLElement>>(child)) {
            const isFirst = index === 0;
            const isLast = index === React.Children.count(children) - 1;
            const childProps = child.props as ButtonGroupButtonProps;

            return React.cloneElement<ButtonGroupButtonProps>(child, {
              key: index,
              className: cn(
                childProps.className,
                orientation === 'horizontal' &&
                  !isFirst &&
                  !isLast &&
                  'rounded-none',
                orientation === 'horizontal' && isFirst && 'rounded-r-none',
                orientation === 'horizontal' && isLast && 'rounded-l-none',
                orientation === 'vertical' &&
                  !isFirst &&
                  !isLast &&
                  'rounded-none',
                orientation === 'vertical' && isFirst && 'rounded-b-none',
                orientation === 'vertical' && isLast && 'rounded-t-none',
                fullWidth && 'flex-1'
              ),
              size: size || childProps.size,
              variant: variant || childProps.variant,
            });
          }
          return child;
        })}
      </div>
    );
  }
);

ButtonGroup.displayName = 'ButtonGroup';

// Icon Button Component
interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'icon', variant = 'ghost', ...props }, ref) => {
    return (
      <Button ref={ref} size={size} variant={variant} {...props}>
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

// Floating Action Button
interface FABProps extends ButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const FloatingActionButton = React.forwardRef<
  HTMLButtonElement,
  FABProps
>(
  (
    {
      className,
      position = 'bottom-right',
      size = 'lg',
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const positionClasses = {
      'bottom-right': 'fixed bottom-6 right-6',
      'bottom-left': 'fixed bottom-6 left-6',
      'top-right': 'fixed top-6 right-6',
      'top-left': 'fixed top-6 left-6',
    };

    return (
      <Button
        ref={ref}
        className={cn(
          positionClasses[position],
          'z-50 rounded-full shadow-lg hover:shadow-xl',
          className
        )}
        size={size}
        variant={variant}
        {...props}
      />
    );
  }
);

FloatingActionButton.displayName = 'FloatingActionButton';
