import { createListenerMiddleware } from '@reduxjs/toolkit';
import { toast } from 'sonner';

export const errorMiddleware = createListenerMiddleware();

errorMiddleware.startListening({
  predicate: action => {
    return action.type.endsWith('/rejected') || action.type.includes('error');
  },
  effect: async (action, _listenerApi) => {
    const { type, payload, error } = action as any;

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

    if (!errorMessage.includes('Network Error')) {
      toast.error(errorMessage);
    }

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: errorMessage,
        fatal: false,
      });
    }
  },
});
