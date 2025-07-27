'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { toast as sonnerToast, ExternalToast } from 'sonner';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface ToastOptions extends ExternalToast {
  type?: ToastType;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline';
  }>;
}

interface ToastContextType {
  toast: (message: string, options?: ToastOptions) => string | number;
  success: (
    message: string,
    options?: Omit<ToastOptions, 'type'>
  ) => string | number;
  error: (
    message: string,
    options?: Omit<ToastOptions, 'type'>
  ) => string | number;
  warning: (
    message: string,
    options?: Omit<ToastOptions, 'type'>
  ) => string | number;
  info: (
    message: string,
    options?: Omit<ToastOptions, 'type'>
  ) => string | number;
  loading: (
    message: string,
    options?: Omit<ToastOptions, 'type'>
  ) => string | number;
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: (data: T) => string;
      error: (error: any) => string;
    }
  ) => void;
  dismiss: (id?: string | number) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
  loading: Loader2,
};

const iconColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
  loading: 'text-gray-500',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = useCallback((message: string, options: ToastOptions = {}) => {
    const {
      type = 'info',
      persistent = false,
      actions,
      ...sonnerOptions
    } = options;
    const Icon = icons[type];
    const iconColor = iconColors[type];

    const toastContent = (
      <div className="flex w-full items-start gap-3">
        <Icon
          className={`mt-0.5 h-5 w-5 flex-shrink-0 ${iconColor} ${type === 'loading' ? 'animate-spin' : ''}`}
        />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">{message}</div>
          {options.description && (
            <div className="mt-1 text-sm text-muted-foreground">
              {typeof options.description === 'function'
                ? options.description()
                : options.description}
            </div>
          )}
          {actions && actions.length > 0 && (
            <div className="mt-3 flex gap-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        {!persistent && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-70 hover:opacity-100"
            onClick={() => sonnerToast.dismiss()}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );

    return sonnerToast(toastContent, {
      duration: persistent ? Infinity : type === 'error' ? 6000 : 4000,
      closeButton: false,
      ...sonnerOptions,
    });
  }, []);

  const success = useCallback(
    (message: string, options: Omit<ToastOptions, 'type'> = {}) => {
      return toast(message, { ...options, type: 'success' });
    },
    [toast]
  );

  const error = useCallback(
    (message: string, options: Omit<ToastOptions, 'type'> = {}) => {
      return toast(message, { ...options, type: 'error' });
    },
    [toast]
  );

  const warning = useCallback(
    (message: string, options: Omit<ToastOptions, 'type'> = {}) => {
      return toast(message, { ...options, type: 'warning' });
    },
    [toast]
  );

  const info = useCallback(
    (message: string, options: Omit<ToastOptions, 'type'> = {}) => {
      return toast(message, { ...options, type: 'info' });
    },
    [toast]
  );

  const loading = useCallback(
    (message: string, options: Omit<ToastOptions, 'type'> = {}) => {
      return toast(message, { ...options, type: 'loading', persistent: true });
    },
    [toast]
  );

  const promise = useCallback(
    <T,>(
      promise: Promise<T>,
      options: {
        loading: string;
        success: (data: T) => string;
        error: (error: any) => string;
      }
    ) => {
      sonnerToast.promise(promise, {
        loading: (
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
            <span className="text-sm font-medium">{options.loading}</span>
          </div>
        ),
        success: data => (
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium">{options.success(data)}</span>
          </div>
        ),
        error: error => (
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium">{options.error(error)}</span>
          </div>
        ),
      });
    },
    []
  );

  const dismiss = useCallback((id?: string | number) => {
    sonnerToast.dismiss(id);
  }, []);

  const dismissAll = useCallback(() => {
    sonnerToast.dismiss();
  }, []);

  const contextValue: ToastContextType = {
    toast,
    success,
    error,
    warning,
    info,
    loading,
    promise,
    dismiss,
    dismissAll,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
