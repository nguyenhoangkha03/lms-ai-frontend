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

    // Debug: Log what action types we're getting
    console.log('🔍 Error middleware caught action:', { type, payload, error });

    // Check if this is a auth-related request by examining the URL path
    const isAuthRequest = payload?.data && 
                         (payload.data.path === '/api/v1/auth/login' || 
                          payload.data.path === '/api/v1/auth/register' ||
                          payload.data.path?.includes('/auth/login') ||
                          payload.data.path?.includes('/auth/register'));

    // Skip auth-related errors - let forms handle them
    if (type.includes('auth/') || 
        type.includes('authApi/') || 
        type.includes('/login/') ||
        type.includes('/register/') ||
        type.includes('login/rejected') ||
        type.includes('register/rejected') ||
        isAuthRequest) {
      console.log('⏭️ Skipping auth-related error:', type, 'isAuthRequest:', isAuthRequest);
      return;
    }

    console.error('Redux Error:', {
      type,
      payload,
      error,
      timestamp: new Date().toISOString(),
    });

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

    // Prioritize backend error message over generic RTK Query error
    const errorMessage =
      payload?.data?.message || payload?.message || error?.message || 'An error occurred';

    // Additional check to prevent auth-related errors from showing toast
    const isAuthError = errorMessage.toLowerCase().includes('invalid credentials') ||
                       errorMessage.toLowerCase().includes('unauthorized') ||
                       errorMessage.toLowerCase().includes('authentication failed') ||
                       errorMessage.toLowerCase().includes('user with this email already exists') ||
                       errorMessage.toLowerCase().includes('email already exists') ||
                       errorMessage.toLowerCase().includes('user already exists');

    if (isAuthError) {
      console.log('⏭️ Skipping auth-related error toast:', errorMessage);
      return;
    }

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
