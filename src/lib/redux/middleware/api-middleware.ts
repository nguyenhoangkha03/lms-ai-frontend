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
    const { error, meta } = action as {
      error: RTKQueryError;
      meta: RTKQueryMeta;
    };

    const silentEndpoints = ['/auth/check-auth', '/auth/refresh'];
    const endpoint = meta?.arg?.endpointName;

    if (silentEndpoints.some(path => endpoint?.includes(path))) {
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
