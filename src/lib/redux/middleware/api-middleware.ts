import {
  createListenerMiddleware,
  isRejectedWithValue,
  isFulfilled,
} from '@reduxjs/toolkit';
import { toast } from 'sonner';

export const apiMiddleware = createListenerMiddleware();

interface RTKQueryMeta {
  arg: {
    endpointName: string;
    originalArgs: any;
  };
  requestId: string;
  requestStatus: string;
}

interface RTKQueryError {
  status?: number | string;
  data?: {
    message?: string;
  };
}

apiMiddleware.startListening({
  matcher: isRejectedWithValue,
  effect: async (action, _listenerApi) => {
    const { error, meta, payload } = action as {
      error: RTKQueryError;
      meta: RTKQueryMeta;
      payload: any;
    };

    // Debug: Log api middleware actions  
    console.log('🔍 API middleware caught action:', { endpoint: meta?.arg?.endpointName, error, payload });

    // Check if this is a auth request by examining various indicators
    const endpoint = meta?.arg?.endpointName;
    const isAuthEndpoint = endpoint && (endpoint.includes('login') || endpoint.includes('register') || endpoint.includes('auth'));
    const isAuthPath = payload?.data?.path === '/api/v1/auth/login' || payload?.data?.path === '/api/v1/auth/register';
    const isAuthRequest = isAuthEndpoint || isAuthPath;

    // Silent endpoints - don't show toast notifications for these
    const silentEndpoints = [
      '/auth/check-auth', 
      '/auth/refresh', 
      '/auth/login',    // Don't show toast for login errors - form handles them
      '/auth/register', // Don't show toast for register errors - form handles them
      'login',          // Also catch login mutations by name
      'register'        // Also catch register mutations by name
    ];

    // Skip toast notifications for silent endpoints or auth requests
    if (silentEndpoints.some(path => endpoint?.includes(path)) || isAuthRequest) {
      console.log('⏭️ API middleware skipping:', { endpoint, isAuthRequest });
      return;
    }

    if (error?.status === 'FETCH_ERROR') {
      toast.error('Network error. Please check your connection.');
    } else if (error?.status === 429) {
      toast.error('Too many requests. Please slow down.');
    } else if (error?.status === 500) {
      toast.error('Server error. Please try again later.');
    } else if (error?.data?.message) {
      toast.error(error.data.message);
    }
  },
});

apiMiddleware.startListening({
  matcher: isFulfilled,
  effect: async (action, _listenerApi) => {
    const { meta } = action as { meta: RTKQueryMeta };
    const endpoint = meta?.arg?.endpointName;

    const successMessages: Record<string, string> = {
      enrollInCourse: 'Successfully enrolled in course!',
      submitAssessment: 'Assessment submitted successfully!',
      updateProfile: 'Profile updated successfully!',
      uploadAvatar: 'Avatar updated successfully!',
      sendMessage: 'Message sent!',
    };

    if (endpoint && successMessages[endpoint]) {
      toast.success(successMessages[endpoint]);
    }
  },
});
