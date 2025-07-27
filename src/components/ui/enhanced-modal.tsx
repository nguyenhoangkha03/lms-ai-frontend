import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/enhanced-button';

const ModalRoot = DialogPrimitive.Root;
const ModalTrigger = DialogPrimitive.Trigger;
const ModalPortal = DialogPrimitive.Portal;
const ModalClose = DialogPrimitive.Close;

const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
ModalOverlay.displayName = DialogPrimitive.Overlay.displayName;

const modalContentVariants = cva(
  'fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
  {
    variants: {
      size: {
        sm: 'max-w-md',
        default: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-screen-lg h-[90vh]',
      },
      variant: {
        default: 'rounded-lg',
        destructive: 'rounded-lg border-destructive',
        success: 'rounded-lg border-success',
        warning: 'rounded-lg border-warning',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

interface ModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof modalContentVariants> {
  showCloseButton?: boolean;
}

const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(
  (
    { className, size, variant, showCloseButton = true, children, ...props },
    ref
  ) => (
    <ModalPortal>
      <ModalOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(modalContentVariants({ size, variant }), className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </ModalPortal>
  )
);
ModalContent.displayName = DialogPrimitive.Content.displayName;

const ModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
);
ModalHeader.displayName = 'ModalHeader';

const ModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
);
ModalFooter.displayName = 'ModalFooter';

const ModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
ModalTitle.displayName = DialogPrimitive.Title.displayName;

const ModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
ModalDescription.displayName = DialogPrimitive.Description.displayName;

const ModalBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex-1 overflow-y-auto', className)} {...props} />
);
ModalBody.displayName = 'ModalBody';

interface ModalComponent
  extends React.FC<React.ComponentProps<typeof ModalRoot>> {
  Content: typeof ModalContent;
  Header: typeof ModalHeader;
  Title: typeof ModalTitle;
  Description: typeof ModalDescription;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
  Trigger: typeof ModalTrigger;
  Close: typeof ModalClose;
  Portal: typeof ModalPortal;
  Overlay: typeof ModalOverlay;
}

const Modal = ModalRoot as ModalComponent;

Modal.Content = ModalContent;
Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Description = ModalDescription;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
Modal.Trigger = ModalTrigger;
Modal.Close = ModalClose;
Modal.Portal = ModalPortal;
Modal.Overlay = ModalOverlay;

interface ConfirmationModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  children?: React.ReactNode;
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
  children,
  loading = false,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  const iconMap = {
    default: <Info className="h-6 w-6 text-primary" />,
    destructive: <AlertTriangle className="h-6 w-6 text-destructive" />,
    success: <CheckCircle className="h-6 w-6 text-success" />,
    warning: <AlertCircle className="h-6 w-6 text-warning" />,
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <Modal.Content variant={variant} size="sm">
        <Modal.Header>
          <div className="flex items-center gap-3">
            {iconMap[variant]}
            <Modal.Title>{title}</Modal.Title>
          </div>
          {description && <Modal.Description>{description}</Modal.Description>}
        </Modal.Header>

        {children && <Modal.Body>{children}</Modal.Body>}

        <Modal.Footer>
          <Button
            variant="outline"
            onClick={() => {
              onCancel?.();
              onOpenChange?.(false);
            }}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            loading={isLoading || loading}
          >
            {confirmText}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};

interface FormModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  size?: VariantProps<typeof modalContentVariants>['size'];
  children: React.ReactNode;
  submitText?: string;
  cancelText?: string;
  onSubmit?: () => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  submitDisabled?: boolean;
}

export const FormModal: React.FC<FormModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  size = 'default',
  children,
  submitText = 'Save',
  cancelText = 'Cancel',
  onSubmit,
  onCancel,
  loading = false,
  submitDisabled = false,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async () => {
    if (!onSubmit) return;

    try {
      setIsLoading(true);
      await onSubmit();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <Modal.Content size={size}>
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
          {description && <Modal.Description>{description}</Modal.Description>}
        </Modal.Header>

        <Modal.Body>{children}</Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline"
            onClick={() => {
              onCancel?.();
              onOpenChange?.(false);
            }}
            disabled={isLoading || loading}
          >
            {cancelText}
          </Button>
          {onSubmit && (
            <Button
              onClick={handleSubmit}
              loading={isLoading || loading}
              disabled={submitDisabled}
            >
              {submitText}
            </Button>
          )}
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};

export function useModal() {
  const [open, setOpen] = React.useState(false);

  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);
  const toggleModal = () => setOpen(!open);

  return {
    open,
    openModal,
    closeModal,
    toggleModal,
    setOpen,
  };
}

export {
  Modal,
  ModalPortal,
  ModalOverlay,
  ModalTrigger,
  ModalClose,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ModalBody,
};
