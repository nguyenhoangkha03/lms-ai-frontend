import { createListenerMiddleware } from '@reduxjs/toolkit';
import { toast } from 'sonner';

export const errorMiddleware = createListenerMiddleware();

errorMiddleware.startListening({
  predicate: action => {
    return action.type.endsWith('/rejected') || action.type.includes('error');
  },
  effect: async (action, _listenerApi) => {
    const { type, payload, error } = action as any;

    // Filter out ConditionError and other non-critical errors
    const isConditionError = error?.name === 'ConditionError' || 
                            error?.message?.includes('condition callback returning false') ||
                            payload?.message?.includes('condition callback returning false');
    
    if (isConditionError) {
      // Don't log or show ConditionErrors - they're internal RTK Query optimization
      return;
    }

    console.error('Redux Error:', {
      type,
      payload,
      error,
      timestamp: new Date().toISOString(),
    });

    if (type.includes('auth/')) {
      return;
    }

    if (type.includes('upload/')) {
      toast.error('File upload failed. Please try again.');
      return;
    }

    if (type.includes('payment/')) {
      toast.error(
        'Payment processing failed. Please try again or contact support.'
      );
      return;
    }

    const errorMessage =
      payload?.message || error?.message || 'An error occurred';

    if (!errorMessage.includes('Network Error') && errorMessage !== 'An error occurred') {
      try {
        toast.error(errorMessage, {
          duration: 4000,
          id: `error-${Date.now()}`, // Unique ID to prevent duplicate toasts
        });
      } catch (toastError) {
        console.warn('Toast error:', toastError);
      }
    }

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: errorMessage,
        fatal: false,
      });
    }
  },
});
